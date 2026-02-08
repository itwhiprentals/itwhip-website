// lib/helpers/guestProfileStatus.ts

/**
 * Guest Profile Status Helper Functions
 * 
 * Core utilities for managing guest profile status, warnings, restrictions, and notifications.
 * These functions provide a single source of truth for all guest status operations.
 */

import { prisma } from '@/app/lib/database/prisma'
import type {
  GuestProfileStatus,
  StatusHistoryEntry,
  RestrictionHistoryEntry,
  NotificationHistoryEntry,
  UpdateProfileStatusParams,
  AddNotificationParams,
  UpdateNotificationDeliveryParams,
  ActiveRestriction,
  AccountHealth,
  HealthFactors,
  FormattedStatusForDisplay,
  TimelineEvent,
  FormattedNotification,
  AccountStatus,
  RestrictionType,
  WarningCategory,
  ModerationType,
  NotificationType,
  TimelineColor
} from './guestProfileStatusTypes'

// ============================================================================
// 1. GET GUEST PROFILE STATUS
// ============================================================================

/**
 * Fetch complete profile status for a guest
 * 
 * @param guestId - ReviewerProfile ID
 * @returns Complete GuestProfileStatus or null if not found
 */
export async function getGuestProfileStatus(
  guestId: string
): Promise<GuestProfileStatus | null> {
  try {
    const status = await prisma.guestProfileStatus.findUnique({
      where: { guestId }
    })

    if (!status) {
      return null
    }

    // Parse JSON fields
    return {
      ...status,
      statusHistory: Array.isArray(status.statusHistory)
        ? status.statusHistory as unknown as StatusHistoryEntry[]
        : [],
      restrictionHistory: Array.isArray(status.restrictionHistory)
        ? status.restrictionHistory as unknown as RestrictionHistoryEntry[]
        : [],
      notificationHistory: Array.isArray(status.notificationHistory)
        ? status.notificationHistory as unknown as NotificationHistoryEntry[]
        : []
    }
  } catch (error) {
    console.error('Failed to fetch guest profile status:', error)
    return null
  }
}

// ============================================================================
// 2. UPDATE PROFILE STATUS (MAIN FUNCTION)
// ============================================================================

/**
 * Update profile status when Fleet Admin takes action
 * This is the MAIN function that should be called from the Fleet Admin API
 * 
 * @param guestId - ReviewerProfile ID
 * @param params - Action parameters
 */
export async function updateProfileStatus(
  guestId: string,
  params: UpdateProfileStatusParams
): Promise<void> {
  const now = new Date()

  try {
    // Fetch or create profile status
    let profileStatus = await getGuestProfileStatus(guestId)
    
    if (!profileStatus) {
      // Create if doesn't exist
      await createInitialProfileStatus(guestId)
      profileStatus = await getGuestProfileStatus(guestId)
      if (!profileStatus) throw new Error('Failed to create profile status')
    }

    // Determine new account status
    const newAccountStatus = determineAccountStatus(params, profileStatus)

    // Build status history entry
    const statusEntry: StatusHistoryEntry = {
      timestamp: now.toISOString(),
      action: params.action,
      category: params.category,
      suspensionLevel: params.suspensionLevel,
      description: buildStatusDescription(params),
      reason: params.reason,
      internalNotes: params.internalNotes,
      performedBy: params.issuedBy,
      expiresAt: params.expiresAt?.toISOString() || null,
      relatedBookingId: params.relatedBookingId,
      relatedClaimId: params.relatedClaimId,
      metadata: params.metadata
    }

    // Build restriction history entries if restrictions changed
    const restrictionEntries: RestrictionHistoryEntry[] = []
    if (params.restrictions && params.restrictions.length > 0) {
      for (const restriction of params.restrictions) {
        restrictionEntries.push({
          timestamp: now.toISOString(),
          action: 'ADDED',
          restrictionType: restriction,
          reason: params.reason,
          category: params.category,
          appliedBy: params.issuedBy,
          expiresAt: params.expiresAt?.toISOString() || null
        })
      }
    }

    // Update active restrictions array
    const newActiveRestrictions = params.restrictions 
      ? [...new Set([...profileStatus.activeRestrictions, ...params.restrictions])]
      : profileStatus.activeRestrictions

    // Update counts
    const activeWarningDelta = params.action === 'WARNING' ? 1 : 0
    const activeSuspensionDelta = params.action === 'SUSPEND' ? 1 : 
                                   params.action === 'UNSUSPEND' ? -1 : 0

    // Update database
    await prisma.guestProfileStatus.update({
      where: { guestId },
      data: {
        accountStatus: newAccountStatus,
        activeWarningCount: { increment: activeWarningDelta },
        activeSuspensions: Math.max(0, profileStatus.activeSuspensions + activeSuspensionDelta),
        activeRestrictions: newActiveRestrictions,
        statusHistory: [
          statusEntry,
          ...profileStatus.statusHistory
        ] as any,
        restrictionHistory: [
          ...restrictionEntries,
          ...profileStatus.restrictionHistory
        ] as any,
        lastWarningAt: params.action === 'WARNING' ? now : profileStatus.lastWarningAt,
        lastSuspensionAt: ['SUSPEND', 'BAN'].includes(params.action) ? now : profileStatus.lastSuspensionAt,
        updatedAt: now
      }
    })

    console.log('✅ Profile status updated:', {
      guestId,
      action: params.action,
      newStatus: newAccountStatus,
      timestamp: now.toISOString()
    })

  } catch (error) {
    console.error('Failed to update profile status:', error)
    throw error
  }
}

