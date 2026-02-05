// app/api/ai/booking/route.ts
// AI Booking endpoint — orchestrates Claude + search + risk assessment
// Uses database settings from ChoeAISettings table

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
import {
  detectAllIntents,
  applyIntentsToQuery,
  hasFilters,
  wantsNoDeposit,
  wantsLowestPrice,
  createFallbackQueries,
  shouldTryFallback,
  getFallbackLevel,
} from '@/app/lib/ai-booking/detection'
import {
  hasActiveInventory,
  getNearestMarket,
  extractCityName,
} from '@/app/lib/ai-booking/filters'
import prisma from '@/app/lib/database/prisma'
import {
  getChoeSettings,
  getModelConfig,
  getPricingConfig,
  getFeatureFlags,
} from '@/app/lib/ai-booking/choe-settings'
import { countAndValidateTokens } from '@/app/lib/ai-booking/token-counting'
import {
  detectComplexQuery,
  supportsExtendedThinking,
  getExtendedThinkingConfig,
  enhancePromptForThinking,
} from '@/app/lib/ai-booking/extended-thinking'

// =============================================================================
// COST CALCULATION (with prompt caching support)
// =============================================================================

const COST_PER_1M_TOKENS: Record<string, number> = {
  // Claude 4.5 Series (2025)
  'claude-haiku-4-5-20251001': 1,
  'claude-sonnet-4-5-20250929': 3,
  'claude-opus-4-5-20251101': 15,
  // Claude 3.5 Series (Legacy)
  'claude-3-5-haiku-20241022': 0.25,
  'claude-3-5-sonnet-20241022': 3,
  'claude-3-opus-20240229': 15,
}

// Cached tokens cost 90% less
const CACHE_DISCOUNT = 0.1

function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string,
  cachedTokens: number = 0
): number {
  const inputCostPer1M = COST_PER_1M_TOKENS[model] || 1
  const outputCostPer1M = inputCostPer1M * 5 // Output is 5x input cost

  // Regular input tokens (non-cached)
  const regularInputTokens = inputTokens - cachedTokens
  const inputCost = (regularInputTokens / 1_000_000) * inputCostPer1M

  // Cached tokens (90% discount)
  const cacheCost = (cachedTokens / 1_000_000) * inputCostPer1M * CACHE_DISCOUNT

  // Output tokens
  const outputCost = (outputTokens / 1_000_000) * outputCostPer1M

  return inputCost + cacheCost + outputCost
}

// Simple cost calculation for backwards compatibility
function calculateCostSimple(tokens: number, model: string): number {
  const costPer1M = COST_PER_1M_TOKENS[model] || 1
  return (tokens / 1_000_000) * costPer1M
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
// STRUCTURED OUTPUT SCHEMA
// =============================================================================

// JSON Schema for ClaudeBookingOutput - guarantees valid responses
const BOOKING_OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    reply: {
      type: 'string',
      description: 'The conversational response to show the user',
    },
    nextState: {
      type: 'string',
      enum: ['INIT', 'COLLECTING_LOCATION', 'COLLECTING_DATES', 'COLLECTING_VEHICLE', 'CONFIRMING', 'CHECKING_AUTH', 'READY_FOR_PAYMENT'],
      description: 'The booking state to transition to',
    },
    extractedData: {
      type: 'object',
      properties: {
        location: { type: 'string' },
        locationId: { type: 'string' },
        startDate: { type: 'string', description: 'ISO date format YYYY-MM-DD' },
        endDate: { type: 'string', description: 'ISO date format YYYY-MM-DD' },
        startTime: { type: 'string', description: 'Time in HH:mm format' },
        endTime: { type: 'string', description: 'Time in HH:mm format' },
        vehicleType: { type: 'string' },
        vehicleId: { type: 'string' },
      },
      additionalProperties: false,
    },
    action: {
      anyOf: [
        { type: 'string', enum: ['HANDOFF_TO_PAYMENT', 'NEEDS_LOGIN', 'NEEDS_VERIFICATION', 'HIGH_RISK_REVIEW', 'START_OVER'] },
        { type: 'null' }
      ],
      description: 'Special action to trigger, or null for normal flow',
    },
    searchQuery: {
      anyOf: [
        {
          type: 'object',
          properties: {
            location: { type: 'string' },
            carType: { type: 'string' },
            pickupDate: { type: 'string' },
            returnDate: { type: 'string' },
            pickupTime: { type: 'string' },
            returnTime: { type: 'string' },
            make: { type: 'string' },
            priceMin: { type: 'number' },
            priceMax: { type: 'number' },
            seats: { type: 'number' },
            transmission: { type: 'string' },
            noDeposit: { type: 'boolean' },
            instantBook: { type: 'boolean' },
            vehicleType: { type: 'string', enum: ['RENTAL', 'RIDESHARE'] },
          },
          additionalProperties: false,
        },
        { type: 'null' }
      ],
    },
  },
  required: ['reply', 'nextState', 'extractedData', 'action', 'searchQuery'],
  additionalProperties: false,
} as const

