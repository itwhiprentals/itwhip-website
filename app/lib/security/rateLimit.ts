/**
 * Rate Limiting System for ItWhip Platform
 * Implements tier-based throttling, burst protection, and auto-banning
 */

import prisma from '@/app/lib/database/prisma'
import { createHash } from 'crypto'
import { nanoid } from 'nanoid'
import { UserRole, CertificationTier } from '@/app/lib/dal/types'
import type {
  RateLimitStatus
} from '@/app/types/auth'
import type { RateLimitConfig } from '@/app/types/security'

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Rate Limit Configuration by Tier
 */
const RATE_LIMIT_CONFIG: Record<string, RateLimitConfig> = {
  // Anonymous users
  ANONYMOUS: {
    identifier: 'anonymous',
    tier: UserRole.ANONYMOUS,
    limits: {
      requests: 100,
      window: 3600, // 1 hour in seconds
      burst: 10     // Allow burst of 10 requests
    },
    endpoints: [
      { pattern: '/api/v3/auth/*', requests: 10, window: 3600 },
      { pattern: '/api/v3/hotels/search', requests: 20, window: 3600 },
      { pattern: '/api/v3/calculate/*', requests: 50, window: 3600 }
    ],
    penalties: {
      softLimit: 80,   // Warn at 80%
      hardLimit: 100,  // Block at 100%
      banDuration: 900 // 15 minutes ban
    }
  },
  
  // Claimed hotels
  CLAIMED: {
    identifier: 'claimed',
    tier: UserRole.CLAIMED,
    limits: {
      requests: 500,
      window: 3600,
      burst: 25
    },
    endpoints: [
      { pattern: '/api/v3/bookings/*', requests: 100, window: 3600 },
      { pattern: '/api/v3/guests/*', requests: 100, window: 3600 },
      { pattern: '/api/v3/dashboard/*', requests: 200, window: 3600 }
    ],
    penalties: {
      softLimit: 80,
      hardLimit: 100,
      banDuration: 1800 // 30 minutes
    }
  },
  
  // Starter tier (TU-3-C)
  STARTER: {
    identifier: 'starter',
    tier: UserRole.STARTER,
    limits: {
      requests: 1000,
      window: 3600,
      burst: 50
    },
    endpoints: [
      { pattern: '/api/v3/rides/*', requests: 200, window: 3600 },
      { pattern: '/api/v3/revenue/*', requests: 100, window: 3600 },
      { pattern: '/api/v3/reports/*', requests: 50, window: 3600 }
    ],
    penalties: {
      softLimit: 85,
      hardLimit: 100,
      banDuration: 600 // 10 minutes
    }
  },
  
  // Business tier (TU-2-B)
  BUSINESS: {
    identifier: 'business',
    tier: UserRole.BUSINESS,
    limits: {
      requests: 5000,
      window: 3600,
      burst: 250
    },
    endpoints: [
      { pattern: '/api/v3/rides/*', requests: 1000, window: 3600 },
      { pattern: '/api/v3/compliance/*', requests: 200, window: 3600 },
      { pattern: '/api/v3/drivers/*', requests: 500, window: 3600 }
    ],
    penalties: {
      softLimit: 90,
      hardLimit: 100,
      banDuration: 300 // 5 minutes
    }
  },
  
  // Enterprise tier (TU-1-A)
  ENTERPRISE: {
    identifier: 'enterprise',
    tier: UserRole.ENTERPRISE,
    limits: {
      requests: 10000,
      window: 3600,
      burst: 500
    },
    endpoints: [
      { pattern: '/api/v3/*', requests: 10000, window: 3600 }
    ],
    penalties: {
      softLimit: 95,
      hardLimit: 100,
      banDuration: 60 // 1 minute
    }
  },
  
  // Admin (unlimited but tracked)
  ADMIN: {
    identifier: 'admin',
    tier: UserRole.ADMIN,
    limits: {
      requests: 100000,
      window: 3600,
      burst: 10000
    },
    endpoints: [],
    penalties: {
      softLimit: 100,
      hardLimit: 100,
      banDuration: 0
    }
  }
}

/**
 * IP-based rate limits (for DDoS protection)
 */
const IP_RATE_LIMITS = {
  GLOBAL: {
    requests: 1000,
    window: 60, // 1 minute
    burst: 100
  },
  SUSPICIOUS: {
    requests: 10,
    window: 60,
    burst: 5
  },
  BLOCKED: {
    requests: 0,
    window: 86400, // 24 hours
    burst: 0
  }
}

