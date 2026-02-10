// app/api/bookings/verify-dl/check-attempts/route.ts
// Check DL verification attempt count, freeze status, and existing Stripe verification

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Run all queries in parallel
    const [failedAttempts, frozenRecord, verifiedProfile, pendingManualRequest] = await Promise.all([
      // 1. Count failed AI DL verification attempts in last 24h
      prisma.dLVerificationLog.count({
        where: {
          guestEmail: normalizedEmail,
          passed: false,
          createdAt: { gte: twentyFourHoursAgo }
        }
      }),

      // 2. Check if email is frozen via SuspendedIdentifier
      prisma.suspendedIdentifier.findUnique({
        where: {
          identifierType_identifierValue: {
            identifierType: 'email',
            identifierValue: normalizedEmail
          }
        }
      }),

      // 3. Check if already Stripe-verified
      prisma.reviewerProfile.findFirst({
        where: {
          user: { email: normalizedEmail },
          stripeIdentityStatus: 'verified'
        },
        select: {
          stripeIdentityVerifiedAt: true
        }
      }),

      // 4. Check if there's a pending manual verification request
      prisma.manualVerificationRequest.findFirst({
        where: {
          email: normalizedEmail,
          status: 'PENDING'
        },
        select: { id: true, createdAt: true }
      })
    ])

    // Determine freeze status (only if not expired)
    const now = new Date()
    const isFrozen = frozenRecord
      ? (!frozenRecord.expiresAt || frozenRecord.expiresAt > now)
      : false
    const frozenUntil = isFrozen && frozenRecord?.expiresAt
      ? frozenRecord.expiresAt.toISOString()
      : null

    const maxAttempts = 2
    const canRetryAI = !isFrozen && failedAttempts < maxAttempts

    return NextResponse.json({
      success: true,
      failedAttempts,
      maxAttempts,
      canRetryAI,
      isFrozen,
      frozenUntil,
      frozenReason: isFrozen ? frozenRecord?.reason : null,
      isAlreadyVerified: !!verifiedProfile,
      verifiedAt: verifiedProfile?.stripeIdentityVerifiedAt?.toISOString() || null,
      hasManualPending: !!pendingManualRequest
    })

  } catch (error: any) {
    console.error('[Check Attempts API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to check verification status' },
      { status: 500 }
    )
  }
}
