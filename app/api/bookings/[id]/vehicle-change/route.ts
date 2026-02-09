// app/api/bookings/[id]/vehicle-change/route.ts
// Guest accepts or declines a vehicle change offer

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import Stripe from 'stripe'
import { sendBookingConfirmation, sendHostReviewEmail } from '@/app/lib/email/booking-emails'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil' as Stripe.LatestApiVersion,
})

// GET — fetch vehicle change details for the guest page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        vehicleChangeToken: token,
      },
      select: {
        id: true,
        bookingCode: true,
        guestName: true,
        startDate: true,
        endDate: true,
        numberOfDays: true,
        totalAmount: true,
        dailyRate: true,
        vehicleChangeExpiresAt: true,
        vehicleChangeReason: true,
        originalCarId: true,
        carId: true,
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            dailyRate: true,
            photos: { select: { url: true }, take: 1 }
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })
    }

    // Check expiry
    if (booking.vehicleChangeExpiresAt && new Date() > new Date(booking.vehicleChangeExpiresAt)) {
      return NextResponse.json({ error: 'This link has expired' }, { status: 410 })
    }

    // Fetch original car details
    let originalCar = null
    if (booking.originalCarId) {
      originalCar = await prisma.rentalCar.findUnique({
        where: { id: booking.originalCarId },
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          dailyRate: true,
          photos: { select: { url: true }, take: 1 }
        }
      })
    }

    return NextResponse.json({
      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        guestName: booking.guestName,
        startDate: booking.startDate,
        endDate: booking.endDate,
        numberOfDays: booking.numberOfDays,
        originalTotal: booking.totalAmount,
        reason: booking.vehicleChangeReason,
        expiresAt: booking.vehicleChangeExpiresAt,
      },
      originalCar: originalCar ? {
        name: `${originalCar.year} ${originalCar.make} ${originalCar.model}`,
        dailyRate: originalCar.dailyRate,
        image: originalCar.photos?.[0]?.url || null,
      } : null,
      newCar: {
        name: `${booking.car.year} ${booking.car.make} ${booking.car.model}`,
        dailyRate: booking.car.dailyRate,
        image: booking.car.photos?.[0]?.url || null,
      }
    })

  } catch (error) {
    console.error('[Vehicle Change GET] Error:', error)
    return NextResponse.json({ error: 'Failed to load vehicle change details' }, { status: 500 })
  }
}

// POST — guest accepts or declines
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    const body = await request.json()
    const { action, token } = body as { action: 'accept' | 'decline'; token: string }

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        vehicleChangeToken: token,
      },
      select: {
        id: true,
        bookingCode: true,
        status: true,
        guestName: true,
        guestEmail: true,
        startDate: true,
        endDate: true,
        numberOfDays: true,
        totalAmount: true,
        paymentIntentId: true,
        vehicleChangeExpiresAt: true,
        carId: true,
        hostId: true,
        car: {
          select: {
            make: true,
            model: true,
            year: true,
            dailyRate: true,
            hostId: true,
            photos: { select: { url: true }, take: 1 }
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })
    }

    if (booking.vehicleChangeExpiresAt && new Date() > new Date(booking.vehicleChangeExpiresAt)) {
      return NextResponse.json({ error: 'This link has expired' }, { status: 410 })
    }

    if (action === 'accept') {
      // Guest accepts the new vehicle
      // The booking already has the current car (fleet set it during reassign consideration)
      // Reset host approval for the new vehicle's host
      const updatedBooking = await prisma.$transaction(async (tx) => {
        const updated = await tx.rentalBooking.update({
          where: { id: bookingId },
          data: {
            // Clear the vehicle change token (used)
            vehicleChangeToken: null,
            vehicleChangeExpiresAt: null,
            // Set host status to PENDING for new vehicle's host
            hostStatus: 'PENDING',
            hostNotifiedAt: new Date(),
          },
          select: {
            id: true,
            bookingCode: true,
            status: true,
          }
        })

        await tx.activityLog.create({
          data: {
            id: crypto.randomUUID(),
            action: 'vehicle_change_accepted',
            entityType: 'RentalBooking',
            entityId: bookingId,
            metadata: {
              guestName: booking.guestName,
              newCarId: booking.carId,
            },
            ipAddress: '127.0.0.1'
          }
        })

        return updated
      })

      // Notify new vehicle's host
      const newHost = await prisma.rentalHost.findUnique({
        where: { id: booking.car.hostId },
        select: { email: true, name: true }
      })

      if (newHost?.email) {
        const carName = `${booking.car.year} ${booking.car.make} ${booking.car.model}`
        sendHostReviewEmail({
          hostEmail: newHost.email,
          hostName: newHost.name || 'Host',
          bookingCode: booking.bookingCode,
          guestName: booking.guestName || 'Guest',
          carMake: booking.car.make,
          carModel: booking.car.model,
          carYear: booking.car.year,
          carImage: booking.car.photos?.[0]?.url || '',
          startDate: booking.startDate.toISOString(),
          endDate: booking.endDate.toISOString(),
          pickupLocation: 'TBD',
          totalAmount: booking.totalAmount?.toFixed(2) || '0.00',
          numberOfDays: booking.numberOfDays || 1,
          reviewUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/partner/bookings/${booking.id}`
        }).catch(err => console.error('[Vehicle Change] Host email error:', err))
      }

      return NextResponse.json({
        success: true,
        message: 'Vehicle change accepted — the host will review your booking shortly.',
        booking: updatedBooking
      })

    } else {
      // Guest declines — release payment hold, cancel booking
      if (booking.paymentIntentId) {
        try {
          const pi = await stripe.paymentIntents.retrieve(booking.paymentIntentId)
          if (pi.status === 'requires_capture') {
            await stripe.paymentIntents.cancel(booking.paymentIntentId)
            console.log(`[Vehicle Change] Payment hold released for ${booking.bookingCode}`)
          }
        } catch (stripeErr: any) {
          console.error(`[Vehicle Change] Stripe cancel error for ${booking.bookingCode}:`, stripeErr.message)
        }
      }

      const updatedBooking = await prisma.$transaction(async (tx) => {
        const updated = await tx.rentalBooking.update({
          where: { id: bookingId },
          data: {
            status: 'CANCELLED',
            paymentStatus: 'CANCELLED' as any,
            vehicleChangeToken: null,
            vehicleChangeExpiresAt: null,
            cancelledAt: new Date(),
            cancellationReason: 'Guest declined vehicle change — full refund',
          },
          select: {
            id: true,
            bookingCode: true,
            status: true,
          }
        })

        await tx.activityLog.create({
          data: {
            id: crypto.randomUUID(),
            action: 'vehicle_change_declined',
            entityType: 'RentalBooking',
            entityId: bookingId,
            metadata: {
              guestName: booking.guestName,
              reason: 'Guest declined vehicle change',
            },
            ipAddress: '127.0.0.1'
          }
        })

        return updated
      })

      return NextResponse.json({
        success: true,
        message: 'You\'ve declined the vehicle change. Your payment hold has been released — no charges will be made.',
        booking: updatedBooking
      })
    }

  } catch (error) {
    console.error('[Vehicle Change POST] Error:', error)
    return NextResponse.json({ error: 'Failed to process vehicle change' }, { status: 500 })
  }
}
