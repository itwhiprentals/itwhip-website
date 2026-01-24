// app/api/fleet/analytics/returning-users/route.ts
// Get returning users analytics - tracks repeat visitors
// Uses database-level aggregation for scalability (no memory issues)

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

interface VisitorStats {
  visitorId: string
  sessionCount: number
  pageViews: number
  uniquePages: number
  firstVisit: string
  lastVisit: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

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

    const offset = (page - 1) * limit

    // Use database-level aggregation for scalability
    // This avoids loading all page views into memory
    const [
      visitorStats,
      summaryStats,
      frequencyDistribution,
      totalVisitorCount
    ] = await Promise.all([
      // Get paginated visitor statistics (aggregated at DB level)
      prisma.$queryRaw<VisitorStats[]>`
        SELECT
          "visitorId",
          COUNT(DISTINCT "sessionId") as "sessionCount",
          COUNT(*) as "pageViews",
          COUNT(DISTINCT path) as "uniquePages",
          MIN(timestamp)::text as "firstVisit",
          MAX(timestamp)::text as "lastVisit"
        FROM "PageView"
        WHERE timestamp >= ${startDate}
          AND "visitorId" IS NOT NULL
        GROUP BY "visitorId"
        ORDER BY "sessionCount" DESC, "pageViews" DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `,

      // Get summary statistics (single query for all summaries)
      prisma.$queryRaw<Array<{
        total_visitors: bigint
        returning_visitors: bigint
        total_sessions: bigint
        total_pageviews: bigint
      }>>`
        WITH visitor_sessions AS (
          SELECT
            "visitorId",
            COUNT(DISTINCT "sessionId") as session_count,
            COUNT(*) as page_count
          FROM "PageView"
          WHERE timestamp >= ${startDate}
            AND "visitorId" IS NOT NULL
          GROUP BY "visitorId"
        )
        SELECT
          COUNT(*) as total_visitors,
          COUNT(CASE WHEN session_count > 1 THEN 1 END) as returning_visitors,
          SUM(session_count) as total_sessions,
          SUM(page_count) as total_pageviews
        FROM visitor_sessions
      `,

      // Get frequency distribution
      prisma.$queryRaw<Array<{
        bucket: string
        count: bigint
      }>>`
        WITH visitor_sessions AS (
          SELECT
            "visitorId",
            COUNT(DISTINCT "sessionId") as session_count
          FROM "PageView"
          WHERE timestamp >= ${startDate}
            AND "visitorId" IS NOT NULL
          GROUP BY "visitorId"
        )
        SELECT
          CASE
            WHEN session_count = 1 THEN '1 visit'
            WHEN session_count <= 3 THEN '2-3 visits'
            WHEN session_count <= 10 THEN '4-10 visits'
            ELSE '11+ visits'
          END as bucket,
          COUNT(*) as count
        FROM visitor_sessions
        GROUP BY
          CASE
            WHEN session_count = 1 THEN '1 visit'
            WHEN session_count <= 3 THEN '2-3 visits'
            WHEN session_count <= 10 THEN '4-10 visits'
            ELSE '11+ visits'
          END
        ORDER BY
          MIN(session_count)
      `,

      // Get total count for pagination
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT "visitorId") as count
        FROM "PageView"
        WHERE timestamp >= ${startDate}
          AND "visitorId" IS NOT NULL
      `
    ])

    // Get additional details for paginated visitors (countries, devices, browsers)
    const visitorIds = visitorStats.map(v => v.visitorId)

    let visitorDetails: Array<{
      visitorId: string
      userId: string | null
      countries: string[]
      devices: string[]
      browsers: string[]
      topPages: string[]
      avgLoadTime: number | null
    }> = []

    if (visitorIds.length > 0) {
      // Get details for each visitor in the page
      const detailsRaw = await prisma.$queryRaw<Array<{
        visitorId: string
        userId: string | null
        countries: string
        devices: string
        browsers: string
        topPages: string
        avgLoadTime: number | null
      }>>`
        SELECT
          "visitorId",
          MAX("userId") as "userId",
          STRING_AGG(DISTINCT country, ',') as countries,
          STRING_AGG(DISTINCT device, ',') as devices,
          STRING_AGG(DISTINCT browser, ',') as browsers,
          STRING_AGG(DISTINCT path, '|') as "topPages",
          AVG("loadTime")::integer as "avgLoadTime"
        FROM "PageView"
        WHERE "visitorId" = ANY(${visitorIds})
          AND timestamp >= ${startDate}
        GROUP BY "visitorId"
      `

      visitorDetails = detailsRaw.map(d => ({
        visitorId: d.visitorId,
        userId: d.userId,
        countries: d.countries ? d.countries.split(',').filter(Boolean) : [],
        devices: d.devices ? d.devices.split(',').filter(Boolean) : [],
        browsers: d.browsers ? d.browsers.split(',').filter(Boolean) : [],
        topPages: d.topPages ? d.topPages.split('|').filter(Boolean).slice(0, 5) : [],
        avgLoadTime: d.avgLoadTime
      }))
    }

    // Combine stats with details
    const visitors = visitorStats.map(stat => {
      const details = visitorDetails.find(d => d.visitorId === stat.visitorId)
      return {
        visitorId: stat.visitorId,
        userId: details?.userId || null,
        sessionCount: Number(stat.sessionCount),
        pageViews: Number(stat.pageViews),
        uniquePages: Number(stat.uniquePages),
        topPages: details?.topPages || [],
        firstVisit: stat.firstVisit,
        lastVisit: stat.lastVisit,
        countries: details?.countries || [],
        devices: details?.devices || [],
        browsers: details?.browsers || [],
        avgLoadTime: details?.avgLoadTime || null,
        isReturning: Number(stat.sessionCount) > 1
      }
    })

    // Parse summary
    const summary = summaryStats[0] || {
      total_visitors: 0n,
      returning_visitors: 0n,
      total_sessions: 0n,
      total_pageviews: 0n
    }

    const totalVisitors = Number(summary.total_visitors)
    const totalReturning = Number(summary.returning_visitors)
    const totalSessions = Number(summary.total_sessions)
    const totalPageviews = Number(summary.total_pageviews)

    // Parse frequency distribution
    const frequencyBuckets: Record<string, number> = {
      '1 visit': 0,
      '2-3 visits': 0,
      '4-10 visits': 0,
      '11+ visits': 0
    }

    frequencyDistribution.forEach(f => {
      if (f.bucket in frequencyBuckets) {
        frequencyBuckets[f.bucket] = Number(f.count)
      }
    })

    // Get top returning users (only for first page)
    let topReturning: typeof visitors = []
    if (page === 1) {
      topReturning = visitors.filter(v => v.isReturning).slice(0, 10)
    }

    const totalCount = Number(totalVisitorCount[0]?.count || 0)
    const totalPages = Math.ceil(totalCount / limit)

    const response = NextResponse.json({
      success: true,
      data: {
        summary: {
          totalVisitors,
          returningVisitors: totalReturning,
          newVisitors: totalVisitors - totalReturning,
          returnRate: totalVisitors > 0 ? Math.round((totalReturning / totalVisitors) * 100) : 0,
          avgSessionsPerReturning: totalReturning > 0
            ? Math.round((totalSessions / totalReturning) * 10) / 10
            : 0,
          avgPagesPerVisitor: totalVisitors > 0
            ? Math.round((totalPageviews / totalVisitors) * 10) / 10
            : 0
        },
        frequencyDistribution: frequencyBuckets,
        topReturning,
        visitors,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasMore: page < totalPages
        }
      },
      range,
      generatedAt: new Date().toISOString()
    })

    // Cache for 2 minutes - returning user data doesn't change rapidly
    response.headers.set('Cache-Control', 'private, max-age=120, stale-while-revalidate=60')
    return response

  } catch (error) {
    console.error('[Analytics] Returning users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch returning users data' },
      { status: 500 }
    )
  }
}
