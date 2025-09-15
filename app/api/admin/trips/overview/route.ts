// app/api/admin/trips/overview/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: Request) {
 try {
   // TODO: Add admin authentication check here
   // const isAdmin = await checkAdminAuth(request)
   // if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

   const now = new Date()
   const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
   
   // Get all statistics in parallel
   const [
     activeTrips,
     pendingStart,
     completedToday,
     overdueReturns,
     openDisputes,
     todayRevenue
   ] = await Promise.all([
     // Active trips
     prisma.rentalBooking.count({ 
       where: { tripStatus: 'ACTIVE' } 
     }),
     
     // Confirmed bookings ready to start
     prisma.rentalBooking.count({ 
       where: { 
         status: 'CONFIRMED',
         tripStatus: 'NOT_STARTED'
       } 
     }),
     
     // Trips ended today
     prisma.rentalBooking.count({ 
       where: { 
         tripEndedAt: { 
           gte: todayStart 
         } 
       } 
     }),
     
     // Overdue returns
     prisma.rentalBooking.count({ 
       where: { 
         tripStatus: 'ACTIVE',
         endDate: { lt: now } 
       } 
     }),
     
     // Open disputes
     prisma.rentalDispute.count({ 
       where: { status: 'OPEN' } 
     }),
     
     // Today's revenue
     prisma.rentalBooking.aggregate({
       _sum: {
         totalAmount: true
       },
       where: {
         tripEndedAt: {
           gte: todayStart
         },
         status: 'COMPLETED'
       }
     })
   ])

   // Get active trips with details for the table
   const activeTripsDetails = await prisma.rentalBooking.findMany({
     where: { 
       tripStatus: 'ACTIVE' 
     },
     include: {
       car: {
         select: {
           make: true,
           model: true,
           year: true
         }
       }
     },
     orderBy: {
       tripStartedAt: 'desc'
     },
     take: 10
   })

   // Format active trips for response
   const formattedActiveTrips = activeTripsDetails.map(trip => {
     const now = new Date()
     const isOverdue = new Date(trip.endDate) < now
     const hoursOverdue = isOverdue 
       ? Math.floor((now.getTime() - new Date(trip.endDate).getTime()) / (1000 * 60 * 60))
       : 0

     return {
       id: trip.id,
       bookingCode: trip.bookingCode,
       guestName: trip.guestName || 'Guest',
       guestEmail: trip.guestEmail || '',
       guestPhone: trip.guestPhone || '',
       car: {
         make: trip.car.make,
         model: trip.car.model,
         year: trip.car.year
       },
       tripStartedAt: trip.tripStartedAt,
       endDate: trip.endDate,
       startMileage: trip.startMileage || 0,
       currentDuration: trip.tripStartedAt ? 
         Math.floor((now.getTime() - new Date(trip.tripStartedAt).getTime()) / (1000 * 60 * 60)) + 'h' 
         : '0h',
       isOverdue,
       hoursOverdue,
       pickupLocation: trip.pickupLocation
     }
   })

   return NextResponse.json({
     stats: {
       activeTrips,
       pendingStart,
       completedToday,
       overdueReturns,
       openDisputes,
       todayRevenue: todayRevenue._sum.totalAmount || 0
     },
     activeTrips: formattedActiveTrips
   })

 } catch (error) {
   console.error('Failed to load trip overview:', error)
   return NextResponse.json(
     { error: 'Failed to load trip overview data' },
     { status: 500 }
   )
 }
}