/**
 * In-memory stores (use Redis in production)
 */
const requestCounters = new Map<string, RateLimitEntry>()
const bannedIdentifiers = new Map<string, number>() // identifier -> unban timestamp
const suspiciousIPs = new Set<string>()

interface RateLimitEntry {
  count: number
  windowStart: number
  burstCount: number
  lastRequest: number
}

// ============================================================================
// RATE LIMITING CORE
// ============================================================================

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  identifier: string,
  role: UserRole = UserRole.ANONYMOUS,
  endpoint?: string,
  ip?: string
): Promise<RateLimitStatus> {
  // Check if banned
  if (await isBanned(identifier)) {
    const unbanTime = bannedIdentifiers.get(identifier) || Date.now() + 900000
    return {
      limit: 0,
      remaining: 0,
      reset: new Date(unbanTime),
      tier: CertificationTier.NONE,
      status: 'banned',
      message: 'Rate limit exceeded - temporarily banned'
    }
  }
  
  // Check IP rate limit first (DDoS protection)
  if (ip) {
    const ipStatus = await checkIPRateLimit(ip)
    if (ipStatus.status === 'exceeded' || ipStatus.status === 'banned') {
      return ipStatus
    }
  }
  
  // Get configuration for role
  const config = RATE_LIMIT_CONFIG[role] || RATE_LIMIT_CONFIG.ANONYMOUS
  
  // Check endpoint-specific limits
  if (endpoint) {
    const endpointLimit = getEndpointLimit(config, endpoint)
    if (endpointLimit) {
      const endpointStatus = await checkEndpointRateLimit(
        identifier,
        endpoint,
        endpointLimit
      )
      if (endpointStatus.status === 'exceeded') {
        return endpointStatus
      }
    }
  }
  
  // Check global rate limit
  const now = Date.now()
  const windowMs = config.limits.window * 1000
  
  // Get or create counter
  let entry = requestCounters.get(identifier)
  
  if (!entry || now - entry.windowStart > windowMs) {
    // New window
    entry = {
      count: 1,
      windowStart: now,
      burstCount: 1,
      lastRequest: now
    }
    requestCounters.set(identifier, entry)
  } else {
    // Existing window
    entry.count++
    
    // Check burst
    if (now - entry.lastRequest < 1000) { // Within 1 second
      entry.burstCount++
      if (entry.burstCount > config.limits.burst!) {
        // Burst limit exceeded
        await handleRateLimitExceeded(identifier, config)
        return {
          limit: config.limits.requests,
          remaining: 0,
          reset: new Date(entry.windowStart + windowMs),
          tier: getTierFromRole(role),
          status: 'exceeded',
          message: 'Burst limit exceeded'
        }
      }
    } else {
      entry.burstCount = 1
    }
    
    entry.lastRequest = now
  }
  
  // Calculate status
  const percentUsed = (entry.count / config.limits.requests) * 100
  let status: 'ok' | 'warning' | 'exceeded' | 'banned' = 'ok'
  let message: string | undefined
  
  if (entry.count > config.limits.requests) {
    status = 'exceeded'
    message = 'Rate limit exceeded'
    await handleRateLimitExceeded(identifier, config)
  } else if (percentUsed >= config.penalties.softLimit) {
    status = 'warning'
    message = `Rate limit warning: ${percentUsed.toFixed(0)}% used`
  }
  
  // Store in database for persistence
  await persistRateLimit(identifier, entry, config)
  
  return {
    limit: config.limits.requests,
    remaining: Math.max(0, config.limits.requests - entry.count),
    reset: new Date(entry.windowStart + windowMs),
    tier: getTierFromRole(role),
    status,
    message,
    headers: {
      'X-RateLimit-Limit': config.limits.requests.toString(),
      'X-RateLimit-Remaining': Math.max(0, config.limits.requests - entry.count).toString(),
      'X-RateLimit-Reset': new Date(entry.windowStart + windowMs).toISOString(),
      'X-RateLimit-Burst': config.limits.burst?.toString() || '0',
      ...(status === 'exceeded' && {
        'Retry-After': Math.ceil((entry.windowStart + windowMs - now) / 1000).toString()
      })
    }
  }
}

/**
 * Check IP-based rate limit
 */
