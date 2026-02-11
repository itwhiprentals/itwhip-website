// app/api/rentals/confirm-saved-payment/route.ts
// Confirms a PaymentIntent using a saved payment method

import { NextRequest, NextResponse } from 'next/server'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { stripe } from '@/app/lib/stripe/client'

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { paymentIntentId, paymentMethodId } = body

    if (!paymentIntentId || !paymentMethodId) {
      return NextResponse.json(
        { success: false, error: 'Missing paymentIntentId or paymentMethodId' },
        { status: 400 }
      )
    }

    console.log('[Confirm Saved Payment] Confirming PI:', paymentIntentId, 'with PM:', paymentMethodId)

    // Retrieve the payment intent to verify it exists
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (!paymentIntent) {
      return NextResponse.json(
        { success: false, error: 'Payment intent not found' },
        { status: 404 }
      )
    }

    // Check if already confirmed (succeeded or authorized for manual capture)
    if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture') {
      console.log('[Confirm Saved Payment] Payment already confirmed, status:', paymentIntent.status)
      return NextResponse.json({
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status
      })
    }

    // Retrieve the payment method to get the customer ID
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
    const customerId = paymentMethod.customer as string | null

    console.log('[Confirm Saved Payment] Payment method belongs to customer:', customerId)

    // If the payment method belongs to a customer, we need to update the PaymentIntent
    // to include that customer before confirming
    if (customerId && paymentIntent.customer !== customerId) {
      console.log('[Confirm Saved Payment] Updating PI to attach customer:', customerId)
      await stripe.paymentIntents.update(paymentIntentId, {
        customer: customerId
      })
    }

    // Confirm the payment intent with the saved payment method
    const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'}/rentals/confirmation`
    })

    console.log('[Confirm Saved Payment] Confirmed! Status:', confirmedPaymentIntent.status)

    // Check if requires additional action (3D Secure, etc.)
    if (confirmedPaymentIntent.status === 'requires_action') {
      console.log('[Confirm Saved Payment] 3DS required — returning clientSecret for client-side handling')
      return NextResponse.json({
        success: true,
        requiresAction: true,
        paymentIntentId: confirmedPaymentIntent.id,
        clientSecret: confirmedPaymentIntent.client_secret,
        status: confirmedPaymentIntent.status
      })
    }

    // For manual capture (used in car rentals), requires_capture is a valid success state
    if (confirmedPaymentIntent.status !== 'succeeded' &&
        confirmedPaymentIntent.status !== 'processing' &&
        confirmedPaymentIntent.status !== 'requires_capture') {
      return NextResponse.json({
        success: false,
        error: `Payment failed with status: ${confirmedPaymentIntent.status}`
      })
    }

    return NextResponse.json({
      success: true,
      paymentIntentId: confirmedPaymentIntent.id,
      status: confirmedPaymentIntent.status
    })

  } catch (error: any) {
    console.error('[Confirm Saved Payment] Error:', error)

    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json({
        success: false,
        error: error.message || 'Your card was declined'
      })
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
