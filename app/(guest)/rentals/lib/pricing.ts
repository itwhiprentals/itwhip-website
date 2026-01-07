// app/(guest)/rentals/lib/pricing.ts
// Pricing calculations for the rental system

import {
  PricingCalculation,
  BookingPriceBreakdown,
  CarType,
  DeliveryType,
  CarSource
} from '@/app/types/rental'
import { PRICING_CONFIG, CAR_TYPES, DELIVERY_OPTIONS } from './constants'
import { differenceInDays, differenceInHours } from 'date-fns'
import { getTaxRate } from './arizona-taxes'

// ============================================================================
// MAIN PRICING CALCULATOR
// ============================================================================

export function calculateRentalPrice(params: {
  dailyRate: number
  startDate: Date | string
  endDate: Date | string
  carType: CarType
  deliveryType?: DeliveryType
  deliveryDistance?: number
  includeInsurance?: boolean
  insuranceType?: 'basic' | 'premium'
  driverAge?: number
  extras?: string[]
  source?: CarSource
  weeklyRate?: number
  monthlyRate?: number
  city?: string  // For city-specific tax rate
}): PricingCalculation {
  const start = new Date(params.startDate)
  const end = new Date(params.endDate)
  
  // Calculate rental duration
  const numberOfDays = Math.max(1, differenceInDays(end, start))
  const numberOfHours = differenceInHours(end, start)
  
  // If less than 24 hours, still charge for 1 day
  const chargeableDays = numberOfHours < 24 && numberOfHours > 0 ? 1 : numberOfDays

  // Base price calculation
  let basePrice = params.dailyRate * chargeableDays

  // Apply weekly or monthly rates if provided
  let weeklyDiscount = undefined
  let monthlyDiscount = undefined

  if (params.weeklyRate && chargeableDays >= 7 && chargeableDays < 28) {
    const weeklyPrice = params.weeklyRate * Math.ceil(chargeableDays / 7)
    if (weeklyPrice < basePrice) {
      const discountAmount = basePrice - weeklyPrice
      weeklyDiscount = {
        applicable: true,
        percentage: PRICING_CONFIG.WEEKLY_DISCOUNT,
        amount: discountAmount
      }
      basePrice = weeklyPrice
    }
  } else if (params.monthlyRate && chargeableDays >= 28) {
    const monthlyPrice = params.monthlyRate * Math.ceil(chargeableDays / 30)
    if (monthlyPrice < basePrice) {
      const discountAmount = basePrice - monthlyPrice
      monthlyDiscount = {
        applicable: true,
        percentage: PRICING_CONFIG.MONTHLY_DISCOUNT,
        amount: discountAmount
      }
      basePrice = monthlyPrice
    }
  } else {
    // Apply standard discounts if no custom rates
    if (chargeableDays >= PRICING_CONFIG.MONTHLY_THRESHOLD_DAYS) {
      const discountAmount = basePrice * PRICING_CONFIG.MONTHLY_DISCOUNT
      monthlyDiscount = {
        applicable: true,
        percentage: PRICING_CONFIG.MONTHLY_DISCOUNT,
        amount: discountAmount
      }
      basePrice -= discountAmount
    } else if (chargeableDays >= PRICING_CONFIG.WEEKLY_THRESHOLD_DAYS) {
      const discountAmount = basePrice * PRICING_CONFIG.WEEKLY_DISCOUNT
      weeklyDiscount = {
        applicable: true,
        percentage: PRICING_CONFIG.WEEKLY_DISCOUNT,
        amount: discountAmount
      }
      basePrice -= discountAmount
    }
  }

  // Calculate delivery fee
  let deliveryFee = 0
  if (params.deliveryType) {
    const deliveryOption = DELIVERY_OPTIONS[params.deliveryType]
    deliveryFee = deliveryOption.baseFee

    // Add distance-based fee for address delivery
    if (params.deliveryType === 'address' && params.deliveryDistance) {
      if (params.deliveryDistance > PRICING_CONFIG.FREE_DELIVERY_RADIUS_MILES) {
        const extraMiles = params.deliveryDistance - PRICING_CONFIG.FREE_DELIVERY_RADIUS_MILES
        deliveryFee += extraMiles * PRICING_CONFIG.ADDRESS_DELIVERY_PER_MILE
      }
    }
  }

  // Calculate insurance
  let insuranceDaily = 0
  let insuranceTotal = 0
  
  if (params.includeInsurance || 
      (params.driverAge && params.driverAge < PRICING_CONFIG.INSURANCE_REQUIRED_UNDER_AGE)) {
    insuranceDaily = params.insuranceType === 'premium' 
      ? PRICING_CONFIG.PREMIUM_INSURANCE_DAILY 
      : PRICING_CONFIG.BASIC_INSURANCE_DAILY
    insuranceTotal = insuranceDaily * chargeableDays
  }

  // Apply Amadeus markup if applicable
  let amadeusMarkup = 0
  if (params.source === 'amadeus') {
    amadeusMarkup = basePrice * PRICING_CONFIG.AMADEUS_MARKUP
    basePrice += amadeusMarkup
  }

  // Calculate service fee
  const serviceFeePercentage = PRICING_CONFIG.SERVICE_FEE_PERCENTAGE
  const subtotal = basePrice + deliveryFee + insuranceTotal
  const serviceFeeAmount = subtotal * serviceFeePercentage

  // Calculate tax using city-specific rate
  const totalBeforeTax = subtotal + serviceFeeAmount
  const { rate: taxRate } = getTaxRate(params.city || 'phoenix')
  const taxAmount = Math.round(totalBeforeTax * taxRate * 100) / 100

  // Calculate total
  const totalAmount = totalBeforeTax + taxAmount

  // Determine deposit amount based on car type
  const deposit = CAR_TYPES[params.carType]?.deposit || PRICING_CONFIG.DEFAULT_DEPOSIT

  return {
    basePrice,
    numberOfDays: chargeableDays,
    weeklyDiscount,
    monthlyDiscount,
    deliveryFee,
    insuranceDaily,
    insuranceTotal,
    serviceFeePercentage,
    serviceFeeAmount,
    taxRate,
    taxAmount,
    totalBeforeTax,
    totalAmount,
    depositAmount: deposit,
    amadeusMarkup
  }
}

