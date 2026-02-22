// app/api/ai/booking/stream/route.ts
// Streaming AI Booking endpoint with Tool Use
// Uses Server-Sent Events (SSE) for real-time response streaming

import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import {
  BookingState,
  BookingSession,
  AIBookingRequest,
  VehicleSummary,
  BookingSummary,
} from '@/app/lib/ai-booking/types'
import {
  createInitialSession,
  addMessage,
  calculateDays,
} from '@/app/lib/ai-booking/state-machine'
import { buildSystemPrompt } from '@/app/lib/ai-booking/system-prompt'
import { parseClaudeResponse } from '@/app/lib/ai-booking/parse-response'
import { assessBookingRisk } from '@/app/lib/ai-booking/risk-bridge'
import { checkAISecurity } from '@/app/lib/ai-booking/security'
import prisma from '@/app/lib/database/prisma'
import {
  getChoeSettings,
  getModelConfig,
  getPricingConfig,
  getFeatureFlags,
} from '@/app/lib/ai-booking/choe-settings'
import { BOOKING_TOOLS, executeTools, getToolsForModel, supportsPTC } from '@/app/lib/ai-booking/tools'
import { saveMessage } from '@/app/lib/ai-booking/conversation-service'
import { countAndValidateTokens } from '@/app/lib/ai-booking/token-counting'
import { calculateCostSimple } from '@/app/lib/ai-booking/cost'
import {
  detectComplexQuery,
  getExtendedThinkingConfig,
  supportsExtendedThinking,
  enhancePromptForThinking,
} from '@/app/lib/ai-booking/extended-thinking'
import { isSessionVerified } from '@/app/lib/ai-booking/state-machine'

// =============================================================================
// BOOKING LOOKUP (for verified users asking about their bookings)
// =============================================================================

async function fetchBookingContextByEmail(email: string): Promise<string> {
  try {
    // Fetch bookings with verification details
    const bookings = await prisma.rentalBooking.findMany({
      where: { guestEmail: email, status: { not: 'CANCELLED' } },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        bookingCode: true,
        status: true,
        verificationStatus: true,
        tripStatus: true,
        startDate: true,
        endDate: true,
        startTime: true,
        endTime: true,
        handoffStatus: true,
        car: { select: { make: true, model: true, year: true, instantBook: true } },
      },
    })

    // Fetch guest's Stripe identity verification status
    const guestProfile = await prisma.reviewerProfile.findFirst({
      where: { email },
      select: {
        stripeIdentityStatus: true,
        stripeIdentityVerifiedAt: true,
        documentsVerified: true,
      },
    })

    if (bookings.length === 0) {
      return 'BOOKING LOOKUP: No active bookings found for this email.'
    }

    const lines = bookings.map((b) => {
      const car = b.car ? `${b.car.year} ${b.car.make} ${b.car.model}` : 'N/A'
      const start = b.startDate ? new Date(b.startDate).toLocaleDateString() : '?'
      const end = b.endDate ? new Date(b.endDate).toLocaleDateString() : '?'
      const isInstantBook = b.car?.instantBook ?? false
      const parts = [
        `${b.bookingCode}: ${car}`,
        `${start} – ${end}`,
        `Booking Status: ${b.status}`,
        `Verification: ${b.verificationStatus}`,
      ]
      if (b.tripStatus) parts.push(`Trip: ${b.tripStatus}`)
      if (b.handoffStatus) parts.push(`Handoff: ${b.handoffStatus}`)
      if (isInstantBook) parts.push('(Instant Book)')
      return `  - ${parts.join(' | ')}`
    })

    // Add Stripe identity context
    let identityContext = ''
    if (guestProfile) {
      const status = guestProfile.stripeIdentityStatus || 'not_started'
      identityContext = `\nSTRIPE IDENTITY VERIFICATION: ${status}`
      if (status === 'verified') {
        identityContext += ' (passed)'
      } else if (status === 'requires_input') {
        identityContext += ' (incomplete — guest needs to redo identity check)'
      } else if (status === 'processing') {
        identityContext += ' (submitted, still processing — usually takes 1-2 minutes)'
      } else if (status === 'not_started') {
        identityContext += ' (not yet started — guest needs to complete identity verification)'
      }
      identityContext += `\nDocuments verified: ${guestProfile.documentsVerified ? 'yes' : 'no'}`
    }

    return `BOOKING LOOKUP (verified email: ${email}):\n${lines.join('\n')}${identityContext}\nUse the ACTIVE BOOKING SUPPORT rules to handle questions about these bookings.`
  } catch (error) {
    console.error('[ai-booking-stream] Booking lookup failed:', error)
    return 'BOOKING LOOKUP: Unable to retrieve bookings at this time.'
  }
}

