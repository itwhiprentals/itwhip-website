// app/api/host/banking/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe'

// POST - Verify bank account with micro-deposit amounts
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
    const { bankAccountId, amounts } = body

    if (!bankAccountId || !amounts || !Array.isArray(amounts) || amounts.length !== 2) {
      return NextResponse.json(
        { error: 'Bank account ID and two micro-deposit amounts are required' },
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

    // Verify the bank account with Stripe
    try {
      await (stripe.accounts as any).verifyExternalAccount(
        host.stripeAccountId,
        bankAccountId,
        {
          amounts: amounts.map(a => Math.round(a * 100)) // Convert to cents
        }
      )

      // Update database to mark as verified
      await prisma.rentalHost.update({
        where: { id: host.id },
        data: {
          bankVerified: true
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Bank account verified successfully'
      })

    } catch (error: any) {
      // Handle verification failure
      if (error.code === 'bank_account_verification_failed') {
        return NextResponse.json(
          { error: 'Incorrect amounts. Please try again.' },
          { status: 400 }
        )
      }
      throw error
    }

  } catch (error: any) {
    console.error('Error verifying bank account:', error)
    return NextResponse.json(
      { error: 'Failed to verify bank account', details: error.message },
      { status: 500 }
    )
  }
}