// ============================================================================
// 3. ADD NOTIFICATION TO HISTORY
// ============================================================================

/**
 * Track a notification sent to guest
 * 
 * @param guestId - ReviewerProfile ID
 * @param params - Notification details
 */
export async function addNotificationToHistory(
  guestId: string,
  params: AddNotificationParams
): Promise<void> {
  const now = new Date()

  try {
    const profileStatus = await getGuestProfileStatus(guestId)
    if (!profileStatus) {
      console.warn('Profile status not found, creating...')
      await createInitialProfileStatus(guestId)
      return addNotificationToHistory(guestId, params)
    }

    const notificationEntry: NotificationHistoryEntry = {
      timestamp: now.toISOString(),
      type: params.type,
      subject: params.subject,
      method: params.method,
      sentTo: params.sentTo,
      sentBy: params.sentBy,
      delivered: false,
      opened: false,
      clicked: false,
      metadata: params.metadata
    }

    await prisma.guestProfileStatus.update({
      where: { guestId },
      data: {
        notificationHistory: [
          notificationEntry,
          ...profileStatus.notificationHistory
        ] as any,
        lastNotificationAt: now,
        updatedAt: now
      }
    })

    console.log('✅ Notification tracked:', {
      guestId,
      type: params.type,
      timestamp: now.toISOString()
    })

  } catch (error) {
    console.error('Failed to add notification to history:', error)
    throw error
  }
}

// ============================================================================
// 4. CHECK IF GUEST HAS ACTIVE RESTRICTION
// ============================================================================

/**
 * Check if guest has a specific restriction
 * 
 * @param guestId - ReviewerProfile ID
 * @param restriction - Restriction type to check
 * @returns true if restriction is active
 */
export async function hasActiveRestriction(
  guestId: string,
  restriction: RestrictionType
): Promise<boolean> {
  try {
    const profileStatus = await getGuestProfileStatus(guestId)
    if (!profileStatus) return false

    return profileStatus.activeRestrictions.includes(restriction)
  } catch (error) {
    console.error('Failed to check restriction:', error)
    return false
  }
}

// ============================================================================
// 5. GET ALL ACTIVE RESTRICTIONS
// ============================================================================

/**
 * Get all current restrictions with details
 * 
 * @param guestId - ReviewerProfile ID
 * @returns Array of active restrictions with expiration info
 */
export async function getActiveRestrictions(
  guestId: string
): Promise<ActiveRestriction[]> {
  try {
    const profileStatus = await getGuestProfileStatus(guestId)
    if (!profileStatus) return []

    const now = new Date()
    const activeRestrictions: ActiveRestriction[] = []

    for (const restrictionType of profileStatus.activeRestrictions) {
      // Find the most recent restriction entry for this type
      const restrictionEntry = profileStatus.restrictionHistory.find(
        entry => entry.restrictionType === restrictionType && 
                 entry.action === 'ADDED' &&
                 (!entry.expiresAt || new Date(entry.expiresAt) > now)
      )

      if (restrictionEntry) {
        const expiresAt = restrictionEntry.expiresAt ? new Date(restrictionEntry.expiresAt) : null
        const daysRemaining = expiresAt 
          ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null

        activeRestrictions.push({
          type: restrictionType as RestrictionType,
          reason: restrictionEntry.reason,
          category: restrictionEntry.category,
          appliedAt: restrictionEntry.timestamp,
          appliedBy: restrictionEntry.appliedBy,
          expiresAt: restrictionEntry.expiresAt ?? null,
          daysRemaining
        })
      }
    }

    return activeRestrictions
  } catch (error) {
    console.error('Failed to get active restrictions:', error)
    return []
  }
}

