// app/api/partner/banking/connect/route.ts
// Unified Portal - Stripe Connect Onboarding
// Supports all host types in the unified portal

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

// UNIFIED PORTAL: Accept all token types
async function getPartnerFromToken(request?: NextRequest) {
  // Check Authorization header first (mobile app)
  const authHeader = request?.headers.get('authorization')
  let token: string | undefined
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }
  // Fall back to cookies (web)
  if (!token) {
    const cookieStore = await cookies()
    token = cookieStore.get('partner_token')?.value ||
            cookieStore.get('hostAccessToken')?.value ||
            cookieStore.get('accessToken')?.value
  }

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    if (!hostId) return null

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        hostType: true,
        approvalStatus: true,
        partnerCompanyName: true,
        stripeConnectAccountId: true,
        stripeCustomerId: true,
        stripeAccountStatus: true,
        stripeDetailsSubmitted: true,
        stripePayoutsEnabled: true,
        stripeChargesEnabled: true,
        payoutsEnabled: true,
        recruitedVia: true,
        convertedFromProspect: {
          select: {
            id: true,
            request: {
              select: { id: true }
            }
          }
        }
      }
    })

    // UNIFIED PORTAL: Accept all host types
    if (!partner) return null

    return partner
  } catch {
    return null
  }
}

