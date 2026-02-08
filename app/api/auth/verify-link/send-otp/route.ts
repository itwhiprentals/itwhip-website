// app/api/auth/verify-link/send-otp/route.ts
// Send email OTP for account linking verification

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { verifyLinkOtpRateLimit, getClientIp, createRateLimitResponse } from '@/app/lib/rate-limit'
import { sendEmail } from '@/app/lib/email/sender'
import { generateVerificationCode, getEmailVerificationTemplate } from '@/app/lib/email/templates/email-verification'

const LINK_TOKEN_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET || 'fallback-guest-secret-key'
)

export async function POST(request: NextRequest) {
  try {
    const { token, type } = await request.json()

    if (!token || !type) {
      return NextResponse.json({ error: 'Token and type are required' }, { status: 400 })
    }

    if (type !== 'email') {
      return NextResponse.json({ error: 'Only email OTP is supported' }, { status: 400 })
    }

    // Rate limit by IP
    const clientIp = getClientIp(request)
    const rateLimit = await verifyLinkOtpRateLimit.limit(clientIp)

    if (!rateLimit.success) {
      console.warn(`[Verify-Link OTP] Rate limit exceeded for IP: ${clientIp}`)
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

    const { userId } = payload
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate and store OTP
    const code = generateVerificationCode()
    const expiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationCode: code,
        emailVerificationExpiry: expiry,
      }
    })

    // Send email
    const template = getEmailVerificationTemplate(user.name, code)
    await sendEmail(user.email!, template.subject, template.html, template.text)

    console.log(`[Verify-Link OTP] Code sent to ${user.email}`)

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
    })
  } catch (error) {
    console.error('[Verify-Link OTP] Error:', error)
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 })
  }
}
