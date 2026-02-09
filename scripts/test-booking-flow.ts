// scripts/test-booking-flow.ts
// Test script: Creates a realistic booking as a guest with no account
// Simulates what happens when testithwip3@yahoo.com books a Ferrari 488 Spider
// Run: npx tsx scripts/test-booking-flow.ts

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config() // .env as fallback
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil' as Stripe.LatestApiVersion,
})

// ============================================================================
// CONFIG
// ============================================================================

const GUEST_EMAIL = 'testithwip3@yahoo.com'
const GUEST_NAME = 'Test Guest'
const GUEST_PHONE = '4805551234'
const HOST_EMAIL = 'hxris09@gmail.com'

// Ferrari 488 Spider owned by hxris09@gmail.com
const CAR_ID = 'cmfqe8opw0001l204er9eb2yi'
const HOST_ID = 'cmfj0oe410001domyvn88xnxq'

// Booking dates: 3 days starting Feb 12
const START_DATE = new Date('2026-02-12T10:00:00-07:00') // Arizona MST
const END_DATE = new Date('2026-02-15T10:00:00-07:00')
const START_TIME = '10:00'
const END_TIME = '10:00'
const NUM_DAYS = 3

// Pricing constants
const SERVICE_FEE_RATE = 0.15
const BASIC_INSURANCE_DAILY = 15

// Scottsdale tax: 5.6% state + 1.75% city = 7.35%
const TAX_RATE = 0.0735

// ============================================================================
// PRICING CALCULATION (mirrors calculatePricing from pricing.ts)
// ============================================================================

function calculatePricing(dailyRate: number, days: number, city: string) {
  const subtotal = dailyRate * days
  const insurance = BASIC_INSURANCE_DAILY * days
  const delivery = 0
  const serviceFee = subtotal * SERVICE_FEE_RATE
  const taxes = Math.round((subtotal + serviceFee) * TAX_RATE * 100) / 100
  const total = subtotal + serviceFee + taxes + insurance + delivery

  return { subtotal, serviceFee, taxes, insurance, delivery, total, days }
}

// ============================================================================
// BOOKING CODE GENERATION (mirrors generateBookingCode)
// ============================================================================

