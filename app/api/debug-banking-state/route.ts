// app/api/debug-banking-state/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe'

export async function GET(request: NextRequest) {
  const testEmail = 'hxris007@gmail.com'

  try {
    const host = await prisma.rentalHost.findUnique({
      where: { email: testEmail },
      select: {
        id: true,
        stripeConnectAccountId: true,
        approvalStatus: true,
        stripeAccountStatus: true,
        stripePayoutsEnabled: true,
        payoutsEnabled: true,
        currentBalance: true,
        pendingBalance: true
      }
    })

    if (!host || !host.stripeConnectAccountId) {
      return NextResponse.json({
        error: 'No Stripe account',
        host
      })
    }

    const account = await stripe.accounts.retrieve(host.stripeConnectAccountId)

    const connectApiResponse = {
      success: true,
      hasAccount: !!host.stripeConnectAccountId,
      accountId: host.stripeConnectAccountId,
      payoutsEnabled: account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted,
      requiresAction: !account.details_submitted || (account.requirements?.currently_due?.length ?? 0) > 0,
      requirements: account.requirements?.currently_due || [],
      balances: {
        current: host.currentBalance,
        pending: host.pendingBalance
      }
    }

    return NextResponse.json({
      whatConnectApiReturns: connectApiResponse,
      diagnosis: {
        shouldLoadComponent: connectApiResponse.detailsSubmitted,
        blockers: connectApiResponse.requiresAction ? connectApiResponse.requirements : []
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}