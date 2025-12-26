// app/api/fleet/partners/[id]/reactivate/route.ts
// POST /api/fleet/partners/[id]/reactivate - Reactivate a suspended partner

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Find the partner
    const partner = await prisma.rentalHost.findUnique({
      where: { id },
      include: {
        partnerDocuments: {
          where: { isExpired: true }
        }
      }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    if (partner.active) {
      return NextResponse.json(
        { error: 'Partner is already active' },
        { status: 400 }
      )
    }

    // Check for expired documents
    if (partner.partnerDocuments.length > 0) {
      const expiredTypes = partner.partnerDocuments.map(d => d.type).join(', ')
      return NextResponse.json(
        {
          error: `Cannot reactivate: Partner has expired documents (${expiredTypes}). Documents must be updated first.`,
          expiredDocuments: partner.partnerDocuments.map(d => ({
            id: d.id,
            type: d.type,
            expiresAt: d.expiresAt
          }))
        },
        { status: 400 }
      )
    }

    // Reactivate partner
    await prisma.rentalHost.update({
      where: { id },
      data: {
        active: true,
        approvalStatus: 'APPROVED'
      }
    })

    // Reactivate vehicles (they will need individual review)
    // For now, we keep them inactive and require manual reactivation
    // await prisma.rentalCar.updateMany({
    //   where: { hostId: id },
    //   data: { active: true }
    // })

    // Log the reactivation
    await prisma.activityLog.create({
      data: {
        action: 'PARTNER_REACTIVATED',
        details: JSON.stringify({
          partnerId: id,
          companyName: partner.partnerCompanyName
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      }
    })

    console.log(`[Partner Reactivate] Partner reactivated:`, {
      partnerId: id,
      companyName: partner.partnerCompanyName
    })

    return NextResponse.json({
      success: true,
      message: 'Partner reactivated successfully. Vehicle listings require manual reactivation.'
    })

  } catch (error: any) {
    console.error('[Partner Reactivate] Error:', error)
    return NextResponse.json(
      { error: 'Failed to reactivate partner' },
      { status: 500 }
    )
  }
}