async function checkIPRateLimit(ip: string): Promise<RateLimitStatus> {
  const identifier = `ip:${ip}`
  const now = Date.now()
  
  // Check if IP is blocked
  if (suspiciousIPs.has(ip)) {
    const config = IP_RATE_LIMITS.SUSPICIOUS
    const windowMs = config.window * 1000
    
    let entry = requestCounters.get(identifier)
    if (!entry || now - entry.windowStart > windowMs) {
      entry = {
        count: 1,
        windowStart: now,
        burstCount: 1,
        lastRequest: now
      }
      requestCounters.set(identifier, entry)
    } else {
      entry.count++
    }
    
    if (entry.count > config.requests) {
      // Upgrade to blocked
      await blockIP(ip)
      return {
        limit: 0,
        remaining: 0,
        reset: new Date(now + IP_RATE_LIMITS.BLOCKED.window * 1000),
        tier: CertificationTier.NONE,
        status: 'banned',
        message: 'IP blocked due to suspicious activity'
      }
    }
  }
  
  // Normal IP rate limiting
  const config = IP_RATE_LIMITS.GLOBAL
  const windowMs = config.window * 1000
  
  let entry = requestCounters.get(identifier)
  if (!entry || now - entry.windowStart > windowMs) {
    entry = {
      count: 1,
      windowStart: now,
      burstCount: 1,
      lastRequest: now
    }
    requestCounters.set(identifier, entry)
  } else {
    entry.count++
    
    // Check burst
    if (now - entry.lastRequest < 100) { // Within 100ms
      entry.burstCount++
      if (entry.burstCount > config.burst) {
        suspiciousIPs.add(ip)
        return {
          limit: config.requests,
          remaining: 0,
          reset: new Date(entry.windowStart + windowMs),
          tier: CertificationTier.NONE,
          status: 'exceeded',
          message: 'IP rate limit exceeded - marked as suspicious'
        }
      }
    }
  }
  
  if (entry.count > config.requests) {
    suspiciousIPs.add(ip)
    return {
      limit: config.requests,
      remaining: 0,
      reset: new Date(entry.windowStart + windowMs),
      tier: CertificationTier.NONE,
      status: 'exceeded',
      message: 'IP rate limit exceeded'
    }
  }
  
  return {
    limit: config.requests,
    remaining: config.requests - entry.count,
    reset: new Date(entry.windowStart + windowMs),
    tier: CertificationTier.NONE,
    status: 'ok'
  }
}

/**
 * Check endpoint-specific rate limit
 */
async function checkEndpointRateLimit(
  identifier: string,
  endpoint: string,
  limit: { requests: number; window: number }
): Promise<RateLimitStatus> {
  const key = `${identifier}:${endpoint}`
  const now = Date.now()
  const windowMs = limit.window * 1000
  
  let entry = requestCounters.get(key)
  if (!entry || now - entry.windowStart > windowMs) {
    entry = {
      count: 1,
      windowStart: now,
      burstCount: 1,
      lastRequest: now
    }
    requestCounters.set(key, entry)
  } else {
    entry.count++
  }
  
  if (entry.count > limit.requests) {
    return {
      limit: limit.requests,
      remaining: 0,
      reset: new Date(entry.windowStart + windowMs),
      tier: CertificationTier.NONE,
      status: 'exceeded',
      message: `Endpoint rate limit exceeded for ${endpoint}`
    }
  }
  
  return {
    limit: limit.requests,
    remaining: limit.requests - entry.count,
    reset: new Date(entry.windowStart + windowMs),
    tier: CertificationTier.NONE,
    status: 'ok'
  }
}

// ============================================================================
// RATE LIMIT MANAGEMENT
// ============================================================================

/**
 * Reset rate limit for an identifier
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  requestCounters.delete(identifier)
  
  // Reset in database
  await prisma.rateLimit.deleteMany({
    where: { identifier }
  })
}

/**
 * Ban an identifier
 */
export async function banIdentifier(
  identifier: string,
  duration: number = 900 // 15 minutes default
): Promise<void> {
  const unbanTime = Date.now() + (duration * 1000)
  bannedIdentifiers.set(identifier, unbanTime)
  
  // Store in database
  await prisma.rateLimit.upsert({
    where: { identifier },
    create: {
      identifier,
      tier: 'ANONYMOUS',
      requests: 0,
      window: duration,
      currentRequests: 0,
      windowStart: new Date(),
      exceeded: true,
      banned: true,
      bannedUntil: new Date(unbanTime)
    },
    update: {
      banned: true,
      bannedUntil: new Date(unbanTime)
    }
  })
  
  // Log security event
  await logRateLimitEvent('ban', identifier, duration)
}

