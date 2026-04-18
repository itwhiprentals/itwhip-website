// app/fleet/api/bookings/[id]/confirm-cashapp/route.ts
// Fleet confirms CashApp payment received — moves booking to CONFIRMED

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { completeBookingConfirmation } from '@/app/lib/booking/complete-confirmation'

const FLEET_KEY = 'phoenix-fleet-2847'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify fleet access via key or session cookie
    const key = request.nextUrl.searchParams.get('key')
    const cookies = request.headers.get('cookie') || ''
    const hasFleetSession = cookies.includes('fleet_session=')

    if (key !== FLEET_KEY && !hasFleetSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: bookingId } = await params

    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true, bookingCode: true, status: true,
        paymentType: true, paymentStatus: true,
        renterId: true, guestName: true,
        car: { select: { make: true, model: true, year: true } },
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.paymentType !== 'CASHAPP') {
      return NextResponse.json({ error: 'This booking is not a CashApp payment' }, { status: 400 })
    }

    if (booking.status === 'CONFIRMED') {
      return NextResponse.json({ error: 'Booking is already confirmed' }, { status: 400 })
    }

    // Confirm the booking
    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        hostStatus: 'APPROVED',
        hostReviewedAt: new Date(),
        notes: (booking as any).notes
          ? (booking as any).notes + '\n[Fleet confirmed CashApp payment received]'
          : '[Fleet confirmed CashApp payment received]',
      }
    })

    console.log(`[Fleet CashApp] Payment confirmed for ${booking.bookingCode} — booking CONFIRMED`)

    // Notify guest
    if (booking.renterId) {
      try {
        const carName = booking.car ? `${booking.car.year} ${booking.car.make} ${booking.car.model}` : 'your vehicle'
        await prisma.pushNotification.create({
          data: {
            userId: booking.renterId,
            title: 'Payment Confirmed',
            body: `Your payment for ${carName} has been confirmed. Your booking is now active.`,
            type: 'payment_confirmed',
            data: { bookingId },
          }
        }).catch(() => {})
      } catch {}
    }

    // Run full confirmation side effects (availability, emails, SMS)
    completeBookingConfirmation(bookingId, { capturePayment: false })
      .then(result => {
        if (result.success) {
          console.log(`[Fleet CashApp] Confirmation side effects completed for ${booking.bookingCode}`)
        } else {
          console.error(`[Fleet CashApp] Side effects failed for ${booking.bookingCode}:`, result.error)
        }
      })
      .catch(e => console.error(`[Fleet CashApp] Side effects error:`, e))

    return NextResponse.json({
      success: true,
      bookingCode: booking.bookingCode,
      status: 'CONFIRMED',
    })

  } catch (error: any) {
    console.error('[Fleet CashApp Confirm] Error:', error)
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 })
  }
}
