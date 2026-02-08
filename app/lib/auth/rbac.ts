// app/lib/auth/rbac.ts
// Role-Based Access Control with 6 roles, 24 permissions, and certification tiers
// Implements progressive access model: Anonymous → Admin

import { UserRole, CertificationTier } from '@/app/lib/dal/types'

// ============================================================================
// PERMISSION DEFINITIONS
// ============================================================================

export const PERMISSIONS = {
  // Public Permissions (Anonymous)
  VIEW_PUBLIC_PAGES: 'view:public_pages',
  VIEW_PRICING: 'view:pricing',
  VIEW_COVERAGE: 'view:coverage',
  SEARCH_HOTELS: 'search:hotels',
  VIEW_API_DOCS: 'view:api_docs',
  
  // User Permissions (Claimed)
  VIEW_DASHBOARD: 'view:dashboard',
  BOOK_RIDE: 'book:ride',
  VIEW_OWN_BOOKINGS: 'view:own_bookings',
  MANAGE_PROFILE: 'manage:profile',
  VIEW_RIDE_HISTORY: 'view:ride_history',
  
  // Hotel Permissions (Starter)
  VIEW_HOTEL_METRICS: 'view:hotel_metrics',
  MANAGE_HOTEL_BOOKINGS: 'manage:hotel_bookings',
  VIEW_BASIC_REVENUE: 'view:basic_revenue',
  MANAGE_HOTEL_PROFILE: 'manage:hotel_profile',
  
  // Business Permissions
  VIEW_DETAILED_REVENUE: 'view:detailed_revenue',
  EXPORT_REPORTS: 'export:reports',
  MANAGE_DRIVERS: 'manage:drivers',
  
  // Enterprise Permissions
  WITHDRAW_FUNDS: 'withdraw:funds',
  ACCESS_API_KEYS: 'access:api_keys',
  VIEW_ALL_HOTELS: 'view:all_hotels',
  
  // Admin Permissions
  MANAGE_USERS: 'manage:users',
  MANAGE_PLATFORM: 'manage:platform',
  VIEW_SECURITY_LOGS: 'view:security_logs',
  OVERRIDE_PERMISSIONS: 'override:permissions',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// ============================================================================
// ROLE HIERARCHY & PERMISSIONS MATRIX
// ============================================================================

const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.ANONYMOUS]: 0,
  [UserRole.CLAIMED]: 1,
  [UserRole.STARTER]: 2,
  [UserRole.BUSINESS]: 3,
  [UserRole.ENTERPRISE]: 4,
  [UserRole.ADMIN]: 5,
}

// Build permission arrays incrementally to avoid self-referencing const
const ANONYMOUS_PERMISSIONS: Permission[] = [
  PERMISSIONS.VIEW_PUBLIC_PAGES,
  PERMISSIONS.VIEW_PRICING,
  PERMISSIONS.VIEW_COVERAGE,
  PERMISSIONS.SEARCH_HOTELS,
  PERMISSIONS.VIEW_API_DOCS,
]

const CLAIMED_PERMISSIONS: Permission[] = [
  ...ANONYMOUS_PERMISSIONS,
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.BOOK_RIDE,
  PERMISSIONS.VIEW_OWN_BOOKINGS,
  PERMISSIONS.MANAGE_PROFILE,
  PERMISSIONS.VIEW_RIDE_HISTORY,
]

const STARTER_PERMISSIONS: Permission[] = [
  ...CLAIMED_PERMISSIONS,
  PERMISSIONS.VIEW_HOTEL_METRICS,
  PERMISSIONS.MANAGE_HOTEL_BOOKINGS,
  PERMISSIONS.VIEW_BASIC_REVENUE,
  PERMISSIONS.MANAGE_HOTEL_PROFILE,
]

const BUSINESS_PERMISSIONS: Permission[] = [
  ...STARTER_PERMISSIONS,
  PERMISSIONS.VIEW_DETAILED_REVENUE,
  PERMISSIONS.EXPORT_REPORTS,
  PERMISSIONS.MANAGE_DRIVERS,
]

const ENTERPRISE_PERMISSIONS: Permission[] = [
  ...BUSINESS_PERMISSIONS,
  PERMISSIONS.WITHDRAW_FUNDS,
  PERMISSIONS.ACCESS_API_KEYS,
  PERMISSIONS.VIEW_ALL_HOTELS,
]

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ANONYMOUS]: ANONYMOUS_PERMISSIONS,
  [UserRole.CLAIMED]: CLAIMED_PERMISSIONS,
  [UserRole.STARTER]: STARTER_PERMISSIONS,
  [UserRole.BUSINESS]: BUSINESS_PERMISSIONS,
  [UserRole.ENTERPRISE]: ENTERPRISE_PERMISSIONS,
  [UserRole.ADMIN]: Object.values(PERMISSIONS), // All permissions
}

// ============================================================================
// CERTIFICATION TIER MANAGEMENT
// ============================================================================

