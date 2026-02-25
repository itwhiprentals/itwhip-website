// app/api/rentals/bookings/[id]/payment-confirm/route.ts
// Called after guest's Stripe PaymentElement authorization succeeds

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { stripe } from '@/app/lib/stripe/client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id: bookingId } = await params
    const { paymentIntentId } = await request.json()

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'paymentIntentId is required' }, { status: 400 })
    }

    // Find the booking
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        OR: [
          { renterId: user.id },
          { guestEmail: user.email }
        ],
        paymentType: 'CARD',
        paymentIntentId,
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Verify PaymentIntent status with Stripe
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (pi.status !== 'requires_capture') {
      return NextResponse.json(
        { error: `Payment not in expected state. Current: ${pi.status}` },
        { status: 400 }
      )
    }

    // Update booking to AUTHORIZED
    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'AUTHORIZED',
        stripeCustomerId: typeof pi.customer === 'string' ? pi.customer : null,
      }
    })

    console.log(`[Payment Confirm] Booking ${booking.bookingCode} payment authorized (PI: ${paymentIntentId})`)

    return NextResponse.json({
      success: true,
      paymentStatus: 'AUTHORIZED',
    })

  } catch (error) {
    console.error('[Payment Confirm] Error:', error)
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 })
  }
}
