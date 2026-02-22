// app/api/ai/booking/checkout/payment-intent/route.ts
// Create Stripe PaymentIntent from checkoutSessionId — all amounts calculated server-side

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'
import prisma from '@/app/lib/database/prisma'
import { getCheckoutUser } from '../auth'
import { getActualDeposit } from '@/app/[locale]/(guest)/rentals/lib/booking-pricing'
import { getTaxRate } from '@/app/[locale]/(guest)/rentals/lib/arizona-taxes'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

const paymentSchema = z.object({
  checkoutSessionId: z.string().min(1),
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
    const parsed = paymentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    // Load checkout session — ALL selections are server-side
    const pending = await prisma.pendingCheckout.findUnique({
      where: { checkoutSessionId: parsed.data.checkoutSessionId },
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
        where: { checkoutSessionId: parsed.data.checkoutSessionId },
        data: { status: 'expired' },
      })
      return NextResponse.json({ error: 'Checkout session expired' }, { status: 410 })
    }

    // Fetch vehicle data for server-side calculation
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
        airportFee: true,
        hotelFee: true,
        homeFee: true,
        noDeposit: true,
        customDepositAmount: true,
        vehicleDepositMode: true,
        city: true,
        isActive: true,
        hostId: true,
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
      return NextResponse.json({ error: 'Vehicle no longer available' }, { status: 404 })
    }

    // =========================================================================
    // SERVER-SIDE AMOUNT CALCULATION (client NEVER sends amounts)
    // =========================================================================
    const startDate = new Date(pending.startDate)
    const endDate = new Date(pending.endDate)
    const numberOfDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    if (numberOfDays < 1) {
      return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })
    }

    // Base rental price
    let basePrice = car.dailyRate * numberOfDays

    // Apply weekly/monthly discounts
    if (car.monthlyRate && numberOfDays >= 28) {
      const monthlyTotal = car.monthlyRate * Math.ceil(numberOfDays / 30)
      if (monthlyTotal < basePrice) basePrice = monthlyTotal
    } else if (car.weeklyRate && numberOfDays >= 7) {
      const weeklyTotal = car.weeklyRate * Math.ceil(numberOfDays / 7)
      if (weeklyTotal < basePrice) basePrice = weeklyTotal
    }

    // Service fee: 15% of base rental
    const serviceFee = Math.round(basePrice * 0.15 * 100) / 100

    // Insurance: read tier from server session
    let insuranceTotal = 0
    if (pending.selectedInsurance && pending.selectedInsurance !== 'MINIMUM') {
      const vehicleValue = car.estimatedValue ? Number(car.estimatedValue) : 30000
      const dailyPremium = await getInsuranceDailyRate(vehicleValue, pending.selectedInsurance)
      insuranceTotal = Math.round(dailyPremium * numberOfDays * 100) / 100
    } else if (pending.selectedInsurance === 'MINIMUM') {
      // MINIMUM = state minimum, no extra premium
      insuranceTotal = 0
    }

    // Delivery fee: read type from server session
    let deliveryFee = 0
    if (pending.selectedDelivery === 'airport') deliveryFee = car.airportFee
    else if (pending.selectedDelivery === 'hotel') deliveryFee = car.hotelFee
    else if (pending.selectedDelivery === 'home') deliveryFee = car.homeFee

    // Add-ons: read from server session
    const selectedAddOns = (pending.selectedAddOns as string[] | null) || []
    let addOnsTotal = 0
    const addOnBreakdown: Array<{ id: string; label: string; amount: number }> = []

    for (const addOnId of selectedAddOns) {
      let amount = 0
      let label = ''
      switch (addOnId) {
        case 'refuelService':
          amount = 75
          label = 'Refuel Service'
          break
        case 'additionalDriver':
          amount = 50 * numberOfDays
          label = 'Additional Driver'
          break
        case 'extraMiles':
          amount = 295
          label = 'Extra Miles (+500 mi)'
          break
        case 'vipConcierge':
          amount = 150 * numberOfDays
          label = 'VIP Concierge'
          break
      }
      addOnsTotal += amount
      addOnBreakdown.push({ id: addOnId, label, amount })
    }

    // Tax: city-specific Arizona rate
    const city = car.city || 'Phoenix'
    const { rate: taxRate, display: taxRateDisplay } = getTaxRate(city)
    const taxableAmount = basePrice + serviceFee + insuranceTotal + deliveryFee + addOnsTotal
    const tax = Math.round(taxableAmount * taxRate * 100) / 100

    // Deposit
    let deposit = getActualDeposit(car)
    // MINIMUM insurance increases deposit
    if (pending.selectedInsurance === 'MINIMUM') {
      const vehicleValue = car.estimatedValue ? Number(car.estimatedValue) : 30000
      if (vehicleValue < 25000) deposit = Math.max(deposit, 2500)
      else if (vehicleValue < 50000) deposit = Math.max(deposit, 5000)
      else if (vehicleValue < 100000) deposit = Math.max(deposit, 10000)
      else deposit = Math.max(deposit, Math.min(Math.round(vehicleValue * 0.2), 1000000))
    }

    // Grand total (rental charges + tax — deposit is a separate hold)
    const rentalTotal = Math.round((taxableAmount + tax) * 100) / 100

    // =========================================================================
    // APPLY CREDITS, BONUSES, DEPOSIT WALLET
    // =========================================================================
    const appliedCredits = pending.appliedCredits || 0
    const appliedBonus = pending.appliedBonus || 0
    const appliedDepositWallet = pending.appliedDepositWallet || 0
    const promoDiscount = pending.promoDiscount || 0

    // Credits + bonus + promo reduce rental charges
    const rentalDiscount = Math.min(appliedCredits + appliedBonus + promoDiscount, rentalTotal)
    const adjustedRentalTotal = Math.round((rentalTotal - rentalDiscount) * 100) / 100

    // Deposit wallet reduces deposit
    const adjustedDeposit = Math.round(Math.max(deposit - appliedDepositWallet, 0) * 100) / 100

    // Convert to cents for Stripe — enforce $1.00 minimum (Stripe rejects $0 charges)
    const rentalCents = Math.round(adjustedRentalTotal * 100)
    const depositCents = Math.round(adjustedDeposit * 100)
    const totalChargeCents = Math.max(rentalCents + depositCents, 100)

    // Platform fee: 15% of rental amount (before tax)
    const platformFeeCents = Math.round(basePrice * 0.15 * 100)

    console.log(`[checkout/payment-intent] ${numberOfDays} days × $${car.dailyRate}/day = $${rentalTotal} rental + $${deposit} deposit`)
    if (rentalDiscount > 0 || appliedDepositWallet > 0) {
      console.log(`[checkout/payment-intent] Applied: credits=$${appliedCredits} bonus=$${appliedBonus} promo=$${promoDiscount} depositWallet=$${appliedDepositWallet}`)
    }
    console.log(`[checkout/payment-intent] Charging: $${(totalChargeCents / 100).toFixed(2)} (after discounts)`)

    // =========================================================================
    // STRIPE PAYMENT INTENT
    // =========================================================================

    // Resolve the correct Stripe customer BEFORE creating the PI.
    // If a saved card is selected, use that card's customer so confirm() works.
    let stripeCustomerId = await getOrCreateStripeCustomer(user)

    if (pending.selectedPaymentMethod) {
      try {
        const pm = await stripe.paymentMethods.retrieve(pending.selectedPaymentMethod)
        const pmCustomer = pm.customer as string | null
        if (pmCustomer && pmCustomer !== stripeCustomerId) {
          console.log(`[checkout/payment-intent] Using saved card's customer ${pmCustomer} instead of ${stripeCustomerId}`)
          stripeCustomerId = pmCustomer
        }
      } catch (pmError) {
        console.warn('[checkout/payment-intent] Could not retrieve saved payment method, using default customer:', pmError)
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalChargeCents,
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: {
        type: 'choe_checkout',
        checkoutSessionId: parsed.data.checkoutSessionId,
        userId: user.id,
        carId: pending.vehicleId,
        hostId: car.hostId,
        calculatedServerSide: 'true',
        numberOfDays: numberOfDays.toString(),
        dailyRate: car.dailyRate.toString(),
        rentalTotal: rentalTotal.toString(),
        rentalTotalBeforeDiscounts: rentalTotal.toString(),
        depositAmount: deposit.toString(),
        insurance: pending.selectedInsurance || 'none',
        delivery: pending.selectedDelivery || 'pickup',
        addOns: selectedAddOns.join(','),
        startDate: pending.startDate.toISOString().split('T')[0],
        endDate: pending.endDate.toISOString().split('T')[0],
        appliedCredits: appliedCredits.toString(),
        appliedBonus: appliedBonus.toString(),
        appliedDepositWallet: appliedDepositWallet.toString(),
        promoCode: pending.promoCode || '',
        promoDiscount: promoDiscount.toString(),
      },
      description: `Car rental: ${car.year} ${car.make} ${car.model} (via Choé)`,
      statement_descriptor: 'ITWHIP RENTAL',
      automatic_payment_methods: { enabled: true },
      capture_method: 'manual',
      setup_future_usage: 'on_session',
      receipt_email: user.email!,
    })

    // Save PI ID and extend TTL for payment phase (30 minutes)
    await prisma.pendingCheckout.update({
      where: { checkoutSessionId: parsed.data.checkoutSessionId },
      data: {
        paymentIntentId: paymentIntent.id,
        checkoutStep: 'PAYMENT',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    })

    // =========================================================================
    // SAVED CARD: Confirm server-side (skip PaymentElement UI)
    // =========================================================================
    if (pending.selectedPaymentMethod) {
      console.log(`[checkout/payment-intent] Confirming with saved card: ${pending.selectedPaymentMethod}`)

      try {
        const confirmedPI = await stripe.paymentIntents.confirm(paymentIntent.id, {
          payment_method: pending.selectedPaymentMethod,
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'}/choe`,
        })

        if (confirmedPI.status === 'requires_capture') {
          // Authorized with saved card — client skips PaymentCard entirely
          console.log(`[checkout/payment-intent] Saved card authorized: ${confirmedPI.id}`)
          return NextResponse.json({
            confirmed: true,
            paymentIntentId: confirmedPI.id,
          })
        }

        if (confirmedPI.status === 'requires_action') {
          // 3DS required — client needs to handle the challenge
          console.log(`[checkout/payment-intent] 3DS required for saved card: ${confirmedPI.id}`)
          return NextResponse.json({
            requiresAction: true,
            clientSecret: confirmedPI.client_secret,
            paymentIntentId: confirmedPI.id,
          })
        }

        // Unexpected status — fall through to normal card entry
        console.warn(`[checkout/payment-intent] Unexpected PI status after confirm: ${confirmedPI.status}`)
      } catch (confirmError) {
        // Saved card confirmation failed (expired, declined, etc.) — fall through to new card entry
        console.warn(`[checkout/payment-intent] Saved card confirmation failed, falling back to new card:`, confirmError)
      }
    }

    // =========================================================================
    // NEW CARD: Return clientSecret for PaymentElement
    // =========================================================================
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      breakdown: {
        numberOfDays,
        dailyRate: car.dailyRate,
        basePrice: Math.round(basePrice * 100) / 100,
        serviceFee,
        insurance: insuranceTotal,
        insuranceTier: pending.selectedInsurance || 'none',
        delivery: deliveryFee,
        deliveryType: pending.selectedDelivery || 'pickup',
        addOns: addOnBreakdown,
        addOnsTotal,
        taxableAmount: Math.round(taxableAmount * 100) / 100,
        taxRate: taxRateDisplay,
        tax,
        rentalTotal,
        deposit,
        grandTotal: Math.round((rentalTotal + deposit) * 100) / 100,
        // Credit/bonus/promo discounts applied
        appliedCredits,
        appliedBonus,
        appliedDepositWallet,
        promoDiscount,
        adjustedRentalTotal,
        adjustedDeposit,
        chargedTotal: Math.round((adjustedRentalTotal + adjustedDeposit) * 100) / 100,
      },
    })
  } catch (error) {
    console.error('[checkout/payment-intent] Error:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
  }
}

// =========================================================================
// HELPERS
// =========================================================================

async function getInsuranceDailyRate(vehicleValue: number, tier: string): Promise<number> {
  const provider = await prisma.insuranceProvider.findFirst({
    where: { isPrimary: true, isActive: true },
    select: { pricingRules: true },
  })
  if (!provider) return 0

  const rules = provider.pricingRules as any
  let bracket: any
  if (vehicleValue < 25000) bracket = rules.under25k
  else if (vehicleValue < 50000) bracket = rules['25to50k']
  else if (vehicleValue < 100000) bracket = rules['50to100k']
  else bracket = rules.over100k

  return bracket?.[tier] || 0
}

async function getOrCreateStripeCustomer(user: { id: string; name: string | null; email: string | null }): Promise<string> {
  if (!user.email) throw new Error('User email required for Stripe')

  const existing = await stripe.customers.list({ email: user.email, limit: 1 })
  if (existing.data.length > 0) return existing.data[0].id

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name || undefined,
    metadata: { userId: user.id },
  })
  return customer.id
}
