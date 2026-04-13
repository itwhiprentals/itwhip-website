// app/api/fleet/analytics/funnel/analyze/route.ts
// POST — Choé analyzes the booking funnel with Claude Haiku
// Cached for 1 hour to avoid redundant API calls

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { analyzeWithChoe, type AnalysisResponse } from '@/app/lib/analytics/choe-funnel-analyst'

let cache: { data: AnalysisResponse; expires: number } | null = null

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get('fleet_session')?.value
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Return cached result if fresh
  if (cache && cache.expires > Date.now()) {
    return NextResponse.json({ success: true, analysis: cache.data, cached: true })
  }

  try {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Gather all context in parallel
    const [funnelSteps, topPages, deviceBreakdown, cityBreakdown, carPrices, recentBookings, totalViews] = await Promise.all([
      // Funnel step counts
      prisma.pageView.groupBy({
        by: ['eventType'],
        where: { eventType: { startsWith: 'funnel_' }, timestamp: { gte: sevenDaysAgo } },
        _count: { eventType: true },
      }),

      // Top pages
      prisma.pageView.groupBy({
        by: ['path'],
        where: { timestamp: { gte: sevenDaysAgo }, eventType: 'pageview' },
        _count: { path: true },
        orderBy: { _count: { path: 'desc' } },
        take: 10,
      }),

      // Device breakdown
      prisma.pageView.groupBy({
        by: ['device'],
        where: { timestamp: { gte: sevenDaysAgo } },
        _count: { device: true },
        orderBy: { _count: { device: 'desc' } },
      }),

      // City breakdown
      prisma.pageView.groupBy({
        by: ['city'],
        where: { timestamp: { gte: sevenDaysAgo }, city: { not: null } },
        _count: { city: true },
        orderBy: { _count: { city: 'desc' } },
        take: 10,
      }),

      // Car price range
      prisma.rentalCar.aggregate({
        where: { isActive: true, dailyRate: { gt: 0 } },
        _min: { dailyRate: true },
        _max: { dailyRate: true },
      }),

      // Recent bookings count
      prisma.rentalBooking.count({
        where: { createdAt: { gte: sevenDaysAgo }, status: { in: ['CONFIRMED', 'ACTIVE', 'COMPLETED'] } },
      }),

      // Total page views
      prisma.pageView.count({ where: { timestamp: { gte: sevenDaysAgo } } }),
    ])

    // Build funnel steps
    const STEP_ORDER = [
      'funnel_car_viewed', 'funnel_book_clicked', 'funnel_checkout_loaded',
      'funnel_dates_selected', 'funnel_insurance_selected',
      'funnel_identity_started', 'funnel_identity_completed',
      'funnel_payment_started', 'funnel_payment_processing', 'funnel_booking_confirmed',
    ]
    const STEP_LABELS: Record<string, string> = {
      funnel_car_viewed: 'Viewed Car', funnel_book_clicked: 'Clicked Book',
      funnel_checkout_loaded: 'Checkout Loaded', funnel_dates_selected: 'Selected Dates',
      funnel_insurance_selected: 'Chose Insurance', funnel_identity_started: 'Started ID Verify',
      funnel_identity_completed: 'ID Verified', funnel_payment_started: 'Started Payment',
      funnel_payment_processing: 'Processing Payment', funnel_booking_confirmed: 'Booking Confirmed',
    }

    const stepCountMap = new Map(funnelSteps.map(s => [s.eventType, s._count.eventType]))
    const funnel = STEP_ORDER.map((step, i) => {
      const count = stepCountMap.get(step) || 0
      const prevCount = i > 0 ? (stepCountMap.get(STEP_ORDER[i - 1]) || 0) : count
      return {
        step,
        label: STEP_LABELS[step] || step,
        count,
        dropOff: i > 0 && prevCount > 0 ? Math.round(((prevCount - count) / prevCount) * 100) : 0,
      }
    })

    const topOfFunnel = funnel[0]?.count || 0
    const bottomOfFunnel = funnel[funnel.length - 1]?.count || 0
    const errorCount = stepCountMap.get('funnel_error') || 0
    const abandonedCount = stepCountMap.get('funnel_abandoned') || 0

    const analysis = await analyzeWithChoe({
      funnel,
      summary: {
        topOfFunnel,
        bottomOfFunnel,
        overallConversion: topOfFunnel > 0 ? Math.round((bottomOfFunnel / topOfFunnel) * 100 * 10) / 10 : 0,
        errorCount,
        abandonedCount,
      },
      topPages: topPages.map(p => ({ path: p.path, views: p._count.path })),
      devices: deviceBreakdown.map(d => ({ device: d.device || 'Unknown', views: d._count.device })),
      cities: cityBreakdown.map(c => ({ city: c.city || 'Unknown', views: c._count.city })),
      carPriceRange: {
        min: carPrices._min.dailyRate || 0,
        max: carPrices._max.dailyRate || 0,
      },
      recentBookings,
      totalViews,
    })

    // Cache for 1 hour
    cache = { data: analysis, expires: Date.now() + 60 * 60 * 1000 }

    return NextResponse.json({ success: true, analysis })
  } catch (error: any) {
    console.error('[Choé Analyst] Error:', error)
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 })
  }
}
