// app/api/rentals/payment-element/route.ts
// Simplified Payment Intent creation for Stripe Payment Element
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, email, carId, metadata } = body

    // Amount is required and must be positive (in cents)
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount required' },
        { status: 400 }
      )
    }

    // Build metadata object
    const paymentMetadata: Record<string, string> = {
      type: 'car_rental_booking',
      ...(carId && { carId }),
      ...(metadata && typeof metadata === 'object' ? metadata : {})
    }

    // Create Payment Intent with explicit payment methods
    // Only card, Apple Pay, Google Pay, Cash App Pay, Link - NO bank accounts (ACH takes days to clear)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure integer
      currency: 'usd',
      payment_method_types: ['card', 'cashapp', 'link'],
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

// Update PaymentIntent amount (for when pricing changes)
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
