// app/api/rentals/cars/[carId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ carId: string }> }
) {
  try {
    const { carId } = await params

    // Handle Amadeus mock data
    if (carId.startsWith('amadeus-')) {
      return NextResponse.json({
        id: carId,
        provider: 'Enterprise',
        make: 'Toyota',
        model: 'Camry',
        year: 2024,
        type: 'SEDAN',
        transmission: 'AUTOMATIC',
        seats: 5,
        dailyRate: 65,
        features: ['Bluetooth', 'Backup Camera'],
        photos: [{
          url: 'https://via.placeholder.com/600x400?text=Toyota+Camry',
          caption: 'Toyota Camry'
        }],
        location: {
          address: 'Phoenix Sky Harbor Airport',
          city: 'Phoenix',
          state: 'AZ'
        },
        city: 'Phoenix',
        state: 'AZ',
        provider_type: 'traditional'
      })
    }

    // SECURE QUERY - USE SELECT NOT INCLUDE
    const car = await prisma.rentalCar.findUnique({
      where: { id: carId },
      select: {
        // Car details
        id: true,
        // REMOVED: hostId - internal ID should not be exposed
        make: true,
        model: true,
        year: true,
        trim: true,
        color: true,
        carType: true,
        transmission: true,
        fuelType: true,
        seats: true,
        doors: true,
        
        // Pricing
        dailyRate: true,
        weeklyRate: true,
        monthlyRate: true,
        deliveryFee: true,
        weeklyDiscount: true,
        monthlyDiscount: true,
        
        // NEW DELIVERY FEE FIELDS
        airportFee: true,
        hotelFee: true,
        homeFee: true,
        deliveryRadius: true,
        freeDeliveryRadius: true,
        
        // NEW MILEAGE SETTINGS
        mileageDaily: true,
        mileageWeekly: true,
        mileageMonthly: true,
        mileageOverageFee: true,
        
        // NEW TRIP POLICY FIELDS
        bufferTime: true,
        cancellationPolicy: true,
        checkInTime: true,
        checkOutTime: true,
        
        // Location
        address: true,
        city: true,
        state: true,
        zipCode: true,
        latitude: true,
        longitude: true,
        
        // Features & Policies
        features: true,
        rules: true,
        mpgCity: true,
        mpgHighway: true,
        currentMileage: true,
        
        // Availability
        instantBook: true,
        advanceNotice: true,
        minTripDuration: true,
        maxTripDuration: true,
        
        // Delivery options
        airportPickup: true,
        hotelDelivery: true,
        homeDelivery: true,
        insuranceIncluded: true,
        insuranceDaily: true,
        
        // Stats
        totalTrips: true,
        rating: true,
        
        // Host - SECURED WITH ONLY PUBLIC FIELDS
        host: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            bio: true,
            responseTime: true,
            responseRate: true,
            acceptanceRate: true,
            totalTrips: true,  // We'll override this with actual count
            rating: true,
            city: true,
            state: true,
            joinedAt: true,
            isVerified: true,
            verificationLevel: true,    // For verification badges
            // REMOVED: email - privacy concern
            // REMOVED: phone - privacy concern
            // REMOVED: zipCode - too specific
            active: true,               // Host status
            // REMOVED: verifiedAt - exact timestamp reveals patterns
            // REMOVED: createdAt - exact timestamp reveals patterns
          }
        },
        
        // Photos
        photos: {
          select: {
            id: true,
            url: true,
            caption: true,
            order: true,
            isHero: true
          },
          orderBy: { order: 'asc' }
        },
        
        // Reviews - FILTERED AND WITHOUT SOURCE
        reviews: {
          where: { 
            isVisible: true
          },
          select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
            tripStartDate: true,
            tripEndDate: true,
            createdAt: true,
            isPinned: true,
            isVerified: true,
            helpfulCount: true,
            hostResponse: true,
            hostRespondedAt: true,
            supportResponse: true,
            supportRespondedAt: true,
            // NO source field - this is key!
            
            reviewerProfile: {
              select: {
                id: true,
                name: true,
                profilePhotoUrl: true,
                city: true,
                state: true,
                memberSince: true,
                tripCount: true,
                reviewCount: true,
                isVerified: true
              }
            }
          },
          orderBy: [
            { isPinned: 'desc' },
            { helpfulCount: 'desc' },
            { createdAt: 'desc' }
          ],
          take: 100 // Limit reviews
        },
        
        // Counts
        _count: {
          select: {
            bookings: true,
            reviews: {
              where: { isVisible: true }
            }
          }
        }
      }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    // FIXED: Calculate actual host trip count from visible reviews
    let hostActualTripCount = 0
    if (car.host) {
      const hostReviewCount = await prisma.rentalReview.count({
        where: {
          hostId: car.host.id,
          isVisible: true,
          car: {
            isActive: true
          }
        }
      })
      hostActualTripCount = hostReviewCount
    }

    // FIXED: Calculate host's actual average rating from all their visible reviews
    let hostActualRating = car.host?.rating || 0
    if (car.host) {
      const hostReviews = await prisma.rentalReview.findMany({
        where: {
          hostId: car.host.id,
          isVisible: true,
          car: {
            isActive: true
          }
        },
        select: { rating: true }
      })
      
      if (hostReviews.length > 0) {
        const totalRating = hostReviews.reduce((sum, review) => sum + review.rating, 0)
        hostActualRating = totalRating / hostReviews.length
      }
    }

    // Add computed host verification flags for frontend
    const hostWithFlags = car.host ? {
      ...car.host,
      totalTrips: hostActualTripCount,  // FIXED: Use actual count instead of stored value
      rating: parseFloat(hostActualRating.toFixed(1)),  // FIXED: Use calculated rating
      // Add boolean flags for email/phone verification without exposing actual data
      hasVerifiedEmail: car.host?.isVerified || false,  // Generic verification status
      hasVerifiedPhone: car.host?.isVerified || false,  // Generic verification status
    } : null

    // Calculate average rating from reviews if they exist, otherwise use car's rating
    let averageRating: number
    
    if (car.reviews.length > 0) {
      const totalRating = car.reviews.reduce((sum, review) => sum + review.rating, 0)
      averageRating = totalRating / car.reviews.length
    } else {
      averageRating = car.rating || 0
    }
    
    // FIXED: Always format rating to 1 decimal place
    const formattedRating = parseFloat(averageRating.toFixed(1))

    // Build response - FIXED: Use car.totalTrips from database, not booking count
    const response = {
      ...car,
      host: hostWithFlags,  // Use the modified host object with actual counts
      rating: formattedRating,  // Always formatted to 1 decimal
      totalTrips: car.totalTrips || 0,  // Use actual totalTrips from database
      reviewCount: car._count.reviews,
      _count: undefined // Remove internal structure
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error fetching car:', error)
    return NextResponse.json(
      { error: 'Failed to fetch car details' },
      { status: 500 }
    )
  }
}