// ============================================================================
// 6. CALCULATE ACCOUNT HEALTH
// ============================================================================

/**
 * Calculate account health score (0-100)
 * 
 * @param guestId - ReviewerProfile ID
 * @returns Account health with score and factors
 */
export async function calculateAccountHealth(
  guestId: string
): Promise<AccountHealth> {
  try {
    // Fetch guest data
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id: guestId },
      include: {
        RentalBooking: {
          select: {
            status: true,
            startDate: true,
            endDate: true,
            actualEndTime: true,
            damageReported: true
          }
        },
        RentalReview: {
          select: {
            rating: true,
            cleanliness: true
          }
        }
      }
    })

    if (!guest) {
      return {
        score: 0,
        status: 'POOR',
        factors: getDefaultHealthFactors(),
        recommendations: ['Complete your profile to improve your health score']
      }
    }

    const profileStatus = await getGuestProfileStatus(guestId)
    const bookings = guest.RentalBooking as any[]
    const reviews = guest.RentalReview as any[]
    const completedBookings = bookings.filter((b: any) => b.status === 'COMPLETED')

    // Calculate factors
    const factors: HealthFactors = {
      onTimeReturns: calculateOnTimeReturns(bookings),
      cleanlinessRating: calculateAverageCleanliness(reviews),
      communicationScore: 85, // TODO: Calculate from message response times
      warningPenalty: profileStatus ? profileStatus.activeWarningCount * -5 : 0,
      completedTrips: completedBookings.length,
      cancellationRate: calculateCancellationRate(bookings),
      damageIncidents: bookings.filter((b: any) => b.damageReported).length
    }

    // Calculate total score (0-100)
    let score = 100
    score += factors.warningPenalty // Deduct 5 points per warning
    score -= factors.cancellationRate * 20 // Deduct up to 20 for high cancellation
    score -= factors.damageIncidents * 10 // Deduct 10 per damage incident
    score = Math.max(0, Math.min(100, score)) // Clamp to 0-100

    // Determine status
    const status: AccountHealth['status'] = 
      score >= 90 ? 'EXCELLENT' :
      score >= 70 ? 'GOOD' :
      score >= 50 ? 'FAIR' : 'POOR'

    // Generate recommendations
    const recommendations = generateRecommendations(factors, profileStatus)

    return { score, status, factors, recommendations }

  } catch (error) {
    console.error('Failed to calculate account health:', error)
    return {
      score: 0,
      status: 'POOR',
      factors: getDefaultHealthFactors(),
      recommendations: ['Unable to calculate health score']
    }
  }
}

// ============================================================================
// 7. EXPIRE OLD WARNINGS
// ============================================================================

/**
 * Auto-expire warnings that have passed expiration date
 * Should be run by cron job daily
 * 
 * @param guestId - Optional: expire for specific guest. If not provided, expires all
 */
