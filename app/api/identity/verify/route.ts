// app/api/identity/verify/route.ts
// Stripe Identity Verification - Create session and handle verification

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import Stripe from 'stripe'
import { prisma } from '@/app/lib/database/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)

// Helper to get current user
async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('accessToken')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    if (!payload.userId) return null

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: {
        reviewerProfile: true
      }
    })

    return user
  } catch {
    return null
  }
}

// GET - Check verification status
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || !user.reviewerProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = user.reviewerProfile

    return NextResponse.json({
      status: profile.stripeIdentityStatus || 'not_started',
      verifiedAt: profile.stripeIdentityVerifiedAt,
      isVerified: profile.stripeIdentityStatus === 'verified',
      // Verified data (only return if verified)
      verifiedData: profile.stripeIdentityStatus === 'verified' ? {
        firstName: profile.stripeVerifiedFirstName,
        lastName: profile.stripeVerifiedLastName,
        dob: profile.stripeVerifiedDob,
        idNumber: profile.stripeVerifiedIdNumber ? `***${profile.stripeVerifiedIdNumber.slice(-4)}` : null
      } : null
    })
  } catch (error) {
    console.error('Error checking identity status:', error)
    return NextResponse.json(
      { error: 'Failed to check verification status' },
      { status: 500 }
    )
  }
}

// POST - Create new verification session
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.reviewerProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = user.reviewerProfile

    // Check if already verified
    if (profile.stripeIdentityStatus === 'verified') {
      return NextResponse.json({
        error: 'Already verified',
        status: 'verified',
        verifiedAt: profile.stripeIdentityVerifiedAt
      }, { status: 400 })
    }

    // Check if there's an existing pending session
    if (profile.stripeIdentitySessionId && profile.stripeIdentityStatus === 'pending') {
      try {
        // Retrieve existing session
        const existingSession = await stripe.identity.verificationSessions.retrieve(
          profile.stripeIdentitySessionId
        )

        if (existingSession.status === 'requires_input') {
          // Session still active, return its URL
          return NextResponse.json({
            sessionId: existingSession.id,
            url: existingSession.url,
            status: 'requires_input'
          })
        }
      } catch {
        // Session not found or expired, create new one
      }
    }

    // Get return URL from request body
    const body = await request.json().catch(() => ({}))
    const returnUrl = body.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/profile?tab=documents&verified=true`

    // Create new verification session with document + selfie
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      provided_details: {
        email: user.email
      },
      options: {
        document: {
          require_matching_selfie: true,
          allowed_types: ['driving_license']  // Only allow driver's license
        }
      },
      return_url: returnUrl,
      metadata: {
        userId: user.id,
        profileId: profile.id,
        email: user.email
      }
    })

    // Update profile with session ID
    await prisma.reviewerProfile.update({
      where: { id: profile.id },
      data: {
        stripeIdentitySessionId: verificationSession.id,
        stripeIdentityStatus: 'pending'
      }
    })

    return NextResponse.json({
      sessionId: verificationSession.id,
      url: verificationSession.url,
      status: 'pending'
    })
  } catch (error) {
    console.error('Error creating verification session:', error)
    return NextResponse.json(
      { error: 'Failed to create verification session' },
      { status: 500 }
    )
  }
}
