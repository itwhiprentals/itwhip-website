// app/api/partner/onboarding/decline/route.ts
// Partner API for recruited hosts to decline a request

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { logProspectActivity, ACTIVITY_TYPES } from '@/app/lib/auth/host-tokens'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Helper to get current host from auth
async function getCurrentHost() {
  const cookieStore = await cookies()
  // Check multiple token sources
  const token = cookieStore.get('partner_token')?.value
    || cookieStore.get('hostAccessToken')?.value
    || cookieStore.get('accessToken')?.value

  if (!token) return null

  try {
    const decoded = verify(token, JWT_SECRET) as { hostId?: string; userId?: string }
    const hostId = decoded.hostId

    if (!hostId) return null

    return await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: {
        convertedFromProspect: {
          include: {
            request: true
          }
        }
      }
    })
  } catch {
    return null
  }
}

// POST /api/partner/onboarding/decline - Decline the request
export async function POST(request: NextRequest) {
  try {
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if this is a recruited host (recruitedVia is source of truth)
    if (!host.recruitedVia) {
      return NextResponse.json(
        { error: 'Not a recruited host' },
        { status: 400 }
      )
    }

    // Check if already declined
    if (host.declinedRequestAt) {
      return NextResponse.json({
        success: true,
        message: 'Request already declined',
        declinedAt: host.declinedRequestAt
      })
    }

    // Check if already completed
    if (host.onboardingCompletedAt) {
      return NextResponse.json(
        { error: 'Cannot decline - onboarding already completed' },
        { status: 400 }
      )
    }

    const prospect = host.convertedFromProspect
    if (!prospect) {
      return NextResponse.json(
        { error: 'No linked prospect found' },
        { status: 404 }
      )
    }

    // Get optional decline reason and deleteAccount flag from body
    const body = await request.json().catch(() => ({}))
    const { reason, deleteAccount } = body

    const now = new Date()

    // If deleteAccount is true, delete the host account completely
    if (deleteAccount) {
      // Log activity before deleting (so we have a record)
      await logProspectActivity(prospect.id, ACTIVITY_TYPES.DECLINED, {
        hostId: host.id,
        requestId: prospect.requestId,
        reason: reason || null,
        accountDeleted: true
      })

      const transactionOps = [
        // Update prospect status first
        prisma.hostProspect.update({
          where: { id: prospect.id },
          data: {
            status: 'DECLINED',
            lastActivityAt: now,
            convertedHostId: null // Unlink the host before deletion
          }
        }),
        // Delete the host account
        prisma.rentalHost.delete({
          where: { id: host.id }
        })
      ]

      // Update request status if exists
      if (prospect.requestId) {
        transactionOps.push(
          prisma.reservationRequest.update({
            where: { id: prospect.requestId },
            data: { status: 'DECLINED' }
          })
        )
      }

      await prisma.$transaction(transactionOps)

      // Clear the auth cookie
      const cookieStore = await cookies()
      cookieStore.delete('partner_token')
      cookieStore.delete('hostAccessToken')
      cookieStore.delete('accessToken')

      return NextResponse.json({
        success: true,
        message: 'Account deleted successfully',
        accountDeleted: true,
        declinedAt: now
      })
    }

    // Otherwise, just decline the booking but keep the account
    const transactionOps = [
      // Update host
      prisma.rentalHost.update({
        where: { id: host.id },
        data: {
          declinedRequestAt: now,
          declineReason: reason || null
        }
      }),
      // Update prospect
      prisma.hostProspect.update({
        where: { id: prospect.id },
        data: {
          status: 'DECLINED',
          lastActivityAt: now
        }
      })
    ]

    // Update request status if exists (ReservationRequest, not FleetRequest)
    if (prospect.requestId) {
      transactionOps.push(
        prisma.reservationRequest.update({
          where: { id: prospect.requestId },
          data: { status: 'DECLINED' }
        })
      )
    }

    await prisma.$transaction(transactionOps)

    // Log activity
    await logProspectActivity(prospect.id, ACTIVITY_TYPES.DECLINED, {
      hostId: host.id,
      requestId: prospect.requestId,
      reason: reason || null,
      accountDeleted: false
    })

    return NextResponse.json({
      success: true,
      message: 'Request declined',
      accountDeleted: false,
      declinedAt: now
    })

  } catch (error: any) {
    console.error('[Partner Onboarding Decline API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to decline request' },
      { status: 500 }
    )
  }
}
