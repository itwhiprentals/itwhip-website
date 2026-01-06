// app/lib/auth/host-guard.ts

/**
 * Host Guard - Authorization and approval status checking for rental hosts
 * Provides helper functions to enforce host lifecycle restrictions
 */

export type HostApprovalStatus = 
  | 'PENDING' 
  | 'NEEDS_ATTENTION' 
  | 'APPROVED' 
  | 'SUSPENDED' 
  | 'REJECTED' 
  | 'BLACKLISTED'

export interface HostAuthData {
  hostId: string
  userId: string
  email: string
  name: string
  role: string
  approvalStatus: HostApprovalStatus
  isRentalHost: boolean
}

/**
 * Check if host is approved to access full platform features
 */
export function isHostApproved(approvalStatus: HostApprovalStatus): boolean {
  return approvalStatus === 'APPROVED'
}

/**
 * Check if host is in pending state (awaiting initial approval)
 */
export function isHostPending(approvalStatus: HostApprovalStatus): boolean {
  return approvalStatus === 'PENDING' || approvalStatus === 'NEEDS_ATTENTION'
}

/**
 * Check if host is suspended (temporarily disabled)
 */
export function isHostSuspended(approvalStatus: HostApprovalStatus): boolean {
  return approvalStatus === 'SUSPENDED'
}

/**
 * Check if host is permanently rejected or blacklisted
 */
export function isHostRejected(approvalStatus: HostApprovalStatus): boolean {
  return approvalStatus === 'REJECTED' || approvalStatus === 'BLACKLISTED'
}

/**
 * Get user-friendly status message
 */
export function getStatusMessage(approvalStatus: HostApprovalStatus): string {
  switch (approvalStatus) {
    case 'PENDING':
      return 'Your application is under review. You\'ll receive an email once approved.'
    case 'NEEDS_ATTENTION':
      return 'Action required: Please review your application and provide the requested information.'
    case 'APPROVED':
      return 'Your account is active and approved.'
    case 'SUSPENDED':
      return 'Your account has been temporarily suspended. Please contact support for assistance.'
    case 'REJECTED':
      return 'Your application was not approved. You may reapply after addressing the issues mentioned in our email.'
    case 'BLACKLISTED':
      return 'Your account has been permanently disabled. Please contact support if you believe this is an error.'
    default:
      return 'Unknown status. Please contact support.'
  }
}

/**
 * Get redirect path based on approval status
 */
export function getRedirectPath(approvalStatus: HostApprovalStatus): string {
  if (isHostApproved(approvalStatus)) {
    return '/host/dashboard'
  }
  
  if (isHostPending(approvalStatus)) {
    return '/host/dashboard' // Pending hosts see restricted dashboard
  }
  
  if (isHostSuspended(approvalStatus)) {
    return '/host/suspended'
  }
  
  if (isHostRejected(approvalStatus)) {
    return '/host/rejected'
  }
  
  return '/host/dashboard'
}

/**
 * Check if host can access a specific feature
 */
export function canAccessFeature(
  approvalStatus: HostApprovalStatus,
  feature: 'cars' | 'bookings' | 'earnings' | 'calendar' | 'messages' | 'profile'
): boolean {
  // Profile is always accessible
  if (feature === 'profile') {
    return true
  }
  
  // Suspended and rejected hosts cannot access any features except profile
  if (isHostSuspended(approvalStatus) || isHostRejected(approvalStatus)) {
    return false
  }
  
  // Pending hosts can only access dashboard and profile
  if (isHostPending(approvalStatus)) {
    return false
  }
  
  // Approved hosts can access everything
  return isHostApproved(approvalStatus)
}

/**
 * Check if host can perform an action
 */
export function canPerformAction(
  approvalStatus: HostApprovalStatus,
  action: 'add_car' | 'edit_car' | 'delete_car' | 'accept_booking' | 'cancel_booking' | 'withdraw_funds' | 'message_guest'
): boolean {
  // Only approved hosts can perform actions
  if (!isHostApproved(approvalStatus)) {
    return false
  }
  
  return true
}

/**
 * Get list of restricted features for current status
 */
export function getRestrictedFeatures(approvalStatus: HostApprovalStatus): string[] {
  const features: string[] = []
  
  if (!canAccessFeature(approvalStatus, 'cars')) {
    features.push('Manage Cars')
  }
  
  if (!canAccessFeature(approvalStatus, 'bookings')) {
    features.push('View Bookings')
  }
  
  if (!canAccessFeature(approvalStatus, 'earnings')) {
    features.push('View Earnings')
  }
  
  if (!canAccessFeature(approvalStatus, 'calendar')) {
    features.push('Manage Calendar')
  }
  
  if (!canAccessFeature(approvalStatus, 'messages')) {
    features.push('Message Guests')
  }
  
  return features
}

/**
 * Get status badge color for UI
 */
