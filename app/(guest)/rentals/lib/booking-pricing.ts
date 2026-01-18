// app/(guest)/rentals/lib/booking-pricing.ts
// Centralized booking pricing calculations for consistent totals across all booking stages
// Used by: BookingWidget, book page, and Stripe payment processing

import { getTaxRate } from './arizona-taxes'

// ============================================================================
// DEPOSIT CALCULATION
// ============================================================================

/**
 * Get car class and default deposit based on daily rate
 * Used as fallback when host/vehicle don't have explicit deposit settings
 */
export function getCarClassAndDefaultDeposit(dailyRate: number): { carClass: string; deposit: number } {
  if (dailyRate < 150) {
    return { carClass: 'economy', deposit: 250 }
  } else if (dailyRate < 500) {
    return { carClass: 'luxury', deposit: 700 }
  } else {
    return { carClass: 'exotic', deposit: 1000 }
  }
}

/**
 * Calculate actual deposit based on per-vehicle deposit mode
 * HYBRID system - each VEHICLE can be assigned to either mode:
 *
 * GLOBAL MODE (vehicle.vehicleDepositMode === 'global', default):
 *   1. If host.requireDeposit === false → no deposit (0)
 *   2. Check for make-specific override (e.g., all Toyotas = $400)
 *   3. Use host's global depositAmount
 *   4. Fallback to rate-based default
 *
 * INDIVIDUAL MODE (vehicle.vehicleDepositMode === 'individual'):
 *   1. If vehicle has noDeposit === true → no deposit (0)
 *   2. Use vehicle's customDepositAmount
 *   3. Fallback to rate-based default
 */
export function getActualDeposit(car: any): number {
  const host = car?.host

  // Check per-vehicle deposit mode - "individual" uses vehicle-specific settings
  // Default to 'global' if not set
  const vehicleDepositMode = car?.vehicleDepositMode || 'global'

  if (vehicleDepositMode === 'individual') {
    // Individual mode: vehicle-specific settings take precedence
    if (car?.noDeposit === true) {
      return 0
    }
    if (car?.customDepositAmount !== null && car?.customDepositAmount !== undefined) {
      return Number(car.customDepositAmount)
    }
    // Fallback to rate-based default
    const { deposit } = getCarClassAndDefaultDeposit(car?.dailyRate || 0)
    return deposit
  }

  // Global mode (default): host-level settings apply to all vehicles
  if (host?.requireDeposit === false) {
    return 0
  }

  // Check for make-specific override in global mode
  const makeDeposits = host?.makeDeposits as Record<string, number> | null
  if (makeDeposits && car?.make && makeDeposits[car.make] !== undefined) {
    return makeDeposits[car.make]
  }

  // Use host's global deposit amount if set
  if (host?.depositAmount !== null && host?.depositAmount !== undefined) {
    return Number(host.depositAmount)
  }

  // Fallback to rate-based default
  const { deposit } = getCarClassAndDefaultDeposit(car?.dailyRate || 0)
  return deposit
}

// ============================================================================
// TYPES
// ============================================================================

export interface BookingPricingInput {
  // Base pricing
  dailyRate: number
  days: number

  // Optional rates (for discounts)
  weeklyRate?: number
  monthlyRate?: number

  // Insurance
  insurancePrice: number

  // Delivery
  deliveryFee: number

  // Add-ons/Enhancements
  enhancements?: {
    refuelService: number
    additionalDriver: number
    extraMiles: number
    vipConcierge: number
  }

  // Location for tax calculation
  city: string
}

export interface BookingPricingResult {
  // Line items
  basePrice: number
  insurancePrice: number
  deliveryFee: number
  enhancementsTotal: number
  serviceFee: number

  // Tax breakdown
  taxableAmount: number  // What tax is calculated on
  taxRate: number
  taxRateDisplay: string
  taxes: number

  // Totals
  subtotalBeforeTax: number
  total: number

  // For Stripe line items
  lineItems: {
    description: string
    amount: number  // In cents for Stripe
    taxable: boolean
  }[]
}

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

/**
 * Calculate all booking pricing with consistent tax application
 *
 * Tax is applied to ALL items:
 * - Base rental price
 * - Service fee
 * - Insurance (in AZ, insurance provided as part of rental is taxable)
 * - Delivery fees
 * - Enhancement add-ons
 *
 * This matches Stripe's requirements for accurate line item reporting.
 */
