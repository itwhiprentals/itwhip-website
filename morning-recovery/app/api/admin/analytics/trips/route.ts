// app/api/admin/analytics/trips/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: Request) {
 try {
   // TODO: Add admin authentication check here
   
   const { searchParams } = new URL(request.url)
   const period = searchParams.get('period') || 'week'
   
   // Calculate date range based on period
   const now = new Date()
   let startDate = new Date()
   
   switch (period) {
     case 'today':
       startDate.setHours(0, 0, 0, 0)
       break
     case 'week':
       startDate.setDate(now.getDate() - 7)
       break
     case 'month':
       startDate.setMonth(now.getMonth() - 1)
       break
     default:
       startDate.setDate(now.getDate() - 7)
   }

   // Get all trips in the period
   const trips = await prisma.rentalBooking.findMany({
     where: {
       tripStartedAt: {
         gte: startDate
       }
     },
     include: {
       host: {
         select: {
           name: true
         }
       },
       disputes: true
     }
   })

   // Calculate summary statistics
   const activeTrips = await prisma.rentalBooking.count({
     where: { tripStatus: 'ACTIVE' }
   })

   const completedToday = await prisma.rentalBooking.count({
     where: {
       tripEndedAt: {
         gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
       }
     }
   })

   // Calculate averages and rates
   const completedTrips = trips.filter(t => t.tripEndedAt)
   
   const averageDuration = completedTrips.length > 0
     ? completedTrips.reduce((sum, trip) => {
         if (trip.tripStartedAt && trip.tripEndedAt) {
           const duration = trip.tripEndedAt.getTime() - trip.tripStartedAt.getTime()
           return sum + (duration / (1000 * 60 * 60)) // Convert to hours
         }
         return sum
       }, 0) / completedTrips.length
     : 0

   const averageMileage = completedTrips.length > 0
     ? completedTrips.reduce((sum, trip) => {
         if (trip.startMileage && trip.endMileage) {
           return sum + (trip.endMileage - trip.startMileage)
         }
         return sum
       }, 0) / completedTrips.length
     : 0

   const overdueCount = trips.filter(t => 
     t.tripStatus === 'ACTIVE' && new Date(t.endDate) < now
   ).length
   const overdueRate = trips.length > 0 ? (overdueCount / trips.length) * 100 : 0

   const damageCount = trips.filter(t => t.damageReported).length
   const damageRate = trips.length > 0 ? (damageCount / trips.length) * 100 : 0

   const chargesCount = completedTrips.filter(t => {
     const hasOverageMiles = t.startMileage && t.endMileage && 
       (t.endMileage - t.startMileage) > ((t.numberOfDays || 1) * 200)
     const hasFuelCharge = t.fuelLevelStart !== t.fuelLevelEnd
     return hasOverageMiles || hasFuelCharge
   }).length
   const additionalChargesRate = completedTrips.length > 0 
     ? (chargesCount / completedTrips.length) * 100 : 0

   const totalRevenue = trips.reduce((sum, t) => sum + t.totalAmount, 0)
   const averageRevenue = trips.length > 0 ? totalRevenue / trips.length : 0

   // Group by host for top performers
   const hostStats = trips.reduce((acc, trip) => {
     const hostName = trip.host.name
     if (!acc[hostName]) {
       acc[hostName] = { trips: 0, revenue: 0 }
     }
     acc[hostName].trips++
     acc[hostName].revenue += trip.totalAmount
     return acc
   }, {} as Record<string, { trips: number; revenue: number }>)

   const topHosts = Object.entries(hostStats)
     .map(([name, stats]) => ({
       name,
       trips: stats.trips,
       revenue: stats.revenue,
       averageRating: 4.8 // Would need to calculate from reviews
     }))
     .sort((a, b) => b.revenue - a.revenue)
     .slice(0, 10)

   // Calculate trends (simplified - would need historical data)
   const last7Days = Array.from({ length: 7 }, (_, i) => {
     const date = new Date()
     date.setDate(date.getDate() - (6 - i))
     return date
   })

   const trends = {
     dates: last7Days.map(d => d.toLocaleDateString('en-US', { weekday: 'short' })),
     trips: last7Days.map(date => {
       const dayStart = new Date(date)
       dayStart.setHours(0, 0, 0, 0)
       const dayEnd = new Date(date)
       dayEnd.setHours(23, 59, 59, 999)
       
       return trips.filter(t => 
         t.tripStartedAt && 
         t.tripStartedAt >= dayStart && 
         t.tripStartedAt <= dayEnd
       ).length
     }),
     revenue: last7Days.map(date => {
       const dayStart = new Date(date)
       dayStart.setHours(0, 0, 0, 0)
       const dayEnd = new Date(date)
       dayEnd.setHours(23, 59, 59, 999)
       
       return trips
         .filter(t => 
           t.tripStartedAt && 
           t.tripStartedAt >= dayStart && 
           t.tripStartedAt <= dayEnd
         )
         .reduce((sum, t) => sum + t.totalAmount, 0)
     }),
     mileage: last7Days.map(() => Math.floor(Math.random() * 500) + 100) // Placeholder
   }

   // Calculate distribution data
   const distribution = {
     byDuration: [
       { range: '0-2 days', count: completedTrips.filter(t => t.numberOfDays <= 2).length },
       { range: '3-5 days', count: completedTrips.filter(t => t.numberOfDays > 2 && t.numberOfDays <= 5).length },
       { range: '6-7 days', count: completedTrips.filter(t => t.numberOfDays > 5 && t.numberOfDays <= 7).length },
       { range: '8+ days', count: completedTrips.filter(t => t.numberOfDays > 7).length }
     ],
     byMileage: [
       { range: '0-100 mi', count: completedTrips.filter(t => {
         const miles = (t.endMileage || 0) - (t.startMileage || 0)
         return miles <= 100
       }).length },
       { range: '101-300 mi', count: completedTrips.filter(t => {
         const miles = (t.endMileage || 0) - (t.startMileage || 0)
         return miles > 100 && miles <= 300
       }).length },
       { range: '301-500 mi', count: completedTrips.filter(t => {
         const miles = (t.endMileage || 0) - (t.startMileage || 0)
         return miles > 300 && miles <= 500
       }).length },
       { range: '500+ mi', count: completedTrips.filter(t => {
         const miles = (t.endMileage || 0) - (t.startMileage || 0)
         return miles > 500
       }).length }
     ],
     byDayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => ({
       day,
       count: trips.filter(t => 
         t.tripStartedAt && t.tripStartedAt.getDay() === index
       ).length
     })),
     byHour: Array.from({ length: 24 }, (_, hour) => ({
       hour,
       count: trips.filter(t => 
         t.tripStartedAt && t.tripStartedAt.getHours() === hour
       ).length
     }))
   }

   // Check for issues - FIXED: Using correct uppercase enum values
   const issues = {
     overdueTrips: overdueCount,
     unresolvedDisputes: await prisma.rentalDispute.count({
       where: { status: { in: ['OPEN', 'INVESTIGATING'] } }
     }),
     failedCharges: await prisma.rentalBooking.count({
       where: { paymentStatus: 'FAILED' } // FIXED: Changed from 'failed' to 'FAILED'
     }),
     missingPhotos: await prisma.rentalBooking.count({
       where: {
         tripStatus: 'ACTIVE',
         inspectionPhotosStart: null // FIXED: Changed from incorrect relation query
       }
     })
   }

   return NextResponse.json({
     summary: {
       totalTrips: trips.length,
       activeTrips,
       completedToday,
       averageDuration,
       averageMileage,
       overdueRate,
       damageRate,
       additionalChargesRate,
       totalRevenue,
       averageRevenue
     },
     trends,
     distribution,
     topHosts,
     issues
   })

 } catch (error) {
   console.error('Failed to load trip analytics:', error)
   return NextResponse.json(
     { error: 'Failed to load trip analytics' },
     { status: 500 }
   )
 }
}