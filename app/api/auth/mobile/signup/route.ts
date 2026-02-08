// app/api/auth/mobile/signup/route.ts
// Mobile-specific signup endpoint — returns both access + refresh tokens in body
// Same auth logic as web signup but tokens in response body for SecureStore

import { NextRequest, NextResponse } from 'next/server'
import * as argon2 from 'argon2'
import { SignJWT } from 'jose'
import { nanoid } from 'nanoid'
import db from '@/app/lib/db'
import { prisma } from '@/app/lib/database/prisma'

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

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

const ARGON2_CONFIG = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
  hashLength: 32,
  saltLength: 16,
}

function getJWTSecrets(role: string) {
  const guestRoles = ['ANONYMOUS', 'CLAIMED', 'STARTER', 'BUSINESS', 'ENTERPRISE']
  if (guestRoles.includes(role.toUpperCase())) {
    return { accessSecret: GUEST_JWT_SECRET, refreshSecret: GUEST_JWT_REFRESH_SECRET }
  }
  return { accessSecret: JWT_SECRET, refreshSecret: JWT_REFRESH_SECRET }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone, roleHint } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const existingUser = await db.getUserByEmail(email.toLowerCase())
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const passwordHash = await argon2.hash(password, ARGON2_CONFIG)

    const newUser = await db.createUser({
      email: email.toLowerCase(),
      passwordHash,
      name: name || null,
      phone: phone || null,
      role: 'CLAIMED',
    })

    // Verification code
    const verificationCode = generateVerificationCode()
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.user.update({
      where: { id: newUser.id },
      data: {
        emailVerificationCode: verificationCode,
        emailVerificationExpiry: verificationExpiry,
      },
    })

    // Create guest profile (always — ensures user appears in fleet guest list)
    {
      try {
        const reviewerProfile = await prisma.reviewerProfile.create({
          data: {
            id: nanoid(),
            userId: newUser.id,
            email: newUser.email,
            name: newUser.name || '',
            city: 'Phoenix',
            state: 'AZ',
            phoneNumber: phone || null,
            memberSince: new Date(),
            loyaltyPoints: 0,
            memberTier: 'BRONZE',
            emailVerified: false,
            phoneVerified: false,
            documentsVerified: false,
            insuranceVerified: false,
            fullyVerified: false,
            canInstantBook: false,
            totalTrips: 0,
            averageRating: 0,
            profileCompletion: 10,
            emailNotifications: true,
            smsNotifications: true,
            pushNotifications: true,
            preferredLanguage: 'en',
            preferredCurrency: 'USD',
            updatedAt: new Date(),
          },
        })

        await prisma.adminNotification.create({
          data: {
            id: crypto.randomUUID(),
            updatedAt: new Date(),
            type: 'NEW_GUEST_SIGNUP',
            title: 'New Guest Registered (Mobile)',
            message: `${name || email} signed up via mobile app`,
            priority: 'LOW',
            status: 'UNREAD',
            actionRequired: false,
            actionUrl: `/fleet/guests/${reviewerProfile.id}`,
            relatedId: reviewerProfile.id,
            relatedType: 'REVIEWER_PROFILE',
            metadata: {
              guestEmail: email,
              guestName: name || null,
              signupSource: 'mobile_app',
            },
          } as any,
        }).catch(() => {})
      } catch (profileError) {
        console.error('[Mobile Signup] ReviewerProfile creation failed:', profileError)
      }
    }

    // Send verification email
    try {
      const { sendEmail } = await import('@/app/lib/email/sender')
      await sendEmail(
        email.toLowerCase(),
        'Verify Your ItWhip Account',
        `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
        `Your ItWhip verification code is: ${verificationCode}. Expires in 15 minutes.`
      )
    } catch {
      console.error('[Mobile Signup] Verification email failed')
    }

    // Generate tokens
    const { accessSecret, refreshSecret } = getJWTSecrets(newUser.role)

    const accessToken = await new SignJWT({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      type: 'access',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(accessSecret)

    const tokenFamily = nanoid()
    const refreshToken = await new SignJWT({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      type: 'refresh',
      family: tokenFamily,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(refreshSecret)

    await db.saveRefreshToken({
      userId: newUser.id,
      token: refreshToken,
      family: tokenFamily,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    console.log(`✅ Mobile signup successful: ${newUser.email}`)

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
        accessToken,
        refreshToken,
        expiresIn: 15 * 60,
        requiresVerification: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Mobile signup error:', error)

    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
