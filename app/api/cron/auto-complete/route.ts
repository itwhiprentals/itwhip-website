// app/api/cron/auto-complete/route.ts
// Enforces endDate as a hard stop: no booking can remain active past its end date.
// - ACTIVE → COMPLETED (trip ended normally)
// - CONFIRMED → COMPLETED (trip period passed, never started)
// - ON_HOLD → NO_SHOW (couldn't verify, trip period over)
// - PENDING → CANCELLED (never approved, void payment auth)

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

    // Find all bookings past their endDate that are still in a non-terminal status
    const overdueBookings = await prisma.rentalBooking.findMany({
      where: {
        endDate: { lt: now },
        status: {
          in: ['PENDING', 'CONFIRMED', 'ON_HOLD', 'ACTIVE'],
        },
      },
      select: {
        id: true,
        bookingCode: true,
        status: true,
        tripStatus: true,
        startDate: true,
        endDate: true,
        totalAmount: true,
        paymentStatus: true,
        paymentIntentId: true,
        guestPhone: true,
        guestName: true,
        guestEmail: true,
        reviewerProfileId: true,
        hostId: true,
        holdReason: true,
        car: {
          select: { year: true, make: true, model: true },
        },
        host: {
          select: { phone: true, name: true },
        },
      },
      take: 100, // Batch limit to avoid serverless timeout
    })

    // Determine action per booking
    function getAction(status: string): { newStatus: string; tripStatus: string; label: string } {
      switch (status) {
        case 'ACTIVE':
          return { newStatus: 'COMPLETED', tripStatus: 'COMPLETED', label: 'Complete trip (ended)' }
        case 'CONFIRMED':
          return { newStatus: 'COMPLETED', tripStatus: 'COMPLETED', label: 'Complete (trip period passed, never started)' }
        case 'ON_HOLD':
          return { newStatus: 'NO_SHOW', tripStatus: 'COMPLETED', label: 'Mark as NO_SHOW (verification failed, trip over)' }
        case 'PENDING':
          return { newStatus: 'CANCELLED', tripStatus: 'COMPLETED', label: 'Cancel (never approved, trip period passed)' }
        default:
          return { newStatus: 'COMPLETED', tripStatus: 'COMPLETED', label: 'Complete (overdue)' }
      }
    }

    // Preview mode — show what would be affected
    if (isPreview) {
      return NextResponse.json({
        success: true,
        preview: true,
        found: overdueBookings.length,
        items: overdueBookings.map(b => {
          const action = getAction(b.status)
          return {
            bookingCode: b.bookingCode,
            guestName: b.guestName || 'Unknown',
            car: `${b.car?.year || ''} ${b.car?.make || ''} ${b.car?.model || ''}`.trim(),
            currentStatus: b.status,
            endDate: b.endDate.toISOString(),
            totalAmount: b.totalAmount,
            host: b.host?.name || 'Unknown',
            action: action.label,
          }
        }),
      })
    }

    if (overdueBookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No overdue bookings found',
        processed: 0,
      })
    }

    // Filter by selected booking codes if provided
    let toProcess = overdueBookings
    try {
      const body = await request.json().catch(() => null)
      if (body?.bookingCodes?.length) {
        const codes = new Set(body.bookingCodes as string[])
        toProcess = overdueBookings.filter(b => codes.has(b.bookingCode))
      }
    } catch { /* no body = process all */ }

    if (toProcess.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No overdue bookings found',
        processed: 0,
      })
    }

    const results: Array<{ bookingCode: string; previousStatus: string; newStatus: string; error?: string }> = []

    for (const booking of toProcess) {
      try {
        const action = getAction(booking.status)
        const carName = `${booking.car?.year || ''} ${booking.car?.make || ''} ${booking.car?.model || ''}`.trim()

        // Build update data based on status
        const updateData: Record<string, unknown> = {
          status: action.newStatus,
          tripStatus: action.tripStatus,
        }

        if (booking.status === 'PENDING') {
          // PENDING → CANCELLED: never approved
          updateData.cancelledBy = 'SYSTEM'
          updateData.cancelledAt = now
          updateData.cancellationReason = 'Trip period passed without fleet approval. Auto-cancelled by system.'
          updateData.fleetStatus = 'CANCELLED'
        } else if (booking.status === 'ON_HOLD') {
          // ON_HOLD → NO_SHOW: couldn't verify
          updateData.cancelledAt = now
          updateData.cancellationReason = `Trip period ended while on hold (${booking.holdReason || 'identity verification'}). Marked as no-show.`
          updateData.holdReason = null
          updateData.heldAt = null
          updateData.heldBy = null
          updateData.holdDeadline = null
          updateData.holdMessage = null
          updateData.previousStatus = null
        } else if (booking.status === 'ACTIVE' || booking.status === 'CONFIRMED') {
          // Normal completion
          updateData.tripEndedAt = booking.endDate // Trip contractually ended at endDate
        }

        await prisma.rentalBooking.update({
          where: { id: booking.id },
          data: updateData,
        })

        // For PENDING bookings: void payment authorization
        if (booking.status === 'PENDING' && booking.paymentIntentId && booking.paymentStatus === 'AUTHORIZED') {
          try {
            const { cancelAuthorization } = await import('@/app/lib/booking/services/payment-service')
            await cancelAuthorization({
              bookingId: booking.id,
              reason: 'Trip period passed without fleet approval',
            })
          } catch (payErr) {
            console.error(`[CRON] Failed to void payment for ${booking.bookingCode}:`, payErr)
          }
        }

        // Audit log
        await prisma.auditLog.create({
          data: {
            id: crypto.randomUUID(),
            category: 'SYSTEM',
            eventType: 'booking_auto_completed',
            severity: 'INFO',
            action: 'auto_complete_overdue',
            resource: 'booking',
            resourceId: booking.id,
            details: {
              bookingCode: booking.bookingCode,
              previousStatus: booking.status,
              newStatus: action.newStatus,
              endDate: booking.endDate.toISOString(),
              totalAmount: booking.totalAmount,
              message: `Booking auto-completed: ${booking.status} → ${action.newStatus}. Trip period ended ${booking.endDate.toISOString()}.`,
            },
            ipAddress: '127.0.0.1',
            userAgent: 'System Cron',
            hash: '',
            previousHash: null,
          },
        })

        // SMS notifications (fire-and-forget)
        try {
          const { sendSms } = await import('@/app/lib/twilio/sms')

          if (booking.guestPhone) {
            let guestMsg: string
            if (booking.status === 'PENDING') {
              guestMsg = `ItWhip: Your booking ${booking.bookingCode} for the ${carName} has been cancelled — the trip period passed before approval could be completed. ` +
                `Any payment hold has been released. Questions? Call (855) 703-0806 or visit itwhip.com/support`
            } else if (booking.status === 'ON_HOLD') {
              guestMsg = `ItWhip: Your booking ${booking.bookingCode} has been marked as a no-show. ` +
                `The trip period ended while identity verification was pending. Questions? Call (855) 703-0806 or visit itwhip.com/support`
            } else {
              guestMsg = `ItWhip: Your ${carName} rental (${booking.bookingCode}) has been completed. ` +
                `Trip period has ended. Questions? Visit itwhip.com/trip/${booking.bookingCode}`
            }
            await sendSms(booking.guestPhone, guestMsg, {
              type: 'BOOKING_AUTO_COMPLETED',
              bookingId: booking.id,
              guestId: booking.reviewerProfileId || undefined,
            })
          }

          if (booking.host?.phone) {
            const hostMsg = `ItWhip: Booking ${booking.bookingCode} for your ${carName} has been auto-completed. ` +
              `Previous status: ${booking.status}. Trip period ended ${booking.endDate.toLocaleDateString()}.`
            await sendSms(booking.host.phone, hostMsg, {
              type: 'BOOKING_AUTO_COMPLETED',
              bookingId: booking.id,
              hostId: booking.hostId,
            })
          }
        } catch (smsError) {
          console.error(`[CRON] SMS failed for ${booking.bookingCode}:`, smsError)
        }

        console.log(`[CRON] Auto-complete: ${booking.bookingCode} ${booking.status} → ${action.newStatus}`)
        results.push({ bookingCode: booking.bookingCode, previousStatus: booking.status, newStatus: action.newStatus })
      } catch (error) {
        console.error(`[CRON] Failed to auto-complete ${booking.bookingCode}:`, error)
        results.push({
          bookingCode: booking.bookingCode,
          previousStatus: booking.status,
          newStatus: 'error',
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
    console.error('[CRON] auto-complete failed:', error)
    return NextResponse.json(
      { error: 'Failed to auto-complete bookings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
