// app/api/auth/skip-phone-verification/route.ts
// API endpoint to mark phone verification as skipped

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'

export async function POST(request: NextRequest) {
  try {
    // Get current authenticated user
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log(`[Skip Phone] User ${user.id} is skipping phone verification`)

    // Update user to mark phone verification as skipped
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerificationSkipped: true,
        phoneVerificationAttempts: 0, // Reset attempts
      }
    })

    // Also sync to ReviewerProfile if it exists
    try {
      await prisma.reviewerProfile.updateMany({
        where: {
          OR: [
            { userId: user.id },
            { email: user.email }
          ]
        },
        data: {
          phoneVerificationSkipped: true,
          phoneVerificationAttempts: 0,
        }
      })
      console.log(`[Skip Phone] Synced skip status to ReviewerProfile for user: ${user.id}`)
    } catch (syncError) {
      console.error('[Skip Phone] Failed to sync to ReviewerProfile:', syncError)
      // Don't fail the request if profile sync fails
    }

    return NextResponse.json({
      success: true,
      message: 'Phone verification skipped successfully'
    })
  } catch (error) {
    console.error('[Skip Phone] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred while skipping phone verification' },
      { status: 500 }
    )
  }
}
