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
      viewsByLocation, // Enhanced with city/region
      viewsByDevice,
      viewsByBrowser,
      recentViews,
      // Drill-down queries for load time and bounce rate
      loadTimeByPage,
      loadTimeByLocation,
      bounceByPage,
      bounceByLocation
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

      // Views by country (simple)
      prisma.pageView.groupBy({
        by: ['country'],
        where: { ...where, country: { not: null } },
        _count: { country: true },
        orderBy: { _count: { country: 'desc' } },
        take: 10
      }),

      // Enhanced location with city and region (military-grade precision)
      getViewsByLocation(startDate),

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

      // Recent views (for live feed) - with enhanced location
      prisma.pageView.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: 20,
        select: {
          id: true,
          path: true,
          country: true,
          region: true,
          city: true,
          device: true,
          browser: true,
          timestamp: true,
          loadTime: true
        }
      }),

      // Load time drill-down by page (slowest pages)
      getLoadTimeByPage(startDate),

      // Load time drill-down by location (slowest locations)
      getLoadTimeByLocation(startDate),

      // Bounce rate by page (highest bounce pages)
      getBounceRateByPage(startDate),

      // Bounce rate by location (highest bounce locations)
      getBounceRateByLocation(startDate)
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
      // Enhanced location data with city/region (military-grade)
      viewsByLocation: viewsByLocation,
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
        // Enhanced location format: City, Region, Country
        location: formatLocation(v.city, v.region, v.country),
        device: v.device,
        browser: v.browser,
        timestamp: v.timestamp,
        loadTime: v.loadTime
      })),
      // Drill-down data for metrics analysis
      drillDown: {
        loadTime: {
          byPage: loadTimeByPage,
          byLocation: loadTimeByLocation
        },
        bounce: {
          byPage: bounceByPage,
          byLocation: bounceByLocation
        }
      },
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

// Helper: Format location with city, region, country (military-grade precision)
function formatLocation(city: string | null, region: string | null, country: string | null): string {
  const parts: string[] = []
  if (city) parts.push(city)
  if (region) parts.push(region)
  if (country) parts.push(country)
  return parts.length > 0 ? parts.join(', ') : 'Unknown'
}

// Helper: Get views by location with city/region detail
async function getViewsByLocation(startDate: Date) {
  try {
    const result = await prisma.$queryRaw<Array<{
      country: string | null
      region: string | null
      city: string | null
      views: bigint
    }>>`
      SELECT
        country,
        region,
        city,
        COUNT(*) as views
      FROM "PageView"
      WHERE timestamp >= ${startDate}
        AND "eventType" = 'pageview'
        AND country IS NOT NULL
      GROUP BY country, region, city
      ORDER BY views DESC
      LIMIT 15
    `

    return result.map(r => ({
      country: r.country || 'Unknown',
      region: r.region || null,
      city: r.city || null,
      location: formatLocation(r.city, r.region, r.country),
      views: Number(r.views)
    }))
  } catch (error) {
    console.error('[Analytics] Location query error:', error)
    return []
  }
}

// Helper: Get load time breakdown by page (identify slow pages)
async function getLoadTimeByPage(startDate: Date) {
  try {
    const result = await prisma.$queryRaw<Array<{
      path: string
      avg_load_time: number
      min_load_time: number
      max_load_time: number
      p95_load_time: number
      sample_count: bigint
    }>>`
      SELECT
        path,
        ROUND(AVG("loadTime")::numeric, 0) as avg_load_time,
        MIN("loadTime") as min_load_time,
        MAX("loadTime") as max_load_time,
        ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY "loadTime")::numeric, 0) as p95_load_time,
        COUNT(*) as sample_count
      FROM "PageView"
      WHERE timestamp >= ${startDate}
        AND "eventType" = 'pageview'
        AND "loadTime" IS NOT NULL
        AND "loadTime" > 0
      GROUP BY path
      HAVING COUNT(*) >= 3
      ORDER BY AVG("loadTime") DESC
      LIMIT 10
    `

    return result.map(r => ({
      path: r.path,
      avgLoadTime: Number(r.avg_load_time),
      minLoadTime: Number(r.min_load_time),
      maxLoadTime: Number(r.max_load_time),
      p95LoadTime: Number(r.p95_load_time),
      sampleCount: Number(r.sample_count)
    }))
  } catch (error) {
    console.error('[Analytics] Load time by page error:', error)
    return []
  }
}

