// app/api/partner/bookings/[id]/verify-guest/route.ts
// Initiate Stripe Identity verification for a guest — charges host $5.00 via HostDeductible

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import Stripe from 'stripe'
import { prisma } from '@/app/lib/database/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string
    return await prisma.rentalHost.findUnique({ where: { id: hostId } })
  } catch {
    return null
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()
    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: bookingId } = await params

    // Fetch booking with guest profile
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: {
        renter: {
          include: { reviewerProfile: true }
        }
      }
    })

    if (!booking || booking.hostId !== partner.id) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const profile = booking.renter?.reviewerProfile
    if (!profile) {
      return NextResponse.json({ error: 'No guest profile found' }, { status: 400 })
    }

    // Guard: already verified
    if (profile.documentsVerified || profile.manuallyVerifiedByHost) {
      return NextResponse.json({ error: 'Guest is already verified' }, { status: 400 })
    }

    // Check for existing pending Stripe session
    if (profile.stripeIdentitySessionId) {
      try {
        const existing = await stripe.identity.verificationSessions.retrieve(
          profile.stripeIdentitySessionId
        )
        if (existing.status === 'requires_input') {
          return NextResponse.json({
            sessionId: existing.id,
            url: existing.url,
            status: 'requires_input',
            alreadyCreated: true
          })
        }
      } catch {
        // Session expired, create new one
      }
    }

    // Create Stripe Identity verification session
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/partner/bookings/${bookingId}?verified=true`

    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      provided_details: {
        email: profile.email || booking.guestEmail || undefined
      },
      options: {
        document: {
          require_matching_selfie: true,
          require_id_number: true,
          allowed_types: ['driving_license']
        }
      },
      return_url: returnUrl,
      metadata: {
        email: profile.email || booking.guestEmail || '',
        profileId: profile.id,
        userId: booking.renterId || '',
        bookingId: booking.id,
        source: 'partner_verify_guest',
        hostId: partner.id
      }
    })

    // Update guest profile with session info
    await prisma.reviewerProfile.update({
      where: { id: profile.id },
      data: {
        stripeIdentitySessionId: verificationSession.id
      }
    })

    // Create HostDeductible for $5.00 verification fee
    await prisma.hostDeductible.create({
      data: {
        hostId: partner.id,
        bookingId: booking.id,
        amount: 5.00,
        reason: 'guest_verification',
        description: `Stripe Identity verification for ${booking.guestName || 'guest'}`,
        status: 'PENDING'
      }
    })

    // Increment host deductible balance
    await prisma.rentalHost.update({
      where: { id: partner.id },
      data: {
        deductibleBalance: { increment: 5.00 }
      }
    })

    console.log(`[Verify Guest] Stripe Identity session created for booking ${booking.bookingCode}, host charged $5.00`)

    return NextResponse.json({
      sessionId: verificationSession.id,
      url: verificationSession.url,
      status: 'requires_input'
    })
  } catch (error) {
    console.error('[Verify Guest] Error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate verification' },
      { status: 500 }
    )
  }
}
