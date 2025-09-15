// app/lib/audit/charge-audit.ts

import { prisma } from '@/app/lib/database/prisma'

export enum AuditAction {
  // Charge Actions
  CHARGE_PROCESSED = 'CHARGE_PROCESSED',
  CHARGE_FAILED = 'CHARGE_FAILED',
  CHARGE_REFUNDED = 'CHARGE_REFUNDED',
  CHARGE_WAIVED = 'CHARGE_WAIVED',
  CHARGE_PARTIAL_WAIVED = 'CHARGE_PARTIAL_WAIVED',
  CHARGE_ADJUSTED = 'CHARGE_ADJUSTED',
  CHARGE_RETRY_ATTEMPTED = 'CHARGE_RETRY_ATTEMPTED',
  
  // Admin Actions
  ADMIN_OVERRIDE = 'ADMIN_OVERRIDE',
  ADMIN_APPROVAL = 'ADMIN_APPROVAL',
  ADMIN_REJECTION = 'ADMIN_REJECTION',
  ADMIN_NOTE_ADDED = 'ADMIN_NOTE_ADDED',
  
  // Dispute Actions
  DISPUTE_OPENED = 'DISPUTE_OPENED',
  DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
  DISPUTE_ESCALATED = 'DISPUTE_ESCALATED',
  
