// app/api/auth/guest-auto-login/route.ts
// Auto-login for guests via GuestAccessToken — sets cookie, redirects to booking or set-password

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { SignJWT } from 'jose'
import crypto from 'crypto'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(
      new URL('/auth/login?error=missing_token', request.url),
      { status: 302 }
    )
  }

  try {
    // Validate the GuestAccessToken
    const guestToken = await prisma.guestAccessToken.findUnique({
      where: { token },
      include: {
        booking: {
          select: { id: true, bookingCode: true }
        }
      }
    })

    if (!guestToken) {
      console.error('[Guest Auto-Login] Invalid token')
      return NextResponse.redirect(
        new URL('/auth/login?error=invalid_token', request.url),
        { status: 302 }
      )
    }

    if (new Date() > guestToken.expiresAt) {
      console.error('[Guest Auto-Login] Token expired')
      return NextResponse.redirect(
        new URL('/auth/login?error=token_expired', request.url),
        { status: 302 }
      )
    }

    // Mark token as used (but don't invalidate — guest may click again)
    if (!guestToken.usedAt) {
      await prisma.guestAccessToken.update({
        where: { id: guestToken.id },
        data: { usedAt: new Date() }
      })
    }

    // Find the guest user by email
    const user = await prisma.user.findUnique({
      where: { email: guestToken.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        resetToken: true,
        resetTokenExpiry: true,
        resetTokenUsed: true
      }
    })

    if (!user) {
      console.error('[Guest Auto-Login] No user found for email:', guestToken.email)
      return NextResponse.redirect(
        new URL('/auth/login?error=user_not_found', request.url),
        { status: 302 }
      )
    }

    // Generate a JWT access token for the guest (7-day expiry)
    const accessToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'CLAIMED',
      status: 'ACTIVE'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    const bookingUrl = `/rentals/dashboard/bookings/${guestToken.booking.id}`
    const hasPassword = !!(user.passwordHash && user.passwordHash.length > 0)

    let redirectUrl: string

    if (!hasPassword) {
      // Guest needs to set a password first
      // Generate a fresh resetToken for the set-password page
      const resetTokenRaw = crypto.randomBytes(32).toString('hex')
      const hashedToken = crypto.createHash('sha256').update(resetTokenRaw).digest('hex')

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: hashedToken,
          resetTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          resetTokenUsed: false
        }
      })

      // Redirect to set-password with redirect back to booking
      redirectUrl = `/auth/set-password?token=${resetTokenRaw}&redirect=${encodeURIComponent(bookingUrl)}`
    } else {
      // Guest already has a password — go straight to booking
      redirectUrl = bookingUrl
    }

    // Build response with cookie + redirect
    const isProduction = process.env.NODE_ENV === 'production'
    const response = NextResponse.redirect(
      new URL(redirectUrl, request.url),
      { status: 302 }
    )

    // Set access token cookie (7 days)
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    })

    console.log(`[Guest Auto-Login] User ${user.email} → ${hasPassword ? 'booking page' : 'set-password'}`)
    return response

  } catch (error) {
    console.error('[Guest Auto-Login] Error:', error)
    return NextResponse.redirect(
      new URL('/auth/login?error=login_failed', request.url),
      { status: 302 }
    )
  }
}
