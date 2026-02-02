// app/api/auth/mobile/host-login/route.ts
// Mobile-specific host login — returns JWT tokens in response body
// Mirrors /api/auth/mobile/login but for host accounts (RentalHost)

import { NextRequest, NextResponse } from 'next/server'
import * as argon2 from 'argon2'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { nanoid } from 'nanoid'
import db from '@/app/lib/db'
import { prisma } from '@/app/lib/database/prisma'
import { loginRateLimit, getClientIp, createRateLimitResponse } from '@/app/lib/rate-limit'
import { logFailedLogin, logSuccessfulLogin } from '@/app/lib/security/loginMonitor'

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
      saltLength: 16,
    })
    await db.updateUserPasswordHash(userId, newHash)
  } catch (error) {
    console.error('Background password upgrade failed:', error)
  }
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request)
  const userAgent = request.headers.get('user-agent') || 'ItWhipApp'

  try {
    // Rate limit
    const identifier = `host-login:${clientIp}`
    const { success: rateLimitOk, reset, remaining } = await loginRateLimit.limit(identifier)

    if (!rateLimitOk) {
      await logFailedLogin({ email: 'unknown', source: 'mobile_host', reason: 'RATE_LIMITED', ip: clientIp, userAgent })
      return createRateLimitResponse(reset, remaining)
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find host by email with full data
    const host = await prisma.rentalHost.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            passwordHash: true,
            failedLoginAttempts: true,
            lastFailedLoginAt: true,
            lockedUntil: true,
          }
        },
        cars: {
          select: { id: true, make: true, model: true, year: true, isActive: true },
        },
      },
    })

    if (!host || !host.user) {
      // Check if guest tried host login
      const userByEmail = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true },
      })

      if (userByEmail) {
        const guestProfile = await prisma.reviewerProfile.findFirst({
          where: { OR: [{ userId: userByEmail.id }, { email: email.toLowerCase() }] },
          select: { id: true },
        })

        if (guestProfile) {
          console.log(`[Mobile Host Login] GUARD: GUEST user ${email} tried host login - blocking`)
          await logFailedLogin({
            email: email.toLowerCase(),
            source: 'mobile_host',
            reason: 'INVALID_ACCOUNT_TYPE',
            ip: clientIp,
            userAgent,
            metadata: { guard: 'guest-on-host', hasHostProfile: false, hasGuestProfile: true }
          })
          return NextResponse.json({
            success: false,
            error: 'Guest account detected',
            guard: {
              type: 'guest-on-host',
              title: 'Guest Account Detected',
              message: 'You have a Guest account. Please switch to Guest login to access your account, or apply to become a Host.',
              actions: {
                primary: { label: 'Switch to Guest Login' },
                secondary: { label: 'Apply to Become a Host' },
              },
            },
          }, { status: 403 })
        }
      }

      await logFailedLogin({ email, source: 'mobile_host', reason: 'ACCOUNT_NOT_FOUND', ip: clientIp, userAgent })
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const user = host.user

    // Check lockout
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      const remainingMs = user.lockedUntil.getTime() - Date.now()
      const minutes = Math.ceil(remainingMs / 60000)
      await logFailedLogin({ email, source: 'mobile_host', reason: 'RATE_LIMITED', ip: clientIp, userAgent })
      return NextResponse.json({
        error: `Account temporarily locked. Try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
        lockedUntil: user.lockedUntil.toISOString(),
      }, { status: 423 })
    }

    // Verify password
    if (!user.passwordHash) {
      await logFailedLogin({ email, source: 'mobile_host', reason: 'PASSWORD_NOT_SET', ip: clientIp, userAgent })
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const { valid: passwordValid, needsRehash } = await verifyPassword(password, user.passwordHash)

    if (!passwordValid) {
      const newFailedAttempts = (user.failedLoginAttempts || 0) + 1
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailedAttempts,
          lastFailedLoginAt: new Date(),
          lockedUntil: newFailedAttempts >= 5
            ? new Date(Date.now() + (newFailedAttempts >= 15 ? 86400000 : newFailedAttempts >= 10 ? 1800000 : 300000))
            : null,
        },
      })
      await logFailedLogin({ email, source: 'mobile_host', reason: 'INVALID_CREDENTIALS', ip: clientIp, userAgent })
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Reset failed attempts
    if (user.failedLoginAttempts && user.failedLoginAttempts > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lastFailedLoginAt: null, lockedUntil: null },
      })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is deactivated. Please contact support.' }, { status: 403 })
    }

    if (needsRehash) {
      upgradePasswordHash(user.id, password).catch(() => {})
    }

    // Generate tokens with hostId in payload
    const isFleetPartner = host.hostType === 'FLEET_PARTNER'
    const tokenId = nanoid()
    const refreshTokenId = nanoid()
    const refreshFamily = nanoid()

    const accessToken = await new SignJWT({
      userId: user.id,
      hostId: host.id,
      email: host.email,
      name: host.name,
      role: 'BUSINESS',
      isRentalHost: true,
      approvalStatus: host.approvalStatus,
      hostType: host.hostType,
      isFleetPartner,
      jti: tokenId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(JWT_SECRET)

    const refreshToken = await new SignJWT({
      userId: user.id,
      hostId: host.id,
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

    await logSuccessfulLogin({ userId: user.id, email: host.email, source: 'mobile_host', ip: clientIp, userAgent })

    console.log(`✅ Mobile host login successful: ${host.email}`)

    // Return tokens + full host data in JSON body
    return NextResponse.json({
      success: true,
      host: {
        id: host.id,
        userId: user.id,
        name: host.name,
        email: host.email,
        phone: host.phone,
        profilePhoto: host.profilePhoto,
        city: host.city,
        state: host.state,
        hostType: host.hostType,
        approvalStatus: host.approvalStatus,
        active: host.active,
        isVerified: host.isVerified,
        isHostManager: host.isHostManager,
        isVehicleOwner: host.isVehicleOwner,
        managesOwnCars: host.managesOwnCars,
        managesOthersCars: host.managesOthersCars,
        partnerCompanyName: host.partnerCompanyName,
        partnerSlug: host.partnerSlug,
        partnerLogo: host.partnerLogo,
        commissionRate: host.commissionRate,
        currentCommissionRate: host.currentCommissionRate,
        earningsTier: host.earningsTier,
        totalTrips: host.totalTrips,
        rating: host.rating,
        fleetSize: host.cars?.length || 0,
        canViewBookings: host.canViewBookings,
        canEditCalendar: host.canEditCalendar,
        canSetPricing: host.canSetPricing,
        canMessageGuests: host.canMessageGuests,
        canWithdrawFunds: host.canWithdrawFunds,
        dashboardAccess: host.dashboardAccess,
        role: isFleetPartner ? 'fleet_partner' : host.isHostManager ? 'fleet_manager' : 'individual',
      },
      accessToken,
      refreshToken,
      expiresIn: 15 * 60,
    })
  } catch (error) {
    console.error('❌ Mobile host login error:', error)
    return NextResponse.json({ error: 'An error occurred during login' }, { status: 500 })
  }
}
