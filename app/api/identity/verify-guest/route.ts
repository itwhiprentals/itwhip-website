// app/api/identity/verify-guest/route.ts
// Stripe Identity Verification for UNAUTHENTICATED guests
// Allows guests to verify identity BEFORE creating an account

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import Stripe from 'stripe'
import { prisma } from '@/app/lib/database/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

// Helper to get current user (optional - may not be logged in)
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

// POST - Create verification session for guest (with or without account)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { email, returnUrl, carId, source } = body

    // Check if user is already logged in
    const user = await getCurrentUser()

    // If logged in with verified profile, return early
    if (user?.reviewerProfile?.stripeIdentityStatus === 'verified') {
      return NextResponse.json({
        error: 'Already verified',
        status: 'verified',
        verifiedAt: user.reviewerProfile.stripeIdentityVerifiedAt
      }, { status: 400 })
    }

    // If logged in, use their email
    const verificationEmail = user?.email || email

    if (!verificationEmail) {
      return NextResponse.json(
        { error: 'Email is required for verification' },
        { status: 400 }
      )
    }

    // ========== SILENT EMAIL CHECK ==========
    // Check if this email already exists in the system
    const existingUser = await prisma.user.findUnique({
      where: { email: verificationEmail },
      include: {
        reviewerProfile: true,
        rentalHost: true
      }
    })

    // If existing user is already verified, tell them to sign in
    if (existingUser?.reviewerProfile?.stripeIdentityStatus === 'verified') {
      return NextResponse.json({
        existingAccount: true,
        accountType: 'guest',
        verified: true,
        message: 'This email is already verified. Please sign in to continue.',
        email: verificationEmail
      }, { status: 200 })
    }

    // If HOST account exists without guest profile
    if (existingUser?.rentalHost && !existingUser?.reviewerProfile) {
      return NextResponse.json({
        existingAccount: true,
        accountType: 'host',
        hasGuestProfile: false,
        message: 'A host account exists with this email. You can create a guest profile to book.',
        email: verificationEmail
      }, { status: 200 })
    }

    // ========== CREATE OR UPDATE PROFILE ==========
    let profileId: string

    if (user?.reviewerProfile) {
      // User is logged in with profile - use it
      profileId = user.reviewerProfile.id

      // Check for existing pending session
      if (user.reviewerProfile.stripeIdentitySessionId) {
        try {
          const existingSession = await stripe.identity.verificationSessions.retrieve(
            user.reviewerProfile.stripeIdentitySessionId
          )

          if (existingSession.status === 'requires_input') {
            return NextResponse.json({
              sessionId: existingSession.id,
              url: existingSession.url,
              status: 'requires_input'
            })
          }
        } catch {
          // Session expired or not found, create new one
        }
      }
    } else if (existingUser?.reviewerProfile) {
      // Existing profile but not logged in - use their profile
      profileId = existingUser.reviewerProfile.id

      // Check for existing pending session
      if (existingUser.reviewerProfile.stripeIdentitySessionId) {
        try {
          const existingSession = await stripe.identity.verificationSessions.retrieve(
            existingUser.reviewerProfile.stripeIdentitySessionId
          )

          if (existingSession.status === 'requires_input') {
            return NextResponse.json({
              sessionId: existingSession.id,
              url: existingSession.url,
              status: 'requires_input',
              existingAccount: true,
              email: verificationEmail
            })
          }
        } catch {
          // Session expired, create new one
        }
      }
    } else {
      // No profile exists - we'll create one after verification via webhook
      // For now, use email as identifier in metadata
      profileId = 'pending-' + verificationEmail
    }

    // Build return URL with car context
    const baseReturnUrl = returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/rentals/${carId}/book`
    const fullReturnUrl = `${baseReturnUrl}${baseReturnUrl.includes('?') ? '&' : '?'}verified=true&email=${encodeURIComponent(verificationEmail)}`

    // Create new verification session
    // Request all extractable fields: name, DOB, address, document number, expiry
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      provided_details: {
        email: verificationEmail
      },
      options: {
        document: {
          require_matching_selfie: true,
          require_id_number: true,
          allowed_types: ['driving_license']
        }
      },
      return_url: fullReturnUrl,
      metadata: {
        email: verificationEmail,
        profileId: profileId.startsWith('pending-') ? '' : profileId,
        userId: user?.id || existingUser?.id || '',
        carId: carId || '',
        source: source || 'booking-page'
      }
    })

    // Update profile with session ID if it exists
    if (!profileId.startsWith('pending-')) {
      await prisma.reviewerProfile.update({
        where: { id: profileId },
        data: {
          stripeIdentitySessionId: verificationSession.id,
          stripeIdentityStatus: 'pending'
        }
      })
    }

    return NextResponse.json({
      sessionId: verificationSession.id,
      url: verificationSession.url,
      status: 'pending',
      isNewUser: profileId.startsWith('pending-')
    })
  } catch (error) {
    console.error('Error creating guest verification session:', error)
    return NextResponse.json(
      { error: 'Failed to create verification session' },
      { status: 500 }
    )
  }
}