export function calculateBookingPricing(input: BookingPricingInput): BookingPricingResult {
  // Calculate base price
  let basePrice = input.dailyRate * input.days

  // Apply weekly/monthly rate discounts if applicable
  if (input.monthlyRate && input.days >= 28) {
    const monthlyTotal = input.monthlyRate * Math.ceil(input.days / 30)
    if (monthlyTotal < basePrice) {
      basePrice = monthlyTotal
    }
  } else if (input.weeklyRate && input.days >= 7) {
    const weeklyTotal = input.weeklyRate * Math.ceil(input.days / 7)
    if (weeklyTotal < basePrice) {
      basePrice = weeklyTotal
    }
  }

  // Calculate enhancements total
  const enhancementsTotal = input.enhancements
    ? (input.enhancements.refuelService || 0) +
      (input.enhancements.additionalDriver || 0) +
      (input.enhancements.extraMiles || 0) +
      (input.enhancements.vipConcierge || 0)
    : 0

  // Service fee: 15% of base rental price
  const serviceFee = Math.round(basePrice * 0.15 * 100) / 100

  // Calculate taxable amount (EVERYTHING is taxable in AZ for rental services)
  const taxableAmount = basePrice +
                        serviceFee +
                        input.insurancePrice +
                        input.deliveryFee +
                        enhancementsTotal

  // Get city-specific tax rate
  const { rate: taxRate, display: taxRateDisplay } = getTaxRate(input.city || 'Phoenix')

  // Calculate taxes with proper rounding (round to cents)
  const taxes = Math.round(taxableAmount * taxRate * 100) / 100

  // Subtotal before tax (for display purposes)
  const subtotalBeforeTax = taxableAmount

  // Final total
  const total = Math.round((subtotalBeforeTax + taxes) * 100) / 100

  // Build Stripe-ready line items (amounts in cents)
  const lineItems: BookingPricingResult['lineItems'] = [
    {
      description: `Car Rental (${input.days} day${input.days > 1 ? 's' : ''})`,
      amount: Math.round(basePrice * 100),
      taxable: true
    },
    {
      description: 'Service Fee',
      amount: Math.round(serviceFee * 100),
      taxable: true
    }
  ]

  if (input.insurancePrice > 0) {
    lineItems.push({
      description: 'Insurance Protection',
      amount: Math.round(input.insurancePrice * 100),
      taxable: true
    })
  }

  if (input.deliveryFee > 0) {
    lineItems.push({
      description: 'Delivery Fee',
      amount: Math.round(input.deliveryFee * 100),
      taxable: true
    })
  }

  if (enhancementsTotal > 0) {
    lineItems.push({
      description: 'Experience Enhancements',
      amount: Math.round(enhancementsTotal * 100),
      taxable: true
    })
  }

  lineItems.push({
    description: `Arizona Tax (${taxRateDisplay})`,
    amount: Math.round(taxes * 100),
    taxable: false  // Tax itself is not taxed
  })

  return {
    basePrice,
    insurancePrice: input.insurancePrice,
    deliveryFee: input.deliveryFee,
    enhancementsTotal,
    serviceFee,
    taxableAmount,
    taxRate,
    taxRateDisplay,
    taxes,
    subtotalBeforeTax,
    total,
    lineItems
  }
}

// ============================================================================
// HELPER: Format price for display
// ============================================================================

