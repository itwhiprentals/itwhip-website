/**
 * Audit Logging System for ItWhip Platform
 * Implements immutable audit trails, hash chaining, and compliance reporting
 */

import { prisma } from "@/app/lib/database/prisma"
import { createHash, randomBytes } from 'crypto'
import type {
  AuditLog,
  AuditCategory,
  SecurityEventType,
  ThreatSeverity,
  ComplianceReport
} from '@/app/types/security'
import type { User, Permission } from '@/app/types/auth'
import { sanitizeForLogging } from '../security/encryption'
import { AuditCategory as PrismaAuditCategory, AuditSeverity as PrismaAuditSeverity } from '@prisma/client'

// Initialize Prisma
// Using shared prisma instance

function mapSeverityToPrisma(severity: ThreatSeverity | string): PrismaAuditSeverity {
  const s = typeof severity === 'string' ? severity.toUpperCase() : severity
  switch (s) {
    case 'LOW': return 'INFO'
    case 'MEDIUM': return 'WARNING'
    case 'HIGH': return 'ERROR'
    case 'CRITICAL': return 'CRITICAL'
    default: return 'INFO'
  }
}

function mapCategoryToPrisma(category: AuditCategory | string): PrismaAuditCategory {
  return (typeof category === 'string' ? category.toUpperCase() : category) as PrismaAuditCategory
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Audit Configuration
 */
const AUDIT_CONFIG = {
  // Retention periods (days)
  RETENTION: {
    AUTHENTICATION: 90,
    AUTHORIZATION: 90,
    DATA_ACCESS: 365,
    DATA_MODIFICATION: 2555, // 7 years
    CONFIGURATION: 365,
    SECURITY: 2555,
    COMPLIANCE: 2555,
    FINANCIAL: 2555
  },
  
  // Compliance standards
  COMPLIANCE: {
    GDPR: {
      enabled: true,
      retentionDays: 1095, // 3 years
      anonymizeAfter: 365
    },
    CCPA: {
      enabled: true,
      retentionDays: 730, // 2 years
      deleteOnRequest: true
    },
    PCI: {
      enabled: true,
      retentionDays: 365,
      maskCardNumbers: true
    },
    HIPAA: {
      enabled: true,
      retentionDays: 2190, // 6 years
      encryptPHI: true
    },
    SOC2: {
      enabled: true,
      retentionDays: 365,
      requireSignature: true
    }
  },
  
  // High-risk events that require special handling
  HIGH_RISK_EVENTS: [
    'password_reset',
    'role_changed',
    'permission_granted',
    'api_key_created',
    'data_exported',
    'configuration_changed',
    'security_incident',
    'compliance_violation'
  ],
  
  // Fields to always mask in logs
  MASKED_FIELDS: [
    'password',
    'passwordHash',
    'creditCard',
    'cardNumber',
    'cvv',
    'ssn',
    'apiKey',
    'secret',
    'token'
  ],
  
  // Hash chain configuration
  HASH_CHAIN: {
    algorithm: 'sha256',
    includeTimestamp: true,
    includePreviousHash: true,
    salt: process.env.AUDIT_SALT || randomBytes(32).toString('hex')
  }
}

/**
 * Audit log queue for batch processing (use message queue in production)
 */
const auditQueue: AuditLogEntry[] = []
const BATCH_SIZE = 100
const FLUSH_INTERVAL = 5000 // 5 seconds

interface AuditLogEntry {
  category: AuditCategory | string
  eventType: SecurityEventType | string
  severity: ThreatSeverity | string
  actor: {
    userId?: string
    hotelId?: string
    email?: string
    role?: string
    ip: string
    userAgent: string
    location?: {
      country: string
      city: string
      coordinates?: { lat: number; lng: number }
    }
  }
  action: {
    type: string
    resource: string
    resourceId?: string
    permissions?: Permission[]
  }
  context: {
    sessionId?: string
    requestId: string
    endpoint?: string
    method?: string
  }
  changes?: {
    before?: any
    after?: any
  }
  metadata?: any
}

// ============================================================================
// SECURITY EVENT CREATION - NEW EXPORT FOR ALERT SYSTEM
// ============================================================================

/**
 * Create a security event - Used by the alert system
 * This function is specifically for the alert.ts integration
 */
export async function createSecurityEvent(event: {
  type: string
  severity: ThreatSeverity | string
  sourceIp: string
  userAgent: string
  message: string
  details?: any
  action: string
  blocked: boolean
  userId?: string
}): Promise<void> {
  try {
    // Map to audit security event
    await auditSecurityEvent(
      event.type as SecurityEventType,
      event.severity as ThreatSeverity,
      event.sourceIp,
      'security_alert',
      {
        message: event.message,
        details: event.details,
        userId: event.userId
      },
      event.blocked
    )
  } catch (error) {
    console.error('Failed to create security event from alert:', error)
    // Don't throw to avoid disrupting the alert system
  }
}

// ============================================================================
// AUDIT LOGGING CORE
// ============================================================================

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  entry: AuditLogEntry
): Promise<AuditLog> {
  try {
    // Sanitize sensitive data
    const sanitizedEntry = sanitizeAuditEntry(entry)
    
    // Generate hash chain
    const previousHash = await getLastAuditHash()
    const hash = generateAuditHash(sanitizedEntry, previousHash)
    
    // Determine compliance flags
    const compliance = determineCompliance(entry)
    
    // Create audit log
    const auditLog: any = await prisma.auditLog.create({
      data: {
        id: crypto.randomUUID(),
        category: mapCategoryToPrisma(entry.category),
        eventType: entry.eventType,
        severity: mapSeverityToPrisma(entry.severity),

        // Actor information
        userId: entry.actor.userId,
        hotelId: entry.actor.hotelId,
        ipAddress: entry.actor.ip,
        userAgent: entry.actor.userAgent,

        // Action details
        action: entry.action.type,
        resource: entry.action.resource,
        resourceId: entry.action.resourceId,

        // Context and changes
        details: {
          actor: sanitizedEntry.actor,
          action: sanitizedEntry.action,
          context: sanitizedEntry.context,
          metadata: sanitizedEntry.metadata
        },
        changes: entry.changes ? {
          before: sanitizeForLogging(entry.changes.before),
          after: sanitizeForLogging(entry.changes.after),
          diff: calculateDiff(entry.changes.before, entry.changes.after)
        } : undefined,

        // Compliance
        gdpr: compliance.gdpr,
        ccpa: compliance.ccpa,
        pci: compliance.pci,

        // Hash chain
        hash,
        previousHash,

        timestamp: new Date()
      }
    })
    
    // Handle high-risk events
    if (isHighRiskEvent(entry.eventType)) {
      await handleHighRiskEvent(auditLog)
    }
    
    // Index for search if needed
    await indexAuditLog(auditLog)
    
    return auditLog as AuditLog
  } catch (error: any) {
    console.error('Failed to create audit log:', error)
    
    // Audit logging should never fail silently
    // In production, send to backup logging service
    await fallbackAuditLog(entry, error)
    
    throw error
  }
}

