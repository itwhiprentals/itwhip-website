// app/api/cron/pickup-reminder/route.ts
// Sends pickup reminder to guests with CONFIRMED bookings starting in ~24h
// Dedup: uses pickupReminderSent flag on RentalBooking

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'itwhip-cron-secret-2024'

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prisma } = await import('@/app/lib/database/prisma')
    const now = new Date()

    // Window: bookings starting between 20h and 28h from now
    const windowStart = new Date(now.getTime() + 20 * 60 * 60 * 1000)
    const windowEnd = new Date(now.getTime() + 28 * 60 * 60 * 1000)

    const bookings = await prisma.rentalBooking.findMany({
      where: {
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        startDate: { gte: windowStart, lte: windowEnd },
        pickupReminderSent: false,
      },
      select: {
        id: true,
        bookingCode: true,
        guestPhone: true,
        guestEmail: true,
        guestName: true,
        reviewerProfileId: true,
        renterId: true,
        hostId: true,
        startDate: true,
        startTime: true,
        endDate: true,
        endTime: true,
        pickupLocation: true,
        car: { select: { year: true, make: true, model: true } },
        host: { select: { name: true } },
      },
      take: 50,
    })

    const isPreview = request.nextUrl.searchParams.get('preview') === 'true'
    if (isPreview) {
      return NextResponse.json({
        success: true,
        preview: true,
        found: bookings.length,
        items: bookings.map(b => ({
          bookingCode: b.bookingCode,
          guestName: b.guestName || 'Unknown',
          car: `${b.car?.year || ''} ${b.car?.make || ''} ${b.car?.model || ''}`.trim(),
          startDate: b.startDate.toISOString(),
          startTime: b.startTime,
          host: b.host?.name || 'Unknown',
          action: 'Send pickup reminder (SMS + email + bell)',
        })),
      })
    }

    // Filter by selected booking codes if provided
    let toProcess = bookings
    try {
      const body = await request.json().catch(() => null)
      if (body?.bookingCodes?.length) {
        const codes = new Set(body.bookingCodes as string[])
        toProcess = bookings.filter(b => codes.has(b.bookingCode))
      }
    } catch { /* no body = process all */ }

    if (toProcess.length === 0) {
      return NextResponse.json({ success: true, message: 'No bookings need pickup reminders', processed: 0 })
    }

    const { sendPickupReminderNotifications } = await import('@/app/lib/notifications/reminder-notifications')

    const results: Array<{ bookingCode: string; status: string; error?: string }> = []

    for (const booking of toProcess) {
      try {
        await sendPickupReminderNotifications({
          bookingId: booking.id,
          bookingCode: booking.bookingCode,
          guestPhone: booking.guestPhone,
          guestEmail: booking.guestEmail || '',
          guestName: booking.guestName || 'Guest',
          guestId: booking.reviewerProfileId,
          userId: booking.renterId,
          hostId: booking.hostId,
          hostName: booking.host?.name || 'Host',
          car: { year: booking.car?.year || 0, make: booking.car?.make || '', model: booking.car?.model || '' },
          startDate: booking.startDate,
          startTime: booking.startTime,
          endDate: booking.endDate,
          endTime: booking.endTime,
          pickupLocation: booking.pickupLocation,
        })

        // Mark as sent
        await prisma.rentalBooking.update({
          where: { id: booking.id },
          data: { pickupReminderSent: true },
        })

        results.push({ bookingCode: booking.bookingCode, status: 'sent' })
        console.log(`[CRON] Pickup reminder sent for ${booking.bookingCode}`)
      } catch (error) {
        console.error(`[CRON] Pickup reminder failed for ${booking.bookingCode}:`, error)
        results.push({
          bookingCode: booking.bookingCode,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({ success: true, processed: results.length, results })
  } catch (error) {
    console.error('[CRON] pickup-reminder failed:', error)
    return NextResponse.json(
      { error: 'Failed to process pickup reminders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