// =============================================================================
// MULTI-TURN CACHING HELPER
// =============================================================================

/**
 * Add cache_control to conversation messages for multi-turn caching
 * Strategy: Cache the second-to-last user message so the conversation prefix is cached
 * This saves ~90% on tokens for repeated conversation context
 * See: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
 */
function addCacheControlToMessages(
  messages: Anthropic.MessageParam[]
): Anthropic.MessageParam[] {
  // Need at least 4 messages for caching to be beneficial (2 user + 2 assistant turns)
  if (messages.length < 4) return messages

  // Find the second-to-last user message
  let userMessageCount = 0
  let targetIndex = -1

  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      userMessageCount++
      if (userMessageCount === 2) {
        targetIndex = i
        break
      }
    }
  }

  if (targetIndex === -1) return messages

  // Add cache_control to the target message
  // Content must be array of blocks for cache_control to work
  return messages.map((m, i) => {
    if (i === targetIndex) {
      const textContent = typeof m.content === 'string' ? m.content : ''
      return {
        role: m.role,
        content: [
          {
            type: 'text' as const,
            text: textContent,
            cache_control: { type: 'ephemeral' as const },
          },
        ],
      }
    }
    return m
  })
}

// =============================================================================
// ANTHROPIC CLIENT
// =============================================================================

const getClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')
  return new Anthropic({ apiKey })
}

// =============================================================================
// DATABASE HELPERS
// =============================================================================

async function upsertConversation(
  session: BookingSession,
  userId?: string | null,
  visitorId?: string | null,
  ipAddress: string = '127.0.0.1'
): Promise<string> {
  try {
    const existing = await prisma.choeAIConversation.findUnique({
      where: { sessionId: session.sessionId }
    })

    if (existing) {
      const actualMessageCount = await prisma.choeAIMessage.count({
        where: { conversationId: existing.id },
      })
      await prisma.choeAIConversation.update({
        where: { sessionId: session.sessionId },
        data: {
          state: session.state,
          location: session.location,
          vehicleType: session.vehicleType,
          lastActivityAt: new Date(),
          messageCount: actualMessageCount,
        }
      })
      return existing.id
    }

    const conversation = await prisma.choeAIConversation.create({
      data: {
        sessionId: session.sessionId,
        userId: userId || null,
        visitorId: visitorId || null,
        ipAddress,
        isAuthenticated: !!userId,
        state: session.state,
        messageCount: 0,
        location: session.location,
        estimatedCost: 0,
      }
    })

    return conversation.id
  } catch (error) {
    console.error('[ai-booking-stream] Failed to upsert conversation:', error)
    return `temp-${session.sessionId}`
  }
}

async function updateConversationStats(
  conversationId: string,
  session: BookingSession,
  totalTokens: number,
  estimatedCost: number
): Promise<void> {
  if (conversationId.startsWith('temp-')) return

  try {
    // Count actual saved messages instead of trusting in-memory count
    const actualMessageCount = await prisma.choeAIMessage.count({
      where: { conversationId },
    })

    let outcome: string | null = null
    if (session.state === BookingState.READY_FOR_PAYMENT) {
      outcome = 'COMPLETED'
    }

    await prisma.choeAIConversation.update({
      where: { id: conversationId },
      data: {
        state: session.state,
        messageCount: actualMessageCount,
        location: session.location,
        vehicleType: session.vehicleType,
        totalTokens: { increment: totalTokens },
        estimatedCost: { increment: estimatedCost },
        lastActivityAt: new Date(),
        ...(outcome && { outcome }),
      }
    })
  } catch (error) {
    console.error('[ai-booking-stream] Failed to update conversation stats:', error)
  }
}

