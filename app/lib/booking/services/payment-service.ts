// app/lib/booking/services/payment-service.ts
// Payment authorization, capture, and refund service
// Uses Stripe Extended Authorization for car rentals (up to 30 days hold)
// Reference: https://docs.stripe.com/payments/extended-authorization

import Stripe from 'stripe'
import { prisma } from '@/app/lib/database/prisma'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil' as Stripe.LatestApiVersion,
})

// Types
export interface AuthorizationResult {
  success: boolean
  paymentIntentId?: string
  clientSecret?: string
  error?: string
}

export interface CaptureResult {
  success: boolean
  chargeId?: string
  amountCaptured?: number
  error?: string
}

export interface RefundResult {
  success: boolean
  refundId?: string
  amountRefunded?: number
  error?: string
}

/**
 * Create a payment authorization (hold) without charging
 * Uses extended authorization for car rentals (up to 30 days)
 */
export async function authorizePayment(params: {
  bookingId: string
  amount: number // Amount in cents
  securityDeposit: number // Deposit in cents
  customerId?: string
  paymentMethodId?: string
  customerEmail: string
  customerName: string
  carDescription: string
}): Promise<AuthorizationResult> {
  try {
    const totalAmount = params.amount + params.securityDeposit

    // Create or get Stripe customer
    let customerId = params.customerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: params.customerEmail,
        name: params.customerName,
        metadata: {
          bookingId: params.bookingId,
        },
      })
      customerId = customer.id
    }

    // Create PaymentIntent with manual capture (authorization only)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      customer: customerId,
      payment_method: params.paymentMethodId,
      capture_method: 'manual', // Authorization only - capture later
      // Extended authorization for car rentals (up to 30 days)
      // Note: Requires IC+ pricing with Stripe
      payment_method_options: {
        card: {
          request_extended_authorization: 'if_available',
        },
      },
      metadata: {
        bookingId: params.bookingId,
        tripAmount: String(params.amount),
        securityDeposit: String(params.securityDeposit),
        type: 'car_rental_booking',
      },
      description: `Car rental: ${params.carDescription}`,
      statement_descriptor_suffix: 'ITWHIP RENTAL',
      // Confirm immediately if payment method provided
      confirm: !!params.paymentMethodId,
    })

    // Update booking with payment intent info
    await prisma.rentalBooking.update({
      where: { id: params.bookingId },
      data: {
        paymentIntentId: paymentIntent.id,
        stripeCustomerId: customerId,
        paymentStatus: 'AUTHORIZED',
      },
    })

    return {
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || undefined,
    }
  } catch (error) {
    console.error('[payment-service] Authorization error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authorization failed',
    }
  }
}

/**
 * Capture an authorized payment (charge the customer)
 * Called after Fleet approval + Host confirmation
 */
