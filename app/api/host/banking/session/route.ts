// app/api/host/banking/session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    console.log('📍 SESSION API: Request received')
    
    const hostId = request.headers.get('x-host-id')
    const hostEmail = request.headers.get('x-host-email')
    
    console.log('📍 SESSION API: Headers', { hostId: hostId?.substring(0, 10), hostEmail })
    
    if (!hostId || !hostEmail) {
      console.log('❌ SESSION API: Missing headers')
      return NextResponse.json(
        { error: 'Unauthorized - No host session found' },
        { status: 401 }
      )
    }

    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        stripeConnectAccountId: true,
        approvalStatus: true,
        stripeAccountStatus: true
      }
    })

    console.log('📍 SESSION API: Host found', { 
      hasHost: !!host, 
      hasStripeAccount: !!host?.stripeConnectAccountId,
      approvalStatus: host?.approvalStatus 
    })

    if (!host) {
      console.log('❌ SESSION API: Host not found')
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    if (host.approvalStatus !== 'APPROVED') {
      console.log('❌ SESSION API: Not approved', host.approvalStatus)
      return NextResponse.json(
        { 
          error: 'Account must be approved to access banking',
          approvalStatus: host.approvalStatus 
        },
        { status: 403 }
      )
    }

    if (!host.stripeConnectAccountId) {
      console.log('❌ SESSION API: No Stripe account')
      return NextResponse.json(
        { error: 'No Stripe Connect account found. Please connect your account first.' },
        { status: 400 }
      )
    }

    console.log('🔄 SESSION API: Creating account session for', host.stripeConnectAccountId)

    // Payouts component with PLATFORM CONTROL over payout timing:
    // - Balance and payout history (view only)
    // - Bank account management via "Update" link
    // - Instant payouts enabled (hosts can request immediate payout)
    // - Standard/manual payouts DISABLED (prevents hosts from overriding platform rules)
    // - Schedule editing DISABLED (platform controls payout timing for fraud/dispute protection)
    const accountSession = await stripe.accountSessions.create({
      account: host.stripeConnectAccountId,
      components: {
        payouts: {
          enabled: true,
          features: {
            external_account_collection: true,  // Allows bank account management via "Update" link
            instant_payouts: true,              // Enable instant payouts to debit cards (1.5% fee)
            standard_payouts: false,            // DISABLE manual payouts - platform controls timing
            edit_payout_schedule: false         // DISABLE schedule editing - platform sets payout rules
          }
        }
      }
    })

    console.log('✅ SESSION API: Account session created successfully')
    console.log('📍 SESSION API: Client secret length', accountSession.client_secret?.length || 0)
    console.log('📍 SESSION API: Expires at', new Date(accountSession.expires_at * 1000).toISOString())

    return NextResponse.json({
      success: true,
      clientSecret: accountSession.client_secret,
      expiresAt: accountSession.expires_at
    })

  } catch (error: any) {
    console.error('❌ SESSION API ERROR:', {
      type: error.type,
      message: error.message,
      code: error.code
    })
    
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { 
          error: 'Invalid Stripe account configuration',
          details: error.message 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to create banking session',
        details: error.message 
      },
      { status: 500 }
    )
  }
}