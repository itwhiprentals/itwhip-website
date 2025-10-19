// app/api/host/calendar/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { headers } from 'next/headers'

// Helper to get host from headers
async function getHostFromHeaders() {
  const headersList = await headers()
  const hostId = headersList.get('x-host-id')
  const userId = headersList.get('x-user-id')
  
  if (!hostId && !userId) return null
  
  const host = await prisma.rentalHost.findFirst({
    where: hostId ? { id: hostId } : { userId: userId }
  })
  
  return host
}

// GET - Fetch calendar data for a specific car
export async function GET(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const carId = searchParams.get('carId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!carId) {
      return NextResponse.json(
        { error: 'Car ID is required' },
        { status: 400 }
      )
    }

    // Verify the car belongs to the host
    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId: host.id
      }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found or unauthorized' },
        { status: 404 }
      )
    }

    // Build date filter
    const dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter.AND = [
        {
          OR: [
            {
              startDate: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            },
            {
              endDate: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            },
            {
              AND: [
                { startDate: { lte: new Date(startDate) } },
                { endDate: { gte: new Date(endDate) } }
              ]
            }
          ]
        }
      ]
    }

    // Fetch bookings for the car
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        carId: carId,
        status: {
          in: ['CONFIRMED', 'ACTIVE', 'COMPLETED']
        },
        ...dateFilter
      },
      include: {
        car: {
          select: {
            make: true,
            model: true,
            year: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    // Fetch blocked dates (from RentalAvailability)
    const blockedDatesFilter: any = { carId: carId }
    if (startDate && endDate) {
      blockedDatesFilter.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const blockedDates = await prisma.rentalAvailability.findMany({
      where: {
        ...blockedDatesFilter,
        isAvailable: false
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Format the response
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      carId: booking.carId,
      guestName: booking.guestName || 'Guest',
      guestEmail: booking.guestEmail || '',
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,
      totalAmount: booking.totalAmount,
      pickupLocation: booking.pickupLocation,
      pickupType: booking.pickupType,
      car: booking.car
    }))

    const formattedBlockedDates = blockedDates.map(blocked => ({
      id: blocked.id,
      carId: blocked.carId,
      date: blocked.date.toISOString().split('T')[0],
      reason: blocked.note,
      customPrice: blocked.customPrice
    }))

    // Calculate statistics
    const stats = {
      totalBookings: bookings.length,
      upcomingBookings: bookings.filter(b => new Date(b.startDate) > new Date()).length,
      activeBookings: bookings.filter(b => b.status === 'ACTIVE').length,
      blockedDays: blockedDates.length
    }

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      blockedDates: formattedBlockedDates,
      stats
    })

  } catch (error) {
    console.error('Calendar fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar data' },
      { status: 500 }
    )
  }
}

// POST - Update availability for specific dates
export async function POST(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { carId, dates, isAvailable = true, customPrice, note } = body

    if (!carId || !dates || !Array.isArray(dates)) {
      return NextResponse.json(
        { error: 'Car ID and dates array are required' },
        { status: 400 }
      )
    }

    // Verify the car belongs to the host
    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId: host.id
      }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found or unauthorized' },
        { status: 404 }
      )
    }

    // Check if any of the dates have bookings
    if (!isAvailable) {
      const bookingConflicts = await prisma.rentalBooking.findMany({
        where: {
          carId: carId,
          status: {
            in: ['CONFIRMED', 'ACTIVE']
          },
          OR: dates.map(date => ({
            AND: [
              { startDate: { lte: new Date(date) } },
              { endDate: { gte: new Date(date) } }
            ]
          }))
        }
      })

      if (bookingConflicts.length > 0) {
        return NextResponse.json(
          { 
            error: 'Cannot block dates with existing bookings',
            conflicts: bookingConflicts.map(b => ({
              id: b.id,
              dates: `${b.startDate.toLocaleDateString()} - ${b.endDate.toLocaleDateString()}`,
              guest: b.guestName
            }))
          },
          { status: 400 }
        )
      }
    }

    // Update or create availability records
    const results = []
    for (const dateStr of dates) {
      const date = new Date(dateStr)
      
      // Check if record exists
      const existing = await prisma.rentalAvailability.findUnique({
        where: {
          carId_date: {
            carId: carId,
            date: date
          }
        }
      })

      if (existing) {
        // Update existing record
        const updated = await prisma.rentalAvailability.update({
          where: {
            id: existing.id
          },
          data: {
            isAvailable,
            customPrice: customPrice || null,
            note: note || null
          }
        })
        results.push(updated)
      } else {
        // Create new record
        const created = await prisma.rentalAvailability.create({
          data: {
            carId,
            date,
            isAvailable,
            customPrice: customPrice || null,
            note: note || null
          }
        })
        results.push(created)
      }
    }

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId: host.userId,
        action: isAvailable ? 'CALENDAR_DATES_UNBLOCKED' : 'CALENDAR_DATES_BLOCKED',
        entityType: 'car',
        entityId: carId,
        metadata: {
          hostId: host.id,
          dates: dates,
          customPrice,
          note,
          carDetails: `${car.year} ${car.make} ${car.model}`
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully ${isAvailable ? 'unblocked' : 'blocked'} ${results.length} date(s)`,
      updatedDates: results.length
    })

  } catch (error) {
    console.error('Calendar update error:', error)
    return NextResponse.json(
      { error: 'Failed to update calendar' },
      { status: 500 }
    )
  }
}