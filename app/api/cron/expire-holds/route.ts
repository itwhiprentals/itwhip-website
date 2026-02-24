// app/api/cron/expire-holds/route.ts
// Auto-completes ON_HOLD bookings that are past their hold deadline AND past trip end date.
// These are treated as NO_SHOW — guest could not verify identity onboard.
// No refund is issued: cancellation policy applies (<12 hours = 100% penalty).

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'itwhip-cron-secret-2024'

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isPreview = request.nextUrl.searchParams.get('preview') === 'true'
    const { prisma } = await import('@/app/lib/database/prisma')
    const now = new Date()

    // Find ON_HOLD bookings where:
    // 1. holdDeadline has passed (guest didn't resolve in time)
    // 2. endDate has passed (the trip period is over — complete as no-show)
    const expiredHolds = await prisma.rentalBooking.findMany({
      where: {
        status: 'ON_HOLD',
        holdDeadline: { lt: now },
        endDate: { lt: now },
      },
      select: {
        id: true,
        bookingCode: true,
        holdDeadline: true,
        holdReason: true,
        startDate: true,
        endDate: true,
        paymentStatus: true,
        totalAmount: true,
        guestPhone: true,
        guestName: true,
        guestEmail: true,
        reviewerProfileId: true,
        hostId: true,
        car: {
          select: { year: true, make: true, model: true }
        },
        host: {
          select: { phone: true, name: true }
        },
      },
    })

    // Preview mode — return what would be affected without taking action
    if (isPreview) {
      return NextResponse.json({
        success: true,
        preview: true,
        found: expiredHolds.length,
        items: expiredHolds.map(b => ({
          bookingCode: b.bookingCode,
          guestName: b.guestName || 'Unknown',
          car: `${b.car?.year || ''} ${b.car?.make || ''} ${b.car?.model || ''}`.trim(),
          holdReason: b.holdReason || 'identity verification',
          holdDeadline: b.holdDeadline?.toISOString() || null,
          startDate: b.startDate.toISOString(),
          endDate: b.endDate.toISOString(),
          totalAmount: b.totalAmount,
          host: b.host?.name || 'Unknown',
          action: 'Mark as NO_SHOW (no refund)',
        })),
      })
    }

    if (expiredHolds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired holds found',
        processed: 0,
      })
    }

    const results: Array<{ bookingCode: string; status: string; error?: string }> = []

    for (const booking of expiredHolds) {
      try {
        // Mark as NO_SHOW — trip expired, guest could not verify identity
        // No refund: follows cancellation policy (past trip = <12 hours = 100% penalty)
        await prisma.rentalBooking.update({
          where: { id: booking.id },
          data: {
            status: 'NO_SHOW',
            tripStatus: 'COMPLETED',
            holdReason: null,
            heldAt: null,
            heldBy: null,
            holdDeadline: null,
            holdMessage: null,
            previousStatus: null,
            cancelledAt: now,
            cancellationReason: `Auto-completed as no-show: hold deadline passed (${booking.holdReason || 'identity verification required'}). No refund per cancellation policy.`,
          },
        })

        // Create audit log
        await prisma.auditLog.create({
          data: {
            id: crypto.randomUUID(),
            category: 'SECURITY',
            eventType: 'booking_no_show',
            severity: 'WARNING',
            action: 'auto_expire_hold',
            resource: 'booking',
            resourceId: booking.id,
            details: {
              bookingCode: booking.bookingCode,
              holdReason: booking.holdReason,
              holdDeadline: booking.holdDeadline?.toISOString(),
              startDate: booking.startDate.toISOString(),
              endDate: booking.endDate.toISOString(),
              paymentStatus: booking.paymentStatus,
              totalAmount: booking.totalAmount,
              message: 'ON_HOLD booking expired — marked as NO_SHOW. No refund issued per cancellation policy.',
            },
            ipAddress: '127.0.0.1',
            userAgent: 'System Cron',
            hash: '',
            previousHash: null,
          },
        })

        // Send SMS notifications (fire-and-forget)
        try {
          const { sendSms } = await import('@/app/lib/twilio/sms')

          // Notify guest
          if (booking.guestPhone) {
            const guestMsg = `ItWhip: Your booking ${booking.bookingCode} has been marked as a no-show. ` +
              `The identity verification deadline has passed and the trip period has ended. ` +
              `Per our cancellation policy, no refund will be issued. ` +
              `Questions? Call us at (855) 703-0806 or visit itwhip.com/support`
            await sendSms(booking.guestPhone, guestMsg, {
              type: 'BOOKING_CANCELLED',
              bookingId: booking.id,
              guestId: booking.reviewerProfileId || undefined,
            })
          }

          // Notify host
          if (booking.host?.phone) {
            const carName = `${booking.car?.year || ''} ${booking.car?.make || ''} ${booking.car?.model || ''}`.trim()
            const hostMsg = `ItWhip: Booking ${booking.bookingCode} for your ${carName} has been closed as a no-show. ` +
              `The guest could not complete identity verification. Your vehicle is now available for new bookings.`
            await sendSms(booking.host.phone, hostMsg, {
              type: 'BOOKING_CANCELLED',
              bookingId: booking.id,
              hostId: booking.hostId,
            })
          }
        } catch (smsError) {
          console.error(`[CRON] SMS notification failed for ${booking.bookingCode}:`, smsError)
        }

        console.log(`[CRON] Expired hold → NO_SHOW: ${booking.bookingCode} (deadline: ${booking.holdDeadline?.toISOString()})`)
        results.push({ bookingCode: booking.bookingCode, status: 'no_show' })
      } catch (error) {
        console.error(`[CRON] Failed to process expired hold ${booking.bookingCode}:`, error)
        results.push({
          bookingCode: booking.bookingCode,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error('[CRON] expire-holds failed:', error)
    return NextResponse.json(
      { error: 'Failed to process expired holds', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