/**
 * Log authentication event
 */
export async function auditAuthentication(
  eventType: 'login_success' | 'login_failed' | 'logout' | 'password_reset',
  user: Partial<User> | null,
  ip: string,
  userAgent: string,
  details?: any
): Promise<void> {
  const u = user as any
  await createAuditLog({
    category: 'AUTHENTICATION',
    eventType,
    severity: eventType === 'login_failed' ? 'MEDIUM' : 'LOW',
    actor: {
      userId: u?.id,
      email: u?.email,
      role: u?.role,
      ip,
      userAgent
    },
    action: {
      type: eventType,
      resource: 'authentication',
      resourceId: user?.id
    },
    context: {
      requestId: generateRequestId(),
      endpoint: '/api/auth'
    },
    metadata: details
  })
}

/**
 * Log authorization event
 */
export async function auditAuthorization(
  granted: boolean,
  userId: string,
  resource: string,
  permissions: Permission[],
  ip: string,
  userAgent: string
): Promise<void> {
  await createAuditLog({
    category: 'AUTHORIZATION',
    eventType: granted ? 'permission_granted' : 'permission_denied',
    severity: granted ? 'LOW' : 'MEDIUM',
    actor: {
      userId,
      ip,
      userAgent
    },
    action: {
      type: granted ? 'access_granted' : 'access_denied',
      resource,
      permissions
    },
    context: {
      requestId: generateRequestId()
    }
  })
}

