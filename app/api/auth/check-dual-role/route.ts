// app/api/auth/check-dual-role/route.ts
// MILITARY GRADE: Check if authenticated user has both host and guest profiles
// Aggressively clears stale/mismatched cookies to prevent role confusion

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import {
  decodeToken,
  clearCookie,
  getCurrentModeFromCookie,
  readAuthCookies,
  COOKIE_NAMES,
  type RoleMode
} from '@/app/lib/services/roleService'

export async function GET(request: NextRequest) {
  try {
    // Get ALL auth-related cookies using centralized service
    const cookies = readAuthCookies(request)

    // CRITICAL: Get the current_mode cookie - this is the authoritative source for role detection
    // Set by switch-role API when user explicitly switches between host and guest modes
    const currentModeCookie = getCurrentModeFromCookie(request)

    // Only log when tokens are present (skip noisy unauthenticated requests)

    // MILITARY GRADE: Decode ALL tokens and track their userIds using centralized service
    const hostToken = decodeToken(cookies.hostAccessToken, 'hostAccessToken')
    const partnerTok = decodeToken(cookies.partnerToken, 'partner_token')
    const guestToken = decodeToken(cookies.accessToken, 'accessToken')

    // Collect all valid userIds
    const tokenUserIds: { source: string, userId: string }[] = []
    if (hostToken.valid && hostToken.userId) {
      tokenUserIds.push({ source: 'host', userId: hostToken.userId })
    }
    if (partnerTok.valid && partnerTok.userId) {
      tokenUserIds.push({ source: 'partner', userId: partnerTok.userId })
    }
    if (guestToken.valid && guestToken.userId) {
      tokenUserIds.push({ source: 'guest', userId: guestToken.userId })
    }

    // Track what needs clearing
    const cookiesToClear: string[] = []

    // Clear any expired tokens immediately
    if (hostToken.expired) {
      cookiesToClear.push(COOKIE_NAMES.HOST_ACCESS_TOKEN, COOKIE_NAMES.HOST_REFRESH_TOKEN)
    }
    if (partnerTok.expired) {
      cookiesToClear.push(COOKIE_NAMES.PARTNER_TOKEN)
    }
    if (guestToken.expired) {
      cookiesToClear.push(COOKIE_NAMES.ACCESS_TOKEN, COOKIE_NAMES.REFRESH_TOKEN)
    }

    // If no valid tokens, return unauthorized
    if (tokenUserIds.length === 0) {
      const response = NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
      // Clear all auth cookies on the way out
      clearCookie(response, COOKIE_NAMES.HOST_ACCESS_TOKEN)
      clearCookie(response, COOKIE_NAMES.HOST_REFRESH_TOKEN)
      clearCookie(response, COOKIE_NAMES.PARTNER_TOKEN)
      clearCookie(response, COOKIE_NAMES.ACCESS_TOKEN)
      clearCookie(response, COOKIE_NAMES.REFRESH_TOKEN)
      clearCookie(response, COOKIE_NAMES.CURRENT_MODE)
      return response
    }

    // CRITICAL: Check if all valid tokens belong to the SAME user
    const uniqueUserIds = [...new Set(tokenUserIds.map(t => t.userId))]

    if (uniqueUserIds.length > 1) {
      // 🚨 SECURITY ISSUE: Tokens from DIFFERENT users detected!
      console.error('[Dual-Role Check] 🚨 SECURITY: Multiple userIds in cookies!', {
        tokens: tokenUserIds,
        uniqueUserIds
      })

      // Strategy: Keep the GUEST token (most common case), clear host/partner tokens
      // This prevents partner cookies from hijacking guest sessions
      const guestUserId = guestToken.valid && guestToken.userId ? guestToken.userId : null

      if (guestUserId) {
        // Clear non-guest tokens that don't match
        if (hostToken.userId && hostToken.userId !== guestUserId) {
          cookiesToClear.push(COOKIE_NAMES.HOST_ACCESS_TOKEN, COOKIE_NAMES.HOST_REFRESH_TOKEN)
        }
        if (partnerTok.userId && partnerTok.userId !== guestUserId) {
          cookiesToClear.push(COOKIE_NAMES.PARTNER_TOKEN)
        }
      } else {
        // No guest token, keep host/partner
        const hostUserId = hostToken.userId || partnerTok.userId
        if (guestToken.valid && guestToken.userId && guestToken.userId !== hostUserId) {
          cookiesToClear.push(COOKIE_NAMES.ACCESS_TOKEN, COOKIE_NAMES.REFRESH_TOKEN)
        }
      }
    }

    // Determine the primary userId (after filtering out mismatched tokens)
    const primaryUserId = guestToken.valid && guestToken.userId
      ? guestToken.userId
      : (hostToken.userId || partnerTok.userId)!

    // Determine current role based on cookies and tokens
    // CRITICAL: current_mode cookie is the AUTHORITATIVE source (set by switch-role API)
    let currentRole: RoleMode | null = null

    // Priority 1: Use current_mode cookie if set (explicit user choice from role switcher)
    if (currentModeCookie === 'host' || currentModeCookie === 'guest') {
      currentRole = currentModeCookie
    }
    // Priority 2 (fallback for initial login): Check token content
    // If hostAccessToken is valid, user is in host mode
    else if (hostToken.valid && hostToken.userId === primaryUserId) {
      currentRole = 'host'
    }
    // Priority 3: If partner_token is valid, user is in host mode
    else if (partnerTok.valid && partnerTok.userId === primaryUserId) {
      currentRole = 'host'
    }
    // Priority 4: If accessToken is valid AND is a host token (isRentalHost), user is in host mode
    else if (guestToken.valid && guestToken.userId === primaryUserId && guestToken.isRentalHost) {
      currentRole = 'host'
    }
    // Priority 5: If accessToken is valid and is NOT a host token, user is in guest mode
    else if (guestToken.valid && guestToken.userId === primaryUserId && !guestToken.isRentalHost) {
      currentRole = 'guest'
    }

    // Get user data including legacyDualId
    let user = await prisma.user.findUnique({
      where: { id: primaryUserId },
      select: { id: true, email: true, legacyDualId: true }
    })

    // If user not found, check if primaryUserId is actually a hostId (recruited hosts)
    // This happens when partner_token has hostId but no userId
    if (!user && currentRole === 'host') {
      const hostById = await prisma.rentalHost.findUnique({
        where: { id: primaryUserId },
        select: { id: true, userId: true, email: true, recruitedVia: true, approvalStatus: true }
      })

      if (hostById) {
        // Host exists - if they have a linked User, use that
        if (hostById.userId) {
          user = await prisma.user.findUnique({
            where: { id: hostById.userId },
            select: { id: true, email: true, legacyDualId: true }
          })
        }

        // If still no user, this is a recruited host without a User record
        // That's OK - they can still use the partner dashboard
        if (!user) {
          return NextResponse.json({
            hasBothRoles: false,
            hasHostProfile: true,
            hasGuestProfile: false,
            currentRole: 'host',
            hostApprovalStatus: hostById.approvalStatus || 'PENDING',
            isLinkedAccount: false,
            linkedUserId: null,
            hostProfileIsLinked: false,
            guestProfileIsLinked: false,
            isRecruitedHost: !!hostById.recruitedVia,
            _debug: {
              primaryUserId,
              hostId: hostById.id,
              cookiesCleared: cookiesToClear.length > 0 ? cookiesToClear : 'none'
            }
          })
        }
      }
    }

    if (!user) {
      console.error('[Dual-Role Check] User not found for userId:', primaryUserId)
      // Clear all cookies - user doesn't exist
      const response = NextResponse.json({ error: 'User not found' }, { status: 404 })
      clearCookie(response, COOKIE_NAMES.HOST_ACCESS_TOKEN)
      clearCookie(response, COOKIE_NAMES.HOST_REFRESH_TOKEN)
      clearCookie(response, COOKIE_NAMES.PARTNER_TOKEN)
      clearCookie(response, COOKIE_NAMES.ACCESS_TOKEN)
      clearCookie(response, COOKIE_NAMES.REFRESH_TOKEN)
      clearCookie(response, COOKIE_NAMES.CURRENT_MODE)
      return response
    }

    // SECURITY: STRICT query - only match by userId (no email fallback)
    const [hostProfile, guestProfile] = await Promise.all([
      prisma.rentalHost.findFirst({
        where: { userId: primaryUserId },
        select: {
          id: true,
          approvalStatus: true,
          userId: true,
          email: true
        }
      }),
      prisma.reviewerProfile.findFirst({
        where: { userId: primaryUserId },
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
      const linkedUser = await prisma.user.findFirst({
        where: {
          legacyDualId: user.legacyDualId,
          id: { not: primaryUserId }
        },
        select: { id: true, email: true }
      })

      if (linkedUser) {
        linkedUserId = linkedUser.id

        const [linkedHost, linkedGuest] = await Promise.all([
          prisma.rentalHost.findFirst({
            where: { userId: linkedUser.id },
            select: { id: true, approvalStatus: true, userId: true, email: true }
          }),
          prisma.reviewerProfile.findFirst({
            where: { userId: linkedUser.id },
            select: { id: true, userId: true, email: true, fullyVerified: true }
          })
        ])

        linkedHostProfile = linkedHost
        linkedGuestProfile = linkedGuest
      }
    }

    // User has profile if they have it directly OR via linked account
    const hasHostProfile = !!hostProfile || !!linkedHostProfile
    const hasGuestProfile = !!guestProfile || !!linkedGuestProfile
    const hasBothRoles = hasHostProfile && hasGuestProfile

    // Determine which host profile to use for approval status
    const effectiveHostProfile = hostProfile || linkedHostProfile

    // ADDITIONAL CHECK: If tokens claim a role the user doesn't have, clear them
    if (currentRole === 'host' && !hasHostProfile) {
      cookiesToClear.push(COOKIE_NAMES.HOST_ACCESS_TOKEN, COOKIE_NAMES.HOST_REFRESH_TOKEN, COOKIE_NAMES.PARTNER_TOKEN)
      currentRole = hasGuestProfile ? 'guest' : null
      // Also clear the current_mode cookie since it's invalid
      cookiesToClear.push(COOKIE_NAMES.CURRENT_MODE)
    }
    if (currentRole === 'guest' && !hasGuestProfile) {
      cookiesToClear.push(COOKIE_NAMES.ACCESS_TOKEN, COOKIE_NAMES.REFRESH_TOKEN)
      currentRole = hasHostProfile ? 'host' : null
      // Also clear the current_mode cookie since it's invalid
      cookiesToClear.push(COOKIE_NAMES.CURRENT_MODE)
    }

    // Build response
    const response = NextResponse.json({
      hasBothRoles,
      hasHostProfile,
      hasGuestProfile,
      currentRole,
      hostApprovalStatus: effectiveHostProfile?.approvalStatus || null,
      isLinkedAccount: !!user.legacyDualId,
      linkedUserId,
      hostProfileIsLinked: !hostProfile && !!linkedHostProfile,
      guestProfileIsLinked: !guestProfile && !!linkedGuestProfile,
      // Debug info for troubleshooting
      _debug: {
        primaryUserId,
        cookiesCleared: cookiesToClear.length > 0 ? cookiesToClear : 'none'
      }
    })

    // Clear all flagged cookies
    const uniqueCookiesToClear = [...new Set(cookiesToClear)]
    for (const cookieName of uniqueCookiesToClear) {
      clearCookie(response, cookieName)
    }

    // Only log security-relevant cookie clearing events
    if (uniqueCookiesToClear.length > 0) {
      console.warn('[Dual-Role] Cleared stale cookies:', uniqueCookiesToClear)
    }

    return response

  } catch (error) {
    console.error('[Check Dual Role] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
