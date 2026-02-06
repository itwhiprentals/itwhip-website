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
import { countAndValidateTokens } from '@/app/lib/ai-booking/token-counting'
import { calculateCostSimple } from '@/app/lib/ai-booking/cost'
import {
  detectComplexQuery,
  getExtendedThinkingConfig,
  supportsExtendedThinking,
  enhancePromptForThinking,
} from '@/app/lib/ai-booking/extended-thinking'

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
// SUGGESTION CHIPS
// =============================================================================

function getSuggestions(state: BookingState): string[] {
  const suggestions: Record<BookingState, string[]> = {
    [BookingState.INIT]: ['I need a car in Phoenix', 'SUV in Scottsdale', 'Cheapest car tomorrow'],
    [BookingState.COLLECTING_LOCATION]: ['Phoenix', 'Scottsdale', 'Tempe', 'Mesa'],
    [BookingState.COLLECTING_DATES]: ['This weekend', 'Tomorrow for 3 days', 'Next Friday to Sunday'],
    [BookingState.COLLECTING_VEHICLE]: ['Show me SUVs', 'Under $100/day', 'The cheapest option'],
    [BookingState.CONFIRMING]: ['Book it', 'Change dates', 'Show other cars'],
    [BookingState.CHECKING_AUTH]: ['Log in', 'Continue as guest'],
    [BookingState.READY_FOR_PAYMENT]: ['Proceed to payment'],
  }
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

    // Add user message
    session = addMessage(session, 'user', body.message)
    await sse.sendEvent('session', { session })

    // Check query complexity for extended thinking
    const complexity = detectComplexQuery(body.message)
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

    // Build system prompt (enhanced for complex queries)
    let systemPrompt = buildSystemPrompt({
      session,
      isLoggedIn: !!body.userId,
      isVerified: false,
      vehicles: body.previousVehicles || undefined,
    })

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
    const modelSupportsPTC = supportsPTC(modelConfig.modelId)
    const toolsToUse = getToolsForModel(modelConfig.modelId)

    console.log(`[ai-booking-stream] Model: ${modelConfig.modelId}, PTC supported: ${modelSupportsPTC}`)

    while (continueLoop) {
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

      // Handle both regular tool_use and PTC (Programmatic Tool Calling) tool_use
      // PTC tool calls have a caller field: { type: 'code_execution_20250825', tool_id: '...' }
      const completeToolUses = finalMessage.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      )

      // Check for server_tool_use (code execution) blocks
      const serverToolUses = finalMessage.content.filter(
        (block) => block.type === 'server_tool_use'
      )

      // Log PTC usage for debugging
      if (serverToolUses.length > 0) {
        console.log('[ai-booking-stream] PTC: Code execution in use')
      }

      // Execute tools if needed (works for both regular and PTC tool calls)
      if (completeToolUses.length > 0 && stopReason === 'tool_use') {
        // Check if any tools came from PTC (code execution)
        const ptcToolCalls = completeToolUses.filter(
          (t) => 'caller' in t && (t.caller as { type?: string })?.type === 'code_execution_20250825'
        )
        if (ptcToolCalls.length > 0) {
          console.log(`[ai-booking-stream] PTC: ${ptcToolCalls.length} programmatic tool call(s)`)
        }

        await sse.sendEvent('tool_use', {
          tools: completeToolUses.map(t => ({
            name: t.name,
            input: t.input,
            isPTC: 'caller' in t && (t.caller as { type?: string })?.type === 'code_execution_20250825',
          })),
        })

        const { results, vehicles: searchedVehicles, updatedSession } = await executeTools(
          completeToolUses,
          session
        )

        if (searchedVehicles) {
          vehicles = searchedVehicles
          await sse.sendEvent('vehicles', { vehicles })

          // CRITICAL: Rebuild system prompt with vehicles so Claude sees presentation rules
          systemPrompt = buildSystemPrompt({
            session: updatedSession,
            isLoggedIn: !!body.userId,
            isVerified: false,
            vehicles: searchedVehicles,
          })
        }

        session = updatedSession

        claudeMessages.push({ role: 'assistant', content: finalMessage.content })
        claudeMessages.push({ role: 'user', content: results })

        continue
      }

      fullReply = currentText
      continueLoop = false
    }

    // Parse Claude's JSON response to extract the reply and other fields
    const parsed = parseClaudeResponse(fullReply)

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

    // Build booking summary if confirming
    const pricingConfig = await getPricingConfig()
    let summary: BookingSummary | null = null
    if (session.state === BookingState.CONFIRMING && session.vehicleId && vehicles) {
      const selectedVehicle = vehicles.find((v) => v.id === session.vehicleId)
      if (selectedVehicle && session.startDate && session.endDate) {
        summary = buildBookingSummary(session, selectedVehicle, pricingConfig)
      }
    }

    // Risk assessment - use parsed.action or compute from risk assessment
    let action: string | null = parsed.action
    if (!action && session.state === BookingState.CONFIRMING && summary && featureFlags.riskAssessmentEnabled) {
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
      suggestions: getSuggestions(session.state),
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
