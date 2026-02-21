// app/api/ai/booking/checkout/confirm/route.ts
// After payment succeeds, create booking + release soft-lock

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'
import prisma from '@/app/lib/database/prisma'
import { getCheckoutUser } from '../auth'
import { getActualDeposit } from '@/app/[locale]/(guest)/rentals/lib/booking-pricing'
import { getTaxRate } from '@/app/[locale]/(guest)/rentals/lib/arizona-taxes'
import { sendEmail } from '@/app/lib/email/sender'
import { getBookingConfirmedTemplate } from '@/app/lib/email/templates/booking-confirmed'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

const confirmSchema = z.object({
  checkoutSessionId: z.string().min(1),
  paymentIntentId: z.string().min(1),
})

export async function POST(request: NextRequest) {
  let piIdForCleanup: string | undefined
  try {
    // Auth check — uses accessToken cookie (same as guest API)
    const user = await getCheckoutUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Look up guest's ReviewerProfile for linking
    const reviewerProfile = await prisma.reviewerProfile.findUnique({
      where: { email: user.email! },
      select: { id: true },
    })

    // Parse request
    const body = await request.json()
    const parsed = confirmSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { checkoutSessionId, paymentIntentId } = parsed.data
    piIdForCleanup = paymentIntentId

    // Load checkout session
    const pending = await prisma.pendingCheckout.findUnique({
      where: { checkoutSessionId },
    })

    if (!pending) {
      return NextResponse.json({ error: 'Checkout session not found' }, { status: 404 })
    }
    if (pending.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    if (pending.status !== 'active') {
      return NextResponse.json({ error: 'Checkout session is no longer active' }, { status: 410 })
    }

    // Verify PaymentIntent status with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'requires_capture') {
      return NextResponse.json(
        { error: `Payment not successful. Status: ${paymentIntent.status}` },
        { status: 400 },
      )
    }

    // Verify payment matches checkout session
    if (paymentIntent.metadata.checkoutSessionId !== checkoutSessionId) {
      return NextResponse.json({ error: 'Payment does not match checkout session' }, { status: 400 })
    }

    // Fetch vehicle for booking record
    const car = await prisma.rentalCar.findUnique({
      where: { id: pending.vehicleId },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        dailyRate: true,
        city: true,
        hostId: true,
        noDeposit: true,
        customDepositAmount: true,
        vehicleDepositMode: true,
        photos: true,
        host: {
          select: {
            id: true,
            requireDeposit: true,
            depositAmount: true,
            makeDeposits: true,
          },
        },
      },
    })

    if (!car) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Availability is checked INSIDE the transaction below (serializable isolation)
    // to prevent race conditions where two concurrent bookings pass the check

    // =========================================================================
    // CREATE BOOKING
    // =========================================================================
    const startDate = new Date(pending.startDate)
    const endDate = new Date(pending.endDate)
    const numberOfDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    // Recalculate amounts from server state (same logic as payment-intent)
    let basePrice = car.dailyRate * numberOfDays
    const serviceFee = Math.round(basePrice * 0.15 * 100) / 100
    const deposit = getActualDeposit(car)

    // Get insurance/delivery/add-ons amounts from payment metadata
    const insuranceFee = parseFloat(paymentIntent.metadata.rentalTotal || '0') > 0
      ? Math.round((parseFloat(paymentIntent.metadata.rentalTotal) - basePrice - serviceFee) * 100) / 100
      : 0

    const city = car.city || 'Phoenix'
    const { rate: taxRate } = getTaxRate(city)
    const taxableAmount = basePrice + serviceFee + insuranceFee
    const taxes = Math.round(taxableAmount * taxRate * 100) / 100
    const totalAmount = Math.round((taxableAmount + taxes) * 100) / 100

    const bookingCode = generateBookingCode()
    const bookingId = `bk_${crypto.randomUUID().replace(/-/g, '').substring(0, 20)}`

    // Determine delivery type label
    const deliveryType = pending.selectedDelivery || 'pickup'
    const pickupTypeMap: Record<string, string> = {
      pickup: 'host_pickup',
      airport: 'airport',
      hotel: 'hotel',
      home: 'home',
    }

    // Create booking + mark checkout completed atomically (serializable to prevent double-booking)
    const booking = await prisma.$transaction(async (tx) => {
      // Verify availability INSIDE transaction to prevent race condition
      const conflict = await tx.rentalBooking.findFirst({
        where: {
          carId: pending.vehicleId,
          status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
          startDate: { lt: endDate },
          endDate: { gt: startDate },
        },
        select: { id: true }
      })
      if (conflict) {
        throw new Error('AVAILABILITY_CONFLICT')
      }

      const newBooking = await tx.rentalBooking.create({
        data: {
          id: bookingId,
          bookingCode,
          carId: pending.vehicleId,
          hostId: car.hostId,
          renterId: user.id,
          reviewerProfileId: reviewerProfile?.id || null,
          guestEmail: user.email,
          guestPhone: user.phone,
          guestName: user.name,
          startDate,
          endDate,
          startTime: '10:00',
          endTime: '10:00',
          pickupLocation: city,
          pickupType: pickupTypeMap[deliveryType] || 'host_pickup',
          dailyRate: car.dailyRate,
          numberOfDays,
          subtotal: basePrice,
          deliveryFee: 0,
          insuranceFee,
          serviceFee,
          taxes,
          totalAmount,
          depositAmount: deposit,
          depositHeld: 0,
          securityDeposit: deposit,
          updatedAt: new Date(),
          status: 'CONFIRMED',
          paymentStatus: 'AUTHORIZED',
          paymentIntentId,
          stripeCustomerId: typeof paymentIntent.customer === 'string' ? paymentIntent.customer : undefined,
          sessionId: checkoutSessionId,
          insuranceTier: pending.selectedInsurance,
          bookingIpAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
          bookingUserAgent: request.headers.get('user-agent') || null,
        },
      })

      // Mark checkout session as completed (atomic with booking creation)
      await tx.pendingCheckout.update({
        where: { checkoutSessionId },
        data: { status: 'completed' },
      })

      return newBooking
    }, { isolationLevel: 'Serializable' })

    // Extract payment method details for confirmation
    let paymentLast4 = '****'
    let paymentBrand = 'card'
    if (paymentIntent.payment_method) {
      try {
        const pm = await stripe.paymentMethods.retrieve(paymentIntent.payment_method as string)
        paymentLast4 = pm.card?.last4 || '****'
        paymentBrand = pm.card?.brand || pm.type || 'card'
      } catch {
        // Non-critical — use defaults
      }
    }

    // Get first photo for confirmation card
    const photos = car.photos as any
    let photoUrl: string | null = null
    if (Array.isArray(photos) && photos.length > 0) {
      const first = photos[0]
      photoUrl = typeof first === 'string' ? first : first?.url || null
    }

    console.log(`[checkout/confirm] Booking ${bookingCode} created for ${car.year} ${car.make} ${car.model}`)

    // Send confirmation email (non-blocking)
    sendBookingEmail({
      guestEmail: user.email!,
      guestName: user.name || 'Guest',
      bookingCode,
      car,
      startDate,
      endDate,
      city,
      totalAmount,
      deposit,
      photoUrl,
    }).catch((err) => console.error('[checkout/confirm] Email send failed:', err))

    return NextResponse.json({
      bookingId: booking.id,
      referenceCode: bookingCode,
      vehicle: {
        year: car.year,
        make: car.make,
        model: car.model,
        photo: photoUrl,
      },
      dates: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        days: numberOfDays,
      },
      total: totalAmount + deposit,
      paymentLast4,
      paymentBrand,
    })
  } catch (error: any) {
    // Handle availability race condition — cancel PI hold so customer isn't stuck
    if (error?.message === 'AVAILABILITY_CONFLICT') {
      if (piIdForCleanup) {
        try {
          await stripe.paymentIntents.cancel(piIdForCleanup)
        } catch (cancelError) {
          console.error('[checkout/confirm] Failed to cancel PI after availability conflict:', cancelError)
        }
      }
      return NextResponse.json(
        { error: 'These dates are no longer available. Your payment hold has been released.' },
        { status: 409 },
      )
    }

    console.error('[checkout/confirm] Error:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 })
  }
}

