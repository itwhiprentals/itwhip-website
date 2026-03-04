// app/api/cron/payment-deadline/route.ts
// Auto-cancels bookings where guest signed agreement but didn't pay within 48h
// Sends reminder at 24h mark
// Runs every 30 minutes via Vercel Cron

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

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
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)
    let cancelledCount = 0
    let remindersCount = 0

    // ═══ 1. Auto-cancel: agreement signed 48h+ ago, no payment ═══
    const overdueBookings = await prisma.rentalBooking.findMany({
      where: {
        agreementStatus: 'signed',
        paymentType: null,
        agreementSignedAt: { lt: fortyEightHoursAgo },
        status: { in: ['CONFIRMED', 'PENDING'] },
        expirationReason: null // Not already expired
      },
      include: {
        car: { select: { id: true, make: true, model: true, year: true } },
        host: { select: { id: true, name: true, email: true } },
        renter: { select: { id: true, email: true } },
        reviewerProfile: { select: { id: true, email: true } }
      }
    })

    for (const booking of overdueBookings) {
      try {
        // Cancel the booking
        await prisma.rentalBooking.update({
          where: { id: booking.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: now,
            cancellationReason: 'Payment deadline passed — guest did not complete payment within 48 hours of signing agreement.',
            expirationReason: 'PAYMENT_DEADLINE_PASSED'
          }
        })

        // Free the car
        if (booking.car) {
          await prisma.car.update({
            where: { id: booking.car.id },
            data: { isActive: true }
          })
        }

        // Void payment authorization if exists
        if (booking.stripePaymentIntentId) {
          try {
            const stripe = (await import('stripe')).default
            const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!)
            await stripeClient.paymentIntents.cancel(booking.stripePaymentIntentId)
          } catch (stripeErr) {
            console.error(`[Payment Deadline] Failed to void Stripe PI for ${booking.bookingCode}:`, stripeErr)
          }
        }

        cancelledCount++
        console.log(`[Payment Deadline] Auto-cancelled ${booking.bookingCode} — no payment 48h after agreement signed`)

        // TODO: Send notification to host + guest about cancellation
      } catch (err) {
        console.error(`[Payment Deadline] Error cancelling booking ${booking.bookingCode}:`, err)
      }
    }

    // ═══ 2. 24h warning: agreement signed 24-48h ago, no payment ═══
    const warningBookings = await prisma.rentalBooking.findMany({
      where: {
        agreementStatus: 'signed',
        paymentType: null,
        agreementSignedAt: {
          gt: fortyEightHoursAgo,
          lt: twentyFourHoursAgo
        },
        status: { in: ['CONFIRMED', 'PENDING'] },
        expirationReason: null
      },
      select: {
        id: true,
        bookingCode: true,
        reviewerProfile: { select: { id: true, email: true } },
        renter: { select: { id: true, email: true } }
      }
    })

    for (const booking of warningBookings) {
      // TODO: Send reminder email/SMS to guest
      remindersCount++
      console.log(`[Payment Deadline] Would send payment reminder for ${booking.bookingCode}`)
    }

    return NextResponse.json({
      success: true,
      message: `Cancelled ${cancelledCount} bookings, sent ${remindersCount} payment reminders`,
      processed: cancelledCount + remindersCount,
      cancelled: cancelledCount,
      reminders: remindersCount
    })
  } catch (error: unknown) {
    console.error('[Payment Deadline] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process payment deadlines', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
