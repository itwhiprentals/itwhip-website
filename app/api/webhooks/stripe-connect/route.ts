// app/api/webhooks/stripe-connect/route.ts
// Stripe Connect webhook for auto-approving hosts after successful identity verification
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe'

// Stripe sends raw body, not JSON
export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) {
    console.error('⚠️ No stripe-signature header')
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('⚠️ STRIPE_CONNECT_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('⚠️ Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account)
        break

      case 'account.application.deauthorized':
        // For deauthorized events, the account ID is in event.account, not data.object
        if (event.account) {
          await handleAccountDeauthorized(event.account)
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

/**
 * Handle account.updated event
 * Auto-approve host when Stripe verification is complete
 */
async function handleAccountUpdated(account: Stripe.Account) {
  console.log(`📥 account.updated for ${account.id}`)
  console.log(`   details_submitted: ${account.details_submitted}`)
  console.log(`   charges_enabled: ${account.charges_enabled}`)
  console.log(`   payouts_enabled: ${account.payouts_enabled}`)

  // Find the host with this Connect account
  const host = await prisma.rentalHost.findFirst({
    where: { stripeConnectAccountId: account.id },
    select: {
      id: true,
      email: true,
      name: true,
      approvalStatus: true,
      stripeAccountStatus: true,
    }
  })

  if (!host) {
    console.log(`⚠️ No host found for Connect account ${account.id}`)
    return
  }

  console.log(`   Found host: ${host.email} (${host.id})`)
  console.log(`   Current approval status: ${host.approvalStatus}`)

  // Update Stripe-related fields always
  const requirements = account.requirements?.currently_due || []
  const disabledReason = account.requirements?.disabled_reason || null

  console.log(`   Requirements currently_due: ${JSON.stringify(requirements)}`)
  console.log(`   Disabled reason: ${disabledReason}`)

  const updateData: any = {
    stripeDetailsSubmitted: account.details_submitted || false,
    stripePayoutsEnabled: account.payouts_enabled || false,
    stripeChargesEnabled: account.charges_enabled || false,
    stripeAccountStatus: account.charges_enabled ? 'complete' : 'pending',
    // Store pending requirements so we can show user what's needed
    stripeRequirements: requirements.length > 0 ? requirements : null,
    stripeDisabledReason: disabledReason,
  }

  // AUTO-APPROVE: When Stripe verification is complete
  // Requirements: details_submitted AND (charges_enabled OR payouts_enabled)
  const isVerified = account.details_submitted &&
                     (account.charges_enabled || account.payouts_enabled)

  if (isVerified && host.approvalStatus !== 'APPROVED') {
    console.log(`✅ AUTO-APPROVING host ${host.email} - Stripe verification complete`)

    updateData.approvalStatus = 'APPROVED'
    updateData.approvedAt = new Date()
    updateData.approvedBy = 'STRIPE_CONNECT'
    updateData.documentsVerified = true
    updateData.photoIdVerified = true
    updateData.payoutsEnabled = true

    // Unlock host permissions
    updateData.dashboardAccess = true
    updateData.canViewBookings = true
    updateData.canEditCalendar = true
    updateData.canSetPricing = true
    updateData.canMessageGuests = true
    updateData.canWithdrawFunds = true
  }

  // Update the host
  await prisma.rentalHost.update({
    where: { id: host.id },
    data: updateData
  })

  if (isVerified && host.approvalStatus !== 'APPROVED') {
    console.log(`🎉 Host ${host.email} is now APPROVED via Stripe Connect`)

    // TODO: Send approval email notification
    // await sendApprovalEmail(host.email, host.name)
  } else {
    console.log(`📝 Updated Stripe status for ${host.email}`)
  }
}

/**
 * Handle account deauthorization (user disconnected their Stripe account)
 */
async function handleAccountDeauthorized(accountId: string) {
  console.log(`📥 account.application.deauthorized for ${accountId}`)

  const host = await prisma.rentalHost.findFirst({
    where: { stripeConnectAccountId: accountId },
    select: { id: true, email: true }
  })

  if (!host) {
    console.log(`⚠️ No host found for deauthorized account ${accountId}`)
    return
  }

  // Reset Stripe fields but keep the account record
  await prisma.rentalHost.update({
    where: { id: host.id },
    data: {
      stripeConnectAccountId: null,
      stripeAccountStatus: null,
      stripeDetailsSubmitted: false,
      stripePayoutsEnabled: false,
      stripeChargesEnabled: false,
      stripeRequirements: null,
      stripeDisabledReason: null,
      payoutsEnabled: false,
    }
  })

  console.log(`⚠️ Stripe account deauthorized for host ${host.email}`)
}
