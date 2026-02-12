// app/lib/booking/cancellation-policy.ts
// Turo-style day-based cancellation policy
// Penalty = X days' average cost instead of percentage of total
// All calculations use MST (UTC-7) since Arizona doesn't observe DST

export type CancellationTier = 'free' | 'late_long' | 'late_short'

export interface CancellationResult {
  tier: CancellationTier
  penaltyAmount: number        // Dollar amount of penalty
  penaltyDays: number          // How many days' cost charged (0, 0.5, or 1)
  refundAmount: number         // Trip cost minus penalty
  refundPercentage: number     // For backward compat: refund as % of trip cost
  depositRefunded: boolean     // Always true — deposit released on any cancellation
  label: string
  hoursUntilPickup: number
  averageDailyCost: number
}

/**
 * Calculate cancellation penalty using day-based approach (Turo-style).
 *
 * Policy:
 *   24+ hours before pickup  → Free cancellation (no penalty)
 *   <24 hours, trips > 2 days → Penalty = 1 day's average cost
 *   <24 hours, trips ≤ 2 days → Penalty = 50% of 1 day's average cost
 *
 * Security deposit is ALWAYS released regardless of timing.
 * Average daily cost = totalAmount / numberOfDays
 */
export function calculateCancellationRefund(
  startDate: Date,
  totalAmount: number,
  numberOfDays: number
): CancellationResult {
  const MST_OFFSET_MS = 7 * 60 * 60 * 1000 // UTC-7

  // Convert both to MST epoch millis for comparison
  const nowMST = Date.now() - MST_OFFSET_MS
  const startMST = new Date(startDate).getTime() - MST_OFFSET_MS

  const diffMs = startMST - nowMST
  const hoursUntilPickup = Math.max(0, diffMs / (1000 * 60 * 60))

  const safeDays = Math.max(1, numberOfDays)
  const averageDailyCost = totalAmount / safeDays

  // 24+ hours: free cancellation
  if (hoursUntilPickup >= 24) {
    return {
      tier: 'free',
      penaltyAmount: 0,
      penaltyDays: 0,
      refundAmount: totalAmount,
      refundPercentage: 100,
      depositRefunded: true,
      label: '24+ hours before pickup — full refund',
      hoursUntilPickup,
      averageDailyCost,
    }
  }

  // <24 hours: late cancellation
  if (safeDays > 2) {
    // Long trips (3+ days): penalty = 1 day's average cost
    const penalty = Math.round(averageDailyCost * 100) / 100
    const refund = Math.round((totalAmount - penalty) * 100) / 100
    return {
      tier: 'late_long',
      penaltyAmount: penalty,
      penaltyDays: 1,
      refundAmount: Math.max(0, refund),
      refundPercentage: totalAmount > 0 ? Math.round((Math.max(0, refund) / totalAmount) * 100) : 0,
      depositRefunded: true,
      label: `Less than 24 hours before pickup — 1 day penalty ($${penalty.toFixed(2)})`,
      hoursUntilPickup,
      averageDailyCost,
    }
  }

  // Short trips (1-2 days): penalty = 50% of 1 day's average cost
  const penalty = Math.round(averageDailyCost * 0.5 * 100) / 100
  const refund = Math.round((totalAmount - penalty) * 100) / 100
  return {
    tier: 'late_short',
    penaltyAmount: penalty,
    penaltyDays: 0.5,
    refundAmount: Math.max(0, refund),
    refundPercentage: totalAmount > 0 ? Math.round((Math.max(0, refund) / totalAmount) * 100) : 0,
    depositRefunded: true,
    label: `Less than 24 hours before pickup — half-day penalty ($${penalty.toFixed(2)})`,
    hoursUntilPickup,
    averageDailyCost,
  }
}

/**
 * Apply refund percentage to a dollar amount.
 * Returns the refund amount rounded to 2 decimal places.
 * Kept for backward compatibility with existing code.
 */
export function calculateRefundAmount(totalAmount: number, percentage: number): number {
  return Math.round(totalAmount * (percentage / 100) * 100) / 100
}

/**
 * Calculate how penalty is distributed across payment sources.
 * Penalty is split proportionally based on how the guest paid.
 */
export function calculatePenaltyDistribution(
  penaltyAmount: number,
  tripCost: number,
  creditsApplied: number,
  bonusApplied: number,
  chargeAmount: number
): {
  penaltyFromCredits: number
  penaltyFromBonus: number
  penaltyFromCard: number
  creditsRestored: number
  bonusRestored: number
  cardRefund: number
} {
  if (penaltyAmount <= 0 || tripCost <= 0) {
    return {
      penaltyFromCredits: 0,
      penaltyFromBonus: 0,
      penaltyFromCard: 0,
      creditsRestored: creditsApplied,
      bonusRestored: bonusApplied,
      cardRefund: chargeAmount,
    }
  }

  // Proportional split based on payment source ratios
  const creditRatio = creditsApplied / tripCost
  const bonusRatio = bonusApplied / tripCost
  const cardRatio = chargeAmount / tripCost

  const penaltyFromCredits = Math.round(penaltyAmount * creditRatio * 100) / 100
  const penaltyFromBonus = Math.round(penaltyAmount * bonusRatio * 100) / 100
  // Card gets the remainder to avoid rounding gaps
  const penaltyFromCard = Math.round((penaltyAmount - penaltyFromCredits - penaltyFromBonus) * 100) / 100

  return {
    penaltyFromCredits,
    penaltyFromBonus,
    penaltyFromCard,
    creditsRestored: Math.round((creditsApplied - penaltyFromCredits) * 100) / 100,
    bonusRestored: Math.round((bonusApplied - penaltyFromBonus) * 100) / 100,
    cardRefund: Math.round((chargeAmount - penaltyFromCard) * 100) / 100,
  }
}
