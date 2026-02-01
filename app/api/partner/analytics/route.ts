// app/api/partner/analytics/route.ts
// GET /api/partner/analytics - Get partner analytics data

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export async function GET(request: NextRequest) {
  try {
    // Check Authorization header first (mobile app), then fall back to cookies
    const authHeader = request.headers.get('authorization')
    let token: string | undefined
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
    if (!token) {
      const cookieStore = await cookies()
      // Accept both partner_token AND hostAccessToken for unified portal
      token = cookieStore.get('partner_token')?.value ||
                    cookieStore.get('hostAccessToken')?.value
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify JWT
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    // Get time range from query params
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'

    // Calculate date range
    const now = new Date()
    let startDate: Date
    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '12m':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get partner with cars
    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: {
        cars: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            rating: true,
            totalTrips: true
          }
        }
      }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    const vehicleIds = partner.cars.map(c => c.id)

    // Get bookings in range
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        carId: { in: vehicleIds },
        createdAt: { gte: startDate }
      },
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true
          }
        }
      }
    })

    // Calculate overview stats
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED')
    const confirmedBookings = bookings.filter(b => ['CONFIRMED', 'ACTIVE'].includes(b.status))
    const pendingBookings = bookings.filter(b => b.status === 'PENDING')

    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0)
    const upcomingRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0)
    const pendingRevenue = pendingBookings.reduce((sum, b) => sum + b.totalAmount, 0)

    const totalBookings = bookings.length
    // Calculate avg from all bookings (not just completed) to show meaningful values
    const allBookingAmounts = bookings.filter(b => b.totalAmount > 0)
    const avgBookingValue = allBookingAmounts.length > 0
      ? allBookingAmounts.reduce((sum, b) => sum + b.totalAmount, 0) / allBookingAmounts.length
      : 0

    // Calculate average trip duration
    const tripDurations = completedBookings.map(b => {
      const start = new Date(b.startDate)
      const end = new Date(b.endDate)
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    })
    const avgTripDuration = tripDurations.length > 0
      ? Math.round(tripDurations.reduce((a, b) => a + b, 0) / tripDurations.length)
      : 0

    // Calculate utilization rate
    const totalVehicleDays = partner.cars.length * Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const bookedDays = bookings.reduce((sum, b) => {
      const start = new Date(b.startDate)
      const end = new Date(b.endDate)
      return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    }, 0)
    const utilizationRate = totalVehicleDays > 0 ? Math.round((bookedDays / totalVehicleDays) * 100) : 0

    // Get average rating
    const avgRating = partner.averageRating || 0

    // Calculate bookings by status
    const statusCounts: Record<string, number> = {}
    bookings.forEach(b => {
      const status = b.status.toLowerCase()
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })
    const bookingsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }))

    // Calculate revenue by month
    const revenueByMonth: Record<string, { gross: number; net: number; commission: number }> = {}
    const commissionRate = partner.currentCommissionRate || 0.25

    completedBookings.forEach(booking => {
      const monthKey = new Date(booking.createdAt).toLocaleString('en-US', { month: 'short' })
      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = { gross: 0, net: 0, commission: 0 }
      }
      revenueByMonth[monthKey].gross += booking.totalAmount
      revenueByMonth[monthKey].net += booking.totalAmount * (1 - commissionRate)
      revenueByMonth[monthKey].commission += booking.totalAmount * commissionRate
    })

    const revenueByMonthArray = Object.entries(revenueByMonth).map(([month, data]) => ({
      month,
      ...data
    }))

    // Calculate top vehicles
    const vehicleStats: Record<string, { name: string; bookings: number; revenue: number; rating: number }> = {}
    bookings.forEach(booking => {
      if (booking.car) {
        const carId = booking.carId
        const carName = `${booking.car.year} ${booking.car.make} ${booking.car.model}`
        if (!vehicleStats[carId]) {
          const carData = partner.cars.find(c => c.id === carId)
          vehicleStats[carId] = {
            name: carName,
            bookings: 0,
            revenue: 0,
            rating: carData?.rating || 0
          }
        }
        vehicleStats[carId].bookings++
        if (booking.status === 'COMPLETED') {
          vehicleStats[carId].revenue += booking.totalAmount
        }
      }
    })

    const topVehicles = Object.entries(vehicleStats)
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Calculate growth (compare to previous period)
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
    const previousBookings = await prisma.rentalBooking.findMany({
      where: {
        carId: { in: vehicleIds },
        createdAt: {
          gte: previousStartDate,
          lt: startDate
        },
        status: 'COMPLETED'
      }
    })

    const previousRevenue = previousBookings.reduce((sum, b) => sum + b.totalAmount, 0)
    const revenueGrowth = previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : totalRevenue > 0 ? 100 : 0

    const bookingGrowth = previousBookings.length > 0
      ? ((completedBookings.length - previousBookings.length) / previousBookings.length) * 100
      : completedBookings.length > 0 ? 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalRevenue,
          upcomingRevenue,
          pendingRevenue,
          upcomingBookingsCount: confirmedBookings.length,
          pendingBookingsCount: pendingBookings.length,
          totalBookings,
          avgBookingValue: avgBookingValue || 0,
          avgTripDuration,
          utilizationRate,
          avgRating,
          totalReviews: partner.totalReviews || 0,
          repeatCustomerRate: 0 // TODO: Calculate from actual data
        },
        revenueByMonth: revenueByMonthArray,
        bookingsByStatus,
        topVehicles,
        revenueGrowth,
        bookingGrowth
      }
    })

  } catch (error: any) {
    console.error('[Partner Analytics] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
