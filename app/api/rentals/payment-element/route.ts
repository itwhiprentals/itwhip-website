// app/api/rentals/payment-element/route.ts
// Payment Intent creation for Stripe Payment Element with server-side validation
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/app/lib/database/prisma'
import { calculateBookingPricing, getActualDeposit } from '@/app/(guest)/rentals/lib/booking-pricing'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil' as Stripe.LatestApiVersion,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, email, carId, startDate, endDate, insurancePrice, deliveryFee, enhancements, insuranceVerified, metadata } = body

    // Amount is required and must be positive (in cents)
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount required' },
        { status: 400 }
      )
    }

    // Server-side validation: require carId and dates to verify amount
    if (!carId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'carId, startDate, and endDate are required' },
        { status: 400 }
      )
    }

    // Fetch car details for server-side price calculation
    const car = await prisma.rentalCar.findUnique({
      where: { id: carId },
      select: {
        id: true,
        dailyRate: true,
        deliveryFee: true,
        city: true,
        weeklyDiscount: true,
        monthlyDiscount: true,
        make: true,
        // Deposit fields for getActualDeposit()
        noDeposit: true,
        customDepositAmount: true,
        vehicleDepositMode: true,
        host: {
          select: {
            depositAmount: true,
            requireDeposit: true,
            makeDeposits: true,
          }
        }
      }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Calculate days the same way the client does
    const days = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))

    // Recalculate pricing server-side using the SAME function as the client
    // This includes insurance, delivery, and enhancements in the tax base (AZ law)
    const pricing = calculateBookingPricing({
      dailyRate: car.dailyRate,
      days,
      insurancePrice: insurancePrice || 0,
      deliveryFee: deliveryFee ?? (car.deliveryFee || 0),
      enhancements: enhancements || undefined,
      city: car.city || 'Phoenix',
    })

    // Calculate deposit (50% off if guest has verified personal insurance)
    let depositAmount = getActualDeposit(car)
    if (insuranceVerified) {
      depositAmount = depositAmount * 0.5
    }

    const serverTotalCents = Math.round((pricing.total + depositAmount) * 100)

    // Stripe minimum is $0.50 (50 cents)
    if (amount < 50) {
      return NextResponse.json(
        { error: 'Payment amount is too low.' },
        { status: 400 }
      )
    }

    // Lower bound: client amount must be at least 50% of server total (credits can reduce but not eliminate)
    if (serverTotalCents > 0 && amount < serverTotalCents * 0.5) {
      console.warn(`[Payment Element] Amount suspiciously low: client=${amount}c, server=${serverTotalCents}c, carId=${carId}`)
      return NextResponse.json(
        { error: 'Payment amount is below the minimum for this booking. Please refresh and try again.' },
        { status: 400 }
      )
    }

    // Upper bound: client amount should never exceed server total (credits can only reduce, not increase)
    if (amount > serverTotalCents * 1.05) {
      console.warn(`[Payment Element] Amount mismatch: client=${amount}c, server=${serverTotalCents}c, carId=${carId}`)
      return NextResponse.json(
        { error: 'Payment amount exceeds expected total. Please refresh and try again.' },
        { status: 400 }
      )
    }

    // Build metadata with server-verified breakdown
    const paymentMetadata: Record<string, string> = {
      type: 'car_rental_booking',
      guestEmail: email || 'unknown',
      carId,
      serverTotal: serverTotalCents.toString(),
      days: days.toString(),
      subtotal: pricing.basePrice.toFixed(2),
      serviceFee: pricing.serviceFee.toFixed(2),
      taxes: pricing.taxes.toFixed(2),
      deposit: depositAmount.toFixed(2),
      ...(metadata && typeof metadata === 'object' ? metadata : {})
    }

    // Create Payment Intent — manual capture: funds held until host approves
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      capture_method: 'manual',
      metadata: paymentMetadata,
      ...(email && { receipt_email: email }),
      description: 'ItWhip Car Rental',
      statement_descriptor: 'ITWHIP RENTAL',
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })

  } catch (error) {
    console.error('[Payment Element] Error creating PaymentIntent:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}

// Update PaymentIntent amount (for when pricing changes, e.g. credits applied)
export async function PATCH(request: NextRequest) {
  try {
    const { paymentIntentId, amount, metadata } = await request.json()

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID required' },
        { status: 400 }
      )
    }

    const updateData: Stripe.PaymentIntentUpdateParams = {}

    if (amount && amount > 0) {
      // Verify new amount doesn't exceed original (credits can only reduce, not increase)
      const existingIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      const originalServerTotal = parseInt(existingIntent.metadata?.serverTotal || '0')

      if (originalServerTotal > 0 && amount > originalServerTotal * 1.05) {
        return NextResponse.json(
          { error: 'Updated amount exceeds original total' },
          { status: 400 }
        )
      }

      updateData.amount = Math.round(amount)
    }

    if (metadata) {
      updateData.metadata = metadata
    }

    const paymentIntent = await stripe.paymentIntents.update(
      paymentIntentId,
      updateData
    )

    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      clientSecret: paymentIntent.client_secret,
    })

  } catch (error) {
    console.error('[Payment Element] Error updating PaymentIntent:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    )
  }
}
