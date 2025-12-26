// app/api/fleet/partners/[id]/suspend/route.ts
// POST /api/fleet/partners/[id]/suspend - Suspend a partner

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { reason, suspendedBy } = body

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

    if (!partner.active) {
      return NextResponse.json(
        { error: 'Partner is already suspended' },
        { status: 400 }
      )
    }

    // Suspend partner
    await prisma.rentalHost.update({
      where: { id },
      data: {
        active: false,
        approvalStatus: 'SUSPENDED'
      }
    })

    // Deactivate all vehicles
    await prisma.rentalCar.updateMany({
      where: { hostId: id },
      data: { active: false }
    })

    // Log the suspension
    await prisma.activityLog.create({
      data: {
        action: 'PARTNER_SUSPENDED',
        details: JSON.stringify({
          partnerId: id,
          companyName: partner.partnerCompanyName,
          reason: reason,
          suspendedBy: suspendedBy || 'Fleet Admin'
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      }
    })

    console.log(`[Partner Suspend] Partner suspended:`, {
      partnerId: id,
      companyName: partner.partnerCompanyName,
      reason
    })

    return NextResponse.json({
      success: true,
      message: 'Partner suspended successfully'
    })

  } catch (error: any) {
    console.error('[Partner Suspend] Error:', error)
    return NextResponse.json(
      { error: 'Failed to suspend partner' },
      { status: 500 }
    )
  }
}
