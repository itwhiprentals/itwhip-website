// app/api/payments/deposit-wallet/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { stripe, formatAmountFromStripe } from '@/app/lib/stripe/client'

// POST: Confirm deposit load after Stripe payment succeeds
export async function POST(request: NextRequest) {
  try {
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { paymentIntentId } = body

    if (!paymentIntentId) {
      return NextResponse.json({ success: false, error: 'Payment intent ID required' }, { status: 400 })
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

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    // Verify payment was successful
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({
        success: false,
        error: `Payment not completed. Status: ${paymentIntent.status}`
      }, { status: 400 })
    }

    // Verify this payment is for deposit wallet and belongs to this guest
    if (paymentIntent.metadata.type !== 'deposit_wallet_load') {
      return NextResponse.json({ success: false, error: 'Invalid payment type' }, { status: 400 })
    }

    if (paymentIntent.metadata.guestId !== profile.id) {
      return NextResponse.json({ success: false, error: 'Payment does not belong to this guest' }, { status: 403 })
    }

    // Check if this payment was already processed (idempotency)
    const existingTransaction = await prisma.depositTransaction.findFirst({
      where: {
        stripePaymentIntentId: paymentIntentId
      }
    })

    if (existingTransaction) {
      // Already processed, return current balance
      return NextResponse.json({
        success: true,
        message: 'Payment already processed',
        balance: profile.depositWalletBalance
      })
    }

    // Calculate amount in dollars
    const amount = formatAmountFromStripe(paymentIntent.amount)

    // Update balance and create transaction atomically
    const newBalance = profile.depositWalletBalance + amount

    await prisma.$transaction([
      prisma.reviewerProfile.update({
        where: { id: profile.id },
        data: { depositWalletBalance: newBalance }
      }),
      prisma.depositTransaction.create({
        data: {
          id: crypto.randomUUID(),
          guestId: profile.id,
          type: 'LOAD',
          amount: amount,
          balanceAfter: newBalance,
          stripePaymentIntentId: paymentIntentId,
          description: `Deposit wallet loaded with $${amount.toFixed(2)}`
        }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Deposit wallet loaded successfully',
      amount,
      balance: newBalance
    })

  } catch (error) {
    console.error('[Deposit Wallet Confirm] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to confirm deposit' }, { status: 500 })
  }
}
