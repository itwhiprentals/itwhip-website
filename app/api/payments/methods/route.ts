// app/api/payments/methods/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { stripe } from '@/app/lib/stripe/client'

// GET: List saved payment methods
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

    // If no Stripe customer yet, return empty list
    if (!profile.stripeCustomerId) {
      return NextResponse.json({
        success: true,
        paymentMethods: [],
        defaultPaymentMethodId: null
      })
    }

    // Get payment methods from Stripe
    let paymentMethods;
    let defaultPaymentMethodId: string | null = null;

    try {
      paymentMethods = await stripe.paymentMethods.list({
        customer: profile.stripeCustomerId,
        type: 'card'
      })

      // Get customer to check default payment method
      const customer = await stripe.customers.retrieve(profile.stripeCustomerId)
      defaultPaymentMethodId =
        typeof customer !== 'string' && !customer.deleted && customer.invoice_settings?.default_payment_method
          ? customer.invoice_settings.default_payment_method as string
          : null
    } catch (stripeError: any) {
      // Customer doesn't exist in this Stripe mode (test vs live) — return empty
      if (stripeError?.code === 'resource_missing') {
        return NextResponse.json({
          success: true,
          paymentMethods: [],
          defaultPaymentMethodId: null
        })
      }
      throw stripeError
    }

    // Format response
    const formattedMethods = paymentMethods.data.map(pm => ({
      id: pm.id,
      brand: pm.card?.brand || 'unknown',
      last4: pm.card?.last4 || '****',
      expMonth: pm.card?.exp_month || 0,
      expYear: pm.card?.exp_year || 0,
      isDefault: pm.id === defaultPaymentMethodId
    }))

    return NextResponse.json({
      success: true,
      paymentMethods: formattedMethods,
      defaultPaymentMethodId
    })

  } catch (error) {
    console.error('[Payment Methods GET] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch payment methods' }, { status: 500 })
  }
}

// POST: Create SetupIntent for adding new card
export async function POST(request: NextRequest) {
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

      // Save customer ID to profile
      await prisma.reviewerProfile.update({
        where: { id: profile.id },
        data: { stripeCustomerId: customer.id }
      })
    }

    // Create SetupIntent for saving card
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      usage: 'off_session', // Allow charging later without user present
      metadata: {
        reviewerProfileId: profile.id
      }
    })

    return NextResponse.json({
      success: true,
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id
    })

  } catch (error) {
    console.error('[Payment Methods POST] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create setup intent' }, { status: 500 })
  }
}
