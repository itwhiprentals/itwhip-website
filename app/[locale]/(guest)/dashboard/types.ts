// app/(guest)/dashboard/types.ts
// Shared types and interfaces for Guest Dashboard

export interface SuspensionInfo {
    suspensionLevel: 'SOFT' | 'HARD' | 'BANNED' | null
    suspendedAt: string | null
    suspendedReason: string | null
    suspendedBy: string | null
    suspensionExpiresAt: string | null
    autoReactivate: boolean
    bannedAt: string | null
    banReason: string | null
    bannedBy: string | null
    warningCount: number
    lastWarningAt: string | null
    
    // NEW FIELDS for enhanced warning system
    activeWarningCount?: number
    canBookLuxury?: boolean
    canBookPremium?: boolean
    requiresManualApproval?: boolean
    guestId?: string
  }
  
  export interface ModerationAction {
    id: string
    actionType: 'WARNING' | 'SUSPEND' | 'UNSUSPEND' | 'BAN' | 'UNBAN' | 'RESTRICTION_ADDED' | 'RESTRICTION_REMOVED' | 'NOTE_ADDED'
    suspensionLevel?: 'SOFT' | 'HARD' | null
    warningCategory?: WarningCategory
    publicReason: string
    internalNotes?: string
    takenBy: string
    takenAt: string
    expiresAt?: string | null
    restrictionsApplied?: string[] | null
  }
  
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
  
  export type RestrictionType = 
    | 'INSTANT_BOOK'
    | 'LUXURY_CARS'
    | 'PREMIUM_CARS'
    | 'MANUAL_APPROVAL'
  
  export interface RestrictionInfo {
    type: RestrictionType
    label: string
    description: string
    icon: string
    isActive: boolean
  }
  
  export interface WarningDetails {
    category: WarningCategory
    categoryLabel: string
    reason: string
    expiresAt: string | null
    daysRemaining: number | null
    restrictions: RestrictionInfo[]
    severity: 'low' | 'medium' | 'high'
  }
  
  // Warning category display configuration
  export const WARNING_CATEGORY_CONFIG: Record<WarningCategory, { label: string; color: string }> = {
    LATE_RETURNS: { label: 'Late Returns', color: 'orange' },
    VEHICLE_DAMAGE: { label: 'Vehicle Damage', color: 'red' },
    CLEANLINESS_ISSUES: { label: 'Cleanliness Issues', color: 'yellow' },
    MILEAGE_VIOLATIONS: { label: 'Mileage Violations', color: 'orange' },
    POLICY_VIOLATIONS: { label: 'Policy Violations', color: 'red' },
    FRAUDULENT_ACTIVITY: { label: 'Fraudulent Activity', color: 'red' },
    PAYMENT_ISSUES: { label: 'Payment Issues', color: 'red' },
    COMMUNICATION_ISSUES: { label: 'Communication Issues', color: 'yellow' },
    INAPPROPRIATE_BEHAVIOR: { label: 'Inappropriate Behavior', color: 'red' },
    UNAUTHORIZED_DRIVER: { label: 'Unauthorized Driver', color: 'red' },
    SMOKING_VIOLATION: { label: 'Smoking Violation', color: 'orange' },
    PET_VIOLATION: { label: 'Pet Violation', color: 'orange' },
    FUEL_VIOLATIONS: { label: 'Fuel Violations', color: 'yellow' },
    DOCUMENTATION_ISSUES: { label: 'Documentation Issues', color: 'yellow' },
    OTHER: { label: 'Policy Violation', color: 'gray' }
  }
  
  // Restriction display configuration
  export const RESTRICTION_CONFIG: Record<RestrictionType, { label: string; description: string; icon: string }> = {
    INSTANT_BOOK: {
      label: 'Instant Book Disabled',
      description: 'Must wait for host approval',
      icon: '⚡'
    },
    LUXURY_CARS: {
      label: 'Luxury Cars Restricted',
      description: 'Cannot book Luxury, Exotic, or Convertible vehicles',
      icon: '💎'
    },
    PREMIUM_CARS: {
      label: 'Premium Cars Restricted',
      description: 'Cannot book Exotic vehicles',
      icon: '👑'
    },
    MANUAL_APPROVAL: {
      label: 'Manual Approval Required',
      description: 'All bookings need approval',
      icon: '✋'
    }
  }