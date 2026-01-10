// app/lib/settings/platform-settings.ts
// Platform settings helper for fetching, caching, and snapshotting platform configuration

import { prisma } from '@/app/lib/database/prisma'

// Type definition for PlatformSettings from database
export interface PlatformSettings {
  id: string

  // Tax Settings
  defaultTaxRate: number
  taxByState: Record<string, number> | null
  taxByCityOverride: Record<string, number> | null

  // Commission/Fee Settings
  platformCommission: number
  partnerMinCommission: number
  partnerMaxCommission: number
  serviceFeeRate: number

  // Insurance Settings
  basicInsuranceDaily: number
  premiumInsuranceDaily: number
  insuranceRequiredUnder25: boolean
  insuranceDiscountPct: number

  // Cancellation Policy
  fullRefundHours: number
  partialRefund75Hours: number
  partialRefund50Hours: number
  noRefundHours: number

  // Grace Periods
  lateReturnGraceMinutes: number
  pickupGraceMinutes: number

  // Charge Rates
  mileageOverageRate: number
  dailyIncludedMiles: number
  fuelRefillRateQuarter: number
  fuelRefillRateFull: number
  lateReturnHourlyRate: number
  lateReturnDailyMax: number
  cleaningFeeStandard: number
  cleaningFeeDeep: number
  cleaningFeeBiohazard: number
  noShowFee: number
  smokingFee: number
  petHairFee: number
  lostKeyFee: number

  // Deposit Settings
  defaultDepositPercent: number
  minDeposit: number
  maxDeposit: number
  luxuryDeposit: number
  exoticDeposit: number

  // Payout Settings
  standardPayoutDelay: number
  newHostPayoutDelay: number
  minimumPayout: number
  instantPayoutFee: number

  // Bonus Settings
  guestSignupBonus: number
  hostSignupBonus: number
  referralBonus: number
  guestReferralBonus: number
  hostReferralBonus: number
  bonusExpirationDays: number

  // Damage Thresholds
  minorDamageMax: number
  moderateDamageMax: number
  majorDamageMin: number

  // Metadata
  updatedAt: Date
  updatedBy: string | null
}

// Pricing snapshot to store at booking time
export interface PricingSnapshot {
  // Version tracking
  snapshotVersion: string
  snapshotDate: string

  // Tax rates
  defaultTaxRate: number
  effectiveTaxRate: number
  taxState?: string
  taxCity?: string

  // Fees
  serviceFeeRate: number
  platformCommission: number

  // Insurance rates
  basicInsuranceDaily: number
  premiumInsuranceDaily: number
  insuranceDiscountPct: number

  // Deposit rates
  defaultDepositPercent: number
  minDeposit: number
  maxDeposit: number
  luxuryDeposit: number
  exoticDeposit: number

  // Trip charge rates (for post-trip calculations)
  dailyIncludedMiles: number
  mileageOverageRate: number
  fuelRefillRateQuarter: number
  fuelRefillRateFull: number
  lateReturnGraceMinutes: number
  lateReturnHourlyRate: number
  lateReturnDailyMax: number
  cleaningFeeStandard: number
  cleaningFeeDeep: number
  cleaningFeeBiohazard: number
  noShowFee: number
  smokingFee: number
  petHairFee: number
  lostKeyFee: number

  // Cancellation policy (at booking time)
  fullRefundHours: number
  partialRefund75Hours: number
  partialRefund50Hours: number
  noRefundHours: number
}

// In-memory cache with 5-minute TTL
let settingsCache: PlatformSettings | null = null
let cacheExpiry: number = 0
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Fetch platform settings from database with caching
 */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  // Check cache first
  if (settingsCache && Date.now() < cacheExpiry) {
    return settingsCache
  }

  // Fetch from database
  let settings = await prisma.platformSettings.findUnique({
    where: { id: 'global' }
  })

  // Create default if doesn't exist
  if (!settings) {
    settings = await prisma.platformSettings.create({
      data: { id: 'global' }
    })
  }

  // Cast and cache
  settingsCache = settings as unknown as PlatformSettings
  cacheExpiry = Date.now() + CACHE_TTL_MS

  return settingsCache
}

/**
 * Clear the settings cache (call after updates)
 */
export function clearSettingsCache(): void {
  settingsCache = null
  cacheExpiry = 0
}

/**
 * Calculate effective tax rate based on location
 */
export function calculateEffectiveTaxRate(
  settings: PlatformSettings,
  state?: string,
  city?: string
): number {
  // Check city-specific override first (most specific)
  if (city && state && settings.taxByCityOverride) {
    const cityKey = `${city},${state}`
    if (settings.taxByCityOverride[cityKey] !== undefined) {
      return settings.taxByCityOverride[cityKey]
    }
  }

  // Check state rate
  if (state && settings.taxByState) {
    if (settings.taxByState[state] !== undefined) {
      return settings.taxByState[state]
    }
  }

  // Fall back to default
  return settings.defaultTaxRate
}

/**
 * Create a pricing snapshot for a booking
 * This captures all relevant rates at the moment of booking creation
 */
