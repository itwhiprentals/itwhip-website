// app/api/cron/expire-claims/route.ts
// Cron job to expire claims that haven't had a car assigned within 30 minutes
// Can be triggered by Vercel cron or manually

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// Vercel cron configuration - runs every 5 minutes
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Optional: Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // If CRON_SECRET is set, verify it (allows manual calls in dev without secret)
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()

    // Find all claims that are PENDING_CAR and have expired
    const expiredClaims = await prisma.requestClaim.findMany({
      where: {
        status: 'PENDING_CAR',
        claimExpiresAt: {
          lt: now
        }
      },
      include: {
        request: true,
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // ===== PROSPECT ACCOUNT EXPIRY =====
    // Expire prospect hosts who haven't added a car within their deadline (3 days)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    let prospectExpiredCount = 0

    try {
      const staleProspects = await prisma.hostProspect.findMany({
        where: {
          status: 'CONVERTED',
          convertedHostId: { not: null },
          convertedAt: { lt: threeDaysAgo },
          // Skip if they still have time from a recent new-request
          OR: [
            { inviteTokenExp: null },
            { inviteTokenExp: { lt: now } }
          ]
        },
        select: {
          id: true,
          name: true,
          convertedHostId: true,
          convertedHost: {
            select: {
              id: true,
              name: true,
              _count: { select: { cars: true } }
            }
          }
        }
      })

      for (const prospect of staleProspects) {
        // Skip if host has added cars (truly converted)
        if (!prospect.convertedHost || (prospect.convertedHost._count?.cars || 0) > 0) {
          continue
        }

        try {
          // 1. Expire the prospect
          await prisma.hostProspect.update({
            where: { id: prospect.id },
            data: {
              status: 'EXPIRED',
              inviteToken: null,
              inviteTokenExp: null
            }
          })

          // 2. Deactivate the host account
          await prisma.rentalHost.update({
            where: { id: prospect.convertedHostId! },
            data: {
              active: false,
              dashboardAccess: false,
              suspendedAt: now,
              suspendedReason: 'Expired prospect - no car added within deadline'
            }
          })

          // 3. Expire any pending claims for this host
          await prisma.requestClaim.updateMany({
            where: {
              hostId: prospect.convertedHostId!,
              status: 'PENDING_CAR'
            },
            data: {
              status: 'EXPIRED',
              expiredAt: now
            }
          })

          prospectExpiredCount++
          console.log(`[Expire Claims Cron] Expired prospect account: ${prospect.name} (host ${prospect.convertedHostId})`)
        } catch (prospectError: any) {
          console.error(`[Expire Claims Cron] Error expiring prospect ${prospect.id}:`, prospectError)
        }
      }

      if (prospectExpiredCount > 0) {
        console.log(`[Expire Claims Cron] Expired ${prospectExpiredCount} stale prospect accounts`)
      }
    } catch (prospectErr: any) {
      console.error('[Expire Claims Cron] Error in prospect expiry:', prospectErr)
    }

    if (expiredClaims.length === 0) {
      return NextResponse.json({
        success: true,
        message: prospectExpiredCount > 0
          ? `No expired claims, but expired ${prospectExpiredCount} prospect accounts`
          : 'No expired claims to process',
        processed: 0,
        prospectExpired: prospectExpiredCount
      })
    }

    console.log(`[Expire Claims Cron] Found ${expiredClaims.length} expired claims to process`)

    const results = []

    for (const claim of expiredClaims) {
      try {
        // Update claim to EXPIRED
        await prisma.requestClaim.update({
          where: { id: claim.id },
          data: {
            status: 'EXPIRED',
            expiredAt: now
          }
        })

        // Check if request has any other active claims
        const otherActiveClaims = await prisma.requestClaim.count({
          where: {
            requestId: claim.requestId,
            id: { not: claim.id },
            status: { in: ['PENDING_CAR', 'CAR_SELECTED'] }
          }
        })

        // If no other active claims, set request back to OPEN
        if (otherActiveClaims === 0 && claim.request.status === 'CLAIMED') {
          await prisma.reservationRequest.update({
            where: { id: claim.requestId },
            data: { status: 'OPEN' }
          })
        }

        results.push({
          claimId: claim.id,
          requestId: claim.requestId,
          hostName: claim.host.name,
          success: true
        })

        console.log(`[Expire Claims Cron] Expired claim ${claim.id} for host ${claim.host.name}`)

        // TODO: Send notification to host that their claim expired
        // await sendClaimExpiredNotification(claim.host.email, claim.request)

      } catch (error: any) {
        console.error(`[Expire Claims Cron] Error processing claim ${claim.id}:`, error)
        results.push({
          claimId: claim.id,
          requestId: claim.requestId,
          hostName: claim.host.name,
          success: false,
          error: error.message
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Processed ${expiredClaims.length} expired claims, ${prospectExpiredCount} prospect accounts expired`,
      processed: successCount,
      failed: failCount,
      prospectExpired: prospectExpiredCount,
      details: results
    })

  } catch (error: any) {
    console.error('[Expire Claims Cron] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process expired claims', details: error.message },
      { status: 500 }
    )
  }
}

// Also expose POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request)
}
