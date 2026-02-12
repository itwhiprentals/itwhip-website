// app/api/auth/verify-link/complete/route.ts
// Verify identity + link OAuth provider + login

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'
import * as argon2 from 'argon2'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { prisma } from '@/app/lib/database/prisma'
import { verifyLinkRateLimit, getClientIp, createRateLimitResponse } from '@/app/lib/rate-limit'
import { sendEmail } from '@/app/lib/email/sender'
import { getAccountLinkedTemplate } from '@/app/lib/email/templates/account-linked'
import crypto from 'crypto'

const LINK_TOKEN_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET!
)

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET!
)

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    if (hash.startsWith('$argon2id$')) {
      return await argon2.verify(hash, password)
    }
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      return await bcrypt.compare(password, hash)
    }
    return false
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, type, value } = await request.json()

    if (!token || !type || !value) {
      return NextResponse.json({ error: 'Token, type, and value are required' }, { status: 400 })
    }

    // Rate limit by token hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex').substring(0, 16)
    const clientIp = getClientIp(request)
    const rateLimit = await verifyLinkRateLimit.limit(`verify-link:${tokenHash}`)

    if (!rateLimit.success) {
      console.warn(`[Verify-Link] Rate limit exceeded for token: ${tokenHash}`)
      return createRateLimitResponse(rateLimit.reset, rateLimit.remaining)
    }

    // Verify the pending link JWT
    let payload: any
    try {
      const result = await jwtVerify(token, LINK_TOKEN_SECRET)
      payload = result.payload
    } catch {
      return NextResponse.json({ error: 'Token expired. Please try signing in again.' }, { status: 400 })
    }

    const { userId, provider, providerAccountId, access_token, refresh_token, expires_at, id_token } = payload

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, passwordHash: true, phone: true, phoneVerified: true, role: true, emailVerificationCode: true, emailVerificationExpiry: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify identity based on type
    let verified = false

    if (type === 'password') {
      if (!user.passwordHash) {
        return NextResponse.json({ error: 'No password set for this account' }, { status: 400 })
      }
      verified = await verifyPassword(value, user.passwordHash)
      if (!verified) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 400 })
      }
    } else if (type === 'email-otp') {
      if (!user.emailVerificationCode || !user.emailVerificationExpiry) {
        return NextResponse.json({ error: 'No verification code sent. Please request one first.' }, { status: 400 })
      }
      if (new Date() > user.emailVerificationExpiry) {
        return NextResponse.json({ error: 'Code expired. Please request a new one.' }, { status: 400 })
      }
      if (user.emailVerificationCode !== value) {
        return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
      }
      verified = true
      // Clear the code after successful use
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerificationCode: null, emailVerificationExpiry: null }
      })
    } else if (type === 'phone-otp') {
      // Phone OTP is verified via Firebase on the client side
      // The value here is the Firebase ID token
      // For now, we trust the client-side Firebase verification
      // TODO: If needed, verify Firebase ID token server-side
      return NextResponse.json({ error: 'Phone OTP verification is handled client-side. Please use password or email OTP.' }, { status: 400 })
    } else {
      return NextResponse.json({ error: 'Invalid verification type' }, { status: 400 })
    }

    if (!verified) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
    }

    // Link the OAuth provider to the user's account
    await prisma.account.create({
      data: {
        id: nanoid(),
        userId: user.id,
        type: 'oauth',
        provider,
        providerAccountId,
        access_token: access_token || null,
        refresh_token: refresh_token || null,
        expires_at: expires_at || null,
        id_token: id_token || null,
        token_type: 'Bearer',
      }
    })

    console.log(`[Verify-Link] Provider ${provider} linked to user ${user.id}`)

    // Log security event
    try {
      await prisma.securityEvent.create({
        data: {
          id: nanoid(),
          type: 'OAUTH_ACCOUNT_LINKED',
          severity: 'MEDIUM' as any,
          sourceIp: clientIp,
          targetId: user.email,
          message: `${provider} account linked after verification`,
          details: JSON.stringify({
            provider,
            providerAccountId,
            verificationType: type,
            userId: user.id,
          }),
          action: 'account_linked',
          blocked: false,
          userAgent: request.headers.get('user-agent') || '',
          timestamp: new Date(),
        }
      })
    } catch (e) {
      console.error('[Verify-Link] Security event log failed:', e)
    }

    // Send notification email (best-effort)
    try {
      const providerName = provider === 'apple' ? 'Apple' : provider === 'google' ? 'Google' : provider
      const template = getAccountLinkedTemplate(user.name || null, providerName)
      await sendEmail(user.email || '', template.subject, template.html, template.text)
    } catch (e) {
      console.error('[Verify-Link] Notification email failed:', e)
    }

    // Generate JWT tokens for login
    const now = Math.floor(Date.now() / 1000)

    const accessToken = await new SignJWT({
      userId: user.id,
      email: user.email || '',
      name: user.name || '',
      role: user.role,
      userType: 'guest'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setExpirationTime(now + 15 * 60)
      .setIssuer('itwhip')
      .setAudience('itwhip-guest')
      .sign(JWT_SECRET)

    const refreshTokenJwt = await new SignJWT({
      userId: user.id,
      type: 'refresh'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setExpirationTime(now + 7 * 24 * 60 * 60)
      .setIssuer('itwhip')
      .sign(JWT_REFRESH_SECRET)

    const response = NextResponse.json({
      success: true,
      message: `${provider} account linked successfully`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    })

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/'
    })

    response.cookies.set('refreshToken', refreshTokenJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    })

    return response
  } catch (error) {
    console.error('[Verify-Link Complete] Error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
