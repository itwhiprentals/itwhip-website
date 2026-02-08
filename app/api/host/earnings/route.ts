// app/api/host/earnings/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { headers } from 'next/headers'
import { 
  EARNINGS_TIERS,
  PAYOUT_CONFIG,
  determineHostTier,
  getTierConfig,
  calculateHostEarnings
} from '@/app/fleet/financial-constants'

// Helper to get host from headers
async function getHostFromHeaders() {
  const headersList = await headers()
  const hostId = headersList.get('x-host-id')
  const userId = headersList.get('x-user-id')
  
  if (!userId && !hostId) {
    return null
  }
  
  const host = await prisma.rentalHost.findFirst({
    where: hostId ? { id: hostId } : { userId: userId },
    select: {
      id: true,
      name: true,
      email: true,
      earningsTier: true,
      usingLegacyInsurance: true,
      hostInsuranceStatus: true,
      hostInsuranceProvider: true,
      hostPolicyNumber: true,
      p2pInsuranceStatus: true,
      p2pInsuranceProvider: true,
      p2pPolicyNumber: true,
      p2pInsuranceExpires: true,
      commercialInsuranceStatus: true,
      commercialInsuranceProvider: true,
      commercialPolicyNumber: true,
      commercialInsuranceExpires: true,
      createdAt: true,
      defaultPayoutMethod: true,
      stripeAccountStatus: true,
      stripePayoutsEnabled: true
    }
  })
  
  return host
}

// Helper to calculate earnings from booking based on tier
function calculateBookingEarnings(bookingTotal: number, tier: 'BASIC' | 'STANDARD' | 'PREMIUM') {
  const earnings = calculateHostEarnings(bookingTotal, tier, false)
  return earnings.hostEarnings
}

