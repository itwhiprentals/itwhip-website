// app/api/auth/guest-callback/route.ts
// Server-side callback that sets cookies and redirects to dashboard
// This ensures cookies and redirect happen in the SAME HTTP response (no race condition)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  // No token provided
  if (!token) {
    console.error('[Guest Callback] Missing token parameter')
    return NextResponse.redirect(
      new URL('/auth/login?error=missing_token', request.url),
      { status: 302 }
    )
  }

  try {
    // Find the session by token
    const session = await prisma.guestSession.findUnique({
      where: { token }
    })

    // Session not found
    if (!session) {
      console.error('[Guest Callback] Session not found for token')
      return NextResponse.redirect(
        new URL('/auth/login?error=invalid_session', request.url),
        { status: 302 }
      )
    }

    // Session already consumed (one-time use)
    if (session.consumed) {
      console.error('[Guest Callback] Session already consumed')
      return NextResponse.redirect(
        new URL('/auth/login?error=session_used', request.url),
        { status: 302 }
      )
    }

    // Session expired
    if (new Date() > session.expiresAt) {
      console.error('[Guest Callback] Session expired')
      // Clean up expired session
      await prisma.guestSession.delete({ where: { id: session.id } })
      return NextResponse.redirect(
        new URL('/auth/login?error=session_expired', request.url),
        { status: 302 }
      )
    }

    // Mark session as consumed (one-time use)
    await prisma.guestSession.update({
      where: { id: session.id },
      data: {
        consumed: true,
        consumedAt: new Date()
      }
    })

    // Create redirect response with cookies
    // This is the key: cookies and redirect in the SAME response
    const response = NextResponse.redirect(
      new URL('/dashboard', request.url),
      { status: 302 }
    )

    const isProduction = process.env.NODE_ENV === 'production'

    // Set access token cookie
    response.cookies.set('accessToken', session.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    })

    // Set refresh token cookie
    response.cookies.set('refreshToken', session.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    // Clear any host cookies to prevent role confusion
    response.cookies.set('hostAccessToken', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })
    response.cookies.set('partner_token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    console.log('[Guest Callback] Successfully authenticated user:', session.userId)
    return response

  } catch (error) {
    console.error('[Guest Callback] Error:', error)
    return NextResponse.redirect(
      new URL('/auth/login?error=callback_failed', request.url),
      { status: 302 }
    )
  }
}
