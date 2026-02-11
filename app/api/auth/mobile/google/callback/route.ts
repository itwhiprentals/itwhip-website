// app/api/auth/mobile/google/callback/route.ts
// Google OAuth callback for mobile — exchanges auth code for tokens,
// finds/creates user, then deep-links back to the app with JWT tokens.

import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { nanoid } from 'nanoid'
import crypto from 'crypto'
import db from '@/app/lib/db'
import { prisma } from '@/app/lib/database/prisma'
import { logSuccessfulLogin } from '@/app/lib/security/loginMonitor'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const APP_SCHEME = 'itwhip'
const CALLBACK_URL = 'https://itwhip.com/api/auth/mobile/google/callback'

const GUEST_JWT_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET!
)
const GUEST_JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_REFRESH_SECRET!
)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET!
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

function deepLinkRedirect(data: Record<string, any>) {
  const encoded = Buffer.from(JSON.stringify(data)).toString('base64url')
  return NextResponse.redirect(`${APP_SCHEME}://google-auth?data=${encoded}`)
}

function deepLinkError(error: string) {
  const encoded = Buffer.from(JSON.stringify({ error })).toString('base64url')
  return NextResponse.redirect(`${APP_SCHEME}://google-auth?data=${encoded}`)
}

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code')
    const stateParam = request.nextUrl.searchParams.get('state')
    const errorParam = request.nextUrl.searchParams.get('error')

    if (errorParam) {
      return deepLinkError(errorParam === 'access_denied' ? 'Google sign-in was cancelled' : errorParam)
    }

    if (!code) {
      return deepLinkError('No authorization code received')
    }

    // Decode roleHint from state
    let roleHint = 'guest'
    if (stateParam) {
      try {
        const stateData = JSON.parse(Buffer.from(stateParam, 'base64url').toString())
        roleHint = stateData.roleHint || 'guest'
      } catch { /* Use default */ }
    }

    // Exchange code for tokens with Google
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      console.error('Google token exchange failed:', await tokenRes.text())
      return deepLinkError('Failed to exchange Google authorization code')
    }

    const tokenData = await tokenRes.json()
    const idToken = tokenData.id_token

    if (!idToken) {
      return deepLinkError('No ID token in Google response')
    }

    // Verify ID token and get user info
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`)
    if (!googleRes.ok) {
      return deepLinkError('Invalid Google token')
    }

    const googleData = await googleRes.json()
    const { email, name, picture, sub: googleId } = googleData

    if (!email) {
      return deepLinkError('Google account has no email')
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
          return deepLinkError('Account is deactivated. Please contact support.')
        }

        const { accessToken, refreshToken } = await generateTokens({
          id: existingUser.id,
          email: existingUser.email ?? email,
          name: existingUser.name ?? name ?? null,
          role: existingUser.role,
        })

        await db.updateLastLogin(existingUser.id)
        await logSuccessfulLogin({ userId: existingUser.id, email: existingUser.email ?? email, source: 'guest', ip: clientIp, userAgent })

        return deepLinkRedirect({
          success: true,
          user: { id: existingUser.id, email: existingUser.email, name: existingUser.name || name, role: existingUser.role },
          accessToken,
          refreshToken,
          expiresIn: 15 * 60,
          isNewUser: false,
        })
      }

      // New guest user
      const newUser = await db.createUser({
        email: email.toLowerCase(),
        passwordHash: `google:${googleId}`,
        name: name || null,
        role: 'CLAIMED',
      })

      await prisma.user.update({ where: { id: newUser.id }, data: { emailVerified: true } })

      try {
        await prisma.account.create({
          data: { id: crypto.randomUUID(), userId: newUser.id, type: 'oauth', provider: 'google', providerAccountId: googleId, access_token: idToken },
        })
      } catch { /* Non-fatal */ }

      try {
        await prisma.reviewerProfile.create({
          data: {
            id: crypto.randomUUID(),
            userId: newUser.id, email: newUser.email, name: name || '',
            city: '', state: 'AZ', updatedAt: new Date(),
            memberSince: new Date(), loyaltyPoints: 0, memberTier: 'BRONZE',
            emailVerified: true, phoneVerified: false, documentsVerified: false,
            insuranceVerified: false, fullyVerified: false, canInstantBook: false,
            totalTrips: 0, averageRating: 0, profileCompletion: 20,
            emailNotifications: true, smsNotifications: true, pushNotifications: true,
            preferredLanguage: 'en', preferredCurrency: 'USD',
          },
        })
      } catch { /* Non-fatal */ }

      try {
        await prisma.adminNotification.create({
          data: {
            id: crypto.randomUUID(), updatedAt: new Date(),
            type: 'NEW_GUEST_SIGNUP', title: 'New Guest (Google OAuth, Mobile)',
            message: `${name || email} signed up via Google on mobile`,
            priority: 'LOW', status: 'UNREAD', actionRequired: false,
            relatedType: 'USER', relatedId: newUser.id,
            metadata: { guestEmail: email, guestName: name, signupSource: 'mobile_google' },
          },
        })
      } catch { /* Non-fatal */ }

      const { accessToken, refreshToken } = await generateTokens({
        id: newUser.id, email: newUser.email ?? email, name: newUser.name ?? null, role: newUser.role,
      })

      await logSuccessfulLogin({ userId: newUser.id, email: newUser.email ?? email, source: 'guest', ip: clientIp, userAgent })
      console.log(`✅ Mobile Google signup (guest): ${newUser.email}`)

      return deepLinkRedirect({
        success: true,
        user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
        accessToken, refreshToken, expiresIn: 15 * 60, isNewUser: true,
      })
    }

    // =========================================================================
    // HOST flow
    // =========================================================================
    if (roleHint === 'host') {
      if (existingUser) {
        if (!existingUser.is_active) {
          return deepLinkError('Account is deactivated. Please contact support.')
        }

        const host = await prisma.rentalHost.findFirst({
          where: { OR: [{ userId: existingUser.id }, { email: email.toLowerCase() }] },
          include: { cars: { select: { id: true, make: true, model: true, year: true, isActive: true } } },
        })

        await db.updateLastLogin(existingUser.id)
        await logSuccessfulLogin({ userId: existingUser.id, email: existingUser.email ?? email, source: 'host', ip: clientIp, userAgent })

        if (host) {
          const { accessToken, refreshToken } = await generateHostTokens(
            { id: existingUser.id, email: existingUser.email ?? email, name: existingUser.name ?? name ?? null, role: existingUser.role },
            { id: host.id, approvalStatus: host.approvalStatus, hostType: host.hostType }
          )
          return deepLinkRedirect({
            success: true,
            user: { id: existingUser.id, email: existingUser.email, name: existingUser.name || name, role: existingUser.role },
            host: {
              id: host.id, approvalStatus: host.approvalStatus, hostType: host.hostType,
              businessName: host.businessName,
              role: host.hostType === 'FLEET_PARTNER' ? 'fleet_partner' : 'individual',
            },
            accessToken, refreshToken, expiresIn: 15 * 60, isNewUser: false,
          })
        }

        // Existing user, no host record — create pending host
        const newHost = await prisma.rentalHost.create({
          data: {
            id: crypto.randomUUID(),
            userId: existingUser.id, email: email.toLowerCase(),
            name: name || '', phone: existingUser.phone || '',
            city: '', state: 'AZ', updatedAt: new Date(),
            approvalStatus: 'PENDING', hostType: 'REAL',
            managesOwnCars: true, isHostManager: false, managesOthersCars: false,
          },
        })

        const { accessToken: newHostAccessToken, refreshToken: newHostRefreshToken } = await generateHostTokens(
          { id: existingUser.id, email: existingUser.email ?? email, name: existingUser.name ?? name ?? null, role: existingUser.role },
          { id: newHost.id, approvalStatus: 'PENDING', hostType: 'REAL' }
        )

        return deepLinkRedirect({
          success: true,
          user: { id: existingUser.id, email: existingUser.email, name: existingUser.name || name, role: existingUser.role },
          host: { id: newHost.id, approvalStatus: 'PENDING', hostType: 'REAL', role: 'individual' },
          accessToken: newHostAccessToken, refreshToken: newHostRefreshToken, expiresIn: 15 * 60, isNewUser: false, isNewHost: true,
        })
      }

      // Brand new user + host
      const newUser = await db.createUser({
        email: email.toLowerCase(), passwordHash: `google:${googleId}`, name: name || null, role: 'CLAIMED',
      })

      await prisma.user.update({ where: { id: newUser.id }, data: { emailVerified: true } })

      try {
        await prisma.account.create({
          data: { id: crypto.randomUUID(), userId: newUser.id, type: 'oauth', provider: 'google', providerAccountId: googleId, access_token: idToken },
        })
      } catch { /* Non-fatal */ }

      const newHost = await prisma.rentalHost.create({
        data: {
          id: crypto.randomUUID(),
          userId: newUser.id, email: email.toLowerCase(),
          name: name || '', phone: '',
          city: '', state: 'AZ', updatedAt: new Date(),
          approvalStatus: 'PENDING', hostType: 'REAL',
          managesOwnCars: true, isHostManager: false, managesOthersCars: false,
        },
      })

      try {
        await prisma.adminNotification.create({
          data: {
            id: crypto.randomUUID(), updatedAt: new Date(),
            type: 'NEW_HOST_APPLICATION', title: 'New Host (Google OAuth, Mobile)',
            message: `${name || email} signed up as host via Google on mobile`,
            priority: 'MEDIUM', status: 'UNREAD', actionRequired: true,
            relatedType: 'RENTAL_HOST', relatedId: newHost.id,
            metadata: { hostEmail: email, hostName: name, signupSource: 'mobile_google' },
          },
        })
      } catch { /* Non-fatal */ }

      const { accessToken, refreshToken } = await generateHostTokens(
        { id: newUser.id, email: newUser.email ?? email, name: newUser.name ?? null, role: newUser.role },
        { id: newHost.id, approvalStatus: 'PENDING', hostType: 'REAL' }
      )

      await logSuccessfulLogin({ userId: newUser.id, email: newUser.email ?? email, source: 'host', ip: clientIp, userAgent })
      console.log(`✅ Mobile Google signup (host): ${newUser.email}`)

      return deepLinkRedirect({
        success: true,
        user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
        host: { id: newHost.id, approvalStatus: 'PENDING', hostType: 'REAL', role: 'individual' },
        accessToken, refreshToken, expiresIn: 15 * 60, isNewUser: true, isNewHost: true,
      })
    }

    return deepLinkError('Invalid roleHint')
  } catch (error) {
    console.error('❌ Mobile Google OAuth callback error:', error)
    return deepLinkError('Google sign-in failed. Please try again.')
  }
}