  // System Actions
  SYSTEM_AUTO_CHARGE = 'SYSTEM_AUTO_CHARGE',
  SYSTEM_HOLD_EXPIRED = 'SYSTEM_HOLD_EXPIRED',
  SYSTEM_RETRY_SCHEDULED = 'SYSTEM_RETRY_SCHEDULED'
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

interface AuditLogEntry {
  action: AuditAction
  severity?: AuditSeverity
  bookingId: string
  adminId?: string
  adminEmail?: string
  amount?: number
  previousAmount?: number
  newAmount?: number
  reason?: string
  metadata?: Record<string, any>
  stripeChargeId?: string
  ipAddress?: string
  userAgent?: string
}

interface ChargeAdjustmentLog {
  bookingId: string
  adminId: string
  originalCharges: {
    mileage: number
    fuel: number
    late: number
    damage: number
    total: number
  }
  adjustedCharges: {
    mileage: number
    fuel: number
    late: number
    damage: number
    total: number
  }
  adjustmentReason: string
  percentageWaived?: number
  amountWaived?: number
}

interface ComplianceReport {
  bookingId: string
  startDate: Date
  endDate: Date
  includeWaived?: boolean
  includeFailed?: boolean
  includeDisputes?: boolean
}

export class ChargeAuditService {
  /**
   * Log a financial action for audit trail
   */
  static async logAction(entry: AuditLogEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: entry.action,
          severity: entry.severity || AuditSeverity.INFO,
          entityType: 'RentalBooking',
          entityId: entry.bookingId,
          performedBy: entry.adminId || 'system',
          performedByEmail: entry.adminEmail,
          description: this.generateDescription(entry),
          amount: entry.amount,
          previousValue: entry.previousAmount ? JSON.stringify({ amount: entry.previousAmount }) : null,
          newValue: entry.newAmount ? JSON.stringify({ amount: entry.newAmount }) : null,
          reason: entry.reason,
          metadata: entry.metadata || {},
          stripeReferenceId: entry.stripeChargeId,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          timestamp: new Date()
        }
      })

      // Log critical actions to a separate high-priority table
      if (entry.severity === AuditSeverity.CRITICAL) {
        await this.logCriticalEvent(entry)
      }

      console.log(`[Audit] ${entry.action} logged for booking ${entry.bookingId}`)
    } catch (error) {
      console.error('[Audit] Failed to log action:', error)
      // Don't throw - audit logging should not break the main flow
      await this.logToBackupFile(entry, error)
    }
  }

  /**
   * Log charge processing with full details
   */
  static async logChargeProcessed(
    bookingId: string,
    amount: number,
    chargeId: string,
    adminId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAction({
      action: AuditAction.CHARGE_PROCESSED,
      severity: AuditSeverity.INFO,
      bookingId,
      adminId,
      amount,
      stripeChargeId: chargeId,
      metadata: {
        ...metadata,
        processedAt: new Date().toISOString(),
        status: 'succeeded'
      }
    })
  }

  /**
   * Log failed charge attempt with error details
   */
  static async logChargeFailed(
    bookingId: string,
    amount: number,
    error: string,
    adminId?: string,
    retryCount?: number
  ): Promise<void> {
    await this.logAction({
      action: AuditAction.CHARGE_FAILED,
      severity: AuditSeverity.ERROR,
      bookingId,
      adminId,
      amount,
      reason: error,
      metadata: {
        retryCount,
        failedAt: new Date().toISOString(),
        errorDetails: error
      }
    })
  }

  /**
   * Log charge waiver with reason and approval
   */
  static async logChargeWaived(
    bookingId: string,
    amount: number,
    waivedAmount: number,
    reason: string,
    adminId: string,
    adminEmail: string,
    percentageWaived?: number
  ): Promise<void> {
    const action = percentageWaived === 100 
      ? AuditAction.CHARGE_WAIVED 
      : AuditAction.CHARGE_PARTIAL_WAIVED

    await this.logAction({
      action,
      severity: AuditSeverity.WARNING,
      bookingId,
      adminId,
      adminEmail,
      amount,
      newAmount: amount - waivedAmount,
      reason,
      metadata: {
        originalAmount: amount,
        waivedAmount,
        remainingAmount: amount - waivedAmount,
        percentageWaived: percentageWaived || (waivedAmount / amount * 100),
        waivedAt: new Date().toISOString()
      }
    })
  }

  /**
   * Log charge adjustments with detailed breakdown
   */
  static async logChargeAdjustment(log: ChargeAdjustmentLog): Promise<void> {
    const totalAdjustment = log.originalCharges.total - log.adjustedCharges.total
    
    await this.logAction({
      action: AuditAction.CHARGE_ADJUSTED,
      severity: AuditSeverity.WARNING,
      bookingId: log.bookingId,
      adminId: log.adminId,
      previousAmount: log.originalCharges.total,
      newAmount: log.adjustedCharges.total,
      reason: log.adjustmentReason,
      metadata: {
        originalBreakdown: log.originalCharges,
        adjustedBreakdown: log.adjustedCharges,
        adjustmentDetails: {
          mileageAdjustment: log.originalCharges.mileage - log.adjustedCharges.mileage,
          fuelAdjustment: log.originalCharges.fuel - log.adjustedCharges.fuel,
          lateAdjustment: log.originalCharges.late - log.adjustedCharges.late,
          damageAdjustment: log.originalCharges.damage - log.adjustedCharges.damage,
          totalAdjustment
        },
        adjustmentPercentage: (totalAdjustment / log.originalCharges.total * 100).toFixed(2),
        adjustedAt: new Date().toISOString()
      }
    })
  }

  /**
   * Log dispute actions
   */
  static async logDispute(
    bookingId: string,
    disputeType: string,
    description: string,
    guestEmail: string,
    chargeAmount?: number
  ): Promise<void> {
    await this.logAction({
      action: AuditAction.DISPUTE_OPENED,
      severity: AuditSeverity.WARNING,
      bookingId,
      amount: chargeAmount,
      reason: description,
      metadata: {
        disputeType,
        guestEmail,
        openedAt: new Date().toISOString()
      }
    })
  }

  /**
   * Log admin override actions
   */
  static async logAdminOverride(
    bookingId: string,
    adminId: string,
    adminEmail: string,
    overrideType: string,
    reason: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAction({
      action: AuditAction.ADMIN_OVERRIDE,
      severity: AuditSeverity.CRITICAL,
      bookingId,
      adminId,
      adminEmail,
      reason,
      metadata: {
        overrideType,
        ...metadata,
        overriddenAt: new Date().toISOString()
      }
    })
  }

  /**
   * Generate compliance report for a booking
   */
  static async generateComplianceReport(params: ComplianceReport): Promise<any> {
    try {
      const logs = await prisma.auditLog.findMany({
        where: {
          entityId: params.bookingId,
          entityType: 'RentalBooking',
          timestamp: {
            gte: params.startDate,
            lte: params.endDate
          },
          ...(params.includeWaived === false && {
            action: {
              notIn: [AuditAction.CHARGE_WAIVED, AuditAction.CHARGE_PARTIAL_WAIVED]
            }
          })
        },
        orderBy: {
          timestamp: 'asc'
        }
      })

      // Calculate summary statistics
      const summary = {
        totalActions: logs.length,
        totalChargesProcessed: 0,
        totalChargesWaived: 0,
        totalChargesFailed: 0,
        totalDisputes: 0,
        totalAdjustments: 0,
        totalAmountProcessed: 0,
        totalAmountWaived: 0,
        uniqueAdmins: new Set<string>()
      }

      logs.forEach(log => {
        switch (log.action) {
          case AuditAction.CHARGE_PROCESSED:
            summary.totalChargesProcessed++
            summary.totalAmountProcessed += log.amount || 0
            break
          case AuditAction.CHARGE_WAIVED:
          case AuditAction.CHARGE_PARTIAL_WAIVED:
            summary.totalChargesWaived++
            summary.totalAmountWaived += (log.metadata as any)?.waivedAmount || 0
            break
          case AuditAction.CHARGE_FAILED:
            summary.totalChargesFailed++
            break
          case AuditAction.DISPUTE_OPENED:
            summary.totalDisputes++
            break
          case AuditAction.CHARGE_ADJUSTED:
            summary.totalAdjustments++
            break
        }
        
        if (log.performedBy && log.performedBy !== 'system') {
          summary.uniqueAdmins.add(log.performedBy)
        }
      })

      return {
        bookingId: params.bookingId,
        reportPeriod: {
          start: params.startDate,
          end: params.endDate
        },
        summary: {
          ...summary,
          uniqueAdminCount: summary.uniqueAdmins.size,
          uniqueAdmins: Array.from(summary.uniqueAdmins)
        },
        logs,
        generatedAt: new Date(),
        generatedBy: 'ChargeAuditService'
      }
    } catch (error) {
      console.error('[Audit] Failed to generate compliance report:', error)
      throw new Error('Failed to generate compliance report')
    }
  }

  /**
   * Get audit trail for a specific booking
   */
  static async getBookingAuditTrail(bookingId: string, limit: number = 100): Promise<any[]> {
    try {
      return await prisma.auditLog.findMany({
        where: {
          entityId: bookingId,
          entityType: 'RentalBooking'
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: limit
      })
    } catch (error) {
      console.error('[Audit] Failed to retrieve audit trail:', error)
      return []
    }
  }

  /**
   * Check if an action requires additional approval
   */
  static async requiresAdditionalApproval(
    action: AuditAction,
    amount: number,
    adminLevel: string
  ): Promise<boolean> {
    // Define thresholds for different admin levels
    const thresholds: Record<string, number> = {
      junior: 100,
      senior: 500,
      manager: 1000,
      director: 5000
    }

    const threshold = thresholds[adminLevel] || 100

    // Critical actions always require additional approval
    if (action === AuditAction.ADMIN_OVERRIDE || action === AuditAction.CHARGE_WAIVED) {
      return amount > threshold
    }

    return false
  }

  /**
   * Generate audit description for logging
   */
  private static generateDescription(entry: AuditLogEntry): string {
    const admin = entry.adminId ? `by admin ${entry.adminId}` : 'by system'
    
    switch (entry.action) {
      case AuditAction.CHARGE_PROCESSED:
        return `Charge of $${entry.amount?.toFixed(2)} processed successfully ${admin}`
      case AuditAction.CHARGE_FAILED:
        return `Charge of $${entry.amount?.toFixed(2)} failed: ${entry.reason}`
      case AuditAction.CHARGE_WAIVED:
        return `All charges ($${entry.amount?.toFixed(2)}) waived ${admin}: ${entry.reason}`
      case AuditAction.CHARGE_PARTIAL_WAIVED:
        return `Partial waive applied ${admin}: $${entry.previousAmount?.toFixed(2)} → $${entry.newAmount?.toFixed(2)}`
      case AuditAction.CHARGE_ADJUSTED:
        return `Charges adjusted ${admin}: $${entry.previousAmount?.toFixed(2)} → $${entry.newAmount?.toFixed(2)}`
      case AuditAction.DISPUTE_OPENED:
        return `Dispute opened for $${entry.amount?.toFixed(2)}: ${entry.reason}`
      case AuditAction.ADMIN_OVERRIDE:
        return `Admin override ${admin}: ${entry.reason}`
      default:
        return `${entry.action} performed ${admin}`
    }
  }

  /**
   * Log critical events to separate high-priority table
   */
  private static async logCriticalEvent(entry: AuditLogEntry): Promise<void> {
    try {
      await prisma.criticalEvent.create({
        data: {
          eventType: entry.action,
          bookingId: entry.bookingId,
          adminId: entry.adminId,
          description: this.generateDescription(entry),
          amount: entry.amount,
          metadata: entry.metadata,
          resolved: false,
          createdAt: new Date()
        }
      })
    } catch (error) {
      console.error('[Audit] Failed to log critical event:', error)
    }
  }

  /**
   * Backup logging to file system if database fails
   */
  private static async logToBackupFile(entry: AuditLogEntry, error: any): Promise<void> {
    const fs = await import('fs').then(m => m.promises)
    const path = await import('path')
    
    try {
      const logDir = path.join(process.cwd(), 'logs', 'audit')
      await fs.mkdir(logDir, { recursive: true })
      
      const filename = `audit-backup-${new Date().toISOString().split('T')[0]}.json`
      const filepath = path.join(logDir, filename)
      
      const logEntry = {
        ...entry,
        timestamp: new Date().toISOString(),
        dbError: error.message,
        backupLog: true
      }
      
      await fs.appendFile(filepath, JSON.stringify(logEntry) + '\n')
      console.log(`[Audit] Backup logged to ${filepath}`)
    } catch (backupError) {
      console.error('[Audit] Failed to write backup log:', backupError)
    }
  }

  /**
   * Export audit logs for compliance reporting
   */
  static async exportAuditLogs(
    startDate: Date,
    endDate: Date,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    try {
      const logs = await prisma.auditLog.findMany({
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          timestamp: 'asc'
        }
      })

      if (format === 'csv') {
        return this.convertToCSV(logs)
      }

      return JSON.stringify(logs, null, 2)
    } catch (error) {
      console.error('[Audit] Failed to export logs:', error)
      throw new Error('Failed to export audit logs')
    }
  }

  /**
   * Convert audit logs to CSV format
   */
  private static convertToCSV(logs: any[]): string {
    const headers = [
      'Timestamp',
      'Action',
      'Booking ID',
      'Admin ID',
      'Amount',
      'Reason',
      'Description'
    ]

    const rows = logs.map(log => [
      log.timestamp.toISOString(),
      log.action,
      log.entityId,
      log.performedBy || 'system',
      log.amount?.toFixed(2) || '',
      log.reason || '',
      log.description || ''
    ])

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
  }
}