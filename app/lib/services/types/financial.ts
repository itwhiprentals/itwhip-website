// app/lib/services/types/financial.ts
// Core financial types for platform calculations

export interface CommissionTier {
  name: 'Standard' | 'Gold' | 'Platinum' | 'Diamond'
  minVehicles: number
  maxVehicles: number | null
  rate: number // Platform takes this percentage
  hostKeeps: number // Host keeps this percentage
}

export interface TaxConfiguration {
  state: string
  city?: string
  stateRate: number
  cityRate: number
  combinedRate: number
}

export interface BookingParams {
  baseRental: number
  deliveryFee: number
  insuranceFee: number
  insuranceType: 'none' | 'basic' | 'premium'
  numberOfDays: number
  city: string
  state: string
  hostFleetSize: number
}

export interface BookingFinancials {
  // Guest pays
  baseRental: number
  deliveryFee: number
  insuranceFee: number
  guestServiceFee: number // 15% of base rental
  subtotalBeforeTax: number
  taxRate: number
  taxAmount: number
  guestTotal: number

  // Platform revenue breakdown
  platformServiceFee: number // 15% from guest
  platformCommission: number // 25% of host portion (varies by tier)
  insuranceRevenue: number // Platform share of insurance (30%)
  totalPlatformRevenue: number

  // Host earnings breakdown
  hostGrossEarnings: number // Base rental (pre-commission)
  platformFee: number // Commission deducted (25% standard)
  processingFee: number // $1.50 fixed
  hostNetPayout: number // What host receives

  // Tax info (for 1099)
  taxableHostIncome: number
  taxesCollected: number

  // Commission tier applied
  commissionTier: CommissionTier
  commissionRate: number
}

export interface PayoutParams {
  hostId: string
  bookingIds: string[]
  grossEarnings: number
  fleetSize: number
}

export interface PayoutBreakdown {
  hostId: string
  bookingCount: number
  grossEarnings: number
  commissionRate: number
  commissionTier: string
  platformFee: number
  processingFee: number
  netPayout: number
  calculatedAt: Date
}

export interface PlatformFinancialSettings {
  // Commission tiers
  defaultCommissionRate: number
  tier1VehicleThreshold: number
  tier1CommissionRate: number
  tier2VehicleThreshold: number
  tier2CommissionRate: number
  tier3VehicleThreshold: number
  tier3CommissionRate: number

  // Guest fees
  serviceFeeRate: number

  // Processing fees
  processingFeePercent: number
  processingFeeFixed: number

  // Insurance
  basicInsuranceDaily: number
  premiumInsuranceDaily: number
  insurancePlatformShare: number

  // Tax
  defaultTaxRate: number
  taxByState: Record<string, number> | null
  taxByCityOverride: Record<string, { rate: number; cityName?: string }> | null
}

export interface BackfillResult {
  bookingId: string
  bookingCode: string
  originalTotal: number
  recalculatedTotal: number
  changes: {
    field: string
    oldValue: number
    newValue: number
  }[]
  status: 'updated' | 'skipped' | 'error'
  error?: string
}

export interface BackfillSummary {
  processed: number
  updated: number
  skipped: number
  errors: number
  totalPlatformRevenue: number
  totalHostPayouts: number
  totalTaxesCollected: number
  results: BackfillResult[]
}
