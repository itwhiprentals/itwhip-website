// app/api/guest/moderation/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
)

// Helper to verify guest token
async function verifyGuestToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    return null
  }
}

// Helper to calculate days remaining
function calculateDaysRemaining(expiresAt: Date | null): number | null {
  if (!expiresAt) return null
  const now = new Date()
  const diff = expiresAt.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days > 0 ? days : 0
}

// Check appeal eligibility PER WARNING/SUSPENSION
async function checkAppealEligibility(guestId: string, moderationId: string) {
  // Get ALL appeals for THIS SPECIFIC moderation action
  const appealsForThisAction = await prisma.guestAppeal.findMany({
    where: {
      guestId,
      moderationId // Only check THIS action's appeals
    },
    orderBy: {
      submittedAt: 'desc'
    }
  })

  // Check if this action has been successfully appealed
  const hasApprovedAppeal = appealsForThisAction.some(
    appeal => appeal.status === 'APPROVED'
  )

  // ✅ FIX: If approved appeal exists, this moderation action is cleared
  if (hasApprovedAppeal) {
    return {
      canAppeal: false,
      reason: 'ALREADY_CLEARED',
      appealsUsed: appealsForThisAction.length,
      maxAppeals: 2,
      existingAppeal: null,
      allAppeals: appealsForThisAction,
      isCleared: true // ✅ Mark as cleared ONLY for approved appeals
    }
  }

  // Check for pending appeal
  const pendingAppeal = appealsForThisAction.find(
    appeal => appeal.status === 'PENDING' || appeal.status === 'UNDER_REVIEW'
  )

  if (pendingAppeal) {
    return {
      canAppeal: false,
      reason: 'EXISTING_APPEAL',
      appealsUsed: appealsForThisAction.length,
      maxAppeals: 2,
      existingAppeal: {
        id: pendingAppeal.id,
        status: pendingAppeal.status,
        submittedAt: pendingAppeal.submittedAt
      },
      allAppeals: appealsForThisAction,
      isCleared: false // ✅ Pending appeals don't clear the warning
    }
  }

  // ✅ FIX: Check for denied appeals - they DON'T clear the warning
  const hasDeniedAppeal = appealsForThisAction.some(
    appeal => appeal.status === 'DENIED'
  )

  // Check if limit reached (2 appeals per action)
  if (appealsForThisAction.length >= 2) {
    return {
      canAppeal: false,
      reason: 'LIMIT_REACHED',
      appealsUsed: 2,
      maxAppeals: 2,
      existingAppeal: null,
      allAppeals: appealsForThisAction,
      isCleared: false, // ✅ Limit reached doesn't clear the warning
      hasDeniedAppeal // ✅ Track if there are denied appeals
    }
  }

  // ✅ Can appeal (either first time or after one denial)
  return {
    canAppeal: true,
    reason: null,
    appealsUsed: appealsForThisAction.length,
    maxAppeals: 2,
    remainingAppeals: 2 - appealsForThisAction.length,
    existingAppeal: null,
    allAppeals: appealsForThisAction,
    isCleared: false, // ✅ Active warnings that can be appealed are NOT cleared
    hasDeniedAppeal // ✅ Track if there are denied appeals
  }
}

