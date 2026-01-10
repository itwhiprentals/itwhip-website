// app/lib/trip/calculations.ts

/**
 * Trip Charge Calculation Library
 * Centralizes all charge calculation logic for trip overages
 *
 * IMPORTANT: Use configurable rates from PlatformSettings whenever possible.
 * The CHARGE_RATES constant is the fallback when no booking snapshot is available.
 */

import type { PricingSnapshot } from '@/app/lib/settings/platform-settings'

// Default rate constants (fallback when no snapshot available)
// These values should match PlatformSettings defaults in the database
export const CHARGE_RATES = {
  // Mileage rates
  DAILY_INCLUDED_MILES: 200,
  OVERAGE_RATE_PER_MILE: 0.45,

  // Fuel rates
  FUEL_TANK_CHARGE: 300.00,  // Full tank refill cost
  FUEL_LEVEL_CHARGE: 75.00,  // Per quarter tank

  // Late return rates
  LATE_RETURN_HOURLY: 50.00,
  LATE_RETURN_DAILY_MAX: 300.00,  // Max charge per day
  LATE_RETURN_GRACE_MINUTES: 30,  // Grace period before charging

  // Damage rates (base amounts, actual may vary)
  MINOR_DAMAGE_BASE: 250.00,
  MODERATE_DAMAGE_BASE: 500.00,
  MAJOR_DAMAGE_BASE: 1000.00,

  // Cleaning fees
  STANDARD_CLEANING: 50.00,
  DEEP_CLEANING: 150.00,
  BIOHAZARD_CLEANING: 500.00,

  // Other fees
  SMOKING_FEE: 250.00,
  PET_HAIR_FEE: 75.00,
  LOST_KEY_FEE: 200.00,
  TOLL_PROCESSING_FEE: 15.00,
  NO_SHOW_FEE: 50.00
}

// Type for configurable rates (matches structure of CHARGE_RATES)
export type ChargeRatesConfig = typeof CHARGE_RATES

// Fuel level mappings
export const FUEL_LEVELS = {
  'Full': 1.0,
  '3/4': 0.75,
  '1/2': 0.50,
  '1/4': 0.25,
  'Empty': 0.0
}

export interface ChargeBreakdownItem {
  type: 'mileage' | 'fuel' | 'late' | 'damage' | 'cleaning' | 'other'
  label: string
  amount: number
  details?: string
  quantity?: number
  rate?: number
}

export interface MileageCharge {
  used: number
  included: number
  overage: number
  charge: number
  rate: number
}

export interface FuelCharge {
  startLevel: string
  endLevel: string
  levelDifference: number
  charge: number
  tankPercentage: number
}

export interface LateReturnCharge {
  hoursLate: number
  charge: number
  gracePeriodApplied: boolean
}

export interface DamageCharge {
  reported: boolean
  severity: 'minor' | 'moderate' | 'major' | 'none'
  description?: string
  charge: number
  requiresInspection: boolean
}

export interface TripCharges {
  breakdown: ChargeBreakdownItem[]
  mileage?: MileageCharge
  fuel?: FuelCharge
  late?: LateReturnCharge
  damage?: DamageCharge
  cleaning?: { type: string; charge: number }
  other?: { [key: string]: number }
  subtotal: number
  taxes: number
  taxRate: number  // The tax rate used for this calculation
  total: number
}

// Options for calculateTripCharges
export interface TripChargesOptions {
  rates?: Partial<ChargeRatesConfig>  // Override default rates
  taxRate?: number                     // Override default tax rate (0.10)
  pricingSnapshot?: PricingSnapshot    // Use rates from booking snapshot
}

/**
 * Get effective rates from options (snapshot takes priority)
 */
