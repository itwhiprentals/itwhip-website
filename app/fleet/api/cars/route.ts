// app/fleet/api/cars/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { Prisma } from '@prisma/client'

const FLEET_KEY = 'phoenix-fleet-2847'

function validateFleetKey(request: NextRequest): boolean {
  const key = request.headers.get('x-fleet-key') ||
              request.nextUrl.searchParams.get('key')
  return key === FLEET_KEY
}

// GET - Fetch cars with filters, pagination, and stats
export async function GET(request: NextRequest) {
  if (!validateFleetKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = request.nextUrl
    const tab = searchParams.get('tab') || 'all'
    const search = searchParams.get('search') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const sort = searchParams.get('sort') || 'newest'

    // Build where clause based on tab
    let where: Prisma.RentalCarWhereInput = {}

    switch (tab) {
      case 'active':
        where.isActive = true
        break
      case 'unlisted':
        where.isActive = false
        break
      case 'claimed':
        where.hasActiveClaim = true
        break
      case 'issues':
        where.OR = [
          { dailyRate: { lte: 0 } },
          { photos: { none: {} } },
          { safetyHold: true },
          { requiresInspection: true },
        ]
        break
      // 'all' — no filter
    }

    // Apply search filter
    if (search) {
      const searchFilter: Prisma.RentalCarWhereInput = {
        OR: [
          { make: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { vin: { contains: search, mode: 'insensitive' } },
          { licensePlate: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { host: { name: { contains: search, mode: 'insensitive' } } },
          { host: { email: { contains: search, mode: 'insensitive' } } },
        ],
      }

      // Merge search with tab filter
      if (where.OR) {
        where = { AND: [{ OR: where.OR }, searchFilter] }
      } else {
        where = { ...where, ...searchFilter }
      }
    }

    // Build orderBy
    let orderBy: Prisma.RentalCarOrderByWithRelationInput = { createdAt: 'desc' }
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'price_high':
        orderBy = { dailyRate: 'desc' }
        break
      case 'price_low':
        orderBy = { dailyRate: 'asc' }
        break
      case 'rating':
        orderBy = { rating: 'desc' }
        break
    }

    // Run data query + stats in parallel
    const [cars, total, statsResult] = await Promise.all([
      // Main data query
      prisma.rentalCar.findMany({
        where,
        include: {
          host: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              approvalStatus: true,
              partnerCompanyName: true,
            },
          },
          photos: {
            orderBy: { order: 'asc' },
            take: 1,
            select: { url: true, isHero: true },
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
              photos: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),

      // Total count for pagination
      prisma.rentalCar.count({ where }),

      // Stats counts (all in parallel)
      Promise.all([
        prisma.rentalCar.count(),
        prisma.rentalCar.count({ where: { isActive: true } }),
        prisma.rentalCar.count({ where: { isActive: false } }),
        prisma.rentalCar.count({ where: { hasActiveClaim: true } }),
        prisma.rentalCar.count({
          where: {
            OR: [
              { dailyRate: { lte: 0 } },
              { photos: { none: {} } },
              { safetyHold: true },
              { requiresInspection: true },
            ],
          },
        }),
      ]),
    ])

    const [totalAll, totalActive, totalUnlisted, totalClaimed, totalIssues] = statsResult

    // Transform cars
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const transformedCars = cars.map((car) => {
      // Determine issues
      const issues: string[] = []
      if (car._count.photos === 0) issues.push('No Photos')
      if (car.dailyRate <= 0) issues.push('$0 Rate')
      if (car.safetyHold) issues.push('Safety Hold')
      if (car.requiresInspection) issues.push('Needs Inspection')

      // Determine display status
      let status = 'ACTIVE'
      if (!car.isActive && car.hasActiveClaim) {
        status = 'CLAIMED'
      } else if (!car.isActive) {
        status = 'UNLISTED'
      } else if (car.safetyHold) {
        status = 'SAFETY_HOLD'
      }

      return {
        id: car.id,
        year: car.year,
        make: car.make,
        model: car.model,
        color: car.color,
        carType: car.carType,
        vin: car.vin,
        licensePlate: car.licensePlate,
        dailyRate: car.dailyRate,
        city: car.city,
        state: car.state,
        isActive: car.isActive,
        hasActiveClaim: car.hasActiveClaim,
        safetyHold: car.safetyHold,
        requiresInspection: car.requiresInspection,
        rating: car.rating,
        totalTrips: car.totalTrips,
        createdAt: car.createdAt,
        heroPhoto: car.photos[0]?.url || null,
        photoCount: car._count.photos,
        bookingCount: car._count.bookings,
        reviewCount: car._count.reviews,
        host: car.host
          ? {
              id: car.host.id,
              name: car.host.partnerCompanyName || car.host.name,
              email: car.host.email,
              phone: car.host.phone,
              approvalStatus: car.host.approvalStatus,
            }
          : null,
        status,
        issues,
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedCars,
      stats: {
        total: totalAll,
        active: totalActive,
        unlisted: totalUnlisted,
        claimed: totalClaimed,
        issues: totalIssues,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching cars:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cars' },
      { status: 500 }
    )
  }
}

// POST - Create new car
export async function POST(request: NextRequest) {
  if (!validateFleetKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Create the car
    const car = await prisma.rentalCar.create({
      data: {
        id: crypto.randomUUID(),
        updatedAt: new Date(),
        hostId: body.hostId,
        source: 'p2p',
        make: body.make,
        model: body.model,
        year: body.year,
        color: body.color,
        vin: body.vin,
        licensePlate: body.licensePlate,
        carType: body.carType || body.category,
        seats: body.seats || 4,
        doors: body.doors || 4,
        transmission: body.transmission,
        fuelType: body.fuelType,
        mpgCity: body.mpgCity,
        mpgHighway: body.mpgHighway,
        currentMileage: body.currentMileage,
        dailyRate: body.dailyRate,
        weeklyRate: body.weeklyRate || body.dailyRate * 6.3,
        monthlyRate: body.monthlyRate || body.dailyRate * 24,
        weeklyDiscount: body.weeklyDiscount || 10,
        monthlyDiscount: body.monthlyDiscount || 20,
        deliveryFee: body.deliveryFee || 150,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        latitude: body.latitude,
        longitude: body.longitude,
        features: body.features,
        rules: body.rules,
        insuranceIncluded: body.insuranceIncluded || false,
        insuranceDaily: body.insuranceDaily || 99,
        minTripDuration: body.minTripDuration || 1,
        maxTripDuration: body.maxTripDuration || 30,
        advanceNotice: body.advanceNotice || 24,
        airportPickup: body.airportPickup || true,
        hotelDelivery: body.hotelDelivery || true,
        homeDelivery: body.homeDelivery || true,
        isActive: body.isActive !== false,
        instantBook: body.instantBook !== false,
        totalTrips: 0,
        rating: 0
      } as any
    })

    // Add photos if provided
    if (body.photos && body.photos.length > 0) {
      await prisma.rentalCarPhoto.createMany({
        data: body.photos.map((url: string, index: number) => ({
          carId: car.id,
          url,
          order: index,
          isHero: index === (body.heroPhotoIndex || 0)
        }))
      })
    }

    return NextResponse.json({
      success: true,
      data: car,
      message: 'Car created successfully'
    })
  } catch (error) {
    console.error('Error creating car:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create car' },
      { status: 500 }
    )
  }
}
