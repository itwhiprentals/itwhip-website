// app/api/auth/mobile/google/route.ts
// Mobile Google OAuth — two flows:
// 1. GET: Server-side flow — redirects to Google, handles callback, deep links back to app
// 2. POST: Client-side flow — accepts idToken from expo-auth-session (requires native rebuild)

import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { nanoid } from 'nanoid'
import db from '@/app/lib/db'
import { prisma } from '@/app/lib/database/prisma'
import { logSuccessfulLogin } from '@/app/lib/security/loginMonitor'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const APP_SCHEME = 'itwhip'
const CALLBACK_URL = 'https://itwhip.com/api/auth/mobile/google/callback'

const GUEST_JWT_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET || 'fallback-guest-secret-key'
)
const GUEST_JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_REFRESH_SECRET || 'fallback-guest-refresh-secret-key'
)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change'
)

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
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    type: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(accessSecret)

  const refreshToken = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    type: 'refresh',
    family: tokenFamily,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(refreshSecret)

  await db.saveRefreshToken({
    userId: user.id,
    token: refreshToken,
    family: tokenFamily,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })

  return { accessToken, refreshToken }
}

// Host-specific token generation — uses JWT_SECRET (not guest secret) and includes hostId
async function generateHostTokens(user: { id: string; email: string; name: string | null; role: string }, host: { id: string; approvalStatus: string; hostType: string }) {
  const tokenFamily = nanoid()
  const isFleetPartner = host.hostType === 'FLEET_PARTNER'

  const accessToken = await new SignJWT({
    userId: user.id,
    hostId: host.id,
    email: user.email,
    name: user.name,
    role: 'BUSINESS',
    isRentalHost: true,
    approvalStatus: host.approvalStatus,
    hostType: host.hostType,
    isFleetPartner,
    type: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET)

  const refreshToken = await new SignJWT({
    userId: user.id,
    hostId: host.id,
    type: 'refresh',
    family: tokenFamily,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_REFRESH_SECRET)

  await db.saveRefreshToken({
    userId: user.id,
    token: refreshToken,
    family: tokenFamily,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })

  return { accessToken, refreshToken }
}

export async function POST(request: NextRequest) {
  try {
    const { idToken, roleHint } = await request.json()

    if (!idToken) {
      return NextResponse.json({ error: 'Google ID token is required' }, { status: 400 })
    }

    // Verify Google ID token
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`)
    if (!googleRes.ok) {
      return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 })
    }

    const googleData = await googleRes.json()
    const { email, name, picture, sub: googleId } = googleData

    if (!email) {
      return NextResponse.json({ error: 'Google account has no email' }, { status: 400 })
    }

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'ItWhipApp'

    // Look up existing user
    const existingUser = await db.getUserByEmail(email.toLowerCase())

    // =========================================================================
    // GUEST flow (roleHint === 'guest' or undefined)
    // =========================================================================
    if (!roleHint || roleHint === 'guest') {
      if (existingUser) {
        if (!existingUser.is_active) {
          return NextResponse.json({ error: 'Account is deactivated. Please contact support.' }, { status: 403 })
        }

        const { accessToken, refreshToken } = await generateTokens({
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name || name || '',
          role: existingUser.role,
        })

        await db.updateLastLogin(existingUser.id)
        await logSuccessfulLogin({ userId: existingUser.id, email: existingUser.email, source: 'guest', ip: clientIp, userAgent })

        return NextResponse.json({
          success: true,
          user: { id: existingUser.id, email: existingUser.email, name: existingUser.name || name || '', role: existingUser.role },
          accessToken,
          refreshToken,
          expiresIn: 15 * 60,
          isNewUser: false,
        })
      }

      // New guest user via Google
      const newUser = await db.createUser({
        email: email.toLowerCase(),
        passwordHash: `google:${googleId}`, // No password — Google-only account
        name: name || null,
        role: 'CLAIMED',
      })

      // Mark email as verified (Google verified it)
      await prisma.user.update({
        where: { id: newUser.id },
        data: { emailVerified: true },
      })

      // Create Google account link
      try {
        await prisma.account.create({
          data: {
            id: nanoid(),
            userId: newUser.id,
            type: 'oauth',
            provider: 'google',
            providerAccountId: googleId,
            access_token: idToken,
          },
        })
      } catch { /* Account link already exists or schema mismatch — non-fatal */ }

      // Create ReviewerProfile (guest profile)
      try {
        await prisma.reviewerProfile.create({
          data: {
            id: nanoid(),
            userId: newUser.id,
            email: newUser.email,
            name: name || '',
            city: 'Phoenix',
            state: 'AZ',
            memberSince: new Date(),
            loyaltyPoints: 0,
            memberTier: 'BRONZE',
            emailVerified: true,
            phoneVerified: false,
            documentsVerified: false,
            insuranceVerified: false,
            fullyVerified: false,
            canInstantBook: false,
            totalTrips: 0,
            averageRating: 0,
            profileCompletion: 20,
            emailNotifications: true,
            smsNotifications: true,
            pushNotifications: true,
            preferredLanguage: 'en',
            preferredCurrency: 'USD',
            updatedAt: new Date(),
          },
        })
      } catch { /* Non-fatal */ }

      // Admin notification
      try {
        await prisma.adminNotification.create({
          data: {
            id: nanoid(),
            type: 'NEW_GUEST_SIGNUP',
            title: 'New Guest (Google OAuth, Mobile)',
            message: `${name || email} signed up via Google on mobile`,
            priority: 'LOW',
            status: 'UNREAD',
            actionRequired: false,
            relatedType: 'USER',
            relatedId: newUser.id,
            metadata: { guestEmail: email, guestName: name, signupSource: 'mobile_google' },
            updatedAt: new Date(),
          },
        })
      } catch { /* Non-fatal */ }

      const { accessToken, refreshToken } = await generateTokens({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name || '',
        role: newUser.role,
      })

      await logSuccessfulLogin({ userId: newUser.id, email: newUser.email, source: 'guest', ip: clientIp, userAgent })

      console.log(`✅ Mobile Google signup (guest): ${newUser.email}`)

      return NextResponse.json({
        success: true,
        user: { id: newUser.id, email: newUser.email, name: newUser.name || '', role: newUser.role },
        accessToken,
        refreshToken,
        expiresIn: 15 * 60,
        isNewUser: true,
      }, { status: 201 })
    }

    // =========================================================================
    // HOST flow (roleHint === 'host')
    // =========================================================================
    if (roleHint === 'host') {
      if (existingUser) {
        if (!existingUser.is_active) {
          return NextResponse.json({ error: 'Account is deactivated. Please contact support.' }, { status: 403 })
        }

        // Check if they have a RentalHost record
        const host = await prisma.rentalHost.findFirst({
          where: {
            OR: [
              { userId: existingUser.id },
              { email: email.toLowerCase() },
            ],
          },
          include: {
            cars: { select: { id: true, make: true, model: true, year: true, isActive: true } },
          },
        })

        if (host) {
          // Existing host — generate host tokens with hostId + JWT_SECRET
          const { accessToken, refreshToken } = await generateHostTokens(
            { id: existingUser.id, email: existingUser.email, name: existingUser.name || name || '', role: existingUser.role },
            { id: host.id, approvalStatus: host.approvalStatus, hostType: host.hostType }
          )

          await db.updateLastLogin(existingUser.id)
          await logSuccessfulLogin({ userId: existingUser.id, email: existingUser.email, source: 'host', ip: clientIp, userAgent })

          return NextResponse.json({
            success: true,
            user: { id: existingUser.id, email: existingUser.email, name: existingUser.name || name || '', role: existingUser.role },
            host: {
              id: host.id,
              approvalStatus: host.approvalStatus,
              hostType: host.hostType,
              name: host.name,
              role: host.hostType === 'FLEET_PARTNER' ? 'fleet_partner' : 'individual',
              cars: host.cars,
            },
            accessToken,
            refreshToken,
            expiresIn: 15 * 60,
            isNewUser: false,
          })
        }

        // User exists but no host record — create one (pending approval)
        const newHost = await prisma.rentalHost.create({
          data: {
            id: nanoid(),
            userId: existingUser.id,
            email: email.toLowerCase(),
            name: name || '',
            phone: existingUser.phone || '',
            city: 'Phoenix',
            state: 'AZ',
            approvalStatus: 'PENDING',
            hostType: 'REAL',
            managesOwnCars: true,
            isHostManager: false,
            managesOthersCars: false,
            updatedAt: new Date(),
          },
        })

        const { accessToken, refreshToken } = await generateHostTokens(
          { id: existingUser.id, email: existingUser.email, name: existingUser.name || name || '', role: existingUser.role },
          { id: newHost.id, approvalStatus: 'PENDING', hostType: 'REAL' }
        )

        await logSuccessfulLogin({ userId: existingUser.id, email: existingUser.email, source: 'host', ip: clientIp, userAgent })

        return NextResponse.json({
          success: true,
          user: { id: existingUser.id, email: existingUser.email, name: existingUser.name || name || '', role: existingUser.role },
          host: {
            id: newHost.id,
            approvalStatus: 'PENDING',
            hostType: 'REAL',
            role: 'individual',
          },
          accessToken,
          refreshToken,
          expiresIn: 15 * 60,
          isNewUser: false,
          isNewHost: true,
        }, { status: 201 })
      }

      // Brand new user + host
      const newUser = await db.createUser({
        email: email.toLowerCase(),
        passwordHash: `google:${googleId}`,
        name: name || null,
        role: 'CLAIMED',
      })

      await prisma.user.update({
        where: { id: newUser.id },
        data: { emailVerified: true },
      })

      try {
        await prisma.account.create({
          data: {
            id: nanoid(),
            userId: newUser.id,
            type: 'oauth',
            provider: 'google',
            providerAccountId: googleId,
            access_token: idToken,
          },
        })
      } catch { /* Non-fatal */ }

      const newHost = await prisma.rentalHost.create({
        data: {
          id: nanoid(),
          userId: newUser.id,
          email: email.toLowerCase(),
          name: name || '',
          phone: '',
          city: 'Phoenix',
          state: 'AZ',
          approvalStatus: 'PENDING',
          hostType: 'REAL',
          managesOwnCars: true,
          isHostManager: false,
          managesOthersCars: false,
          updatedAt: new Date(),
        },
      })

      // Admin notification
      try {
        await prisma.adminNotification.create({
          data: {
            id: nanoid(),
            type: 'NEW_HOST_APPLICATION',
            title: 'New Host (Google OAuth, Mobile)',
            message: `${name || email} signed up as host via Google on mobile`,
            priority: 'MEDIUM',
            status: 'UNREAD',
            actionRequired: true,
            relatedType: 'RENTAL_HOST',
            relatedId: newHost.id,
            metadata: { hostEmail: email, hostName: name, signupSource: 'mobile_google' },
            updatedAt: new Date(),
          },
        })
      } catch { /* Non-fatal */ }

      const { accessToken, refreshToken } = await generateHostTokens(
        { id: newUser.id, email: newUser.email, name: newUser.name || '', role: newUser.role },
        { id: newHost.id, approvalStatus: 'PENDING', hostType: 'REAL' }
      )

      await logSuccessfulLogin({ userId: newUser.id, email: newUser.email, source: 'host', ip: clientIp, userAgent })

      console.log(`✅ Mobile Google signup (host): ${newUser.email}`)

      return NextResponse.json({
        success: true,
        user: { id: newUser.id, email: newUser.email, name: newUser.name || '', role: newUser.role },
        host: {
          id: newHost.id,
          approvalStatus: 'PENDING',
          hostType: 'REAL',
          role: 'individual',
        },
        accessToken,
        refreshToken,
        expiresIn: 15 * 60,
        isNewUser: true,
        isNewHost: true,
      }, { status: 201 })
    }

    return NextResponse.json({ error: 'Invalid roleHint' }, { status: 400 })
  } catch (error) {
    console.error('❌ Mobile Google OAuth error:', error)
    return NextResponse.json({ error: 'Google sign-in failed. Please try again.' }, { status: 500 })
  }
}

// =============================================================================
// GET — Server-side OAuth flow: redirect user to Google consent screen
// Mobile opens: https://itwhip.com/api/auth/mobile/google?roleHint=guest
// =============================================================================
export async function GET(request: NextRequest) {
  const roleHint = request.nextUrl.searchParams.get('roleHint') || 'guest'

  // Encode roleHint in state parameter (Google passes it back in callback)
  const state = Buffer.from(JSON.stringify({ roleHint })).toString('base64url')

  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(CALLBACK_URL)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('openid email profile')}` +
    `&state=${state}` +
    `&access_type=offline` +
    `&prompt=consent`

  return NextResponse.redirect(googleAuthUrl)
}
