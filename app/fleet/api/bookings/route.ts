// app/fleet/api/bookings/route.ts
// Fleet-level bookings API - comprehensive booking management

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const status = searchParams.get('status')
    const verificationStatus = searchParams.get('verificationStatus')
    const search = searchParams.get('search')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const hostId = searchParams.get('hostId')
    const tab = searchParams.get('tab') // 'all', 'pending_verification', 'active', 'needs_attention'

    // Build where clause
    const where: any = {}

    // Status filter
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    // Verification status filter
    if (verificationStatus && verificationStatus !== 'all') {
      where.verificationStatus = verificationStatus.toUpperCase()
    }

    // Tab-based filters
    if (tab === 'pending_review') {
      where.fleetStatus = 'PENDING'
      where.paymentStatus = 'AUTHORIZED'
    } else if (tab === 'pending_verification') {
      where.verificationStatus = 'PENDING'
      where.status = { in: ['PENDING', 'CONFIRMED'] }
    } else if (tab === 'active') {
      where.status = 'ACTIVE'
    } else if (tab === 'needs_attention') {
      where.OR = [
        { flaggedForReview: true },
        { verificationStatus: 'PENDING', verificationDeadline: { lte: new Date() } },
        { status: 'DISPUTE_REVIEW' },
        { riskScore: { gte: 60 } }
      ]
    } else if (tab === 'today') {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)
      where.OR = [
        { startDate: { gte: todayStart, lte: todayEnd } },
        { endDate: { gte: todayStart, lte: todayEnd } }
      ]
    }

    // Search filter
    if (search) {
      where.OR = [
        ...(where.OR || []),
        { bookingCode: { contains: search, mode: 'insensitive' } },
        { guestName: { contains: search, mode: 'insensitive' } },
        { guestEmail: { contains: search, mode: 'insensitive' } },
        { guestPhone: { contains: search } }
      ]
    }

    // Date range filter
    if (dateFrom) {
      where.startDate = { ...(where.startDate || {}), gte: new Date(dateFrom) }
    }
    if (dateTo) {
      where.endDate = { ...(where.endDate || {}), lte: new Date(dateTo) }
    }

    // Host filter
    if (hostId) {
      where.hostId = hostId
    }

    // Get total count
    const totalCount = await prisma.rentalBooking.count({ where })

    // Fetch bookings with relations
    const bookings = await prisma.rentalBooking.findMany({
      where,
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            licensePlate: true,
            source: true,
            photos: {
              take: 1,
              orderBy: { order: 'asc' },
              select: { url: true }
            }
          }
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        reviewerProfile: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        disputes: {
          select: {
            id: true,
            type: true,
            status: true,
            description: true,
            createdAt: true
          }
        },
        Claim: {
          select: {
            id: true,
            type: true,
            status: true,
            estimatedCost: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    // Format bookings for response
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      bookingCode: booking.bookingCode,

      // Guest info
      guestId: booking.renterId || booking.reviewerProfile?.id,
      guestName: booking.guestName || booking.reviewerProfile?.name || 'Guest',
      guestEmail: booking.guestEmail || booking.reviewerProfile?.email || '',
      guestPhone: booking.guestPhone || booking.reviewerProfile?.phoneNumber || '',

      // Car info
      car: {
        id: booking.car.id,
        make: booking.car.make,
        model: booking.car.model,
        year: booking.car.year,
        licensePlate: booking.car.licensePlate,
        source: booking.car.source,
        photoUrl: booking.car.photos[0]?.url
      },

      // Host info
      host: {
        id: booking.host.id,
        name: booking.host.name,
        email: booking.host.email,
        phone: booking.host.phone
      },

      // Dates
      startDate: booking.startDate,
      endDate: booking.endDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      numberOfDays: booking.numberOfDays,

      // Location
      pickupType: booking.pickupType,
      pickupLocation: booking.pickupLocation,
      deliveryAddress: booking.deliveryAddress,
      returnLocation: booking.returnLocation,

      // Pricing
      dailyRate: booking.dailyRate,
      subtotal: booking.subtotal,
      deliveryFee: booking.deliveryFee,
      insuranceFee: booking.insuranceFee,
      serviceFee: booking.serviceFee,
      taxes: booking.taxes,
      totalAmount: booking.totalAmount,
      depositAmount: booking.depositAmount,

      // Status
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      verificationStatus: booking.verificationStatus,
      tripStatus: booking.tripStatus,

      // Verification
      licenseVerified: booking.licenseVerified,
      selfieVerified: booking.selfieVerified,
      licensePhotoUrl: booking.licensePhotoUrl,
      insurancePhotoUrl: booking.insurancePhotoUrl,
      selfiePhotoUrl: booking.selfiePhotoUrl,
      licenseNumber: booking.licenseNumber,
      licenseState: booking.licenseState,
      licenseExpiry: booking.licenseExpiry,
      dateOfBirth: booking.dateOfBirth,
      documentsSubmittedAt: booking.documentsSubmittedAt,
      verificationDeadline: booking.verificationDeadline,
      verificationNotes: booking.verificationNotes,
      reviewedBy: booking.reviewedBy,
      reviewedAt: booking.reviewedAt,

      // Cancellation
      cancellationReason: booking.cancellationReason,
      cancelledBy: booking.cancelledBy,
      cancelledAt: booking.cancelledAt,

      // Trip
      tripStartedAt: booking.tripStartedAt,
      tripEndedAt: booking.tripEndedAt,
      startMileage: booking.startMileage,
      endMileage: booking.endMileage,

      // Risk
      riskScore: booking.riskScore,
      riskFlags: booking.riskFlags,
      flaggedForReview: booking.flaggedForReview,
      fraudulent: booking.fraudulent,

      // Relations
      hasDispute: booking.disputes.length > 0,
      disputes: booking.disputes,
      hasClaim: booking.Claim.length > 0,
      claims: booking.Claim,

      // Timestamps
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }))

    // Get stats for dashboard
    const [pendingVerification, activeBookings, needsAttention, todayBookings, pendingReview] = await Promise.all([
      prisma.rentalBooking.count({
        where: { verificationStatus: 'PENDING', status: { in: ['PENDING', 'CONFIRMED'] } }
      }),
      prisma.rentalBooking.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.rentalBooking.count({
        where: {
          OR: [
            { flaggedForReview: true },
            { status: 'DISPUTE_REVIEW' },
            { riskScore: { gte: 60 } }
          ]
        }
      }),
      prisma.rentalBooking.count({
        where: {
          OR: [
            { startDate: { gte: new Date(new Date().setHours(0,0,0,0)), lte: new Date(new Date().setHours(23,59,59,999)) } },
            { endDate: { gte: new Date(new Date().setHours(0,0,0,0)), lte: new Date(new Date().setHours(23,59,59,999)) } }
          ]
        }
      }),
      // Pending Fleet Review (fleetStatus = PENDING with payment authorized)
      prisma.rentalBooking.count({
        where: { fleetStatus: 'PENDING', paymentStatus: 'AUTHORIZED' }
      })
    ])

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount
      },
      stats: {
        pendingVerification,
        activeBookings,
        needsAttention,
        todayBookings,
        totalBookings: totalCount,
        pendingReview
      }
    })

  } catch (error: any) {
    console.error('Error fetching fleet bookings:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// PATCH - Update booking status/verification
export async function PATCH(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      bookingId,
      action,
      status,
      verificationStatus,
      notes,
      reason,
      newCarId,
      modifications
    } = body

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 })
    }

    const updateData: any = {}

    // Handle different actions
    switch (action) {
      case 'approve':
        updateData.verificationStatus = 'APPROVED'
        updateData.status = 'CONFIRMED'
        updateData.reviewedAt = new Date()
        updateData.reviewedBy = 'fleet-admin'
        updateData.licenseVerified = true
        updateData.selfieVerified = true
        if (notes) updateData.verificationNotes = notes
        break

      case 'reject':
        updateData.verificationStatus = 'REJECTED'
        updateData.status = 'CANCELLED'
        updateData.cancelledAt = new Date()
        updateData.cancelledBy = 'ADMIN'
        updateData.cancellationReason = reason || notes || 'Rejected by fleet admin'
        if (notes) updateData.verificationNotes = notes
        break

      case 'cancel':
        updateData.status = 'CANCELLED'
        updateData.cancelledAt = new Date()
        updateData.cancelledBy = 'ADMIN'
        updateData.cancellationReason = reason || 'Cancelled by fleet admin'
        break

      case 'modify':
        if (modifications) {
          if (modifications.startDate) updateData.startDate = new Date(modifications.startDate)
          if (modifications.endDate) updateData.endDate = new Date(modifications.endDate)
          if (modifications.startTime) updateData.startTime = modifications.startTime
          if (modifications.endTime) updateData.endTime = modifications.endTime
          if (modifications.pickupLocation) updateData.pickupLocation = modifications.pickupLocation
          if (modifications.deliveryAddress) updateData.deliveryAddress = modifications.deliveryAddress
        }
        break

      case 'change_car':
        if (newCarId) {
          // Get new car details
          const newCar = await prisma.rentalCar.findUnique({
            where: { id: newCarId },
            select: { dailyRate: true, hostId: true }
          })
          if (!newCar) {
            return NextResponse.json({ error: 'Car not found' }, { status: 404 })
          }
          updateData.carId = newCarId
          // Optionally update host if car belongs to different host
          if (newCar.hostId) {
            updateData.hostId = newCar.hostId
          }
        }
        break

      case 'flag_review':
        updateData.flaggedForReview = true
        if (notes) updateData.riskNotes = notes
        break

      case 'unflag_review':
        updateData.flaggedForReview = false
        break

      default:
        // Generic status updates
        if (status) {
          updateData.status = status.toUpperCase()
          if (status.toUpperCase() === 'CANCELLED') {
            updateData.cancelledAt = new Date()
            updateData.cancelledBy = 'ADMIN'
            if (reason) updateData.cancellationReason = reason
          }
        }
        if (verificationStatus) {
          updateData.verificationStatus = verificationStatus.toUpperCase()
          if (verificationStatus.toUpperCase() === 'APPROVED') {
            updateData.reviewedAt = new Date()
            updateData.reviewedBy = 'fleet-admin'
          }
        }
        if (notes) {
          updateData.verificationNotes = notes
        }
    }

    // Update the booking
    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        car: { select: { make: true, model: true, year: true } },
        host: { select: { name: true, email: true } }
      }
    })

    // Create activity log
    await prisma.activityLog.create({
      data: {
        id: `al_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        action: action || 'update_booking',
        entityType: 'RentalBooking',
        entityId: bookingId,
        metadata: {
          changes: updateData,
          notes,
          reason,
          performedBy: 'fleet-admin'
        }
      }
    })

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: `Booking ${action || 'updated'} successfully`
    })

  } catch (error: any) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update booking' },
      { status: 500 }
    )
  }
}
