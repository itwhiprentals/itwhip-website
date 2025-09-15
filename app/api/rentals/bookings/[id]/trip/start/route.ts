// app/api/rentals/bookings/[id]/trip/start/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { canStartTrip, validateOdometer, validateFuelLevel, validateInspectionPhotos } from '@/app/lib/trip/validation'
import { calculateTripWindow } from '@/app/lib/trip/timeWindows'

export async function POST(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
   const { id: bookingId } = await params
   const body = await request.json()
   const {
     startMileage,
     fuelLevelStart,
     inspectionPhotos,
     location,
     checklist,
     notes
   } = body

   // Get guest email from header
   const guestEmail = request.headers.get('x-guest-email')

   // Fetch booking
   const booking = await prisma.rentalBooking.findUnique({
     where: { id: bookingId },
     include: {
       car: true,
       host: true
     }
   })

   if (!booking) {
     return NextResponse.json(
       { error: 'Booking not found' },
       { status: 404 }
     )
   }

   // Verify guest access
   if (booking.guestEmail !== guestEmail && booking.renterId) {
     return NextResponse.json(
       { error: 'Unauthorized' },
       { status: 403 }
     )
   }

   // Validate trip can be started
   const canStart = canStartTrip(booking)
   if (!canStart.valid) {
     return NextResponse.json(
       { error: canStart.error },
       { status: 400 }
     )
   }

   // Validate odometer
   const odometerValidation = validateOdometer(startMileage)
   if (!odometerValidation.valid) {
     return NextResponse.json(
       { error: odometerValidation.error },
       { status: 400 }
     )
   }

   // Validate fuel level
   const fuelValidation = validateFuelLevel(fuelLevelStart)
   if (!fuelValidation.valid) {
     return NextResponse.json(
       { error: fuelValidation.error },
       { status: 400 }
     )
   }

   // Validate photos
   const photoValidation = validateInspectionPhotos(inspectionPhotos, 'start')
   if (!photoValidation.valid) {
     return NextResponse.json(
       { error: photoValidation.error },
       { status: 400 }
     )
   }

   // Start transaction to update booking and create records
   const result = await prisma.$transaction(async (tx) => {
     // Update booking with trip start data
     const updatedBooking = await tx.rentalBooking.update({
       where: { id: bookingId },
       data: {
         tripStatus: 'ACTIVE',
         tripStartedAt: new Date(),
         startMileage,
         fuelLevelStart,
         inspectionPhotosStart: JSON.stringify(inspectionPhotos),
         actualStartTime: new Date(),
         pickupLocationVerified: true,
         ...(notes && { notes })
       }
     })

     // Create inspection photo records
     const photoRecords = Object.entries(inspectionPhotos).map(([category, url]) => ({
       bookingId,
       type: 'start' as const,
       category,
       url: url as string,
       metadata: JSON.stringify({
         checklist,
         location,
         timestamp: new Date()
       })
     }))

     await tx.inspectionPhoto.createMany({
       data: photoRecords
     })

     // Create a message for trip start
     await tx.rentalMessage.create({
       data: {
         bookingId,
         senderId: 'system',
         senderType: 'admin',
         senderName: 'System',
         message: `Trip started successfully at ${new Date().toLocaleTimeString()}. Starting mileage: ${startMileage} miles, Fuel level: ${fuelLevelStart}`,
         category: 'general',
         isRead: false,
         readByAdmin: false
       }
     })

     // Create activity log
     await tx.activityLog.create({
       data: {
         action: 'TRIP_STARTED',
         entityType: 'RentalBooking',
         entityId: bookingId,
         metadata: {
           startMileage,
           fuelLevelStart,
           location,
           timestamp: new Date()
         },
         ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
       }
     })

     return updatedBooking
   })

   // Send notification to host
   if (booking.host.email) {
     // Queue email notification (implement your email service)
     console.log(`Notifying host ${booking.host.email} about trip start`)
   }

   return NextResponse.json({
     success: true,
     booking: result,
     message: 'Trip started successfully'
   })

 } catch (error) {
   console.error('Error starting trip:', error)
   return NextResponse.json(
     { error: 'Failed to start trip', details: error instanceof Error ? error.message : 'Unknown error' },
     { status: 500 }
   )
 }
}

// GET - Check trip status
export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
   const { id: bookingId } = await params
   const guestEmail = request.headers.get('x-guest-email')

   const booking = await prisma.rentalBooking.findUnique({
     where: { id: bookingId },
     select: {
       id: true,
       tripStatus: true,
       tripStartedAt: true,
       startMileage: true,
       fuelLevelStart: true,
       status: true,
       guestEmail: true,
       renterId: true
     }
   })

   if (!booking) {
     return NextResponse.json(
       { error: 'Booking not found' },
       { status: 404 }
     )
   }

   // Verify guest access
   if (booking.guestEmail !== guestEmail && booking.renterId) {
     return NextResponse.json(
       { error: 'Unauthorized' },
       { status: 403 }
     )
   }

   // Calculate if trip can be started
   const canStart = canStartTrip(booking)
   const tripWindow = calculateTripWindow(
     new Date(booking.tripStartedAt || new Date()),
     '10:00' // Use actual start time from booking
   )

   return NextResponse.json({
     tripStatus: booking.tripStatus,
     tripStartedAt: booking.tripStartedAt,
     canStart: canStart.valid,
     canStartReason: canStart.error,
     tripWindow
   })

 } catch (error) {
   console.error('Error checking trip status:', error)
   return NextResponse.json(
     { error: 'Failed to check trip status' },
     { status: 500 }
   )
 }
}