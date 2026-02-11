// app/lib/stripe/payment-processor.ts
import { stripe, formatAmountForStripe, isTestMode } from './client'
import type Stripe from 'stripe'

interface CreateCustomerParams {
  email: string
  name: string
  phone?: string
  metadata?: Record<string, string>
}

interface CreatePaymentIntentParams {
  customerId: string
  amount: number
  bookingId: string
  description?: string
  paymentMethodId?: string
}

interface ChargeResult {
  status: 'succeeded' | 'failed' | 'requires_action'
  chargeId?: string
  error?: string
  amount?: number
}

interface AdjustedCharge {
  type: 'mileage' | 'fuel' | 'late' | 'damage' | 'cleaning' | 'other'
  originalAmount: number
  adjustedAmount: number
  reason?: string
}

export class PaymentProcessor {
  /**
   * Create a Stripe customer for guest bookings
   */
  static async createCustomer(params: CreateCustomerParams): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email: params.email,
        name: params.name,
        phone: params.phone,
        metadata: {
          ...params.metadata,
          test_mode: isTestMode() ? 'true' : 'false',
          created_via: 'itwhip_booking'
        }
      })
      
      console.log('Stripe customer created:', customer.id)
      return customer
    } catch (error) {
      console.error('Error creating Stripe customer:', error)
      throw error
    }
  }

  /**
   * Create a payment intent for manual capture
   * This authorizes the card but doesn't charge until admin approval
   */
  static async createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        customer: params.customerId,
        amount: formatAmountForStripe(params.amount),
        currency: 'usd',
        capture_method: 'manual', // Don't charge immediately
        description: params.description || `Booking ${params.bookingId}`,
        metadata: {
          booking_id: params.bookingId,
          test_mode: isTestMode() ? 'true' : 'false'
        },
        // Test mode specific settings
        ...(isTestMode() && {
          statement_descriptor: 'ITWHIP TEST',
        })
      })
      
      console.log('Payment intent created:', paymentIntent.id, 'Status:', paymentIntent.status)
      return paymentIntent
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw error
    }
  }

  /**
   * Confirm and capture a payment intent (charge the card after admin approval)
   * This is called when admin approves the booking
   */
  static async confirmAndCapturePayment(
    paymentIntentId: string, 
    paymentMethodId?: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      // First, update the payment intent with payment method if provided
      if (paymentMethodId) {
        await stripe.paymentIntents.update(paymentIntentId, {
          payment_method: paymentMethodId
        })
      }

      // Confirm the payment intent with return_url for 3D Secure
      const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/rentals/payment-complete`
      })

      // If payment requires no further action, capture it immediately
      if (confirmedIntent.status === 'requires_capture') {
        const capturedIntent = await stripe.paymentIntents.capture(paymentIntentId)
        console.log('Payment captured:', capturedIntent.id, 'Status:', capturedIntent.status)
        return capturedIntent
      }

      return confirmedIntent
    } catch (error) {
      console.error('Error confirming and capturing payment:', error)
      throw error
    }
  }

  /**
   * Charge additional fees for trip overages (mileage, fuel, late return, damage)
   * Uses saved payment method from the original booking
   */
  static async chargeAdditionalFees(
    customerId: string,
    paymentMethodId: string,
    amountInCents: number,
    description: string,
    metadata?: Record<string, any>
  ): Promise<ChargeResult> {
    try {
      // Validate inputs
      if (!customerId || !paymentMethodId) {
        throw new Error('Customer ID and payment method are required')
      }

      if (amountInCents <= 0) {
        throw new Error('Amount must be greater than zero')
      }

      // Create and immediately charge a payment intent for additional fees
      const paymentIntent = await stripe.paymentIntents.create({
        customer: customerId,
        payment_method: paymentMethodId,
        amount: amountInCents,
        currency: 'usd',
        confirm: true, // Charge immediately
        off_session: true, // Card not present (using saved card)
        description,
        metadata: {
          type: 'trip_additional_charges',
          test_mode: isTestMode() ? 'true' : 'false',
          charged_at: new Date().toISOString(),
          ...metadata
        },
        // Handle Strong Customer Authentication (SCA) for European cards
        payment_method_options: {
          card: {
            request_three_d_secure: 'automatic'
          }
        }
      })

      console.log(`Additional charge attempt for ${amountInCents / 100} USD:`, paymentIntent.status)

      // Return result based on payment status
      if (paymentIntent.status === 'succeeded') {
        return {
          status: 'succeeded',
          chargeId: paymentIntent.id,
          amount: paymentIntent.amount / 100
        }
      } else if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_payment_method') {
        // Payment needs additional authentication (3D Secure, etc.)
        return {
          status: 'requires_action',
          error: 'Payment requires additional authentication',
          chargeId: paymentIntent.id
        }
      } else {
        return {
          status: 'failed',
          error: paymentIntent.last_payment_error?.message || 'Payment failed',
          chargeId: paymentIntent.id
        }
      }
    } catch (error: any) {
      console.error('Error charging additional fees:', error)
      return {
        status: 'failed',
        error: error.message || 'Failed to process additional charges'
      }
    }
  }

  /**
   * Waive charges with percentage options
   * Creates a record of waived charges without processing payment
   */
  static async waiveCharges(
    bookingId: string,
    originalAmount: number,
    waivePercentage: number,
    reason: string,
    adminId: string
  ): Promise<{
    waivedAmount: number
    remainingAmount: number
    waiveRecord: any
  }> {
    try {
      // Validate waive percentage
      if (waivePercentage < 0 || waivePercentage > 100) {
        throw new Error('Waive percentage must be between 0 and 100')
      }

      const waivedAmount = (originalAmount * waivePercentage) / 100
      const remainingAmount = originalAmount - waivedAmount

      // Create a waive record in Stripe metadata (for audit trail)
      // In production, you'd also save this to your database
      const waiveRecord = {
        bookingId,
        originalAmount,
        waivePercentage,
        waivedAmount,
        remainingAmount,
        reason,
        adminId,
        waivedAt: new Date().toISOString(),
        test_mode: isTestMode() ? 'true' : 'false'
      }

      console.log(`Charges waived: ${waivePercentage}% of $${originalAmount} = $${waivedAmount} waived`)

      // If there's a remaining amount, it should be charged separately
      return {
        waivedAmount,
        remainingAmount,
        waiveRecord
      }
    } catch (error: any) {
      console.error('Error waiving charges:', error)
      throw new Error(`Failed to waive charges: ${error.message}`)
    }
  }

  /**
   * Retry a failed charge with the same or different payment method
   */
  static async retryFailedCharge(
    customerId: string,
    paymentMethodId: string,
    amount: number,
    originalChargeId: string,
    metadata?: Record<string, any>
  ): Promise<ChargeResult> {
    try {
      console.log(`Retrying failed charge ${originalChargeId} for $${amount}`)

      // Attempt to charge again with retry metadata
      const result = await this.chargeAdditionalFees(
        customerId,
        paymentMethodId,
        formatAmountForStripe(amount),
        `Retry: Trip charges (original: ${originalChargeId})`,
        {
          ...metadata,
          retry: true,
          original_charge_id: originalChargeId,
          retry_attempt: (metadata?.retry_attempt || 0) + 1,
          retried_at: new Date().toISOString()
        }
      )

      if (result.status === 'succeeded') {
        console.log(`Retry successful for charge ${originalChargeId}`)
      } else {
        console.log(`Retry failed for charge ${originalChargeId}: ${result.error}`)
      }

      return result
    } catch (error: any) {
      console.error('Error retrying charge:', error)
      return {
        status: 'failed',
        error: error.message || 'Failed to retry charge'
      }
    }
  }

  /**
   * Adjust charges and process the modified amount
   * Allows admin to modify individual charge line items before processing
   */
  static async adjustAndCharge(
    customerId: string,
    paymentMethodId: string,
    adjustedCharges: AdjustedCharge[],
    bookingId: string,
    adminId: string
  ): Promise<ChargeResult & { adjustmentRecord: any }> {
    try {
      // Calculate totals
      const originalTotal = adjustedCharges.reduce((sum, charge) => sum + charge.originalAmount, 0)
      const adjustedTotal = adjustedCharges.reduce((sum, charge) => sum + charge.adjustedAmount, 0)
      const totalAdjustment = originalTotal - adjustedTotal

      // Create adjustment record for audit
      const adjustmentRecord = {
        bookingId,
        adminId,
        originalTotal,
        adjustedTotal,
        totalAdjustment,
        adjustmentPercentage: ((totalAdjustment / originalTotal) * 100).toFixed(2),
        adjustments: adjustedCharges,
        adjustedAt: new Date().toISOString()
      }

      console.log(`Charges adjusted: $${originalTotal} -> $${adjustedTotal} (${totalAdjustment} reduction)`)

      // If adjusted total is 0 or negative, treat as full waive
      if (adjustedTotal <= 0) {
        return {
          status: 'succeeded',
          amount: 0,
          adjustmentRecord,
          error: undefined,
          chargeId: undefined
        }
      }

      // Process the adjusted amount
      const chargeResult = await this.chargeAdditionalFees(
        customerId,
        paymentMethodId,
        formatAmountForStripe(adjustedTotal),
        `Adjusted trip charges for booking ${bookingId}`,
        {
          booking_id: bookingId,
          admin_id: adminId,
          original_amount: originalTotal,
          adjusted_amount: adjustedTotal,
          adjustment_record: JSON.stringify(adjustmentRecord)
        }
      )

      return {
        ...chargeResult,
        adjustmentRecord
      }
    } catch (error: any) {
      console.error('Error adjusting and charging:', error)
      return {
        status: 'failed',
        error: error.message || 'Failed to process adjusted charges',
        adjustmentRecord: null
      }
    }
  }

  /**
   * Capture a payment intent (charge the card after admin approval)
   */
  static async capturePayment(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId)
      console.log('Payment captured:', paymentIntent.id, 'Status:', paymentIntent.status)
      return paymentIntent
    } catch (error) {
      console.error('Error capturing payment:', error)
      throw error
    }
  }

  /**
   * Cancel a payment intent (release the authorization)
   */
  static async cancelPayment(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId)
      console.log('Payment cancelled:', paymentIntent.id)
      return paymentIntent
    } catch (error) {
      console.error('Error cancelling payment:', error)
      throw error
    }
  }

  /**
   * Create a refund for a captured payment
   */
  static async refundPayment(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<Stripe.Refund> {
    try {
      // Idempotency key prevents duplicate refunds on network retries or double-clicks
      const amountKey = amount ? formatAmountForStripe(amount) : 'full'
      const idempotencyKey = `refund_${paymentIntentId}_${amountKey}_${reason || 'requested_by_customer'}`

      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? formatAmountForStripe(amount) : undefined, // Partial refund if amount specified
        reason: reason as Stripe.RefundCreateParams.Reason || 'requested_by_customer',
        metadata: {
          test_mode: isTestMode() ? 'true' : 'false'
        }
      }, {
        idempotencyKey
      })
      
      console.log('Refund created:', refund.id, 'Amount:', refund.amount)
      return refund
    } catch (error) {
      console.error('Error creating refund:', error)
      throw error
    }
  }

  /**
   * Create a test payment method (for testing only)
   */
  static async createTestPaymentMethod(): Promise<Stripe.PaymentMethod> {
    if (!isTestMode()) {
      throw new Error('Test payment methods can only be created in test mode')
    }

    try {
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          token: 'tok_visa' // Test token for successful payment
        }
      })
      
      console.log('Test payment method created:', paymentMethod.id)
      return paymentMethod
    } catch (error) {
      console.error('Error creating test payment method:', error)
      throw error
    }
  }

  /**
   * Attach a payment method to a customer
   */
  static async attachPaymentMethod(
    paymentMethodId: string, 
    customerId: string
  ): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await stripe.paymentMethods.attach(
        paymentMethodId,
        { customer: customerId }
      )
      
      console.log('Payment method attached:', paymentMethod.id)
      return paymentMethod
    } catch (error) {
      console.error('Error attaching payment method:', error)
      throw error
    }
  }

  /**
   * Get payment intent status
   */
  static async getPaymentStatus(paymentIntentId: string): Promise<{
    status: string
    amount: number
    captured: boolean
    error?: string
  }> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      
      return {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        captured: paymentIntent.status === 'succeeded',
        error: paymentIntent.last_payment_error?.message
      }
    } catch (error) {
      console.error('Error retrieving payment status:', error)
      throw error
    }
  }
}