function generateBookingCode(): string {
  const prefix = 'RENT'
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${year}-${random}`
}

async function sendBookingEmail(params: {
  guestEmail: string
  guestName: string
  bookingCode: string
  car: { make: string; model: string; year: number; hostId: string; city: string | null }
  startDate: Date
  endDate: Date
  city: string
  totalAmount: number
  deposit: number
  photoUrl: string | null
}) {
  // Fetch host contact info for the email
  const host = await prisma.rentalHost.findUnique({
    where: { id: params.car.hostId },
    select: { name: true, phone: true },
  })

  const hostName = host?.name || 'Your Host'
  const hostPhone = host?.phone || 'Contact via ItWhip'

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

  const template = getBookingConfirmedTemplate({
    to: params.guestEmail,
    guestName: params.guestName,
    bookingCode: params.bookingCode,
    carMake: params.car.make,
    carModel: params.car.model,
    carImage: params.photoUrl || '',
    startDate: formatDate(params.startDate),
    endDate: formatDate(params.endDate),
    pickupLocation: params.city,
    pickupTime: '10:00 AM',
    totalAmount: (params.totalAmount + params.deposit).toFixed(2),
    hostName,
    hostPhone,
    dashboardUrl: `${process.env.NEXTAUTH_URL || 'https://itwhip.com'}/bookings`,
  })

  await sendEmail(params.guestEmail, template.subject, template.html, template.text, {
    requestId: `booking-${params.bookingCode}`,
  })

  console.log(`[checkout/confirm] Confirmation email sent to ${params.guestEmail}`)
}
