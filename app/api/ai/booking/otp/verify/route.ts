// app/api/ai/booking/otp/verify/route.ts
// Verify a 6-digit OTP code for the Choe AI booking assistant

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { choeOtpVerifyRateLimit, getClientIp } from '@/app/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { sessionId, email, code } = body

    // Validate inputs
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    }
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'email is required' }, { status: 400 })
    }
    if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'code must be a 6-digit number' }, { status: 400 })
    }

    // Rate-limit by IP
    const ip = getClientIp(request)
    const { success } = await choeOtpVerifyRateLimit.limit(ip)
    if (!success) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again later.' },
        { status: 429 },
      )
    }

    // Find the most recent non-expired, unverified OTP for (sessionId, email)
    const otp = await prisma.choeAIOtpVerification.findFirst({
      where: {
        sessionId,
        email,
        expiresAt: { gt: new Date() },
        verifiedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otp) {
      return NextResponse.json(
        { error: 'No valid verification code found. Please request a new one.' },
        { status: 400 },
      )
    }

    // Check if too many attempts on this OTP record
    if (otp.attempts >= 5) {
      return NextResponse.json(
        { error: 'Too many attempts. Please request a new code.' },
        { status: 429 },
      )
    }

    // Increment attempts on the OTP record
    await prisma.choeAIOtpVerification.update({
      where: { id: otp.id },
      data: { attempts: otp.attempts + 1 },
    })

    // Check if code matches
    if (otp.code !== code) {
      return NextResponse.json(
        { error: 'Incorrect code', attemptsRemaining: 5 - (otp.attempts + 1) },
        { status: 400 },
      )
    }

    // Code matches - update OTP record and conversation atomically
    const now = new Date()
    await prisma.$transaction(async (tx) => {
      await tx.choeAIOtpVerification.update({
        where: { id: otp.id },
        data: { verifiedAt: now },
      })
      // Conversation may not exist yet if user hasn't sent enough messages
      const convo = await tx.choeAIConversation.findUnique({ where: { sessionId } })
      if (convo) {
        await tx.choeAIConversation.update({
          where: { sessionId },
          data: { verifiedEmail: email, verifiedAt: now },
        })
      }
    })

    return NextResponse.json({ success: true, verifiedEmail: email })
  } catch (error) {
    console.error('[Choe OTP Verify]', error)
    return NextResponse.json(
      { error: 'Failed to verify code. Please try again.' },
      { status: 500 },
    )
  }
}