// ============================================================================
// CALCULATE PRICING - FUNCTION FOR BOOKING API
// ============================================================================

export function calculatePricing(params: {
  dailyRate: number
  startDate: Date
  endDate: Date
  weeklyDiscount?: number
  monthlyDiscount?: number
  deliveryFee?: number
  insuranceDaily?: number
  city?: string  // For city-specific tax rate
}): {
  subtotal: number
  serviceFee: number
  taxes: number
  insurance: number
  delivery: number
  total: number
  days: number
  discount: number
  discountPercent: number
} {
  // Calculate number of days
  const days = Math.max(1, Math.ceil((params.endDate.getTime() - params.startDate.getTime()) / (1000 * 60 * 60 * 24)))
  
  // Calculate base rental cost
  let subtotal = params.dailyRate * days
  let discount = 0
  let discountPercent = 0
  
  // Apply weekly or monthly discounts
  if (days >= 30 && params.monthlyDiscount) {
    discountPercent = params.monthlyDiscount
    discount = subtotal * (params.monthlyDiscount / 100)
    subtotal = subtotal - discount
  } else if (days >= 7 && params.weeklyDiscount) {
    discountPercent = params.weeklyDiscount
    discount = subtotal * (params.weeklyDiscount / 100)
    subtotal = subtotal - discount
  }
  
  // Calculate additional fees
  const insurance = params.insuranceDaily ? params.insuranceDaily * days : 0
  const delivery = params.deliveryFee || 0
  const serviceFee = subtotal * 0.15 // 15% service fee
  // Use city-specific tax rate (defaults to Phoenix ~8.4%)
  const { rate: taxRate } = getTaxRate(params.city || 'phoenix')
  const taxes = Math.round((subtotal + serviceFee) * taxRate * 100) / 100
  
  // Calculate total
  const total = subtotal + serviceFee + taxes + insurance + delivery
  
  return {
    subtotal,
    serviceFee,
    taxes,
    insurance,
    delivery,
    total,
    days,
    discount,
    discountPercent
  }
}

