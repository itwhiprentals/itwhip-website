// app/lib/audit/audit-service.ts

import { prisma } from '@/app/lib/database/prisma'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'

// Audit event types
export enum AuditEventType {
  // Data operations
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SOFT_DELETE = 'SOFT_DELETE',
  RESTORE = 'RESTORE',
  
  // Access events
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  
  // Permission events
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  
  // Financial events
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  REFUND_ISSUED = 'REFUND_ISSUED',
  PAYOUT_SENT = 'PAYOUT_SENT',
  COMMISSION_CALCULATED = 'COMMISSION_CALCULATED',
  
  // Operational events
  DATA_EXPORT = 'DATA_EXPORT',
  BULK_OPERATION = 'BULK_OPERATION',
  SYSTEM_OVERRIDE = 'SYSTEM_OVERRIDE',
  EMERGENCY_ACCESS = 'EMERGENCY_ACCESS'
}

// Entity types for categorization
export enum AuditEntityType {
  USER = 'USER',
  HOST = 'HOST',
  CAR = 'CAR',
  BOOKING = 'BOOKING',
  PAYMENT = 'PAYMENT',
  REVIEW = 'REVIEW',
  DOCUMENT = 'DOCUMENT',
  SYSTEM = 'SYSTEM'
}

interface AuditContext {
  userId?: string
  userEmail?: string
  adminId?: string
  adminEmail?: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  requestId?: string
}

interface AuditOptions {
  severity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  category?: string
  reason?: string
  metadata?: any
  compliance?: {
    gdpr?: boolean
    ccpa?: boolean
    pci?: boolean
  }
}

class AuditService {
  /**
   * Core audit logging function
   */
  async log(
    eventType: AuditEventType,
    entityType: AuditEntityType,
    entityId: string,
    details: any,
    options: AuditOptions = {}
  ) {
    try {
      // Get context from the current request
      const context = await this.getRequestContext()
      
      // Generate a hash of the entry for integrity
      const entryHash = this.generateHash({
        eventType,
        entityType,
        entityId,
        details,
        timestamp: new Date()
      })
      
      // Get the previous entry's hash for chaining
      const previousEntry = await prisma.auditLog.findFirst({
        orderBy: { timestamp: 'desc' },
        select: { hash: true }
      })
      
      // Create the audit log entry
      const auditEntry = await prisma.auditLog.create({
        data: {
          id: uuidv4(),

          // Event categorization
          category: (options.category || 'DATA_ACCESS') as any,
          eventType: eventType.toString(),
          severity: (options.severity || 'INFO') as any,

          // Actor information
          userId: context.userId,
          adminId: context.adminId,
          adminEmail: context.adminEmail,

          // Request context
          ipAddress: context.ipAddress || 'unknown',
          userAgent: context.userAgent || 'unknown',
          sessionId: context.sessionId,
          requestId: context.requestId,

          // Action details
          action: eventType.toString(),
          resource: entityType.toString(),
          resourceId: entityId,

          // Detailed information
          details: details,
          metadata: options.metadata,

          // Compliance flags
          gdpr: options.compliance?.gdpr || false,
          ccpa: options.compliance?.ccpa || false,
          pci: options.compliance?.pci || false,

          // Data integrity
          hash: entryHash,
          previousHash: previousEntry?.hash,

          timestamp: new Date()
        } as any
      })
      
      // For critical events, trigger alerts
      if (options.severity === 'CRITICAL') {
        await this.triggerAlert(auditEntry)
      }
      
      return auditEntry
      
    } catch (error) {
      console.error('Failed to create audit log:', error)
      // Even if audit logging fails, we don't want to break the operation
      // But we should track this failure somewhere
      await this.logAuditFailure(error)
    }
  }
  
  /**
   * Specialized function for deletion auditing
   */
  async logDeletion(
    entityType: AuditEntityType,
    entityId: string,
    fullRecord: any,
    reason?: string,
    isHardDelete: boolean = false
  ) {
    // Create a snapshot of the entire record before deletion
    const snapshot = {
      deletedAt: new Date(),
      isHardDelete,
      reason,
      fullRecord: JSON.parse(JSON.stringify(fullRecord)) // Deep clone
    }
    
    return this.log(
      isHardDelete ? AuditEventType.DELETE : AuditEventType.SOFT_DELETE,
      entityType,
      entityId,
      snapshot,
      {
        severity: isHardDelete ? 'WARNING' : 'INFO',
        category: 'DATA_MODIFICATION',
        reason,
        metadata: {
          recordType: entityType,
          recordId: entityId,
          deletionType: isHardDelete ? 'HARD' : 'SOFT'
        }
      }
    )
  }
  
  /**
   * Log successful login
   */
  async logLogin(userId: string, userEmail: string, metadata?: any) {
    return this.log(
      AuditEventType.LOGIN,
      AuditEntityType.USER,
      userId,
      { loginTime: new Date(), email: userEmail },
      {
        category: 'AUTHENTICATION',
        severity: 'INFO',
        metadata
      }
    )
  }
  
  /**
   * Log failed login attempt
   */
  async logFailedLogin(identifier: string, reason: string, metadata?: any) {
    const context = await this.getRequestContext()
    
    return this.log(
      AuditEventType.LOGIN_FAILED,
      AuditEntityType.SYSTEM,
      'auth_system',
      { 
        identifier, 
        reason,
        attemptTime: new Date(),
        ipAddress: context.ipAddress 
      },
      {
        category: 'AUTHENTICATION',
        severity: 'WARNING',
        metadata
      }
    )
  }
  
