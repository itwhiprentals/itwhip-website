// File: app/api/rentals/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    
    // SECURE QUERY - USE SELECT NOT INCLUDE
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: resolvedParams.id },
      select: {
        // Booking core details
        id: true,
        bookingCode: true,
        startDate: true,
        endDate: true,
        startTime: true,
        endTime: true,
        
        // Guest information
        guestEmail: true,
        guestPhone: true,
        guestName: true,
        renterId: true,
        
        // Status fields
        status: true,
        paymentStatus: true,
        verificationStatus: true,
        tripStatus: true,
        
        // Location and delivery
        pickupLocation: true,
        pickupType: true,
        deliveryAddress: true,
        returnLocation: true,
        pickupWindowStart: true,
        pickupWindowEnd: true,
        
        // Pricing breakdown
        dailyRate: true,
        numberOfDays: true,
        subtotal: true,
        deliveryFee: true,
        insuranceFee: true,
        serviceFee: true,
        taxes: true,
        totalAmount: true,
        depositAmount: true,
        
        // Payment tracking
        paymentIntentId: true,
        stripeCustomerId: true,
        stripePaymentMethodId: true,
        paymentProcessedAt: true,
        
        // Trip tracking
        tripStartedAt: true,
        tripEndedAt: true,
        actualStartTime: true,
        actualEndTime: true,
        startMileage: true,
        endMileage: true,
        fuelLevelStart: true,
        fuelLevelEnd: true,
        
        // Verification info (for guest to see their own)
        licenseVerified: true,
        selfieVerified: true,
        documentsSubmittedAt: true,
        verificationDeadline: true,
        
        // Damage and charges
        damageReported: true,
        damageDescription: true,
        pendingChargesAmount: true,
        chargesProcessedAt: true,
        
        // Cancellation info
        cancellationReason: true,
        cancelledBy: true,
        cancelledAt: true,
        
        // Notes and extras
        notes: true,
        extras: true,
        
        // Car - LIMITED PUBLIC FIELDS ONLY
        car: {
          select: {
            id: true,
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
            
            // Basic info for display
            dailyRate: true,
            features: true,
            rules: true,
            
            // Location
            address: true,
            city: true,
            state: true,
            zipCode: true,
            
            // Delivery options
            airportPickup: true,
            hotelDelivery: true,
            homeDelivery: true,
            
            // Insurance
            insuranceIncluded: true,
            insuranceDaily: true,
            
            // Photos - LIMITED TO HERO AND A FEW OTHERS
            photos: {
              select: {
                id: true,
                url: true,
                caption: true,
                order: true,
                isHero: true
              },
              orderBy: { order: 'asc' },
              take: 5  // Limit to 5 photos
            }
          }
        },
        
        // Host - ONLY PUBLIC CONTACT INFO
        host: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            phone: true,
            email: true,
            responseTime: true,
            responseRate: true,
            isVerified: true,
            city: true,
            state: true
          }
        },
        
        // Messages count (not the actual messages)
        _count: {
          select: {
            messages: true,
            disputes: true
          }
        },
        
        // Timestamps
        createdAt: true,
        updatedAt: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Format the response to ensure clean data
    const response = {
      ...booking,
      messageCount: booking._count.messages,
      disputeCount: booking._count.disputes,
      _count: undefined  // Remove internal structure
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    
    // Only allow updating certain fields
    const allowedUpdates = {
      notes: body.notes,
      verificationStatus: body.verificationStatus,
      documentsSubmittedAt: body.documentsSubmittedAt,
      licenseVerified: body.licenseVerified,
      selfieVerified: body.selfieVerified
    }
    
    // Remove undefined values
    const updates = Object.entries(allowedUpdates)
      .filter(([_, value]) => value !== undefined)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
    
    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: resolvedParams.id },
      data: updates,
      select: {
        id: true,
        status: true,
        verificationStatus: true,
        updatedAt: true
      }
    })

    return NextResponse.json(updatedBooking)
    
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    
    // Only allow cancellation, not actual deletion
    const cancelledBooking = await prisma.rentalBooking.update({
      where: { id: resolvedParams.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: 'GUEST'  // You might want to determine this from auth
      },
      select: {
        id: true,
        status: true,
        cancelledAt: true
      }
    })

    return NextResponse.json({
      message: 'Booking cancelled successfully',
      booking: cancelledBooking
    })
    
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}