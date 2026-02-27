// app/api/webhooks/stripe/route.ts
// Stripe payment webhook — catches orphaned payments (payment exists, no booking)
// Listens for payment_intent.succeeded and payment_intent.amount_capturable_updated

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import crypto from 'crypto'
import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) {
    console.error('[Webhook/Stripe] No stripe-signature header')
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()

  if (!webhookSecret) {
    console.error('[Webhook/Stripe] STRIPE_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('[Webhook/Stripe] Signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Only handle payment-related events
  if (
    event.type !== 'payment_intent.succeeded' &&
    event.type !== 'payment_intent.amount_capturable_updated'
  ) {
    // Acknowledge events we don't care about
    return NextResponse.json({ received: true })
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent

  // Only check PIs that are car rental bookings (from our payment-element endpoint)
  if (paymentIntent.metadata?.type !== 'car_rental_booking') {
    return NextResponse.json({ received: true })
  }

  const piId = paymentIntent.id
  const amount = (paymentIntent.amount / 100).toFixed(2)
  const guestEmail = paymentIntent.metadata?.guestEmail ||
    paymentIntent.receipt_email ||
    'unknown'
  const carId = paymentIntent.metadata?.carId || 'unknown'

  console.log(`[Webhook/Stripe] ${event.type}: PI ${piId}, $${amount}, ${guestEmail}`)

  // Give the normal booking flow time to complete
  // Use the EVENT timestamp (when payment was actually confirmed), not PI creation time
  // PI can be created 10+ minutes before user confirms (form filling, card declines, retries)
  const piCreatedAt = new Date((paymentIntent.created || 0) * 1000)
  const eventCreatedAt = new Date((event.created || 0) * 1000)
  const eventAgeMinutes = (Date.now() - eventCreatedAt.getTime()) / (1000 * 60)

  if (eventAgeMinutes < 5) {
    console.log(`[Webhook/Stripe] PI ${piId} event is only ${eventAgeMinutes.toFixed(1)}min old — skipping (booking flow may still be in progress)`)
    return NextResponse.json({ received: true })
  }

  // Check if a booking exists for this PaymentIntent
  try {
    const booking = await prisma.rentalBooking.findFirst({
      where: { paymentIntentId: piId },
      select: { id: true, bookingCode: true, status: true }
    })

    if (booking) {
      // Happy path — booking exists, nothing to do
      console.log(`[Webhook/Stripe] PI ${piId} has booking ${booking.bookingCode} (${booking.status})`)
      return NextResponse.json({ received: true })
    }

    // ORPHANED PAYMENT — no booking found! Auto-create as safety net.
    console.error(`[Webhook/Stripe] 🔴 ORPHANED PAYMENT DETECTED!`)
    console.error(`  PI: ${piId}`)
    console.error(`  Amount: $${amount}`)
    console.error(`  Guest: ${guestEmail}`)
    console.error(`  Car: ${carId}`)
    console.error(`  Status: ${paymentIntent.status}`)
    console.error(`  Age: ${eventAgeMinutes.toFixed(1)} minutes`)

    // Try to auto-create the booking from PI metadata
    let autoCreated = false
    let autoBookingCode = ''

    try {
      // Look up car details
      const car = await prisma.rentalCar.findUnique({
        where: { id: carId },
        select: { id: true, hostId: true, dailyRate: true, address: true, make: true, model: true, year: true }
      })

      if (!car) {
        console.error(`[Webhook/Stripe] Cannot auto-create booking: car ${carId} not found`)
      } else {
        // Look up guest profile
        const guestProfile = guestEmail !== 'unknown' ? await prisma.reviewerProfile.findFirst({
          where: { email: guestEmail },
          select: { id: true, name: true, phone: true, renterId: true }
        }) : null

        // Extract booking data from PI metadata
        const meta = paymentIntent.metadata || {}
        const days = parseInt(meta.days || '1') || 1
        const subtotal = parseFloat(meta.subtotal || '0')
        const serviceFee = parseFloat(meta.serviceFee || '0')
        const taxes = parseFloat(meta.taxes || '0')
        const deposit = parseFloat(meta.deposit || '0')
        const totalAmount = parseFloat(amount)
        const dailyRate = subtotal > 0 ? subtotal / days : car.dailyRate

        // Use dates from PI metadata if available, else default to PI creation + days
        const startDate = meta.startDate
          ? new Date(meta.startDate + 'T12:00:00')
          : piCreatedAt
        const endDate = meta.endDate
          ? new Date(meta.endDate + 'T12:00:00')
          : new Date(piCreatedAt.getTime() + days * 24 * 60 * 60 * 1000)

        // Get charge ID from the PI
        const charges = paymentIntent.latest_charge
        const chargeId = typeof charges === 'string' ? charges : (charges as any)?.id || null

        // Generate booking code
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let code = ''
        for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
        autoBookingCode = `RENT-2026-${code}`

        await prisma.rentalBooking.create({
          data: {
            id: crypto.randomUUID(),
            bookingCode: autoBookingCode,
            updatedAt: new Date(),
            carId: car.id,
            hostId: car.hostId,
            guestEmail: guestEmail !== 'unknown' ? guestEmail : null,
            guestName: guestProfile?.name || meta.guestName || null,
            guestPhone: guestProfile?.phone || null,
            reviewerProfileId: guestProfile?.id || null,
            renterId: guestProfile?.renterId || null,
            startDate,
            endDate,
            startTime: '10:00',
            endTime: '10:00',
            pickupLocation: car.address || 'Phoenix',
            pickupType: 'host',
            dailyRate,
            numberOfDays: days,
            subtotal: subtotal || dailyRate * days,
            deliveryFee: 0,
            insuranceFee: 0,
            insuranceTier: 'basic',
            serviceFee: serviceFee || 0,
            taxes: taxes || 0,
            totalAmount,
            depositAmount: deposit,
            securityDeposit: 0,
            depositHeld: 0,
            status: 'PENDING',
            paymentStatus: 'AUTHORIZED',
            fleetStatus: 'PENDING',
            paymentIntentId: piId,
            stripePaymentMethodId: typeof paymentIntent.payment_method === 'string'
              ? paymentIntent.payment_method : null,
            stripeChargeId: chargeId,
            sessionId: 'webhook-auto-created',
            sessionStartedAt: piCreatedAt,
            deviceFingerprint: 'webhook-auto-created',
            notes: `Auto-created by webhook safety net. Original PI event: ${event.type}`,
          }
        })

        autoCreated = true
        console.log(`[Webhook/Stripe] ✅ Auto-created booking ${autoBookingCode} for orphaned PI ${piId}`)
      }
    } catch (createErr) {
      console.error('[Webhook/Stripe] Failed to auto-create booking:', createErr)
    }

    // Send alert email to admin (whether auto-created or not)
    try {
      const { sendEmail } = await import('@/app/lib/email/sender')
      const subject = autoCreated
        ? `⚠️ Orphaned Payment Auto-Fixed — Booking ${autoBookingCode} Created`
        : '🔴 ALERT: Orphaned Payment — No Booking Created'
      const actionText = autoCreated
        ? `Booking <strong>${autoBookingCode}</strong> was auto-created and is awaiting fleet review. Please verify the booking details.`
        : 'Auto-creation failed. Check Stripe dashboard and either refund the payment or manually create the booking.'

      await sendEmail(
        'info@itwhip.com',
        subject,
        `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"></head>
            <body style="font-family: sans-serif; padding: 20px;">
              <h2 style="color: ${autoCreated ? '#d97706' : '#dc2626'};">Orphaned Payment Detected</h2>
              <p>A payment was processed in Stripe, but <strong>no booking was created</strong> by the normal checkout flow.</p>
              ${autoCreated ? '<p style="color: #16a34a; font-weight: bold;">A booking was automatically created as a safety net.</p>' : ''}
              <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">PaymentIntent</td><td style="padding: 8px; border: 1px solid #ddd;">${piId}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Amount</td><td style="padding: 8px; border: 1px solid #ddd;">$${amount}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Guest Email</td><td style="padding: 8px; border: 1px solid #ddd;">${guestEmail}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Car ID</td><td style="padding: 8px; border: 1px solid #ddd;">${carId}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">PI Status</td><td style="padding: 8px; border: 1px solid #ddd;">${paymentIntent.status}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">PI Created</td><td style="padding: 8px; border: 1px solid #ddd;">${piCreatedAt.toLocaleString()}</td></tr>
                ${autoCreated ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Auto-Created Booking</td><td style="padding: 8px; border: 1px solid #ddd;">${autoBookingCode}</td></tr>` : ''}
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Event</td><td style="padding: 8px; border: 1px solid #ddd;">${event.type}</td></tr>
              </table>
              <p style="margin-top: 20px; color: #666;">${actionText}</p>
            </body>
          </html>
        `,
        `ORPHANED PAYMENT ${autoCreated ? 'AUTO-FIXED' : 'DETECTED'}\n\nPaymentIntent: ${piId}\nAmount: $${amount}\nGuest: ${guestEmail}\nCar: ${carId}\nStatus: ${paymentIntent.status}\nCreated: ${piCreatedAt.toLocaleString()}${autoCreated ? `\nAuto-Created Booking: ${autoBookingCode}` : ''}\n\n${autoCreated ? 'Booking auto-created. Please verify details in fleet dashboard.' : 'Action: Check Stripe and either refund or manually create booking.'}`
      )
      console.log('[Webhook/Stripe] Alert email sent to info@itwhip.com')
    } catch (emailErr) {
      console.error('[Webhook/Stripe] Failed to send alert email:', emailErr)
    }

  } catch (dbErr) {
    console.error('[Webhook/Stripe] Database query failed:', dbErr)
    // Still return 200 to Stripe so it doesn't retry
  }

  return NextResponse.json({ received: true })
}
