// app/fleet/api/guests/[id]/status-summary/route.ts
// 🎯 FLEET API: Comprehensive Guest Status Summary
// Returns: Account status, warnings, suspensions, appeals, restrictions, activity

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const guestId = resolvedParams.id

    // Fleet authentication is already handled by middleware
    // No need to validate here - middleware already checked the key

    // Try to find by User ID first, then by ReviewerProfile ID
    let guest = await prisma.user.findUnique({
      where: { id: guestId },
      include: {
        reviewerProfile: {
          include: {
            moderationHistory: {
              orderBy: { takenAt: 'desc' },
              take: 50
            },
            GuestAppeal: {
              orderBy: { submittedAt: 'desc' },
              take: 20
            }
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
          moderationHistory: {
            orderBy: { takenAt: 'desc' },
            take: 50
          },
          GuestAppeal: {
            orderBy: { submittedAt: 'desc' },
            take: 20
          }
        }
      })

      if (profile?.user) {
        // Reconstruct the guest object
        guest = {
          ...profile.user,
          reviewerProfile: profile
        } as any
      }
    }

    if (!guest || !guest.reviewerProfile) {
      return NextResponse.json(
        { success: false, error: 'Guest not found' },
        { status: 404 }
      )
    }

    const profile = guest.reviewerProfile
    const moderationActions = profile.moderationHistory
    const appeals = profile.GuestAppeal

    // ========== DETERMINE ACCOUNT STATUS ==========
    let accountStatus: 'ACTIVE' | 'WARNED' | 'SOFT_SUSPENDED' | 'HARD_SUSPENDED' | 'BANNED' = 'ACTIVE'
    
    if (profile.suspensionLevel === 'BANNED') {
      accountStatus = 'BANNED'
    } else if (profile.suspensionLevel === 'HARD') {
      accountStatus = 'HARD_SUSPENDED'
    } else if (profile.suspensionLevel === 'SOFT') {
      accountStatus = 'SOFT_SUSPENDED'
    } else if (profile.activeWarningCount > 0) {
      accountStatus = 'WARNED'
    }

    // ========== ACTIVE ISSUES ==========
    const now = new Date()
    
    // Get active warnings from moderation history
    const activeWarnings = moderationActions
      .filter(action => 
        action.actionType === 'WARNING' && 
        action.expiresAt && 
        new Date(action.expiresAt) > now
      )
      .map(warning => {
        const expiresAt = new Date(warning.expiresAt!)
        const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        return {
          id: warning.id,
          category: (warning as any).warningCategory || 'GENERAL',
          reason: warning.publicReason || 'No reason provided',
          issuedAt: warning.takenAt,
          expiresAt: warning.expiresAt,
          daysRemaining
        }
      })

    // Get current suspension
    let suspension = null
    if (profile.suspensionLevel && !['NONE'].includes(profile.suspensionLevel as string)) {
      const suspensionAction = moderationActions.find(
        action => ['SUSPEND', 'BAN'].includes(action.actionType)
      )

      let daysRemaining = null
      if (profile.suspensionExpiresAt) {
        const expiresAt = new Date(profile.suspensionExpiresAt)
        daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }

      suspension = {
        level: profile.suspensionLevel,
        reason: profile.suspendedReason || 'No reason provided',
        suspendedAt: profile.suspendedAt || suspensionAction?.takenAt || now,
        expiresAt: profile.suspensionExpiresAt,
        daysRemaining,
        autoReactivate: profile.autoReactivate || false
      }
    }

    const activeIssues = {
      warningCount: activeWarnings.length,
      warnings: activeWarnings,
      suspension
    }

    // ========== APPEALS ==========
    const appealStats = {
      totalSubmitted: appeals.length,
      pending: appeals.filter(a => a.status === 'PENDING').length,
      underReview: appeals.filter(a => a.status === 'UNDER_REVIEW').length,
      approved: appeals.filter(a => a.status === 'APPROVED').length,
      denied: appeals.filter(a => a.status === 'DENIED').length,
      recentAppeals: appeals.slice(0, 5).map(appeal => ({
        id: appeal.id,
        status: appeal.status,
        submittedAt: appeal.submittedAt,
        reason: appeal.reason.substring(0, 100) + (appeal.reason.length > 100 ? '...' : ''),
        reviewedAt: appeal.reviewedAt,
        reviewNotes: appeal.reviewNotes
      }))
    }

    // ========== RESTRICTIONS ==========
    const restrictions = {
      canBookLuxury: profile.canBookLuxury !== false,
      canBookPremium: profile.canBookPremium !== false,
      requiresManualApproval: profile.requiresManualApproval || false,
      canInstantBook: !profile.requiresManualApproval && accountStatus === 'ACTIVE'
    }

    // ========== RECENT ACTIVITY ==========
    const recentActivity = moderationActions
      .slice(0, 10)
      .map(action => ({
        type: action.actionType,
        action: formatActionType(action.actionType),
        takenBy: action.takenBy || 'System',
        takenAt: action.takenAt
      }))

    // ========== RISK LEVEL ==========
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
    
    if (accountStatus === 'BANNED' || accountStatus === 'HARD_SUSPENDED') {
      riskLevel = 'HIGH'
    } else if (
      accountStatus === 'SOFT_SUSPENDED' || 
      activeWarnings.length >= 2 ||
      appealStats.denied >= 2
    ) {
      riskLevel = 'MEDIUM'
    } else if (activeWarnings.length === 1) {
      riskLevel = 'LOW'
    }

    // ========== COMPILE RESPONSE ==========
    const statusSummary = {
      accountStatus,
      activeIssues,
      appeals: appealStats,
      restrictions,
      recentActivity,
      riskLevel,
      // Additional metadata
      lastModeratedAt: moderationActions[0]?.takenAt || null,
      totalModerationActions: moderationActions.length,
      guestInfo: {
        id: profile.id,
        name: guest.name || '',
        email: guest.email || '',
        verified: profile.isVerified || false,
        memberSince: guest.createdAt
      }
    }

    return NextResponse.json({
      success: true,
      statusSummary
    })

  } catch (error) {
    console.error('Error fetching guest status summary:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch status summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// ========== HELPER FUNCTIONS ==========

function formatActionType(type: string): string {
  const actionMap: Record<string, string> = {
    'WARNING': 'Warning Issued',
    'SUSPEND': 'Account Suspended',
    'BAN': 'Account Banned',
    'UNSUSPEND': 'Suspension Lifted',
    'REACTIVATE': 'Account Reactivated'
  }
  
  return actionMap[type] || type
}