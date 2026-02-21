// app/api/ai/booking/checkout/resume/route.ts
// Resume a checkout session that the user left mid-way — rehydrates full checkout state from PendingCheckout

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/app/lib/database/prisma'
import { getCheckoutUser } from '../auth'
import { getActualDeposit } from '@/app/[locale]/(guest)/rentals/lib/booking-pricing'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function GET(request: NextRequest) {
  try {
    // Auth check — uses accessToken cookie (same as guest API)
    const user = await getCheckoutUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get checkoutSessionId from query params
    const { searchParams } = new URL(request.url)
    const checkoutSessionId = searchParams.get('checkoutSessionId')
    if (!checkoutSessionId) {
      return NextResponse.json({ error: 'checkoutSessionId is required' }, { status: 400 })
    }

    // Find PendingCheckout by checkoutSessionId
    const pending = await prisma.pendingCheckout.findUnique({
      where: { checkoutSessionId },
    })

    if (!pending) {
      return NextResponse.json({ error: 'Checkout session not found' }, { status: 404 })
    }

    // Validate ownership
    if (pending.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Validate status is active
    if (pending.status !== 'active') {
      return NextResponse.json({ error: 'Checkout session is no longer active' }, { status: 410 })
    }

    // Check expiration
    if (pending.expiresAt < new Date()) {
      await prisma.pendingCheckout.update({
        where: { checkoutSessionId },
        data: { status: 'expired' },
      })
      return NextResponse.json({ error: 'Checkout session expired. Please restart checkout.' }, { status: 410 })
    }

    // Fetch vehicle data (same select fields as init endpoint)
    const car = await prisma.rentalCar.findUnique({
      where: { id: pending.vehicleId },
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
        photos: {
          where: { deletedAt: null },
          orderBy: [{ isHero: 'desc' }, { order: 'asc' }],
          select: { url: true, caption: true, isHero: true },
          take: 5,
        },
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
      return NextResponse.json({ error: 'Vehicle is no longer available' }, { status: 404 })
    }

    // Price change detection
    let priceChanged: { oldRate: number; newRate: number } | null = null
    if (pending.dailyRateAtCheckout !== null && pending.dailyRateAtCheckout !== car.dailyRate) {
      priceChanged = {
        oldRate: pending.dailyRateAtCheckout,
        newRate: car.dailyRate,
      }
    }

    // Fetch guest balances from ReviewerProfile
    const reviewerProfile = await prisma.reviewerProfile.findUnique({
      where: { email: user.email },
      select: {
        creditBalance: true,
        bonusBalance: true,
        depositWalletBalance: true,
        stripeCustomerId: true,
      },
    })

    const credits = reviewerProfile?.creditBalance ?? 0
    const bonus = reviewerProfile?.bonusBalance ?? 0
    const depositWallet = reviewerProfile?.depositWalletBalance ?? 0
    const stripeCustomerId = reviewerProfile?.stripeCustomerId ?? null

    // Fetch maxBonusPercentage from PlatformSettings
    const platformSettings = await prisma.platformSettings.findUnique({
      where: { id: 'global' },
      select: { maxBonusPercentage: true },
    })
    const maxBonusPercent = platformSettings?.maxBonusPercentage ?? 0.25

    // Retrieve Stripe PaymentIntent client_secret if paymentIntentId exists
    let clientSecret: string | null = null
    if (pending.paymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(pending.paymentIntentId)
        clientSecret = paymentIntent.client_secret ?? null
      } catch (err) {
        console.error('[checkout/resume] Failed to retrieve PaymentIntent:', err)
        // Non-fatal — client can re-create payment intent
      }
    }

    // List saved payment methods (cards) if stripeCustomerId exists
    let savedCards: Array<{
      id: string
      brand: string
      last4: string
      expMonth: number
      expYear: number
    }> = []
    if (stripeCustomerId) {
      try {
        const methods = await stripe.paymentMethods.list({
          customer: stripeCustomerId,
          type: 'card',
        })
        savedCards = methods.data.map((pm) => ({
          id: pm.id,
          brand: pm.card?.brand ?? 'unknown',
          last4: pm.card?.last4 ?? '****',
          expMonth: pm.card?.exp_month ?? 0,
          expYear: pm.card?.exp_year ?? 0,
        }))
      } catch (err) {
        console.error('[checkout/resume] Failed to list saved cards:', err)
        // Non-fatal — user can enter new card
      }
    }

    // Calculate deposit
    const deposit = getActualDeposit(car)

    // Build vehicle summary
    const heroPhoto = car.photos.length > 0 ? car.photos[0].url : null
    const vehicle = {
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      dailyRate: car.dailyRate,
      city: car.city || 'Phoenix',
      depositAmount: deposit,
      photo: heroPhoto,
    }

    console.log(`[checkout/resume] Session ${checkoutSessionId} resumed for vehicle ${pending.vehicleId} by user ${user.id}`)

    return NextResponse.json({
      checkoutSessionId,
      checkoutStep: pending.checkoutStep || 'INSURANCE',
      vehicle,
      startDate: pending.startDate.toISOString().split('T')[0],
      endDate: pending.endDate.toISOString().split('T')[0],
      insuranceOptions: (pending.insuranceOptions as any) || [],
      deliveryOptions: (pending.deliveryOptions as any) || [],
      addOns: (pending.addOnOptions as any) || [],
      selectedInsurance: pending.selectedInsurance,
      selectedDelivery: pending.selectedDelivery,
      selectedAddOns: (pending.selectedAddOns as string[]) || [],
      clientSecret,
      paymentIntentId: pending.paymentIntentId,
      deposit,
      vehicleCity: car.city || 'Phoenix',
      guestBalances: {
        credits,
        bonus,
        depositWallet,
        maxBonusPercent,
      },
      savedCards,
      appliedCredits: pending.appliedCredits || 0,
      appliedBonus: pending.appliedBonus || 0,
      appliedDepositWallet: pending.appliedDepositWallet || 0,
      promoCode: pending.promoCode,
      promoDiscount: pending.promoDiscount || 0,
      priceChanged,
    })
  } catch (error) {
    console.error('[checkout/resume] Error:', error)
    return NextResponse.json({ error: 'Failed to resume checkout' }, { status: 500 })
  }
}