export async function snapshotPlatformSettings(
  state?: string,
  city?: string
): Promise<PricingSnapshot> {
  const settings = await getPlatformSettings()
  const effectiveTaxRate = calculateEffectiveTaxRate(settings, state, city)

  return {
    // Version tracking
    snapshotVersion: '1.0',
    snapshotDate: new Date().toISOString(),

    // Tax rates
    defaultTaxRate: settings.defaultTaxRate,
    effectiveTaxRate,
    taxState: state,
    taxCity: city,

    // Fees
    serviceFeeRate: settings.serviceFeeRate,
    platformCommission: settings.platformCommission,

    // Insurance rates
    basicInsuranceDaily: settings.basicInsuranceDaily,
    premiumInsuranceDaily: settings.premiumInsuranceDaily,
    insuranceDiscountPct: settings.insuranceDiscountPct,

    // Deposit rates
    defaultDepositPercent: settings.defaultDepositPercent,
    minDeposit: settings.minDeposit,
    maxDeposit: settings.maxDeposit,
    luxuryDeposit: settings.luxuryDeposit,
    exoticDeposit: settings.exoticDeposit,

    // Trip charge rates
    dailyIncludedMiles: settings.dailyIncludedMiles,
    mileageOverageRate: settings.mileageOverageRate,
    fuelRefillRateQuarter: settings.fuelRefillRateQuarter,
    fuelRefillRateFull: settings.fuelRefillRateFull,
    lateReturnGraceMinutes: settings.lateReturnGraceMinutes,
    lateReturnHourlyRate: settings.lateReturnHourlyRate,
    lateReturnDailyMax: settings.lateReturnDailyMax,
    cleaningFeeStandard: settings.cleaningFeeStandard,
    cleaningFeeDeep: settings.cleaningFeeDeep,
    cleaningFeeBiohazard: settings.cleaningFeeBiohazard,
    noShowFee: settings.noShowFee,
    smokingFee: settings.smokingFee,
    petHairFee: settings.petHairFee,
    lostKeyFee: settings.lostKeyFee,

    // Cancellation policy
    fullRefundHours: settings.fullRefundHours,
    partialRefund75Hours: settings.partialRefund75Hours,
    partialRefund50Hours: settings.partialRefund50Hours,
    noRefundHours: settings.noRefundHours
  }
}

/**
 * Convert a pricing snapshot to CHARGE_RATES format for calculations.ts
 */
export function snapshotToChargeRates(snapshot: PricingSnapshot) {
  return {
    // Mileage rates
    DAILY_INCLUDED_MILES: snapshot.dailyIncludedMiles,
    OVERAGE_RATE_PER_MILE: snapshot.mileageOverageRate,

    // Fuel rates
    FUEL_TANK_CHARGE: snapshot.fuelRefillRateFull,
    FUEL_LEVEL_CHARGE: snapshot.fuelRefillRateQuarter,

    // Late return rates
    LATE_RETURN_HOURLY: snapshot.lateReturnHourlyRate,
    LATE_RETURN_DAILY_MAX: snapshot.lateReturnDailyMax,
    LATE_RETURN_GRACE_MINUTES: snapshot.lateReturnGraceMinutes,

    // Cleaning fees
    STANDARD_CLEANING: snapshot.cleaningFeeStandard,
    DEEP_CLEANING: snapshot.cleaningFeeDeep,
    BIOHAZARD_CLEANING: snapshot.cleaningFeeBiohazard,

    // Other fees
    SMOKING_FEE: snapshot.smokingFee,
    PET_HAIR_FEE: snapshot.petHairFee,
    LOST_KEY_FEE: snapshot.lostKeyFee,
    NO_SHOW_FEE: snapshot.noShowFee,
    TOLL_PROCESSING_FEE: 15.00, // Not configurable yet

    // Damage rates (from thresholds - use as base amounts)
    MINOR_DAMAGE_BASE: 250.00,
    MODERATE_DAMAGE_BASE: 500.00,
    MAJOR_DAMAGE_BASE: 1000.00
  }
}

/**
 * Get deposit amount based on vehicle category
 */
export function getDepositForVehicle(
  settings: PlatformSettings,
  vehicleCategory: 'standard' | 'luxury' | 'exotic',
  rentalTotal: number
): number {
  // Calculate percentage-based deposit
  let percentDeposit = rentalTotal * settings.defaultDepositPercent

  // Apply category-specific minimums
  let categoryMinimum = settings.minDeposit
  if (vehicleCategory === 'luxury') {
    categoryMinimum = settings.luxuryDeposit
  } else if (vehicleCategory === 'exotic') {
    categoryMinimum = settings.exoticDeposit
  }

  // Use the higher of percentage or category minimum
  let deposit = Math.max(percentDeposit, categoryMinimum)

  // Cap at maximum
  deposit = Math.min(deposit, settings.maxDeposit)

  return Number(deposit.toFixed(2))
}

/**
 * Calculate refund percentage based on hours until trip start
 */
export function calculateRefundPercentage(
  settings: PlatformSettings,
  hoursUntilStart: number
): number {
  if (hoursUntilStart >= settings.fullRefundHours) {
    return 1.0 // 100% refund
  } else if (hoursUntilStart >= settings.partialRefund75Hours) {
    return 0.75 // 75% refund
  } else if (hoursUntilStart >= settings.partialRefund50Hours) {
    return 0.50 // 50% refund
  } else {
    return 0 // No refund
  }
}

/**
 * Get cancellation policy description
 */
export function getCancellationPolicyText(settings: PlatformSettings): string {
  return `
    Free cancellation up to ${settings.fullRefundHours} hours before pickup.
    75% refund if cancelled ${settings.partialRefund75Hours}-${settings.fullRefundHours} hours before.
    50% refund if cancelled ${settings.partialRefund50Hours}-${settings.partialRefund75Hours} hours before.
    No refund if cancelled less than ${settings.noRefundHours} hours before pickup.
  `.trim()
}