const CERTIFICATION_HIERARCHY: Record<CertificationTier, number> = {
  [CertificationTier.NONE]: 0,
  [CertificationTier.TU_3_C]: 1,  // Starter - $1,500/month
  [CertificationTier.TU_2_B]: 2,  // Business - $2,500/month
  [CertificationTier.TU_1_A]: 3,  // Enterprise - $4,000/month
}

const CERTIFICATION_FEATURES = {
  [CertificationTier.NONE]: {
    rateLimit: 100,        // requests/hour
    apiAccess: false,
    revenueShare: 0,       // percentage
    support: 'community',
    features: [] as string[],
  },
  [CertificationTier.TU_3_C]: {
    rateLimit: 1000,
    apiAccess: true,
    revenueShare: 25,      // 25% commission
    support: 'email',
    features: ['basic_analytics', 'standard_support', 'ride_booking'],
  },
  [CertificationTier.TU_2_B]: {
    rateLimit: 5000,
    apiAccess: true,
    revenueShare: 30,      // 30% commission
    support: 'priority',
    features: ['advanced_analytics', 'priority_support', 'api_access', 'custom_branding'],
  },
  [CertificationTier.TU_1_A]: {
    rateLimit: 10000,
    apiAccess: true,
    revenueShare: 35,      // 35% commission
    support: 'dedicated',
    features: ['enterprise_analytics', 'dedicated_support', 'unlimited_api', 'white_label', 'sla'],
  },
}

// ============================================================================
// CORE PERMISSION CHECKS
// ============================================================================

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  user: { role: UserRole } | null | undefined,
  permission: Permission
): boolean {
  if (!user) return false
  
  const permissions = ROLE_PERMISSIONS[user.role] ?? []
  return permissions.includes(permission)
}

/**
 * Check if a user has ALL of the specified permissions
 */
export function hasAllPermissions(
  user: { role: UserRole } | null | undefined,
  permissions: Permission[]
): boolean {
  if (!user) return false
  
  return permissions.every(permission => hasPermission(user, permission))
}

/**
 * Check if a user has ANY of the specified permissions
 */
