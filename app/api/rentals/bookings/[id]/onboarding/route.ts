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
        licensePhotoUrl: true,
        licenseBackPhotoUrl: true,
        insurancePhotoUrl: true,
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

    // For Stripe-verified users: check docs are uploaded
    // For visitors: Stripe verification is checked via profile
    const guestProfile = await prisma.reviewerProfile.findUnique({
      where: { email: booking.guestEmail?.toLowerCase() || '' },
      select: {
        stripeIdentityStatus: true,
        documentsVerified: true,
        insuranceVerified: true
      }
    })

    const isStripeVerified = guestProfile?.stripeIdentityStatus === 'verified' || guestProfile?.documentsVerified === true

    if (isStripeVerified) {
      // Account holder flow — must have DL front + back + insurance
      if (!booking.licensePhotoUrl || !booking.licenseBackPhotoUrl) {
        return NextResponse.json({ error: 'Please upload driver\'s license (front and back)' }, { status: 400 })
      }
      if (!booking.insurancePhotoUrl && !guestProfile?.insuranceVerified) {
        return NextResponse.json({ error: 'Please upload insurance proof or add insurance to your profile' }, { status: 400 })
      }
    } else {
      // Visitor flow — must have completed Stripe Identity
      if (!isStripeVerified) {
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
