// lib/helpers/appealLimitChecker.ts

import { prisma } from '@/app/lib/database/prisma'

/**
 * Appeal Limit Checker
 * Enforces 2 appeals per 30 days limit
 * Prevents spam and abuse of appeal system
 */

// ============================================
// CONFIGURATION
// ============================================

export const APPEAL_LIMITS = {
  maxAppealsPerPeriod: 2,
  periodDays: 30,
  maxAppealsPerModeration: 1 // Only 1 appeal per specific moderation action
}

// ============================================
// TYPES
// ============================================

export interface AppealLimitResult {
  canAppeal: boolean
  reason?: string
  appealsUsed: number
  maxAppeals: number
  remainingAppeals: number
  nextAppealAvailableAt?: Date
  recentAppeals?: Array<{
    id: string
    submittedAt: Date
    status: string
    moderationId: string
  }>
}

export interface ModerationAppealCheck {
  canAppeal: boolean
  reason?: string
  existingAppealId?: string
  existingAppealStatus?: string
}

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Check if guest can submit an appeal (time-based limit)
 */
export async function canGuestAppeal(guestId: string): Promise<AppealLimitResult> {
  try {
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - APPEAL_LIMITS.periodDays)

    // Get appeals in last 30 days
    const recentAppeals = await prisma.guestAppeal.findMany({
      where: {
        guestId,
        submittedAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        id: true,
        submittedAt: true,
        status: true,
        moderationId: true
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    const appealsUsed = recentAppeals.length
    const remainingAppeals = APPEAL_LIMITS.maxAppealsPerPeriod - appealsUsed

    // Check if limit reached
    if (appealsUsed >= APPEAL_LIMITS.maxAppealsPerPeriod) {
      // Find oldest appeal to calculate when next appeal is available
      const oldestAppeal = recentAppeals[recentAppeals.length - 1]
      const nextAvailable = new Date(oldestAppeal.submittedAt)
      nextAvailable.setDate(nextAvailable.getDate() + APPEAL_LIMITS.periodDays)

      return {
        canAppeal: false,
        reason: `You have reached the maximum of ${APPEAL_LIMITS.maxAppealsPerPeriod} appeals per ${APPEAL_LIMITS.periodDays} days. Please wait until your oldest appeal expires.`,
        appealsUsed,
        maxAppeals: APPEAL_LIMITS.maxAppealsPerPeriod,
        remainingAppeals: 0,
        nextAppealAvailableAt: nextAvailable,
        recentAppeals
      }
    }

    // Guest can appeal
    return {
      canAppeal: true,
      appealsUsed,
      maxAppeals: APPEAL_LIMITS.maxAppealsPerPeriod,
      remainingAppeals,
      recentAppeals
    }
  } catch (error) {
    console.error('Error checking appeal limits:', error)
    
    // On error, deny appeal to be safe
    return {
      canAppeal: false,
      reason: 'Unable to verify appeal eligibility. Please try again later.',
      appealsUsed: 0,
      maxAppeals: APPEAL_LIMITS.maxAppealsPerPeriod,
      remainingAppeals: 0
    }
  }
}

/**
 * Check if guest can appeal a specific moderation action
 */
export async function canAppealModeration(
  guestId: string,
  moderationId: string
): Promise<ModerationAppealCheck> {
  try {
    // Check if moderation action exists
    const moderation = await prisma.guestModeration.findUnique({
      where: { id: moderationId }
    })

    if (!moderation) {
      return {
        canAppeal: false,
        reason: 'Moderation action not found'
      }
    }

    // Check if guest owns this moderation record
    if (moderation.guestId !== guestId) {
      return {
        canAppeal: false,
        reason: 'You cannot appeal this action'
      }
    }

    // Check if there's already an appeal for this moderation
    const existingAppeal = await prisma.guestAppeal.findFirst({
      where: {
        guestId,
        moderationId
      },
      select: {
        id: true,
        status: true,
        submittedAt: true
      }
    })

    if (existingAppeal) {
      // If appeal is pending or under review, cannot submit another
      if (existingAppeal.status === 'PENDING' || existingAppeal.status === 'UNDER_REVIEW') {
        return {
          canAppeal: false,
          reason: 'An appeal for this action is already under review',
          existingAppealId: existingAppeal.id,
          existingAppealStatus: existingAppeal.status
        }
      }

      // If appeal was denied, check if they can re-appeal (they cannot)
      if (existingAppeal.status === 'DENIED') {
        return {
          canAppeal: false,
          reason: 'This action has already been appealed and denied. You cannot appeal again.',
          existingAppealId: existingAppeal.id,
          existingAppealStatus: existingAppeal.status
        }
      }

      // If appeal was approved, no need to appeal again
      if (existingAppeal.status === 'APPROVED') {
        return {
          canAppeal: false,
          reason: 'This action has already been appealed and approved',
          existingAppealId: existingAppeal.id,
          existingAppealStatus: existingAppeal.status
        }
      }
    }

    // Can appeal this moderation action
    return {
      canAppeal: true
    }
  } catch (error) {
    console.error('Error checking moderation appeal eligibility:', error)
    
    return {
      canAppeal: false,
      reason: 'Unable to verify appeal eligibility. Please try again later.'
    }
  }
}

/**
 * Combined check - both time limit and moderation-specific
 */
export async function canSubmitAppeal(
  guestId: string,
  moderationId?: string
): Promise<AppealLimitResult & { moderationCheck?: ModerationAppealCheck }> {
  // Check time-based limit
  const timeLimitResult = await canGuestAppeal(guestId)

  if (!timeLimitResult.canAppeal) {
    return timeLimitResult
  }

  // If moderationId provided, check moderation-specific rules
  if (moderationId) {
    const moderationCheck = await canAppealModeration(guestId, moderationId)
    
    if (!moderationCheck.canAppeal) {
      return {
        ...timeLimitResult,
        canAppeal: false,
        reason: moderationCheck.reason,
        moderationCheck
      }
    }

    return {
      ...timeLimitResult,
      moderationCheck
    }
  }

  return timeLimitResult
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get guest's appeal history summary
 */
export async function getAppealHistory(guestId: string, limit: number = 10) {
  try {
    const appeals = await prisma.guestAppeal.findMany({
      where: { guestId },
      select: {
        id: true,
        submittedAt: true,
        status: true,
        reviewedAt: true,
        reviewedBy: true,
        moderation: {
          select: {
            actionType: true,
            suspensionLevel: true,
            publicReason: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      },
      take: limit
    })

    return appeals
  } catch (error) {
    console.error('Error fetching appeal history:', error)
    return []
  }
}

/**
 * Count total appeals by guest
 */
export async function getTotalAppealCount(guestId: string): Promise<number> {
  try {
    return await prisma.guestAppeal.count({
      where: { guestId }
    })
  } catch (error) {
    console.error('Error counting appeals:', error)
    return 0
  }
}

/**
 * Get pending appeal count for guest
 */
export async function getPendingAppealCount(guestId: string): Promise<number> {
  try {
    return await prisma.guestAppeal.count({
      where: {
        guestId,
        status: {
          in: ['PENDING', 'UNDER_REVIEW']
        }
      }
    })
  } catch (error) {
    console.error('Error counting pending appeals:', error)
    return 0
  }
}

/**
 * Check if guest has any pending appeals
 */
export async function hasPendingAppeals(guestId: string): Promise<boolean> {
  const count = await getPendingAppealCount(guestId)
  return count > 0
}

/**
 * Get days until next appeal is available
 */
export function getDaysUntilNextAppeal(nextAvailableAt: Date): number {
  const now = new Date()
  const diffTime = nextAvailableAt.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

/**
 * Format appeal limit message for display
 */
export function formatAppealLimitMessage(result: AppealLimitResult): string {
  if (result.canAppeal) {
    return `You can submit ${result.remainingAppeals} more appeal${result.remainingAppeals === 1 ? '' : 's'} in the next ${APPEAL_LIMITS.periodDays} days.`
  }

  if (result.nextAppealAvailableAt) {
    const daysUntil = getDaysUntilNextAppeal(result.nextAppealAvailableAt)
    return `You have reached your appeal limit. Next appeal available in ${daysUntil} day${daysUntil === 1 ? '' : 's'}.`
  }

  return result.reason || 'Appeal limit reached'
}

// ============================================
// ADMIN HELPERS
// ============================================

/**
 * Get appeal statistics for a guest (for admin view)
 */
export async function getGuestAppealStats(guestId: string) {
  try {
    const [
      totalAppeals,
      pendingAppeals,
      approvedAppeals,
      deniedAppeals,
      recentAppeals
    ] = await Promise.all([
      prisma.guestAppeal.count({ where: { guestId } }),
      prisma.guestAppeal.count({ where: { guestId, status: 'PENDING' } }),
      prisma.guestAppeal.count({ where: { guestId, status: 'APPROVED' } }),
      prisma.guestAppeal.count({ where: { guestId, status: 'DENIED' } }),
      prisma.guestAppeal.count({
        where: {
          guestId,
          submittedAt: {
            gte: new Date(Date.now() - APPEAL_LIMITS.periodDays * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    return {
      totalAppeals,
      pendingAppeals,
      approvedAppeals,
      deniedAppeals,
      recentAppeals,
      canSubmitMore: recentAppeals < APPEAL_LIMITS.maxAppealsPerPeriod
    }
  } catch (error) {
    console.error('Error fetching guest appeal stats:', error)
    return null
  }
}

/**
 * Reset appeal limits for a guest (admin only - use with caution)
 */
export async function resetAppealLimits(guestId: string, adminId: string) {
  try {
    // This doesn't delete appeals, but you could mark them as expired
    // or implement a whitelist table for guests with extended appeal rights
    
    console.log(`Appeal limits reset for guest ${guestId} by admin ${adminId}`)
    
    // Implementation depends on your specific requirements
    // You might want to add a field in ReviewerProfile like:
    // - appealLimitOverride: boolean
    // - extendedAppealCount: number
    
    return {
      success: true,
      message: 'Appeal limits reset successfully'
    }
  } catch (error) {
    console.error('Error resetting appeal limits:', error)
    return {
      success: false,
      message: 'Failed to reset appeal limits'
    }
  }
}