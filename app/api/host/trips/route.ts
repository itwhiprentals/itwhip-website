// app/api/host/trips/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/app/lib/database/prisma"

// Using shared prisma instance

export async function GET(request: NextRequest) {
  try {
    // Get hostId from middleware headers
    const hostId = request.headers.get('x-host-id')
    
    if (!hostId) {
      return NextResponse.json(
        { error: 'Host authentication required' },
        { status: 401 }
      )
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // all, upcoming, completed, cancelled
    const search = searchParams.get('search') // Search by guest name or car
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      hostId: hostId
    }

    // Filter by status
    if (status && status !== 'all') {
      switch (status) {
        case 'upcoming':
          where.status = { in: ['PENDING', 'CONFIRMED'] }
          where.startDate = { gte: new Date() }
          break
        case 'active':
          where.status = 'ACTIVE'
          break
        case 'completed':
          where.status = 'COMPLETED'
          break
        case 'cancelled':
          where.status = 'CANCELLED'
          break
      }
    }

    // Search by guest name or car
    if (search) {
      where.OR = [
        { guestName: { contains: search, mode: 'insensitive' } },
        { guestEmail: { contains: search, mode: 'insensitive' } },
        { 
          car: {
            OR: [
              { make: { contains: search, mode: 'insensitive' } },
              { model: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ]
    }

    // Fetch trips with related data
    const [trips, totalCount] = await Promise.all([
      prisma.rentalBooking.findMany({
        where,
        include: {
          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              licensePlate: true,
              photos: {
                take: 1,
                orderBy: { order: 'asc' },
                select: { url: true }
              }
            }
          },
          renter: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          review: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true
            }
          }
        },
        orderBy: { startDate: 'desc' },
        skip,
        take: limit
      }),
      prisma.rentalBooking.count({ where })
    ])

    // Calculate stats
    const stats = {
      total: await prisma.rentalBooking.count({
        where: { hostId }
      }),
      upcoming: await prisma.rentalBooking.count({
        where: {
          hostId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          startDate: { gte: new Date() }
        }
      }),
      active: await prisma.rentalBooking.count({
        where: {
          hostId,
          status: 'ACTIVE'
        }
      }),
      completed: await prisma.rentalBooking.count({
        where: {
          hostId,
          status: 'COMPLETED'
        }
      }),
      cancelled: await prisma.rentalBooking.count({
        where: {
          hostId,
          status: 'CANCELLED'
        }
      })
    }

    // Format the response
    const formattedTrips = trips.map(trip => ({
      id: trip.id,
      bookingCode: trip.bookingCode,
      
      // Guest info
      guestName: trip.guestName || trip.renter?.name || 'Guest',
      guestEmail: trip.guestEmail || trip.renter?.email,
      guestAvatar: trip.renter?.avatar,
      
      // Car info
      car: {
        id: trip.car.id,
        make: trip.car.make,
        model: trip.car.model,
        year: trip.car.year,
        licensePlate: trip.car.licensePlate,
        photo: trip.car.photos[0]?.url
      },
      
      // Trip dates
      startDate: trip.startDate,
      endDate: trip.endDate,
      startTime: trip.startTime,
      endTime: trip.endTime,
      numberOfDays: trip.numberOfDays,
      
      // Pickup/delivery
      pickupLocation: trip.pickupLocation,
      pickupType: trip.pickupType,
      deliveryAddress: trip.deliveryAddress,
      
      // Pricing
      dailyRate: trip.dailyRate,
      subtotal: trip.subtotal,
      totalAmount: trip.totalAmount,
      depositAmount: trip.depositAmount,
      
      // Status
      status: trip.status,
      paymentStatus: trip.paymentStatus,
      verificationStatus: trip.verificationStatus,
      tripStatus: trip.tripStatus,
      
      // Trip tracking
      tripStartedAt: trip.tripStartedAt,
      tripEndedAt: trip.tripEndedAt,
      actualStartTime: trip.actualStartTime,
      actualEndTime: trip.actualEndTime,
      
      // Mileage
      startMileage: trip.startMileage,
      endMileage: trip.endMileage,
      
      // Review
      hasReview: !!trip.review,
      review: trip.review ? {
        rating: trip.review.rating,
        comment: trip.review.comment,
        createdAt: trip.review.createdAt
      } : null,
      
      // Timestamps
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt
    }))

    return NextResponse.json({
      success: true,
      trips: formattedTrips,
      stats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount
      }
    })

  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    )
  }
}