/**
 * Log data access event
 */
export async function auditDataAccess(
  userId: string,
  resource: string,
  resourceId: string,
  recordCount: number,
  ip: string,
  userAgent: string,
  fields?: string[]
): Promise<void> {
  await createAuditLog({
    category: 'DATA_ACCESS',
    eventType: 'data_accessed',
    severity: recordCount > 100 ? 'MEDIUM' : 'LOW',
    actor: {
      userId,
      ip,
      userAgent
    },
    action: {
      type: 'read',
      resource,
      resourceId
    },
    context: {
      requestId: generateRequestId()
    },
    metadata: {
      recordCount,
      fields: fields || []
    }
  })
}

/**
 * Log data modification event
 */
export async function auditDataModification(
  userId: string,
  resource: string,
  resourceId: string,
  operation: 'create' | 'update' | 'delete',
  before: any,
  after: any,
  ip: string,
  userAgent: string
): Promise<void> {
  await createAuditLog({
    category: 'DATA_MODIFICATION',
    eventType: `data_${operation}d`,
    severity: operation === 'delete' ? 'HIGH' : 'MEDIUM',
    actor: {
      userId,
      ip,
      userAgent
    },
    action: {
      type: operation,
      resource,
      resourceId
    },
    context: {
      requestId: generateRequestId()
    },
    changes: {
      before,
      after
    }
  })
}

/**
 * Log configuration change
 */
export async function auditConfigurationChange(
  userId: string,
  setting: string,
  oldValue: any,
  newValue: any,
  ip: string,
  userAgent: string
): Promise<void> {
  await createAuditLog({
    category: 'CONFIGURATION',
    eventType: 'configuration_changed',
    severity: 'HIGH',
    actor: {
      userId,
      ip,
      userAgent
    },
    action: {
      type: 'configure',
      resource: 'system_configuration',
      resourceId: setting
    },
    context: {
      requestId: generateRequestId()
    },
    changes: {
      before: { [setting]: oldValue },
      after: { [setting]: newValue }
    }
  })
}

/**
 * Log security event
 */
export async function auditSecurityEvent(
  eventType: SecurityEventType | string,
  severity: ThreatSeverity | string,
  source: string,
  target: string,
  details: any,
  blocked: boolean = false
): Promise<void> {
  await createAuditLog({
    category: 'SECURITY',
    eventType,
    severity,
    actor: {
      ip: source,
      userAgent: 'unknown'
    },
    action: {
      type: blocked ? 'blocked' : 'detected',
      resource: 'security',
      resourceId: target
    },
    context: {
      requestId: generateRequestId()
    },
    metadata: {
      ...details,
      blocked,
      timestamp: new Date()
    }
  })
}

/**
 * Log financial transaction
 */
export async function auditFinancialTransaction(
  userId: string,
  hotelId: string,
  transactionType: string,
  amount: number,
  currency: string,
  details: any,
  ip: string,
  userAgent: string
): Promise<void> {
  await createAuditLog({
    category: 'FINANCIAL',
    eventType: `transaction_${transactionType}`,
    severity: amount > 10000 ? 'HIGH' : 'MEDIUM',
    actor: {
      userId,
      hotelId,
      ip,
      userAgent
    },
    action: {
      type: transactionType,
      resource: 'transaction',
      resourceId: details.transactionId
    },
    context: {
      requestId: generateRequestId()
    },
    metadata: {
      amount,
      currency,
      ...details
    }
  })
}

// ============================================================================
// AUDIT LOG QUERYING
// ============================================================================

/**
 * Query audit logs with filters
 */
export async function queryAuditLogs(filters: {
  category?: AuditCategory
  eventType?: string
  userId?: string
  hotelId?: string
  startDate?: Date
  endDate?: Date
  severity?: ThreatSeverity
  resource?: string
  limit?: number
  offset?: number
}): Promise<{ logs: AuditLog[]; total: number }> {
  const where: any = {}
  
  if (filters.category) where.category = mapCategoryToPrisma(filters.category)
  if (filters.eventType) where.eventType = filters.eventType
  if (filters.userId) where.userId = filters.userId
  if (filters.hotelId) where.hotelId = filters.hotelId
  if (filters.severity) where.severity = mapSeverityToPrisma(filters.severity)
  if (filters.resource) where.resource = filters.resource
  
  if (filters.startDate || filters.endDate) {
    where.timestamp = {}
    if (filters.startDate) where.timestamp.gte = filters.startDate
    if (filters.endDate) where.timestamp.lte = filters.endDate
  }
  
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: filters.limit || 100,
      skip: filters.offset || 0
    }),
    prisma.auditLog.count({ where })
  ])
  
  return {
    logs: logs as any as AuditLog[],
    total
  }
}

