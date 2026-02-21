// app/api/ai/booking/checkout/swap/route.ts
// Swap to a different vehicle mid-checkout without losing the session

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import Stripe from 'stripe'
import prisma from '@/app/lib/database/prisma'
import { getCheckoutUser } from '../auth'
import { getActualDeposit } from '@/app/[locale]/(guest)/rentals/lib/booking-pricing'
import type {
  InsuranceTierOption,
  DeliveryOption,
} from '@/app/lib/ai-booking/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

const swapSchema = z.object({
  checkoutSessionId: z.string().min(1),
  vehicleId: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    // Auth check — uses accessToken cookie (same as guest API)
    const user = await getCheckoutUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Parse request
    const body = await request.json()
    const parsed = swapSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { checkoutSessionId, vehicleId } = parsed.data

    // =========================================================================
    // VALIDATE SESSION
    // =========================================================================
    const pending = await prisma.pendingCheckout.findUnique({
      where: { checkoutSessionId },
    })

    if (!pending) {
      return NextResponse.json({ error: 'Checkout session not found' }, { status: 404 })
    }

    if (pending.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (pending.status !== 'active') {
      return NextResponse.json({ error: 'Checkout session is no longer active' }, { status: 410 })
    }

    if (pending.expiresAt < new Date()) {
      await prisma.pendingCheckout.update({
        where: { checkoutSessionId },
        data: { status: 'expired' },
      })
      return NextResponse.json({ error: 'Checkout session expired. Please restart checkout.' }, { status: 410 })
    }

    // =========================================================================
    // FETCH NEW VEHICLE
    // =========================================================================
    const car = await prisma.rentalCar.findUnique({
      where: { id: vehicleId },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        dailyRate: true,
        weeklyRate: true,
        monthlyRate: true,
        estimatedValue: true,
        airportPickup: true,
        hotelDelivery: true,
        homeDelivery: true,
        airportFee: true,
        hotelFee: true,
        homeFee: true,
        noDeposit: true,
        customDepositAmount: true,
        vehicleDepositMode: true,
        isActive: true,
        city: true,
        host: {
          select: {
            id: true,
            requireDeposit: true,
            depositAmount: true,
            makeDeposits: true,
          },
        },
      },
    })

    if (!car || !car.isActive) {
      return NextResponse.json({ error: 'Vehicle not available' }, { status: 404 })
    }

    // =========================================================================
    // REBUILD INSURANCE OPTIONS
    // =========================================================================
    const startDate = new Date(pending.startDate)
    const endDate = new Date(pending.endDate)
    const numberOfDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    const vehicleValue = car.estimatedValue ? Number(car.estimatedValue) : 30000
    const insuranceOptions = await buildInsuranceOptions(vehicleValue, numberOfDays)

    // =========================================================================
    // REBUILD DELIVERY OPTIONS
    // =========================================================================
    const deliveryOptions: DeliveryOption[] = [
      { type: 'pickup', label: 'Host Pickup', fee: 0, available: true },
      { type: 'airport', label: 'Airport Delivery', fee: car.airportFee, available: car.airportPickup },
      { type: 'hotel', label: 'Hotel Delivery', fee: car.hotelFee, available: car.hotelDelivery },
      { type: 'home', label: 'Home Delivery', fee: car.homeFee, available: car.homeDelivery },
    ]

    // =========================================================================
    // RECALCULATE DEPOSIT
    // =========================================================================
    const deposit = getActualDeposit(car)

    // =========================================================================
    // PRESERVE COMPATIBLE SELECTIONS
    // =========================================================================

    // Insurance: keep tier if it still exists (all 4 tiers are always present)
    const selectedInsurance = pending.selectedInsurance ?? null

    // Delivery: keep if still available on new car, else reset to null
    let selectedDelivery = pending.selectedDelivery ?? null
    if (selectedDelivery) {
      const matchingOption = deliveryOptions.find(
        (opt) => opt.type === selectedDelivery && opt.available,
      )
      if (!matchingOption) {
        selectedDelivery = null
      }
    }

    // Add-ons: keep as-is (they're vehicle-agnostic)
    // No changes needed — selectedAddOns remain on the PendingCheckout record

    // =========================================================================
    // CANCEL EXISTING PAYMENT INTENT (amounts changed)
    // =========================================================================
    if (pending.paymentIntentId) {
      try {
        await stripe.paymentIntents.cancel(pending.paymentIntentId)
        console.log(`[checkout/swap] Cancelled PaymentIntent ${pending.paymentIntentId}`)
      } catch (err) {
        // Non-fatal — PI may already be cancelled or in a terminal state
        console.warn(`[checkout/swap] Failed to cancel PaymentIntent ${pending.paymentIntentId}:`, err)
      }
    }

    // =========================================================================
    // UPDATE PENDING CHECKOUT
    // =========================================================================
    await prisma.pendingCheckout.update({
      where: { checkoutSessionId },
      data: {
        vehicleId,
        insuranceOptions: insuranceOptions as any,
        deliveryOptions: deliveryOptions as any,
        dailyRateAtCheckout: car.dailyRate,
        selectedInsurance: selectedInsurance,
        selectedDelivery: selectedDelivery,
        checkoutStep: 'INSURANCE',
        paymentIntentId: null,
        // Extend TTL on swap (15 more minutes)
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    })

    console.log(`[checkout/swap] Session ${checkoutSessionId} swapped from vehicle ${pending.vehicleId} to ${vehicleId} by user ${user.id}`)

    return NextResponse.json({
      insuranceOptions,
      deliveryOptions,
      deposit,
      selectedInsurance,
      selectedDelivery,
      vehicleCity: car.city || 'Phoenix',
    })
  } catch (error) {
    console.error('[checkout/swap] Error:', error)
    return NextResponse.json({ error: 'Failed to swap vehicle' }, { status: 500 })
  }
}

// =========================================================================
// HELPERS
// =========================================================================

async function buildInsuranceOptions(
  vehicleValue: number,
  numberOfDays: number,
): Promise<InsuranceTierOption[]> {
  // Fetch primary insurance provider
  const provider = await prisma.insuranceProvider.findFirst({
    where: { isPrimary: true, isActive: true },
  })

  if (!provider) {
    // Return empty — user proceeds without insurance options
    return []
  }

  const pricingRules = provider.pricingRules as any
  const coverageTiers = provider.coverageTiers as any

  // Determine pricing bracket based on vehicle value (same logic as insurance/quote)
  let bracket: any
  if (vehicleValue < 25000) {
    bracket = pricingRules.under25k
  } else if (vehicleValue < 50000) {
    bracket = pricingRules['25to50k']
  } else if (vehicleValue < 100000) {
    bracket = pricingRules['50to100k']
  } else {
    bracket = pricingRules.over100k
  }

  const tiers: Array<'MINIMUM' | 'BASIC' | 'PREMIUM' | 'LUXURY'> = [
    'MINIMUM', 'BASIC', 'PREMIUM', 'LUXURY',
  ]

  return tiers.map((tier) => {
    const dailyPremium = bracket?.[tier] || 0
    const totalPremium = dailyPremium * numberOfDays
    const coverage = coverageTiers?.[tier] || {}

    // MINIMUM tier increases deposit
    let increasedDeposit: number | null = null
    if (tier === 'MINIMUM') {
      if (vehicleValue < 25000) increasedDeposit = 2500
      else if (vehicleValue < 50000) increasedDeposit = 5000
      else if (vehicleValue < 100000) increasedDeposit = 10000
      else increasedDeposit = Math.min(Math.round(vehicleValue * 0.2), 1000000)
    }

    return {
      tier,
      dailyPremium,
      totalPremium,
      coverage: {
        liability: coverage.liability || 0,
        collision: coverage.collision === 'vehicle_value' ? 'vehicle_value' as const : (coverage.collision || 0),
        deductible: coverage.deductible || 0,
        description: coverage.description || '',
      },
      increasedDeposit,
    }
  })
}