// ============================================================================
// BOOKING PRICE BREAKDOWN
// ============================================================================

export function createBookingPriceBreakdown(
  calculation: PricingCalculation
): BookingPriceBreakdown {
  const discountAmount = 
    (calculation.weeklyDiscount?.amount || 0) + 
    (calculation.monthlyDiscount?.amount || 0)

  return {
    dailyRate: calculation.basePrice / calculation.numberOfDays,
    numberOfDays: calculation.numberOfDays,
    subtotal: calculation.basePrice,
    weeklyDiscount: calculation.weeklyDiscount?.amount,
    monthlyDiscount: calculation.monthlyDiscount?.amount,
    deliveryFee: calculation.deliveryFee,
    insuranceFee: calculation.insuranceTotal,
    serviceFee: calculation.serviceFeeAmount,
    taxes: calculation.taxAmount,
    totalAmount: calculation.totalAmount,
    depositAmount: calculation.depositAmount
  }
}

// ============================================================================
// PRICE ESTIMATION
// ============================================================================

export function estimatePrice(
  dailyRate: number,
  numberOfDays: number,
  carType: CarType = 'midsize',
  includeInsurance: boolean = false,
  city?: string  // For city-specific tax rate
): number {
  let price = dailyRate * numberOfDays

  // Apply discounts
  if (numberOfDays >= PRICING_CONFIG.MONTHLY_THRESHOLD_DAYS) {
    price *= (1 - PRICING_CONFIG.MONTHLY_DISCOUNT)
  } else if (numberOfDays >= PRICING_CONFIG.WEEKLY_THRESHOLD_DAYS) {
    price *= (1 - PRICING_CONFIG.WEEKLY_DISCOUNT)
  }

  // Add insurance if included
  if (includeInsurance) {
    price += PRICING_CONFIG.BASIC_INSURANCE_DAILY * numberOfDays
  }

  // Add service fee
  price *= (1 + PRICING_CONFIG.SERVICE_FEE_PERCENTAGE)

  // Add tax using city-specific rate
  const { rate: taxRate } = getTaxRate(city || 'phoenix')
  price *= (1 + taxRate)

  return Math.round(price * 100) / 100
}

// ============================================================================
// HOST EARNINGS CALCULATOR
// ============================================================================

