// lib/helpers/suspensionChecker.ts

import { prisma } from '@/app/lib/database/prisma'

/**
 * Suspension Checker & Auto-Expiry
 * Automatically lifts expired suspensions
 * Can be called on login or via cron job
 */

// ============================================
// TYPES
// ============================================

export interface SuspensionCheckResult {
  wasExpired: boolean
  wasLifted: boolean
  previousLevel?: string
  clearedAt?: Date
  error?: string
}

export interface BatchCheckResult {
  totalChecked: number
  totalLifted: number
  errors: string[]
  liftedGuests: Array<{
    guestId: string
    guestName: string
    previousLevel: string
    clearedAt: Date
  }>
}

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Check and auto-lift expired suspension for a single guest
 * Use this on login or when guest accesses their account
 */
export async function checkAndLiftExpiredSuspension(
  guestId: string
): Promise<SuspensionCheckResult> {
  try {
    // Get guest with suspension info
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id: guestId },
      select: {
        id: true,
        name: true,
        suspensionLevel: true,
        suspensionExpiresAt: true,
        autoReactivate: true,
        suspendedAt: true,
        suspendedReason: true,
        suspendedBy: true
      }
    })

    if (!guest) {
      return {
        wasExpired: false,
        wasLifted: false,
        error: 'Guest not found'
      }
    }

    // Check if guest has an active suspension
    if (!guest.suspensionLevel || guest.suspensionLevel === 'BANNED') {
      return {
        wasExpired: false,
        wasLifted: false
      }
    }

    // Check if suspension has an expiry date
    if (!guest.suspensionExpiresAt) {
      return {
        wasExpired: false,
        wasLifted: false
      }
    }

    // Check if suspension is expired
    const now = new Date()
    const isExpired = guest.suspensionExpiresAt <= now

    if (!isExpired) {
      return {
        wasExpired: false,
        wasLifted: false
      }
    }

    // Check if auto-reactivate is enabled
    if (!guest.autoReactivate) {
      return {
        wasExpired: true,
        wasLifted: false,
        previousLevel: guest.suspensionLevel
      }
    }

    // Lift the suspension
    const result = await liftSuspension(guestId, 'SYSTEM_AUTO_EXPIRY')

    return {
      wasExpired: true,
      wasLifted: result.success,
      previousLevel: guest.suspensionLevel,
      clearedAt: now,
      error: result.error
    }
  } catch (error) {
    console.error('Error checking suspension expiry:', error)
    return {
      wasExpired: false,
      wasLifted: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Lift suspension and clear restrictions
 */
async function liftSuspension(
  guestId: string,
  liftedBy: string = 'SYSTEM_AUTO_EXPIRY'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current suspension info before clearing
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id: guestId },
      select: {
        id: true,
        name: true,
        suspensionLevel: true,
        suspendedReason: true,
        suspensionExpiresAt: true
      }
    })

    if (!guest || !guest.suspensionLevel) {
      return { success: false, error: 'No active suspension found' }
    }

    // Update guest profile - clear suspension and restrictions
    await prisma.reviewerProfile.update({
      where: { id: guestId },
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
        requiresManualApproval: false
      }
    })

    // Create GuestModeration entry for the auto-unsuspend action
    await prisma.guestModeration.create({
      data: {
        id: crypto.randomUUID(),
        guestId,
        actionType: 'UNSUSPEND',
        suspensionLevel: null,
        publicReason: `Your ${guest.suspensionLevel?.toLowerCase()} suspension has expired and your account has been automatically reactivated.`,
        internalNotes: `Auto-lifted expired ${guest.suspensionLevel} suspension. Original reason: ${guest.suspendedReason || 'N/A'}. Expiry date: ${guest.suspensionExpiresAt?.toISOString()}`,
        takenBy: liftedBy,
        takenAt: new Date(),
        restrictionsApplied: [] // No restrictions after unsuspend
      }
    })

    console.log(`✅ Auto-lifted suspension for guest ${guestId} (${guest.name})`)

    return { success: true }
  } catch (error) {
    console.error('Error lifting suspension:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to lift suspension'
    }
  }
}

/**
 * Batch check all expired suspensions (for cron job)
 * Run this periodically (every hour or daily)
 */
export async function checkAllExpiredSuspensions(): Promise<BatchCheckResult> {
  const result: BatchCheckResult = {
    totalChecked: 0,
    totalLifted: 0,
    errors: [],
    liftedGuests: []
  }

  try {
    const now = new Date()

    // Find all guests with expired suspensions that have auto-reactivate enabled
    const expiredGuests = await prisma.reviewerProfile.findMany({
      where: {
        suspensionLevel: {
          in: ['SOFT', 'HARD'] // Don't auto-lift bans
        },
        suspensionExpiresAt: {
          lte: now // Expired
        },
        autoReactivate: true
      },
      select: {
        id: true,
        name: true,
        suspensionLevel: true,
        suspensionExpiresAt: true
      }
    })

    result.totalChecked = expiredGuests.length

    console.log(`🔍 Found ${expiredGuests.length} expired suspensions to lift`)

    // Lift each suspension
    for (const guest of expiredGuests) {
      try {
        const liftResult = await liftSuspension(guest.id, 'SYSTEM_CRON_AUTO_EXPIRY')

        if (liftResult.success) {
          result.totalLifted++
          result.liftedGuests.push({
            guestId: guest.id,
            guestName: guest.name,
            previousLevel: guest.suspensionLevel || 'UNKNOWN',
            clearedAt: new Date()
          })
        } else {
          result.errors.push(`Failed to lift suspension for ${guest.name}: ${liftResult.error}`)
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        result.errors.push(`Error processing ${guest.name}: ${errorMsg}`)
        console.error(`❌ Error lifting suspension for guest ${guest.id}:`, error)
      }
    }

    console.log(`✅ Auto-lifted ${result.totalLifted} of ${result.totalChecked} expired suspensions`)

    return result
  } catch (error) {
    console.error('Error in batch suspension check:', error)
    result.errors.push(error instanceof Error ? error.message : 'Unknown error')
    return result
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if suspension is expired (without lifting)
 */
export async function isSuspensionExpired(guestId: string): Promise<boolean> {
  try {
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id: guestId },
      select: {
        suspensionLevel: true,
        suspensionExpiresAt: true
      }
    })

    if (!guest || !guest.suspensionLevel || !guest.suspensionExpiresAt) {
      return false
    }

    return guest.suspensionExpiresAt <= new Date()
  } catch (error) {
    console.error('Error checking if suspension expired:', error)
    return false
  }
}

