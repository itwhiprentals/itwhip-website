// app/api/admin/rentals/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const status = searchParams.get('status')
    const filter = searchParams.get('filter')
    
    // Build where clause based on filters
    const where: any = {}
    
    // Fix: Handle "all" status and convert to uppercase for Prisma enum
    if (status && status !== 'all') {
      // Convert status to uppercase to match Prisma enum
      where.status = status.toUpperCase()
    }
    
    if (filter === 'pending') {
      where.verificationStatus = 'pending'
      where.car = { source: 'p2p' }
    } else if (filter === 'today') {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      where.createdAt = { gte: todayStart }
    } else if (filter === 'active') {
      where.status = 'ACTIVE'
    } else if (filter === 'cancelled') {
      where.status = 'CANCELLED'
    } else if (filter === 'completed') {
      where.status = 'COMPLETED'
    }

    // Get total count for pagination
    const totalCount = await prisma.rentalBooking.count({ where })

    // Fetch bookings with relations including disputes
    const bookings = await prisma.rentalBooking.findMany({
      where,
      include: {
        car: {
          include: {
            host: true,
            photos: {
              orderBy: { order: 'asc' }
            }
          }
        },
        renter: {
          select: {
            id: true,
            name: true,
            email: true
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    // Format bookings for admin display with ALL fields
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      bookingCode: booking.bookingCode,
      
      // Guest information
      guestName: booking.guestName || booking.renter?.name || 'Guest',
      guestEmail: booking.guestEmail || booking.renter?.email || '',
      guestPhone: booking.guestPhone || '',
      
      // Car information - Fixed to return photos array
      car: {
        id: booking.car.id,
        make: booking.car.make,
        model: booking.car.model,
        year: booking.car.year,
        photos: booking.car.photos.map(p => ({ 
          url: p.url,
          caption: p.caption,
          order: p.order 
        })),
        source: booking.car.source,
        host: {
          id: booking.car.host.id,
          name: booking.car.host.name,
          email: booking.car.host.email,
          phone: booking.car.host.phone
        }
      },
      
      // Dates and times
      startDate: booking.startDate,
      endDate: booking.endDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      
      // Pickup/delivery details
      pickupType: booking.pickupType,
      pickupLocation: booking.pickupLocation,
      deliveryAddress: booking.deliveryAddress,
      returnLocation: booking.returnLocation,
      
      // Pricing breakdown
      dailyRate: booking.dailyRate,
      numberOfDays: booking.numberOfDays,
      subtotal: booking.subtotal,
      deliveryFee: booking.deliveryFee,
      insuranceFee: booking.insuranceFee,
      serviceFee: booking.serviceFee,
      taxes: booking.taxes,
      totalAmount: booking.totalAmount,
      depositAmount: booking.depositAmount,
      
      // Status information - Convert back to lowercase for frontend compatibility
      status: booking.status.toLowerCase(),
      paymentStatus: booking.paymentStatus,
      verificationStatus: booking.verificationStatus,
      
      // Verification documents - ALL FIELDS INCLUDED
      licensePhotoUrl: booking.licensePhotoUrl,
      insurancePhotoUrl: booking.insurancePhotoUrl,
      selfiePhotoUrl: booking.selfiePhotoUrl,
      licenseNumber: booking.licenseNumber,
      licenseState: booking.licenseState,
      licenseExpiry: booking.licenseExpiry,
      licenseVerified: booking.licenseVerified,
      selfieVerified: booking.selfieVerified,
      dateOfBirth: booking.dateOfBirth,
      
      // Review information
      documentsSubmittedAt: booking.documentsSubmittedAt,
      verificationDeadline: booking.verificationDeadline,
      verificationNotes: booking.verificationNotes,
      reviewedBy: booking.reviewedBy,
      reviewedAt: booking.reviewedAt,
      
      // Cancellation information (new fields)
      cancellationReason: booking.cancellationReason,
      cancelledBy: booking.cancelledBy,
      cancelledAt: booking.cancelledAt,
      
      // Disputes (if any)
      disputes: booking.disputes,
      hasDispute: booking.disputes.length > 0,
      
      // Timestamps
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }))

    // Get summary stats for the filtered results
    const stats = await prisma.rentalBooking.aggregate({
      where,
      _sum: {
        totalAmount: true,
        serviceFee: true
      },
      _avg: {
        totalAmount: true,
        numberOfDays: true
      },
      _count: true
    })

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
        totalBookings: stats._count,
        totalRevenue: stats._sum.totalAmount || 0,
        totalServiceFees: stats._sum.serviceFee || 0,
        averageBookingValue: stats._avg.totalAmount || 0,
        averageRentalDays: stats._avg.numberOfDays || 0
      }
    })

  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch bookings',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// PATCH - Update booking status or verification
export async function PATCH(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    const body = await request.json()
    const { bookingId, status, verificationStatus, notes, action } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    
    // Handle status updates
    if (status) {
      updateData.status = status.toUpperCase()
      
      // If cancelling, track cancellation details
      if (status.toUpperCase() === 'CANCELLED') {
        updateData.cancelledAt = new Date()
        updateData.cancelledBy = 'ADMIN'
        if (notes) {
          updateData.cancellationReason = notes
        }
      }
    }
    
    // Handle verification updates
    if (verificationStatus) {
      updateData.verificationStatus = verificationStatus
      if (verificationStatus === 'approved') {
        updateData.reviewedAt = new Date()
        updateData.reviewedBy = 'admin' // TODO: Get actual admin user
        updateData.licenseVerified = true
        updateData.selfieVerified = true
      }
      if (notes) {
        updateData.verificationNotes = notes
      }
    }

    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        car: {
          include: {
            photos: true,
            host: true
          }
        },
        renter: true,
        disputes: true
      }
    })

    // Log the action
    await prisma.activityLog.create({
      data: {
        action: action || 'update_booking',
        entityType: 'RentalBooking',
        entityId: bookingId,
        metadata: {
          changes: updateData,
          notes
        }
      }
    })

    return NextResponse.json({
      success: true,
      booking: updatedBooking
    })

  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

// POST - Create a new booking (admin can create on behalf of guest)
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    const body = await request.json()
    
    // Admin can create bookings directly
    // This would use similar logic to /api/rentals/book
    // but with admin privileges (skip verification, etc.)
    
    return NextResponse.json(
      { message: 'Admin booking creation not yet implemented' },
      { status: 501 }
    )
    
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}