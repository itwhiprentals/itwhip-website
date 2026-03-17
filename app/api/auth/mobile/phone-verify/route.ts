// app/api/auth/mobile/phone-verify/route.ts
// Verify OTP via Twilio Verify and log in user
// Mirrors /api/auth/phone-login logic but without Firebase — returns JWT in response body

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { SignJWT } from 'jose'
import { nanoid } from 'nanoid'
import twilio from 'twilio'
import { checkSuspendedIdentifiers } from '@/app/lib/services/identityResolution'

const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken = process.env.TWILIO_AUTH_TOKEN!
const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID!

const JWT_SECRET = new TextEncoder().encode(process.env.GUEST_JWT_SECRET!)
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.GUEST_JWT_REFRESH_SECRET!)

async function generateJWTTokens(userId: string, email: string, name: string | null, role: string, status: string = 'ACTIVE') {
  const now = Math.floor(Date.now() / 1000)

  const accessToken = await new SignJWT({
    userId, email, name, role, status, userType: 'guest'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 15 * 60)
    .setIssuer('itwhip')
    .setAudience('itwhip-guest')
    .sign(JWT_SECRET)

  const refreshToken = await new SignJWT({
    userId, type: 'refresh'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 7 * 24 * 60 * 60)
    .setIssuer('itwhip')
    .sign(JWT_REFRESH_SECRET)

  return { accessToken, refreshToken }
}

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json()

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Phone number and verification code are required' },
        { status: 400 }
      )
    }

    console.log(`[Mobile Phone Verify] Verifying code for ${phone}`)

    // ── Step 1: Verify OTP via Twilio Verify ─────────────────────────
    const client = twilio(accountSid, authToken)
    let verified = false

    try {
      const check = await client.verify.v2
        .services(VERIFY_SERVICE_SID)
        .verificationChecks.create({ to: phone, code })
      verified = check.status === 'approved'
      if (!verified) {
        console.warn(`[Mobile Phone Verify] Code check failed: ${check.status}`)
      }
    } catch (err: any) {
      console.error(`[Mobile Phone Verify] Twilio Verify error:`, err.message)
    }

    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code. Please try again.' },
        { status: 400 }
      )
    }

    console.log(`[Mobile Phone Verify] OTP verified for ${phone}`)

    // ── Step 2: Security checks ──────────────────────────────────────
    const suspensionCheck = await checkSuspendedIdentifiers({ phone })
    if (suspensionCheck.blocked) {
      console.warn(`[Mobile Phone Verify] BLOCKED: Suspended phone ${phone}`)
      return NextResponse.json(
        { error: 'Unable to log in at this time. Please contact support.' },
        { status: 403 }
      )
    }

    // ── Step 3: Find or create user ──────────────────────────────────
    let user = await prisma.user.findFirst({ where: { phone } })

    if (user) {
      console.log(`[Mobile Phone Verify] Existing user: ${user.id} (${user.email})`)

      if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
        return NextResponse.json(
          { error: 'Your account has been suspended. Please contact support.' },
          { status: 403 }
        )
      }

      const isFakeEmail = (user.email || '').includes('@itwhip.temp')
      if (isFakeEmail) {
        return NextResponse.json({
          requiresEmail: true,
          userId: user.id,
          phone,
          message: 'Please provide your email address to complete sign-in'
        })
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true, phoneVerificationAttempts: 0, phoneVerificationSkipped: false }
      })
    } else {
      console.log(`[Mobile Phone Verify] New user — email required`)
      return NextResponse.json({
        requiresEmail: true,
        userId: null,
        phone,
        message: 'Welcome! Please provide your email to create your account'
      })
    }

    // ── Step 4: Generate tokens ──────────────────────────────────────
    const { accessToken, refreshToken } = await generateJWTTokens(
      user.id, user.email!, user.name, 'guest', user.status as string
    )

    await prisma.refreshToken.create({
      data: {
        id: nanoid(),
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    })

    console.log(`[Mobile Phone Verify] Login success: ${user.email} via phone`)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone,
        phoneVerified: true,
      },
      accessToken,
      refreshToken,
    })
  } catch (error: any) {
    console.error('[Mobile Phone Verify] Error:', error)
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    )
  }
}
