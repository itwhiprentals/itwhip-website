// app/api/host/banking/add-bank/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe'

// POST - Add bank account to host's Stripe Connect account
export async function POST(request: NextRequest) {
  try {
    const hostId = request.headers.get('x-host-id')
    const hostEmail = request.headers.get('x-host-email')
    
    if (!hostId || !hostEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - No host session found' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { accountNumber, routingNumber, accountHolderName, accountType } = body

    // Validate required fields
    if (!accountNumber || !routingNumber || !accountHolderName) {
      return NextResponse.json(
        { error: 'Account number, routing number, and account holder name are required' },
        { status: 400 }
      )
    }

    // Validate account type
    if (accountType && !['checking', 'savings'].includes(accountType)) {
      return NextResponse.json(
        { error: 'Account type must be "checking" or "savings"' },
        { status: 400 }
      )
    }

    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        stripeAccountId: true,
        defaultPayoutMethod: true
      }
    })

    if (!host || !host.stripeAccountId) {
      return NextResponse.json(
        { error: 'No Stripe account connected. Please connect Stripe first.' },
        { status: 400 }
      )
    }

    // Create bank account token
    const token = await stripe.tokens.create({
      bank_account: {
        country: 'US',
        currency: 'usd',
        account_holder_name: accountHolderName,
        account_holder_type: 'individual',
        routing_number: routingNumber,
        account_number: accountNumber
      }
    })

    // Add bank account to Connect account
    const bankAccount = await stripe.accounts.createExternalAccount(
      host.stripeAccountId,
      {
        external_account: token.id
      }
    )

    // If this is the first payment method, set it as default
    const isFirstMethod = !host.defaultPayoutMethod
    if (isFirstMethod) {
      await prisma.rentalHost.update({
        where: { id: host.id },
        data: {
          defaultPayoutMethod: bankAccount.id,
          bankAccountLast4: (bankAccount as any).last4,
          bankName: (bankAccount as any).bank_name,
          bankAccountType: accountType || 'checking',
          bankVerified: false // Will be verified via micro-deposits
        }
      })
    }

    return NextResponse.json({
      success: true,
      method: {
        id: bankAccount.id,
        type: 'bank_account',
        bankName: (bankAccount as any).bank_name || 'Bank Account',
        last4: (bankAccount as any).last4,
        accountType: (bankAccount as any).account_type || accountType,
        status: (bankAccount as any).status,
        isDefault: isFirstMethod
      },
      message: 'Bank account added successfully. Micro-deposits will be sent for verification.'
    })

  } catch (error: any) {
    console.error('Error adding bank account:', error)
    
    // Handle Stripe-specific errors
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid bank account information', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to add bank account', details: error.message },
      { status: 500 }
    )
  }
}