// app/api/auth/switch-role/route.ts
// API endpoint to switch between host and guest modes for dual-role users
// Supports switching to linked accounts via legacyDualId

import { NextRequest, NextResponse } from 'next/server'
import { sign } from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { prisma } from '@/app/lib/database/prisma'
import { decodeToken, readAuthCookies } from '@/app/lib/services/roleService'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'

// Helper to generate HOST JWT tokens (same as oauth-redirect)
function generateHostTokens(host: {
  id: string
  userId: string
  email: string
  name: string
  approvalStatus: string
  legacyDualId?: string | null
}) {
  const accessToken = sign(
    {
      userId: host.userId,
      hostId: host.id,
      email: host.email,
      name: host.name,
      role: 'BUSINESS',
      isRentalHost: true,
      approvalStatus: host.approvalStatus,
      legacyDualId: host.legacyDualId || null  // Include for dual-role account linking
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  )

  const refreshToken = sign(
    {
      userId: host.userId,
      hostId: host.id,
      email: host.email,
      type: 'refresh',
      legacyDualId: host.legacyDualId || null
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

// Helper to generate GUEST JWT tokens (same as oauth-redirect)
function generateGuestTokens(user: {
  id: string
  email: string
  name: string | null
  role: string
  legacyDualId?: string | null
}) {
  const tokenId = nanoid()
  const refreshTokenId = nanoid()

  const accessToken = sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      jti: tokenId,
      legacyDualId: user.legacyDualId || null  // Include for dual-role account linking
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  )

  const refreshToken = sign(
    {
      userId: user.id,
      jti: refreshTokenId,
      legacyDualId: user.legacyDualId || null
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { targetRole } = body

    // Validate targetRole
    if (!targetRole || (targetRole !== 'host' && targetRole !== 'guest')) {
      return NextResponse.json(
        { error: 'Invalid target role. Must be "host" or "guest".' },
        { status: 400 }
      )
    }

    // Get current user ID from either token using centralized decodeToken
    // This tries BOTH JWT_SECRET and GUEST_JWT_SECRET for compatibility
    const cookies = readAuthCookies(request)

    const hostToken = decodeToken(cookies.hostAccessToken, 'hostAccessToken')
    const partnerToken = decodeToken(cookies.partnerToken, 'partner_token')
    const guestToken = decodeToken(cookies.accessToken, 'accessToken')

    let userId: string | null = null

    // Try host tokens first
    if (hostToken.valid && hostToken.userId) {
      userId = hostToken.userId
      console.log('[Role Switch] Using hostAccessToken userId:', userId)
    }

    // Try partner token
    if (!userId && partnerToken.valid && partnerToken.userId) {
      userId = partnerToken.userId
      console.log('[Role Switch] Using partner_token userId:', userId)
    }

    // Try guest token
    if (!userId && guestToken.valid && guestToken.userId) {
      userId = guestToken.userId
      console.log('[Role Switch] Using accessToken userId:', userId)
    }

    if (!userId) {
      console.error('[Role Switch] No valid token found in cookies:', {
        hostToken: hostToken.valid ? 'valid' : (hostToken.expired ? 'expired' : 'invalid'),
        partnerToken: partnerToken.valid ? 'valid' : (partnerToken.expired ? 'expired' : 'invalid'),
        guestToken: guestToken.valid ? 'valid' : (guestToken.expired ? 'expired' : 'invalid')
      })
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        legacyDualId: true  // For dual-role account linking
      }
    })

    if (!user || !user.email) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has the target profile
    if (targetRole === 'host') {
      // SECURITY: STRICT query - only match by userId (no email fallback)
      let hostProfile = await prisma.rentalHost.findFirst({
        where: { userId: userId },  // Only match by userId for security
        select: {
          id: true,
          approvalStatus: true,
          userId: true,
          email: true,
          name: true,
          legacyDualId: true  // For dual-role account linking validation
        }
      })

      // If no host profile on current user, check linked account
      let switchingToLinkedUser = false
      let linkedUser: { id: string; email: string; name: string | null; role: string; legacyDualId: string | null } | null = null

      if (!hostProfile && user.legacyDualId) {
        // Find linked user
        linkedUser = await prisma.user.findFirst({
          where: {
            legacyDualId: user.legacyDualId,
            id: { not: userId }
          },
          select: { id: true, email: true, name: true, role: true, legacyDualId: true }
        })

        if (linkedUser) {
          // Check if linked user has host profile
          hostProfile = await prisma.rentalHost.findFirst({
            where: { userId: linkedUser.id },
            select: {
              id: true,
              approvalStatus: true,
              userId: true,
              email: true,
              name: true,
              legacyDualId: true
            }
          })

          if (hostProfile) {
            switchingToLinkedUser = true
            console.log(`[Role Switch] Switching to linked user's host profile: ${linkedUser.email}`)
          }
        }
      }

      if (!hostProfile) {
        console.error('[Role Switch] ❌ SECURITY: No host profile with matching userId or linked account', {
          userId: userId,
          email: user.email
        })
        return NextResponse.json(
          { error: 'Host profile not found or not linked to your account' },
          { status: 404 }
        )
      }

      // CRITICAL VALIDATION: Verify userId matches authenticated user or linked user
      const expectedUserId = switchingToLinkedUser ? linkedUser!.id : userId
      if (hostProfile.userId && hostProfile.userId !== expectedUserId) {
        console.error('[Role Switch] 🚨 SECURITY BREACH: userId mismatch!', {
          authenticatedUserId: userId,
          expectedUserId: expectedUserId,
          profileUserId: hostProfile.userId,
          email: user.email
        })
        return NextResponse.json(
          { error: 'Account security issue detected. Contact support.' },
          { status: 403 }
        )
      }

      // DUAL-ROLE VALIDATION: If switching to linked user, verify legacyDualId matches
      if (switchingToLinkedUser && linkedUser) {
        if (user.legacyDualId !== linkedUser.legacyDualId) {
          console.error('[Role Switch] 🚨 SECURITY BREACH: legacyDualId mismatch!', {
            userLegacyDualId: user.legacyDualId,
            linkedUserLegacyDualId: linkedUser.legacyDualId,
            userId: userId
          })
          return NextResponse.json(
            { error: 'Accounts are not linked. Please link your accounts first.' },
            { status: 403 }
          )
        }
        console.log('[Role Switch] ✅ Legacy dual ID validation passed:', user.legacyDualId)
      }

      // Determine which user ID to use for tokens
      const tokenUserId = switchingToLinkedUser ? linkedUser!.id : userId

      console.log('[Role Switch] Switched to host mode for user:', tokenUserId, switchingToLinkedUser ? '(linked account)' : '')

      // Generate host tokens - use linked user's ID if switching to linked account
      const tokens = generateHostTokens({
        id: hostProfile.id,
        userId: tokenUserId,  // Use linked user's ID when switching to linked account
        email: hostProfile.email,
        name: hostProfile.name || (switchingToLinkedUser ? linkedUser!.name : user.name) || '',
        approvalStatus: hostProfile.approvalStatus,
        legacyDualId: user.legacyDualId  // Include dual-role link ID
      })

      // Create response with redirect
      const response = NextResponse.json({
        success: true,
        redirectUrl: '/host/dashboard',
        switchedToLinkedAccount: switchingToLinkedUser
      })

      // Set host cookies
      response.cookies.set('hostAccessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60, // 15 minutes
        path: '/'
      })

      response.cookies.set('hostRefreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      })

      // Also set standard cookies (backward compatibility)
      response.cookies.set('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60,
        path: '/'
      })

      response.cookies.set('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/'
      })

      // CRITICAL: Set current_mode cookie to explicitly track which mode user is in
      // This is the authoritative source for role detection in check-dual-role
      response.cookies.set('current_mode', 'host', {
        httpOnly: false, // Allow client-side JS to read for instant UI updates
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      })

      console.log('[Role Switch] Switched to host mode for user:', tokenUserId)
      console.log('[Role Switch] Set current_mode=host cookie')
      return response

    } else if (targetRole === 'guest') {
      // SECURITY: STRICT query - only match by userId (no email fallback)
      let guestProfile = await prisma.reviewerProfile.findFirst({
        where: { userId: userId },  // Only match by userId for security
        select: {
          id: true,
          userId: true,
          email: true,
          legacyDualId: true  // For dual-role account linking validation
        }
      })

      // If no guest profile on current user, check linked account
      let switchingToLinkedUser = false
      let linkedUser: { id: string; email: string; name: string | null; role: string; legacyDualId: string | null } | null = null

      if (!guestProfile && user.legacyDualId) {
        // Find linked user
        linkedUser = await prisma.user.findFirst({
          where: {
            legacyDualId: user.legacyDualId,
            id: { not: userId }
          },
          select: { id: true, email: true, name: true, role: true, legacyDualId: true }
        })

        if (linkedUser) {
          // Check if linked user has guest profile
          guestProfile = await prisma.reviewerProfile.findFirst({
            where: { userId: linkedUser.id },
            select: {
              id: true,
              userId: true,
              email: true,
              legacyDualId: true
            }
          })

          if (guestProfile) {
            switchingToLinkedUser = true
            console.log(`[Role Switch] Switching to linked user's guest profile: ${linkedUser.email}`)
          }
        }
      }

      if (!guestProfile) {
        console.error('[Role Switch] ❌ SECURITY: No guest profile with matching userId or linked account', {
          userId: userId,
          email: user.email
        })
        return NextResponse.json(
          { error: 'Guest profile not found or not linked to your account' },
          { status: 404 }
        )
      }

      // CRITICAL VALIDATION: Verify userId matches authenticated user or linked user
      const expectedUserId = switchingToLinkedUser ? linkedUser!.id : userId
      if (guestProfile.userId && guestProfile.userId !== expectedUserId) {
        console.error('[Role Switch] 🚨 SECURITY BREACH: userId mismatch!', {
          authenticatedUserId: userId,
          expectedUserId: expectedUserId,
          profileUserId: guestProfile.userId,
          email: user.email
        })
        return NextResponse.json(
          { error: 'Account security issue detected. Contact support.' },
          { status: 403 }
        )
      }

      // DUAL-ROLE VALIDATION: If switching to linked user, verify legacyDualId matches
      if (switchingToLinkedUser && linkedUser) {
        if (user.legacyDualId !== linkedUser.legacyDualId) {
          console.error('[Role Switch] 🚨 SECURITY BREACH: legacyDualId mismatch!', {
            userLegacyDualId: user.legacyDualId,
            linkedUserLegacyDualId: linkedUser.legacyDualId,
            userId: userId
          })
          return NextResponse.json(
            { error: 'Accounts are not linked. Please link your accounts first.' },
            { status: 403 }
          )
        }
        console.log('[Role Switch] ✅ Legacy dual ID validation passed:', user.legacyDualId)
      }

      // Determine which user to use for tokens
      const targetUser = switchingToLinkedUser ? linkedUser! : user

      console.log('[Role Switch] Switched to guest mode for user:', targetUser.id, switchingToLinkedUser ? '(linked account)' : '')

      // Generate guest tokens - use linked user if switching to linked account
      const tokens = generateGuestTokens({
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role || 'CLAIMED',
        legacyDualId: targetUser.legacyDualId  // Include dual-role link ID
      })

      // Create response with redirect
      const response = NextResponse.json({
        success: true,
        redirectUrl: '/dashboard',
        switchedToLinkedAccount: switchingToLinkedUser
      })

      // Set guest cookies
      response.cookies.set('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60, // 15 minutes
        path: '/'
      })

      response.cookies.set('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      })

      // Clear host cookies - use maxAge: 0 for reliable deletion
      response.cookies.set('hostAccessToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0, // Expire immediately
        path: '/'
      })
      response.cookies.set('hostRefreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0, // Expire immediately
        path: '/'
      })

      // CRITICAL: Set current_mode cookie to explicitly track which mode user is in
      // This is the authoritative source for role detection in check-dual-role
      response.cookies.set('current_mode', 'guest', {
        httpOnly: false, // Allow client-side JS to read for instant UI updates
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      })

      console.log('[Role Switch] Switched to guest mode for user:', targetUser.id)
      console.log('[Role Switch] Cleared hostAccessToken and hostRefreshToken cookies')
      console.log('[Role Switch] Set current_mode=guest cookie')
      return response
    }

  } catch (error) {
    console.error('[Role Switch] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
