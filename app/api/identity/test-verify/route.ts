// app/api/identity/test-verify/route.ts
// TEST ONLY: Manually mark user as identity verified (for local development)
// DELETE THIS FILE BEFORE DEPLOYING TO PRODUCTION

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)
const GUEST_JWT_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET || 'fallback-guest-secret-key'
)

async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('accessToken')?.value

  if (!token) return null

  const secrets = [JWT_SECRET, GUEST_JWT_SECRET]

  for (const secret of secrets) {
    try {
      const { payload } = await jwtVerify(token, secret)
      if (!payload.userId) continue

      const user = await prisma.user.findUnique({
        where: { id: payload.userId as string },
        include: { reviewerProfile: true }
      })

      if (user) return user
    } catch {
      continue
    }
  }

  return null
}

// POST - Manually mark user as verified (TEST ONLY)
export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const user = await getCurrentUser()
    if (!user || !user.reviewerProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = user.reviewerProfile

    // Update profile to verified status
    const updatedProfile = await prisma.reviewerProfile.update({
      where: { id: profile.id },
      data: {
        stripeIdentityStatus: 'verified',
        stripeIdentityVerifiedAt: new Date(),
        documentsVerified: true,
        documentVerifiedAt: new Date(),
        documentVerifiedBy: 'test-manual',
        fullyVerified: true,
        // Set some test data
        stripeVerifiedFirstName: 'Test',
        stripeVerifiedLastName: 'User'
      }
    })

    console.log(`[TEST] Manually verified profile ${profile.id} for user ${user.email}`)

    return NextResponse.json({
      success: true,
      message: 'Profile manually marked as verified',
      profile: {
        id: updatedProfile.id,
        stripeIdentityStatus: updatedProfile.stripeIdentityStatus,
        fullyVerified: updatedProfile.fullyVerified
      }
    })
  } catch (error) {
    console.error('[TEST] Error manually verifying:', error)
    return NextResponse.json(
      { error: 'Failed to verify' },
      { status: 500 }
    )
  }
}
