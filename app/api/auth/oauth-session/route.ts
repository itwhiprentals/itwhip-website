// app/api/auth/oauth-session/route.ts
// Exchanges NextAuth session for custom JWT tokens compatible with existing auth system

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth/next-auth-config'
import { SignJWT } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'

const GUEST_JWT_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET!
)

export async function POST(request: NextRequest) {
  try {
    // Get NextAuth session
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated with OAuth' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { reviewerProfile: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const now = Math.floor(Date.now() / 1000)

    // Generate access token
    const accessToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      userType: 'guest'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setExpirationTime(now + 15 * 60) // 15 minutes
      .setIssuer('itwhip')
      .setAudience('itwhip-guest')
      .sign(GUEST_JWT_SECRET)

    // Generate refresh token
    const refreshToken = await new SignJWT({
      userId: user.id,
      type: 'refresh'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setExpirationTime(now + 7 * 24 * 60 * 60) // 7 days
      .setIssuer('itwhip')
      .sign(GUEST_JWT_SECRET)

    // Create session record
    await prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken.slice(-32),
        refreshToken: refreshToken.slice(-32),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    // Set cookies
    const cookieStore = await cookies()

    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    })

    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        hasProfile: !!user.reviewerProfile
      }
    })
  } catch (error) {
    console.error('OAuth session exchange error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get NextAuth session status
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({
        authenticated: false,
        provider: null
      })
    }

    return NextResponse.json({
      authenticated: true,
      provider: (session.user as any).provider || 'oauth',
      user: {
        email: session.user.email,
        name: session.user.name,
        image: session.user.image
      }
    })
  } catch (error) {
    console.error('OAuth session check error:', error)
    return NextResponse.json({
      authenticated: false,
      error: 'Failed to check session'
    })
  }
}
