// app/api/ai/booking/checkout/update/route.ts
// PATCH selections against a checkoutSessionId (validates userId owns session)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import prisma from '@/app/lib/database/prisma'

const updateSchema = z.object({
  checkoutSessionId: z.string().min(1),
  selectedInsurance: z.enum(['MINIMUM', 'BASIC', 'PREMIUM', 'LUXURY']).optional(),
  selectedDelivery: z.enum(['pickup', 'airport', 'hotel', 'home']).optional(),
  selectedAddOns: z.array(z.enum(['refuelService', 'additionalDriver', 'extraMiles', 'vipConcierge'])).optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
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

    const { checkoutSessionId, selectedInsurance, selectedDelivery, selectedAddOns } = parsed.data

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

    // Extend TTL on each update (15 more minutes)
    updateData.expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.pendingCheckout.update({
      where: { checkoutSessionId },
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[checkout/update] Error:', error)
    return NextResponse.json({ error: 'Failed to update checkout' }, { status: 500 })
  }
}
