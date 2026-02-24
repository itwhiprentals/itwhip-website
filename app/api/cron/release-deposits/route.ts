// app/api/cron/release-deposits/route.ts
// Automated security deposit release cron job
// Finds COMPLETED bookings past the grace period with no open claims,
// and releases deposits via Stripe partial refund + deposit wallet return.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { releaseSecurityDeposit } from '@/app/lib/booking/services/payment-service'
import { sendDepositReleasedEmail } from '@/app/lib/email/deposit-release-email'
import { ClaimStatus } from '@prisma/client'

const OPEN_CLAIM_STATUSES: ClaimStatus[] = [
  'PENDING',
  'UNDER_REVIEW',
  'GUEST_RESPONSE_PENDING',
  'VEHICLE_REPAIR_PENDING',
  'INSURANCE_PROCESSING',
]

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedAuth) {
      console.error('[Deposit Release] Unauthorized cron attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Deposit Release] Starting automated deposit release processing...')

    // Fetch platform settings for grace period
    const settings = await prisma.platformSettings.findUnique({
      where: { id: 'global' },
      select: {
        depositAutoReleaseDays: true,
        depositAutoReleaseEnabled: true,
      },
    })

    if (!settings?.depositAutoReleaseEnabled) {
      console.log('[Deposit Release] Auto-release is disabled in platform settings')
      return NextResponse.json({
        success: true,
        message: 'Deposit auto-release is disabled',
        processed: 0,
      })
    }

    const graceDays = settings.depositAutoReleaseDays ?? 3
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - graceDays)

    // Find eligible bookings:
    // - Status is COMPLETED
    // - Trip ended before the cutoff date
    // - Has a deposit amount > 0
    // - Deposit has NOT already been refunded
    // - Has a paymentIntentId (needed for Stripe refund)
    const eligibleBookings = await prisma.rentalBooking.findMany({
      where: {
        status: 'COMPLETED',
        depositAmount: { gt: 0 },
        depositRefundedAt: null,
        paymentIntentId: { not: null },
        OR: [
          // Legacy: old bookings without review system (null status, past cutoff)
          {
            hostFinalReviewStatus: null,
            tripEndedAt: { not: null, lte: cutoffDate },
          },
          // Host already approved — release deposit
          {
            hostFinalReviewStatus: 'APPROVED',
          },
          // 24h deadline passed, host never acted — auto-approve
          {
            hostFinalReviewStatus: 'PENDING_REVIEW',
            hostFinalReviewDeadline: { not: null, lte: new Date() },
          },
        ],
      },
      select: {
        id: true,
        bookingCode: true,
        guestEmail: true,
        guestName: true,
        depositAmount: true,
        depositFromWallet: true,
        depositFromCard: true,
        depositUsedForClaim: true,
        paymentIntentId: true,
        tripEndedAt: true,
        renterId: true,
        hostFinalReviewStatus: true,
        hostFinalReviewDeadline: true,
        guestPhone: true,
        reviewerProfileId: true,
        hostId: true,
        car: {
          select: {
            year: true,
            make: true,
            model: true,
          },
        },
      },
      take: 50, // Process in batches to avoid timeout
    })

    console.log(`[Deposit Release] Found ${eligibleBookings.length} bookings eligible for deposit release`)

    // Preview mode — return what would be affected without taking action
    const isPreview = request.nextUrl.searchParams.get('preview') === 'true'
    if (isPreview) {
      return NextResponse.json({
        success: true,
        preview: true,
        found: eligibleBookings.length,
        items: eligibleBookings.map(b => {
          const claimDeduction = b.depositUsedForClaim || 0
          const net = b.depositAmount - claimDeduction
          return {
            bookingCode: b.bookingCode,
            guestName: b.guestName || 'Unknown',
            car: `${b.car?.make || ''} ${b.car?.model || ''}`.trim(),
            depositAmount: b.depositAmount,
            depositFromCard: b.depositFromCard || 0,
            depositFromWallet: b.depositFromWallet || 0,
            claimDeduction,
            netRelease: net > 0 ? net : 0,
            tripEndedAt: b.tripEndedAt?.toISOString() || null,
            reviewStatus: b.hostFinalReviewStatus || 'none',
            action: net > 0 ? `Release $${net.toFixed(2)} deposit` : 'Deposit fully used for claims',
          }
        }),
      })
    }

    // Filter by selected booking codes if provided
    let toProcess = eligibleBookings
    try {
      const body = await request.json().catch(() => null)
      if (body?.bookingCodes?.length) {
        const codes = new Set(body.bookingCodes as string[])
        toProcess = eligibleBookings.filter(b => codes.has(b.bookingCode))
      }
    } catch { /* no body = process all */ }

    let released = 0
    let skipped = 0
    let failed = 0
    const results: Array<{
      bookingCode: string
      status: 'released' | 'skipped' | 'failed'
      reason?: string
      amount?: number
    }> = []

    for (const booking of toProcess) {
      try {
        // Skip if host filed a claim — deposit held pending claim resolution
        if (booking.hostFinalReviewStatus === 'CLAIM_FILED') {
          skipped++
          results.push({
            bookingCode: booking.bookingCode,
            status: 'skipped',
            reason: 'Host filed claim — deposit held',
          })
          continue
        }

        // Auto-approve if host review deadline passed without action
        if (booking.hostFinalReviewStatus === 'PENDING_REVIEW') {
          await prisma.rentalBooking.update({
            where: { id: booking.id },
            data: {
              hostFinalReviewStatus: 'AUTO_APPROVED',
              hostFinalReviewAt: new Date(),
            },
          })
          console.log(`[Deposit Release] Auto-approved review for ${booking.bookingCode} (24h deadline passed)`)
        }

        // Check for open claims on this booking
        const openClaims = await prisma.claim.count({
          where: {
            bookingId: booking.id,
            status: { in: OPEN_CLAIM_STATUSES },
          },
        })

        if (openClaims > 0) {
          console.log(`[Deposit Release] Skipping ${booking.bookingCode}: ${openClaims} open claim(s)`)
          skipped++
          results.push({
            bookingCode: booking.bookingCode,
            status: 'skipped',
            reason: `${openClaims} open claim(s)`,
          })
          continue
        }

        // Check for open trip issues
        const openIssues = await prisma.tripIssue.count({
          where: {
            bookingId: booking.id,
            status: { in: ['OPEN', 'INVESTIGATING', 'PENDING_RESOLUTION'] },
          },
        })

        if (openIssues > 0) {
          console.log(`[Deposit Release] Skipping ${booking.bookingCode}: ${openIssues} open trip issue(s)`)
          skipped++
          results.push({
            bookingCode: booking.bookingCode,
            status: 'skipped',
            reason: `${openIssues} open trip issue(s)`,
          })
          continue
        }

        // Calculate net deposit to release (minus any claim deductions)
        const claimDeduction = booking.depositUsedForClaim || 0
        const totalDeposit = booking.depositAmount
        const netDeposit = totalDeposit - claimDeduction

        if (netDeposit <= 0) {
          console.log(`[Deposit Release] Skipping ${booking.bookingCode}: deposit fully used for claims ($${claimDeduction})`)
          skipped++
          results.push({
            bookingCode: booking.bookingCode,
            status: 'skipped',
            reason: `Deposit fully used for claims ($${claimDeduction})`,
          })
          continue
        }

        // Determine how much was from card vs wallet
        const walletPortion = Math.min(booking.depositFromWallet || 0, netDeposit)
        const cardPortion = netDeposit - walletPortion

        // Release card portion via Stripe refund
        if (cardPortion > 0 && booking.paymentIntentId) {
          const cardCents = Math.round(cardPortion * 100)
          const refundResult = await releaseSecurityDeposit({
            bookingId: booking.id,
            depositAmount: cardCents,
          })

          if (!refundResult.success) {
            console.error(`[Deposit Release] Stripe refund failed for ${booking.bookingCode}: ${refundResult.error}`)
            failed++
            results.push({
              bookingCode: booking.bookingCode,
              status: 'failed',
              reason: refundResult.error,
            })
            continue
          }
        }

        // Return wallet portion to guest's deposit wallet
        if (walletPortion > 0) {
          // Find guest profile by email (deposit wallet is on ReviewerProfile)
          const guestProfile = await prisma.reviewerProfile.findFirst({
            where: { email: booking.guestEmail!.toLowerCase() },
            select: { id: true, depositWalletBalance: true },
          })

          if (guestProfile) {
            await prisma.$transaction([
              prisma.reviewerProfile.update({
                where: { id: guestProfile.id },
                data: {
                  depositWalletBalance: {
                    increment: walletPortion,
                  },
                },
              }),
              prisma.depositTransaction.create({
                data: {
                  id: crypto.randomUUID(),
                  guestId: guestProfile.id,
                  type: 'RELEASE',
                  amount: walletPortion,
                  balanceAfter: (guestProfile.depositWalletBalance || 0) + walletPortion,
                  bookingId: booking.id,
                  description: `Deposit released for booking ${booking.bookingCode}`,
                },
              }),
            ])
          }
        }

        // If card portion was $0 but wallet was returned, still mark as refunded
        if (cardPortion <= 0 && walletPortion > 0) {
          await prisma.rentalBooking.update({
            where: { id: booking.id },
            data: {
              depositRefunded: netDeposit,
              depositRefundedAt: new Date(),
            },
          })
        }

        console.log(
          `[Deposit Release] Released $${netDeposit.toFixed(2)} for ${booking.bookingCode} ` +
          `(card: $${cardPortion.toFixed(2)}, wallet: $${walletPortion.toFixed(2)})`
        )

        // Send deposit release notification email
        sendDepositReleasedEmail({
          guestEmail: booking.guestEmail || '',
          guestName: booking.guestName || '',
          bookingCode: booking.bookingCode,
          carMake: booking.car?.make || 'Vehicle',
          carModel: booking.car?.model || '',
          depositAmount: netDeposit,
          cardRefundAmount: cardPortion,
          walletReturnAmount: walletPortion,
          tripEndDate: booking.tripEndedAt!,
        }).catch(() => {}) // Fire-and-forget, errors logged inside

        // SMS + bell for deposit released (fire-and-forget)
        if (booking.guestPhone && booking.reviewerProfileId) {
          import('@/app/lib/notifications/deposit-notifications').then(({ sendDepositReleasedNotifications }) => {
            sendDepositReleasedNotifications({
              bookingId: booking.id,
              bookingCode: booking.bookingCode,
              guestPhone: booking.guestPhone!,
              guestId: booking.reviewerProfileId!,
              userId: booking.renterId || '',
              hostId: booking.hostId || '',
              car: { year: booking.car?.year || 0, make: booking.car?.make || '', model: booking.car?.model || '' },
              depositAmount: netDeposit,
            }).catch(e => console.error(`[Deposit Release] Notification failed for ${booking.bookingCode}:`, e))
          }).catch(e => console.error('[Deposit Release] deposit-notifications import failed:', e))
        }

        released++
        results.push({
          bookingCode: booking.bookingCode,
          status: 'released',
          amount: netDeposit,
        })

      } catch (bookingError) {
        console.error(`[Deposit Release] Error processing ${booking.bookingCode}:`, bookingError)
        failed++
        results.push({
          bookingCode: booking.bookingCode,
          status: 'failed',
          reason: bookingError instanceof Error ? bookingError.message : 'Unknown error',
        })
      }
    }

    const duration = Date.now() - startTime

    console.log(
      `[Deposit Release] Complete: ${released} released, ${skipped} skipped, ${failed} failed ` +
      `(${duration}ms)`
    )

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      graceDays,
      cutoffDate: cutoffDate.toISOString(),
      summary: {
        eligible: eligibleBookings.length,
        released,
        skipped,
        failed,
      },
      results,
      durationMs: duration,
    })

  } catch (error) {
    console.error('[Deposit Release] Cron job failed:', error)
    return NextResponse.json(
      {
        error: 'Deposit release cron failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET endpoint for Vercel Cron (Vercel crons use GET)
export async function GET(request: NextRequest) {
  // Verify cron secret via header (Vercel sets this automatically)
  const authHeader = request.headers.get('authorization')
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Forward to POST handler
  return POST(request)
}
