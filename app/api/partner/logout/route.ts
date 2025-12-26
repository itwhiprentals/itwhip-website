// app/api/partner/logout/route.ts
// Partner Logout API - Clear partner session

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()

    // Clear the partner token cookie
    cookieStore.set('partner_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
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
