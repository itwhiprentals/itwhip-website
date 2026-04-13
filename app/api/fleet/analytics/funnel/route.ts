// app/api/fleet/analytics/funnel/route.ts
// GET /api/fleet/analytics/funnel — booking funnel data with drop-off analysis

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { generateInsights } from '@/app/lib/analytics/funnel-insights'

const FUNNEL_STEPS = [
  'funnel_car_viewed',
  'funnel_book_clicked',
  'funnel_checkout_loaded',
  'funnel_dates_selected',
  'funnel_insurance_selected',
  'funnel_identity_started',
  'funnel_identity_completed',
  'funnel_payment_started',
  'funnel_payment_processing',
  'funnel_booking_confirmed',
] as const

const STEP_LABELS: Record<string, string> = {
  funnel_car_viewed: 'Viewed Car',
  funnel_book_clicked: 'Clicked Book',
  funnel_checkout_loaded: 'Checkout Loaded',
  funnel_dates_selected: 'Selected Dates',
  funnel_insurance_selected: 'Chose Insurance',
  funnel_identity_started: 'Started ID Verify',
  funnel_identity_completed: 'ID Verified',
  funnel_payment_started: 'Started Payment',
  funnel_payment_processing: 'Processing Payment',
  funnel_booking_confirmed: 'Booking Confirmed',
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  const sessionCookie = request.cookies.get('fleet_session')?.value
  if (key !== 'phoenix-fleet-2847' && !sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const range = request.nextUrl.searchParams.get('range') || '7d'
  const now = new Date()
  const rangeMs: Record<string, number> = { '24h': 86400000, '7d': 604800000, '30d': 2592000000, '90d': 7776000000 }
  const startDate = new Date(now.getTime() - (rangeMs[range] || rangeMs['7d']))

  try {
    // Count events per funnel step
    const stepCounts = await prisma.pageView.groupBy({
      by: ['eventType'],
      where: {
        eventType: { startsWith: 'funnel_' },
        timestamp: { gte: startDate },
      },
      _count: { eventType: true },
    })

    // Build funnel data
    const steps = FUNNEL_STEPS.map((step, index) => {
      const count = stepCounts.find(s => s.eventType === step)?._count.eventType || 0
      const prevCount = index > 0
        ? (stepCounts.find(s => s.eventType === FUNNEL_STEPS[index - 1])?._count.eventType || 0)
        : count

      return {
        step,
        label: STEP_LABELS[step] || step,
        count,
        dropOff: index > 0 && prevCount > 0
          ? Math.round(((prevCount - count) / prevCount) * 100)
          : 0,
        conversionFromPrev: index > 0 && prevCount > 0
          ? Math.round((count / prevCount) * 100)
          : 100,
      }
    })

    // Error and abandonment counts
    const errorCount = stepCounts.find(s => s.eventType === 'funnel_error')?._count.eventType || 0
    const abandonedCount = stepCounts.find(s => s.eventType === 'funnel_abandoned')?._count.eventType || 0

    // Overall conversion rate
    const topOfFunnel = steps[0]?.count || 0
    const bottomOfFunnel = steps[steps.length - 1]?.count || 0
    const overallConversion = topOfFunnel > 0
      ? Math.round((bottomOfFunnel / topOfFunnel) * 100 * 10) / 10
      : 0

    // Find biggest drop-off
    const biggestDropOff = steps
      .filter(s => s.dropOff > 0)
      .sort((a, b) => b.dropOff - a.dropOff)[0] || null

    return NextResponse.json({
      success: true,
      range,
      funnel: steps,
      summary: {
        topOfFunnel,
        bottomOfFunnel,
        overallConversion,
        errorCount,
        abandonedCount,
        biggestDropOff: biggestDropOff ? {
          step: biggestDropOff.label,
          dropOff: biggestDropOff.dropOff,
        } : null,
      },
      insights: generateInsights(steps, {
        topOfFunnel,
        bottomOfFunnel,
        overallConversion,
        errorCount,
        abandonedCount,
      }),
    })
  } catch (error) {
    console.error('[Funnel] Error:', error)
    return NextResponse.json({ error: 'Failed to load funnel data' }, { status: 500 })
  }
}
