// app/api/partner/login/route.ts
// Partner Login API - Authenticate fleet partners

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verify } from 'argon2'
import { SignJWT } from 'jose'
import { logFailedLogin, logSuccessfulLogin, isIpBlocked } from '@/app/lib/security/loginMonitor'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

export async function POST(request: NextRequest) {
  // Get request info for security logging
  const userAgent = request.headers.get('user-agent') || 'Unknown'
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'Unknown'

  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if IP is blocked due to too many attempts
    const blocked = await isIpBlocked(ip)
    if (blocked) {
      await logFailedLogin({
        email,
        source: 'partner',
        reason: 'RATE_LIMITED',
        ip,
        userAgent
      })
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Find the host by email
    const host = await prisma.rentalHost.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        hostType: true,
        approvalStatus: true,
        partnerCompanyName: true,
        partnerSlug: true,
        lastLoginAt: true,  // Include lastLoginAt for tracking
        user: {
          select: {
            passwordHash: true
          }
        }
      }
    })

    if (!host) {
      await logFailedLogin({
        email,
        source: 'partner',
        reason: 'ACCOUNT_NOT_FOUND',
        ip,
        userAgent
      })
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Allow all host types since portals are unified
    // (Previously restricted to FLEET_PARTNER and PARTNER only)

    // Check if partner is approved
    if (host.approvalStatus !== 'APPROVED') {
      if (host.approvalStatus === 'PENDING') {
        await logFailedLogin({
          email,
          source: 'partner',
          reason: 'ACCOUNT_PENDING',
          ip,
          userAgent
        })
        return NextResponse.json(
          { error: 'Your partner application is still under review' },
          { status: 403 }
        )
      }
      if (host.approvalStatus === 'SUSPENDED') {
        await logFailedLogin({
          email,
          source: 'partner',
          reason: 'ACCOUNT_SUSPENDED',
          ip,
          userAgent
        })
        return NextResponse.json(
          { error: 'Your partner account has been suspended. Please contact support.' },
          { status: 403 }
        )
      }
      await logFailedLogin({
        email,
        source: 'partner',
        reason: 'ACCOUNT_INACTIVE',
        ip,
        userAgent,
        metadata: { approvalStatus: host.approvalStatus }
      })
      return NextResponse.json(
        { error: 'Your partner account is not active' },
        { status: 403 }
      )
    }

    // Verify password
    const passwordHash = host.user?.passwordHash
    if (!passwordHash) {
      console.log('[Partner Login] No password hash found for:', email)
      await logFailedLogin({
        email,
        source: 'partner',
        reason: 'PASSWORD_NOT_SET',
        ip,
        userAgent
      })
      return NextResponse.json(
        { error: 'Password not set. Please reset your password.' },
        { status: 401 }
      )
    }

    const isValid = await verify(passwordHash, password)
    if (!isValid) {
      console.log('[Partner Login] Invalid password for:', email)
      const result = await logFailedLogin({
        email,
        source: 'partner',
        reason: 'INVALID_CREDENTIALS',
        ip,
        userAgent
      })

      // Check if account is now locked
      if (result.blocked) {
        return NextResponse.json(
          { error: result.message || 'Too many failed attempts. Account temporarily locked.' },
          { status: 429 }
        )
      }

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create JWT token — must match host login payload for middleware compatibility
    const token = await new SignJWT({
      userId: host.userId || host.id,
      hostId: host.id,
      email: host.email,
      name: host.name,
      role: 'BUSINESS',
      isRentalHost: true,
      approvalStatus: host.approvalStatus,
      hostType: host.hostType,
      isPartner: true
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    // Log successful login to security events
    await logSuccessfulLogin({
      userId: host.id,
      email: host.email,
      source: 'partner',
      ip,
      userAgent
    })

    // Update login timestamps: move current lastLoginAt to previousLoginAt, set new lastLoginAt
    try {
      await prisma.rentalHost.update({
        where: { id: host.id },
        data: {
          previousLoginAt: host.lastLoginAt,  // Store the previous login time
          lastLoginAt: new Date()              // Update to current time
        }
      })
    } catch (updateError) {
      // Don't fail login if update fails
      console.error('[Partner Login] Login timestamp update error:', updateError)
    }

    // Record login activity for tracking last login
    try {
      await prisma.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          action: 'LOGIN',
          entityType: 'RentalHost',
          entityId: host.id,
          category: 'AUTH',
          ipAddress: ip,
          userAgent: userAgent,
          newValue: JSON.stringify({
            hostType: host.hostType,
            companyName: host.partnerCompanyName
          })
        }
      })
    } catch (logError) {
      // Don't fail login if activity logging fails
      console.error('[Partner Login] Activity log error:', logError)
    }

    console.log(`[Partner Login] Partner logged in:`, {
      hostId: host.id,
      email: host.email,
      companyName: host.partnerCompanyName
    })

    // Build response FIRST, then set cookies ON the response object
    // (cookies().set() from next/headers doesn't attach to NextResponse.json())
    const response = NextResponse.json({
      success: true,
      partner: {
        id: host.id,
        name: host.name,
        email: host.email,
        partnerCompanyName: host.partnerCompanyName,
        partnerSlug: host.partnerSlug
      }
    })

    // Set cookies on the response — mirrors host login pattern
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    }

    response.cookies.set('partner_token', token, cookieOptions)
    response.cookies.set('hostAccessToken', token, cookieOptions)
    response.cookies.set('accessToken', token, cookieOptions)

    // Set current_mode so check-dual-role knows the role
    response.cookies.set('current_mode', 'host', {
      httpOnly: false, // Allow client-side JS to read
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    return response

  } catch (error: any) {
    console.error('[Partner Login] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
