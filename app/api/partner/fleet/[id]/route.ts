// app/api/partner/fleet/[id]/route.ts
// GET /api/partner/fleet/[id] - Get single vehicle details
// PUT /api/partner/fleet/[id] - Update vehicle
// DELETE /api/partner/fleet/[id] - Remove vehicle from fleet

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

// GET - Fetch single vehicle with all details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const vehicle = await prisma.rentalCar.findFirst({
      where: {
        id,
        hostId: partner.id
      },
      include: {
        photos: {
          orderBy: [{ isHero: 'desc' }, { order: 'asc' }]
        },
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'ACTIVE'] }
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true
          }
        }
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Format vehicle for frontend
    const formattedVehicle = {
      id: vehicle.id,
      vin: vehicle.vin,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      trim: vehicle.trim,
      color: vehicle.color,
      licensePlate: vehicle.licensePlate,
      doors: vehicle.doors,
      seats: vehicle.seats,
      transmission: vehicle.transmission,
      fuelType: vehicle.fuelType,
      driveType: vehicle.driveType,
      carType: vehicle.carType,
      currentMileage: vehicle.currentMileage,
      description: vehicle.description,

      // Location
      address: vehicle.address,
      city: vehicle.city,
      state: vehicle.state,
      zipCode: vehicle.zipCode,
      latitude: vehicle.latitude,
      longitude: vehicle.longitude,

      // Pricing
      dailyRate: vehicle.dailyRate,
      weeklyRate: vehicle.weeklyRate,
      monthlyRate: vehicle.monthlyRate,
      deliveryFee: vehicle.deliveryFee,

      // Delivery options
      airportPickup: vehicle.airportPickup,
      hotelDelivery: vehicle.hotelDelivery,
      homeDelivery: vehicle.homeDelivery,

      // Availability settings
      isActive: vehicle.isActive,
      instantBook: vehicle.instantBook,
      advanceNotice: vehicle.advanceNotice,
      minTripDuration: vehicle.minTripDuration,
      maxTripDuration: vehicle.maxTripDuration,

      // Features
      features: typeof vehicle.features === 'string'
        ? JSON.parse(vehicle.features || '[]')
        : vehicle.features || [],

      // Insurance & title
      titleStatus: vehicle.titleStatus,
      insuranceEligible: vehicle.insuranceEligible,
      insuranceExpiryDate: vehicle.insuranceExpiryDate?.toISOString() || null,
      insuranceNotes: vehicle.insuranceNotes,
      // Parse insurance notes for frontend
      insuranceInfo: vehicle.insuranceNotes
        ? (() => {
            try {
              return JSON.parse(vehicle.insuranceNotes)
            } catch {
              return null
            }
          })()
        : null,

      // VIN verification
      vinVerifiedAt: vehicle.vinVerifiedAt,
      vinVerificationMethod: vehicle.vinVerificationMethod,

      // Photos
      photos: vehicle.photos.map((photo: { id: string; url: string; isHero: boolean; order: number }) => ({
        id: photo.id,
        url: photo.url,
        isHero: photo.isHero,
        order: photo.order
      })),

      // Vehicle Type (Rental vs Rideshare)
      vehicleType: vehicle.vehicleType || 'RENTAL',

      // Stats
      totalTrips: vehicle.totalTrips,
      rating: vehicle.rating,

      // Active bookings
      hasActiveBooking: vehicle.bookings.length > 0,
      activeBookings: vehicle.bookings,

      // Timestamps
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt
    }

    return NextResponse.json({
      success: true,
      vehicle: formattedVehicle
    })

  } catch (error: any) {
    console.error('[Partner Fleet] Error fetching vehicle:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle' },
      { status: 500 }
    )
  }
}

