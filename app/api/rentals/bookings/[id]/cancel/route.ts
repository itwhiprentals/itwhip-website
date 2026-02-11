// app/api/rentals/bookings/[id]/cancel/route.ts
// Guest-facing cancellation endpoint

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { sendHostBookingCancelledEmail } from '@/app/lib/email/host-booking-cancelled-email'
import { calculateCancellationRefund, calculateRefundAmount } from '@/app/lib/booking/cancellation-policy'

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
        status: true,
        renterId: true,
        guestEmail: true,
        paymentStatus: true,
        paymentIntentId: true,
        totalAmount: true,
        startDate: true,
        bookingCode: true,
        guestName: true,
        endDate: true,
        hostId: true,
        car: { select: { make: true, model: true } },
        host: { select: { name: true, email: true } }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Verify ownership via JWT identity only (no spoofable headers)
    const isOwner = (user.id && booking.renterId === user.id) ||
                    (user.email && booking.guestEmail === user.email)

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

    // Calculate refund based on cancellation policy (time-based tiers, MST)
    const cancellation = calculateCancellationRefund(booking.startDate!)
    const refundAmount = calculateRefundAmount(
      Number(cancelledBooking.totalAmount || 0),
      cancellation.refundPercentage
    )

    console.log(`[Cancel Booking] Policy: ${cancellation.label} (${cancellation.hoursUntilPickup.toFixed(1)}h before pickup). Refund: $${refundAmount}`)

    // Auto-create refund request if payment was captured and refund is due
    if (cancelledBooking.paymentStatus === 'PAID' && cancelledBooking.paymentIntentId && refundAmount > 0) {
      try {
        await prisma.refundRequest.create({
          data: {
            id: crypto.randomUUID(),
            bookingId: cancelledBooking.id,
            amount: refundAmount,
            reason: `Booking cancelled by guest (${cancellation.label}): ${reason}`,
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
        cancelledBooking.paymentStatus === 'AUTHORIZED') {
      try {
        const stripe = (await import('stripe')).default
        const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: '2025-08-27.basil' as any,
        })
        await stripeClient.paymentIntents.cancel(cancelledBooking.paymentIntentId)

        await prisma.rentalBooking.update({
          where: { id: bookingId },
          data: { paymentStatus: 'REFUNDED' }
        })
      } catch (stripeError) {
        console.error('[Cancel Booking] Failed to void payment:', stripeError)
      }
    }

    // Notify host about the cancellation (fire-and-forget)
    if (booking.host?.email) {
      const formatDate = (d: Date | null) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
      sendHostBookingCancelledEmail({
        hostName: booking.host.name || 'Host',
        hostEmail: booking.host.email,
        guestName: booking.guestName || 'Guest',
        bookingCode: booking.bookingCode,
        carMake: booking.car?.make || 'Vehicle',
        carModel: booking.car?.model || '',
        startDate: formatDate(booking.startDate),
        endDate: formatDate(booking.endDate),
        totalAmount: Number(booking.totalAmount || 0).toFixed(2),
        cancellationReason: reason,
        cancelledBy: 'guest',
      }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: cancelledBooking.id,
        status: cancelledBooking.status,
        cancelledAt: cancelledBooking.cancelledAt
      },
      refund: {
        amount: refundAmount,
        percentage: cancellation.refundPercentage,
        tier: cancellation.tier,
        policy: cancellation.label
      }
    })
  } catch (error) {
    console.error('[Cancel Booking] Error:', error)
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
  }
}
