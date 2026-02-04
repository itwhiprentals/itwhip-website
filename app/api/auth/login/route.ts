// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import * as argon2 from 'argon2'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { nanoid } from 'nanoid'
import db from '@/app/lib/db'
import { prisma } from '@/app/lib/database/prisma'
import { loginRateLimit, getClientIp, createRateLimitResponse } from '@/app/lib/rate-limit'
import { logFailedLogin, logSuccessfulLogin } from '@/app/lib/security/loginMonitor'

// Lockout thresholds
const LOCKOUT_TIERS = [
  { attempts: 5, duration: 5 * 60 * 1000 },    // 5 attempts -> 5 minutes
  { attempts: 10, duration: 30 * 60 * 1000 },  // 10 attempts -> 30 minutes
  { attempts: 15, duration: 24 * 60 * 60 * 1000 } // 15 attempts -> 24 hours
]

// Helper to calculate lockout duration based on failed attempts
function getLockoutDuration(failedAttempts: number): number {
  for (const tier of [...LOCKOUT_TIERS].reverse()) {
    if (failedAttempts >= tier.attempts) {
      return tier.duration
    }
  }
  return 0
}

// Helper to format remaining lockout time
function formatLockoutTime(ms: number): string {
  const minutes = Math.ceil(ms / 60000)
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  const hours = Math.ceil(minutes / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''}`
  const days = Math.ceil(hours / 24)
  return `${days} day${days !== 1 ? 's' : ''}`
}

// Get JWT secrets
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
)

// Argon2 configuration (matching signup)
const ARGON2_CONFIG = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
  hashLength: 32,
  saltLength: 16
}

// Helper function to verify password with hybrid approach
async function verifyPassword(password: string, hash: string): Promise<{ valid: boolean, needsRehash: boolean }> {
  try {
    // Try Argon2 first (new format)
    if (hash.startsWith('$argon2id$')) {
      const valid = await argon2.verify(hash, password)
      return { valid, needsRehash: false }
    }
    
    // Fallback to bcrypt (legacy format)
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      const valid = await bcrypt.compare(password, hash)
      return { valid, needsRehash: valid } // If valid, flag for rehashing to Argon2
    }
    
    // Unknown hash format
    console.warn('Unknown password hash format')
    return { valid: false, needsRehash: false }
    
  } catch (error) {
    console.error('Password verification error:', error)
    return { valid: false, needsRehash: false }
  }
}

// Helper function to upgrade bcrypt hash to Argon2
async function upgradePasswordHash(userId: string, password: string): Promise<void> {
  try {
    const newHash = await argon2.hash(password, ARGON2_CONFIG)
    await db.updateUserPasswordHash(userId, newHash)
    console.log(`Password hash upgraded to Argon2 for user: ${userId}`)
  } catch (error) {
    console.error('Failed to upgrade password hash:', error)
    // Don't throw - login should still succeed even if upgrade fails
  }
}

export async function POST(request: NextRequest) {
  try {
    // ✅ STEP 1: Rate Limit Check (5 attempts per 15 minutes)
    const clientIp = getClientIp(request)
    const identifier = `login:${clientIp}`
    
    const { success, limit, reset, remaining } = await loginRateLimit.limit(identifier)
    
    if (!success) {
      console.warn(`🚨 Rate limit exceeded for IP: ${clientIp}`)
      const userAgent = request.headers.get('user-agent') || 'unknown'
      await logFailedLogin({
        email: 'unknown',
        source: 'guest',
        reason: 'RATE_LIMITED',
        ip: clientIp,
        userAgent,
        headers: request.headers
      })
      return createRateLimitResponse(reset, remaining)
    }

    console.log(`✅ Rate limit check passed for ${clientIp} (${remaining}/${limit} remaining)`)

    // ✅ STEP 2: Parse and validate input
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // ✅ STEP 3: Get user from database
    const user = await db.getUserByEmail(email.toLowerCase())

    if (!user) {
      const userAgent = request.headers.get('user-agent') || 'unknown'
      await logFailedLogin({
        email: email.toLowerCase(),
        source: 'guest',
        reason: 'ACCOUNT_NOT_FOUND',
        ip: clientIp,
        userAgent,
        headers: request.headers
      })
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // ✅ STEP 3.5: Get lockout info from Prisma
    const userLockout = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        failedLoginAttempts: true,
        lastFailedLoginAt: true,
        lockedUntil: true,
        status: true
      }
    })

    // ✅ STEP 3.6: Check if account is locked
    if (userLockout?.lockedUntil && new Date() < userLockout.lockedUntil) {
      const remainingMs = userLockout.lockedUntil.getTime() - Date.now()
      const userAgent = request.headers.get('user-agent') || 'unknown'
      await logFailedLogin({
        email: email.toLowerCase(),
        source: 'guest',
        reason: 'RATE_LIMITED',
        ip: clientIp,
        userAgent,
        metadata: { lockedUntil: userLockout.lockedUntil.toISOString() }
      })
      return NextResponse.json(
        {
          error: `Account is temporarily locked. Try again in ${formatLockoutTime(remainingMs)}.`,
          lockedUntil: userLockout.lockedUntil.toISOString(),
          remainingSeconds: Math.ceil(remainingMs / 1000)
        },
        { status: 423 } // 423 Locked
      )
    }

    // ✅ STEP 3.7: Check if account is pending deletion
    if (userLockout?.status === 'PENDING_DELETION') {
      // Allow login but they can cancel deletion from settings
      console.log(`[Login] User ${user.email} logging in with pending deletion`)
    }

    // ✅ STEP 4: Verify password with hybrid approach
    const { valid: passwordValid, needsRehash } = await verifyPassword(password, user.password_hash)

    if (!passwordValid) {
      // Log the failed attempt to SecurityEvent
      const userAgent = request.headers.get('user-agent') || 'unknown'
      await logFailedLogin({
        email: email.toLowerCase(),
        source: 'guest',
        reason: 'INVALID_CREDENTIALS',
        ip: clientIp,
        userAgent,
        headers: request.headers
      })

      // Increment failed attempts
      const newFailedAttempts = (userLockout?.failedLoginAttempts || 0) + 1
      const lockoutDuration = getLockoutDuration(newFailedAttempts)
      const lockedUntil = lockoutDuration > 0 ? new Date(Date.now() + lockoutDuration) : null

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailedAttempts,
          lastFailedLoginAt: new Date(),
          lockedUntil
        }
      })

      // If account is now locked, send security alert email
      if (lockedUntil) {
        console.log(`[Login] Account locked for ${user.email} (${newFailedAttempts} failed attempts)`)

        // Send security alert in background
        sendSecurityAlertEmail(user.email, user.name, clientIp, newFailedAttempts, lockedUntil)
          .catch(err => console.error('[Login] Security email failed:', err))

        return NextResponse.json(
          {
            error: `Too many failed attempts. Account locked for ${formatLockoutTime(lockoutDuration)}.`,
            lockedUntil: lockedUntil.toISOString(),
            remainingSeconds: Math.ceil(lockoutDuration / 1000)
          },
          { status: 423 }
        )
      }

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // ✅ STEP 4.5: Reset failed attempts on successful login
    if (userLockout?.failedLoginAttempts && userLockout.failedLoginAttempts > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lastFailedLoginAt: null,
          lockedUntil: null
        }
      })
    }

    // ✅ STEP 5: Check if user is active
    if (!user.is_active) {
      const userAgent = request.headers.get('user-agent') || 'unknown'
      await logFailedLogin({
        email: email.toLowerCase(),
        source: 'guest',
        reason: 'ACCOUNT_INACTIVE',
        ip: clientIp,
        userAgent,
        headers: request.headers
      })
      return NextResponse.json(
        { error: 'Account is deactivated. Please contact support.' },
        { status: 403 }
      )
    }

    // ✅ STEP 5.5: GUARD CHECK - Detect HOST trying to access GUEST login
    // If user is a HOST (has RentalHost profile), they should use host login
    const hostProfile = await prisma.rentalHost.findFirst({
      where: { OR: [{ userId: user.id }, { email: user.email.toLowerCase() }] },
      select: { id: true, approvalStatus: true }
    })

    const guestProfile = await prisma.reviewerProfile.findFirst({
      where: { OR: [{ userId: user.id }, { email: user.email.toLowerCase() }] },
      select: { id: true }
    })

    // HOST without GUEST profile trying to login via guest login
    if (hostProfile && !guestProfile) {
      console.log(`[Login] GUARD: HOST user ${user.email} tried guest login - blocking`)
      const userAgent = request.headers.get('user-agent') || 'unknown'
      await logFailedLogin({
        email: email.toLowerCase(),
        source: 'guest',
        reason: 'INVALID_ACCOUNT_TYPE',
        ip: clientIp,
        userAgent,
        metadata: { hasHostProfile: true, hasGuestProfile: false }
      })
      return NextResponse.json(
        {
          error: 'Host account detected',
          guard: {
            type: 'host-on-guest',
            title: 'Host Account Detected',
            message: 'You have a Host account. Please use the Host login page to access your account.',
            actions: {
              primary: { label: 'Go to Host Login', url: '/host/login' },
              secondary: { label: 'Link a Guest Account', url: '/host/dashboard?tab=account-linking' }
            }
          }
        },
        { status: 403 }
      )
    }

    // ✅ STEP 6: Upgrade password hash if needed (bcrypt -> Argon2)
    if (needsRehash) {
      // Run in background - don't wait for completion
      upgradePasswordHash(user.id, password).catch(err => {
        console.error('Background password upgrade failed:', err)
      })
    }

    // ✅ STEP 7: Generate tokens
    const tokenId = nanoid()
    const refreshTokenId = nanoid()
    const refreshFamily = nanoid()

    // Create access token (15 minutes)
    const accessToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      jti: tokenId
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(JWT_SECRET)

    // Create refresh token (7 days)
    const refreshToken = await new SignJWT({
      userId: user.id,
      family: refreshFamily,
      jti: refreshTokenId
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_REFRESH_SECRET)

    // ✅ STEP 8: Save refresh token to database
    await db.saveRefreshToken({
      userId: user.id,
      token: refreshToken,
      family: refreshFamily,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })

    // ✅ STEP 9: Update last login
    await db.updateLastLogin(user.id)

    // ✅ STEP 9.5: Log successful login to SecurityEvent
    const userAgent = request.headers.get('user-agent') || 'unknown'
    await logSuccessfulLogin({
      userId: user.id,
      email: user.email,
      source: 'guest',
      ip: clientIp,
      userAgent,
      headers: request.headers
    })

    // ✅ STEP 9.6: Create session record for device tracking (best-effort)
    try {
      const deviceFingerprint = request.headers.get('x-fingerprint')
      if (deviceFingerprint) {
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
      }
    } catch (e) {
      console.error('[Login] Session creation failed (non-blocking):', e)
    }

    // ✅ STEP 10: Create response with cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      redirect: '/dashboard' // Guest login goes to dashboard
    })

    // Set secure HTTP-only cookies
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    })

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    // ✅ STEP 10.5: Clear any stale partner/host cookies to prevent dual-role confusion
    // When guest logs in, clear partner cookies so header doesn't show wrong role
    response.cookies.set('partner_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
    })
    response.cookies.set('host_access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
    })

    // ✅ STEP 10.6: Set current_mode cookie for role detection
    // This is the authoritative source for check-dual-role API
    response.cookies.set('current_mode', 'guest', {
      httpOnly: false, // Allow client-side JS to read for instant UI updates
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    // ✅ STEP 11: Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', limit.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString())

    console.log(`✅ User logged in successfully: ${user.email} ${needsRehash ? '(password upgraded)' : '(argon2)'}`)
    
    return response

  } catch (error) {
    console.error('❌ Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}

// Security Alert Email for Account Lockout
async function sendSecurityAlertEmail(
  email: string,
  name: string | null,
  ipAddress: string,
  failedAttempts: number,
  lockedUntil: Date
): Promise<void> {
  try {
    const { sendEmail } = await import('@/app/lib/email/sender')

    const lockDuration = formatLockoutTime(lockedUntil.getTime() - Date.now())
    const lockTime = lockedUntil.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    })

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ItWhip</h1>
                      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Security Alert</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <div style="text-align: center; margin-bottom: 24px;">
                        <div style="width: 64px; height: 64px; background-color: #fef2f2; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                          <span style="font-size: 32px;">🔒</span>
                        </div>
                      </div>

                      <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">Account Temporarily Locked</h2>

                      <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                        Hi ${name || 'User'},
                      </p>

                      <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 24px;">
                        Your ItWhip account has been temporarily locked due to multiple failed login attempts. This is a security measure to protect your account.
                      </p>

                      <!-- Alert Box -->
                      <div style="background-color: #fef2f2; border: 2px solid #fecaca; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding-bottom: 12px;">
                              <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 500;">Failed Attempts</p>
                              <p style="margin: 4px 0 0; color: #dc2626; font-size: 18px; font-weight: 700;">${failedAttempts}</p>
                            </td>
                            <td style="padding-bottom: 12px;">
                              <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 500;">Lock Duration</p>
                              <p style="margin: 4px 0 0; color: #dc2626; font-size: 18px; font-weight: 700;">${lockDuration}</p>
                            </td>
                          </tr>
                          <tr>
                            <td colspan="2">
                              <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 500;">IP Address</p>
                              <p style="margin: 4px 0 0; color: #dc2626; font-size: 16px; font-family: monospace;">${ipAddress}</p>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 24px;">
                        Your account will be automatically unlocked at:<br>
                        <strong style="color: #1f2937;">${lockTime}</strong>
                      </p>

                      <!-- Warning Section -->
                      <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                          <strong>Wasn't you?</strong> If you didn't attempt to log in, someone may be trying to access your account. We recommend resetting your password immediately.
                        </p>
                      </div>

                      <!-- Reset Password Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || 'https://itwhip.com'}/auth/forgot-password" style="display: inline-block; padding: 14px 28px; background-color: #dc2626; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.2);">Reset Password</a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                        If you have any questions or concerns, please contact our support team at
                        <a href="mailto:info@itwhip.com" style="color: #dc2626; text-decoration: none;">info@itwhip.com</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                      <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                        ItWhip Technologies, Inc.
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        © 2025 ItWhip. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `

    const textContent = `
Security Alert: Account Temporarily Locked

Hi ${name || 'User'},

Your ItWhip account has been temporarily locked due to ${failedAttempts} failed login attempts. This is a security measure to protect your account.

Details:
- Failed Attempts: ${failedAttempts}
- Lock Duration: ${lockDuration}
- IP Address: ${ipAddress}
- Unlocks At: ${lockTime}

Wasn't you?
If you didn't attempt to log in, someone may be trying to access your account. We recommend resetting your password immediately at:
${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || 'https://itwhip.com'}/auth/forgot-password

If you have any questions, contact info@itwhip.com

- ItWhip Security Team
    `.trim()

    await sendEmail(
      email,
      '🔒 Security Alert: Your ItWhip Account Has Been Locked',
      htmlContent,
      textContent
    )

    console.log(`[Login] Security alert email sent to: ${email}`)
  } catch (error) {
    console.error('[Login] Failed to send security alert email:', error)
    throw error
  }
}