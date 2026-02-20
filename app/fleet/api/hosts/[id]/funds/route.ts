// app/fleet/api/hosts/[id]/funds/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil' as any
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
      action, // 'hold', 'release', 'suspend_payouts', 'enable_payouts', 'force_payout'
      amount,
      reason,
      adminEmail,
      notes,
      holdUntil // Optional: DateTime for temporary holds
    } = body

    // Validation
    if (!action || !['hold', 'release', 'suspend_payouts', 'enable_payouts', 'force_payout'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid action is required' },
        { status: 400 }
      )
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Reason is required' },
        { status: 400 }
      )
    }

    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Admin identifier required' },
        { status: 400 }
      )
    }

    // Fetch host
    const host = await prisma.rentalHost.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        currentBalance: true,
        holdBalance: true,
        stripeConnectAccountId: true,
        payoutsEnabled: true
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    let updateData: any = {}
    let auditDetails: any = {}
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

        if (amount > host.currentBalance) {
          return NextResponse.json(
            { error: `Cannot hold $${amount}. Only $${host.currentBalance} available.` },
            { status: 400 }
          )
        }

        updateData = {
          holdBalance: { increment: amount },
          holdReason: reason,
          holdFundsUntil: holdUntil ? new Date(holdUntil) : null
        }

        message = `Held $${amount.toFixed(2)} from ${host.name}'s balance`
        auditDetails = {
          action: 'hold_funds',
          amount,
          holdUntil,
          previousHoldBalance: host.holdBalance,
          newHoldBalance: (host.holdBalance || 0) + amount
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

        if (amount > (host.holdBalance || 0)) {
          return NextResponse.json(
            { error: `Cannot release $${amount}. Only $${host.holdBalance || 0} is held.` },
            { status: 400 }
          )
        }

        updateData = {
          holdBalance: { decrement: amount }
        }

        // Clear hold reason if no funds remain held
        if ((host.holdBalance || 0) - amount === 0) {
          updateData.holdReason = null
          updateData.holdUntil = null
        }

        message = `Released $${amount.toFixed(2)} from hold for ${host.name}`
        auditDetails = {
          action: 'release_funds',
          amount,
          previousHoldBalance: host.holdBalance,
          newHoldBalance: (host.holdBalance || 0) - amount
        }
        break

      case 'suspend_payouts':
        // Suspend all payouts for this host
        updateData = {
          payoutsEnabled: false,
          payoutsDisabledReason: reason
        }

        message = `Suspended payouts for ${host.name}`
        auditDetails = {
          action: 'suspend_payouts',
          previousStatus: host.payoutsEnabled,
          reason
        }
        break

      case 'enable_payouts':
        // Re-enable payouts
        updateData = {
          payoutsEnabled: true,
          payoutsDisabledReason: null
        }

        message = `Enabled payouts for ${host.name}`
        auditDetails = {
          action: 'enable_payouts',
          previousStatus: host.payoutsEnabled,
          reason
        }
        break

      case 'force_payout':
        // Force immediate payout (override schedule)
        if (!host.stripeConnectAccountId) {
          return NextResponse.json(
            { error: 'Host has no Stripe Connect account' },
            { status: 400 }
          )
        }

        if (!amount || amount <= 0) {
          return NextResponse.json(
            { error: 'Valid payout amount is required' },
            { status: 400 }
          )
        }

        const availableBalance = (host.currentBalance || 0) - (host.holdBalance || 0)
        
        if (amount > availableBalance) {
          return NextResponse.json(
            { error: `Cannot payout $${amount}. Only $${availableBalance} available after holds.` },
            { status: 400 }
          )
        }

        try {
          // Create Stripe Transfer to host's Connect account
          const transfer = await stripe.transfers.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            destination: host.stripeConnectAccountId,
            description: `Force payout - ${reason}`,
            metadata: {
              hostId: host.id,
              hostName: host.name,
              forcedBy: adminEmail,
              reason
            }
          })

          // Update host balance and payout records
          updateData = {
            currentBalance: { decrement: amount },
            totalPayoutsAmount: { increment: amount },
            totalPayoutsCount: { increment: 1 },
            lastPayoutDate: new Date(),
            lastPayoutAmount: amount
          }

          message = `Forced payout of $${amount.toFixed(2)} to ${host.name}`
          auditDetails = {
            action: 'force_payout',
            amount,
            stripeTransferId: transfer.id,
            previousBalance: host.currentBalance,
            newBalance: (host.currentBalance || 0) - amount
          }

          // Create payout record
          await prisma.hostPayout.create({
            data: {
              hostId: id,
              bookingId: '', // No specific booking for forced payout
              amount,
              status: 'COMPLETED',
              stripeTransferId: transfer.id,
              processedAt: new Date()
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

    // Update host record
    await prisma.rentalHost.update({
      where: { id },
      data: updateData
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: crypto.randomUUID(),
        category: 'FINANCIAL',
        eventType: `host_funds_${action}`,
        severity: action === 'suspend_payouts' ? 'WARNING' : 'INFO',
        adminEmail,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        action,
        resource: 'host_funds',
        resourceId: id,
        amount: amount || null,
        currency: amount ? 'USD' : null,
        details: {
          ...auditDetails,
          reason,
          notes,
          hostName: host.name,
          hostEmail: host.email
        },
        hash: '', // Would generate hash for integrity
        timestamp: new Date()
      } as any
    })

    return NextResponse.json({
      success: true,
      data: {
        action,
        message,
        host: {
          id: host.id,
          name: host.name,
          currentBalance: action === 'hold' || action === 'release' || action === 'force_payout' 
            ? (host.currentBalance || 0) - (action === 'force_payout' ? amount : 0)
            : host.currentBalance,
          holdBalance: action === 'hold' 
            ? (host.holdBalance || 0) + amount
            : action === 'release'
            ? (host.holdBalance || 0) - amount
            : host.holdBalance,
          payoutsEnabled: action === 'suspend_payouts' 
            ? false 
            : action === 'enable_payouts' 
            ? true 
            : host.payoutsEnabled
        }
      }
    })

  } catch (error: any) {
    console.error('Error managing host funds:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to manage funds' },
      { status: 500 }
    )
  }
}