// app/fleet/api/banking/route.ts
// Platform-level banking API - aggregates all hosts/guests financial data
// Includes ALL-TIME totals + recent 30-day activity

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get date range for recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // ========================================
    // ALL-TIME PLATFORM TOTALS
    // ========================================

    // ALL-TIME booking totals (every trip ever)
    const allTimeBookings = await prisma.rentalBooking.aggregate({
      where: {
        paymentStatus: { in: ['PAID', 'PARTIAL_REFUND'] }
      },
      _sum: {
        totalAmount: true,
        serviceFee: true,
        subtotal: true,
        taxes: true,
        deliveryFee: true,
        insuranceFee: true
      },
      _count: { _all: true }
    })

    // ALL-TIME payouts to hosts
    // Note: Payouts can be 'PAID' (legacy) or 'COMPLETED' - both represent successful payouts
    const allTimePayouts = await prisma.rentalPayout.aggregate({
      where: {
        status: { in: ['COMPLETED', 'PAID'] }
      },
      _sum: { amount: true },
      _count: { _all: true }
    })

    // ALL-TIME booking counts by status (disposition)
    const allBookingsByStatus = await prisma.rentalBooking.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { totalAmount: true, serviceFee: true }
    })

    // ALL-TIME booking counts by payment status
    const allBookingsByPaymentStatus = await prisma.rentalBooking.groupBy({
      by: ['paymentStatus'],
      _count: { id: true },
      _sum: { totalAmount: true }
    })

    // ALL-TIME claims summary
    const allClaimsByStatus = await prisma.claim.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { approvedAmount: true, estimatedCost: true, recoveredFromGuest: true }
    })

    // ALL-TIME refunds - count refunded bookings (no refundAmount field exists)
    const allTimeRefunds = await prisma.rentalBooking.count({
      where: {
        paymentStatus: { in: ['REFUNDED', 'PARTIAL_REFUND'] }
      }
    })

    // ========================================
    // HOST & GUEST CURRENT BALANCES
    // ========================================

    // Aggregate host balances
    const hostBalances = await prisma.rentalHost.aggregate({
      _sum: {
        currentBalance: true,
        pendingBalance: true,
        holdBalance: true,
        negativeBalance: true,
        totalPayoutsAmount: true
      },
      _count: {
        id: true
      }
    })

    // Count hosts by status
    const hostsByStatus = await prisma.rentalHost.groupBy({
      by: ['approvalStatus'],
      _count: { id: true }
    })

    // Aggregate guest wallet balances
    const guestWallets = await prisma.reviewerProfile.aggregate({
      _sum: {
        creditBalance: true,
        bonusBalance: true,
        depositWalletBalance: true
      },
      _count: {
        id: true
      }
    })

    // Count guests on hold
    const guestsOnHold = await prisma.reviewerProfile.count({
      where: { accountOnHold: true }
    })

    // ========================================
    // RECENT ACTIVITY (Last 30 Days)
    // ========================================

    // Recent host charges (last 30 days)
    const recentHostCharges = await prisma.host_charges.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        host: {
          select: { name: true, email: true }
        }
      }
    })

    // Recent payouts (last 30 days) - using RentalPayout model
    const recentPayouts = await prisma.rentalPayout.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        host: {
          select: { name: true, email: true }
        }
      }
    })

    // Pending payouts count and amount
    const pendingPayouts = await prisma.rentalPayout.aggregate({
      where: {
        status: { in: ['PENDING', 'PROCESSING'] }
      },
      _sum: { amount: true },
      _count: { _all: true }
    })

    // Active claims summary (current open claims)
    const activeClaims = await prisma.claim.groupBy({
      by: ['status'],
      where: {
        status: { in: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'GUEST_RESPONDED'] }
      },
      _count: { id: true },
      _sum: { approvedAmount: true, estimatedCost: true }
    })

    // Recent bookings revenue (last 30 days)
    const recentBookings = await prisma.rentalBooking.aggregate({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        paymentStatus: { in: ['PAID', 'PARTIAL_REFUND'] }
      },
      _sum: {
        totalAmount: true,
        serviceFee: true
      },
      _count: { _all: true }
    })

    // Recent booking stats by status
    const bookingsByStatus = await prisma.rentalBooking.groupBy({
      by: ['status'],
      _count: { id: true }
    })

    // ========================================
    // PLATFORM SETTINGS FOR CALCULATIONS
    // ========================================
    const platformSettings = await prisma.platformSettings.findUnique({
      where: { id: 'global' }
    })

    const defaultCommissionRate = (platformSettings as any)?.defaultCommissionRate ?? 0.25
    const tier1VehicleThreshold = (platformSettings as any)?.tier1VehicleThreshold ?? 10
    const tier1CommissionRate = (platformSettings as any)?.tier1CommissionRate ?? 0.20
    const tier2VehicleThreshold = (platformSettings as any)?.tier2VehicleThreshold ?? 50
    const tier2CommissionRate = (platformSettings as any)?.tier2CommissionRate ?? 0.15
    const tier3VehicleThreshold = (platformSettings as any)?.tier3VehicleThreshold ?? 100
    const tier3CommissionRate = (platformSettings as any)?.tier3CommissionRate ?? 0.10
    const processingFeeFixed = (platformSettings as any)?.processingFeeFixed ?? 1.50
    const insurancePlatformShare = (platformSettings as any)?.insurancePlatformShare ?? 0.30
    const serviceFeeRate = (platformSettings as any)?.serviceFeeRate ?? 0.15

    // Calculate platform earnings
    const allTimeGrossBookingValue = Number(allTimeBookings._sum?.totalAmount) || 0
    const allTimeSubtotal = Number(allTimeBookings._sum?.subtotal) || 0
    const allTimeServiceFees = Number(allTimeBookings._sum?.serviceFee) || 0
    const allTimeTaxes = Number(allTimeBookings._sum?.taxes) || 0
    const allTimeInsuranceFees = Number(allTimeBookings._sum?.insuranceFee) || 0
    const allTimeHostPayouts = Number(allTimePayouts._sum?.amount) || 0
    const totalBookingsEver = allTimeBookings._count?._all || 0
    const totalPayoutsEver = allTimePayouts._count?._all || 0

    // Revenue breakdown calculations
    // Guest service fees (15% of base rental)
    const guestServiceFees = allTimeServiceFees

    // Host commissions (estimated at default rate since we don't track per-booking tier)
    // Using subtotal as base for commission calculation
    const hostCommissions = allTimeSubtotal * defaultCommissionRate

    // Insurance revenue (platform share of insurance fees)
    const insuranceRevenue = allTimeInsuranceFees * insurancePlatformShare

    // Total platform revenue
    const allTimePlatformRevenue = guestServiceFees + hostCommissions + insuranceRevenue

    // Processing fees collected (estimated based on payout count)
    const processingFeesCollected = totalPayoutsEver * processingFeeFixed

    // ========================================
    // 1099 DATA (Current Year)
    // ========================================
    const currentYear = new Date().getFullYear()
    const yearStart = new Date(currentYear, 0, 1)
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59)

    // Hosts with earnings this year
    const hostsWithEarnings = await prisma.rentalHost.count({
      where: {
        totalPayoutsAmount: { gt: 0 }
      }
    })

    // Hosts above 1099 threshold ($600)
    const hostsAboveThreshold = await prisma.rentalHost.count({
      where: {
        totalPayoutsAmount: { gte: 600 }
      }
    })

    // ========================================
    // NEW: INSURANCE BREAKDOWN BY TYPE
    // ========================================
    const insuranceByType = await prisma.rentalBooking.groupBy({
      by: ['insuranceSelection'],
      where: {
        paymentStatus: { in: ['PAID', 'PARTIAL_REFUND'] },
        insuranceFee: { gt: 0 }
      },
      _sum: { insuranceFee: true },
      _count: { id: true }
    })

    // ========================================
    // NEW: HOST LEADERBOARD (Top & Bottom 10)
    // ========================================
    const topHosts = await prisma.rentalHost.findMany({
      where: {
        totalPayoutsAmount: { gt: 0 },
        approvalStatus: 'APPROVED'
      },
      orderBy: { totalPayoutsAmount: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        totalPayoutsAmount: true,
        totalTrips: true,
        commissionRate: true,
        rating: true,
        _count: { select: { cars: true } }
      }
    })

    const bottomHosts = await prisma.rentalHost.findMany({
      where: {
        totalTrips: { gt: 0 },
        approvalStatus: 'APPROVED'
      },
      orderBy: { totalPayoutsAmount: 'asc' },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        totalPayoutsAmount: true,
        totalTrips: true,
        commissionRate: true,
        rating: true,
        _count: { select: { cars: true } }
      }
    })

    // Calculate median and average payout
    const allHostPayouts = await prisma.rentalHost.findMany({
      where: { totalPayoutsAmount: { gt: 0 } },
      select: { totalPayoutsAmount: true },
      orderBy: { totalPayoutsAmount: 'asc' }
    })
    const payoutValues = allHostPayouts.map(h => Number(h.totalPayoutsAmount) || 0)
    const medianPayout = payoutValues.length > 0
      ? payoutValues[Math.floor(payoutValues.length / 2)]
      : 0
    const averagePayout = payoutValues.length > 0
      ? payoutValues.reduce((a, b) => a + b, 0) / payoutValues.length
      : 0

    // ========================================
    // NEW: PENDING PAYOUTS WITH DETAILS
    // ========================================
    const pendingPayoutsDetailed = await prisma.rentalPayout.findMany({
      where: {
        status: { in: ['PENDING', 'PROCESSING'] }
      },
      orderBy: { eligibleAt: 'asc' },
      take: 20,
      include: {
        host: { select: { name: true } },
        booking: { select: { endDate: true, bookingCode: true } }
      }
    })

    // ========================================
    // NEW: HOST BALANCE ISSUES COUNT
    // ========================================
    const hostsWithNegativeBalance = await prisma.rentalHost.count({
      where: { negativeBalance: { gt: 0 } }
    })
    const hostsWithHoldBalance = await prisma.rentalHost.count({
      where: { holdBalance: { gt: 0 } }
    })

    // Helper to get tier name from commission rate
    const getTierFromRate = (rate: number): 'Standard' | 'Gold' | 'Platinum' | 'Diamond' => {
      if (rate <= tier3CommissionRate) return 'Diamond'
      if (rate <= tier2CommissionRate) return 'Platinum'
      if (rate <= tier1CommissionRate) return 'Gold'
      return 'Standard'
    }

    // Commission tiers array for UI
    const commissionTiers = [
      {
        name: 'Standard',
        minVehicles: 0,
        maxVehicles: tier1VehicleThreshold - 1,
        rate: defaultCommissionRate,
        hostKeeps: 1 - defaultCommissionRate
      },
      {
        name: 'Gold',
        minVehicles: tier1VehicleThreshold,
        maxVehicles: tier2VehicleThreshold - 1,
        rate: tier1CommissionRate,
        hostKeeps: 1 - tier1CommissionRate
      },
      {
        name: 'Platinum',
        minVehicles: tier2VehicleThreshold,
        maxVehicles: tier3VehicleThreshold - 1,
        rate: tier2CommissionRate,
        hostKeeps: 1 - tier2CommissionRate
      },
      {
        name: 'Diamond',
        minVehicles: tier3VehicleThreshold,
        maxVehicles: null,
        rate: tier3CommissionRate,
        hostKeeps: 1 - tier3CommissionRate
      }
    ]

    // Format response
    return NextResponse.json({
      success: true,
      data: {
        // ========================================
        // ALL-TIME PLATFORM TOTALS (Most important!)
        // ========================================
        allTime: {
          // Total bookings/trips ever made on the platform
          totalBookings: totalBookingsEver,

          // Gross booking value (what guests paid)
          grossBookingValue: allTimeGrossBookingValue,

          // Platform revenue (total)
          platformRevenue: allTimePlatformRevenue,

          // Revenue breakdown
          revenueBreakdown: {
            guestServiceFees,
            hostCommissions,
            insuranceRevenue,
            totalPlatformRevenue: allTimePlatformRevenue
          },

          // Total paid out to hosts
          hostPayouts: allTimeHostPayouts,
          totalPayoutsCount: totalPayoutsEver,

          // Processing fees collected
          processingFeesCollected,

          // Taxes collected
          totalTaxesCollected: allTimeTaxes,

          // Refunds (count only - no amount tracked on booking model)
          totalRefunds: 0, // Not tracked at booking level
          refundCount: allTimeRefunds,

          // Breakdown by booking status
          bookingsByStatus: allBookingsByStatus.reduce((acc, item) => {
            acc[item.status] = {
              count: item._count.id,
              totalAmount: Number(item._sum.totalAmount) || 0,
              serviceFees: Number(item._sum.serviceFee) || 0
            }
            return acc
          }, {} as Record<string, { count: number; totalAmount: number; serviceFees: number }>),

          // Breakdown by payment status
          bookingsByPaymentStatus: allBookingsByPaymentStatus.reduce((acc, item) => {
            acc[item.paymentStatus] = {
              count: item._count.id,
              totalAmount: Number(item._sum.totalAmount) || 0
            }
            return acc
          }, {} as Record<string, { count: number; totalAmount: number }>),

          // All-time claims summary
          claimsByStatus: allClaimsByStatus.reduce((acc, item) => {
            acc[item.status] = {
              count: item._count.id,
              approvedAmount: Number(item._sum.approvedAmount) || 0,
              estimatedCost: Number(item._sum.estimatedCost) || 0,
              recoveredFromGuest: Number(item._sum.recoveredFromGuest) || 0
            }
            return acc
          }, {} as Record<string, { count: number; approvedAmount: number; estimatedCost: number; recoveredFromGuest: number }>),
          totalClaims: allClaimsByStatus.reduce((sum, item) => sum + item._count.id, 0)
        },

        // ========================================
        // CURRENT BALANCES
        // ========================================

        // Host financial summary
        hosts: {
          count: hostBalances._count.id,
          totalCurrentBalance: Number(hostBalances._sum.currentBalance) || 0,
          totalPendingBalance: Number(hostBalances._sum.pendingBalance) || 0,
          totalHoldBalance: Number(hostBalances._sum.holdBalance) || 0,
          totalNegativeBalance: Number(hostBalances._sum.negativeBalance) || 0,
          totalPaidOut: Number(hostBalances._sum.totalPayoutsAmount) || 0,
          byStatus: hostsByStatus.reduce((acc, item) => {
            acc[item.approvalStatus] = item._count.id
            return acc
          }, {} as Record<string, number>)
        },

        // Guest financial summary
        guests: {
          count: guestWallets._count.id,
          totalCredits: Number(guestWallets._sum.creditBalance) || 0,
          totalBonus: Number(guestWallets._sum.bonusBalance) || 0,
          totalDeposits: Number(guestWallets._sum.depositWalletBalance) || 0,
          onHoldCount: guestsOnHold
        },

        // ========================================
        // RECENT ACTIVITY (Last 30 Days)
        // ========================================

        // Recent revenue (last 30 days)
        recent: {
          bookingsCount: recentBookings._count?._all || 0,
          totalBookingValue: Number(recentBookings._sum?.totalAmount) || 0,
          serviceFees: Number(recentBookings._sum?.serviceFee) || 0
        },

        // Payouts summary
        payouts: {
          pendingCount: pendingPayouts._count?._all || 0,
          pendingAmount: Number(pendingPayouts._sum?.amount) || 0,
          recentPayouts: recentPayouts.map(p => ({
            id: p.id,
            hostName: p.host.name,
            hostEmail: p.host.email,
            amount: Number(p.amount),
            status: p.status,
            createdAt: p.createdAt
          }))
        },

        // Active claims (currently open)
        claims: {
          byStatus: activeClaims.reduce((acc, item) => {
            acc[item.status] = {
              count: item._count.id,
              approvedAmount: Number(item._sum.approvedAmount) || 0,
              estimatedCost: Number(item._sum.estimatedCost) || 0
            }
            return acc
          }, {} as Record<string, { count: number; approvedAmount: number; estimatedCost: number }>),
          totalActive: activeClaims.reduce((sum, item) => sum + item._count.id, 0)
        },

        // Current booking status breakdown
        bookings: {
          byStatus: bookingsByStatus.reduce((acc, item) => {
            acc[item.status] = item._count.id
            return acc
          }, {} as Record<string, number>)
        },

        // Recent activity feed
        recentActivity: {
          charges: recentHostCharges.map(c => ({
            id: c.id,
            hostName: c.host.name,
            amount: Number(c.amount),
            chargeType: c.chargeType,
            reason: c.reason,
            status: c.status,
            createdAt: c.createdAt
          }))
        },

        // ========================================
        // 1099 TAX DATA
        // ========================================
        tax1099: {
          taxYear: currentYear,
          totalHosts: hostsWithEarnings,
          hostsAboveThreshold,
          totalGrossReceipts: allTimeSubtotal,
          totalPlatformFees: hostCommissions,
          totalProcessingFees: processingFeesCollected,
          totalNetPayouts: allTimeHostPayouts
        },

        // ========================================
        // PLATFORM SETTINGS
        // ========================================
        settings: {
          commissionTiers,
          processingFeeFixed,
          serviceFeeRate,
          insurancePlatformShare,
          standardPayoutDelay: 3,  // Days after trip end for experienced hosts
          newHostPayoutDelay: 7    // Days after trip end for new hosts (<3 trips)
        },

        // ========================================
        // NEW: INSURANCE BREAKDOWN (Shared Revenue)
        // ========================================
        insurance: {
          totalInsuranceCollected: allTimeInsuranceFees,
          platformShare: allTimeInsuranceFees * insurancePlatformShare,
          providerShare: allTimeInsuranceFees * (1 - insurancePlatformShare),
          platformShareRate: insurancePlatformShare,
          byType: insuranceByType.reduce((acc, item) => {
            const typeKey = item.insuranceSelection === 'PREMIUM' ? 'premium' : 'basic'
            acc[typeKey] = {
              collected: Number(item._sum.insuranceFee) || 0,
              count: item._count.id
            }
            return acc
          }, { basic: { collected: 0, count: 0 }, premium: { collected: 0, count: 0 } } as { basic: { collected: number; count: number }; premium: { collected: number; count: number } })
        },

        // ========================================
        // NEW: HOST LEADERBOARD
        // ========================================
        hostLeaderboard: {
          topHosts: topHosts.map(h => ({
            id: h.id,
            name: h.name,
            email: h.email,
            totalPayouts: Number(h.totalPayoutsAmount) || 0,
            tripCount: h.totalTrips || 0,
            tier: getTierFromRate(h.commissionRate || defaultCommissionRate),
            rating: Number(h.rating) || 0,
            fleetSize: h._count.cars
          })),
          bottomHosts: bottomHosts.map(h => ({
            id: h.id,
            name: h.name,
            email: h.email,
            totalPayouts: Number(h.totalPayoutsAmount) || 0,
            tripCount: h.totalTrips || 0,
            tier: getTierFromRate(h.commissionRate || defaultCommissionRate),
            rating: Number(h.rating) || 0,
            fleetSize: h._count.cars
          })),
          medianPayout,
          averagePayout,
          totalHosts: allHostPayouts.length
        },

        // ========================================
        // NEW: PENDING PAYOUTS WITH ELIGIBILITY
        // ========================================
        pendingPayoutsDetailed: pendingPayoutsDetailed.map(p => {
          const eligibleAt = p.eligibleAt || new Date()
          const now = new Date()
          const daysUntilEligible = Math.max(0, Math.ceil((eligibleAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

          return {
            id: p.id,
            hostName: p.host?.name || 'Unknown',
            bookingCode: p.booking?.bookingCode || 'N/A',
            tripEndDate: p.booking?.endDate?.toISOString() || '',
            eligibleAt: eligibleAt.toISOString(),
            daysUntilEligible,
            grossEarnings: Number(p.amount) || 0,
            platformFee: (Number(p.amount) || 0) * defaultCommissionRate,
            processingFee: processingFeeFixed,
            netPayout: (Number(p.amount) || 0) * (1 - defaultCommissionRate) - processingFeeFixed,
            status: p.status as 'PENDING' | 'PROCESSING'
          }
        }),

        // ========================================
        // NEW: HOST BALANCE SUMMARY
        // ========================================
        hostBalanceSummary: {
          totalCurrentBalance: Number(hostBalances._sum.currentBalance) || 0,
          totalPendingBalance: Number(hostBalances._sum.pendingBalance) || 0,
          totalHoldBalance: Number(hostBalances._sum.holdBalance) || 0,
          totalNegativeBalance: Number(hostBalances._sum.negativeBalance) || 0,
          totalHosts: hostBalances._count.id,
          hostsWithNegativeBalance,
          hostsWithHoldBalance
        },

        // ========================================
        // NEW: ENHANCED REVENUE (Platform vs Passthrough)
        // ========================================
        revenueEnhanced: {
          platformRevenue: {
            guestServiceFees,
            hostCommissions,
            insurancePlatformShare: allTimeInsuranceFees * insurancePlatformShare,
            processingFees: processingFeesCollected,
            total: guestServiceFees + hostCommissions + (allTimeInsuranceFees * insurancePlatformShare) + processingFeesCollected
          },
          passthroughMoney: {
            insuranceProviderShare: allTimeInsuranceFees * (1 - insurancePlatformShare),
            taxesCollected: allTimeTaxes,
            total: (allTimeInsuranceFees * (1 - insurancePlatformShare)) + allTimeTaxes
          },
          grossCollected: allTimeGrossBookingValue
        }
      }
    })

  } catch (error: any) {
    console.error('Error fetching platform banking data:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch platform banking data' },
      { status: 500 }
    )
  }
}
