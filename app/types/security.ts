/**
 * Security Types for ItWhip Platform
 * Defines security events, threats, audit logs, and protection mechanisms
 */

import { UserRole, Permission, CertificationTier } from './auth'

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

/**
 * Security event types
 */
export enum SecurityEventType {
  // Authentication events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  PASSWORD_RESET = 'password_reset',
  TOKEN_REFRESH = 'token_refresh',
  TOKEN_EXPIRED = 'token_expired',
  TOKEN_BLACKLISTED = 'token_blacklisted',
  
  // Authorization events
  PERMISSION_DENIED = 'permission_denied',
  ROLE_CHANGED = 'role_changed',
  ACCESS_GRANTED = 'access_granted',
  ACCESS_REVOKED = 'access_revoked',
  
  // Security threats
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  CSRF_ATTEMPT = 'csrf_attempt',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  
  // Data events
  DATA_ACCESSED = 'data_accessed',
  DATA_MODIFIED = 'data_modified',
  DATA_DELETED = 'data_deleted',
  DATA_EXPORTED = 'data_exported',
  
  // API events
  API_KEY_CREATED = 'api_key_created',
  API_KEY_REVOKED = 'api_key_revoked',
  API_RATE_LIMIT = 'api_rate_limit',
  API_UNAUTHORIZED = 'api_unauthorized',
  
  // System events
  SYSTEM_ERROR = 'system_error',
  DATABASE_ERROR = 'database_error',
  INTEGRATION_ERROR = 'integration_error',
  ENCRYPTION_ERROR = 'encryption_error'
}

/**
 * Threat severity levels
 */
export enum ThreatSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Threat status
 */
export enum ThreatStatus {
  DETECTED = 'detected',
  INVESTIGATING = 'investigating',
  MITIGATED = 'mitigated',
  BLOCKED = 'blocked',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive'
}

/**
 * Audit log categories
 */
export enum AuditCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  CONFIGURATION = 'configuration',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  FINANCIAL = 'financial'
}

/**
 * Encryption methods
 */
export enum EncryptionMethod {
  AES_256_GCM = 'aes-256-gcm',
  RSA_4096 = 'rsa-4096',
  BCRYPT = 'bcrypt',
  HMAC_SHA256 = 'hmac-sha256',
  PBKDF2 = 'pbkdf2'
}

/**
 * Attack types
 */
export enum AttackType {
  BRUTE_FORCE = 'brute_force',
  DICTIONARY = 'dictionary',
  SQL_INJECTION = 'sql_injection',
  XSS = 'xss',
  CSRF = 'csrf',
  DDoS = 'ddos',
  MAN_IN_MIDDLE = 'man_in_middle',
  SESSION_HIJACK = 'session_hijack',
  CREDENTIAL_STUFFING = 'credential_stuffing',
  BOT = 'bot'
}

// ============================================================================
// SECURITY EVENT INTERFACES
// ============================================================================

/**
 * Base security event
 */
export interface SecurityEvent {
  id: string
  type: SecurityEventType
  severity: ThreatSeverity
  timestamp: Date
  
  // Actor information
  actor: {
    userId?: string
    hotelId?: string
    role?: UserRole
    ip: string
    userAgent: string
    country?: string
    city?: string
  }
  
  // Target information
  target?: {
    resource: string          // What was accessed
    resourceId?: string
    action: string           // What they tried to do
    permissions?: Permission[]
  }
  
  // Event details
  details: {
    message: string
    data?: Record<string, any>
    stackTrace?: string
  }
  
  // Response
  response: {
    action: 'allow' | 'block' | 'challenge' | 'log'
    reason?: string
  }
}

/**
 * Threat detection
 */
export interface Threat {
  id: string
  type: AttackType
  severity: ThreatSeverity
  status: ThreatStatus
  
