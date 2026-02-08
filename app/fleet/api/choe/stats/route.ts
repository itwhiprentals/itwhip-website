// app/fleet/api/choe/stats/route.ts
// Choé AI Stats API - Overview metrics and daily stats

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { Prisma } from '@prisma/client'
import { validateFleetKey } from '../auth'

// =============================================================================
// GET - Fetch Choé AI Stats
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    if (!validateFleetKey(request)) {
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
      toolUsageStats,
      conversionFunnel,
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
      // Tool usage stats (last 30 days)
      getToolUsageStats(),
      // Conversion funnel (last 30 days)
      getConversionFunnel(monthAgo, now),
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
        currentCostToday: Number(todayCost?.estimatedCostUsd) || 0,
      },
      dailyStats: dailyStatsRaw,
      toolUsage: toolUsageStats,
      conversionFunnel,
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
    // Conversation aggregates — count conversations ACTIVE in this period
    prisma.choeAIConversation.aggregate({
      where: {
        lastActivityAt: { gte: from, lte: to }
      },
      _count: { id: true },
      _sum: { totalTokens: true },
      _avg: { messageCount: true },
    }),
    // Outcome breakdown
    prisma.choeAIConversation.groupBy({
      by: ['outcome'],
      where: {
        lastActivityAt: { gte: from, lte: to }
      },
      _count: { id: true },
    }),
    // Booking stats
    prisma.choeAIConversation.aggregate({
      where: {
        lastActivityAt: { gte: from, lte: to },
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

  // Estimate cost based on tokens (Haiku 4.5 rate: $1/M input, or old Haiku 3.5: $0.25/M)
  // Use higher rate to be conservative
  const estimatedCost = (tokens / 1_000_000) * 1.0

  return {
    conversations: total,
    completed,
    abandoned,
    messages: Math.round((conversationStats._avg.messageCount || 0) * total),
    tokens,
    estimatedCost: Math.round(estimatedCost * 10000) / 10000, // 4 decimal places for small values
    conversionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    avgMessagesPerConv: Math.round((conversationStats._avg.messageCount || 0) * 10) / 10,
    avgResponseTimeMs: 0, // TODO: Calculate from messages
    bookingsGenerated: bookingStats._count.id || 0,
    revenueGenerated: Number(bookingStats._sum.bookingValue) || 0,
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

  // Query actual conversations (ChoeAIDailyStats table is never populated)
  const conversations = await prisma.choeAIConversation.findMany({
    where: { startedAt: { gte: fromDate } },
    select: {
      startedAt: true,
      outcome: true,
      totalTokens: true,
      estimatedCost: true,
      bookingId: true,
      bookingValue: true,
    },
  })

  // Pre-fill all days in range so chart shows zero-bars, not gaps
  const dayMap = new Map<string, { conversations: number; completed: number; abandoned: number; cost: number; tokens: number; bookings: number; revenue: number }>()
  for (let d = new Date(fromDate); d <= now; d = new Date(d.getTime() + 86400000)) {
    const key = d.toISOString().split('T')[0]
    dayMap.set(key, { conversations: 0, completed: 0, abandoned: 0, cost: 0, tokens: 0, bookings: 0, revenue: 0 })
  }

  // Bucket conversations into days
  for (const conv of conversations) {
    const key = conv.startedAt.toISOString().split('T')[0]
    const day = dayMap.get(key)
    if (!day) continue
    day.conversations++
    if (conv.outcome === 'COMPLETED') day.completed++
    if (conv.outcome === 'ABANDONED') day.abandoned++
    day.tokens += conv.totalTokens
    day.cost += Number(conv.estimatedCost)
    if (conv.bookingId) {
      day.bookings++
      day.revenue += Number(conv.bookingValue || 0)
    }
  }

  return Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, stats]) => ({ date, ...stats }))
}

async function getToolUsageStats(): Promise<Record<string, number>> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  // Fetch all messages with toolsUsed in the last 30 days
  const messagesWithTools = await prisma.choeAIMessage.findMany({
    where: {
      createdAt: { gte: thirtyDaysAgo },
      NOT: { toolsUsed: { equals: Prisma.JsonNull } },
    },
    select: { toolsUsed: true },
  })

  // Count each tool from the toolsUsed JSON array
  const toolCounts: Record<string, number> = {
    search_vehicles: 0,
    get_weather: 0,
    select_vehicle: 0,
    update_booking_details: 0,
  }

  for (const msg of messagesWithTools) {
    const tools = msg.toolsUsed as string[] | null
    if (tools && Array.isArray(tools)) {
      for (const tool of tools) {
        if (tool in toolCounts) {
          toolCounts[tool]++
        }
      }
    }
  }

  // Also count from searchPerformed for older messages (backward compatibility)
  // Only count if there are no toolsUsed entries yet for search
  if (toolCounts.search_vehicles === 0) {
    const searchCount = await prisma.choeAIMessage.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        searchPerformed: true,
      },
    })
    toolCounts.search_vehicles = searchCount
  }

  return toolCounts
}

async function getConversionFunnel(from: Date, to: Date) {
  const stateCounts = await prisma.choeAIConversation.groupBy({
    by: ['state'],
    where: { lastActivityAt: { gte: from, lte: to } },
    _count: { id: true },
  })

  // Build a state-to-count map
  const counts: Record<string, number> = {}
  for (const s of stateCounts) {
    counts[s.state] = s._count.id
  }

  // States progress: INIT → COLLECTING_LOCATION → COLLECTING_DATES → COLLECTING_VEHICLE → CONFIRMING → CHECKING_AUTH → READY_FOR_PAYMENT
  // Cumulative funnel: each stage = conversations that reached AT LEAST that stage
  const total =
    (counts['INIT'] || 0) +
    (counts['COLLECTING_LOCATION'] || 0) +
    (counts['COLLECTING_DATES'] || 0) +
    (counts['COLLECTING_VEHICLE'] || 0) +
    (counts['CONFIRMING'] || 0) +
    (counts['CHECKING_AUTH'] || 0) +
    (counts['READY_FOR_PAYMENT'] || 0)

  const locationSet =
    (counts['COLLECTING_DATES'] || 0) +
    (counts['COLLECTING_VEHICLE'] || 0) +
    (counts['CONFIRMING'] || 0) +
    (counts['CHECKING_AUTH'] || 0) +
    (counts['READY_FOR_PAYMENT'] || 0)

  const datesSet =
    (counts['COLLECTING_VEHICLE'] || 0) +
    (counts['CONFIRMING'] || 0) +
    (counts['CHECKING_AUTH'] || 0) +
    (counts['READY_FOR_PAYMENT'] || 0)

  const vehicleSelected =
    (counts['CONFIRMING'] || 0) +
    (counts['CHECKING_AUTH'] || 0) +
    (counts['READY_FOR_PAYMENT'] || 0)

  const completed = counts['READY_FOR_PAYMENT'] || 0

  return [
    { label: 'Started', value: total, percentage: 100 },
    { label: 'Location Set', value: locationSet, percentage: total > 0 ? Math.round((locationSet / total) * 100) : 0 },
    { label: 'Dates Set', value: datesSet, percentage: total > 0 ? Math.round((datesSet / total) * 100) : 0 },
    { label: 'Vehicle Selected', value: vehicleSelected, percentage: total > 0 ? Math.round((vehicleSelected / total) * 100) : 0 },
    { label: 'Completed', value: completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 },
  ]
}
