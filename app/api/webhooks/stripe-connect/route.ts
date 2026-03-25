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

  const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET?.trim()

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

      case 'payout.paid':
        await handlePayoutPaid(event.data.object as Stripe.Payout, event.account)
        break

      case 'payout.failed':
        await handlePayoutFailed(event.data.object as Stripe.Payout, event.account)
        break

      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer)
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
      recruitedVia: true,
      convertedFromProspect: {
        select: { id: true }
      }
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
    // ALWAYS sync payoutsEnabled with stripePayoutsEnabled — they must never diverge
    payoutsEnabled: account.payouts_enabled || false,
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

  // If this is a recruited host with a linked prospect, update their payout status too
  if (host.recruitedVia && host.convertedFromProspect?.id) {
    const payoutEnabled = account.payouts_enabled || account.charges_enabled || false
    await prisma.hostProspect.update({
      where: { id: host.convertedFromProspect.id },
      data: {
        payoutConnected: payoutEnabled,
        lastActivityAt: new Date()
      }
    })
    console.log(`   Updated prospect ${host.convertedFromProspect.id} payoutConnected: ${payoutEnabled}`)
  }

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
      stripeRequirements: null as any,
      stripeDisabledReason: null,
      payoutsEnabled: false,
    }
  })

  console.log(`⚠️ Stripe account deauthorized for host ${host.email}`)
}

/**
 * Handle payout.paid — money arrived in host's bank account
 */
async function handlePayoutPaid(payout: Stripe.Payout, connectAccountId?: string | null) {
  console.log(`📥 payout.paid: ${payout.id} on account ${connectAccountId}, $${(payout.amount / 100).toFixed(2)}`)

  if (!connectAccountId) return

  const host = await prisma.rentalHost.findFirst({
    where: { stripeConnectAccountId: connectAccountId },
    select: { id: true, name: true, email: true }
  })

  if (!host) {
    console.log(`⚠️ No host found for payout.paid on account ${connectAccountId}`)
    return
  }

  // Log the successful delivery
  await prisma.activityLog.create({
    data: {
      id: crypto.randomUUID(),
      action: 'PAYOUT_DELIVERED',
      entityType: 'RentalHost',
      entityId: host.id,
      metadata: {
        stripePayoutId: payout.id,
        amount: payout.amount / 100,
        method: payout.method,
        arrivalDate: payout.arrival_date ? new Date(payout.arrival_date * 1000).toISOString() : null,
        hostName: host.name,
        timestamp: new Date()
      },
      ipAddress: 'stripe-webhook'
    }
  })

  // Send email notification to host
  try {
    const { sendEmail } = await import('@/app/lib/email/sender')
    const amount = (payout.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    await sendEmail(
      host.email,
      `Your ItWhip payout of $${amount} has arrived`,
      `<p>Your payout of <strong>$${amount}</strong> has been deposited to your bank account.</p><p>Thank you for hosting with ItWhip!</p>`,
      `Your payout of $${amount} has been deposited to your bank account. Thank you for hosting with ItWhip!`
    )
  } catch (emailErr) {
    console.error(`[Webhook] Failed to send payout.paid email to ${host.email}:`, emailErr)
  }

  console.log(`✅ payout.paid processed for ${host.name}: $${(payout.amount / 100).toFixed(2)}`)
}

/**
 * Handle payout.failed — payout to host's bank failed
 */
async function handlePayoutFailed(payout: Stripe.Payout, connectAccountId?: string | null) {
  console.log(`📥 payout.failed: ${payout.id} on account ${connectAccountId}`)

  if (!connectAccountId) return

  const host = await prisma.rentalHost.findFirst({
    where: { stripeConnectAccountId: connectAccountId },
    select: { id: true, name: true, email: true }
  })

  if (!host) {
    console.log(`⚠️ No host found for payout.failed on account ${connectAccountId}`)
    return
  }

  const failureMessage = payout.failure_message || 'Unknown failure'
  const failureCode = payout.failure_code || 'unknown'

  // Log the failure
  await prisma.activityLog.create({
    data: {
      id: crypto.randomUUID(),
      action: 'PAYOUT_BANK_FAILED',
      entityType: 'RentalHost',
      entityId: host.id,
      metadata: {
        stripePayoutId: payout.id,
        amount: payout.amount / 100,
        failureCode,
        failureMessage,
        hostName: host.name,
        timestamp: new Date()
      },
      ipAddress: 'stripe-webhook'
    }
  })

  // Create admin notification (HIGH priority)
  await prisma.adminNotification.create({
    data: {
      type: 'SYSTEM_ALERT',
      title: `Payout Failed - ${host.name}`,
      message: `Bank payout of $${(payout.amount / 100).toFixed(2)} failed for ${host.name} (${host.email}). Reason: ${failureMessage}`,
      priority: 'HIGH',
      status: 'UNREAD',
      actionRequired: true,
      relatedId: host.id,
      relatedType: 'RentalHost',
      metadata: {
        stripePayoutId: payout.id,
        amount: payout.amount / 100,
        failureCode,
        failureMessage,
        hostId: host.id
      }
    } as any
  })

  // Notify host
  try {
    const { sendEmail } = await import('@/app/lib/email/sender')
    const amount = (payout.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    await sendEmail(
      host.email,
      `ItWhip Payout of $${amount} Failed`,
      `<p>Your payout of <strong>$${amount}</strong> could not be delivered to your bank account.</p><p>Reason: ${failureMessage}</p><p>Please check your bank details in your <a href="https://itwhip.com/partner/settings?tab=banking">Banking Settings</a> and try again.</p>`,
      `Your payout of $${amount} could not be delivered. Reason: ${failureMessage}. Please check your bank details.`
    )
  } catch (emailErr) {
    console.error(`[Webhook] Failed to send payout.failed email to ${host.email}:`, emailErr)
  }

  console.log(`❌ payout.failed processed for ${host.name}: ${failureMessage}`)
}

/**
 * Handle transfer.created — platform → Connect account transfer confirmed
 */
async function handleTransferCreated(transfer: Stripe.Transfer) {
  const payoutId = transfer.metadata?.payoutId
  console.log(`📥 transfer.created: ${transfer.id}, payoutId=${payoutId || 'N/A'}, $${(transfer.amount / 100).toFixed(2)}`)

  if (!payoutId) return

  // Update the RentalPayout with transfer confirmation
  try {
    await prisma.rentalPayout.updateMany({
      where: { id: payoutId },
      data: { transactionId: transfer.id }
    })
  } catch {
    // Payout record may not exist if this was a manual fleet transfer
  }

  // Log confirmation
  await prisma.activityLog.create({
    data: {
      id: crypto.randomUUID(),
      action: 'TRANSFER_CONFIRMED',
      entityType: 'RentalPayout',
      entityId: payoutId,
      metadata: {
        stripeTransferId: transfer.id,
        amount: transfer.amount / 100,
        destination: transfer.destination,
        timestamp: new Date()
      },
      ipAddress: 'stripe-webhook'
    }
  })
}
