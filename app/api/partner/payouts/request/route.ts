// app/api/partner/payouts/request/route.ts
// Host-initiated payout — standard (free, 2-3 days) or instant (1% fee, 30 min)

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import Stripe from 'stripe'
import { prisma } from '@/app/lib/database/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil' as Stripe.LatestApiVersion,
})

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const INSTANT_FEE_RATE = 0.01 // 1% fee for instant payouts
const MIN_PAYOUT = 10 // $10 minimum

async function getPartnerFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  let token: string | undefined
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }
  if (!token) {
    const cookieStore = await cookies()
    token = cookieStore.get('partner_token')?.value || cookieStore.get('hostAccessToken')?.value
  }
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string
    return await prisma.rentalHost.findUnique({ where: { id: hostId } })
  } catch { return null }
}

// POST — Request a payout (standard or instant)
export async function POST(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken(request)
    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { method = 'standard' } = await request.json() as { method: 'standard' | 'instant' }

    // Validate Stripe Connect
    if (!partner.stripeConnectAccountId) {
      return NextResponse.json({ error: 'No Stripe Connect account. Please connect your bank first.' }, { status: 400 })
    }

    if (!partner.stripePayoutsEnabled) {
      return NextResponse.json({ error: 'Payouts are not enabled on your Stripe account. Please complete onboarding.' }, { status: 400 })
    }

    // Get available balance from Stripe Connect account
    const balance = await stripe.balance.retrieve({ stripeAccount: partner.stripeConnectAccountId })
    const availableBalance = balance.available.find(b => b.currency === 'usd')?.amount || 0 // in cents

    if (availableBalance < MIN_PAYOUT * 100) {
      return NextResponse.json({
        error: `Minimum payout is $${MIN_PAYOUT}. Your available balance is $${(availableBalance / 100).toFixed(2)}.`,
        balance: availableBalance / 100
      }, { status: 400 })
    }

    // For instant: check if host has a debit card
    if (method === 'instant') {
      const externalAccounts = await stripe.accounts.listExternalAccounts(
        partner.stripeConnectAccountId,
        { object: 'card', limit: 10 }
      )
      const debitCard = externalAccounts.data.find((a: any) => a.object === 'card')
      if (!debitCard) {
        return NextResponse.json({
          error: 'Instant payouts require a debit card. Please add a debit card to your Stripe account.',
          needsDebitCard: true
        }, { status: 400 })
      }
    }

    // Calculate amounts
    const fee = method === 'instant' ? Math.round(availableBalance * INSTANT_FEE_RATE) : 0
    const payoutAmount = availableBalance - fee

    if (payoutAmount <= 0) {
      return NextResponse.json({ error: 'Insufficient balance after fees.' }, { status: 400 })
    }

    // Create payout on the connected account
    const payout = await stripe.payouts.create(
      {
        amount: payoutAmount,
        currency: 'usd',
        method: method === 'instant' ? 'instant' : 'standard',
        description: `ItWhip ${method === 'instant' ? 'Instant' : 'Standard'} Payout`,
        metadata: {
          hostId: partner.id,
          hostEmail: partner.email,
          method,
          fee: String(fee),
          originalBalance: String(availableBalance),
        }
      },
      { stripeAccount: partner.stripeConnectAccountId }
    )

    // Log the payout
    try {
      await prisma.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          action: method === 'instant' ? 'INSTANT_PAYOUT_REQUESTED' : 'STANDARD_PAYOUT_REQUESTED',
          entityType: 'PARTNER',
          entityId: partner.id,
          category: 'FINANCIAL',
          adminId: partner.id,
          newValue: JSON.stringify({
            stripePayoutId: payout.id,
            amount: payoutAmount / 100,
            fee: fee / 100,
            method,
            status: payout.status
          })
        }
      })
    } catch {}

    // Update host record
    await prisma.rentalHost.update({
      where: { id: partner.id },
      data: {
        lastPayoutDate: new Date(),
        lastPayoutAmount: payoutAmount / 100,
      }
    })

    return NextResponse.json({
      success: true,
      payout: {
        id: payout.id,
        amount: payoutAmount / 100,
        fee: fee / 100,
        method,
        status: payout.status,
        arrival: payout.arrival_date ? new Date(payout.arrival_date * 1000).toISOString() : null,
        description: method === 'instant'
          ? 'Arrives in ~30 minutes to your debit card'
          : 'Arrives in 2-3 business days to your bank account'
      }
    })

  } catch (error: any) {
    console.error('[Partner Payout] Error:', error)

    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      if (error.message?.includes('instant')) {
        return NextResponse.json({ error: 'Instant payouts are not available for your account. Try standard payout.', needsDebitCard: true }, { status: 400 })
      }
      return NextResponse.json({ error: error.message || 'Invalid payout request' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to process payout request' }, { status: 500 })
  }
}

// GET — Check payout eligibility and balance
export async function GET(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken(request)
    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!partner.stripeConnectAccountId) {
      return NextResponse.json({
        eligible: false,
        reason: 'no_stripe_account',
        message: 'Connect your bank account to receive payouts'
      })
    }

    // Get balance from Stripe
    const balance = await stripe.balance.retrieve({ stripeAccount: partner.stripeConnectAccountId })
    const available = balance.available.find(b => b.currency === 'usd')?.amount || 0
    const pending = balance.pending.find(b => b.currency === 'usd')?.amount || 0

    // Check for debit card (instant payout eligibility)
    let hasDebitCard = false
    try {
      const externalAccounts = await stripe.accounts.listExternalAccounts(
        partner.stripeConnectAccountId,
        { object: 'card', limit: 1 }
      )
      hasDebitCard = externalAccounts.data.length > 0
    } catch {}

    return NextResponse.json({
      eligible: available >= MIN_PAYOUT * 100,
      balance: {
        available: available / 100,
        pending: pending / 100,
      },
      instantEligible: hasDebitCard && available >= MIN_PAYOUT * 100,
      standardEligible: available >= MIN_PAYOUT * 100,
      hasDebitCard,
      instantFeeRate: INSTANT_FEE_RATE,
      minPayout: MIN_PAYOUT,
    })

  } catch (error: any) {
    console.error('[Partner Payout Check] Error:', error)
    return NextResponse.json({ error: 'Failed to check payout eligibility' }, { status: 500 })
  }
}
