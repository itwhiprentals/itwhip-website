// app/api/partner/revenue/route.ts
// Partner Revenue API - Revenue tracking with commission breakdown

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { getTierInfo } from '@/app/lib/commission/calculate-tier'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

async function getPartnerFromToken(request?: NextRequest) {
  // Check Authorization header first (mobile app)
  const authHeader = request?.headers.get('authorization')
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

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    // Allow all host types since we've unified the portals
    if (!partner) {
      return null
    }

    return partner
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

    const partner = await getPartnerFromToken(request)

    if (!partner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get partner's vehicle IDs
    const vehicles = await prisma.rentalCar.findMany({
      where: { hostId: partner.id },
      select: { id: true }
    })
    const vehicleIds = vehicles.map(v => v.id)

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'all':
        startDate = new Date(2020, 0, 1) // Beginning of time
        break
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Get completed bookings in period
    // COMPLETED is the only "finished" status in RentalBookingStatus enum
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        carId: { in: vehicleIds },
        status: 'COMPLETED',
        endDate: { gte: startDate }
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
      orderBy: { endDate: 'desc' }
    })

    const defaultCommissionRate = partner.currentCommissionRate || 0.25
    const grossRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    // Calculate commission per-booking using actual platformFeeRate (welcome discount = 10%)
    const commission = bookings.reduce((sum, b) => {
      const rate = b.platformFeeRate ? Number(b.platformFeeRate) : defaultCommissionRate
      return sum + ((b.totalAmount || 0) * rate)
    }, 0)
    const netRevenue = grossRevenue - commission
    // Effective blended rate across all bookings
    const commissionRate = grossRevenue > 0 ? commission / grossRevenue : defaultCommissionRate
    // Count welcome discount bookings
    const welcomeDiscountBookings = bookings.filter(b => b.isWelcomeDiscount).length

    // Get upcoming/confirmed bookings (revenue that's expected but not yet earned)
    const upcomingBookings = await prisma.rentalBooking.findMany({
      where: {
        carId: { in: vehicleIds },
        status: { in: ['CONFIRMED', 'ACTIVE'] }
      },
      include: {
        car: {
          select: { make: true, model: true, year: true }
        }
      }
    })
    const upcomingGrossRevenue = upcomingBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    const upcomingCommission = upcomingBookings.reduce((sum, b) => {
      const rate = b.platformFeeRate ? Number(b.platformFeeRate) : defaultCommissionRate
      return sum + ((b.totalAmount || 0) * rate)
    }, 0)
    const upcomingNetRevenue = upcomingGrossRevenue - upcomingCommission

    // Get pending bookings (awaiting confirmation)
    const pendingBookings = await prisma.rentalBooking.findMany({
      where: {
        carId: { in: vehicleIds },
        status: 'PENDING'
      }
    })
    const pendingGrossRevenue = pendingBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)

    // Calculate cash vs Stripe breakdown
    const stripeBookings = bookings.filter(b => b.stripeChargeId || b.paymentIntentId)
    const cashBookings = bookings.filter(b => !b.stripeChargeId && !b.paymentIntentId)

    const stripeRevenue = stripeBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    const cashRevenue = cashBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)

    // Get last 6 months of data
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

      const monthBookings = await prisma.rentalBooking.findMany({
        where: {
          carId: { in: vehicleIds },
          status: 'COMPLETED',
          endDate: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      })

      const monthGross = monthBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
      const monthCommission = monthBookings.reduce((sum, b) => {
        const rate = b.platformFeeRate ? Number(b.platformFeeRate) : defaultCommissionRate
        return sum + ((b.totalAmount || 0) * rate)
      }, 0)
      const monthNet = monthGross - monthCommission

      monthlyData.push({
        month: monthStart.toLocaleString('en-US', { month: 'short' }),
        year: monthStart.getFullYear(),
        gross: monthGross,
        net: monthNet,
        commission: monthCommission,
        bookings: monthBookings.length
      })
    }

    // Get top performing vehicles
    const vehicleRevenue = await prisma.rentalBooking.groupBy({
      by: ['carId'],
      where: {
        carId: { in: vehicleIds },
        status: 'COMPLETED'
      },
      _sum: {
        totalAmount: true
      },
      _count: true,
      orderBy: {
        _sum: {
          totalAmount: 'desc'
        }
      },
      take: 5
    })

    const topVehicles = await Promise.all(
      vehicleRevenue.map(async (v) => {
        const car = await prisma.rentalCar.findUnique({
          where: { id: v.carId },
          select: { make: true, model: true, year: true, photos: { select: { url: true, isHero: true }, orderBy: { order: 'asc' }, take: 1 } }
        })
        const photo = car?.photos?.[0]?.url || null
        return {
          id: v.carId,
          name: car ? `${car.year} ${car.make} ${car.model}` : 'Unknown Vehicle',
          year: car?.year || null,
          make: car?.make || null,
          model: car?.model || null,
          photo,
          revenue: v._sum.totalAmount || 0,
          bookings: v._count
        }
      })
    )

    // Get payout history from partner_payouts table
    const payouts = await prisma.partner_payouts.findMany({
      where: { hostId: partner.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Resolve booking details for each payout (car photo, guest, dates)
    const recentPayouts = await Promise.all(payouts.map(async (p) => {
      let bookingId: string | null = null
      let car: any = null
      let guestName: string | null = null
      let startDate: string | null = null
      let endDate: string | null = null
      let numberOfDays: number | null = null
      let dailyRate: number | null = null
      let subtotal: number | null = null
      let deliveryFee: number | null = null
      let platformFeeRate: number | null = null
      let paymentType: string | null = null
      let isWelcomeDiscount = false

      if (p.period) {
        const booking = await prisma.rentalBooking.findFirst({
          where: { OR: [{ bookingCode: p.period }, { id: { startsWith: p.period.replace('Booking ', '') } }] },
          select: {
            id: true, bookingCode: true, guestName: true, startDate: true, endDate: true, numberOfDays: true,
            dailyRate: true, subtotal: true, deliveryFee: true, platformFeeRate: true, paymentType: true, isWelcomeDiscount: true,
            car: { select: { make: true, model: true, year: true, photos: { select: { url: true }, orderBy: { order: 'asc' }, take: 1 } } }
          }
        })
        if (booking) {
          bookingId = booking.id
          car = booking.car ? { year: booking.car.year, make: booking.car.make, model: booking.car.model, photo: booking.car.photos?.[0]?.url || null } : null
          guestName = booking.guestName
          startDate = booking.startDate?.toISOString() || null
          endDate = booking.endDate?.toISOString() || null
          numberOfDays = booking.numberOfDays
          dailyRate = Number(booking.dailyRate) || null
          subtotal = Number(booking.subtotal) || null
          deliveryFee = Number(booking.deliveryFee) || null
          platformFeeRate = booking.platformFeeRate ? Number(booking.platformFeeRate) : null
          paymentType = booking.paymentType
          isWelcomeDiscount = booking.isWelcomeDiscount || false
        }
      }
      // Compute display status from RentalPayout eligibleAt
      let displayStatus = p.status.toLowerCase()
      let eligibleAt: string | null = null
      if (bookingId) {
        const rentalPayout = await prisma.rentalPayout.findFirst({ where: { bookingId }, select: { eligibleAt: true } })
        eligibleAt = rentalPayout?.eligibleAt?.toISOString() || null
        if (displayStatus === 'pending' && rentalPayout?.eligibleAt && rentalPayout.eligibleAt <= new Date()) {
          displayStatus = 'available'
        }
      }

      return {
        id: p.id, period: p.period, bookingId,
        amount: p.netAmount, grossRevenue: p.grossRevenue, commission: p.commission,
        status: displayStatus, paidAt: p.paidAt?.toISOString() || null, stripePayoutId: p.stripePayoutId,
        eligibleAt,
        car, guestName, startDate, endDate, numberOfDays, dailyRate, subtotal, deliveryFee, platformFeeRate, paymentType, isWelcomeDiscount
      }
    }))

    // Get tier info
    const tierInfo = getTierInfo(partner)

    // Calculate average booking value
    const avgBookingValue = bookings.length > 0 ? grossRevenue / bookings.length : 0

    return NextResponse.json({
      success: true,
      data: {
        // Completed revenue (actual earned)
        grossRevenue,
        commission,
        netRevenue,
        commissionRate,
        totalBookings: bookings.length,
        avgBookingValue,
        // Upcoming revenue (confirmed/active bookings)
        upcomingGrossRevenue,
        upcomingNetRevenue,
        upcomingCommission,
        upcomingBookingsCount: upcomingBookings.length,
        // Pending revenue (awaiting confirmation)
        pendingGrossRevenue,
        pendingBookingsCount: pendingBookings.length,
        // Cash vs Stripe breakdown
        stripeRevenue,
        cashRevenue,
        stripeBookingsCount: stripeBookings.length,
        cashBookingsCount: cashBookings.length,
        monthlyData,
        topVehicles,
        recentPayouts,
        tierInfo,
        period,
        welcomeDiscountBookings,
        defaultCommissionRate,
        // Host balance fields for payout summary
        currentBalance: partner.currentBalance || 0,
        pendingBalance: partner.pendingBalance || 0,
        holdBalance: partner.holdBalance || 0,
        totalEarnings: partner.totalEarnings || 0,
      }
    })

  } catch (error: any) {
    console.error('[Partner Revenue] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    )
  }
}
