// app/api/admin/trips/inspections/[id]/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import crypto from 'crypto'

export async function GET(
 request: Request,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
   // TODO: Add admin authentication check here

   const { id: bookingId } = await params

   // Get booking with all related data
   const booking = await prisma.rentalBooking.findUnique({
     where: { id: bookingId },
     include: {
       car: {
         select: {
           make: true,
           model: true,
           year: true
         }
       },
       InspectionPhoto: {
         orderBy: {
           uploadedAt: 'asc'
         }
       },
       messages: {
         where: {
           category: { in: ['general', 'issue'] }
         },
         orderBy: {
           createdAt: 'desc'
         },
         take: 20
       }
     }
   })

   if (!booking) {
     return NextResponse.json(
       { error: 'Booking not found' },
       { status: 404 }
     )
   }

   // Separate photos by type
   const startPhotos = booking.InspectionPhoto
     .filter(photo => photo.type === 'start')
     .map(photo => ({
       id: photo.id,
       type: photo.type,
       category: photo.category,
       url: photo.url,
       uploadedAt: photo.uploadedAt.toISOString(),
       metadata: photo.metadata
     }))

   const endPhotos = booking.InspectionPhoto
     .filter(photo => photo.type === 'end')
     .map(photo => ({
       id: photo.id,
       type: photo.type,
       category: photo.category,
       url: photo.url,
       uploadedAt: photo.uploadedAt.toISOString(),
       metadata: photo.metadata
     }))

   // Calculate suggested refunds if there are charges
   const suggestedRefunds = []
   
   // If there's mileage overage
   if (booking.startMileage && booking.endMileage) {
     const actualMiles = booking.endMileage - booking.startMileage
     const includedMiles = (booking.numberOfDays || 1) * 200
     const overageMiles = Math.max(0, actualMiles - includedMiles)
     if (overageMiles > 0) {
       suggestedRefunds.push({
         label: 'Full mileage refund',
         amount: overageMiles * 0.45
       })
       suggestedRefunds.push({
         label: '50% mileage refund',
         amount: (overageMiles * 0.45) / 2
       })
     }
   }

   // If there's fuel charge
   if (booking.fuelLevelStart !== booking.fuelLevelEnd) {
     suggestedRefunds.push({
       label: 'Fuel charge refund',
       amount: 75
     })
   }

   // Get any dispute activities
   const activities = await prisma.rentalDispute.findMany({
     where: { bookingId },
     orderBy: { createdAt: 'desc' }
   })

   const inspectionData = {
     bookingId: booking.id,
     bookingCode: booking.bookingCode,
     guestName: booking.guestName || 'Guest',
     car: {
       make: booking.car.make,
       model: booking.car.model,
       year: booking.car.year
     },
     tripStartedAt: booking.tripStartedAt?.toISOString() || null,
     tripEndedAt: booking.tripEndedAt?.toISOString() || null,
     startMileage: booking.startMileage || 0,
     endMileage: booking.endMileage || null,
     fuelLevelStart: booking.fuelLevelStart || 'Unknown',
     fuelLevelEnd: booking.fuelLevelEnd || null,
     damageReported: booking.damageReported,
     damageDescription: booking.damageDescription,
     startPhotos,
     endPhotos,
     booking: {
       id: booking.id,
       bookingCode: booking.bookingCode,
       guestName: booking.guestName,
       guestEmail: booking.guestEmail,
       guestPhone: booking.guestPhone,
       totalAmount: booking.totalAmount,
       startDate: booking.startDate.toISOString(),
       endDate: booking.endDate.toISOString(),
       tripStartedAt: booking.tripStartedAt?.toISOString(),
       tripEndedAt: booking.tripEndedAt?.toISOString(),
       startMileage: booking.startMileage,
       endMileage: booking.endMileage,
       car: {
         make: booking.car.make,
         model: booking.car.model,
         year: booking.car.year
       },
       messages: booking.messages.map(msg => ({
         id: msg.id,
         message: msg.message,
         senderType: msg.senderType,
         createdAt: msg.createdAt.toISOString()
       }))
     }
   }

   // Get trip data for metrics
   const tripData = {
     startMileage: booking.startMileage,
     endMileage: booking.endMileage,
     fuelLevelStart: booking.fuelLevelStart,
     fuelLevelEnd: booking.fuelLevelEnd,
     damageReported: booking.damageReported,
     damageDescription: booking.damageDescription
   }

   return NextResponse.json({
     ...inspectionData,
     suggestedRefunds,
     activities: activities.map(a => ({
       action: a.type,
       createdAt: a.createdAt.toISOString()
     }))
   })

 } catch (error) {
   console.error('Failed to load inspection data:', error)
   return NextResponse.json(
     { error: 'Failed to load inspection data' },
     { status: 500 }
   )
 }
}

// Flag damage on a trip
export async function POST(
 request: Request,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
   // TODO: Add admin authentication check here

   const { id: bookingId } = await params
   const body = await request.json()
   const { damageReported, damageDescription } = body

   // Update booking with damage report
   const updatedBooking = await prisma.rentalBooking.update({
     where: { id: bookingId },
     data: {
       damageReported,
       damageDescription,
       notes: `Admin flagged damage: ${damageDescription}`
     }
   })

   // Create a dispute if damage is reported
   if (damageReported) {
     await prisma.rentalDispute.create({
       data: {
         id: crypto.randomUUID(),
         bookingId,
         type: 'DAMAGE',
         description: damageDescription || 'Damage reported by admin',
         status: 'OPEN'
       }
     })
   }

   return NextResponse.json({
     success: true,
     booking: updatedBooking
   })

 } catch (error) {
   console.error('Failed to flag damage:', error)
   return NextResponse.json(
     { error: 'Failed to flag damage' },
     { status: 500 }
   )
 }
}