// app/api/host/banking/methods/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe'

// GET - List all payment methods for host
export async function GET(request: NextRequest) {
  try {
    const hostId = request.headers.get('x-host-id')
    const hostEmail = request.headers.get('x-host-email')
    
    if (!hostId || !hostEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - No host session found' },
        { status: 401 }
      )
    }

    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        stripeConnectAccountId: true,  // Fixed: was stripeAccountId
        defaultPayoutMethod: true
      }
    })

    if (!host || !host.stripeConnectAccountId) {  // Fixed: was stripeAccountId
      return NextResponse.json({
        success: true,
        methods: [],
        message: 'No Stripe account connected'
      })
    }

    // Get external accounts (bank accounts) from Stripe
    const account = await stripe.accounts.retrieve(host.stripeConnectAccountId)  // Fixed
    const externalAccounts = await stripe.accounts.listExternalAccounts(
      host.stripeConnectAccountId,  // Fixed: was stripeAccountId
      { object: 'bank_account', limit: 10 }
    )

    // Get cards (for instant payouts) from Stripe
    const cards = await stripe.accounts.listExternalAccounts(
      host.stripeConnectAccountId,  // Fixed: was stripeAccountId
      { object: 'card', limit: 10 }
    )

    // Format response
    const methods = [
      ...externalAccounts.data.map((account: any) => ({
        id: account.id,
        type: 'bank_account',
        bankName: account.bank_name || 'Bank Account',
        last4: account.last4,
        accountType: account.account_type,
        status: account.status,
        isDefault: account.default_for_currency || account.id === host.defaultPayoutMethod
      })),
      ...cards.data.map((card: any) => ({
        id: card.id,
        type: 'card',
        brand: card.brand,
        last4: card.last4,
        expMonth: card.exp_month,
        expYear: card.exp_year,
        isDefault: card.id === host.defaultPayoutMethod
      }))
    ]

    return NextResponse.json({
      success: true,
      methods,
      defaultMethod: host.defaultPayoutMethod
    })

  } catch (error: any) {
    console.error('Error listing payment methods:', error)
    return NextResponse.json(
      { error: 'Failed to list payment methods', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Remove a payment method
export async function DELETE(request: NextRequest) {
  try {
    const hostId = request.headers.get('x-host-id')
    const hostEmail = request.headers.get('x-host-email')
    
    if (!hostId || !hostEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - No host session found' },
        { status: 401 }
      )
    }

    const { methodId } = await request.json()

    if (!methodId) {
      return NextResponse.json(
        { error: 'Method ID is required' },
        { status: 400 }
      )
    }

    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        stripeConnectAccountId: true,  // Fixed: was stripeAccountId
        defaultPayoutMethod: true
      }
    })

    if (!host || !host.stripeConnectAccountId) {  // Fixed: was stripeAccountId
      return NextResponse.json(
        { error: 'No Stripe account connected' },
        { status: 400 }
      )
    }

    // Don't allow deleting the default method
    if (host.defaultPayoutMethod === methodId) {
      return NextResponse.json(
        { error: 'Cannot delete default payment method. Set another method as default first.' },
        { status: 400 }
      )
    }

    // Delete from Stripe
    await stripe.accounts.deleteExternalAccount(
      host.stripeConnectAccountId,  // Fixed: was stripeAccountId
      methodId
    )

    return NextResponse.json({
      success: true,
      message: 'Payment method removed successfully'
    })

  } catch (error: any) {
    console.error('Error deleting payment method:', error)
    return NextResponse.json(
      { error: 'Failed to delete payment method', details: error.message },
      { status: 500 }
    )
  }
}