// app/api/rentals/bookings/[id]/trip/start/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { canStartTrip, isHandoffComplete, validateOdometer, validateFuelLevel, validateInspectionPhotos } from '@/app/lib/trip/validation'
import { calculateTripWindow } from '@/app/lib/trip/timeWindows'

// ========== 🆕 ACTIVITY TRACKING IMPORT ==========
import { trackActivity } from '@/lib/helpers/guestProfileStatus'

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

   // Verify JWT auth
   const user = await verifyRequest(request)
   if (!user) {
     return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
   }

   // Fetch booking
   const booking = await prisma.rentalBooking.findUnique({
     where: { id: bookingId },
     include: {
       car: true,
       host: true
     }
   }) as any

   if (!booking) {
     return NextResponse.json(
       { error: 'Booking not found' },
       { status: 404 }
     )
   }

   // Verify ownership via JWT identity
   const isOwner = (user.id && booking.renterId === user.id) ||
                   (user.email && booking.guestEmail === user.email)
   if (!isOwner) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
   }

   // Validate trip can be started
   const canStart = canStartTrip(booking)
   if (!canStart.valid) {
     return NextResponse.json(
       { error: canStart.error },
       { status: 400 }
     )
   }

   // Verify handoff is complete
   if (!isHandoffComplete(booking)) {
     return NextResponse.json(
       { error: 'Handoff verification must be completed before starting the trip' },
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
       id: crypto.randomUUID(),
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
       data: photoRecords as any
     })

     // Create a message for trip start
     await tx.rentalMessage.create({
       data: {
         id: crypto.randomUUID(),
         bookingId,
         senderId: 'system',
         senderType: 'admin',
         senderName: 'System',
         message: `Trip started successfully at ${new Date().toLocaleTimeString()}. Starting mileage: ${startMileage} miles, Fuel level: ${fuelLevelStart}`,
         category: 'general',
         isRead: false,
         readByAdmin: false,
         updatedAt: new Date()
       } as any
     })

     // Create activity log
     await (tx.activityLog.create as any)({
       data: {
         id: crypto.randomUUID(),
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

   // ========== 🆕 TRACK TRIP START ACTIVITY ==========
   // This populates the guest's activity timeline for the Status Tab
   // Wrapped in try-catch - won't break trip start if tracking fails
   try {
     // Find guest's ReviewerProfile ID
     let guestProfileId = booking.reviewerProfileId
     
     if (!guestProfileId && booking.guestEmail) {
       const reviewerProfile = await prisma.reviewerProfile.findFirst({
         where: { email: booking.guestEmail },
         select: { id: true }
       })
       guestProfileId = reviewerProfile?.id
     }

     if (guestProfileId) {
       await trackActivity(guestProfileId, {
         action: 'TRIP_STARTED',
         description: `Trip started for ${booking.car.year} ${booking.car.make} ${booking.car.model}`,
         metadata: {
           bookingId: booking.id,
           bookingCode: booking.bookingCode,
           carName: `${booking.car.year} ${booking.car.make} ${booking.car.model}`,
           startMileage,
           fuelLevelStart,
           location,
           photoCount: Object.keys(inspectionPhotos).length,
           tripStartedAt: new Date().toISOString(),
           ...(checklist && { checklist })
         }
       })

       console.log('✅ Trip start tracked in guest timeline:', {
         guestId: guestProfileId,
         bookingId: booking.id
       })
     } else {
       console.warn('⚠️ Could not find guest profile for trip start tracking')
     }
   } catch (trackingError) {
     console.error('❌ Failed to track trip start activity:', trackingError)
     // Continue without breaking - tracking is non-critical
   }
   // ========== END ACTIVITY TRACKING ==========

   // Send notifications to host and guest (fire-and-forget)
   if (booking.host.email) {
     console.log(`Notifying host ${booking.host.email} about trip start`)
   }
   import('@/app/lib/twilio/sms-triggers').then(({ sendTripStartedSms }) => {
     sendTripStartedSms({
       bookingCode: booking.bookingCode,
       guestPhone: booking.guestPhone,
       guestId: booking.reviewerProfileId,
       hostPhone: booking.host.phone,
       guestName: booking.guestName,
       car: booking.car,
       bookingId: booking.id,
       hostId: booking.hostId,
     }).catch(e => console.error('[Trip Start] SMS failed:', e))
   }).catch(e => console.error('[SMS] sms-triggers import failed:', e))

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

   // Verify JWT auth
   const user = await verifyRequest(request)
   if (!user) {
     return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
   }

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

   // Verify ownership via JWT identity
   const isOwner = (user.id && booking.renterId === user.id) ||
                   (user.email && booking.guestEmail === user.email)
   if (!isOwner) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
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