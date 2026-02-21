// app/api/ai/booking/otp/send/route.ts
// Send a 6-digit OTP code to a guest's email for Choe AI booking assistant verification

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { choeOtpSendRateLimit, getClientIp } from '@/app/lib/rate-limit'
import { sendEmail } from '@/app/lib/email/sender'
import { generateVerificationCode, getChoeOtpTemplate } from '@/app/lib/email/templates/choe-otp'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_PURPOSES = ['CHECKOUT', 'BOOKING_STATUS', 'SENSITIVE_INFO'] as const
type OtpPurpose = (typeof VALID_PURPOSES)[number]

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  return `${local[0]}***@${domain}`
}

export async function POST(request: NextRequest) {
  try {
    // Parse body
    const body = await request.json()
    const { sessionId, email, purpose } = body as {
      sessionId?: string
      email?: string
      purpose?: string
    }

    // Validate required fields
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid sessionId' },
        { status: 400 }
      )
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Missing or invalid email address' },
        { status: 400 }
      )
    }

    if (!purpose || !VALID_PURPOSES.includes(purpose as OtpPurpose)) {
      return NextResponse.json(
        { error: 'Missing or invalid purpose. Must be one of: CHECKOUT, BOOKING_STATUS, SENSITIVE_INFO' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Rate-limit by IP
    const clientIp = getClientIp(request)
    const ipResult = await choeOtpSendRateLimit.limit(`ip:${clientIp}`)
    if (!ipResult.success) {
      const retryAfter = Math.ceil((ipResult.reset - Date.now()) / 1000)
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil(retryAfter / 60)} minutes.`,
          retryAfter,
        },
        { status: 429 }
      )
    }

    // Rate-limit by email
    const emailResult = await choeOtpSendRateLimit.limit(`email:${normalizedEmail}`)
    if (!emailResult.success) {
      const retryAfter = Math.ceil((emailResult.reset - Date.now()) / 1000)
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil(retryAfter / 60)} minutes.`,
          retryAfter,
        },
        { status: 429 }
      )
    }

    // Check for existing valid (non-expired, unverified) OTP for this session+email
    const existingOtp = await prisma.choeAIOtpVerification.findFirst({
      where: {
        sessionId,
        email: normalizedEmail,
        expiresAt: { gt: new Date() },
        verifiedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (existingOtp) {
      return NextResponse.json({
        alreadySent: true,
        maskedEmail: maskEmail(normalizedEmail),
        expiresAt: existingOtp.expiresAt.toISOString(),
      })
    }

    // Invalidate previous OTPs for this session+email
    await prisma.choeAIOtpVerification.updateMany({
      where: {
        sessionId,
        email: normalizedEmail,
        expiresAt: { gt: new Date() },
        verifiedAt: null,
      },
      data: {
        expiresAt: new Date(),
      },
    })

    // Generate code and create record
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    await prisma.choeAIOtpVerification.create({
      data: {
        sessionId,
        email: normalizedEmail,
        code,
        expiresAt,
      },
    })

    // Send email
    const template = getChoeOtpTemplate(code, purpose as OtpPurpose)
    const emailResponse = await sendEmail(
      normalizedEmail,
      template.subject,
      template.html,
      template.text,
      { requestId: `choe-otp-${sessionId}` }
    )

    if (!emailResponse.success) {
      console.error('[Choe OTP Send] Email send failed:', emailResponse.error)
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      maskedEmail: maskEmail(normalizedEmail),
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('[Choe OTP Send]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
