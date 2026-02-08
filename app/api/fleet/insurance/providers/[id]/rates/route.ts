// app/api/fleet/insurance/providers/[id]/rates/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { validatePricingRules } from '@/lib/insurance-utils'

/**
 * GET /api/fleet/insurance/providers/[id]/rates
 * Get current rates for a provider
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const provider = await prisma.insuranceProvider.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        pricingRules: true,
        coverageTiers: true,
        revenueShare: true
      }
    })

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(provider)

  } catch (error) {
    console.error('Rate fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rates' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/fleet/insurance/providers/[id]/rates
 * Update provider rates with history tracking
 * 
 * Body:
 * {
 *   pricingRules: {...},
 *   effectiveDate: "2025-01-01",
 *   reason: "Annual rate adjustment",
 *   changedBy: "admin@itwhip.com",
 *   notifyAffectedParties?: boolean
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { pricingRules, effectiveDate, reason, changedBy, notifyAffectedParties } = body

    // Validation
    if (!pricingRules) {
      return NextResponse.json(
        { error: 'pricingRules is required' },
        { status: 400 }
      )
    }

    if (!changedBy) {
      return NextResponse.json(
        { error: 'changedBy is required' },
        { status: 400 }
      )
    }

    // Validate pricing rules structure
    const validation = validatePricingRules(pricingRules)
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'Invalid pricing rules',
          details: validation.errors
        },
        { status: 400 }
      )
    }

    // Get current provider
    const provider = await prisma.insuranceProvider.findUnique({
      where: { id: id }
    })

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }

    const oldRates = provider.pricingRules as any
    const newRates = pricingRules

    // Track rate changes for history
    const rateChanges: any[] = []

    const vehicleClasses = ['under25k', '25kto50k', '50kto75k', '75kto100k', 'over100k']
    const tiers = ['MINIMUM', 'BASIC', 'PREMIUM', 'LUXURY']

    for (const vehicleClass of vehicleClasses) {
      for (const tier of tiers) {
        const oldRate = oldRates?.[vehicleClass]?.[tier] || 0
        const newRate = newRates[vehicleClass][tier]

        if (oldRate !== newRate) {
          rateChanges.push({
            providerId: id,
            tier,
            vehicleClass,
            oldRate,
            newRate,
            effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
            changedBy,
            reason: reason || 'Rate update'
          })
        }
      }
    }

    // Update provider rates
    const updatedProvider = await prisma.insuranceProvider.update({
      where: { id: id },
      data: { pricingRules: newRates }
    })

    // Create rate history records
    if (rateChanges.length > 0) {
      await prisma.insuranceRateHistory.createMany({
        data: rateChanges
      })
    }

    // Get affected bookings (future bookings with this provider)
    const affectedBookings = await prisma.insurancePolicy.count({
      where: {
        providerId: id,
        status: 'ACTIVE',
        effectiveDate: {
          gte: effectiveDate ? new Date(effectiveDate) : new Date()
        }
      }
    })

    return NextResponse.json({
      success: true,
      provider: updatedProvider,
      rateChanges: rateChanges.length,
      affectedBookings,
      message: `Successfully updated ${rateChanges.length} rates. ${affectedBookings} future bookings may be affected.`,
      shouldNotify: notifyAffectedParties && affectedBookings > 0,
      changes: rateChanges.map(c => ({
        tier: c.tier,
        vehicleClass: c.vehicleClass,
        oldRate: c.oldRate,
        newRate: c.newRate,
        change: c.newRate - c.oldRate,
        percentChange: c.oldRate > 0 
          ? ((c.newRate - c.oldRate) / c.oldRate * 100).toFixed(1) + '%'
          : 'N/A'
      }))
    })

  } catch (error) {
    console.error('Rate update error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update rates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/fleet/insurance/providers/[id]/rates
 * Partial rate update (specific tier or vehicle class)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { vehicleClass, tier, newRate, reason, changedBy } = body

    if (!vehicleClass || !tier || newRate === undefined || !changedBy) {
      return NextResponse.json(
        { error: 'vehicleClass, tier, newRate, and changedBy are required' },
        { status: 400 }
      )
    }

    // Get current provider
    const provider = await prisma.insuranceProvider.findUnique({
      where: { id: id }
    })

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }

    const pricingRules = provider.pricingRules as any
    const oldRate = pricingRules[vehicleClass]?.[tier] || 0

    // Update specific rate
    pricingRules[vehicleClass][tier] = newRate

    // Update provider
    const updatedProvider = await prisma.insuranceProvider.update({
      where: { id: id },
      data: { pricingRules }
    })

    // Create rate history
    await prisma.insuranceRateHistory.create({
      data: {
        id: crypto.randomUUID(),
        change: newRate - oldRate,
        changeType: newRate > oldRate ? 'INCREASE' : 'DECREASE',
        providerId: id,
        tier,
        vehicleClass,
        oldRate,
        newRate,
        effectiveDate: new Date(),
        changedBy,
        reason: reason || `Updated ${tier} rate for ${vehicleClass}`
      } as any
    })

    return NextResponse.json({
      success: true,
      provider: updatedProvider,
      change: {
        vehicleClass,
        tier,
        oldRate,
        newRate,
        difference: newRate - oldRate,
        percentChange: oldRate > 0 
          ? ((newRate - oldRate) / oldRate * 100).toFixed(1) + '%'
          : 'N/A'
      }
    })

  } catch (error) {
    console.error('Partial rate update error:', error)
    return NextResponse.json(
      { error: 'Failed to update rate' },
      { status: 500 }
    )
  }
}