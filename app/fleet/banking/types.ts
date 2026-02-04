// app/fleet/banking/types.ts
// Types for platform-level banking dashboard

export interface CommissionTier {
  name: string
  minVehicles: number
  maxVehicles: number | null
  rate: number
  hostKeeps: number
}

export interface PlatformBankingData {
  // ALL-TIME PLATFORM TOTALS
  allTime: {
    totalBookings: number
    grossBookingValue: number
    platformRevenue: number
    revenueBreakdown: {
      guestServiceFees: number
      hostCommissions: number
      insuranceRevenue: number
      totalPlatformRevenue: number
    }
    hostPayouts: number
    totalPayoutsCount: number
    processingFeesCollected: number
    totalTaxesCollected: number
    totalRefunds: number
    refundCount: number
    bookingsByStatus: Record<string, { count: number; totalAmount: number; serviceFees: number }>
    bookingsByPaymentStatus: Record<string, { count: number; totalAmount: number }>
    claimsByStatus: Record<string, { count: number; approvedAmount: number; estimatedCost: number; recoveredFromGuest: number }>
    totalClaims: number
  }

  // CURRENT BALANCES
  hosts: {
    count: number
    totalCurrentBalance: number
    totalPendingBalance: number
    totalHoldBalance: number
    totalNegativeBalance: number
    totalPaidOut: number
    byStatus: Record<string, number>
  }
  guests: {
    count: number
    totalCredits: number
    totalBonus: number
    totalDeposits: number
    onHoldCount: number
  }

  // RECENT ACTIVITY (30 days)
  recent: {
    bookingsCount: number
    totalBookingValue: number
    serviceFees: number
  }
  payouts: {
    pendingCount: number
    pendingAmount: number
    recentPayouts: RecentPayout[]
  }
  claims: {
    byStatus: Record<string, { count: number; approvedAmount: number; estimatedCost: number }>
    totalActive: number
  }
  bookings: {
    byStatus: Record<string, number>
  }
  recentActivity: {
    charges: RecentCharge[]
  }

  // 1099 TAX DATA
  tax1099: {
    taxYear: number
    totalHosts: number
    hostsAboveThreshold: number
    totalGrossReceipts: number
    totalPlatformFees: number
    totalProcessingFees: number
    totalNetPayouts: number
  }

  // PLATFORM SETTINGS
  settings: {
    commissionTiers: CommissionTier[]
    processingFeeFixed: number
    serviceFeeRate: number
    insurancePlatformShare: number
    standardPayoutDelay: number
    newHostPayoutDelay: number
  }

  // NEW: Insurance breakdown
  insurance?: InsuranceData

  // NEW: Host leaderboard
  hostLeaderboard?: HostLeaderboardData

  // NEW: Pending payouts with details
  pendingPayoutsDetailed?: PendingPayoutDetail[]

  // NEW: Host balance summary
  hostBalanceSummary?: HostBalanceSummary

  // NEW: Enhanced revenue with platform vs passthrough
  revenueEnhanced?: EnhancedRevenueData
}

export interface RecentPayout {
  id: string
  hostName: string
  hostEmail: string
  amount: number
  status: string
  createdAt: string
}

export interface RecentCharge {
  id: string
  hostName: string
  amount: number
  chargeType: string
  reason: string
  status: string
  createdAt: string
}

// Insurance data with platform vs provider split
export interface InsuranceData {
  totalInsuranceCollected: number
  platformShare: number          // 30% of total
  providerShare: number          // 70% of total
  platformShareRate: number      // 0.30
  byType: {
    basic: { collected: number; count: number }
    premium: { collected: number; count: number }
  }
}

// Host leaderboard entry
export interface HostLeaderboardEntry {
  id: string
  name: string
  email: string
  totalPayouts: number
  tripCount: number
  tier: 'Standard' | 'Gold' | 'Platinum' | 'Diamond'
  rating: number
  fleetSize: number
}

// Host leaderboard data
export interface HostLeaderboardData {
  topHosts: HostLeaderboardEntry[]
  bottomHosts: HostLeaderboardEntry[]
  medianPayout: number
  averagePayout: number
  totalHosts: number
}

// Detailed pending payout with eligibility countdown
export interface PendingPayoutDetail {
  id: string
  hostName: string
  bookingCode: string
  tripEndDate: string
  eligibleAt: string
  daysUntilEligible: number
  grossEarnings: number
  platformFee: number
  processingFee: number
  netPayout: number
  status: 'PENDING' | 'PROCESSING'
}

// Host balance summary
export interface HostBalanceSummary {
  totalCurrentBalance: number
  totalPendingBalance: number
  totalHoldBalance: number
  totalNegativeBalance: number
  totalHosts: number
  hostsWithNegativeBalance: number
  hostsWithHoldBalance: number
}

// Enhanced revenue data with platform vs passthrough separation
export interface EnhancedRevenueData {
  platformRevenue: {
    guestServiceFees: number
    hostCommissions: number
    insurancePlatformShare: number
    processingFees: number
    cancellationRevenue: number  // Revenue retained from cancellations
    total: number
  }
  passthroughMoney: {
    insuranceProviderShare: number
    taxesCollected: number
    total: number
  }
  grossCollected: number
  // Cancellation details
  cancellationDetails?: {
    totalCancelled: number
    cancelledCount: number
    serviceFeeRetained: number
    nonRefundedSubtotal: number
    totalRetained: number
    totalRefunded: number
  }
}

// Utility functions
export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
export const formatDate = (date: string) => new Date(date).toLocaleDateString()
export const formatDateTime = (date: string) => new Date(date).toLocaleString()
