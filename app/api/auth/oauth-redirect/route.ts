// app/api/auth/oauth-redirect/route.ts
// OAuth redirect handler for role-based routing after authentication

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth/next-auth-config'
import { prisma } from '@/app/lib/database/prisma'
import { SignJWT } from 'jose'
import { nanoid } from 'nanoid'

// JWT secrets (same as login route)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
)

// Helper to generate and set custom JWT tokens
async function generateCustomTokens(user: { id: string; email: string; name: string | null; role: string }) {
  const tokenId = nanoid()
  const refreshTokenId = nanoid()
  const refreshFamily = nanoid()

  // Create access token (15 minutes)
  const accessToken = await new SignJWT({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    jti: tokenId
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET)

  // Create refresh token (7 days)
  const refreshToken = await new SignJWT({
    userId: user.id,
    family: refreshFamily,
    jti: refreshTokenId
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_REFRESH_SECRET)

  return { accessToken, refreshToken, refreshFamily }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Read from cookies as fallback (cookies are set by OAuthButtons before OAuth redirect)
    // URL params get lost during OAuth flow, so cookies preserve the original intent
    const cookies = request.cookies
    const roleHint = searchParams.get('roleHint') || cookies.get('oauth_role_hint')?.value || 'guest'
    const mode = searchParams.get('mode') || cookies.get('oauth_mode')?.value || 'signup'
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
      console.log(`[OAuth Redirect] Pending OAuth user - needs to complete profile first (mode: ${mode})`)

      // For BOTH login and signup mode, redirect to complete-profile
      // If mode is 'login', complete-profile will show "No Account Found" message
      // but still allow user to create account by entering phone
      const redirectUrl = returnTo || '/dashboard'
      const completeProfileUrl = `/auth/complete-profile?roleHint=${roleHint}&mode=${mode}&redirectTo=${encodeURIComponent(redirectUrl)}`
      console.log(`[OAuth Redirect] Redirecting pending user to complete profile: ${completeProfileUrl}`)

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

    // Check if user has phone number - if not, redirect to complete profile
    const hasPhone = user.phone && user.phone.length >= 10

    // Generate custom JWT tokens for the existing auth system
    let accessToken = ''
    let refreshToken = ''
    const tokens = await generateCustomTokens({
      id: user.id,
      email: user.email || email,
      name: user.name,
      role: user.role || 'CLAIMED'
    })
    accessToken = tokens.accessToken
    refreshToken = tokens.refreshToken
    console.log('[OAuth Redirect] Generated custom JWT tokens for existing API compatibility')

    // Helper to create redirect response with JWT cookies
    const createRedirectWithCookies = (url: string) => {
      const response = NextResponse.redirect(new URL(url, request.url))

      if (accessToken && refreshToken) {
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
        userId: true
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

    console.log(`[OAuth Redirect] Host profile: ${hostProfile ? 'exists' : 'none'}, Guest profile: ${guestProfile ? 'exists' : 'none'}, Has phone: ${hasPhone}`)

    // Determine redirect based on roleHint and existing profiles
    if (roleHint === 'host') {
      // User came from host auth pages
      if (hostProfile) {
        // User has host profile, check status
        if (hostProfile.approvalStatus === 'APPROVED') {
          // Check phone before allowing access to dashboard
          if (!hasPhone) {
            console.log('[OAuth Redirect] Host missing phone, redirecting to complete profile')
            return createRedirectWithCookies(`/auth/complete-profile?roleHint=host&mode=${mode}&redirectTo=/host/dashboard`)
          }
          console.log('[OAuth Redirect] Redirecting to host dashboard')
          return createRedirectWithCookies('/host/dashboard')
        } else if (hostProfile.approvalStatus === 'PENDING') {
          console.log('[OAuth Redirect] Host pending, redirecting to login with message')
          return createRedirectWithCookies('/host/login?status=pending')
        } else if (hostProfile.approvalStatus === 'REJECTED') {
          console.log('[OAuth Redirect] Host rejected, redirecting to login with message')
          return createRedirectWithCookies('/host/login?status=rejected')
        } else if (hostProfile.approvalStatus === 'SUSPENDED') {
          console.log('[OAuth Redirect] Host suspended, redirecting to login with message')
          return createRedirectWithCookies('/host/login?status=suspended')
        }
      }

      // No host profile, redirect to host signup to complete registration
      console.log('[OAuth Redirect] No host profile, redirecting to host signup')
      return createRedirectWithCookies('/host/signup?oauth=true')
    }

    if (roleHint === 'guest') {
      // User came from guest auth pages

      // Create guest profile if it doesn't exist
      if (!guestProfile && userId) {
        try {
          await prisma.reviewerProfile.create({
            data: {
              userId: userId,
              email: email,
              name: session.user.name || '',
              memberSince: new Date(),
              city: '',
              state: '',
              zipCode: '',
              emailVerified: true
            }
          })
          console.log('[OAuth Redirect] Created guest profile')
        } catch (err) {
          // Profile might already exist with different userId
          console.error('[OAuth Redirect] Failed to create guest profile:', err)
        }
      }

      // Check if user has phone number
      if (!hasPhone) {
        const redirectUrl = returnTo || '/dashboard'
        console.log('[OAuth Redirect] Guest missing phone, redirecting to complete profile')
        return createRedirectWithCookies(`/auth/complete-profile?roleHint=guest&mode=${mode}&redirectTo=${encodeURIComponent(redirectUrl)}`)
      }

      const redirectUrl = returnTo || '/dashboard'
      console.log(`[OAuth Redirect] Redirecting to guest dashboard: ${redirectUrl}`)
      return createRedirectWithCookies(redirectUrl)
    }

    // No roleHint - determine best redirect based on existing profiles
    // Priority: If user has approved host profile, go to host dashboard
    //           Otherwise, go to guest profile
    if (hostProfile?.approvalStatus === 'APPROVED') {
      // Check phone before allowing access to dashboard
      if (!hasPhone) {
        console.log('[OAuth Redirect] Host missing phone, redirecting to complete profile')
        return createRedirectWithCookies(`/auth/complete-profile?roleHint=host&mode=${mode}&redirectTo=/host/dashboard`)
      }
      console.log('[OAuth Redirect] No roleHint, user is approved host, redirecting to host dashboard')
      return createRedirectWithCookies('/host/dashboard')
    }

    // Default to guest dashboard - but check phone first
    if (!hasPhone) {
      const redirectUrl = returnTo || '/dashboard'
      console.log('[OAuth Redirect] Missing phone, redirecting to complete profile')
      return createRedirectWithCookies(`/auth/complete-profile?roleHint=guest&mode=${mode}&redirectTo=${encodeURIComponent(redirectUrl)}`)
    }

    const redirectUrl = returnTo || '/dashboard'
    console.log(`[OAuth Redirect] No roleHint, defaulting to: ${redirectUrl}`)
    return createRedirectWithCookies(redirectUrl)

  } catch (error) {
    console.error('[OAuth Redirect] Error:', error)
    // On error, redirect to home
    return NextResponse.redirect(new URL('/', request.url))
  }
}
