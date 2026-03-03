// app/partner/bookings/new/utils/pricing.ts

import { Vehicle, AvailabilityResult, PartnerTier, DELIVERY_FEES } from '../types'

// Tax rates (Arizona)
export const TAX_RATES = {
  stateSalesTax: 0.056,    // 5.6% Arizona state sales tax
  countyTax: 0.007,        // 0.7% Maricopa County
  cityTax: 0.023,          // 2.3% Phoenix city tax
  rentalTax: 0.05,         // 5% rental surcharge
  serviceFeePercent: 0.10  // 10% platform service fee
}

export interface PriceBreakdown {
  days: number
  dailyRate: number
  rentalSubtotal: number
  deliveryFee: number
  serviceFee: number
  stateTax: number
  countyTax: number
  cityTax: number
  rentalTax: number
  totalTaxes: number
  total: number
  platformCommissionRate: number
  platformCommission: number
  partnerPayout: number
}

const EMPTY_BREAKDOWN: PriceBreakdown = {
  days: 0,
  dailyRate: 0,
  rentalSubtotal: 0,
  deliveryFee: 0,
  serviceFee: 0,
  stateTax: 0,
  countyTax: 0,
  cityTax: 0,
  rentalTax: 0,
  totalTaxes: 0,
  total: 0,
  platformCommissionRate: 0,
  platformCommission: 0,
  partnerPayout: 0
}

export function calculatePriceBreakdown(
  vehicle: Vehicle | null,
  availability: AvailabilityResult | null,
  pickupType: string,
  partnerTier: PartnerTier | null
): PriceBreakdown {
  if (!vehicle || !availability?.tripDays) {
    return EMPTY_BREAKDOWN
  }

  const days = availability.tripDays
  const dailyRate = vehicle.dailyRate
  const weeklyRate = vehicle.weeklyRate || dailyRate * 6.5
  const monthlyRate = vehicle.monthlyRate || dailyRate * 25

  // Calculate rental subtotal with weekly/monthly discounts
  let rentalSubtotal = 0
  if (days >= 28) {
    rentalSubtotal = monthlyRate * Math.floor(days / 28) + dailyRate * (days % 28)
  } else if (days >= 7) {
    rentalSubtotal = weeklyRate * Math.floor(days / 7) + dailyRate * (days % 7)
  } else {
    rentalSubtotal = dailyRate * days
  }

  // Delivery/Airport fee
  const deliveryFee = DELIVERY_FEES[pickupType] || 0

  // Service fee (platform fee from customer - separate from partner commission)
  const serviceFee = rentalSubtotal * TAX_RATES.serviceFeePercent

  // Calculate taxes on subtotal + service fee
  const taxableAmount = rentalSubtotal + serviceFee
  const stateTax = taxableAmount * TAX_RATES.stateSalesTax
  const countyTax = taxableAmount * TAX_RATES.countyTax
  const cityTax = taxableAmount * TAX_RATES.cityTax
  const rentalTax = taxableAmount * TAX_RATES.rentalTax
  const totalTaxes = stateTax + countyTax + cityTax + rentalTax

  // Total customer pays
  const total = rentalSubtotal + deliveryFee + serviceFee + totalTaxes

  // Partner payout calculation (commission is on rental subtotal only)
  const platformCommissionRate = partnerTier?.commissionRate || 0.25
  const platformCommission = rentalSubtotal * platformCommissionRate
  // Partner gets: rental subtotal - platform commission + delivery fees (partner keeps delivery fees)
  const partnerPayout = rentalSubtotal - platformCommission + deliveryFee

  return {
    days,
    dailyRate,
    rentalSubtotal,
    deliveryFee,
    serviceFee,
    stateTax,
    countyTax,
    cityTax,
    rentalTax,
    totalTaxes,
    total,
    platformCommissionRate,
    platformCommission,
    partnerPayout
  }
}
