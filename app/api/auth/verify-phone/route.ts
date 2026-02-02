// app/api/auth/verify-phone/route.ts
// POST /api/auth/verify-phone - Verify Firebase phone token and update database

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { verifyPhoneToken } from '@/app/lib/firebase/admin'

export async function POST(request: NextRequest) {
  try {
    const { idToken, phone } = await request.json()

    if (!idToken) {
      return NextResponse.json(
        { error: 'Firebase ID token is required' },
        { status: 400 }
      )
    }

    // Get current user from session
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log(`[Phone Verify] Verifying phone for user: ${user.id}`)

    // Verify the Firebase ID token
    let verifiedPhone: string
    try {
      const result = await verifyPhoneToken(idToken)
      verifiedPhone = result.phoneNumber

      console.log(`[Phone Verify] Firebase verified phone: ${verifiedPhone}`)
    } catch (error: any) {
      console.error('[Phone Verify] Firebase token verification failed:', error)
      return NextResponse.json(
        { error: 'Phone verification failed. Please try again.' },
        { status: 400 }
      )
    }

    // Update user's phone verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: true,
        phone: verifiedPhone, // Update with Firebase-verified phone
        phoneVerificationAttempts: 0,      // Reset on success
        phoneVerificationSkipped: false,   // Clear skip flag if they verify later
      }
    })

    console.log(`[Phone Verify] User ${user.id} phone verified: ${verifiedPhone}`)

    // Also sync phoneVerified to ReviewerProfile if exists
    try {
      await prisma.reviewerProfile.updateMany({
        where: {
          OR: [
            { userId: user.id },
            { email: user.email }
          ]
        },
        data: {
          phoneVerified: true,
          phoneNumber: verifiedPhone,
          phoneVerificationAttempts: 0,
          phoneVerificationSkipped: false,
        }
      })
      console.log(`[Phone Verify] Synced phoneVerified to ReviewerProfile for user: ${user.id}`)
    } catch (syncError) {
      console.error('[Phone Verify] Failed to sync phoneVerified to ReviewerProfile:', syncError)
      // Don't fail the request if profile sync fails
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
      phone: verifiedPhone,
    })

  } catch (error) {
    console.error('[Phone Verify] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred during phone verification' },
      { status: 500 }
    )
  }
}