// =============================================================================
// BOOKING SUMMARY BUILDER
// =============================================================================

function buildBookingSummary(
  session: BookingSession,
  vehicle: VehicleSummary,
  pricingConfig?: { serviceFeePercent: number; taxRateDefault: number }
): BookingSummary {
  const numberOfDays = calculateDays(session.startDate!, session.endDate!)
  const subtotal = vehicle.dailyRate * numberOfDays

  const serviceFeePercent = pricingConfig?.serviceFeePercent ?? 0.15
  const taxRate = pricingConfig?.taxRateDefault ?? 0.084

  const serviceFee = Math.round(subtotal * serviceFeePercent * 100) / 100
  const taxable = subtotal + serviceFee
  const estimatedTax = Math.round(taxable * taxRate * 100) / 100
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
    depositAmount: vehicle.depositAmount,
  }
}

// =============================================================================
// INSURANCE PRICING HELPERS
// =============================================================================

interface InsurancePricingBracket {
  MINIMUM: number
  BASIC: number
  PREMIUM: number
  LUXURY: number
}

interface InsurancePricingRules {
  under25k: InsurancePricingBracket
  '25to50k': InsurancePricingBracket
  '50to100k': InsurancePricingBracket
  over100k: InsurancePricingBracket
}

/**
 * Fetch insurance pricing rules from the primary active InsuranceProvider.
 * Called ONCE per request and reused for all vehicles.
 */
async function fetchInsurancePricingRules(): Promise<InsurancePricingRules | null> {
  try {
    const provider = await prisma.insuranceProvider.findFirst({
      where: { isPrimary: true, isActive: true },
      select: { pricingRules: true },
    })
    return (provider?.pricingRules as unknown as InsurancePricingRules) ?? null
  } catch (error) {
    console.error('[ai-booking-stream] Failed to fetch insurance pricing:', error)
    return null
  }
}

/**
 * Get the Basic tier daily insurance rate based on daily rental rate.
 * Uses daily rate as a proxy for vehicle value bracket:
 *   < $150/day → under25k (economy)
 *   $150-$500/day → 25to50k (mid-range/luxury)
 *   > $500/day → 50to100k (exotic/high-end)
 */
function getBasicDailyRate(rules: InsurancePricingRules, dailyRate: number): number {
  if (dailyRate < 150) return rules.under25k?.BASIC ?? 15
  if (dailyRate < 500) return rules['25to50k']?.BASIC ?? 30
  return rules['50to100k']?.BASIC ?? 50
}

/**
 * Attach real insurance rates to vehicles from InsuranceProvider pricing rules.
 * If no pricing rules available, leaves insuranceBasicDaily as null (frontend falls back to estimate).
 */
async function attachInsurancePricing(
  vehicles: VehicleSummary[],
  pricingRules: InsurancePricingRules | null
): Promise<void> {
  if (!pricingRules) return

  for (const v of vehicles) {
    v.insuranceBasicDaily = getBasicDailyRate(pricingRules, v.dailyRate)
  }
}

// =============================================================================
// SUGGESTION CHIPS
// =============================================================================

