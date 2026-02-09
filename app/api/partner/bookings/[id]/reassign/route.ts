// app/api/partner/bookings/[id]/reassign/route.ts
// Fleet reassigns a booking to a different vehicle after host rejection

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { sendVehicleChangeEmail } from '@/app/lib/email/booking-emails'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

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
    const { newVehicleId, reason } = body as { newVehicleId: string; reason: string }

    if (!newVehicleId) {
      return NextResponse.json({ error: 'New vehicle ID is required' }, { status: 400 })
    }

    // Fetch the booking
    const booking = await prisma.rentalBooking.findFirst({
      where: { id: bookingId },
      select: {
        id: true,
        bookingCode: true,
        status: true,
        hostStatus: true,
        carId: true,
        hostId: true,
        guestEmail: true,
        guestName: true,
        startDate: true,
        endDate: true,
        totalAmount: true,
        paymentIntentId: true,
        car: {
          select: { make: true, model: true, year: true, photos: { select: { url: true }, take: 1 } }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.hostStatus !== 'REJECTED') {
      return NextResponse.json({ error: 'Can only reassign after host rejection' }, { status: 400 })
    }

    // Fetch the new vehicle
    const newVehicle = await prisma.rentalCar.findUnique({
      where: { id: newVehicleId },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        dailyRate: true,
        isActive: true,
        hostId: true,
        photos: { select: { url: true }, take: 1 }
      }
    })

    if (!newVehicle || !newVehicle.isActive) {
      return NextResponse.json({ error: 'New vehicle not found or inactive' }, { status: 404 })
    }

    // Generate secure token for guest vehicle change page
    const vehicleChangeToken = crypto.randomUUID()
    const vehicleChangeExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours

    // Update booking with reassignment info
    const updatedBooking = await prisma.$transaction(async (tx) => {
      const updated = await tx.rentalBooking.update({
        where: { id: bookingId },
        data: {
          originalCarId: booking.carId,
          vehicleChangeToken,
          vehicleChangeExpiresAt,
          vehicleChangeReason: reason || 'Host rejected — alternative vehicle offered',
          // Reset host status for new vehicle's host
          hostStatus: null,
          hostReviewedBy: null,
          hostReviewedAt: null,
          hostNotes: null,
        },
        select: {
          id: true,
          bookingCode: true,
          vehicleChangeToken: true,
        }
      })

      // Log reassignment
      await tx.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          action: 'vehicle_reassignment_initiated',
          entityType: 'RentalBooking',
          entityId: bookingId,
          metadata: {
            originalCarId: booking.carId,
            newVehicleId,
            reason,
            initiatedBy: partner.id,
          },
          ipAddress: '127.0.0.1'
        }
      })

      return updated
    })

    const originalCarName = `${booking.car.year} ${booking.car.make} ${booking.car.model}`
    const newCarName = `${newVehicle.year} ${newVehicle.make} ${newVehicle.model}`

    // Send vehicle change email to guest
    sendVehicleChangeEmail({
      guestEmail: booking.guestEmail || '',
      guestName: booking.guestName || 'Guest',
      bookingCode: booking.bookingCode,
      originalCarName,
      originalCarImage: booking.car.photos?.[0]?.url || '',
      newCarName,
      newCarImage: newVehicle.photos?.[0]?.url || '',
      newDailyRate: newVehicle.dailyRate,
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      changeUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/bookings/${bookingId}/change?token=${vehicleChangeToken}`,
      reason: reason || 'The original vehicle is no longer available for your dates.',
    }).catch(error => {
      console.error('[Reassign] Error sending vehicle change email:', error)
    })

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: 'Vehicle change offer sent to guest'
    })

  } catch (error) {
    console.error('[Reassign] Error:', error)
    return NextResponse.json(
      { error: 'Failed to reassign vehicle' },
      { status: 500 }
    )
  }
}