// Check if model supports structured outputs (Claude 4.5 only)
// NOTE: Structured outputs GA but anyOf patterns still cause Anthropic 500 errors
// Keeping disabled until Anthropic fixes nullable field handling
function supportsStructuredOutputs(modelId: string): boolean {
  // return modelId.includes('4-5') || modelId.includes('4.5')
  return false // Disabled: anyOf with null causes API 500 errors
}

// Parse structured output (guaranteed valid JSON from Claude 4.5)
function parseStructuredResponse(raw: string): ReturnType<typeof parseClaudeResponse> {
  try {
    const parsed = JSON.parse(raw)
    // Map nextState string to BookingState enum
    const nextState = parsed.nextState as BookingState || BookingState.INIT
    // Handle both null and 'NONE' for backward compatibility
    const action = (parsed.action === 'NONE' || parsed.action === null) ? null : (parsed.action || null)
    return {
      reply: parsed.reply || "I'm here to help you find a car!",
      nextState,
      extractedData: parsed.extractedData || {},
      action,
      searchQuery: parsed.searchQuery || null,
    }
  } catch {
    // Fallback to legacy parser if JSON parse fails (shouldn't happen with structured outputs)
    return parseClaudeResponse(raw)
  }
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
// DATABASE HELPERS (defined before POST for clarity)
// =============================================================================

/**
 * Create or update a conversation record in the database
 */
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
      await prisma.choeAIConversation.update({
        where: { sessionId: session.sessionId },
        data: {
          state: session.state,
          location: session.location,
          vehicleType: session.vehicleType,
          lastActivityAt: new Date(),
          messageCount: session.messages.length,
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
    console.error('[ai-booking] Failed to upsert conversation:', error)
    return `temp-${session.sessionId}`
  }
}

/**
 * Log a message to the database
 */
async function logMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  tokensUsed: number = 0,
  responseTimeMs?: number,
  toolsUsed: string[] = [],
  vehiclesReturned: number = 0
): Promise<void> {
  if (conversationId.startsWith('temp-')) return

  try {
    await prisma.choeAIMessage.create({
      data: {
        conversationId,
        role,
        content,
        tokensUsed,
        responseTimeMs: responseTimeMs || null,
        searchPerformed: toolsUsed.includes('search_vehicles'),
        vehiclesReturned,
        toolsUsed: toolsUsed.length > 0 ? toolsUsed : null,
      }
    })
  } catch (error) {
    console.error('[ai-booking] Failed to log message:', error)
  }
}

/**
 * Update conversation statistics
 */
async function updateConversationStats(
  conversationId: string,
  session: BookingSession,
  totalTokens: number,
  estimatedCost: number
): Promise<void> {
  if (conversationId.startsWith('temp-')) return

  try {
    let outcome: string | null = null
    if (session.state === BookingState.READY_FOR_PAYMENT) {
      outcome = 'COMPLETED'
    }

    await prisma.choeAIConversation.update({
      where: { id: conversationId },
      data: {
        state: session.state,
        messageCount: session.messages.length,
        location: session.location,
        vehicleType: session.vehicleType,
        totalTokens: { increment: totalTokens },
        estimatedCost: { increment: estimatedCost },
        lastActivityAt: new Date(),
        ...(outcome && { outcome }),
        // vehicleId tracked in session, not in DB (field not in schema)
      }
    })
  } catch (error) {
    console.error('[ai-booking] Failed to update conversation stats:', error)
  }
}

/**
 * Track when an auth prompt is shown
 */
async function trackAuthPrompt(conversationId: string): Promise<void> {
  if (conversationId.startsWith('temp-')) return

  try {
    await prisma.choeAIConversation.update({
      where: { id: conversationId },
      data: {
        authPromptedAt: new Date(),
      }
    })
  } catch (error) {
    console.error('[ai-booking] Failed to track auth prompt:', error)
  }
}

// =============================================================================
// POST /api/ai/booking
// =============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let conversationId: string | null = null
  let totalTokensUsed = 0

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
    // LOAD SETTINGS FROM DATABASE
    // ==========================================================================
    const modelConfig = await getModelConfig()
    const featureFlags = await getFeatureFlags()

    // ==========================================================================
    // SECURITY CHECK - Rate limiting, bot detection, input validation
    // ==========================================================================
    const sessionMessageCount = body.session?.messages?.length || 0
    const securityCheck = await checkAISecurity(
      request,
      body.message,
      sessionMessageCount,
      body.visitorId ?? undefined,
      body.session?.sessionId
    )

    if (!securityCheck.allowed) {
      return createSecurityBlockedResponse(securityCheck)
    }

    // Initialize or restore session
    let session: BookingSession = body.session || createInitialSession()

    // ==========================================================================
    // CREATE/UPDATE CONVERSATION IN DATABASE
    // ==========================================================================
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               request.headers.get('x-real-ip') ||
               request.headers.get('cf-connecting-ip') ||
               '127.0.0.1'

    conversationId = await upsertConversation(session, body.userId, body.visitorId, ip)

    // Add user message to history
    session = addMessage(session, 'user', body.message)

    // Log user message to database
    await logMessage(conversationId, 'user', body.message, 0)

    // Use previously returned vehicles if available (for selection step)
    let vehicles: VehicleSummary[] | null = body.previousVehicles || null
    let weather = undefined

    // Direct weather question — answer without calling Claude (cost optimization)
    if (isDirectWeatherQuestion(body.message) && featureFlags.weatherEnabled) {
      const city = extractCityFromWeatherQuestion(body.message) || session.location || 'phoenix';
      const weatherData = await fetchWeatherContext(city);
      if (weatherData) {
        const reply = buildWeatherReply(weatherData);
        session = addMessage(session, 'assistant', reply);

        // Log assistant message with get_weather tool tracked
        await logMessage(conversationId, 'assistant', reply, 0, undefined, ['get_weather'], 0)
        await updateConversationStats(conversationId, session, 0, 0)

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
      featureFlags.weatherEnabled &&
      isWeatherRelevant(body.message) &&
      session.location
    ) {
      weather = await fetchWeatherContext(session.location) || undefined
    }

    // Build system prompt — include previous vehicles and location context
    const systemPrompt = buildSystemPrompt({
      session,
      isLoggedIn: !!body.userId,
      isVerified: false, // TODO: check actual verification status
      vehicles: vehicles || undefined,
      weather,
      location: session.location,
    })

    // Build conversation history for Claude
    // Build messages for Claude with multi-turn caching
    // Add cache_control to second-to-last user message for conversation prefix caching
    let claudeMessages: Anthropic.MessageParam[] = addCacheControlToMessages(
      session.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))
    )

    // Call Claude with DB settings, prompt caching, and structured outputs
    const client = getClient()
    const useStructuredOutputs = supportsStructuredOutputs(modelConfig.modelId)

    // ==========================================================================
    // TOKEN COUNTING - Validate context size before API call
    // ==========================================================================
    const tokenResult = await countAndValidateTokens(
      client,
      modelConfig.modelId,
      systemPrompt,
      claudeMessages
    )

    if (tokenResult.needsTrimming && tokenResult.trimmedMessages) {
      console.log(`[CHOÉ DEBUG] Context trimmed: ${tokenResult.inputTokens} tokens, kept ${tokenResult.trimmedMessages.length} messages`)
      claudeMessages = tokenResult.trimmedMessages
    }

    // ==========================================================================
    // EXTENDED THINKING - Detect complexity and enable thinking for complex queries
    // ==========================================================================
    const complexityAnalysis = detectComplexQuery(body.message)
    const modelHasThinking = supportsExtendedThinking(modelConfig.modelId)
    const thinkingConfig = getExtendedThinkingConfig(complexityAnalysis.score, modelHasThinking)

    console.log('[CHOÉ DEBUG] Model ID:', modelConfig.modelId, '| Structured outputs:', useStructuredOutputs, '| Complexity:', complexityAnalysis.score, '| Thinking:', thinkingConfig.enabled)

    // Enhance prompt if thinking is enabled
    const finalSystemPrompt = thinkingConfig.enabled
      ? enhancePromptForThinking(systemPrompt)
      : systemPrompt

    // Build request options
    const requestOptions: Parameters<typeof client.messages.create>[0] = {
      model: modelConfig.modelId,
      max_tokens: thinkingConfig.enabled ? 16000 : modelConfig.maxTokens,
      // Use array format with cache_control for prompt caching (5-min TTL)
      system: [
        {
          type: 'text' as const,
          text: finalSystemPrompt,
          cache_control: { type: 'ephemeral' as const },
        },
      ],
      messages: claudeMessages,
      // Add extended thinking for complex queries (Claude 4.5 Sonnet/Opus only)
      ...(thinkingConfig.enabled && {
        // @ts-expect-error - thinking is a new API feature
        thinking: {
          type: 'enabled',
          budget_tokens: thinkingConfig.budgetTokens,
        },
      }),
    }

    // Add structured outputs for Claude 4.5 models (guarantees valid JSON)
    if (useStructuredOutputs) {
      // @ts-expect-error - output_config is a new API feature
      requestOptions.output_config = {
        format: {
          type: 'json_schema',
          schema: BOOKING_OUTPUT_SCHEMA,
        },
      }
    }

    const claudeResponse = await client.messages.create(requestOptions) as Anthropic.Message

    // Track token usage with cache awareness
    const inputTokens = claudeResponse.usage?.input_tokens || 0
    const outputTokens = claudeResponse.usage?.output_tokens || 0
    // @ts-expect-error - cache_read_input_tokens exists on responses when caching is used
    const cachedTokens = claudeResponse.usage?.cache_read_input_tokens || 0
    totalTokensUsed += inputTokens + outputTokens
    let totalCachedTokens = cachedTokens

    // Extract text from Claude's response
    const rawText = claudeResponse.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { type: 'text'; text: string }).text)
      .join('')

    // Parse structured response (simplified for structured outputs, fallback for legacy models)
    const parsed = useStructuredOutputs
      ? parseStructuredResponse(rawText)
      : parseClaudeResponse(rawText)

    // ==========================================================================
    // LAYER 2: INTENT DETECTION (fills gaps when Claude misses filters)
    // ==========================================================================
    // 3-Layer Fallback System:
    //   Layer 1: Claude sets searchQuery fields (sometimes fails)
    //   Layer 2: Intent detection from user message (this code)
    //   Layer 3: Prisma WHERE clause applies actual filter
    // ==========================================================================

    const detectedIntents = detectAllIntents(body.message)
    console.log('[CHOÉ DEBUG] User message:', body.message)
    console.log('[CHOÉ DEBUG] Detected intents:', JSON.stringify(detectedIntents))
    console.log('[CHOÉ DEBUG] Session location:', session.location)
    console.log('[CHOÉ DEBUG] Claude searchQuery:', JSON.stringify(parsed.searchQuery))

    // If no searchQuery but user has strong intents and we have location, create one
    // BUT don't create if we already have vehicles (user is asking about existing results)
    const hasPreviousVehicles = body.previousVehicles && body.previousVehicles.length > 0
    if (!parsed.searchQuery && session.location && !hasPreviousVehicles && (detectedIntents.noDeposit || detectedIntents.instantBook || detectedIntents.luxury || detectedIntents.electric || detectedIntents.suv || detectedIntents.rideshare)) {
      console.log('[CHOÉ DEBUG] Creating searchQuery from detected intents')
      parsed.searchQuery = applyIntentsToQuery({ location: session.location }, detectedIntents)
    }

    // Track tools used in this turn
    let toolsUsed: string[] = []
    let vehiclesReturned = 0

    // If Claude wants to search, do it now
    if (parsed.searchQuery) {
      toolsUsed.push('search_vehicles')

      // Apply detected intents to searchQuery (fills gaps Claude missed)
      parsed.searchQuery = applyIntentsToQuery(parsed.searchQuery, detectedIntents)
      console.log('[CHOÉ DEBUG] Final searchQuery after intent injection:', JSON.stringify(parsed.searchQuery))

      // Check if requested location has active inventory
      const searchLocation = parsed.searchQuery.location || session.location
      if (searchLocation && !hasActiveInventory(searchLocation)) {
        const nearestInfo = getNearestMarket(searchLocation)
        const cityName = extractCityName(searchLocation)
        console.log(`[CHOÉ DEBUG] No inventory in ${cityName}, nearest: ${nearestInfo?.nearest}`)

        // Redirect search to nearest active market
        if (nearestInfo && nearestInfo.nearest) {
          parsed.searchQuery.location = `${nearestInfo.nearest}, AZ`
          // Claude will explain this in the reply via location context in system prompt
        }
      }

      vehicles = await searchVehicles(parsed.searchQuery)
      console.log('[CHOÉ DEBUG] Search returned', vehicles?.length, 'vehicles')

      // Progressive fallback: if filtered search returned 0 results, try progressively looser filters
      if (vehicles.length === 0 && shouldTryFallback(vehicles, parsed.searchQuery)) {
        const fallbacks = createFallbackQueries(parsed.searchQuery)
        for (const fallbackQuery of fallbacks) {
          vehicles = await searchVehicles(fallbackQuery)
          if (vehicles.length > 0) {
            const level = getFallbackLevel(parsed.searchQuery, fallbackQuery)
            console.log(`[CHOÉ DEBUG] Fallback level ${level} returned ${vehicles.length} vehicles`)
            break
          }
        }
      }

      vehiclesReturned = vehicles.length

      // Sort by price if user asked for cheapest/budget
      if (vehicles.length > 0 && wantsLowestPrice(body.message)) {
        vehicles = [...vehicles].sort((a, b) => a.dailyRate - b.dailyRate)
      }

      // Call Claude again with vehicle context (or with 0-result context)
      const enrichedPromptBase = buildSystemPrompt({
        session,
        isLoggedIn: !!body.userId,
        isVerified: false,
        vehicles: vehicles.length > 0 ? vehicles : undefined,
        weather,
        location: session.location,
      })

      // Apply thinking enhancement if enabled
      const enrichedPrompt = thinkingConfig.enabled
        ? enhancePromptForThinking(enrichedPromptBase)
        : enrichedPromptBase

      const noResultsNote = vehicles.length === 0
        ? ` No exact matches were found for the filters (make/type/price/seats). Show the user what IS available nearby, or suggest broadening their search.`
        : ''

      // Build enriched request options
      const enrichedRequestOptions: Parameters<typeof client.messages.create>[0] = {
        model: modelConfig.modelId,
        max_tokens: thinkingConfig.enabled ? 16000 : modelConfig.maxTokens,
        // Use array format with cache_control for prompt caching
        system: [
          {
            type: 'text' as const,
            text: enrichedPrompt,
            cache_control: { type: 'ephemeral' as const },
          },
        ],
        // Add extended thinking for complex queries
        ...(thinkingConfig.enabled && {
          // @ts-expect-error - thinking is a new API feature
          thinking: {
            type: 'enabled',
            budget_tokens: thinkingConfig.budgetTokens,
          },
        }),
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
      }

      // Add structured outputs for Claude 4.5 models
      if (useStructuredOutputs) {
        // @ts-expect-error - output_config is a new API feature
        enrichedRequestOptions.output_config = {
          format: {
            type: 'json_schema',
            schema: BOOKING_OUTPUT_SCHEMA,
          },
        }
      }

      const enrichedResponse = await client.messages.create(enrichedRequestOptions) as Anthropic.Message

      // Track enriched response tokens with cache awareness
      const enrichedInputTokens = enrichedResponse.usage?.input_tokens || 0
      const enrichedOutputTokens = enrichedResponse.usage?.output_tokens || 0
      // @ts-expect-error - cache_read_input_tokens exists on responses when caching is used
      const enrichedCachedTokens = enrichedResponse.usage?.cache_read_input_tokens || 0
      totalTokensUsed += enrichedInputTokens + enrichedOutputTokens
      totalCachedTokens += enrichedCachedTokens

      const enrichedText = enrichedResponse.content
        .filter((block) => block.type === 'text')
        .map((block) => (block as { type: 'text'; text: string }).text)
        .join('')

      const enrichedParsed = useStructuredOutputs
        ? parseStructuredResponse(enrichedText)
        : parseClaudeResponse(enrichedText)
      parsed.reply = enrichedParsed.reply
      if (enrichedParsed.nextState) {
        parsed.nextState = enrichedParsed.nextState
      }
    }

    // Apply extracted data to session
    session = applyExtractedData(session, parsed)

    // Add AI reply to history
    session = addMessage(session, 'assistant', parsed.reply)

    // Calculate response time
    const responseTimeMs = Date.now() - startTime

    // Track additional tools based on extracted data
    if (parsed.extractedData.vehicleId) {
      toolsUsed.push('select_vehicle')
    }
    if (parsed.extractedData.startDate || parsed.extractedData.endDate || parsed.extractedData.location) {
      toolsUsed.push('update_booking_details')
    }

    // Log assistant message to database
    if (conversationId) {
      await logMessage(conversationId, 'assistant', parsed.reply, totalTokensUsed, responseTimeMs, toolsUsed, vehiclesReturned)
    }

    // Build booking summary if confirming (using DB pricing settings)
    const pricingConfig = await getPricingConfig()
    let summary: BookingSummary | null = null
    if (
      session.state === BookingState.CONFIRMING &&
      session.vehicleId &&
      vehicles
    ) {
      const selectedVehicle = vehicles.find((v) => v.id === session.vehicleId)
      if (selectedVehicle && session.startDate && session.endDate) {
        summary = buildBookingSummary(session, selectedVehicle, pricingConfig)
      }
    }

    // Risk assessment at confirmation
    const featureFlags2 = await getFeatureFlags()
    let action = parsed.action
    if (
      session.state === BookingState.CONFIRMING &&
      summary &&
      !action &&
      featureFlags2.riskAssessmentEnabled
    ) {
      if (!body.userId) {
        action = 'NEEDS_LOGIN'
        // Track auth prompt
        if (conversationId) {
          await trackAuthPrompt(conversationId)
        }
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

    // Update conversation stats in database
    if (conversationId) {
      const settings = await getChoeSettings()
      const cost = calculateCostSimple(totalTokensUsed, settings.modelId)
      await updateConversationStats(conversationId, session, totalTokensUsed, cost)
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
    // Log full error details for debugging
    console.error('[ai-booking] Error:', error)
    if (error instanceof Error) {
      console.error('[ai-booking] Error message:', error.message)
      console.error('[ai-booking] Error stack:', error.stack)
    }
    // Log Anthropic API error details if available
    if (error && typeof error === 'object' && 'status' in error) {
      console.error('[ai-booking] Anthropic API status:', (error as { status: number }).status)
    }
    if (error && typeof error === 'object' && 'error' in error) {
      console.error('[ai-booking] Anthropic API error body:', JSON.stringify((error as { error: unknown }).error))
    }

    // Specific error for missing API key
    if (error instanceof Error && error.message.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      )
    }

    // Handle Anthropic API errors with more detail
    if (error && typeof error === 'object' && 'status' in error) {
      const apiError = error as { status: number; message?: string }
      if (apiError.status === 500) {
        console.error('[ai-booking] Anthropic returned 500 - internal server error on their end')
        return NextResponse.json(
          { error: 'AI service temporarily unavailable. Please try again in a moment.' },
          { status: 503 }
        )
      }
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
// SEARCH FILTER HELPERS
// =============================================================================
// Now imported from @/app/lib/ai-booking/detection:
// - detectAllIntents, applyIntentsToQuery, hasFilters, wantsNoDeposit, wantsLowestPrice