const SUGGESTIONS_BY_LOCALE: Record<string, Record<BookingState, string[]>> = {
  en: {
    [BookingState.INIT]: ['I need a car in Phoenix', 'SUV in Scottsdale', 'Cheapest car tomorrow'],
    [BookingState.COLLECTING_LOCATION]: ['Phoenix', 'Scottsdale', 'Tempe', 'Mesa'],
    [BookingState.COLLECTING_DATES]: ['This weekend', 'Tomorrow for 3 days', 'Next Friday to Sunday'],
    [BookingState.COLLECTING_VEHICLE]: ['Show me SUVs', 'Under $100/day', 'The cheapest option'],
    [BookingState.CONFIRMING]: ['Book it', 'Change dates', 'Show other cars'],
    [BookingState.CHECKING_AUTH]: ['Log in', 'Continue as guest'],
    [BookingState.READY_FOR_PAYMENT]: ['Proceed to payment'],
  },
  es: {
    [BookingState.INIT]: ['Necesito un auto en Phoenix', 'SUV en Scottsdale', 'Auto más barato mañana'],
    [BookingState.COLLECTING_LOCATION]: ['Phoenix', 'Scottsdale', 'Tempe', 'Mesa'],
    [BookingState.COLLECTING_DATES]: ['Este fin de semana', 'Mañana por 3 días', 'Viernes a domingo'],
    [BookingState.COLLECTING_VEHICLE]: ['Muéstrame SUVs', 'Menos de $100/día', 'La opción más barata'],
    [BookingState.CONFIRMING]: ['Reservar', 'Cambiar fechas', 'Ver otros autos'],
    [BookingState.CHECKING_AUTH]: ['Iniciar sesión', 'Continuar como invitado'],
    [BookingState.READY_FOR_PAYMENT]: ['Proceder al pago'],
  },
  fr: {
    [BookingState.INIT]: ['J\'ai besoin d\'une voiture à Phoenix', 'SUV à Scottsdale', 'Voiture la moins chère demain'],
    [BookingState.COLLECTING_LOCATION]: ['Phoenix', 'Scottsdale', 'Tempe', 'Mesa'],
    [BookingState.COLLECTING_DATES]: ['Ce week-end', 'Demain pour 3 jours', 'Vendredi à dimanche'],
    [BookingState.COLLECTING_VEHICLE]: ['Montrez-moi les SUV', 'Moins de 100$/jour', 'L\'option la moins chère'],
    [BookingState.CONFIRMING]: ['Réserver', 'Changer les dates', 'Voir d\'autres voitures'],
    [BookingState.CHECKING_AUTH]: ['Se connecter', 'Continuer en tant qu\'invité'],
    [BookingState.READY_FOR_PAYMENT]: ['Procéder au paiement'],
  },
}

function getSuggestions(state: BookingState, locale = 'en'): string[] {
  const suggestions = SUGGESTIONS_BY_LOCALE[locale] || SUGGESTIONS_BY_LOCALE.en
  return suggestions[state] || []
}

// =============================================================================
// STATE COMPUTATION
// =============================================================================

function computeNextState(session: BookingSession): BookingState {
  if (!session.location) return BookingState.COLLECTING_LOCATION
  if (!session.startDate || !session.endDate) return BookingState.COLLECTING_DATES
  if (!session.vehicleId) return BookingState.COLLECTING_VEHICLE
  return BookingState.CONFIRMING
}

// =============================================================================
// SSE HELPERS
// =============================================================================

interface SSEWriter {
  sendEvent: (event: string, data: unknown) => Promise<void>
  close: () => Promise<void>
}

function createSSEWriter(writer: WritableStreamDefaultWriter<Uint8Array>): SSEWriter {
  const encoder = new TextEncoder()
  let closed = false

  return {
    sendEvent: async (event: string, data: unknown) => {
      if (closed) return
      try {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
        await writer.write(encoder.encode(message))
      } catch (error) {
        // Stream may have been closed by client
        closed = true
        console.log('[ai-booking-stream] Stream write failed, likely client disconnected')
      }
    },
    close: async () => {
      if (closed) return
      closed = true
      try {
        await writer.close()
      } catch {
        // Already closed, ignore
      }
    },
  }
}

// =============================================================================
// STREAMING ENDPOINT
// =============================================================================

