// app/api/admin/analytics/revenue/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: Request) {
 try {
   // TODO: Add admin authentication check here
   
   const { searchParams } = new URL(request.url)
   const range = searchParams.get('range') || '30d'
   
   // Calculate date range
   const now = new Date()
   let startDate = new Date()
   
   switch (range) {
     case '30d':
       startDate.setDate(now.getDate() - 30)
       break
     case '90d':
       startDate.setDate(now.getDate() - 90)
       break
     case '1y':
       startDate.setFullYear(now.getFullYear() - 1)
       break
     default:
       startDate.setDate(now.getDate() - 30)
   }

   // Get all bookings in the range
   const bookings = await prisma.rentalBooking.findMany({
     where: {
       createdAt: { gte: startDate }
     },
     include: {
       host: {
         select: {
           name: true
         }
       },
       car: {
         select: {
           carType: true
         }
       }
     }
   })

   // Calculate current month and last month
   const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
   const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
   const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

   const thisMonthRevenue = bookings
     .filter(b => b.createdAt >= currentMonthStart)
     .reduce((sum, b) => sum + b.totalAmount, 0)

   const lastMonthRevenue = bookings
     .filter(b => b.createdAt >= lastMonthStart && b.createdAt <= lastMonthEnd)
     .reduce((sum, b) => sum + b.totalAmount, 0)

   const growthRate = lastMonthRevenue > 0 
     ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
     : 0

   // Calculate additional charges revenue
   const bookingsWithCharges = bookings.filter(b => b.tripEndedAt)
   let additionalChargesRevenue = 0
   let mileageCharges = 0
   let fuelCharges = 0
   let lateCharges = 0
   let damageCharges = 0
   let cleaningCharges = 0

   bookingsWithCharges.forEach(booking => {
     // Mileage charges
     if (booking.startMileage && booking.endMileage) {
       const actualMiles = booking.endMileage - booking.startMileage
       const includedMiles = (booking.numberOfDays || 1) * 200
       const overageMiles = Math.max(0, actualMiles - includedMiles)
       const charge = overageMiles * 0.45
       mileageCharges += charge
       additionalChargesRevenue += charge
     }

     // Fuel charges
     if (booking.fuelLevelStart && booking.fuelLevelEnd && booking.fuelLevelStart !== booking.fuelLevelEnd) {
       const charge = 75 // Flat rate for simplicity
       fuelCharges += charge
       additionalChargesRevenue += charge
     }

     // Late return charges
     if (booking.tripEndedAt && booking.endDate && new Date(booking.tripEndedAt) > new Date(booking.endDate)) {
       const hoursLate = Math.ceil((new Date(booking.tripEndedAt).getTime() - new Date(booking.endDate).getTime()) / (1000 * 60 * 60))
       const charge = hoursLate * 25
       lateCharges += charge
       additionalChargesRevenue += charge
     }

     // Damage charges
     if (booking.damageReported) {
       const charge = 500 // Base damage charge
       damageCharges += charge
       additionalChargesRevenue += charge
     }
   })

   // Calculate refunded amount
   const refundedAmount = bookings
     .filter(b => (b.paymentStatus as string) === 'refunded')
     .reduce((sum, b) => sum + b.totalAmount, 0)

   const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0)
   const netRevenue = totalRevenue + additionalChargesRevenue - refundedAmount

   // Revenue breakdown by source
   const bySource = [
     { 
       source: 'Base Rentals', 
       amount: totalRevenue,
       percentage: (totalRevenue / netRevenue) * 100
     },
     { 
       source: 'Additional Charges', 
       amount: additionalChargesRevenue,
       percentage: (additionalChargesRevenue / netRevenue) * 100
     },
     { 
       source: 'Refunds', 
       amount: -refundedAmount,
       percentage: -(refundedAmount / netRevenue) * 100
     }
   ]

   // Revenue by host
   const hostRevenue = bookings.reduce((acc, booking) => {
     const hostName = booking.host.name
     if (!acc[hostName]) {
       acc[hostName] = { revenue: 0, trips: 0 }
     }
     acc[hostName].revenue += booking.totalAmount
     acc[hostName].trips++
     return acc
   }, {} as Record<string, { revenue: number; trips: number }>)

   const byHost = Object.entries(hostRevenue)
     .map(([host, data]) => ({
       host,
       revenue: data.revenue,
       trips: data.trips
     }))
     .sort((a, b) => b.revenue - a.revenue)
     .slice(0, 10)

   // Revenue by vehicle type
   const vehicleRevenue = bookings.reduce((acc, booking) => {
     const type = booking.car.carType || 'unknown'
     if (!acc[type]) {
       acc[type] = { revenue: 0, trips: 0 }
     }
     acc[type].revenue += booking.totalAmount
     acc[type].trips++
     return acc
   }, {} as Record<string, { revenue: number; trips: number }>)

   const byVehicleType = Object.entries(vehicleRevenue)
     .map(([type, data]) => ({
       type,
       revenue: data.revenue,
       trips: data.trips
     }))
     .sort((a, b) => b.revenue - a.revenue)

   // Monthly breakdown
   const monthlyData: Record<string, { revenue: number; bookings: number }> = {}
   
   bookings.forEach(booking => {
     const monthKey = new Date(booking.createdAt).toLocaleDateString('en-US', { 
       year: 'numeric', 
       month: 'short' 
     })
     if (!monthlyData[monthKey]) {
       monthlyData[monthKey] = { revenue: 0, bookings: 0 }
     }
     monthlyData[monthKey].revenue += booking.totalAmount
     monthlyData[monthKey].bookings++
   })

   const byMonth = Object.entries(monthlyData)
     .map(([month, data]) => ({
       month,
       revenue: data.revenue,
       bookings: data.bookings
     }))
     .sort((a, b) => {
       const dateA = new Date(a.month)
       const dateB = new Date(b.month)
       return dateA.getTime() - dateB.getTime()
     })

   // Calculate charge success rate
   const chargedCount = bookings.filter(b => (b.paymentStatus as string) === 'paid').length
   const failedCount = bookings.filter(b => (b.paymentStatus as string) === 'failed').length
   const chargeSuccessRate = chargedCount + failedCount > 0
     ? (chargedCount / (chargedCount + failedCount)) * 100
     : 100

   // Calculate payouts
   const hostEarnings = totalRevenue * 0.8 // 80% to hosts
   const platformCommission = totalRevenue * 0.2 // 20% platform fee

   const pendingPayouts = await prisma.hostPayout.aggregate({
     _sum: { amount: true },
     where: { status: 'PENDING' }
   })

   const processedThisWeek = await prisma.hostPayout.aggregate({
     _sum: { amount: true },
     where: {
       status: 'COMPLETED',
       processedAt: {
         gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
       }
     }
   })

   return NextResponse.json({
     summary: {
       totalRevenue,
       thisMonth: thisMonthRevenue,
       lastMonth: lastMonthRevenue,
       growthRate,
       averageBookingValue: bookings.length > 0 ? totalRevenue / bookings.length : 0,
       additionalChargesRevenue,
       refundedAmount,
       netRevenue
     },
     breakdown: {
       bySource,
       byHost,
       byVehicleType,
       byMonth
     },
     charges: {
       mileageCharges,
       fuelCharges,
       lateCharges,
       damageCharges,
       cleaningCharges,
       totalAdditionalCharges: additionalChargesRevenue,
       chargeSuccessRate
     },
     payouts: {
       pendingPayouts: Number(pendingPayouts._sum.amount || 0),
       processedThisWeek: Number(processedThisWeek._sum.amount || 0),
       averagePayoutTime: 3.5, // days - would calculate from data
       totalHostEarnings: hostEarnings,
       platformCommission
     }
   })

 } catch (error) {
   console.error('Failed to load revenue analytics:', error)
   return NextResponse.json(
     { error: 'Failed to load revenue analytics' },
     { status: 500 }
   )
 }
}