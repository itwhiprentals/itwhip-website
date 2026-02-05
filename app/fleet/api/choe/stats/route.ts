// app/fleet/api/choe/stats/route.ts
// Choé AI Stats API - Overview metrics and daily stats

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

const FLEET_KEY = 'phoenix-fleet-2847'

// =============================================================================
// GET - Fetch Choé AI Stats
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    // Validate API key
    const key = request.nextUrl.searchParams.get('key')
    if (key !== FLEET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const range = request.nextUrl.searchParams.get('range') || '7d'

    // Calculate date ranges
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(todayStart)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(todayStart)
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    // Fetch stats in parallel
    const [
      todayStats,
      weekStats,
      monthStats,
      allTimeStats,
      activeSessions,
      messagesLastHour,
      todayCost,
      dailyStatsRaw,
    ] = await Promise.all([
      // Today's stats
      getStatsForPeriod(todayStart, now),
      // Week stats
      getStatsForPeriod(weekAgo, now),
      // Month stats
      getStatsForPeriod(monthAgo, now),
      // All time stats
      getStatsForPeriod(new Date(0), now),
      // Active sessions (last 15 min)
      prisma.choeAIConversation.count({
        where: {
          lastActivityAt: { gte: new Date(now.getTime() - 15 * 60 * 1000) },
          completedAt: null,
        }
      }),
      // Messages in last hour
      prisma.choeAIMessage.count({
        where: {
          createdAt: { gte: hourAgo }
        }
      }),
      // Today's cost from daily stats
      prisma.choeAIDailyStats.findUnique({
        where: { date: todayStart },
        select: { estimatedCostUsd: true }
      }),
      // Daily stats for chart (based on range)
      getDailyStatsForRange(range),
    ])

    return NextResponse.json({
      success: true,
      data: {
        today: todayStats,
        week: weekStats,
        month: monthStats,
        allTime: allTimeStats,
      },
      liveMetrics: {
        activeSessions,
        messagesLastHour,
        currentCostToday: todayCost?.estimatedCostUsd?.toNumber() || 0,
      },
      dailyStats: dailyStatsRaw,
    })
  } catch (error) {
    console.error('[Choé Stats API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function getStatsForPeriod(from: Date, to: Date) {
  const [
    conversationStats,
    messageStats,
    bookingStats,
  ] = await Promise.all([
    // Conversation aggregates
    prisma.choeAIConversation.aggregate({
      where: {
        startedAt: { gte: from, lte: to }
      },
      _count: { id: true },
      _sum: { totalTokens: true },
      _avg: { messageCount: true },
    }),
    // Outcome breakdown
    prisma.choeAIConversation.groupBy({
      by: ['outcome'],
      where: {
        startedAt: { gte: from, lte: to }
      },
      _count: { id: true },
    }),
    // Booking stats
    prisma.choeAIConversation.aggregate({
      where: {
        startedAt: { gte: from, lte: to },
        bookingId: { not: null },
      },
      _count: { id: true },
      _sum: { bookingValue: true },
    }),
  ])

  const total = conversationStats._count.id || 0
  const completed = messageStats.find(s => s.outcome === 'COMPLETED')?._count.id || 0
  const abandoned = messageStats.find(s => s.outcome === 'ABANDONED')?._count.id || 0
  const tokens = conversationStats._sum.totalTokens || 0

  // Estimate cost based on tokens (Haiku rate)
  const estimatedCost = (tokens / 1_000_000) * 0.25

  return {
    conversations: total,
    completed,
    abandoned,
    messages: Math.round((conversationStats._avg.messageCount || 0) * total),
    tokens,
    estimatedCost: Math.round(estimatedCost * 100) / 100,
    conversionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    avgMessagesPerConv: Math.round((conversationStats._avg.messageCount || 0) * 10) / 10,
    avgResponseTimeMs: 0, // TODO: Calculate from messages
    bookingsGenerated: bookingStats._count.id || 0,
    revenueGenerated: bookingStats._sum.bookingValue?.toNumber() || 0,
  }
}

async function getDailyStatsForRange(range: string) {
  const now = new Date()
  let daysBack = 7

  switch (range) {
    case '24h': daysBack = 1; break
    case '7d': daysBack = 7; break
    case '30d': daysBack = 30; break
    case '90d': daysBack = 90; break
    case 'all': daysBack = 365; break
  }

  const fromDate = new Date(now)
  fromDate.setDate(fromDate.getDate() - daysBack)
  fromDate.setHours(0, 0, 0, 0)

  const dailyStats = await prisma.choeAIDailyStats.findMany({
    where: {
      date: { gte: fromDate }
    },
    orderBy: { date: 'asc' },
  })

  return dailyStats.map(stat => ({
    date: stat.date.toISOString().split('T')[0],
    conversations: stat.totalConversations,
    completed: stat.completedCount,
    abandoned: stat.abandonedCount,
    cost: stat.estimatedCostUsd.toNumber(),
    tokens: stat.totalTokens,
    bookings: stat.bookingsFromChoe,
    revenue: stat.revenueFromChoe.toNumber(),
  }))
}