export async function POST(request: NextRequest) {
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  const sse = createSSEWriter(writer)

  // Process in background
  processStreamingRequest(request, sse)

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

async function processStreamingRequest(request: NextRequest, sse: SSEWriter) {
  let conversationId: string | null = null
  let totalTokensUsed = 0

  try {
    const body = (await request.json()) as AIBookingRequest

    // Validate request
    if (!body.message || typeof body.message !== 'string') {
      await sse.sendEvent('error', { error: 'Message is required' })
      await sse.close()
      return
    }

    // Load settings
    const modelConfig = await getModelConfig()
    const featureFlags = await getFeatureFlags()

    // Fetch insurance pricing rules ONCE per request (for attaching real rates to vehicles)
    const insurancePricingRules = await fetchInsurancePricingRules()

    // Security check
    const sessionMessageCount = body.session?.messages?.length || 0
    const securityCheck = await checkAISecurity(
      request,
      body.message,
      sessionMessageCount,
      body.visitorId ?? undefined,
      body.session?.sessionId
    )

    if (!securityCheck.allowed) {
      await sse.sendEvent('error', { error: securityCheck.reason })
      await sse.close()
      return
    }

    // Initialize session
    let session: BookingSession = body.session || createInitialSession()

    // Create/update conversation in DB
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               request.headers.get('x-real-ip') || '127.0.0.1'
    conversationId = await upsertConversation(session, body.userId, body.visitorId, ip)

    // Check if conversation was terminated by admin
    if (conversationId && !conversationId.startsWith('temp-')) {
      const convRecord = await prisma.choeAIConversation.findUnique({
        where: { id: conversationId },
        select: { outcome: true },
      })
      if (convRecord?.outcome === 'BLOCKED') {
        await sse.sendEvent('error', { error: 'This conversation has been ended by an administrator.' })
        await sse.close()
        return
      }
    }

    // Handle [VERIFIED:email] prefix — client sends this after OTP verification
    let userMessage = body.message
    let bookingContext = ''
    const verifiedMatch = body.message.match(/^\[VERIFIED:([^\]]+)\]\s*(.*)$/)
    if (verifiedMatch) {
      const verifiedEmail = verifiedMatch[1]
      userMessage = verifiedMatch[2] || body.message
      bookingContext = await fetchBookingContextByEmail(verifiedEmail)
    }

    // Add clean user message (without [VERIFIED:] prefix)
    session = addMessage(session, 'user', userMessage)
    await sse.sendEvent('session', { session })

    // Persist user message to DB
    if (conversationId) {
      await saveMessage(conversationId, 'user', userMessage)
    }

    // Check query complexity for extended thinking
    const complexity = detectComplexQuery(userMessage)
    const modelSupportsThinking = supportsExtendedThinking(modelConfig.modelId)
    const thinkingConfig = getExtendedThinkingConfig(complexity.score, modelSupportsThinking)

    // Notify client if using extended thinking
    if (thinkingConfig.enabled) {
      await sse.sendEvent('thinking', {
        enabled: true,
        complexity: complexity.score,
        budgetTokens: thinkingConfig.budgetTokens,
      })
    }

    // Determine verification status from session
    const isVerified = isSessionVerified(session)

    // Build system prompt (enhanced for complex queries)
    const locale = body.locale || 'en'
    let systemPrompt = buildSystemPrompt({
      session,
      isLoggedIn: !!body.userId,
      isVerified,
      vehicles: body.previousVehicles || undefined,
      locale,
    })

    // Inject booking context if user is verified and asking about bookings
    if (bookingContext) {
      systemPrompt += `\n\n${bookingContext}`
    }

    // Enhance prompt for extended thinking
    if (thinkingConfig.enabled) {
      systemPrompt = enhancePromptForThinking(systemPrompt)
    }

    // Build messages for Claude with multi-turn caching
    // Add cache_control to second-to-last user message for conversation prefix caching
    // This saves ~90% on tokens for repeated conversation context
    let claudeMessages: Anthropic.MessageParam[] = addCacheControlToMessages(
      session.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))
    )

    const client = getClient()
    let vehicles: VehicleSummary[] | null = body.previousVehicles || null
    let fullReply = ''

    // Token counting - validate context size
    const tokenValidation = await countAndValidateTokens(
      client,
      modelConfig.modelId,
      systemPrompt,
      claudeMessages,
      BOOKING_TOOLS
    )

    if (tokenValidation.needsTrimming && tokenValidation.trimmedMessages) {
      claudeMessages = tokenValidation.trimmedMessages
      await sse.sendEvent('context_trimmed', {
        originalMessages: session.messages.length,
        trimmedMessages: claudeMessages.length,
        inputTokens: tokenValidation.inputTokens,
      })
    }

    // Agentic loop with Programmatic Tool Calling (PTC) support for Sonnet/Opus
    // For Haiku, use regular tool calling without PTC
    // PTC allows Claude to write Python code that chains tools together
    // e.g., calculator → search_vehicles in a single execution
    let continueLoop = true
    let loopCount = 0
    const MAX_TOOL_LOOPS = 5
    const toolsUsedNames: string[] = []
    const modelSupportsPTC = supportsPTC(modelConfig.modelId)
    const toolsToUse = getToolsForModel(modelConfig.modelId)

    console.log(`[ai-booking-stream] Model: ${modelConfig.modelId}, PTC supported: ${modelSupportsPTC}`)

    while (continueLoop && loopCount < MAX_TOOL_LOOPS) {
      loopCount++
      // Use beta API only for PTC-supported models (Sonnet/Opus)
      // For Haiku, use regular messages.stream without beta headers
      const streamResponse = modelSupportsPTC
        ? client.beta.messages.stream({
            model: modelConfig.modelId,
            max_tokens: modelConfig.maxTokens,
            // Beta headers for Programmatic Tool Calling
            betas: ['code-execution-2025-08-25', 'advanced-tool-use-2025-11-20'],
            system: [
              {
                type: 'text' as const,
                text: systemPrompt,
                cache_control: { type: 'ephemeral' as const },
              },
            ],
            messages: claudeMessages,
            tools: toolsToUse as Anthropic.Tool[],
          })
        : client.messages.stream({
            model: modelConfig.modelId,
            max_tokens: modelConfig.maxTokens,
            system: [
              {
                type: 'text' as const,
                text: systemPrompt,
                cache_control: { type: 'ephemeral' as const },
              },
            ],
            messages: claudeMessages,
            tools: BOOKING_TOOLS,
          })

      let currentText = ''
      let stopReason: string | null = null

      // Buffer the response - don't stream raw JSON to frontend
      // Claude outputs JSON which we need to parse first
      for await (const event of streamResponse) {
        if (event.type === 'content_block_delta') {
          const delta = event.delta
          if ('text' in delta && delta.text) {
            currentText += delta.text
            // DON'T send raw text - it's JSON that needs parsing
            // The frontend shows a "thinking" indicator instead
          }
        } else if (event.type === 'message_delta') {
          stopReason = event.delta.stop_reason
        }
      }

      const finalMessage = await streamResponse.finalMessage()
      totalTokensUsed += (finalMessage.usage?.input_tokens || 0) + (finalMessage.usage?.output_tokens || 0)

      // Cast content to a common type for processing
      // Both beta and regular APIs return similar content block structures
      const contentBlocks = finalMessage.content as Array<{ type: string; name?: string; input?: unknown; caller?: unknown }>

      // Debug logging for response issues
      console.log(`[ai-booking-stream] Stop reason: ${stopReason}, Text length: ${currentText.length}, Tool blocks: ${contentBlocks.filter((b: { type: string }) => b.type === 'tool_use').length}`)

      // Handle both regular tool_use and PTC (Programmatic Tool Calling) tool_use
      // PTC tool calls have a caller field: { type: 'code_execution_20250825', tool_id: '...' }
      const completeToolUses = contentBlocks.filter(
        (block: { type: string }): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      )

      // Check for server_tool_use (code execution) blocks
      const serverToolUses = contentBlocks.filter(
        (block: { type: string }) => block.type === 'server_tool_use'
      )

      // Log PTC usage for debugging
      if (serverToolUses.length > 0) {
        console.log('[ai-booking-stream] PTC: Code execution in use')
      }

      // Execute tools if needed (works for both regular and PTC tool calls)
      if (completeToolUses.length > 0 && stopReason === 'tool_use') {
        // Check if any tools came from PTC (code execution)
        const ptcToolCalls = completeToolUses.filter(
          (t: Anthropic.ToolUseBlock & { caller?: { type?: string } }) => t.caller?.type === 'code_execution_20250825'
        )
        if (ptcToolCalls.length > 0) {
          console.log(`[ai-booking-stream] PTC: ${ptcToolCalls.length} programmatic tool call(s)`)
        }

        toolsUsedNames.push(...completeToolUses.map((t: Anthropic.ToolUseBlock) => t.name))

        await sse.sendEvent('tool_use', {
          tools: completeToolUses.map((t: Anthropic.ToolUseBlock & { caller?: { type?: string } }) => ({
            name: t.name,
            input: t.input,
            isPTC: t.caller?.type === 'code_execution_20250825',
          })),
        })

        const { results, vehicles: searchedVehicles, updatedSession } = await executeTools(
          completeToolUses,
          session
        )

        // BUDGET EXTRACTION: Check if calculator was called with budget/days pattern
        for (const toolUse of completeToolUses) {
          if (toolUse.name === 'calculator') {
            const input = toolUse.input as { expression?: string; purpose?: string }
            if (input.expression) {
              // Detect "TOTAL / DAYS" pattern (e.g., "350 / 4" or "600/5")
              const divMatch = input.expression.match(/^\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+)\s*$/)
              if (divMatch) {
                const totalBudget = parseFloat(divMatch[1])
                const days = parseInt(divMatch[2])
                console.log(`[ai-booking-stream] Budget detected: $${totalBudget} total for ${days} days`)
                updatedSession.maxTotalBudget = totalBudget
                updatedSession.rentalDays = days
              }
            }
          }
        }

        if (searchedVehicles) {
          // BUDGET FILTERING: Only show cars that fit user's total budget
          let filteredVehicles = searchedVehicles

          // Also set rentalDays from session dates if not already set
          if (!updatedSession.rentalDays && updatedSession.startDate && updatedSession.endDate) {
            updatedSession.rentalDays = calculateDays(updatedSession.startDate, updatedSession.endDate)
          }

          if (updatedSession.maxTotalBudget && updatedSession.rentalDays) {
            const budget = updatedSession.maxTotalBudget
            const days = updatedSession.rentalDays
            const pricingForBudget = await getPricingConfig()
            const feeMultiplier = (1 + pricingForBudget.serviceFeePercent) * (1 + pricingForBudget.taxRateDefault) // e.g. 1.15 * 1.084 = 1.2466

            filteredVehicles = searchedVehicles.filter(v => {
              const total = (v.dailyRate * days * feeMultiplier) + v.depositAmount
              return total <= budget
            })

            console.log(`[ai-booking-stream] Budget filter: ${searchedVehicles.length} → ${filteredVehicles.length} cars (budget: $${budget}, ${days} days)`)

            // Fallback: If no cars fit, show top 3 cheapest with warning
            if (filteredVehicles.length === 0) {
              filteredVehicles = searchedVehicles
                .slice()
                .sort((a, b) => {
                  const totalA = (a.dailyRate * days * feeMultiplier) + a.depositAmount
                  const totalB = (b.dailyRate * days * feeMultiplier) + b.depositAmount
                  return totalA - totalB
                })
                .slice(0, 3)
              console.log(`[ai-booking-stream] No cars fit budget, showing 3 cheapest options`)
            }
          }

          // Attach real insurance pricing from InsuranceProvider
          await attachInsurancePricing(filteredVehicles, insurancePricingRules)

          vehicles = filteredVehicles
          await sse.sendEvent('vehicles', { vehicles })

          // CRITICAL: Rebuild system prompt with vehicles so Claude sees presentation rules
          systemPrompt = buildSystemPrompt({
            session: updatedSession,
            isLoggedIn: !!body.userId,
            isVerified,
            vehicles: filteredVehicles,
            locale,
          })
        }

        session = updatedSession

        claudeMessages.push({ role: 'assistant', content: contentBlocks as Anthropic.ContentBlockParam[] })
        claudeMessages.push({ role: 'user', content: results })

        continue
      }

      fullReply = currentText
      continueLoop = false
    }

    // Safety: if loop hit max iterations without a text reply, use a fallback
    if (loopCount >= MAX_TOOL_LOOPS && !fullReply) {
      console.error(`[ai-booking-stream] Hit max tool loop iterations (${MAX_TOOL_LOOPS})`)
      fullReply = '{"reply":"Sorry, that took too long! Could you try rephrasing your request?","nextState":"COLLECTING_DATES"}'
    }

    // Parse Claude's JSON response to extract the reply and other fields
    console.log(`[ai-booking-stream] Raw response (first 200 chars): ${fullReply.slice(0, 200)}`)
    const parsed = parseClaudeResponse(fullReply)
    console.log(`[ai-booking-stream] Parsed reply: "${parsed.reply.slice(0, 100)}..."`)

    // Safety check: ensure we have a valid reply
    if (!parsed.reply || parsed.reply.length === 0) {
      console.error('[ai-booking-stream] Empty reply after parsing!')
      parsed.reply = "Let me check that for you. Could you tell me which car you're interested in?"
    }

    // Update session with extracted data
    if (parsed.extractedData) {
      if (parsed.extractedData.location) session.location = parsed.extractedData.location
      if (parsed.extractedData.startDate) session.startDate = parsed.extractedData.startDate
      if (parsed.extractedData.endDate) session.endDate = parsed.extractedData.endDate
      if (parsed.extractedData.startTime) session.startTime = parsed.extractedData.startTime
      if (parsed.extractedData.endTime) session.endTime = parsed.extractedData.endTime
      if (parsed.extractedData.vehicleType) session.vehicleType = parsed.extractedData.vehicleType
      if (parsed.extractedData.vehicleId) session.vehicleId = parsed.extractedData.vehicleId
    }

    // FALLBACK: Extract vehicleId from user message if Claude didn't set it
    // Format: "I'll take the 2024 Honda Accord [id:cm...]"
    if (!session.vehicleId && body.message) {
      const idMatch = body.message.match(/\[id:([^\]]+)\]/)
      if (idMatch && idMatch[1]) {
        console.log('[ai-booking-stream] Extracted vehicleId from user message:', idMatch[1])
        session.vehicleId = idMatch[1]
        // Update state to CONFIRMING since we have a vehicle selection
        session.state = BookingState.CONFIRMING
      }
    }

    // Update session state - use parsed.nextState or compute from session
    session.state = parsed.nextState || computeNextState(session)

    // Add only the reply text to session (not raw JSON)
    session = addMessage(session, 'assistant', parsed.reply)

    // Persist assistant message to DB
    if (conversationId) {
      const vehiclesReturnedCount = vehicles?.length || 0
      await saveMessage(conversationId, 'assistant', parsed.reply, totalTokensUsed, undefined, toolsUsedNames, vehiclesReturnedCount)
    }

    // Build booking summary if confirming or ready for payment
    const pricingConfig = await getPricingConfig()
    let summary: BookingSummary | null = null
    if ((session.state === BookingState.CONFIRMING || session.state === BookingState.READY_FOR_PAYMENT) && session.vehicleId && vehicles) {
      const selectedVehicle = vehicles.find((v) => v.id === session.vehicleId)
      if (selectedVehicle && session.startDate && session.endDate) {
        summary = buildBookingSummary(session, selectedVehicle, pricingConfig)
      }
    }

    // Risk assessment - use parsed.action or compute from risk assessment
    let action: string | null = parsed.action
    if (!action && (session.state === BookingState.CONFIRMING || session.state === BookingState.READY_FOR_PAYMENT) && summary && featureFlags.riskAssessmentEnabled) {
      if (!body.userId) {
        action = 'NEEDS_LOGIN'
      } else {
        const risk = await assessBookingRisk({
          session,
          vehicle: summary.vehicle,
          userId: body.userId,
          isVerified,
          numberOfDays: summary.numberOfDays,
          totalAmount: summary.estimatedTotal,
        })
        if (risk.action) {
          action = risk.action
        }
      }
    }

    // Update conversation stats
    if (conversationId) {
      const settings = await getChoeSettings()
      const cost = calculateCostSimple(totalTokensUsed, settings.modelId)
      await updateConversationStats(conversationId, session, totalTokensUsed, cost)
    }

    // Send final response
    await sse.sendEvent('done', {
      session,
      vehicles,
      summary,
      action,
      suggestions: getSuggestions(session.state, locale),
      tokensUsed: totalTokensUsed,
    })

  } catch (error) {
    console.error('[ai-booking-stream] Error:', error)
    await sse.sendEvent('error', {
      error: error instanceof Error ? error.message : 'Something went wrong',
    })
  } finally {
    await sse.close()
  }
}