// GET - Fetch host earnings data
export async function GET(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // ✅ DEFAULT TO 'all' - Show all earnings by default
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || 'all'
    
    console.log('🔍 API Called with range:', range)
    
    // ===== DETERMINE HOST'S EARNINGS TIER =====
    const currentTier = determineHostTier(host)
    const tierConfig = getTierConfig(currentTier)
    
    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (range) {
      case 'week':
        startDate = new Date()
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate = new Date()
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate = new Date()
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate = new Date()
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
        startDate = new Date(0) // Beginning of time (Jan 1, 1970)
        break
      default:
        startDate = new Date(0) // Default to all time
    }
    
    console.log('📅 Date Range:', {
      range,
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    })
    
    // Fetch ALL completed bookings
    const allCompletedBookings = await prisma.rentalBooking.findMany({
      where: {
        hostId: host.id,
        status: 'COMPLETED',
        tripEndedAt: { not: null }
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
        tripEndedAt: 'desc'
      }
    })
    
    console.log('📦 Found bookings:', allCompletedBookings.length)
    
    // Fetch all payouts
    const allPayouts = await prisma.rentalPayout.findMany({
      where: {
        hostId: host.id,
        status: 'PAID'
      },
      include: {
        booking: {
          select: {
            bookingCode: true
          }
        }
      },
      orderBy: {
        processedAt: 'desc'
      }
    })
    
    // Calculate 3-day delay for eligibility
    const eligibilityDate = new Date()
    eligibilityDate.setDate(eligibilityDate.getDate() - PAYOUT_CONFIG.STANDARD_DELAY_DAYS)
    
    // Separate available vs pending bookings
    const availableBookings = allCompletedBookings.filter(booking => {
      if (!booking.tripEndedAt) return false
      return new Date(booking.tripEndedAt) <= eligibilityDate
    })
    
    const pendingBookings = allCompletedBookings.filter(booking => {
      if (!booking.tripEndedAt) return false
      return new Date(booking.tripEndedAt) > eligibilityDate
    })
    
    // Get paid booking IDs
    const paidBookingIds = allPayouts.map(p => p.bookingId).filter(Boolean) as string[]
    
    // Current Balance = Available bookings NOT yet paid
    const unpaidAvailableBookings = availableBookings.filter(
      booking => !paidBookingIds.includes(booking.id)
    )
    
    let currentBalance = 0
    for (const booking of unpaidAvailableBookings) {
      const total = Number(booking.totalAmount)
      currentBalance += calculateBookingEarnings(total, currentTier)
    }

    // Pending Balance = Recent bookings within 3-day hold
    let pendingBalance = 0
    for (const booking of pendingBookings) {
      const total = Number(booking.totalAmount)
      pendingBalance += calculateBookingEarnings(total, currentTier)
    }
    
    // ===== TOTAL EARNINGS - Calculate from bookings in selected range =====
    let totalEarnings = 0
    let bookingsInRange = 0
    
    for (const booking of allCompletedBookings) {
      if (!booking.tripEndedAt) continue
      
      const tripEndDate = new Date(booking.tripEndedAt)
      
      // Check if booking falls within the date range
      if (tripEndDate >= startDate && tripEndDate <= now) {
        const total = Number(booking.totalAmount)
        totalEarnings += calculateBookingEarnings(total, currentTier)
        bookingsInRange++
      }
    }
    
    console.log('💰 Total Earnings:', {
      totalEarnings,
      bookingsInRange,
      currentTier,
      tierPercentage: tierConfig.hostEarnings
    })
    
    // Get last payout
    const lastPayout = allPayouts[0] || null
    
    // Calculate upcoming payout
    let upcomingPayout = null
    if (currentBalance >= PAYOUT_CONFIG.MINIMUM_PAYOUT_AMOUNT) {
      const nextPayoutDate = new Date()
      nextPayoutDate.setDate(nextPayoutDate.getDate() + 3)
      upcomingPayout = {
        amount: currentBalance,
        estimatedDate: nextPayoutDate.toISOString()
      }
    }
    
    // ===== MONTHLY EARNINGS CHART (Dynamic based on range) =====
    const monthlyEarnings = []
    let monthsToShow = 12
    
    switch (range) {
      case 'week':
        monthsToShow = 1
        break
      case 'month':
        monthsToShow = 1
        break
      case 'quarter':
        monthsToShow = 3
        break
      case 'year':
        monthsToShow = 12
        break
      case 'all':
        if (allCompletedBookings.length > 0) {
          const earliestBooking = allCompletedBookings.reduce((earliest, booking) => {
            if (!booking.tripEndedAt) return earliest
            const bookingDate = new Date(booking.tripEndedAt)
            return !earliest || bookingDate < earliest ? bookingDate : earliest
          }, null as Date | null)
          
          if (earliestBooking) {
            const monthsDiff = (now.getFullYear() - earliestBooking.getFullYear()) * 12 
                             + (now.getMonth() - earliestBooking.getMonth())
            monthsToShow = Math.min(monthsDiff + 1, 24)
          }
        }
        break
      default:
        monthsToShow = 12
    }
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      
      const monthBookings = allCompletedBookings.filter(booking => {
        if (!booking.tripEndedAt) return false
        const endDate = new Date(booking.tripEndedAt)
        return endDate >= monthStart && endDate <= monthEnd
      })
      
      let monthTotal = 0
      for (const booking of monthBookings) {
        const total = Number(booking.totalAmount)
        monthTotal += calculateBookingEarnings(total, currentTier)
      }
      
      monthlyEarnings.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        year: monthStart.getFullYear(),
        earnings: Math.round(monthTotal * 100) / 100,
        bookings: monthBookings.length
      })
    }
    
    // ===== RECENT TRANSACTIONS =====
    const recentTransactions: Array<{
      id: string
      type: 'booking' | 'payout'
      description: string
      amount: number
      date: string
      status: string
      bookingCode?: string
    }> = []
    
    const recentBookings = allCompletedBookings.slice(0, 5)
    for (const booking of recentBookings) {
      const total = Number(booking.totalAmount)
      const earnings = calculateBookingEarnings(total, currentTier)
      
      const isPending = booking.tripEndedAt && new Date(booking.tripEndedAt) > eligibilityDate
      
      recentTransactions.push({
        id: booking.id,
        type: 'booking',
        description: `${booking.car.year} ${booking.car.make} ${booking.car.model} - ${booking.numberOfDays} days`,
        amount: earnings,
        date: booking.tripEndedAt?.toISOString() || booking.endDate.toISOString(),
        status: isPending ? 'pending' : 'completed',
        bookingCode: booking.bookingCode
      })
    }
    
    const recentPayouts = allPayouts.slice(0, 5)
    for (const payout of recentPayouts) {
      const amount = Number(payout.netPayout)
      
      recentTransactions.push({
        id: payout.id,
        type: 'payout',
        description: payout.booking?.bookingCode 
          ? `Payout for ${payout.booking.bookingCode}`
          : `Payout to ${host.defaultPayoutMethod || 'Bank Account'}`,
        amount: -amount,
        date: payout.processedAt?.toISOString() || payout.createdAt.toISOString(),
        status: 'completed',
        bookingCode: payout.booking?.bookingCode
      })
    }
    
    recentTransactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    const limitedTransactions = recentTransactions.slice(0, 10)
    
    // ===== YEAR TO DATE STATS =====
    const yearStart = new Date(now.getFullYear(), 0, 1)
    const ytdBookings = allCompletedBookings.filter(booking => {
      if (!booking.tripEndedAt) return false
      return new Date(booking.tripEndedAt) >= yearStart
    })
    
    let ytdEarnings = 0
    for (const booking of ytdBookings) {
      const total = Number(booking.totalAmount)
      ytdEarnings += calculateBookingEarnings(total, currentTier)
    }
    
    // ===== ACTIVE BOOKINGS COUNT =====
    const activeBookings = await prisma.rentalBooking.count({
      where: {
        hostId: host.id,
        tripStatus: 'ACTIVE'
      }
    })
    
    const upcomingBookings = await prisma.rentalBooking.count({
      where: {
        hostId: host.id,
        status: 'CONFIRMED',
        startDate: {
          gt: now
        }
      }
    })
    
    const totalCars = await prisma.rentalCar.count({ 
      where: { 
        hostId: host.id, 
        isActive: true 
      } 
    })
    
    // ===== RETURN RESPONSE =====
    return NextResponse.json({
      // Balance fields
      currentBalance: Math.max(0, currentBalance),
      pendingBalance: Math.max(0, pendingBalance),
      totalEarnings: Math.max(0, totalEarnings),
      
      // 3-Tier Information
      earningsTier: currentTier,
      tierName: tierConfig.name,
      hostEarningsPercentage: tierConfig.hostEarnings,
      platformFee: tierConfig.platformFee,
      earningsLabel: tierConfig.label,
      tierDescription: tierConfig.description,
      tierBadgeColor: tierConfig.badgeColor,
      nextTier: tierConfig.nextTier,
      nextTierLabel: tierConfig.nextTierLabel,
      
      // Legacy compatibility
      hasOwnInsurance: currentTier !== 'BASIC',
      earningsPercentage: tierConfig.hostEarnings,
      
      // Last Payout
      lastPayout: lastPayout ? {
        amount: Number(lastPayout.netPayout),
        date: lastPayout.processedAt?.toISOString() || lastPayout.createdAt.toISOString(),
        method: host.defaultPayoutMethod || 'Bank Transfer',
        stripeTransferId: lastPayout.stripeTransferId
      } : null,
      
      upcomingPayout,
      
      // Chart data
      monthlyEarnings,
      recentTransactions: limitedTransactions,
      
      // Stats
      yearToDate: {
        earnings: ytdEarnings,
        bookings: ytdBookings.length,
        averagePerBooking: ytdBookings.length > 0 ? ytdEarnings / ytdBookings.length : 0
      },
      
      stats: {
        activeBookings,
        upcomingBookings,
        completedBookings: allCompletedBookings.length,
        totalCars
      },
      
      // Financial info
      financialInfo: {
        insuranceStatus: tierConfig.description,
        earningsLabel: tierConfig.label,
        platformFeePercent: tierConfig.platformFee * 100,
        hostEarningsPercent: tierConfig.hostEarnings * 100,
        payoutDelay: PAYOUT_CONFIG.STANDARD_DELAY_DAYS,
        minimumPayout: PAYOUT_CONFIG.MINIMUM_PAYOUT_AMOUNT,
        processingFee: {
          percent: PAYOUT_CONFIG.PROCESSING_FEE_PERCENT,
          fixed: PAYOUT_CONFIG.PROCESSING_FEE_FIXED
        },
        stripeAccountStatus: host.stripeAccountStatus,
        payoutsEnabled: host.stripePayoutsEnabled
      }
    })
    
  } catch (error) {
    console.error('Earnings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch earnings data' },
      { status: 500 }
    )
  }
}