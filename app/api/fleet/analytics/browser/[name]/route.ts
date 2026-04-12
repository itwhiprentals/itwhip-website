// app/api/fleet/analytics/browser/[name]/route.ts
// GET /api/fleet/analytics/browser/[name] — browser drill-down

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const key = request.nextUrl.searchParams.get('key')
  const sessionCookie = request.cookies.get('fleet_session')?.value
  if (key !== 'phoenix-fleet-2847' && !sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name } = await params
  const browserName = decodeURIComponent(name)
  const range = request.nextUrl.searchParams.get('range') || '7d'

  const now = new Date()
  const rangeMs: Record<string, number> = { '24h': 86400000, '7d': 604800000, '30d': 2592000000, '90d': 7776000000 }
  const startDate = new Date(now.getTime() - (rangeMs[range] || rangeMs['7d']))

  const where = { browser: browserName, timestamp: { gte: startDate } }

  try {
    const [totalViews, versionByCount, deviceByCount, osByCount, topPages, threatStats] = await Promise.all([
      prisma.pageView.count({ where }),

      // Version breakdown
      prisma.pageView.groupBy({
        by: ['browserVer'],
        where,
        _count: { browserVer: true },
        orderBy: { _count: { browserVer: 'desc' } },
        take: 15,
      }),

      // Device type split
      prisma.pageView.groupBy({
        by: ['device'],
        where,
        _count: { device: true },
        orderBy: { _count: { device: 'desc' } },
      }),

      // OS split
      prisma.pageView.groupBy({
        by: ['os'],
        where,
        _count: { os: true },
        orderBy: { _count: { os: 'desc' } },
        take: 10,
      }),

      // Top pages
      prisma.pageView.groupBy({
        by: ['path'],
        where,
        _count: { path: true },
        orderBy: { _count: { path: 'desc' } },
        take: 10,
      }),

      // Threat summary
      prisma.pageView.aggregate({
        where,
        _avg: { riskScore: true },
        _max: { riskScore: true },
      }),
    ])

    const [vpnCount, proxyCount, torCount, hostingCount] = await Promise.all([
      prisma.pageView.count({ where: { ...where, isVpn: true } }),
      prisma.pageView.count({ where: { ...where, isProxy: true } }),
      prisma.pageView.count({ where: { ...where, isTor: true } }),
      prisma.pageView.count({ where: { ...where, isHosting: true } }),
    ])

    return NextResponse.json({
      success: true,
      browser: browserName,
      range,
      totalViews,
      versionBreakdown: versionByCount.map(v => ({
        version: v.browserVer || 'Unknown',
        views: v._count.browserVer,
      })),
      deviceBreakdown: deviceByCount.map(d => ({
        device: d.device || 'Unknown',
        views: d._count.device,
      })),
      osBreakdown: osByCount.map(o => ({
        os: o.os || 'Unknown',
        views: o._count.os,
      })),
      topPages: topPages.map(p => ({
        path: p.path,
        views: p._count.path,
      })),
      threatSummary: {
        avgRiskScore: Math.round(threatStats._avg.riskScore || 0),
        maxRiskScore: threatStats._max.riskScore || 0,
        vpnCount,
        proxyCount,
        torCount,
        hostingCount,
      },
    })
  } catch (error) {
    console.error('[Browser Drilldown] Error:', error)
    return NextResponse.json({ error: 'Failed to load browser data' }, { status: 500 })
  }
}