  /**
   * Log permission changes
   */
  async logPermissionChange(
    hostId: string,
    changedBy: string,
    oldPermissions: any,
    newPermissions: any,
    reason?: string
  ) {
    return this.log(
      AuditEventType.PERMISSION_GRANTED,
      AuditEntityType.HOST,
      hostId,
      {
        changedBy,
        changes: {
          before: oldPermissions,
          after: newPermissions
        },
        reason
      },
      {
        category: 'AUTHORIZATION',
        severity: 'WARNING',
        reason
      }
    )
  }
  
  /**
   * Log financial transactions
   */
  async logFinancialEvent(
    type: 'CHARGE' | 'REFUND' | 'PAYOUT',
    entityId: string,
    amount: number,
    currency: string,
    details: any
  ) {
    const eventType = {
      CHARGE: AuditEventType.PAYMENT_PROCESSED,
      REFUND: AuditEventType.REFUND_ISSUED,
      PAYOUT: AuditEventType.PAYOUT_SENT
    }[type]
    
    return this.log(
      eventType,
      AuditEntityType.PAYMENT,
      entityId,
      {
        amount,
        currency,
        ...details
      },
      {
        category: 'FINANCIAL',
        severity: 'WARNING',
        compliance: { pci: true },
        metadata: { 
          transactionType: type,
          amount,
          currency 
        }
      }
    )
  }
  
  /**
   * Query audit logs with filters
   */
  async queryLogs(filters: {
    startDate?: Date
    endDate?: Date
    userId?: string
    entityType?: string
    eventType?: string
    severity?: string
    limit?: number
  }) {
    const where: any = {}
    
    if (filters.startDate || filters.endDate) {
      where.timestamp = {}
      if (filters.startDate) where.timestamp.gte = filters.startDate
      if (filters.endDate) where.timestamp.lte = filters.endDate
    }
    
    if (filters.userId) where.userId = filters.userId
    if (filters.entityType) where.resource = filters.entityType
    if (filters.eventType) where.eventType = filters.eventType
    if (filters.severity) where.severity = filters.severity
    
    return prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: filters.limit || 100
    })
  }
  
  /**
   * Verify audit log integrity
   */
  async verifyIntegrity(startDate?: Date, endDate?: Date) {
    const logs = await this.queryLogs({ startDate, endDate, limit: 10000 })
    
    const results: {
      totalChecked: number
      valid: number
      invalid: { id: string; reason: string }[]
      broken: { id: string; reason: string }[]
    } = {
      totalChecked: logs.length,
      valid: 0,
      invalid: [],
      broken: []
    }
    
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i]
      
      // Verify hash
      const recalculatedHash = this.generateHash({
        eventType: log.eventType,
        entityType: log.resource,
        entityId: log.resourceId,
        details: log.details,
        timestamp: log.timestamp
      })
      
      if (recalculatedHash !== log.hash) {
        results.invalid.push({
          id: log.id,
          reason: 'Hash mismatch'
        })
        continue
      }
      
      // Verify chain (except for the last entry)
      if (i < logs.length - 1) {
        const nextLog = logs[i + 1]
        if (log.previousHash !== nextLog.hash) {
          results.broken.push({
            id: log.id,
            reason: 'Chain broken'
          })
          continue
        }
      }
      
      results.valid++
    }
    
    return results
  }
  
  /**
   * Generate compliance report
   */
  async generateComplianceReport(userId: string, requestType: 'GDPR' | 'CCPA') {
    // Get all data related to this user
    const userData = {
      auditLogs: await prisma.auditLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' }
      }),
      
      // Add other relevant data based on your schema
      bookings: await prisma.rentalBooking.findMany({
        where: { renterId: userId }
      }),
      
      // ... other user data
    }
    
    return {
      reportType: requestType,
      generatedAt: new Date(),
      userId,
      data: userData
    }
  }
  
  // Private helper methods
  
  private async getRequestContext(): Promise<AuditContext> {
    try {
      const headersList = await headers()
      
      return {
        ipAddress: headersList.get('x-forwarded-for') || 
                   headersList.get('x-real-ip') || 
                   'unknown',
        userAgent: headersList.get('user-agent') || 'unknown',
        requestId: headersList.get('x-request-id') || undefined,
        // These would come from your auth context
        // userId, userEmail, adminId, etc. would be set based on your auth implementation
      }
    } catch {
      return {
        ipAddress: 'unknown',
        userAgent: 'unknown'
      }
    }
  }
  
  private generateHash(data: any): string {
    const stringified = JSON.stringify(data)
    return crypto.createHash('sha256').update(stringified).digest('hex')
  }
  
  private async triggerAlert(auditEntry: any) {
    // Implement your alert mechanism here
    // Could be email, SMS, Slack, etc.
    console.error('CRITICAL AUDIT EVENT:', auditEntry)
    
    // Create an admin notification
    try {
      await prisma.adminNotification.create({
        data: {
          id: uuidv4(),
          type: 'CRITICAL_AUDIT_EVENT',
          title: `Critical Event: ${auditEntry.eventType}`,
          message: `Critical ${auditEntry.eventType} event on ${auditEntry.resource} ${auditEntry.resourceId}`,
          priority: 'URGENT',
          status: 'UNREAD',
          relatedId: auditEntry.id,
          relatedType: 'AUDIT_LOG',
          actionRequired: true,
          metadata: {
            auditEntry
          }
        } as any
      })
    } catch (error) {
      console.error('Failed to create admin notification:', error)
    }
  }
  
  private async logAuditFailure(error: any) {
    // Log audit failures to a separate system or file
    // This ensures we know when auditing itself fails
    console.error('AUDIT SYSTEM FAILURE:', error)
    // Could write to a file, external service, etc.
  }
}

// Export singleton instance
export const auditService = new AuditService()

// Export types for use in other files
export type { AuditContext, AuditOptions }