// app/fleet/api/choe/security/route.ts
// Choé AI Security API - Security events and threat metrics

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import type { Prisma } from '@prisma/client'

const FLEET_KEY = 'phoenix-fleet-2847'
const DEFAULT_LIMIT = 25
const MAX_LIMIT = 100

// =============================================================================
// GET - List Security Events with Stats
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    // Validate API key
    const key = request.nextUrl.searchParams.get('key')
    if (key !== FLEET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query params
    const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') || '1'))
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(request.nextUrl.searchParams.get('limit') || String(DEFAULT_LIMIT))))
    const eventType = request.nextUrl.searchParams.get('eventType')
    const severity = request.nextUrl.searchParams.get('severity')
    const blocked = request.nextUrl.searchParams.get('blocked')
    const dateFrom = request.nextUrl.searchParams.get('dateFrom')
    const dateTo = request.nextUrl.searchParams.get('dateTo')
    const search = request.nextUrl.searchParams.get('search')

    // Build where clause
    const where: Prisma.ChoeAISecurityEventWhereInput = {}

    if (eventType && eventType !== 'all') {
      where.eventType = eventType
    }

    if (severity && severity !== 'all') {
      where.severity = severity
    }

    if (blocked !== null && blocked !== 'all') {
      where.blocked = blocked === 'true'
    }

    if (dateFrom) {
      where.createdAt = { ...where.createdAt as object, gte: new Date(dateFrom) }
    }

    if (dateTo) {
      const endDate = new Date(dateTo)
      endDate.setHours(23, 59, 59, 999)
      where.createdAt = { ...where.createdAt as object, lte: endDate }
    }

    if (search) {
      where.OR = [
        { ipAddress: { contains: search } },
        { sessionId: { contains: search } },
        { visitorId: { contains: search } },
      ]
    }

    // Calculate date ranges for stats
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(todayStart)
    weekAgo.setDate(weekAgo.getDate() - 7)

    // Fetch events and stats in parallel
    const [events, total, todayStats, weekStats] = await Promise.all([
      // Paginated events
      prisma.choeAISecurityEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      // Total count
      prisma.choeAISecurityEvent.count({ where }),
      // Today's stats
      getSecurityStats(todayStart, now),
      // Week stats
      getSecurityStats(weekAgo, now),
    ])

    // Transform for response
    const data = events.map(event => ({
      ...event,
      details: event.details as Record<string, unknown> | null,
      createdAt: event.createdAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data,
      stats: {
        today: todayStats,
        week: weekStats,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('[Choé Security API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security events' },
      { status: 500 }
    )
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function getSecurityStats(from: Date, to: Date) {
  const [
    rateLimitHits,
    botsBlocked,
    promptInjections,
    uniqueIPs,
  ] = await Promise.all([
    prisma.choeAISecurityEvent.count({
      where: {
        eventType: 'rate_limit',
        createdAt: { gte: from, lte: to },
      }
    }),
    prisma.choeAISecurityEvent.count({
      where: {
        eventType: 'bot_detected',
        blocked: true,
        createdAt: { gte: from, lte: to },
      }
    }),
    prisma.choeAISecurityEvent.count({
      where: {
        eventType: 'prompt_injection',
        createdAt: { gte: from, lte: to },
      }
    }),
    prisma.choeAISecurityEvent.groupBy({
      by: ['ipAddress'],
      where: {
        createdAt: { gte: from, lte: to },
      },
    }).then(groups => groups.length),
  ])

  return {
    rateLimitHits,
    botsBlocked,
    promptInjections,
    uniqueIPs,
  }
}
