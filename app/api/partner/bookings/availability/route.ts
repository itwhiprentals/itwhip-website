// app/api/partner/bookings/availability/route.ts
// Check vehicle availability for partner manual booking

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
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

export async function GET(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const carId = searchParams.get('carId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!carId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'carId, startDate, and endDate are required' },
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
        isActive: true,
        safetyHold: true,
        requiresInspection: true,
        minTripDuration: true
      }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    const requestedStart = new Date(startDate)
    const requestedEnd = new Date(endDate)

    // Check trip duration meets minimum
    const tripDays = Math.ceil((requestedEnd.getTime() - requestedStart.getTime()) / (1000 * 60 * 60 * 24))
    const minDays = car.minTripDuration || 1

    if (tripDays < minDays) {
      return NextResponse.json({
        available: false,
        reason: `Minimum rental period is ${minDays} days`,
        minTripDuration: minDays,
        requestedDays: tripDays
      })
    }

    // Check for conflicting bookings
    const conflicts = await prisma.rentalBooking.findMany({
      where: {
        carId: carId,
        status: {
          in: ['CONFIRMED', 'ACTIVE', 'PENDING']
        },
        OR: [
          {
            // New booking starts during existing booking
            startDate: { lte: requestedEnd },
            endDate: { gte: requestedStart }
          }
        ]
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        guestName: true,
        renter: {
          select: {
            name: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    })

    if (conflicts.length > 0) {
      // Find next available date after all conflicts
      let nextAvailable = requestedStart
      for (const conflict of conflicts) {
        const conflictEnd = new Date(conflict.endDate)
        conflictEnd.setDate(conflictEnd.getDate() + 1) // Add buffer day
        if (conflictEnd > nextAvailable) {
          nextAvailable = conflictEnd
        }
      }

      return NextResponse.json({
        available: false,
        reason: 'Vehicle has conflicting bookings during this period',
        conflicts: conflicts.map(c => ({
          id: c.id,
          startDate: c.startDate.toISOString(),
          endDate: c.endDate.toISOString(),
          status: c.status,
          guestName: c.renter?.name || c.guestName || 'Guest'
        })),
        nextAvailable: nextAvailable.toISOString()
      })
    }

    // Check if vehicle is inactive or in maintenance
    if (!car.isActive) {
      return NextResponse.json({
        available: false,
        reason: 'Vehicle is currently inactive'
      })
    }

    if (car.safetyHold || car.requiresInspection) {
      return NextResponse.json({
        available: false,
        reason: 'Vehicle is currently in maintenance'
      })
    }

    return NextResponse.json({
      available: true,
      vehicle: {
        id: car.id,
        name: `${car.year} ${car.make} ${car.model}`
      },
      tripDays,
      minTripDuration: minDays
    })

  } catch (error) {
    console.error('[Partner Availability] Error:', error)
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 })
  }
}