  // Threat details
  source: {
    ip: string
    ips?: string[]           // Multiple IPs if distributed
    country?: string
    asn?: string             // Autonomous System Number
    reputation?: number      // IP reputation score
  }
  
  // Attack details
  attack: {
    method: string
    target: string
    payload?: string         // Sanitized attack payload
    attempts: number
    firstSeen: Date
    lastSeen: Date
  }
  
  // Detection
  detection: {
    method: 'signature' | 'anomaly' | 'ml' | 'manual'
    confidence: number       // 0-100
    rules?: string[]        // Rules that triggered
  }
  
  // Mitigation
  mitigation: {
    automated: boolean
    actions: string[]       // Actions taken
    blockedUntil?: Date
  }
  
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// AUDIT LOG INTERFACES
// ============================================================================

/**
 * Audit log entry
 */
export interface AuditLog {
  id: string
  category: AuditCategory
  eventType: SecurityEventType
  
  // Who
  actor: {
    userId?: string
    hotelId?: string
    email?: string
    role?: UserRole
    ip: string
    location?: {
      country: string
      city: string
      coordinates?: { lat: number; lng: number }
    }
  }
  
  // What
  action: {
    type: string            // e.g., 'create', 'read', 'update', 'delete'
    resource: string        // e.g., 'booking', 'ride', 'hotel'
    resourceId?: string
    permissions?: Permission[]
  }
  
  // When
  timestamp: Date
  
  // Where
  context: {
    userAgent: string
    sessionId?: string
    requestId: string
    endpoint?: string
    method?: string
  }
  
  // Changes
  changes?: {
    before?: Record<string, any>
    after?: Record<string, any>
    diff?: Record<string, any>
  }
  
  // Compliance
  compliance?: {
    gdpr?: boolean
    ccpa?: boolean
    pci?: boolean
    hipaa?: boolean
  }
  
  // Immutable
  hash: string              // SHA-256 of entry for integrity
  previousHash?: string     // Chain entries together
}

/**
 * Compliance report
 */
export interface ComplianceReport {
  id: string
  type: 'SOC2' | 'ISO27001' | 'GDPR' | 'CCPA' | 'PCI' | 'HIPAA'
  period: {
    start: Date
    end: Date
  }
  
  // Audit summary
  summary: {
    totalEvents: number
    securityEvents: number
    dataAccess: number
    modifications: number
    threats: number
  }
  
  // Compliance checks
  checks: {
    name: string
    passed: boolean
    details?: string
  }[]
  
  // Evidence
  evidence: {
    logs: AuditLog[]
    threats: Threat[]
    mitigations: string[]
  }
  
  generatedAt: Date
  generatedBy: string
  signature: string         // Digital signature
}

// ============================================================================
// RATE LIMITING INTERFACES
// ============================================================================

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  identifier: string        // IP, userId, apiKey
  tier: UserRole | CertificationTier
  
  limits: {
    requests: number
    window: number          // Seconds
    burst?: number         // Allow burst
  }
  
  // Different limits per endpoint
  endpoints?: {
    pattern: string        // e.g., '/api/v3/rides/*'
    requests: number
    window: number
  }[]
  
  // Penalties
  penalties: {
    softLimit: number      // Warn at this %
    hardLimit: number      // Block at this %
    banDuration?: number   // Seconds to ban
  }
}

/**
 * Rate limit status
 */
export interface RateLimitStatus {
  identifier: string
  
  current: {
    requests: number
    window: number
    remaining: number
    reset: Date
  }
  
  limits: {
    tier: string
    max: number
    window: number
  }
  
  status: 'ok' | 'warning' | 'exceeded' | 'banned'
  message?: string
  
  // Headers to return
  headers: {
    'X-RateLimit-Limit': string
    'X-RateLimit-Remaining': string
    'X-RateLimit-Reset': string
    'Retry-After'?: string
  }
}

// ============================================================================
// ENCRYPTION & SIGNING INTERFACES
// ============================================================================

/**
 * Encrypted data wrapper
 */
