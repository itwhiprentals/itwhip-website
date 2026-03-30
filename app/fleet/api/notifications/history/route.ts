// app/fleet/api/notifications/history/route.ts
// Paginated notification history — manual + automated

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

const FLEET_KEY = 'phoenix-fleet-2847'

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key')
    if (key !== FLEET_KEY) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // 'manual' | 'automated' | null (all)
    const search = searchParams.get('search') || ''

    // Manual notifications
    const manualWhere: any = {}
    if (search) manualWhere.title = { contains: search, mode: 'insensitive' }

    const [manualNotifications, manualCount] = await Promise.all([
      prisma.manualNotification.findMany({
        where: manualWhere,
        orderBy: { createdAt: 'desc' },
        skip: type === 'automated' ? 0 : (page - 1) * limit,
        take: type === 'automated' ? 0 : limit,
      }),
      prisma.manualNotification.count({ where: manualWhere }),
    ])

    // Automated notification summary (grouped by type, last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const automatedStats = type === 'manual' ? [] : await prisma.pushNotification.groupBy({
      by: ['type'],
      where: { createdAt: { gte: thirtyDaysAgo }, ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}) },
      _count: true,
      orderBy: { _count: { type: 'desc' } },
    })

    return NextResponse.json({
      manual: manualNotifications.map(n => ({
        ...n, source: 'manual' as const,
      })),
      manualTotal: manualCount,
      automated: automatedStats.map(s => ({
        type: s.type, count: s._count, source: 'automated' as const,
      })),
      page, limit,
      totalPages: Math.ceil(manualCount / limit),
    })
  } catch (error) {
    console.error('[Fleet Notifications] History error:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
