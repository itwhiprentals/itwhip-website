// lib/helpers/guestProfileStatusTypes.ts

/**
 * Guest Profile Status Type Definitions
 * 
 * This file contains all TypeScript interfaces and types for the Guest Profile Status system.
 * These types match the Prisma schema and provide type safety for all status-related operations.
 */

// ============================================================================
// ACCOUNT STATUS TYPES
// ============================================================================

/**
 * Guest account status levels
 */
export type AccountStatus = 
  | 'ACTIVE'           // Normal account, no restrictions
  | 'WARNED'           // Has active warnings
  | 'SOFT_SUSPENDED'   // Can view, cannot book
  | 'HARD_SUSPENDED'   // Limited access
  | 'BANNED'           // Complete block

/**
 * Warning categories from Prisma enum
 */
export type WarningCategory = 
  | 'LATE_RETURNS'
  | 'VEHICLE_DAMAGE'
  | 'CLEANLINESS_ISSUES'
  | 'MILEAGE_VIOLATIONS'
  | 'POLICY_VIOLATIONS'
  | 'FRAUDULENT_ACTIVITY'
  | 'PAYMENT_ISSUES'
  | 'COMMUNICATION_ISSUES'
  | 'INAPPROPRIATE_BEHAVIOR'
  | 'UNAUTHORIZED_DRIVER'
  | 'SMOKING_VIOLATION'
  | 'PET_VIOLATION'
  | 'FUEL_VIOLATIONS'
  | 'DOCUMENTATION_ISSUES'
  | 'OTHER'

/**
 * Restriction types that can be applied to guest accounts
 */
export type RestrictionType = 
  | 'INSTANT_BOOK'      // Cannot book instantly, needs approval
  | 'LUXURY_CARS'       // Cannot book luxury vehicles
  | 'PREMIUM_CARS'      // Cannot book premium vehicles
  | 'MANUAL_APPROVAL'   // All bookings require manual approval

/**
 * Moderation action types from Prisma enum + Extended activity types
 */
export type ModerationType = 
  // Moderation actions
  | 'WARNING'
  | 'SUSPEND'
  | 'UNSUSPEND'
  | 'BAN'
  | 'UNBAN'
  | 'RESTRICTION_ADDED'
  | 'RESTRICTION_REMOVED'
  | 'NOTE_ADDED'
  
  // Account activities
  | 'ACCOUNT_CREATED'
  | 'PROFILE_UPDATED'
  | 'EMAIL_VERIFIED'
  | 'PHONE_VERIFIED'
  | 'PASSWORD_CHANGED'
  | 'AVATAR_UPDATED'
  
  // Document activities
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_VERIFIED'
  | 'DOCUMENT_REJECTED'
  | 'DOCUMENT_EXPIRED'
  
  // Insurance activities
  | 'INSURANCE_ADDED'
  | 'INSURANCE_VERIFIED'
  | 'INSURANCE_REMOVED'
  | 'INSURANCE_EXPIRED'
  
  // Booking activities
  | 'BOOKING_CREATED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'TRIP_STARTED'
  | 'TRIP_ENDED'
  | 'BOOKING_MODIFIED'
  | 'NO_SHOW'
  
  // Payment activities
  | 'PAYMENT_METHOD_ADDED'
  | 'PAYMENT_METHOD_REMOVED'
  | 'PAYMENT_AUTHORIZED'
  | 'PAYMENT_CAPTURED'
  | 'PAYMENT_FAILED'
  | 'REFUND_ISSUED'
  | 'REFUND_PROCESSED'
  | 'DISPUTE_OPENED'
  | 'DISPUTE_RESOLVED'
  | 'CHARGEBACK_RECEIVED'
  
  // Communication activities
  | 'EMAIL_SENT'
  | 'EMAIL_DELIVERED'
  | 'EMAIL_OPENED'
  | 'EMAIL_CLICKED'
  | 'EMAIL_BOUNCED'
  | 'SMS_SENT'
  | 'SMS_DELIVERED'
  | 'SMS_FAILED'
  | 'PUSH_NOTIFICATION_SENT'
  | 'MESSAGE_SENT'
  | 'MESSAGE_RECEIVED'
  
  // Review activities
  | 'REVIEW_SUBMITTED'
  | 'REVIEW_RECEIVED'
  | 'REVIEW_RESPONDED'
  | 'RATING_GIVEN'
  | 'RATING_RECEIVED'
  
  // Appeal activities
  | 'APPEAL_SUBMITTED'
  | 'APPEAL_UNDER_REVIEW'
  | 'APPEAL_APPROVED'
  | 'APPEAL_DENIED'
  
  // Warning activities
  | 'WARNING_EXPIRED'
  | 'WARNING_REMOVED'
  
  // Verification activities
  | 'VERIFICATION_REQUESTED'
  | 'VERIFICATION_COMPLETED'
  | 'VERIFICATION_FAILED'

