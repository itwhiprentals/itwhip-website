// app/api/fleet/analytics/device/[type]/route.ts
// GET /api/fleet/analytics/device/[type] — device type drill-down

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const key = request.nextUrl.searchParams.get('key')
  const sessionCookie = request.cookies.get('fleet_session')?.value
  if (key !== 'phoenix-fleet-2847' && !sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { type } = await params
  const range = request.nextUrl.searchParams.get('range') || '7d'

  const now = new Date()
  const rangeMs: Record<string, number> = { '24h': 86400000, '7d': 604800000, '30d': 2592000000, '90d': 7776000000 }
  const startDate = new Date(now.getTime() - (rangeMs[range] || rangeMs['7d']))

  const where = { device: type, timestamp: { gte: startDate } }

  try {
    const [totalViews, osByCount, browserByCount, topPages, threatStats] = await Promise.all([
      // Total views for this device
      prisma.pageView.count({ where }),

      // OS breakdown with versions
      prisma.pageView.groupBy({
        by: ['os', 'osVersion'],
        where,
        _count: { os: true },
        orderBy: { _count: { os: 'desc' } },
        take: 20,
      }),

      // Browser breakdown within this device
      prisma.pageView.groupBy({
        by: ['browser'],
        where,
        _count: { browser: true },
        orderBy: { _count: { browser: 'desc' } },
        take: 10,
      }),

      // Top pages on this device
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
        _count: true,
      }),
    ])

    // Count threat flags
    const [vpnCount, proxyCount, torCount, hostingCount] = await Promise.all([
      prisma.pageView.count({ where: { ...where, isVpn: true } }),
      prisma.pageView.count({ where: { ...where, isProxy: true } }),
      prisma.pageView.count({ where: { ...where, isTor: true } }),
      prisma.pageView.count({ where: { ...where, isHosting: true } }),
    ])

    return NextResponse.json({
      success: true,
      device: type,
      range,
      totalViews,
      osBreakdown: osByCount.map(o => ({
        os: o.os || 'Unknown',
        osVersion: o.osVersion || null,
        views: o._count.os,
      })),
      browserBreakdown: browserByCount.map(b => ({
        browser: b.browser || 'Unknown',
        views: b._count.browser,
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
    console.error('[Device Drilldown] Error:', error)
    return NextResponse.json({ error: 'Failed to load device data' }, { status: 500 })
  }
}
