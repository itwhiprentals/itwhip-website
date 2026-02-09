// app/api/rentals/bookings/[id]/modify/route.ts
// Guest-facing booking modification endpoint (PENDING bookings only)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { calculatePricing } from '@/app/(guest)/rentals/lib/pricing'
import { stripe, toStripeCents } from '@/app/lib/stripe'

type RouteParams = { params: Promise<{ id: string }> }

// Shared: validate ownership + fetch booking
async function getBookingWithAuth(request: NextRequest, bookingId: string) {
  const user = await verifyRequest(request)
  const guestEmail = request.headers.get('x-guest-email')

  const booking = await prisma.rentalBooking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      status: true,
      renterId: true,
      guestEmail: true,
      paymentStatus: true,
      paymentIntentId: true,
      stripeCustomerId: true,
      stripePaymentMethodId: true,
      totalAmount: true,
      subtotal: true,
      serviceFee: true,
      taxes: true,
      insuranceFee: true,
      deliveryFee: true,
      dailyRate: true,
      numberOfDays: true,
      startDate: true,
      endDate: true,
      startTime: true,
      endTime: true,
      bookingCode: true,
      carId: true,
      car: {
        select: {
          id: true,
          make: true,
          model: true,
          dailyRate: true,
          weeklyDiscount: true,
          monthlyDiscount: true,
          city: true
        }
      }
    }
  })

  if (!booking) {
    return { error: 'Booking not found', status: 404 }
  }

  const isOwner = (user?.id && booking.renterId === user.id) ||
                  (user?.email && booking.guestEmail === user.email) ||
                  (guestEmail && booking.guestEmail === guestEmail)

  if (!isOwner) {
    return { error: 'Unauthorized', status: 403 }
  }

  if (booking.status !== 'PENDING') {
    return { error: `Can only modify PENDING bookings. Current status: ${booking.status}`, status: 400 }
  }

  return { booking }
}

// Check car availability for new dates, excluding current booking
async function checkAvailability(carId: string, startDate: Date, endDate: Date, excludeBookingId: string) {
  const overlapping = await prisma.rentalBooking.findFirst({
    where: {
      carId,
      id: { not: excludeBookingId },
      status: { in: ['CONFIRMED', 'ACTIVE', 'PENDING'] },
      AND: [
        { startDate: { lt: endDate } },
        { endDate: { gt: startDate } }
      ]
    },
    select: { id: true }
  })
  return !overlapping
}

// Calculate new pricing for dates
function recalculate(booking: any, startDate: Date, endDate: Date) {
  return calculatePricing({
    dailyRate: booking.dailyRate,
    startDate,
    endDate,
    weeklyDiscount: booking.car.weeklyDiscount ?? undefined,
    monthlyDiscount: booking.car.monthlyDiscount ?? undefined,
    deliveryFee: booking.deliveryFee,
    insuranceDaily: booking.insuranceFee > 0 && booking.numberOfDays > 0
      ? booking.insuranceFee / booking.numberOfDays
      : 0,
    city: booking.car.city || 'phoenix'
  })
}

// GET — Preview pricing for new dates (no side effects)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: bookingId } = await params
    const result = await getBookingWithAuth(request, bookingId)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    const { booking } = result

    const url = new URL(request.url)
    const startDateStr = url.searchParams.get('startDate')
    const endDateStr = url.searchParams.get('endDate')

    if (!startDateStr || !endDateStr) {
      return NextResponse.json({ error: 'startDate and endDate query params required' }, { status: 400 })
    }

    const startDate = new Date(startDateStr + 'T12:00:00')
    const endDate = new Date(endDateStr + 'T12:00:00')

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    if (endDate <= startDate) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (startDate < today) {
      return NextResponse.json({ error: 'Start date cannot be in the past' }, { status: 400 })
    }

    // Check availability
    const available = await checkAvailability(booking.carId, startDate, endDate, booking.id)

    // Calculate new pricing
    const newPricing = recalculate(booking, startDate, endDate)

    return NextResponse.json({
      available,
      newPricing: {
        days: newPricing.days,
        subtotal: Math.round(newPricing.subtotal * 100) / 100,
        serviceFee: Math.round(newPricing.serviceFee * 100) / 100,
        insurance: Math.round(newPricing.insurance * 100) / 100,
        delivery: Math.round(newPricing.delivery * 100) / 100,
        taxes: Math.round(newPricing.taxes * 100) / 100,
        total: Math.round(newPricing.total * 100) / 100
      },
      currentPricing: {
        days: booking.numberOfDays || 0,
        total: booking.totalAmount
      },
      priceDifference: Math.round((newPricing.total - booking.totalAmount) * 100) / 100
    })
  } catch (error) {
    console.error('[Modify Booking Preview] Error:', error)
    return NextResponse.json({ error: 'Failed to preview modification' }, { status: 500 })
  }
}

