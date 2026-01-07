// app/api/partner/login/route.ts
// Partner Login API - Authenticate fleet partners

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verify } from 'argon2'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find the host by email
    const host = await prisma.rentalHost.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        user: true
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if host is a fleet partner
    if (host.hostType !== 'FLEET_PARTNER' && host.hostType !== 'PARTNER') {
      return NextResponse.json(
        { error: 'This account is not a fleet partner account' },
        { status: 403 }
      )
    }

    // Check if partner is approved
    if (host.approvalStatus !== 'APPROVED') {
      if (host.approvalStatus === 'PENDING') {
        return NextResponse.json(
          { error: 'Your partner application is still under review' },
          { status: 403 }
        )
      }
      if (host.approvalStatus === 'SUSPENDED') {
        return NextResponse.json(
          { error: 'Your partner account has been suspended. Please contact support.' },
          { status: 403 }
        )
      }
      return NextResponse.json(
        { error: 'Your partner account is not active' },
        { status: 403 }
      )
    }

    // Verify password
    const passwordHash = host.user?.passwordHash
    if (!passwordHash) {
      console.log('[Partner Login] No password hash found for:', email)
      return NextResponse.json(
        { error: 'Password not set. Please reset your password.' },
        { status: 401 }
      )
    }

    const isValid = await verify(passwordHash, password)
    if (!isValid) {
      console.log('[Partner Login] Invalid password for:', email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = await new SignJWT({
      userId: host.userId || host.id, // userId for verifyRequest compatibility
      hostId: host.id,
      email: host.email,
      hostType: host.hostType,
      isPartner: true
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('partner_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    console.log(`[Partner Login] Partner logged in:`, {
      hostId: host.id,
      email: host.email,
      companyName: host.partnerCompanyName
    })

    return NextResponse.json({
      success: true,
      partner: {
        id: host.id,
        name: host.name,
        email: host.email,
        partnerCompanyName: host.partnerCompanyName,
        partnerSlug: host.partnerSlug
      }
    })

  } catch (error: any) {
    console.error('[Partner Login] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
