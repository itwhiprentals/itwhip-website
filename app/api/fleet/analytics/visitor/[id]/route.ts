// app/api/fleet/analytics/visitor/[id]/route.ts
// GET /api/fleet/analytics/visitor/[id] — full visitor threat profile

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

const SENSITIVE_PATHS = ['/fleet', '/admin', '/api/admin', '/sys-2847', '/api/fleet']
const AUTH_PATHS = ['/auth', '/login', '/signup', '/reset-password', '/forgot-password']

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const key = request.nextUrl.searchParams.get('key')
  const sessionCookie = request.cookies.get('fleet_session')?.value
  if (key !== 'phoenix-fleet-2847' && !sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: visitorId } = await params
  const decodedId = decodeURIComponent(visitorId)

  try {
    // Get all page views for this visitor
    const pageViews = await prisma.pageView.findMany({
      where: { visitorId: decodedId },
      select: {
        id: true, path: true, timestamp: true, loadTime: true,
        device: true, browser: true, os: true,
        ip: true, isp: true, asn: true, org: true,
        country: true, region: true, city: true,
        isVpn: true, isProxy: true, isTor: true, isHosting: true,
        riskScore: true, latitude: true, longitude: true, address: true,
        gpsLatitude: true, gpsLongitude: true, gpsAddress: true, gpsAccuracy: true,
      },
      orderBy: { timestamp: 'desc' },
      take: 200,
    })

    if (pageViews.length === 0) {
      return NextResponse.json({ error: 'Visitor not found' }, { status: 404 })
    }

    // Build visitor summary from latest data
    const latest = pageViews[0]
    const oldest = pageViews[pageViews.length - 1]
    const visitor = {
      visitorId: decodedId,
      ip: latest.ip,
      isp: latest.isp,
      asn: latest.asn,
      org: latest.org,
      country: latest.country,
      region: latest.region,
      city: latest.city,
      isVpn: pageViews.some(v => v.isVpn),
      isProxy: pageViews.some(v => v.isProxy),
      isTor: pageViews.some(v => v.isTor),
      isHosting: pageViews.some(v => v.isHosting),
      riskScore: Math.max(...pageViews.map(v => v.riskScore)),
      latitude: latest.latitude,
      longitude: latest.longitude,
      address: latest.address,
      device: latest.device,
      browser: latest.browser,
      pageCount: pageViews.length,
      firstSeen: oldest.timestamp.toISOString(),
      lastSeen: latest.timestamp.toISOString(),
    }

    // Cross-reference security events by IP
    let securityEvents: any[] = []
    if (latest.ip) {
      securityEvents = await prisma.securityEvent.findMany({
        where: { sourceIp: latest.ip },
        select: {
          id: true, type: true, severity: true, sourceIp: true,
          message: true, action: true, blocked: true, timestamp: true,
        },
        orderBy: { timestamp: 'desc' },
        take: 50,
      })
    }

    // Cross-reference login attempts by IP
    let loginAttempts: any[] = []
    if (latest.ip) {
      loginAttempts = await prisma.loginAttempt.findMany({
        where: { ipAddress: latest.ip },
        select: {
          id: true, identifier: true, success: true, reason: true, timestamp: true,
        },
        orderBy: { timestamp: 'desc' },
        take: 20,
      })
    }

    // Behavioral analysis
    const authPagesVisited = [...new Set(
      pageViews.filter(v => AUTH_PATHS.some(p => v.path.includes(p))).map(v => v.path)
    )]
    const sensitivePagesVisited = [...new Set(
      pageViews.filter(v => SENSITIVE_PATHS.some(p => v.path.startsWith(p))).map(v => v.path)
    )]

    // Calculate timing between page views
    const timestamps = pageViews.map(v => v.timestamp.getTime()).sort()
    const intervals = timestamps.slice(1).map((t, i) => t - timestamps[i])
    const avgTimeBetweenPages = intervals.length > 0
      ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
      : null

    const sessionDurationMs = timestamps.length >= 2
      ? timestamps[timestamps.length - 1] - timestamps[0]
      : null

    // Format page views for response
    const formattedViews = pageViews.map(v => ({
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

    // Format security events
    const formattedEvents = securityEvents.map((e: any) => ({
      id: e.id,
      type: e.type,
      severity: e.severity,
      sourceIp: e.sourceIp,
      message: e.message,
      action: e.action,
      blocked: e.blocked,
      timestamp: e.timestamp.toISOString(),
    }))

    // Find the best GPS data (most accurate, non-null)
    const gpsView = pageViews.find(v => v.gpsLatitude != null) || null
    const gpsLocation = gpsView ? {
      latitude: gpsView.gpsLatitude,
      longitude: gpsView.gpsLongitude,
      address: gpsView.gpsAddress,
      accuracy: gpsView.gpsAccuracy,
    } : null

    return NextResponse.json({
      success: true,
      visitor,
      gpsLocation,
      pageViews: formattedViews,
      securityEvents: formattedEvents,
      loginAttempts: loginAttempts.map((l: any) => ({
        ...l,
        timestamp: l.timestamp.toISOString(),
      })),
      behavioral: {
        totalPages: pageViews.length,
        avgTimeBetweenPages,
        authPagesVisited,
        sensitivePagesVisited,
        sessionDurationMs,
      },
    })

  } catch (error) {
    console.error('[Visitor Profile] Error:', error)
    return NextResponse.json({ error: 'Failed to load visitor profile' }, { status: 500 })
  }
}
