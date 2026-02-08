// app/lib/claims/audit-logger.ts
/**
 * Claims Audit Logger v2.0 - Enterprise Grade
 * Standardized logging for all claim-related compliance activities
 * 
 * Features:
 * - Full audit trail for insurance compliance
 * - Actor role tracking (HOST, GUEST, ADMIN, SYSTEM)
 * - Booking context for forensic tracing
 * - Privacy-ready IP handling (GDPR compliance toggle)
 * - Type-safe interfaces
 * - Safe fallbacks (non-blocking)
 * 
 * Usage:
 * ```typescript
 * import { logClaimAudit } from '@/app/lib/claims/audit-logger'
 * 
 * await logClaimAudit.claimFiled(
 *   { userId: hostId, ipAddress, userAgent, role: 'HOST' },
 *   { claimId, claimType, bookingId, estimatedCost }
 * )
 * ```
 */

import { prisma } from '@/app/lib/database/prisma'
import crypto from 'crypto'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Actor roles for audit trail
 */
export type ActorRole = 'HOST' | 'GUEST' | 'ADMIN' | 'SYSTEM'

/**
 * Audit context - who, where, when
 */
export interface ClaimAuditContext {
  userId: string
  ipAddress?: string
  userAgent?: string
  role?: ActorRole // Default: 'HOST'
  sessionId?: string
}

/**
 * Claim details for audit
 */
export interface ClaimDetails {
  claimId: string
  claimType: string
  bookingId: string
  estimatedCost?: number
}

/**
 * Vehicle deactivation/reactivation details
 */
export interface VehicleDetails {
  vehicleId: string
  claimId: string
  bookingId: string // ✅ ENHANCEMENT 1: For forensic tracing
  reason: string
}

// ============================================================================
// PRIVACY UTILITIES
// ============================================================================

/**
 * Hash IP address for GDPR compliance
 * Set AUDIT_PRIVACY_MODE=true in .env to enable
 */
function sanitizeIpAddress(ipAddress: string | undefined): string {
  if (!ipAddress) return 'unknown'
  
  // ✅ ENHANCEMENT 3: GDPR-ready IP handling
  const privacyMode = process.env.AUDIT_PRIVACY_MODE === 'true'
  
  if (privacyMode) {
    // Hash IP with salt for privacy compliance
    const salt = process.env.AUDIT_IP_SALT || 'itwhip-audit-salt'
    return crypto
      .createHash('sha256')
      .update(ipAddress + salt)
      .digest('hex')
      .substring(0, 16) // Truncate for storage
  }
  
  return ipAddress
}

// ============================================================================
// AUDIT LOGGING FUNCTIONS
// ============================================================================