/**
 * Unban an identifier
 */
export async function unbanIdentifier(identifier: string): Promise<void> {
  bannedIdentifiers.delete(identifier)
  
  await prisma.rateLimit.update({
    where: { identifier },
    data: {
      banned: false,
      bannedUntil: null
    }
  })
  
  await logRateLimitEvent('unban', identifier)
}

/**
 * Check if identifier is banned
 */
async function isBanned(identifier: string): Promise<boolean> {
  // Check memory first
  const unbanTime = bannedIdentifiers.get(identifier)
  if (unbanTime) {
    if (Date.now() < unbanTime) {
      return true
    } else {
      // Auto-unban
      bannedIdentifiers.delete(identifier)
    }
  }
  
  // Check database
  const record = await prisma.rateLimit.findUnique({
    where: { identifier }
  })
  
  if (record?.banned && record.bannedUntil) {
    if (new Date() < record.bannedUntil) {
      // Cache it
      bannedIdentifiers.set(identifier, record.bannedUntil.getTime())
      return true
    } else {
      // Auto-unban
      await unbanIdentifier(identifier)
    }
  }
  
  return false
}

/**
 * Block an IP address
 */
async function blockIP(ip: string): Promise<void> {
  suspiciousIPs.add(ip)
  await banIdentifier(`ip:${ip}`, IP_RATE_LIMITS.BLOCKED.window)
  
  // Log security threat
  await prisma.securityEvent.create({
    data: {
      id: nanoid(),
      type: 'IP_BLOCKED',
      severity: 'HIGH',
      sourceIp: ip,
      userAgent: 'unknown',
      message: `IP ${ip} blocked due to suspicious activity`,
      action: 'ip_blocked',
      blocked: true
    }
  })
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get endpoint-specific limit
 */
function getEndpointLimit(
  config: RateLimitConfig,
  endpoint: string
): { requests: number; window: number } | null {
  if (!config.endpoints) return null
  
  for (const rule of config.endpoints) {
    if (matchEndpoint(endpoint, rule.pattern)) {
      return {
        requests: rule.requests,
        window: rule.window
      }
    }
  }
  
  return null
}

/**
 * Match endpoint against pattern
 */
function matchEndpoint(endpoint: string, pattern: string): boolean {
  // Convert pattern to regex
  const regexPattern = pattern
    .replace(/\*/g, '.*')
    .replace(/\//g, '\\/')
  
  const regex = new RegExp(`^${regexPattern}$`)
  return regex.test(endpoint)
}

/**
 * Handle rate limit exceeded
 */
async function handleRateLimitExceeded(
  identifier: string,
  config: RateLimitConfig
): Promise<void> {
  // Check if should ban
  const entry = requestCounters.get(identifier)
  if (!entry) return
  
  const percentUsed = (entry.count / config.limits.requests) * 100
  if (percentUsed >= config.penalties.hardLimit && config.penalties.banDuration) {
    await banIdentifier(identifier, config.penalties.banDuration)
  }
  
  // Log event
  await logRateLimitEvent('exceeded', identifier, entry.count)
}

/**
 * Get tier from role
 */
function getTierFromRole(role: UserRole): CertificationTier {
  switch (role) {
    case UserRole.STARTER:
      return CertificationTier.TU_3_C
    case UserRole.BUSINESS:
      return CertificationTier.TU_2_B
    case UserRole.ENTERPRISE:
      return CertificationTier.TU_1_A
    default:
      return CertificationTier.NONE
  }
}

/**
 * Persist rate limit to database
 */
async function persistRateLimit(
  identifier: string,
  entry: RateLimitEntry,
  config: RateLimitConfig
): Promise<void> {
  try {
    await prisma.rateLimit.upsert({
      where: { identifier },
      create: {
        identifier,
        tier: config.tier.toString(),
        requests: config.limits.requests,
        window: config.limits.window,
        currentRequests: entry.count,
        windowStart: new Date(entry.windowStart),
        exceeded: entry.count > config.limits.requests,
        banned: false
      },
      update: {
        currentRequests: entry.count,
        exceeded: entry.count > config.limits.requests
      }
    })
  } catch (error) {
    // Don't fail the request if persistence fails
    console.error('Failed to persist rate limit:', error)
  }
}

/**
 * Log rate limit event
 */
async function logRateLimitEvent(
  event: string,
  identifier: string,
  details?: any
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        category: 'SECURITY',
        eventType: `rate_limit_${event}`,
        severity: event === 'ban' ? 'HIGH' : 'MEDIUM',
        ipAddress: identifier.startsWith('ip:') ? identifier.slice(3) : '0.0.0.0',
        userAgent: 'system',
        action: event,
        resource: 'rate_limit',
        resourceId: identifier,
        details: JSON.stringify({ event, identifier, details }),
        hash: createHash('sha256').update(`${event}:${identifier}:${Date.now()}`).digest('hex'),
        previousHash: null
      }
    })
  } catch (error) {
    console.error('Failed to log rate limit event:', error)
  }
}

