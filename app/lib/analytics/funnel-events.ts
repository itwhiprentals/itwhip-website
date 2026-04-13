// app/lib/analytics/funnel-events.ts
// Booking funnel tracking — thin wrapper over page view tracking.
// No React dependency. Fire-and-forget. Used by car detail + checkout pages.

export type FunnelStep =
  | 'funnel_car_viewed'
  | 'funnel_book_clicked'
  | 'funnel_dates_selected'
  | 'funnel_insurance_selected'
  | 'funnel_checkout_loaded'
  | 'funnel_identity_started'
  | 'funnel_identity_completed'
  | 'funnel_payment_started'
  | 'funnel_payment_processing'
  | 'funnel_booking_confirmed'
  | 'funnel_abandoned'
  | 'funnel_error'

// Step numbers for ordering in the funnel chart
// Matches the ACTUAL user flow: browse car page → select dates/insurance → click Book → checkout
export const FUNNEL_STEP_ORDER: Record<FunnelStep, number> = {
  funnel_car_viewed: 1,
  funnel_dates_selected: 2,
  funnel_insurance_selected: 3,
  funnel_book_clicked: 4,
  funnel_checkout_loaded: 5,
  funnel_identity_started: 6,
  funnel_identity_completed: 7,
  funnel_payment_started: 8,
  funnel_payment_processing: 9,
  funnel_booking_confirmed: 10,
  funnel_abandoned: -1,
  funnel_error: -2,
}

// Human-readable labels for the dashboard
export const FUNNEL_STEP_LABELS: Record<FunnelStep, string> = {
  funnel_car_viewed: 'Viewed Car',
  funnel_dates_selected: 'Selected Dates',
  funnel_insurance_selected: 'Chose Insurance',
  funnel_book_clicked: 'Clicked Book',
  funnel_checkout_loaded: 'Checkout Loaded',
  funnel_identity_started: 'Started ID Verify',
  funnel_identity_completed: 'ID Verified',
  funnel_payment_started: 'Started Payment',
  funnel_payment_processing: 'Processing Payment',
  funnel_booking_confirmed: 'Booking Confirmed',
  funnel_abandoned: 'Abandoned',
  funnel_error: 'Error',
}

interface FunnelMetadata {
  carId?: string
  carName?: string
  step?: number
  totalAmount?: number
  insuranceTier?: string
  paymentMethod?: string
  errorMessage?: string
  abandonedAtStep?: string
  [key: string]: any
}

/**
 * Track a booking funnel step. Fire-and-forget — never blocks UI.
 * Call from car detail page, checkout page, and booking success handler.
 */
export function trackFunnelStep(step: FunnelStep, metadata?: FunnelMetadata): void {
  if (typeof window === 'undefined') return

  const data = {
    path: window.location.pathname,
    eventType: step,
    metadata: {
      ...metadata,
      stepNumber: FUNNEL_STEP_ORDER[step],
      timestamp: new Date().toISOString(),
    },
  }

  fetch('/api/fleet/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    keepalive: true,
  }).catch(() => {})
}
