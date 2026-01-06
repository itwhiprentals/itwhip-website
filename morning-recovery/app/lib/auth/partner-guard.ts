// app/lib/auth/partner-guard.ts

/**
 * Partner Guard - Authorization for Fleet Partners (B2B SaaS)
 * Extends host guard functionality for FLEET_PARTNER hostType
 * Prevents individual hosts from accessing partner dashboard
 */

import { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/app/lib/database/prisma'
import { HostApprovalStatus, isHostApproved } from './host-guard'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export type HostType = 'PENDING' | 'MANAGED' | 'REAL' | 'PARTNER' | 'FLEET_PARTNER'

export interface PartnerAuthData {
  hostId: string
  userId: string
  email: string
  name: string
  hostType: HostType
  approvalStatus: HostApprovalStatus
  isFleetPartner: boolean
  // Partner-specific fields
  partnerCompanyName?: string
  partnerSlug?: string
  currentCommissionRate?: number
  partnerFleetSize?: number
  // Admin impersonation
  impersonatedBy?: string
  impersonatorName?: string
  impersonationLogId?: string
}

/**
 * Verify partner session from request
 * Returns partner data if valid, null if not authenticated
 */
export async function getPartnerFromSession(
  request: NextRequest
): Promise<PartnerAuthData | null> {
  try {
    const accessToken = request.cookies.get('hostAccessToken')?.value ||
                       request.cookies.get('accessToken')?.value

    if (!accessToken) {
      return null
    }

    // Verify JWT
    const decoded = verify(accessToken, JWT_SECRET) as any

    if (!decoded?.hostId) {
      return null
    }

    // Get host from database
    const host = await prisma.rentalHost.findUnique({
      where: { id: decoded.hostId },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        hostType: true,
        approvalStatus: true,
        partnerCompanyName: true,
        partnerSlug: true,
        currentCommissionRate: true,
        partnerFleetSize: true
      }
    })

    if (!host) {
      return null
    }

    const isFleetPartner = host.hostType === 'FLEET_PARTNER'

    return {
      hostId: host.id,
      userId: host.userId || '',
      email: host.email,
      name: host.name,
      hostType: host.hostType as HostType,
      approvalStatus: host.approvalStatus as HostApprovalStatus,
      isFleetPartner,
      partnerCompanyName: host.partnerCompanyName || undefined,
      partnerSlug: host.partnerSlug || undefined,
      currentCommissionRate: host.currentCommissionRate || undefined,
      partnerFleetSize: host.partnerFleetSize || undefined,
      // Check if session is an impersonation
      impersonatedBy: decoded.impersonatedBy,
      impersonatorName: decoded.impersonatorName,
      impersonationLogId: decoded.impersonationLogId
    }
  } catch (error) {
    console.error('[Partner Guard] Session verification failed:', error)
    return null
  }
}

/**
 * Require Fleet Partner access
 * Throws error if user is not an approved Fleet Partner
 */
export async function requireFleetPartner(
  request: NextRequest
): Promise<PartnerAuthData> {
  const partner = await getPartnerFromSession(request)

  if (!partner) {
    throw new PartnerAuthError('Authentication required', 401)
  }

  if (!partner.isFleetPartner) {
    throw new PartnerAuthError('Fleet Partner access required', 403)
  }

  if (!isHostApproved(partner.approvalStatus)) {
    throw new PartnerAuthError('Partner account pending approval', 403)
  }

  return partner
}

/**
 * Require any partner access (including pending approval)
 * Use this for partner profile pages where pending partners can view
 */
export async function requirePartnerAuth(
  request: NextRequest
): Promise<PartnerAuthData> {
  const partner = await getPartnerFromSession(request)

  if (!partner) {
    throw new PartnerAuthError('Authentication required', 401)
  }

  if (!partner.isFleetPartner) {
    throw new PartnerAuthError('Fleet Partner access required', 403)
  }

  return partner
}

