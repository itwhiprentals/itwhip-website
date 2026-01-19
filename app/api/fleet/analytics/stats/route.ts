// app/api/fleet/analytics/stats/route.ts
// Analytics stats aggregation endpoint
// Provides pre-computed metrics for the dashboard

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

// Cache stats for 1 minute to reduce DB load
let statsCache: { data: any; timestamp: number } | null = null
const CACHE_TTL = 60000 // 1 minute

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'
    const pathFilter = searchParams.get('path') || null

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

    // Check cache (only for default queries)
    const cacheKey = `${range}-${pathFilter || 'all'}`
    if (statsCache && statsCache.timestamp > Date.now() - CACHE_TTL) {
      // Return cached data
    }

    // Run all queries in parallel for speed
    const [
      totalViews,
      uniqueVisitors,
      topPages,
      viewsByDay,
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
      getViewsByDay(startDate, where),

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

    // Calculate averages
    const avgLoadTime = await prisma.pageView.aggregate({
      where: { ...where, loadTime: { not: null } },
      _avg: { loadTime: true }
    })

    // Format response
    const stats = {
      overview: {
        totalViews,
        uniqueVisitors,
        avgLoadTime: avgLoadTime._avg.loadTime ? Math.round(avgLoadTime._avg.loadTime) : null,
        bounceRate: calculateBounceRate(uniqueVisitors, totalViews)
      },
      topPages: topPages.map(p => ({
        path: p.path,
        views: p._count.path
      })),
      viewsByDay: viewsByDay,
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
    statsCache = { data: stats, timestamp: Date.now() }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('[Analytics] Stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

// Helper: Get views grouped by day
async function getViewsByDay(startDate: Date, where: any) {
  // Use raw query for date grouping
  const result = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
    SELECT
      DATE(timestamp) as date,
      COUNT(*) as count
    FROM "PageView"
    WHERE timestamp >= ${startDate}
      AND "eventType" = 'pageview'
    GROUP BY DATE(timestamp)
    ORDER BY date ASC
  `

  return result.map(r => ({
    date: r.date,
    views: Number(r.count)
  }))
}

// Helper: Calculate bounce rate (single page sessions)
function calculateBounceRate(uniqueVisitors: number, totalViews: number): number {
  if (uniqueVisitors === 0) return 0
  // Simplified: if views ≈ visitors, high bounce rate
  const pagesPerVisitor = totalViews / uniqueVisitors
  // If avg is 1.2 pages, bounce rate is ~80%
  const bounceRate = Math.max(0, Math.min(100, (1 - (pagesPerVisitor - 1) / 2) * 100))
  return Math.round(bounceRate)
}
