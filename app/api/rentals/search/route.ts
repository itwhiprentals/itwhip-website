// app/api/rentals/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract search parameters
    const location = searchParams.get('location') || 'Phoenix, AZ'
    const pickupDate = searchParams.get('pickupDate')
    const returnDate = searchParams.get('returnDate')
    const pickupTime = searchParams.get('pickupTime') || '10:00'
    const returnTime = searchParams.get('returnTime') || '10:00'
    const sortBy = searchParams.get('sortBy') || 'recommended'
    const limit = parseInt(searchParams.get('limit') || '20')
    const instantBook = searchParams.get('instantBook') === 'true'
    const carType = searchParams.get('carType')
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')

    // Build where clause - UPDATED TO ALLOW ALL CITIES
    const whereClause: any = {
      isActive: true
    }

    // REMOVED CITY RESTRICTIONS - Now searches all active cars regardless of city
    // If you want to filter by a specific location, you can still do it
    const locationCity = location.split(',')[0].toLowerCase()
    if (locationCity && locationCity !== 'all') {
      // Optional: If a specific city is provided, filter by it
      // But for now, we're showing all cars from all cities
      // You can uncomment the line below to enable city-specific filtering
      // whereClause.city = { contains: locationCity, mode: 'insensitive' }
    }

    if (instantBook) whereClause.instantBook = true
    if (carType && carType !== 'all') whereClause.carType = carType.toUpperCase()
    
    if (priceMin || priceMax) {
      whereClause.dailyRate = {}
      if (priceMin) whereClause.dailyRate.gte = parseFloat(priceMin)
      if (priceMax) whereClause.dailyRate.lte = parseFloat(priceMax)
    }

    if (pickupDate && returnDate) {
      const startDate = new Date(pickupDate)
      const endDate = new Date(returnDate)
      
      whereClause.bookings = {
        none: {
          OR: [{
            startDate: { lte: endDate },
            endDate: { gte: startDate }
          }],
          status: { notIn: ['CANCELLED', 'COMPLETED'] }
        }
      }
    }

    // Build orderBy
    let orderBy: any = {}
    switch (sortBy) {
      case 'price_low':
        orderBy = { dailyRate: 'asc' }
        break
      case 'price_high':
        orderBy = { dailyRate: 'desc' }
        break
      case 'rating':
        orderBy = { rating: 'desc' }
        break
      default:
        orderBy = [
          { rating: 'desc' },
          { totalTrips: 'desc' },
          { createdAt: 'desc' }
        ]
        break
    }

    // SECURE QUERY - USE SELECT, NOT INCLUDE
    const cars = await prisma.rentalCar.findMany({
      where: whereClause,
      select: {
        // Essential fields only
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
        
        // Requirements
        advanceNotice: true,
        minTripDuration: true,
        maxTripDuration: true,
        insuranceIncluded: true,
        insuranceDaily: true,
        
        // Stats - FIXED: Use totalTrips from database
        rating: true,
        totalTrips: true,  // This is the actual trip count stored in the database
        
        // Host - LIMITED PUBLIC FIELDS (REMOVED ID)
        host: {
          select: {
            // id: true, // REMOVED - Internal ID not needed
            name: true,
            profilePhoto: true,
            responseRate: true,
            responseTime: true,
            isVerified: true
          }
        },
        
        // Photos - LIMITED (REMOVED ID)
        photos: {
          select: {
            // id: true, // REMOVED - Internal ID not needed
            url: true,
            caption: true,
            order: true
          },
          orderBy: { order: 'asc' },
          take: 5
        },
        
        // Count only - FIXED: Count only COMPLETED and ACTIVE bookings
        _count: {
          select: {
            bookings: {
              where: {
                status: {
                  in: ['COMPLETED', 'ACTIVE']  // Only count real trips, not cancelled or pending
                }
              }
            },
            reviews: {
              where: { isVisible: true }
            }
          }
        }
      },
      orderBy,
      take: limit
    })

    // Transform cars with clean data
    const transformedCars = cars.map(car => {
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

      // Calculate pricing
      const serviceFee = car.dailyRate * 0.15
      const totalDaily = car.dailyRate + serviceFee
      
      let totalPrice = totalDaily
      if (pickupDate && returnDate) {
        const days = Math.ceil(
          (new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / 
          (1000 * 60 * 60 * 24)
        )
        totalPrice = totalDaily * days
      }

      // FIXED: Format rating to 1 decimal place
      const formattedRating = car.rating ? parseFloat(car.rating.toFixed(1)) : 5.0

      // FIXED: Use nullish coalescing to properly handle 0 values
      // Now if totalTrips is 0, it will use 0 instead of falling through
      const actualTripCount = car.totalTrips ?? car._count.bookings ?? 0

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
        totalDaily,
        totalPrice,
        instantBook: car.instantBook,
        location: {
          address: car.address,
          city: car.city,
          state: car.state,
          zip: car.zipCode,
          lat: car.latitude,
          lng: car.longitude,
          airport: car.airportPickup,
          hotelDelivery: car.hotelDelivery,
          homeDelivery: car.homeDelivery
        },
        host: {
          // id: car.host.id, // REMOVED - Not exposing internal host ID
          name: car.host.name,
          avatar: car.host.profilePhoto || '/default-avatar.png',
          verified: car.host.isVerified,
          responseRate: car.host.responseRate || 95,
          responseTime: car.host.responseTime || 60,
          totalTrips: actualTripCount  // FIXED: Use actual trip count here too
        },
        photos: car.photos.map(photo => ({
          // id: photo.id, // REMOVED - Not exposing internal photo ID
          url: photo.url,
          alt: photo.caption || `${car.make} ${car.model}`
        })),
        rating: {
          average: formattedRating,  // FIXED: Use formatted rating
          count: car._count.reviews
        },
        // FIXED: Provide both field names for compatibility
        trips: actualTripCount,        // For frontend compatibility
        totalTrips: actualTripCount,   // Alternative field name
        available: true,
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

    return NextResponse.json({
      success: true,
      location,
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
      results: transformedCars,
      total: transformedCars.length,
      page: 1,
      limit,
      metadata: {
        // REMOVED p2pCount and traditionalCount - These expose internal categorization
        totalResults: transformedCars.length,  // Generic count instead
        cached: false
      }
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to search cars'
      },
      { status: 500 }
    )
  }
}