export function calculateHostEarnings(params: {
  totalAmount: number
  serviceFee: number
  numberOfDays: number
  source: CarSource
  city?: string  // For city-specific tax rate
}): {
  grossEarnings: number
  platformFee: number
  netEarnings: number
  earningsPerDay: number
} {
  // Remove service fee and tax from total to get base amount
  const baseAmount = params.totalAmount - params.serviceFee
  const { rate: taxRate } = getTaxRate(params.city || 'phoenix')
  const taxAmount = baseAmount * taxRate
  const grossEarnings = baseAmount - taxAmount

  // Calculate platform fee based on source
  let platformFeeRate = 0
  if (params.source === 'p2p') {
    platformFeeRate = PRICING_CONFIG.PLATFORM_COMMISSION
  } else if (params.source === 'partner') {
    platformFeeRate = 0.15 // Lower fee for partners
  }
  // Amadeus cars don't pay host earnings (we keep all markup)

  const platformFee = grossEarnings * platformFeeRate
  const netEarnings = grossEarnings - platformFee
  const earningsPerDay = netEarnings / params.numberOfDays

  return {
    grossEarnings: Math.round(grossEarnings * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    netEarnings: Math.round(netEarnings * 100) / 100,
    earningsPerDay: Math.round(earningsPerDay * 100) / 100
  }
}

// ============================================================================
// PRICE FORMATTING
// ============================================================================

export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatPriceRange(min: number, max: number, currency: string = 'USD'): string {
  return `${formatPrice(min, currency)}-${formatPrice(max, currency)}`
}

// ============================================================================
// DYNAMIC PRICING
// ============================================================================

export function applyDynamicPricing(
  basePrice: number,
  params: {
    dayOfWeek: number // 0 = Sunday, 6 = Saturday
    isHoliday?: boolean
    isEventDay?: boolean
    demandMultiplier?: number
    seasonalMultiplier?: number
  }
): number {
  let price = basePrice

  // Weekend pricing (Fri-Sun)
  if (params.dayOfWeek === 5 || params.dayOfWeek === 6 || params.dayOfWeek === 0) {
    price *= 1.2 // 20% increase on weekends
  }

  // Holiday pricing
  if (params.isHoliday) {
    price *= 1.5 // 50% increase on holidays
  }

  // Event day pricing (concerts, sports, etc.)
  if (params.isEventDay) {
    price *= 1.3 // 30% increase on event days
  }

  // Apply demand multiplier if provided
  if (params.demandMultiplier) {
    price *= params.demandMultiplier
  }

  // Apply seasonal multiplier if provided
  if (params.seasonalMultiplier) {
    price *= params.seasonalMultiplier
  }

  return Math.round(price * 100) / 100
}

// ============================================================================
// COMPARISON TOOLS
// ============================================================================

export function calculateSavingsVsCompetitor(
  ourPrice: number,
  competitorPrice: number
): {
  savings: number
  percentage: number
  message: string
} {
  const savings = competitorPrice - ourPrice
  const percentage = (savings / competitorPrice) * 100

  let message = ''
  if (savings > 0) {
    message = `Save ${formatPrice(savings)} (${Math.round(percentage)}%)`
  } else if (savings < 0) {
    message = 'Best value guaranteed'
  } else {
    message = 'Same price, better service'
  }

  return {
    savings: Math.round(savings * 100) / 100,
    percentage: Math.round(percentage * 10) / 10,
    message
  }
}

// ============================================================================
// EXTRAS PRICING
// ============================================================================

export function calculateExtrasPrice(
  extras: string[],
  numberOfDays: number,
  extrasConfig = [
    { id: 'gps', price: 10, perDay: true },
    { id: 'child_seat', price: 15, perDay: true },
    { id: 'toll_pass', price: 8, perDay: true },
    { id: 'wifi', price: 12, perDay: true },
    { id: 'cooler', price: 20, perDay: false },
    { id: 'bike_rack', price: 25, perDay: false }
  ]
): number {
  let total = 0

  extras.forEach(extraId => {
    const extra = extrasConfig.find(e => e.id === extraId)
    if (extra) {
      total += extra.perDay ? extra.price * numberOfDays : extra.price
    }
  })

  return total
}

// ============================================================================
// PRICE VALIDATION
// ============================================================================

export function validatePricing(price: number, carType: CarType): {
  valid: boolean
  message?: string
} {
  const expectedRange = CAR_TYPES[carType]?.priceRange
  if (!expectedRange) {
    return { valid: true }
  }

  // Parse the price range (e.g., "$25-40")
  const [minStr, maxStr] = expectedRange.replace(/\$/g, '').split('-')
  const min = parseInt(minStr)
  const max = parseInt(maxStr)

  if (price < min * 0.5) {
    return { 
      valid: false, 
      message: `Price seems too low for ${carType} (expected ${expectedRange}/day)` 
    }
  }

  if (price > max * 3) {
    return { 
      valid: false, 
      message: `Price seems too high for ${carType} (expected ${expectedRange}/day)` 
    }
  }

  return { valid: true }
}