// app/api/cron/noshow-detection/route.ts
// Detects no-shows: CONFIRMED bookings where trip never started past deadline
// All booking types: pickup + 2h (matches Turo US standard)
// Runs every 10 minutes via Vercel Cron

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { processNoShow } from '@/app/lib/bookings/no-show'
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
  const log = await startCronLog('noshow-detection', triggeredBy)

  try {
    const now = new Date()
    let processedCount = 0
    let failedCount = 0
    const results: Array<{ bookingCode: string; status: string; error?: string }> = []

    // Find CONFIRMED bookings where trip hasn't started
    // Exclude MANUAL bookings — host manages those directly
    const confirmedBookings = await prisma.rentalBooking.findMany({
      where: {
        status: 'CONFIRMED',
        tripStatus: 'NOT_STARTED',
        tripStartedAt: null,
        noShowMarkedAt: null, // Not already marked
        bookingType: { not: 'MANUAL' },
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

      // Calculate pickup datetime (handles both "10:00" and "10:00 AM" formats)
      const pickup = new Date(booking.startDate)
      const timeStr = (booking.startTime || '10:00').trim()
      const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
      let h = timeMatch ? parseInt(timeMatch[1], 10) : 10
      let m = timeMatch ? parseInt(timeMatch[2], 10) : 0
      const ampm = timeMatch?.[3]?.toUpperCase()
      if (ampm === 'PM' && h < 12) h += 12
      if (ampm === 'AM' && h === 12) h = 0
      pickup.setHours(h, m, 0, 0)

      console.log(`[No-Show Detection] Evaluating ${booking.bookingCode}: pickup=${pickup.toISOString()} now=${now.toISOString()} startTime="${booking.startTime}"`)


      // Use noShowDeadline if set, otherwise calculate: 24h after pickup (all payment types)
      let deadline: Date
      if (booking.noShowDeadline) {
        deadline = new Date(booking.noShowDeadline)
      } else {
        deadline = new Date(pickup.getTime() + 24 * 60 * 60 * 1000)
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

    await log.complete({ processed: processedCount, failed: failedCount, details: { results } })

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
    await log.fail(error instanceof Error ? error.message : 'Unknown error').catch(() => {})
    return NextResponse.json(
      { error: 'Failed to process no-show detection', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