export async function capturePayment(params: {
  bookingId: string
  paymentIntentId?: string
  captureAmount?: number // Optional: capture different amount (for partial captures)
}): Promise<CaptureResult> {
  try {
    // Get booking if paymentIntentId not provided
    let paymentIntentId = params.paymentIntentId
    if (!paymentIntentId) {
      const booking = await prisma.rentalBooking.findUnique({
        where: { id: params.bookingId },
        select: { paymentIntentId: true },
      })
      paymentIntentId = booking?.paymentIntentId || undefined
    }

    if (!paymentIntentId) {
      return { success: false, error: 'No payment intent found for booking' }
    }

    // Capture the payment
    const captured = await stripe.paymentIntents.capture(paymentIntentId, {
      amount_to_capture: params.captureAmount, // Omit to capture full amount
    })

    // Update booking status
    await prisma.rentalBooking.update({
      where: { id: params.bookingId },
      data: {
        paymentStatus: 'PAID',
        paymentProcessedAt: new Date(),
        stripeChargeId: captured.latest_charge as string,
      },
    })

    return {
      success: true,
      chargeId: captured.latest_charge as string,
      amountCaptured: captured.amount_received,
    }
  } catch (error) {
    console.error('[payment-service] Capture error:', error)

    // Update booking with failure
    await prisma.rentalBooking.update({
      where: { id: params.bookingId },
      data: {
        paymentStatus: 'FAILED',
        paymentFailureReason: error instanceof Error ? error.message : 'Capture failed',
      },
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Capture failed',
    }
  }
}

/**
 * Cancel an authorization (release the hold)
 * Called when Fleet rejects or booking is cancelled before capture
 */
export async function cancelAuthorization(params: {
  bookingId: string
  paymentIntentId?: string
  reason?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    let paymentIntentId = params.paymentIntentId
    if (!paymentIntentId) {
      const booking = await prisma.rentalBooking.findUnique({
        where: { id: params.bookingId },
        select: { paymentIntentId: true },
      })
      paymentIntentId = booking?.paymentIntentId || undefined
    }

    if (!paymentIntentId) {
      return { success: false, error: 'No payment intent found for booking' }
    }

    // Cancel the payment intent (releases the authorization)
    await stripe.paymentIntents.cancel(paymentIntentId, {
      cancellation_reason: 'requested_by_customer',
    })

    // Update booking status
    await prisma.rentalBooking.update({
      where: { id: params.bookingId },
      data: {
        paymentStatus: 'CANCELLED' as any,
        cancellationReason: params.reason || 'Authorization cancelled',
      },
    })

    return { success: true }
  } catch (error) {
    console.error('[payment-service] Cancel authorization error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Cancel failed',
    }
  }
}

/**
 * Release security deposit (partial refund after trip)
 * Called when trip ends without damage claims
 */
export async function releaseSecurityDeposit(params: {
  bookingId: string
  depositAmount: number // Amount to release in cents
}): Promise<RefundResult> {
  try {
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: params.bookingId },
      select: { stripeChargeId: true, paymentIntentId: true },
    })

    if (!booking?.stripeChargeId && !booking?.paymentIntentId) {
      return { success: false, error: 'No charge found for booking' }
    }

    // Create refund for the deposit amount (with idempotency key to prevent duplicate refunds on retry)
    const refund = await stripe.refunds.create({
      payment_intent: booking.paymentIntentId || undefined,
      amount: params.depositAmount,
      reason: 'requested_by_customer',
      metadata: {
        bookingId: params.bookingId,
        type: 'security_deposit_release',
      },
    }, {
      idempotencyKey: `release-deposit-${params.bookingId}`,
    })

    // Update booking with refund info
    await prisma.rentalBooking.update({
      where: { id: params.bookingId },
      data: {
        depositRefunded: params.depositAmount / 100, // Store in dollars
        depositRefundedAt: new Date(),
      },
    })

    return {
      success: true,
      refundId: refund.id,
      amountRefunded: refund.amount,
    }
  } catch (error) {
    console.error('[payment-service] Deposit release error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Refund failed',
    }
  }
}

/**
 * Calculate guest payment breakdown
 * Splits a trip amount into platform fee, Arizona tax, and insurance pool
 * This is for guest-facing payment distribution, NOT host payout calculation.
 * Host payouts use fleet-size-based commission tiers in financialCalculator.ts
 */
export function calculateHostPayout(tripAmount: number): {
  hostPayout: number
  platformFee: number
  arizonaTax: number
  insurancePool: number
} {
  const platformFeeRate = 0.15 // 15% platform fee
  const arizonaTaxRate = 0.084 // 8.4% Arizona tax
  const insurancePoolRate = 0.016 // 1.6% for claims fund

  const platformFee = Math.round(tripAmount * platformFeeRate)
  const arizonaTax = Math.round(tripAmount * arizonaTaxRate)
  const insurancePool = Math.round(tripAmount * insurancePoolRate)
  const hostPayout = tripAmount - platformFee - arizonaTax - insurancePool

  return {
    hostPayout,
    platformFee,
    arizonaTax,
    insurancePool,
  }
}

/**
 * Get authorization expiration time
 * Extended authorizations can be up to 30 days
 */
export async function getAuthorizationExpiry(paymentIntentId: string): Promise<Date | null> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge'],
    })

    if (paymentIntent.latest_charge && typeof paymentIntent.latest_charge === 'object') {
      const charge = paymentIntent.latest_charge as Stripe.Charge
      if (charge.payment_method_details?.card?.capture_before) {
        return new Date(charge.payment_method_details.card.capture_before * 1000)
      }
    }

    // Default to 7 days if extended auth not available
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  } catch (error) {
    console.error('[payment-service] Get expiry error:', error)
    return null
  }
}