// ============================================================================
// CLEANUP & MAINTENANCE
// ============================================================================

/**
 * Clean up expired entries
 */
export async function cleanupExpiredEntries(): Promise<number> {
  const now = Date.now()
  let cleaned = 0
  
  // Clean memory entries
  for (const [key, entry] of requestCounters.entries()) {
    const config = RATE_LIMIT_CONFIG[key.split(':')[0]] || RATE_LIMIT_CONFIG.ANONYMOUS
    const windowMs = config.limits.window * 1000
    
    if (now - entry.windowStart > windowMs * 2) { // Keep for 2 windows
      requestCounters.delete(key)
      cleaned++
    }
  }
  
  // Clean banned list
  for (const [identifier, unbanTime] of bannedIdentifiers.entries()) {
    if (now > unbanTime) {
      bannedIdentifiers.delete(identifier)
      cleaned++
    }
  }
  
  // Clean database
  const result = await prisma.rateLimit.deleteMany({
    where: {
      OR: [
        {
          windowStart: {
            lt: new Date(now - 7200000) // 2 hours old
          }
        },
        {
          banned: true,
          bannedUntil: {
            lt: new Date()
          }
        }
      ]
    }
  })
  
  cleaned += result.count
  
  return cleaned
}

/**
 * Get rate limit statistics
 */
export async function getRateLimitStats(): Promise<{
  activeIdentifiers: number
  bannedIdentifiers: number
  suspiciousIPs: number
  topOffenders: Array<{ identifier: string; count: number }>
}> {
  const topOffenders: Array<{ identifier: string; count: number }> = []
  
  // Get top offenders from memory
  for (const [identifier, entry] of requestCounters.entries()) {
    if (entry.count > 100) { // Arbitrary threshold
      topOffenders.push({ identifier, count: entry.count })
    }
  }
  
  // Sort by count
  topOffenders.sort((a, b) => b.count - a.count)
  
  return {
    activeIdentifiers: requestCounters.size,
    bannedIdentifiers: bannedIdentifiers.size,
    suspiciousIPs: suspiciousIPs.size,
    topOffenders: topOffenders.slice(0, 10)
  }
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Create rate limiting middleware
 */
export function createRateLimitMiddleware(options?: {
  keyExtractor?: (req: any) => string
  roleExtractor?: (req: any) => UserRole
  skip?: (req: any) => boolean
  onLimitReached?: (req: any, res: any) => void
}) {
  return async (req: any, res: any, next: any) => {
    // Check if should skip
    if (options?.skip && options.skip(req)) {
      return next()
    }
    
    // Extract identifier
    const identifier = options?.keyExtractor
      ? options.keyExtractor(req)
      : req.user?.id || req.ip || 'anonymous'
    
    // Extract role
    const role = options?.roleExtractor
      ? options.roleExtractor(req)
      : req.user?.role || UserRole.ANONYMOUS
    
    // Check rate limit
    const status = await checkRateLimit(
      identifier,
      role,
      req.path,
      req.ip
    )
    
    // Add headers
    if (status.headers) {
      Object.entries(status.headers).forEach(([key, value]) => {
        res.setHeader(key, value)
      })
    }
    
    // Check if exceeded
    if (status.status === 'exceeded' || status.status === 'banned') {
      if (options?.onLimitReached) {
        return options.onLimitReached(req, res)
      }
      
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: status.message,
        retryAfter: Math.ceil((status.reset.getTime() - Date.now()) / 1000)
      })
    }
    
    // Add rate limit info to request
    req.rateLimit = status
    
    next()
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Core functions
  checkRateLimit,
  resetRateLimit,
  banIdentifier,
  unbanIdentifier,
  
  // Maintenance
  cleanupExpiredEntries,
  getRateLimitStats,
  
  // Middleware
  createRateLimitMiddleware,
  
  // Configuration
  RATE_LIMIT_CONFIG,
  IP_RATE_LIMITS
}