/**
 * Check if current session is an admin impersonation
 */
export function isImpersonation(partner: PartnerAuthData): boolean {
  return !!partner.impersonatedBy
}

/**
 * Get impersonation info for UI banner
 */
export function getImpersonationInfo(partner: PartnerAuthData): {
  isImpersonating: boolean
  adminName?: string
  logId?: string
} {
  return {
    isImpersonating: !!partner.impersonatedBy,
    adminName: partner.impersonatorName,
    logId: partner.impersonationLogId
  }
}

/**
 * Partner-specific feature access
 */
export type PartnerFeature =
  | 'fleet'           // Manage vehicles
  | 'bookings'        // View/manage bookings
  | 'revenue'         // View revenue & payouts
  | 'analytics'       // View performance analytics
  | 'discounts'       // Manage partner discounts
  | 'landing'         // Edit landing page
  | 'documents'       // View/upload documents
  | 'settings'        // Account settings
  | 'messages'        // Communication with guests

/**
 * Check if partner can access a specific feature
 */
export function canAccessPartnerFeature(
  partner: PartnerAuthData,
  feature: PartnerFeature
): boolean {
  // Settings and documents always accessible for pending partners
  if (feature === 'settings' || feature === 'documents') {
    return true
  }

  // Only approved partners can access full features
  if (!isHostApproved(partner.approvalStatus)) {
    return false
  }

  return true
}

/**
 * Partner-specific actions
 */
export type PartnerAction =
  | 'add_vehicle'
  | 'edit_vehicle'
  | 'remove_vehicle'
  | 'create_discount'
  | 'edit_discount'
  | 'request_payout'
  | 'update_landing'
  | 'upload_document'
  | 'message_guest'

/**
 * Check if partner can perform a specific action
 */
export function canPerformPartnerAction(
  partner: PartnerAuthData,
  action: PartnerAction
): boolean {
  // Document upload is always allowed
  if (action === 'upload_document') {
    return true
  }

  // All other actions require approval
  if (!isHostApproved(partner.approvalStatus)) {
    return false
  }

  return true
}

/**
 * Get the current commission tier info
 */
export function getCommissionTierInfo(partner: PartnerAuthData): {
  currentRate: number
  currentTier: string
  vehiclesUntilNextTier: number | null
  nextTierRate: number | null
} {
  const rate = partner.currentCommissionRate || 0.25
  const fleetSize = partner.partnerFleetSize || 0

  // Default tier thresholds (can be customized per partner)
  const tier1 = 10   // 20%
  const tier2 = 50   // 15%
  const tier3 = 100  // 10%

  if (fleetSize >= tier3) {
    return {
      currentRate: rate,
      currentTier: 'Diamond',
      vehiclesUntilNextTier: null,
      nextTierRate: null
    }
  }

  if (fleetSize >= tier2) {
    return {
      currentRate: rate,
      currentTier: 'Platinum',
      vehiclesUntilNextTier: tier3 - fleetSize,
      nextTierRate: 0.10
    }
  }

  if (fleetSize >= tier1) {
    return {
      currentRate: rate,
      currentTier: 'Gold',
      vehiclesUntilNextTier: tier2 - fleetSize,
      nextTierRate: 0.15
    }
  }

  return {
    currentRate: rate,
    currentTier: 'Standard',
    vehiclesUntilNextTier: tier1 - fleetSize,
    nextTierRate: 0.20
  }
}

/**
 * Get redirect path for partners based on status
 */
export function getPartnerRedirectPath(partner: PartnerAuthData): string {
  if (partner.approvalStatus === 'SUSPENDED') {
    return '/partner/suspended'
  }

  if (partner.approvalStatus === 'REJECTED') {
    return '/partner/rejected'
  }

  if (partner.approvalStatus === 'PENDING' || partner.approvalStatus === 'NEEDS_ATTENTION') {
    return '/partner/pending'
  }

  return '/partner/dashboard'
}

