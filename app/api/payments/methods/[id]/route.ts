// app/api/payments/methods/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { stripe } from '@/app/lib/stripe/client'

// DELETE: Remove payment method
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id: paymentMethodId } = await params

    // Get guest profile to verify ownership
    const profile = await prisma.reviewerProfile.findFirst({
      where: {
        OR: [
          ...(user.id ? [{ userId: user.id }] : []),
          ...(user.email ? [{ email: user.email }] : [])
        ]
      }
    })

    if (!profile || !profile.stripeCustomerId) {
      return NextResponse.json({ success: false, error: 'No payment methods found' }, { status: 404 })
    }

    // Verify the payment method belongs to this customer
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
    if (paymentMethod.customer !== profile.stripeCustomerId) {
      return NextResponse.json({ success: false, error: 'Payment method not found' }, { status: 404 })
    }

    // Detach payment method from customer
    await stripe.paymentMethods.detach(paymentMethodId)

    return NextResponse.json({
      success: true,
      message: 'Payment method removed'
    })

  } catch (error) {
    console.error('[Payment Methods DELETE] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to remove payment method' }, { status: 500 })
  }
}

// PATCH: Set as default payment method
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id: paymentMethodId } = await params

    // Get guest profile
    const profile = await prisma.reviewerProfile.findFirst({
      where: {
        OR: [
          ...(user.id ? [{ userId: user.id }] : []),
          ...(user.email ? [{ email: user.email }] : [])
        ]
      }
    })

    if (!profile || !profile.stripeCustomerId) {
      return NextResponse.json({ success: false, error: 'No payment methods found' }, { status: 404 })
    }

    // Verify the payment method belongs to this customer
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
    if (paymentMethod.customer !== profile.stripeCustomerId) {
      return NextResponse.json({ success: false, error: 'Payment method not found' }, { status: 404 })
    }

    // Set as default on customer
    await stripe.customers.update(profile.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Default payment method updated'
    })

  } catch (error) {
    console.error('[Payment Methods PATCH] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update default payment method' }, { status: 500 })
  }
}
