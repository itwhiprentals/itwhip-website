// app/api/host/managed-vehicles/route.ts
// GET /api/host/managed-vehicles - Get vehicles managed by current user

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Get host profile
    const host = await prisma.rentalHost.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { email: user.email }
        ]
      },
      select: { id: true }
    })

    if (!host) {
      return NextResponse.json({ vehicles: [] })
    }

    // Get all vehicle management records where this user is the manager
    const managementRecords = await prisma.vehicleManagement.findMany({
      where: {
        managerId: host.id,
        status: { in: ['ACTIVE', 'PENDING', 'PAUSED'] }
      },
      include: {
        vehicle: {
          include: {
            photos: {
              orderBy: { isHero: 'desc' },
              take: 5
            },
            bookings: {
              where: {
                status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] }
              },
              select: { id: true }
            }
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true
          }
        }
      }
    })

    // Transform to expected format
    const vehicles = managementRecords.map(record => {
      const car = record.vehicle
      const heroPhoto = car.photos.find(p => p.isHero)?.url || car.photos[0]?.url

      return {
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        trim: car.trim,
        color: car.color,
        licensePlate: car.licensePlate,
        carType: car.carType,
        seats: car.seats,
        transmission: car.transmission,
        fuelType: car.fuelType,
        dailyRate: Number(car.dailyRate),
        weeklyRate: car.weeklyRate ? Number(car.weeklyRate) : null,
        monthlyRate: car.monthlyRate ? Number(car.monthlyRate) : null,
        airportPickup: car.airportPickup,
        hotelDelivery: car.hotelDelivery,
        homeDelivery: car.homeDelivery,
        address: car.address,
        city: car.city,
        state: car.state,
        isActive: car.isActive,
        instantBook: car.instantBook,
        minTripDuration: car.minTripDuration,
        totalTrips: car.totalTrips,
        rating: car.rating,
        photos: car.photos.map(p => ({
          id: p.id,
          url: p.url,
          isHero: p.isHero
        })),
        heroPhoto,
        activeBookings: car.bookings.length,
        hasActiveClaim: car.hasActiveClaim,
        activeClaimId: car.activeClaimId,

        // Management-specific fields
        owner: {
          id: record.owner.id,
          name: record.owner.name,
          email: record.owner.email,
          profilePhoto: record.owner.profilePhoto
        },
        ownerCommissionPercent: Number(record.ownerCommissionPercent),
        managerCommissionPercent: Number(record.managerCommissionPercent),
        managementStatus: record.status,
        permissions: {
          canEditListing: record.canEditListing,
          canAdjustPricing: record.canAdjustPricing,
          canCommunicateGuests: record.canCommunicateGuests,
          canApproveBookings: record.canApproveBookings,
          canHandleIssues: record.canHandleIssues
        }
      }
    })

    return NextResponse.json({
      vehicles,
      count: vehicles.length
    })

  } catch (error) {
    console.error('[Managed Vehicles] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch managed vehicles' },
      { status: 500 }
    )
  }
}
