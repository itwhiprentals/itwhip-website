// File: app/api/rentals/user-bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import type { RentalBookingStatus } from '@/app/lib/dal/types'
import { verifyRequest } from '@/app/lib/auth/verify-request'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userEmail = user.email
    const userId = user.id
    console.log('Authenticated user via auth service:', userEmail)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as RentalBookingStatus | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const bookingId = searchParams.get('bookingId')
    const guestEmail = searchParams.get('guestEmail')

    console.log('Fetching bookings with where clause:', JSON.stringify({
      userId,
      userEmail,
      status,
      bookingId,
      guestEmail
    }))

    const whereConditions: string[] = []
    
    if (bookingId) {
      whereConditions.push(`b.id = '${bookingId}'`)
    } else if (guestEmail && userEmail && guestEmail === userEmail) {
      whereConditions.push(`b."guestEmail" = '${userEmail}'`)
    } else {
      const orParts: string[] = []
      if (userId) orParts.push(`b."renterId" = '${userId}'`)
      if (userEmail) orParts.push(`b."guestEmail" = '${userEmail}'`)
      if (orParts.length > 0) {
        whereConditions.push(`(${orParts.join(' OR ')})`)
      }
    }

    if (status) {
      whereConditions.push(`b.status = '${status}'`)
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : ''

    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    const offset = (page - 1) * limit

    // ✅ FIXED: Optimized single query
    const query = `
      SELECT 
        b.id,
        b."bookingCode",
        b.status,
        b."verificationStatus",
        b."tripStatus",
        b."startDate",
        b."endDate",
        b."startTime",
        b."endTime",
        b."numberOfDays",
        b."createdAt",
        b."updatedAt",
        b."guestName",
        b."guestEmail",
        b."guestPhone",
        b."renterId",
        b."tripStartedAt",
        b."tripEndedAt",
        b."startMileage",
        b."endMileage",
        b."fuelLevelStart",
        b."fuelLevelEnd",
        b."actualStartTime",
        b."actualEndTime",
        b."inspectionPhotosStart",
        b."inspectionPhotosEnd",
        b."pickupWindowStart",
        b."pickupWindowEnd",
        b."pickupLatitude",
        b."pickupLongitude",
        b."returnLatitude",
        b."returnLongitude",
        b."pickupLocationVerified",
        b."partnerLocationId",
        b."pickupLocation",
        b."pickupType",
        b."deliveryAddress",
        b."returnLocation",
        b."documentsSubmittedAt",
        b."reviewedAt",
        b."licenseVerified",
        b."selfieVerified",
        b."licensePhotoUrl",
        b."licenseBackPhotoUrl",
        b."insurancePhotoUrl",
        b."selfiePhotoUrl",
        b."onboardingCompletedAt",
        b."dailyRate",
        b.subtotal,
        b."deliveryFee",
        b."insuranceFee",
        b."serviceFee",
        b.taxes,
        b."totalAmount",
        b."depositAmount",
        b."paymentStatus",
        b."paymentIntentId",
        b."stripeCustomerId",
        b."stripePaymentMethodId",
        b."insuranceSelection",
        b."refuelService",
        b."additionalDriver",
        b."extraMilesPackage",
        b."vipConcierge",
        b."enhancementsTotal",
        b."carId",
        b."hostId",
        
        (
          SELECT json_build_object(
            'token', gat.token,
            'expiresAt', gat."expiresAt"
          )
          FROM "GuestAccessToken" gat
          WHERE gat."bookingId" = b.id 
            AND gat."expiresAt" >= NOW()
          ORDER BY gat."createdAt" DESC
          LIMIT 1
        ) as "guestAccessToken",
        
        json_build_object(
          'id', c.id,
          'make', c.make,
          'model', c.model,
          'year', c.year,
          'carType', c."carType",
          'transmission', c.transmission,
          'seats', c.seats,
          'city', c.city,
          'state', c.state,
          'photos', COALESCE(
            (SELECT json_agg(json_build_object(
              'id', cp.id,
              'url', cp.url,
              'caption', cp.caption
            ) ORDER BY cp."order" ASC)
            FROM "RentalCarPhoto" cp
            WHERE cp."carId" = c.id
            LIMIT 5), '[]'::json
          )
        ) as car,
        
        json_build_object(
          'id', h.id,
          'name', h.name,
          'email', h.email,
          'phone', h.phone,
          'profilePhoto', h."profilePhoto",
          'rating', h.rating,
          'responseTime', h."responseTime",
          'isVerified', h."isVerified"
        ) as host,
        
        (SELECT json_build_object(
          'id', r.id,
          'rating', r.rating,
          'comment', r.comment,
          'createdAt', r."createdAt"
        )
        FROM "RentalReview" r
        WHERE r."bookingId" = b.id
        LIMIT 1) as review,
        
        COALESCE((
          SELECT COUNT(*)::int
          FROM "RentalMessage" m
          WHERE m."bookingId" = b.id
            AND m."isRead" = false
        ), 0) as unread_messages_count,

        (SELECT json_build_object(
          'stripeIdentityStatus', rp."stripeIdentityStatus",
          'documentsVerified', rp."documentsVerified",
          'insuranceVerified', rp."insuranceVerified",
          'insuranceCardFrontUrl', rp."insuranceCardFrontUrl"
        )
        FROM "ReviewerProfile" rp
        WHERE rp.email = b."guestEmail"
        LIMIT 1) as "guestProfile"

      FROM "RentalBooking" b
      LEFT JOIN "RentalCar" c ON c.id = b."carId"
      LEFT JOIN "RentalHost" h ON h.id = b."hostId"
      ${whereClause}
      ORDER BY b."${sortBy}" ${orderDirection}
      LIMIT ${limit}
      OFFSET ${offset}
    `

    const bookingsRaw = await prisma.$queryRawUnsafe(query) as any[]

    console.log(`Found ${bookingsRaw.length} bookings for authenticated user: ${userEmail}`)

    const transformedBookings = bookingsRaw.map(booking => {
      const now = new Date()
      let bookingState: string
      
      if (booking.status === 'CANCELLED') {
        bookingState = 'CANCELLED'
      } else if (booking.status === 'COMPLETED') {
        bookingState = 'COMPLETED'
      } else if (new Date(booking.startDate) > now) {
        bookingState = 'UPCOMING'
      } else if (new Date(booking.endDate) < now) {
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
        guestToken: booking.guestAccessToken?.token || null,
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
        pickupWindowStart: booking.pickupWindowStart,
        pickupWindowEnd: booking.pickupWindowEnd,
        pickupLatitude: booking.pickupLatitude ? parseFloat(booking.pickupLatitude) : null,
        pickupLongitude: booking.pickupLongitude ? parseFloat(booking.pickupLongitude) : null,
        returnLatitude: booking.returnLatitude ? parseFloat(booking.returnLatitude) : null,
        returnLongitude: booking.returnLongitude ? parseFloat(booking.returnLongitude) : null,
        pickupLocationVerified: booking.pickupLocationVerified,
        partnerLocationId: booking.partnerLocationId,
        documentsSubmittedAt: booking.documentsSubmittedAt,
        reviewedAt: booking.reviewedAt,
        licenseVerified: booking.licenseVerified,
        selfieVerified: booking.selfieVerified,
        licensePhotoUrl: booking.licensePhotoUrl,
        licenseBackPhotoUrl: booking.licenseBackPhotoUrl,
        insurancePhotoUrl: booking.insurancePhotoUrl,
        selfiePhotoUrl: booking.selfiePhotoUrl,
        onboardingCompletedAt: booking.onboardingCompletedAt,
        guestStripeVerified: booking.guestProfile?.stripeIdentityStatus === 'verified' || booking.guestProfile?.documentsVerified === true,
        guestInsuranceOnFile: booking.guestProfile?.insuranceVerified === true,
        car: {
          id: booking.car.id,
          make: booking.car.make,
          model: booking.car.model,
          year: booking.car.year,
          type: booking.car.carType,
          transmission: booking.car.transmission,
          seats: booking.car.seats,
          photos: booking.car.photos || [],
          location: `${booking.car.city}, ${booking.car.state}`,
          city: booking.car.city,
          state: booking.car.state
        },
        host: booking.host,
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
        dailyRate: parseFloat(booking.dailyRate),
        subtotal: parseFloat(booking.subtotal),
        deliveryFee: parseFloat(booking.deliveryFee),
        insuranceFee: parseFloat(booking.insuranceFee),
        serviceFee: parseFloat(booking.serviceFee),
        taxes: parseFloat(booking.taxes),
        totalAmount: parseFloat(booking.totalAmount),
        depositAmount: parseFloat(booking.depositAmount),
        paymentStatus: booking.paymentStatus,
        paymentIntentId: booking.paymentIntentId,
        stripeCustomerId: booking.stripeCustomerId,
        stripePaymentMethodId: booking.stripePaymentMethodId,
        insuranceSelection: booking.insuranceSelection,
        refuelService: booking.refuelService ?? false,
        additionalDriver: booking.additionalDriver ?? false,
        extraMilesPackage: booking.extraMilesPackage ?? false,
        vipConcierge: booking.vipConcierge ?? false,
        enhancementsTotal: booking.enhancementsTotal ? parseFloat(booking.enhancementsTotal) : 0,
        hasReview: booking.review !== null,
        review: booking.review || null,
        hasUnreadMessages: booking.unread_messages_count > 0,
        latestMessage: null,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      }
    })

    const baseWhere = {
      OR: [
        ...(userId ? [{ renterId: userId }] : []),
        ...(userEmail ? [{ guestEmail: userEmail }] : [])
      ]
    }

    const [totalCount, statsResults, upcomingCount] = await Promise.all([
      prisma.rentalBooking.count({
        where: {
          ...baseWhere,
          ...(status ? { status } : {})
        }
      }),
      prisma.rentalBooking.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: { id: true }
      }),
      prisma.rentalBooking.count({
        where: {
          ...baseWhere,
          status: { notIn: ['CANCELLED', 'COMPLETED'] },
          startDate: { gt: new Date() }
        }
      })
    ])

    const statusCounts = statsResults.reduce((acc, stat) => {
      acc[stat.status] = stat._count.id
      return acc
    }, {} as Record<string, number>)

    const stats = {
      total: totalCount,
      upcoming: upcomingCount,
      active: statusCounts['ACTIVE'] || 0,
      completed: statusCounts['COMPLETED'] || 0,
      cancelled: statusCounts['CANCELLED'] || 0
    }

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