function getEffectiveRates(options?: TripChargesOptions): ChargeRatesConfig {
  if (options?.pricingSnapshot) {
    // Convert snapshot to CHARGE_RATES format
    const snapshot = options.pricingSnapshot
    return {
      DAILY_INCLUDED_MILES: snapshot.dailyIncludedMiles,
      OVERAGE_RATE_PER_MILE: snapshot.mileageOverageRate,
      FUEL_TANK_CHARGE: snapshot.fuelRefillRateFull,
      FUEL_LEVEL_CHARGE: snapshot.fuelRefillRateQuarter,
      LATE_RETURN_HOURLY: snapshot.lateReturnHourlyRate,
      LATE_RETURN_DAILY_MAX: snapshot.lateReturnDailyMax,
      LATE_RETURN_GRACE_MINUTES: snapshot.lateReturnGraceMinutes,
      STANDARD_CLEANING: snapshot.cleaningFeeStandard,
      DEEP_CLEANING: snapshot.cleaningFeeDeep,
      BIOHAZARD_CLEANING: snapshot.cleaningFeeBiohazard,
      SMOKING_FEE: snapshot.smokingFee,
      PET_HAIR_FEE: snapshot.petHairFee,
      LOST_KEY_FEE: snapshot.lostKeyFee,
      NO_SHOW_FEE: snapshot.noShowFee,
      // Keep defaults for damage (these come from thresholds, not snapshot)
      MINOR_DAMAGE_BASE: CHARGE_RATES.MINOR_DAMAGE_BASE,
      MODERATE_DAMAGE_BASE: CHARGE_RATES.MODERATE_DAMAGE_BASE,
      MAJOR_DAMAGE_BASE: CHARGE_RATES.MAJOR_DAMAGE_BASE,
      TOLL_PROCESSING_FEE: CHARGE_RATES.TOLL_PROCESSING_FEE
    }
  }

  if (options?.rates) {
    return { ...CHARGE_RATES, ...options.rates }
  }

  return CHARGE_RATES
}

/**
 * Get effective tax rate from options
 */
function getEffectiveTaxRate(options?: TripChargesOptions): number {
  if (options?.pricingSnapshot) {
    return options.pricingSnapshot.effectiveTaxRate
  }
  return options?.taxRate ?? 0.10
}

/**
 * Main function to calculate all trip charges
 * @param options - Optional configuration for rates and tax. Use pricingSnapshot from booking for accurate rates.
 */
export function calculateTripCharges(
  startMileage: number,
  endMileage: number,
  fuelLevelStart: string,
  fuelLevelEnd: string,
  scheduledStartDate: Date,
  scheduledEndDate: Date,
  actualEndDate: Date,
  numberOfDays: number,
  additionalCharges?: Array<{ type: string; cost: number; description?: string }>,
  options?: TripChargesOptions
): TripCharges {
  const rates = getEffectiveRates(options)
  const taxRate = getEffectiveTaxRate(options)
  const breakdown: ChargeBreakdownItem[] = []
  let subtotal = 0

  // Calculate mileage charges with configurable rates
  const mileageCharge = calculateMileageChargeWithRates(
    startMileage,
    endMileage,
    numberOfDays,
    rates
  )

  if (mileageCharge.charge > 0) {
    breakdown.push({
      type: 'mileage',
      label: 'Mileage Overage',
      amount: mileageCharge.charge,
      details: `${mileageCharge.overage} miles over ${mileageCharge.included} included miles`,
      quantity: mileageCharge.overage,
      rate: mileageCharge.rate
    })
    subtotal += mileageCharge.charge
  }

  // Calculate fuel charges with configurable rates
  const fuelCharge = calculateFuelChargeWithRates(fuelLevelStart, fuelLevelEnd, rates)

  if (fuelCharge.charge > 0) {
    breakdown.push({
      type: 'fuel',
      label: 'Fuel Refill',
      amount: fuelCharge.charge,
      details: `Returned at ${fuelLevelEnd} (${fuelCharge.tankPercentage}% refill needed)`,
      quantity: fuelCharge.levelDifference,
      rate: rates.FUEL_LEVEL_CHARGE
    })
    subtotal += fuelCharge.charge
  }

  // Calculate late return charges with configurable rates
  const lateCharge = calculateLateReturnChargeWithRates(
    scheduledEndDate,
    actualEndDate,
    rates
  )

  if (lateCharge.charge > 0) {
    breakdown.push({
      type: 'late',
      label: 'Late Return Fee',
      amount: lateCharge.charge,
      details: `${lateCharge.hoursLate} hours late`,
      quantity: lateCharge.hoursLate,
      rate: rates.LATE_RETURN_HOURLY
    })
    subtotal += lateCharge.charge
  }

  // Add any additional charges (damage, cleaning, etc.)
  const otherCharges: { [key: string]: number } = {}

  if (additionalCharges && additionalCharges.length > 0) {
    additionalCharges.forEach(charge => {
      const chargeType = charge.type.toLowerCase()
      let type: ChargeBreakdownItem['type'] = 'other'

      if (chargeType.includes('damage')) {
        type = 'damage'
      } else if (chargeType.includes('clean')) {
        type = 'cleaning'
      }

      breakdown.push({
        type,
        label: charge.type,
        amount: charge.cost,
        details: charge.description
      })

      otherCharges[charge.type] = charge.cost
      subtotal += charge.cost
    })
  }

  // Calculate taxes using configurable rate
  const taxes = subtotal * taxRate
  const total = subtotal + taxes

  return {
    breakdown,
    mileage: mileageCharge,
    fuel: fuelCharge,
    late: lateCharge,
    damage: additionalCharges?.find(c => c.type.toLowerCase().includes('damage'))
      ? {
          reported: true,
          severity: 'moderate',
          charge: additionalCharges.find(c => c.type.toLowerCase().includes('damage'))?.cost || 0,
          requiresInspection: true
        }
      : undefined,
    other: Object.keys(otherCharges).length > 0 ? otherCharges : undefined,
    subtotal,
    taxes,
    taxRate,
    total
  }
}

