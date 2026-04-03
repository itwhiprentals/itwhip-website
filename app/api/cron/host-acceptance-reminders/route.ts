// app/api/cron/host-acceptance-reminders/route.ts
// Sends reminders to hosts who haven't accepted requests, auto-expires after 3 days
// Runs every hour via EventBridge cron

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
  const log = await startCronLog('host-acceptance-reminders', triggeredBy)

  try {
    const now = new Date()
    let remindersCount = 0
    let expiredCount = 0

    // ═══ 1. Auto-expire requests 72h+ past creation with no claims ═══
    const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000)

    const staleRequests = await prisma.reservationRequest.findMany({
      where: {
        status: 'OPEN',
        createdAt: { lt: seventyTwoHoursAgo },
        expiresAt: null // Only auto-expire if no custom expiry set
      },
      select: { id: true, requestCode: true, guestName: true }
    })

    for (const req of staleRequests) {
      await prisma.reservationRequest.update({
        where: { id: req.id },
        data: {
          status: 'EXPIRED',
          expiredAt: now,
          expirationReason: 'HOST_DID_NOT_RESPOND'
        }
      })
      expiredCount++
      console.log(`[Host Acceptance] Auto-expired request ${req.requestCode} — no claims after 72h`)
    }

    // Also expire requests that have a custom expiresAt that has passed
    const expiredByDeadline = await prisma.reservationRequest.findMany({
      where: {
        status: 'OPEN',
        expiresAt: { lt: now }
      },
      select: { id: true, requestCode: true }
    })

    for (const req of expiredByDeadline) {
      await prisma.reservationRequest.update({
        where: { id: req.id },
        data: {
          status: 'EXPIRED',
          expiredAt: now,
          expirationReason: 'HOST_DID_NOT_RESPOND'
        }
      })
      expiredCount++
      console.log(`[Host Acceptance] Auto-expired request ${req.requestCode} — past expiresAt deadline`)
    }

    // ═══ 2. Expire prospect claims past their deadline ═══
    const expiredProspectClaims = await prisma.requestClaim.findMany({
      where: {
        status: 'PENDING_CAR',
        claimExpiresAt: { lt: now },
        // Only prospect claims (3-day window, not the 30-min ones)
        host: {
          convertedFromProspect: { status: 'CONVERTED' }
        }
      },
      include: {
        request: { select: { id: true, status: true, requestCode: true } },
        host: { select: { id: true, name: true } }
      }
    })

    for (const claim of expiredProspectClaims) {
      await prisma.requestClaim.update({
        where: { id: claim.id },
        data: { status: 'EXPIRED', expiredAt: now }
      })

      const otherActive = await prisma.requestClaim.count({
        where: {
          requestId: claim.request.id,
          id: { not: claim.id },
          status: { in: ['PENDING_CAR', 'CAR_SELECTED'] }
        }
      })

      if (otherActive === 0 && claim.request.status === 'CLAIMED') {
        await prisma.reservationRequest.update({
          where: { id: claim.request.id },
          data: {
            status: 'EXPIRED',
            expiredAt: now,
            expirationReason: 'HOST_DID_NOT_RESPOND'
          }
        })
      }

      expiredCount++
      console.log(`[Host Acceptance] Expired prospect claim for ${claim.host.name} on request ${claim.request.requestCode}`)
    }

    // ═══ 3. Send 24h warning to prospects approaching deadline ═══
    // Find claims expiring in 24-48h that haven't been reminded
    const twentyFourFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const fortyEightFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000)

    const approachingClaims = await prisma.requestClaim.findMany({
      where: {
        status: 'PENDING_CAR',
        claimExpiresAt: {
          gt: now,
          lt: fortyEightFromNow
        },
        host: {
          convertedFromProspect: { status: 'CONVERTED' }
        }
      },
      include: {
        host: { select: { id: true, name: true, email: true, phone: true } },
        request: { select: { id: true, requestCode: true, guestName: true } }
      }
    })

    for (const claim of approachingClaims) {
      // TODO: Send SMS/email reminder to host
      // For now, just log it
      const hoursLeft = claim.claimExpiresAt
        ? Math.round((claim.claimExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60))
        : 0
      if (hoursLeft <= 24) {
        remindersCount++
        console.log(`[Host Acceptance] Would send reminder to ${claim.host.name} (${claim.host.email}) — ${hoursLeft}h left for request ${claim.request.requestCode}`)
      }
    }

    await log.complete({ processed: expiredCount + remindersCount, details: { expired: expiredCount, reminders: remindersCount } })

    return NextResponse.json({
      success: true,
      message: `Expired ${expiredCount} requests/claims, sent ${remindersCount} reminders`,
      processed: expiredCount + remindersCount,
      expired: expiredCount,
      reminders: remindersCount
    })
  } catch (error: unknown) {
    console.error('[Host Acceptance Reminders] Error:', error)
    await log.fail(error instanceof Error ? error.message : 'Unknown error').catch(() => {})
    return NextResponse.json(
      { error: 'Failed to process acceptance reminders', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
