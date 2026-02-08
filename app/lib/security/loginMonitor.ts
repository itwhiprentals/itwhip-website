// app/lib/security/loginMonitor.ts
// Security monitoring for login attempts - tracks failed logins and detects brute force attacks

import { prisma } from '@/app/lib/database/prisma'
import { randomBytes } from 'crypto'
import { getLocationFromIp } from './geolocation'

type LoginFailureReason =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_NOT_FOUND'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_PENDING'
  | 'ACCOUNT_INACTIVE'
  | 'PASSWORD_NOT_SET'
  | 'INVALID_ACCOUNT_TYPE'
  | 'RATE_LIMITED'
  | 'BLOCKED_IP'

type LoginSource = 'partner' | 'host' | 'fleet' | 'guest' | 'admin' | 'mobile_host'

interface LoginAttemptDetails {
  email: string
  source: LoginSource
  reason: LoginFailureReason
  ip: string
  userAgent: string
  metadata?: Record<string, any>
  headers?: Headers
}

/**
 * Log a failed login attempt
 * Creates a SecurityEvent record and checks for brute force patterns
 */
export async function logFailedLogin(details: LoginAttemptDetails): Promise<{
  blocked: boolean
  attemptsInLastHour: number
  message?: string
}> {
  const { email, source, reason, ip, userAgent, metadata, headers } = details

  try {
    // Get location from IP (pass headers for Vercel geo data)
    const location = await getLocationFromIp(ip, headers)

    // Create SecurityEvent record
    await prisma.securityEvent.create({
      data: {
        id: `sec_${Date.now()}_${randomBytes(8).toString('hex')}`,
        type: 'LOGIN_FAILED',
        severity: 'MEDIUM',
        sourceIp: ip,
        userAgent: userAgent,
        targetResource: 'authentication',
        targetId: email.toLowerCase(),
        message: `Failed login attempt for ${email} via ${source}: ${reason}`,
        details: JSON.stringify({
          email: email.toLowerCase(),
          source,
          reason,
          metadata
        }),
        action: 'login_attempt',
        blocked: false,
        country: location.country,
        city: location.city,
        timestamp: new Date()
      }
    })

    // Check for brute force - count attempts from this IP in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const attemptsFromIp = await prisma.securityEvent.count({
      where: {
        type: 'LOGIN_FAILED',
        sourceIp: ip,
        timestamp: { gte: oneHourAgo }
      }
    })

    // Check for attempts on this specific email
    const attemptsOnEmail = await prisma.securityEvent.count({
      where: {
        type: 'LOGIN_FAILED',
        targetId: email.toLowerCase(),
        timestamp: { gte: oneHourAgo }
      }
    })

    // Brute force detection thresholds
    const IP_THRESHOLD = 10 // More than 10 attempts from same IP in an hour
    const EMAIL_THRESHOLD = 5 // More than 5 attempts on same email in an hour

    let blocked = false
    let message: string | undefined

    // Check if this looks like a brute force attack
    if (attemptsFromIp >= IP_THRESHOLD) {
      blocked = true
      message = 'Too many login attempts from this IP address'

      // Log the brute force detection
      await prisma.securityEvent.create({
        data: {
          id: `sec_${Date.now()}_${randomBytes(8).toString('hex')}`,
          type: 'BRUTE_FORCE_DETECTED',
          severity: 'HIGH',
          sourceIp: ip,
          userAgent: userAgent,
          targetResource: 'authentication',
          message: `Brute force attack detected: ${attemptsFromIp} attempts from IP ${ip}`,
          details: JSON.stringify({
            attemptsInLastHour: attemptsFromIp,
            targetEmails: 'multiple',
            source
          }),
          action: 'brute_force_block',
          blocked: true,
          country: location.country,
          city: location.city,
          timestamp: new Date()
        }
      })
    } else if (attemptsOnEmail >= EMAIL_THRESHOLD) {
      blocked = true
      message = 'Too many login attempts for this account'

      // Log targeted attack detection
      await prisma.securityEvent.create({
        data: {
          id: `sec_${Date.now()}_${randomBytes(8).toString('hex')}`,
          type: 'ACCOUNT_TARGETED',
          severity: 'HIGH',
          sourceIp: ip,
          userAgent: userAgent,
          targetResource: 'authentication',
          targetId: email.toLowerCase(),
          message: `Account targeted: ${attemptsOnEmail} failed attempts on ${email}`,
          details: JSON.stringify({
            email: email.toLowerCase(),
            attemptsInLastHour: attemptsOnEmail,
            source
          }),
          action: 'account_lockout',
          blocked: true,
          country: location.country,
          city: location.city,
          timestamp: new Date()
        }
      })
    }

    return {
      blocked,
      attemptsInLastHour: Math.max(attemptsFromIp, attemptsOnEmail),
      message
    }

  } catch (error) {
    console.error('[LoginMonitor] Error logging failed login:', error)
    // Don't fail the login flow if logging fails
    return { blocked: false, attemptsInLastHour: 0 }
  }
}