export interface EncryptedData {
  method: EncryptionMethod
  data: string              // Base64 encoded
  iv?: string              // Initialization vector
  salt?: string            // For key derivation
  tag?: string             // Authentication tag
  keyId?: string           // Which key was used
  encryptedAt: Date
}

/**
 * Request signature
 */
export interface RequestSignature {
  method: 'HMAC-SHA256' | 'RSA-SHA256' | 'ECDSA'
  signature: string
  timestamp: number
  nonce: string            // Prevent replay
  keyId: string
  
  // What was signed
  payload: {
    method: string         // HTTP method
    path: string
    query?: string
    body?: string         // Body hash
    headers?: string[]    // Which headers included
  }
}

/**
 * Key management
 */
export interface SecurityKey {
  id: string
  type: 'signing' | 'encryption' | 'api'
  algorithm: string
  
  key: {
    public?: string
    private?: string       // Encrypted!
    secret?: string       // For symmetric
  }
  
  metadata: {
    created: Date
    expires?: Date
    rotated?: Date
    lastUsed?: Date
    usage: number
  }
  
  status: 'active' | 'rotating' | 'expired' | 'revoked'
}

// ============================================================================
// ANOMALY DETECTION INTERFACES
// ============================================================================

/**
 * Anomaly detection rule
 */
export interface AnomalyRule {
  id: string
  name: string
  description: string
  
  // Conditions
  conditions: {
    type: 'threshold' | 'pattern' | 'ml' | 'geo' | 'velocity'
    field: string
    operator: 'gt' | 'lt' | 'eq' | 'contains' | 'matches'
    value: any
    window?: number        // Time window in seconds
  }[]
  
  // Action
  action: {
    type: 'log' | 'alert' | 'block' | 'challenge'
    severity: ThreatSeverity
    notification?: string[]  // Who to notify
  }
  
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Anomaly detection result
 */
export interface Anomaly {
  id: string
  ruleId: string
  ruleName: string
  
  detection: {
    timestamp: Date
    confidence: number      // 0-100
    score: number          // Anomaly score
    baseline: any          // Normal behavior
    observed: any          // What we saw
    deviation: number      // % deviation
  }
  
  context: {
    userId?: string
    hotelId?: string
    ip: string
    endpoint?: string
    userAgent: string
  }
  
  response: {
    action: 'logged' | 'alerted' | 'blocked'
    notified?: string[]
    mitigated: boolean
  }
}

// ============================================================================
// MONITORING INTERFACES
// ============================================================================

/**
 * Security metrics
 */
export interface SecurityMetrics {
  period: 'hour' | 'day' | 'week' | 'month'
  
  threats: {
    total: number
    blocked: number
    investigating: number
    byType: Record<AttackType, number>
    bySeverity: Record<ThreatSeverity, number>
  }
  
  authentication: {
    successful: number
    failed: number
    mfa: number
    passwordResets: number
  }
  
  rateLimit: {
    requests: number
    limited: number
    banned: number
  }
  
  api: {
    calls: number
    unauthorized: number
    errors: number
    latency: number        // Average ms
  }
  
  compliance: {
    auditLogs: number
    dataAccess: number
    modifications: number
    exports: number
  }
  
  performance: {
    encryptionTime: number  // Average ms
    decryptionTime: number
    signatureTime: number
    verificationTime: number
  }
  
  calculatedAt: Date
}

/**
 * Security alert
 */
export interface SecurityAlert {
  id: string
  type: SecurityEventType
  severity: ThreatSeverity
  
  alert: {
    title: string
    message: string
    details?: Record<string, any>
    source: string
    timestamp: Date
  }
  
  // Notification
  notification: {
    channels: ('email' | 'sms' | 'slack' | 'webhook')[]
    recipients: string[]
    sent: boolean
    sentAt?: Date
  }
  
