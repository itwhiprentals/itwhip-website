// app/api/payments/deposit-wallet/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { stripe, formatAmountForStripe } from '@/app/lib/stripe/client'

// GET: Get deposit wallet balance and transaction history
export async function GET(request: NextRequest) {
  try {
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get guest profile
    const profile = await prisma.reviewerProfile.findFirst({
      where: {
        OR: [
          ...(user.id ? [{ userId: user.id }] : []),
          ...(user.email ? [{ email: user.email }] : [])
        ]
      }
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })
    }

    // Get transaction history
    const transactions = await prisma.depositTransaction.findMany({
      where: { guestId: profile.id },
      orderBy: { createdAt: 'desc' },
      take: 50 // Last 50 transactions
    })

    // Format transactions
    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      balanceAfter: tx.balanceAfter,
      description: tx.description,
      bookingId: tx.bookingId,
      createdAt: tx.createdAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      balance: profile.depositWalletBalance,
      transactions: formattedTransactions
    })

  } catch (error) {
    console.error('[Deposit Wallet GET] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch deposit wallet' }, { status: 500 })
  }
}

// POST: Create PaymentIntent to load funds into deposit wallet
export async function POST(request: NextRequest) {
  try {
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount } = body

    // Validate amount
    if (!amount || amount < 50 || amount > 5000) {
      return NextResponse.json({
        success: false,
        error: 'Amount must be between $50 and $5,000'
      }, { status: 400 })
    }

    // Get guest profile
    const profile = await prisma.reviewerProfile.findFirst({
      where: {
        OR: [
          ...(user.id ? [{ userId: user.id }] : []),
          ...(user.email ? [{ email: user.email }] : [])
        ]
      }
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })
    }

    let stripeCustomerId = profile.stripeCustomerId

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: profile.email || user.email,
        name: profile.name,
        metadata: {
          reviewerProfileId: profile.id,
          userId: user.id
        }
      })

      stripeCustomerId = customer.id

      await prisma.reviewerProfile.update({
        where: { id: profile.id },
        data: { stripeCustomerId: customer.id }
      })
    }

    // Create PaymentIntent for deposit wallet load
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amount),
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: {
        type: 'deposit_wallet_load',
        guestId: profile.id,
        amount: amount.toString()
      }
    })

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })

  } catch (error) {
    console.error('[Deposit Wallet POST] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create payment intent' }, { status: 500 })
  }
}
