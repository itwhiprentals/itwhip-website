// app/api/fleet/analytics/track/route.ts
// Lightweight page view tracking endpoint
// Designed for high throughput with minimal overhead

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import prisma from '@/app/lib/database/prisma'
import {
  parseUserAgent,
  extractGeoFromHeaders,
  getClientIP,
  sanitizeQueryParams,
  generateVisitorId
} from '@/app/lib/analytics'

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
    const geo = await extractGeoFromHeaders()
    const parsed = parseUserAgent(userAgent)

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
      country: geo.country,
      region: geo.region,
      city: geo.city,
      loadTime: typeof loadTime === 'number' ? loadTime : null,
      eventType,
      metadata: metadata || null
    }

    // Fire and forget - don't wait for DB write
    prisma.pageView.create({ data: pageViewData }).catch((err) => {
      console.error('[Analytics] Failed to record page view:', err)
    })

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