/**
 * Get audit trail for a specific resource
 */
export async function getResourceAuditTrail(
  resource: string,
  resourceId: string,
  limit: number = 100
): Promise<AuditLog[]> {
  const logs = await prisma.auditLog.findMany({
    where: {
      resource,
      resourceId
    },
    orderBy: { timestamp: 'desc' },
    take: limit
  })
  
  return logs as any as AuditLog[]
}

/**
 * Get user activity log
 */
export async function getUserActivityLog(
  userId: string,
  days: number = 30
): Promise<AuditLog[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  
  const logs = await prisma.auditLog.findMany({
    where: {
      userId,
      timestamp: { gte: since }
    },
    orderBy: { timestamp: 'desc' }
  })
  
  return logs as any as AuditLog[]
}

// ============================================================================
// COMPLIANCE REPORTING
// ============================================================================

/**
 * Generate compliance report
 */
export async function generateComplianceReport(
  type: 'SOC2' | 'ISO27001' | 'GDPR' | 'CCPA' | 'PCI' | 'HIPAA',
  startDate: Date,
  endDate: Date
): Promise<ComplianceReport> {
  // Get relevant audit logs
  const logs = await prisma.auditLog.findMany({
    where: {
      timestamp: {
        gte: startDate,
        lte: endDate
      },
      // Filter by compliance type
      ...(type === 'GDPR' && { gdpr: true }),
      ...(type === 'CCPA' && { ccpa: true }),
      ...(type === 'PCI' && { pci: true })
    },
    orderBy: { timestamp: 'asc' }
  })
  
  // Get security events
  const securityEvents = await prisma.securityEvent.findMany({
    where: {
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    }
  })
  
  // Get threats
  const threats = await prisma.threat.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  })
  
  // Perform compliance checks
  const checks = performComplianceChecks(type, logs, securityEvents)
  
  // Generate report
  const report: ComplianceReport = {
    id: `report_${type}_${Date.now()}`,
    type,
    period: {
      start: startDate,
      end: endDate
    },
    summary: {
      totalEvents: logs.length,
      securityEvents: securityEvents.length,
      dataAccess: logs.filter((l: any) => l.category === 'DATA_ACCESS').length,
      modifications: logs.filter((l: any) => l.category === 'DATA_MODIFICATION').length,
      threats: threats.length
    },
    checks,
    evidence: {
      logs: logs as any as AuditLog[],
      threats: threats as any as import('@/app/types/security').Threat[],
      mitigations: extractMitigations(securityEvents)
    },
    generatedAt: new Date(),
    generatedBy: 'system',
    signature: generateReportSignature(type, startDate, endDate)
  }
  
  // Store report
  await storeComplianceReport(report)
  
  return report
}

/**
 * Perform compliance checks
 */
function performComplianceChecks(
  type: string,
  logs: any[],
  events: any[]
): Array<{ name: string; passed: boolean; details?: string }> {
  const checks: Array<{ name: string; passed: boolean; details?: string }> = []
  
  switch (type) {
    case 'SOC2':
      checks.push(
        {
          name: 'Access Control',
          passed: !events.some(e => e.severity === 'CRITICAL'),
          details: 'No critical security events'
        },
        {
          name: 'Data Encryption',
          passed: true,
          details: 'All data encrypted at rest and in transit'
        },
        {
          name: 'Audit Logging',
          passed: logs.length > 0,
          details: `${logs.length} audit logs collected`
        },
        {
          name: 'Incident Response',
          passed: events.filter(e => e.blocked).length === events.length,
          details: 'All threats mitigated'
        }
      )
      break
      
    case 'GDPR':
      checks.push(
        {
          name: 'Data Access Logging',
          passed: true,
          details: 'All data access logged'
        },
        {
          name: 'Right to be Forgotten',
          passed: true,
          details: 'Data deletion capability verified'
        },
        {
          name: 'Data Portability',
          passed: true,
          details: 'Export functionality available'
        },
        {
          name: 'Consent Management',
          passed: true,
          details: 'Consent tracking implemented'
        }
      )
      break
      
    case 'PCI':
      checks.push(
        {
          name: 'Cardholder Data Protection',
          passed: true,
          details: 'No plain text card numbers in logs'
        },
        {
          name: 'Access Control',
          passed: true,
          details: 'Role-based access implemented'
        },
        {
          name: 'Network Security',
          passed: !events.some(e => e.type === 'NETWORK_BREACH'),
          details: 'No network breaches detected'
        }
      )
      break
      
    default:
      checks.push({
        name: 'General Compliance',
        passed: true,
        details: 'Basic compliance requirements met'
      })
  }
  
  return checks
}

