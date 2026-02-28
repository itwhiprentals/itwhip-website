// app/api/auth/oauth-redirect/route.ts
// OAuth redirect handler for role-based routing after authentication

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth/next-auth-config'
import { prisma } from '@/app/lib/database/prisma'
import { sign } from 'jsonwebtoken'
import { nanoid } from 'nanoid'

// JWT secrets (same as login route)
const JWT_SECRET = process.env.JWT_SECRET!
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

// Helper to generate HOST JWT tokens (for rental hosts)
function generateHostTokens(host: {
  id: string
  userId: string
  email: string
  name: string
  approvalStatus: string
}) {
  // Generate access token with HOST claims
  const accessToken = sign(
    {
      userId: host.userId,
      hostId: host.id,
      email: host.email,
      name: host.name,
      role: 'BUSINESS',
      isRentalHost: true,
      approvalStatus: host.approvalStatus
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  )

  // Generate refresh token
  const refreshToken = sign(
    {
      userId: host.userId,
      hostId: host.id,
      email: host.email,
      type: 'refresh'
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

// Helper to generate PARTNER JWT tokens (for partners/car owners)
function generatePartnerTokens(partner: {
  id: string
  userId: string
  email: string
  name: string
  hostType: string
  approvalStatus: string
}) {
  // Generate access token with PARTNER claims
  // Must include role: 'BUSINESS' and isRentalHost: true for middleware verification
  const accessToken = sign(
    {
      userId: partner.userId,
      hostId: partner.id,
      email: partner.email,
      name: partner.name,
      role: 'BUSINESS',
      isRentalHost: true,
      hostType: partner.hostType,
      isPartner: true,
      approvalStatus: partner.approvalStatus
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  return { accessToken }
}

// Helper to generate GUEST JWT tokens (for regular users)
function generateGuestTokens(user: {
  id: string
  email: string
  name: string | null
  role: string
}) {
  const tokenId = nanoid()
  const refreshTokenId = nanoid()

  // Create access token (15 minutes)
  const accessToken = sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      jti: tokenId
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  )

  // Create refresh token (7 days)
  const refreshToken = sign(
    {
      userId: user.id,
      jti: refreshTokenId
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Read from cookies FIRST - they are set by OAuthButtons right before signIn
    // NextAuth doesn't preserve our callbackUrl query params correctly, so cookies are the source of truth
    const cookies = request.cookies
    const cookieRoleHint = cookies.get('oauth_role_hint')?.value
    const queryRoleHint = searchParams.get('roleHint')
    // IMPORTANT: Prioritize cookie over query param - cookie is always correct
    const roleHint = cookieRoleHint || queryRoleHint || 'guest'
    const cookieMode = cookies.get('oauth_mode')?.value
    const queryMode = searchParams.get('mode')
    const mode = cookieMode || queryMode || 'signup'

    console.log('[OAuth Redirect] Debug cookies:', {
      queryRoleHint,
      cookieRoleHint,
      finalRoleHint: roleHint,
      allCookies: cookies.getAll().map(c => c.name)
    })
    const returnToCookie = cookies.get('oauth_return_to')?.value
    const returnTo = searchParams.get('returnTo') ||
      (returnToCookie ? decodeURIComponent(returnToCookie) : null)

    // Get the authenticated session
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      // Not authenticated, redirect to login
      console.log('[OAuth Redirect] No session, redirecting to login')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const email = session.user.email
    const userId = (session.user as any).id
    const pendingOAuth = (session.user as any).pendingOAuth
    const isProfileComplete = (session.user as any).isProfileComplete

    console.log(`[OAuth Redirect] User authenticated: ${email}, roleHint: ${roleHint}, mode: ${mode}, pending: ${!!pendingOAuth}`)

    // ========================================================================
    // PENDING OAUTH USER (New user - not yet in database)
    // ========================================================================
    if (pendingOAuth && !isProfileComplete) {
      console.log(`[OAuth Redirect] Pending OAuth user - roleHint: ${roleHint}, mode: ${mode}`)

      // For HOST signups, redirect to complete-profile to collect phone and vehicle info
      if (roleHint === 'host') {
        const redirectUrl = '/host/dashboard'
        const completeProfileUrl = `/auth/complete-profile?roleHint=host&mode=${mode}&redirectTo=${encodeURIComponent(redirectUrl)}`
        console.log(`[OAuth Redirect] Host signup - redirecting to complete profile: ${completeProfileUrl}`)

        const response = NextResponse.redirect(new URL(completeProfileUrl, request.url))
        response.cookies.delete('oauth_role_hint')
        response.cookies.delete('oauth_mode')
        response.cookies.delete('oauth_return_to')
        return response
      }

      // For GUEST signups, redirect to complete-profile to collect phone
      const redirectUrl = returnTo || '/dashboard'
      const completeProfileUrl = `/auth/complete-profile?roleHint=${roleHint}&mode=${mode}&redirectTo=${encodeURIComponent(redirectUrl)}`
      console.log(`[OAuth Redirect] Guest signup - redirecting to complete profile: ${completeProfileUrl}`)

      const response = NextResponse.redirect(new URL(completeProfileUrl, request.url))
      // Clear OAuth cookies after reading
      response.cookies.delete('oauth_role_hint')
      response.cookies.delete('oauth_mode')
      response.cookies.delete('oauth_return_to')
      return response
    }

    // ========================================================================
    // EXISTING USER (Has account in database)
    // ========================================================================

    // Get full user data for token generation
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    // If user not found in DB but we got here (shouldn't happen), redirect to login
    if (!user) {
      console.log('[OAuth Redirect] User not found in database - redirecting to login')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Generate role-specific JWT tokens
    let accessToken = ''
    let refreshToken = ''
    let isHost = false

    // Determine the effective role for the token
    // ANONYMOUS users should be treated as CLAIMED for guest access
    const GUEST_ALLOWED_ROLES = ['CLAIMED', 'STARTER', 'BUSINESS', 'ENTERPRISE']
    const effectiveRole = GUEST_ALLOWED_ROLES.includes(user.role || '')
      ? user.role
      : 'CLAIMED'  // Default ANONYMOUS or unknown roles to CLAIMED

    // Start with guest tokens - will regenerate if user is a host
    const tokens = generateGuestTokens({
      id: user.id,
      email: user.email || email,
      name: user.name,
      role: effectiveRole
    })
    accessToken = tokens.accessToken
    refreshToken = tokens.refreshToken
    console.log('[OAuth Redirect] Generated initial JWT tokens')

    // Helper to create redirect response with JWT cookies
    const createRedirectWithCookies = (url: string) => {
      const response = NextResponse.redirect(new URL(url, request.url))

      if (accessToken && refreshToken) {
        // Set standard accessToken and refreshToken
        response.cookies.set('accessToken', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60, // 15 minutes
          path: '/'
        })

        response.cookies.set('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60, // 7 days
          path: '/'
        })

        // ALSO set host-specific cookies if this is a host
        if (isHost) {
          response.cookies.set('hostAccessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60, // 15 minutes
            path: '/'
          })

          response.cookies.set('hostRefreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/'
          })
          console.log('[OAuth Redirect] Set both accessToken AND hostAccessToken cookies for host')
        }
      }

      // Clear OAuth cookies after reading (they were only needed for this redirect)
      response.cookies.delete('oauth_role_hint')
      response.cookies.delete('oauth_mode')
      response.cookies.delete('oauth_return_to')

      // Set current_mode cookie so Header/check-dual-role knows which role to display
      response.cookies.set('current_mode', isHost ? 'host' : 'guest', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/'
      })

      // Clear cross-role cookies to prevent dual-role confusion
      // When guest/host logs in via OAuth, clear partner cookies
      response.cookies.set('partner_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      })

      return response
    }

    // Check if user has host profile
    const hostProfile = await prisma.rentalHost.findFirst({
      where: {
        OR: [
          { userId: userId },
          { email: email }
        ]
      },
      select: {
        id: true,
        approvalStatus: true,
        userId: true,
        phone: true  // Include host phone
      }
    })

    // Check if user has guest/reviewer profile
    const guestProfile = await prisma.reviewerProfile.findUnique({
      where: { userId: userId },
      select: {
        id: true,
        userId: true,
        phoneNumber: true
      }
    })

    // If user has host profile and roleHint is 'host', regenerate tokens with host claims
    if (roleHint === 'host' && hostProfile) {
      // CRITICAL VALIDATION: Check for userId mismatch
      if (hostProfile.userId && hostProfile.userId !== user.id) {
        console.error('[OAuth] 🚨 SECURITY BREACH: Host profile userId mismatch - BLOCKING LOGIN!', {
          authenticatedUserId: user.id,
          profileUserId: hostProfile.userId,
          email
        })

        // ✅ SECURITY FIX: BLOCK login immediately when userId mismatch detected
        // This prevents account bleeding where User A sees User B's data
        const response = NextResponse.redirect(new URL('/host/login?error=account-security-issue', request.url))
        response.cookies.delete('oauth_role_hint')
        response.cookies.delete('oauth_mode')
        response.cookies.delete('oauth_return_to')
        return response
      }

      // Generate tokens with AUTHENTICATED user.id (NOT hostProfile.userId)
      const hostTokens = generateHostTokens({
        id: hostProfile.id,
        userId: user.id,  // ✅ ALWAYS use authenticated user.id
        email: email,
        name: user.name || '',
        approvalStatus: hostProfile.approvalStatus
      })
      accessToken = hostTokens.accessToken
      refreshToken = hostTokens.refreshToken
      isHost = true
      console.log('[OAuth Redirect] Regenerated HOST tokens with approvalStatus:', hostProfile.approvalStatus)
    }

    // For users with HOST profile, ALWAYS set host tokens regardless of roleHint
    // This ensures "Go to Host Dashboard" works from the blocking alert
    // when HOST user authenticates via guest flow
    if (hostProfile && hostProfile.approvalStatus === 'APPROVED' && !isHost) {
      const hostTokens = generateHostTokens({
        id: hostProfile.id,
        userId: user.id,
        email: email,
        name: user.name || '',
        approvalStatus: hostProfile.approvalStatus
      })
      accessToken = hostTokens.accessToken
      refreshToken = hostTokens.refreshToken
      isHost = true
      console.log('[OAuth Redirect] Generated HOST tokens for host user (accessed via guest flow)')
    }

    // Check for phone in User, RentalHost, or ReviewerProfile
    const hasPhoneFromUser = user.phone && user.phone.length >= 10
    const hasPhoneFromHost = hostProfile?.phone && hostProfile.phone.length >= 10
    const hasPhoneFromGuest = guestProfile?.phoneNumber && guestProfile.phoneNumber.length >= 10
    const hasPhoneAny = hasPhoneFromUser || hasPhoneFromHost || hasPhoneFromGuest

    console.log(`[OAuth Redirect] Host profile: ${hostProfile ? 'exists' : 'none'}, Guest profile: ${guestProfile ? 'exists' : 'none'}, Has phone: ${hasPhoneAny} (user: ${hasPhoneFromUser}, host: ${hasPhoneFromHost}, guest: ${hasPhoneFromGuest})`)

    // Determine redirect based on roleHint and existing profiles
    if (roleHint === 'host') {
      // User came from host auth pages
      if (hostProfile) {
        // User has host profile, check status
        if (hostProfile.approvalStatus === 'APPROVED') {
          // Check phone before allowing access to dashboard
          if (!hasPhoneAny) {
            console.log('[OAuth Redirect] Host missing phone, redirecting to complete profile')
            return createRedirectWithCookies(`/auth/complete-profile?roleHint=host&mode=${mode}&redirectTo=/host/dashboard`)
          }
          console.log('[OAuth Redirect] Redirecting to host dashboard')
          return createRedirectWithCookies('/host/dashboard')
        } else if (hostProfile.approvalStatus === 'PENDING') {
          console.log('[OAuth Redirect] Host pending, redirecting to dashboard')
          return createRedirectWithCookies('/host/dashboard')
        } else if (hostProfile.approvalStatus === 'REJECTED') {
          console.log('[OAuth Redirect] Host rejected, redirecting to login with message')
          return createRedirectWithCookies('/host/login?status=rejected')
        } else if (hostProfile.approvalStatus === 'SUSPENDED') {
          console.log('[OAuth Redirect] Host suspended, redirecting to login with message')
          return createRedirectWithCookies('/host/login?status=suspended')
        }
      }

      // GUEST user wants to become HOST → Allow upgrade flow via complete-profile
      if (guestProfile && !hostProfile) {
        console.log('[OAuth Redirect] GUEST user wants to become HOST - redirecting to complete-profile for upgrade')
        return createRedirectWithCookies(`/auth/complete-profile?roleHint=host&mode=signup&guard=guest-on-host&redirectTo=/host/dashboard`)
      }

      // No host profile and no guest profile - ORPHAN USER for host flow
      // Handle same as guest orphan: redirect to complete-profile WITHOUT JWT cookies
      if (!hostProfile && !guestProfile && userId) {
        const noAccountFlag = mode === 'login' ? '&noAccount=true' : ''
        console.log(`[OAuth Redirect] ORPHAN USER (no profiles) for HOST - redirecting to complete-profile WITHOUT JWT cookies (mode: ${mode})`)

        // Create redirect WITHOUT JWT cookies - user should appear logged out
        const response = NextResponse.redirect(
          new URL(`/auth/complete-profile?roleHint=host&mode=signup${noAccountFlag}&redirectTo=/host/dashboard`, request.url)
        )
        // Clear OAuth cookies
        response.cookies.delete('oauth_role_hint')
        response.cookies.delete('oauth_mode')
        response.cookies.delete('oauth_return_to')
        // Also clear any existing auth cookies to ensure logged-out state
        response.cookies.delete('accessToken')
        response.cookies.delete('refreshToken')
        response.cookies.delete('hostAccessToken')
        response.cookies.delete('hostRefreshToken')
        return response
      }

      // New host signup (has guest profile but no host profile) - redirect to complete-profile
      if (!hostProfile && userId) {
        console.log('[OAuth Redirect] No host profile, redirecting to complete profile')
        return createRedirectWithCookies(`/auth/complete-profile?roleHint=host&mode=signup&redirectTo=/host/dashboard`)
      }

      // If profile exists but missing phone, redirect to complete it
      if (!hasPhoneAny) {
        console.log('[OAuth Redirect] Host needs phone, redirecting to complete profile')
        return createRedirectWithCookies(`/auth/complete-profile?roleHint=host&mode=${mode}&redirectTo=/host/dashboard`)
      }

      // Both profile and phone exist - continue with host flow
      console.log('[OAuth Redirect] Host profile and phone exist, continuing...')
    }

    // ========================================================================
    // PARTNER ROLE HANDLING (UNIFIED PORTAL - accepts all host types)
    // ========================================================================
    if (roleHint === 'partner') {
      // Check if user has ANY host profile (unified portal accepts all host types)
      const partnerProfile = await prisma.rentalHost.findFirst({
        where: {
          OR: [
            { userId: userId },
            { email: email }
          ]
          // No hostType filter - unified portal accepts REAL, PARTNER, FLEET_PARTNER, etc.
        },
        select: {
          id: true,
          userId: true,
          email: true,
          name: true,
          hostType: true,
          approvalStatus: true
        }
      })

      if (partnerProfile) {
        // User has partner profile
        if (partnerProfile.approvalStatus === 'APPROVED') {
          // Generate partner token and set cookie
          const partnerTokens = generatePartnerTokens({
            id: partnerProfile.id,
            userId: user.id,
            email: email,
            name: partnerProfile.name || user.name || '',
            hostType: partnerProfile.hostType,
            approvalStatus: partnerProfile.approvalStatus
          })

          const response = NextResponse.redirect(new URL('/partner/dashboard', request.url))
          response.cookies.set('partner_token', partnerTokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/'
          })
          // Also set hostAccessToken so all partner APIs recognize the session
          response.cookies.set('hostAccessToken', partnerTokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/'
          })
          response.cookies.set('current_mode', 'host', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/'
          })
          // Clear guest cookies to prevent dual-role confusion
          response.cookies.set('accessToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0, path: '/' })
          response.cookies.set('refreshToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0, path: '/' })
          response.cookies.set('guestAccessToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0, path: '/' })
          response.cookies.set('guestRefreshToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0, path: '/' })
          response.cookies.delete('oauth_role_hint')
          response.cookies.delete('oauth_mode')
          response.cookies.delete('oauth_return_to')
          console.log('[OAuth Redirect] Partner approved, redirecting to partner dashboard')
          return response
        } else if (partnerProfile.approvalStatus === 'PENDING') {
          // Partner pending - still redirect to dashboard (will show pending message)
          const partnerTokens = generatePartnerTokens({
            id: partnerProfile.id,
            userId: user.id,
            email: email,
            name: partnerProfile.name || user.name || '',
            hostType: partnerProfile.hostType,
            approvalStatus: partnerProfile.approvalStatus
          })

          const response = NextResponse.redirect(new URL('/partner/dashboard', request.url))
          response.cookies.set('partner_token', partnerTokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/'
          })
          response.cookies.set('current_mode', 'host', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/'
          })
          // Clear guest cookies to prevent dual-role confusion
          response.cookies.set('accessToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0, path: '/' })
          response.cookies.set('refreshToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0, path: '/' })
          response.cookies.set('guestAccessToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0, path: '/' })
          response.cookies.set('guestRefreshToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0, path: '/' })
          response.cookies.delete('oauth_role_hint')
          response.cookies.delete('oauth_mode')
          response.cookies.delete('oauth_return_to')
          console.log('[OAuth Redirect] Partner pending, redirecting to partner dashboard')
          return response
        } else {
          // Rejected or suspended
          console.log(`[OAuth Redirect] Partner ${partnerProfile.approvalStatus}, redirecting to login`)
          const response = NextResponse.redirect(new URL(`/partner/login?status=${partnerProfile.approvalStatus.toLowerCase()}`, request.url))
          response.cookies.delete('oauth_role_hint')
          response.cookies.delete('oauth_mode')
          response.cookies.delete('oauth_return_to')
          return response
        }
      }

      // No partner profile found - ORPHAN USER for partner flow
      // Redirect to complete-profile WITHOUT JWT cookies (same as guest/host)
      // Shows "No Partner Account Found" message with options to apply or cancel
      const noAccountFlag = mode === 'login' ? '&noAccount=true' : ''
      console.log(`[OAuth Redirect] ORPHAN USER (no partner profile) - redirecting to complete-profile WITHOUT JWT cookies (mode: ${mode})`)

      // Create redirect WITHOUT JWT cookies - user should appear logged out
      const response = NextResponse.redirect(
        new URL(`/auth/complete-profile?roleHint=partner&mode=signup${noAccountFlag}&redirectTo=/partner/dashboard`, request.url)
      )
      // Clear all OAuth and auth cookies to ensure logged-out state
      response.cookies.delete('oauth_role_hint')
      response.cookies.delete('oauth_mode')
      response.cookies.delete('oauth_return_to')
      response.cookies.delete('accessToken')
      response.cookies.delete('refreshToken')
      response.cookies.delete('hostAccessToken')
      response.cookies.delete('hostRefreshToken')
      response.cookies.delete('partner_token')
      return response
    }

    if (roleHint === 'guest') {
      // If no guest profile exists, check if user is a HOST
      if (!guestProfile && userId) {
        // HOST user trying to access GUEST area → Show guard screen (NOT silent redirect)
        // The complete-profile page will display "Account Already Exists" guard screen
        if (hostProfile) {
          console.log('[OAuth Redirect] HOST user tried guest flow - redirecting to complete-profile for guard screen')
          const redirectUrl = returnTo || '/dashboard'
          return createRedirectWithCookies(`/auth/complete-profile?roleHint=guest&mode=${mode}&guard=host-on-guest&redirectTo=${encodeURIComponent(redirectUrl)}`)
        }

        // User has User+Account but NO profiles (orphan user)
        // Redirect to complete-profile WITHOUT setting JWT cookies
        // User should appear LOGGED OUT until they complete signup
        // NO auto-account creation - user must submit form to create account
        const redirectUrl = returnTo || '/dashboard'
        const noAccountFlag = mode === 'login' ? '&noAccount=true' : ''
        console.log(`[OAuth Redirect] ORPHAN USER (no profiles) - redirecting to complete-profile WITHOUT JWT cookies (mode: ${mode})`)

        // Create redirect WITHOUT JWT cookies - user should appear logged out
        const response = NextResponse.redirect(
          new URL(`/auth/complete-profile?roleHint=guest&mode=signup${noAccountFlag}&redirectTo=${encodeURIComponent(redirectUrl)}`, request.url)
        )
        // Clear OAuth cookies
        response.cookies.delete('oauth_role_hint')
        response.cookies.delete('oauth_mode')
        response.cookies.delete('oauth_return_to')
        // Also clear any existing auth cookies to ensure logged-out state
        response.cookies.delete('accessToken')
        response.cookies.delete('refreshToken')
        return response
      }

      // Phone is OPTIONAL for guests - allow access regardless of phone status
      const redirectUrl = returnTo || '/dashboard'
      console.log(`[OAuth Redirect] Redirecting to guest dashboard: ${redirectUrl}`)
      return createRedirectWithCookies(redirectUrl)
    }

    // No roleHint - determine best redirect based on existing profiles
    // Priority: If user has approved host profile, go to host dashboard
    //           Otherwise, go to guest profile
    if (hostProfile?.approvalStatus === 'APPROVED') {
      // Check phone before allowing access to dashboard
      if (!hasPhoneAny) {
        console.log('[OAuth Redirect] Host missing phone, redirecting to complete profile')
        return createRedirectWithCookies(`/auth/complete-profile?roleHint=host&mode=${mode}&redirectTo=/host/dashboard`)
      }
      console.log('[OAuth Redirect] No roleHint, user is approved host, redirecting to host dashboard')
      return createRedirectWithCookies('/host/dashboard')
    }

    // Default to guest dashboard - phone is optional for guests
    const redirectUrl = returnTo || '/dashboard'
    console.log(`[OAuth Redirect] No roleHint, defaulting to: ${redirectUrl}`)
    return createRedirectWithCookies(redirectUrl)

  } catch (error) {
    console.error('[OAuth Redirect] Error:', error)
    // On error, redirect to home
    return NextResponse.redirect(new URL('/', request.url))
  }
}
