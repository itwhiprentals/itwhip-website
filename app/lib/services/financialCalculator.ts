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
