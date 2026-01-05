// app/api/auth/oauth-redirect/route.ts
// OAuth redirect handler for role-based routing after authentication

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth/next-auth-config'
import { prisma } from '@/app/lib/database/prisma'
import { sign } from 'jsonwebtoken'
import { nanoid } from 'nanoid'

// JWT secrets (same as login route)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'

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
    const returnTo = searchParams.get('returnTo') ||
      (cookies.get('oauth_return_to')?.value ? decodeURIComponent(cookies.get('oauth_return_to')?.value) : null)

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

    // Start with guest tokens - will regenerate if user is a host
    const tokens = generateGuestTokens({
      id: user.id,
      email: user.email || email,
      name: user.name,
      role: user.role || 'CLAIMED'
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

      // No host profile and no guest profile - handle based on mode
      if (mode === 'login') {
        // LOGIN mode: User trying to login without an account
        console.log('[OAuth Redirect] NO HOST PROFILE FOR LOGIN')
        return createRedirectWithCookies('/host/login?error=no-account')
      }

      // New host signup - redirect to complete-profile for phone and vehicle info
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

        // Non-host user without guest profile - redirect to complete-profile to CREATE it
        const redirectUrl = returnTo || '/dashboard'
        console.log('[OAuth Redirect] No guest profile, redirecting to complete profile to create one')
        return createRedirectWithCookies(`/auth/complete-profile?roleHint=guest&mode=signup&redirectTo=${encodeURIComponent(redirectUrl)}`)
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
