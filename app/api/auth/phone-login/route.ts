// app/api/auth/phone-login/route.ts
// Phone-based login API - Create or authenticate user via phone number

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyPhoneToken } from '@/app/lib/firebase/admin'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'
import { phoneLoginRateLimit, getClientIp, createRateLimitResponse } from '@/app/lib/rate-limit'
import { getLocationFromIp } from '@/app/lib/security/geolocation'
import { sendEmail } from '@/app/lib/email/sender'
import { getNewDeviceAlertTemplate } from '@/app/lib/email/templates/new-device-alert'

// JWT secrets (must match check-dual-role verification)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)
const REFRESH_TOKEN_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret'
)

// Generate JWT tokens
async function generateJWTTokens(userId: string, email: string, name: string | null, role: string) {
  const now = Math.floor(Date.now() / 1000)

  const accessToken = await new SignJWT({
    userId,
    email,
    name,
    role,
    userType: 'guest'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 15 * 60) // 15 minutes
    .setIssuer('itwhip')
    .setAudience('itwhip-guest')
    .sign(JWT_SECRET)

  const refreshToken = await new SignJWT({
    userId,
    type: 'refresh'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 7 * 24 * 60 * 60) // 7 days
    .setIssuer('itwhip')
    .sign(REFRESH_TOKEN_SECRET)

  return { accessToken, refreshToken }
}

export async function POST(request: NextRequest) {
  try {
    // ============================================================================
    // RATE LIMITING
    // ============================================================================
    const clientIp = getClientIp(request)
    const rateLimit = await phoneLoginRateLimit.limit(clientIp)

    if (!rateLimit.success) {
      console.warn(`[Phone Login] Rate limit exceeded for IP: ${clientIp}`)
      return createRateLimitResponse(rateLimit.reset, rateLimit.remaining)
    }

    console.log(`[Phone Login] Rate limit check passed. Remaining: ${rateLimit.remaining}`)

    const { idToken, phone, roleHint } = await request.json()

    if (!idToken || !phone) {
      return NextResponse.json(
        { error: 'Firebase ID token and phone number are required' },
        { status: 400 }
      )
    }

    console.log(`[Phone Login] Verifying phone: ${phone}`)

    // Verify the Firebase ID token
    let verifiedPhone: string
    try {
      const result = await verifyPhoneToken(idToken)
      verifiedPhone = result.phoneNumber

      console.log(`[Phone Login] Firebase verified phone: ${verifiedPhone}`)

      // Ensure the phone from the token matches the phone from the request
      if (verifiedPhone !== phone) {
        console.error('[Phone Login] Phone mismatch!', { verifiedPhone, requestPhone: phone })
        return NextResponse.json(
          { error: 'Phone number verification failed' },
          { status: 400 }
        )
      }
    } catch (error: any) {
      console.error('[Phone Login] Firebase token verification failed:', error)

      // Log failed attempt to fleet monitoring
      const location = await getLocationFromIp(clientIp)
      await prisma.securityEvent.create({
        data: {
          id: nanoid(),
          type: 'LOGIN_FAILED',
          severity: 'MEDIUM',
          sourceIp: clientIp,
          targetId: phone,
          message: 'Phone verification failed',
          details: JSON.stringify({
            method: 'phone',
            phone: phone,
            reason: 'FIREBASE_VERIFICATION_FAILED',
            error: error.message,
            source: 'guest_portal'
          }),
          action: 'login_denied',
          blocked: false,
          userAgent: request.headers.get('user-agent') || '',
          country: location.country,
          city: location.city,
          timestamp: new Date()
        }
      })

      return NextResponse.json(
        { error: 'Phone verification failed. Please try again.' },
        { status: 400 }
      )
    }

    // Find or create user by phone number
    let user = await prisma.user.findFirst({
      where: { phone: verifiedPhone }
    })

    if (user) {
      // EXISTING USER: Check if email verified
      console.log(`[Phone Login] Existing user found: ${user.id}`)

      // Check if email is fake (phone_XXX@itwhip.temp)
      const isFakeEmail = user.email.includes('@itwhip.temp')

      // If fake email OR email not verified, require email
      if (isFakeEmail || !user.emailVerified) {
        return NextResponse.json({
          requiresEmail: true,
          userId: user.id,
          phone: verifiedPhone,
          message: 'Please provide your email address to complete sign-in'
        }, { status: 200 })
      }

      // Email verified - proceed with login
      await prisma.user.update({
        where: { id: user.id },
        data: {
          phoneVerified: true,
          phoneVerificationAttempts: 0,
          phoneVerificationSkipped: false,
        }
      })
    } else {
      // NEW USER: Always require email
      console.log(`[Phone Login] New user - email required`)
      return NextResponse.json({
        requiresEmail: true,
        userId: null,
        phone: verifiedPhone,
        message: 'Welcome! Please provide your email to create your account'
      }, { status: 200 })
    }

    // ============================================================================
    // DEVICE FINGERPRINTING + GEOLOCATION + SECURITY EVENT LOGGING
    // ============================================================================

    // Get device info and location
    const userAgent = request.headers.get('user-agent') || ''
    const deviceFingerprint = request.headers.get('x-fingerprint') // From client
    const location = await getLocationFromIp(clientIp)

    // Check if this is a new device
    const existingSession = deviceFingerprint ? await prisma.session.findFirst({
      where: {
        userId: user.id,
        fingerprint: deviceFingerprint
      }
    }) : null

    // If new device, send security alert email
    if (!existingSession && user.emailVerified && !user.email.includes('@itwhip.temp')) {
      try {
        const deviceAlert = getNewDeviceAlertTemplate(user.name, {
          browser: 'Browser', // TODO: Parse from userAgent
          os: 'OS', // TODO: Parse from userAgent
          ip: clientIp,
          location: location.country ? `${location.city || 'Unknown'}, ${location.country}` : 'Unknown',
          time: new Date().toLocaleString()
        })

        await sendEmail(user.email, deviceAlert.subject, deviceAlert.html)
        console.log(`[Phone Login] New device alert sent to: ${user.email}`)
      } catch (emailError) {
        console.error('[Phone Login] Failed to send new device alert:', emailError)
        // Don't fail the login if email fails
      }
    }

    // Log security event for FLEET MONITORING
    await prisma.securityEvent.create({
      data: {
        id: nanoid(),
        type: 'LOGIN_SUCCESS',
        severity: 'LOW',
        sourceIp: clientIp,
        targetId: user.email,
        message: 'Phone login successful',
        details: JSON.stringify({
          method: 'phone',
          phone: verifiedPhone,
          fingerprint: deviceFingerprint,
          newDevice: !existingSession,
          source: 'guest_portal',
          emailVerified: user.emailVerified,
          userId: user.id
        }),
        action: 'login_success',
        blocked: false,
        userAgent: userAgent,
        country: location.country,
        city: location.city,
        timestamp: new Date()
      }
    })

    console.log(`[Phone Login] Security event logged for fleet monitoring: ${user.id}`)

    // Generate JWT tokens
    const { accessToken, refreshToken } = await generateJWTTokens(
      user.id,
      user.email,
      user.name,
      user.role
    )

    console.log(`[Phone Login] Login successful for user: ${user.id}`)

    // Create response with cookies set in headers
    const response = NextResponse.json({
      success: true,
      message: 'Phone login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        role: user.role
      }
    })

    // Set access token cookie (15 minutes)
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    })

    // Set refresh token cookie (7 days)
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return response

  } catch (error) {
    console.error('[Phone Login] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred during phone login' },
      { status: 500 }
    )
  }
}
