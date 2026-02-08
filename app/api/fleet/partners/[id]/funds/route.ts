// app/api/fleet/partners/[id]/funds/route.ts
// POST /api/fleet/partners/[id]/funds - Manage partner funds (hold, release, payout, toggle settings)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847' && !request.headers.get('authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const {
      action, // 'hold', 'release', 'suspend_payouts', 'enable_payouts', 'force_payout', 'toggle_instant_payout'
      amount,
      reason,
      notes,
      holdUntil, // Optional: DateTime for temporary holds
      enableInstant // For toggle_instant_payout action
    } = body

    // Validation
    const validActions = ['hold', 'release', 'suspend_payouts', 'enable_payouts', 'force_payout', 'toggle_instant_payout']
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { error: `Valid action is required. Options: ${validActions.join(', ')}` },
        { status: 400 }
      )
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Reason is required' },
        { status: 400 }
      )
    }

    // Fetch partner
    const partner = await prisma.rentalHost.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        partnerCompanyName: true,
        hostType: true,
        currentBalance: true,
        holdBalance: true,
        stripeConnectAccountId: true,
        payoutsEnabled: true,
        instantPayoutEnabled: true,
        debitCardLast4: true
      }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Verify this is a partner account
    if (partner.hostType !== 'FLEET_PARTNER' && partner.hostType !== 'PARTNER') {
      return NextResponse.json(
        { error: 'This account is not a partner account' },
        { status: 400 }
      )
    }

    let updateData: Record<string, any> = {}
    let auditDetails: Record<string, any> = {}
    let message = ''

    switch (action) {
      case 'hold':
        // Hold funds (freeze portion of balance)
        if (!amount || amount <= 0) {
          return NextResponse.json(
            { error: 'Valid hold amount is required' },
            { status: 400 }
          )
        }

        if (amount > (partner.currentBalance || 0)) {
          return NextResponse.json(
            { error: `Cannot hold $${amount}. Only $${partner.currentBalance || 0} available.` },
            { status: 400 }
          )
        }

        updateData = {
          holdBalance: { increment: amount },
          holdReason: reason,
          holdUntil: holdUntil ? new Date(holdUntil) : null
        }

        message = `Held $${amount.toFixed(2)} from ${partner.partnerCompanyName || partner.name}'s balance`
        auditDetails = {
          action: 'hold_funds',
          amount,
          holdUntil,
          previousHoldBalance: partner.holdBalance || 0,
          newHoldBalance: (partner.holdBalance || 0) + amount
        }
        break

      case 'release':
        // Release held funds
        if (!amount || amount <= 0) {
          return NextResponse.json(
            { error: 'Valid release amount is required' },
            { status: 400 }
          )
        }

        if (amount > (partner.holdBalance || 0)) {
          return NextResponse.json(
            { error: `Cannot release $${amount}. Only $${partner.holdBalance || 0} is held.` },
            { status: 400 }
          )
        }

        updateData = {
          holdBalance: { decrement: amount }
        }

        // Clear hold reason if no funds remain held
        if ((partner.holdBalance || 0) - amount === 0) {
          updateData.holdReason = null
          updateData.holdUntil = null
        }

        message = `Released $${amount.toFixed(2)} from hold for ${partner.partnerCompanyName || partner.name}`
        auditDetails = {
          action: 'release_funds',
          amount,
          previousHoldBalance: partner.holdBalance || 0,
          newHoldBalance: (partner.holdBalance || 0) - amount
        }
        break

      case 'suspend_payouts':
        // Suspend all payouts for this partner
        updateData = {
          payoutsEnabled: false,
          payoutsDisabledReason: reason
        }

        message = `Suspended payouts for ${partner.partnerCompanyName || partner.name}`
        auditDetails = {
          action: 'suspend_payouts',
          previousStatus: partner.payoutsEnabled,
          reason
        }
        break

      case 'enable_payouts':
        // Re-enable payouts
        updateData = {
          payoutsEnabled: true,
          payoutsDisabledReason: null
        }

        message = `Enabled payouts for ${partner.partnerCompanyName || partner.name}`
        auditDetails = {
          action: 'enable_payouts',
          previousStatus: partner.payoutsEnabled,
          reason
        }
        break

      case 'toggle_instant_payout':
        // Toggle instant payout capability
        const newInstantStatus = enableInstant !== undefined ? enableInstant : !partner.instantPayoutEnabled

        // If enabling, check if they have a debit card
        if (newInstantStatus && !partner.debitCardLast4) {
          return NextResponse.json(
            { error: 'Partner must have a debit card on file to enable instant payouts' },
            { status: 400 }
          )
        }

        updateData = {
          instantPayoutEnabled: newInstantStatus
        }

        message = `${newInstantStatus ? 'Enabled' : 'Disabled'} instant payouts for ${partner.partnerCompanyName || partner.name}`
        auditDetails = {
          action: 'toggle_instant_payout',
          previousStatus: partner.instantPayoutEnabled,
          newStatus: newInstantStatus,
          reason
        }
        break

      case 'force_payout':
        // Force immediate payout (override schedule)
        if (!partner.stripeConnectAccountId) {
          return NextResponse.json(
            { error: 'Partner has no Stripe Connect account' },
            { status: 400 }
          )
        }

        if (!amount || amount <= 0) {
          return NextResponse.json(
            { error: 'Valid payout amount is required' },
            { status: 400 }
          )
        }

        const availableBalance = (partner.currentBalance || 0) - (partner.holdBalance || 0)

        if (amount > availableBalance) {
          return NextResponse.json(
            { error: `Cannot payout $${amount}. Only $${availableBalance.toFixed(2)} available after holds.` },
            { status: 400 }
          )
        }

        try {
          // Create Stripe Transfer to partner's Connect account
          const transfer = await stripe.transfers.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            destination: partner.stripeConnectAccountId,
            description: `Force payout - ${reason}`,
            metadata: {
              partnerId: partner.id,
              partnerName: partner.partnerCompanyName || partner.name,
              forcedBy: 'FLEET_ADMIN',
              reason
            }
          })

          // Update partner balance and payout records
          updateData = {
            currentBalance: { decrement: amount },
            totalPayoutsAmount: { increment: amount },
            totalPayoutsCount: { increment: 1 },
            lastPayoutDate: new Date(),
            lastPayoutAmount: amount
          }

          message = `Forced payout of $${amount.toFixed(2)} to ${partner.partnerCompanyName || partner.name}`
          auditDetails = {
            action: 'force_payout',
            amount,
            stripeTransferId: transfer.id,
            previousBalance: partner.currentBalance || 0,
            newBalance: (partner.currentBalance || 0) - amount
          }

          // Create payout record
          await prisma.partner_payouts.create({
            data: {
              hostId: id,
              grossRevenue: amount,
              commission: 0,
              netAmount: amount,
              status: 'COMPLETED',
              paidAt: new Date()
            } as any
          })

        } catch (stripeError: any) {
          console.error('Force payout error:', stripeError)
          return NextResponse.json(
            { error: `Payout failed: ${stripeError.message}` },
            { status: 500 }
          )
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Update partner record
    await prisma.rentalHost.update({
      where: { id },
      data: updateData
    })

    // Create activity log entry
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        entityType: 'HOST',
        entityId: id,
        hostId: id,
        action: `PARTNER_FUNDS_${action.toUpperCase()}`,
        metadata: {
          ...auditDetails,
          reason,
          notes,
          partnerName: partner.partnerCompanyName || partner.name,
          partnerEmail: partner.email,
          performedBy: 'FLEET_ADMIN'
        }
      }
    })

    // Calculate updated balances for response
    const updatedBalances = {
      currentBalance: action === 'force_payout'
        ? (partner.currentBalance || 0) - amount
        : partner.currentBalance || 0,
      holdBalance: action === 'hold'
        ? (partner.holdBalance || 0) + amount
        : action === 'release'
          ? (partner.holdBalance || 0) - amount
          : partner.holdBalance || 0,
      availableForPayout: 0 // Will calculate below
    }
    updatedBalances.availableForPayout = Math.max(0, updatedBalances.currentBalance - updatedBalances.holdBalance)

    return NextResponse.json({
      success: true,
      data: {
        action,
        message,
        partner: {
          id: partner.id,
          name: partner.partnerCompanyName || partner.name,
          ...updatedBalances,
          payoutsEnabled: action === 'suspend_payouts'
            ? false
            : action === 'enable_payouts'
              ? true
              : partner.payoutsEnabled,
          instantPayoutEnabled: action === 'toggle_instant_payout'
            ? (enableInstant !== undefined ? enableInstant : !partner.instantPayoutEnabled)
            : partner.instantPayoutEnabled
        }
      }
    })

  } catch (error: any) {
    console.error('Error managing partner funds:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to manage funds' },
      { status: 500 }
    )
  }
}
