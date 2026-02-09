// app/api/rentals/bookings/[id]/cancel/route.ts
// Guest-facing cancellation endpoint

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

    // Also check x-guest-email header for guest access
    const guestEmail = request.headers.get('x-guest-email')

    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        renterId: true,
        guestEmail: true,
        paymentStatus: true,
        paymentIntentId: true,
        totalAmount: true,
        startDate: true,
        bookingCode: true,
        car: { select: { make: true, model: true } }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Verify ownership
    const isOwner = (user?.id && booking.renterId === user.id) ||
                    (user?.email && booking.guestEmail === user.email) ||
                    (guestEmail && booking.guestEmail === guestEmail)

    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Only allow cancellation of PENDING or CONFIRMED bookings
    if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: `Cannot cancel a booking with status: ${booking.status}` },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const reason = body.reason || 'Guest requested cancellation'

    // Cancel the booking
    const cancelledBooking = await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: 'GUEST',
        cancellationReason: reason
      },
      select: {
        id: true,
        status: true,
        cancelledAt: true,
        paymentStatus: true,
        paymentIntentId: true,
        totalAmount: true
      }
    })

    // Auto-create refund request if payment was captured
    if (cancelledBooking.paymentStatus === 'PAID' && cancelledBooking.paymentIntentId) {
      try {
        await prisma.refundRequest.create({
          data: {
            id: crypto.randomUUID(),
            bookingId: cancelledBooking.id,
            amount: cancelledBooking.totalAmount,
            reason: `Booking cancelled by guest: ${reason}`,
            requestedBy: booking.guestEmail || 'guest',
            requestedByType: 'GUEST',
            status: 'PENDING',
            updatedAt: new Date()
          }
        })
      } catch (refundError) {
        console.error('[Cancel Booking] Failed to create refund request:', refundError)
      }
    }

    // If payment was only authorized (not captured), void it
    if (cancelledBooking.paymentIntentId &&
        (cancelledBooking.paymentStatus === 'AUTHORIZED' ||
         cancelledBooking.paymentStatus === 'requires_capture')) {
      try {
        const stripe = (await import('stripe')).default
        const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!)
        await stripeClient.paymentIntents.cancel(cancelledBooking.paymentIntentId)

        await prisma.rentalBooking.update({
          where: { id: bookingId },
          data: { paymentStatus: 'VOIDED' }
        })
      } catch (stripeError) {
        console.error('[Cancel Booking] Failed to void payment:', stripeError)
      }
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: cancelledBooking.id,
        status: cancelledBooking.status,
        cancelledAt: cancelledBooking.cancelledAt
      }
    })
  } catch (error) {
    console.error('[Cancel Booking] Error:', error)
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
  }
}
