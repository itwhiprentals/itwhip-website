// app/lib/services/financialCalculator.ts
// Single source of truth for all platform financial calculations

import {
  BookingFinancials,
  BookingParams,
  CommissionTier,
  PayoutBreakdown,
  PayoutParams,
  PlatformFinancialSettings,
  TaxConfiguration
} from './types/financial'

export class FinancialCalculator {
  private settings: PlatformFinancialSettings

  constructor(settings: PlatformFinancialSettings) {
    this.settings = settings
  }

  /**
   * Get commission tier based on host's fleet size
   */
  getCommissionTier(fleetSize: number): CommissionTier {
    const { tier1VehicleThreshold, tier2VehicleThreshold, tier3VehicleThreshold } = this.settings
    const { defaultCommissionRate, tier1CommissionRate, tier2CommissionRate, tier3CommissionRate } = this.settings

    if (fleetSize >= tier3VehicleThreshold) {
      return {
        name: 'Diamond',
        minVehicles: tier3VehicleThreshold,
        maxVehicles: null,
        rate: tier3CommissionRate,
        hostKeeps: 1 - tier3CommissionRate
      }
    }

    if (fleetSize >= tier2VehicleThreshold) {
      return {
        name: 'Platinum',
        minVehicles: tier2VehicleThreshold,
        maxVehicles: tier3VehicleThreshold - 1,
        rate: tier2CommissionRate,
        hostKeeps: 1 - tier2CommissionRate
      }
    }

    if (fleetSize >= tier1VehicleThreshold) {
      return {
        name: 'Gold',
        minVehicles: tier1VehicleThreshold,
        maxVehicles: tier2VehicleThreshold - 1,
        rate: tier1CommissionRate,
        hostKeeps: 1 - tier1CommissionRate
      }
    }

    return {
      name: 'Standard',
      minVehicles: 0,
      maxVehicles: tier1VehicleThreshold - 1,
      rate: defaultCommissionRate,
      hostKeeps: 1 - defaultCommissionRate
    }
  }

  /**
   * Get host commission rate based on fleet size
   */
  getHostCommissionRate(fleetSize: number): number {
    return this.getCommissionTier(fleetSize).rate
  }

  /**
   * Get effective tax rate for a location
   * Priority: City override > State rate > Default rate
   */
  getEffectiveTaxRate(city: string, state: string): TaxConfiguration {
    const cityKey = `${city.toLowerCase()}_${state.toLowerCase()}`
    const stateKey = state.toLowerCase()

    // Check city override first
    if (this.settings.taxByCityOverride && this.settings.taxByCityOverride[cityKey]) {
      const cityOverride = this.settings.taxByCityOverride[cityKey]
      return {
        state,
        city,
        stateRate: this.settings.defaultTaxRate,
        cityRate: cityOverride.rate - this.settings.defaultTaxRate,
        combinedRate: cityOverride.rate
      }
    }

    // Check state rate
    if (this.settings.taxByState && this.settings.taxByState[stateKey]) {
      return {
        state,
        city: undefined,
        stateRate: this.settings.taxByState[stateKey],
        cityRate: 0,
        combinedRate: this.settings.taxByState[stateKey]
      }
    }

    // Default rate
    return {
      state,
      city: undefined,
      stateRate: this.settings.defaultTaxRate,
      cityRate: 0,
      combinedRate: this.settings.defaultTaxRate
    }
  }

