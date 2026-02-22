// app/api/ai/booking/checkout/init/route.ts
// Initialize the in-chat checkout pipeline — returns insurance, delivery, add-ons, and checkoutSessionId

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import Stripe from 'stripe'
import prisma from '@/app/lib/database/prisma'
import { getCheckoutUser } from '../auth'
import { getActualDeposit } from '@/app/[locale]/(guest)/rentals/lib/booking-pricing'
import type {
  InsuranceTierOption,
  DeliveryOption,
  AddOnOption,
} from '@/app/lib/ai-booking/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

const initSchema = z.object({
  vehicleId: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  numberOfDays: z.number().int().positive(),
})

export async function POST(request: NextRequest) {
  try {
    // Auth check — uses accessToken cookie (same as guest API)
    const user = await getCheckoutUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Fetch guest balances
    const reviewerProfile = await prisma.reviewerProfile.findUnique({
      where: { email: user.email },
      select: { creditBalance: true, bonusBalance: true, depositWalletBalance: true, stripeCustomerId: true },
    })

    const platformSettings = await prisma.platformSettings.findUnique({
      where: { id: 'global' },
      select: { maxBonusPercentage: true },
    })

    // Parse request
    const body = await request.json()
    const parsed = initSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { vehicleId, startDate, endDate, numberOfDays } = parsed.data

    // Validate dates — use noon UTC to prevent timezone shift (UTC midnight = previous day in MST)
    const start = new Date(startDate + 'T12:00:00Z')
    const end = new Date(endDate + 'T12:00:00Z')
    if (end <= start) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
    }

    // Fetch vehicle with host data for deposit calculation
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

    // Generate checkoutSessionId
    const checkoutSessionId = crypto.randomUUID()

    // =========================================================================
    // INSURANCE OPTIONS
    // =========================================================================
    const vehicleValue = car.estimatedValue ? Number(car.estimatedValue) : 30000
    const insuranceOptions = await buildInsuranceOptions(vehicleValue, numberOfDays)

    // =========================================================================
    // DELIVERY OPTIONS
    // =========================================================================
    const deliveryOptions: DeliveryOption[] = [
      { type: 'pickup', label: 'Host Pickup', fee: 0, available: true },
      { type: 'airport', label: 'Airport Delivery', fee: car.airportFee, available: car.airportPickup },
      { type: 'hotel', label: 'Hotel Delivery', fee: car.hotelFee, available: car.hotelDelivery },
      { type: 'home', label: 'Home Delivery', fee: car.homeFee, available: car.homeDelivery },
    ]

    // =========================================================================
    // ADD-ON OPTIONS
    // =========================================================================
    const addOns: AddOnOption[] = [
      {
        id: 'refuelService',
        label: 'Refuel Service',
        description: 'Return the car at any fuel level — we handle refueling',
        price: 75,
        perDay: false,
        selected: false,
      },
      {
        id: 'additionalDriver',
        label: 'Additional Driver',
        description: 'Add a second authorized driver to your rental',
        price: 50,
        perDay: true,
        selected: false,
      },
      {
        id: 'extraMiles',
        label: 'Extra Miles (+500 mi)',
        description: 'Add 500 extra miles to your rental allowance',
        price: 295,
        perDay: false,
        selected: false,
      },
      {
        id: 'vipConcierge',
        label: 'VIP Concierge',
        description: 'Priority support, premium pickup, and personalized service',
        price: 150,
        perDay: true,
        selected: false,
      },
    ]

    // =========================================================================
    // DEPOSIT
    // =========================================================================
    const deposit = getActualDeposit(car)

    // =========================================================================
    // DATE SOFT-LOCK (15-minute TTL)
    // =========================================================================
    await prisma.pendingCheckout.create({
      data: {
        checkoutSessionId,
        vehicleId,
        startDate: start,
        endDate: end,
        userId: user.id,
        status: 'active',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        checkoutStep: 'INSURANCE',
        insuranceOptions: insuranceOptions as any,
        deliveryOptions: deliveryOptions as any,
        addOnOptions: addOns as any,
        dailyRateAtCheckout: car.dailyRate,
      },
    })

    console.log(`[checkout/init] Session ${checkoutSessionId} created for vehicle ${vehicleId} by user ${user.id}`)

    // Fetch saved cards from Stripe
    let savedCards: Array<{ id: string; brand: string; last4: string; expMonth: number; expYear: number }> = []
    if (reviewerProfile?.stripeCustomerId) {
      try {
        const methods = await stripe.paymentMethods.list({
          customer: reviewerProfile.stripeCustomerId,
          type: 'card',
        })
        savedCards = methods.data.map(pm => ({
          id: pm.id,
          brand: pm.card?.brand ?? 'unknown',
          last4: pm.card?.last4 ?? '****',
          expMonth: pm.card?.exp_month ?? 0,
          expYear: pm.card?.exp_year ?? 0,
        }))
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({
      checkoutSessionId,
      insuranceOptions,
      deliveryOptions,
      addOns,
      deposit,
      vehicleCity: car.city || 'Phoenix',
      guestBalances: {
        credits: reviewerProfile?.creditBalance ?? 0,
        bonus: reviewerProfile?.bonusBalance ?? 0,
        depositWallet: reviewerProfile?.depositWalletBalance ?? 0,
        maxBonusPercent: platformSettings?.maxBonusPercentage ?? 0.25,
      },
      savedCards,
    })
  } catch (error) {
    console.error('[checkout/init] Error:', error)
    return NextResponse.json({ error: 'Failed to initialize checkout' }, { status: 500 })
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
