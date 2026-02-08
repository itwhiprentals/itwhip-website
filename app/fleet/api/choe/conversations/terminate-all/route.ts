// app/fleet/api/choe/conversations/terminate-all/route.ts
// DEFCON: Terminate all active sessions or selected sessions in bulk

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { validateFleetKey } from '../../auth'

export async function POST(request: NextRequest) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let reason = 'Emergency bulk termination'
    let ids: string[] | null = null

    try {
      const body = await request.json()
      if (body.reason) reason = body.reason
      if (body.ids && Array.isArray(body.ids)) ids = body.ids
    } catch {
      // No body = terminate ALL active
    }

    // Build where clause: specific IDs or all non-completed/non-blocked
    const where = ids
      ? { id: { in: ids }, outcome: { notIn: ['BLOCKED', 'COMPLETED'] } }
      : { OR: [{ outcome: null }, { outcome: { notIn: ['BLOCKED', 'COMPLETED'] } }] }

    // Terminate matching conversations
    const result = await prisma.choeAIConversation.updateMany({
      where,
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
        ipAddress: 'admin',
        details: {
          reason,
          type: ids ? 'bulk_selected' : 'terminate_all',
          count: result.count,
          ids: ids?.slice(0, 20), // Log first 20 IDs
        },
        blocked: true,
      },
    })

    return NextResponse.json({
      success: true,
      terminated: result.count,
    })
  } catch (error) {
    console.error('[Choé Terminate All API] Error:', error)
    return NextResponse.json({ error: 'Failed to terminate sessions' }, { status: 500 })
  }
}
