// app/(guest)/rentals/lib/booking-pricing.ts
// Centralized booking pricing calculations for consistent totals across all booking stages
// Used by: BookingWidget, book page, and Stripe payment processing

import { getTaxRate } from './arizona-taxes'

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
