// app/api/fleet/analytics/location/[city]/route.ts
// GET /api/fleet/analytics/location/[city] — city drill-down with visitor intel

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ city: string }> }
) {
  const key = request.nextUrl.searchParams.get('key')
  const sessionCookie = request.cookies.get('fleet_session')?.value
  if (key !== 'phoenix-fleet-2847' && !sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { city } = await params
  const decodedCity = decodeURIComponent(city)
  const range = request.nextUrl.searchParams.get('range') || '7d'

  // Calculate start date from range
  const now = new Date()
  const rangeMs: Record<string, number> = {
    '24h': 86400000,
    '7d': 604800000,
    '30d': 2592000000,
    '90d': 7776000000,
  }
  const startDate = new Date(now.getTime() - (rangeMs[range] || rangeMs['7d']))

  try {
    // Get all page views from this city
    const views = await prisma.pageView.findMany({
      where: {
        city: decodedCity,
        timestamp: { gte: startDate },
      },
      select: {
        id: true,
        path: true,
        timestamp: true,
        loadTime: true,
        device: true,
        browser: true,
        visitorId: true,
        ip: true,
        isp: true,
        asn: true,
        org: true,
        country: true,
        region: true,
        isVpn: true,
        isProxy: true,
        isTor: true,
        isHosting: true,
        riskScore: true,
      },
      orderBy: { timestamp: 'desc' },
      take: 500,
    })

    // Group by visitor
    const visitorMap = new Map<string, {
      visitorId: string
      ip: string | null
      isp: string | null
      asn: string | null
      org: string | null
      country: string | null
      region: string | null
      city: string | null
      isVpn: boolean
      isProxy: boolean
      isTor: boolean
      isHosting: boolean
      riskScore: number
      device: string | null
      browser: string | null
      pageCount: number
      firstSeen: string
      lastSeen: string
    }>()

    for (const v of views) {
      const vid = v.visitorId || v.ip || 'unknown'
      const existing = visitorMap.get(vid)
      if (existing) {
        existing.pageCount++
        if (v.timestamp.toISOString() < existing.firstSeen) existing.firstSeen = v.timestamp.toISOString()
        if (v.timestamp.toISOString() > existing.lastSeen) existing.lastSeen = v.timestamp.toISOString()
        // Keep highest risk score
        if (v.riskScore > existing.riskScore) existing.riskScore = v.riskScore
        // Keep threat flags (sticky — once flagged, stays flagged)
        if (v.isVpn) existing.isVpn = true
        if (v.isProxy) existing.isProxy = true
        if (v.isTor) existing.isTor = true
        if (v.isHosting) existing.isHosting = true
      } else {
        visitorMap.set(vid, {
          visitorId: vid,
          ip: v.ip,
          isp: v.isp,
          asn: v.asn,
          org: v.org,
          country: v.country,
          region: v.region,
          city: decodedCity,
          isVpn: v.isVpn,
          isProxy: v.isProxy,
          isTor: v.isTor,
          isHosting: v.isHosting,
          riskScore: v.riskScore,
          device: v.device,
          browser: v.browser,
          pageCount: 1,
          firstSeen: v.timestamp.toISOString(),
          lastSeen: v.timestamp.toISOString(),
        })
      }
    }

    const visitors = Array.from(visitorMap.values())
      .sort((a, b) => b.riskScore - a.riskScore || b.pageCount - a.pageCount)

    // Threat summary
    const threatSummary = {
      totalViews: views.length,
      uniqueVisitors: visitors.length,
      vpnCount: visitors.filter(v => v.isVpn).length,
      proxyCount: visitors.filter(v => v.isProxy).length,
      torCount: visitors.filter(v => v.isTor).length,
      hostingCount: visitors.filter(v => v.isHosting).length,
      avgRiskScore: visitors.length > 0
        ? Math.round(visitors.reduce((s, v) => s + v.riskScore, 0) / visitors.length)
        : 0,
      maxRiskScore: visitors.length > 0
        ? Math.max(...visitors.map(v => v.riskScore))
        : 0,
    }

    // Recent views (for timeline)
    const recentViews = views.slice(0, 100).map(v => ({
      id: v.id,
      path: v.path,
      timestamp: v.timestamp.toISOString(),
      loadTime: v.loadTime,
      device: v.device,
      browser: v.browser,
      ip: v.ip,
      isp: v.isp,
      isVpn: v.isVpn,
      isProxy: v.isProxy,
      isTor: v.isTor,
      isHosting: v.isHosting,
      riskScore: v.riskScore,
    }))

    return NextResponse.json({
      success: true,
      city: decodedCity,
      range,
      ...threatSummary,
      visitors,
      recentViews,
    })

  } catch (error) {
    console.error('[City Drilldown] Error:', error)
    return NextResponse.json({ error: 'Failed to load city data' }, { status: 500 })
  }
}
