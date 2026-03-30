// app/fleet/api/notifications/stats/route.ts
// Delivery stats dashboard

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

const FLEET_KEY = 'phoenix-fleet-2847'

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key')
    if (key !== FLEET_KEY) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

    const [totalPush, monthPush, activeTokens, inactiveTokens, iosTokens, androidTokens, typeBreakdown, manualTotal, manualDelivered, manualFailed] = await Promise.all([
      prisma.pushNotification.count(),
      prisma.pushNotification.count({ where: { createdAt: { gte: thisMonth } } }),
      prisma.devicePushToken.count({ where: { active: true } }),
      prisma.devicePushToken.count({ where: { active: false } }),
      prisma.devicePushToken.count({ where: { active: true, platform: 'ios' } }),
      prisma.devicePushToken.count({ where: { active: true, platform: 'android' } }),
      prisma.pushNotification.groupBy({ by: ['type'], _count: true, orderBy: { _count: { type: 'desc' } }, take: 10 }),
      prisma.manualNotification.aggregate({ _sum: { sentCount: true } }),
      prisma.manualNotification.aggregate({ _sum: { deliveredCount: true } }),
      prisma.manualNotification.aggregate({ _sum: { failedCount: true } }),
    ])

    const totalManualSent = manualTotal._sum.sentCount || 0
    const totalManualDelivered = manualDelivered._sum.deliveredCount || 0
    const totalManualFailed = manualFailed._sum.failedCount || 0

    return NextResponse.json({
      summary: {
        totalPushAllTime: totalPush,
        totalPushThisMonth: monthPush,
        activeDeviceTokens: activeTokens,
        deliverySuccessRate: totalManualSent > 0 ? Math.round((totalManualDelivered / (totalManualDelivered + totalManualFailed)) * 100) : 100,
      },
      tokens: {
        total: activeTokens + inactiveTokens,
        active: activeTokens,
        inactive: inactiveTokens,
        ios: iosTokens,
        android: androidTokens,
      },
      typeBreakdown: typeBreakdown.map(t => ({ type: t.type, count: t._count })),
      manual: { sent: totalManualSent, delivered: totalManualDelivered, failed: totalManualFailed },
    })
  } catch (error) {
    console.error('[Fleet Notifications] Stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
