// app/api/partner/dashboard/route.ts
// GET /api/partner/dashboard - Get partner dashboard data
// Accepts both partner_token AND hostAccessToken for fleet managers

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

export async function GET(request: NextRequest) {
  try {
    // Check Authorization header first (mobile app)
    const authHeader = request.headers.get('authorization')
    let token: string | undefined
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
    // Fall back to cookies (web)
    if (!token) {
      const cookieStore = await cookies()
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

    // Get partner with related data
    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: {
        cars: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            dailyRate: true,
            isActive: true,
            photos: true,
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

    // Allow access for ALL host types since we've unified the portals
    // This includes: REAL, FLEET_PARTNER, PARTNER, and fleet managers
    if (!partner) {
      return NextResponse.json(
        { error: 'Host account not found' },
        { status: 403 }
      )
    }

    // Get bookings for this partner's vehicles first (needed for status)
    const vehicleIds = partner.cars.map(c => c.id)

    const bookings = await prisma.rentalBooking.findMany({
      where: {
        carId: { in: vehicleIds }
      },
      include: {
        renter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        car: {
          select: {
            make: true,
            model: true,
            year: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Get car IDs with active bookings
    const bookedCarIds = new Set(
      bookings
        .filter(b => b.status === 'CONFIRMED' || b.status === 'ACTIVE')
        .map(b => b.carId)
    )

    // Calculate fleet stats with proper status
    const vehicles = partner.cars.map(car => {
      let status: 'available' | 'booked' | 'maintenance' = 'available'

      if (!car.isActive) {
        status = 'maintenance' // Inactive vehicles show as maintenance
      } else if (bookedCarIds.has(car.id)) {
        status = 'booked'
      }

      // Get first photo URL properly
      const firstPhoto = car.photos?.[0] as { url?: string } | undefined

      return {
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        dailyRate: car.dailyRate,
        photo: firstPhoto?.url || null,
        totalTrips: car.totalTrips || 0,
        status
      }
    })

    const fleetSize = vehicles.length
    const activeVehicles = partner.cars.filter(c => c.isActive).length

    // Transform bookings for response
    const recentBookings = bookings.map(booking => ({
      id: booking.id,
      guestName: booking.guestName || booking.renter?.name || 'Guest',
      vehicleName: booking.car
        ? `${booking.car.year} ${booking.car.make} ${booking.car.model}`
        : 'Unknown Vehicle',
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      status: mapBookingStatus(booking.status),
      totalAmount: booking.totalAmount
    }))

    // Calculate revenue stats
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED')
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0)

    // Calculate monthly revenue (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyRevenueData = await prisma.rentalBooking.groupBy({
      by: ['createdAt'],
      where: {
        carId: { in: vehicleIds },
        status: 'COMPLETED',
        createdAt: { gte: sixMonthsAgo }
      },
      _sum: {
        totalAmount: true
      }
    })

    // Group by month
    const revenueByMonth: Record<string, { gross: number; net: number }> = {}
    const commissionRate = partner.currentCommissionRate || 0.25

    completedBookings.forEach(booking => {
      const monthKey = new Date(booking.createdAt).toLocaleString('en-US', {
        month: 'short',
        year: 'numeric'
      })
      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = { gross: 0, net: 0 }
      }
      revenueByMonth[monthKey].gross += booking.totalAmount
      revenueByMonth[monthKey].net += booking.totalAmount * (1 - commissionRate)
    })

    // Convert to array for last 6 months
    const monthlyRevenue = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toLocaleString('en-US', { month: 'short', year: 'numeric' })
      const shortMonth = date.toLocaleString('en-US', { month: 'short' })
      monthlyRevenue.push({
        month: shortMonth,
        gross: revenueByMonth[monthKey]?.gross || 0,
        net: revenueByMonth[monthKey]?.net || 0,
        commission: (revenueByMonth[monthKey]?.gross || 0) * commissionRate
      })
    }

    // Calculate current month revenue
    const currentMonth = new Date()
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const currentMonthBookings = completedBookings.filter(b =>
      new Date(b.createdAt) >= startOfMonth
    )
    const monthlyRevenueTotal = currentMonthBookings.reduce((sum, b) => sum + b.totalAmount, 0)

    // Calculate active bookings count
    const activeBookingsCount = bookings.filter(b =>
      b.status === 'CONFIRMED' || b.status === 'ACTIVE'
    ).length

    // Calculate utilization (booked / total vehicles)
    const bookedVehicles = bookings.filter(b =>
      b.status === 'CONFIRMED' || b.status === 'ACTIVE'
    ).map(b => b.carId)
    const uniqueBookedVehicles = [...new Set(bookedVehicles)].length
    const utilization = fleetSize > 0 ? Math.round((uniqueBookedVehicles / fleetSize) * 100) : 0

    // Get average rating
    const avgRating = (partner as any).averageRating || 0

    // Calculate tier info
    const tierInfo = calculateTierInfo(fleetSize, partner)

    return NextResponse.json({
      success: true,
      partner: {
        id: partner.id,
        companyName: partner.partnerCompanyName || (partner as any).displayName,
        email: partner.email,
        commissionRate: partner.currentCommissionRate || 0.25,
        tier: {
          current: tierInfo.currentTier,
          vehiclesNeeded: tierInfo.vehiclesToNextTier,
          nextTier: tierInfo.nextTier,
          nextTierRate: tierInfo.nextTierRate
        }
      },
      stats: {
        fleetSize,
        activeVehicles,
        activeBookings: activeBookingsCount,
        totalBookings: bookings.length,
        totalRevenue,
        monthlyRevenue: monthlyRevenueTotal,
        utilization,
        avgRating,
        currentCommissionRate: partner.currentCommissionRate || 0.25,
        grossRevenue: totalRevenue,
        netRevenue: totalRevenue * (1 - (partner.currentCommissionRate || 0.25)),
        thisMonthRevenue: monthlyRevenueTotal,
        lastMonthRevenue: 0,
        completedThisMonth: currentMonthBookings.length,
        totalReviews: 0,
        utilizationRate: utilization,
        tier: {
          current: tierInfo.currentTier,
          vehiclesNeeded: tierInfo.vehiclesToNextTier,
          nextTier: tierInfo.nextTier,
          nextTierRate: tierInfo.nextTierRate
        }
      },
      vehicles,
      recentBookings,
      monthlyRevenue
    })

  } catch (error: any) {
    console.error('[Partner Dashboard] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

function mapBookingStatus(status: string): 'confirmed' | 'pending' | 'active' | 'completed' | 'cancelled' {
  switch (status) {
    case 'CONFIRMED':
      return 'confirmed'
    case 'PENDING':
      return 'pending'
    case 'ACTIVE':
      return 'active'
    case 'COMPLETED':
      return 'completed'
    case 'CANCELLED':
    case 'NO_SHOW':
    case 'DISPUTE_REVIEW':
      return 'cancelled'
    default:
      return 'pending'
  }
}

function calculateTierInfo(fleetSize: number, partner: any) {
  const tiers = [
    { name: 'Standard', minVehicles: 0, rate: partner.commissionRate || 0.25 },
    { name: 'Gold', minVehicles: partner.tier1VehicleCount || 10, rate: partner.tier1CommissionRate || 0.20 },
    { name: 'Platinum', minVehicles: partner.tier2VehicleCount || 50, rate: partner.tier2CommissionRate || 0.15 },
    { name: 'Diamond', minVehicles: partner.tier3VehicleCount || 100, rate: partner.tier3CommissionRate || 0.10 }
  ]

  let currentTier = tiers[0]
  let nextTier = tiers[1]

  for (let i = tiers.length - 1; i >= 0; i--) {
    if (fleetSize >= tiers[i].minVehicles) {
      currentTier = tiers[i]
      nextTier = tiers[i + 1] || null
      break
    }
  }

  return {
    currentTier: currentTier.name,
    currentRate: currentTier.rate,
    nextTier: nextTier?.name || null,
    nextTierRate: nextTier?.rate || null,
    vehiclesToNextTier: nextTier ? nextTier.minVehicles - fleetSize : 0
  }
}
