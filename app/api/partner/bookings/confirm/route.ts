// app/api/partner/bookings/confirm/route.ts
// Confirm a pending pre-booking (change status from PENDING to CONFIRMED)

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    if (!partner || (partner.hostType !== 'FLEET_PARTNER' && partner.hostType !== 'PARTNER')) {
      return null
    }

    return partner
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    // Find the booking and verify it belongs to this partner
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        hostId: partner.id
      },
      include: {
        renter: {
          select: {
            name: true,
            email: true
          }
        },
        car: {
          select: {
            make: true,
            model: true,
            year: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if booking is in PENDING status
    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Booking cannot be confirmed - current status is ${booking.status}` },
        { status: 400 }
      )
    }

    // Check for conflicts again (in case dates changed or another booking was made)
    const conflicts = await prisma.rentalBooking.findFirst({
      where: {
        carId: booking.carId,
        id: { not: bookingId }, // Exclude this booking
        status: {
          in: ['CONFIRMED', 'ACTIVE']
        },
        startDate: { lte: booking.endDate },
        endDate: { gte: booking.startDate }
      }
    })

    if (conflicts) {
      return NextResponse.json(
        { error: 'Vehicle is no longer available for these dates' },
        { status: 409 }
      )
    }

    // Update booking to CONFIRMED
    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        notes: booking.notes?.replace('[Partner Manual Booking - Sent for customer review]', '[Partner Manual Booking - Confirmed]') || '[Partner Manual Booking - Confirmed]'
      }
    })

    console.log(`[Confirm Booking] Booking ${bookingId} confirmed by partner ${partner.id}`)

    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        status: 'CONFIRMED',
        guestName: booking.renter?.name || booking.guestName,
        guestEmail: booking.renter?.email || booking.guestEmail,
        vehicleName: `${booking.car?.year} ${booking.car?.make} ${booking.car?.model}`,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        totalAmount: Number(booking.totalAmount)
      },
      message: 'Booking confirmed successfully'
    })

  } catch (error) {
    console.error('[Confirm Booking] Error:', error)
    return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 })
  }
}
