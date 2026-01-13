// app/api/partner/bookings/route.ts
// GET /api/partner/bookings - Get partner's bookings

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  // Accept both partner_token AND hostAccessToken for unified portal
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    // Allow all host types since we've unified the portals
    if (!partner) {
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all partner's vehicles
    const vehicles = await prisma.rentalCar.findMany({
      where: { hostId: partner.id },
      select: { id: true }
    })

    const vehicleIds = vehicles.map(v => v.id)

    // Get all bookings for these vehicles
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        carId: { in: vehicleIds }
      },
      include: {
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedBookings = bookings.map(booking => {
      const startDate = new Date(booking.startDate)
      const endDate = new Date(booking.endDate)
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

      return {
        id: booking.id,
        guestName: booking.renter?.name || booking.guestName || 'Guest',
        guestEmail: booking.renter?.email || booking.guestEmail || 'N/A',
        guestPhone: booking.renter?.phone || booking.guestPhone || null,
        vehicleName: booking.car
          ? `${booking.car.year} ${booking.car.make} ${booking.car.model}`
          : 'Unknown Vehicle',
        vehicleId: booking.carId,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        status: mapBookingStatus(booking.status),
        totalAmount: Number(booking.totalAmount) || 0,
        createdAt: booking.createdAt.toISOString(),
        days
      }
    })

    // Calculate stats
    const stats = {
      total: formattedBookings.length,
      pending: formattedBookings.filter(b => b.status === 'pending').length,
      confirmed: formattedBookings.filter(b => b.status === 'confirmed').length,
      active: formattedBookings.filter(b => b.status === 'active').length,
      completed: formattedBookings.filter(b => b.status === 'completed').length,
      cancelled: formattedBookings.filter(b => b.status === 'cancelled').length
    }

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      stats
    })

  } catch (error: any) {
    console.error('[Partner Bookings] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

function mapBookingStatus(status: string): 'confirmed' | 'pending' | 'active' | 'completed' | 'cancelled' {
  switch (status) {
    case 'CONFIRMED':
      return 'confirmed'
    case 'PENDING':
    case 'PENDING_APPROVAL':
      return 'pending'
    case 'IN_PROGRESS':
    case 'ACTIVE':
      return 'active'
    case 'COMPLETED':
    case 'FINISHED':
      return 'completed'
    case 'CANCELLED':
    case 'REJECTED':
      return 'cancelled'
    default:
      return 'pending'
  }
}
