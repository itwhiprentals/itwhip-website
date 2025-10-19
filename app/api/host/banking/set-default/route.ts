// app/api/host/banking/set-default/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe'

// PATCH - Set default payout method
export async function PATCH(request: NextRequest) {
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
    const { methodId } = body

    if (!methodId) {
      return NextResponse.json(
        { error: 'Method ID is required' },
        { status: 400 }
      )
    }

    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        stripeAccountId: true
      }
    })

    if (!host || !host.stripeAccountId) {
      return NextResponse.json(
        { error: 'No Stripe account connected' },
        { status: 400 }
      )
    }

    // Verify the method exists in Stripe
    try {
      await stripe.accounts.retrieveExternalAccount(
        host.stripeAccountId,
        methodId
      )
    } catch (error) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      )
    }

    // Set as default for payouts in Stripe
    await stripe.accounts.updateExternalAccount(
      host.stripeAccountId,
      methodId,
      { default_for_currency: true }
    )

    // Update database
    await prisma.rentalHost.update({
      where: { id: host.id },
      data: {
        defaultPayoutMethod: methodId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Default payout method updated successfully'
    })

  } catch (error: any) {
    console.error('Error setting default method:', error)
    return NextResponse.json(
      { error: 'Failed to set default method', details: error.message },
      { status: 500 }
    )
  }
}