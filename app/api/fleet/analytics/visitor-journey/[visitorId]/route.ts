// app/api/fleet/analytics/visitor-journey/[visitorId]/route.ts
// GET — returns funnel events for a specific visitor (session timeline)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ visitorId: string }> }
) {
  const key = request.nextUrl.searchParams.get('key')
  const sessionCookie = request.cookies.get('fleet_session')?.value
  if (key !== 'phoenix-fleet-2847' && !sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { visitorId } = await params

  try {
    // Get all funnel events for this visitor in the last 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const events = await prisma.pageView.findMany({
      where: {
        visitorId,
        eventType: { startsWith: 'funnel_' },
        timestamp: { gte: oneDayAgo },
      },
      orderBy: { timestamp: 'asc' },
      select: {
        eventType: true,
        timestamp: true,
        metadata: true,
      },
    })

    return NextResponse.json({
      success: true,
      visitorId,
      steps: events.map(e => ({
        eventType: e.eventType,
        timestamp: e.timestamp,
        metadata: e.metadata || {},
      })),
    })
  } catch (error) {
    console.error('[VisitorJourney] Error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
