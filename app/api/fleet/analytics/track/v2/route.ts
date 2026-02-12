// app/api/fleet/analytics/track/v2/route.ts
// Enhanced page view tracking with military-grade visitor identification
// Combines client fingerprint with server-side signals for 95%+ accuracy

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import prisma from '@/app/lib/database/prisma'
import {
  parseUserAgent,
  extractGeoFromHeaders,
  getClientIP,
  sanitizeQueryParams
} from '@/app/lib/analytics'
import { identifyVisitor } from '@/app/lib/analytics/visitor-identification'

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
    const {
      path,
      referrer,
      loadTime,
      eventType = 'pageview',
      metadata,
      // Enhanced visitor identification
      visitorId: clientVisitorId,
      fingerprintHash,
      confidence: clientConfidence,
      // Additional fingerprint components (optional)
      fingerprint
    } = body

    // Validate required fields
    if (!path || typeof path !== 'string') {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      )
    }

    // Extract data from headers
    const userAgent = headersList.get('user-agent') || ''
    const acceptLanguage = headersList.get('accept-language') || undefined
    const geo = await extractGeoFromHeaders()
    const parsed = parseUserAgent(userAgent)

    // Prepare visitor signals for identification
    const visitorSignals = {
      visitorId: clientVisitorId,
      fingerprintHash,
      confidence: clientConfidence,
      ip,
      userAgent,
      acceptLanguage,
      country: geo.country,
      region: geo.region,
      city: geo.city,
      device: parsed.device,
      browser: parsed.browser,
      browserVer: parsed.browserVer,
      os: parsed.os,
      timezone: fingerprint?.components?.timezone?.name
    }

    // Identify visitor using multi-strategy matching
    const visitorMatch = await identifyVisitor(visitorSignals as any)

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
    const sessionCookie = request.cookies.get('fleet_session')?.value
    let userId: string | null = null
    if (sessionCookie) {
      userId = `fleet_${sessionCookie.slice(0, 8)}`
    }

    // Prepare page view data
    const pageViewData = {
      path: cleanPath,
      referrer: referrer || null,
      queryParams,
      userId,
      visitorId: visitorMatch.visitorId,
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
      metadata: metadata ? JSON.stringify({
        ...metadata,
        matchType: visitorMatch.matchType,
        confidence: visitorMatch.confidence,
        isReturning: visitorMatch.isReturning
      }) : JSON.stringify({
        matchType: visitorMatch.matchType,
        confidence: visitorMatch.confidence,
        isReturning: visitorMatch.isReturning
      })
    }

    // Fire and forget with 5s timeout - don't hold connections too long
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('pageView write timeout')), 5000)
    )
    Promise.race([
      prisma.pageView.create({ data: pageViewData }),
      timeoutPromise,
    ]).catch((err) => {
      if (err?.message !== 'pageView write timeout') {
        console.error('[Analytics v2] Failed to record page view:', err)
      }
    })

    // Return visitor identification result
    return NextResponse.json({
      success: true,
      visitor: {
        id: visitorMatch.visitorId,
        matchType: visitorMatch.matchType,
        confidence: visitorMatch.confidence,
        isReturning: visitorMatch.isReturning,
        previousVisits: visitorMatch.previousVisits
      }
    })

  } catch (error) {
    console.error('[Analytics v2] Track error:', error)
    return NextResponse.json(
      { error: 'Failed to track' },
      { status: 500 }
    )
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'analytics-track-v2',
    version: '2.0.0',
    features: [
      'client-fingerprint',
      'server-signals',
      'fuzzy-matching',
      'returning-visitor-detection'
    ]
  })
}
