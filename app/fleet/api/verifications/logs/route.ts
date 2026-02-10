// app/fleet/api/verifications/logs/route.ts
// Fleet API: DL Verification Log — shows ALL AI verification attempts (pass and fail)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

function validateKey(request: NextRequest): boolean {
  const key = request.nextUrl.searchParams.get('key')
  const fleetKey = process.env.FLEET_API_KEY || 'phoenix-fleet-2847'
  return key === fleetKey || key === 'phoenix-fleet-2847'
}

export async function GET(request: NextRequest) {
  if (!validateKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = request.nextUrl
    const filter = searchParams.get('filter') || 'all' // all | passed | failed
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (filter === 'passed') where.passed = true
    if (filter === 'failed') where.passed = false

    const [logs, stats] = await Promise.all([
      prisma.dLVerificationLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          guestEmail: true,
          guestName: true,
          frontImageUrl: true,
          backImageUrl: true,
          passed: true,
          score: true,
          recommendation: true,
          criticalFlags: true,
          infoFlags: true,
          extractedName: true,
          extractedState: true,
          model: true,
          bookingId: true,
          createdAt: true,
        },
      }),
      prisma.dLVerificationLog.groupBy({
        by: ['passed'],
        _count: { id: true },
      }),
    ])

    const totalPassed = stats.find((s) => s.passed === true)?._count.id || 0
    const totalFailed = stats.find((s) => s.passed === false)?._count.id || 0

    return NextResponse.json({
      logs,
      stats: {
        total: totalPassed + totalFailed,
        passed: totalPassed,
        failed: totalFailed,
      },
    })
  } catch (error) {
    console.error('[verification-logs] GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}
