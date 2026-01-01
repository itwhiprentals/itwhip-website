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
            status: { in: ['CONFIRMED', 'ACTIVE'] }
          },
          select: { id: true }
        },
        photos: {
          orderBy: [{ isHero: 'desc' }, { order: 'asc' }],
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate revenue per vehicle
    const vehicleRevenue = await prisma.rentalBooking.groupBy({
      by: ['carId'],
      where: {
        carId: { in: vehicles.map(v => v.id) },
        status: { in: ['COMPLETED'] }
      },
      _sum: {
        totalAmount: true
      }
    })

    const revenueMap = new Map(
      vehicleRevenue.map(v => [v.carId, v._sum.totalAmount || 0])
    )

    const formattedVehicles = vehicles.map(vehicle => {
      const hasActiveBooking = vehicle.bookings.length > 0
      let status: 'available' | 'booked' | 'maintenance' | 'inactive' = 'available'

      if (!vehicle.isActive) {
        status = 'inactive'
      } else if (hasActiveBooking) {
        status = 'booked'
      } else if (vehicle.safetyHold || vehicle.requiresInspection) {
        status = 'maintenance'
      }

      return {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        trim: vehicle.trim,
        color: vehicle.color,
        licensePlate: vehicle.licensePlate || 'N/A',
        vin: vehicle.vin || 'N/A',
        dailyRate: vehicle.dailyRate,
        status,
        isActive: vehicle.isActive,
        photo: vehicle.photos?.[0]?.url || null,
        totalTrips: vehicle.totalTrips || 0,
        totalRevenue: revenueMap.get(vehicle.id) || 0,
        rating: vehicle.rating || 5.0
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

// VIN validation helper
function isValidVIN(vin: string): { valid: boolean; error?: string } {
  if (!vin || typeof vin !== 'string') {
    return { valid: false, error: 'VIN is required' }
  }

  const trimmedVin = vin.trim().toUpperCase()

  if (trimmedVin.length !== 17) {
    return { valid: false, error: 'VIN must be exactly 17 characters' }
  }

  // VIN cannot contain I, O, or Q
  if (/[IOQ]/i.test(trimmedVin)) {
    return { valid: false, error: 'VIN cannot contain letters I, O, or Q' }
  }

  // Must be alphanumeric
  if (!/^[A-HJ-NPR-Z0-9]+$/i.test(trimmedVin)) {
    return { valid: false, error: 'VIN can only contain letters and numbers' }
  }

  return { valid: true }
}

// Vehicle eligibility check
function checkVehicleEligibility(year: number): { eligible: boolean; error?: string } {
  const currentYear = new Date().getFullYear()
  const vehicleAge = currentYear - year

  if (vehicleAge > 12) {
    return { eligible: false, error: `Vehicle is ${vehicleAge} years old. Maximum allowed is 12 years.` }
  }

  return { eligible: true }
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
      // VIN-decoded fields
      vin,
      make,
      model,
      year,
      trim,
      doors,
      transmission,
      fuelType,
      driveType,
      carType,

      // Manual fields
      color,
      licensePlate,
      currentMileage,

      // Location
      address,
      city,
      state,
      zipCode,
      latitude,
      longitude,

      // Pricing
      dailyRate,
      weeklyRate,
      monthlyRate,

      // Delivery options
      airportPickup,
      hotelDelivery,
      homeDelivery,
      deliveryFee,

      // Additional
      titleStatus,
      photos,
      features,
      description,
      vinVerificationMethod
    } = body

    // Validate VIN (REQUIRED for partners)
    const vinValidation = isValidVIN(vin)
    if (!vinValidation.valid) {
      return NextResponse.json(
        { error: vinValidation.error || 'Invalid VIN' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!make || !model || !year || !dailyRate) {
      return NextResponse.json(
        { error: 'Missing required fields: make, model, year, dailyRate' },
        { status: 400 }
      )
    }

    // Check vehicle eligibility (12 year max)
    const eligibility = checkVehicleEligibility(parseInt(year))
    if (!eligibility.eligible) {
      return NextResponse.json(
        { error: eligibility.error || 'Vehicle not eligible' },
        { status: 400 }
      )
    }

    // Check for duplicate VIN
    const existingVehicle = await prisma.rentalCar.findFirst({
      where: { vin: vin.trim().toUpperCase() }
    })

    if (existingVehicle) {
      return NextResponse.json(
        { error: 'A vehicle with this VIN is already registered' },
        { status: 400 }
      )
    }

    // Partners ALWAYS get auto-approval - vehicles are live immediately
    // Only set false if explicitly disabled on partner account
    const isAutoApproved = partner.autoApproveListings === false ? false : true
    console.log(`[Partner Fleet] Auto-approve status: ${isAutoApproved} (autoApproveListings: ${partner.autoApproveListings})`)

    // Create vehicle with all fields
    const vehicle = await prisma.rentalCar.create({
      data: {
        hostId: partner.id,
        source: 'partner',

        // VIN-decoded fields
        vin: vin.trim().toUpperCase(),
        make,
        model,
        year: parseInt(year),
        trim: trim || null,
        doors: doors ? parseInt(doors) : 4,
        transmission: transmission || 'automatic',
        fuelType: fuelType || 'gas',
        driveType: driveType || null,
        carType: carType || 'midsize',

        // Manual fields
        color: color || 'Unknown',
        licensePlate: licensePlate || null,
        currentMileage: currentMileage ? parseInt(currentMileage) : null,

        // Location
        address: address || '',
        city: city || 'Phoenix',
        state: state || 'AZ',
        zipCode: zipCode || '',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,

        // Garage location (same as pickup location for partners)
        garageAddress: address || '',
        garageCity: city || 'Phoenix',
        garageState: state || 'AZ',
        garageZip: zipCode || '',

        // Pricing
        dailyRate: parseFloat(dailyRate),
        weeklyRate: weeklyRate ? parseFloat(weeklyRate) : parseFloat(dailyRate) * 6.5,
        monthlyRate: monthlyRate ? parseFloat(monthlyRate) : parseFloat(dailyRate) * 25,

        // Delivery options
        airportPickup: airportPickup ?? false,
        hotelDelivery: hotelDelivery ?? true,
        homeDelivery: homeDelivery ?? false,
        deliveryFee: deliveryFee ? parseFloat(deliveryFee) : 35,

        // Insurance & title
        titleStatus: titleStatus || 'Clean',
        insuranceEligible: true,

        // Features (default auto-populated based on vehicle type)
        features: JSON.stringify(features || []),

        // Description
        description: description || null,

        // VIN verification tracking
        vinVerificationMethod: vinVerificationMethod || 'API',
        vinVerifiedAt: new Date(),

        // Default settings for partners - auto-approve means active
        seats: 5,
        isActive: isAutoApproved,
        instantBook: true,
        advanceNotice: 2,
        minTripDuration: 1,
        maxTripDuration: 30,

        // Vehicle type for rideshare context
        vehicleType: 'RIDESHARE'
      }
    })

    // Create photos if provided
    if (photos && Array.isArray(photos) && photos.length > 0) {
      await prisma.rentalCarPhoto.createMany({
        data: photos.map((photo: { url: string; isHero?: boolean }, index: number) => ({
          carId: vehicle.id,
          url: photo.url,
          isHero: photo.isHero || index === 0,
          order: index
        }))
      })
    }

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
      vin: vehicle.vin,
      vehicle: `${year} ${make} ${model}`,
      isActive: vehicle.isActive
    })

    return NextResponse.json({
      success: true,
      message: vehicle.isActive
        ? 'Vehicle added and is now live'
        : 'Vehicle added and pending approval',
      vehicle: {
        id: vehicle.id,
        vin: vehicle.vin,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        isActive: vehicle.isActive
      }
    })

  } catch (error: any) {
    console.error('[Partner Fleet] Error adding vehicle:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add vehicle' },
      { status: 500 }
    )
  }
}
