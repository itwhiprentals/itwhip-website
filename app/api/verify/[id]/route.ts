// app/api/verify/[id]/route.ts
// Public API for guest identity verification via ItWhip-hosted page
// GET: validate token, return status
// POST: create Stripe Identity session for this request

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/app/lib/database/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil' as Stripe.LatestApiVersion,
})

// GET — Validate token and return verification request status
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const verifyRequest = await prisma.partnerVerificationRequest.findUnique({
      where: { id }
    })

    if (!verifyRequest) {
      return NextResponse.json({ error: 'Invalid verification link' }, { status: 404 })
    }

    // Check expiry (7 days)
    if (verifyRequest.expiresAt && new Date(verifyRequest.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This verification link has expired', status: 'expired' }, { status: 410 })
    }

    // Get partner info for branding
    const partner = await prisma.rentalHost.findUnique({
      where: { id: verifyRequest.partnerId },
      select: { partnerCompanyName: true, name: true }
    })

    // Check if already verified
    const guestProfile = await prisma.reviewerProfile.findUnique({
      where: { id: verifyRequest.guestId },
      select: { stripeIdentityStatus: true, stripeIdentityVerifiedAt: true, stripeVerifiedFirstName: true, stripeVerifiedLastName: true }
    })

    const isVerified = guestProfile?.stripeIdentityStatus === 'verified' || verifyRequest.status === 'verified'

    return NextResponse.json({
      success: true,
      status: isVerified ? 'verified' : verifyRequest.status,
      guestName: verifyRequest.name,
      guestEmail: verifyRequest.email,
      partnerName: partner?.partnerCompanyName || partner?.name || 'Your rental provider',
      purpose: verifyRequest.purpose,
      verifiedAt: isVerified ? (guestProfile?.stripeIdentityVerifiedAt || verifyRequest.verifiedAt) : null,
      verifiedName: isVerified && guestProfile?.stripeVerifiedFirstName
        ? `${guestProfile.stripeVerifiedFirstName} ${guestProfile.stripeVerifiedLastName}`
        : null,
    })

  } catch (error) {
    console.error('[Verify API] GET error:', error)
    return NextResponse.json({ error: 'Failed to validate verification link' }, { status: 500 })
  }
}

// POST — Create a fresh Stripe Identity session for this verification request
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const verifyRequest = await prisma.partnerVerificationRequest.findUnique({
      where: { id }
    })

    if (!verifyRequest) {
      return NextResponse.json({ error: 'Invalid verification link' }, { status: 404 })
    }

    if (verifyRequest.status === 'verified') {
      return NextResponse.json({ error: 'Already verified', status: 'verified' }, { status: 400 })
    }

    // Check expiry
    if (verifyRequest.expiresAt && new Date(verifyRequest.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This verification link has expired' }, { status: 410 })
    }

    // Get partner for metadata
    const partner = await prisma.rentalHost.findUnique({
      where: { id: verifyRequest.partnerId },
      select: { id: true, name: true, partnerCompanyName: true }
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'
    const returnUrl = `${baseUrl}/verify/${id}?verified=true`

    // Create fresh Stripe Identity session
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      provided_details: {
        email: verifyRequest.email
      },
      options: {
        document: {
          require_matching_selfie: true,
          allowed_types: ['driving_license']
        }
      },
      return_url: returnUrl,
      metadata: {
        profileId: verifyRequest.guestId,
        partnerId: verifyRequest.partnerId,
        partnerName: partner?.partnerCompanyName || partner?.name || '',
        purpose: verifyRequest.purpose,
        bookingId: verifyRequest.bookingId || '',
        email: verifyRequest.email,
        sentBy: 'partner',
        verificationRequestId: id
      }
    })

    // Update the verification request with session ID
    await prisma.partnerVerificationRequest.update({
      where: { id },
      data: {
        stripeSessionId: verificationSession.id,
        verificationUrl: verificationSession.url!,
        status: 'pending'
      }
    })

    // Update guest profile
    await prisma.reviewerProfile.update({
      where: { id: verifyRequest.guestId },
      data: {
        stripeIdentitySessionId: verificationSession.id,
        stripeIdentityStatus: 'pending'
      }
    })

    return NextResponse.json({
      success: true,
      sessionUrl: verificationSession.url
    })

  } catch (error) {
    console.error('[Verify API] POST error:', error)
    return NextResponse.json({ error: 'Failed to create verification session' }, { status: 500 })
  }
}
