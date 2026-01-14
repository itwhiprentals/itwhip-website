// app/api/partner/logout/route.ts
// Partner Logout API - Clear partner session

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()

    // Clear ALL auth-related cookies for unified portal
    const cookiesToClear = [
      'partner_token',
      'hostAccessToken',
      'accessToken',
      'guestAccessToken',
      'refreshToken',
      'hostRefreshToken',
      'guestRefreshToken'
    ]

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 0, // Expire immediately
      path: '/'
    }

    // Clear each cookie
    cookiesToClear.forEach(cookieName => {
      cookieStore.set(cookieName, '', cookieOptions)
    })

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

  } catch (error: any) {
    console.error('[Partner Logout] Error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
