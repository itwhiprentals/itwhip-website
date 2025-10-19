// app/fleet/api/guests/[id]/appeals/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

/**
 * Fleet Guest Appeals API - List Appeals for Specific Guest
 * GET /fleet/api/guests/[id]/appeals
 * 
 * Returns all appeals submitted by a specific guest
 * Used in the Fleet guest detail page "Appeals" tab
 */

const FLEET_KEY = 'phoenix-fleet-2847'

// Verify fleet access
function verifyFleetAccess(request: NextRequest): boolean {
  const key = request.nextUrl.searchParams.get('key')
  return key === FLEET_KEY
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify fleet access
    if (!verifyFleetAccess(request)) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    // Await params
    const { id: guestId } = await params

    if (!guestId) {
      return NextResponse.json(
        { error: 'Guest ID is required' },
        { status: 400 }
      )
    }

    // Verify guest exists
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id: guestId },
      select: {
        id: true,
        name: true,
        email: true,
        suspensionLevel: true,
        warningCount: true
      }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      )
    }

    // Parse query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'DENIED' | null
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: any = {
      guestId
    }

    if (status) {
      where.status = status
    }

    // Fetch appeals for this guest
    const appeals = await prisma.guestAppeal.findMany({
      where,
      take: limit,
      orderBy: {
        submittedAt: 'desc'
      },
      include: {
        moderation: {
          select: {
            id: true,
            actionType: true,
            suspensionLevel: true,
            warningCategory: true,
            publicReason: true,
            internalNotes: true,
            takenBy: true,
            takenAt: true,
            expiresAt: true,
            restrictionsApplied: true
          }
        }
      }
    })

    // Get appeal statistics for this guest
    const [
      totalAppeals,
      pendingAppeals,
      underReviewAppeals,
      approvedAppeals,
      deniedAppeals
    ] = await Promise.all([
      prisma.guestAppeal.count({ where: { guestId } }),
      prisma.guestAppeal.count({ where: { guestId, status: 'PENDING' } }),
      prisma.guestAppeal.count({ where: { guestId, status: 'UNDER_REVIEW' } }),
      prisma.guestAppeal.count({ where: { guestId, status: 'APPROVED' } }),
      prisma.guestAppeal.count({ where: { guestId, status: 'DENIED' } })
    ])

    // Check if guest can submit more appeals (2 per 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentAppealsCount = await prisma.guestAppeal.count({
      where: {
        guestId,
        submittedAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    const canSubmitMoreAppeals = recentAppealsCount < 2
    const remainingAppeals = Math.max(0, 2 - recentAppealsCount)

    // Format appeals
    const formattedAppeals = appeals.map(appeal => ({
      id: appeal.id,
      moderationId: appeal.moderationId,
      
      // Appeal content
      reason: appeal.reason,
      evidence: appeal.evidence,
      
      // Status
      status: appeal.status,
      submittedAt: appeal.submittedAt,
      updatedAt: appeal.updatedAt,
      
      // Review info
      reviewedBy: appeal.reviewedBy,
      reviewedAt: appeal.reviewedAt,
      reviewNotes: appeal.reviewNotes,
      
      // Moderation action details
      moderation: {
        id: appeal.moderation.id,
        actionType: appeal.moderation.actionType,
        suspensionLevel: appeal.moderation.suspensionLevel,
        warningCategory: appeal.moderation.warningCategory,
        publicReason: appeal.moderation.publicReason,
        internalNotes: appeal.moderation.internalNotes,
        takenBy: appeal.moderation.takenBy,
        takenAt: appeal.moderation.takenAt,
        expiresAt: appeal.moderation.expiresAt,
        restrictionsApplied: appeal.moderation.restrictionsApplied
      },
      
      // Calculated fields
      daysSinceSubmission: Math.floor(
        (Date.now() - new Date(appeal.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
      ),
      isResolved: appeal.status === 'APPROVED' || appeal.status === 'DENIED'
    }))

    return NextResponse.json({
      success: true,
      guest: {
        id: guest.id,
        name: guest.name,
        email: guest.email,
        suspensionLevel: guest.suspensionLevel,
        warningCount: guest.warningCount
      },
      appeals: formattedAppeals,
      stats: {
        total: totalAppeals,
        pending: pendingAppeals,
        underReview: underReviewAppeals,
        approved: approvedAppeals,
        denied: deniedAppeals
      },
      appealLimits: {
        canSubmitMore: canSubmitMoreAppeals,
        recentAppealsCount,
        remainingAppeals,
        maxAppeals: 2,
        periodDays: 30
      },
      filters: {
        status: status || 'all',
        limit
      }
    })
  } catch (error) {
    console.error('Error fetching guest appeals:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch guest appeals',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}