// app/fleet/api/choe/conversations/[id]/route.ts
// Choé AI Single Conversation API - Get conversation with full message history

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { validateFleetKey } from '../../auth'

// =============================================================================
// GET - Get Single Conversation with Messages
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch conversation with messages
    const conversation = await prisma.choeAIConversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
            tokensUsed: true,
            responseTimeMs: true,
            searchPerformed: true,
            vehiclesReturned: true,
            createdAt: true,
          }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Build timeline from messages and state changes
    const timeline = buildTimeline(conversation)

    // Transform for response
    const data = {
      ...conversation,
      estimatedCost: Number(conversation.estimatedCost),
      bookingValue: conversation.bookingValue ? Number(conversation.bookingValue) : null,
      startedAt: conversation.startedAt.toISOString(),
      lastActivityAt: conversation.lastActivityAt.toISOString(),
      completedAt: conversation.completedAt?.toISOString() || null,
      authPromptedAt: conversation.authPromptedAt?.toISOString() || null,
      convertedAt: conversation.convertedAt?.toISOString() || null,
      duration: conversation.completedAt
        ? Math.round((conversation.completedAt.getTime() - conversation.startedAt.getTime()) / 1000)
        : Math.round((conversation.lastActivityAt.getTime() - conversation.startedAt.getTime()) / 1000),
      messages: conversation.messages.map(msg => ({
        ...msg,
        createdAt: msg.createdAt.toISOString(),
      })),
      timeline,
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('[Choé Conversation Detail API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    )
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

interface ConversationWithMessages {
  startedAt: Date
  lastActivityAt: Date
  completedAt: Date | null
  authPromptedAt: Date | null
  convertedAt: Date | null
  state: string
  outcome: string | null
  bookingId: string | null
  location: string | null
  messages: {
    createdAt: Date
    role: string
    searchPerformed: boolean
    vehiclesReturned: number
  }[]
}

function buildTimeline(conversation: ConversationWithMessages) {
  const events: { timestamp: string; event: string; details?: string }[] = []

  // Conversation started
  events.push({
    timestamp: conversation.startedAt.toISOString(),
    event: 'Conversation Started',
  })

  // Track searches from messages
  for (const msg of conversation.messages) {
    if (msg.searchPerformed && msg.vehiclesReturned > 0) {
      events.push({
        timestamp: msg.createdAt.toISOString(),
        event: 'Vehicle Search',
        details: `Found ${msg.vehiclesReturned} vehicles`,
      })
    }
  }

  // Location set
  if (conversation.location) {
    events.push({
      timestamp: conversation.messages[0]?.createdAt.toISOString() || conversation.startedAt.toISOString(),
      event: 'Location Set',
      details: conversation.location,
    })
  }

  // Auth prompted
  if (conversation.authPromptedAt) {
    events.push({
      timestamp: conversation.authPromptedAt.toISOString(),
      event: 'Auth Prompted',
      details: 'User shown login prompt',
    })
  }

  // Converted
  if (conversation.convertedAt) {
    events.push({
      timestamp: conversation.convertedAt.toISOString(),
      event: 'User Converted',
      details: 'Anonymous user signed up',
    })
  }

  // Booking created
  if (conversation.bookingId) {
    events.push({
      timestamp: conversation.completedAt?.toISOString() || conversation.lastActivityAt.toISOString(),
      event: 'Booking Created',
      details: `Booking ID: ${conversation.bookingId}`,
    })
  }

  // Final state
  if (conversation.outcome) {
    events.push({
      timestamp: conversation.completedAt?.toISOString() || conversation.lastActivityAt.toISOString(),
      event: `Conversation ${conversation.outcome.charAt(0) + conversation.outcome.slice(1).toLowerCase()}`,
    })
  }

  // Sort by timestamp
  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  return events
}
