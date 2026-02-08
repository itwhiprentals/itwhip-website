// app/api/admin/rentals/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add admin authentication check
    const { id } = await params

    const booking = await prisma.rentalBooking.findUnique({
      where: { id },
      include: {
        car: {
          include: {
            photos: {
              orderBy: { order: 'asc' }
            },
            host: true
          }
        },
        host: true,
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' }
        },
        disputes: {
          include: {
            booking: {
              select: {
                bookingCode: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        HostPayout: {
          orderBy: { createdAt: 'desc' }
        }
      }
    }) as any

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Format the response with all fields including documents
    const formattedBooking = {
      id: booking.id,
      bookingCode: booking.bookingCode,
      
      // Guest information
      guestName: booking.guestName || booking.renter?.name || 'Guest',
      guestEmail: booking.guestEmail || booking.renter?.email || '',
      guestPhone: booking.guestPhone || booking.renter?.phone || '',
      
      // Car details
      car: {
        id: booking.car.id,
        make: booking.car.make,
        model: booking.car.model,
        year: booking.car.year,
        color: booking.car.color,
        licensePlate: booking.car.licensePlate,
        vin: booking.car.vin,
        photos: booking.car.photos.map((photo: any) => ({
          id: photo.id,
          url: photo.url,
          caption: photo.caption,
          isHero: photo.isHero,
          order: photo.order
        })),
        features: booking.car.features,
        rules: booking.car.rules,
        source: booking.car.source,
        transmission: booking.car.transmission,
        fuelType: booking.car.fuelType,
        seats: booking.car.seats,
        carType: booking.car.carType
      },
      
      // Host details
      host: {
        id: booking.host.id,
        name: booking.host.name,
        email: booking.host.email,
        phone: booking.host.phone,
        profilePhoto: booking.host.profilePhoto,
        rating: booking.host.rating,
        totalTrips: booking.host.totalTrips,
        responseTime: booking.host.responseTime,
        isVerified: booking.host.isVerified,
        city: booking.host.city,
        state: booking.host.state
      },
      
      // Dates and times
      startDate: booking.startDate,
      endDate: booking.endDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      
      // Pickup/Delivery
      pickupLocation: booking.pickupLocation,
      pickupType: booking.pickupType,
      deliveryAddress: booking.deliveryAddress,
      returnLocation: booking.returnLocation,
      
      // Pricing
      dailyRate: booking.dailyRate,
      numberOfDays: booking.numberOfDays,
      subtotal: booking.subtotal,
      deliveryFee: booking.deliveryFee,
      insuranceFee: booking.insuranceFee,
      serviceFee: booking.serviceFee,
      taxes: booking.taxes,
      totalAmount: booking.totalAmount,
      depositAmount: booking.depositAmount,
      
      // Status - Convert to lowercase for frontend
      status: booking.status.toLowerCase(),
      paymentStatus: booking.paymentStatus,
      paymentIntentId: booking.paymentIntentId,
      
      // Verification details
      verificationStatus: booking.verificationStatus,
      verificationDeadline: booking.verificationDeadline,
      verificationNotes: booking.verificationNotes,
      reviewedBy: booking.reviewedBy,
      reviewedAt: booking.reviewedAt,
      documentsSubmittedAt: booking.documentsSubmittedAt,
      
      // License information
      licenseVerified: booking.licenseVerified,
      licenseNumber: booking.licenseNumber,
      licenseState: booking.licenseState,
      licenseExpiry: booking.licenseExpiry,
      licensePhotoUrl: booking.licensePhotoUrl,
      
      // Insurance information
      insurancePhotoUrl: booking.insurancePhotoUrl,
      
      // Selfie verification
      selfieVerified: booking.selfieVerified,
      selfiePhotoUrl: booking.selfiePhotoUrl,
      dateOfBirth: booking.dateOfBirth,
      
      // Cancellation information (NEW)
      cancellationReason: booking.cancellationReason,
      cancelledBy: booking.cancelledBy,
      cancelledAt: booking.cancelledAt,
      
      // Actual rental data (if started)
      actualStartTime: booking.actualStartTime,
      actualEndTime: booking.actualEndTime,
      startMileage: booking.startMileage,
      endMileage: booking.endMileage,
      fuelLevelStart: booking.fuelLevelStart,
      fuelLevelEnd: booking.fuelLevelEnd,
      
      // Other
      extras: booking.extras,
      notes: booking.notes,
      hotelBookingId: booking.hotelBookingId,
      
      // Related data
      messages: booking.messages,
      disputes: booking.disputes,
      hostPayouts: booking.HostPayout,
      
      // Summary flags
      hasDispute: booking.disputes.length > 0,
      hasMessages: booking.messages.length > 0,
      isVerified: booking.licenseVerified && booking.selfieVerified,
      isCancelled: booking.status === 'CANCELLED',
      
      // Timestamps
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }

    return NextResponse.json({
      success: true,
      booking: formattedBooking
    })

  } catch (error) {
    console.error('Error fetching booking details:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch booking details',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// PATCH - Update booking details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add admin authentication check
    const { id } = await params
    const body = await request.json()
    
    // If status is being updated, convert to uppercase
    if (body.status) {
      body.status = body.status.toUpperCase()
      
      // Track cancellation if cancelling
      if (body.status === 'CANCELLED') {
        body.cancelledAt = new Date()
        body.cancelledBy = 'ADMIN'
        if (!body.cancellationReason && body.notes) {
          body.cancellationReason = body.notes
        }
      }
    }
    
    // Handle verification approval
    if (body.verificationStatus === 'approved') {
      body.reviewedAt = new Date()
      body.reviewedBy = 'admin' // TODO: Get actual admin user
      body.licenseVerified = true
      body.selfieVerified = true
    }

    const updatedBooking = await prisma.rentalBooking.update({
      where: { id },
      data: body,
      include: {
        car: {
          include: {
            photos: true,
            host: true
          }
        },
        host: true,
        renter: true,
        disputes: true
      }
    })
    
    // Log the action
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        action: 'update_booking_details',
        entityType: 'RentalBooking',
        entityId: id,
        metadata: {
          changes: body
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
      { 
        success: false,
        error: 'Failed to update booking',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// DELETE - Cancel booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add admin authentication check
    const { id } = await params
    
    const { searchParams } = new URL(request.url)
    const reason = searchParams.get('reason') || 'Cancelled by admin'

    // Soft delete - update status with cancellation tracking
    const cancelledBooking = await prisma.rentalBooking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'REFUNDED',
        cancellationReason: reason,
        cancelledBy: 'ADMIN',
        cancelledAt: new Date()
      },
      include: {
        car: {
          include: {
            photos: true,
            host: true
          }
        },
        host: true,
        renter: true
      }
    })
    
    // Log the cancellation
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        action: 'cancel_booking',
        entityType: 'RentalBooking',
        entityId: id,
        metadata: {
          reason,
          cancelledBy: 'ADMIN'
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: cancelledBooking
    })

  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to cancel booking',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}