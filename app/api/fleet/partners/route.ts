// app/api/fleet/partners/route.ts
// GET /api/fleet/partners - List all fleet partners
// POST /api/fleet/partners - Create a new partner (manual)

import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {
      hostType: { in: ['FLEET_PARTNER', 'PARTNER'] }
    }

    // Filter by status
    if (filter === 'active') {
      where.approvalStatus = 'APPROVED'
      where.active = true
    } else if (filter === 'pending') {
      where.approvalStatus = 'PENDING'
    } else if (filter === 'suspended') {
      where.approvalStatus = 'SUSPENDED'
    }

    // Search filter
    if (search) {
      where.OR = [
        { partnerCompanyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { partnerSlug: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Fetch partners
    const partners = await prisma.rentalHost.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        hostType: true,
        approvalStatus: true,
        active: true,
        partnerCompanyName: true,
        partnerSlug: true,
        partnerFleetSize: true,
        partnerTotalBookings: true,
        partnerTotalRevenue: true,
        partnerAvgRating: true,
        currentCommissionRate: true,
        createdAt: true,
        partner_applications: {
          select: {
            id: true,
            status: true,
            submittedAt: true,
            fleetSize: true,
            operatingCities: true
          }
        },
        partner_documents: {
          where: {
            OR: [
              { isExpired: true },
              {
                expiresAt: {
                  lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                }
              }
            ]
          },
          select: {
            id: true,
            type: true,
            isExpired: true,
            expiresAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Calculate document warnings
    const partnersWithStats = partners.map(partner => {
      const expiredDocs = partner.partner_documents.filter(d => d.isExpired).length
      const expiringDocs = partner.partner_documents.filter(d => !d.isExpired).length

      return {
        ...partner,
        documentsExpired: expiredDocs,
        documentsExpiring: expiringDocs,
        partner_documents: undefined // Remove from response
      }
    })

    // Get stats
    const [totalPartners, activePartners, pendingApplications, totalFleetVehicles, revenueSum, docsExpiring] = await Promise.all([
      prisma.rentalHost.count({
        where: { hostType: { in: ['FLEET_PARTNER', 'PARTNER'] } }
      }),
      prisma.rentalHost.count({
        where: {
          hostType: { in: ['FLEET_PARTNER', 'PARTNER'] },
          approvalStatus: 'APPROVED',
          active: true
        }
      }),
      prisma.partner_applications.count({
        where: { status: 'SUBMITTED' }
      }),
      prisma.rentalHost.aggregate({
        where: { hostType: { in: ['FLEET_PARTNER', 'PARTNER'] } },
        _sum: { partnerFleetSize: true }
      }),
      prisma.rentalHost.aggregate({
        where: { hostType: { in: ['FLEET_PARTNER', 'PARTNER'] } },
        _sum: { partnerTotalRevenue: true }
      }),
      prisma.partner_documents.count({
        where: {
          OR: [
            { isExpired: true },
            {
              expiresAt: {
                lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
              }
            }
          ]
        }
      })
    ])

    return NextResponse.json({
      success: true,
      partners: partnersWithStats,
      stats: {
        totalPartners,
        activePartners,
        pendingApplications,
        totalFleetVehicles: totalFleetVehicles._sum.partnerFleetSize || 0,
        totalRevenue: revenueSum._sum.partnerTotalRevenue || 0,
        documentsExpiring: docsExpiring
      },
      pagination: {
        limit,
        offset,
        hasMore: partners.length === limit
      }
    })

  } catch (error: any) {
    console.error('[Fleet Partners API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    )
  }
}

// POST - Create a partner manually (by fleet admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      fleetSize,
      commissionRate
    } = body

    if (!companyName || !contactEmail) {
      return NextResponse.json(
        { error: 'Company name and email are required' },
        { status: 400 }
      )
    }

    // Check if email exists
    const existing = await prisma.rentalHost.findUnique({
      where: { email: contactEmail.toLowerCase() }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A host with this email already exists' },
        { status: 400 }
      )
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        id: nanoid(),
        email: contactEmail.toLowerCase(),
        name: contactName || companyName,
        role: 'BUSINESS',
        isActive: true
      }
    })

    // Create partner host
    const partner = await prisma.rentalHost.create({
      data: {
        userId: user.id,
        email: contactEmail.toLowerCase(),
        name: contactName || companyName,
        phone: contactPhone,
        hostType: 'FLEET_PARTNER',
        approvalStatus: 'APPROVED', // Admin-created partners are pre-approved
        active: true,
        partnerCompanyName: companyName,
        partnerFleetSize: fleetSize || 0,
        currentCommissionRate: commissionRate || 0.25,
        autoApproveListings: true
      }
    })

    return NextResponse.json({
      success: true,
      partner: {
        id: partner.id,
        companyName: partner.partnerCompanyName,
        email: partner.email
      }
    })

  } catch (error: any) {
    console.error('[Fleet Partners API] Create error:', error)
    return NextResponse.json(
      { error: 'Failed to create partner' },
      { status: 500 }
    )
  }
}
