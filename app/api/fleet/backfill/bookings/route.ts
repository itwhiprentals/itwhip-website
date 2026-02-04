// app/api/fleet/backfill/bookings/route.ts
// Backfill API - Recalculate booking financials with correct platform standards

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { BookingBackfillService } from '@/app/lib/services/backfill/bookingBackfill'

export async function POST(request: NextRequest) {
  try {
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      dryRun = true,
      includePayouts = false,  // NEW: Create payout records for completed bookings
      startDate,
      endDate,
      batchSize = 100,
      hostId
    } = body

    const backfillService = new BookingBackfillService(prisma)

    const options = {
      dryRun,
      includePayouts,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      batchSize: Math.min(batchSize, 500), // Max 500 per batch
      hostId
    }

    // Run booking financials backfill
    const bookingSummary = await backfillService.backfillBookings(options)

    // If includePayouts is true, also create payout records
    let payoutSummary = null
    if (includePayouts) {
      payoutSummary = await backfillService.backfillPayouts(options)
    }

    return NextResponse.json({
      success: true,
      dryRun,
      includePayouts,
      summary: {
        // Booking financials summary
        bookings: {
          processed: bookingSummary.processed,
          updated: bookingSummary.updated,
          skipped: bookingSummary.skipped,
          errors: bookingSummary.errors,
          financials: {
            totalPlatformRevenue: bookingSummary.totalPlatformRevenue,
            totalHostPayouts: bookingSummary.totalHostPayouts,
            totalTaxesCollected: bookingSummary.totalTaxesCollected
          }
        },
        // Payout backfill summary (only if includePayouts is true)
        payouts: payoutSummary ? {
          payoutsCreated: payoutSummary.payoutsCreated,
          payoutsSkipped: payoutSummary.payoutsSkipped,
          payoutErrors: payoutSummary.payoutErrors,
          hostsUpdated: payoutSummary.hostsUpdated,
          totals: {
            grossEarnings: payoutSummary.totalGrossEarnings,
            platformFees: payoutSummary.totalPlatformFees,
            processingFees: payoutSummary.totalProcessingFees,
            netPayouts: payoutSummary.totalNetPayouts
          }
        } : undefined
      },
      // Only include detailed results for dry runs or small batches
      results: dryRun || bookingSummary.processed <= 50 ? bookingSummary.results : undefined,
      payoutResults: dryRun && payoutSummary ? payoutSummary.payoutResults.slice(0, 20) : undefined,
      message: dryRun
        ? `Dry run complete. ${bookingSummary.updated} bookings would be updated.${includePayouts ? ` ${payoutSummary?.payoutsCreated || 0} payouts would be created.` : ''}`
        : `Backfill complete. ${bookingSummary.updated} bookings updated.${includePayouts ? ` ${payoutSummary?.payoutsCreated || 0} payouts created, ${payoutSummary?.hostsUpdated || 0} hosts updated.` : ''}`
    })

  } catch (error: any) {
    console.error('Error running booking backfill:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to run backfill' },
      { status: 500 }
    )
  }
}

// GET - Preview what would change
export async function GET(request: NextRequest) {
  try {
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const hostId = searchParams.get('hostId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const backfillService = new BookingBackfillService(prisma)

    const preview = await backfillService.getBackfillPreview({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      batchSize: Math.min(limit, 50),
      hostId: hostId || undefined
    })

    return NextResponse.json({
      success: true,
      preview: {
        totalBookings: preview.totalBookings,
        estimatedChanges: preview.estimatedChanges,
        sampleChanges: preview.sampleChanges
      }
    })

  } catch (error: any) {
    console.error('Error getting backfill preview:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get preview' },
      { status: 500 }
    )
  }
}

// PATCH - Sync host totals from existing payout records
export async function PATCH(request: NextRequest) {
  try {
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { dryRun = true } = body

    const backfillService = new BookingBackfillService(prisma)
    const result = await backfillService.syncHostTotalsFromPayouts(dryRun)

    return NextResponse.json({
      success: true,
      dryRun,
      summary: {
        hostsUpdated: result.hostsUpdated,
        totalPayoutsSum: result.totalPayoutsSum,
        totalPayoutsCount: result.totalPayoutsCount
      },
      details: dryRun ? result.details : result.details.slice(0, 10),
      message: dryRun
        ? `Dry run complete. ${result.hostsUpdated} hosts would be updated with $${result.totalPayoutsSum.toFixed(2)} total payouts.`
        : `Sync complete. ${result.hostsUpdated} hosts updated with $${result.totalPayoutsSum.toFixed(2)} total payouts.`
    })

  } catch (error: any) {
    console.error('Error syncing host totals:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync host totals' },
      { status: 500 }
    )
  }
}

// PUT - Recalculate all host payouts based on actual booking data
export async function PUT(request: NextRequest) {
  try {
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { dryRun = true } = body

    const backfillService = new BookingBackfillService(prisma)
    const result = await backfillService.recalculateHostPayouts(dryRun)

    return NextResponse.json({
      success: true,
      dryRun,
      summary: {
        hostsUpdated: result.hostsUpdated,
        payoutsUpdated: result.payoutsUpdated,
        totalGrossEarnings: result.totalGrossEarnings,
        totalPlatformFees: result.totalPlatformFees,
        totalProcessingFees: result.totalProcessingFees,
        totalNetPayouts: result.totalNetPayouts,
        previousTotalPayouts: result.previousTotalPayouts,
        difference: result.totalNetPayouts - result.previousTotalPayouts
      },
      details: result.details.slice(0, 20),
      message: dryRun
        ? `Dry run complete. ${result.hostsUpdated} hosts would be updated. Net payouts: $${result.totalNetPayouts.toFixed(2)} (was $${result.previousTotalPayouts.toFixed(2)}, diff: +$${(result.totalNetPayouts - result.previousTotalPayouts).toFixed(2)})`
        : `Recalculation complete. ${result.hostsUpdated} hosts updated, ${result.payoutsUpdated} payouts fixed. Total payouts: $${result.totalNetPayouts.toFixed(2)}`
    })

  } catch (error: any) {
    console.error('Error recalculating host payouts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to recalculate host payouts' },
      { status: 500 }
    )
  }
}
