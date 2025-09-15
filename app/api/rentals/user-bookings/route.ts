// File: app/api/rentals/user-bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyJWT } from '@/lib/auth/jwt'
import type { RentalBookingStatus } from '@/app/lib/dal/types'

// GET /api/rentals/user-bookings - Get user's rental bookings
export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookies or header
    const accessTokenCookie = request.cookies.get('accessToken')?.value
    const refreshTokenCookie = request.cookies.get('refreshToken')?.value
    const authHeader = request.headers.get('authorization')?.replace('Bearer ', '')
    
    // Try access token first
    const token = accessTokenCookie || authHeader
    
    let userEmail = null
    let userId = null
    
    if (token) {
      try {
        const payload = await verifyJWT(token)
        if (payload?.userId) {
          // Get user details to find email
          const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, email: true }
          })
          if (user) {
            userId = user.id
            userEmail = user.email
            console.log('Authenticated user:', userEmail)
          }
        }
      } catch (error) {
        console.log('Access token expired or invalid:', error)
        
        // Try refresh token if access token failed
        if (refreshTokenCookie) {
          try {
            // You would implement refresh token logic here
            // For now, we'll just log it
            console.log('Would refresh token here')
          } catch (refreshError) {
            console.log('Refresh token also failed')
          }
        }
      }
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as RentalBookingStatus | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const bookingId = searchParams.get('bookingId')
    const guestEmail = searchParams.get('guestEmail')

    // Build where clause
    let whereClause: any = {}

    // If specific booking ID is requested
    if (bookingId) {
      whereClause = { id: bookingId }
    } 
    // If guest email is provided in query (for guest access)
    else if (guestEmail) {
      whereClause = { guestEmail: guestEmail }
    }
    // If authenticated user
    else if (userId || userEmail) {
      const orConditions = []
      if (userId) {
        orConditions.push({ renterId: userId })
      }
      if (userEmail) {
        orConditions.push({ guestEmail: userEmail })
      }
      whereClause = { OR: orConditions }
    }
    // No authentication - try to be helpful for testing
    else {
      console.log('No authentication found, returning recent bookings for testing')
      // In production, you'd return empty array
      // For development/testing, return recent bookings
      if (process.env.NODE_ENV === 'development') {
        // Return recent bookings for testing
        whereClause = {} // This will return all bookings
      } else {
        // Production: return empty if not authenticated
        return NextResponse.json({
          success: true,
          bookings: [],
          stats: {
            total: 0,
            upcoming: 0,
            active: 0,
            completed: 0,
            cancelled: 0
          },
          pagination: {
            page: 1,
            limit: 10,
            totalPages: 0,
            totalCount: 0,
            hasMore: false
          }
        })
      }
    }

    // Add status filter if provided
    if (status) {
      whereClause.status = status
    }

    console.log('Fetching bookings with where clause:', JSON.stringify(whereClause))

    // SECURE QUERY - USE SELECT NOT INCLUDE
    const [bookings, totalCount] = await Promise.all([
      prisma.rentalBooking.findMany({
        where: whereClause,
        select: {
          // Booking fields
          id: true,
          bookingCode: true,
          status: true,
          verificationStatus: true,
          tripStatus: true,
          
          // Dates
          startDate: true,
          endDate: true,
          startTime: true,
          endTime: true,
          numberOfDays: true,
          createdAt: true,
          updatedAt: true,
          
          // Guest info
          guestName: true,
          guestEmail: true,
          guestPhone: true,
          renterId: true,
          
          // Trip details
          tripStartedAt: true,
          tripEndedAt: true,
          startMileage: true,
          endMileage: true,
          fuelLevelStart: true,
          fuelLevelEnd: true,
          actualStartTime: true,
          actualEndTime: true,
          inspectionPhotosStart: true,
          inspectionPhotosEnd: true,
          
          // Pickup window
          pickupWindowStart: true,
          pickupWindowEnd: true,
          pickupLatitude: true,
          pickupLongitude: true,
          returnLatitude: true,
          returnLongitude: true,
          pickupLocationVerified: true,
          partnerLocationId: true,
          
          // Location
          pickupLocation: true,
          pickupType: true,
          deliveryAddress: true,
          returnLocation: true,
          
          // Verification
          documentsSubmittedAt: true,
          reviewedAt: true,
          licenseVerified: true,
          selfieVerified: true,
          licensePhotoUrl: true,
          insurancePhotoUrl: true,
          selfiePhotoUrl: true,
          
          // Pricing
          dailyRate: true,
          subtotal: true,
          deliveryFee: true,
          insuranceFee: true,
          serviceFee: true,
          taxes: true,
          totalAmount: true,
          depositAmount: true,
          
          // Payment
          paymentStatus: true,
          paymentIntentId: true,
          stripeCustomerId: true,
          stripePaymentMethodId: true,
          
          // GUEST ACCESS TOKENS - NEW ADDITION
          guestAccessTokens: {
            select: {
              token: true,
              expiresAt: true
            },
            where: {
              expiresAt: { gte: new Date() }
            },
            take: 1,
            orderBy: {
              createdAt: 'desc'
            }
          },
          
          // Car - LIMITED FIELDS
          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              carType: true,
              transmission: true,
              seats: true,
              city: true,
              state: true,
              photos: {
                select: {
                  id: true,
                  url: true,
                  caption: true,
                  order: true
                },
                orderBy: { order: 'asc' },
                take: 5
              }
            }
          },
          
          // Host - LIMITED FIELDS
          host: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              profilePhoto: true,
              rating: true,
              responseTime: true,
              isVerified: true
            }
          },
          
          // Review - check if exists
          review: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true
            }
          },
          
          // Messages count
          messages: {
            where: { isRead: false },
            select: { id: true }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.rentalBooking.count({ where: whereClause })
    ])

    console.log(`Found ${bookings.length} bookings for query`)

    // Transform bookings to match expected format
    const transformedBookings = bookings.map(booking => {
      // Determine booking state based on dates and status
      const now = new Date()
      let bookingState: string
      
      if (booking.status === 'CANCELLED') {
        bookingState = 'CANCELLED'
      } else if (booking.status === 'COMPLETED') {
        bookingState = 'COMPLETED'
      } else if (booking.startDate > now) {
        bookingState = 'UPCOMING'
      } else if (booking.endDate < now) {
        bookingState = 'COMPLETED'
      } else {
        bookingState = 'ACTIVE'
      }

      return {
        id: booking.id,
        bookingCode: booking.bookingCode,
        status: booking.status,
        bookingState,
        verificationStatus: booking.verificationStatus,
        
        // GUEST TOKEN - NEW ADDITION
        guestToken: booking.guestAccessTokens?.[0]?.token || null,
        
        // TRIP FIELDS
        tripStatus: booking.tripStatus,
        tripStartedAt: booking.tripStartedAt,
        tripEndedAt: booking.tripEndedAt,
        startMileage: booking.startMileage,
        endMileage: booking.endMileage,
        fuelLevelStart: booking.fuelLevelStart,
        fuelLevelEnd: booking.fuelLevelEnd,
        actualStartTime: booking.actualStartTime,
        actualEndTime: booking.actualEndTime,
        inspectionPhotosStart: booking.inspectionPhotosStart,
        inspectionPhotosEnd: booking.inspectionPhotosEnd,
        
        // PICKUP WINDOW FIELDS
        pickupWindowStart: booking.pickupWindowStart,
        pickupWindowEnd: booking.pickupWindowEnd,
        pickupLatitude: booking.pickupLatitude,
        pickupLongitude: booking.pickupLongitude,
        returnLatitude: booking.returnLatitude,
        returnLongitude: booking.returnLongitude,
        pickupLocationVerified: booking.pickupLocationVerified,
        partnerLocationId: booking.partnerLocationId,
        
        // Documents and verification
        documentsSubmittedAt: booking.documentsSubmittedAt,
        reviewedAt: booking.reviewedAt,
        licenseVerified: booking.licenseVerified,
        selfieVerified: booking.selfieVerified,
        licensePhotoUrl: booking.licensePhotoUrl,
        insurancePhotoUrl: booking.insurancePhotoUrl,
        selfiePhotoUrl: booking.selfiePhotoUrl,
        
        car: {
          id: booking.car.id,
          make: booking.car.make,
          model: booking.car.model,
          year: booking.car.year,
          type: booking.car.carType,
          transmission: booking.car.transmission,
          seats: booking.car.seats,
          photos: booking.car.photos.map(photo => ({
            id: photo.id,
            url: photo.url,
            caption: photo.caption
          })),
          location: `${booking.car.city}, ${booking.car.state}`
        },
        
        host: {
          id: booking.host.id,
          name: booking.host.name,
          email: booking.host.email,
          phone: booking.host.phone,
          profilePhoto: booking.host.profilePhoto,
          rating: booking.host.rating,
          responseTime: booking.host.responseTime,
          isVerified: booking.host.isVerified
        },
        
        // Guest information
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        
        startDate: booking.startDate,
        endDate: booking.endDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        numberOfDays: booking.numberOfDays,
        
        pickupLocation: booking.pickupLocation,
        pickupType: booking.pickupType,
        deliveryAddress: booking.deliveryAddress,
        returnLocation: booking.returnLocation || booking.pickupLocation,
        
        dailyRate: booking.dailyRate,
        subtotal: booking.subtotal,
        deliveryFee: booking.deliveryFee,
        insuranceFee: booking.insuranceFee,
        serviceFee: booking.serviceFee,
        taxes: booking.taxes,
        totalAmount: booking.totalAmount,
        depositAmount: booking.depositAmount,
        
        paymentStatus: booking.paymentStatus,
        paymentIntentId: booking.paymentIntentId,
        stripeCustomerId: booking.stripeCustomerId,
        stripePaymentMethodId: booking.stripePaymentMethodId,
        
        hasReview: booking.review !== null,
        review: booking.review || null,
        
        hasUnreadMessages: booking.messages.length > 0,
        latestMessage: null, // Would need separate query for this
        
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      }
    })

    // Calculate stats - only for authenticated users
    let stats = {
      total: totalCount,
      upcoming: 0,
      active: 0,
      completed: 0,
      cancelled: 0
    }

    if (userId || userEmail) {
      stats = {
        total: totalCount,
        upcoming: await prisma.rentalBooking.count({
          where: {
            ...whereClause,
            status: { notIn: ['CANCELLED', 'COMPLETED'] },
            startDate: { gt: new Date() }
          }
        }),
        active: await prisma.rentalBooking.count({
          where: {
            ...whereClause,
            status: 'ACTIVE',
            startDate: { lte: new Date() },
            endDate: { gte: new Date() }
          }
        }),
        completed: await prisma.rentalBooking.count({
          where: {
            ...whereClause,
            status: 'COMPLETED'
          }
        }),
        cancelled: await prisma.rentalBooking.count({
          where: {
            ...whereClause,
            status: 'CANCELLED'
          }
        })
      }
    }

    // Pagination info
    const pagination = {
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasMore: page * limit < totalCount
    }

    return NextResponse.json({
      success: true,
      bookings: transformedBookings,
      stats,
      pagination
    })

  } catch (error) {
    console.error('Error fetching user bookings:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch bookings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/rentals/user-bookings/cancel - Cancel a booking
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')
    
    let userId = null
    if (token) {
      try {
        const payload = await verifyJWT(token)
        userId = payload?.userId
      } catch (error) {
        console.log('Auth verification failed')
      }
    }

    const body = await request.json()
    const { bookingId, reason } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID required' },
        { status: 400 }
      )
    }

    // SECURE QUERY - USE SELECT
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        renterId: true,
        guestEmail: true,
        startDate: true,
        totalAmount: true,
        status: true,
        car: {
          select: {
            id: true,
            make: true,
            model: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check ownership (if authenticated)
    if (userId && booking.renterId !== userId) {
      // Check if it's a guest booking with matching email
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      })
      
      if (!user || user.email !== booking.guestEmail) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
    }

    // Check if cancellation is allowed
    const now = new Date()
    const hoursUntilStart = (booking.startDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (hoursUntilStart < 24) {
      return NextResponse.json(
        { error: 'Cannot cancel within 24 hours of start time' },
        { status: 400 }
      )
    }

    // Update booking status
    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: 'GUEST',
        cancellationReason: reason || 'User requested cancellation'
      },
      select: {
        id: true,
        status: true,
        cancelledAt: true
      }
    })

    // Calculate refund based on cancellation policy
    let refundPercentage = 0
    if (hoursUntilStart >= 72) {
      refundPercentage = 100 // Full refund if 3+ days before
    } else if (hoursUntilStart >= 48) {
      refundPercentage = 50 // 50% refund if 2-3 days before
    } else {
      refundPercentage = 0 // No refund if less than 2 days
    }

    const refundAmount = (booking.totalAmount * refundPercentage) / 100

    return NextResponse.json({
      success: true,
      booking: {
        id: bookingId,
        status: 'CANCELLED',
        notes: reason || 'Cancelled by user'
      },
      refund: {
        amount: refundAmount,
        percentage: refundPercentage,
        status: refundPercentage > 0 ? 'processing' : 'not_applicable'
      }
    })

  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}

