// app/api/auth/mobile/apple/route.ts
// Mobile Apple Sign-In — verifies Apple identity token, returns JWT tokens in body
// Mirrors the Google OAuth route exactly (app/api/auth/mobile/google/route.ts)

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, createRemoteJWKSet, SignJWT } from 'jose'
import { nanoid } from 'nanoid'
import db from '@/app/lib/db'
import { prisma } from '@/app/lib/database/prisma'
import { logSuccessfulLogin } from '@/app/lib/security/loginMonitor'
import { existingAccountGuard } from '@/app/lib/services/identityResolution'

const APPLE_JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'))
const APPLE_ISSUER = 'https://appleid.apple.com'
const BUNDLE_ID = 'com.itwhip.app'

const GUEST_JWT_SECRET = new TextEncoder().encode(process.env.GUEST_JWT_SECRET!)
const GUEST_JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.GUEST_JWT_REFRESH_SECRET!)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!)

function getJWTSecrets(role: string) {
  const guestRoles = ['ANONYMOUS', 'CLAIMED', 'STARTER', 'BUSINESS', 'ENTERPRISE']
  if (guestRoles.includes(role.toUpperCase())) {
    return { accessSecret: GUEST_JWT_SECRET, refreshSecret: GUEST_JWT_REFRESH_SECRET }
  }
  return { accessSecret: JWT_SECRET, refreshSecret: JWT_REFRESH_SECRET }
}

