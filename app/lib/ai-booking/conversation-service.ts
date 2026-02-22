// app/lib/ai-booking/conversation-service.ts
// Database-backed conversation persistence with multi-turn caching support
// Enables conversation resumption and 90% cost savings on cached context

import prisma from '@/app/lib/database/prisma';
import type Anthropic from '@anthropic-ai/sdk';
import {
  BookingSession,
  BookingState,
  VehicleSummary,
  ConversationMode,
} from './types';
import { createInitialSession } from './state-machine';

// =============================================================================
// TYPES
// =============================================================================

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tokensUsed: number;
  toolsUsed: string[] | null;
  vehiclesReturned: number;
  createdAt: Date;
}

export interface LoadedConversation {
  conversationId: string;
  sessionId: string;
  session: BookingSession;
  messages: ConversationMessage[];
  vehicles: VehicleSummary[];
  totalTokens: number;
  estimatedCost: number;
  lastActivityAt: Date;
}

// =============================================================================
// LOAD CONVERSATION
// =============================================================================

/**
 * Load full conversation from database by sessionId
 * Returns session state, all messages, and last vehicles shown
 */
export async function loadConversation(
  sessionId: string
): Promise<LoadedConversation | null> {
  try {
    const conversation = await prisma.choeAIConversation.findUnique({
      where: { sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
            tokensUsed: true,
            toolsUsed: true,
            vehiclesReturned: true,
            createdAt: true,
          },
        },
      },
    });

    if (!conversation) return null;

    // Reconstruct session from conversation record
    const session: BookingSession = {
      sessionId: conversation.sessionId,
      state: conversation.state as BookingState,
      messages: conversation.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: m.createdAt.getTime(),
      })),
      location: conversation.location ?? null,
      locationId: null,
      startDate: conversation.startDate ?? null,
      endDate: conversation.endDate ?? null,
      startTime: conversation.startTime ?? null,
      endTime: conversation.endTime ?? null,
      vehicleId: conversation.vehicleId ?? null,
      vehicleType: conversation.vehicleType ?? null,
      verifiedEmail: conversation.verifiedEmail ?? null,
      verifiedAt: conversation.verifiedAt ? conversation.verifiedAt.getTime() : null,
      mode: ConversationMode.GENERAL,
    };

    // Parse last assistant message for vehicles (if any were shown)
    // The vehicles are stored via tool results in message content
    let vehicles: VehicleSummary[] = [];

    // Find the last message that had vehicles returned
    const lastVehicleMessage = [...conversation.messages]
      .reverse()
      .find((m) => m.vehiclesReturned > 0);

    if (lastVehicleMessage) {
      // Vehicles would be in a tool_result message content
      // For now, frontend will re-request if needed
      // TODO: Store vehicles in separate table if persistence needed
    }

    return {
      conversationId: conversation.id,
      sessionId: conversation.sessionId,
      session,
      messages: conversation.messages.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        tokensUsed: m.tokensUsed,
        toolsUsed: m.toolsUsed as string[] | null,
        vehiclesReturned: m.vehiclesReturned,
        createdAt: m.createdAt,
      })),
      vehicles,
      totalTokens: conversation.totalTokens,
      estimatedCost: Number(conversation.estimatedCost),
      lastActivityAt: conversation.lastActivityAt,
    };
  } catch (error) {
    console.error('[conversation-service] Failed to load conversation:', error);
    return null;
  }
}

// =============================================================================
// SAVE MESSAGE
// =============================================================================

/**
 * Save a message to the conversation (with single retry for transient DB issues)
 */
export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  tokensUsed: number = 0,
  responseTimeMs?: number,
  toolsUsed: string[] = [],
  vehiclesReturned: number = 0
): Promise<string | null> {
  if (conversationId.startsWith('temp-')) return null;

  const data = {
    conversationId,
    role,
    content,
    tokensUsed,
    responseTimeMs: responseTimeMs || null,
    searchPerformed: toolsUsed.includes('search_vehicles'),
    vehiclesReturned,
    toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
  };

  // Attempt 1
  try {
    const message = await prisma.choeAIMessage.create({ data });
    return message.id;
  } catch (error) {
    console.warn('[conversation-service] Message save failed, retrying in 500ms:', error);
  }

  // Retry after 500ms (handles transient Neon connection issues)
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const message = await prisma.choeAIMessage.create({ data });
    return message.id;
  } catch (error) {
    console.error('[conversation-service] Message save failed after retry:', error);
    return null;
  }
}

// =============================================================================
// CREATE/UPDATE CONVERSATION
// =============================================================================

/**
 * Create or update conversation record
 */