export async function expireOldWarnings(guestId?: string): Promise<number> {
  const now = new Date()
  let expiredCount = 0

  try {
    // Find all profiles with active warnings
    const where = guestId ? { guestId } : {}
    const profiles = await prisma.guestProfileStatus.findMany({
      where: {
        ...where,
        activeWarningCount: { gt: 0 }
      }
    })

    for (const profile of profiles) {
      const typedProfile = {
        ...profile,
        statusHistory: profile.statusHistory as unknown as StatusHistoryEntry[],
        restrictionHistory: profile.restrictionHistory as unknown as RestrictionHistoryEntry[],
        notificationHistory: profile.notificationHistory as unknown as NotificationHistoryEntry[]
      }

      // Find expired warnings
      const expiredWarnings = typedProfile.statusHistory.filter(
        entry => entry.action === 'WARNING' &&
                 entry.expiresAt &&
                 new Date(entry.expiresAt) <= now
      )

      if (expiredWarnings.length === 0) continue

      // Find expired restrictions
      const expiredRestrictions = typedProfile.restrictionHistory.filter(
        entry => entry.action === 'ADDED' &&
                 entry.expiresAt &&
                 new Date(entry.expiresAt) <= now
      )

      // Remove expired restrictions from active list
      const restrictionsToRemove = expiredRestrictions.map(r => r.restrictionType)
      const newActiveRestrictions = profile.activeRestrictions.filter(
        (r: string) => !restrictionsToRemove.includes(r as RestrictionType)
      )

      // Add expiration entries to history
      const expirationEntries: StatusHistoryEntry[] = expiredWarnings.map(warning => ({
        timestamp: now.toISOString(),
        action: 'WARNING',
        category: warning.category,
        description: `Warning expired: ${warning.description}`,
        reason: 'Warning period completed',
        performedBy: 'SYSTEM',
        expiresAt: null,
        metadata: { originalWarningId: warning.timestamp }
      }))

      // Update profile
      await prisma.guestProfileStatus.update({
        where: { guestId: profile.guestId },
        data: {
          activeWarningCount: Math.max(0, profile.activeWarningCount - expiredWarnings.length),
          activeRestrictions: newActiveRestrictions,
          statusHistory: [
            ...expirationEntries,
            ...typedProfile.statusHistory
          ] as any,
          updatedAt: now
        }
      })

      // Update ReviewerProfile restriction flags
      await prisma.reviewerProfile.update({
        where: { id: profile.guestId },
        data: {
          canInstantBook: !newActiveRestrictions.includes('INSTANT_BOOK'),
          canBookLuxury: !newActiveRestrictions.includes('LUXURY_CARS'),
          canBookPremium: !newActiveRestrictions.includes('PREMIUM_CARS'),
          requiresManualApproval: newActiveRestrictions.includes('MANUAL_APPROVAL')
        }
      })

      expiredCount += expiredWarnings.length

      console.log(`✅ Expired ${expiredWarnings.length} warnings for guest ${profile.guestId}`)
    }

    return expiredCount

  } catch (error) {
    console.error('Failed to expire old warnings:', error)
    return 0
  }
}

// ============================================================================
// 8. CREATE INITIAL PROFILE STATUS
// ============================================================================

/**
 * Create empty profile status record for new guests
 * 
 * @param guestId - ReviewerProfile ID
 */
export async function createInitialProfileStatus(guestId: string): Promise<void> {
  const now = new Date()

  try {
    const initialHistory: StatusHistoryEntry = {
      timestamp: now.toISOString(),
      action: 'NOTE_ADDED',
      description: 'Guest account created',
      reason: 'New account',
      performedBy: 'SYSTEM',
      expiresAt: null
    }

    await prisma.guestProfileStatus.create({
      data: {
        id: crypto.randomUUID(),
        guestId,
        accountStatus: 'ACTIVE',
        activeWarningCount: 0,
        activeSuspensions: 0,
        activeRestrictions: [],
        statusHistory: [initialHistory] as any,
        restrictionHistory: [],
        notificationHistory: [],
        createdAt: now,
        updatedAt: now
      }
    })

    console.log('✅ Initial profile status created for guest:', guestId)

  } catch (error) {
    console.error('Failed to create initial profile status:', error)
    throw error
  }
}

// ============================================================================
// 9. FORMAT STATUS FOR DISPLAY
// ============================================================================

/**
 * Format raw database data for UI display
 * 
 * @param guestId - ReviewerProfile ID
 * @returns Dashboard-ready formatted data
 */
export async function formatStatusForDisplay(
  guestId: string
): Promise<FormattedStatusForDisplay | null> {
  try {
    const profileStatus = await getGuestProfileStatus(guestId)
    if (!profileStatus) return null

    const health = await calculateAccountHealth(guestId)
    const activeRestrictions = await getActiveRestrictions(guestId)

    // Count active warnings dynamically from statusHistory
    const now = new Date()
    const activeWarningCount = profileStatus.statusHistory.filter(
      entry => entry.action === 'WARNING' &&
               (!entry.expiresAt || new Date(entry.expiresAt) > now)
    ).length

    // Format timeline events
    const timeline: TimelineEvent[] = profileStatus.statusHistory
      .slice(0, 20) // Limit to 20 events
      .map((entry, index) => ({
        id: `event-${index}`,
        date: formatDate(entry.timestamp),
        time: formatTime(entry.timestamp),
        icon: getTimelineIcon(entry.action, entry.category),
        title: getTimelineTitle(entry.action, entry.category),
        description: entry.description,
        color: getTimelineColor(entry.action) as TimelineColor,
        action: entry.action,
        category: entry.category,
        metadata: entry.metadata
      }))

    // Format notifications
    const recentNotifications: FormattedNotification[] = profileStatus.notificationHistory
      .slice(0, 10) // Limit to 10
      .map((entry, index) => ({
        id: `notif-${index}`,
        type: entry.type,
        subject: entry.subject,
        sentAt: formatDate(entry.timestamp),
        method: entry.method.join(', '),
        status: entry.opened ? 'Opened' : entry.delivered ? 'Delivered' : entry.failed ? 'Failed' : 'Pending',
        icon: getNotificationIcon(entry.type),
        color: getNotificationColor(entry.type)
      }))

    return {
      summary: {
        status: profileStatus.accountStatus as AccountStatus,
        warningCount: activeWarningCount, // Use dynamically calculated count
        restrictionCount: activeRestrictions.length,
        healthScore: health.score,
        healthStatus: health.status
      },
      timeline,
      activeRestrictions,
      recentNotifications
    }

  } catch (error) {
    console.error('Failed to format status for display:', error)
    return null
  }
}

