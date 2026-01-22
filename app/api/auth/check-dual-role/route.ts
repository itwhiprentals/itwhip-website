// app/api/auth/check-dual-role/route.ts
// MILITARY GRADE: Check if authenticated user has both host and guest profiles
// Aggressively clears stale/mismatched cookies to prevent role confusion

import { NextRequest, NextResponse } from 'next/server'
import { verify, JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

interface DecodedToken {
  userId: string
  email?: string
  hostId?: string
  [key: string]: unknown
}

// Helper to safely decode a token
function safeDecodeToken(token: string | undefined, name: string): { userId: string | null, valid: boolean, expired: boolean } {
  if (!token || token.length < 10) {
    return { userId: null, valid: false, expired: false }
  }

  try {
    const decoded = verify(token, JWT_SECRET) as DecodedToken
    // Partner tokens use hostId, guest tokens use userId
    const userId = decoded.userId || decoded.hostId || null
    return { userId, valid: true, expired: false }
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return { userId: null, valid: false, expired: true }
    }
    if (err instanceof JsonWebTokenError) {
      console.log(`[Dual-Role Check] ${name} JWT invalid:`, err.message)
    }
    return { userId: null, valid: false, expired: false }
  }
}

// Helper to clear a cookie properly (maxAge: 0 is more reliable than delete)
function clearCookie(response: NextResponse, name: string) {
  response.cookies.set(name, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })
}

export async function GET(request: NextRequest) {
  try {
    // Get ALL auth-related tokens
    const hostAccessToken = request.cookies.get('hostAccessToken')?.value
    const hostRefreshToken = request.cookies.get('hostRefreshToken')?.value
    const partnerToken = request.cookies.get('partner_token')?.value
    const guestAccessToken = request.cookies.get('accessToken')?.value
    const guestRefreshToken = request.cookies.get('refreshToken')?.value

    // Debug log
    console.log('[Dual-Role Check] Cookie debug:', {
      hostAccessToken: hostAccessToken ? `${hostAccessToken.substring(0, 30)}... (${hostAccessToken.length} chars)` : 'EMPTY',
      partnerToken: partnerToken ? `${partnerToken.substring(0, 30)}... (${partnerToken.length} chars)` : 'EMPTY',
      guestAccessToken: guestAccessToken ? `${guestAccessToken.substring(0, 30)}... (${guestAccessToken.length} chars)` : 'EMPTY'
    })

    // MILITARY GRADE: Decode ALL tokens and track their userIds
    const hostToken = safeDecodeToken(hostAccessToken, 'hostAccessToken')
    const partnerTok = safeDecodeToken(partnerToken, 'partner_token')
    const guestToken = safeDecodeToken(guestAccessToken, 'accessToken')

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
      cookiesToClear.push('hostAccessToken', 'hostRefreshToken')
      console.log('[Dual-Role Check] 🧹 Clearing expired hostAccessToken')
    }
    if (partnerTok.expired) {
      cookiesToClear.push('partner_token')
      console.log('[Dual-Role Check] 🧹 Clearing expired partner_token')
    }
    if (guestToken.expired) {
      cookiesToClear.push('accessToken', 'refreshToken')
      console.log('[Dual-Role Check] 🧹 Clearing expired accessToken')
    }

    // If no valid tokens, return unauthorized
    if (tokenUserIds.length === 0) {
      const response = NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
      // Clear all auth cookies on the way out
      clearCookie(response, 'hostAccessToken')
      clearCookie(response, 'hostRefreshToken')
      clearCookie(response, 'partner_token')
      clearCookie(response, 'accessToken')
      clearCookie(response, 'refreshToken')
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
          cookiesToClear.push('hostAccessToken', 'hostRefreshToken')
          console.log('[Dual-Role Check] 🧹 Clearing mismatched hostAccessToken (different user)')
        }
        if (partnerTok.userId && partnerTok.userId !== guestUserId) {
          cookiesToClear.push('partner_token')
          console.log('[Dual-Role Check] 🧹 Clearing mismatched partner_token (different user)')
        }
      } else {
        // No guest token, keep host/partner
        const hostUserId = hostToken.userId || partnerTok.userId
        if (guestToken.valid && guestToken.userId && guestToken.userId !== hostUserId) {
          cookiesToClear.push('accessToken', 'refreshToken')
          console.log('[Dual-Role Check] 🧹 Clearing mismatched accessToken (different user)')
        }
      }
    }

    // Determine the primary userId (after filtering out mismatched tokens)
    const primaryUserId = guestToken.valid && guestToken.userId
      ? guestToken.userId
      : (hostToken.userId || partnerTok.userId)!

    // Determine current role based on which valid token we're using
    let currentRole: 'host' | 'guest' | null = null
    if (guestToken.valid && guestToken.userId === primaryUserId) {
      currentRole = 'guest'
    } else if ((hostToken.valid && hostToken.userId === primaryUserId) ||
               (partnerTok.valid && partnerTok.userId === primaryUserId)) {
      currentRole = 'host'
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
          console.log('[Dual-Role Check] Recruited host without User record, allowing access')
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
      clearCookie(response, 'hostAccessToken')
      clearCookie(response, 'hostRefreshToken')
      clearCookie(response, 'partner_token')
      clearCookie(response, 'accessToken')
      clearCookie(response, 'refreshToken')
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
        console.log(`[Dual-Role Check] Found linked user: ${linkedUser.email}`)

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
      console.log('[Dual-Role Check] 🧹 User has host tokens but NO host profile - clearing host cookies')
      cookiesToClear.push('hostAccessToken', 'hostRefreshToken', 'partner_token')
      currentRole = hasGuestProfile ? 'guest' : null
    }
    if (currentRole === 'guest' && !hasGuestProfile) {
      console.log('[Dual-Role Check] 🧹 User has guest tokens but NO guest profile - clearing guest cookies')
      cookiesToClear.push('accessToken', 'refreshToken')
      currentRole = hasHostProfile ? 'host' : null
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

    if (uniqueCookiesToClear.length > 0) {
      console.log('[Dual-Role Check] ✅ Cleared stale cookies:', uniqueCookiesToClear)
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