// PUT /api/rentals/user-bookings/extend - Extend a booking
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')
    
    let userId = null
    if (token) {
      try {
        const payload = await verifyJWT(token)
        userId = payload?.userId
      } catch (error) {
        console.log('Auth verification failed')
      }
    }

    const body = await request.json()
    const { bookingId, newEndDate } = body

    if (!bookingId || !newEndDate) {
      return NextResponse.json(
        { error: 'Booking ID and new end date required' },
        { status: 400 }
      )
    }

    // SECURE QUERY - USE SELECT
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        carId: true,
        renterId: true,
        guestEmail: true,
        endDate: true,
        dailyRate: true,
        numberOfDays: true,
        subtotal: true,
        serviceFee: true,
        taxes: true,
        totalAmount: true,
        car: {
          select: {
            id: true,
            make: true,
            model: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check ownership
    if (userId && booking.renterId !== userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      })
      
      if (!user || user.email !== booking.guestEmail) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
    }

    // Calculate additional days and cost
    const newEnd = new Date(newEndDate)
    const originalEnd = new Date(booking.endDate)
    const additionalDays = Math.ceil(
      (newEnd.getTime() - originalEnd.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (additionalDays <= 0) {
      return NextResponse.json(
        { error: 'New end date must be after current end date' },
        { status: 400 }
      )
    }

    // Check availability for extension period
    const conflicts = await prisma.rentalBooking.findFirst({
      where: {
        carId: booking.carId,
        id: { not: bookingId },
        status: { notIn: ['CANCELLED'] },
        startDate: { lte: newEnd },
        endDate: { gte: originalEnd }
      },
      select: { id: true }
    })

    if (conflicts) {
      return NextResponse.json(
        { error: 'Car is not available for the extended period' },
        { status: 400 }
      )
    }

    // Calculate additional cost
    const additionalSubtotal = booking.dailyRate * additionalDays
    const additionalServiceFee = additionalSubtotal * 0.15
    const additionalTaxes = (additionalSubtotal + additionalServiceFee) * 0.09
    const additionalCost = additionalSubtotal + additionalServiceFee + additionalTaxes

    // Update the booking
    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        endDate: newEnd,
        numberOfDays: booking.numberOfDays + additionalDays,
        subtotal: booking.subtotal + additionalSubtotal,
        serviceFee: booking.serviceFee + additionalServiceFee,
        taxes: booking.taxes + additionalTaxes,
        totalAmount: booking.totalAmount + additionalCost,
        updatedAt: new Date()
      },
      select: {
        id: true,
        endDate: true,
        status: true,
        totalAmount: true
      }
    })

    return NextResponse.json({
      success: true,
      booking: {
        id: bookingId,
        endDate: newEndDate,
        status: 'EXTENDED'
      },
      extension: {
        additionalDays,
        additionalCost,
        newEndDate: newEnd
      }
    })

  } catch (error) {
    console.error('Error extending booking:', error)
    return NextResponse.json(
      { error: 'Failed to extend booking' },
      { status: 500 }
    )
  }
}