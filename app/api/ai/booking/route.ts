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

    // If Claude wants to search, do it now
    if (parsed.searchQuery) {
      vehicles = await searchVehicles(parsed.searchQuery)

      // If we got vehicles, call Claude again with vehicle context
      if (vehicles.length > 0) {
        const enrichedPrompt = buildSystemPrompt({
          session,
          isLoggedIn: !!body.userId,
          isVerified: false,
          vehicles,
          weather,
        })

        const enrichedResponse = await client.messages.create({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1024,
          system: enrichedPrompt,
          messages: [
            ...claudeMessages,
            {
              role: 'assistant',
              content: `I found ${vehicles.length} cars matching your criteria. Let me present them.`,
            },
            {
              role: 'user',
              content: 'Show me the available cars.',
            },
          ],
        })

        const enrichedText = enrichedResponse.content
          .filter((block) => block.type === 'text')
          .map((block) => (block as { type: 'text'; text: string }).text)
          .join('')

        const enrichedParsed = parseClaudeResponse(enrichedText)
        // Use enriched reply but keep original extracted data
        parsed.reply = enrichedParsed.reply
        if (enrichedParsed.nextState) {
          parsed.nextState = enrichedParsed.nextState
        }
      } else {
        // No results — Claude should tell the user
        parsed.reply += "\n\nI couldn't find any cars matching those criteria. Want to try different dates or a different area?"
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
  const serviceFee = Math.round(subtotal * 0.15 * 100) / 100
  const taxable = subtotal + serviceFee
  const estimatedTax = Math.round(taxable * 0.086 * 100) / 100 // ~8.6% avg AZ tax
  const estimatedTotal = Math.round((taxable + estimatedTax) * 100) / 100

  // Deposit based on daily rate
  let depositAmount = 250
  if (vehicle.dailyRate >= 500) depositAmount = 1000
  else if (vehicle.dailyRate >= 150) depositAmount = 700

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
    depositAmount,
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
