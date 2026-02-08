/**
 * Authentication Types for ItWhip Platform
 * Three-tier access system: Anonymous → Claimed → Certified
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

/**
 * User roles in the system
 */
export enum UserRole {
    ANONYMOUS = 'anonymous',     // Just viewing with GDS code
    CLAIMED = 'claimed',         // Verified hotel manager
    STARTER = 'starter',         // TU-3-C certified
    BUSINESS = 'business',       // TU-2-B certified
    ENTERPRISE = 'enterprise',   // TU-1-A certified
    ADMIN = 'admin'             // ItWhip internal team
  }
  
  /**
   * Certification tiers
   */
  export enum CertificationTier {
    NONE = 'none',
    TU_3_C = 'TU-3-C',  // Starter - $1,500/mo
    TU_2_B = 'TU-2-B',  // Business - $2,500/mo
    TU_1_A = 'TU-1-A'   // Enterprise - $4,000/mo
  }
  
  /**
   * All possible permissions in the system
   */
  export enum Permission {
    // Viewing permissions (Anonymous+)
    VIEW_DASHBOARD = 'view_dashboard',
    VIEW_GHOST_RIDES = 'view_ghost_rides',
    VIEW_METRICS = 'view_metrics',
    VIEW_PUBLIC_DATA = 'view_public_data',
    CALCULATE_ROI = 'calculate_roi',
    
    // Claimed permissions
    MANAGE_BOOKINGS = 'manage_bookings',
    CANCEL_RESERVATIONS = 'cancel_reservations',
    VIEW_GUEST_DETAILS = 'view_guest_details',
    CONTACT_GUESTS = 'contact_guests',
    CLAIM_PROPERTY = 'claim_property',
    
    // Certified permissions
    PROCESS_RIDES = 'process_rides',
    ACCESS_REVENUE = 'access_revenue',
    WITHDRAW_FUNDS = 'withdraw_funds',
    GENERATE_REPORTS = 'generate_reports',
    ACCESS_COMPLIANCE = 'access_compliance',
    USE_API = 'use_api',
    USE_SDK = 'use_sdk',
    MANAGE_DRIVERS = 'manage_drivers',
    
    // Admin permissions
    MANAGE_USERS = 'manage_users',
    VIEW_ALL_HOTELS = 'view_all_hotels',
    OVERRIDE_PERMISSIONS = 'override_permissions',
    ACCESS_ADMIN_PANEL = 'access_admin_panel'
  }
  
  /**
   * Authentication states
   */
  export enum AuthState {
    UNAUTHENTICATED = 'unauthenticated',
    PREVIEW = 'preview',           // Anonymous viewing
    AUTHENTICATED = 'authenticated',
    EXPIRED = 'expired',
    LOCKED = 'locked'
  }
  
  // ============================================================================
  // USER INTERFACES
  // ============================================================================
  
  /**
   * Base user interface
   */
  interface BaseUser {
    id?: string
    role: UserRole
    permissions: Permission[]
    createdAt?: Date
    lastActive?: Date
  }
  
  /**
   * Anonymous user (just browsing)
   */
  export interface AnonymousUser extends BaseUser {
    role: UserRole.ANONYMOUS
    gdsCode: string
    sessionId: string
    ipAddress: string
    userAgent: string
    viewingHotel?: {
      code: string
      name: string
      location?: string
    }
  }
  
  /**
   * Claimed user (verified hotel manager)
   */
  export interface ClaimedUser extends BaseUser {
    role: UserRole.CLAIMED
    hotelId: string
    hotelName: string
    gdsCode: string
    email: string
    emailVerified: boolean
    name: string
    jobTitle: string
    phone?: string
    phoneVerified?: boolean
    claimedAt: Date
    verificationToken?: string
  }
  
  /**
   * Certified user (paid TU certification)
   */
  export interface CertifiedUser extends BaseUser {
    role: UserRole.STARTER | UserRole.BUSINESS | UserRole.ENTERPRISE
    hotelId: string
    hotelName: string
    gdsCode: string
    email: string
    name: string
    certificationTier: CertificationTier
    certifiedAt: Date
    certificationExpiry: Date
    apiKeys?: APIKey[]
    revenue?: {
      total: number
      available: number
      pending: number
    }
    subscription?: {
      status: 'active' | 'paused' | 'cancelled'
      nextBilling: Date
      amount: number
    }
  }
  
  /**
   * Admin user (ItWhip team)
   */
  export interface AdminUser extends BaseUser {
    role: UserRole.ADMIN
    email: string
    name: string
    department: string
    accessLevel: 'read' | 'write' | 'super'
  }
  
  /**
   * Union type for all users
   */
  export type User = AnonymousUser | ClaimedUser | CertifiedUser | AdminUser
  
  // ============================================================================
  // TOKEN INTERFACES
  // ============================================================================
  
  /**
   * JWT Access Token payload
   */
  export interface AccessTokenPayload {
    // Standard JWT claims
    sub: string          // Subject (user/hotel ID)
    iat: number          // Issued at
    exp: number          // Expiry
    iss: string          // Issuer (itwhip.com)
    aud: string          // Audience (portal.itwhip.com)
    
    // Custom claims
    role: UserRole
    hotelId?: string
    hotelName?: string
    gdsCode?: string
    tier?: CertificationTier
    permissions: Permission[]
    sessionId: string
    deviceId?: string
  }
  
  /**
   * JWT Refresh Token payload
   */
  export interface RefreshTokenPayload {
    sub: string
    iat: number
    exp: number
    tokenFamily: string  // For rotation tracking
    sessionId: string
  }
  
  /**
   * Preview Token for anonymous users
   */
  export interface PreviewTokenPayload {
    gdsCode: string
    hotelName?: string
    sessionId: string
    ipAddress: string
    createdAt: number
    expiresAt: number
  }
  
  /**
   * API Key structure
   */
  export interface APIKey {
    id: string
    key: string          // The actual key (hashed in DB)
    name: string         // Friendly name
    hotelId: string
    tier: CertificationTier
    permissions: Permission[]
    rateLimit: {
      requests: number
      window: 'second' | 'minute' | 'hour'
    }
    lastUsed?: Date
    createdAt: Date
    expiresAt?: Date
    active: boolean
  }
  
  // ============================================================================
  // SESSION INTERFACES
  // ============================================================================
  
  /**
   * User session
   */
  export interface UserSession {
    id: string
    userId?: string
    hotelId?: string
    role: UserRole
    startedAt: Date
    lastActivity: Date
    expiresAt: Date
    ipAddress: string
    userAgent: string
    deviceInfo?: DeviceInfo
    refreshToken?: string
    accessToken?: string
  }
  
  /**
   * Device information
   */
  export interface DeviceInfo {
    id: string
    fingerprint: string
    type: 'desktop' | 'mobile' | 'tablet'
    browser: string
    os: string
    trusted: boolean
    lastSeen: Date
  }
  
  /**
   * Login attempt tracking
   */
  export interface LoginAttempt {
    id: string
    identifier: string   // Email or GDS code
    ipAddress: string
    userAgent: string
    success: boolean
    reason?: string
    timestamp: Date
  }
  
  // ============================================================================
  // PERMISSION MAPPINGS
  // ============================================================================
  
  /**
   * Permissions for each role
   */
  // Base permission sets for building role hierarchies
  const _anonymousPerms: Permission[] = [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_GHOST_RIDES,
    Permission.VIEW_METRICS,
    Permission.VIEW_PUBLIC_DATA,
    Permission.CALCULATE_ROI
  ]

  const _claimedPerms: Permission[] = [
    ..._anonymousPerms,
    Permission.MANAGE_BOOKINGS,
    Permission.CANCEL_RESERVATIONS,
    Permission.VIEW_GUEST_DETAILS,
    Permission.CONTACT_GUESTS,
    Permission.CLAIM_PROPERTY
  ]

  const _starterPerms: Permission[] = [
    ..._claimedPerms,
    Permission.PROCESS_RIDES,
    Permission.ACCESS_REVENUE,
    Permission.GENERATE_REPORTS,
    Permission.USE_API
  ]

  const _businessPerms: Permission[] = [
    ..._starterPerms,
    Permission.ACCESS_COMPLIANCE,
    Permission.USE_SDK,
    Permission.MANAGE_DRIVERS
  ]

  const _enterprisePerms: Permission[] = [
    ..._businessPerms,
    Permission.WITHDRAW_FUNDS
  ]

  export const RolePermissions: Record<UserRole, Permission[]> = {
    [UserRole.ANONYMOUS]: _anonymousPerms,
    [UserRole.CLAIMED]: _claimedPerms,
    [UserRole.STARTER]: _starterPerms,
    [UserRole.BUSINESS]: _businessPerms,
    [UserRole.ENTERPRISE]: _enterprisePerms,
    [UserRole.ADMIN]: [
      // All permissions
      ...Object.values(Permission)
    ]
  }
  
  // ============================================================================
  // HELPER TYPES
  // ============================================================================
  
  /**
   * Authentication response
   */
  export interface AuthResponse {
    success: boolean
    user?: User
    accessToken?: string
    refreshToken?: string
    expiresIn?: number
    error?: {
      code: string
      message: string
    }
  }
  
  /**
   * Token validation result
   */
  export interface TokenValidation {
    valid: boolean
    expired: boolean
    payload?: AccessTokenPayload | RefreshTokenPayload
    error?: string
  }
  
  /**
   * Permission check result
   */
  export interface PermissionCheck {
    allowed: boolean
    missing?: Permission[]
    reason?: string
  }
  
  /**
   * Rate limit status
   */
  export interface RateLimitStatus {
    limit: number
    remaining: number
    reset: Date
    tier: CertificationTier | 'anonymous'
  }
  
  // ============================================================================
  // TYPE GUARDS
  // ============================================================================
  
  /**
   * Check if user is anonymous
   */
  export function isAnonymous(user: User): user is AnonymousUser {
    return user.role === UserRole.ANONYMOUS
  }
  
  /**
   * Check if user is claimed
   */
  export function isClaimed(user: User): user is ClaimedUser {
    return user.role === UserRole.CLAIMED
  }
  
  /**
   * Check if user is certified
   */
  export function isCertified(user: User): user is CertifiedUser {
    return [UserRole.STARTER, UserRole.BUSINESS, UserRole.ENTERPRISE].includes(user.role)
  }
  
  /**
   * Check if user is admin
   */
  export function isAdmin(user: User): user is AdminUser {
    return user.role === UserRole.ADMIN
  }
  
  /**
   * Check if user has permission
   */
  export function hasPermission(user: User, permission: Permission): boolean {
    return user.permissions.includes(permission)
  }
  
  /**
   * Get tier from role
   */
  export function getTierFromRole(role: UserRole): CertificationTier {
    switch (role) {
      case UserRole.ENTERPRISE:
        return CertificationTier.TU_1_A
      case UserRole.BUSINESS:
        return CertificationTier.TU_2_B
      case UserRole.STARTER:
        return CertificationTier.TU_3_C
      default:
        return CertificationTier.NONE
    }
  }
  
  // ============================================================================
  // CONSTANTS
  // ============================================================================
  
  /**
   * Token expiry times
   */
  export const TOKEN_EXPIRY = {
    PREVIEW: '24h',        // Anonymous viewing
    ACCESS: '15m',         // Short-lived access
    REFRESH: '7d',         // Refresh token
    CLAIMED: '7d',         // Claimed hotel
    CERTIFIED: '30d',      // Paid users get longer
    API_KEY: '1y'          // API keys last longer
  } as const
  
  /**
   * Rate limits by tier
   */
  export const RATE_LIMITS = {
    [UserRole.ANONYMOUS]: { requests: 100, window: 'hour' },
    [UserRole.CLAIMED]: { requests: 500, window: 'hour' },
    [UserRole.STARTER]: { requests: 1000, window: 'hour' },
    [UserRole.BUSINESS]: { requests: 5000, window: 'hour' },
    [UserRole.ENTERPRISE]: { requests: 10000, window: 'hour' },
    [UserRole.ADMIN]: { requests: 100000, window: 'hour' }
  } as const
  
  export default {
    UserRole,
    CertificationTier,
    Permission,
    AuthState,
    RolePermissions,
    TOKEN_EXPIRY,
    RATE_LIMITS
  }