export function formatPrice(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// ============================================================================
// HELPER: Calculate from BookingWidget state
// ============================================================================

/**
 * Convenience function to calculate pricing from BookingWidget's internal state
 */
export function calculateFromWidgetState(params: {
  dailyRate: number
  days: number
  weeklyRate?: number
  monthlyRate?: number
  insurancePrice: number
  deliveryFee: number
  refuelService: number
  additionalDriver: number
  extraMiles: number
  vipConcierge: number
  city: string
}): BookingPricingResult {
  return calculateBookingPricing({
    dailyRate: params.dailyRate,
    days: params.days,
    weeklyRate: params.weeklyRate,
    monthlyRate: params.monthlyRate,
    insurancePrice: params.insurancePrice,
    deliveryFee: params.deliveryFee,
    enhancements: {
      refuelService: params.refuelService,
      additionalDriver: params.additionalDriver,
      extraMiles: params.extraMiles,
      vipConcierge: params.vipConcierge
    },
    city: params.city
  })
}

// ============================================================================
// FINANCIAL BALANCE APPLICATION
// ============================================================================

export interface GuestBalances {
  creditBalance: number      // 100% usable for any booking charges
  bonusBalance: number       // Max 25% of rental subtotal (base price only)
  depositWalletBalance: number  // For security deposits only
}

export interface AppliedBalancesResult {
  // What gets applied
  creditsApplied: number     // Full credits used against booking total
  bonusApplied: number       // Bonus used (capped at 25% of subtotal)

  // Security deposit breakdown
  depositFromWallet: number  // Deposit covered by wallet
  depositFromCard: number    // Deposit that needs card hold

  // Final amounts
  amountToPay: number        // What customer pays via card for booking
  totalSavings: number       // Total saved from credits + bonus

  // Remaining balances after booking
  remainingCredits: number
  remainingBonus: number
  remainingDeposit: number
}

/**
 * Calculate how credits, bonus, and deposit wallet should be applied to a booking
 *
 * Rules:
 * 1. Bonus applies FIRST: max 25% of rental subtotal (base price before fees/insurance)
 * 2. Credits apply SECOND: 100% usable against remaining booking total
 * 3. Deposit wallet: used for security deposit only, not for rental charges
 *
 * @param pricing - The booking pricing result from calculateBookingPricing
 * @param depositAmount - The required security deposit amount
 * @param balances - Guest's current balances (credits, bonus, deposit wallet)
 * @param maxBonusPercentage - Max % of subtotal that bonus can cover (default 25%)
 */
export function calculateAppliedBalances(
  pricing: BookingPricingResult,
  depositAmount: number,
  balances: GuestBalances,
  maxBonusPercentage: number = 0.25
): AppliedBalancesResult {
  // 1. Calculate max bonus allowed (25% of base rental price only, not total)
  const maxBonusAllowed = Math.round(pricing.basePrice * maxBonusPercentage * 100) / 100

  // Bonus applied: minimum of (available bonus, max allowed, booking total)
  const bonusApplied = Math.min(
    balances.bonusBalance,
    maxBonusAllowed,
    pricing.total
  )

  // 2. After bonus, calculate remaining amount for credits
  const afterBonus = pricing.total - bonusApplied

  // Credits applied: minimum of (available credits, remaining amount)
  const creditsApplied = Math.min(
    balances.creditBalance,
    afterBonus
  )

  // 3. Final amount to pay via card
  const amountToPay = Math.round((pricing.total - creditsApplied - bonusApplied) * 100) / 100

  // 4. Handle security deposit from wallet vs card
  const depositFromWallet = Math.min(balances.depositWalletBalance, depositAmount)
  const depositFromCard = Math.round((depositAmount - depositFromWallet) * 100) / 100

  // 5. Calculate totals and remaining balances
  const totalSavings = creditsApplied + bonusApplied

  return {
    creditsApplied: Math.round(creditsApplied * 100) / 100,
    bonusApplied: Math.round(bonusApplied * 100) / 100,
    depositFromWallet: Math.round(depositFromWallet * 100) / 100,
    depositFromCard,
    amountToPay,
    totalSavings: Math.round(totalSavings * 100) / 100,
    remainingCredits: Math.round((balances.creditBalance - creditsApplied) * 100) / 100,
    remainingBonus: Math.round((balances.bonusBalance - bonusApplied) * 100) / 100,
    remainingDeposit: Math.round((balances.depositWalletBalance - depositFromWallet) * 100) / 100
  }
}

/**
 * Format applied balances for display in checkout UI
 */
export function formatAppliedBalances(applied: AppliedBalancesResult): {
  creditsLine: string | null
  bonusLine: string | null
  depositWalletLine: string | null
  depositCardLine: string | null
  savingsMessage: string | null
} {
  return {
    creditsLine: applied.creditsApplied > 0
      ? `-$${formatPrice(applied.creditsApplied)} credits applied`
      : null,
    bonusLine: applied.bonusApplied > 0
      ? `-$${formatPrice(applied.bonusApplied)} bonus applied`
      : null,
    depositWalletLine: applied.depositFromWallet > 0
      ? `$${formatPrice(applied.depositFromWallet)} from wallet`
      : null,
    depositCardLine: applied.depositFromCard > 0
      ? `$${formatPrice(applied.depositFromCard)} card hold`
      : null,
    savingsMessage: applied.totalSavings > 0
      ? `You're saving $${formatPrice(applied.totalSavings)} on this booking!`
      : null
  }
}