  /**
   * Calculate complete booking financials
   */
  calculateBookingFinancials(params: BookingParams): BookingFinancials {
    const {
      baseRental,
      deliveryFee,
      insuranceFee,
      city,
      state,
      hostFleetSize
    } = params

    // Get commission tier for host
    const commissionTier = this.getCommissionTier(hostFleetSize)
    const commissionRate = commissionTier.rate

    // Get tax rate for location
    const taxConfig = this.getEffectiveTaxRate(city, state)
    const taxRate = taxConfig.combinedRate

    // ========================================
    // GUEST PAYMENT CALCULATION
    // ========================================
    const guestServiceFee = this.roundCurrency(baseRental * this.settings.serviceFeeRate)
    const subtotalBeforeTax = baseRental + deliveryFee + insuranceFee + guestServiceFee
    const taxAmount = this.roundCurrency(subtotalBeforeTax * taxRate)
    const guestTotal = this.roundCurrency(subtotalBeforeTax + taxAmount)

    // ========================================
    // PLATFORM REVENUE CALCULATION
    // ========================================
    const platformServiceFee = guestServiceFee // 15% from guest
    const platformCommission = this.roundCurrency(baseRental * commissionRate) // Commission on base rental
    const insuranceRevenue = this.roundCurrency(insuranceFee * this.settings.insurancePlatformShare) // 30% of insurance
    const totalPlatformRevenue = platformServiceFee + platformCommission + insuranceRevenue

    // ========================================
    // HOST PAYOUT CALCULATION
    // ========================================
    const hostGrossEarnings = baseRental // Host's gross is the base rental
    const platformFee = platformCommission // Commission deducted
    const processingFee = this.settings.processingFeeFixed // $1.50 fixed
    const hostNetPayout = this.roundCurrency(hostGrossEarnings - platformFee - processingFee)

    // ========================================
    // TAX INFO (for 1099)
    // ========================================
    const taxableHostIncome = hostGrossEarnings // Gross before platform fees
    const taxesCollected = taxAmount

    return {
      // Guest pays
      baseRental,
      deliveryFee,
      insuranceFee,
      guestServiceFee,
      subtotalBeforeTax,
      taxRate,
      taxAmount,
      guestTotal,

      // Platform revenue
      platformServiceFee,
      platformCommission,
      insuranceRevenue,
      totalPlatformRevenue,

      // Host earnings
      hostGrossEarnings,
      platformFee,
      processingFee,
      hostNetPayout,

      // Tax info
      taxableHostIncome,
      taxesCollected,

      // Tier info
      commissionTier,
      commissionRate
    }
  }

  /**
   * Calculate host payout for multiple bookings
   */
  calculateHostPayout(params: PayoutParams): PayoutBreakdown {
    const { hostId, bookingIds, grossEarnings, fleetSize } = params

    const commissionTier = this.getCommissionTier(fleetSize)
    const commissionRate = commissionTier.rate

    const platformFee = this.roundCurrency(grossEarnings * commissionRate)
    const processingFee = this.settings.processingFeeFixed
    const netPayout = this.roundCurrency(grossEarnings - platformFee - processingFee)

    return {
      hostId,
      bookingCount: bookingIds.length,
      grossEarnings,
      commissionRate,
      commissionTier: commissionTier.name,
      platformFee,
      processingFee,
      netPayout,
      calculatedAt: new Date()
    }
  }

  /**
   * Get insurance daily rate
   */
  getInsuranceRate(type: 'basic' | 'premium'): number {
    return type === 'premium'
      ? this.settings.premiumInsuranceDaily
      : this.settings.basicInsuranceDaily
  }

  /**
   * Calculate insurance fee for a booking
   */
  calculateInsuranceFee(type: 'none' | 'basic' | 'premium', numberOfDays: number): number {
    if (type === 'none') return 0
    const dailyRate = this.getInsuranceRate(type === 'premium' ? 'premium' : 'basic')
    return this.roundCurrency(dailyRate * numberOfDays)
  }

