// app/api/host/bookings/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { headers } from 'next/headers'

// Helper to get host from headers
async function getHostFromHeaders() {
  const headersList = await headers()
  const hostId = headersList.get('x-host-id')
  const userId = headersList.get('x-user-id')
  
  if (!userId && !hostId) {
    return null
  }
  
  const host = await prisma.rentalHost.findFirst({
    where: hostId ? { id: hostId } : { userId: userId }
  })
  
  return host
}

// GET - Fetch single booking details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Fetch booking with all related data INCLUDING CLAIMS
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        hostId: host.id
      },
      include: {
        car: {
          include: {
            photos: {
              orderBy: { order: 'asc' }
            }
          }
        },
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            senderType: true,
            senderName: true,
            message: true,
            createdAt: true,
            isRead: true
          }
        },
        // ADD CLAIMS DATA
        claims: {
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            type: true,
            status: true,
            estimatedCost: true,
            createdAt: true,
            vehicleDeactivated: true
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
    
    // Format booking for response
    const formattedBooking = {
      id: booking.id,
      bookingCode: booking.bookingCode,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      verificationStatus: booking.verificationStatus,
      tripStatus: booking.tripStatus,
      
      // Car details
      car: {
        id: booking.car.id,
        make: booking.car.make,
        model: booking.car.model,
        year: booking.car.year,
        licensePlate: booking.car.licensePlate,
        dailyRate: Number(booking.car.dailyRate),
        photos: booking.car.photos.map(p => ({
          url: p.url
        })),
        hasActiveClaim: booking.car.hasActiveClaim,
        activeClaimId: booking.car.activeClaimId
      },
      
      // Guest details
      renter: booking.renter ? {
        id: booking.renter.id,
        name: booking.renter.name,
        email: booking.renter.email,
        phone: booking.renter.phone,
        avatar: booking.renter.avatar
      } : null,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      
      // Verification
      licenseVerified: booking.licenseVerified,
      licenseNumber: booking.licenseNumber,
      licenseState: booking.licenseState,
      licenseExpiry: booking.licenseExpiry?.toISOString(),
      licensePhotoUrl: booking.licensePhotoUrl,
      selfieVerified: booking.selfieVerified,
      selfiePhotoUrl: booking.selfiePhotoUrl,
      dateOfBirth: booking.dateOfBirth?.toISOString(),
      
      // Trip details
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      numberOfDays: booking.numberOfDays,
      pickupType: booking.pickupType,
      pickupLocation: booking.pickupLocation,
      deliveryAddress: booking.deliveryAddress,
      
      // Check-in/out details
      actualStartTime: booking.actualStartTime?.toISOString(),
      actualEndTime: booking.actualEndTime?.toISOString(),
      startMileage: booking.startMileage,
      endMileage: booking.endMileage,
      fuelLevelStart: booking.fuelLevelStart,
      fuelLevelEnd: booking.fuelLevelEnd,
      
      // Inspection
      inspectionPhotosStart: booking.inspectionPhotosStart,
      inspectionPhotosEnd: booking.inspectionPhotosEnd,
      damageReported: booking.damageReported,
      damageDescription: booking.damageDescription,
      
      // Financial
      dailyRate: Number(booking.dailyRate),
      subtotal: Number(booking.subtotal),
      deliveryFee: Number(booking.deliveryFee),
      insuranceFee: Number(booking.insuranceFee),
      serviceFee: Number(booking.serviceFee),
      taxes: Number(booking.taxes),
      totalAmount: Number(booking.totalAmount),
      depositAmount: Number(booking.depositAmount),
      securityDeposit: Number(booking.securityDeposit),
      depositHeld: Number(booking.depositHeld),
      
      // Post-trip charges
      pendingChargesAmount: booking.pendingChargesAmount ? Number(booking.pendingChargesAmount) : null,
      chargesProcessedAt: booking.chargesProcessedAt?.toISOString(),
      chargesNotes: booking.chargesNotes,
      
      // Messages
      messages: booking.messages,
      
      // CLAIMS DATA
      claims: booking.claims?.map(claim => ({
        id: claim.id,
        type: claim.type,
        status: claim.status,
        estimatedCost: Number(claim.estimatedCost),
        createdAt: claim.createdAt.toISOString(),
        vehicleDeactivated: claim.vehicleDeactivated
      })) || [],
      
      // Metadata
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      bookingIpAddress: booking.bookingIpAddress,
      bookingCountry: booking.bookingCountry,
      bookingCity: booking.bookingCity,
      riskScore: booking.riskScore
    }
    
    // Mark messages as read
    await prisma.rentalMessage.updateMany({
      where: {
        bookingId: bookingId,
        isRead: false,
        senderType: {
          not: 'host'
        }
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })
    
    return NextResponse.json({
      booking: formattedBooking
    })
    
  } catch (error) {
    console.error('Booking fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking details' },
      { status: 500 }
    )
  }
}

