// app/lib/host-earnings.ts
// Single source of truth for host earnings calculations
// Used by: /api/host/dashboard, /api/partner/revenue, /api/partner/analytics
//
// RULE: Hosts ONLY see their net earnings. NEVER the guest total (totalAmount).
// Guest total includes service fee, taxes, insurance — host never sees this.

/**
 * Calculate what the host earns from a booking.
 * gross = subtotal + deliveryFee (the host-relevant portion)
 * platformFee = gross × rate
 * processingFee = gross × 2.9% + $0.30
 * hostEarnings = gross - platformFee - processingFee
 */
export function calcHostEarnings(
  booking: {
    subtotal?: number | null
    deliveryFee?: number | null
    platformFeeRate?: number | null
  },
  defaultCommissionRate: number = 0.25
): number {
  const gross = (Number(booking.subtotal) || 0) + (Number(booking.deliveryFee) || 0)
  const rate = booking.platformFeeRate ? Number(booking.platformFeeRate) : defaultCommissionRate
  const platformFee = gross * rate
  const processingFee = gross * 0.029 + 0.30
  return Math.round(Math.max(0, gross - platformFee - processingFee) * 100) / 100
}

/**
 * Pipeline stage rules for revenue display:
 *
 * AWAITING_APPROVAL:
 *   - PENDING bookings where fleetStatus !== 'APPROVED'
 *   - Fleet hasn't approved yet → host can't act
 *
 * PENDING_EARNINGS:
 *   - PENDING bookings where fleetStatus === 'APPROVED'
 *   - Fleet approved, waiting for host to approve
 *
 * IN_AVAILABLE_BALANCE:
 *   - Only from host.pendingBalance (set when trip ENDS + RentalPayout created)
 *   - NOT from CONFIRMED/ACTIVE bookings — trip hasn't earned anything yet
 *   - After trip end + 3-day hold → becomes withdrawable
 *
 * COMPLETED_CARD:
 *   - COMPLETED bookings with stripeChargeId or paymentIntentId
 *
 * COMPLETED_CASH:
 *   - COMPLETED bookings with NO stripeChargeId and NO paymentIntentId
 */
export type PipelineStage =
  | 'AWAITING_APPROVAL'
  | 'PENDING_EARNINGS'
  | 'IN_AVAILABLE_BALANCE'
  | 'COMPLETED_CARD'
  | 'COMPLETED_CASH'

export function getBookingPipelineStage(booking: {
  status: string
  fleetStatus?: string | null
  stripeChargeId?: string | null
  paymentIntentId?: string | null
}): PipelineStage {
  if (booking.status === 'PENDING') {
    return booking.fleetStatus === 'APPROVED' ? 'PENDING_EARNINGS' : 'AWAITING_APPROVAL'
  }
  if (booking.status === 'CONFIRMED' || booking.status === 'ACTIVE') {
    return 'IN_AVAILABLE_BALANCE'
  }
  // COMPLETED
  if (booking.stripeChargeId || booking.paymentIntentId) {
    return 'COMPLETED_CARD'
  }
  return 'COMPLETED_CASH'
}
