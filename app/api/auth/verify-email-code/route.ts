// Verify 6-digit email verification codes
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyGuestToken } from '@/app/lib/auth/guest-jwt'
import { loginRateLimit, getClientIp, createRateLimitResponse } from '@/app/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 attempts per 15 minutes
    const clientIp = getClientIp(request)
    const rateLimit = await loginRateLimit.limit(`verify-email:${clientIp}`)

    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit.reset, rateLimit.remaining)
    }

    // Get user from auth cookie
    const accessToken = request.cookies.get('guest_access_token')?.value
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const payload = await verifyGuestToken(accessToken)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { code } = await request.json()

    if (!code || typeof code !== 'string' || code.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid verification code format' },
        { status: 400 }
      )
    }

    // Find user and check code
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        emailVerificationCode: true,
        emailVerificationExpiry: true,
        emailVerified: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { success: true, message: 'Email already verified' }
      )
    }

    // Check code match
    if (user.emailVerificationCode !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Check expiry (15 minutes)
    if (!user.emailVerificationExpiry || new Date() > user.emailVerificationExpiry) {
      return NextResponse.json(
        { error: 'Verification code expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpiry: null
      }
    })

    // Also update ReviewerProfile if exists
    await prisma.reviewerProfile.updateMany({
      where: { userId: user.id },
      data: { emailVerified: true }
    })

    console.log(`[Email Verification] Email verified for user: ${user.id}`)

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    })

  } catch (error) {
    console.error('[Email Verification] Error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}
