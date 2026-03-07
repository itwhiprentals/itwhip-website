// app/api/rentals/bookings/[id]/payment-choice/route.ts
// Guest selects payment method (CARD or CASH) for a recruited booking

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { stripe } from '@/app/lib/stripe/client'
import { completeBookingConfirmation } from '@/app/lib/booking/complete-confirmation'

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

    // Step 1: Find booking by ID with all data needed
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: {
        convertedFromProspect: { select: { id: true } },
        car: { select: { make: true, model: true, year: true } },
        renter: { select: { id: true, email: true } },
      }
    })

    if (!booking) {
      console.error(`[Payment Choice] Booking not found: ${bookingId}`)
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Step 2: Verify the authenticated user owns this booking
    // Match by renterId, renter email, or guestEmail (case-insensitive)
    const isOwner =
      (booking.renterId && booking.renterId === user.id) ||
      (booking.renter?.email && booking.renter.email.toLowerCase() === user.email.toLowerCase()) ||
      (booking.guestEmail && booking.guestEmail.toLowerCase() === user.email.toLowerCase())

    if (!isOwner) {
      console.error('[Payment Choice] Ownership check failed:', {
        bookingId: booking.bookingCode,
        authUser: { id: user.id, email: user.email },
        booking: { renterId: booking.renterId, renterEmail: booking.renter?.email, guestEmail: booking.guestEmail },
      })
      return NextResponse.json({ error: 'You are not authorized to modify this booking' }, { status: 403 })
    }

    // Step 3: Check booking state
    if (booking.paymentType) {
      // CARD selected but payment not completed — return existing PI's clientSecret
      // so the guest can finish entering card details
      if (booking.paymentType === 'CARD' && booking.paymentStatus === 'PENDING' && booking.paymentIntentId && choice === 'CARD') {
        const existingPi = await stripe.paymentIntents.retrieve(booking.paymentIntentId)
        console.log(`[Payment Choice] Returning existing PI clientSecret for ${booking.bookingCode} (card form incomplete)`)
        return NextResponse.json({
          success: true,
          paymentType: 'CARD',
          clientSecret: existingPi.client_secret,
        })
      }

      return NextResponse.json(
        { error: 'Payment method already selected', paymentType: booking.paymentType },
        { status: 409 }
      )
    }

    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Booking is ${booking.status}, not PENDING` },
        { status: 400 }
      )
    }

    // Step 4: Agreement must be signed before payment selection (for bookings with agreement sent)
    if (booking.agreementStatus && booking.agreementStatus !== 'not_sent' && booking.agreementStatus !== 'signed') {
      return NextResponse.json(
        { error: 'Please sign the rental agreement before selecting a payment method' },
        { status: 400 }
      )
    }

    // Step 5: Must be a recruited booking
    if (!booking.convertedFromProspect) {
      return NextResponse.json(
        { error: 'Payment choice is only available for recruited bookings' },
        { status: 400 }
      )
    }

    if (choice === 'CASH') {
      // For MANUAL bookings (created via create-from-request), auto-confirm
      // since the host already confirmed when they created the booking
      const isManualBooking = booking.bookingType === 'MANUAL'

      await prisma.rentalBooking.update({
        where: { id: bookingId },
        data: {
          paymentType: 'CASH',
          serviceFee: 0,
          totalAmount: booking.subtotal, // No service fee for cash
          notes: (booking.notes || '') + '\n[Guest selected Cash at Pickup]',
          // Auto-confirm for MANUAL bookings (host already confirmed at creation)
          ...(isManualBooking ? {
            status: 'CONFIRMED',
            hostStatus: 'APPROVED',
            hostReviewedAt: new Date(),
          } : {}),
        }
      })

      // Track the platform fee owed by the host
      const feeRate = Number(booking.platformFeeRate) || 0.10
      const platformFee = Number(booking.subtotal) * feeRate
      await prisma.platformFeeOwed.create({
        data: {
          hostId: booking.hostId,
          bookingId,
          amount: platformFee,
          reason: 'cash_booking_commission',
        }
      })

      console.log(`[Payment Choice] Guest ${user.email} selected CASH for booking ${booking.bookingCode}${isManualBooking ? ' (auto-confirmed)' : ''}`)

      // MANUAL bookings: run full confirmation side effects (availability, emails, SMS, notifications)
      if (isManualBooking) {
        completeBookingConfirmation(bookingId, { capturePayment: false })
          .then(result => {
            if (result.success) {
              console.log(`[Payment Choice] ✅ Full confirmation completed for ${booking.bookingCode}`)
            } else {
              console.error(`[Payment Choice] ❌ Confirmation side effects failed for ${booking.bookingCode}:`, result.error)
            }
          })
          .catch(e => console.error(`[Payment Choice] ❌ Confirmation error for ${booking.bookingCode}:`, e))
      }

      return NextResponse.json({
        success: true,
        paymentType: 'CASH',
        autoConfirmed: isManualBooking,
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
