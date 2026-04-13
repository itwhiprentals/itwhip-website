// app/lib/analytics/funnel-insights.ts
// Pure functions — takes funnel data, returns actionable insights.
// Based on car rental industry benchmarks + general e-commerce conversion data.
// No DB access, no side effects.

export interface FunnelInsight {
  type: 'critical' | 'warning' | 'opportunity' | 'positive'
  title: string
  message: string
  metric: string
  recommendation: string
}

interface FunnelStep {
  step: string
  label: string
  count: number
  dropOff: number
}

interface FunnelSummary {
  topOfFunnel: number
  bottomOfFunnel: number
  overallConversion: number
  errorCount: number
  abandonedCount: number
}

interface SegmentData {
  mobile?: number
  desktop?: number
  mobileConversion?: number
  desktopConversion?: number
}

/**
 * Generate smart insights from funnel data.
 * Returns prioritized recommendations — critical first, positive last.
 */
export function generateInsights(
  steps: FunnelStep[],
  summary: FunnelSummary,
  segments?: SegmentData,
): FunnelInsight[] {
  const insights: FunnelInsight[] = []
  const stepMap = new Map(steps.map(s => [s.step, s]))

  const viewed = stepMap.get('funnel_car_viewed')?.count || 0
  const clicked = stepMap.get('funnel_book_clicked')?.count || 0
  const checkoutLoaded = stepMap.get('funnel_checkout_loaded')?.count || 0
  const identityStarted = stepMap.get('funnel_identity_started')?.count || 0
  const identityCompleted = stepMap.get('funnel_identity_completed')?.count || 0
  const paymentStarted = stepMap.get('funnel_payment_started')?.count || 0
  const confirmed = stepMap.get('funnel_booking_confirmed')?.count || 0

  // Not enough data yet
  if (viewed < 10) {
    insights.push({
      type: 'opportunity',
      title: 'Collecting Data',
      message: `Only ${viewed} car views so far. Insights will become more accurate as traffic grows.`,
      metric: `${viewed} views`,
      recommendation: 'Focus on driving more traffic via SEO, social media, and local partnerships to build a meaningful dataset.',
    })
    return insights
  }

  // ─── Car Page → Book Clicked ─────────────────────────────────────────
  if (viewed > 0 && clicked === 0) {
    insights.push({
      type: 'critical',
      title: 'No One Clicks "Book"',
      message: `${viewed} people viewed cars but 0 clicked the booking button. This is the #1 bottleneck.`,
      metric: '100% drop-off',
      recommendation: 'Sticky Book button and total price are already live. Check if car photos are compelling, reviews are visible, and the Book button stands out on mobile. Add host response time and ratings near the button.',
    })
  } else if (viewed > 0 && clicked / viewed < 0.15) {
    const dropPct = Math.round((1 - clicked / viewed) * 100)
    insights.push({
      type: 'critical',
      title: 'Car Page Drop-Off Too High',
      message: `${dropPct}% of visitors leave the car page without clicking "Continue to Checkout." Industry benchmark is 25-40% click-through.`,
      metric: `${dropPct}% drop-off`,
      recommendation: 'Price summary, sticky Book button, and trust badges are already live. Focus on adding social proof (review count, host rating), improving car photo quality, and ensuring the value proposition is clear above the fold.',
    })
  } else if (viewed > 0 && clicked / viewed >= 0.25) {
    insights.push({
      type: 'positive',
      title: 'Strong Car Page Engagement',
      message: `${Math.round(clicked / viewed * 100)}% of car viewers click through to checkout. This is above industry average.`,
      metric: `${Math.round(clicked / viewed * 100)}% click-through`,
      recommendation: 'Car pages are converting well. Focus optimization on later funnel stages.',
    })
  }

  // ─── Checkout Loaded → Identity ──────────────────────────────────────
  if (checkoutLoaded > 5 && identityStarted / checkoutLoaded < 0.5) {
    const dropPct = Math.round((1 - identityStarted / checkoutLoaded) * 100)
    insights.push({
      type: 'warning',
      title: 'Checkout Abandonment at ID Verification',
      message: `${dropPct}% of guests who reach checkout leave before uploading their driver's license.`,
      metric: `${dropPct}% drop-off`,
      recommendation: 'Add "You\'ll need your driver\'s license" messaging on the car page BEFORE checkout. Add a progress bar showing where they are in checkout. Make the DL upload feel fast and safe with reassurance copy ("AI-verified in seconds, 100% secure").',
    })
  }

  // ─── Identity → Payment ──────────────────────────────────────────────
  if (identityCompleted > 3 && paymentStarted / identityCompleted < 0.7) {
    const dropPct = Math.round((1 - paymentStarted / identityCompleted) * 100)
    insights.push({
      type: 'warning',
      title: 'Drop-Off Between Verification and Payment',
      message: `${dropPct}% of verified guests don't enter payment details.`,
      metric: `${dropPct}% drop-off`,
      recommendation: 'Add trust signals near the payment form: "256-bit encryption", "Secure checkout powered by Stripe", money-back guarantee. Consider Apple Pay / Google Pay for one-tap checkout.',
    })
  }

  // ─── Payment → Confirmed ─────────────────────────────────────────────
  if (paymentStarted > 3 && confirmed / paymentStarted < 0.7) {
    const dropPct = Math.round((1 - confirmed / paymentStarted) * 100)
    insights.push({
      type: 'warning',
      title: 'Payment Completion Issues',
      message: `${dropPct}% of guests who start payment don't complete the booking.`,
      metric: `${dropPct}% drop-off`,
      recommendation: 'Check Stripe dashboard for declined cards. Ensure 3DS redirects work properly. Consider adding a "Retry Payment" option instead of showing an error.',
    })
  }

  // ─── Errors ──────────────────────────────────────────────────────────
  if (summary.errorCount > 0 && viewed > 0) {
    const errorRate = Math.round(summary.errorCount / viewed * 100)
    insights.push({
      type: errorRate > 5 ? 'critical' : 'warning',
      title: 'Checkout Errors Detected',
      message: `${summary.errorCount} errors occurred during checkout (${errorRate}% of sessions).`,
      metric: `${summary.errorCount} errors`,
      recommendation: 'Check the error logs in Fleet Monitoring. Common causes: expired payment intents, network timeouts during deployment, or invalid card details.',
    })
  }

  // ─── Mobile vs Desktop ───────────────────────────────────────────────
  if (segments?.mobile && segments?.desktop && segments.mobile > 10 && segments.desktop > 10) {
    const mobileConv = segments.mobileConversion || 0
    const desktopConv = segments.desktopConversion || 0
    if (mobileConv < desktopConv * 0.5) {
      insights.push({
        type: 'critical',
        title: 'Mobile Conversion is Lagging',
        message: `Mobile converts at ${mobileConv}% vs desktop at ${desktopConv}%. Mobile users are ${Math.round(segments.mobile / (segments.mobile + segments.desktop) * 100)}% of traffic.`,
        metric: `${mobileConv}% vs ${desktopConv}%`,
        recommendation: 'The checkout flow may be difficult on small screens. Test on an iPhone — check if the payment form, DL upload, or date picker are hard to use on mobile.',
      })
    }
  }

  // ─── Overall Conversion ──────────────────────────────────────────────
  if (summary.overallConversion >= 3) {
    insights.push({
      type: 'positive',
      title: 'Healthy Conversion Rate',
      message: `${summary.overallConversion}% of car viewers complete a booking. Industry average for car rental is 2-5%.`,
      metric: `${summary.overallConversion}% conversion`,
      recommendation: 'Conversion is strong. Focus on increasing traffic — every 100 new visitors = ~${Math.round(summary.overallConversion)} bookings.',
    })
  }

  // ─── No insights generated ───────────────────────────────────────────
  if (insights.length === 0) {
    insights.push({
      type: 'opportunity',
      title: 'Funnel Looks Normal',
      message: 'No critical issues detected. The funnel is performing within expected ranges.',
      metric: `${summary.overallConversion}% conversion`,
      recommendation: 'Continue monitoring. Small improvements at each step compound — even 5% improvement at the car page level could mean 1-2 more bookings per week.',
    })
  }

  // Sort: critical → warning → opportunity → positive
  const priority: Record<string, number> = { critical: 0, warning: 1, opportunity: 2, positive: 3 }
  return insights.sort((a, b) => priority[a.type] - priority[b.type])
}
