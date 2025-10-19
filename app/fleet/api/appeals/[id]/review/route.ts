// app/fleet/api/appeals/[id]/review/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

/**
 * Fleet Appeal Review API - Approve or Deny Appeals
 * POST /fleet/api/appeals/[id]/review
 * 
 * Actions:
 * - APPROVE: Clear suspension, restore access, expire warning, create audit entry, send notification
 * - DENY: Keep suspension, add review notes, send notification (NO audit entry to avoid duplicates)
 */

const FLEET_KEY = 'phoenix-fleet-2847'

// Verify fleet access
function verifyFleetAccess(request: NextRequest): boolean {
  const key = request.nextUrl.searchParams.get('key')
  return key === FLEET_KEY
}

export async function POST(
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

    // Parse request body
    const body = await request.json()
    const { decision, reviewedBy, reviewNotes } = body

    // Validate input
    if (!decision || !['APPROVED', 'DENIED'].includes(decision)) {
      return NextResponse.json(
        { error: 'Valid decision is required (APPROVED or DENIED)' },
        { status: 400 }
      )
    }

    if (!reviewedBy) {
      return NextResponse.json(
        { error: 'reviewedBy (admin name/email) is required' },
        { status: 400 }
      )
    }

    // Fetch appeal with guest and moderation info
    const appeal = await prisma.guestAppeal.findUnique({
      where: { id },
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            email: true,
            suspensionLevel: true,
            suspendedReason: true
          }
        },
        moderation: {
          select: {
            id: true,
            actionType: true,
            suspensionLevel: true,
            publicReason: true
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

    // Check if appeal is already reviewed
    if (appeal.status === 'APPROVED' || appeal.status === 'DENIED') {
      return NextResponse.json(
        { error: `Appeal has already been ${appeal.status.toLowerCase()}` },
        { status: 400 }
      )
    }

    const now = new Date()

    // Execute decision based on approval/denial
    if (decision === 'APPROVED') {
      // APPROVE: Clear suspension and restore access
      await prisma.$transaction(async (tx) => {
        // 1. Update appeal status
        await tx.guestAppeal.update({
          where: { id },
          data: {
            status: 'APPROVED',
            reviewedBy,
            reviewedAt: now,
            reviewNotes: reviewNotes || 'Appeal approved. Suspension lifted.'
          }
        })

        // 2. EXPIRE THE ORIGINAL MODERATION RECORD
        await tx.guestModeration.update({
          where: { id: appeal.moderationId },
          data: {
            expiresAt: now // Expire immediately
          }
        })

        // 3. RECALCULATE ACTIVE WARNINGS COUNT
        const activeWarningsCount = await tx.guestModeration.count({
          where: {
            guestId: appeal.guestId,
            actionType: 'WARNING',
            expiresAt: { gt: now } // Only count non-expired
          }
        })

        // 4. Clear suspension from guest profile
        await tx.reviewerProfile.update({
          where: { id: appeal.guestId },
          data: {
            // Clear suspension fields
            suspensionLevel: null,
            suspendedAt: null,
            suspendedReason: null,
            suspendedBy: null,
            suspensionExpiresAt: null,
            autoReactivate: false,

            // Restore full access
            canBookLuxury: true,
            canBookPremium: true,
            requiresManualApproval: false,

            // UPDATE WARNING COUNTS BASED ON ACTUAL ACTIVE WARNINGS
            activeWarningCount: activeWarningsCount,
            warningCount: activeWarningsCount,
            ...(activeWarningsCount === 0 && {
              lastWarningAt: null
            })
          }
        })

        // 5. Create GuestModeration entry for audit trail
        await tx.guestModeration.create({
          data: {
            guestId: appeal.guestId,
            actionType: 'UNSUSPEND',
            suspensionLevel: null,
            publicReason: `Your appeal has been approved and your ${appeal.moderation.suspensionLevel || 'warning'} has been lifted. Thank you for your patience.`,
            internalNotes: `Appeal ${id} approved by ${reviewedBy}. Original action: ${appeal.moderation.actionType} (${appeal.moderation.suspensionLevel || 'N/A'}). Reason: ${appeal.moderation.publicReason}. Review notes: ${reviewNotes || 'None'}`,
            takenBy: reviewedBy,
            takenAt: now,
            restrictionsApplied: [] // No restrictions after approval
          }
        })

        // 6. CREATE APPEAL NOTIFICATION FOR GUEST
        await tx.appealNotification.create({
          data: {
            guestId: appeal.guestId,
            appealId: appeal.id,
            type: 'APPROVED',
            message: `Your appeal has been approved! The ${appeal.moderation.actionType.toLowerCase()} has been lifted and your account access has been fully restored.`,
            seen: false
          }
        })
      })

      return NextResponse.json({
        success: true,
        message: 'Appeal approved successfully',
        decision: 'APPROVED',
        appeal: {
          id: appeal.id,
          guestName: appeal.guest.name,
          guestEmail: appeal.guest.email,
          status: 'APPROVED',
          reviewedBy,
          reviewedAt: now
        },
        action: 'Suspension lifted and access restored'
      })
    } else {
      // ✅ FIX: DENY - Keep suspension, DO NOT CREATE ANY AUDIT ENTRY
      // The original warning stays active, and the appeal record tracks the denial
      await prisma.$transaction(async (tx) => {
        // 1. Update appeal status
        await tx.guestAppeal.update({
          where: { id },
          data: {
            status: 'DENIED',
            reviewedBy,
            reviewedAt: now,
            reviewNotes: reviewNotes || 'Appeal denied. Original action stands.'
          }
        })

        // 2. CREATE APPEAL NOTIFICATION FOR GUEST (DENIED)
        await tx.appealNotification.create({
          data: {
            guestId: appeal.guestId,
            appealId: appeal.id,
            type: 'DENIED',
            message: `Your appeal has been reviewed and denied. The original ${appeal.moderation.actionType.toLowerCase()} remains in effect. ${reviewNotes ? `Reason: ${reviewNotes}` : ''}`,
            seen: false
          }
        })

        // 3. ✅ NOTE: NO GuestModeration audit entry created
        // The original warning remains untouched in the database
        // The denial is tracked in the GuestAppeal record
        // This prevents duplicate warnings from being created
      })

      return NextResponse.json({
        success: true,
        message: 'Appeal denied',
        decision: 'DENIED',
        appeal: {
          id: appeal.id,
          guestName: appeal.guest.name,
          guestEmail: appeal.guest.email,
          status: 'DENIED',
          reviewedBy,
          reviewedAt: now
        },
        action: 'Original suspension remains in effect'
      })
    }
  } catch (error) {
    console.error('Error reviewing appeal:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to review appeal',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check if appeal can be reviewed
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

    // Fetch appeal
    const appeal = await prisma.guestAppeal.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        submittedAt: true,
        reviewedBy: true,
        reviewedAt: true,
        guest: {
          select: {
            name: true,
            suspensionLevel: true
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

    const canReview = appeal.status === 'PENDING' || appeal.status === 'UNDER_REVIEW'
    const alreadyReviewed = appeal.status === 'APPROVED' || appeal.status === 'DENIED'

    return NextResponse.json({
      success: true,
      appeal: {
        id: appeal.id,
        status: appeal.status,
        guestName: appeal.guest.name,
        submittedAt: appeal.submittedAt
      },
      canReview,
      alreadyReviewed,
      message: canReview 
        ? 'Appeal can be reviewed'
        : `Appeal has already been ${appeal.status.toLowerCase()}`
    })
  } catch (error) {
    console.error('Error checking appeal review status:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check appeal status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}