// app/components/notifications/types.ts

import { ComponentType } from 'react'

// Notification priority levels
export type NotificationPriority = 1 | 2 | 3 | 4 | 5 | 6

// ✅ UPDATED: Added HOST and ADMIN notification types
export type NotificationType = 
  // Guest notifications
  | 'PAYMENT_REQUIRED'
  | 'LICENSE_REQUIRED'
  | 'INSURANCE_REQUIRED'
  | 'EMERGENCY_CONTACT'
  | 'PROFILE_INCOMPLETE'
  | 'TWO_FACTOR_DISABLED'
  // Host notifications (from ClaimBanner)
  | 'CLAIM_FILED'
  | 'CLAIM_APPROVED'
  | 'CLAIM_REJECTED'
  | 'GUEST_RESPONSE'
  | 'GUEST_NO_RESPONSE'
  // Common notification types
  | 'PAYMENT_METHOD_EXPIRING'
  | 'DOCUMENT_EXPIRING'
  | 'LICENSE_EXPIRING'
  | 'INSURANCE_EXPIRING'
  | 'EMERGENCY_CONTACT_REQUIRED'
  | 'PROFILE_UPDATE'
  | 'SECURITY_ALERT'
  | 'TEST_NOTIFICATION'
  | 'GENERAL'

// User roles
export type UserRole = 'GUEST' | 'HOST' | 'ADMIN'

// Notification status
export type NotificationStatus = 'ACTIVE' | 'DISMISSED' | 'COMPLETED'

// ✅ UPDATED: Base notification interface with flexible fields
export interface Notification {
  id: string
  userId?: string
  userRole?: UserRole
  type: NotificationType | string // Allow string for flexibility
  priority?: NotificationPriority
  level?: number // Alternative to priority (used by some components)
  title: string
  description?: string // Made optional
  message?: string // Alternative to description (used by HOST API)
  actionUrl?: string // Made optional
  actionLabel?: string // Made optional
  icon?: ComponentType<{ className?: string }> | string // Allow string or component
  iconColor?: string // Made optional
  status?: NotificationStatus // Made optional
  isDismissible?: boolean // Made optional (defaults to true)
  createdAt?: Date | string // Allow string for API responses
  dismissedAt?: Date | string
  reappearAt?: Date | string
  completedAt?: Date | string
}

// Notification configuration (template)
export interface NotificationConfig {
  id: NotificationType
  priority: NotificationPriority
  title: string
  description: string
  actionUrl: string
  actionLabel: string
  icon: ComponentType<{ className?: string }>
  iconColor: string
  checkFunction: string // Name of function to check completion
  isDismissible: boolean
}

// ✅ UPDATED: API response types with nested structure support
export interface NotificationsResponse {
  success: boolean
  notifications?: Notification[]
  data?: {
    notifications: Notification[]
    summary?: {
      unreadCount: number
    }
  }
  unreadCount?: number
}

export interface UnreadCountResponse {
  success: boolean
  count?: number
  unreadCount?: number
  data?: {
    summary?: {
      unreadCount: number
    }
  }
}

export interface DismissNotificationRequest {
  notificationId?: string
  notificationIds?: string[] // For bulk dismiss
  userId?: string
  action?: 'read' | 'unread' | 'respond' | 'dismiss' // For HOST API
  response?: string // For HOST API
}

export interface DismissNotificationResponse {
  success: boolean
  message?: string
  reappearAt?: Date
  data?: {
    updatedCount?: number
    action?: string
  }
}

export interface CheckCompletionResponse {
  success: boolean
  completed: boolean
  notificationType: NotificationType
}

// Profile completion calculation
export interface ProfileCompletionFields {
  phone: boolean
  bio: boolean
  city: boolean
  state: boolean
  zipCode: boolean
  dateOfBirth: boolean
  emergencyContactName: boolean
  emergencyContactPhone: boolean
  profilePhoto: boolean
  insuranceProvider: boolean
}

export interface ProfileCompletionResult {
  percentage: number
  completed: boolean
  missingFields: string[]
}

// Notification dismissal record (for database)
export interface NotificationDismissal {
  id: string
  userId: string
  notificationType: NotificationType
  dismissedAt: Date
  reappearAt: Date
  createdAt: Date
}

// ✅ NEW: HOST notification metadata (from ClaimBanner)
export interface ClaimNotificationMetadata {
  reviewNotes?: string
  rejectionReason?: string
  responseDeadline?: string
  guestResponse?: string
  estimatedCost?: number
}

// ✅ NEW: ClaimBanner specific notification interface
export interface ClaimNotification extends Notification {
  type: 'CLAIM_FILED' | 'CLAIM_APPROVED' | 'CLAIM_REJECTED' | 'GUEST_RESPONSE' | 'GUEST_NO_RESPONSE'
  claimId?: string
  bookingCode?: string
  guestName?: string
  metadata?: ClaimNotificationMetadata
}