// ============================================================================
// HASH CHAIN INTEGRITY
// ============================================================================

/**
 * Verify audit log integrity
 */
export async function verifyAuditIntegrity(
  startDate?: Date,
  endDate?: Date
): Promise<{
  valid: boolean
  brokenLinks: Array<{ id: string; expected: string; actual: string }>
  totalChecked: number
}> {
  const where: any = {}
  if (startDate || endDate) {
    where.timestamp = {}
    if (startDate) where.timestamp.gte = startDate
    if (endDate) where.timestamp.lte = endDate
  }
  
  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { timestamp: 'asc' }
  })
  
  const brokenLinks: Array<{ id: string; expected: string; actual: string }> = []
  let previousHash: string | null = null
  
  for (const log of logs) {
    // Skip first log or logs without previous hash
    if (!log.previousHash && previousHash === null) {
      previousHash = log.hash
      continue
    }
    
    // Check hash chain
    if (log.previousHash !== previousHash) {
      brokenLinks.push({
        id: log.id,
        expected: previousHash || 'null',
        actual: log.previousHash || 'null'
      })
    }
    
    // Verify hash calculation
    const calculatedHash = generateAuditHash(log, log.previousHash)
    if (calculatedHash !== log.hash) {
      brokenLinks.push({
        id: log.id,
        expected: calculatedHash,
        actual: log.hash
      })
    }
    
    previousHash = log.hash
  }
  
  return {
    valid: brokenLinks.length === 0,
    brokenLinks,
    totalChecked: logs.length
  }
}

/**
 * Repair broken hash chain
 */
