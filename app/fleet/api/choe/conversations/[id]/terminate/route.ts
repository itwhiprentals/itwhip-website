// app/fleet/api/choe/conversations/[id]/terminate/route.ts
// Terminate a Choé AI conversation (admin action)

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { validateFleetKey } from '../../../auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Parse optional reason from body
    let reason = 'Terminated by administrator'
    try {
      const body = await request.json()
      if (body.reason) reason = body.reason
    } catch {
      // No body is fine, use default reason
    }

    // Find the conversation
    const conversation = await prisma.choeAIConversation.findUnique({
      where: { id },
      select: { id: true, sessionId: true, outcome: true, ipAddress: true },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (conversation.outcome === 'BLOCKED') {
      return NextResponse.json({ error: 'Conversation already terminated' }, { status: 400 })
    }

    // Terminate the conversation
    await prisma.choeAIConversation.update({
      where: { id },
      data: {
        outcome: 'BLOCKED',
        completedAt: new Date(),
      },
    })

    // Log security event
    await prisma.choeAISecurityEvent.create({
      data: {
        eventType: 'session_terminated',
        severity: 'CRITICAL',
        ipAddress: conversation.ipAddress,
        sessionId: conversation.sessionId,
        details: { reason, conversationId: id },
        blocked: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Choé Terminate API] Error:', error)
    return NextResponse.json({ error: 'Failed to terminate conversation' }, { status: 500 })
  }
}
