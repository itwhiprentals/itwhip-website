// app/api/cron/expire-overdue-pickups/route.ts
// Expires request claims where the booking pickup date + 12h has passed
// Runs every 10 minutes via Vercel Cron

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { startCronLog } from '@/app/lib/cron/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const triggeredBy = request.headers.get('x-triggered-by') === 'manual' ? 'manual' as const : request.headers.get('x-triggered-by') === 'master' ? 'master' as const : 'cron' as const
  const log = await startCronLog('expire-overdue-pickups', triggeredBy)

  try {
    const now = new Date()
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000)

    // Find active claims on requests where pickup time + 12h has passed
    const overdueClaims = await prisma.requestClaim.findMany({
      where: {
        status: { in: ['PENDING_CAR', 'CAR_SELECTED'] },
        request: {
          startDate: { not: null },
          status: { in: ['OPEN', 'CLAIMED', 'CAR_ASSIGNED'] }
        }
      },
      include: {
        request: {
          select: {
            id: true,
            status: true,
            startDate: true,
            startTime: true,
          }
        },
        host: {
          select: { id: true, name: true }
        }
      }
    })

    let expiredCount = 0
    const results: Array<{ claimId: string; requestId: string; hostName: string }> = []

    for (const claim of overdueClaims) {
      const req = claim.request
      if (!req.startDate) continue

      // Calculate pickup datetime
      const pickup = new Date(req.startDate)
      const [h, m] = (req.startTime || '10:00').split(':').map(Number)
      pickup.setHours(h, m, 0, 0)

      // Only expire if pickup + 12h has passed
      if (pickup > twelveHoursAgo) continue

      // Expire the claim
      await prisma.requestClaim.update({
        where: { id: claim.id },
        data: { status: 'EXPIRED', expiredAt: now }
      })

      // Check if request has other active claims
      const otherActiveClaims = await prisma.requestClaim.count({
        where: {
          requestId: req.id,
          id: { not: claim.id },
          status: { in: ['PENDING_CAR', 'CAR_SELECTED'] }
        }
      })

      // If no other active claims, expire the request
      if (otherActiveClaims === 0) {
        await prisma.reservationRequest.update({
          where: { id: req.id },
          data: {
            status: 'EXPIRED',
            expiredAt: now,
            expirationReason: 'PICKUP_DATE_PASSED'
          }
        })
      }

      expiredCount++
      results.push({
        claimId: claim.id,
        requestId: req.id,
        hostName: claim.host.name
      })

      console.log(`[Expire Overdue Pickups] Expired claim ${claim.id} for host ${claim.host.name} — pickup was ${pickup.toISOString()}`)
    }

    await log.complete({ processed: expiredCount, details: { results } })

    return NextResponse.json({
      success: true,
      message: expiredCount > 0
        ? `Expired ${expiredCount} overdue pickup claims`
        : 'No overdue pickups to expire',
      processed: expiredCount,
      details: results
    })
  } catch (error: unknown) {
    console.error('[Expire Overdue Pickups] Error:', error)
    await log.fail(error instanceof Error ? error.message : 'Unknown error').catch(() => {})
    return NextResponse.json(
      { error: 'Failed to process overdue pickups', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
