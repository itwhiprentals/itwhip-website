// app/api/auth/phone-login/route.ts
// Phone-based login API - Create or authenticate user via phone number

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyPhoneToken } from '@/app/lib/firebase/admin'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'
import { phoneLoginRateLimit, getClientIp, createRateLimitResponse } from '@/app/lib/rate-limit'
import { getEnhancedLocation } from '@/app/lib/security/geolocation'
import { detectBot, isLegitimateBot } from '@/app/lib/security/botDetection'
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

      // Enhanced geolocation + bot detection for failed attempts
      const userAgent = request.headers.get('user-agent') || ''
      const location = await getEnhancedLocation(clientIp)
      const botDetection = detectBot(userAgent, clientIp, request.headers)

      // Calculate total threat score
      const threatScore = location.riskScore + (botDetection.isBot ? botDetection.confidence : 0)

      // Log failed attempt to fleet monitoring with enhanced data
      await prisma.securityEvent.create({
        data: {
          id: nanoid(),
          type: 'LOGIN_FAILED',
          severity: threatScore > 80 ? 'HIGH' : threatScore > 50 ? 'MEDIUM' : 'LOW',
          sourceIp: clientIp,
          targetId: phone,
          message: 'Phone verification failed',
          details: JSON.stringify({
            method: 'phone',
            phone: phone,
            reason: 'FIREBASE_VERIFICATION_FAILED',
            error: error.message,
            source: 'guest_portal',
            // Enhanced location data
            zipCode: location.zipCode,
            isp: location.isp,
            asn: location.asn,
            organization: location.organization,
            // Threat intelligence
            isVpn: location.isVpn,
            isProxy: location.isProxy,
            isTor: location.isTor,
            isDatacenter: location.isDatacenter,
            isHosting: location.isHosting,
            riskScore: location.riskScore,
            // Bot detection
            isBot: botDetection.isBot,
            botName: botDetection.botName,
            botConfidence: botDetection.confidence,
            botReasons: botDetection.reasons,
            threatScore
          }),
          action: 'login_denied',
          blocked: false,
          userAgent: userAgent,
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
    // ULTRA SECURITY: Enhanced Geolocation + Bot Detection + Device Fingerprinting
    // ============================================================================

    // Get device info and enhanced location
    const userAgent = request.headers.get('user-agent') || ''
    const deviceFingerprint = request.headers.get('x-fingerprint') // From client
    const location = await getEnhancedLocation(clientIp)
    const botDetection = detectBot(userAgent, clientIp, request.headers)

    // Calculate total threat score
    const threatScore = location.riskScore + (botDetection.isBot ? botDetection.confidence : 0)

    // Block if high-confidence bot (unless legitimate search engine)
    if (botDetection.isBot && botDetection.confidence > 80 && !isLegitimateBot(userAgent, clientIp)) {
      console.warn(`[Phone Login] Bot detected (${botDetection.confidence}% confidence): ${botDetection.botName}`)

      await prisma.securityEvent.create({
        data: {
          id: nanoid(),
          type: 'LOGIN_FAILED',
          severity: 'HIGH',
          sourceIp: clientIp,
          targetId: user.email,
          message: `Bot login blocked: ${botDetection.botName}`,
          details: JSON.stringify({
            method: 'phone',
            phone: verifiedPhone,
            reason: 'BOT_DETECTED',
            botName: botDetection.botName,
            botConfidence: botDetection.confidence,
            botReasons: botDetection.reasons,
            source: 'guest_portal'
          }),
          action: 'login_denied',
          blocked: true,
          userAgent: userAgent,
          country: location.country,
          city: location.city,
          timestamp: new Date()
        }
      })

      return NextResponse.json(
        { error: 'Security check failed. Please try again from a supported browser.' },
        { status: 403 }
      )
    }

    // Warn for VPN/Proxy/Tor (don't block, just log)
    if (location.isVpn || location.isProxy || location.isTor) {
      console.warn(`[Phone Login] Suspicious connection detected - VPN:${location.isVpn} Proxy:${location.isProxy} Tor:${location.isTor}`)
    }

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

    // Log security event for FLEET MONITORING with ULTRA SECURITY data
    await prisma.securityEvent.create({
      data: {
        id: nanoid(),
        type: 'LOGIN_SUCCESS',
        severity: threatScore > 50 ? 'MEDIUM' : 'LOW',
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
          userId: user.id,
          // Enhanced location data (ZIP, ISP, ASN)
          zipCode: location.zipCode,
          isp: location.isp,
          asn: location.asn,
          organization: location.organization,
          latitude: location.latitude,
          longitude: location.longitude,
          timezone: location.timezone,
          // Threat intelligence (VPN/Proxy/Tor/Datacenter/Hosting)
          isVpn: location.isVpn,
          isProxy: location.isProxy,
          isTor: location.isTor,
          isDatacenter: location.isDatacenter,
          isHosting: location.isHosting,
          riskScore: location.riskScore,
          // Bot detection (1000+ signatures)
          isBot: botDetection.isBot,
          botName: botDetection.botName,
          botConfidence: botDetection.confidence,
          botReasons: botDetection.reasons,
          // Total threat score (risk + bot confidence)
          threatScore
        }),
        action: 'login_success',
        blocked: false,
        userAgent: userAgent,
        country: location.country,
        city: location.city,
        timestamp: new Date()
      }
    })

    console.log(`[Phone Login] Ultra security check complete - Risk: ${location.riskScore}, Bot: ${botDetection.confidence}, Total: ${threatScore}`)

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