// POST - Create Stripe Connect Express account
export async function POST(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken(request)

    if (!partner) {
      return NextResponse.json(
        { error: 'Unauthorized - No partner session found' },
        { status: 401 }
      )
    }

    // Check approval status - recruited hosts can connect before approval
    // as Stripe Connect verification will auto-approve them
    if (partner.approvalStatus !== 'APPROVED' && !partner.recruitedVia) {
      return NextResponse.json(
        {
          error: 'Account must be approved before adding banking information',
          approvalStatus: partner.approvalStatus
        },
        { status: 403 }
      )
    }

    // Get return URL - recruited hosts go back to their request page
    const requestId = partner.convertedFromProspect?.request?.id
    const returnUrl = requestId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/partner/requests/${requestId}?payout=success`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/partner/settings?tab=banking&success=true`
    const refreshUrl = requestId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/partner/requests/${requestId}?payout=refresh`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/partner/settings?tab=banking&refresh=true`

    // If already has Connect account, check if needs re-onboarding
    if (partner.stripeConnectAccountId) {
      try {
        const account = await stripe.accounts.retrieve(partner.stripeConnectAccountId)

        // Check if account needs re-onboarding
        const needsOnboarding = !account.details_submitted ||
          (account.requirements?.currently_due?.length ?? 0) > 0

        if (needsOnboarding) {
          // Create new account link for re-onboarding
          const accountLink = await stripe.accountLinks.create({
            account: partner.stripeConnectAccountId,
            refresh_url: refreshUrl,
            return_url: returnUrl,
            type: 'account_onboarding',
          })

          return NextResponse.json({
            success: true,
            accountId: partner.stripeConnectAccountId,
            customerId: partner.stripeCustomerId,
            status: account.charges_enabled ? 'complete' : 'pending',
            onboardingRequired: true,
            onboardingUrl: accountLink.url
          })
        }

        return NextResponse.json({
          success: true,
          accountId: partner.stripeConnectAccountId,
          customerId: partner.stripeCustomerId,
          status: account.charges_enabled ? 'complete' : 'pending',
          payoutsEnabled: account.payouts_enabled,
          onboardingRequired: false
        })
      } catch (stripeError: any) {
        console.error('[Partner Banking] Error retrieving Stripe account:', stripeError)
        // Account might be deleted in Stripe, create new one
      }
    }

    // Create new Stripe Connect Express account
    const connectAccount = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: partner.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'company', // Partners are businesses
      company: {
        name: partner.partnerCompanyName || partner.name
      },
      settings: {
        payouts: {
          schedule: {
            interval: 'manual' // Platform controls payouts
          }
        }
      },
      metadata: {
        hostId: partner.id,
        partnerName: partner.partnerCompanyName || partner.name,
        hostType: partner.hostType,
        platform: 'itwhip'
      }
    })

    // Create Stripe Customer (for potential charges)
    let customerId = partner.stripeCustomerId

    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          email: partner.email,
          name: partner.partnerCompanyName || partner.name,
          phone: partner.phone || undefined,
          description: `ItWhip Partner: ${partner.partnerCompanyName || partner.name}`,
          metadata: {
            hostId: partner.id,
            hostType: partner.hostType,
            platform: 'itwhip',
            accountType: 'partner'
          }
        })

        customerId = customer.id
        console.log(`[Partner Banking] Created Stripe Customer: ${customerId}`)
      } catch (customerError: any) {
        console.error('[Partner Banking] Error creating Stripe Customer:', customerError)
      }
    }

    // Update database
    await prisma.rentalHost.update({
      where: { id: partner.id },
      data: {
        stripeConnectAccountId: connectAccount.id,
        stripeAccountStatus: 'pending',
        stripeDetailsSubmitted: false,
        stripePayoutsEnabled: false,
        stripeChargesEnabled: false,
        stripeCustomerId: customerId || undefined,
        payoutsEnabled: false // Will be true after onboarding completes
      }
    })

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: connectAccount.id,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    })

    console.log(`[Partner Banking] Created Connect account for ${partner.partnerCompanyName}:`, connectAccount.id)

    return NextResponse.json({
      success: true,
      accountId: connectAccount.id,
      customerId: customerId,
      onboardingUrl: accountLink.url,
      message: 'Stripe Connect account created successfully'
    })

  } catch (error: any) {
    console.error('[Partner Banking] Error creating Connect account:', error)
    return NextResponse.json(
      {
        error: 'Failed to create Connect account',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// GET - Check Connect account status (or create login link)
export async function GET(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken(request)

    if (!partner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Handle login-link action: create Stripe Express Dashboard login link
    const { searchParams } = new URL(request.url)
    if (searchParams.get('action') === 'login-link') {
      if (!partner.stripeConnectAccountId) {
        return NextResponse.json(
          { success: false, error: 'No Stripe account connected' },
          { status: 400 }
        )
      }

      try {
        const loginLink = await stripe.accounts.createLoginLink(partner.stripeConnectAccountId)
        return NextResponse.json({
          success: true,
          url: loginLink.url
        })
      } catch (stripeError: any) {
        console.error('[Partner Banking] Error creating login link:', stripeError)
        return NextResponse.json(
          { success: false, error: 'Failed to create Stripe dashboard login link' },
          { status: 500 }
        )
      }
    }

    if (!partner.stripeConnectAccountId) {
      return NextResponse.json({
        success: true,
        hasAccount: false,
        canSetup: partner.approvalStatus === 'APPROVED',
        approvalStatus: partner.approvalStatus
      })
    }

    // Get account details from Stripe
    try {
      const account = await stripe.accounts.retrieve(partner.stripeConnectAccountId)

      // Sync status to database if changed
      const shouldUpdate = (
        account.details_submitted !== partner.stripeDetailsSubmitted ||
        account.payouts_enabled !== partner.stripePayoutsEnabled ||
        account.charges_enabled !== partner.stripeChargesEnabled
      )

      if (shouldUpdate) {
        await prisma.rentalHost.update({
          where: { id: partner.id },
          data: {
            stripeDetailsSubmitted: account.details_submitted,
            stripePayoutsEnabled: account.payouts_enabled,
            stripeChargesEnabled: account.charges_enabled,
            stripeAccountStatus: account.charges_enabled ? 'complete' : 'pending',
            payoutsEnabled: account.payouts_enabled
          }
        })
      }

      return NextResponse.json({
        success: true,
        hasAccount: true,
        accountId: partner.stripeConnectAccountId,
        customerId: partner.stripeCustomerId,
        payoutsEnabled: account.payouts_enabled,
        chargesEnabled: account.charges_enabled,
        detailsSubmitted: account.details_submitted,
        requiresAction: !account.details_submitted ||
          (account.requirements?.currently_due?.length ?? 0) > 0,
        requirements: account.requirements?.currently_due || []
      })
    } catch (stripeError: any) {
      console.error('[Partner Banking] Error retrieving account from Stripe:', stripeError)
      return NextResponse.json({
        success: true,
        hasAccount: true,
        accountId: partner.stripeConnectAccountId,
        error: 'Could not retrieve account status from Stripe'
      })
    }

  } catch (error: any) {
    console.error('[Partner Banking] Error checking Connect status:', error)
    return NextResponse.json(
      { error: 'Failed to check account status' },
      { status: 500 }
    )
  }
}