export function getStatusColor(approvalStatus: HostApprovalStatus): {
  bg: string
  text: string
  darkBg: string
  darkText: string
} {
  switch (approvalStatus) {
    case 'APPROVED':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        darkBg: 'dark:bg-green-900/30',
        darkText: 'dark:text-green-400'
      }
    case 'PENDING':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        darkBg: 'dark:bg-yellow-900/30',
        darkText: 'dark:text-yellow-400'
      }
    case 'NEEDS_ATTENTION':
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        darkBg: 'dark:bg-orange-900/30',
        darkText: 'dark:text-orange-400'
      }
    case 'SUSPENDED':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        darkBg: 'dark:bg-red-900/30',
        darkText: 'dark:text-red-400'
      }
    case 'REJECTED':
    case 'BLACKLISTED':
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        darkBg: 'dark:bg-gray-700',
        darkText: 'dark:text-gray-300'
      }
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        darkBg: 'dark:bg-gray-700',
        darkText: 'dark:text-gray-300'
      }
  }
}

/**
 * Validate document submission completeness
 */
export function hasRequiredDocuments(documents: {
  governmentIdUrl?: string
  driversLicenseUrl?: string
  insuranceDocUrl?: string
  bankAccountInfo?: string
}): {
  isComplete: boolean
  missing: string[]
} {
  const missing: string[] = []
  
  if (!documents.governmentIdUrl) {
    missing.push('Government ID')
  }
  
  if (!documents.driversLicenseUrl) {
    missing.push('Driver\'s License')
  }
  
  if (!documents.bankAccountInfo) {
    missing.push('Bank Account Information')
  }
  
  return {
    isComplete: missing.length === 0,
    missing
  }
}

/**
 * Calculate verification progress percentage
 */
export function getVerificationProgress(host: {
  governmentIdUrl?: string
  driversLicenseUrl?: string
  insuranceDocUrl?: string
  bankAccountInfo?: string
  backgroundCheckStatus?: string
}): number {
  let completed = 0
  const total = 5 // 4 documents + background check
  
  if (host.governmentIdUrl) completed++
  if (host.driversLicenseUrl) completed++
  if (host.insuranceDocUrl) completed++
  if (host.bankAccountInfo) completed++
  if (host.backgroundCheckStatus === 'COMPLETED') completed++
  
  return Math.round((completed / total) * 100)
}

/**
 * Check if host needs to take action
 */
export function needsAction(approvalStatus: HostApprovalStatus): boolean {
  return approvalStatus === 'NEEDS_ATTENTION' || approvalStatus === 'REJECTED'
}

/**
 * Get next steps for host based on status
 */
export function getNextSteps(
  approvalStatus: HostApprovalStatus,
  documents: {
    governmentIdUrl?: string
    driversLicenseUrl?: string
    insuranceDocUrl?: string
    bankAccountInfo?: string
  }
): string[] {
  const steps: string[] = []
  
  if (approvalStatus === 'PENDING' || approvalStatus === 'NEEDS_ATTENTION') {
    const { missing } = hasRequiredDocuments(documents)
    
    if (missing.length > 0) {
      steps.push(`Upload missing documents: ${missing.join(', ')}`)
    } else {
      steps.push('Wait for admin review (typically 24-48 hours)')
    }
  }
  
  if (approvalStatus === 'SUSPENDED') {
    steps.push('Contact support to resolve suspension')
    steps.push('Review suspension reason in your email')
  }
  
  if (approvalStatus === 'REJECTED') {
    steps.push('Review rejection reasons')
    steps.push('Address the issues mentioned')
    steps.push('Reapply when ready')
  }
  
  if (approvalStatus === 'APPROVED') {
    steps.push('Add your first vehicle')
    steps.push('Set your availability calendar')
    steps.push('Complete your host profile')
  }
  
  return steps
}

/**
 * Format approval status for display
 */
export function formatApprovalStatus(status: HostApprovalStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Pending Review'
    case 'NEEDS_ATTENTION':
      return 'Action Required'
    case 'APPROVED':
      return 'Approved'
    case 'SUSPENDED':
      return 'Suspended'
    case 'REJECTED':
      return 'Rejected'
    case 'BLACKLISTED':
      return 'Blocked'
    default:
      return status
  }
}

/**
 * Check if status allows reapplication
 */
export function canReapply(approvalStatus: HostApprovalStatus): boolean {
  return approvalStatus === 'REJECTED'
}

/**
 * Server-side guard for API routes
 * Returns authorization result
 */
export function authorizeHostAction(
  approvalStatus: HostApprovalStatus,
  requiredStatus: HostApprovalStatus[] = ['APPROVED']
): {
  authorized: boolean
  message?: string
  statusCode: number
} {
  if (requiredStatus.includes(approvalStatus)) {
    return {
      authorized: true,
      statusCode: 200
    }
  }
  
  if (isHostPending(approvalStatus)) {
    return {
      authorized: false,
      message: 'Your account is pending approval. You cannot perform this action yet.',
      statusCode: 403
    }
  }
  
  if (isHostSuspended(approvalStatus)) {
    return {
      authorized: false,
      message: 'Your account is suspended. Please contact support.',
      statusCode: 403
    }
  }
  
  if (isHostRejected(approvalStatus)) {
    return {
      authorized: false,
      message: 'Your account application was not approved.',
      statusCode: 403
    }
  }
  
  return {
    authorized: false,
    message: 'You are not authorized to perform this action.',
    statusCode: 401
  }
}