// ============================================================================
// 10. ADD STATUS HISTORY ENTRY (STANDALONE)
// ============================================================================

/**
 * Add a standalone entry to status history (for events not requiring full update)
 * 
 * @param guestId - ReviewerProfile ID
 * @param entry - Partial status history entry
 */
export async function addStatusHistoryEntry(
  guestId: string,
  entry: Partial<StatusHistoryEntry> & { action: ModerationType; description: string }
): Promise<void> {
  const now = new Date()

  try {
    const profileStatus = await getGuestProfileStatus(guestId)
    if (!profileStatus) {
      await createInitialProfileStatus(guestId)
      return addStatusHistoryEntry(guestId, entry)
    }

    const fullEntry: StatusHistoryEntry = {
      timestamp: now.toISOString(),
      reason: 'N/A',
      performedBy: 'SYSTEM',
      expiresAt: null,
      ...entry,
      action: entry.action,
      description: entry.description,
    }

    await prisma.guestProfileStatus.update({
      where: { guestId },
      data: {
        statusHistory: [
          fullEntry,
          ...profileStatus.statusHistory
        ] as any,
        updatedAt: now
      }
    })

  } catch (error) {
    console.error('Failed to add status history entry:', error)
    throw error
  }
}

// ============================================================================
// 11. TRACK ACTIVITY (UNIVERSAL FUNCTION)
// ============================================================================

/**
 * Universal activity tracking function
 * Use this to track ANY activity in your app
 * 
 * @param guestId - ReviewerProfile ID
 * @param activity - Activity details
 * 
 * @example
 * // Track booking creation
 * await trackActivity(guestId, {
 *   action: 'BOOKING_CREATED',
 *   description: 'Booked 2024 Tesla Model 3',
 *   metadata: {
 *     bookingId: 'abc123',
 *     carName: '2024 Tesla Model 3',
 *     totalAmount: 450
 *   }
 * })
 * 
 * @example
 * // Track payment capture
 * await trackActivity(guestId, {
 *   action: 'PAYMENT_CAPTURED',
 *   description: 'Payment of $450.00 captured',
 *   performedBy: 'STRIPE',
 *   metadata: {
 *     amount: 450,
 *     stripeChargeId: 'ch_123'
 *   }
 * })
 */
export async function trackActivity(
  guestId: string,
  activity: {
    action: ModerationType
    description: string
    performedBy?: string
    reason?: string
    category?: WarningCategory
    metadata?: Record<string, any>
  }
): Promise<void> {
  try {
    await addStatusHistoryEntry(guestId, {
      action: activity.action,
      description: activity.description,
      reason: activity.reason || activity.description,
      performedBy: activity.performedBy || 'SYSTEM',
      category: activity.category,
      metadata: activity.metadata,
      expiresAt: null
    })

    console.log('✅ Activity tracked:', {
      guestId,
      action: activity.action,
      description: activity.description
    })
  } catch (error) {
    // Don't throw - we don't want tracking to break the main flow
    console.error('❌ Failed to track activity:', {
      guestId,
      action: activity.action,
      error
    })
  }
}

// ============================================================================
// HELPER FUNCTIONS (INTERNAL USE)
// ============================================================================