export const logClaimAudit = {
  /**
   * Log claim filed event
   */
  async claimFiled(
    context: ClaimAuditContext,
    details: ClaimDetails
  ): Promise<string | null> {
    try {
      const auditId = crypto.randomUUID()
      const audit = await prisma.auditLog.create({
        data: {
          id: auditId,
          category: 'COMPLIANCE',
          eventType: 'CLAIM_FILED',
          severity: 'CRITICAL',
          userId: context.userId,
          ipAddress: sanitizeIpAddress(context.ipAddress),
          userAgent: context.userAgent || 'unknown',
          action: 'CREATE_INSURANCE_CLAIM',
          resource: 'CLAIM',
          resourceId: details.claimId,
          amount: details.estimatedCost || 0,
          currency: 'USD',
          hash: crypto.createHash('sha256').update(auditId + 'CLAIM_FILED').digest('hex'),
          // ✅ ENHANCEMENT 2: Actor role tracking
          metadata: {
            actorRole: context.role || 'HOST',
            claimType: details.claimType,
            bookingId: details.bookingId,
            sessionId: context.sessionId
          } as any
        }
      })

      console.log(`✅ Audit Log: Claim filed - ${details.claimId} by ${context.role || 'HOST'}`)
      return audit.id
    } catch (error) {
      console.error('❌ Failed to log claim filed audit:', error)
      return null // Non-blocking failure
    }
  },

  /**
   * Log vehicle deactivation due to claim
   */
  async vehicleDeactivated(
    context: ClaimAuditContext,
    details: VehicleDetails
  ): Promise<string | null> {
    try {
      const auditId = crypto.randomUUID()
      const audit = await prisma.auditLog.create({
        data: {
          id: auditId,
          category: 'COMPLIANCE',
          eventType: 'VEHICLE_DEACTIVATED_CLAIM',
          severity: 'WARNING',
          userId: context.userId,
          ipAddress: sanitizeIpAddress(context.ipAddress),
          userAgent: context.userAgent || 'unknown',
          action: 'DEACTIVATE_VEHICLE',
          resource: 'RENTAL_CAR',
          resourceId: details.vehicleId,
          hash: crypto.createHash('sha256').update(auditId + 'VEHICLE_DEACTIVATED_CLAIM').digest('hex'),
          // ✅ ENHANCEMENT 2: Actor role + ✅ ENHANCEMENT 1: Booking context
          metadata: {
            actorRole: context.role || 'HOST',
            claimId: details.claimId,
            bookingId: details.bookingId, // For forensic joining
            reason: details.reason,
            sessionId: context.sessionId
          } as any
        }
      })

      console.log(`✅ Audit Log: Vehicle deactivated - ${details.vehicleId} (Claim: ${details.claimId})`)
      return audit.id
    } catch (error) {
      console.error('❌ Failed to log vehicle deactivation audit:', error)
      return null // Non-blocking failure
    }
  },

  /**
   * Log vehicle reactivation after claim resolution
   */
  async vehicleReactivated(
    context: ClaimAuditContext,
    details: VehicleDetails
  ): Promise<string | null> {
    try {
      const auditId = crypto.randomUUID()
      const audit = await prisma.auditLog.create({
        data: {
          id: auditId,
          category: 'COMPLIANCE',
          eventType: 'VEHICLE_REACTIVATED_CLAIM',
          severity: 'CRITICAL',
          userId: context.userId,
          ipAddress: sanitizeIpAddress(context.ipAddress),
          userAgent: context.userAgent || 'unknown',
          action: 'REACTIVATE_VEHICLE',
          resource: 'RENTAL_CAR',
          resourceId: details.vehicleId,
          hash: crypto.createHash('sha256').update(auditId + 'VEHICLE_REACTIVATED_CLAIM').digest('hex'),
          // ✅ ENHANCEMENT 2: Actor role + ✅ ENHANCEMENT 1: Booking context
          metadata: {
            actorRole: context.role || 'ADMIN', // Usually admin reactivates
            claimId: details.claimId,
            bookingId: details.bookingId, // For forensic joining
            reason: details.reason,
            sessionId: context.sessionId
          } as any
        }
      })

      console.log(`✅ Audit Log: Vehicle reactivated - ${details.vehicleId} (Claim: ${details.claimId})`)
      return audit.id
    } catch (error) {
      console.error('❌ Failed to log vehicle reactivation audit:', error)
      return null // Non-blocking failure
    }
  },

  /**
   * Log claim approval by fleet admin
   */
  async claimApproved(
    context: ClaimAuditContext,
    claimId: string,
    approvedAmount: number,
    bookingId: string
  ): Promise<string | null> {
    try {
      const auditId = crypto.randomUUID()
      const audit = await prisma.auditLog.create({
        data: {
          id: auditId,
          category: 'COMPLIANCE',
          eventType: 'CLAIM_APPROVED',
          severity: 'WARNING',
          userId: context.userId,
          ipAddress: sanitizeIpAddress(context.ipAddress),
          userAgent: context.userAgent || 'unknown',
          action: 'APPROVE_CLAIM',
          resource: 'CLAIM',
          resourceId: claimId,
          amount: approvedAmount,
          currency: 'USD',
          hash: crypto.createHash('sha256').update(auditId + 'CLAIM_APPROVED').digest('hex'),
          metadata: {
            actorRole: context.role || 'ADMIN',
            bookingId,
            sessionId: context.sessionId
          } as any
        }
      })

      console.log(`✅ Audit Log: Claim approved - ${claimId} ($${approvedAmount}) by ${context.role || 'ADMIN'}`)
      return audit.id
    } catch (error) {
      console.error('❌ Failed to log claim approval audit:', error)
      return null // Non-blocking failure
    }
  },

  /**
   * Log claim denial by fleet admin
   */
  async claimDenied(
    context: ClaimAuditContext,
    claimId: string,
    reason: string,
    bookingId: string
  ): Promise<string | null> {
    try {
      const auditId = crypto.randomUUID()
      const audit = await prisma.auditLog.create({
        data: {
          id: auditId,
          category: 'COMPLIANCE',
          eventType: 'CLAIM_DENIED',
          severity: 'WARNING',
          userId: context.userId,
          ipAddress: sanitizeIpAddress(context.ipAddress),
          userAgent: context.userAgent || 'unknown',
          action: 'DENY_CLAIM',
          resource: 'CLAIM',
          resourceId: claimId,
          hash: crypto.createHash('sha256').update(auditId + 'CLAIM_DENIED').digest('hex'),
          metadata: {
            actorRole: context.role || 'ADMIN',
            denialReason: reason,
            bookingId,
            sessionId: context.sessionId
          } as any
        }
      })

      console.log(`✅ Audit Log: Claim denied - ${claimId} by ${context.role || 'ADMIN'}`)
      return audit.id
    } catch (error) {
      console.error('❌ Failed to log claim denial audit:', error)
      return null // Non-blocking failure
    }
  },

  /**
   * Log guest response to claim
   */
  async guestResponded(
    context: ClaimAuditContext,
    claimId: string,
    bookingId: string
  ): Promise<string | null> {
    try {
      const auditId = crypto.randomUUID()
      const audit = await prisma.auditLog.create({
        data: {
          id: auditId,
          category: 'COMPLIANCE',
          eventType: 'CLAIM_GUEST_RESPONSE',
          severity: 'INFO',
          userId: context.userId,
          ipAddress: sanitizeIpAddress(context.ipAddress),
          userAgent: context.userAgent || 'unknown',
          action: 'SUBMIT_CLAIM_RESPONSE',
          resource: 'CLAIM',
          resourceId: claimId,
          hash: crypto.createHash('sha256').update(auditId + 'CLAIM_GUEST_RESPONSE').digest('hex'),
          metadata: {
            actorRole: 'GUEST', // ✅ ENHANCEMENT 2: Guest actor
            bookingId,
            sessionId: context.sessionId
          } as any
        }
      })

      console.log(`✅ Audit Log: Guest responded to claim - ${claimId}`)
      return audit.id
    } catch (error) {
      console.error('❌ Failed to log guest response audit:', error)
      return null // Non-blocking failure
    }
  },

  /**
   * Log system-initiated action (e.g., auto-suspension after 48hrs)
   */
  async systemAction(
    action: string,
    resourceType: 'CLAIM' | 'RENTAL_CAR' | 'GUEST_ACCOUNT',
    resourceId: string,
    metadata: Record<string, any>
  ): Promise<string | null> {
    try {
      const auditId = crypto.randomUUID()
      const audit = await prisma.auditLog.create({
        data: {
          id: auditId,
          category: 'COMPLIANCE',
          eventType: 'SYSTEM_ACTION',
          severity: 'INFO',
          userId: 'SYSTEM',
          ipAddress: 'system',
          userAgent: 'system',
          action,
          resource: resourceType,
          resourceId,
          hash: crypto.createHash('sha256').update(auditId + 'SYSTEM_ACTION').digest('hex'),
          metadata: {
            actorRole: 'SYSTEM', // ✅ ENHANCEMENT 2: System actor
            ...metadata
          } as any
        }
      })

      console.log(`✅ Audit Log: System action - ${action} on ${resourceType}:${resourceId}`)
      return audit.id
    } catch (error) {
      console.error('❌ Failed to log system action audit:', error)
      return null // Non-blocking failure
    }
  }
}

