// app/api/auth/check-dual-role/route.ts
// API endpoint to check if authenticated user has both host and guest profiles
// Also checks linked accounts via legacyDualId

import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export async function GET(request: NextRequest) {
  try {
    // Get tokens from cookies - check both host and guest tokens
    const hostAccessToken = request.cookies.get('hostAccessToken')?.value
    const guestAccessToken = request.cookies.get('accessToken')?.value

    // Try to get userId from either token
    let userId: string | null = null
    let currentRole: 'host' | 'guest' | null = null

    // Try host token first
    if (hostAccessToken) {
      try {
        const decoded = verify(hostAccessToken, JWT_SECRET) as any
        userId = decoded.userId
        currentRole = 'host'
      } catch (err) {
        // Token invalid or expired, try guest token
      }
    }

    // Try guest token if no userId yet
    if (!userId && guestAccessToken) {
      try {
        const decoded = verify(guestAccessToken, JWT_SECRET) as any
        userId = decoded.userId
        currentRole = 'guest'
      } catch (err) {
        // Token invalid or expired
      }
    }

    // If no valid token, return unauthorized
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user data including legacyDualId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, legacyDualId: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // SECURITY: STRICT query - only match by userId (no email fallback)
    const [hostProfile, guestProfile] = await Promise.all([
      prisma.rentalHost.findFirst({
        where: { userId: userId },  // Only match by userId for security
        select: {
          id: true,
          approvalStatus: true,
          userId: true,
          email: true
          // fullyVerified removed - only exists on ReviewerProfile, not RentalHost
        }
      }),
      prisma.reviewerProfile.findFirst({
        where: { userId: userId },  // Only match by userId for security
        select: {
          id: true,
          userId: true,
          email: true,
          fullyVerified: true
        }
      })
    ])

    // Check for linked accounts via legacyDualId
    let linkedHostProfile = null
    let linkedGuestProfile = null
    let linkedUserId: string | null = null

    if (user.legacyDualId) {
      // Find the linked user (different user with same legacyDualId)
      const linkedUser = await prisma.user.findFirst({
        where: {
          legacyDualId: user.legacyDualId,
          id: { not: userId }
        },
        select: { id: true, email: true }
      })

      if (linkedUser) {
        linkedUserId = linkedUser.id
        console.log(`[Dual-Role Check] Found linked user: ${linkedUser.email} (${linkedUser.id})`)

        // Check linked user's profiles
        const [linkedHost, linkedGuest] = await Promise.all([
          prisma.rentalHost.findFirst({
            where: { userId: linkedUser.id },
            select: {
              id: true,
              approvalStatus: true,
              userId: true,
              email: true
            }
          }),
          prisma.reviewerProfile.findFirst({
            where: { userId: linkedUser.id },
            select: {
              id: true,
              userId: true,
              email: true,
              fullyVerified: true
            }
          })
        ])

        linkedHostProfile = linkedHost
        linkedGuestProfile = linkedGuest
      }
    }

    // Log if profiles exist with mismatched userId (data integrity issue)
    if (hostProfile && hostProfile.userId !== userId) {
      console.error('[Dual-Role Check] ⚠️ Host profile userId mismatch', {
        authenticatedUserId: userId,
        hostProfileUserId: hostProfile.userId,
        email: user.email
      })
    }

    if (guestProfile && guestProfile.userId !== userId) {
      console.error('[Dual-Role Check] ⚠️ Guest profile userId mismatch', {
        authenticatedUserId: userId,
        guestProfileUserId: guestProfile.userId,
        email: user.email
      })
    }

    // User has profile if they have it directly OR via linked account
    const hasHostProfile = !!hostProfile || !!linkedHostProfile
    const hasGuestProfile = !!guestProfile || !!linkedGuestProfile
    const hasBothRoles = hasHostProfile && hasGuestProfile

    // Determine which host profile to use for approval status
    const effectiveHostProfile = hostProfile || linkedHostProfile

    return NextResponse.json({
      hasBothRoles,
      hasHostProfile,
      hasGuestProfile,
      currentRole,
      hostApprovalStatus: effectiveHostProfile?.approvalStatus || null,
      // Include linked account info for role switching
      isLinkedAccount: !!user.legacyDualId,
      linkedUserId: linkedUserId,
      // Indicate which profiles are from linked account
      hostProfileIsLinked: !hostProfile && !!linkedHostProfile,
      guestProfileIsLinked: !guestProfile && !!linkedGuestProfile
    })

  } catch (error) {
    console.error('[Check Dual Role] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
