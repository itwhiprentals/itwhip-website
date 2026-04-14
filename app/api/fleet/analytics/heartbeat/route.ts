// app/api/fleet/analytics/heartbeat/route.ts
// Receives presence heartbeats from visitors. Upserts into Presence table.
// Cleans up stale entries (older than 5 min) on each request (throttled).

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { headers } from 'next/headers'
import { getClientIP } from '@/app/lib/analytics'
import { jwtVerify } from 'jose'

// Rate limit: max 1 heartbeat per 10s per IP
const rateLimitMap = new Map<string, number>()
let lastCleanup = 0

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const ip = getClientIP(headersList) || 'unknown'

    // Rate limit
    const now = Date.now()
    const lastBeat = rateLimitMap.get(ip) || 0
    if (now - lastBeat < 10_000) {
      return NextResponse.json({ ok: true }) // silently skip
    }
    rateLimitMap.set(ip, now)

    // Clean rate limit map every 5 min
    if (rateLimitMap.size > 500) {
      const cutoff = now - 60_000
      for (const [k, v] of rateLimitMap) {
        if (v < cutoff) rateLimitMap.delete(k)
      }
    }

    const body = await request.json().catch(() => ({}))
    const path = body.path || '/'

    // Generate visitor ID (same logic as page tracking)
    const ua = headersList.get('user-agent') || ''
    const dateKey = new Date().toISOString().slice(0, 10)
    const visitorId = `v_${simpleHash(`${ua}${ip}${dateKey}`).slice(0, 6)}`

    // Detect role from auth cookies — role is determined by CURRENT page context
    let userId: string | null = null
    let role = 'anonymous'

    // Determine role based on what section of the site they're on
    const isFleetPage = path.startsWith('/fleet')
    const isPartnerPage = path.startsWith('/partner')
    const isHostPage = path.startsWith('/host') || isPartnerPage

    if (isFleetPage) {
      // Fleet admin pages
      const fleetSession = request.cookies.get('fleet_session')?.value
      if (fleetSession) role = 'admin'
    } else if (isHostPage) {
      // Host/partner pages
      const hostToken = request.cookies.get('host_access_token')?.value
      if (hostToken) {
        const decoded = await decodeToken(hostToken, process.env.HOST_JWT_SECRET || process.env.JWT_SECRET)
        if (decoded) { userId = decoded.userId; role = 'host' }
      }
    } else {
      // Guest pages (everything else — rentals, search, dashboard, etc.)
      const guestToken = request.cookies.get('guest_access_token')?.value
      if (guestToken) {
        const decoded = await decodeToken(guestToken, process.env.GUEST_JWT_SECRET)
        if (decoded) { userId = decoded.userId; role = 'guest' }
      }
    }

    // Parse UA for device/browser
    const device = /mobi|iphone|android.*mobile/i.test(ua) ? 'mobile' : /ipad|tablet/i.test(ua) ? 'tablet' : 'desktop'
    const browser = ua.includes('Edg/') ? 'Edge' : ua.includes('Chrome/') ? 'Chrome' : ua.includes('Safari/') ? 'Safari' : ua.includes('Firefox/') ? 'Firefox' : 'Other'

    // Derive funnel stage from current path
    const funnelStage = deriveFunnelStage(path)

    const presenceId = userId ? `${visitorId}:${userId}` : visitorId

    // Upsert presence
    await prisma.presence.upsert({
      where: { id: presenceId },
      update: { lastSeen: new Date(), path, ip, funnelStage },
      create: {
        id: presenceId,
        visitorId,
        userId,
        role,
        ip,
        path,
        device,
        browser,
        funnelStage,
        lastSeen: new Date(),
      },
    })

    // Cleanup stale entries (max once per minute)
    if (now - lastCleanup > 60_000) {
      lastCleanup = now
      const fiveMinAgo = new Date(now - 5 * 60 * 1000)
      prisma.presence.deleteMany({ where: { lastSeen: { lt: fiveMinAgo } } }).catch(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true }) // never fail — heartbeats are non-critical
  }
}

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

function deriveFunnelStage(path: string): string {
  if (/\/rentals\/[^/]+\/book/.test(path)) return 'checkout'
  if (/\/rentals\/[^/]+/.test(path) && !path.includes('/search')) return 'car_detail'
  if (path.includes('/rentals/search') || path.includes('/rentals')) return 'browsing'
  return 'other'
}

async function decodeToken(token: string, secret?: string): Promise<{ userId: string } | null> {
  if (!secret) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    const userId = (payload.userId || payload.id || payload.sub) as string
    return userId ? { userId } : null
  } catch {
    return null
  }
}
