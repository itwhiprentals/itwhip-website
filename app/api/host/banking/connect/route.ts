// app/api/host/banking/connect/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe'

// Helper to parse full name into first and last name
function parseFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }
  // First word is first name, rest is last name
  const firstName = parts[0]
  const lastName = parts.slice(1).join(' ')
  return { firstName, lastName }
}

// Helper to format phone for Stripe (E.164 format: +1XXXXXXXXXX)
function formatPhoneForStripe(phone: string | null): string | undefined {
  if (!phone) return undefined

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // If empty after stripping, return undefined
  if (!digits) return undefined

  // If 10 digits, assume US number and add +1
  if (digits.length === 10) {
    return `+1${digits}`
  }

  // If 11 digits starting with 1, add + prefix
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }

  // Return as-is if already formatted or different length
  return phone.startsWith('+') ? phone : `+${digits}`
}

// Get base URL with fallback for production
function getBaseUrl(): string {
  // Check for explicit base URL first
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  // Vercel production URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // Production domain fallback
  if (process.env.NODE_ENV === 'production') {
    return 'https://itwhip.com'
  }
  // Development fallback
  return 'http://localhost:3000'
}

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
        stripeAccountStatus: true,
        // Additional fields for Stripe pre-fill
        city: true,
        state: true,
        zipCode: true
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    // NOTE: Removed approval check - Stripe Connect onboarding now handles identity verification
    // When host completes Stripe onboarding, webhook will auto-approve them

    // If already has Connect account, return existing
    if (host.stripeConnectAccountId) {
      try {
        const account = await stripe.accounts.retrieve(host.stripeConnectAccountId)
        
        // Check if account needs re-onboarding
        const needsOnboarding = !account.details_submitted ||
                               (account.requirements?.currently_due?.length ?? 0) > 0

        if (needsOnboarding) {
          // Create new account link for re-onboarding
          const baseUrl = getBaseUrl()
          const accountLink = await stripe.accountLinks.create({
            account: host.stripeConnectAccountId,
            refresh_url: `${baseUrl}/host/profile?tab=banking&refresh=true`,
            return_url: `${baseUrl}/host/profile?tab=banking&success=true`,
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

    // Parse host name for pre-filling
    const { firstName, lastName } = parseFullName(host.name)

    // Debug: Log what we're sending to Stripe
    const formattedPhone = formatPhoneForStripe(host.phone)
    console.log('🔍 Stripe Connect Pre-fill Data:', {
      firstName,
      lastName,
      email: host.email,
      rawPhone: host.phone,
      formattedPhone,
      city: host.city,
      state: host.state,
      zipCode: host.zipCode
    })

    // Create new Stripe Connect Express account (FOR RECEIVING PAYOUTS)
    const connectAccount = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: host.email,
      capabilities: {
        card_payments: { requested: true },  // Required by Stripe for Express accounts
        transfers: { requested: true },       // For receiving payouts
      },
      business_type: 'individual',

      // PRE-FILL HOST INFORMATION - Makes onboarding look professional
      individual: {
        first_name: firstName,
        last_name: lastName || undefined,  // Don't send empty string
        email: host.email,
        phone: formatPhoneForStripe(host.phone),  // Format to E.164
        address: {
          // Handle empty strings, 'Not Set', and 'N/A' placeholders
          city: host.city && host.city !== 'Not Set' && host.city.trim() !== '' ? host.city : undefined,
          state: host.state && host.state !== 'N/A' && host.state.trim() !== '' ? host.state : undefined,
          postal_code: host.zipCode && host.zipCode.trim() !== '' ? host.zipCode : undefined,
          country: 'US'
        }
      },

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
    const baseUrl = getBaseUrl()
    const accountLink = await stripe.accountLinks.create({
      account: connectAccount.id,
      refresh_url: `${baseUrl}/host/profile?tab=banking&refresh=true`,
      return_url: `${baseUrl}/host/profile?tab=banking&success=true`,
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
        canSetup: true, // All hosts can start Stripe Connect onboarding - Stripe handles verification
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
                        (account.requirements?.currently_due?.length ?? 0) > 0,
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