// ============================================================================
// AUDIT TRAIL RETRIEVAL
// ============================================================================

/**
 * Retrieve complete audit history for a claim
 * For admin UI, compliance reports, legal discovery
 */
export async function getClaimAuditHistory(claimId: string) {
  try {
    const audits = await prisma.auditLog.findMany({
      where: {
        OR: [
          { resource: 'CLAIM', resourceId: claimId },
          { metadata: { path: ['claimId'], equals: claimId } }
        ]
      },
      orderBy: {
        timestamp: 'asc'
      },
      select: {
        id: true,
        eventType: true,
        severity: true,
        action: true,
        userId: true,
        ipAddress: true,
        userAgent: true,
        amount: true,
        currency: true,
        metadata: true,
        timestamp: true
      }
    })

    return audits
  } catch (error) {
    console.error('Error retrieving claim audit history:', error)
    return []
  }
}

/**
 * Retrieve vehicle deactivation/reactivation history
 * For fleet operations, maintenance tracking
 */
export async function getVehicleDeactivationHistory(vehicleId: string) {
  try {
    const audits = await prisma.auditLog.findMany({
      where: {
        resource: 'RENTAL_CAR',
        resourceId: vehicleId,
        eventType: {
          in: ['VEHICLE_DEACTIVATED_CLAIM', 'VEHICLE_REACTIVATED_CLAIM']
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      select: {
        id: true,
        eventType: true,
        action: true,
        userId: true,
        metadata: true,
        timestamp: true
      }
    })

    return audits
  } catch (error) {
    console.error('Error retrieving vehicle deactivation history:', error)
    return []
  }
}

/**
 * Retrieve audit trail for a specific booking
 * For dispute resolution, timeline reconstruction
 */
export async function getBookingAuditHistory(bookingId: string) {
  try {
    const audits = await prisma.auditLog.findMany({
      where: {
        metadata: {
          path: ['bookingId'],
          equals: bookingId
        }
      },
      orderBy: {
        timestamp: 'asc'
      },
      select: {
        id: true,
        eventType: true,
        severity: true,
        action: true,
        resource: true,
        resourceId: true,
        userId: true,
        metadata: true,
        timestamp: true
      }
    })

    return audits
  } catch (error) {
    console.error('Error retrieving booking audit history:', error)
    return []
  }
}

/**
 * Get audit summary for admin dashboard
 * Shows key metrics and recent activity
 */
export async function getAuditSummary(timeframe: 'day' | 'week' | 'month' = 'week') {
  try {
    const now = new Date()
    const startDate = new Date()
    
    switch (timeframe) {
      case 'day':
        startDate.setDate(now.getDate() - 1)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
    }

    const audits = await prisma.auditLog.findMany({
      where: {
        category: 'COMPLIANCE',
        timestamp: {
          gte: startDate
        }
      },
      select: {
        eventType: true,
        severity: true,
        metadata: true
      }
    })

    // Aggregate by event type and actor role
    const summary = audits.reduce((acc, audit) => {
      const eventType = audit.eventType
      const actorRole = (audit.metadata as any)?.actorRole || 'UNKNOWN'
      
      if (!acc[eventType]) {
        acc[eventType] = { count: 0, byRole: {} }
      }
      
      acc[eventType].count++
      acc[eventType].byRole[actorRole] = (acc[eventType].byRole[actorRole] || 0) + 1
      
      return acc
    }, {} as Record<string, { count: number; byRole: Record<string, number> }>)

    return {
      timeframe,
      totalEvents: audits.length,
      summary,
      criticalEvents: audits.filter(a => a.severity === 'CRITICAL').length,
      highSeverityEvents: audits.filter(a => a.severity === 'WARNING').length
    }
  } catch (error) {
    console.error('Error retrieving audit summary:', error)
    return null
  }
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Export audit trail to CSV for compliance reporting
 * Use for SOC2, insurance audits, legal discovery
 */
export async function exportAuditTrailToCSV(
  filters: {
    startDate?: Date
    endDate?: Date
    claimId?: string
    vehicleId?: string
    bookingId?: string
  }
): Promise<string> {
  try {
    const where: any = {
      category: 'COMPLIANCE'
    }

    if (filters.startDate || filters.endDate) {
      where.timestamp = {}
      if (filters.startDate) where.timestamp.gte = filters.startDate
      if (filters.endDate) where.timestamp.lte = filters.endDate
    }

    if (filters.claimId) {
      where.OR = [
        { resource: 'CLAIM', resourceId: filters.claimId },
        { metadata: { path: ['claimId'], equals: filters.claimId } }
      ]
    }

    if (filters.vehicleId) {
      where.resource = 'RENTAL_CAR'
      where.resourceId = filters.vehicleId
    }

    if (filters.bookingId) {
      where.metadata = {
        path: ['bookingId'],
        equals: filters.bookingId
      }
    }

    const audits = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'asc' }
    })

    // Generate CSV
    const headers = [
      'Timestamp',
      'Event Type',
      'Severity',
      'Action',
      'Actor Role',
      'User ID',
      'Resource Type',
      'Resource ID',
      'Amount',
      'IP Address',
      'User Agent'
    ]

    const rows = audits.map(audit => [
      audit.timestamp.toISOString(),
      audit.eventType,
      audit.severity,
      audit.action,
      (audit.metadata as any)?.actorRole || 'N/A',
      audit.userId || 'SYSTEM',
      audit.resource,
      audit.resourceId || 'N/A',
      audit.amount ? `${audit.amount} ${audit.currency}` : 'N/A',
      audit.ipAddress,
      audit.userAgent
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csv
  } catch (error) {
    console.error('Error exporting audit trail:', error)
    throw error
  }
}