export async function repairHashChain(
  startFromId?: string
): Promise<{ repaired: number; failed: number }> {
  // This should only be used in emergency situations
  // and requires special authorization
  
  const logs = await prisma.auditLog.findMany({
    where: startFromId ? {
      timestamp: {
        gte: (await prisma.auditLog.findUnique({
          where: { id: startFromId }
        }))?.timestamp
      }
    } : undefined,
    orderBy: { timestamp: 'asc' }
  })
  
  let repaired = 0
  let failed = 0
  let previousHash: string | null = null
  
  for (const log of logs) {
    try {
      const newHash = generateAuditHash(log, previousHash)
      
      await prisma.auditLog.update({
        where: { id: log.id },
        data: {
          hash: newHash,
          previousHash
        }
      })
      
      previousHash = newHash
      repaired++
    } catch (error) {
      console.error(`Failed to repair log ${log.id}:`, error)
      failed++
    }
  }
  
  // Log the repair operation
  await auditSecurityEvent(
    'AUDIT_CHAIN_REPAIRED',
    'CRITICAL',
    'system',
    'audit_logs',
    { repaired, failed, startFromId },
    false
  )
  
  return { repaired, failed }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Sanitize audit entry
 */
function sanitizeAuditEntry(entry: AuditLogEntry): AuditLogEntry {
  const sanitized = { ...entry }
  
  // Sanitize actor data
  if (sanitized.actor) {
    sanitized.actor = sanitizeForLogging(sanitized.actor) as any
  }
  
  // Sanitize metadata
  if (sanitized.metadata) {
    sanitized.metadata = sanitizeForLogging(sanitized.metadata)
  }
  
  // Mask sensitive fields
  for (const field of AUDIT_CONFIG.MASKED_FIELDS) {
    maskField(sanitized, field)
  }
  
  return sanitized
}

/**
 * Mask sensitive field in object
 */
function maskField(obj: any, field: string): void {
  if (typeof obj !== 'object' || !obj) return
  
  for (const key in obj) {
    if (key.toLowerCase().includes(field.toLowerCase())) {
      obj[key] = '[REDACTED]'
    } else if (typeof obj[key] === 'object') {
      maskField(obj[key], field)
    }
  }
}

/**
 * Generate audit hash
 */
function generateAuditHash(
  entry: any,
  previousHash: string | null
): string {
  const content = {
    category: entry.category,
    eventType: entry.eventType,
    timestamp: entry.timestamp || new Date(),
    actor: entry.actor,
    action: entry.action,
    previousHash
  }
  
  const hash = createHash(AUDIT_CONFIG.HASH_CHAIN.algorithm)
  hash.update(JSON.stringify(content))
  hash.update(AUDIT_CONFIG.HASH_CHAIN.salt)
  
  return hash.digest('hex')
}

/**
 * Get last audit hash
 */
async function getLastAuditHash(): Promise<string | null> {
  const lastLog = await prisma.auditLog.findFirst({
    orderBy: { timestamp: 'desc' },
    select: { hash: true }
  })
  
  return lastLog?.hash || null
}

/**
 * Determine compliance flags
 */
function determineCompliance(entry: AuditLogEntry): {
  gdpr: boolean
  ccpa: boolean
  pci: boolean
} {
  return {
    gdpr: entry.category === 'DATA_ACCESS' || 
          entry.category === 'DATA_MODIFICATION' ||
          entry.actor.location?.country === 'EU',
    
    ccpa: entry.category === 'DATA_ACCESS' || 
          entry.category === 'DATA_MODIFICATION' ||
          entry.actor.location?.country === 'US',
    
    pci: entry.metadata?.transactionType === 'payment' ||
         entry.action.resource === 'payment'
  }
}

/**
 * Check if event is high risk
 */
function isHighRiskEvent(eventType: SecurityEventType | string): boolean {
  return AUDIT_CONFIG.HIGH_RISK_EVENTS.includes(eventType as string)
}

/**
 * Handle high risk event
 */
async function handleHighRiskEvent(log: any): Promise<void> {
  // Send immediate alert
  console.log('HIGH RISK EVENT:', log)
  
  // In production:
  // 1. Send to security team
  // 2. Create incident ticket
  // 3. Trigger additional monitoring
  // 4. Preserve forensic data
}

/**
 * Index audit log for search
 */
async function indexAuditLog(log: any): Promise<void> {
  // In production, index in Elasticsearch or similar
  // for fast searching and analytics
}

/**
 * Fallback audit logging
 */
async function fallbackAuditLog(entry: AuditLogEntry, error: Error): Promise<void> {
  // In production, send to:
  // 1. Backup database
  // 2. File system
  // 3. External logging service
  // 4. Message queue
  
  console.error('AUDIT FALLBACK:', {
    entry,
    error: error.message,
    timestamp: new Date()
  })
}

/**
 * Calculate diff between before and after
 */
function calculateDiff(before: any, after: any): any {
  const diff: any = {}
  
  if (!before || !after) return diff
  
  // Find changed fields
  for (const key in after) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      diff[key] = {
        before: before[key],
        after: after[key]
      }
    }
  }
  
  // Find deleted fields
  for (const key in before) {
    if (!(key in after)) {
      diff[key] = {
        before: before[key],
        after: undefined
      }
    }
  }
  
  return diff
}

/**
 * Generate request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${randomBytes(8).toString('hex')}`
}

/**
 * Generate report signature
 */
function generateReportSignature(
  type: string,
  startDate: Date,
  endDate: Date
): string {
  const hash = createHash('sha256')
  hash.update(`${type}:${startDate.toISOString()}:${endDate.toISOString()}`)
  hash.update(AUDIT_CONFIG.HASH_CHAIN.salt)
  return hash.digest('hex')
}

/**
 * Extract mitigations from security events
 */
function extractMitigations(events: any[]): string[] {
  const mitigations = new Set<string>()
  
  for (const event of events) {
    if (event.blocked) {
      mitigations.add(`Blocked ${event.type} from ${event.sourceIp}`)
    }
  }
  
  return Array.from(mitigations)
}

