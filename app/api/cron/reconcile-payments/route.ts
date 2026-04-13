// app/api/cron/reconcile-payments/route.ts
// Belt-and-suspenders: catches orphaned payments that the webhook missed.
// Runs every 10 minutes via EventBridge → Lambda.
// Queries Stripe for recent PIs, checks if a booking exists, auto-creates or refunds.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { startCronLog } from '@/app/lib/cron/logger'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil' as any
})

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cronLog = await startCronLog('reconcile-payments')
  let reconciled = 0
  let orphans = 0
  let autoCreated = 0
  let refunded = 0
  const details: any[] = []

  try {
    // List PIs from last 60 minutes with our booking metadata
    const sixtyMinAgo = Math.floor((Date.now() - 60 * 60 * 1000) / 1000)
    const fiveMinAgo = Math.floor((Date.now() - 5 * 60 * 1000) / 1000)

    const paymentIntents = await stripe.paymentIntents.list({
      created: { gte: sixtyMinAgo },
      limit: 50,
    })

    for (const pi of paymentIntents.data) {
      // Only check PIs that look like booking payments
      if (!pi.metadata?.carId) continue
      if (!['requires_capture', 'succeeded'].includes(pi.status)) continue

      // Skip PIs less than 5 min old — booking flow may still be running
      if (pi.created > fiveMinAgo) continue

      reconciled++

      // Check if a booking exists
      const booking = await prisma.rentalBooking.findFirst({
        where: { paymentIntentId: pi.id },
        select: { id: true, bookingCode: true },
      })

      if (booking) continue // Happy path

      // ORPHAN DETECTED
      orphans++
      const amount = (pi.amount / 100).toFixed(2)
      const guestEmail = pi.metadata?.guestEmail || pi.receipt_email || 'unknown'
      const carId = pi.metadata?.carId || 'unknown'

      console.error(`[Reconcile] 🔴 ORPHANED PI: ${pi.id} | $${amount} | ${guestEmail} | car: ${carId}`)

      // Try to auto-create booking
      try {
        const car = await prisma.rentalCar.findUnique({
          where: { id: carId },
          select: { id: true, hostId: true, dailyRate: true, address: true, make: true, model: true, year: true },
        })

        if (!car) {
          // Can't create booking — refund/cancel instead
          if (pi.status === 'requires_capture') {
            await stripe.paymentIntents.cancel(pi.id)
            console.log(`[Reconcile] Cancelled orphaned PI ${pi.id} (car not found)`)
          } else {
            await stripe.refunds.create({ payment_intent: pi.id })
            console.log(`[Reconcile] Refunded orphaned PI ${pi.id} (car not found)`)
          }
          refunded++
          details.push({ pi: pi.id, action: 'refunded', reason: 'car_not_found' })
          continue
        }

        const meta = pi.metadata || {}
        const days = parseInt(meta.rentalDays || meta.days || '1') || 1
        const subtotal = parseFloat(meta.subtotal || '0') || car.dailyRate * days
        const serviceFee = parseFloat(meta.serviceFee || '0')
        const taxes = parseFloat(meta.taxes || '0')
        const deposit = parseFloat(meta.deposit || meta.depositAmount || '0')

        const startDate = meta.startDate
          ? new Date(meta.startDate + 'T12:00:00')
          : new Date(pi.created * 1000)
        const endDate = meta.endDate
          ? new Date(meta.endDate + 'T12:00:00')
          : new Date(pi.created * 1000 + days * 86400000)

        // Generate booking code
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let code = ''
        for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
        const bookingCode = `RENT-2026-${code}`

        const guestProfile = guestEmail !== 'unknown'
          ? await prisma.reviewerProfile.findFirst({
              where: { email: guestEmail },
              select: { id: true, name: true, phone: true, userId: true },
            })
          : null

        await prisma.rentalBooking.create({
          data: {
            id: require('crypto').randomUUID(),
            bookingCode,
            updatedAt: new Date(),
            carId: car.id,
            hostId: car.hostId,
            guestEmail: guestEmail !== 'unknown' ? guestEmail : null,
            guestName: guestProfile?.name || meta.guestName || null,
            guestPhone: guestProfile?.phone || null,
            reviewerProfileId: guestProfile?.id || null,
            renterId: guestProfile?.userId || null,
            startDate,
            endDate,
            startTime: meta.startTime || '10:00',
            endTime: meta.endTime || '10:00',
            pickupLocation: car.address || 'Phoenix',
            pickupType: 'host',
            dailyRate: car.dailyRate,
            numberOfDays: days,
            subtotal,
            deliveryFee: 0,
            insuranceFee: 0,
            insuranceTier: meta.insuranceTier || 'basic',
            serviceFee,
            taxes,
            totalAmount: parseFloat(amount),
            depositAmount: deposit,
            securityDeposit: 0,
            depositHeld: 0,
            status: 'PENDING',
            paymentStatus: 'AUTHORIZED',
            fleetStatus: 'PENDING',
            paymentIntentId: pi.id,
            stripePaymentMethodId: typeof pi.payment_method === 'string' ? pi.payment_method : null,
            sessionId: 'cron-reconcile',
            sessionStartedAt: new Date(pi.created * 1000),
            deviceFingerprint: 'cron-reconcile',
            notes: `Auto-created by reconcile-payments cron. Orphaned PI detected ${Math.round((Date.now() / 1000 - pi.created) / 60)}min after payment.`,
          },
        })

        autoCreated++
        console.log(`[Reconcile] ✅ Auto-created booking ${bookingCode} for PI ${pi.id}`)
        details.push({ pi: pi.id, action: 'auto_created', bookingCode })

      } catch (err: any) {
        // Auto-create failed — refund to protect the guest
        console.error(`[Reconcile] Failed to auto-create for PI ${pi.id}:`, err.message)
        try {
          if (pi.status === 'requires_capture') {
            await stripe.paymentIntents.cancel(pi.id)
          } else {
            await stripe.refunds.create({ payment_intent: pi.id })
          }
          refunded++
          details.push({ pi: pi.id, action: 'refunded', reason: 'auto_create_failed', error: err.message })
        } catch (refundErr: any) {
          console.error(`[Reconcile] CRITICAL: Failed to refund PI ${pi.id}:`, refundErr.message)
          details.push({ pi: pi.id, action: 'STUCK', reason: 'refund_failed', error: refundErr.message })
        }
      }
    }

    await cronLog.complete(orphans, 0, { reconciled, orphans, autoCreated, refunded, details })

    return NextResponse.json({
      success: true,
      message: `Reconciled ${reconciled} PIs. ${orphans} orphans: ${autoCreated} auto-created, ${refunded} refunded.`,
      reconciled,
      orphans,
      autoCreated,
      refunded,
      details,
    })

  } catch (error: any) {
    console.error('[Reconcile] Error:', error)
    await cronLog.fail(error.message)
    return NextResponse.json({ error: 'Reconciliation failed', details: error.message }, { status: 500 })
  }
}
