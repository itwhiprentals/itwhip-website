// app/api/ai/booking/route.ts
// AI Booking endpoint — orchestrates Claude + search + risk assessment

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import {
  BookingState,
  BookingSession,
  AIBookingRequest,
  AIBookingResponse,
  VehicleSummary,
  BookingSummary,
} from '@/app/lib/ai-booking/types'
import {
  createInitialSession,
  applyExtractedData,
  addMessage,
  calculateDays,
} from '@/app/lib/ai-booking/state-machine'
import { buildSystemPrompt } from '@/app/lib/ai-booking/system-prompt'
import { parseClaudeResponse } from '@/app/lib/ai-booking/parse-response'
import { searchVehicles } from '@/app/lib/ai-booking/search-bridge'
import { assessBookingRisk } from '@/app/lib/ai-booking/risk-bridge'
import {
  isWeatherRelevant,
  isDirectWeatherQuestion,
  extractCityFromWeatherQuestion,
  fetchWeatherContext,
  buildWeatherReply,
} from '@/app/lib/ai-booking/weather-bridge'
import {
  checkAISecurity,
  createSecurityBlockedResponse,
} from '@/app/lib/ai-booking/security'

// =============================================================================
// ANTHROPIC CLIENT
// =============================================================================

const getClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')
  return new Anthropic({ apiKey })
}

// =============================================================================
// POST /api/ai/booking
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AIBookingRequest

    // Validate request
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // ==========================================================================
    // SECURITY CHECK - Rate limiting, bot detection, input validation
    // ==========================================================================
    const sessionMessageCount = body.session?.messages?.length || 0
    const securityCheck = await checkAISecurity(request, body.message, sessionMessageCount)

    if (!securityCheck.allowed) {
      return createSecurityBlockedResponse(securityCheck)
    }

    // Initialize or restore session
    let session: BookingSession = body.session || createInitialSession()

    // Add user message to history
    session = addMessage(session, 'user', body.message)

    // Use previously returned vehicles if available (for selection step)
    let vehicles: VehicleSummary[] | null = body.previousVehicles || null
    let weather = undefined

    // Direct weather question — answer without calling Claude (cost optimization)
    if (isDirectWeatherQuestion(body.message)) {
      const city = extractCityFromWeatherQuestion(body.message) || session.location || 'phoenix';
      const weatherData = await fetchWeatherContext(city);
      if (weatherData) {
        const reply = buildWeatherReply(weatherData);
        session = addMessage(session, 'assistant', reply);
        return NextResponse.json({
          reply,
          session,
          vehicles: body.previousVehicles || null,
          summary: null,
          action: null,
          suggestions: getSuggestions(session.state),
        } satisfies AIBookingResponse);
      }
    }

    // Check weather relevance for vehicle recommendations (before calling Claude)
    if (
      isWeatherRelevant(body.message) &&
      session.location
    ) {
      weather = await fetchWeatherContext(session.location) || undefined
    }

    // Build system prompt — include previous vehicles so Claude can reference them
    const systemPrompt = buildSystemPrompt({
      session,
      isLoggedIn: !!body.userId,
      isVerified: false, // TODO: check actual verification status
      vehicles: vehicles || undefined,
      weather,
    })

    // Build conversation history for Claude
    const claudeMessages = session.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    // Call Claude Haiku
    const client = getClient()
    const claudeResponse = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: claudeMessages,
    })

    // Extract text from Claude's response
    const rawText = claudeResponse.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { type: 'text'; text: string }).text)
      .join('')

    // Parse structured response
    const parsed = parseClaudeResponse(rawText)

    // Force a search if user asks for no-deposit cars but Claude didn't create a searchQuery
    const userWantsNoDeposit = wantsNoDeposit(body.message)
    console.log('[CHOÉ DEBUG] User message:', body.message)
    console.log('[CHOÉ DEBUG] Wants no deposit:', userWantsNoDeposit)
    console.log('[CHOÉ DEBUG] Session location:', session.location)
    console.log('[CHOÉ DEBUG] Claude searchQuery:', JSON.stringify(parsed.searchQuery))

    if (!parsed.searchQuery && userWantsNoDeposit && session.location) {
      console.log('[CHOÉ DEBUG] Forcing new searchQuery with noDeposit')
      parsed.searchQuery = {
        location: session.location,
        noDeposit: true,
      }
    }

    // If Claude wants to search, do it now
    if (parsed.searchQuery) {
      // Force noDeposit filter if user asked for it (Claude sometimes misses this)
      if (userWantsNoDeposit && !parsed.searchQuery.noDeposit) {
        console.log('[CHOÉ DEBUG] Injecting noDeposit into existing searchQuery')
        parsed.searchQuery.noDeposit = true
      }
      console.log('[CHOÉ DEBUG] Final searchQuery:', JSON.stringify(parsed.searchQuery))
      vehicles = await searchVehicles(parsed.searchQuery)
      console.log('[CHOÉ DEBUG] Search returned', vehicles?.length, 'vehicles')

      // Fallback: if filtered search returned 0 results, retry without filters
      if (vehicles.length === 0 && hasFilters(parsed.searchQuery)) {
        const fallbackQuery = { location: parsed.searchQuery.location, pickupDate: parsed.searchQuery.pickupDate, returnDate: parsed.searchQuery.returnDate, pickupTime: parsed.searchQuery.pickupTime, returnTime: parsed.searchQuery.returnTime }
        vehicles = await searchVehicles(fallbackQuery)
      }

      // Sort by price if user asked for cheapest/budget
      if (vehicles.length > 0 && wantsLowestPrice(body.message)) {
        vehicles = [...vehicles].sort((a, b) => a.dailyRate - b.dailyRate)
      }

      // Call Claude again with vehicle context (or with 0-result context)
      const enrichedPrompt = buildSystemPrompt({
        session,
        isLoggedIn: !!body.userId,
        isVerified: false,
        vehicles: vehicles.length > 0 ? vehicles : undefined,
        weather,
      })

      const noResultsNote = vehicles.length === 0
        ? ` No exact matches were found for the filters (make/type/price/seats). Show the user what IS available nearby, or suggest broadening their search.`
        : ''

      const enrichedResponse = await client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
        system: enrichedPrompt,
        messages: [
          ...claudeMessages,
          {
            role: 'assistant',
            content: vehicles.length > 0
              ? `I found ${vehicles.length} cars matching your criteria. Let me present them.`
              : `I searched but couldn't find exact matches for those filters.${noResultsNote}`,
          },
          {
            role: 'user',
            content: vehicles.length > 0
              ? 'Show me the available cars.'
              : 'What do you have instead?',
          },
        ],
      })

      const enrichedText = enrichedResponse.content
        .filter((block) => block.type === 'text')
        .map((block) => (block as { type: 'text'; text: string }).text)
        .join('')

      const enrichedParsed = parseClaudeResponse(enrichedText)
      parsed.reply = enrichedParsed.reply
      if (enrichedParsed.nextState) {
        parsed.nextState = enrichedParsed.nextState
      }
    }

    // Apply extracted data to session
    session = applyExtractedData(session, parsed)

    // Add AI reply to history
    session = addMessage(session, 'assistant', parsed.reply)

    // Build booking summary if confirming
    let summary: BookingSummary | null = null
    if (
      session.state === BookingState.CONFIRMING &&
      session.vehicleId &&
      vehicles
    ) {
      const selectedVehicle = vehicles.find((v) => v.id === session.vehicleId)
      if (selectedVehicle && session.startDate && session.endDate) {
        summary = buildBookingSummary(session, selectedVehicle)
      }
    }

    // Risk assessment at confirmation
    let action = parsed.action
    if (
      session.state === BookingState.CONFIRMING &&
      summary &&
      !action
    ) {
      if (!body.userId) {
        action = 'NEEDS_LOGIN'
      } else {
        const risk = await assessBookingRisk({
          session,
          vehicle: summary.vehicle,
          userId: body.userId,
          isVerified: false,
          numberOfDays: summary.numberOfDays,
          totalAmount: summary.estimatedTotal,
        })
        if (risk.action) {
          action = risk.action
        }
      }
    }

    // Build suggestion chips based on current state
    const suggestions = getSuggestions(session.state)

    // Build response
    const response: AIBookingResponse = {
      reply: parsed.reply,
      session,
      vehicles,
      summary,
      action,
      suggestions,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[ai-booking] Error:', error instanceof Error ? error.message : error, error instanceof Error ? error.stack : '')

    // Specific error for missing API key
    if (error instanceof Error && error.message.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Something went wrong. Try again?' },
      { status: 500 }
    )
  }
}

