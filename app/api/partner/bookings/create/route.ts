// app/api/partner/bookings/create/route.ts
// Create manual booking for partner

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
    const {
      customerId,
      carId,
      startDate,
      endDate,
      pickupType,
      pickupLocation,
      notes,
      totalPrice,
      paymentType // 'collect_now' | 'collect_later' | 'offline'
    } = body

    // Validate required fields
    if (!customerId || !carId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Customer, vehicle, start date, and end date are required' },
        { status: 400 }
      )
    }

    // Verify car belongs to partner
    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId: partner.id
      },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        dailyRate: true,
        weeklyRate: true,
        monthlyRate: true,
        minTripDuration: true,
        status: true
      }
    })

    if (!car) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Verify customer exists
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const bookingStart = new Date(startDate)
    const bookingEnd = new Date(endDate)

    // Calculate trip duration
    const tripDays = Math.ceil((bookingEnd.getTime() - bookingStart.getTime()) / (1000 * 60 * 60 * 24))

    // Calculate price if not provided
    let calculatedPrice = totalPrice
    if (!calculatedPrice) {
      const dailyRate = Number(car.dailyRate) || 0
      const weeklyRate = Number(car.weeklyRate) || dailyRate * 6.5
      const monthlyRate = Number(car.monthlyRate) || dailyRate * 25

      if (tripDays >= 28) {
        calculatedPrice = monthlyRate * Math.floor(tripDays / 28) + dailyRate * (tripDays % 28)
      } else if (tripDays >= 7) {
        calculatedPrice = weeklyRate * Math.floor(tripDays / 7) + dailyRate * (tripDays % 7)
      } else {
        calculatedPrice = dailyRate * tripDays
      }
    }

    // Check for conflicts one more time
    const conflicts = await prisma.booking.findFirst({
      where: {
        rentalCarId: carId,
        status: {
          in: ['CONFIRMED', 'IN_PROGRESS', 'PENDING', 'PENDING_APPROVAL']
        },
        startDate: { lte: bookingEnd },
        endDate: { gte: bookingStart }
      }
    })

    if (conflicts) {
      return NextResponse.json(
        { error: 'Vehicle is not available for the selected dates' },
        { status: 409 }
      )
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        rentalCarId: carId,
        userId: customerId,
        startDate: bookingStart,
        endDate: bookingEnd,
        totalPrice: calculatedPrice,
        status: 'CONFIRMED', // Manual bookings are auto-confirmed
        pickupType: pickupType || 'PARTNER_LOCATION',
        pickupLocation: pickupLocation || null,
        metadata: {
          source: 'partner_manual',
          createdBy: partner.id,
          paymentType: paymentType || 'offline',
          notes: notes || null
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        rentalCar: {
          select: {
            make: true,
            model: true,
            year: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        guestName: `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim() || 'Guest',
        guestEmail: booking.user?.email,
        vehicleName: `${booking.rentalCar?.year} ${booking.rentalCar?.make} ${booking.rentalCar?.model}`,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        totalPrice: Number(booking.totalPrice),
        status: booking.status,
        tripDays
      },
      message: 'Booking created successfully'
    })

  } catch (error) {
    console.error('[Partner Create Booking] Error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
