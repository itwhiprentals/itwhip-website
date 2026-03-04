// app/api/cron/noshow-detection/route.ts
// Detects no-shows: CONFIRMED bookings where trip never started past deadline
// Cash: pickup + 12h, Card: pickup + 24h
// Runs every 10 minutes via Vercel Cron

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { processNoShow } from '@/app/lib/bookings/no-show'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    let processedCount = 0
    let failedCount = 0
    const results: Array<{ bookingCode: string; status: string; error?: string }> = []

    // Find CONFIRMED bookings where trip hasn't started
    const confirmedBookings = await prisma.rentalBooking.findMany({
      where: {
        status: 'CONFIRMED',
        tripStatus: 'NOT_STARTED',
        tripStartedAt: null,
        noShowMarkedAt: null, // Not already marked
        startDate: { not: null }
      },
      select: {
        id: true,
        bookingCode: true,
        paymentType: true,
        startDate: true,
        startTime: true,
        noShowDeadline: true,
        host: { select: { id: true, name: true } }
      }
    })

    for (const booking of confirmedBookings) {
      if (!booking.startDate) continue

      // Calculate pickup datetime
      const pickup = new Date(booking.startDate)
      const [h, m] = (booking.startTime || '10:00').split(':').map(Number)
      pickup.setHours(h, m, 0, 0)

      // Use noShowDeadline if set, otherwise calculate
      let deadline: Date
      if (booking.noShowDeadline) {
        deadline = new Date(booking.noShowDeadline)
      } else {
        const isCash = booking.paymentType === 'CASH'
        const hoursAfter = isCash ? 12 : 24
        deadline = new Date(pickup.getTime() + hoursAfter * 60 * 60 * 1000)
      }

      // Only process if past deadline
      if (now < deadline) continue

      try {
        const result = await processNoShow(booking.id, 'SYSTEM')

        if (result.success) {
          processedCount++
          results.push({ bookingCode: booking.bookingCode, status: 'no_show' })
          console.log(`[No-Show Detection] Processed no-show for ${booking.bookingCode} (${booking.paymentType || 'unknown'}) — host: ${booking.host.name}`)
        } else {
          failedCount++
          results.push({ bookingCode: booking.bookingCode, status: 'failed', error: result.error })
          console.error(`[No-Show Detection] Failed for ${booking.bookingCode}: ${result.error}`)
        }
      } catch (err) {
        failedCount++
        const errMsg = err instanceof Error ? err.message : 'Unknown error'
        results.push({ bookingCode: booking.bookingCode, status: 'error', error: errMsg })
        console.error(`[No-Show Detection] Error processing ${booking.bookingCode}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      message: processedCount > 0
        ? `Processed ${processedCount} no-shows, ${failedCount} failed`
        : 'No no-shows detected',
      processed: processedCount,
      failed: failedCount,
      details: results
    })
  } catch (error: unknown) {
    console.error('[No-Show Detection] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process no-show detection', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
