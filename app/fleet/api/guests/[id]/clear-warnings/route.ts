// app/fleet/api/guests/[id]/clear-warnings/route.ts
// 🎯 FLEET API: Clear All Active Warnings for a Guest
// Creates audit trail and updates warning count

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

const FLEET_KEY = 'phoenix-fleet-2847'

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const guestId = resolvedParams.id

    // Parse request body for reason
    const body = await request.json()
    const { reason, clearedBy } = body

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { success: false, error: 'Reason is required' },
        { status: 400 }
      )
    }

    // Try to find by User ID first, then by ReviewerProfile ID
    let guest = await prisma.user.findUnique({
      where: { id: guestId },
      include: {
        reviewerProfile: {
          include: {
            moderationHistory: true
          }
        }
      }
    })

    // If not found by User ID, try finding by ReviewerProfile ID
    if (!guest || !guest.reviewerProfile) {
      const profile = await prisma.reviewerProfile.findUnique({
        where: { id: guestId },
        include: {
          user: true,
          moderationHistory: true
        }
      })

      if (profile?.user) {
        guest = {
          ...profile.user,
          reviewerProfile: profile
        }
      }
    }

    if (!guest || !guest.reviewerProfile) {
      return NextResponse.json(
        { success: false, error: 'Guest not found' },
        { status: 404 }
      )
    }

    const profile = guest.reviewerProfile
    const now = new Date()

    // Find all active warnings (not expired)
    const activeWarnings = profile.moderationHistory.filter(action => 
      action.actionType === 'WARNING' && 
      action.expiresAt && 
      new Date(action.expiresAt) > now
    )

    if (activeWarnings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active warnings to clear',
        clearedCount: 0,
        cleared: 0
      })
    }

    // Execute in transaction for data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Mark all active warnings as expired (set expiresAt to now)
      const warningIds = activeWarnings.map(w => w.id)
      
      await tx.guestModeration.updateMany({
        where: {
          id: { in: warningIds }
        },
        data: {
          expiresAt: now
        }
      })

      // Update the warning count on ReviewerProfile to 0
      await tx.reviewerProfile.update({
        where: { id: profile.id },
        data: {
          warningCount: 0,
          activeWarningCount: 0,
          lastWarningAt: null
        }
      })

      // Create audit trail entry
      const adminName = clearedBy || 'fleet-admin@itwhip.com'
      
      await tx.guestModeration.create({
        data: {
          guestId: profile.id,
          actionType: 'UNSUSPEND',
          suspensionLevel: null,
          publicReason: 'All warnings manually cleared by fleet administrator',
          internalNotes: `Force-cleared ${activeWarnings.length} active warning(s) by ${adminName}. Reason: ${reason.trim()}. Cleared warning IDs: ${warningIds.join(', ')}`,
          takenBy: adminName,
          takenAt: now,
          restrictionsApplied: []
        }
      })

      return {
        clearedCount: activeWarnings.length,
        warningIds,
        adminName
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully cleared ${result.clearedCount} warning${result.clearedCount !== 1 ? 's' : ''}`,
      clearedCount: result.clearedCount,
      cleared: result.clearedCount, // Alias for compatibility
      remainingWarnings: 0,
      auditEntry: {
        action: 'WARNINGS_CLEARED',
        count: result.clearedCount,
        clearedBy: result.adminName,
        reason: reason.trim(),
        timestamp: now,
        warningIds: result.warningIds
      }
    })

  } catch (error) {
    console.error('Error clearing warnings:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear warnings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}