// app/api/rentals/search/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

// Named export for GET method (required by Next.js 13+ App Router)
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

    // Build the where clause for Prisma
    const whereClause: any = {
      isActive: true,
      city: {
        contains: location.split(',')[0], // Extract city name
        mode: 'insensitive'
      }
    }

    // Add instant book filter
    if (instantBook) {
      whereClause.instantBook = true
    }

    // Add car type filter
    if (carType && carType !== 'all') {
      whereClause.carType = carType.toUpperCase() // Fixed: carType not type
    }

    // Add price range filter
    if (priceMin || priceMax) {
      whereClause.dailyRate = {}
      if (priceMin) whereClause.dailyRate.gte = parseFloat(priceMin)
      if (priceMax) whereClause.dailyRate.lte = parseFloat(priceMax)
    }

    // Add date availability filter if dates are provided
    if (pickupDate && returnDate) {
      const startDate = new Date(pickupDate)
      const endDate = new Date(returnDate)
      
      whereClause.bookings = {
        none: {
          OR: [
            {
              startDate: { lte: endDate },
              endDate: { gte: startDate }
            }
          ],
          status: {
            notIn: ['CANCELLED', 'COMPLETED']
          }
        }
      }
    }

    // Build the orderBy clause based on sortBy parameter
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
      case 'distance':
        // For distance sorting, we'd need to calculate based on coordinates
        // For now, use a default sort
        orderBy = { createdAt: 'desc' }
        break
      case 'recommended':
      default:
        // Recommended could be a combination of factors
        // Fixed: Removed 'featured' field that doesn't exist
        orderBy = [
          { rating: 'desc' },
          { totalTrips: 'desc' },
          { createdAt: 'desc' }
        ]
        break
    }

    // Fetch cars from database
    const cars = await prisma.rentalCar.findMany({
      where: whereClause,
      include: {
        host: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,  // Fixed: was 'avatar'
            isVerified: true,    // Fixed: was 'verified'
            responseRate: true,
            responseTime: true
          }
        },
        photos: {
          orderBy: { order: 'asc' },
          take: 5
        },
        reviews: {
          select: {
            rating: true
          }
        },
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      },
      orderBy,
      take: limit
    })

    // Transform the data for the frontend
    const transformedCars = cars.map(car => {
      // Calculate average rating
      const averageRating = car.reviews.length > 0
        ? car.reviews.reduce((sum, review) => sum + review.rating, 0) / car.reviews.length
        : 5.0

      // Calculate price with fees
      const serviceFee = car.dailyRate * 0.15
      const totalDaily = car.dailyRate + serviceFee

      // Calculate total price for the rental period
      let totalPrice = totalDaily
      if (pickupDate && returnDate) {
        const days = Math.ceil(
          (new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / 
          (1000 * 60 * 60 * 24)
        )
        totalPrice = totalDaily * days
      }

      // Parse features if it's a string (JSON)
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

      // Parse rules if it's a string (JSON)
      let parsedRules = []
      try {
        if (typeof car.rules === 'string' && car.rules) {
          parsedRules = JSON.parse(car.rules)
        }
      } catch (e) {
        parsedRules = []
      }

      return {
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        type: car.carType,  // Fixed: using carType from schema
        transmission: car.transmission,
        seats: car.seats,
        mpg: {
          city: car.mpgCity,
          highway: car.mpgHighway,
          combined: car.mpgCity && car.mpgHighway 
            ? Math.round((car.mpgCity + car.mpgHighway) / 2)
            : null
        },
        features: parsedFeatures,
        description: `${car.year} ${car.make} ${car.model} - ${car.carType}`, // Generated description
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
          zip: car.zipCode,  // Fixed: was 'zip'
          lat: car.latitude,
          lng: car.longitude,
          airport: car.airportPickup,
          hotelDelivery: car.hotelDelivery,
          homeDelivery: car.homeDelivery
        },
        host: {
          id: car.host.id,
          name: car.host.name,
          avatar: car.host.profilePhoto || '/default-avatar.png',  // Fixed: was avatar
          verified: car.host.isVerified,  // Fixed: was verified
          responseRate: car.host.responseRate,
          responseTime: car.host.responseTime,
          totalTrips: car._count.bookings
        },
        photos: car.photos.map(photo => ({
          id: photo.id,
          url: photo.url,
          alt: photo.caption || `${car.make} ${car.model}`
        })),
        rating: {
          average: averageRating,
          count: car._count.reviews
        },
        trips: car._count.bookings,
        available: true, // Since we filtered by availability
        cancellationPolicy: 'MODERATE', // Default policy
        requirements: {
          minAge: 21,
          license: '2+ years',
          deposit: car.depositAmount || 500,
          advanceNotice: car.advanceNotice || 2,
          minDuration: car.minTripDuration || 1,
          maxDuration: car.maxTripDuration || 30
        },
        rules: parsedRules,
        insurance: {
          included: car.insuranceIncluded,
          dailyRate: car.insuranceDaily
        },
        discounts: {
          weekly: car.weeklyDiscount,
          monthly: car.monthlyDiscount
        }
      }
    })

    // Also fetch from Amadeus if needed (for traditional rentals)
    let amadeusResults: any[] = []
    if (process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET) {
      try {
        // Check if we have cached Amadeus results first
        const cacheKey = `${location}_${pickupDate}_${returnDate}`
        const cachedResults = await prisma.amadeusCarCache.findFirst({
          where: {
            location: location,
            searchDate: {
              gte: new Date(Date.now() - 3600000) // Cache for 1 hour
            }
          }
        })

        if (cachedResults && cachedResults.carData) {
          // Parse cached data
          try {
            const cachedData = JSON.parse(cachedResults.carData)
            amadeusResults = cachedData.slice(0, 5) // Limit Amadeus results
          } catch (e) {
            console.error('Error parsing cached Amadeus data:', e)
          }
        } else {
          // For now, return mock Amadeus data
          // In production, make actual API call to Amadeus
          amadeusResults = [
            {
              id: 'amadeus-1',
              provider: 'Enterprise',
              make: 'Toyota',
              model: 'Camry',
              year: 2024,
              type: 'SEDAN',
              transmission: 'AUTOMATIC',
              seats: 5,
              mpg: {
                city: 28,
                highway: 36,
                combined: 32
              },
              features: ['Bluetooth', 'Backup Camera', 'Cruise Control'],
              dailyRate: 65,
              totalDaily: 74.75,
              location: {
                address: 'Phoenix Sky Harbor Airport',
                city: 'Phoenix',
                state: 'AZ',
                airport: true
              },
              photos: [
                { url: 'https://via.placeholder.com/400x300?text=Toyota+Camry', alt: 'Toyota Camry' }
              ],
              rating: { average: 4.5, count: 234 },
              available: true,
              provider_type: 'traditional'
            },
            {
              id: 'amadeus-2',
              provider: 'Hertz',
              make: 'Nissan',
              model: 'Altima',
              year: 2024,
              type: 'SEDAN',
              transmission: 'AUTOMATIC',
              seats: 5,
              mpg: {
                city: 27,
                highway: 38,
                combined: 32
              },
              features: ['Apple CarPlay', 'Android Auto', 'Lane Assist'],
              dailyRate: 58,
              totalDaily: 66.70,
              location: {
                address: 'Phoenix Sky Harbor Airport',
                city: 'Phoenix',
                state: 'AZ',
                airport: true
              },
              photos: [
                { url: 'https://via.placeholder.com/400x300?text=Nissan+Altima', alt: 'Nissan Altima' }
              ],
              rating: { average: 4.3, count: 189 },
              available: true,
              provider_type: 'traditional'
            }
          ]

          // Cache the results for future use
          if (amadeusResults.length > 0) {
            try {
              await prisma.amadeusCarCache.create({
                data: {
                  location: location,
                  searchDate: new Date(),
                  carData: JSON.stringify(amadeusResults),
                  expiresAt: new Date(Date.now() + 3600000) // Expire in 1 hour
                }
              })
            } catch (cacheError) {
              console.error('Error caching Amadeus results:', cacheError)
            }
          }
        }
      } catch (error) {
        console.error('Amadeus API error:', error)
      }
    }

    // Combine results
    const allResults = [
      ...transformedCars,
      ...amadeusResults
    ]

    // Return the response
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
      results: allResults,
      total: allResults.length,
      page: 1,
      limit,
      metadata: {
        p2pCount: transformedCars.length,
        traditionalCount: amadeusResults.length,
        cached: false
      }
    })

  } catch (error) {
    console.error('Search API error:', error)
    
    // Return error response
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

// Named export for POST method (if needed for advanced search)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Use the same logic as GET but with body parameters
    // This allows for more complex search queries
    
    return NextResponse.json({
      success: true,
      message: 'Advanced search endpoint',
      body
    })
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Invalid request body'
      },
      { status: 400 }
    )
  }
}