// =============================================================================
// BOOKING SUMMARY BUILDER
// =============================================================================

function buildBookingSummary(
  session: BookingSession,
  vehicle: VehicleSummary
): BookingSummary {
  const numberOfDays = calculateDays(session.startDate!, session.endDate!)
  const subtotal = vehicle.dailyRate * numberOfDays
  const serviceFee = Math.round(subtotal * 0.15 * 100) / 100  // 15% guest service fee
  const taxable = subtotal + serviceFee
  const estimatedTax = Math.round(taxable * 0.084 * 100) / 100 // 8.4% AZ tax
  const estimatedTotal = Math.round((taxable + estimatedTax) * 100) / 100

  return {
    vehicle,
    location: session.location!,
    startDate: session.startDate!,
    endDate: session.endDate!,
    startTime: session.startTime || '10:00',
    endTime: session.endTime || '10:00',
    numberOfDays,
    dailyRate: vehicle.dailyRate,
    subtotal,
    serviceFee,
    estimatedTax,
    estimatedTotal,
    depositAmount: vehicle.depositAmount,  // Use actual deposit from vehicle data
  }
}

// =============================================================================
// SUGGESTION CHIPS
// =============================================================================

function getSuggestions(state: BookingState): string[] {
  switch (state) {
    case BookingState.INIT:
    case BookingState.COLLECTING_LOCATION:
      return [
        'I need a car in Phoenix this weekend',
        'SUV in Scottsdale',
        'Cheapest car available tomorrow',
        'Tesla near the airport',
      ]
    case BookingState.COLLECTING_DATES:
      return [
        'This weekend',
        'Tomorrow for 3 days',
        'Next Friday to Sunday',
      ]
    case BookingState.COLLECTING_VEHICLE:
      return [
        'Show me SUVs',
        'Something under $100/day',
        'The cheapest option',
      ]
    case BookingState.CONFIRMING:
      return [
        'Looks good, book it',
        'Change the dates',
        'Show me other cars',
      ]
    default:
      return []
  }
}

// =============================================================================
// SEARCH FILTER CHECK
// =============================================================================

function hasFilters(query: import('@/app/lib/ai-booking/types').SearchQuery): boolean {
  return !!(query.make || query.carType || query.priceMin || query.priceMax || query.seats || query.transmission || query.noDeposit)
}

function wantsLowestPrice(message: string): boolean {
  const lower = message.toLowerCase()
  return /\b(cheapest|cheapest|budget|lowest price|most affordable|under \$|least expensive)\b/.test(lower)
}

function wantsNoDeposit(message: string): boolean {
  const lower = message.toLowerCase()
  return /\b(no deposit|without deposit|zero deposit|\$0 deposit|no security deposit|deposit.?free)\b/.test(lower)
}