// PUT - Update booking details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Verify booking belongs to host
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        hostId: host.id
      }
    })
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    // Update allowed fields
    const updateData: any = {}
    
    // Fields hosts can update
    const allowedFields = [
      'startTime', 'endTime', 'pickupLocation', 
      'deliveryAddress', 'notes'
    ]
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }
    
    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: updateData
    })
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: host.userId,
        action: 'booking_updated',
        entityType: 'booking',
        entityId: bookingId,
        metadata: {
          changes: updateData
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      booking: updatedBooking
    })
    
  } catch (error) {
    console.error('Booking update error:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

// POST - Handle booking actions (approve, decline, message, etc.)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get the action from URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const action = pathParts[pathParts.length - 1]
    
    // Verify booking belongs to host
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        hostId: host.id
      },
      include: {
        car: true
      }
    })
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    // Handle different actions
    switch (action) {
      case 'approve':
        if (booking.status !== 'PENDING') {
          return NextResponse.json(
            { error: 'Only pending bookings can be approved' },
            { status: 400 }
          )
        }
        
        await prisma.rentalBooking.update({
          where: { id: bookingId },
          data: {
            status: 'CONFIRMED',
            verificationStatus: 'APPROVED'
          }
        })
        
        // Send confirmation message
        await prisma.rentalMessage.create({
          data: {
            bookingId: bookingId,
            senderId: host.id,
            senderType: 'host',
            senderName: host.name,
            message: 'Your booking has been approved! Looking forward to hosting you.',
            category: 'general'
          }
        })
        
        // Log activity
        await prisma.activityLog.create({
          data: {
            userId: host.userId,
            action: 'booking_approved',
            entityType: 'booking',
            entityId: bookingId,
            metadata: {
              bookingCode: booking.bookingCode
            }
          }
        })
        
        return NextResponse.json({ 
          success: true,
          message: 'Booking approved successfully'
        })
        
      case 'decline':
        if (booking.status !== 'PENDING') {
          return NextResponse.json(
            { error: 'Only pending bookings can be declined' },
            { status: 400 }
          )
        }
        
        const { reason } = await request.json()
        
        await prisma.rentalBooking.update({
          where: { id: bookingId },
          data: {
            status: 'CANCELLED',
            cancelledBy: 'HOST',
            cancelledAt: new Date(),
            cancellationReason: reason || 'Host declined the booking'
          }
        })
        
        // Send decline message
        await prisma.rentalMessage.create({
          data: {
            bookingId: bookingId,
            senderId: host.id,
            senderType: 'host',
            senderName: host.name,
            message: reason || 'Unfortunately, we cannot accommodate this booking.',
            category: 'general'
          }
        })
        
        // Log activity
        await prisma.activityLog.create({
          data: {
            userId: host.userId,
            action: 'booking_declined',
            entityType: 'booking',
            entityId: bookingId,
            metadata: {
              bookingCode: booking.bookingCode,
              reason: reason
            }
          }
        })
        
        return NextResponse.json({ 
          success: true,
          message: 'Booking declined'
        })
        
      case 'message':
        const { message } = await request.json()
        
        if (!message || !message.trim()) {
          return NextResponse.json(
            { error: 'Message cannot be empty' },
            { status: 400 }
          )
        }
        
        const newMessage = await prisma.rentalMessage.create({
          data: {
            bookingId: bookingId,
            senderId: host.id,
            senderType: 'host',
            senderName: host.name,
            senderEmail: host.email,
            message: message.trim(),
            category: 'general'
          }
        })
        
        return NextResponse.json({
          success: true,
          message: newMessage
        })
        
      case 'start-trip':
        if (booking.tripStatus !== 'NOT_STARTED') {
          return NextResponse.json(
            { error: 'Trip has already been started' },
            { status: 400 }
          )
        }
        
        const startData = await request.json()
        
        await prisma.rentalBooking.update({
          where: { id: bookingId },
          data: {
            tripStatus: 'ACTIVE',
            actualStartTime: new Date(),
            startMileage: startData.mileage,
            fuelLevelStart: startData.fuelLevel,
            tripStartedAt: new Date()
          }
        })
        
        // Log activity
        await prisma.activityLog.create({
          data: {
            userId: host.userId,
            action: 'trip_started',
            entityType: 'booking',
            entityId: bookingId,
            metadata: {
              bookingCode: booking.bookingCode,
              mileage: startData.mileage
            }
          }
        })
        
        return NextResponse.json({
          success: true,
          message: 'Trip started successfully'
        })
        
      case 'end-trip':
        if (booking.tripStatus !== 'ACTIVE') {
          return NextResponse.json(
            { error: 'Trip is not active' },
            { status: 400 }
          )
        }
        
        const endData = await request.json()
        
        await prisma.rentalBooking.update({
          where: { id: bookingId },
          data: {
            tripStatus: 'COMPLETED',
            status: 'COMPLETED',
            actualEndTime: new Date(),
            endMileage: endData.mileage,
            fuelLevelEnd: endData.fuelLevel,
            tripEndedAt: new Date(),
            damageReported: endData.damageReported || false,
            damageDescription: endData.damageDescription
          }
        })
        
        // Calculate any additional charges
        const milesDriven = endData.mileage - (booking.startMileage || 0)
        const allowedMiles = booking.numberOfDays * 200 // 200 miles per day
        
        if (milesDriven > allowedMiles) {
          const extraMiles = milesDriven - allowedMiles
          const mileageCharge = extraMiles * 3.0 // $3 per extra mile
          
          await prisma.rentalBooking.update({
            where: { id: bookingId },
            data: {
              pendingChargesAmount: mileageCharge,
              chargesNotes: `Extra mileage charge: ${extraMiles} miles @ $3.00/mile`
            }
          })
        }
        
        // Log activity
        await prisma.activityLog.create({
          data: {
            userId: host.userId,
            action: 'trip_ended',
            entityType: 'booking',
            entityId: bookingId,
            metadata: {
              bookingCode: booking.bookingCode,
              endMileage: endData.mileage,
              milesDriven: milesDriven
            }
          }
        })
        
        return NextResponse.json({
          success: true,
          message: 'Trip ended successfully'
        })
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Booking action error:', error)
    return NextResponse.json(
      { error: 'Failed to process booking action' },
      { status: 500 }
    )
  }
}