// Helper: Get load time breakdown by location (identify slow regions)
async function getLoadTimeByLocation(startDate: Date) {
  try {
    const result = await prisma.$queryRaw<Array<{
      country: string | null
      region: string | null
      city: string | null
      avg_load_time: number
      p95_load_time: number
      sample_count: bigint
    }>>`
      SELECT
        country,
        region,
        city,
        ROUND(AVG("loadTime")::numeric, 0) as avg_load_time,
        ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY "loadTime")::numeric, 0) as p95_load_time,
        COUNT(*) as sample_count
      FROM "PageView"
      WHERE timestamp >= ${startDate}
        AND "eventType" = 'pageview'
        AND "loadTime" IS NOT NULL
        AND "loadTime" > 0
        AND country IS NOT NULL
      GROUP BY country, region, city
      HAVING COUNT(*) >= 3
      ORDER BY AVG("loadTime") DESC
      LIMIT 10
    `

    return result.map(r => ({
      location: formatLocation(r.city, r.region, r.country),
      country: r.country || 'Unknown',
      region: r.region || null,
      city: r.city || null,
      avgLoadTime: Number(r.avg_load_time),
      p95LoadTime: Number(r.p95_load_time),
      sampleCount: Number(r.sample_count)
    }))
  } catch (error) {
    console.error('[Analytics] Load time by location error:', error)
    return []
  }
}

// Helper: Get bounce rate by page (identify high-bounce pages)
async function getBounceRateByPage(startDate: Date) {
  try {
    // Calculate bounce rate per page using visitor sessions
    const result = await prisma.$queryRaw<Array<{
      path: string
      total_visitors: bigint
      bounced_visitors: bigint
      bounce_rate: number
    }>>`
      WITH page_visitors AS (
        SELECT
          path,
          "visitorId",
          COUNT(*) as visit_count
        FROM "PageView"
        WHERE timestamp >= ${startDate}
          AND "eventType" = 'pageview'
          AND "visitorId" IS NOT NULL
        GROUP BY path, "visitorId"
      ),
      visitor_total_pages AS (
        SELECT
          "visitorId",
          COUNT(DISTINCT path) as total_pages
        FROM "PageView"
        WHERE timestamp >= ${startDate}
          AND "eventType" = 'pageview'
          AND "visitorId" IS NOT NULL
        GROUP BY "visitorId"
      ),
      page_bounce_stats AS (
        SELECT
          pv.path,
          COUNT(DISTINCT pv."visitorId") as total_visitors,
          COUNT(DISTINCT CASE WHEN vtp.total_pages = 1 THEN pv."visitorId" END) as bounced_visitors
        FROM page_visitors pv
        JOIN visitor_total_pages vtp ON pv."visitorId" = vtp."visitorId"
        GROUP BY pv.path
        HAVING COUNT(DISTINCT pv."visitorId") >= 5
      )
      SELECT
        path,
        total_visitors,
        bounced_visitors,
        ROUND((bounced_visitors::numeric / total_visitors::numeric) * 100, 1) as bounce_rate
      FROM page_bounce_stats
      ORDER BY bounce_rate DESC
      LIMIT 10
    `

    return result.map(r => ({
      path: r.path,
      totalVisitors: Number(r.total_visitors),
      bouncedVisitors: Number(r.bounced_visitors),
      bounceRate: Number(r.bounce_rate)
    }))
  } catch (error) {
    console.error('[Analytics] Bounce rate by page error:', error)
    return []
  }
}

// Helper: Get bounce rate by location (identify high-bounce regions)
async function getBounceRateByLocation(startDate: Date) {
  try {
    const result = await prisma.$queryRaw<Array<{
      country: string | null
      region: string | null
      city: string | null
      total_visitors: bigint
      bounced_visitors: bigint
      bounce_rate: number
    }>>`
      WITH location_visitors AS (
        SELECT
          country,
          region,
          city,
          "visitorId"
        FROM "PageView"
        WHERE timestamp >= ${startDate}
          AND "eventType" = 'pageview'
          AND "visitorId" IS NOT NULL
          AND country IS NOT NULL
        GROUP BY country, region, city, "visitorId"
      ),
      visitor_page_counts AS (
        SELECT
          "visitorId",
          COUNT(*) as total_pages
        FROM "PageView"
        WHERE timestamp >= ${startDate}
          AND "eventType" = 'pageview'
          AND "visitorId" IS NOT NULL
        GROUP BY "visitorId"
      ),
      location_bounce_stats AS (
        SELECT
          lv.country,
          lv.region,
          lv.city,
          COUNT(DISTINCT lv."visitorId") as total_visitors,
          COUNT(DISTINCT CASE WHEN vpc.total_pages = 1 THEN lv."visitorId" END) as bounced_visitors
        FROM location_visitors lv
        JOIN visitor_page_counts vpc ON lv."visitorId" = vpc."visitorId"
        GROUP BY lv.country, lv.region, lv.city
        HAVING COUNT(DISTINCT lv."visitorId") >= 5
      )
      SELECT
        country,
        region,
        city,
        total_visitors,
        bounced_visitors,
        ROUND((bounced_visitors::numeric / total_visitors::numeric) * 100, 1) as bounce_rate
      FROM location_bounce_stats
      ORDER BY bounce_rate DESC
      LIMIT 10
    `

    return result.map(r => ({
      location: formatLocation(r.city, r.region, r.country),
      country: r.country || 'Unknown',
      region: r.region || null,
      city: r.city || null,
      totalVisitors: Number(r.total_visitors),
      bouncedVisitors: Number(r.bounced_visitors),
      bounceRate: Number(r.bounce_rate)
    }))
  } catch (error) {
    console.error('[Analytics] Bounce rate by location error:', error)
    return []
  }
}
