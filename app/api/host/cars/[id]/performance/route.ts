// app/api/host/cars/[id]/performance/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carId } = await params

    console.log('📊 ===== FETCHING PERFORMANCE METRICS FOR CAR:', carId, '=====')

    // Fetch vehicle with basic info
    const vehicle = await prisma.rentalCar.findUnique({
      where: { id: carId },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        hostId: true,
        dailyRate: true,
        totalTrips: true,
        rating: true,
        createdAt: true,
        isActive: true,
        esgScore: true,
        esgEnvironmentalScore: true,
        esgSafetyScore: true,
        esgMaintenanceScore: true,
        esgLastCalculated: true
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Fetch all completed bookings for this car
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        carId,
        status: {
          in: ['COMPLETED', 'ACTIVE']
        }
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        numberOfDays: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        startMileage: true,
        endMileage: true
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    console.log(`📊 Found ${bookings.length} bookings`)

    // Fetch reviews for guest satisfaction
    const reviews = await prisma.rentalReview.findMany({
      where: { carId },
      select: {
        rating: true,
        cleanliness: true,
        accuracy: true,
        communication: true,
        convenience: true,
        value: true,
        createdAt: true
      }
    })

    // Calculate revenue metrics
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED')
    const activeBookings = bookings.filter(b => b.status === 'ACTIVE')

    // Calculate average booking value
    const avgBookingValue = bookings.length > 0 ? totalRevenue / bookings.length : 0

    // Calculate utilization rate
    const now = new Date()
    const vehicleAge = Math.floor((now.getTime() - vehicle.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    const totalBookedDays = bookings.reduce((sum, b) => sum + (b.numberOfDays || 0), 0)
    const utilizationRate = vehicleAge > 0 ? (totalBookedDays / vehicleAge) * 100 : 0

    // Calculate average trip length
    const avgTripLength = bookings.length > 0
      ? bookings.reduce((sum, b) => sum + (b.numberOfDays || 0), 0) / bookings.length
      : 0

    // Calculate guest satisfaction
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    const avgCleanliness = reviews.length > 0 && reviews.some(r => r.cleanliness)
      ? reviews.reduce((sum, r) => sum + (r.cleanliness || 0), 0) / reviews.filter(r => r.cleanliness).length
      : 0

    const avgAccuracy = reviews.length > 0 && reviews.some(r => r.accuracy)
      ? reviews.reduce((sum, r) => sum + (r.accuracy || 0), 0) / reviews.filter(r => r.accuracy).length
      : 0

    // Revenue by month (last 12 months)
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const month = new Date()
      month.setMonth(month.getMonth() - i)
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)

      const monthBookings = bookings.filter(b => {
        const bookingDate = new Date(b.startDate)
        return bookingDate >= monthStart && bookingDate <= monthEnd
      })

      return {
        month: monthStart.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        bookings: monthBookings.length
      }
    }).reverse()

    // Booking trends (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const dayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.createdAt)
        bookingDate.setHours(0, 0, 0, 0)
        return bookingDate.getTime() === date.getTime()
      })

      return {
        date: date.toISOString().split('T')[0],
        bookings: dayBookings.length,
        revenue: dayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
      }
    }).reverse()

    // Calculate fleet comparison (average of all cars from this host)
    const fleetStats = await prisma.rentalCar.aggregate({
      where: {
        hostId: vehicle.hostId,
        id: { not: carId }
      },
      _avg: {
        rating: true,
        totalTrips: true,
        dailyRate: true
      }
    })

    const fleetAvgRevenue = await prisma.rentalBooking.aggregate({
      where: {
        hostId: vehicle.hostId,
        carId: { not: carId },
        status: 'COMPLETED'
      },
      _sum: {
        totalAmount: true
      },
      _count: true
    })

    const fleetAvgRevenuePerCar = fleetAvgRevenue._count > 0
      ? (fleetAvgRevenue._sum.totalAmount || 0) / fleetAvgRevenue._count
      : 0

    // Calculate mileage metrics
    const milesPerTrip = bookings.filter(b => b.startMileage && b.endMileage).map(b => {
      return (b.endMileage || 0) - (b.startMileage || 0)
    })
    const avgMilesPerTrip = milesPerTrip.length > 0
      ? milesPerTrip.reduce((sum, m) => sum + m, 0) / milesPerTrip.length
      : 0

    // ESG Score Trend (if available)
    const esgHistory = vehicle.esgLastCalculated
      ? [
          {
            date: vehicle.esgLastCalculated.toISOString(),
            compositeScore: vehicle.esgScore || 50,
            environmentalScore: vehicle.esgEnvironmentalScore || 50,
            safetyScore: vehicle.esgSafetyScore || 50,
            maintenanceScore: vehicle.esgMaintenanceScore || 50
          }
        ]
      : []

    return NextResponse.json({
      success: true,
      vehicle: {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        dailyRate: vehicle.dailyRate,
        totalTrips: vehicle.totalTrips,
        rating: vehicle.rating,
        isActive: vehicle.isActive,
        vehicleAge: vehicleAge
      },
      revenue: {
        total: totalRevenue,
        avgBookingValue: avgBookingValue,
        completedBookings: completedBookings.length,
        activeBookings: activeBookings.length,
        monthlyRevenue: monthlyRevenue,
        last30Days: last30Days
      },
      utilization: {
        rate: utilizationRate,
        totalBookedDays: totalBookedDays,
        totalAvailableDays: vehicleAge,
        avgTripLength: avgTripLength
      },
      satisfaction: {
        avgRating: avgRating,
        totalReviews: reviews.length,
        avgCleanliness: avgCleanliness,
        avgAccuracy: avgAccuracy,
        breakdown: {
          cleanliness: avgCleanliness,
          accuracy: avgAccuracy,
          communication: reviews.length > 0 && reviews.some(r => r.communication)
            ? reviews.reduce((sum, r) => sum + (r.communication || 0), 0) / reviews.filter(r => r.communication).length
            : 0,
          convenience: reviews.length > 0 && reviews.some(r => r.convenience)
            ? reviews.reduce((sum, r) => sum + (r.convenience || 0), 0) / reviews.filter(r => r.convenience).length
            : 0,
          value: reviews.length > 0 && reviews.some(r => r.value)
            ? reviews.reduce((sum, r) => sum + (r.value || 0), 0) / reviews.filter(r => r.value).length
            : 0
        }
      },
      fleetComparison: {
        thisCarRevenue: totalRevenue,
        fleetAvgRevenue: fleetAvgRevenuePerCar,
        percentDifference: fleetAvgRevenuePerCar > 0
          ? ((totalRevenue - fleetAvgRevenuePerCar) / fleetAvgRevenuePerCar) * 100
          : 0,
        thisCarRating: avgRating,
        fleetAvgRating: fleetStats._avg.rating || 0,
        thisCarTrips: vehicle.totalTrips,
        fleetAvgTrips: fleetStats._avg.totalTrips || 0
      },
      mileage: {
        avgMilesPerTrip: avgMilesPerTrip,
        totalMiles: milesPerTrip.reduce((sum, m) => sum + m, 0)
      },
      esg: {
        currentScore: vehicle.esgScore || 50,
        environmentalScore: vehicle.esgEnvironmentalScore || 50,
        safetyScore: vehicle.esgSafetyScore || 50,
        maintenanceScore: vehicle.esgMaintenanceScore || 50,
        lastCalculated: vehicle.esgLastCalculated?.toISOString() || null,
        history: esgHistory
      }
    })

  } catch (error) {
    console.error('❌ Error fetching performance metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    )
  }
}