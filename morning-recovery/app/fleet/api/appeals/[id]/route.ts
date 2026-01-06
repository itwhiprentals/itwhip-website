// app/fleet/api/appeals/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

/**
 * Fleet Appeal Detail API - Get Single Appeal
 * GET /fleet/api/appeals/[id]
 * 
 * Returns full appeal details including:
 * - Appeal content and evidence
 * - Guest information
 * - Moderation action details
 * - Review status and notes
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
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Appeal ID is required' },
        { status: 400 }
      )
    }

    // Fetch appeal with all related data
    const appeal = await prisma.guestAppeal.findUnique({
      where: { id },
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhotoUrl: true,
            city: true,
            state: true,
            memberSince: true,
            suspensionLevel: true,
            suspendedAt: true,
            suspendedReason: true,
            suspensionExpiresAt: true,
            warningCount: true,
            lastWarningAt: true,
            canBookLuxury: true,
            canBookPremium: true,
            requiresManualApproval: true,
            // Get booking stats
            _count: {
              select: {
                bookings: true,
                reviews: true
              }
            }
          }
        },
        moderation: {
          select: {
            id: true,
            actionType: true,
            suspensionLevel: true,
            warningCategory: true,
            publicReason: true,
            internalNotes: true,
            internalNotesOnly: true,
            takenBy: true,
            takenAt: true,
            expiresAt: true,
            restrictionsApplied: true
          }
        }
      }
    })

    if (!appeal) {
      return NextResponse.json(
        { error: 'Appeal not found' },
        { status: 404 }
      )
    }

    // Get guest's appeal history
    const guestAppealHistory = await prisma.guestAppeal.findMany({
      where: {
        guestId: appeal.guestId,
        id: {
          not: appeal.id // Exclude current appeal
        }
      },
      select: {
        id: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
        moderation: {
          select: {
            actionType: true,
            suspensionLevel: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      },
      take: 5
    })

    // Get guest's moderation history
    const moderationHistory = await prisma.guestModeration.findMany({
      where: {
        guestId: appeal.guestId
      },
      select: {
        id: true,
        actionType: true,
        suspensionLevel: true,
        warningCategory: true,
        publicReason: true,
        internalNotes: true,
        takenBy: true,
        takenAt: true,
        expiresAt: true
      },
      orderBy: {
        takenAt: 'desc'
      },
      take: 10
    })

    // Calculate days since suspension
    const daysSinceSuspension = appeal.guest.suspendedAt
      ? Math.floor((Date.now() - new Date(appeal.guest.suspendedAt).getTime()) / (1000 * 60 * 60 * 24))
      : null

    // Calculate days until expiry
    const daysUntilExpiry = appeal.guest.suspensionExpiresAt
      ? Math.ceil((new Date(appeal.guest.suspensionExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null

    // Format response
    const response = {
      success: true,
      appeal: {
        id: appeal.id,
        guestId: appeal.guestId,
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
        
        // Guest information
        guest: {
          id: appeal.guest.id,
          name: appeal.guest.name,
          email: appeal.guest.email,
          profilePhotoUrl: appeal.guest.profilePhotoUrl,
          city: appeal.guest.city,
          state: appeal.guest.state,
          memberSince: appeal.guest.memberSince,
          
          // Current suspension status
          suspensionLevel: appeal.guest.suspensionLevel,
          suspendedAt: appeal.guest.suspendedAt,
          suspendedReason: appeal.guest.suspendedReason,
          suspensionExpiresAt: appeal.guest.suspensionExpiresAt,
          warningCount: appeal.guest.warningCount,
          lastWarningAt: appeal.guest.lastWarningAt,
          
          // Restrictions
          canBookLuxury: appeal.guest.canBookLuxury,
          canBookPremium: appeal.guest.canBookPremium,
          requiresManualApproval: appeal.guest.requiresManualApproval,
          
          // Stats
          totalBookings: appeal.guest._count.bookings,
          totalReviews: appeal.guest._count.reviews,
          
          // Calculated fields
          daysSinceSuspension,
          daysUntilExpiry
        },
        
        // Moderation action that prompted this appeal
        moderation: {
          id: appeal.moderation.id,
          actionType: appeal.moderation.actionType,
          suspensionLevel: appeal.moderation.suspensionLevel,
          warningCategory: appeal.moderation.warningCategory,
          publicReason: appeal.moderation.publicReason,
          internalNotes: appeal.moderation.internalNotes,
          internalNotesOnly: appeal.moderation.internalNotesOnly,
          takenBy: appeal.moderation.takenBy,
          takenAt: appeal.moderation.takenAt,
          expiresAt: appeal.moderation.expiresAt,
          restrictionsApplied: appeal.moderation.restrictionsApplied
        }
      },
      
      // Additional context
      context: {
        guestAppealHistory,
        moderationHistory,
        appealStats: {
          totalAppeals: guestAppealHistory.length + 1,
          pendingAppeals: guestAppealHistory.filter(a => a.status === 'PENDING').length,
          approvedAppeals: guestAppealHistory.filter(a => a.status === 'APPROVED').length,
          deniedAppeals: guestAppealHistory.filter(a => a.status === 'DENIED').length
        }
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching appeal details:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch appeal details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PATCH endpoint to update appeal status (mark as under review)
export async function PATCH(
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
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Appeal ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status, reviewedBy } = body

    // Validate input
    if (!status || !['UNDER_REVIEW', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (UNDER_REVIEW, PENDING)' },
        { status: 400 }
      )
    }

    if (status === 'UNDER_REVIEW' && !reviewedBy) {
      return NextResponse.json(
        { error: 'reviewedBy is required when marking as UNDER_REVIEW' },
        { status: 400 }
      )
    }

    // Update appeal status
    const updatedAppeal = await prisma.guestAppeal.update({
      where: { id },
      data: {
        status,
        ...(status === 'UNDER_REVIEW' && {
          reviewedBy,
          reviewedAt: new Date()
        })
      },
      include: {
        guest: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Appeal marked as ${status}`,
      appeal: {
        id: updatedAppeal.id,
        status: updatedAppeal.status,
        reviewedBy: updatedAppeal.reviewedBy,
        reviewedAt: updatedAppeal.reviewedAt,
        guestName: updatedAppeal.guest.name
      }
    })
  } catch (error) {
    console.error('Error updating appeal status:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update appeal status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}