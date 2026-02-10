// app/api/rentals/payment-element/route.ts
// Payment Intent creation for Stripe Payment Element with server-side validation
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/app/lib/database/prisma'
import { calculatePricing } from '@/app/(guest)/rentals/lib/pricing'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil' as Stripe.LatestApiVersion,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, email, carId, startDate, endDate, metadata } = body

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
        host: {
          select: {
            depositAmount: true,
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

    // Recalculate pricing server-side
    const pricing = calculatePricing({
      dailyRate: car.dailyRate,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      weeklyDiscount: car.weeklyDiscount || undefined,
      monthlyDiscount: car.monthlyDiscount || undefined,
      deliveryFee: car.deliveryFee || 0,
      city: car.city || 'Phoenix',
    })

    const depositAmount = car.host.depositAmount || 0
    const serverTotalCents = Math.round((pricing.total + depositAmount) * 100)

    // Allow tolerance for credits/wallet/rounding (client may apply credits reducing the amount)
    // Client amount should be <= server total (credits reduce it) but never MORE than server total
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
      days: pricing.days.toString(),
      subtotal: pricing.subtotal.toFixed(2),
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
