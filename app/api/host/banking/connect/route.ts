// app/api/host/banking/connect/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe'

// POST - Create Stripe Connect Express account + Stripe Customer
export async function POST(request: NextRequest) {
  try {
    // Get host info from middleware headers (set by JWT verification)
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
        id: true,
        email: true,
        name: true,
        phone: true,
        approvalStatus: true,
        stripeConnectAccountId: true,
        stripeCustomerId: true,
        stripeAccountStatus: true
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    // Check approval status
    if (host.approvalStatus !== 'APPROVED') {
      return NextResponse.json(
        { 
          error: 'Account must be approved before adding banking information',
          approvalStatus: host.approvalStatus 
        },
        { status: 403 }
      )
    }

    // If already has Connect account, return existing
    if (host.stripeConnectAccountId) {
      try {
        const account = await stripe.accounts.retrieve(host.stripeConnectAccountId)
        
        // Check if account needs re-onboarding
        const needsOnboarding = !account.details_submitted || 
                               account.requirements?.currently_due?.length > 0

        if (needsOnboarding) {
          // Create new account link for re-onboarding
          const accountLink = await stripe.accountLinks.create({
            account: host.stripeConnectAccountId,
            refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/host/profile?tab=banking&refresh=true`,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/host/profile?tab=banking&success=true`,
            type: 'account_onboarding',
          })

          return NextResponse.json({
            success: true,
            accountId: host.stripeConnectAccountId,
            customerId: host.stripeCustomerId,
            status: account.charges_enabled ? 'complete' : 'pending',
            onboardingRequired: true,
            onboardingUrl: accountLink.url
          })
        }

        return NextResponse.json({
          success: true,
          accountId: host.stripeConnectAccountId,
          customerId: host.stripeCustomerId,
          status: account.charges_enabled ? 'complete' : 'pending',
          payoutsEnabled: account.payouts_enabled,
          onboardingRequired: false
        })
      } catch (stripeError: any) {
        console.error('Error retrieving Stripe account:', stripeError)
        // Account might be deleted in Stripe, create new one
      }
    }

    // Create new Stripe Connect Express account (FOR RECEIVING PAYOUTS)
    const connectAccount = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: host.email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
      
      // CRITICAL PAYOUT CONTROL - Added for automated payout system
      settings: {
        payouts: {
          schedule: {
            interval: 'manual'   // Platform controls payouts via cron job, NOT Stripe
            // Note: delay_days cannot be set with manual interval
            // The 3-day hold is controlled by cron job timing, not Stripe settings
          }
        }
      },
      // END PAYOUT CONTROL BLOCK
      
      metadata: {
        hostId: host.id,
        hostName: host.name,
        platform: 'itwhip'
      }
    })

    // Create Stripe Customer (FOR CHARGING HOST)
    let customerId = host.stripeCustomerId
    
    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          email: host.email,
          name: host.name,
          phone: host.phone,
          description: `ItWhip Host: ${host.name}`,
          metadata: {
            hostId: host.id,
            hostName: host.name,
            platform: 'itwhip',
            accountType: 'host'
          }
        })
        
        customerId = customer.id
        console.log(`✅ Created Stripe Customer: ${customerId} for host ${host.email}`)
      } catch (customerError: any) {
        console.error('Error creating Stripe Customer:', customerError)
        // Continue even if Customer creation fails - they can still receive payouts
      }
    }

    // Update database with BOTH IDs
    await prisma.rentalHost.update({
      where: { id: host.id },
      data: {
        // Connect account (for payouts)
        stripeConnectAccountId: connectAccount.id,
        stripeAccountStatus: 'pending',
        stripeDetailsSubmitted: false,
        stripePayoutsEnabled: false,
        stripeChargesEnabled: false,
        
        // Customer account (for charging)
        stripeCustomerId: customerId || undefined,
        
        // Enable payouts flag
        payoutsEnabled: false // Will be true after onboarding completes
      }
    })

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: connectAccount.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/host/profile?tab=banking&refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/host/profile?tab=banking&success=true`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      success: true,
      accountId: connectAccount.id,
      customerId: customerId,
      onboardingUrl: accountLink.url,
      message: 'Stripe Connect account created successfully',
      canBeCharged: !!customerId
    })

  } catch (error: any) {
    console.error('Error creating Connect account:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create Connect account',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// GET - Check Connect account status
export async function GET(request: NextRequest) {
  try {
    // Get host info from middleware headers (set by JWT verification)
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
        id: true,
        stripeConnectAccountId: true,
        stripeCustomerId: true,
        approvalStatus: true,
        stripeAccountStatus: true,
        stripePayoutsEnabled: true,
        payoutsEnabled: true,
        currentBalance: true,
        pendingBalance: true
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    if (!host.stripeConnectAccountId) {
      return NextResponse.json({
        success: true,
        hasAccount: false,
        canSetup: host.approvalStatus === 'APPROVED',
        approvalStatus: host.approvalStatus
      })
    }

    // Get account details from Stripe
    try {
      const account = await stripe.accounts.retrieve(host.stripeConnectAccountId)

      return NextResponse.json({
        success: true,
        hasAccount: true,
        accountId: host.stripeConnectAccountId,
        customerId: host.stripeCustomerId,
        payoutsEnabled: account.payouts_enabled,
        chargesEnabled: account.charges_enabled,
        detailsSubmitted: account.details_submitted,
        requiresAction: !account.details_submitted || 
                        account.requirements?.currently_due?.length > 0,
        requirements: account.requirements?.currently_due || [],
        balances: {
          current: host.currentBalance,
          pending: host.pendingBalance
        },
        canBeCharged: !!host.stripeCustomerId
      })
    } catch (stripeError: any) {
      console.error('Error retrieving account from Stripe:', stripeError)
      return NextResponse.json({
        success: true,
        hasAccount: true,
        accountId: host.stripeConnectAccountId,
        customerId: host.stripeCustomerId,
        error: 'Could not retrieve account status from Stripe',
        balances: {
          current: host.currentBalance,
          pending: host.pendingBalance
        }
      })
    }

  } catch (error: any) {
    console.error('Error checking Connect status:', error)
    return NextResponse.json(
      { error: 'Failed to check account status' },
      { status: 500 }
    )
  }
}