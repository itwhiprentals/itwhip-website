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
import { existingAccountGuard } from '@/app/lib/services/identityResolution'

// JWT secrets — guest vs host
const GUEST_JWT_SECRET = new TextEncoder().encode(process.env.GUEST_JWT_SECRET!)
const GUEST_JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.GUEST_JWT_REFRESH_SECRET!)
const HOST_JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const HOST_JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!)

// Generate JWT tokens — picks secrets based on isHost
async function generateJWTTokens(
  userId: string, email: string, name: string | null, role: string,
  isHost: boolean = false, hostId?: string
) {
  const now = Math.floor(Date.now() / 1000)
  const secret = isHost ? HOST_JWT_SECRET : GUEST_JWT_SECRET
  const refreshSecret = isHost ? HOST_JWT_REFRESH_SECRET : GUEST_JWT_REFRESH_SECRET

  const payload: any = { userId, email, name, role }
  if (isHost && hostId) {
    payload.hostId = hostId
    payload.isRentalHost = true
    payload.userType = 'host'
  } else {
    payload.userType = 'guest'
  }

  const accessToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 15 * 60)
    .setIssuer('itwhip')
    .setAudience(isHost ? 'itwhip-host' : 'itwhip-guest')
    .sign(secret)

  const refreshToken = await new SignJWT({ userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 7 * 24 * 60 * 60)
    .setIssuer('itwhip')
    .sign(refreshSecret)

  return { accessToken, refreshToken }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, email, name, firstName, lastName, userId, skipVerification, roleHint } = body
    const fullName = name || [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0]
    const isHostSignup = roleHint === 'host'
    console.log(`[Collect Email] Request body:`, JSON.stringify({ phone, email, firstName, lastName, roleHint, isHostSignup, fullName }))

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

    // Identity guard: check if this email (or phone) already belongs to an existing account
    const guard = await existingAccountGuard({ email: email.toLowerCase(), phone })
    if (guard?.found) {
      console.log(`[Collect Email] Identity guard: ${email} matches existing account ${guard.existingUserId}`)
      return NextResponse.json({
        error: 'EXISTING_ACCOUNT',
        message: 'You already have an account with us.',
        existingEmail: guard.maskedEmail,
      }, { status: 409 })
    }

    // Also check direct email uniqueness (in case IdentityLink doesn't have it yet)
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({
        error: 'EXISTING_ACCOUNT',
        message: 'You already have an account with us.',
        existingEmail: email.includes('@') ? `${email.slice(0, 2)}***@${email.split('@')[1]}` : undefined,
      }, { status: 409 })
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
          name: fullName,
          role: isHostSignup ? 'BUSINESS' : 'CLAIMED',
          emailVerified: false,
          emailVerificationCode: verificationCode,
          emailVerificationExpiry: codeExpiry
        }
      })
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          id: nanoid(),
          email,
          name: fullName,
          phone,
          phoneVerified: true,
          emailVerified: false,
          emailVerificationCode: verificationCode,
          emailVerificationExpiry: codeExpiry,
          role: isHostSignup ? 'BUSINESS' : 'CLAIMED',
          updatedAt: new Date()
        }
      })

      // Create ReviewerProfile (guest profile — all users get one)
      await prisma.reviewerProfile.create({
        data: {
          id: nanoid(),
          userId: user.id,
          name: fullName,
          email,
          city: 'Phoenix',
          state: 'AZ',
          phoneNumber: phone,
          phoneVerified: true,
          emailVerified: false,
          updatedAt: new Date()
        }
      })
    }

    // If host signup: create RentalHost record
    let hostRecord: any = null
    if (isHostSignup) {
      hostRecord = await prisma.rentalHost.findFirst({ where: { OR: [{ userId: user.id }, { email }] } })
      // Patch stale records from pre-fix signups (userId was null)
      if (hostRecord && !hostRecord.userId && user.id) {
        hostRecord = await prisma.rentalHost.update({ where: { id: hostRecord.id }, data: { userId: user.id } })
        console.log(`[Phone Login] Patched RentalHost userId: ${hostRecord.id} → ${user.id}`)
      }
      if (!hostRecord) {
        hostRecord = await prisma.rentalHost.create({
          data: {
            id: nanoid(),
            userId: user.id,
            email,
            name: fullName,
            phone: phone || '',
            city: 'Phoenix',
            state: 'AZ',
            hostType: 'REAL',
            approvalStatus: 'PENDING',
            dashboardAccess: false,
            active: false,
            isVerified: true,
            emailVerified: false,
            revenuePath: 'tiers',
            commissionRate: 0.25,
            currentCommissionRate: 0.25,
            managesOwnCars: true,
            isHostManager: false,
            managesOthersCars: false,
            updatedAt: new Date(),
          }
        })
        console.log(`[Phone Login] Created RentalHost: ${hostRecord.id} userId: ${hostRecord.userId} for ${email}`)
      }
    }

    // Send verification email (unless user chose to skip)
    if (!skipVerification) {
      const emailTemplate = getEmailVerificationTemplate(name, verificationCode)
      const emailResult = await sendEmail(email, emailTemplate.subject, emailTemplate.html, emailTemplate.text)
      // Track in EmailLog
      const { generateEmailReference, logEmail } = await import('@/app/lib/email/config')
      await logEmail({
        referenceId: generateEmailReference('VE'),
        recipientEmail: email,
        recipientName: name,
        subject: emailTemplate.subject,
        emailType: 'EMAIL_VERIFICATION',
        relatedType: 'user',
        relatedId: user.id,
        messageId: emailResult?.messageId || undefined,
      }).catch(() => {})
      console.log(`[Phone Login] Verification email sent to: ${email}`)
    } else {
      console.log(`[Phone Login] User skipped email verification: ${email}`)
    }

    // ============================================================================
    // ULTRA SECURITY: Log email collection with enhanced threat detection
    // ============================================================================
    const clientIp = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || ''
    const location = await getEnhancedLocation(clientIp, request.headers)
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

    // Generate JWT tokens — host secrets if host signup
    const { accessToken, refreshToken } = await generateJWTTokens(
      user.id,
      email,
      user.name,
      user.role,
      !!(isHostSignup && hostRecord),
      hostRecord?.id
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
      requiresEmailVerification: !skipVerification,
      user: {
        id: user.id,
        email: email,
        name: user.name,
        phone: user.phone,
        emailVerified: false
      },
      ...(hostRecord ? { host: { id: hostRecord.id, approvalStatus: hostRecord.approvalStatus, hostType: hostRecord.hostType } } : {}),
      accessToken,
      refreshToken,
      expiresIn: 15 * 60,
    })

  } catch (error) {
    console.error('[Phone Login Collect Email] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process email' },
      { status: 500 }
    )
  }
}
