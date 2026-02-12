// app/api/webhooks/stripe/route.ts
// Stripe payment webhook — catches orphaned payments (payment exists, no booking)
// Listens for payment_intent.succeeded and payment_intent.amount_capturable_updated

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
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

  // Give the normal booking flow time to complete (2 minutes)
  const piCreatedAt = new Date((paymentIntent.created || 0) * 1000)
  const ageMinutes = (Date.now() - piCreatedAt.getTime()) / (1000 * 60)

  if (ageMinutes < 2) {
    console.log(`[Webhook/Stripe] PI ${piId} is only ${ageMinutes.toFixed(1)}min old — skipping (too new)`)
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

    // ORPHANED PAYMENT — no booking found!
    console.error(`[Webhook/Stripe] 🔴 ORPHANED PAYMENT DETECTED!`)
    console.error(`  PI: ${piId}`)
    console.error(`  Amount: $${amount}`)
    console.error(`  Guest: ${guestEmail}`)
    console.error(`  Car: ${carId}`)
    console.error(`  Status: ${paymentIntent.status}`)
    console.error(`  Age: ${ageMinutes.toFixed(1)} minutes`)

    // Send alert email to admin
    try {
      const { sendEmail } = await import('@/app/lib/email/sender')
      await sendEmail(
        'info@itwhip.com',
        '🔴 ALERT: Orphaned Payment — No Booking Created',
        `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"></head>
            <body style="font-family: sans-serif; padding: 20px;">
              <h2 style="color: #dc2626;">Orphaned Payment Detected</h2>
              <p>A payment was processed in Stripe, but <strong>no booking was created</strong> in the system.</p>
              <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">PaymentIntent</td><td style="padding: 8px; border: 1px solid #ddd;">${piId}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Amount</td><td style="padding: 8px; border: 1px solid #ddd;">$${amount}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Guest Email</td><td style="padding: 8px; border: 1px solid #ddd;">${guestEmail}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Car ID</td><td style="padding: 8px; border: 1px solid #ddd;">${carId}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">PI Status</td><td style="padding: 8px; border: 1px solid #ddd;">${paymentIntent.status}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">PI Created</td><td style="padding: 8px; border: 1px solid #ddd;">${piCreatedAt.toLocaleString()}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Event</td><td style="padding: 8px; border: 1px solid #ddd;">${event.type}</td></tr>
              </table>
              <p style="margin-top: 20px; color: #666;">Action: Check Stripe dashboard and either refund the payment or manually create the booking.</p>
            </body>
          </html>
        `,
        `ORPHANED PAYMENT DETECTED\n\nPaymentIntent: ${piId}\nAmount: $${amount}\nGuest: ${guestEmail}\nCar: ${carId}\nStatus: ${paymentIntent.status}\nCreated: ${piCreatedAt.toLocaleString()}\n\nAction: Check Stripe and either refund or manually create booking.`
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
