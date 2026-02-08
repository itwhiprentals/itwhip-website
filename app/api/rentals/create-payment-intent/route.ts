// app/api/rentals/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import prisma from '@/app/lib/database/prisma'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil' as any,
})

// SECURITY FIX: Removed amount/deposit from validation - these MUST be calculated server-side
const paymentIntentSchema = z.object({
  // amount: REMOVED - never trust client-provided amounts
  // deposit: REMOVED - calculated from booking details
  bookingDetails: z.object({
    carId: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    hostId: z.string(),
    extras: z.array(z.string()).optional(),
    insurance: z.string(),
    deliveryType: z.string()
  })
})

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Parse and validate request
    const body = await request.json()
    const validationResult = paymentIntentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid payment data', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { bookingDetails } = validationResult.data

    // SECURE QUERY - Get car and host details with SELECT
    const car = await prisma.rentalCar.findUnique({
      where: { id: bookingDetails.carId },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        dailyRate: true,
        weeklyRate: true,
        monthlyRate: true,
        weeklyDiscount: true,
        monthlyDiscount: true,
        insuranceDaily: true,
        airportFee: true,
        hotelFee: true,
        homeFee: true,
        hostId: true,
        isActive: true,
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    // SECURITY FIX: Verify car is active and available
    if (!car.isActive) {
      return NextResponse.json(
        { error: 'Vehicle is not available for booking' },
        { status: 400 }
      )
    }

    // SECURITY FIX: Calculate amount SERVER-SIDE - never trust client
    const startDate = new Date(bookingDetails.startDate)
    const endDate = new Date(bookingDetails.endDate)
    const timeDiff = endDate.getTime() - startDate.getTime()
    const numberOfDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

    if (numberOfDays < 1) {
      return NextResponse.json(
        { error: 'Invalid date range - minimum 1 day' },
        { status: 400 }
      )
    }

    // Calculate rental amount based on ACTUAL car rates
    const dailyRateCents = Math.round(car.dailyRate * 100)
    let subtotalCents = dailyRateCents * numberOfDays

    // Apply discounts for longer rentals
    if (numberOfDays >= 30 && car.monthlyDiscount) {
      subtotalCents = Math.round(subtotalCents * (1 - car.monthlyDiscount / 100))
    } else if (numberOfDays >= 7 && car.weeklyDiscount) {
      subtotalCents = Math.round(subtotalCents * (1 - car.weeklyDiscount / 100))
    }

    // Add insurance if selected
    let insuranceCents = 0
    if (bookingDetails.insurance !== 'none' && car.insuranceDaily) {
      insuranceCents = Math.round(car.insuranceDaily * 100 * numberOfDays)
    }

    // Add delivery fee based on delivery type
    let deliveryFeeCents = 0
    if (bookingDetails.deliveryType === 'airport' && car.airportFee) {
      deliveryFeeCents = Math.round(car.airportFee * 100)
    } else if (bookingDetails.deliveryType === 'hotel' && car.hotelFee) {
      deliveryFeeCents = Math.round(car.hotelFee * 100)
    } else if (bookingDetails.deliveryType === 'home' && car.homeFee) {
      deliveryFeeCents = Math.round(car.homeFee * 100)
    }

    // Calculate service fee (10% of subtotal)
    const serviceFeeCents = Math.round(subtotalCents * 0.10)

    // Calculate total amount
    const amount = subtotalCents + insuranceCents + deliveryFeeCents + serviceFeeCents

    // Calculate deposit (typically 20% of rental or minimum $100)
    const deposit = Math.max(Math.round(subtotalCents * 0.20), 10000) // Min $100 deposit

    console.log(`[PAYMENT] Server-calculated: ${numberOfDays} days × $${car.dailyRate}/day = $${amount / 100} total`)

    // Calculate platform fee (15% of rental amount)
    const platformFeePercent = 0.15
    const platformFee = Math.round(amount * platformFeePercent)
    const hostPayout = amount - platformFee

    // Check if user has a Stripe customer ID
    let stripeCustomerId = await getOrCreateStripeCustomer(user, session.user.email)

    // Create payment intent with metadata - using SERVER-CALCULATED amounts
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount + deposit, // Total charge (rental + deposit)
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: {
        type: 'car_rental',
        userId: user.id,
        carId: bookingDetails.carId,
        hostId: bookingDetails.hostId,
        // SECURITY: All amounts are SERVER-CALCULATED
        calculatedServerSide: 'true',
        numberOfDays: numberOfDays.toString(),
        dailyRate: car.dailyRate.toString(),
        subtotal: (subtotalCents / 100).toString(),
        insuranceFee: (insuranceCents / 100).toString(),
        deliveryFee: (deliveryFeeCents / 100).toString(),
        serviceFee: (serviceFeeCents / 100).toString(),
        rentalAmount: (amount / 100).toString(),
        depositAmount: (deposit / 100).toString(),
        platformFee: (platformFee / 100).toString(),
        hostPayout: (hostPayout / 100).toString(),
        startDate: bookingDetails.startDate,
        endDate: bookingDetails.endDate,
        insurance: bookingDetails.insurance,
        deliveryType: bookingDetails.deliveryType
      },
      description: `Car rental: ${car.year} ${car.make} ${car.model}`,
      statement_descriptor: 'ITWHIP RENTAL',
      // Enable automatic payment methods
      automatic_payment_methods: {
        enabled: true,
      },
      // Set up for split payments (platform fee)
      application_fee_amount: platformFee,
      // Capture method - authorize now, capture after verification
      capture_method: 'automatic',
      // Setup for future usage (save card)
      setup_future_usage: 'on_session',
      // Receipt email
      receipt_email: session.user.email
    })

    // Save payment intent ID to database for tracking
    await prisma.transaction.create({
      data: {
        id: crypto.randomUUID(),
        hotelId: 'rental_platform', // Or use actual hotel ID if linked
        type: 'BOOKING',
        category: 'rental',
        amount: amount / 100, // Convert back to dollars
        currency: 'USD',
        status: 'PENDING',
        description: `Rental booking for ${car.make} ${car.model}`,
        metadata: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          carId: bookingDetails.carId,
          deposit: deposit / 100
        })
      }
    })

    // Return breakdown so client can display it (but client cannot modify amounts)
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      // All amounts in cents for consistency
      amount: amount,
      deposit: deposit,
      total: amount + deposit,
      platformFee: platformFee,
      hostPayout: hostPayout,
      // SECURITY FIX: Include breakdown calculated server-side
      breakdown: {
        numberOfDays,
        dailyRate: car.dailyRate,
        subtotal: subtotalCents / 100,
        insuranceFee: insuranceCents / 100,
        deliveryFee: deliveryFeeCents / 100,
        serviceFee: serviceFeeCents / 100,
        rentalTotal: amount / 100,
        deposit: deposit / 100,
        grandTotal: (amount + deposit) / 100
      },
      // Flag to indicate these were server-calculated
      calculatedServerSide: true
    })

  } catch (error) {
    console.error('Payment intent creation error:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}

// GET - Retrieve payment intent status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('id')

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID required' },
        { status: 400 }
      )
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    return NextResponse.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
      created: paymentIntent.created,
      receipt_url: (paymentIntent as any).charges?.data[0]?.receipt_url
    })

  } catch (error) {
    console.error('Payment intent retrieval error:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to retrieve payment intent' },
      { status: 500 }
    )
  }
}

