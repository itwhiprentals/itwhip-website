// app/api/fleet/partners/[id]/impersonate/route.ts
// GET /api/fleet/partners/[id]/impersonate - Get partner dashboard data for fleet impersonation

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hostId } = await params

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

    if (partner.hostType !== 'FLEET_PARTNER' && partner.hostType !== 'PARTNER') {
      return NextResponse.json(
        { error: 'Not a partner account' },
        { status: 403 }
      )
    }

    // Calculate fleet stats
    const vehicles = partner.cars.map(car => ({
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      dailyRate: car.dailyRate,
      photo: car.photos?.[0] || null,
      totalTrips: car.totalTrips || 0,
      status: car.isActive ? 'available' : 'maintenance' as 'available' | 'booked' | 'maintenance'
    }))

    const fleetSize = vehicles.length
    const activeVehicles = vehicles.filter(v => v.status === 'available').length

    // Get bookings for this partner's vehicles
    const vehicleIds = partner.cars.map(c => c.id)

    const bookings = vehicleIds.length > 0 ? await prisma.booking.findMany({
      where: {
        rentalCarId: { in: vehicleIds }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        rentalCar: {
          select: {
            make: true,
            model: true,
            year: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    }) : []

    // Transform bookings for response
    const recentBookings = bookings.map(booking => ({
      id: booking.id,
      guestName: `${booking.user?.firstName || 'Guest'} ${booking.user?.lastName || ''}`.trim(),
      vehicleName: booking.rentalCar
        ? `${booking.rentalCar.year} ${booking.rentalCar.make} ${booking.rentalCar.model}`
        : 'Unknown Vehicle',
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      status: mapBookingStatus(booking.status),
      totalAmount: booking.totalPrice
    }))

    // Calculate revenue stats
    const completedBookings = bookings.filter(b =>
      b.status === 'COMPLETED' || b.status === 'FINISHED'
    )
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0)
    const commissionRate = partner.currentCommissionRate || 0.25

    // Group by month
    const revenueByMonth: Record<string, { gross: number; net: number }> = {}

    completedBookings.forEach(booking => {
      const monthKey = new Date(booking.createdAt).toLocaleString('en-US', {
        month: 'short',
        year: 'numeric'
      })
      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = { gross: 0, net: 0 }
      }
      revenueByMonth[monthKey].gross += booking.totalPrice
      revenueByMonth[monthKey].net += booking.totalPrice * (1 - commissionRate)
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
    const monthlyRevenueTotal = currentMonthBookings.reduce((sum, b) => sum + b.totalPrice, 0)

    // Calculate last month revenue
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1)
    const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0)
    const lastMonthBookings = completedBookings.filter(b => {
      const date = new Date(b.createdAt)
      return date >= startOfLastMonth && date <= endOfLastMonth
    })
    const lastMonthRevenue = lastMonthBookings.reduce((sum, b) => sum + b.totalPrice, 0)

    // Calculate active bookings count
    const activeBookingsCount = bookings.filter(b =>
      b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS' || b.status === 'ACTIVE'
    ).length

    // Calculate completed this month
    const completedThisMonth = currentMonthBookings.length

    // Calculate utilization (booked / total vehicles)
    const bookedVehicles = bookings.filter(b =>
      b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS' || b.status === 'ACTIVE'
    ).map(b => b.rentalCarId)
    const uniqueBookedVehicles = [...new Set(bookedVehicles)].length
    const utilization = fleetSize > 0 ? Math.round((uniqueBookedVehicles / fleetSize) * 100) : 0

    // Calculate tier info
    const tierInfo = calculateTierInfo(fleetSize, partner)

    return NextResponse.json({
      success: true,
      partner: {
        id: partner.id,
        name: partner.name,
        companyName: partner.partnerCompanyName || partner.displayName,
        email: partner.email,
        phone: partner.phone,
        approvalStatus: partner.approvalStatus,
        hostType: partner.hostType,
        partnerSlug: partner.partnerSlug,
        partnerLogo: partner.partnerLogo,
        commissionRate: partner.currentCommissionRate || 0.25
      },
      stats: {
        fleetSize,
        activeVehicles,
        totalBookings: bookings.length,
        activeBookings: activeBookingsCount,
        completedThisMonth,
        grossRevenue: totalRevenue,
        netRevenue: totalRevenue * (1 - commissionRate),
        thisMonthRevenue: monthlyRevenueTotal,
        lastMonthRevenue,
        avgRating: partner.averageRating || 0,
        totalReviews: partner.totalRatings || 0,
        utilizationRate: utilization,
        currentCommissionRate: commissionRate,
        tier: {
          current: tierInfo.currentTier,
          vehiclesNeeded: tierInfo.vehiclesToNextTier,
          nextTier: tierInfo.nextTier,
          nextTierRate: tierInfo.nextTierRate
        }
      },
      vehicleStatus: vehicles,
      recentBookings,
      monthlyRevenue
    })

  } catch (error: any) {
    console.error('[Fleet Partner Impersonate] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partner dashboard data' },
      { status: 500 }
    )
  }
}

function mapBookingStatus(status: string): 'confirmed' | 'pending' | 'active' | 'completed' | 'cancelled' {
  switch (status) {
    case 'CONFIRMED':
      return 'confirmed'
    case 'PENDING':
    case 'PENDING_APPROVAL':
      return 'pending'
    case 'IN_PROGRESS':
    case 'ACTIVE':
      return 'active'
    case 'COMPLETED':
    case 'FINISHED':
      return 'completed'
    case 'CANCELLED':
    case 'REJECTED':
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
  let nextTier: typeof tiers[0] | null = tiers[1]

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
