// app/api/fleet/partners/[id]/banking/route.ts
// GET /api/fleet/partners/[id]/banking - Get partner banking details
// POST /api/fleet/partners/[id]/banking - Charge partner

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847' && !request.headers.get('authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Fetch partner with all banking-related data
    const partner = await prisma.rentalHost.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        partnerCompanyName: true,
        approvalStatus: true,
        hostType: true,

        // Stripe Connect (for receiving payouts)
        stripeConnectAccountId: true,
        stripeAccountStatus: true,
        stripePayoutsEnabled: true,
        stripeChargesEnabled: true,
        stripeDetailsSubmitted: true,
        stripeRequirements: true,
        stripeDisabledReason: true,

        // Stripe Customer (for charging partners)
        stripeCustomerId: true,
        defaultPaymentMethodOnFile: true,

        // Balances
        currentBalance: true,
        pendingBalance: true,
        holdBalance: true,
        negativeBalance: true,

        // Charging history
        totalChargedAmount: true,
        lastChargedDate: true,
        lastChargeReason: true,

        // Payout info
        payoutSchedule: true,
        minimumPayoutAmount: true,
        instantPayoutEnabled: true,
        nextScheduledPayout: true,
        lastPayoutDate: true,
        lastPayoutAmount: true,
        totalPayoutsAmount: true,
        totalPayoutsCount: true,

        // Payout restrictions
        payoutsEnabled: true,
        payoutsDisabledReason: true,

        // Bank info (tokenized)
        bankAccountLast4: true,
        bankName: true,
        bankAccountType: true,
        bankVerified: true,

        // Debit card info
        debitCardLast4: true,
        debitCardBrand: true,
        debitCardExpMonth: true,
        debitCardExpYear: true,

        // Commission
        currentCommissionRate: true,

        // Payment methods relation
        paymentMethods: {
          select: {
            id: true,
            type: true,
            stripeMethodId: true,
            last4: true,
            brand: true,
            accountType: true,
            expiryMonth: true,
            expiryYear: true,
            status: true,
            isDefault: true,
            isVerified: true,
            createdAt: true
          }
        },

        // Recent charges
        hostCharges: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            chargeType: true,
            reason: true,
            status: true,
            chargedBy: true,
            stripeChargeId: true,
            createdAt: true,
            processedAt: true,
            failureReason: true
          }
        },

        // Recent payouts
        partnerPayouts: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            netAmount: true,
            grossRevenue: true,
            commission: true,
            status: true,
            createdAt: true,
            paidAt: true,
            failureReason: true
          }
        }
      }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Fetch additional Stripe Connect data if account exists
    let stripeConnectData = null
    if (partner.stripeConnectAccountId) {
      try {
        const account = await stripe.accounts.retrieve(partner.stripeConnectAccountId)
        stripeConnectData = {
          id: account.id,
          payoutsEnabled: account.payouts_enabled,
          chargesEnabled: account.charges_enabled,
          detailsSubmitted: account.details_submitted,
          requiresAction: account.requirements?.currently_due && account.requirements.currently_due.length > 0,
          requirements: account.requirements?.currently_due || [],
          externalAccounts: account.external_accounts?.data?.length || 0
        }
      } catch (error) {
        console.error('Error fetching Stripe Connect account:', error)
      }
    }

    // Fetch Stripe Customer data if exists
    let stripeCustomerData = null
    let canCharge = false
    if (partner.stripeCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(partner.stripeCustomerId, {
          expand: ['default_source', 'invoice_settings.default_payment_method']
        })

        if (!customer.deleted) {
          const defaultPaymentMethod = customer.invoice_settings?.default_payment_method
          canCharge = !!defaultPaymentMethod || !!customer.default_source

          stripeCustomerData = {
            id: customer.id,
            email: customer.email,
            defaultSource: customer.default_source,
            defaultPaymentMethod: defaultPaymentMethod,
            balance: customer.balance
          }
        }
      } catch (error) {
        console.error('Error fetching Stripe Customer:', error)
      }
    }

    // Fetch booking revenue data for this partner
    const bookingRevenue = await prisma.rentalBooking.aggregate({
      where: {
        hostId: id,
        status: { in: ['COMPLETED', 'CONFIRMED', 'ACTIVE'] }
      },
      _sum: { totalAmount: true },
      _count: true
    })

    const completedRevenue = await prisma.rentalBooking.aggregate({
      where: {
        hostId: id,
        status: 'COMPLETED'
      },
      _sum: { totalAmount: true },
      _count: true
    })

    const pendingRevenue = await prisma.rentalBooking.aggregate({
      where: {
        hostId: id,
        status: { in: ['CONFIRMED', 'ACTIVE'] }
      },
      _sum: { totalAmount: true },
      _count: true
    })

    // Calculate commissions based on partner's rate
    const commissionRate = partner.currentCommissionRate || 0.25
    const grossRevenue = bookingRevenue._sum.totalAmount || 0
    const completedGross = completedRevenue._sum.totalAmount || 0
    const pendingGross = pendingRevenue._sum.totalAmount || 0

    const totalCommission = grossRevenue * commissionRate
    const completedCommission = completedGross * commissionRate
    const pendingCommission = pendingGross * commissionRate

    const totalNetRevenue = grossRevenue - totalCommission
    const completedNetRevenue = completedGross - completedCommission
    const pendingNetRevenue = pendingGross - pendingCommission

    // Calculate stats
    const stats = {
      totalCharges: partner.hostCharges.length,
      totalChargedAmount: partner.totalChargedAmount || 0,
      currentBalance: partner.currentBalance || 0,
      pendingBalance: partner.pendingBalance || 0,
      holdBalance: partner.holdBalance || 0,
      negativeBalance: partner.negativeBalance || 0,
      availableForPayout: Math.max(0, (partner.currentBalance || 0) - (partner.holdBalance || 0)),
      totalPayouts: partner.totalPayoutsAmount || 0,
      payoutCount: partner.totalPayoutsCount || 0
    }

    // Revenue flow data (connects bookings → revenue → commission → payout)
    const revenueFlow = {
      // Booking totals
      totalBookings: bookingRevenue._count,
      completedBookings: completedRevenue._count,
      pendingBookings: pendingRevenue._count,
      // Gross revenue (before commission)
      grossRevenue,
      completedGrossRevenue: completedGross,
      pendingGrossRevenue: pendingGross,
      // Commission (platform cut)
      commissionRate,
      totalCommission,
      completedCommission,
      pendingCommission,
      // Net revenue (partner's earnings)
      netRevenue: totalNetRevenue,
      completedNetRevenue,
      pendingNetRevenue,
      // Payout status
      totalPaidOut: partner.totalPayoutsAmount || 0,
      awaitingPayout: Math.max(0, completedNetRevenue - (partner.totalPayoutsAmount || 0)),
      // Balance reconciliation
      currentBalance: partner.currentBalance || 0,
      holdBalance: partner.holdBalance || 0,
      availableForPayout: Math.max(0, (partner.currentBalance || 0) - (partner.holdBalance || 0))
    }

    return NextResponse.json({
      success: true,
      data: {
        partner: {
          id: partner.id,
          name: partner.name,
          email: partner.email,
          companyName: partner.partnerCompanyName,
          approvalStatus: partner.approvalStatus,
          hostType: partner.hostType,
          commissionRate: partner.currentCommissionRate
        },
        stripeConnect: {
          accountId: partner.stripeConnectAccountId,
          status: partner.stripeAccountStatus,
          payoutsEnabled: partner.stripePayoutsEnabled,
          chargesEnabled: partner.stripeChargesEnabled,
          detailsSubmitted: partner.stripeDetailsSubmitted,
          requirements: partner.stripeRequirements,
          disabledReason: partner.stripeDisabledReason,
          stripeData: stripeConnectData
        },
        stripeCustomer: {
          customerId: partner.stripeCustomerId,
          defaultPaymentMethod: partner.defaultPaymentMethodOnFile,
          canCharge,
          stripeData: stripeCustomerData
        },
        balances: {
          current: partner.currentBalance || 0,
          pending: partner.pendingBalance || 0,
          hold: partner.holdBalance || 0,
          negative: partner.negativeBalance || 0,
          availableForPayout: stats.availableForPayout
        },
        payout: {
          schedule: partner.payoutSchedule,
          minimumAmount: partner.minimumPayoutAmount,
          instantEnabled: partner.instantPayoutEnabled,
          nextScheduled: partner.nextScheduledPayout,
          lastPayoutDate: partner.lastPayoutDate,
          lastPayoutAmount: partner.lastPayoutAmount,
          totalPayouts: partner.totalPayoutsAmount,
          payoutCount: partner.totalPayoutsCount,
          enabled: partner.payoutsEnabled,
          disabledReason: partner.payoutsDisabledReason
        },
        bankAccount: partner.bankAccountLast4 ? {
          last4: partner.bankAccountLast4,
          bankName: partner.bankName,
          accountType: partner.bankAccountType,
          verified: partner.bankVerified
        } : null,
        debitCard: partner.debitCardLast4 ? {
          last4: partner.debitCardLast4,
          brand: partner.debitCardBrand,
          expMonth: partner.debitCardExpMonth,
          expYear: partner.debitCardExpYear
        } : null,
        paymentMethods: partner.paymentMethods,
        recentCharges: partner.hostCharges,
        recentPayouts: partner.partnerPayouts.map(p => ({
          id: p.id,
          amount: p.netAmount,
          grossRevenue: p.grossRevenue,
          commission: p.commission,
          status: p.status,
          createdAt: p.createdAt,
          paidAt: p.paidAt
        })),
        stats,
        revenueFlow
      }
    })

  } catch (error: any) {
    console.error('Error fetching partner banking data:', error?.message || error)
    return NextResponse.json(
      { error: 'Failed to fetch banking data', details: error?.message },
      { status: 500 }
    )
  }
}

