// app/api/host/banking/test-setup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe'

export async function GET(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    tests: {}
  }

  try {
    // Test 1: Get host from headers
    const hostId = request.headers.get('x-host-id')
    const hostEmail = request.headers.get('x-host-email')
    
    diagnostics.tests.auth = {
      hasHostId: !!hostId,
      hasHostEmail: !!hostEmail,
      hostId,
      hostEmail
    }

    if (!hostId) {
      return NextResponse.json({
        success: false,
        error: 'No host authentication found',
        diagnostics
      })
    }

    // Test 2: Check database
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        email: true,
        name: true,
        stripeConnectAccountId: true,
        stripeCustomerId: true,
        approvalStatus: true,
        stripePayoutsEnabled: true
      }
    })

    diagnostics.tests.database = {
      hostFound: !!host,
      hostData: host ? {
        id: host.id,
        email: host.email,
        name: host.name,
        hasConnectAccount: !!host.stripeConnectAccountId,
        hasCustomerId: !!host.stripeCustomerId,
        approvalStatus: host.approvalStatus
      } : null
    }

    if (!host) {
      return NextResponse.json({
        success: false,
        error: 'Host not found in database',
        diagnostics
      })
    }

    // Test 3: Check Stripe Connect account
    if (host.stripeConnectAccountId) {
      try {
        const account = await stripe.accounts.retrieve(host.stripeConnectAccountId)
        diagnostics.tests.stripeConnect = {
          accountId: account.id,
          type: account.type,
          payoutsEnabled: account.payouts_enabled,
          chargesEnabled: account.charges_enabled,
          detailsSubmitted: account.details_submitted
        }
      } catch (error: any) {
        diagnostics.tests.stripeConnect = {
          error: error.message
        }
      }
    } else {
      diagnostics.tests.stripeConnect = {
        status: 'No Connect account'
      }
    }

    // Test 4: Check Stripe Customer
    if (host.stripeCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(host.stripeCustomerId)
        diagnostics.tests.stripeCustomer = {
          customerId: customer.id,
          email: (customer as any).email
        }
      } catch (error: any) {
        diagnostics.tests.stripeCustomer = {
          error: error.message
        }
      }
    } else {
      diagnostics.tests.stripeCustomer = {
        status: 'No Customer account'
      }
    }

    // Test 5: Check payment methods
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { hostId: host.id }
    })

    diagnostics.tests.paymentMethods = {
      count: paymentMethods.length,
      methods: paymentMethods.map(m => ({
        type: m.type,
        last4: m.last4,
        isDefault: m.isDefault
      }))
    }

    // Test 6: Check environment variables
    diagnostics.tests.environment = {
      hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasStripePublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasBaseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
      stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7),
      publishableKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 7)
    }

    // Test 7: Try creating a session
    if (host.stripeConnectAccountId) {
      try {
        const accountSession = await stripe.accountSessions.create({
          account: host.stripeConnectAccountId,
          components: {
            payouts: {
              enabled: true,
              features: {
                external_account_collection: true
              }
            }
          }
        })

        diagnostics.tests.accountSession = {
          created: true,
          hasClientSecret: !!accountSession.client_secret,
          expiresAt: accountSession.expires_at
        }
      } catch (error: any) {
        diagnostics.tests.accountSession = {
          error: error.message,
          type: error.type,
          code: error.code
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        hostAuthenticated: true,
        databaseConnected: true,
        stripeConnectSetup: !!host.stripeConnectAccountId,
        stripeCustomerSetup: !!host.stripeCustomerId,
        paymentMethodsCount: paymentMethods.length,
        canCreateSession: diagnostics.tests.accountSession?.created || false
      },
      diagnostics
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      diagnostics
    }, { status: 500 })
  }
}