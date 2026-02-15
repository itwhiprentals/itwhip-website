// app/api/rentals/bookings/[id]/onboarding/route.ts
// Marks booking onboarding as complete

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        renterId: true,
        guestEmail: true,
        status: true,
        onboardingCompletedAt: true
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Verify ownership
    const isOwner = (user.id && booking.renterId === user.id) ||
                    (user.email && booking.guestEmail === user.email)
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (booking.onboardingCompletedAt) {
      return NextResponse.json({ success: true, message: 'Already completed' })
    }

    // Check guest verification status
    const guestProfile = await prisma.reviewerProfile.findUnique({
      where: { email: booking.guestEmail?.toLowerCase() || '' },
      select: {
        stripeIdentityStatus: true,
        documentsVerified: true,
      }
    })

    const wasStripeVerified = guestProfile?.stripeIdentityStatus === 'verified' || guestProfile?.documentsVerified === true

    if (wasStripeVerified) {
      // Path A: Already Stripe-verified → check Claude AI DL verification pass or manual review
      const aiVerification = await prisma.dLVerificationLog.findFirst({
        where: { guestEmail: booking.guestEmail?.toLowerCase() || '', passed: true },
        orderBy: { createdAt: 'desc' }
      })

      const manualReview = await prisma.manualVerificationRequest.findFirst({
        where: {
          email: booking.guestEmail?.toLowerCase() || '',
          status: { in: ['APPROVED', 'PENDING'] }
        },
        orderBy: { createdAt: 'desc' }
      })

      if (!aiVerification && !manualReview) {
        return NextResponse.json({ error: 'Please complete identity verification first' }, { status: 400 })
      }
    } else {
      // Path B: Not previously verified → must have just completed Stripe Identity
      if (guestProfile?.stripeIdentityStatus !== 'verified') {
        return NextResponse.json({ error: 'Please complete Stripe Identity verification first' }, { status: 400 })
      }
    }

    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: { onboardingCompletedAt: new Date() }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Onboarding Complete] Error:', error)
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 })
  }
}
