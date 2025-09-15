// app/lib/trip/calculations.ts

/**
 * Trip Charge Calculation Library
 * Centralizes all charge calculation logic for trip overages
 */

// Configurable rate constants (can be moved to environment variables or database)
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
  TOLL_PROCESSING_FEE: 15.00
}

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
  total: number
}

/**
 * Main function to calculate all trip charges
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
  additionalCharges?: Array<{ type: string; cost: number; description?: string }>
): TripCharges {
  const breakdown: ChargeBreakdownItem[] = []
  let subtotal = 0

  // Calculate mileage charges
  const mileageCharge = calculateMileageCharge(
    startMileage,
    endMileage,
    numberOfDays
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

  // Calculate fuel charges
  const fuelCharge = calculateFuelCharge(fuelLevelStart, fuelLevelEnd)
  
  if (fuelCharge.charge > 0) {
    breakdown.push({
      type: 'fuel',
      label: 'Fuel Refill',
      amount: fuelCharge.charge,
      details: `Returned at ${fuelLevelEnd} (${fuelCharge.tankPercentage}% refill needed)`,
      quantity: fuelCharge.levelDifference,
      rate: CHARGE_RATES.FUEL_LEVEL_CHARGE
    })
    subtotal += fuelCharge.charge
  }

  // Calculate late return charges
  const lateCharge = calculateLateReturnCharge(
    scheduledEndDate,
    actualEndDate
  )
  
  if (lateCharge.charge > 0) {
    breakdown.push({
      type: 'late',
      label: 'Late Return Fee',
      amount: lateCharge.charge,
      details: `${lateCharge.hoursLate} hours late`,
      quantity: lateCharge.hoursLate,
      rate: CHARGE_RATES.LATE_RETURN_HOURLY
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

  // Calculate taxes (example: 10% tax rate - should be configurable)
  const TAX_RATE = 0.10
  const taxes = subtotal * TAX_RATE
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
    total
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

  const taxes = subtotal * 0.10 // Should use same tax rate as original
  const total = subtotal + taxes

  return {
    ...originalCharges,
    breakdown: adjustedBreakdown,
    subtotal,
    taxes,
    total
  }
}