/**
 * Suspension levels from Prisma enum
 */
export type SuspensionLevel = 
  | 'SOFT'    // Can view, can't book
  | 'HARD'    // Limited access
  | 'BANNED'  // Complete block

// ============================================================================
// HISTORY ENTRY TYPES
// ============================================================================

/**
 * Status history entry - stored in GuestProfileStatus.statusHistory JSON array
 */
export interface StatusHistoryEntry {
  timestamp: string                    // ISO date string
  action: ModerationType              // Type of action taken
  category?: WarningCategory          // For warnings only
  suspensionLevel?: SuspensionLevel   // For suspensions/bans
  description: string                 // Human-readable description
  reason: string                      // Public reason
  internalNotes?: string              // Admin-only notes
  performedBy: string                 // Admin email/ID
  expiresAt?: string | null           // ISO date string, null for permanent
  relatedBookingId?: string           // Related booking if any
  relatedClaimId?: string             // Related claim if any
  metadata?: Record<string, any>      // Additional data
}

/**
 * Restriction history entry - stored in GuestProfileStatus.restrictionHistory JSON array
 */
export interface RestrictionHistoryEntry {
  timestamp: string                   // ISO date string
  action: 'ADDED' | 'REMOVED'        // Was restriction added or removed?
  restrictionType: RestrictionType   // Type of restriction
  reason: string                      // Why was this restriction applied/removed?
  category?: WarningCategory          // Warning category that triggered this
  appliedBy: string                   // Admin email/ID
  expiresAt?: string | null           // When restriction expires
  removedBy?: string                  // Who removed it (if removed)
  removedAt?: string                  // When it was removed
}

/**
 * Notification history entry - stored in GuestProfileStatus.notificationHistory JSON array
 */
export interface NotificationHistoryEntry {
  timestamp: string                   // ISO date string
  type: NotificationType             // Type of notification
  subject: string                     // Email subject
  method: NotificationMethod[]       // How it was sent
  sentTo: string                      // Email/phone
  sentBy: string                      // System or admin
  delivered: boolean                  // Was it delivered?
  opened?: boolean                    // Was it opened? (email tracking)
  openedAt?: string                   // When was it opened?
  clicked?: boolean                   // Did they click any links?
  clickedAt?: string                  // When did they click?
  bounced?: boolean                   // Did email bounce?
  failed?: boolean                    // Did sending fail?
  failureReason?: string              // Why did it fail?
  metadata?: Record<string, any>      // Additional tracking data
}

/**
 * Notification types
 */
export type NotificationType = 
  | 'WARNING_ISSUED'
  | 'SUSPENSION_ISSUED'
  | 'BAN_ISSUED'
  | 'WARNING_EXPIRED'
  | 'SUSPENSION_EXPIRED'
  | 'ACCOUNT_REACTIVATED'
  | 'RESTRICTION_ADDED'
  | 'RESTRICTION_REMOVED'
  | 'APPEAL_RECEIVED'
  | 'APPEAL_APPROVED'
  | 'APPEAL_DENIED'
  | 'DOCUMENT_REQUEST'
  | 'DOCUMENT_VERIFIED'

/**
 * Notification delivery methods
 */
export type NotificationMethod = 
  | 'EMAIL'
  | 'SMS'
  | 'PUSH'
  | 'IN_APP'

// ============================================================================
// MAIN PROFILE STATUS INTERFACE
// ============================================================================

/**
 * Complete guest profile status - matches GuestProfileStatus Prisma model
 */
export interface GuestProfileStatus {
  id: string
  guestId: string
  
  // Current status
  accountStatus: string               // AccountStatus as string for Prisma
  activeWarningCount: number
  activeSuspensions: number
  activeRestrictions: string[]        // Array of RestrictionType
  
  // History arrays (stored as JSON in Prisma)
  statusHistory: StatusHistoryEntry[]
  restrictionHistory: RestrictionHistoryEntry[]
  notificationHistory: NotificationHistoryEntry[]
  
