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
        provider_type: 'traditional',
        isBookable: true,
        hostStatus: 'APPROVED',
        suspensionMessage: null
      })
    }

    // SECURE QUERY - USE SELECT NOT INCLUDE
    const car = await prisma.rentalCar.findUnique({
      where: { id: carId },
      select: {
        // Car details
        id: true,
        isActive: true,  // ADDED: Need this to determine bookability
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
        
        // Host - SECURED WITH ONLY PUBLIC FIELDS + APPROVAL STATUS
        host: {
          select: {
            id: true,
            name: true,
            approvalStatus: true,  // ADDED: Need this to check suspension
            profilePhoto: true,
            bio: true,
            responseTime: true,
            responseRate: true,
            acceptanceRate: true,
            totalTrips: true,
            rating: true,
            city: true,
            state: true,
            joinedAt: true,
            isVerified: true,
            verificationLevel: true,
            active: true,
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

    // SUSPENSION HANDLING - Check host status
    const hostStatus = car.host?.approvalStatus || 'APPROVED'
    const isHostActive = car.host?.active !== false
    const isCarActive = car.isActive !== false
    
    // Determine if car is bookable
    const isBookable = hostStatus === 'APPROVED' && isHostActive && isCarActive
    
    // Create appropriate suspension message
    let suspensionMessage: string | null = null
    if (!isBookable) {
      if (hostStatus === 'SUSPENDED') {
        suspensionMessage = 'This listing is temporarily unavailable. The host account is under review.'
      } else if (hostStatus === 'PENDING') {
        suspensionMessage = 'This listing is pending approval. Please check back later.'
      } else if (hostStatus === 'REJECTED') {
        suspensionMessage = 'This listing is no longer available.'
      } else if (!isHostActive) {
        suspensionMessage = 'This host is currently inactive. Browse similar cars in your area.'
      } else if (!isCarActive) {
        suspensionMessage = 'This vehicle is currently unavailable for booking.'
      }
    }

    // Calculate actual host trip count from visible reviews
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

    // Calculate host's actual average rating from all their visible reviews
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
      totalTrips: hostActualTripCount,
      rating: parseFloat(hostActualRating.toFixed(1)),
      hasVerifiedEmail: car.host?.isVerified || false,
      hasVerifiedPhone: car.host?.isVerified || false,
    } : null

    // Calculate average rating from reviews
    let averageRating: number
    
    if (car.reviews.length > 0) {
      const totalRating = car.reviews.reduce((sum, review) => sum + review.rating, 0)
      averageRating = totalRating / car.reviews.length
    } else {
      averageRating = car.rating || 0
    }
    
    const formattedRating = parseFloat(averageRating.toFixed(1))

    // Build response with suspension handling fields
    const response = {
      ...car,
      host: hostWithFlags,
      rating: formattedRating,
      totalTrips: car.totalTrips || 0,
      reviewCount: car._count.reviews,
      // SUSPENSION HANDLING FIELDS
      isBookable,
      hostStatus,
      suspensionMessage,
      isActive: car.isActive,  // Include car's active status
      _count: undefined // Remove internal structure
    }

    // Return car data even if suspended (no 404 for suspended hosts)
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error fetching car:', error)
    return NextResponse.json(
      { error: 'Failed to fetch car details' },
      { status: 500 }
    )
  }
}