// app/api/rentals/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { prisma } from '@/app/lib/database/prisma'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// Validation schema
const paymentIntentSchema = z.object({
  amount: z.number().positive(), // Amount in cents
  deposit: z.number().positive(), // Deposit in cents
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
      where: { email: session.user.email }
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

    const { amount, deposit, bookingDetails } = validationResult.data

    // Get car and host details for metadata
    const car = await prisma.rentalCar.findUnique({
      where: { id: bookingDetails.carId },
      include: { host: true }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    // Calculate platform fee (15-20% of rental amount)
    const platformFeePercent = 0.15 // 15%
    const platformFee = Math.round(amount * platformFeePercent)
    const hostPayout = amount - platformFee

    // Check if user has a Stripe customer ID
    let stripeCustomerId = await getOrCreateStripeCustomer(user, session.user.email)

    // Create payment intent with metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount + deposit, // Total charge (rental + deposit)
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: {
        type: 'car_rental',
        userId: user.id,
        carId: bookingDetails.carId,
        hostId: bookingDetails.hostId,
        rentalAmount: amount.toString(),
        depositAmount: deposit.toString(),
        platformFee: platformFee.toString(),
        hostPayout: hostPayout.toString(),
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
      // Transfer data for connected accounts (if using Stripe Connect)
      // transfer_data: {
      //   destination: car.host.stripeAccountId,
      //   amount: hostPayout
      // },
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

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      deposit: deposit,
      total: amount + deposit,
      platformFee: platformFee,
      hostPayout: hostPayout
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
      receipt_url: paymentIntent.charges?.data[0]?.receipt_url
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
  // Check if user already has a Stripe customer ID stored
  // This would typically be stored in your User model
  // For now, we'll create a new customer or search for existing

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

    // TODO: Save customer.id to user record in database
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: { stripeCustomerId: customer.id }
    // })

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