// app/api/rentals/similar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/app/lib/database/prisma"

// Using shared prisma instance

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const exclude = searchParams.get('exclude')
    const excludeHost = searchParams.get('excludeHost')
    const city = searchParams.get('city')
    const carType = searchParams.get('carType')
    const limit = parseInt(searchParams.get('limit') || '8')

    console.log('Searching for similar cars:', { exclude, excludeHost, city, carType })

    // Build where clause - CRITICAL: Only show active cars from APPROVED hosts
    const where: any = {
      isActive: true,
      host: {
        approvalStatus: 'APPROVED'
      }
    }

    // Exclude current car
    if (exclude) {
      where.id = { not: exclude }
    }

    // IMPORTANT: Exclude all cars from the specified host
    if (excludeHost) {
      where.hostId = { not: excludeHost }
    }

    // First, get cars with the exclusions applied
    const availableCars = await prisma.rentalCar.findMany({
      where: where,
      take: 50, // Get more cars to work with
      include: {
        photos: {
          orderBy: { order: 'asc' },
          take: 1
        },
        host: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            approvalStatus: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      }
    })

    console.log(`Found ${availableCars.length} cars after exclusions`)

    // Get the current car's details for better matching
    let currentCar = null
    if (exclude) {
      currentCar = await prisma.rentalCar.findUnique({
        where: { id: exclude },
        include: {
          host: true
        }
      })
    }

    // Score and filter cars based on similarity (but NOT same host)
    const scoredCars = availableCars.map(car => {
      let score = 0
      
      // REMOVED: Same host bonus - we want to exclude same host cars
      
      // Same make gets high score
      if (currentCar && car.make === currentCar.make) {
        score += 40
      }
      
      // Same model gets even higher score
      if (currentCar && car.model === currentCar.model) {
        score += 30
      }
      
      // Similar year (within 2 years)
      if (currentCar && Math.abs(car.year - currentCar.year) <= 2) {
        score += 20
      }
      
      // Same car type
      if (carType && car.carType === carType) {
        score += 15
      }
      
      // Same city (preferred but not required)
      if (city && car.city === city) {
        score += 10
      }
      
      // Nearby cities in Phoenix area
      const phoenixAreaCities = ['Phoenix', 'Scottsdale', 'Tempe', 'Mesa', 'Chandler', 'Gilbert', 'Glendale', 'Cave Creek', 'Paradise Valley']
      if (city && phoenixAreaCities.includes(city) && phoenixAreaCities.includes(car.city)) {
        score += 5
      }
      
      // Price similarity (within 20% range)
      if (currentCar && currentCar.dailyRate && car.dailyRate) {
        const currentPrice = typeof currentCar.dailyRate === 'object' 
          ? parseFloat(currentCar.dailyRate.toString()) 
          : parseFloat(currentCar.dailyRate as any)
        const carPrice = typeof car.dailyRate === 'object'
          ? parseFloat(car.dailyRate.toString())
          : parseFloat(car.dailyRate as any)
        
        const priceDiff = Math.abs(carPrice - currentPrice)
        const pricePercent = priceDiff / currentPrice
        
        if (pricePercent <= 0.1) {
          score += 25 // Within 10%
        } else if (pricePercent <= 0.2) {
          score += 15 // Within 20%
        } else if (pricePercent <= 0.3) {
          score += 5 // Within 30%
        }
      }
      
      // Instant book match
      if (currentCar && car.instantBook === currentCar.instantBook) {
        score += 5
      }
      
      // Similar number of seats
      if (currentCar && car.seats === currentCar.seats) {
        score += 10
      }
      
      return { ...car, similarityScore: score }
    })

    // Sort by score and filter out low scores
    const similarCars = scoredCars
      .filter(car => car.similarityScore > 0) // Must have some similarity
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit)

    console.log(`Returning ${similarCars.length} similar cars from different hosts`)

    // Transform data for frontend
    const transformedCars = similarCars.map(car => {
      // Calculate average rating
      const ratings = car.reviews.map(r => r.rating)
      const avgRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0

      return {
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        dailyRate: car.dailyRate,
        carType: car.carType,
        city: car.city,
        state: car.state,
        rating: avgRating,
        totalTrips: car.reviews.length,
        instantBook: car.instantBook,
        photos: car.photos.map(p => ({
          url: p.url,
          isHero: p.isHero
        })),
        features: car.features,
        seats: car.seats,
        transmission: car.transmission,
        location: {
          lat: car.latitude,
          lng: car.longitude,
          address: car.address
        },
        host: car.host,
        hostId: car.hostId, // Include hostId for debugging
        similarityScore: car.similarityScore
      }
    })

    return NextResponse.json(transformedCars)
  } catch (error) {
    console.error('Error fetching similar cars:', error)
    return NextResponse.json(
      { error: 'Failed to fetch similar cars' },
      { status: 500 }
    )
  }
}