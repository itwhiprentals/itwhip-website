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

    const wasStripeVerified = guestProfile?.stripeIdentityStatus === 'verified'

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

    // Notify host about completed onboarding
    try {
      const fullBooking = await prisma.rentalBooking.findUnique({
        where: { id: bookingId },
        select: {
          hostId: true,
          bookingCode: true,
          guestName: true,
          car: { select: { make: true, model: true, year: true } },
          host: { select: { email: true, name: true } },
        }
      })

      if (fullBooking?.hostId) {
        // In-app notification
        await prisma.hostNotification.create({
          data: {
            id: crypto.randomUUID(),
            hostId: fullBooking.hostId,
            type: 'ONBOARDING_COMPLETE',
            category: 'BOOKING',
            subject: `Guest onboarding completed - ${fullBooking.bookingCode || bookingId.slice(0, 8)}`,
            message: `${fullBooking.guestName || 'Your guest'} has completed pre-trip onboarding for the ${fullBooking.car?.year} ${fullBooking.car?.make} ${fullBooking.car?.model}. Their identity has been verified and they are ready for pickup.`,
            priority: 'normal',
            actionRequired: 'Review onboarding details',
            actionUrl: `/partner/bookings/${bookingId}`,
            updatedAt: new Date()
          }
        })

        // Email notification to host (fire-and-forget)
        if (fullBooking.host?.email) {
          const { sendEmail } = await import('@/app/lib/email/send-email')
          await sendEmail({
            to: fullBooking.host.email,
            subject: `Guest Onboarding Complete - ${fullBooking.bookingCode || bookingId.slice(0, 8)}`,
            html: `
              <p>Hi ${fullBooking.host.name || 'there'},</p>
              <p><strong>${fullBooking.guestName || 'Your guest'}</strong> has completed their pre-trip onboarding for booking <strong>${fullBooking.bookingCode || bookingId.slice(0, 8)}</strong> (${fullBooking.car?.year} ${fullBooking.car?.make} ${fullBooking.car?.model}).</p>
              <p>Their identity has been verified and they are ready for pickup.</p>
              <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/partner/bookings/${bookingId}">View Booking Details</a></p>
            `,
            text: `${fullBooking.guestName || 'Your guest'} has completed onboarding for booking ${fullBooking.bookingCode || bookingId.slice(0, 8)}. View details at ${process.env.NEXT_PUBLIC_BASE_URL}/partner/bookings/${bookingId}`
          })
        }
      }
    } catch (notifyError) {
      console.error('[Onboarding Complete] Host notification error:', notifyError)
      // Don't fail the onboarding completion if notification fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Onboarding Complete] Error:', error)
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 })
  }
}