function generateBookingCode(): string {
  const prefix = 'RENT'
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${year}-${random}`
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('=== ItWhip Test Booking Flow ===\n')

  // 1. Verify the car exists
  const car = await prisma.rentalCar.findUnique({
    where: { id: CAR_ID },
    select: {
      id: true, make: true, model: true, year: true, dailyRate: true,
      city: true, isActive: true, carType: true, hostId: true,
      photos: { select: { url: true }, take: 1 }
    }
  })

  if (!car) {
    console.error('Car not found:', CAR_ID)
    process.exit(1)
  }

  console.log(`Car: ${car.year} ${car.make} ${car.model}`)
  console.log(`Daily Rate: $${car.dailyRate}`)
  console.log(`City: ${car.city}`)
  console.log(`Host ID: ${car.hostId}\n`)

  // 2. Calculate pricing
  const pricing = calculatePricing(car.dailyRate, NUM_DAYS, car.city || 'Scottsdale')

  console.log('--- Pricing Breakdown ---')
  console.log(`Subtotal (${NUM_DAYS} days × $${car.dailyRate}): $${pricing.subtotal.toFixed(2)}`)
  console.log(`Service Fee (15%):                    $${pricing.serviceFee.toFixed(2)}`)
  console.log(`Taxes (7.35% Scottsdale):             $${pricing.taxes.toFixed(2)}`)
  console.log(`Insurance (basic $15/day):             $${pricing.insurance.toFixed(2)}`)
  console.log(`Delivery:                              $${pricing.delivery.toFixed(2)}`)
  console.log(`TOTAL:                                 $${pricing.total.toFixed(2)}`)
  console.log(`Deposit:                               $500.00\n`)

  // 3. Create Stripe PaymentIntent with manual capture
  console.log('--- Creating Stripe PaymentIntent ---')
  const totalCents = Math.round(pricing.total * 100)

  const customer = await stripe.customers.create({
    email: GUEST_EMAIL,
    name: GUEST_NAME,
    metadata: { source: 'test-booking-script' }
  })

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: 'usd',
    customer: customer.id,
    capture_method: 'manual',
    payment_method: 'pm_card_visa', // Stripe test card (4242 4242 4242 4242)
    confirm: true,
    automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
    metadata: {
      bookingType: 'test',
      carId: CAR_ID,
      guestEmail: GUEST_EMAIL,
    }
  })

  console.log(`PaymentIntent: ${paymentIntent.id}`)
  console.log(`Status: ${paymentIntent.status}`)
  console.log(`Amount: $${(paymentIntent.amount / 100).toFixed(2)}`)
  console.log(`Capture method: ${paymentIntent.capture_method}\n`)

  if (paymentIntent.status !== 'requires_capture') {
    console.error('Expected requires_capture, got:', paymentIntent.status)
    // Clean up
    await stripe.paymentIntents.cancel(paymentIntent.id)
    await stripe.customers.del(customer.id)
    process.exit(1)
  }

  // 4. Create the RentalBooking
  console.log('--- Creating Booking ---')
  const bookingCode = generateBookingCode()
  const bookingId = crypto.randomUUID()

  const booking = await prisma.rentalBooking.create({
    data: {
      id: bookingId,
      bookingCode,
      updatedAt: new Date(),
      carId: CAR_ID,
      hostId: HOST_ID,

      // Guest info
      guestEmail: GUEST_EMAIL,
      guestPhone: GUEST_PHONE,
      guestName: GUEST_NAME,

      // Dates
      startDate: START_DATE,
      endDate: END_DATE,
      startTime: START_TIME,
      endTime: END_TIME,

      // Pickup
      pickupLocation: 'Scottsdale, AZ',
      pickupType: 'host',
      returnLocation: 'Scottsdale, AZ',

      // Pricing
      dailyRate: car.dailyRate,
      numberOfDays: NUM_DAYS,
      subtotal: pricing.subtotal,
      deliveryFee: pricing.delivery,
      insuranceFee: pricing.insurance,
      serviceFee: pricing.serviceFee,
      taxes: pricing.taxes,
      totalAmount: pricing.total,
      depositAmount: 500,
      securityDeposit: 500,
      depositHeld: 0,

      // Status: PENDING with authorized payment hold
      status: 'PENDING' as any,
      paymentStatus: 'AUTHORIZED' as any,
      fleetStatus: 'PENDING',

      // Stripe
      paymentIntentId: paymentIntent.id,
      stripeCustomerId: customer.id,

      // Driver info (test data — assume verification passed)
      licenseVerified: true,
      licenseNumber: 'D12345678',
      licenseState: 'AZ',
      dateOfBirth: new Date('1990-05-15'),
      selfieVerified: true,
      verificationStatus: 'APPROVED' as any,

      // Fraud data (minimal test values)
      deviceFingerprint: 'test-script-fingerprint',
      sessionId: 'test-session-001',
      sessionStartedAt: new Date(),
      sessionDuration: 300,
      bookingIpAddress: '127.0.0.1',
      bookingUserAgent: 'ItWhip-TestScript/1.0',
      riskScore: 0,
      riskFlags: '[]',
      emailDomain: 'yahoo.com',
    },
    select: {
      id: true,
      bookingCode: true,
      status: true,
      paymentStatus: true,
      fleetStatus: true,
      totalAmount: true,
    }
  })

  console.log(`Booking ID: ${booking.id}`)
  console.log(`Booking Code: ${booking.bookingCode}`)
  console.log(`Status: ${booking.status}`)
  console.log(`Payment Status: ${booking.paymentStatus}`)
  console.log(`Fleet Status: ${booking.fleetStatus}`)
  console.log(`Total: $${booking.totalAmount?.toFixed(2)}\n`)

  // 5. Create GuestAccessToken (so guest can track booking)
  const accessToken = crypto.randomUUID()
  await prisma.guestAccessToken.create({
    data: {
      id: crypto.randomUUID(),
      token: accessToken,
      bookingId: booking.id,
      email: GUEST_EMAIL,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }
  })
  console.log(`Guest Access Token: ${accessToken}`)
  console.log(`Guest Dashboard: /bookings/track?token=${accessToken}\n`)

  // 6. Log activity
  await prisma.activityLog.create({
    data: {
      id: crypto.randomUUID(),
      action: 'booking_created',
      entityType: 'RentalBooking',
      entityId: booking.id,
      metadata: {
        source: 'test-script',
        guestEmail: GUEST_EMAIL,
        carId: CAR_ID,
        totalAmount: pricing.total,
      },
      ipAddress: '127.0.0.1'
    }
  })

  // 7. Send pending review email to fleet
  console.log('--- Sending Pending Review Email ---')
  try {
    // Dynamic import since this is a TS module with path aliases
    const { sendPendingReviewEmail } = await import('../app/lib/email/booking-emails')

    await sendPendingReviewEmail({
      guestEmail: GUEST_EMAIL,
      guestName: GUEST_NAME,
      bookingCode: booking.bookingCode,
      carMake: car.make,
      carModel: car.model,
      carImage: car.photos?.[0]?.url || '',
      startDate: START_DATE.toISOString(),
      endDate: END_DATE.toISOString(),
      pickupLocation: 'Scottsdale, AZ',
      totalAmount: pricing.total.toFixed(2),
      documentsSubmittedAt: new Date().toISOString(),
      estimatedReviewTime: '1-2 hours',
      trackingUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'}/bookings/track?token=${accessToken}`,
      accessToken,
    })
    console.log('Pending review email sent to fleet\n')
  } catch (emailError) {
    console.error('Email send failed (non-blocking):', emailError)
    console.log('Continuing without email...\n')
  }

  // 8. Summary
  console.log('========================================')
  console.log('  TEST BOOKING CREATED SUCCESSFULLY')
  console.log('========================================')
  console.log(`Booking Code:    ${booking.bookingCode}`)
  console.log(`Booking ID:      ${booking.id}`)
  console.log(`Guest:           ${GUEST_NAME} (${GUEST_EMAIL})`)
  console.log(`Car:             ${car.year} ${car.make} ${car.model}`)
  console.log(`Dates:           Feb 12-15, 2026 (3 days)`)
  console.log(`Total:           $${pricing.total.toFixed(2)}`)
  console.log(`Stripe PI:       ${paymentIntent.id}`)
  console.log(`PI Status:       ${paymentIntent.status} (hold placed, NOT charged)`)
  console.log(`Fleet Status:    PENDING`)
  console.log(`Host Status:     null (not yet sent to host)`)
  console.log('')
  console.log('NEXT STEPS (all manual in UI):')
  console.log('1. Open fleet dashboard → find this booking')
  console.log('2. Fleet approves → host gets email')
  console.log(`3. Host logs in: /partner/login (${HOST_EMAIL} / ItWhip2026!)`)
  console.log('4. Host approves → payment captured, guest confirmed')
  console.log('5. Check fleet/banking for revenue calculations')
  console.log('')
  console.log('--- Fleet/Banking Revenue Preview ---')
  console.log(`Guest pays:       $${pricing.total.toFixed(2)}`)
  console.log(`Service fee:      $${pricing.serviceFee.toFixed(2)} (15% of $${pricing.subtotal.toFixed(2)})`)
  const commission = pricing.subtotal * 0.20 // Host commission rate is 20% (Gold tier)
  console.log(`Commission (20%): $${commission.toFixed(2)} (of $${pricing.subtotal.toFixed(2)} subtotal)`)
  const insurancePlatformShare = pricing.insurance * 0.30
  console.log(`Insurance share:  $${insurancePlatformShare.toFixed(2)} (30% of $${pricing.insurance.toFixed(2)})`)
  const platformRevenue = pricing.serviceFee + commission + insurancePlatformShare
  console.log(`Platform revenue: $${platformRevenue.toFixed(2)}`)
  const hostPayout = pricing.subtotal - commission - 1.50
  console.log(`Host payout:      $${hostPayout.toFixed(2)} ($${pricing.subtotal.toFixed(2)} - $${commission.toFixed(2)} - $1.50 processing)`)
  console.log('========================================\n')
}

main()
  .catch(err => {
    console.error('FATAL:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
