// Collect email + name from new phone users
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'
import { sendEmail } from '@/app/lib/email/sender'
import { getEmailVerificationTemplate, generateVerificationCode } from '@/app/lib/email/templates/email-verification'
import { getClientIp } from '@/app/lib/rate-limit'
import { getEnhancedLocation } from '@/app/lib/security/geolocation'
import { detectBot } from '@/app/lib/security/botDetection'

// JWT secrets
const GUEST_JWT_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET || 'fallback-guest-secret-key'
)
const GUEST_JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_REFRESH_SECRET || 'fallback-refresh-secret'
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
    .sign(GUEST_JWT_SECRET)

  const refreshToken = await new SignJWT({
    userId,
    type: 'refresh'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 7 * 24 * 60 * 60) // 7 days
    .setIssuer('itwhip')
    .sign(GUEST_JWT_REFRESH_SECRET)

  return { accessToken, refreshToken }
}

export async function POST(request: NextRequest) {
  try {
    const { phone, email, name, userId } = await request.json()

    if (!phone || !email) {
      return NextResponse.json(
        { error: 'Phone and email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'This email is already registered. Please use a different email or sign in.' },
        { status: 400 }
      )
    }

    // Generate verification code
    const verificationCode = generateVerificationCode()
    const codeExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    let user

    // Update existing user OR create new user
    if (userId) {
      // Update existing user (had fake email)
      user = await prisma.user.update({
        where: { id: userId },
        data: {
          email,
          name,
          emailVerified: false,
          emailVerificationCode: verificationCode,
          emailVerificationExpiry: codeExpiry
        }
      })
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name,
          phone,
          phoneVerified: true,
          emailVerified: false,
          emailVerificationCode: verificationCode,
          emailVerificationExpiry: codeExpiry,
          role: 'CLAIMED'
        }
      })

      // Create ReviewerProfile
      await prisma.reviewerProfile.create({
        data: {
          id: nanoid(),
          userId: user.id,
          name: name || email.split('@')[0],
          email,
          city: 'Unknown',
          phoneNumber: phone,
          phoneVerified: true,
          emailVerified: false,
          updatedAt: new Date()
        }
      })
    }

    // Send verification email
    const emailTemplate = getEmailVerificationTemplate(name, verificationCode)
    await sendEmail(email, emailTemplate.subject, emailTemplate.html, emailTemplate.text)

    console.log(`[Phone Login] Verification email sent to: ${email}`)

    // ============================================================================
    // ULTRA SECURITY: Log email collection with enhanced threat detection
    // ============================================================================
    const clientIp = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || ''
    const location = await getEnhancedLocation(clientIp)
    const botDetection = detectBot(userAgent, clientIp, request.headers)
    const threatScore = location.riskScore + (botDetection.isBot ? botDetection.confidence : 0)

    await prisma.securityEvent.create({
      data: {
        id: nanoid(),
        type: 'EMAIL_COLLECTED',
        severity: threatScore > 50 ? 'MEDIUM' : 'LOW',
        sourceIp: clientIp,
        targetId: email,
        message: 'Email collected for phone user',
        details: JSON.stringify({
          method: 'phone',
          phone: phone,
          emailProvided: email,
          nameProvided: name,
          userId: user.id,
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
        action: 'email_collected',
        blocked: false,
        userAgent: userAgent,
        country: location.country,
        city: location.city,
        timestamp: new Date()
      }
    })

    console.log(`[Phone Login] Email collection logged - Risk: ${location.riskScore}, Bot: ${botDetection.confidence}`)

    // Generate JWT tokens
    const { accessToken, refreshToken } = await generateJWTTokens(
      user.id,
      user.email,
      user.name,
      user.role
    )

    // Set auth cookies
    const cookieStore = await cookies()
    cookieStore.set('guest_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/'
    })
    cookieStore.set('guest_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    })

    return NextResponse.json({
      success: true,
      requiresEmailVerification: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        emailVerified: false
      }
    })

  } catch (error) {
    console.error('[Phone Login Collect Email] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process email' },
      { status: 500 }
    )
  }
}