  /**
   * Get all commission tiers with current settings
   */
  getAllCommissionTiers(): CommissionTier[] {
    const { tier1VehicleThreshold, tier2VehicleThreshold, tier3VehicleThreshold } = this.settings
    const { defaultCommissionRate, tier1CommissionRate, tier2CommissionRate, tier3CommissionRate } = this.settings

    return [
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
  }

  /**
   * Round to 2 decimal places for currency
   */
  private roundCurrency(amount: number): number {
    return Math.round(amount * 100) / 100
  }
}

/**
 * Create a FinancialCalculator with default settings
 * Use this for quick calculations when full settings aren't available
 */
export function createDefaultCalculator(): FinancialCalculator {
  return new FinancialCalculator({
    defaultCommissionRate: 0.25,
    tier1VehicleThreshold: 10,
    tier1CommissionRate: 0.20,
    tier2VehicleThreshold: 50,
    tier2CommissionRate: 0.15,
    tier3VehicleThreshold: 100,
    tier3CommissionRate: 0.10,
    serviceFeeRate: 0.15,
    processingFeePercent: 0.035,
    processingFeeFixed: 1.50,
    basicInsuranceDaily: 15,
    premiumInsuranceDaily: 25,
    insurancePlatformShare: 0.30,
    defaultTaxRate: 0.056,
    taxByState: null,
    taxByCityOverride: null
  })
}

// ========================================
// CANCELLATION REVENUE TYPES & FUNCTIONS
// ========================================

/**
 * Cancellation policy types supported by the platform
 */
export type CancellationPolicy = 'flexible' | 'moderate' | 'strict' | 'super_strict' | 'default'

/**
 * Result of cancellation revenue calculation for a single booking
 */
export interface CancellationCalculationResult {
  subtotal: number
  serviceFee: number
  totalAmount: number
  hoursBeforeStart: number
  refundPercent: number
  refundAmount: number
  platformRetained: number
  policy: string
  reason: string
}

/**
 * Aggregated cancellation revenue summary
 */
export interface CancellationRevenueSummary {
  totalCancelled: number          // Original total value of cancelled bookings
  cancelledCount: number          // Number of cancelled bookings
  serviceFeeRetained: number      // Total service fees retained
  nonRefundedSubtotal: number     // Total non-refunded subtotals
  totalRetained: number           // Total platform retained (serviceFee + nonRefundedSubtotal)
  totalRefunded: number           // Total refunded to guests
  byPolicy: {
    flexible: number
    moderate: number
    strict: number
    super_strict: number
  }
}

/**
 * Calculate refund percentage based on cancellation policy and timing
 *
 * @param policy - The cancellation policy of the vehicle
 * @param hoursBeforeStart - Hours between cancellation and trip start
 * @returns Refund percentage (0-100)
 */
export function calculateRefundPercent(
  policy: string,
  hoursBeforeStart: number
): number {
  // Ensure hours is non-negative
  const hours = Math.max(0, hoursBeforeStart)

  switch (policy) {
    case 'flexible':
      // Full refund if cancelled 24h+ before
      return hours >= 24 ? 100 : 0

    case 'moderate':
      // Full refund if cancelled 48h+ before
      return hours >= 48 ? 100 : 0

    case 'strict':
      // Full refund if cancelled 7 days (168h) before
      return hours >= 168 ? 100 : 0

    case 'super_strict':
      // No refund ever
      return 0

    default:
      // Default tiered refund policy
      if (hours >= 72) return 100
      if (hours >= 48) return 50
      return 0
  }
}

/**
 * Get human-readable cancellation reason based on timing
 *
 * @param hoursBeforeStart - Hours between cancellation and trip start
 * @returns Human-readable cancellation reason
 */
export function getCancellationReason(hoursBeforeStart: number): string {
  const hours = Math.max(0, hoursBeforeStart)

  if (hours < 24) {
    return 'Late cancellation (less than 24h notice)'
  } else if (hours < 48) {
    return 'Short notice cancellation (less than 48h)'
  } else if (hours < 168) {
    return 'Standard cancellation'
  } else {
    return 'Early cancellation (7+ days notice)'
  }
}

/**
 * Safely convert a value to a number, handling Prisma Decimals, strings, etc.
 *
 * @param value - The value to convert
 * @param fallback - Fallback value if conversion fails
 * @returns The numeric value
 */
export function toNumber(value: unknown, fallback: number = 0): number {
  if (value === null || value === undefined) {
    return fallback
  }

  // Handle Prisma Decimal objects (or any object with numeric conversion)
  if (typeof value === 'object' && value !== null) {
    try {
      return Number(value) || fallback
    } catch {
      return fallback
    }
  }

  // Handle strings
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? fallback : parsed
  }

  // Handle numbers
  if (typeof value === 'number') {
    return isNaN(value) ? fallback : value
  }

  // Try Number conversion as last resort
  const num = Number(value)
  return isNaN(num) ? fallback : num
}

/**
 * Calculate hours between two dates
 *
 * @param startDate - The trip start date
 * @param cancelledAt - The cancellation date
 * @returns Hours between dates (minimum 0)
 */
export function calculateHoursBetween(
  startDate: Date | string | null | undefined,
  cancelledAt: Date | string | null | undefined
): number {
  const start = startDate ? new Date(startDate) : new Date()
  const cancelled = cancelledAt ? new Date(cancelledAt) : new Date()

  const diffMs = start.getTime() - cancelled.getTime()
  return Math.max(0, diffMs / (1000 * 60 * 60))
}

/**
 * Calculate cancellation revenue for a single booking
 *
 * @param booking - The booking data
 * @param serviceFeeRate - Platform service fee rate (default 0.15)
 * @returns Cancellation calculation result
 */
