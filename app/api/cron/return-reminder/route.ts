// app/api/cron/return-reminder/route.ts
// Sends return reminders to guests with ACTIVE bookings ending in ~24h or ~3h
// Dedup: uses returnReminder24hSent and returnReminder3hSent flags

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

    // 24h window: ending between 20h and 28h from now
    const window24hStart = new Date(now.getTime() + 20 * 60 * 60 * 1000)
    const window24hEnd = new Date(now.getTime() + 28 * 60 * 60 * 1000)

    // 3h window: ending between 2h and 4h from now
    const window3hStart = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    const window3hEnd = new Date(now.getTime() + 4 * 60 * 60 * 1000)

    const selectFields = {
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
    } as const

    // Fetch 24h reminders
    const bookings24h = await prisma.rentalBooking.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { gte: window24hStart, lte: window24hEnd },
        returnReminder24hSent: false,
      },
      select: selectFields,
      take: 50,
    })

    // Fetch 3h reminders
    const bookings3h = await prisma.rentalBooking.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { gte: window3hStart, lte: window3hEnd },
        returnReminder3hSent: false,
      },
      select: selectFields,
      take: 50,
    })

    const isPreview = request.nextUrl.searchParams.get('preview') === 'true'
    if (isPreview) {
      const items24h = bookings24h.map(b => ({
        bookingCode: b.bookingCode,
        guestName: b.guestName || 'Unknown',
        car: `${b.car?.year || ''} ${b.car?.make || ''} ${b.car?.model || ''}`.trim(),
        endDate: b.endDate.toISOString(),
        action: 'Send 24h return reminder',
      }))
      const items3h = bookings3h.map(b => ({
        bookingCode: b.bookingCode,
        guestName: b.guestName || 'Unknown',
        car: `${b.car?.year || ''} ${b.car?.make || ''} ${b.car?.model || ''}`.trim(),
        endDate: b.endDate.toISOString(),
        action: 'Send 3h return reminder',
      }))
      return NextResponse.json({
        success: true,
        preview: true,
        found24h: bookings24h.length,
        found3h: bookings3h.length,
        items24h,
        items3h,
        items: [...items24h, ...items3h], // Combined for UI preview panel
      })
    }

    // Filter by selected booking codes if provided
    let toProcess24h = bookings24h
    let toProcess3h = bookings3h
    try {
      const body = await request.json().catch(() => null)
      if (body?.bookingCodes?.length) {
        const codes = new Set(body.bookingCodes as string[])
        toProcess24h = bookings24h.filter(b => codes.has(b.bookingCode))
        toProcess3h = bookings3h.filter(b => codes.has(b.bookingCode))
      }
    } catch { /* no body = process all */ }

    if (toProcess24h.length === 0 && toProcess3h.length === 0) {
      return NextResponse.json({ success: true, message: 'No bookings need return reminders', processed: 0 })
    }

    const { sendReturnReminderNotifications } = await import('@/app/lib/notifications/reminder-notifications')

    const results: Array<{ bookingCode: string; type: string; status: string; error?: string }> = []

    // Process 24h reminders
    for (const booking of toProcess24h) {
      try {
        await sendReturnReminderNotifications({
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
          hoursUntilReturn: 24,
        })

        await prisma.rentalBooking.update({
          where: { id: booking.id },
          data: { returnReminder24hSent: true },
        })

        results.push({ bookingCode: booking.bookingCode, type: '24h', status: 'sent' })
        console.log(`[CRON] 24h return reminder sent for ${booking.bookingCode}`)
      } catch (error) {
        console.error(`[CRON] 24h return reminder failed for ${booking.bookingCode}:`, error)
        results.push({
          bookingCode: booking.bookingCode,
          type: '24h',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Process 3h reminders
    for (const booking of toProcess3h) {
      try {
        await sendReturnReminderNotifications({
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
          hoursUntilReturn: 3,
        })

        await prisma.rentalBooking.update({
          where: { id: booking.id },
          data: { returnReminder3hSent: true },
        })

        results.push({ bookingCode: booking.bookingCode, type: '3h', status: 'sent' })
        console.log(`[CRON] 3h return reminder sent for ${booking.bookingCode}`)
      } catch (error) {
        console.error(`[CRON] 3h return reminder failed for ${booking.bookingCode}:`, error)
        results.push({
          bookingCode: booking.bookingCode,
          type: '3h',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({ success: true, processed: results.length, results })
  } catch (error) {
    console.error('[CRON] return-reminder failed:', error)
    return NextResponse.json(
      { error: 'Failed to process return reminders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