// POST — Commit the date change
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: bookingId } = await params
    const result = await getBookingWithAuth(request, bookingId)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    const { booking } = result

    const body = await request.json()
    const { startDate: startDateStr, endDate: endDateStr } = body

    if (!startDateStr || !endDateStr) {
      return NextResponse.json({ error: 'startDate and endDate are required' }, { status: 400 })
    }

    const startDate = new Date(startDateStr + 'T12:00:00')
    const endDate = new Date(endDateStr + 'T12:00:00')

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    if (endDate <= startDate) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (startDate < today) {
      return NextResponse.json({ error: 'Start date cannot be in the past' }, { status: 400 })
    }

    // Check availability
    const available = await checkAvailability(booking.carId, startDate, endDate, booking.id)
    if (!available) {
      return NextResponse.json({ error: 'Selected dates are not available for this vehicle' }, { status: 409 })
    }

    // Calculate new pricing
    const newPricing = recalculate(booking, startDate, endDate)
    const newTotal = Math.round(newPricing.total * 100) / 100
    const previousTotal = booking.totalAmount

    // Stripe: handle payment authorization change
    let newPaymentIntentId = booking.paymentIntentId
    const totalChanged = Math.abs(newTotal - previousTotal) > 0.01

    if (totalChanged && booking.paymentIntentId) {
      try {
        // Cancel old authorization
        await stripe.paymentIntents.cancel(booking.paymentIntentId)

        // Create new authorization if we have a payment method
        if (booking.stripeCustomerId && booking.stripePaymentMethodId) {
          const newIntent = await stripe.paymentIntents.create({
            amount: toStripeCents(newTotal),
            currency: 'usd',
            customer: booking.stripeCustomerId,
            payment_method: booking.stripePaymentMethodId,
            capture_method: 'manual',
            confirm: true,
            off_session: true,
            metadata: {
              bookingId: booking.id,
              bookingCode: booking.bookingCode,
              modified: 'true'
            }
          })
          newPaymentIntentId = newIntent.id
        } else {
          // No saved payment method — clear the intent, will need re-auth
          newPaymentIntentId = null
        }
      } catch (stripeError) {
        console.error('[Modify Booking] Stripe error:', stripeError)
        // Still allow the modification but log the Stripe issue
        // Payment team can follow up
      }
    }

    // Update booking
    const updated = await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        startDate,
        endDate,
        numberOfDays: newPricing.days,
        subtotal: Math.round(newPricing.subtotal * 100) / 100,
        serviceFee: Math.round(newPricing.serviceFee * 100) / 100,
        insuranceFee: Math.round(newPricing.insurance * 100) / 100,
        taxes: Math.round(newPricing.taxes * 100) / 100,
        totalAmount: newTotal,
        paymentIntentId: newPaymentIntentId,
        updatedAt: new Date()
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        numberOfDays: true,
        subtotal: true,
        serviceFee: true,
        taxes: true,
        totalAmount: true,
        dailyRate: true,
        paymentIntentId: true
      }
    })

    return NextResponse.json({
      success: true,
      booking: updated,
      previousPricing: {
        totalAmount: previousTotal,
        numberOfDays: booking.numberOfDays
      },
      priceDifference: Math.round((newTotal - previousTotal) * 100) / 100
    })
  } catch (error) {
    console.error('[Modify Booking] Error:', error)
    return NextResponse.json({ error: 'Failed to modify booking' }, { status: 500 })
  }
}