// PUT - Update vehicle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verify vehicle belongs to partner
    const existingVehicle = await prisma.rentalCar.findFirst({
      where: {
        id,
        hostId: partner.id
      }
    })

    if (!existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Fields that can be updated (VIN-decoded fields are locked after creation)
    const {
      // Editable fields
      color,
      licensePlate,
      currentMileage,
      description,

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
      deliveryFee,

      // Delivery options
      airportPickup,
      hotelDelivery,
      homeDelivery,

      // Availability settings
      isActive,
      instantBook,
      advanceNotice,
      minTripDuration,
      maxTripDuration,

      // Features
      features,

      // Vehicle Type (Rental vs Rideshare)
      vehicleType,

      // Insurance fields
      hasOwnInsurance,
      insuranceProvider,
      insurancePolicyNumber,
      insuranceExpiryDate,
      useForRentals
    } = body

    // Build update object (only include fields that were provided)
    const updateData: Record<string, any> = {}

    if (color !== undefined) updateData.color = color
    if (licensePlate !== undefined) updateData.licensePlate = licensePlate || null
    if (currentMileage !== undefined) updateData.currentMileage = parseInt(currentMileage) || null
    if (description !== undefined) updateData.description = description || null

    // Location
    if (address !== undefined) {
      updateData.address = address
      updateData.garageAddress = address // Keep garage in sync
    }
    if (city !== undefined) {
      updateData.city = city
      updateData.garageCity = city
    }
    if (state !== undefined) {
      updateData.state = state
      updateData.garageState = state
    }
    if (zipCode !== undefined) {
      updateData.zipCode = zipCode
      updateData.garageZip = zipCode
    }
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude) || null
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude) || null

    // Pricing
    if (dailyRate !== undefined) updateData.dailyRate = parseFloat(dailyRate)
    if (weeklyRate !== undefined) updateData.weeklyRate = parseFloat(weeklyRate) || null
    if (monthlyRate !== undefined) updateData.monthlyRate = parseFloat(monthlyRate) || null
    if (deliveryFee !== undefined) updateData.deliveryFee = parseFloat(deliveryFee)

    // Delivery options
    if (airportPickup !== undefined) updateData.airportPickup = !!airportPickup
    if (hotelDelivery !== undefined) updateData.hotelDelivery = !!hotelDelivery
    if (homeDelivery !== undefined) updateData.homeDelivery = !!homeDelivery

    // Availability
    if (isActive !== undefined) updateData.isActive = !!isActive
    if (instantBook !== undefined) updateData.instantBook = !!instantBook
    if (advanceNotice !== undefined) updateData.advanceNotice = parseInt(advanceNotice) || 2
    if (minTripDuration !== undefined) updateData.minTripDuration = parseInt(minTripDuration) || 1
    if (maxTripDuration !== undefined) updateData.maxTripDuration = parseInt(maxTripDuration) || 30

    // Features
    if (features !== undefined) {
      updateData.features = JSON.stringify(Array.isArray(features) ? features : [])
    }

    // Vehicle Type (Rental vs Rideshare)
    if (vehicleType !== undefined && (vehicleType === 'RENTAL' || vehicleType === 'RIDESHARE')) {
      updateData.vehicleType = vehicleType
    }

    // Insurance updates
    if (hasOwnInsurance !== undefined) {
      updateData.insuranceEligible = hasOwnInsurance && (useForRentals ?? false)
      updateData.insuranceNotes = hasOwnInsurance
        ? JSON.stringify({
            hasOwnInsurance: true,
            provider: insuranceProvider || null,
            policyNumber: insurancePolicyNumber || null,
            useForRentals: useForRentals ?? false
          })
        : null
    }
    if (insuranceExpiryDate !== undefined) {
      updateData.insuranceExpiryDate = insuranceExpiryDate ? new Date(insuranceExpiryDate) : null
    }

    // Update vehicle
    const updatedVehicle = await prisma.rentalCar.update({
      where: { id },
      data: updateData
    })

    console.log(`[Partner Fleet] Vehicle updated:`, {
      partnerId: partner.id,
      vehicleId: id,
      updatedFields: Object.keys(updateData)
    })

    return NextResponse.json({
      success: true,
      message: 'Vehicle updated successfully',
      vehicle: {
        id: updatedVehicle.id,
        make: updatedVehicle.make,
        model: updatedVehicle.model,
        year: updatedVehicle.year,
        isActive: updatedVehicle.isActive
      }
    })

  } catch (error: any) {
    console.error('[Partner Fleet] Error updating vehicle:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update vehicle' },
      { status: 500 }
    )
  }
}

// DELETE - Remove vehicle from fleet
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verify vehicle belongs to partner
    const vehicle = await prisma.rentalCar.findFirst({
      where: {
        id,
        hostId: partner.id
      },
      include: {
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'IN_PROGRESS', 'ACTIVE', 'PENDING'] }
          }
        }
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Check for active bookings
    if (vehicle.bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete vehicle with active or pending bookings' },
        { status: 400 }
      )
    }

    // Delete the vehicle (cascade will handle photos)
    await prisma.rentalCar.delete({
      where: { id }
    })

    // Update partner fleet size
    await prisma.rentalHost.update({
      where: { id: partner.id },
      data: {
        partnerFleetSize: { decrement: 1 }
      }
    })

    // Check if tier downgrade is needed
    const tierResult = await updatePartnerCommissionRate(partner.id)
    if (tierResult.updated) {
      console.log(`[Partner Fleet] Commission tier updated:`, tierResult.tierChange)
    }

    console.log(`[Partner Fleet] Vehicle deleted:`, {
      partnerId: partner.id,
      vehicleId: id,
      vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`
    })

    return NextResponse.json({
      success: true,
      message: 'Vehicle removed from fleet'
    })

  } catch (error: any) {
    console.error('[Partner Fleet] Error deleting vehicle:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete vehicle' },
      { status: 500 }
    )
  }
}
