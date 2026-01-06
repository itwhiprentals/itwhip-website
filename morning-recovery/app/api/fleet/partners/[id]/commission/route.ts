// app/api/fleet/partners/[id]/commission/route.ts
// POST /api/fleet/partners/[id]/commission - Update partner commission rate

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { rate, reason, changedBy } = body

    // Validate rate
    if (typeof rate !== 'number' || rate < 0.05 || rate > 0.50) {
      return NextResponse.json(
        { error: 'Commission rate must be between 5% and 50%' },
        { status: 400 }
      )
    }

    // Find the partner
    const partner = await prisma.rentalHost.findUnique({
      where: { id }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    if (partner.hostType !== 'FLEET_PARTNER' && partner.hostType !== 'PARTNER') {
      return NextResponse.json(
        { error: 'Only fleet partners can have custom commission rates' },
        { status: 400 }
      )
    }

    const oldRate = partner.currentCommissionRate

    // Update commission rate
    await prisma.rentalHost.update({
      where: { id },
      data: {
        currentCommissionRate: rate
      }
    })

    // Log the change
    await prisma.partnerCommissionHistory.create({
      data: {
        hostId: id,
        oldRate: oldRate,
        newRate: rate,
        reason: reason || 'Manual adjustment',
        changedBy: changedBy || 'Fleet Admin'
      }
    })

    console.log(`[Partner Commission] Commission updated:`, {
      partnerId: id,
      companyName: partner.partnerCompanyName,
      oldRate: `${Math.round(oldRate * 100)}%`,
      newRate: `${Math.round(rate * 100)}%`,
      reason
    })

    return NextResponse.json({
      success: true,
      message: 'Commission rate updated successfully',
      oldRate,
      newRate: rate
    })

  } catch (error: any) {
    console.error('[Partner Commission] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update commission rate' },
      { status: 500 }
    )
  }
}

// GET - Get commission history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const history = await prisma.partnerCommissionHistory.findMany({
      where: { hostId: id },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({
      success: true,
      history
    })

  } catch (error: any) {
    console.error('[Partner Commission] Error fetching history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch commission history' },
      { status: 500 }
    )
  }
}