/**
 * Calculate mileage charge with custom rates
 */
function calculateMileageChargeWithRates(
  startMileage: number,
  endMileage: number,
  numberOfDays: number,
  rates: ChargeRatesConfig
): MileageCharge {
  const milesUsed = Math.max(0, endMileage - startMileage)
  const milesIncluded = numberOfDays * rates.DAILY_INCLUDED_MILES
  const overageMiles = Math.max(0, milesUsed - milesIncluded)
  const charge = overageMiles * rates.OVERAGE_RATE_PER_MILE

  return {
    used: milesUsed,
    included: milesIncluded,
    overage: overageMiles,
    charge: Number(charge.toFixed(2)),
    rate: rates.OVERAGE_RATE_PER_MILE
  }
}

/**
 * Calculate fuel charge with custom rates
 */
function calculateFuelChargeWithRates(
  fuelLevelStart: string,
  fuelLevelEnd: string,
  rates: ChargeRatesConfig
): FuelCharge {
  const startLevel = FUEL_LEVELS[fuelLevelStart as keyof typeof FUEL_LEVELS] ?? 1.0
  const endLevel = FUEL_LEVELS[fuelLevelEnd as keyof typeof FUEL_LEVELS] ?? 1.0

  const levelDifference = Math.max(0, startLevel - endLevel)
  const tankPercentage = Math.round(levelDifference * 100)

  // Calculate charge based on quarters of tank
  const quartersToRefill = Math.ceil(levelDifference * 4)
  const charge = quartersToRefill * rates.FUEL_LEVEL_CHARGE

  return {
    startLevel: fuelLevelStart,
    endLevel: fuelLevelEnd,
    levelDifference,
    charge: Number(charge.toFixed(2)),
    tankPercentage
  }
}

/**
 * Calculate late return charge with custom rates
 */