/**
 * Format commission rate for display
 */
export function formatCommissionRate(rate: number): string {
  return `${Math.round(rate * 100)}%`
}

/**
 * Custom error class for partner auth
 */
export class PartnerAuthError extends Error {
  public statusCode: number

  constructor(message: string, statusCode: number = 401) {
    super(message)
    this.name = 'PartnerAuthError'
    this.statusCode = statusCode
  }
}

/**
 * Server-side guard for partner API routes
 * Returns authorization result
 */
export function authorizePartnerAction(
  partner: PartnerAuthData,
  requiredStatus: HostApprovalStatus[] = ['APPROVED']
): {
  authorized: boolean
  message?: string
  statusCode: number
} {
  if (!partner.isFleetPartner) {
    return {
      authorized: false,
      message: 'Fleet Partner access required',
      statusCode: 403
    }
  }

  if (requiredStatus.includes(partner.approvalStatus)) {
    return {
      authorized: true,
      statusCode: 200
    }
  }

  if (partner.approvalStatus === 'PENDING' || partner.approvalStatus === 'NEEDS_ATTENTION') {
    return {
      authorized: false,
      message: 'Your partner application is pending approval.',
      statusCode: 403
    }
  }

  if (partner.approvalStatus === 'SUSPENDED') {
    return {
      authorized: false,
      message: 'Your partner account is suspended. Please contact support.',
      statusCode: 403
    }
  }

  if (partner.approvalStatus === 'REJECTED') {
    return {
      authorized: false,
      message: 'Your partner application was not approved.',
      statusCode: 403
    }
  }

  return {
    authorized: false,
    message: 'You are not authorized to perform this action.',
    statusCode: 401
  }
}

/**
 * Check if partner has expiring documents
 * Returns documents that expire within 30 days
 */
export async function getExpiringDocuments(hostId: string): Promise<{
  hasExpiring: boolean
  documents: Array<{
    id: string
    type: string
    expiresAt: Date
    daysUntilExpiry: number
  }>
}> {
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  const expiringDocs = await prisma.partnerDocument.findMany({
    where: {
      hostId,
      expiresAt: {
        lte: thirtyDaysFromNow,
        gt: new Date()
      },
      isExpired: false
    },
    select: {
      id: true,
      type: true,
      expiresAt: true
    }
  })

  return {
    hasExpiring: expiringDocs.length > 0,
    documents: expiringDocs.map(doc => ({
      id: doc.id,
      type: doc.type,
      expiresAt: doc.expiresAt!,
      daysUntilExpiry: Math.ceil(
        (doc.expiresAt!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    }))
  }
}

/**
 * Check if partner has expired documents (in grace period or beyond)
 */
export async function getExpiredDocuments(hostId: string): Promise<{
  hasExpired: boolean
  inGracePeriod: boolean
  documents: Array<{
    id: string
    type: string
    expiresAt: Date
    gracePeriodEndsAt: Date | null
    hoursUntilSuspension: number | null
  }>
}> {
  const expiredDocs = await prisma.partnerDocument.findMany({
    where: {
      hostId,
      isExpired: true
    },
    select: {
      id: true,
      type: true,
      expiresAt: true,
      gracePeriodEndsAt: true
    }
  })

  const now = Date.now()
  const inGracePeriod = expiredDocs.some(doc =>
    doc.gracePeriodEndsAt && doc.gracePeriodEndsAt.getTime() > now
  )

  return {
    hasExpired: expiredDocs.length > 0,
    inGracePeriod,
    documents: expiredDocs.map(doc => ({
      id: doc.id,
      type: doc.type,
      expiresAt: doc.expiresAt!,
      gracePeriodEndsAt: doc.gracePeriodEndsAt,
      hoursUntilSuspension: doc.gracePeriodEndsAt
        ? Math.ceil((doc.gracePeriodEndsAt.getTime() - now) / (1000 * 60 * 60))
        : null
    }))
  }
}