async function generateTokens(user: { id: string; email: string; name: string | null; role: string }) {
  const { accessSecret, refreshSecret } = getJWTSecrets(user.role)
  const tokenFamily = nanoid()

  const accessToken = await new SignJWT({
    userId: user.id, email: user.email, role: user.role, name: user.name, type: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(accessSecret)

  const refreshToken = await new SignJWT({
    userId: user.id, email: user.email, role: user.role, type: 'refresh', family: tokenFamily,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(refreshSecret)

  await db.saveRefreshToken({
    userId: user.id, token: refreshToken, family: tokenFamily,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })

  return { accessToken, refreshToken }
}

async function generateHostTokens(
  user: { id: string; email: string; name: string | null; role: string },
  host: { id: string; approvalStatus: string; hostType: string }
) {
  const tokenFamily = nanoid()
  const isFleetPartner = host.hostType === 'FLEET_PARTNER'

  const accessToken = await new SignJWT({
    userId: user.id, hostId: host.id, email: user.email, name: user.name,
    role: 'BUSINESS', isRentalHost: true, approvalStatus: host.approvalStatus,
    hostType: host.hostType, isFleetPartner, type: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET)

  const refreshToken = await new SignJWT({
    userId: user.id, hostId: host.id, type: 'refresh', family: tokenFamily,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_REFRESH_SECRET)

  await db.saveRefreshToken({
    userId: user.id, token: refreshToken, family: tokenFamily,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })

  return { accessToken, refreshToken }
}

export async function POST(request: NextRequest) {
  try {
    const { identityToken, roleHint, fullName } = await request.json()

    if (!identityToken) {
      return NextResponse.json({ error: 'Apple identity token is required' }, { status: 400 })
    }

    // Verify Apple identity token against Apple's public JWKS
    let payload: any
    try {
      const { payload: verified } = await jwtVerify(identityToken, APPLE_JWKS, {
        issuer: APPLE_ISSUER,
        audience: BUNDLE_ID,
      })
      payload = verified
    } catch {
      return NextResponse.json({ error: 'Invalid Apple identity token' }, { status: 401 })
    }

    const appleUserId = payload.sub as string
    const email = payload.email as string | undefined
    // Apple only provides fullName on the very first sign-in — client sends it as a param
    const name = fullName || null

    if (!email) {
      return NextResponse.json({ error: 'Apple account has no email' }, { status: 400 })
    }

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'ItWhipApp'
    const existingUser = await db.getUserByEmail(email.toLowerCase())

    // =========================================================================
    // GUEST flow
    // =========================================================================
    if (!roleHint || roleHint === 'guest') {
      if (existingUser) {
        if (!existingUser.is_active) {
          return NextResponse.json({ error: 'Account is deactivated. Please contact support.' }, { status: 403 })
        }

        const { accessToken, refreshToken } = await generateTokens({
          id: existingUser.id, email: existingUser.email || '',
          name: existingUser.name || name || '', role: existingUser.role,
        })

        await db.updateLastLogin(existingUser.id)
        await logSuccessfulLogin({ userId: existingUser.id, email: existingUser.email || '', source: 'guest', ip: clientIp, userAgent })

        return NextResponse.json({
          success: true,
          user: { id: existingUser.id, email: existingUser.email || '', name: existingUser.name || name || '', role: existingUser.role },
          accessToken, refreshToken, expiresIn: 15 * 60, isNewUser: false,
        })
      }

      // Identity guard: check if this email belongs to an existing account
      const guard = await existingAccountGuard({ email: email.toLowerCase() })
      if (guard?.found) {
        console.log(`[Mobile Apple] Identity guard: ${email} matches existing account ${guard.existingUserId}`)
        return NextResponse.json({
          error: 'EXISTING_ACCOUNT',
          message: 'You already have an account with us.',
          existingEmail: guard.maskedEmail,
        }, { status: 409 })
      }

      // New guest via Apple
      const newUser = await db.createUser({
        email: email.toLowerCase(), passwordHash: `apple:${appleUserId}`,
        name: name || null, role: 'CLAIMED',
      })

      await prisma.user.update({ where: { id: newUser.id }, data: { emailVerified: true } })

      try {
        await prisma.account.create({
          data: { id: nanoid(), userId: newUser.id, type: 'oauth', provider: 'apple', providerAccountId: appleUserId, access_token: identityToken },
        })
      } catch { /* non-fatal */ }

      try {
        await prisma.reviewerProfile.create({
          data: {
            id: nanoid(), userId: newUser.id, email: newUser.email, name: name || '',
            city: 'Phoenix', state: 'AZ', memberSince: new Date(), loyaltyPoints: 0,
            memberTier: 'BRONZE', emailVerified: true, phoneVerified: false,
            documentsVerified: false, insuranceVerified: false, fullyVerified: false,
            canInstantBook: false, totalTrips: 0, averageRating: 0, profileCompletion: 20,
            emailNotifications: true, smsNotifications: true, pushNotifications: true,
            preferredLanguage: 'en', preferredCurrency: 'USD', updatedAt: new Date(),
          },
        })
      } catch { /* non-fatal */ }

      try {
        await prisma.adminNotification.create({
          data: {
            id: nanoid(), type: 'NEW_GUEST_SIGNUP', title: 'New Guest (Apple Sign-In, Mobile)',
            message: `${name || email} signed up via Apple on mobile`, priority: 'LOW',
            status: 'UNREAD', actionRequired: false, relatedType: 'USER', relatedId: newUser.id,
            metadata: { guestEmail: email, guestName: name, signupSource: 'mobile_apple' },
            updatedAt: new Date(),
          },
        })
      } catch { /* non-fatal */ }

      const { accessToken, refreshToken } = await generateTokens({
        id: newUser.id, email: newUser.email || '', name: newUser.name || '', role: newUser.role,
      })

      await logSuccessfulLogin({ userId: newUser.id, email: newUser.email || '', source: 'guest', ip: clientIp, userAgent })
      console.log(`✅ Mobile Apple signup (guest): ${newUser.email}`)

      return NextResponse.json({
        success: true,
        user: { id: newUser.id, email: newUser.email || '', name: newUser.name || '', role: newUser.role },
        accessToken, refreshToken, expiresIn: 15 * 60, isNewUser: true,
      }, { status: 201 })
    }

    // =========================================================================
    // HOST flow
    // =========================================================================
    if (roleHint === 'host') {
      if (existingUser) {
        if (!existingUser.is_active) {
          return NextResponse.json({ error: 'Account is deactivated. Please contact support.' }, { status: 403 })
        }

        const host = await prisma.rentalHost.findFirst({
          where: { OR: [{ userId: existingUser.id }, { email: email.toLowerCase() }] },
          include: { cars: { select: { id: true, make: true, model: true, year: true, isActive: true } } },
        })

        if (host) {
          const { accessToken, refreshToken } = await generateHostTokens(
            { id: existingUser.id, email: existingUser.email || '', name: existingUser.name || name || '', role: existingUser.role },
            { id: host.id, approvalStatus: host.approvalStatus, hostType: host.hostType }
          )
          await db.updateLastLogin(existingUser.id)
          await logSuccessfulLogin({ userId: existingUser.id, email: existingUser.email || '', source: 'host', ip: clientIp, userAgent })

          return NextResponse.json({
            success: true,
            user: { id: existingUser.id, email: existingUser.email || '', name: existingUser.name || name || '', role: existingUser.role },
            host: { id: host.id, approvalStatus: host.approvalStatus, hostType: host.hostType, name: host.name, role: host.hostType === 'FLEET_PARTNER' ? 'fleet_partner' : 'individual', cars: host.cars },
            accessToken, refreshToken, expiresIn: 15 * 60, isNewUser: false,
          })
        }

        // User exists but no host record — create one
        const newHost = await prisma.rentalHost.create({
          data: {
            id: nanoid(), userId: existingUser.id, email: email.toLowerCase(),
            name: name || '', phone: existingUser.phone ?? '', city: 'Phoenix', state: 'AZ',
            approvalStatus: 'PENDING', hostType: 'REAL', managesOwnCars: true,
            isHostManager: false, managesOthersCars: false, updatedAt: new Date(),
          },
        })
        const { accessToken, refreshToken } = await generateHostTokens(
          { id: existingUser.id, email: existingUser.email || '', name: existingUser.name || name || '', role: existingUser.role },
          { id: newHost.id, approvalStatus: 'PENDING', hostType: 'REAL' }
        )
        await logSuccessfulLogin({ userId: existingUser.id, email: existingUser.email || '', source: 'host', ip: clientIp, userAgent })

        return NextResponse.json({
          success: true,
          user: { id: existingUser.id, email: existingUser.email || '', name: existingUser.name || name || '', role: existingUser.role },
          host: { id: newHost.id, approvalStatus: 'PENDING', hostType: 'REAL', role: 'individual' },
          accessToken, refreshToken, expiresIn: 15 * 60, isNewUser: false, isNewHost: true,
        }, { status: 201 })
      }

      // Brand new user + host
      const newUser = await db.createUser({
        email: email.toLowerCase(), passwordHash: `apple:${appleUserId}`,
        name: name || null, role: 'CLAIMED',
      })
      await prisma.user.update({ where: { id: newUser.id }, data: { emailVerified: true } })

      try {
        await prisma.account.create({
          data: { id: nanoid(), userId: newUser.id, type: 'oauth', provider: 'apple', providerAccountId: appleUserId, access_token: identityToken },
        })
      } catch { /* non-fatal */ }

      const newHost = await prisma.rentalHost.create({
        data: {
          id: nanoid(), userId: newUser.id, email: email.toLowerCase(), name: name || '', phone: '',
          city: 'Phoenix', state: 'AZ', approvalStatus: 'PENDING', hostType: 'REAL',
          managesOwnCars: true, isHostManager: false, managesOthersCars: false, updatedAt: new Date(),
        },
      })

      try {
        await prisma.adminNotification.create({
          data: {
            id: nanoid(), type: 'NEW_HOST_APPLICATION', title: 'New Host (Apple Sign-In, Mobile)',
            message: `${name || email} signed up as host via Apple on mobile`, priority: 'MEDIUM',
            status: 'UNREAD', actionRequired: true, relatedType: 'RENTAL_HOST', relatedId: newHost.id,
            metadata: { hostEmail: email, hostName: name, signupSource: 'mobile_apple' },
            updatedAt: new Date(),
          },
        })
      } catch { /* non-fatal */ }

      const { accessToken, refreshToken } = await generateHostTokens(
        { id: newUser.id, email: newUser.email || '', name: newUser.name || '', role: newUser.role },
        { id: newHost.id, approvalStatus: 'PENDING', hostType: 'REAL' }
      )
      await logSuccessfulLogin({ userId: newUser.id, email: newUser.email || '', source: 'host', ip: clientIp, userAgent })
      console.log(`✅ Mobile Apple signup (host): ${newUser.email}`)

      return NextResponse.json({
        success: true,
        user: { id: newUser.id, email: newUser.email || '', name: newUser.name || '', role: newUser.role },
        host: { id: newHost.id, approvalStatus: 'PENDING', hostType: 'REAL', role: 'individual' },
        accessToken, refreshToken, expiresIn: 15 * 60, isNewUser: true, isNewHost: true,
      }, { status: 201 })
    }

    return NextResponse.json({ error: 'Invalid roleHint' }, { status: 400 })
  } catch (error) {
    console.error('❌ Mobile Apple Sign-In error:', error)
    return NextResponse.json({ error: 'Apple sign-in failed. Please try again.' }, { status: 500 })
  }
}