  // Timestamps
  lastWarningAt: Date | null
  lastSuspensionAt: Date | null
  lastNotificationAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// ACTIVE RESTRICTION INTERFACE
// ============================================================================

/**
 * Active restriction with details (computed from history)
 */
export interface ActiveRestriction {
  type: RestrictionType
  reason: string
  category?: WarningCategory
  appliedAt: string                   // ISO date string
  appliedBy: string
  expiresAt: string | null            // ISO date string or null for permanent
  daysRemaining: number | null        // null if permanent
}

// ============================================================================
// HEALTH SCORE TYPES
// ============================================================================

/**
 * Account health calculation result
 */
export interface AccountHealth {
  score: number                       // 0-100
  status: HealthStatus
  factors: HealthFactors
  recommendations: string[]
}

/**
 * Health status levels
 */
export type HealthStatus = 
  | 'EXCELLENT'   // 90-100
  | 'GOOD'        // 70-89
  | 'FAIR'        // 50-69
  | 'POOR'        // 0-49

/**
 * Factors that contribute to health score
 */
export interface HealthFactors {
  onTimeReturns: number               // Percentage
  cleanlinessRating: number           // Average rating
  communicationScore: number          // Response rate/quality
  warningPenalty: number              // Deduction for warnings
  completedTrips: number              // Total trips
  cancellationRate: number            // Percentage
  damageIncidents: number             // Count
}

// ============================================================================
// FUNCTION PARAMETER TYPES
// ============================================================================

/**
 * Parameters for updating profile status (used by updateProfileStatus helper)
 */
export interface UpdateProfileStatusParams {
  action: ModerationType
  category?: WarningCategory
  suspensionLevel?: SuspensionLevel
  restrictions?: RestrictionType[]
  reason: string
  internalNotes?: string
  issuedBy: string
  expiresAt?: Date | null
  relatedBookingId?: string
  relatedClaimId?: string
  metadata?: Record<string, any>
}

/**
 * Parameters for adding a notification to history
 */
export interface AddNotificationParams {
  type: NotificationType
  subject: string
  method: NotificationMethod[]
  sentTo: string
  sentBy: string
  metadata?: Record<string, any>
}

/**
 * Parameters for tracking notification delivery
 */
export interface UpdateNotificationDeliveryParams {
  notificationIndex: number           // Index in notificationHistory array
  delivered?: boolean
  opened?: boolean
  openedAt?: Date
  clicked?: boolean
  clickedAt?: Date
  bounced?: boolean
  failed?: boolean
  failureReason?: string
}

// ============================================================================
// FORMATTED DATA FOR DISPLAY (UI-READY)
// ============================================================================

/**
 * Status data formatted for dashboard display
 */
export interface FormattedStatusForDisplay {
  summary: {
    status: AccountStatus
    warningCount: number
    restrictionCount: number
    healthScore: number
    healthStatus: HealthStatus
  }
  timeline: TimelineEvent[]
  activeRestrictions: ActiveRestriction[]
  recentNotifications: FormattedNotification[]
}

/**
 * Timeline event for UI display
 */
export interface TimelineEvent {
  id: string
  date: string                        // Human-readable: "Oct 14, 2025"
  time: string                        // Human-readable: "2:30 PM"
  icon: string                        // Emoji or icon name
  title: string                       // Short title
  description: string                 // Longer description
  color: TimelineColor               // For visual styling
  action?: ModerationType
  category?: WarningCategory
  metadata?: Record<string, any>
}

/**
 * Timeline event colors
 */
export type TimelineColor = 
  | 'green'     // Positive events
  | 'yellow'    // Warnings
  | 'orange'    // Suspensions
  | 'red'       // Bans/severe
  | 'blue'      // Informational
  | 'gray'      // Neutral

/**
 * Formatted notification for UI display
 */
export interface FormattedNotification {
  id: string
  type: NotificationType
  subject: string
  sentAt: string                      // Human-readable
  method: string                      // "Email, SMS"
  status: 'Delivered' | 'Opened' | 'Failed' | 'Pending'
  icon: string
  color: string
}

// ============================================================================
// FILTER/QUERY TYPES
// ============================================================================

/**
 * Filters for querying status history
 */
export interface StatusHistoryFilter {
  startDate?: Date
  endDate?: Date
  actionTypes?: ModerationType[]
  categories?: WarningCategory[]
  performedBy?: string
}

/**
 * Options for formatting status data
 */
export interface FormatOptions {
  includeExpired?: boolean            // Include expired warnings/suspensions
  maxTimelineEvents?: number          // Limit timeline items
  maxNotifications?: number           // Limit notification items
  timezone?: string                   // For date formatting
}