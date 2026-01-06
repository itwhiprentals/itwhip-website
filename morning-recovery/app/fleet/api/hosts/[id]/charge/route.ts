// app/fleet/api/hosts/[id]/charge/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

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

    const {
      amount,
      chargeType, // 'subscription', 'damage_claim', 'guest_refund', 'penalty', 'late_fee'
      reason,
      chargedBy, // Admin email
      relatedBookingId,
      relatedClaimId,
      notes,
      paymentMethodId, // Optional: specific payment method to charge
      deductFromBalance = true // Try balance first before charging card
    } = body

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      )
    }

    if (!chargeType || !['subscription', 'damage_claim', 'guest_refund', 'penalty', 'late_fee'].includes(chargeType)) {
      return NextResponse.json(
        { error: 'Valid charge type is required' },
        { status: 400 }
      )
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Reason is required' },
        { status: 400 }
      )
    }

    if (!chargedBy) {
      return NextResponse.json(
        { error: 'Admin identifier required' },
        { status: 400 }
      )
    }

    // Fetch host
    const host = await prisma.rentalHost.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        currentBalance: true,
        stripeCustomerId: true,
        defaultPaymentMethodOnFile: true,
        paymentMethods: {
          where: { isDefault: true },
          take: 1
        }
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    let chargeStatus = 'pending'
    let stripeChargeId = null
    let failureReason = null
    let chargedAmount = amount
    let paymentMethodUsed = null

    // STRATEGY 1: Deduct from balance if enabled and sufficient
    if (deductFromBalance && host.currentBalance >= amount) {
      // Deduct from balance
      await prisma.rentalHost.update({
        where: { id },
        data: {
          currentBalance: { decrement: amount },
          totalChargedAmount: { increment: amount },
          lastChargedDate: new Date(),
          lastChargeReason: chargeType
        }
      })

      chargeStatus = 'completed'
      paymentMethodUsed = 'balance_deduction'

    } 
    // STRATEGY 2: Charge via Stripe Customer
    else {
      if (!host.stripeCustomerId) {
        return NextResponse.json(
          { error: 'Host has no payment method on file. Cannot charge.' },
          { status: 400 }
        )
      }

      try {
        // Determine which payment method to charge
        let paymentMethod = paymentMethodId
        
        if (!paymentMethod) {
          // Use default payment method
          if (host.defaultPaymentMethodOnFile) {
            paymentMethod = host.defaultPaymentMethodOnFile
          } else if (host.paymentMethods.length > 0) {
            paymentMethod = host.paymentMethods[0].stripeMethodId
          } else {
            return NextResponse.json(
              { error: 'No payment method available to charge' },
              { status: 400 }
            )
          }
        }

        // Create Stripe charge
        const charge = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          customer: host.stripeCustomerId,
          payment_method: paymentMethod,
          off_session: true,
          confirm: true,
          description: `${chargeType.replace('_', ' ')} - ${reason}`,
          metadata: {
            hostId: host.id,
            hostName: host.name,
            chargeType,
            chargedBy,
            relatedBookingId: relatedBookingId || '',
            relatedClaimId: relatedClaimId || ''
          }
        })

        stripeChargeId = charge.id
        chargeStatus = charge.status === 'succeeded' ? 'completed' : 'failed'
        paymentMethodUsed = paymentMethod

        if (charge.status === 'succeeded') {
          // Update host totals
          await prisma.rentalHost.update({
            where: { id },
            data: {
              totalChargedAmount: { increment: amount },
              lastChargedDate: new Date(),
              lastChargeReason: chargeType
            }
          })
        } else {
          failureReason = `Stripe charge status: ${charge.status}`
        }

      } catch (stripeError: any) {
        console.error('Stripe charge error:', stripeError)
        chargeStatus = 'failed'
        failureReason = stripeError.message || 'Stripe charge failed'
      }
    }

    // Create HostCharge record
    const hostCharge = await prisma.hostCharge.create({
      data: {
        hostId: id,
        amount,
        chargeType,
        reason,
        chargedBy,
        stripeChargeId,
        stripeCustomerId: host.stripeCustomerId,
        status: chargeStatus,
        failureReason,
        paymentMethodUsed,
        relatedBookingId,
        relatedClaimId,
        notes,
        processedAt: chargeStatus === 'completed' ? new Date() : null,
        metadata: {
          deductFromBalance,
          originalBalance: host.currentBalance,
          chargedByAdmin: chargedBy
        }
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        category: 'CHARGE_MANAGEMENT',
        eventType: 'host_charged',
        severity: 'INFO',
        adminEmail: chargedBy,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        action: 'charge',
        resource: 'host',
        resourceId: id,
        amount,
        currency: 'USD',
        stripeId: stripeChargeId,
        details: {
          chargeType,
          reason,
          status: chargeStatus,
          paymentMethodUsed,
          hostName: host.name,
          hostEmail: host.email
        },
        hash: '', // Would generate hash for integrity
        timestamp: new Date()
      }
    })

    return NextResponse.json({
      success: chargeStatus === 'completed',
      data: {
        chargeId: hostCharge.id,
        status: chargeStatus,
        amount: chargedAmount,
        stripeChargeId,
        paymentMethodUsed,
        failureReason,
        message: chargeStatus === 'completed' 
          ? `Successfully charged ${host.name} $${amount.toFixed(2)}` 
          : `Charge failed: ${failureReason}`
      }
    })

  } catch (error: any) {
    console.error('Error charging host:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to charge host' },
      { status: 500 }
    )
  }
}