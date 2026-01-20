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

    if (expiredClaims.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired claims to process',
        processed: 0
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
      message: `Processed ${expiredClaims.length} expired claims`,
      processed: successCount,
      failed: failCount,
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