  // Response
  response: {
    required: boolean
    assignedTo?: string
    status: 'new' | 'acknowledged' | 'investigating' | 'resolved'
    resolvedAt?: Date
    notes?: string
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate threat severity based on multiple factors
 */
export function calculateThreatSeverity(
  type: AttackType,
  attempts: number,
  timeWindow: number
): ThreatSeverity {
  // Critical threats
  if (type === AttackType.SQL_INJECTION || type === AttackType.CREDENTIAL_STUFFING) {
    return ThreatSeverity.CRITICAL
  }
  
  // High frequency attacks
  const attacksPerMinute = attempts / (timeWindow / 60)
  if (attacksPerMinute > 10) return ThreatSeverity.HIGH
  if (attacksPerMinute > 5) return ThreatSeverity.MEDIUM
  
  return ThreatSeverity.LOW
}

/**
 * Check if IP is suspicious
 */
export function isSuspiciousIP(ip: string, reputation?: number): boolean {
  // Check reputation score
  if (reputation && reputation < 25) return true
  
  // Check for known bad patterns
  const suspiciousPatterns = [
    /^10\./,           // Private network
    /^192\.168\./,     // Private network
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // Private network
    /^127\./,          // Localhost
  ]
  
  return suspiciousPatterns.some(pattern => pattern.test(ip))
}

/**
 * Generate audit hash for integrity
 */
export function generateAuditHash(entry: Omit<AuditLog, 'hash'>): string {
  const content = JSON.stringify({
    ...entry,
    timestamp: entry.timestamp.toISOString()
  })
  
  // In production, use crypto.createHash('sha256')
  return Buffer.from(content).toString('base64').substring(0, 64)
}

/**
 * Check if rate limit exceeded
 */
export function isRateLimitExceeded(status: RateLimitStatus): boolean {
  return status.status === 'exceeded' || status.status === 'banned'
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Security configuration
 */
export const SECURITY_CONFIG = {
  // Token settings
  TOKEN: {
    ACCESS_EXPIRY: 900,        // 15 minutes
    REFRESH_EXPIRY: 604800,    // 7 days
    PREVIEW_EXPIRY: 86400,     // 24 hours
  },
  
  // Rate limits by tier
  RATE_LIMITS: {
    ANONYMOUS: { requests: 100, window: 3600 },      // 100/hour
    CLAIMED: { requests: 500, window: 3600 },        // 500/hour
    STARTER: { requests: 1000, window: 3600 },       // 1000/hour
    BUSINESS: { requests: 5000, window: 3600 },      // 5000/hour
    ENTERPRISE: { requests: 10000, window: 3600 },   // 10000/hour
  },
  
  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 12,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
    BCRYPT_ROUNDS: 12,
  },
  
  // Session settings
  SESSION: {
    MAX_CONCURRENT: 5,
    IDLE_TIMEOUT: 1800,        // 30 minutes
    ABSOLUTE_TIMEOUT: 86400,   // 24 hours
  },
  
  // Threat thresholds
  THREATS: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 900,     // 15 minutes
    SUSPICIOUS_VELOCITY: 100,  // Requests per minute
    GEO_VELOCITY: 500,         // Miles per hour
  }
} as const

/**
 * Attack patterns for detection
 */
export const ATTACK_PATTERNS = {
  SQL_INJECTION: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER)\b)/i,
    /(\b(OR|AND)\b\s*\d+\s*=\s*\d+)/i,
    /(--|\*|\/\*|\*\/)/,
    /(\bEXEC(\s|\()+)/i,
  ],
  XSS: [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
  ],
  PATH_TRAVERSAL: [
    /\.\.\//g,
    /\.\.%2[fF]/g,
    /%2e%2e%2f/gi,
  ],
} as const

export default {
  SecurityEventType,
  ThreatSeverity,
  ThreatStatus,
  AuditCategory,
  EncryptionMethod,
  AttackType,
  SECURITY_CONFIG,
  ATTACK_PATTERNS
}