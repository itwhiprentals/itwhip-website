// app/api/host/cars/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { headers } from 'next/headers'
import { classifyVehicle } from '@/app/lib/insurance/classification-service'
import { checkVehicleEligibility } from '@/app/lib/insurance/eligibility-engine'

// ========== ✅ NEW: ESG EVENT HOOK IMPORT ==========
import { handleVehicleAdded } from '@/app/lib/esg/event-hooks'

// Helper to get host from headers
async function getHostFromHeaders() {
  const headersList = await headers()
  const hostId = headersList.get('x-host-id')
  const userId = headersList.get('x-user-id')
  
  if (!userId) {
    return null
  }
  
  const host = await prisma.rentalHost.findFirst({
    where: hostId ? { id: hostId } : { userId: userId }
  })
  
  return host
}

// GET - Fetch all cars for host
export async function GET(request: NextRequest) {
  try {
    // Check for hostId in query params first (for VerificationProgress component)
    const { searchParams } = new URL(request.url)
    const queryHostId = searchParams.get('hostId')
    
    let host = null
    
    if (queryHostId) {
      // Fetch host directly by ID (for components that pass hostId)
      host = await prisma.rentalHost.findUnique({
        where: { id: queryHostId }
      })
    } else {
      // Fall back to header-based auth
      host = await getHostFromHeaders()
    }
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // ✅ FIXED: Allow PENDING hosts to view their cars
    // Only block REJECTED hosts completely
    if (host.approvalStatus === 'REJECTED') {
      return NextResponse.json(
        { error: 'Host application rejected' },
        { status: 403 }
      )
    }
    
    // Fetch all cars for this host
    const cars = await prisma.rentalCar.findMany({
      where: {
        hostId: host.id
      },
      include: {
        photos: {
          orderBy: { order: 'asc' }
        },
        classification: true,
        bookings: {
          where: {
            OR: [
              { status: 'CONFIRMED' },
              { status: 'ACTIVE' }
            ],
            startDate: { gte: new Date() }
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        },
        _count: {
          select: {
            bookings: {
              where: {
                status: 'COMPLETED'
              }
            },
            photos: true  // ✅ Added for completion checking
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Get all active claims for all cars in one query
    const carIds = cars.map(car => car.id)
    let activeClaims: any[] = []
    
    if (carIds.length > 0) {
      try {
        activeClaims = await prisma.claim.findMany({
          where: {
            booking: {
              carId: { in: carIds }
            },
            status: {
              in: ['PENDING', 'UNDER_REVIEW']
            }
          },
          include: {
            booking: {
              select: {
                bookingCode: true,
                carId: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        })
      } catch (err) {
        console.error('Error fetching claims:', err)
      }
    }
    
    // Create a map of carId -> active claims
    const claimsByCarId = new Map<string, typeof activeClaims>()
    activeClaims.forEach(claim => {
      const carId = claim.booking.carId
      if (!claimsByCarId.has(carId)) {
        claimsByCarId.set(carId, [])
      }
      claimsByCarId.get(carId)!.push(claim)
    })
    
    // Format car data with calculated fields
    const formattedCars = cars.map(car => {
      // Find hero photo
      const heroPhoto = car.photos.find(p => p.isHero)?.url || car.photos[0]?.url || null
      
      // Calculate average rating
      const avgRating = car.reviews.length > 0
        ? car.reviews.reduce((sum, r) => sum + r.rating, 0) / car.reviews.length
        : car.rating
      
      // Count active and upcoming bookings
      const activeBookings = car.bookings.filter(b => b.status === 'ACTIVE').length
      const upcomingBookings = car.bookings.filter(b => b.status === 'CONFIRMED').length
      
      // Get active claims for this car
      const carClaims = claimsByCarId.get(car.id) || []
      const hasActiveClaim = carClaims.length > 0
      const mostRecentClaim = carClaims[0]
      
      return {
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        trim: car.trim,
        color: car.color,
        licensePlate: car.licensePlate,
        vin: car.vin,  // ✅ Added for completion checking
        
        // Specs
        carType: car.carType,
        seats: car.seats,
        transmission: car.transmission,
        fuelType: car.fuelType,
        
        // Pricing
        dailyRate: car.dailyRate,
        weeklyRate: car.weeklyRate,
        monthlyRate: car.monthlyRate,
        
        // Delivery
        airportPickup: car.airportPickup,
        hotelDelivery: car.hotelDelivery,
        homeDelivery: car.homeDelivery,
        
        // Location
        address: car.address,
        city: car.city,
        state: car.state,
        
        // Availability
        isActive: car.isActive,
        instantBook: car.instantBook,
        minTripDuration: car.minTripDuration,
        
        // Insurance Classification
        insuranceCategory: car.insuranceCategory,
        insuranceRiskLevel: car.insuranceRiskLevel,
        insuranceEligible: car.insuranceEligible,
        estimatedValue: car.estimatedValue,
        requiresManualUnderwriting: car.requiresManualUnderwriting,
        
        // Stats
        totalTrips: car._count.bookings,
        rating: avgRating,
        
        // ✅ Photo count for completion checking
        photoCount: car._count.photos,
        
        // Photos
        photos: car.photos.map(p => ({
          id: p.id,
          url: p.url,
          isHero: p.isHero
        })),
        heroPhoto: heroPhoto,
        
        // Booking status
        activeBookings: activeBookings,
        upcomingBookings: upcomingBookings,
        
        // Active claim information
        hasActiveClaim: hasActiveClaim,
        activeClaimCount: carClaims.length,
        activeClaim: mostRecentClaim ? {
          id: mostRecentClaim.id,
          type: mostRecentClaim.type,
          status: mostRecentClaim.status,
          createdAt: mostRecentClaim.createdAt.toISOString(),
          bookingCode: mostRecentClaim.booking.bookingCode
        } : null
      }
    })
    
    return NextResponse.json({
      success: true,
      cars: formattedCars,
      total: formattedCars.length,
      active: formattedCars.filter(c => c.isActive).length,
      inactive: formattedCars.filter(c => !c.isActive).length,
      insured: formattedCars.filter(c => c.insuranceEligible).length,
      uninsured: formattedCars.filter(c => !c.insuranceEligible).length,
      withActiveClaims: formattedCars.filter(c => c.hasActiveClaim).length
    })
    
  } catch (error) {
    console.error('Cars fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cars' },
      { status: 500 }
    )
  }
}

// POST - Add new car
export async function POST(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if host is approved
    if (host.approvalStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only approved hosts can add cars' },
        { status: 403 }
      )
    }
    
    // Check if host has permission to add cars
    if (!host.canEditCalendar) {
      return NextResponse.json(
        { error: 'You do not have permission to add cars' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'make', 'model', 'year', 'color', 'carType', 'seats', 
      'doors', 'transmission', 'fuelType', 'dailyRate',
      'address', 'city', 'state', 'zipCode'
    ]
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }
    
    // Apply host constraints
    if (host.minDailyRate && body.dailyRate < host.minDailyRate) {
      return NextResponse.json(
        { error: `Daily rate must be at least $${host.minDailyRate}` },
        { status: 400 }
      )
    }
    
    if (host.maxDailyRate && body.dailyRate > host.maxDailyRate) {
      return NextResponse.json(
        { error: `Daily rate cannot exceed $${host.maxDailyRate}` },
        { status: 400 }
      )
    }
    
    // Classify the vehicle for insurance
    const classification = await classifyVehicle({
      make: body.make,
      model: body.model,
      year: body.year,
      trim: body.trim
    })
    
    // Create the car with classification
    const newCar = await prisma.rentalCar.create({
      data: {
        hostId: host.id,
        make: body.make,
        model: body.model,
        year: body.year,
        trim: body.trim,
        color: body.color,
        licensePlate: body.licensePlate,
        vin: body.vin,
        
        // Specifications
        carType: body.carType,
        seats: body.seats,
        doors: body.doors,
        transmission: body.transmission,
        fuelType: body.fuelType,
        mpgCity: body.mpgCity,
        mpgHighway: body.mpgHighway,
        currentMileage: body.currentMileage,
        
        // Insurance Classification
        classificationId: classification.classificationId,
        insuranceEligible: classification.isInsurable,
        insuranceCategory: classification.category,
        insuranceRiskLevel: classification.riskLevel,
        estimatedValue: classification.estimatedValue,
        requiresManualUnderwriting: classification.requiresManualReview,
        insuranceNotes: classification.insurabilityReason,
        
        // Pricing
        dailyRate: body.dailyRate,
        weeklyRate: body.weeklyRate || body.dailyRate * 6.5,
        monthlyRate: body.monthlyRate || body.dailyRate * 25,
        weeklyDiscount: body.weeklyDiscount || 0.15,
        monthlyDiscount: body.monthlyDiscount || 0.30,
        
        // Features (JSON)
        features: JSON.stringify(body.features || []),
        
        // Location
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        latitude: body.latitude,
        longitude: body.longitude,
        
        // Delivery options
        airportPickup: body.airportPickup || false,
        hotelDelivery: body.hotelDelivery || true,
        homeDelivery: body.homeDelivery || false,
        airportFee: body.airportFee || 0,
        hotelFee: body.hotelFee || 35,
        homeFee: body.homeFee || 50,
        deliveryRadius: body.deliveryRadius || 10,
        
        // Availability settings
        isActive: body.isActive !== false,
        instantBook: body.instantBook !== false,
        advanceNotice: body.advanceNotice || 2,
        minTripDuration: body.minTripDuration || 1,
        maxTripDuration: body.maxTripDuration || 30,
        bufferTime: body.bufferTime || 2,
        
        // Mileage settings
        mileageDaily: body.mileageDaily || 200,
        mileageWeekly: body.mileageWeekly || 1000,
        mileageMonthly: body.mileageMonthly || 3000,
        mileageOverageFee: body.mileageOverageFee || 3.0,
        
        // Rules (JSON)
        rules: body.rules ? JSON.stringify(body.rules) : null,
        
        // Insurance
        insuranceIncluded: body.insuranceIncluded || false,
        insuranceDaily: body.insuranceDaily || classification.baseRateMultiplier * 25
      }
    })
    
    // Check eligibility with active provider
    const eligibility = await checkVehicleEligibility(newCar)
    
    // If car requires manual underwriting, create admin notification
    if (classification.requiresManualReview) {
      await prisma.adminNotification.create({
        data: {
          type: 'MANUAL_UNDERWRITING_REQUIRED',
          title: 'Manual Insurance Review Required',
          message: `${newCar.year} ${newCar.make} ${newCar.model} requires manual insurance underwriting`,
          priority: 'HIGH',
          status: 'UNREAD',
          relatedId: newCar.id,
          relatedType: 'car',
          actionRequired: true,
          metadata: {
            carId: newCar.id,
            hostName: host.name,
            classification: {
              category: classification.category,
              riskLevel: classification.riskLevel,
              estimatedValue: classification.estimatedValue,
              reason: classification.insurabilityReason
            },
            eligibility: eligibility
          }
        }
      })
    }
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: host.userId,
        action: 'car_added',
        entityType: 'car',
        entityId: newCar.id,
        metadata: {
          carDetails: `${newCar.year} ${newCar.make} ${newCar.model}`,
          insuranceClassification: {
            category: classification.category,
            riskLevel: classification.riskLevel,
            eligible: classification.isInsurable
          }
        }
      }
    })
    
    // Create standard admin notification
    await prisma.adminNotification.create({
      data: {
        type: 'NEW_CAR',
        title: 'New Car Added',
        message: `${host.name} added a ${newCar.year} ${newCar.make} ${newCar.model}`,
        priority: classification.requiresManualReview ? 'MEDIUM' : 'LOW',
        status: 'UNREAD',
        relatedId: newCar.id,
        relatedType: 'car',
        actionRequired: false,
        metadata: {
          hostName: host.name,
          carDetails: {
            make: newCar.make,
            model: newCar.model,
            year: newCar.year,
            dailyRate: newCar.dailyRate,
            insuranceCategory: classification.category,
            insuranceRiskLevel: classification.riskLevel,
            insuranceEligible: classification.isInsurable
          }
        }
      }
    })
    
    // Add photos if provided
    if (body.photos && Array.isArray(body.photos)) {
      const photoData = body.photos.map((url: string, index: number) => ({
        carId: newCar.id,
        url: url,
        isHero: index === 0,
        order: index
      }))
      
      await prisma.rentalCarPhoto.createMany({
        data: photoData
      })
    }

    // ✅ TRIGGER ESG EVENT - VEHICLE ADDED
    try {
      await handleVehicleAdded(host.id, {
        carId: newCar.id,
        make: newCar.make,
        model: newCar.model,
        year: newCar.year,
        fuelType: newCar.fuelType,
        isElectric: newCar.fuelType === 'ELECTRIC',
        isHybrid: newCar.fuelType === 'HYBRID',
        estimatedValue: newCar.estimatedValue || classification.estimatedValue,
        insuranceEligible: newCar.insuranceEligible
      })

      console.log('✅ ESG vehicle added event triggered:', {
        hostId: host.id,
        carId: newCar.id,
        vehicle: `${newCar.year} ${newCar.make} ${newCar.model}`,
        fuelType: newCar.fuelType,
        insuranceEligible: newCar.insuranceEligible
      })
    } catch (esgError) {
      console.error('❌ ESG event failed (non-critical):', esgError)
    }
    
    return NextResponse.json({
      success: true,
      car: {
        ...newCar,
        classification: classification,
        eligibility: eligibility
      }
    })
    
  } catch (error) {
    console.error('Car creation error:', error)
    return NextResponse.json(
      { error: 'Failed to add car' },
      { status: 500 }
    )
  }
}