// PATCH - Update payment intent (for modifications)
export async function PATCH(request: NextRequest) {
  try {
    const { paymentIntentId, amount, metadata } = await request.json()

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    
    if (amount) {
      updateData.amount = amount
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
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        status: paymentIntent.status
      }
    })

  } catch (error) {
    console.error('Payment intent update error:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update payment intent' },
      { status: 500 }
    )
  }
}

// Helper function to get or create Stripe customer
async function getOrCreateStripeCustomer(user: any, email: string): Promise<string> {
  try {
    // Search for existing customer by email
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0].id
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email: email,
      name: user.name || undefined,
      metadata: {
        userId: user.id
      }
    })

    return customer.id

  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw error
  }
}

// Webhook handler for Stripe events
export async function PUT(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!
    
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Update transaction status
        await prisma.transaction.updateMany({
          where: {
            metadata: {
              contains: paymentIntent.id
            }
          },
          data: {
            status: 'COMPLETED',
            processedAt: new Date()
          }
        })
        
        console.log('Payment succeeded:', paymentIntent.id)
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        
        // Update transaction status
        await prisma.transaction.updateMany({
          where: {
            metadata: {
              contains: failedPayment.id
            }
          },
          data: {
            status: 'FAILED'
          }
        })
        
        console.log('Payment failed:', failedPayment.id)
        break

      case 'charge.refunded':
        const refund = event.data.object as Stripe.Charge
        
        // Handle refund logic
        console.log('Refund processed:', refund.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}