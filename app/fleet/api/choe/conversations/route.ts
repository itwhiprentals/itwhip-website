// app/fleet/api/choe/conversations/route.ts
// Choé AI Conversations API - List conversations with pagination and filters

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import type { Prisma } from '@prisma/client'

const FLEET_KEY = 'phoenix-fleet-2847'
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

// =============================================================================
// GET - List Conversations
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
    const outcome = request.nextUrl.searchParams.get('outcome')
    const isAuthenticated = request.nextUrl.searchParams.get('isAuthenticated')
    const hasBooking = request.nextUrl.searchParams.get('hasBooking')
    const dateFrom = request.nextUrl.searchParams.get('dateFrom')
    const dateTo = request.nextUrl.searchParams.get('dateTo')
    const search = request.nextUrl.searchParams.get('search')

    // Build where clause
    const where: Prisma.ChoeAIConversationWhereInput = {}

    if (outcome && outcome !== 'all') {
      where.outcome = outcome
    }

    if (isAuthenticated && isAuthenticated !== 'all') {
      where.isAuthenticated = isAuthenticated === 'true'
    }

    if (hasBooking === 'true') {
      where.bookingId = { not: null }
    } else if (hasBooking === 'false') {
      where.bookingId = null
    }

    if (dateFrom) {
      where.startedAt = { ...where.startedAt as object, gte: new Date(dateFrom) }
    }

    if (dateTo) {
      const endDate = new Date(dateTo)
      endDate.setHours(23, 59, 59, 999)
      where.startedAt = { ...where.startedAt as object, lte: endDate }
    }

    if (search) {
      where.OR = [
        { sessionId: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search } },
      ]
    }

    // Fetch conversations with pagination
    const [conversations, total] = await Promise.all([
      prisma.choeAIConversation.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          sessionId: true,
          userId: true,
          visitorId: true,
          ipAddress: true,
          isAuthenticated: true,
          state: true,
          messageCount: true,
          location: true,
          vehicleType: true,
          outcome: true,
          totalTokens: true,
          estimatedCost: true,
          bookingId: true,
          bookingValue: true,
          startedAt: true,
          lastActivityAt: true,
          completedAt: true,
        }
      }),
      prisma.choeAIConversation.count({ where }),
    ])

    // Transform for response
    const data = conversations.map(conv => ({
      ...conv,
      estimatedCost: conv.estimatedCost.toNumber(),
      bookingValue: conv.bookingValue?.toNumber() || null,
      startedAt: conv.startedAt.toISOString(),
      lastActivityAt: conv.lastActivityAt.toISOString(),
      completedAt: conv.completedAt?.toISOString() || null,
      duration: conv.completedAt
        ? Math.round((conv.completedAt.getTime() - conv.startedAt.getTime()) / 1000)
        : Math.round((conv.lastActivityAt.getTime() - conv.startedAt.getTime()) / 1000),
    }))

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('[Choé Conversations API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
