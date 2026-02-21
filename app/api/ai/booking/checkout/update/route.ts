// app/api/ai/booking/checkout/update/route.ts
// PATCH selections against a checkoutSessionId (validates userId owns session)

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/app/lib/database/prisma'
import { getCheckoutUser } from '../auth'

const updateSchema = z.object({
  checkoutSessionId: z.string().min(1),
  selectedInsurance: z.enum(['MINIMUM', 'BASIC', 'PREMIUM', 'LUXURY']).optional(),
  selectedDelivery: z.enum(['pickup', 'airport', 'hotel', 'home']).optional(),
  selectedAddOns: z.array(z.enum(['refuelService', 'additionalDriver', 'extraMiles', 'vipConcierge'])).optional(),
  checkoutStep: z.enum(['INSURANCE', 'DELIVERY', 'ADDONS', 'REVIEW', 'PAYMENT']).optional(),
  appliedCredits: z.number().min(0).optional(),
  appliedBonus: z.number().min(0).optional(),
  appliedDepositWallet: z.number().min(0).optional(),
  promoCode: z.string().optional(),
  promoDiscount: z.number().min(0).optional(),
  selectedPaymentMethod: z.string().optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    // Auth check — uses accessToken cookie (same as guest API)
    const user = await getCheckoutUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Parse request
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const {
      checkoutSessionId, selectedInsurance, selectedDelivery, selectedAddOns,
      checkoutStep, appliedCredits, appliedBonus, appliedDepositWallet,
      promoCode, promoDiscount, selectedPaymentMethod,
    } = parsed.data

    // Fetch pending checkout and verify ownership
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
      // Mark as expired
      await prisma.pendingCheckout.update({
        where: { checkoutSessionId },
        data: { status: 'expired' },
      })
      return NextResponse.json({ error: 'Checkout session expired. Please restart checkout.' }, { status: 410 })
    }

    // Build update data — only update fields that were provided
    const updateData: any = { updatedAt: new Date() }
    if (selectedInsurance !== undefined) updateData.selectedInsurance = selectedInsurance
    if (selectedDelivery !== undefined) updateData.selectedDelivery = selectedDelivery
    if (selectedAddOns !== undefined) updateData.selectedAddOns = selectedAddOns
    if (checkoutStep !== undefined) updateData.checkoutStep = checkoutStep
    if (appliedCredits !== undefined) updateData.appliedCredits = appliedCredits
    if (appliedBonus !== undefined) updateData.appliedBonus = appliedBonus
    if (appliedDepositWallet !== undefined) updateData.appliedDepositWallet = appliedDepositWallet
    if (promoCode !== undefined) updateData.promoCode = promoCode
    if (promoDiscount !== undefined) updateData.promoDiscount = promoDiscount
    if (selectedPaymentMethod !== undefined) updateData.selectedPaymentMethod = selectedPaymentMethod

    // Extend TTL on each update (15 more minutes)
    updateData.expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.pendingCheckout.update({
      where: { checkoutSessionId },
      data: updateData,
    })

    // Price change detection — compare stored rate vs live rate
    let priceChanged: { oldRate: number; newRate: number } | null = null
    if (pending.dailyRateAtCheckout !== null) {
      const car = await prisma.rentalCar.findUnique({
        where: { id: pending.vehicleId },
        select: { dailyRate: true },
      })
      if (car && car.dailyRate !== pending.dailyRateAtCheckout) {
        priceChanged = { oldRate: pending.dailyRateAtCheckout, newRate: car.dailyRate }
      }
    }

    return NextResponse.json({ success: true, priceChanged })
  } catch (error) {
    console.error('[checkout/update] Error:', error)
    return NextResponse.json({ error: 'Failed to update checkout' }, { status: 500 })
  }
}
