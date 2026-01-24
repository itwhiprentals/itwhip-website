// app/api/fleet/analytics/stats/route.ts
// Analytics stats aggregation endpoint
// Provides pre-computed metrics for the dashboard

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

// Cache stats by key (range + path) for 1 minute to reduce DB load
const statsCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60000 // 1 minute

// Clean old cache entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of statsCache.entries()) {
    if (value.timestamp < now - CACHE_TTL * 5) {
      statsCache.delete(key)
    }
  }
}, 300000)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'
    const pathFilter = searchParams.get('path') || null

    // Check cache first
    const cacheKey = `${range}-${pathFilter || 'all'}`
    const cached = statsCache.get(cacheKey)
    if (cached && cached.timestamp > Date.now() - CACHE_TTL) {
      const response = NextResponse.json(cached.data)
      // HTTP cache headers - allow caching for remaining TTL
      const age = Math.floor((Date.now() - cached.timestamp) / 1000)
      const maxAge = Math.max(0, Math.floor(CACHE_TTL / 1000) - age)
      response.headers.set('Cache-Control', `private, max-age=${maxAge}, stale-while-revalidate=30`)
      response.headers.set('X-Cache', 'HIT')
      return response
    }

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (range) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Build where clause
    const where: any = {
      timestamp: { gte: startDate },
      eventType: 'pageview'
    }

    if (pathFilter) {
      where.path = { startsWith: pathFilter }
    }

    // Run all queries in parallel for speed
    const [
      totalViews,
      uniqueVisitors,
      topPages,
      viewsByDay,
      previousPeriodViewsByDay,
      viewsByCountry,
      viewsByDevice,
      viewsByBrowser,
      recentViews
    ] = await Promise.all([
      // Total page views
      prisma.pageView.count({ where }),

      // Unique visitors (by visitorId)
      prisma.pageView.groupBy({
        by: ['visitorId'],
        where,
        _count: true
      }).then(r => r.length),

      // Top pages
      prisma.pageView.groupBy({
        by: ['path'],
        where,
        _count: { path: true },
        orderBy: { _count: { path: 'desc' } },
        take: 10
      }),

      // Views by day (for chart)
      getViewsByDay(startDate, now),

      // Previous period views (for comparison)
      getPreviousPeriodViewsByDay(startDate, now),

      // Views by country
      prisma.pageView.groupBy({
        by: ['country'],
        where: { ...where, country: { not: null } },
        _count: { country: true },
        orderBy: { _count: { country: 'desc' } },
        take: 10
      }),

      // Views by device
      prisma.pageView.groupBy({
        by: ['device'],
        where: { ...where, device: { not: null } },
        _count: { device: true },
        orderBy: { _count: { device: 'desc' } }
      }),

      // Views by browser
      prisma.pageView.groupBy({
        by: ['browser'],
        where: { ...where, browser: { not: null } },
        _count: { browser: true },
        orderBy: { _count: { browser: 'desc' } },
        take: 5
      }),

      // Recent views (for live feed)
      prisma.pageView.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: 20,
        select: {
          id: true,
          path: true,
          country: true,
          city: true,
          device: true,
          browser: true,
          timestamp: true
        }
      })
    ])

    // Calculate averages and bounce rate in parallel
    const [avgLoadTime, bounceRate] = await Promise.all([
      prisma.pageView.aggregate({
        where: { ...where, loadTime: { not: null } },
        _avg: { loadTime: true }
      }),
      calculateActualBounceRate(startDate)
    ])

    // Format response
    const stats = {
      overview: {
        totalViews,
        uniqueVisitors,
        avgLoadTime: avgLoadTime._avg.loadTime ? Math.round(avgLoadTime._avg.loadTime) : null,
        bounceRate
      },
      topPages: topPages.map(p => ({
        path: p.path,
        views: p._count.path
      })),
      viewsByDay: viewsByDay,
      previousPeriodViewsByDay: previousPeriodViewsByDay,
      viewsByCountry: viewsByCountry.map(c => ({
        country: c.country || 'Unknown',
        views: c._count.country
      })),
      viewsByDevice: viewsByDevice.map(d => ({
        device: d.device || 'Unknown',
        views: d._count.device
      })),
      viewsByBrowser: viewsByBrowser.map(b => ({
        browser: b.browser || 'Unknown',
        views: b._count.browser
      })),
      recentViews: recentViews.map(v => ({
        id: v.id,
        path: v.path,
        location: v.city && v.country ? `${v.city}, ${v.country}` : (v.country || 'Unknown'),
        device: v.device,
        browser: v.browser,
        timestamp: v.timestamp
      })),
      range,
      generatedAt: new Date().toISOString()
    }

    // Update cache
    statsCache.set(cacheKey, { data: stats, timestamp: Date.now() })

    const response = NextResponse.json(stats)
    // HTTP cache headers - fresh data, can cache for full TTL
    response.headers.set('Cache-Control', `private, max-age=${Math.floor(CACHE_TTL / 1000)}, stale-while-revalidate=30`)
    response.headers.set('X-Cache', 'MISS')
    return response

  } catch (error) {
    console.error('[Analytics] Stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

// Helper: Get views grouped by day for current period
async function getViewsByDay(startDate: Date, endDate: Date) {
  const result = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
    SELECT
      DATE(timestamp) as date,
      COUNT(*) as count
    FROM "PageView"
    WHERE timestamp >= ${startDate}
      AND timestamp <= ${endDate}
      AND "eventType" = 'pageview'
    GROUP BY DATE(timestamp)
    ORDER BY date ASC
  `

  return result.map(r => ({
    date: r.date,
    views: Number(r.count)
  }))
}

// Helper: Get views for the previous period (for comparison chart)
async function getPreviousPeriodViewsByDay(currentStartDate: Date, currentEndDate: Date) {
  // Calculate the duration of the current period
  const periodDuration = currentEndDate.getTime() - currentStartDate.getTime()

  // Previous period ends where current period starts
  const prevEndDate = new Date(currentStartDate.getTime() - 1) // 1ms before current start
  const prevStartDate = new Date(prevEndDate.getTime() - periodDuration)

  const result = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
    SELECT
      DATE(timestamp) as date,
      COUNT(*) as count
    FROM "PageView"
    WHERE timestamp >= ${prevStartDate}
      AND timestamp <= ${prevEndDate}
      AND "eventType" = 'pageview'
    GROUP BY DATE(timestamp)
    ORDER BY date ASC
  `

  return result.map(r => ({
    date: r.date,
    views: Number(r.count)
  }))
}

// Helper: Calculate ACTUAL bounce rate (visitors with only 1 page view)
// Bounce rate = (single-page visitors / total visitors) * 100
async function calculateActualBounceRate(startDate: Date): Promise<number> {
  try {
    // Query: Count visitors grouped by their page view count
    // Then calculate percentage of visitors with exactly 1 page view
    const result = await prisma.$queryRaw<Array<{ single_page_visitors: bigint; total_visitors: bigint }>>`
      WITH visitor_counts AS (
        SELECT "visitorId", COUNT(*) as page_count
        FROM "PageView"
        WHERE timestamp >= ${startDate}
          AND "eventType" = 'pageview'
          AND "visitorId" IS NOT NULL
        GROUP BY "visitorId"
      )
      SELECT
        COUNT(CASE WHEN page_count = 1 THEN 1 END) as single_page_visitors,
        COUNT(*) as total_visitors
      FROM visitor_counts
    `

    if (result.length === 0 || Number(result[0].total_visitors) === 0) {
      return 0
    }

    const singlePage = Number(result[0].single_page_visitors)
    const total = Number(result[0].total_visitors)
    const bounceRate = (singlePage / total) * 100

    return Math.round(bounceRate)
  } catch (error) {
    console.error('[Analytics] Bounce rate calculation error:', error)
    return 0
  }
}
