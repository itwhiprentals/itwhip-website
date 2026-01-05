// app/api/fleet-manager/invitations/stats/route.ts
// GET /api/fleet-manager/invitations/stats - Get invitation statistics for fleet managers

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'

export interface InvitationStats {
  sent: {
    total: number
    pending: number
    accepted: number
    declined: number
    expired: number
    counterOffered: number
  }
  received: {
    total: number
    pending: number
    accepted: number
    declined: number
    expired: number
    counterOffered: number
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Get host profile
    const hostProfile = await prisma.rentalHost.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { email: user.email }
        ]
      },
      select: {
        id: true,
        isHostManager: true
      }
    })

    if (!hostProfile) {
      return NextResponse.json(
        { error: 'Host profile not found' },
        { status: 404 }
      )
    }

    // Get sent invitations stats (where current user is sender)
    const sentInvitations = await prisma.managementInvitation.groupBy({
      by: ['status'],
      where: {
        senderId: hostProfile.id
      },
      _count: {
        status: true
      }
    })

    // Get received invitations stats (where current user is recipient by email or ID)
    const receivedInvitations = await prisma.managementInvitation.groupBy({
      by: ['status'],
      where: {
        OR: [
          { recipientId: hostProfile.id },
          { recipientEmail: user.email }
        ]
      },
      _count: {
        status: true
      }
    })

    // Build stats object
    const stats: InvitationStats = {
      sent: {
        total: 0,
        pending: 0,
        accepted: 0,
        declined: 0,
        expired: 0,
        counterOffered: 0
      },
      received: {
        total: 0,
        pending: 0,
        accepted: 0,
        declined: 0,
        expired: 0,
        counterOffered: 0
      }
    }

    // Map sent invitations
    sentInvitations.forEach(inv => {
      const count = inv._count.status
      stats.sent.total += count
      switch (inv.status) {
        case 'PENDING':
          stats.sent.pending = count
          break
        case 'ACCEPTED':
          stats.sent.accepted = count
          break
        case 'DECLINED':
          stats.sent.declined = count
          break
        case 'EXPIRED':
          stats.sent.expired = count
          break
        case 'COUNTER_OFFERED':
          stats.sent.counterOffered = count
          break
      }
    })

    // Map received invitations
    receivedInvitations.forEach(inv => {
      const count = inv._count.status
      stats.received.total += count
      switch (inv.status) {
        case 'PENDING':
          stats.received.pending = count
          break
        case 'ACCEPTED':
          stats.received.accepted = count
          break
        case 'DECLINED':
          stats.received.declined = count
          break
        case 'EXPIRED':
          stats.received.expired = count
          break
        case 'COUNTER_OFFERED':
          stats.received.counterOffered = count
          break
      }
    })

    return NextResponse.json({
      success: true,
      stats,
      isHostManager: hostProfile.isHostManager || false
    })

  } catch (error) {
    console.error('[Invitation Stats] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitation stats' },
      { status: 500 }
    )
  }
}
