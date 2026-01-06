// app/api/fleet/partners/[id]/route.ts
// GET /api/fleet/partners/[id] - Get partner details

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const partner = await prisma.rentalHost.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        hostType: true,
        approvalStatus: true,
        active: true,

        // Partner fields
        partnerCompanyName: true,
        partnerSlug: true,
        partnerLogo: true,
        partnerBio: true,
        partnerSupportEmail: true,
        partnerSupportPhone: true,

        // Commission
        currentCommissionRate: true,
        tier1VehicleCount: true,
        tier1CommissionRate: true,
        tier2VehicleCount: true,
        tier2CommissionRate: true,
        tier3VehicleCount: true,
        tier3CommissionRate: true,

        // Stats
        partnerFleetSize: true,
        partnerTotalBookings: true,
        partnerTotalRevenue: true,
        partnerAvgRating: true,

        // Stripe
        stripeConnectAccountId: true,

        // Timestamps
        createdAt: true,
        updatedAt: true,

        // Relations
        partnerApplication: {
          select: {
            id: true,
            status: true,
            submittedAt: true,
            reviewedAt: true,
            reviewedBy: true,
            reviewNotes: true,
            businessType: true,
            yearsInBusiness: true,
            fleetSize: true,
            vehicleTypes: true,
            operatingCities: true
          }
        },
        partnerDocuments: {
          select: {
            id: true,
            type: true,
            status: true,
            url: true,
            uploadedAt: true,
            expiresAt: true,
            isExpired: true,
            reviewedAt: true,
            reviewedBy: true,
            rejectNote: true
          },
          orderBy: { uploadedAt: 'desc' }
        },
        partnerCommissionHistory: {
          select: {
            id: true,
            oldRate: true,
            newRate: true,
            reason: true,
            changedBy: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            cars: true
          }
        }
      }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      partner
    })

  } catch (error: any) {
    console.error('[Fleet Partner API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partner' },
      { status: 500 }
    )
  }
}

// PATCH - Update partner details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const {
      partnerCompanyName,
      partnerSlug,
      partnerBio,
      partnerSupportEmail,
      partnerSupportPhone,
      autoApproveListings
    } = body

    // Check if partner exists
    const existing = await prisma.rentalHost.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    // If slug is being changed, check if it's available
    if (partnerSlug && partnerSlug !== existing.partnerSlug) {
      const slugExists = await prisma.rentalHost.findFirst({
        where: {
          partnerSlug: partnerSlug.toLowerCase(),
          id: { not: id }
        }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'This partner URL is already taken' },
          { status: 400 }
        )
      }
    }

    const partner = await prisma.rentalHost.update({
      where: { id },
      data: {
        partnerCompanyName,
        partnerSlug: partnerSlug?.toLowerCase(),
        partnerBio,
        partnerSupportEmail,
        partnerSupportPhone,
        autoApproveListings
      }
    })

    return NextResponse.json({
      success: true,
      partner
    })

  } catch (error: any) {
    console.error('[Fleet Partner API] Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update partner' },
      { status: 500 }
    )
  }
}
