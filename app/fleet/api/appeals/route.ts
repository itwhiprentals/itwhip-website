// app/fleet/api/appeals/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

/**
 * Fleet Appeals API - List All Appeals
 * GET /fleet/api/appeals
 * 
 * Query params:
 * - status: PENDING, UNDER_REVIEW, APPROVED, DENIED
 * - guestId: Filter by specific guest
 * - search: Search guest name or email
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * - sortBy: submittedAt, reviewedAt (default: submittedAt)
 * - sortOrder: asc, desc (default: desc)
 */

const FLEET_KEY = 'phoenix-fleet-2847'

// Verify fleet access
function verifyFleetAccess(request: NextRequest): boolean {
  const key = request.nextUrl.searchParams.get('key')
  return key === FLEET_KEY
}

export async function GET(request: NextRequest) {
  try {
    // Verify fleet access
    if (!verifyFleetAccess(request)) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'DENIED' | null
    const guestId = searchParams.get('guestId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'submittedAt'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    // Build where clause
    const where: any = {}

    // Filter by status
    if (status) {
      where.status = status
    }

    // Filter by specific guest
    if (guestId) {
      where.guestId = guestId
    }

    // Search by guest name or email
    if (search) {
      where.guest = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    // Get total count for pagination
    const totalAppeals = await prisma.guestAppeal.count({ where })

    // Calculate pagination
    const totalPages = Math.ceil(totalAppeals / limit)
    const skip = (page - 1) * limit

    // Fetch appeals with related data
    const appeals = await prisma.guestAppeal.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder
      },
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhotoUrl: true,
            suspensionLevel: true,
            warningCount: true
          }
        },
        moderation: {
          select: {
            id: true,
            actionType: true,
            suspensionLevel: true,
            publicReason: true,
            internalNotes: true,
            takenBy: true,
            takenAt: true
          }
        }
      }
    })

    // Get appeal statistics
    const [
      totalCount,
      pendingCount,
      underReviewCount,
      approvedCount,
      deniedCount
    ] = await Promise.all([
      prisma.guestAppeal.count(),
      prisma.guestAppeal.count({ where: { status: 'PENDING' } }),
      prisma.guestAppeal.count({ where: { status: 'UNDER_REVIEW' } }),
      prisma.guestAppeal.count({ where: { status: 'APPROVED' } }),
      prisma.guestAppeal.count({ where: { status: 'DENIED' } })
    ])

    // Format response
    const formattedAppeals = appeals.map(appeal => ({
      id: appeal.id,
      guestId: appeal.guestId,
      guest: {
        id: appeal.guest.id,
        name: appeal.guest.name,
        email: appeal.guest.email,
        profilePhotoUrl: appeal.guest.profilePhotoUrl,
        suspensionLevel: appeal.guest.suspensionLevel,
        warningCount: appeal.guest.warningCount
      },
      moderation: {
        id: appeal.moderation.id,
        actionType: appeal.moderation.actionType,
        suspensionLevel: appeal.moderation.suspensionLevel,
        publicReason: appeal.moderation.publicReason,
        internalNotes: appeal.moderation.internalNotes,
        takenBy: appeal.moderation.takenBy,
        takenAt: appeal.moderation.takenAt
      },
      reason: appeal.reason,
      evidence: appeal.evidence,
      status: appeal.status,
      reviewedBy: appeal.reviewedBy,
      reviewedAt: appeal.reviewedAt,
      reviewNotes: appeal.reviewNotes,
      submittedAt: appeal.submittedAt,
      updatedAt: appeal.updatedAt
    }))

    return NextResponse.json({
      success: true,
      appeals: formattedAppeals,
      pagination: {
        page,
        limit,
        totalPages,
        totalAppeals,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      stats: {
        total: totalCount,
        pending: pendingCount,
        underReview: underReviewCount,
        approved: approvedCount,
        denied: deniedCount
      },
      filters: {
        status: status || 'all',
        guestId: guestId || null,
        search: search || null,
        sortBy,
        sortOrder
      }
    })
  } catch (error) {
    console.error('Error fetching appeals:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch appeals',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST endpoint to update appeal status in bulk (optional)
export async function POST(request: NextRequest) {
  try {
    // Verify fleet access
    if (!verifyFleetAccess(request)) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { appealIds, status, reviewedBy, reviewNotes } = body

    // Validate input
    if (!appealIds || !Array.isArray(appealIds) || appealIds.length === 0) {
      return NextResponse.json(
        { error: 'appealIds array is required' },
        { status: 400 }
      )
    }

    if (!status || !['UNDER_REVIEW', 'APPROVED', 'DENIED'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (UNDER_REVIEW, APPROVED, DENIED)' },
        { status: 400 }
      )
    }

    if (!reviewedBy) {
      return NextResponse.json(
        { error: 'reviewedBy is required' },
        { status: 400 }
      )
    }

    // Update appeals in bulk
    const updated = await prisma.guestAppeal.updateMany({
      where: {
        id: {
          in: appealIds
        },
        status: 'PENDING' // Only update pending appeals
      },
      data: {
        status,
        reviewedBy,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || null
      }
    })

    return NextResponse.json({
      success: true,
      message: `Updated ${updated.count} appeal(s) to ${status}`,
      updatedCount: updated.count
    })
  } catch (error) {
    console.error('Error bulk updating appeals:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update appeals',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}