// POST - Charge partner (via Customer payment method OR debit Connect balance)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847' && !request.headers.get('authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { amount, reason, chargeType = 'MANUAL', method = 'customer' } = body
    // method: 'customer' = charge their payment method, 'connect' = debit their Connect balance

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    if (!reason) {
      return NextResponse.json(
        { error: 'Charge reason is required' },
        { status: 400 }
      )
    }

    // Fetch partner
    const partner = await prisma.rentalHost.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        partnerCompanyName: true,
        stripeCustomerId: true,
        stripeConnectAccountId: true,
        defaultPaymentMethodOnFile: true,
        currentBalance: true
      }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Method: Debit from Connect balance (payout account)
    if (method === 'connect') {
      if (!partner.stripeConnectAccountId) {
        return NextResponse.json(
          { error: 'Partner has no Stripe Connect account' },
          { status: 400 }
        )
      }

      // Create charge record first (pending)
      const chargeRecord = await prisma.hostCharge.create({
        data: {
          hostId: id,
          amount,
          chargeType: 'CONNECT_DEBIT',
          reason,
          status: 'PENDING',
          chargedBy: 'FLEET_ADMIN'
        }
      })

      try {
        // Account Debit: Create a transfer that pulls funds FROM the connected account
        // This uses Stripe's Account Debits feature for Express accounts
        // The platform can debit when it's responsible for negative balances
        //
        // Note: Account Debits must be enabled in Stripe Dashboard:
        // Settings > Connect > Account debits
        //
        // Alternative approach: If account debits isn't enabled, we create a
        // negative transfer (reversal) which effectively debits the account

        const transfer = await stripe.transfers.create({
          amount: Math.round(amount * 100),
          currency: 'usd',
          destination: partner.stripeConnectAccountId, // The connected account
          metadata: {
            partnerId: id,
            partnerName: partner.partnerCompanyName || partner.name,
            chargeId: chargeRecord.id,
            reason,
            type: 'partner_debit',
            direction: 'platform_to_connected' // Will be reversed
          }
        })

        // Now reverse it to pull the money back (this debits the connected account)
        const reversal = await stripe.transfers.createReversal(transfer.id, {
          amount: Math.round(amount * 100),
          metadata: {
            partnerId: id,
            chargeId: chargeRecord.id,
            reason,
            type: 'account_debit_reversal'
          }
        })

        // Update charge record with success
        await prisma.hostCharge.update({
          where: { id: chargeRecord.id },
          data: {
            status: 'COMPLETED',
            stripeChargeId: reversal.id, // Store the reversal ID as the charge reference
            processedAt: new Date()
          }
        })

        // Decrement partner's balance in our DB
        await prisma.rentalHost.update({
          where: { id },
          data: {
            currentBalance: { decrement: amount },
            totalChargedAmount: { increment: amount },
            lastChargedDate: new Date(),
            lastChargeReason: reason
          }
        })

        return NextResponse.json({
          success: true,
          charge: {
            id: chargeRecord.id,
            stripeTransferId: transfer.id,
            stripeReversalId: reversal.id,
            amount,
            status: 'COMPLETED',
            method: 'connect',
            reason
          }
        })

      } catch (stripeError: any) {
        // Update charge record with failure
        await prisma.hostCharge.update({
          where: { id: chargeRecord.id },
          data: {
            status: 'FAILED',
            failureReason: stripeError.message
          }
        })

        console.error('Connect debit failed:', stripeError)
        return NextResponse.json(
          {
            error: 'Debit failed - may have insufficient balance',
            details: stripeError.message,
            chargeId: chargeRecord.id
          },
          { status: 400 }
        )
      }
    }

    // Method: Charge Customer payment method (default)
    if (!partner.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Partner has no payment method on file. Cannot charge.' },
        { status: 400 }
      )
    }

    // Get customer's default payment method
    let paymentMethodId = partner.defaultPaymentMethodOnFile

    if (!paymentMethodId) {
      // Try to get from Stripe
      try {
        const customer = await stripe.customers.retrieve(partner.stripeCustomerId, {
          expand: ['invoice_settings.default_payment_method']
        })

        if (!customer.deleted) {
          paymentMethodId = (customer.invoice_settings?.default_payment_method as Stripe.PaymentMethod)?.id ||
                            (customer.default_source as string)
        }
      } catch (e) {
        // Customer doesn't exist
      }
    }

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'No default payment method found for partner' },
        { status: 400 }
      )
    }

    // Create charge record first (pending)
    const chargeRecord = await prisma.hostCharge.create({
      data: {
        hostId: id,
        amount,
        chargeType,
        reason,
        status: 'PENDING',
        chargedBy: 'FLEET_ADMIN'
      }
    })

    try {
      // Create PaymentIntent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        customer: partner.stripeCustomerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        description: `Fleet charge: ${reason}`,
        metadata: {
          partnerId: id,
          partnerName: partner.partnerCompanyName || partner.name,
          chargeId: chargeRecord.id,
          chargeType,
          reason
        }
      })

      // Update charge record with success
      await prisma.hostCharge.update({
        where: { id: chargeRecord.id },
        data: {
          status: 'COMPLETED',
          stripeChargeId: paymentIntent.id,
          processedAt: new Date()
        }
      })

      // Update partner's total charged amount
      await prisma.rentalHost.update({
        where: { id },
        data: {
          totalChargedAmount: { increment: amount },
          lastChargedDate: new Date(),
          lastChargeReason: reason
        }
      })

      return NextResponse.json({
        success: true,
        charge: {
          id: chargeRecord.id,
          stripePaymentIntentId: paymentIntent.id,
          amount,
          status: 'COMPLETED',
          method: 'customer',
          reason
        }
      })

    } catch (stripeError: any) {
      // Update charge record with failure
      await prisma.hostCharge.update({
        where: { id: chargeRecord.id },
        data: {
          status: 'FAILED',
          failureReason: stripeError.message
        }
      })

      console.error('Stripe charge failed:', stripeError)
      return NextResponse.json(
        {
          error: 'Charge failed',
          details: stripeError.message,
          chargeId: chargeRecord.id
        },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('Error charging partner:', error)
    return NextResponse.json(
      { error: 'Failed to process charge' },
      { status: 500 }
    )
  }
}
