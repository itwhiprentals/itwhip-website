// app/lib/payouts/create-historical-payout.ts

import { prisma } from '@/app/lib/database/prisma'
import { PLATFORM_COMMISSION } from '@/app/fleet/financial-constants'

/**
 * Creates a historical PAID payout record for a completed booking
 * These payouts represent trips that already happened in the past
 */

interface HistoricalPayoutParams {
  bookingId: string
  hostId: string
  bookingTotal: number
  tripStartDate: Date
  tripEndDate: Date
  reviewCreatedAt: Date // When guest left review = trip completion
  useChaufferRate?: boolean // true = 40% commission, false = 25% commission
}

interface PayoutCalculation {
  bookingTotal: number
  platformCommission: number
  platformRevenue: number
  hostEarnings: number
  commissionRate: number
}

/**
 * Calculate payout amounts based on booking total and commission rate
 */
function calculatePayoutAmounts(
  bookingTotal: number,
  useChaufferRate: boolean = false
): PayoutCalculation {
  // Get commission rate
  const commissionRate = useChaufferRate
    ? PLATFORM_COMMISSION.BASIC      // 60% (chauffeur/platform insurance rate)
    : PLATFORM_COMMISSION.STANDARD   // 25% (standard host rate)
  
  // Calculate amounts
  const platformRevenue = bookingTotal * commissionRate
  const hostEarnings = bookingTotal - platformRevenue
  
  return {
    bookingTotal,
    platformCommission: commissionRate,
    platformRevenue,
    hostEarnings,
    commissionRate
  }
}

/**
 * Create a historical payout record
 */
export async function createHistoricalPayout(
  params: HistoricalPayoutParams
): Promise<{
  success: boolean
  payout?: any
  calculation?: PayoutCalculation
  error?: string
}> {
  const {
    bookingId,
    hostId,
    bookingTotal,
    tripStartDate,
    tripEndDate,
    reviewCreatedAt,
    useChaufferRate = false
  } = params

  try {
    // Calculate payout amounts
    const calculation = calculatePayoutAmounts(bookingTotal, useChaufferRate)

    // Create the payout record
    const payout = await prisma.rentalPayout.create({
      data: {
        hostId,
        bookingId,
        amount: calculation.hostEarnings,
        status: 'PAID', // Historical - already completed

        // Eligibility and processing dates (same for historical)
        eligibleAt: reviewCreatedAt, // Trip was completed when review was made
        processedAt: reviewCreatedAt, // Mark as processed at review time

        // Period tracking
        startDate: tripStartDate,
        endDate: tripEndDate,

        // Financial breakdown
        bookingCount: 1,
        grossEarnings: bookingTotal,
        platformFee: calculation.platformRevenue,
        processingFee: 0, // No additional processing fee for historical
        netPayout: calculation.hostEarnings,

        currency: 'USD'
      } as any
    })

    return {
      success: true,
      payout,
      calculation
    }
  } catch (error) {
    console.error('Failed to create historical payout:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Create multiple historical payouts in batch
 */
export async function createHistoricalPayoutsBatch(
  payouts: HistoricalPayoutParams[]
): Promise<{
  success: boolean
  created: number
  failed: number
  errors: string[]
  totalHostEarnings: number
  totalPlatformRevenue: number
}> {
  let created = 0
  let failed = 0
  const errors: string[] = []
  let totalHostEarnings = 0
  let totalPlatformRevenue = 0

  for (const payoutParams of payouts) {
    const result = await createHistoricalPayout(payoutParams)
    
    if (result.success && result.calculation) {
      created++
      totalHostEarnings += result.calculation.hostEarnings
      totalPlatformRevenue += result.calculation.platformRevenue
    } else {
      failed++
      if (result.error) {
        errors.push(`Booking ${payoutParams.bookingId}: ${result.error}`)
      }
    }
  }

  return {
    success: failed === 0,
    created,
    failed,
    errors,
    totalHostEarnings,
    totalPlatformRevenue
  }
}

/**
 * Check if payout already exists for a booking
 */
export async function payoutExistsForBooking(
  bookingId: string
): Promise<boolean> {
  const existingPayout = await prisma.rentalPayout.findFirst({
    where: { bookingId }
  })
  
  return !!existingPayout
}

/**
 * Get commission rate display text
 */
export function getCommissionRateDisplay(useChaufferRate: boolean): {
  platformRate: string
  hostRate: string
  description: string
} {
  if (useChaufferRate) {
    return {
      platformRate: '40%',
      hostRate: '60%',
      description: 'Chauffeur service / Using platform insurance'
    }
  }
  
  return {
    platformRate: '25%',
    hostRate: '75%',
    description: 'Standard rental / Host using own insurance'
  }
}

/**
 * Validate payout parameters
 */
export function validatePayoutParams(
  params: HistoricalPayoutParams
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!params.bookingId) {
    errors.push('Booking ID is required')
  }
  
  if (!params.hostId) {
    errors.push('Host ID is required')
  }
  
  if (!params.bookingTotal || params.bookingTotal <= 0) {
    errors.push('Booking total must be greater than 0')
  }
  
  if (!params.tripStartDate) {
    errors.push('Trip start date is required')
  }
  
  if (!params.tripEndDate) {
    errors.push('Trip end date is required')
  }
  
  if (!params.reviewCreatedAt) {
    errors.push('Review created date is required')
  }
  
  if (params.tripStartDate && params.tripEndDate) {
    if (params.tripEndDate < params.tripStartDate) {
      errors.push('Trip end date must be after start date')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Preview payout calculation without creating record
 */
export function previewPayoutCalculation(
  bookingTotal: number,
  useChaufferRate: boolean = false
): PayoutCalculation {
  return calculatePayoutAmounts(bookingTotal, useChaufferRate)
}

// Export types
export type { HistoricalPayoutParams, PayoutCalculation }