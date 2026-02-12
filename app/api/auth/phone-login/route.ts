// app/api/auth/phone-login/route.ts
// Phone-based login API - Create or authenticate user via phone number
// SECURITY FIX: Added suspension check before allowing login

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyPhoneToken } from '@/app/lib/firebase/admin'
import { SignJWT } from 'jose'
import { nanoid } from 'nanoid'
import { phoneLoginRateLimit, getClientIp, createRateLimitResponse } from '@/app/lib/rate-limit'
import { getEnhancedLocation, detectImpossibleTravel } from '@/app/lib/security/geolocation'
import { detectBot, isLegitimateBot } from '@/app/lib/security/botDetection'
import { sendEmail } from '@/app/lib/email/sender'
import { getNewDeviceAlertTemplate } from '@/app/lib/email/templates/new-device-alert'
import { checkSuspendedIdentifiers } from '@/app/lib/services/identityResolution'

// JWT secrets (must match check-dual-role verification)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET!
)

// Generate JWT tokens
// SECURITY FIX: Include user status in JWT for runtime enforcement without DB lookup
async function generateJWTTokens(userId: string, email: string, name: string | null, role: string, status: string = 'ACTIVE') {
  const now = Math.floor(Date.now() / 1000)

  const accessToken = await new SignJWT({
    userId,
    email,
    name,
    role,
    status, // SECURITY: Include status for middleware enforcement
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
    .sign(JWT_REFRESH_SECRET)

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

      // Best-effort security logging (never block the error response)
      try {
        const userAgent = request.headers.get('user-agent') || ''
        const location = await getEnhancedLocation(clientIp, request.headers)
        const botDetection = detectBot(userAgent, clientIp, request.headers)
        const threatScore = location.riskScore + (botDetection.isBot ? botDetection.confidence : 0)

        await prisma.securityEvent.create({
          data: {
            id: nanoid(),
            type: 'LOGIN_FAILED',
            severity: (threatScore > 80 ? 'HIGH' : threatScore > 50 ? 'MEDIUM' : 'LOW') as any,
            sourceIp: clientIp,
            targetId: phone,
            message: 'Phone verification failed',
            details: JSON.stringify({
              method: 'phone', phone, reason: 'FIREBASE_VERIFICATION_FAILED',
              error: error.message, source: 'guest_portal',
              isVpn: location.isVpn, isProxy: location.isProxy, isTor: location.isTor,
              riskScore: location.riskScore, isBot: botDetection.isBot,
              botConfidence: botDetection.confidence, threatScore
            }),
            action: 'login_denied',
            blocked: false,
            userAgent: userAgent,
            country: location.country,
            city: location.city,
            timestamp: new Date()
          }
        })
      } catch (securityError) {
        console.error('[Phone Login] Security logging failed (non-blocking):', securityError)
      }

      return NextResponse.json(
        { error: 'Phone verification failed. Please try again.' },
        { status: 400 }
      )
    }

    // ============================================================================
    // SECURITY FIX: Check if phone is suspended BEFORE allowing login
    // ============================================================================
    const suspensionCheck = await checkSuspendedIdentifiers({ phone: verifiedPhone })
    if (suspensionCheck.blocked) {
      console.warn(`[Phone Login] BLOCKED: Suspended phone detected: ${verifiedPhone}`)

      // Log the blocked attempt
      try {
        await prisma.securityEvent.create({
          data: {
            id: nanoid(),
            type: 'LOGIN_BLOCKED',
            severity: 'HIGH' as any,
            sourceIp: clientIp,
            targetId: verifiedPhone,
            message: 'Login blocked - suspended phone',
            details: JSON.stringify({
              method: 'phone',
              phone: verifiedPhone,
              reason: 'SUSPENDED_IDENTIFIER',
              suspensionReason: suspensionCheck.reason,
              source: 'guest_portal'
            }),
            action: 'login_denied',
            blocked: true,
            userAgent: request.headers.get('user-agent') || '',
            timestamp: new Date()
          }
        })
      } catch (e) {
        console.error('[Phone Login] Security event logging failed:', e)
      }

      // SECURITY: Generic message - don't reveal suspension details
      return NextResponse.json(
        { error: 'Unable to log in at this time. Please contact support.' },
        { status: 403 }
      )
    }

    // Find or create user by phone number
    let user = await prisma.user.findFirst({
      where: { phone: verifiedPhone }
    })

    if (user) {
      // EXISTING USER: Check if email verified
      console.log(`[Phone Login] Existing user found: ${user.id}`)

      // SECURITY FIX: Check if user account is suspended/banned
      if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
        console.warn(`[Phone Login] BLOCKED: User ${user.id} is ${user.status}`)

        try {
          await prisma.securityEvent.create({
            data: {
              id: nanoid(),
              type: 'LOGIN_BLOCKED',
              severity: 'HIGH' as any,
              sourceIp: clientIp,
              targetId: user.email || '',
              message: `Login blocked - user ${(user.status as string).toLowerCase()}`,
              details: JSON.stringify({
                method: 'phone',
                phone: verifiedPhone,
                userId: user.id,
                reason: `USER_${user.status}`,
                source: 'guest_portal'
              }),
              action: 'login_denied',
              blocked: true,
              userAgent: request.headers.get('user-agent') || '',
              timestamp: new Date()
            }
          })
        } catch (e) {
          console.error('[Phone Login] Security event logging failed:', e)
        }

        return NextResponse.json(
          { error: 'Your account has been suspended. Please contact support.' },
          { status: 403 }
        )
      }

      // Check if email is fake (phone_XXX@itwhip.temp)
      const isFakeEmail = (user.email || '').includes('@itwhip.temp')

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
    // ULTRA SECURITY: Best-effort (NEVER blocks login if it fails)
    // ============================================================================
    try {
      const userAgent = request.headers.get('user-agent') || ''
      const deviceFingerprint = request.headers.get('x-fingerprint')
      const location = await getEnhancedLocation(clientIp, request.headers)
      const botDetection = detectBot(userAgent, clientIp, request.headers)
      const threatScore = location.riskScore + (botDetection.isBot ? botDetection.confidence : 0)

      // Block only high-confidence bots
      if (botDetection.isBot && botDetection.confidence > 80 && !(await isLegitimateBot(userAgent, clientIp))) {
        console.warn(`[Phone Login] Bot detected (${botDetection.confidence}%): ${botDetection.botName}`)
        try {
          await prisma.securityEvent.create({
            data: {
              id: nanoid(), type: 'LOGIN_FAILED', severity: 'HIGH' as any,
              sourceIp: clientIp, targetId: user.email || '',
              message: `Bot login blocked: ${botDetection.botName}`,
              details: JSON.stringify({ method: 'phone', phone: verifiedPhone, reason: 'BOT_DETECTED', botConfidence: botDetection.confidence, source: 'guest_portal' }),
              action: 'login_denied', blocked: true, userAgent, country: location.country, city: location.city, timestamp: new Date()
            }
          })
        } catch (e) { console.error('[Phone Login] Bot event log failed:', e) }

        return NextResponse.json(
          { error: 'Security check failed. Please try again from a supported browser.' },
          { status: 403 }
        )
      }

      // New device alert (best-effort)
      const existingSession = deviceFingerprint ? await prisma.session.findFirst({
        where: { userId: user.id, fingerprint: deviceFingerprint }
      }).catch(() => null) : null

      if (!existingSession && user.emailVerified && !(user.email || '').includes('@itwhip.temp')) {
        try {
          const deviceAlert = getNewDeviceAlertTemplate(user.name, {
            browser: 'Browser', os: 'OS', ip: clientIp,
            location: location.country ? `${location.city || 'Unknown'}, ${location.country}` : 'Unknown',
            time: new Date().toLocaleString()
          })
          await sendEmail(user.email!, deviceAlert.subject, deviceAlert.html, deviceAlert.html)
          console.log(`[Phone Login] New device alert sent to: ${user.email}`)
        } catch (emailError) {
          console.error('[Phone Login] New device alert failed (non-blocking):', emailError)
        }
      }

      // Impossible travel detection (best-effort)
      let impossibleTravel = false
      if (location.latitude && location.longitude) {
        try {
          const lastLogin = await prisma.securityEvent.findFirst({
            where: { targetId: user.email || '', type: 'LOGIN_SUCCESS' },
            orderBy: { timestamp: 'desc' },
            select: { details: true, timestamp: true }
          })
          if (lastLogin?.details) {
            const lastDetails = JSON.parse(lastLogin.details)
            if (lastDetails.latitude && lastDetails.longitude) {
              const travel = detectImpossibleTravel(
                lastDetails.latitude, lastDetails.longitude, lastLogin.timestamp,
                location.latitude, location.longitude, new Date()
              )
              if (travel.impossible) {
                impossibleTravel = true
                console.warn(`[Phone Login] ⚠️ Impossible travel: ${Math.round(travel.distance)}km in ${Math.round(travel.speed)}km/h`)
              }
            }
          }
        } catch (e) {
          console.error('[Phone Login] Impossible travel check failed:', e)
        }
      }

      // Log security event for Fleet monitoring (best-effort)
      const eventSeverity = impossibleTravel ? 'HIGH' : threatScore > 50 ? 'MEDIUM' : 'LOW'
      await prisma.securityEvent.create({
        data: {
          id: nanoid(), type: 'LOGIN_SUCCESS',
          severity: eventSeverity as any,
          sourceIp: clientIp, targetId: user.email || '',
          message: impossibleTravel ? 'Phone login successful (IMPOSSIBLE TRAVEL)' : 'Phone login successful',
          details: JSON.stringify({
            method: 'phone', phone: verifiedPhone, fingerprint: deviceFingerprint,
            newDevice: !existingSession, source: 'guest_portal',
            emailVerified: user.emailVerified, userId: user.id,
            country: location.country, city: location.city,
            latitude: location.latitude, longitude: location.longitude,
            isVpn: location.isVpn, isProxy: location.isProxy, isTor: location.isTor,
            riskScore: location.riskScore,
            isBot: botDetection.isBot, botConfidence: botDetection.confidence,
            isp: location.isp, asn: location.asn, organization: location.organization,
            impossibleTravel,
            threatScore
          }),
          action: 'login_success', blocked: false, userAgent,
          country: location.country, city: location.city, timestamp: new Date()
        }
      })

      // Create session record for device tracking (best-effort)
      if (deviceFingerprint) {
        try {
          await prisma.session.create({
            data: {
              userId: user.id,
              token: nanoid(),
              ipAddress: clientIp,
              userAgent,
              fingerprint: deviceFingerprint,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            }
          })
          console.log(`[Phone Login] Session created for device: ${deviceFingerprint.substring(0, 8)}...`)
        } catch (e) {
          console.error('[Phone Login] Session creation failed (non-blocking):', e)
        }
      }

      console.log(`[Phone Login] Security check complete - Threat: ${threatScore}${impossibleTravel ? ' ⚠️ IMPOSSIBLE TRAVEL' : ''}`)
    } catch (securityError) {
      // CRITICAL: Security monitoring should NEVER block a successful login
      console.error('[Phone Login] Security monitoring failed (non-blocking):', securityError)
    }

    // Generate JWT tokens (includes status for runtime enforcement)
    const { accessToken, refreshToken } = await generateJWTTokens(
      user.id,
      user.email || '',
      user.name,
      user.role as any,
      (user.status as any) || 'ACTIVE'
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