/**
 * Get days remaining on suspension
 */
export async function getDaysRemaining(guestId: string): Promise<number | null> {
  try {
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id: guestId },
      select: {
        suspensionExpiresAt: true
      }
    })

    if (!guest || !guest.suspensionExpiresAt) {
      return null
    }

    const now = new Date()
    const diffTime = guest.suspensionExpiresAt.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return Math.max(0, diffDays)
  } catch (error) {
    console.error('Error getting days remaining:', error)
    return null
  }
}

/**
 * Get count of guests with expired suspensions
 */
export async function getExpiredSuspensionCount(): Promise<number> {
  try {
    const now = new Date()

    return await prisma.reviewerProfile.count({
      where: {
        suspensionLevel: {
          in: ['SOFT', 'HARD']
        },
        suspensionExpiresAt: {
          lte: now
        },
        autoReactivate: true
      }
    })
  } catch (error) {
    console.error('Error counting expired suspensions:', error)
    return 0
  }
}

/**
 * Get list of guests with expiring suspensions (within X days)
 */
export async function getExpiringSuspensions(daysAhead: number = 7) {
  try {
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)

    return await prisma.reviewerProfile.findMany({
      where: {
        suspensionLevel: {
          in: ['SOFT', 'HARD']
        },
        suspensionExpiresAt: {
          gte: now,
          lte: futureDate
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        suspensionLevel: true,
        suspensionExpiresAt: true,
        autoReactivate: true
      },
      orderBy: {
        suspensionExpiresAt: 'asc'
      }
    })
  } catch (error) {
    console.error('Error getting expiring suspensions:', error)
    return []
  }
}

// ============================================
// MIDDLEWARE INTEGRATION
// ============================================

/**
 * Middleware helper - Check suspension on user login/request
 * Call this in your auth middleware or API routes
 */
export async function checkSuspensionOnLogin(guestId: string): Promise<{
  shouldBlock: boolean
  message?: string
  suspensionLifted?: boolean
}> {
  try {
    // Try to lift expired suspension
    const checkResult = await checkAndLiftExpiredSuspension(guestId)

    if (checkResult.wasLifted) {
      return {
        shouldBlock: false,
        suspensionLifted: true,
        message: 'Your suspension has expired and your account has been reactivated!'
      }
    }

    // Check if still suspended
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id: guestId },
      select: {
        suspensionLevel: true,
        suspensionExpiresAt: true,
        suspendedReason: true
      }
    })

    if (!guest) {
      return { shouldBlock: false }
    }

    // Block if banned
    if (guest.suspensionLevel === 'BANNED') {
      return {
        shouldBlock: true,
        message: 'Your account has been permanently banned. Please contact support for more information.'
      }
    }

    // Block if hard suspended
    if (guest.suspensionLevel === 'HARD') {
      const daysRemaining = guest.suspensionExpiresAt 
        ? Math.ceil((guest.suspensionExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null

      return {
        shouldBlock: true,
        message: daysRemaining
          ? `Your account is suspended for ${daysRemaining} more day${daysRemaining === 1 ? '' : 's'}. Reason: ${guest.suspendedReason}`
          : `Your account is suspended. Reason: ${guest.suspendedReason}`
      }
    }

    // Allow login for soft suspension (but limit booking)
    return { shouldBlock: false }
  } catch (error) {
    console.error('Error checking suspension on login:', error)
    return { shouldBlock: false } // Fail open to not lock out users on errors
  }
}

// ============================================
// CRON JOB INTEGRATION
// ============================================

/**
 * Main cron handler - Call this from Vercel Cron or similar
 * 
 * Example Vercel Cron config (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-suspensions",
 *     "schedule": "0 * * * *"  // Every hour
 *   }]
 * }
 */
export async function runSuspensionCron(): Promise<{
  success: boolean
  stats: BatchCheckResult
}> {
  console.log('🕐 Running suspension expiry cron job...')

  const stats = await checkAllExpiredSuspensions()

  const success = stats.errors.length === 0

  if (success) {
    console.log(`✅ Cron completed successfully: ${stats.totalLifted}/${stats.totalChecked} suspensions lifted`)
  } else {
    console.error(`⚠️ Cron completed with errors: ${stats.errors.length} errors`)
    stats.errors.forEach(err => console.error(`  - ${err}`))
  }

  return { success, stats }
}