function determineAccountStatus(
  params: UpdateProfileStatusParams,
  currentStatus: GuestProfileStatus
): AccountStatus {
  if (params.action === 'BAN') return 'BANNED'
  if (params.action === 'SUSPEND') {
    return params.suspensionLevel === 'SOFT' ? 'SOFT_SUSPENDED' : 'HARD_SUSPENDED'
  }
  if (params.action === 'UNSUSPEND' || params.action === 'UNBAN') return 'ACTIVE'
  if (params.action === 'WARNING' && currentStatus.activeWarningCount >= 0) return 'WARNED'
  return 'ACTIVE'
}

function buildStatusDescription(params: UpdateProfileStatusParams): string {
  switch (params.action) {
    case 'WARNING':
      return `Warning issued: ${params.category || 'Policy violation'}`
    case 'SUSPEND':
      return `Account suspended (${params.suspensionLevel}): ${params.reason}`
    case 'BAN':
      return `Account banned: ${params.reason}`
    case 'UNSUSPEND':
      return 'Account reactivated'
    default:
      return params.reason
  }
}

function calculateOnTimeReturns(bookings: any[]): number {
  const completed = bookings.filter(b => b.status === 'COMPLETED')
  if (completed.length === 0) return 100
  
  const onTime = completed.filter(b => {
    if (!b.actualEndTime) return true
    return new Date(b.actualEndTime) <= new Date(b.endDate)
  }).length
  
  return Math.round((onTime / completed.length) * 100)
}

function calculateAverageCleanliness(reviews: any[]): number {
  if (reviews.length === 0) return 100
  const sum = reviews.reduce((acc, r) => acc + (r.cleanliness || 5), 0)
  return Math.round((sum / reviews.length / 5) * 100)
}

function calculateCancellationRate(bookings: any[]): number {
  if (bookings.length === 0) return 0
  const cancelled = bookings.filter(b => b.status === 'CANCELLED').length
  return cancelled / bookings.length
}

function getDefaultHealthFactors(): HealthFactors {
  return {
    onTimeReturns: 100,
    cleanlinessRating: 100,
    communicationScore: 100,
    warningPenalty: 0,
    completedTrips: 0,
    cancellationRate: 0,
    damageIncidents: 0
  }
}

function generateRecommendations(
  factors: HealthFactors,
  profileStatus: GuestProfileStatus | null
): string[] {
  const recommendations: string[] = []
  
  if (factors.onTimeReturns < 90) {
    recommendations.push('Return vehicles on time to improve your score')
  }
  if (factors.damageIncidents > 0) {
    recommendations.push('Take care of vehicles to avoid damage incidents')
  }
  if (profileStatus && profileStatus.activeWarningCount > 0) {
    recommendations.push('Resolve active warnings by following community guidelines')
  }
  if (factors.completedTrips < 3) {
    recommendations.push('Complete more trips to build your reputation')
  }
  
  return recommendations
}

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function getTimelineIcon(action: ModerationType, category?: WarningCategory): string {
  if (action === 'WARNING') return '⚠️'
  if (action === 'SUSPEND') return '🚫'
  if (action === 'BAN') return '🔨'
  if (action === 'UNSUSPEND' || action === 'UNBAN') return '✅'
  return '📝'
}

function getTimelineTitle(action: ModerationType, category?: WarningCategory): string {
  if (action === 'WARNING') return `Warning Issued${category ? ` - ${formatCategory(category)}` : ''}`
  if (action === 'SUSPEND') return 'Account Suspended'
  if (action === 'BAN') return 'Account Banned'
  if (action === 'UNSUSPEND') return 'Account Reactivated'
  return 'Account Activity'
}

function getTimelineColor(action: ModerationType): string {
  switch (action) {
    case 'WARNING': return 'yellow'
    case 'SUSPEND': return 'orange'
    case 'BAN': return 'red'
    case 'UNSUSPEND':
    case 'UNBAN': return 'green'
    default: return 'blue'
  }
}

function getNotificationIcon(type: NotificationType): string {
  if (type.includes('WARNING')) return '⚠️'
  if (type.includes('SUSPENSION') || type.includes('BAN')) return '🚫'
  if (type.includes('APPROVED') || type.includes('VERIFIED')) return '✅'
  if (type.includes('DENIED')) return '❌'
  return '📧'
}

function getNotificationColor(type: NotificationType): string {
  if (type.includes('WARNING')) return 'yellow'
  if (type.includes('SUSPENSION') || type.includes('BAN')) return 'red'
  if (type.includes('APPROVED')) return 'green'
  return 'blue'
}

function formatCategory(category: WarningCategory): string {
  return category.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
}