function calculateLateReturnChargeWithRates(
  scheduledEndDate: Date,
  actualEndDate: Date,
  rates: ChargeRatesConfig
): LateReturnCharge {
  const scheduledEnd = new Date(scheduledEndDate)
  const actualEnd = new Date(actualEndDate)

  // Calculate difference in milliseconds
  const timeDifference = actualEnd.getTime() - scheduledEnd.getTime()

  // Apply grace period
  const graceMs = rates.LATE_RETURN_GRACE_MINUTES * 60 * 1000
  const chargeableMs = Math.max(0, timeDifference - graceMs)

  if (chargeableMs === 0) {
    return {
      hoursLate: 0,
      charge: 0,
      gracePeriodApplied: timeDifference > 0
    }
  }

  // Calculate hours late (round up)
  const hoursLate = Math.ceil(chargeableMs / (1000 * 60 * 60))

  // Calculate charge with daily maximum
  const daysLate = Math.floor(hoursLate / 24)
  const remainingHours = hoursLate % 24

  const dailyCharges = daysLate * rates.LATE_RETURN_DAILY_MAX
  const hourlyCharges = Math.min(
    remainingHours * rates.LATE_RETURN_HOURLY,
    rates.LATE_RETURN_DAILY_MAX
  )

  const charge = dailyCharges + hourlyCharges

  return {
    hoursLate,
    charge: Number(charge.toFixed(2)),
    gracePeriodApplied: true
  }
}

/**
 * Calculate mileage overage charges
 */
export function calculateMileageCharge(
  startMileage: number,
  endMileage: number,
  numberOfDays: number
): MileageCharge {
  const milesUsed = Math.max(0, endMileage - startMileage)
  const milesIncluded = numberOfDays * CHARGE_RATES.DAILY_INCLUDED_MILES
  const overageMiles = Math.max(0, milesUsed - milesIncluded)
  const charge = overageMiles * CHARGE_RATES.OVERAGE_RATE_PER_MILE

  return {
    used: milesUsed,
    included: milesIncluded,
    overage: overageMiles,
    charge: Number(charge.toFixed(2)),
    rate: CHARGE_RATES.OVERAGE_RATE_PER_MILE
  }
}

/**
 * Calculate fuel refill charges
 */
export function calculateFuelCharge(
  fuelLevelStart: string,
  fuelLevelEnd: string
): FuelCharge {
  const startLevel = FUEL_LEVELS[fuelLevelStart as keyof typeof FUEL_LEVELS] ?? 1.0
  const endLevel = FUEL_LEVELS[fuelLevelEnd as keyof typeof FUEL_LEVELS] ?? 1.0
  
  const levelDifference = Math.max(0, startLevel - endLevel)
  const tankPercentage = Math.round(levelDifference * 100)
  
  // Calculate charge based on quarters of tank
  const quartersToRefill = Math.ceil(levelDifference * 4)
  const charge = quartersToRefill * CHARGE_RATES.FUEL_LEVEL_CHARGE

  return {
    startLevel: fuelLevelStart,
    endLevel: fuelLevelEnd,
    levelDifference,
    charge: Number(charge.toFixed(2)),
    tankPercentage
  }
}

/**
 * Calculate late return charges
 */
export function calculateLateReturnCharge(
  scheduledEndDate: Date,
  actualEndDate: Date
): LateReturnCharge {
  const scheduledEnd = new Date(scheduledEndDate)
  const actualEnd = new Date(actualEndDate)
  
  // Calculate difference in milliseconds
  const timeDifference = actualEnd.getTime() - scheduledEnd.getTime()
  
  // Apply grace period
  const graceMs = CHARGE_RATES.LATE_RETURN_GRACE_MINUTES * 60 * 1000
  const chargeableMs = Math.max(0, timeDifference - graceMs)
  
  if (chargeableMs === 0) {
    return {
      hoursLate: 0,
      charge: 0,
      gracePeriodApplied: timeDifference > 0
    }
  }

  // Calculate hours late (round up)
  const hoursLate = Math.ceil(chargeableMs / (1000 * 60 * 60))
  
  // Calculate charge with daily maximum
  const daysLate = Math.floor(hoursLate / 24)
  const remainingHours = hoursLate % 24
  
  const dailyCharges = daysLate * CHARGE_RATES.LATE_RETURN_DAILY_MAX
  const hourlyCharges = Math.min(
    remainingHours * CHARGE_RATES.LATE_RETURN_HOURLY,
    CHARGE_RATES.LATE_RETURN_DAILY_MAX
  )
  
  const charge = dailyCharges + hourlyCharges

  return {
    hoursLate,
    charge: Number(charge.toFixed(2)),
    gracePeriodApplied: true
  }
}

