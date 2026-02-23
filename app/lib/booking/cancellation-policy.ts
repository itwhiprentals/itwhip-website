// app/lib/booking/cancellation-policy.ts
// 4-tier percentage-based cancellation policy
// Matches CancellationPolicyModal, RentalAgreement, legal page, and Choe AI
// All calculations use MST (UTC-7) since Arizona doesn't observe DST

export type CancellationTier = 'free' | 'moderate' | 'late' | 'no_refund'

export interface CancellationResult {
  tier: CancellationTier
  penaltyAmount: number        // Dollar amount of penalty
  refundAmount: number         // Subtotal minus penalty
  refundPercentage: number     // Refund as % of subtotal (100, 75, 50, or 0)
  depositRefunded: boolean     // Always true — deposit released on any cancellation
  label: string
  hoursUntilPickup: number
}

/**
 * Calculate cancellation penalty using 4-tier percentage-based policy.
 *
 * Policy (applied to subtotal only — service fee, insurance, delivery always non-refundable):
 *   72+ hours before pickup  → Free cancellation (100% refund)
 *   24–72 hours              → Moderate (75% refund, 25% penalty)
 *   12–24 hours              → Late (50% refund, 50% penalty)
 *   <12 hours                → No refund (0% refund, 100% penalty)
 *
 * Security deposit is ALWAYS released regardless of timing.
 */
export function calculateCancellationRefund(
  startDate: Date,
  totalAmount: number,
  _numberOfDays?: number // kept for backward compat — no longer used in calculation
): CancellationResult {
  const MST_OFFSET_MS = 7 * 60 * 60 * 1000 // UTC-7

  // Convert both to MST epoch millis for comparison
  const nowMST = Date.now() - MST_OFFSET_MS
  const startMST = new Date(startDate).getTime() - MST_OFFSET_MS

  const diffMs = startMST - nowMST
  const hoursUntilPickup = Math.max(0, diffMs / (1000 * 60 * 60))

  // 72+ hours: free cancellation (100% refund)
  if (hoursUntilPickup >= 72) {
    return {
      tier: 'free',
      penaltyAmount: 0,
      refundAmount: totalAmount,
      refundPercentage: 100,
      depositRefunded: true,
      label: '72+ hours before pickup — full refund',
      hoursUntilPickup,
    }
  }

  // 24–72 hours: moderate (75% refund, 25% penalty)
  if (hoursUntilPickup >= 24) {
    const penalty = Math.round(totalAmount * 0.25 * 100) / 100
    const refund = Math.round((totalAmount - penalty) * 100) / 100
    return {
      tier: 'moderate',
      penaltyAmount: penalty,
      refundAmount: Math.max(0, refund),
      refundPercentage: 75,
      depositRefunded: true,
      label: `24–72 hours before pickup — 25% penalty ($${penalty.toFixed(2)})`,
      hoursUntilPickup,
    }
  }

  // 12–24 hours: late (50% refund, 50% penalty)
  if (hoursUntilPickup >= 12) {
    const penalty = Math.round(totalAmount * 0.50 * 100) / 100
    const refund = Math.round((totalAmount - penalty) * 100) / 100
    return {
      tier: 'late',
      penaltyAmount: penalty,
      refundAmount: Math.max(0, refund),
      refundPercentage: 50,
      depositRefunded: true,
      label: `12–24 hours before pickup — 50% penalty ($${penalty.toFixed(2)})`,
      hoursUntilPickup,
    }
  }

  // <12 hours: no refund (100% penalty)
  return {
    tier: 'no_refund',
    penaltyAmount: totalAmount,
    refundAmount: 0,
    refundPercentage: 0,
    depositRefunded: true,
    label: 'Less than 12 hours before pickup — no refund',
    hoursUntilPickup,
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