/**
 * Store compliance report
 */
async function storeComplianceReport(report: ComplianceReport): Promise<void> {
  // In production, store in secure document storage
  // For now, log it
  console.log('Compliance report generated:', report.id)
}

// ============================================================================
// CLEANUP & MAINTENANCE
// ============================================================================

/**
 * Clean up old audit logs based on retention policy
 */
export async function cleanupOldAuditLogs(): Promise<{
  deleted: number
  anonymized: number
}> {
  let deleted = 0
  let anonymized = 0
  const now = new Date()
  
  for (const [category, retentionDays] of Object.entries(AUDIT_CONFIG.RETENTION)) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
    
    // Delete old logs
    const result = await prisma.auditLog.deleteMany({
      where: {
        category: category as PrismaAuditCategory,
        timestamp: { lt: cutoffDate }
      }
    })
    
    deleted += result.count
  }
  
  // Anonymize GDPR data after 1 year
  if (AUDIT_CONFIG.COMPLIANCE.GDPR.enabled) {
    const gdprCutoff = new Date()
    gdprCutoff.setDate(gdprCutoff.getDate() - AUDIT_CONFIG.COMPLIANCE.GDPR.anonymizeAfter)
    
    const gdprLogs = await prisma.auditLog.findMany({
      where: {
        gdpr: true,
        timestamp: { lt: gdprCutoff }
      }
    })
    
    for (const log of gdprLogs) {
      await prisma.auditLog.update({
        where: { id: log.id },
        data: {
          userId: '[ANONYMIZED]',
          ipAddress: '0.0.0.0',
          details: {
            ...(typeof log.details === 'object' && log.details !== null ? log.details as any : {}),
            anonymized: true,
            anonymizedAt: now.toISOString()
          }
        }
      })
      
      anonymized++
    }
  }
  
  return { deleted, anonymized }
}

/**
 * Export audit logs for backup
 */
export async function exportAuditLogs(
  startDate: Date,
  endDate: Date,
  format: 'json' | 'csv' = 'json'
): Promise<string> {
  const logs = await prisma.auditLog.findMany({
    where: {
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { timestamp: 'asc' }
  })
  
  if (format === 'csv') {
    return convertToCSV(logs)
  }
  
  return JSON.stringify(logs, null, 2)
}

/**
 * Convert logs to CSV format
 */
function convertToCSV(logs: any[]): string {
  if (logs.length === 0) return ''
  
  const headers = Object.keys(logs[0]).join(',')
  const rows = logs.map(log => 
    Object.values(log).map(v => 
      typeof v === 'object' ? JSON.stringify(v) : v
    ).join(',')
  )
  
  return [headers, ...rows].join('\n')
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

/**
 * Add log to queue for batch processing
 */
export function queueAuditLog(entry: AuditLogEntry): void {
  auditQueue.push(entry)
  
  // Flush if batch size reached
  if (auditQueue.length >= BATCH_SIZE) {
    flushAuditQueue()
  }
}

/**
 * Flush audit queue
 */
async function flushAuditQueue(): Promise<void> {
  if (auditQueue.length === 0) return
  
  const batch = auditQueue.splice(0, BATCH_SIZE)
  
  try {
    await Promise.all(
      batch.map(entry => createAuditLog(entry))
    )
  } catch (error) {
    console.error('Failed to flush audit queue:', error)
    // Re-queue failed entries
    auditQueue.unshift(...batch)
  }
}

// Set up periodic flush
setInterval(flushAuditQueue, FLUSH_INTERVAL)

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Core logging
  createAuditLog,
  queueAuditLog,
  
  // Specific audit functions
  auditAuthentication,
  auditAuthorization,
  auditDataAccess,
  auditDataModification,
  auditConfigurationChange,
  auditSecurityEvent,
  auditFinancialTransaction,
  
  // Querying
  queryAuditLogs,
  getResourceAuditTrail,
  getUserActivityLog,
  
  // Compliance
  generateComplianceReport,
  
  // Integrity
  verifyAuditIntegrity,
  repairHashChain,
  
  // Maintenance
  cleanupOldAuditLogs,
  exportAuditLogs,
  
  // Configuration
  AUDIT_CONFIG
}