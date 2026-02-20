// app/api/partner/revenue/tier/route.ts
// Revenue Tier Selection API - Allows partners to choose their revenue path and tier

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyHostRequest } from '@/app/lib/auth/verify-request'

const VALID_REVENUE_PATHS = ['insurance', 'tiers'] as const
const VALID_REVENUE_TIERS = ['p2p', 'commercial', 'self_manage'] as const

type RevenuePath = typeof VALID_REVENUE_PATHS[number]
type RevenueTier = typeof VALID_REVENUE_TIERS[number]

/**
 * Calculate commission rate based on revenue path and tier selection
 */
function getCommissionRate(revenuePath: RevenuePath, revenueTier: RevenueTier | null): number {
  if (revenuePath === 'insurance') {
    return 0.60 // Platform keeps 60%, host gets 40%
  }

  // Tiers path
  switch (revenueTier) {
    case 'p2p':
      return 0.25 // Host gets 75%
    case 'commercial':
      return 0.10 // Host gets 90%
    case 'self_manage':
      return 0.25 // Host gets 75%
    default:
      return 0.25
  }
}

/**
 * GET /api/partner/revenue/tier
 * Returns current tier info for the authenticated partner
 */
export async function GET(request: NextRequest) {
  try {
    const hostId = await verifyHostRequest(request)
    if (!hostId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        revenuePath: true,
        revenueTier: true,
        commissionRate: true,
        currentCommissionRate: true,
      }
    })

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    // Count fleet size for commission tier display
    const fleetSize = await prisma.rentalCar.count({
      where: { hostId }
    })

    const commissionRate = partner.currentCommissionRate ?? partner.commissionRate ?? 0.25

    return NextResponse.json({
      success: true,
      revenuePath: partner.revenuePath || null,
      revenueTier: partner.revenueTier || null,
      commissionRate,
      payoutPercentage: 1 - commissionRate,
      fleetSize,
    })
  } catch (error: any) {
    console.error('[Revenue Tier GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tier info' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/partner/revenue/tier
 * Updates the partner's revenue path and tier selection
 */
export async function PUT(request: NextRequest) {
  try {
    const hostId = await verifyHostRequest(request)
    if (!hostId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { revenuePath, revenueTier } = body as {
      revenuePath: string
      revenueTier?: string | null
    }

    // Validate revenuePath
    if (!revenuePath || !VALID_REVENUE_PATHS.includes(revenuePath as RevenuePath)) {
      return NextResponse.json(
        { error: 'Invalid revenuePath. Must be "insurance" or "tiers".' },
        { status: 400 }
      )
    }

    // Validate tier based on path
    if (revenuePath === 'insurance') {
      // Insurance path: revenueTier should be null
      if (revenueTier) {
        return NextResponse.json(
          { error: 'revenueTier must be null when revenuePath is "insurance".' },
          { status: 400 }
        )
      }
    } else if (revenuePath === 'tiers') {
      // Tiers path: revenueTier must be one of p2p/commercial/self_manage
      if (!revenueTier || !VALID_REVENUE_TIERS.includes(revenueTier as RevenueTier)) {
        return NextResponse.json(
          { error: 'revenueTier must be "p2p", "commercial", or "self_manage" when revenuePath is "tiers".' },
          { status: 400 }
        )
      }
    }

    // Fetch current partner data
    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        commissionRate: true,
        currentCommissionRate: true,
        partnerCompanyName: true,
      }
    })

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    const oldRate = partner.currentCommissionRate ?? partner.commissionRate ?? 0.25
    const effectiveTier = revenuePath === 'insurance' ? null : (revenueTier as RevenueTier)
    const newRate = getCommissionRate(revenuePath as RevenuePath, effectiveTier)

    // Update RentalHost with new revenue path, tier, and commission rate
    await prisma.rentalHost.update({
      where: { id: hostId },
      data: {
        revenuePath: revenuePath,
        revenueTier: effectiveTier,
        commissionRate: newRate,
        currentCommissionRate: newRate,
      }
    })

    // Create audit record in partner_commission_history
    const tierLabel = effectiveTier
      ? `${revenuePath}/${effectiveTier}`
      : revenuePath
    await prisma.partner_commission_history.create({
      data: {
        id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        hostId: hostId,
        oldRate: oldRate,
        newRate: newRate,
        reason: `Revenue path change: ${tierLabel} (${Math.round((1 - newRate) * 100)}% payout)`,
        changedBy: hostId,
      }
    })

    console.log(`[Revenue Tier] Updated partner ${partner.partnerCompanyName || hostId}:`, {
      revenuePath,
      revenueTier: effectiveTier,
      oldRate: `${Math.round(oldRate * 100)}%`,
      newRate: `${Math.round(newRate * 100)}%`,
    })

    return NextResponse.json({
      success: true,
      revenuePath,
      revenueTier: effectiveTier,
      commissionRate: newRate,
      payoutPercentage: 1 - newRate,
    })
  } catch (error: any) {
    console.error('[Revenue Tier PUT] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update tier' },
      { status: 500 }
    )
  }
}
