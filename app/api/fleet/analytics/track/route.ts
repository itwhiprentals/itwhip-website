// app/api/fleet/analytics/track/route.ts
// Lightweight page view tracking endpoint
// Designed for high throughput with minimal overhead

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import prisma from '@/app/lib/database/prisma'
import {
  parseUserAgent,
  getClientIP,
  sanitizeQueryParams,
  generateVisitorId
} from '@/app/lib/analytics'
import { enrichIp } from '@/app/lib/analytics/threat-enrichment'
import { evaluateThreats } from '@/app/lib/analytics/threat-patterns'

// Rate limit: Max 100 events per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 })
    return true
  }

  if (entry.count >= 100) {
    return false
  }

  entry.count++
  return true
}

// Clean up old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (entry.resetAt < now) {
      rateLimitMap.delete(ip)
    }
  }
}, 300000)

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const ip = getClientIP(headersList) || 'unknown'

    // Rate limit check
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json().catch(() => ({}))
    const { path, referrer, loadTime, eventType = 'pageview', metadata } = body

    // Validate required fields
    if (!path || typeof path !== 'string') {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      )
    }

    // Extract data from headers
    const userAgent = headersList.get('user-agent') || ''
    const parsed = parseUserAgent(userAgent)

    // Enrich IP with full threat intel (geo + ProxyCheck, cached)
    const threat = await enrichIp(ip !== 'unknown' ? ip : null)

    // Generate visitor ID (rotates daily, privacy-friendly)
    const visitorId = generateVisitorId(userAgent, ip)

    // Extract and sanitize query params from path
    let cleanPath = path
    let queryParams: string | null = null
    try {
      const url = new URL(path, 'https://itwhip.com')
      cleanPath = url.pathname
      queryParams = sanitizeQueryParams(url.searchParams)
    } catch {
      // Keep original path if parsing fails
    }

    // Get user ID if authenticated (from session cookie)
    // Note: This is extracted server-side, not from client
    const sessionCookie = request.cookies.get('fleet_session')?.value
    let userId: string | null = null
    if (sessionCookie) {
      // Fleet users have a simple session
      userId = `fleet_${sessionCookie.slice(0, 8)}`
    }

    // Insert page view (non-blocking for better UX)
    // Using setImmediate pattern to not block response
    const pageViewData = {
      path: cleanPath,
      referrer: referrer || null,
      queryParams,
      userId,
      visitorId,
      userAgent,
      device: parsed.device,
      browser: parsed.browser,
      browserVer: parsed.browserVer,
      os: parsed.os,
      osVersion: parsed.osVersion,
      country: threat.country,
      region: threat.region,
      city: threat.city,
      ip: threat.ip,
      isp: threat.isp,
      asn: threat.asn,
      org: threat.org,
      isVpn: threat.isVpn,
      isProxy: threat.isProxy,
      isTor: threat.isTor,
      isHosting: threat.isHosting,
      riskScore: threat.riskScore,
      latitude: threat.latitude,
      longitude: threat.longitude,
      address: threat.address,
      loadTime: typeof loadTime === 'number' ? loadTime : null,
      eventType,
      metadata: metadata || null
    }

    // Fire and forget with 5s timeout - don't hold connections too long
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('pageView write timeout')), 5000)
    )
    Promise.race([
      prisma.pageView.create({ data: pageViewData }),
      timeoutPromise,
    ]).catch((err) => {
      // Silently drop - analytics are non-critical
      if (err?.message !== 'pageView write timeout') {
        console.error('[Analytics] Failed to record page view:', err)
      }
    })

    // Evaluate threat patterns (fire-and-forget, non-blocking)
    if (threat.riskScore > 0 || threat.isVpn || threat.isProxy || threat.isTor || threat.isHosting) {
      // Get recent view count for this IP (from rate limit map as proxy)
      const recentCount = rateLimitMap.get(ip)?.count || 0
      const alerts = evaluateThreats(
        { path: cleanPath, ...threat },
        recentCount,
        recentCount, // viewsInLast5Min approximated from 1-min rate limit
      )
      // Fire alerts asynchronously
      if (alerts.length > 0) {
        Promise.resolve().then(async () => {
          for (const alert of alerts) {
            try {
              await prisma.monitoringAlert.create({
                data: {
                  type: 'security',
                  severity: alert.severity,
                  status: 'active',
                  title: `[${alert.pattern}] ${alert.severity} threat detected`,
                  message: alert.message,
                  source: 'threat-patterns',
                  metadata: { ip: threat.ip, city: threat.city, country: threat.country, isp: threat.isp, pattern: alert.pattern, path: cleanPath },
                },
              })
              console.log(`[ThreatAlert] ${alert.severity}: ${alert.message}`)
            } catch {}
          }
        }).catch(() => {})
      }
    }

    // Return immediately
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[Analytics] Track error:', error)
    return NextResponse.json(
      { error: 'Failed to track' },
      { status: 500 }
    )
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'analytics-track' })
}
