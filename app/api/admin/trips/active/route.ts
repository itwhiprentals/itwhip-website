// app/api/admin/trips/active/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: Request) {
 try {
   // TODO: Add admin authentication check here
   // const isAdmin = await checkAdminAuth(request)
   // if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

   const now = new Date()
   
   // Get all active trips with full details
   const activeTrips = await (prisma.rentalBooking.findMany as any)({
     where: {
       tripStatus: 'ACTIVE'
     },
     include: {
       car: {
         select: {
           id: true,
           make: true,
           model: true,
           year: true,
           licensePlate: true,
           currentMileage: true
         }
       },
       host: {
         select: {
           name: true,
           phone: true,
           email: true
         }
       },
       InspectionPhoto: {
         where: {
           type: 'start'
         },
         select: {
           id: true
         }
       }
     },
     orderBy: {
       tripStartedAt: 'desc'
     }
   }) as any[]

   // Format trips with calculated fields
   const formattedTrips = activeTrips.map(trip => {
     const endDate = new Date(trip.endDate)
     const startDate = trip.tripStartedAt ? new Date(trip.tripStartedAt) : new Date()
     const isOverdue = endDate < now
     const hoursOverdue = isOverdue 
       ? Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60))
       : 0
     
     // Calculate daily mileage limit
     const numberOfDays = trip.numberOfDays || 1
     const dailyMileageLimit = 200 // Default 200 miles per day
     const totalMileageAllowed = numberOfDays * dailyMileageLimit

     return {
       id: trip.id,
       bookingCode: trip.bookingCode,
       guestName: trip.guestName || 'Guest',
       guestEmail: trip.guestEmail || '',
       guestPhone: trip.guestPhone || '',
       car: {
         id: trip.car.id,
         make: trip.car.make,
         model: trip.car.model,
         year: trip.car.year,
         licensePlate: trip.car.licensePlate || 'N/A',
         currentMileage: trip.car.currentMileage || 0
       },
       host: {
         name: trip.host.name,
         phone: trip.host.phone,
         email: trip.host.email
       },
       tripStartedAt: trip.tripStartedAt?.toISOString() || '',
       startDate: trip.startDate.toISOString(),
       endDate: trip.endDate.toISOString(),
       startMileage: trip.startMileage || 0,
       fuelLevelStart: trip.fuelLevelStart || 'Unknown',
       pickupLocation: trip.pickupLocation,
       returnLocation: trip.returnLocation || trip.pickupLocation,
       pickupWindowEnd: trip.pickupWindowEnd?.toISOString() || '',
       numberOfDays: numberOfDays,
       dailyMileageLimit: dailyMileageLimit,
       totalAmount: trip.totalAmount,
       depositAmount: trip.depositAmount,
       isOverdue,
       hoursOverdue,
       lastUpdate: trip.updatedAt.toISOString(),
       inspectionPhotosCount: (trip.InspectionPhoto || []).length
     }
   })

   return NextResponse.json({
     trips: formattedTrips,
     total: formattedTrips.length
   })

 } catch (error) {
   console.error('Failed to load active trips:', error)
   return NextResponse.json(
     { error: 'Failed to load active trips' },
     { status: 500 }
   )
 }
}

// Handle admin ending a trip
export async function POST(request: Request) {
 try {
   // TODO: Add admin authentication check here
   
   const body = await request.json()
   const { tripId, endedBy, reason } = body

   if (!tripId) {
     return NextResponse.json(
       { error: 'Trip ID is required' },
       { status: 400 }
     )
   }

   // Update the trip to ended status
   const updatedBooking = await prisma.rentalBooking.update({
     where: { id: tripId },
     data: {
       tripStatus: 'COMPLETED',
       tripEndedAt: new Date(),
       actualEndTime: new Date(),
       notes: `Admin ended trip. Reason: ${reason || 'No reason provided'}. Ended by: ${endedBy || 'admin'}`
     }
   })

   return NextResponse.json({
     success: true,
     booking: updatedBooking
   })

 } catch (error) {
   console.error('Failed to end trip:', error)
   return NextResponse.json(
     { error: 'Failed to end trip' },
     { status: 500 }
   )
 }
}