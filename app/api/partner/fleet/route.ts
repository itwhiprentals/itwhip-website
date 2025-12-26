// app/api/partner/fleet/route.ts
// GET /api/partner/fleet - Get partner's vehicles
// POST /api/partner/fleet - Add a new vehicle

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { updatePartnerCommissionRate } from '@/app/lib/commission/calculate-tier'

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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const vehicles = await prisma.rentalCar.findMany({
      where: { hostId: partner.id },
      include: {
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'IN_PROGRESS', 'ACTIVE'] }
          },
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate revenue per vehicle
    const vehicleRevenue = await prisma.booking.groupBy({
      by: ['rentalCarId'],
      where: {
        rentalCarId: { in: vehicles.map(v => v.id) },
        status: { in: ['COMPLETED', 'FINISHED'] }
      },
      _sum: {
        totalPrice: true
      }
    })

    const revenueMap = new Map(
      vehicleRevenue.map(v => [v.rentalCarId, v._sum.totalPrice || 0])
    )

    const formattedVehicles = vehicles.map(vehicle => {
      const hasActiveBooking = vehicle.bookings.length > 0
      let status: 'available' | 'booked' | 'maintenance' = 'available'

      if (hasActiveBooking) {
        status = 'booked'
      } else if (vehicle.approvalStatus === 'MAINTENANCE') {
        status = 'maintenance'
      }

      return {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        licensePlate: vehicle.licensePlate || 'N/A',
        vin: vehicle.vin || 'N/A',
        dailyRate: vehicle.dailyRate,
        status,
        approvalStatus: vehicle.approvalStatus,
        photo: vehicle.photos?.[0] || null,
        totalTrips: vehicle.totalTrips || 0,
        totalRevenue: revenueMap.get(vehicle.id) || 0,
        rating: vehicle.averageRating || 0,
        active: vehicle.active
      }
    })

    return NextResponse.json({
      success: true,
      vehicles: formattedVehicles,
      total: formattedVehicles.length
    })

  } catch (error: any) {
    console.error('[Partner Fleet] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      make,
      model,
      year,
      licensePlate,
      vin,
      dailyRate,
      weeklyRate,
      description,
      features,
      photos,
      location,
      transmission,
      fuelType,
      seats,
      mileage
    } = body

    // Validate required fields
    if (!make || !model || !year || !dailyRate) {
      return NextResponse.json(
        { error: 'Missing required fields: make, model, year, dailyRate' },
        { status: 400 }
      )
    }

    // Partners get auto-approval
    const approvalStatus = partner.autoApproveListings ? 'APPROVED' : 'PENDING'

    const vehicle = await prisma.rentalCar.create({
      data: {
        hostId: partner.id,
        make,
        model,
        year: parseInt(year),
        licensePlate: licensePlate || null,
        vin: vin || null,
        dailyRate: parseFloat(dailyRate),
        weeklyRate: weeklyRate ? parseFloat(weeklyRate) : null,
        description: description || null,
        features: features || [],
        photos: photos || [],
        location: location || partner.location || 'Unknown',
        transmission: transmission || 'AUTOMATIC',
        fuelType: fuelType || 'GASOLINE',
        seats: seats ? parseInt(seats) : 5,
        mileage: mileage ? parseInt(mileage) : 0,
        approvalStatus,
        active: approvalStatus === 'APPROVED',
        instantBook: true // Partners default to instant book
      }
    })

    // Update partner fleet size
    await prisma.rentalHost.update({
      where: { id: partner.id },
      data: {
        partnerFleetSize: { increment: 1 }
      }
    })

    // Check if tier upgrade is needed based on new fleet size
    const tierResult = await updatePartnerCommissionRate(partner.id)
    if (tierResult.updated) {
      console.log(`[Partner Fleet] Commission tier updated:`, tierResult.tierChange)
    }

    console.log(`[Partner Fleet] Vehicle added:`, {
      partnerId: partner.id,
      vehicleId: vehicle.id,
      vehicle: `${year} ${make} ${model}`
    })

    return NextResponse.json({
      success: true,
      message: approvalStatus === 'APPROVED'
        ? 'Vehicle added and is now live'
        : 'Vehicle added and pending approval',
      vehicle: {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        approvalStatus
      }
    })

  } catch (error: any) {
    console.error('[Partner Fleet] Error adding vehicle:', error)
    return NextResponse.json(
      { error: 'Failed to add vehicle' },
      { status: 500 }
    )
  }
}
