// app/fleet/api/hosts/[id]/banking/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia' as any
})

// Earnings tier commission rates
// BASIC: Platform covers insurance, host gets 40%
// STANDARD: Host has P2P insurance, gets 75%
// PREMIUM: Host has commercial insurance, gets 90%
function getHostCommissionPercent(tier: string): number {
  switch (tier) {
    case 'PREMIUM': return 90
    case 'STANDARD': return 75
    case 'BASIC':
    default: return 40
  }
}

function getPlatformCommissionPercent(tier: string): number {
  return 100 - getHostCommissionPercent(tier)
}

// New hosts (< 30 days) have 7-day payout hold, established hosts have 3-day hold
function isNewHost(createdAt: Date | null): boolean {
  if (!createdAt) return true
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  return new Date(createdAt) > thirtyDaysAgo
}

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

    // Fetch host with all banking-related data
    const host = await prisma.rentalHost.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        approvalStatus: true,
        hostType: true,
        createdAt: true,

        // Earnings & Commission
        earningsTier: true,
        insuranceTier: true,

        // Stripe Connect (for receiving payouts)
        stripeConnectAccountId: true,
        stripeAccountStatus: true,
        stripePayoutsEnabled: true,
        stripeChargesEnabled: true,
        stripeDetailsSubmitted: true,
        
        // Stripe Customer (for charging hosts)
        stripeCustomerId: true,
        defaultPaymentMethodOnFile: true,
        
        // Balances
        currentBalance: true,
        pendingBalance: true,
        holdBalance: true,
        negativeBalance: true,
        
        // Subscription
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        monthlySubscriptionFee: true,
        lastSubscriptionChargeDate: true,
        nextSubscriptionChargeDate: true,
        
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
        
        // Payment methods relation
        PaymentMethod: {
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
        host_charges: {
          take: 10,
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
        }
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    // ========================================================================
    // ✅ FETCH PENDING CLAIMS FOR THIS HOST (pending recovery amounts)
    // ========================================================================

    const pendingClaims = await prisma.claim.findMany({
      where: {
        hostId: id,
        status: { in: ['APPROVED', 'GUEST_RESPONDED'] },
        // Only include claims that haven't been fully recovered
        OR: [
          { recoveryStatus: null },
          { recoveryStatus: { in: ['PENDING', 'PARTIAL'] } }
        ]
      },
      select: {
        id: true,
        type: true,
        status: true,
        approvedAmount: true,
        recoveredFromGuest: true,
        recoveryStatus: true,
        guestResponseDeadline: true,
        createdAt: true,
        booking: {
          select: {
            bookingCode: true,
            car: {
              select: {
                year: true,
                make: true,
                model: true
              }
            },
            reviewerProfile: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate pending recovery totals
    const pendingRecovery = pendingClaims.reduce((sum, claim) => {
      const approved = Number(claim.approvedAmount) || 0
      const recovered = Number(claim.recoveredFromGuest) || 0
      return sum + (approved - recovered)
    }, 0)

    // Fetch additional Stripe Connect data if account exists
    let stripeConnectData = null
    if (host.stripeConnectAccountId) {
      try {
        const account = await stripe.accounts.retrieve(host.stripeConnectAccountId)
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
    if (host.stripeCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(host.stripeCustomerId, {
          expand: ['default_source']
        })
        
        if (!customer.deleted) {
          stripeCustomerData = {
            id: customer.id,
            email: customer.email,
            defaultSource: customer.default_source,
            invoicePrefix: customer.invoice_prefix,
            balance: customer.balance
          }
        }
      } catch (error) {
        console.error('Error fetching Stripe Customer:', error)
      }
    }

    // Calculate stats
    const stats = {
      totalCharges: host.host_charges.length,
      totalChargedAmount: host.totalChargedAmount || 0,
      currentBalance: host.currentBalance || 0,
      pendingBalance: host.pendingBalance || 0,
      holdBalance: host.holdBalance || 0,
      negativeBalance: host.negativeBalance || 0,
      availableForPayout: Math.max(0, (host.currentBalance || 0) - (host.holdBalance || 0)),
      totalPayouts: host.totalPayoutsAmount || 0,
      payoutCount: host.totalPayoutsCount || 0
    }

    return NextResponse.json({
      success: true,
      data: {
        host: {
          id: host.id,
          name: host.name,
          email: host.email,
          approvalStatus: host.approvalStatus,
          hostType: host.hostType,
          createdAt: host.createdAt
        },
        earnings: {
          tier: host.earningsTier || 'BASIC',
          insuranceTier: host.insuranceTier || 'PLATFORM',
          // Commission rates based on insurance tier
          hostCommissionPercent: getHostCommissionPercent(host.earningsTier || 'BASIC'),
          platformCommissionPercent: getPlatformCommissionPercent(host.earningsTier || 'BASIC'),
          // Payout hold period: 7 days for new hosts (< 30 days), 3 days for established
          payoutHoldDays: isNewHost(host.createdAt) ? 7 : 3
        },
        stripeConnect: {
          accountId: host.stripeConnectAccountId,
          status: host.stripeAccountStatus,
          payoutsEnabled: host.stripePayoutsEnabled,
          chargesEnabled: host.stripeChargesEnabled,
          detailsSubmitted: host.stripeDetailsSubmitted,
          stripeData: stripeConnectData
        },
        stripeCustomer: {
          customerId: host.stripeCustomerId,
          defaultPaymentMethod: host.defaultPaymentMethodOnFile,
          stripeData: stripeCustomerData
        },
        balances: {
          current: host.currentBalance || 0,
          pending: host.pendingBalance || 0,
          hold: host.holdBalance || 0,
          negative: host.negativeBalance || 0,
          availableForPayout: stats.availableForPayout,
          pendingRecovery,
          pendingClaimsCount: pendingClaims.length
        },
        pendingClaims: pendingClaims.map(claim => ({
          id: claim.id,
          type: claim.type,
          status: claim.status,
          approvedAmount: Number(claim.approvedAmount) || 0,
          recoveredFromGuest: Number(claim.recoveredFromGuest) || 0,
          pendingAmount: (Number(claim.approvedAmount) || 0) - (Number(claim.recoveredFromGuest) || 0),
          recoveryStatus: claim.recoveryStatus,
          guestResponseDeadline: claim.guestResponseDeadline,
          createdAt: claim.createdAt,
          bookingCode: claim.booking?.bookingCode || '',
          carDetails: claim.booking?.car
            ? `${claim.booking.car.year} ${claim.booking.car.make} ${claim.booking.car.model}`
            : 'Unknown Vehicle',
          guestName: claim.booking?.reviewerProfile?.name || 'Guest'
        })),
        subscription: {
          tier: host.subscriptionTier,
          status: host.subscriptionStatus,
          monthlyFee: host.monthlySubscriptionFee,
          startDate: host.subscriptionStartDate,
          endDate: host.subscriptionEndDate,
          lastChargeDate: host.lastSubscriptionChargeDate,
          nextChargeDate: host.nextSubscriptionChargeDate
        },
        payout: {
          schedule: host.payoutSchedule,
          minimumAmount: host.minimumPayoutAmount,
          instantEnabled: host.instantPayoutEnabled,
          nextScheduled: host.nextScheduledPayout,
          lastPayoutDate: host.lastPayoutDate,
          lastPayoutAmount: host.lastPayoutAmount,
          totalPayouts: host.totalPayoutsAmount,
          payoutCount: host.totalPayoutsCount,
          enabled: host.payoutsEnabled,
          disabledReason: host.payoutsDisabledReason
        },
        bankAccount: host.bankAccountLast4 ? {
          last4: host.bankAccountLast4,
          bankName: host.bankName,
          accountType: host.bankAccountType,
          verified: host.bankVerified
        } : null,
        debitCard: host.debitCardLast4 ? {
          last4: host.debitCardLast4,
          brand: host.debitCardBrand,
          expMonth: host.debitCardExpMonth,
          expYear: host.debitCardExpYear
        } : null,
        paymentMethods: host.PaymentMethod,
        recentCharges: host.host_charges,
        stats
      }
    })

  } catch (error) {
    console.error('Error fetching host banking data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banking data' },
      { status: 500 }
    )
  }
}