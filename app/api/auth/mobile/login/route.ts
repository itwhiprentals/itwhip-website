// app/api/auth/mobile/login/route.ts
// Mobile-specific login endpoint — returns JWT tokens in the response body
// instead of httpOnly cookies (React Native can't access httpOnly cookies).
// Uses the exact same auth logic as the web login endpoint.

import { NextRequest, NextResponse } from 'next/server'
import * as argon2 from 'argon2'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { nanoid } from 'nanoid'
import db from '@/app/lib/db'
import { prisma } from '@/app/lib/database/prisma'
import { loginRateLimit, getClientIp, createRateLimitResponse } from '@/app/lib/rate-limit'
import { logFailedLogin, logSuccessfulLogin } from '@/app/lib/security/loginMonitor'

// Lockout thresholds (same as web login)
const LOCKOUT_TIERS = [
  { attempts: 5, duration: 5 * 60 * 1000 },
  { attempts: 10, duration: 30 * 60 * 1000 },
  { attempts: 15, duration: 24 * 60 * 60 * 1000 },
]

function getLockoutDuration(failedAttempts: number): number {
  for (const tier of [...LOCKOUT_TIERS].reverse()) {
    if (failedAttempts >= tier.attempts) return tier.duration
  }
  return 0
}

function formatLockoutTime(ms: number): string {
  const minutes = Math.ceil(ms / 60000)
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  const hours = Math.ceil(minutes / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''}`
  const days = Math.ceil(hours / 24)
  return `${days} day${days !== 1 ? 's' : ''}`
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
)

async function verifyPassword(
  password: string,
  hash: string
): Promise<{ valid: boolean; needsRehash: boolean }> {
  try {
    if (hash.startsWith('$argon2id$')) {
      return { valid: await argon2.verify(hash, password), needsRehash: false }
    }
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      const valid = await bcrypt.compare(password, hash)
      return { valid, needsRehash: valid }
    }
    return { valid: false, needsRehash: false }
  } catch {
    return { valid: false, needsRehash: false }
  }
}

async function upgradePasswordHash(userId: string, password: string) {
  try {
    const newHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
      hashLength: 32,
    } as any)
    await db.updateUserPasswordHash(userId, newHash as unknown as string)
  } catch (error) {
    console.error('Background password upgrade failed:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const clientIp = getClientIp(request)
    const identifier = `login:${clientIp}`
    const { success, limit, reset, remaining } = await loginRateLimit.limit(identifier)

    if (!success) {
      const userAgent = request.headers.get('user-agent') || 'ItWhipApp'
      await logFailedLogin({
        email: 'unknown',
        source: 'guest',
        reason: 'RATE_LIMITED',
        ip: clientIp,
        userAgent,
      })
      return createRateLimitResponse(reset, remaining)
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await db.getUserByEmail(email.toLowerCase())
    const userAgent = request.headers.get('user-agent') || 'ItWhipApp'

    if (!user) {
      await logFailedLogin({
        email: email.toLowerCase(),
        source: 'guest',
        reason: 'ACCOUNT_NOT_FOUND',
        ip: clientIp,
        userAgent,
      })
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check lockout
    const userLockout = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        failedLoginAttempts: true,
        lastFailedLoginAt: true,
        lockedUntil: true,
        status: true,
      },
    })

    if (userLockout?.lockedUntil && new Date() < userLockout.lockedUntil) {
      const remainingMs = userLockout.lockedUntil.getTime() - Date.now()
      await logFailedLogin({
        email: email.toLowerCase(),
        source: 'guest',
        reason: 'RATE_LIMITED',
        ip: clientIp,
        userAgent,
      })
      return NextResponse.json(
        {
          error: `Account is temporarily locked. Try again in ${formatLockoutTime(remainingMs)}.`,
          lockedUntil: userLockout.lockedUntil.toISOString(),
        },
        { status: 423 }
      )
    }

    // Verify password
    const { valid: passwordValid, needsRehash } = await verifyPassword(
      password,
      user.password_hash!
    )

    if (!passwordValid) {
      await logFailedLogin({
        email: email.toLowerCase(),
        source: 'guest',
        reason: 'INVALID_CREDENTIALS',
        ip: clientIp,
        userAgent,
      })

      const newFailedAttempts = (userLockout?.failedLoginAttempts || 0) + 1
      const lockoutDuration = getLockoutDuration(newFailedAttempts)
      const lockedUntil =
        lockoutDuration > 0 ? new Date(Date.now() + lockoutDuration) : null

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailedAttempts,
          lastFailedLoginAt: new Date(),
          lockedUntil,
        },
      })

      if (lockedUntil) {
        return NextResponse.json(
          {
            error: `Too many failed attempts. Account locked for ${formatLockoutTime(lockoutDuration)}.`,
            lockedUntil: lockedUntil.toISOString(),
          },
          { status: 423 }
        )
      }

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Reset failed attempts
    if (userLockout?.failedLoginAttempts && userLockout.failedLoginAttempts > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lastFailedLoginAt: null, lockedUntil: null },
      })
    }

    // Check if active
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is deactivated. Please contact support.' },
        { status: 403 }
      )
    }

    // GUARD CHECK: Detect HOST trying to access GUEST login
    const hostProfile = await prisma.rentalHost.findFirst({
      where: { OR: [{ userId: user.id }, { email: (user.email || '').toLowerCase() }] },
      select: { id: true, approvalStatus: true }
    })
    const guestProfile = await prisma.reviewerProfile.findFirst({
      where: { OR: [{ userId: user.id }, { email: (user.email || '').toLowerCase() }] },
      select: { id: true }
    })

    if (hostProfile && !guestProfile) {
      console.log(`[Mobile Login] GUARD: HOST user ${user.email || ''} tried guest login - blocking`)
      await logFailedLogin({
        email: email.toLowerCase(),
        source: 'guest',
        reason: 'INVALID_ACCOUNT_TYPE',
        ip: clientIp,
        userAgent,
        metadata: { guard: 'host-on-guest', hasHostProfile: true, hasGuestProfile: false }
      })
      return NextResponse.json(
        {
          success: false,
          error: 'Host account detected',
          guard: {
            type: 'host-on-guest',
            title: 'Host Account Detected',
            message: 'You have a Host account. Please switch to Host login to access your account.',
            actions: {
              primary: { label: 'Switch to Host Login' },
              secondary: { label: 'Apply for Guest Account' },
            },
          },
        },
        { status: 403 }
      )
    }

    // Upgrade password hash if needed
    if (needsRehash) {
      upgradePasswordHash(user.id, password).catch(() => {})
    }

    // Generate tokens
    const tokenId = nanoid()
    const refreshTokenId = nanoid()
    const refreshFamily = nanoid()

    const accessToken = await new SignJWT({
      userId: user.id,
      email: user.email || '',
      name: user.name || '',
      role: user.role,
      jti: tokenId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(JWT_SECRET)

    const refreshToken = await new SignJWT({
      userId: user.id,
      family: refreshFamily,
      jti: refreshTokenId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_REFRESH_SECRET)

    // Save refresh token
    await db.saveRefreshToken({
      userId: user.id,
      token: refreshToken,
      family: refreshFamily,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    // Update last login
    await db.updateLastLogin(user.id)

    await logSuccessfulLogin({
      userId: user.id,
      email: user.email || '',
      source: 'guest',
      ip: clientIp,
      userAgent,
    })

    console.log(`✅ Mobile login successful: ${user.email}`)

    // Return tokens in response body (mobile clients store in SecureStore)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email || '',
        name: user.name || '',
        role: user.role,
      },
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 900 seconds
    })
  } catch (error) {
    console.error('❌ Mobile login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
