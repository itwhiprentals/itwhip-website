// app/api/partner/calendar/route.ts
// Partner Calendar API - Vehicle availability and bookings calendar

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

export async function GET(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicleId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Default to current month if no dates provided
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const end = endDate ? new Date(endDate) : new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0)

    // Get partner's vehicles
    const vehicles = await prisma.rentalCar.findMany({
      where: { hostId: partner.id },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        status: true,
        primaryPhotoUrl: true
      }
    })

    const vehicleIds = vehicleId ? [vehicleId] : vehicles.map(v => v.id)

    // Get bookings in range
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        carId: { in: vehicleIds },
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start }
          }
        ],
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] }
      },
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true
          }
        },
        renter: {
          select: {
            name: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    })

    // Get blocked dates (maintenance, etc.) - from vehicle's blockedDates JSON field
    const vehiclesWithBlocks = await prisma.rentalCar.findMany({
      where: { id: { in: vehicleIds } },
      select: {
        id: true,
        blockedDates: true
      }
    })

    // Format events for calendar
    const events = bookings.map(b => ({
      id: b.id,
      type: 'booking' as const,
      title: b.renter?.name || b.guestName || 'Guest',
      vehicleId: b.carId,
      vehicleName: b.car
        ? `${b.car.year} ${b.car.make} ${b.car.model}`
        : 'Vehicle',
      start: b.startDate.toISOString(),
      end: b.endDate.toISOString(),
      status: b.status,
      bookingCode: b.bookingCode || b.id.slice(0, 8),
      totalAmount: b.totalAmount || 0,
      color: getStatusColor(b.status)
    }))

    // Add blocked dates as events
    vehiclesWithBlocks.forEach(v => {
      if (v.blockedDates && Array.isArray(v.blockedDates)) {
        (v.blockedDates as any[]).forEach((block, idx) => {
          if (block.start && block.end) {
            const vehicle = vehicles.find(veh => veh.id === v.id)
            events.push({
              id: `blocked_${v.id}_${idx}`,
              type: 'blocked' as const,
              title: block.reason || 'Blocked',
              vehicleId: v.id,
              vehicleName: vehicle
                ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                : 'Vehicle',
              start: new Date(block.start).toISOString(),
              end: new Date(block.end).toISOString(),
              status: 'BLOCKED',
              bookingCode: '',
              totalAmount: 0,
              color: '#94a3b8' // gray
            })
          }
        })
      }
    })

    // Sort events by start date
    events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

    // Generate availability summary per vehicle
    const availability = vehicles.map(v => {
      const vehicleEvents = events.filter(e => e.vehicleId === v.id)
      const bookedDays = calculateBookedDays(vehicleEvents, start, end)
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      const availableDays = totalDays - bookedDays

      return {
        vehicleId: v.id,
        vehicleName: `${v.year} ${v.make} ${v.model}`,
        vehiclePhoto: v.primaryPhotoUrl,
        status: v.status,
        totalDays,
        bookedDays,
        availableDays,
        utilizationRate: totalDays > 0 ? Math.round((bookedDays / totalDays) * 100) : 0
      }
    })

    return NextResponse.json({
      success: true,
      events,
      vehicles: vehicles.map(v => ({
        id: v.id,
        name: `${v.year} ${v.make} ${v.model}`,
        photo: v.primaryPhotoUrl,
        status: v.status
      })),
      availability,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    })

  } catch (error) {
    console.error('[Partner Calendar] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 })
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'CONFIRMED':
      return '#22c55e' // green
    case 'PENDING':
      return '#f59e0b' // amber
    case 'IN_PROGRESS':
      return '#3b82f6' // blue
    case 'CANCELLED':
      return '#ef4444' // red
    default:
      return '#6b7280' // gray
  }
}

function calculateBookedDays(events: any[], start: Date, end: Date): number {
  // Create a set of all booked dates
  const bookedDates = new Set<string>()

  events.forEach(event => {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)

    // Only count days within the range
    const rangeStart = eventStart < start ? start : eventStart
    const rangeEnd = eventEnd > end ? end : eventEnd

    let current = new Date(rangeStart)
    while (current <= rangeEnd) {
      bookedDates.add(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
  })

  return bookedDates.size
}

// POST - Block dates
export async function POST(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { vehicleId, startDate, endDate, reason } = body

    if (!vehicleId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: vehicleId, startDate, endDate' },
        { status: 400 }
      )
    }

    // Verify vehicle belongs to partner
    const vehicle = await prisma.rentalCar.findFirst({
      where: {
        id: vehicleId,
        hostId: partner.id
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Get existing blocked dates
    const existingBlocks = (vehicle.blockedDates as any[]) || []

    // Add new block
    const newBlock = {
      start: new Date(startDate).toISOString(),
      end: new Date(endDate).toISOString(),
      reason: reason || 'Blocked by partner',
      createdAt: new Date().toISOString()
    }

    await prisma.rentalCar.update({
      where: { id: vehicleId },
      data: {
        blockedDates: [...existingBlocks, newBlock]
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Dates blocked successfully'
    })

  } catch (error) {
    console.error('[Partner Calendar] Block dates error:', error)
    return NextResponse.json({ error: 'Failed to block dates' }, { status: 500 })
  }
}

// DELETE - Unblock dates
export async function DELETE(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicleId')
    const blockIndex = searchParams.get('index')

    if (!vehicleId || blockIndex === null) {
      return NextResponse.json(
        { error: 'Missing required params: vehicleId, index' },
        { status: 400 }
      )
    }

    // Verify vehicle belongs to partner
    const vehicle = await prisma.rentalCar.findFirst({
      where: {
        id: vehicleId,
        hostId: partner.id
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Remove block at index
    const existingBlocks = (vehicle.blockedDates as any[]) || []
    const idx = parseInt(blockIndex)

    if (idx >= 0 && idx < existingBlocks.length) {
      existingBlocks.splice(idx, 1)

      await prisma.rentalCar.update({
        where: { id: vehicleId },
        data: {
          blockedDates: existingBlocks
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Block removed successfully'
    })

  } catch (error) {
    console.error('[Partner Calendar] Remove block error:', error)
    return NextResponse.json({ error: 'Failed to remove block' }, { status: 500 })
  }
}
