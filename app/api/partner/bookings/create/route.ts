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
        minTripDuration: true
      }
    })

    if (!car) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Verify customer exists
    const customer = await (prisma.user.findUnique as any)({
      where: { id: customerId },
      select: {
        id: true,
        email: true,
        name: true
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
    const conflicts = await prisma.rentalBooking.findFirst({
      where: {
        carId: carId,
        status: {
          in: ['CONFIRMED', 'ACTIVE', 'PENDING'] as any
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

    // Calculate pricing breakdown
    const dailyRate = Number(car.dailyRate) || 0
    const subtotal = calculatedPrice
    const serviceFee = Math.round(subtotal * 0.10 * 100) / 100 // 10% service fee
    const taxes = Math.round(subtotal * 0.08 * 100) / 100 // 8% estimated tax
    const totalWithFees = subtotal + serviceFee + taxes

    // Create the booking with all required fields
    const bookingCode = `BK-${Date.now().toString(36).toUpperCase()}`
    const booking = await prisma.rentalBooking.create({
      data: {
        id: crypto.randomUUID(),
        bookingCode,
        updatedAt: new Date(),
        car: { connect: { id: carId } },
        host: { connect: { id: partner.id } },
        renter: { connect: { id: customerId } },
        guestEmail: customer.email || '',
        guestName: customer.name || 'Guest',
        startDate: bookingStart,
        endDate: bookingEnd,
        startTime: '10:00',
        endTime: '10:00',
        dailyRate: dailyRate,
        numberOfDays: tripDays,
        subtotal: subtotal,
        deliveryFee: 0,
        insuranceFee: 0,
        serviceFee: serviceFee,
        taxes: taxes,
        securityDeposit: 0,
        depositHeld: 0,
        totalAmount: totalWithFees,
        status: 'CONFIRMED', // Manual bookings are auto-confirmed
        paymentStatus: 'PENDING',
        pickupType: pickupType || 'PARTNER_LOCATION',
        pickupLocation: pickupLocation || 'Partner Location',
        notes: notes ? `${notes}\n\n[Partner Manual Booking]` : '[Partner Manual Booking]'
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
    }) as any

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        guestName: booking.renter?.name || 'Guest',
        guestEmail: booking.renter?.email,
        vehicleName: `${booking.car?.year} ${booking.car?.make} ${booking.car?.model}`,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        totalAmount: Number(booking.totalAmount),
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
