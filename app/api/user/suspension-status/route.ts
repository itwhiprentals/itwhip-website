// app/api/user/suspension-status/route.ts
// API endpoint to check user's suspension status across both host and guest roles
// Used by suspension banners and suspended page

import { NextRequest, NextResponse } from 'next/server'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[Suspension Status] Checking status for user:', user.id)

    // Fetch both host and guest profiles in parallel
    const [hostProfile, guestProfile] = await Promise.all([
      prisma.rentalHost.findFirst({
        where: {
          OR: [
            { userId: user.id },
            { email: user.email }
          ]
        },
        select: {
          approvalStatus: true,
          suspendedAt: true,
          suspendedReason: true,
          suspensionExpiresAt: true
        }
      }),
      prisma.reviewerProfile.findFirst({
        where: {
          OR: [
            { userId: user.id },
            { email: user.email }
          ]
        },
        select: {
          suspensionLevel: true,
          suspendedAt: true,
          suspendedReason: true,
          suspensionExpiresAt: true,
          bannedAt: true,
          banReason: true
        }
      })
    ])

    // Check if host is suspended
    const hostSuspended = hostProfile?.approvalStatus === 'SUSPENDED'

    // Check if guest is suspended (and not expired)
    let guestSuspended = false
    if (guestProfile) {
      // Check if banned (permanent)
      if (guestProfile.bannedAt) {
        guestSuspended = true
      }
      // Check if suspended and not expired
      else if (guestProfile.suspensionLevel && guestProfile.suspendedAt) {
        const now = new Date()
        const isExpired = guestProfile.suspensionExpiresAt &&
                         guestProfile.suspensionExpiresAt < now

        guestSuspended = !isExpired
      }
    }

    // Determine which roles are affected
    const affectedRole = hostSuspended && guestSuspended ? 'both' :
                        hostSuspended ? 'host' :
                        guestSuspended ? 'guest' : null

    // Get suspension details
    const reason = hostProfile?.suspendedReason ||
                  guestProfile?.suspendedReason ||
                  guestProfile?.banReason ||
                  'Policy violation'

    const expiresAt = guestProfile?.suspensionExpiresAt ||
                     hostProfile?.suspensionExpiresAt ||
                     null

    // Build cross-role warning message
    let crossRoleWarning: string | null = null
    if (affectedRole === 'both') {
      crossRoleWarning = 'Both your host and guest accounts are currently suspended.'
    } else if (affectedRole === 'guest' && hostProfile) {
      crossRoleWarning = 'Your guest account is suspended. Your host account remains active, but may have limited functionality.'
    } else if (affectedRole === 'host' && guestProfile) {
      crossRoleWarning = 'Your host account is suspended. Your guest account remains active.'
    }

    console.log('[Suspension Status] Status:', {
      hasSuspension: !!(hostSuspended || guestSuspended),
      affectedRole,
      hostSuspended,
      guestSuspended
    })

    return NextResponse.json({
      hasSuspension: !!(hostSuspended || guestSuspended),
      affectedRole,
      reason,
      expiresAt,
      crossRoleWarning,
      isPermanent: !!guestProfile?.bannedAt,
      details: {
        hostSuspended,
        guestSuspended,
        guestBanned: !!guestProfile?.bannedAt
      }
    })

  } catch (error) {
    console.error('[Suspension Status] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suspension status' },
      { status: 500 }
    )
  }
}
