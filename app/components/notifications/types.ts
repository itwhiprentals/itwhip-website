// app/components/notifications/types.ts

import { ComponentType } from 'react'

// Notification priority levels
export type NotificationPriority = 1 | 2 | 3 | 4 | 5 | 6

// Notification types
export type NotificationType = 
  | 'PAYMENT_REQUIRED'
  | 'LICENSE_REQUIRED'
  | 'INSURANCE_REQUIRED'
  | 'EMERGENCY_CONTACT'
  | 'PROFILE_INCOMPLETE'
  | 'TWO_FACTOR_DISABLED'

// User roles
export type UserRole = 'GUEST' | 'HOST' | 'ADMIN'

// Notification status
export type NotificationStatus = 'ACTIVE' | 'DISMISSED' | 'COMPLETED'

// Base notification interface
export interface Notification {
  id: string
  userId: string
  userRole: UserRole
  type: NotificationType
  priority: NotificationPriority
  title: string
  description: string
  actionUrl: string
  actionLabel: string
  icon: ComponentType<{ className?: string }>
  iconColor: string
  status: NotificationStatus
  isDismissible: boolean
  createdAt: Date
  dismissedAt?: Date
  reappearAt?: Date
  completedAt?: Date
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

// API response types
export interface NotificationsResponse {
  success: boolean
  notifications: Notification[]
  unreadCount: number
}

export interface UnreadCountResponse {
  success: boolean
  count: number
}

export interface DismissNotificationRequest {
  notificationId: string
  userId: string
}

export interface DismissNotificationResponse {
  success: boolean
  message: string
  reappearAt?: Date
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