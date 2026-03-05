// app/api/partner/onboarding/decline/route.ts
// Partner API for recruited hosts to decline a request
// Two paths: deleteAccount=true (full removal) or false (keep account, decline booking)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { logProspectActivity, ACTIVITY_TYPES } from '@/app/lib/auth/host-tokens'

const JWT_SECRET = process.env.JWT_SECRET!

// Helper to get current host from auth
async function getCurrentHost() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value
    || cookieStore.get('hostAccessToken')?.value
    || cookieStore.get('accessToken')?.value

  if (!token) return null

  try {
    const decoded = verify(token, JWT_SECRET) as { hostId?: string }
    const hostId = decoded.hostId
    if (!hostId) return null

    return await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: {
        convertedFromProspect: {
          include: {
            request: {
              include: {
                claims: {
                  where: { status: { in: ['PENDING_CAR', 'CAR_SELECTED'] } },
                  select: { id: true, hostId: true, status: true }
                }
              }
            }
          }
        }
      }
    })
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!host.recruitedVia) {
      return NextResponse.json({ error: 'Not a recruited host' }, { status: 400 })
    }

    if (host.declinedRequestAt) {
      return NextResponse.json({
        success: true,
        message: 'Request already declined',
        declinedAt: host.declinedRequestAt
      })
    }

    if (host.onboardingCompletedAt) {
      return NextResponse.json(
        { error: 'Cannot decline - onboarding already completed' },
        { status: 400 }
      )
    }

    const prospect = host.convertedFromProspect
    if (!prospect) {
      return NextResponse.json({ error: 'No linked prospect found' }, { status: 404 })
    }

    const body = await request.json().catch(() => ({}))
    const { reason, deleteAccount } = body
    const now = new Date()

    // Find this host's active claim on the request
    const hostClaim = prospect.request?.claims?.find(c => c.hostId === host.id)

    if (deleteAccount) {
      // === PATH 1: Delete account completely ===

      // Log activity before deleting
      await logProspectActivity(prospect.id, ACTIVITY_TYPES.DECLINED, {
        hostId: host.id,
        requestId: prospect.requestId,
        reason: reason || null,
        accountDeleted: true
      })

      const ops: Parameters<typeof prisma.$transaction>[0] = []

      // Withdraw the host's claim if one exists
      if (hostClaim) {
        ops.push(
          prisma.requestClaim.update({
            where: { id: hostClaim.id },
            data: { status: 'WITHDRAWN', expiredAt: now }
          })
        )
      }

      // Update prospect — unlink host before deletion
      ops.push(
        prisma.hostProspect.update({
          where: { id: prospect.id },
          data: {
            status: 'DECLINED',
            lastActivityAt: now,
            convertedHostId: null
          }
        })
      )

      // Delete the host account
      ops.push(
        prisma.rentalHost.delete({
          where: { id: host.id }
        })
      )

      // Update request status — check if other active claims exist
      if (prospect.requestId) {
        const otherActiveClaims = prospect.request?.claims?.filter(c => c.hostId !== host.id) || []
        if (otherActiveClaims.length === 0) {
          ops.push(
            prisma.reservationRequest.update({
              where: { id: prospect.requestId },
              data: { status: 'DECLINED' }
            })
          )
        }
      }

      await prisma.$transaction(ops)

      // Clear auth cookies
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

    // === PATH 2: Keep account, decline booking only ===

    const ops: Parameters<typeof prisma.$transaction>[0] = []

    // Update host with decline info
    ops.push(
      prisma.rentalHost.update({
        where: { id: host.id },
        data: {
          declinedRequestAt: now,
          declineReason: reason || null
        }
      })
    )

    // Withdraw the host's claim if one exists
    if (hostClaim) {
      ops.push(
        prisma.requestClaim.update({
          where: { id: hostClaim.id },
          data: { status: 'WITHDRAWN', expiredAt: now }
        })
      )
    }

    // Update prospect status
    ops.push(
      prisma.hostProspect.update({
        where: { id: prospect.id },
        data: {
          status: 'DECLINED',
          lastActivityAt: now
        }
      })
    )

    // Update request status — only if no other active claims
    if (prospect.requestId) {
      const otherActiveClaims = prospect.request?.claims?.filter(c => c.hostId !== host.id) || []
      if (otherActiveClaims.length === 0) {
        ops.push(
          prisma.reservationRequest.update({
            where: { id: prospect.requestId },
            data: { status: 'DECLINED' }
          })
        )
      }
    }

    await prisma.$transaction(ops)

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

  } catch (error) {
    console.error('[Partner Onboarding Decline API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to decline request' },
      { status: 500 }
    )
  }
}