// POST - Cancel booking
export async function POST(request: NextRequest) {
  try {
    const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = user.id
    const userEmail = user.email

    const body = await request.json()
    const { bookingId, reason } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID required' },
        { status: 400 }
      )
    }

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

    const isOwner = (userId && booking.renterId === userId) || 
                    (userEmail && booking.guestEmail === userEmail)
    
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const now = new Date()
    const hoursUntilStart = (booking.startDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (hoursUntilStart < 24) {
      return NextResponse.json(
        { error: 'Cannot cancel within 24 hours of start time' },
        { status: 400 }
      )
    }

    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: 'GUEST',
        cancellationReason: reason || 'User requested cancellation'
      }
    })

    let refundPercentage = 0
    if (hoursUntilStart >= 72) {
      refundPercentage = 100
    } else if (hoursUntilStart >= 48) {
      refundPercentage = 50
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

// PUT - Extend booking
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = user.id
    const userEmail = user.email

    const body = await request.json()
    const { bookingId, newEndDate } = body

    if (!bookingId || !newEndDate) {
      return NextResponse.json(
        { error: 'Booking ID and new end date required' },
        { status: 400 }
      )
    }

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

    const isOwner = (userId && booking.renterId === userId) || 
                    (userEmail && booking.guestEmail === userEmail)
    
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

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

    const additionalSubtotal = booking.dailyRate * additionalDays
    const additionalServiceFee = additionalSubtotal * 0.15
    const additionalTaxes = (additionalSubtotal + additionalServiceFee) * 0.09
    const additionalCost = additionalSubtotal + additionalServiceFee + additionalTaxes

    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        endDate: newEnd,
        numberOfDays: booking.numberOfDays + additionalDays,
        subtotal: booking.subtotal + additionalSubtotal,
        serviceFee: booking.serviceFee + additionalServiceFee,
        taxes: booking.taxes + additionalTaxes,
        totalAmount: booking.totalAmount + additionalCost,
        updatedAt: new Date()
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