/**
 * Log a successful login
 */
export async function logSuccessfulLogin(details: {
  userId: string
  email: string
  source: LoginSource
  ip: string
  userAgent: string
  headers?: Headers
}): Promise<void> {
  const { userId, email, source, ip, userAgent, headers } = details

  try {
    // Get location from IP (pass headers for Vercel geo data)
    const location = await getLocationFromIp(ip, headers)

    await prisma.securityEvent.create({
      data: {
        id: `sec_${Date.now()}_${randomBytes(8).toString('hex')}`,
        type: 'LOGIN_SUCCESS',
        severity: 'LOW',
        sourceIp: ip,
        userAgent: userAgent,
        targetResource: 'authentication',
        targetId: userId,
        message: `Successful login for ${email} via ${source}`,
        details: JSON.stringify({
          email: email.toLowerCase(),
          source,
          userId
        }),
        action: 'login_success',
        blocked: false,
        country: location.country,
        city: location.city,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('[LoginMonitor] Error logging successful login:', error)
  }
}

/**
 * Check if an IP is currently blocked due to too many attempts
 */
export async function isIpBlocked(ip: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  const recentAttempts = await prisma.securityEvent.count({
    where: {
      type: 'LOGIN_FAILED',
      sourceIp: ip,
      timestamp: { gte: oneHourAgo }
    }
  })

  return recentAttempts >= 10
}

/**
 * Check if an account is currently locked due to too many attempts
 */
export async function isAccountLocked(email: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  const recentAttempts = await prisma.securityEvent.count({
    where: {
      type: 'LOGIN_FAILED',
      targetId: email.toLowerCase(),
      timestamp: { gte: oneHourAgo }
    }
  })

  return recentAttempts >= 5
}

/**
 * Get security statistics for monitoring dashboard
 */
export async function getSecurityStats(hoursBack: number = 24): Promise<{
  totalFailedLogins: number
  uniqueIps: number
  uniqueEmails: number
  bruteForceAttempts: number
  accountsTargeted: number
  blockedAttempts: number
  bySource: Record<string, number>
  byReason: Record<string, number>
  recentEvents: Array<{
    id: string
    type: string
    severity: string
    sourceIp: string
    message: string
    timestamp: Date
  }>
}> {
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000)

  const [
    failedLogins,
    bruteForce,
    targeted,
    blocked,
    recentEvents
  ] = await Promise.all([
    // Get all failed logins
    prisma.securityEvent.findMany({
      where: {
        type: 'LOGIN_FAILED',
        timestamp: { gte: since }
      },
      select: {
        sourceIp: true,
        targetId: true,
        details: true
      }
    }),
    // Count brute force detections
    prisma.securityEvent.count({
      where: {
        type: 'BRUTE_FORCE_DETECTED',
        timestamp: { gte: since }
      }
    }),
    // Count targeted account attacks
    prisma.securityEvent.count({
      where: {
        type: 'ACCOUNT_TARGETED',
        timestamp: { gte: since }
      }
    }),
    // Count blocked attempts
    prisma.securityEvent.count({
      where: {
        blocked: true,
        timestamp: { gte: since }
      }
    }),
    // Get recent security events for display
    prisma.securityEvent.findMany({
      where: {
        timestamp: { gte: since },
        severity: { in: ['MEDIUM', 'HIGH', 'CRITICAL'] }
      },
      orderBy: { timestamp: 'desc' },
      take: 20,
      select: {
        id: true,
        type: true,
        severity: true,
        sourceIp: true,
        message: true,
        timestamp: true
      }
    })
  ])

  // Calculate unique counts
  const uniqueIps = new Set(failedLogins.map(f => f.sourceIp)).size
  const uniqueEmails = new Set(failedLogins.map(f => f.targetId)).size

  // Count by source and reason
  const bySource: Record<string, number> = {}
  const byReason: Record<string, number> = {}

  for (const event of failedLogins) {
    try {
      const details = JSON.parse(event.details || '{}')
      const source = details.source || 'unknown'
      const reason = details.reason || 'unknown'

      bySource[source] = (bySource[source] || 0) + 1
      byReason[reason] = (byReason[reason] || 0) + 1
    } catch {
      // Skip malformed entries
    }
  }

  return {
    totalFailedLogins: failedLogins.length,
    uniqueIps,
    uniqueEmails,
    bruteForceAttempts: bruteForce,
    accountsTargeted: targeted,
    blockedAttempts: blocked,
    bySource,
    byReason,
    recentEvents
  }
}