export async function upsertConversation(
  session: BookingSession,
  userId?: string | null,
  visitorId?: string | null,
  ipAddress: string = '127.0.0.1'
): Promise<string> {
  try {
    const existing = await prisma.choeAIConversation.findUnique({
      where: { sessionId: session.sessionId },
    });

    if (existing) {
      const actualMessageCount = await prisma.choeAIMessage.count({
        where: { conversationId: existing.id },
      });
      await prisma.choeAIConversation.update({
        where: { sessionId: session.sessionId },
        data: {
          state: session.state,
          location: session.location,
          vehicleType: session.vehicleType,
          vehicleId: session.vehicleId,
          startDate: session.startDate,
          endDate: session.endDate,
          startTime: session.startTime,
          endTime: session.endTime,
          lastActivityAt: new Date(),
          messageCount: actualMessageCount,
        },
      });
      return existing.id;
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
      },
    });

    return conversation.id;
  } catch (error) {
    console.error('[conversation-service] Failed to upsert conversation:', error);
    return `temp-${session.sessionId}`;
  }
}

/**
 * Update conversation stats after API call
 * Uses actual DB message count instead of in-memory count to stay consistent
 */
export async function updateConversationStats(
  conversationId: string,
  session: BookingSession,
  totalTokens: number,
  estimatedCost: number
): Promise<void> {
  if (conversationId.startsWith('temp-')) return;

  try {
    // Count actual saved messages instead of trusting in-memory count
    const actualMessageCount = await prisma.choeAIMessage.count({
      where: { conversationId },
    });

    let outcome: string | null = null;
    if (session.state === BookingState.READY_FOR_PAYMENT) {
      outcome = 'COMPLETED';
    }

    await prisma.choeAIConversation.update({
      where: { id: conversationId },
      data: {
        state: session.state,
        messageCount: actualMessageCount,
        location: session.location,
        vehicleType: session.vehicleType,
        vehicleId: session.vehicleId,
        startDate: session.startDate,
        endDate: session.endDate,
        startTime: session.startTime,
        endTime: session.endTime,
        totalTokens: { increment: totalTokens },
        estimatedCost: { increment: estimatedCost },
        lastActivityAt: new Date(),
        ...(outcome && { outcome }),
      },
    });
  } catch (error) {
    console.error('[conversation-service] Failed to update stats:', error);
  }
}

// =============================================================================
// MULTI-TURN CACHING HELPER
// =============================================================================

/**
 * Add cache_control to conversation messages for multi-turn caching
 *
 * Strategy: Cache the second-to-last user message so the conversation prefix is cached
 * This saves ~90% on tokens for repeated conversation context
 *
 * See: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
 */
export function addCacheControlToMessages(
  messages: Anthropic.MessageParam[]
): Anthropic.MessageParam[] {
  // Need at least 4 messages for caching to be beneficial (2 user + 2 assistant turns)
  if (messages.length < 4) return messages;

  // Find the second-to-last user message
  let userMessageCount = 0;
  let targetIndex = -1;

  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      userMessageCount++;
      if (userMessageCount === 2) {
        targetIndex = i;
        break;
      }
    }
  }

  if (targetIndex === -1) return messages;

  // Add cache_control to the target message
  // Content must be array of blocks for cache_control to work
  return messages.map((m, i) => {
    if (i === targetIndex) {
      const content = m.content;
      const textContent = typeof content === 'string' ? content :
        Array.isArray(content) ? content.filter((c): c is Anthropic.TextBlockParam => c.type === 'text').map(c => c.text).join('\n') : '';

      return {
        role: m.role,
        content: [
          {
            type: 'text' as const,
            text: textContent,
            cache_control: { type: 'ephemeral' as const },
          },
        ],
      };
    }
    return m;
  });
}

// =============================================================================
// CONVERT DB MESSAGES TO CLAUDE FORMAT
// =============================================================================

/**
 * Convert database messages to Claude API format with caching
 */
export function buildClaudeMessages(
  messages: ConversationMessage[]
): Anthropic.MessageParam[] {
  const claudeMessages: Anthropic.MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // Add cache control for multi-turn caching
  return addCacheControlToMessages(claudeMessages);
}

// =============================================================================
// RESUME SESSION
// =============================================================================

/**
 * Resume a conversation by sessionId
 * Returns session ready to continue, or creates new if not found
 */
export async function resumeOrCreateSession(
  sessionId?: string
): Promise<{ session: BookingSession; conversationId: string | null; isNew: boolean }> {
  if (sessionId) {
    const loaded = await loadConversation(sessionId);
    if (loaded) {
      return {
        session: loaded.session,
        conversationId: loaded.conversationId,
        isNew: false,
      };
    }
  }

  // Create new session
  const session = createInitialSession();
  return {
    session,
    conversationId: null,
    isNew: true,
  };
}
