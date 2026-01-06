// app/api/fleet/partners/applications/route.ts
// GET /api/fleet/partners/applications - List partner applications

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'SUBMITTED'
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {}

    // Filter by status
    if (status && status !== 'all') {
      where.status = status
    }

    // Search filter
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Fetch applications
    const applications = await prisma.partnerApplication.findMany({
      where,
      select: {
        id: true,
        hostId: true,
        companyName: true,
        businessType: true,
        yearsInBusiness: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        fleetSize: true,
        vehicleTypes: true,
        operatingCities: true,
        currentStep: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
        reviewedBy: true,
        reviewNotes: true,
        createdAt: true,
        host: {
          select: {
            id: true,
            partnerSlug: true,
            partnerDocuments: {
              select: {
                id: true,
                type: true,
                status: true,
                url: true
              }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Get stats
    const [submitted, underReview, approved, rejected] = await Promise.all([
      prisma.partnerApplication.count({ where: { status: 'SUBMITTED' } }),
      prisma.partnerApplication.count({ where: { status: 'UNDER_REVIEW' } }),
      prisma.partnerApplication.count({ where: { status: 'APPROVED' } }),
      prisma.partnerApplication.count({ where: { status: 'REJECTED' } })
    ])

    return NextResponse.json({
      success: true,
      applications,
      stats: {
        submitted,
        underReview,
        approved,
        rejected
      },
      pagination: {
        limit,
        offset,
        hasMore: applications.length === limit
      }
    })

  } catch (error: any) {
    console.error('[Fleet Applications API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}
