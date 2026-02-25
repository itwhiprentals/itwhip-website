// app/api/rentals/bookings/[id]/payment-choice/route.ts
// Guest selects payment method (CARD or CASH) for a recruited booking

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
    const { choice } = await request.json()

    if (!choice || !['CARD', 'CASH'].includes(choice)) {
      return NextResponse.json({ error: 'Invalid choice. Must be CARD or CASH.' }, { status: 400 })
    }

    // Find the booking — must belong to this guest, be PENDING, and not yet have a paymentType
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        OR: [
          { renterId: user.id },
          { guestEmail: user.email }
        ],
        status: 'PENDING',
        paymentType: null,
      },
      include: {
        convertedFromProspect: { select: { id: true } },
        car: { select: { make: true, model: true, year: true } }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or payment method already selected' },
        { status: 404 }
      )
    }

    // Must be a recruited booking
    if (!booking.convertedFromProspect) {
      return NextResponse.json(
        { error: 'Payment choice is only available for recruited bookings' },
        { status: 400 }
      )
    }

    if (choice === 'CASH') {
      // Guest chose cash — status stays PENDING, host confirms later
      await prisma.rentalBooking.update({
        where: { id: bookingId },
        data: {
          paymentType: 'CASH',
          serviceFee: 0,
          totalAmount: booking.subtotal, // No service fee for cash
          notes: (booking.notes || '') + '\n[Guest selected Cash at Pickup]'
        }
      })

      // Track the platform fee owed by the host (10% welcome rate)
      const platformFee = Number(booking.subtotal) * 0.10
      await prisma.platformFeeOwed.create({
        data: {
          hostId: booking.hostId,
          bookingId,
          amount: platformFee,
          reason: 'cash_booking_commission',
        }
      })

      console.log(`[Payment Choice] Guest ${user.email} selected CASH for booking ${booking.bookingCode}`)

      return NextResponse.json({
        success: true,
        paymentType: 'CASH',
      })
    }

    // CARD path — create Stripe PaymentIntent with manual capture
    const amount = Math.round(Number(booking.totalAmount) * 100) // cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      capture_method: 'manual',
      payment_method_options: {
        card: {
          request_extended_authorization: 'if_available',
        },
      },
      metadata: {
        bookingId,
        bookingCode: booking.bookingCode,
        type: 'recruited_booking_payment',
        guestEmail: user.email,
      },
      receipt_email: user.email,
      description: `ItWhip Rental — ${booking.car?.year} ${booking.car?.make} ${booking.car?.model} (${booking.bookingCode})`,
      statement_descriptor_suffix: 'ITWHIP RENTAL',
    })

    // Update booking with PaymentIntent info
    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        paymentType: 'CARD',
        paymentIntentId: paymentIntent.id,
      }
    })

    console.log(`[Payment Choice] Guest ${user.email} selected CARD for booking ${booking.bookingCode}, PI: ${paymentIntent.id}`)

    return NextResponse.json({
      success: true,
      paymentType: 'CARD',
      clientSecret: paymentIntent.client_secret,
    })

  } catch (error) {
    console.error('[Payment Choice] Error:', error)
    return NextResponse.json({ error: 'Failed to process payment choice' }, { status: 500 })
  }
}