export function calculateCancellationRevenue(
  booking: {
    subtotal: unknown
    serviceFee: unknown
    totalAmount: unknown
    startDate: Date | string | null | undefined
    updatedAt: Date | string | null | undefined
    car?: { cancellationPolicy?: string | null } | null
  },
  serviceFeeRate: number = 0.15
): CancellationCalculationResult {
  const subtotal = toNumber(booking.subtotal)
  const storedServiceFee = toNumber(booking.serviceFee)
  // Use stored service fee if available, otherwise calculate from subtotal
  const serviceFee = storedServiceFee > 0 ? storedServiceFee : (subtotal * serviceFeeRate)
  const totalAmount = toNumber(booking.totalAmount)
  const policy = booking.car?.cancellationPolicy || 'moderate'

  const hoursBeforeStart = calculateHoursBetween(booking.startDate, booking.updatedAt)
  const refundPercent = calculateRefundPercent(policy, hoursBeforeStart)

  // Refund is only on subtotal (service fee is always retained)
  const refundAmount = subtotal * (refundPercent / 100)

  // Platform retains: 100% of service fee + non-refunded portion of subtotal
  const nonRefundedSubtotal = subtotal - refundAmount
  const platformRetained = serviceFee + nonRefundedSubtotal

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    serviceFee: Math.round(serviceFee * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    hoursBeforeStart: Math.round(hoursBeforeStart),
    refundPercent,
    refundAmount: Math.round(refundAmount * 100) / 100,
    platformRetained: Math.round(platformRetained * 100) / 100,
    policy,
    reason: getCancellationReason(hoursBeforeStart)
  }
}

/**
 * Calculate aggregated cancellation revenue summary from multiple bookings
 *
 * @param bookings - Array of booking data
 * @param serviceFeeRate - Platform service fee rate (default 0.15)
 * @returns Aggregated cancellation revenue summary
 */
export function calculateCancellationRevenueSummary(
  bookings: Array<{
    subtotal: unknown
    serviceFee: unknown
    totalAmount: unknown
    startDate: Date | string | null | undefined
    updatedAt: Date | string | null | undefined
    car?: { cancellationPolicy?: string | null } | null
  }>,
  serviceFeeRate: number = 0.15
): CancellationRevenueSummary {
  let totalCancelled = 0
  let serviceFeeRetained = 0
  let nonRefundedSubtotal = 0
  let totalRefunded = 0

  const byPolicy = {
    flexible: 0,
    moderate: 0,
    strict: 0,
    super_strict: 0
  }

  for (const booking of bookings) {
    const result = calculateCancellationRevenue(booking, serviceFeeRate)

    totalCancelled += result.totalAmount
    serviceFeeRetained += result.serviceFee
    nonRefundedSubtotal += (result.subtotal - result.refundAmount)
    totalRefunded += result.refundAmount

    // Count by policy
    if (result.policy === 'flexible') byPolicy.flexible++
    else if (result.policy === 'moderate') byPolicy.moderate++
    else if (result.policy === 'strict') byPolicy.strict++
    else if (result.policy === 'super_strict') byPolicy.super_strict++
    else byPolicy.moderate++ // Default to moderate
  }

  return {
    totalCancelled: Math.round(totalCancelled * 100) / 100,
    cancelledCount: bookings.length,
    serviceFeeRetained: Math.round(serviceFeeRetained * 100) / 100,
    nonRefundedSubtotal: Math.round(nonRefundedSubtotal * 100) / 100,
    totalRetained: Math.round((serviceFeeRetained + nonRefundedSubtotal) * 100) / 100,
    totalRefunded: Math.round(totalRefunded * 100) / 100,
    byPolicy
  }
}

/**
 * Fetch settings from database and create calculator
 */
export async function createCalculatorFromDatabase(
  prisma: any
): Promise<FinancialCalculator> {
  const settings = await prisma.platformSettings.findUnique({
    where: { id: 'global' }
  })

  if (!settings) {
    console.warn('Platform settings not found, using defaults')
    return createDefaultCalculator()
  }

  return new FinancialCalculator({
    defaultCommissionRate: settings.defaultCommissionRate ?? 0.25,
    tier1VehicleThreshold: settings.tier1VehicleThreshold ?? 10,
    tier1CommissionRate: settings.tier1CommissionRate ?? 0.20,
    tier2VehicleThreshold: settings.tier2VehicleThreshold ?? 50,
    tier2CommissionRate: settings.tier2CommissionRate ?? 0.15,
    tier3VehicleThreshold: settings.tier3VehicleThreshold ?? 100,
    tier3CommissionRate: settings.tier3CommissionRate ?? 0.10,
    serviceFeeRate: settings.serviceFeeRate ?? 0.15,
    processingFeePercent: settings.processingFeePercent ?? 0.035,
    processingFeeFixed: settings.processingFeeFixed ?? 1.50,
    basicInsuranceDaily: settings.basicInsuranceDaily ?? 15,
    premiumInsuranceDaily: settings.premiumInsuranceDaily ?? 25,
    insurancePlatformShare: settings.insurancePlatformShare ?? 0.30,
    defaultTaxRate: settings.defaultTaxRate ?? 0.056,
    taxByState: settings.taxByState as Record<string, number> | null,
    taxByCityOverride: settings.taxByCityOverride as Record<string, { rate: number; cityName?: string }> | null
  })
}
