// app/lib/booking/complete-confirmation.ts
// Shared confirmation side effects — called by auto-confirm (payment-confirm, payment-choice)
// and host-review to avoid duplicating ~150 lines of post-confirmation logic.

import { prisma } from '@/app/lib/database/prisma'
import Stripe from 'stripe'
import { sendBookingConfirmation } from '@/app/lib/email/booking-emails'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil' as Stripe.LatestApiVersion,
})

interface ConfirmationOptions {
  capturePayment?: boolean   // capture authorized PI (default: true if PI exists)
  approvedBy?: string        // hostId — null for auto-confirm
  notes?: string             // host notes (only for host-review flow)
}

interface ConfirmationResult {
  success: boolean
  paymentCaptured: boolean
  error?: string
}

export async function completeBookingConfirmation(
  bookingId: string,
  opts: ConfirmationOptions = {}
): Promise<ConfirmationResult> {
  const { capturePayment = true, approvedBy, notes } = opts

  try {
    // Fetch booking with all required relations
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        bookingCode: true,
        status: true,
        paymentIntentId: true,
        paymentStatus: true,
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
        guestEmail: true,
        guestName: true,
        guestPhone: true,
        reviewerProfileId: true,
        renterId: true,
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
            phone: true
          }
        }
      }
    })

    if (!booking) {
      return { success: false, paymentCaptured: false, error: 'Booking not found' }
    }

    const carName = `${booking.car.year} ${booking.car.make} ${booking.car.model}`

    // 1. Capture payment if requested and PI exists
    let paymentCaptured = false
    if (capturePayment && booking.paymentIntentId) {
      try {
        const pi = await stripe.paymentIntents.retrieve(booking.paymentIntentId)
        if (pi.status === 'requires_capture') {
          await stripe.paymentIntents.capture(booking.paymentIntentId)
          paymentCaptured = true
          console.log(`[Confirmation] Payment captured for ${booking.bookingCode}`)
        } else if (pi.status === 'succeeded') {
          paymentCaptured = true
        } else {
          console.error(`[Confirmation] Unexpected PI status: ${pi.status} for ${booking.bookingCode}`)
        }
      } catch (stripeError: any) {
        console.error(`[Confirmation] Stripe capture error for ${booking.bookingCode}:`, stripeError.message)
        // Don't fail the whole confirmation — payment can be captured manually
      }
    }

    // 2. Transactional DB updates: car stats + availability + payment status + activity log
    await prisma.$transaction(async (tx) => {
      // Update payment status if captured
      if (paymentCaptured) {
        await tx.rentalBooking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'PAID',
            paymentProcessedAt: new Date(),
          }
        })
      }

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

      // Activity log
      await tx.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          action: approvedBy ? 'host_approved' : 'booking_auto_confirmed',
          entityType: 'RentalBooking',
          entityId: bookingId,
          metadata: {
            hostId: approvedBy || booking.hostId,
            paymentCaptured,
            autoConfirm: !approvedBy,
            notes: notes || null,
          },
          ipAddress: '127.0.0.1'
        }
      })
    })

    // 3. Send confirmation email to guest (fire-and-forget)
    try {
      const guestToken = await prisma.guestAccessToken.findFirst({
        where: { bookingId },
        select: { token: true },
        orderBy: { createdAt: 'desc' }
      })

      sendBookingConfirmation({
        guestEmail: booking.guestEmail || '',
        guestName: booking.guestName || 'Guest',
        bookingCode: booking.bookingCode,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        startTime: booking.startTime,
        endTime: booking.endTime,
        pickupLocation: booking.pickupLocation || '',
        totalAmount: booking.totalAmount,
        depositAmount: booking.depositAmount,
        subtotal: booking.subtotal,
        serviceFee: booking.serviceFee,
        taxes: booking.taxes,
        insuranceFee: booking.insuranceFee,
        deliveryFee: booking.deliveryFee,
        car: booking.car,
        accessToken: guestToken?.token || '',
        bookingId,
      } as any).catch(e => console.error('[Confirmation] Email failed:', e))
    } catch (e) {
      console.error('[Confirmation] Email setup failed:', e)
    }

    // 4. SMS notification to guest + host (fire-and-forget)
    import('@/app/lib/twilio/sms-triggers').then(({ sendBookingConfirmedSms }) => {
      sendBookingConfirmedSms({
        bookingCode: booking.bookingCode,
        guestPhone: booking.guestPhone,
        guestName: booking.guestName,
        guestId: booking.reviewerProfileId,
        hostPhone: booking.host?.phone || '',
        hostName: booking.host?.name || 'Host',
        car: booking.car,
        startDate: booking.startDate,
        endDate: booking.endDate,
        bookingId: booking.id,
        hostId: booking.hostId,
      }).catch(e => console.error('[Confirmation] SMS failed:', e))
    }).catch(e => console.error('[Confirmation] sms-triggers import failed:', e))

    // 5. Bell notifications for guest + host (fire-and-forget)
    import('@/app/lib/notifications/booking-bell').then(({ createBookingNotificationPair }) => {
      createBookingNotificationPair({
        bookingId: booking.id,
        guestId: booking.reviewerProfileId,
        userId: booking.renterId,
        hostId: booking.hostId,
        type: 'BOOKING_CONFIRMED',
        guestTitle: 'Booking confirmed!',
        guestMessage: `Your booking #${booking.bookingCode} for the ${carName} has been confirmed.`,
        hostTitle: `Booking ${booking.bookingCode} confirmed`,
        hostMessage: `Booking #${booking.bookingCode} for your ${carName} has been confirmed.`,
        guestActionUrl: `/rentals/dashboard/bookings/${booking.id}`,
        hostActionUrl: `/partner/bookings/${booking.id}`,
        priority: 'HIGH',
      }).catch(e => console.error('[Confirmation] Bell notification failed:', e))
    }).catch(e => console.error('[Confirmation] booking-bell import failed:', e))

    console.log(`[Confirmation] ✅ Booking ${booking.bookingCode} fully confirmed (capture: ${paymentCaptured}, by: ${approvedBy || 'auto'})`)

    return { success: true, paymentCaptured }
  } catch (error) {
    console.error('[Confirmation] Error:', error)
    return { success: false, paymentCaptured: false, error: String(error) }
  }
}
