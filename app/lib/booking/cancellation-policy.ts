// app/lib/booking/cancellation-policy.ts
// Cancellation policy: time-based refund tiers
// All calculations use MST (UTC-7) since Arizona doesn't observe DST

export type CancellationTier = 'full' | 'partial_75' | 'partial_50' | 'none'

export interface CancellationResult {
  tier: CancellationTier
  refundPercentage: number
  label: string
  hoursUntilPickup: number
}

/**
 * Calculate refund percentage based on hours until pickup.
 * Uses MST (UTC-7) for both "now" and "startDate" to avoid
 * timezone edge cases (Arizona doesn't observe DST).
 *
 * Tiers:
 *   72+ hours  → 100% refund
 *   24-72 hrs  → 75% refund
 *   12-24 hrs  → 50% refund
 *   <12 hours  → 0% refund
 */
export function calculateCancellationRefund(startDate: Date): CancellationResult {
  const MST_OFFSET_MS = 7 * 60 * 60 * 1000 // UTC-7

  // Convert both to MST epoch millis for comparison
  const nowMST = Date.now() - MST_OFFSET_MS
  const startMST = new Date(startDate).getTime() - MST_OFFSET_MS

  const diffMs = startMST - nowMST
  const hoursUntilPickup = Math.max(0, diffMs / (1000 * 60 * 60))

  if (hoursUntilPickup >= 72) {
    return {
      tier: 'full',
      refundPercentage: 100,
      label: '72+ hours before pickup — full refund',
      hoursUntilPickup,
    }
  }

  if (hoursUntilPickup >= 24) {
    return {
      tier: 'partial_75',
      refundPercentage: 75,
      label: '24-72 hours before pickup — 75% refund',
      hoursUntilPickup,
    }
  }

  if (hoursUntilPickup >= 12) {
    return {
      tier: 'partial_50',
      refundPercentage: 50,
      label: '12-24 hours before pickup — 50% refund',
      hoursUntilPickup,
    }
  }

  return {
    tier: 'none',
    refundPercentage: 0,
    label: 'Less than 12 hours before pickup — no refund',
    hoursUntilPickup,
  }
}

/**
 * Apply refund percentage to a dollar amount.
 * Returns the refund amount rounded to 2 decimal places.
 */
export function calculateRefundAmount(totalAmount: number, percentage: number): number {
  return Math.round(totalAmount * (percentage / 100) * 100) / 100
}