export function hasAnyPermission(
  user: { role: UserRole } | null | undefined,
  permissions: Permission[]
): boolean {
  if (!user) return false
  
  return permissions.some(permission => hasPermission(user, permission))
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

/**
 * Check if a role is higher or equal in hierarchy
 */
export function hasMinimumRole(
  user: { role: UserRole } | null | undefined,
  minimumRole: UserRole
): boolean {
  if (!user) return false
  
  const userLevel = ROLE_HIERARCHY[user.role] ?? 0
  const requiredLevel = ROLE_HIERARCHY[minimumRole] ?? 0
  
  return userLevel >= requiredLevel
}

// ============================================================================
// CERTIFICATION TIER CHECKS
// ============================================================================

/**
 * Check if a hotel has the required certification tier
 */
export function hasCertificationTier(
  hotel: { certificationTier: CertificationTier | null } | null | undefined,
  requiredTier: CertificationTier
): boolean {
  if (!hotel || !hotel.certificationTier) return false
  
  const hotelLevel = CERTIFICATION_HIERARCHY[hotel.certificationTier] ?? 0
  const requiredLevel = CERTIFICATION_HIERARCHY[requiredTier] ?? 0
  
  return hotelLevel >= requiredLevel
}

/**
 * Get certification tier features
 */
export function getCertificationFeatures(tier: CertificationTier | null) {
  return CERTIFICATION_FEATURES[tier ?? CertificationTier.NONE]
}

/**
 * Calculate rate limit based on user role and certification
 */
export function getRateLimit(
  user: { role: UserRole } | null,
  hotel?: { certificationTier: CertificationTier | null } | null
): number {
  // Base rate limits by role
  const roleRateLimits: Record<UserRole, number> = {
    [UserRole.ANONYMOUS]: 60,      // 60 requests/hour
    [UserRole.CLAIMED]: 100,        // 100 requests/hour
    [UserRole.STARTER]: 500,        // 500 requests/hour
    [UserRole.BUSINESS]: 1000,      // 1000 requests/hour
    [UserRole.ENTERPRISE]: 5000,    // 5000 requests/hour
    [UserRole.ADMIN]: 100000,       // Essentially unlimited
  }
  
  const baseLimit = user ? roleRateLimits[user.role] : 60
  
  // If hotel has certification, use the higher limit
  if (hotel?.certificationTier) {
    const certLimit = getCertificationFeatures(hotel.certificationTier).rateLimit
    return Math.max(baseLimit, certLimit)
  }
  
  return baseLimit
}

// ============================================================================
// RESOURCE ACCESS CONTROL
// ============================================================================

/**
 * Check if user can access a specific hotel's data
 */
export function canAccessHotel(
  user: { role: UserRole; hotelId?: string | null } | null,
  hotelId: string
): boolean {
  if (!user) return false
  
  // Admins can access all hotels
  if (user.role === UserRole.ADMIN) return true
  
  // Enterprise users with VIEW_ALL_HOTELS permission
  if (hasPermission(user, PERMISSIONS.VIEW_ALL_HOTELS)) return true
  
  // Users can only access their own hotel
  return user.hotelId === hotelId
}

/**
 * Check if user can modify a resource
 */
export function canModifyResource(
  user: { role: UserRole; id: string } | null,
  resource: { userId?: string; hotelId?: string } | null,
  resourceType: 'booking' | 'ride' | 'hotel' | 'user'
): boolean {
  if (!user || !resource) return false
  
  // Admins can modify anything
  if (user.role === UserRole.ADMIN) return true
  
  switch (resourceType) {
    case 'booking':
      return hasPermission(user, PERMISSIONS.MANAGE_HOTEL_BOOKINGS) &&
             resource.hotelId === (user as any).hotelId
    
    case 'ride':
      return resource.userId === user.id ||
             (hasPermission(user, PERMISSIONS.MANAGE_HOTEL_BOOKINGS) &&
              resource.hotelId === (user as any).hotelId)
    
    case 'hotel':
      return hasPermission(user, PERMISSIONS.MANAGE_HOTEL_PROFILE) &&
             resource.hotelId === (user as any).hotelId
    
    case 'user':
      return resource.userId === user.id ||
             hasPermission(user, PERMISSIONS.MANAGE_USERS)
    
    default:
      return false
  }
}

// ============================================================================
// API KEY PERMISSIONS
// ============================================================================

/**
 * Parse API key permissions from JSON string
 */
export function parseApiKeyPermissions(permissionsJson: string): Permission[] {
  try {
    const parsed = JSON.parse(permissionsJson)
    if (!Array.isArray(parsed)) return []
    
    // Validate each permission exists
    return parsed.filter(p => Object.values(PERMISSIONS).includes(p as Permission)) as Permission[]
  } catch {
    return []
  }
}

/**
 * Check if API key has permission
 */
export function apiKeyHasPermission(
  apiKey: { permissions: string; tier?: CertificationTier | null } | null,
  permission: Permission
): boolean {
  if (!apiKey) return false
  
  const permissions = parseApiKeyPermissions(apiKey.permissions)
  
  // Check explicit permission
  if (permissions.includes(permission)) return true
  
  // Check tier-based permissions if API key has a tier
  if (apiKey.tier) {
    const tierToRole: Partial<Record<CertificationTier, UserRole>> = {
      [CertificationTier.TU_3_C]: UserRole.STARTER,
      [CertificationTier.TU_2_B]: UserRole.BUSINESS,
      [CertificationTier.TU_1_A]: UserRole.ENTERPRISE,
    }
    const tierRole = tierToRole[apiKey.tier]
    
    if (tierRole) {
      const tierPermissions = ROLE_PERMISSIONS[tierRole]
      return tierPermissions.includes(permission)
    }
  }
  
  return false
}

// ============================================================================
// MIDDLEWARE HELPERS
// ============================================================================

/**
 * Express/Next.js middleware factory for permission checking
 */
export function requirePermission(permission: Permission) {
  return (user: { role: UserRole } | null): boolean => {
    if (!hasPermission(user, permission)) {
      throw new Error(`Permission denied: ${permission} required`)
    }
    return true
  }
}

/**
 * Check multiple permissions with AND logic
 */
export function requireAllPermissions(...permissions: Permission[]) {
  return (user: { role: UserRole } | null): boolean => {
    if (!hasAllPermissions(user, permissions)) {
      throw new Error(`Permissions denied: All of [${permissions.join(', ')}] required`)
    }
    return true
  }
}

/**
 * Check multiple permissions with OR logic
 */
export function requireAnyPermission(...permissions: Permission[]) {
  return (user: { role: UserRole } | null): boolean => {
    if (!hasAnyPermission(user, permissions)) {
      throw new Error(`Permission denied: One of [${permissions.join(', ')}] required`)
    }
    return true
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  UserRole,
  CertificationTier,
}

// Export role upgrade paths for UI
export const ROLE_UPGRADE_PATH = {
  [UserRole.ANONYMOUS]: UserRole.CLAIMED,
  [UserRole.CLAIMED]: UserRole.STARTER,
  [UserRole.STARTER]: UserRole.BUSINESS,
  [UserRole.BUSINESS]: UserRole.ENTERPRISE,
  [UserRole.ENTERPRISE]: UserRole.ENTERPRISE, // Max level for non-admin
  [UserRole.ADMIN]: UserRole.ADMIN,
}

// Export certification upgrade paths
export const CERTIFICATION_UPGRADE_PATH = {
  [CertificationTier.NONE]: CertificationTier.TU_3_C,
  [CertificationTier.TU_3_C]: CertificationTier.TU_2_B,
  [CertificationTier.TU_2_B]: CertificationTier.TU_1_A,
  [CertificationTier.TU_1_A]: CertificationTier.TU_1_A, // Max level
}