/**
 * Calculate damage charges based on severity
 */
export function calculateDamageCharge(
  damageReported: boolean,
  severity?: 'minor' | 'moderate' | 'major',
  customAmount?: number
): DamageCharge {
  if (!damageReported) {
    return {
      reported: false,
      severity: 'none',
      charge: 0,
      requiresInspection: false
    }
  }

  if (customAmount !== undefined) {
    return {
      reported: true,
      severity: severity || 'moderate',
      charge: customAmount,
      requiresInspection: true
    }
  }

  const chargeMap = {
    minor: CHARGE_RATES.MINOR_DAMAGE_BASE,
    moderate: CHARGE_RATES.MODERATE_DAMAGE_BASE,
    major: CHARGE_RATES.MAJOR_DAMAGE_BASE
  }

  const charge = chargeMap[severity || 'moderate']

  return {
    reported: true,
    severity: severity || 'moderate',
    charge,
    requiresInspection: true
  }
}

/**
 * Calculate cleaning charges
 */
export function calculateCleaningCharge(
  cleaningRequired: boolean,
  cleaningType: 'standard' | 'deep' | 'biohazard' = 'standard'
): number {
  if (!cleaningRequired) return 0

  const chargeMap = {
    standard: CHARGE_RATES.STANDARD_CLEANING,
    deep: CHARGE_RATES.DEEP_CLEANING,
    biohazard: CHARGE_RATES.BIOHAZARD_CLEANING
  }

  return chargeMap[cleaningType]
}

/**
 * Format charge amount for display
 */
export function formatCharge(amount: number): string {
  return `$${amount.toFixed(2)}`
}

/**
 * Validate if charges are within acceptable ranges
 */
export function validateCharges(charges: TripCharges): {
  valid: boolean
  warnings: string[]
  errors: string[]
} {
  const warnings: string[] = []
  const errors: string[] = []

  // Check for negative charges
  charges.breakdown.forEach(item => {
    if (item.amount < 0) {
      errors.push(`Invalid negative charge for ${item.label}`)
    }
  })

  // Check for unusually high charges
  if (charges.mileage && charges.mileage.charge > 1000) {
    warnings.push('Unusually high mileage charge detected')
  }

  if (charges.fuel && charges.fuel.charge > CHARGE_RATES.FUEL_TANK_CHARGE) {
    warnings.push('Fuel charge exceeds full tank cost')
  }

  if (charges.late && charges.late.hoursLate > 72) {
    warnings.push('Late return exceeds 72 hours')
  }

  // Check total
  if (charges.total < 0) {
    errors.push('Total charge cannot be negative')
  }

  if (charges.total > 5000) {
    warnings.push('Total charges exceed $5000 - manual review recommended')
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors
  }
}

/**
 * Apply adjustments to charges
 */
export function applyAdjustments(
  originalCharges: TripCharges,
  adjustments: Array<{
    type: string
    adjustedAmount: number
    included: boolean
    reason?: string
  }>
): TripCharges {
  const adjustedBreakdown: ChargeBreakdownItem[] = []
  let subtotal = 0

  originalCharges.breakdown.forEach(item => {
    const adjustment = adjustments.find(
      adj => adj.type === item.type || 
      item.label.toLowerCase().includes(adj.type.toLowerCase())
    )

    if (adjustment && !adjustment.included) {
      // Skip this charge
      return
    }

    const adjustedAmount = adjustment?.adjustedAmount ?? item.amount
    adjustedBreakdown.push({
      ...item,
      amount: adjustedAmount
    })
    subtotal += adjustedAmount
  })

  // Use the same tax rate from the original charges
  const taxRate = originalCharges.taxRate ?? 0.10
  const taxes = subtotal * taxRate
  const total = subtotal + taxes

  return {
    ...originalCharges,
    breakdown: adjustedBreakdown,
    subtotal,
    taxes,
    taxRate,
    total
  }
}