// GET - Get current moderation status
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from token
    const accessToken = request.cookies.get('accessToken')?.value
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Verify token
    const payload = await verifyGuestToken(accessToken)
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const userId = payload.userId as string

    // Find the guest's ReviewerProfile
    const guest = await prisma.reviewerProfile.findUnique({
      where: { userId },
      include: {
        moderationHistory: {
          where: {
            actionType: {
              in: ['SUSPEND', 'BAN', 'WARNING']
            }
          },
          orderBy: {
            takenAt: 'desc'
          }
        }
      }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest profile not found' },
        { status: 404 }
      )
    }

    const now = new Date()
    
    // Filter for ACTIVE warnings only (not expired)
    const allWarnings = (guest.moderationHistory || []).filter(action => {
      if (action.actionType !== 'WARNING') return false
      
      // Check if expired
      if (action.expiresAt && new Date(action.expiresAt) <= now) return false
      
      return true
    })

    // ✅ FIX: Deduplicate warnings by ID first (prevent duplicate database entries)
    const seenWarningIds = new Set<string>()
    const uniqueWarnings = allWarnings.filter(warning => {
      if (seenWarningIds.has(warning.id)) {
        return false
      }
      seenWarningIds.add(warning.id)
      return true
    })

    // ✅ FIX: Check each warning for approved appeals - ONLY remove if approved
    const activeWarnings = []
    for (const warning of uniqueWarnings) {
      const appealStatus = await checkAppealEligibility(guest.id, warning.id)
      
      // ✅ CRITICAL: Only exclude warnings with APPROVED appeals
      // Warnings with DENIED appeals or PENDING appeals stay active
      if (!appealStatus.isCleared) {
        activeWarnings.push(warning)
      }
    }

    // Get latest suspension/ban
    const latestSuspension = (guest.moderationHistory || []).find(
      action => action.actionType === 'SUSPEND' || action.actionType === 'BAN'
    )

    // Check if suspension/ban is active (not cleared by appeal)
    let hasActiveSuspension = false
    let activeSuspensionData = null
    
    if (latestSuspension) {
      const suspensionAppealStatus = await checkAppealEligibility(guest.id, latestSuspension.id)
      
      // ✅ If suspension has approved appeal, it's cleared
      if (!suspensionAppealStatus.isCleared) {
        // Check if it's still active based on database fields
        hasActiveSuspension = guest.suspensionLevel !== null && guest.suspensionLevel !== 'NONE'
        
        if (hasActiveSuspension) {
          const daysRemaining = calculateDaysRemaining(guest.suspensionExpiresAt)
          
          activeSuspensionData = {
            id: latestSuspension.id,
            level: guest.suspensionLevel,
            reason: guest.suspendedReason || guest.banReason || 'Violation of terms and conditions',
            suspendedAt: guest.suspendedAt || guest.bannedAt,
            suspendedBy: guest.suspendedBy || guest.bannedBy,
            expiresAt: guest.suspensionExpiresAt,
            daysRemaining,
            isPermanent: guest.suspensionLevel === 'BANNED',
            autoReactivate: guest.autoReactivate,
            appealEligibility: suspensionAppealStatus
          }
        }
      }
    }

    // Determine account status based on hierarchy
    let accountStatus = 'GOOD_STANDING'
    
    if (hasActiveSuspension && activeSuspensionData) {
      if (activeSuspensionData.level === 'BANNED') {
        accountStatus = 'BANNED'
      } else {
        accountStatus = 'SUSPENDED'
      }
    } else if (activeWarnings.length > 0) {
      accountStatus = 'WARNED'
    }

    // If no active issues, return clean state
    if (accountStatus === 'GOOD_STANDING') {
      return NextResponse.json({
        success: true,
        hasActiveIssues: false,
        accountStatus: 'GOOD_STANDING',
        message: 'Your account is in good standing',
        activeWarningCount: 0,
        totalHistoricalWarnings: guest.warningCount
      })
    }

    // ✅ Get appeal eligibility for EACH active warning
    const warningsWithAppealStatus = await Promise.all(
      activeWarnings.map(async (warning) => {
        const appealEligibility = await checkAppealEligibility(guest.id, warning.id)
        const daysRemaining = calculateDaysRemaining(warning.expiresAt)
        
        return {
          id: warning.id,
          category: warning.warningCategory,
          reason: warning.publicReason || 'Community guidelines violation',
          issuedAt: warning.takenAt,
          issuedBy: warning.takenBy,
          expiresAt: warning.expiresAt,
          daysRemaining,
          internalNotes: warning.internalNotesOnly ? null : warning.internalNotes,
          restrictionsApplied: warning.restrictionsApplied,
          appealEligibility,
          hasDeniedAppeal: appealEligibility.hasDeniedAppeal || false // ✅ NEW: Flag if appeal was denied
        }
      })
    )

    // Build moderation info response
    const moderationInfo: any = {
      success: true,
      hasActiveIssues: true,
      accountStatus,
      activeWarningCount: activeWarnings.length,
      totalHistoricalWarnings: guest.warningCount
    }

    // Add suspension details if actively suspended/banned
    if (hasActiveSuspension && activeSuspensionData) {
      moderationInfo.suspension = activeSuspensionData
    }

    // ✅ Add active warnings (including those with denied appeals)
    if (activeWarnings.length > 0) {
      moderationInfo.warnings = warningsWithAppealStatus
    }

    // Add restrictions
    moderationInfo.restrictions = {
      canBookLuxury: guest.canBookLuxury,
      canBookPremium: guest.canBookPremium,
      requiresManualApproval: guest.requiresManualApproval,
      canInstantBook: guest.canInstantBook
    }

    // Add moderation history for context (including cleared items)
    moderationInfo.moderationHistory = await Promise.all(
      (guest.moderationHistory || []).map(async (action) => {
        const appealStatus = await checkAppealEligibility(guest.id, action.id)
        return {
          id: action.id,
          type: action.actionType,
          level: action.suspensionLevel,
          category: action.warningCategory,
          reason: action.publicReason,
          takenAt: action.takenAt,
          takenBy: action.takenBy,
          expiresAt: action.expiresAt,
          isExpired: action.expiresAt ? new Date(action.expiresAt) < now : false,
          isCleared: appealStatus.isCleared, // ✅ Show if cleared by appeal
          hasDeniedAppeal: appealStatus.hasDeniedAppeal || false, // ✅ NEW: Show if has denied appeal
          appealStatus: appealStatus.allAppeals?.length > 0 ? 
            appealStatus.allAppeals[0].status : null
        }
      })
    )

    // 🔍 DEBUG: Log what we're returning to identify duplicate warnings
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔍 MODERATION API DEBUG LOG')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Guest ID:', guest.id)
    console.log('Account Status:', accountStatus)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 RAW DATABASE WARNINGS (before dedup):', {
      count: allWarnings.length,
      warnings: allWarnings.map(w => ({
        id: w.id,
        category: w.warningCategory,
        reason: w.publicReason?.substring(0, 60)
      }))
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔄 AFTER DEDUPLICATION:', {
      count: uniqueWarnings.length,
      warnings: uniqueWarnings.map(w => ({
        id: w.id,
        category: w.warningCategory,
        reason: w.publicReason?.substring(0, 60)
      }))
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ ACTIVE WARNINGS (after appeal check):', {
      count: activeWarnings.length,
      warnings: activeWarnings.map(w => ({
        id: w.id,
        category: w.warningCategory,
        reason: w.publicReason?.substring(0, 60)
      }))
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📤 API RESPONSE WARNINGS:', {
      count: warningsWithAppealStatus?.length,
      warnings: warningsWithAppealStatus?.map(w => ({
        id: w.id,
        category: w.category,
        reason: w.reason?.substring(0, 60),
        hasDeniedAppeal: w.hasDeniedAppeal,
        canAppeal: w.appealEligibility.canAppeal,
        appealsUsed: w.appealEligibility.appealsUsed
      }))
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    return NextResponse.json(moderationInfo)

  } catch (error) {
    console.error('Failed to fetch moderation info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch moderation information' },
      { status: 500 }
    )
  }
}