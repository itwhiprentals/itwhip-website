// app/api/partner/bookings/[id]/host-review/route.ts
// Host approve/reject a booking after fleet approval

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import Stripe from 'stripe'
import { sendBookingConfirmation, sendHostRejectedEmail } from '@/app/lib/email/booking-emails'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil' as Stripe.LatestApiVersion,
})

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    if (!partner) return null
    return partner
  } catch {
    return null
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()
    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: bookingId } = await params
    const body = await request.json()
    const { action, notes } = body as { action: 'approve' | 'reject'; notes?: string }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject".' }, { status: 400 })
    }

    // Fetch booking and verify this host owns the vehicle
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        hostId: partner.id,
      },
      select: {
        id: true,
        bookingCode: true,
        status: true,
        fleetStatus: true,
        hostStatus: true,
        paymentStatus: true,
        paymentIntentId: true,
        guestEmail: true,
        guestName: true,
        startDate: true,
        endDate: true,
        totalAmount: true,
        numberOfDays: true,
        pickupLocation: true,
        carId: true,
        hostId: true,
        car: {
          select: {
            make: true,
            model: true,
            year: true,
            photos: { select: { url: true }, take: 1 }
          }
        },
        host: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found or not your vehicle' }, { status: 404 })
    }

    // Verify booking is in the correct state for host review
    if (booking.fleetStatus !== 'APPROVED') {
      return NextResponse.json({ error: 'Booking has not been approved by fleet yet' }, { status: 400 })
    }

    if (booking.hostStatus !== 'PENDING') {
      return NextResponse.json({ error: `Booking already ${booking.hostStatus?.toLowerCase() || 'processed'} by host` }, { status: 400 })
    }

    const carName = `${booking.car.year} ${booking.car.make} ${booking.car.model}`

    if (action === 'approve') {
      // ===== HOST APPROVES: Capture payment, confirm booking =====
      let captureSuccess = false

      if (booking.paymentIntentId) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(booking.paymentIntentId)

          if (paymentIntent.status === 'requires_capture') {
            await stripe.paymentIntents.capture(booking.paymentIntentId)
            captureSuccess = true
            console.log(`[Host Review] Payment captured for booking ${booking.bookingCode}`)
          } else if (paymentIntent.status === 'succeeded') {
            // Already captured (shouldn't happen with manual capture, but handle gracefully)
            captureSuccess = true
          } else {
            console.error(`[Host Review] Unexpected PI status: ${paymentIntent.status} for ${booking.bookingCode}`)
          }
        } catch (stripeError: any) {
          console.error(`[Host Review] Stripe capture error for ${booking.bookingCode}:`, stripeError.message)
          return NextResponse.json(
            { error: 'Failed to capture payment. The hold may have expired. Please contact fleet support.' },
            { status: 500 }
          )
        }
      }

      const updatedBooking = await prisma.$transaction(async (tx) => {
        const updated = await tx.rentalBooking.update({
          where: { id: bookingId },
          data: {
            hostStatus: 'APPROVED',
            hostReviewedBy: partner.id,
            hostReviewedAt: new Date(),
            hostNotes: notes || null,
            status: 'CONFIRMED',
            paymentStatus: captureSuccess ? 'PAID' : 'AUTHORIZED',
            paymentProcessedAt: captureSuccess ? new Date() : undefined,
          },
          select: {
            id: true,
            bookingCode: true,
            status: true,
            hostStatus: true,
            paymentStatus: true,
          }
        })

        // Update car statistics
        await tx.rentalCar.update({
          where: { id: booking.carId },
          data: { totalTrips: { increment: 1 } }
        })

        // Block availability dates
        const dates: Date[] = []
        const currentDate = new Date(booking.startDate)
        const endDate = new Date(booking.endDate)
        while (currentDate <= endDate) {
          dates.push(new Date(currentDate))
          currentDate.setDate(currentDate.getDate() + 1)
        }

        await tx.rentalAvailability.createMany({
          data: dates.map(date => ({
            id: crypto.randomUUID(),
            carId: booking.carId,
            date,
            isAvailable: false,
            note: `Booked - ${booking.bookingCode}`
          })),
          skipDuplicates: true
        })

        // Log host approval
        await tx.activityLog.create({
          data: {
            id: crypto.randomUUID(),
            action: 'host_approved',
            entityType: 'RentalBooking',
            entityId: bookingId,
            metadata: {
              hostId: partner.id,
              hostName: partner.name,
              paymentCaptured: captureSuccess,
              notes: notes || null,
            },
            ipAddress: '127.0.0.1'
          }
        })

        return updated
      })

      // Send confirmation email to guest
      const fullBooking = await prisma.rentalBooking.findUnique({
        where: { id: bookingId },
        select: {
          guestEmail: true,
          guestName: true,
          bookingCode: true,
          startDate: true,
          endDate: true,
          startTime: true,
          endTime: true,
          pickupLocation: true,
          totalAmount: true,
          depositAmount: true,
          subtotal: true,
          serviceFee: true,
          taxes: true,
          insuranceFee: true,
          deliveryFee: true,
          car: {
            select: {
              make: true,
              model: true,
              year: true,
              photos: { select: { url: true }, take: 1 }
            }
          }
        }
      }) as any

      if (fullBooking) {
        // Find guest access token for dashboard link
        const guestToken = await prisma.guestAccessToken.findFirst({
          where: { bookingId },
          select: { token: true },
          orderBy: { createdAt: 'desc' }
        })

        sendBookingConfirmation({
          ...fullBooking,
          accessToken: guestToken?.token || ''
        }).catch(error => {
          console.error('[Host Review] Error sending confirmation:', error)
        })
      }

      return NextResponse.json({
        booking: updatedBooking,
        message: 'Booking approved — guest has been charged and notified'
      })

    } else {
      // ===== HOST REJECTS: Notify fleet, do NOT release payment or notify guest =====
      if (action === 'reject' && !notes) {
        return NextResponse.json({ error: 'A reason is required when rejecting a booking' }, { status: 400 })
      }

      const updatedBooking = await prisma.$transaction(async (tx) => {
        const updated = await tx.rentalBooking.update({
          where: { id: bookingId },
          data: {
            hostStatus: 'REJECTED',
            hostReviewedBy: partner.id,
            hostReviewedAt: new Date(),
            hostNotes: notes,
          },
          select: {
            id: true,
            bookingCode: true,
            status: true,
            hostStatus: true,
            paymentStatus: true,
          }
        })

        // Log host rejection
        await tx.activityLog.create({
          data: {
            id: crypto.randomUUID(),
            action: 'host_rejected',
            entityType: 'RentalBooking',
            entityId: bookingId,
            metadata: {
              hostId: partner.id,
              hostName: partner.name,
              reason: notes,
            },
            ipAddress: '127.0.0.1'
          }
        })

        return updated
      })

      // Notify fleet — NOT the guest (fleet decides next steps)
      sendHostRejectedEmail({
        bookingCode: booking.bookingCode,
        bookingId: booking.id,
        hostName: booking.host.name || 'Host',
        hostNotes: notes || '',
        guestName: booking.guestName || 'Guest',
        carName,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        totalAmount: booking.totalAmount?.toFixed(2) || '0.00',
      }).catch(error => {
        console.error('[Host Review] Error sending rejection alert:', error)
      })

      return NextResponse.json({
        booking: updatedBooking,
        message: 'Booking rejected — fleet has been notified to handle next steps'
      })
    }

  } catch (error) {
    console.error('[Host Review] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process host review' },
      { status: 500 }
    )
  }
}
