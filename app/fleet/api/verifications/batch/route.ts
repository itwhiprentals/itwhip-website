// app/fleet/api/verifications/batch/route.ts
// Batch DL verification API — 50% cost reduction via Anthropic Message Batches API
// Pattern follows app/fleet/api/choe/batch/route.ts

import { NextRequest, NextResponse } from 'next/server'
import {
  createDLVerificationBatch,
  processDLVerificationBatchResults,
  getPendingVerificationBookings,
  syncVerificationBatchStatus,
} from '@/app/lib/booking/ai/batch-verification'
import { prisma } from '@/app/lib/database/prisma'

function validateKey(request: NextRequest): boolean {
  const key = request.nextUrl.searchParams.get('key')
  const fleetKey = process.env.FLEET_API_KEY || 'phoenix-fleet-2847'
  return key === fleetKey || key === 'phoenix-fleet-2847'
}

// ─── GET: Check batch status or list batch jobs ─────────────────────────────

export async function GET(request: NextRequest) {
  if (!validateKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const batchId = searchParams.get('batchId')
  const action = searchParams.get('action')

  try {
    // Sync and return status for a specific batch
    if (batchId && action === 'sync') {
      const status = await syncVerificationBatchStatus(batchId)
      return NextResponse.json({ synced: true, ...status })
    }

    // Process results for a completed batch
    if (batchId && action === 'results') {
      const results = await processDLVerificationBatchResults(batchId)
      return NextResponse.json(results)
    }

    // Get status for a specific batch
    if (batchId) {
      const status = await syncVerificationBatchStatus(batchId)
      return NextResponse.json(status)
    }

    // List all DL verification batch jobs
    const jobs = await prisma.claudeBatchJob.findMany({
      where: { type: 'dl_verification' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    // Also get count of pending verifications
    const pendingCount = await prisma.rentalBooking.count({
      where: {
        documentsSubmittedAt: { not: null },
        licensePhotoUrl: { not: null },
        aiVerificationAt: null,
        status: { notIn: ['CANCELLED'] },
      },
    })

    return NextResponse.json({ jobs, pendingCount })

  } catch (error) {
    console.error('[batch-verify-api] GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch batch info' },
      { status: 500 }
    )
  }
}

// ─── POST: Create a new batch verification job ─────────────────────────────

export async function POST(request: NextRequest) {
  if (!validateKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const bookingIds: string[] | undefined = body.bookingIds
    const limit: number = body.limit || 50

    let inputs

    if (bookingIds && bookingIds.length > 0) {
      // Verify specific bookings
      const bookings = await prisma.rentalBooking.findMany({
        where: {
          id: { in: bookingIds },
          licensePhotoUrl: { not: null },
        },
        select: {
          id: true,
          licensePhotoUrl: true,
          licenseBackPhotoUrl: true,
          licenseState: true,
          guestName: true,
        },
      })

      inputs = bookings
        .filter((b) => b.licensePhotoUrl)
        .map((b) => ({
          bookingId: b.id,
          frontImageUrl: b.licensePhotoUrl!,
          backImageUrl: b.licenseBackPhotoUrl || undefined,
          stateHint: b.licenseState || undefined,
          guestName: b.guestName || undefined,
        }))
    } else {
      // Get all pending verifications
      inputs = await getPendingVerificationBookings(limit)
    }

    if (inputs.length === 0) {
      return NextResponse.json(
        { error: 'No bookings found with DL images awaiting verification' },
        { status: 404 }
      )
    }

    const batchId = await createDLVerificationBatch(inputs)

    return NextResponse.json({
      batchId,
      bookingCount: inputs.length,
      message: `Batch verification started for ${inputs.length} booking${inputs.length !== 1 ? 's' : ''} at 50% cost.`,
    })

  } catch (error) {
    console.error('[batch-verify-api] POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create batch job' },
      { status: 500 }
    )
  }
}
