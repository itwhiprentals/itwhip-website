// app/api/rentals/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { calculateDistance, getBoundingBox } from '@/lib/utils/distance'
import { checkAvailability } from '@/lib/utils/availability'
import { getLocationByName, ALL_ARIZONA_LOCATIONS } from '@/lib/data/arizona-locations'
import { getTaxRate } from '@/app/(guest)/rentals/lib/arizona-taxes'

// Default search radius in miles
const DEFAULT_RADIUS_MILES = 25

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract search parameters
    const location = searchParams.get('location') || 'Phoenix, AZ'
    const exactCity = searchParams.get('city') // Exact city match (case-insensitive)
    const pickupDate = searchParams.get('pickupDate')
    const returnDate = searchParams.get('returnDate')
    const pickupTime = searchParams.get('pickupTime') || '10:00'
    const returnTime = searchParams.get('returnTime') || '10:00'
    const sortBy = searchParams.get('sortBy') || 'recommended'
    const instantBook = searchParams.get('instantBook') === 'true'
    const carType = searchParams.get('carType')
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    const radiusMiles = searchParams.get('radius')
      ? parseInt(searchParams.get('radius')!)
      : DEFAULT_RADIUS_MILES

    // ============================================================================
    // STEP 1: DETERMINE SEARCH LOCATION COORDINATES
    // ============================================================================
    
    let searchCoordinates: { latitude: number; longitude: number } | null = null
    
    // Try to find location in our Arizona locations data
    const locationData = getLocationByName(location)
    
    if (locationData) {
      searchCoordinates = {
        latitude: locationData.latitude,
        longitude: locationData.longitude
      }
    } else {
      // Fallback: Try to match city name from location string
      const cityName = location.split(',')[0].trim()
      const matchedLocation = ALL_ARIZONA_LOCATIONS.find(
        loc => loc.city.toLowerCase() === cityName.toLowerCase()
      )
      
      if (matchedLocation) {
        searchCoordinates = {
          latitude: matchedLocation.latitude,
          longitude: matchedLocation.longitude
        }
      } else {
        // Default to Phoenix center if no match
        searchCoordinates = {
          latitude: 33.4484,
          longitude: -112.0740
        }
      }
    }

    // ============================================================================
    // STEP 2: BUILD BASE QUERY WITH BOUNDING BOX PRE-FILTER
    // ============================================================================
    
    const whereClause: any = {
      isActive: true,
      // CRITICAL: Only show cars from APPROVED hosts
      host: {
        approvalStatus: 'APPROVED'
      }
    }

    // If exact city is specified, filter by city name (case-insensitive)
    if (exactCity) {
      whereClause.city = { equals: exactCity, mode: 'insensitive' }
    } else if (searchCoordinates) {
      // Use bounding box to pre-filter cars (optimization)
      const boundingBox = getBoundingBox(searchCoordinates, radiusMiles)

      whereClause.AND = [
        { latitude: { gte: boundingBox.minLat, lte: boundingBox.maxLat } },
        { longitude: { gte: boundingBox.minLng, lte: boundingBox.maxLng } }
      ]
    }

    // Add other filters
    if (instantBook) whereClause.instantBook = true
    if (carType && carType !== 'all') whereClause.carType = carType.toUpperCase()

    // Make filter (case-insensitive)
    const make = searchParams.get('make')
    if (make) {
      whereClause.make = { equals: make, mode: 'insensitive' }
    }

    if (priceMin || priceMax) {
      whereClause.dailyRate = {}
      if (priceMin) whereClause.dailyRate.gte = parseFloat(priceMin)
      if (priceMax) whereClause.dailyRate.lte = parseFloat(priceMax)
    }

    // ============================================================================
    // STEP 3: FETCH CARS WITH RELATED DATA
    // ============================================================================
    
    const cars = await prisma.rentalCar.findMany({
      where: whereClause,
      select: {
        // Essential fields
        id: true,
        make: true,
        model: true,
        year: true,
        carType: true,
        transmission: true,
        seats: true,
        dailyRate: true,
        weeklyRate: true,
        monthlyRate: true,
        weeklyDiscount: true,
        monthlyDiscount: true,
        features: true,
        rules: true,
        instantBook: true,
        mpgCity: true,
        mpgHighway: true,
        esgScore: true,        // ✅ ADDED FOR ECO ELITE BADGE
        fuelType: true,        // ✅ ADDED FOR EV BADGE DETECTION
        vehicleType: true,     // ✅ ADDED FOR RIDESHARE BADGE

        // Location
        address: true,
        city: true,
        state: true,
        zipCode: true,
        latitude: true,
        longitude: true,
        
        // Delivery options
        airportPickup: true,
        hotelDelivery: true,
        homeDelivery: true,
        deliveryFee: true,
        airportFee: true,
        hotelFee: true,
        homeFee: true,
        deliveryRadius: true,
        freeDeliveryRadius: true,
        
        // Requirements
        advanceNotice: true,
        minTripDuration: true,
        maxTripDuration: true,
        insuranceIncluded: true,
        insuranceDaily: true,
        
        // Stats
        rating: true,
        totalTrips: true,
        
        // Host - LIMITED PUBLIC FIELDS
        host: {
          select: {
            name: true,
            profilePhoto: true,
            responseRate: true,
            responseTime: true,
            isVerified: true
          }
        },
        
        // Photos
        photos: {
          select: {
            url: true,
            caption: true,
            order: true
          },
          orderBy: { order: 'asc' },
          take: 5
        },
        
        // Bookings - for availability check
        bookings: pickupDate && returnDate ? {
          where: {
            status: { notIn: ['CANCELLED', 'COMPLETED'] },
            OR: [
              {
                startDate: { lte: new Date(returnDate) },
                endDate: { gte: new Date(pickupDate) }
              }
            ]
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true
          }
        } : false,
        
        // Blocked dates - for availability check
        availability: pickupDate && returnDate ? {
          where: {
            date: {
              gte: new Date(pickupDate),
              lte: new Date(returnDate)
            },
            isAvailable: false
          },
          select: {
            date: true,
            isAvailable: true
          }
        } : false,
        
        // Count only
        _count: {
          select: {
            bookings: {
              where: {
                status: { in: ['COMPLETED', 'ACTIVE'] }
              }
            },
            reviews: {
              where: { isVisible: true }
            }
          }
        }
      }
    })

    // ============================================================================
    // STEP 4: FILTER BY RADIUS AND CHECK AVAILABILITY
    // ============================================================================
    
    const processedCars = cars
      .map(car => {
        // Calculate distance from search location
        if (!car.latitude || !car.longitude || !searchCoordinates) {
          return null
        }

        const distance = calculateDistance(
          searchCoordinates,
          { latitude: car.latitude, longitude: car.longitude }
        )

        // Filter by radius
        if (distance > radiusMiles) {
          return null
        }

        // Check availability if dates provided
        let availabilityInfo = null
        if (pickupDate && returnDate) {
          const bookingsData = car.bookings || []
          const blockedDatesData = (car.availability || []).map((avail: any) => ({
            id: car.id,
            carId: car.id,
            date: avail.date,
            isAvailable: avail.isAvailable
          }))

          availabilityInfo = checkAvailability(
            car.id,
            { startDate: pickupDate, endDate: returnDate },
            bookingsData as any,
            blockedDatesData
          )
        }

        return {
          car,
          distance,
          availabilityInfo
        }
      })
      .filter(Boolean) as Array<{ 
        car: any
        distance: number
        availabilityInfo: any
      }>

    // ============================================================================
    // STEP 5: SORT RESULTS
    // ============================================================================
    
    let sortedCars = [...processedCars]
    
    switch (sortBy) {
      case 'price_low':
        sortedCars.sort((a, b) => a.car.dailyRate - b.car.dailyRate)
        break
      case 'price_high':
        sortedCars.sort((a, b) => b.car.dailyRate - a.car.dailyRate)
        break
      case 'rating':
        sortedCars.sort((a, b) => (b.car.rating || 0) - (a.car.rating || 0))
        break
      case 'distance':
        sortedCars.sort((a, b) => a.distance - b.distance)
        break
      default: // recommended
        sortedCars.sort((a, b) => {
          // Prioritize: availability > rating > trips > distance
          if (a.availabilityInfo && b.availabilityInfo) {
            if (a.availabilityInfo.isFullyAvailable && !b.availabilityInfo.isFullyAvailable) return -1
            if (!a.availabilityInfo.isFullyAvailable && b.availabilityInfo.isFullyAvailable) return 1
          }
          
          const ratingDiff = (b.car.rating || 0) - (a.car.rating || 0)
          if (Math.abs(ratingDiff) > 0.5) return ratingDiff
          
          const tripsDiff = (b.car.totalTrips || 0) - (a.car.totalTrips || 0)
          if (tripsDiff !== 0) return tripsDiff
          
          return a.distance - b.distance
        })
        break
    }

    // ============================================================================
    // STEP 6: TRANSFORM RESULTS FOR RESPONSE
    // ============================================================================
    
    const transformedCars = sortedCars.map(({ car, distance, availabilityInfo }) => {
      // Parse features safely
      let parsedFeatures = []
      try {
        if (typeof car.features === 'string') {
          parsedFeatures = JSON.parse(car.features)
        } else if (Array.isArray(car.features)) {
          parsedFeatures = car.features
        }
      } catch (e) {
        parsedFeatures = []
      }

      // Parse rules safely
      let parsedRules = []
      try {
        if (typeof car.rules === 'string' && car.rules) {
          parsedRules = JSON.parse(car.rules)
        }
      } catch (e) {
        parsedRules = []
      }

      // Calculate pricing with city-specific tax
      const serviceFee = car.dailyRate * 0.15
      const { rate: taxRate } = getTaxRate(car.city || 'Phoenix')
      const taxAmount = Math.round((car.dailyRate + serviceFee) * taxRate * 100) / 100
      const totalDaily = car.dailyRate + serviceFee + taxAmount

      let totalPrice = totalDaily
      if (pickupDate && returnDate) {
        const days = Math.ceil(
          (new Date(returnDate).getTime() - new Date(pickupDate).getTime()) /
          (1000 * 60 * 60 * 24)
        )
        totalPrice = totalDaily * days
      }

      // Format rating
      const formattedRating = car.rating ? parseFloat(car.rating.toFixed(1)) : 5.0

      // Get actual trip count
      const actualTripCount = car.totalTrips ?? car._count.bookings ?? 0

      // Privacy-protected distance (never show < 1 mile)
      let displayDistance = distance
      if (distance < 1.0) {
        const seed = car.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
        const random = (seed % 9) / 10
        displayDistance = 1.1 + random
      }

      // Check if within free delivery radius
      const withinFreeDelivery = car.freeDeliveryRadius 
        ? distance <= car.freeDeliveryRadius 
        : false

      return {
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        type: car.carType,
        transmission: car.transmission,
        seats: car.seats,
        mpg: {
          city: car.mpgCity,
          highway: car.mpgHighway,
          combined: car.mpgCity && car.mpgHighway 
            ? Math.round((car.mpgCity + car.mpgHighway) / 2)
            : null
        },
        features: parsedFeatures.slice(0, 5),
        description: `${car.year} ${car.make} ${car.model}`,
        dailyRate: car.dailyRate,
        weeklyRate: car.weeklyRate,
        monthlyRate: car.monthlyRate,
        serviceFee,
        taxRate,
        taxAmount,
        totalDaily,
        totalPrice,
        instantBook: car.instantBook,
        esgScore: car.esgScore,     // ✅ PASS ESG SCORE TO FRONTEND
        fuelType: car.fuelType,     // ✅ PASS FUEL TYPE FOR EV DETECTION
        vehicleType: car.vehicleType || null,  // ✅ PASS VEHICLE TYPE FOR RIDESHARE BADGE
        location: {
          address: car.address,
          city: car.city,
          state: car.state,
          zip: car.zipCode,
          lat: car.latitude,
          lng: car.longitude,
          distance: parseFloat(displayDistance.toFixed(1)),
          distanceText: `${displayDistance.toFixed(1)} miles away`,
          airport: car.airportPickup,
          hotelDelivery: car.hotelDelivery,
          homeDelivery: car.homeDelivery,
          deliveryFees: {
            airport: car.airportFee || 0,
            hotel: car.hotelFee || 35,
            home: car.homeFee || 50,
            general: car.deliveryFee || 35
          },
          deliveryRadius: car.deliveryRadius || 10,
          freeDeliveryRadius: car.freeDeliveryRadius || 0,
          withinFreeDelivery
        },
        host: {
          name: car.host.name,
          avatar: car.host.profilePhoto || '/default-avatar.svg',
          verified: car.host.isVerified,
          responseRate: car.host.responseRate || 95,
          responseTime: car.host.responseTime || 60,
          totalTrips: actualTripCount
        },
        photos: car.photos.map((photo: any) => ({
          url: photo.url,
          alt: photo.caption || `${car.make} ${car.model}`
        })),
        rating: {
          average: formattedRating,
          count: car._count.reviews
        },
        trips: actualTripCount,
        totalTrips: actualTripCount,
        available: availabilityInfo ? !availabilityInfo.isCompletelyUnavailable : true,
        availability: availabilityInfo ? {
          isFullyAvailable: availabilityInfo.isFullyAvailable,
          isPartiallyAvailable: availabilityInfo.isPartiallyAvailable,
          isCompletelyUnavailable: availabilityInfo.isCompletelyUnavailable,
          availableDays: availabilityInfo.availableDays,
          unavailableDays: availabilityInfo.unavailableDays,
          totalDays: availabilityInfo.totalDays,
          label: availabilityInfo.isFullyAvailable 
            ? 'Available'
            : availabilityInfo.isCompletelyUnavailable
              ? 'Unavailable'
              : `${availabilityInfo.availableDays} of ${availabilityInfo.totalDays} days available`
        } : null,
        cancellationPolicy: 'MODERATE',
        requirements: {
          minAge: 21,
          license: '2+ years',
          deposit: 500,
          advanceNotice: car.advanceNotice || 2,
          minDuration: car.minTripDuration || 1,
          maxDuration: car.maxTripDuration || 30
        },
        rules: parsedRules.slice(0, 3),
        insurance: {
          included: car.insuranceIncluded,
          dailyRate: car.insuranceDaily || 25
        },
        discounts: {
          weekly: car.weeklyDiscount || 0.15,
          monthly: car.monthlyDiscount || 0.30
        }
      }
    })

    // ============================================================================
    // STEP 7: SEPARATE EXACT CITY vs NEARBY RESULTS
    // ============================================================================

    // Extract the searched city name for grouping
    const searchedCity = exactCity || location.split(',')[0].trim()

    // Separate cars into exact city match vs nearby
    const carsInCity = transformedCars.filter(car =>
      car.location?.city?.toLowerCase() === searchedCity.toLowerCase()
    )
    const nearbyCars = transformedCars.filter(car =>
      car.location?.city?.toLowerCase() !== searchedCity.toLowerCase()
    )

    // ============================================================================
    // STEP 8: RETURN RESPONSE WITH GROUPED RESULTS
    // ============================================================================

    return NextResponse.json({
      success: true,
      location,
      searchedCity,
      searchCoordinates,
      radiusMiles,
      dates: {
        pickup: pickupDate,
        return: returnDate,
        pickupTime,
        returnTime
      },
      filters: {
        sortBy,
        instantBook,
        carType,
        priceRange: {
          min: priceMin,
          max: priceMax
        }
      },
      // Grouped results for better UX
      carsInCity,
      nearbyCars,
      // Legacy flat results for backward compatibility
      results: transformedCars,
      total: transformedCars.length,
      metadata: {
        totalResults: transformedCars.length,
        inCityCount: carsInCity.length,
        nearbyCount: nearbyCars.length,
        fullyAvailable: transformedCars.filter(c => c.availability?.isFullyAvailable).length,
        partiallyAvailable: transformedCars.filter(c => c.availability?.isPartiallyAvailable).length,
        unavailable: transformedCars.filter(c => c.availability?.isCompletelyUnavailable).length,
        searchCoordinates,
        cached: false
      }
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to search cars',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}