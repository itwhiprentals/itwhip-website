// app/lib/monitoring/uptime-tracker.ts
// Real uptime tracking — persists health checks to DB for accurate historical data

import prisma from '@/app/lib/database/prisma'

interface HealthCheckResult {
  timestamp: Date
  status: 'up' | 'down' | 'degraded'
  responseTime: number
  services: {
    database: boolean
    api: boolean
    auth: boolean
  }
  error?: string
}

// In-memory buffer for quick access (also persisted to DB)
const healthCheckBuffer: HealthCheckResult[] = []
const MAX_BUFFER_SIZE = 100
let lastKnownStatus: HealthCheckResult | null = null

/**
 * Record a health check result — stores in memory and persists to DB
 */
export function recordHealthCheck(result: HealthCheckResult): void {
  lastKnownStatus = result
  healthCheckBuffer.push(result)
  if (healthCheckBuffer.length > MAX_BUFFER_SIZE) {
    healthCheckBuffer.shift()
  }

  // Persist to DB (fire and forget)
  prisma.healthCheck.create({
    data: {
      status: result.status === 'up' ? 'healthy' : result.status === 'degraded' ? 'degraded' : 'down',
      responseMs: Math.round(result.responseTime),
      dbStatus: result.services.database ? 'healthy' : 'down',
      dbLatencyMs: Math.round(result.responseTime),
      details: { services: result.services, error: result.error },
    }
  }).catch(() => {}) // Don't fail if DB write fails
}

/**
 * Get current system status
 */
export function getCurrentStatus(): HealthCheckResult | null {
  return lastKnownStatus
}

/**
 * Perform a health check right now
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  const services = { database: false, api: true, auth: false }
  let status: 'up' | 'down' | 'degraded' = 'up'
  let error: string | undefined

  try {
    await prisma.$queryRaw`SELECT 1`
    services.database = true
  } catch (e) {
    services.database = false
    status = 'degraded'
    error = 'Database connection failed'
  }

  try {
    await prisma.user.count({ take: 1 })
    services.auth = true
  } catch (e) {
    services.auth = false
    if (status === 'up') status = 'degraded'
    error = error ? `${error}; Auth service unavailable` : 'Auth service unavailable'
  }

  const responseTime = Date.now() - startTime

  if (!services.database) {
    status = 'down'
  } else if (responseTime > 5000) {
    status = 'degraded'
  }

  const result: HealthCheckResult = { timestamp: new Date(), status, responseTime, services, error }
  recordHealthCheck(result)
  return result
}

/**
 * Calculate recent uptime from in-memory buffer
 */
export function calculateRecentUptime(): {
  uptimePercent: number
  checksAnalyzed: number
  lastDowntime: Date | null
  status: 'up' | 'down' | 'degraded'
} {
  if (healthCheckBuffer.length === 0) {
    return {
      uptimePercent: lastKnownStatus?.status === 'up' ? 100 : 0,
      checksAnalyzed: 0,
      lastDowntime: null,
      status: lastKnownStatus?.status || 'up'
    }
  }

  let upCount = 0
  let lastDowntime: Date | null = null

  for (const check of healthCheckBuffer) {
    if (check.status === 'up') upCount++
    else lastDowntime = check.timestamp
  }

  return {
    uptimePercent: Math.round((upCount / healthCheckBuffer.length) * 10000) / 100,
    checksAnalyzed: healthCheckBuffer.length,
    lastDowntime,
    status: lastKnownStatus?.status || 'up'
  }
}

/**
 * Get uptime for a specific time range — queries DB for accurate historical data
 */
export async function getUptimeForRange(range: '1h' | '24h' | '7d' | '30d'): Promise<{
  uptimePercent: number
  totalChecks: number
  downChecks: number
  degradedChecks: number
  avgResponseTime: number | null
  source: 'realtime' | 'database' | 'estimated'
}> {
  const now = new Date()
  const rangeMs = { '1h': 3600000, '24h': 86400000, '7d': 604800000, '30d': 2592000000 }
  const startDate = new Date(now.getTime() - rangeMs[range])

  // For 1h, prefer in-memory buffer
  if (range === '1h' && healthCheckBuffer.length > 0) {
    const recentChecks = healthCheckBuffer.filter(c => c.timestamp >= startDate)
    if (recentChecks.length > 0) {
      const upCount = recentChecks.filter(c => c.status === 'up').length
      const degradedCount = recentChecks.filter(c => c.status === 'degraded').length
      const downCount = recentChecks.filter(c => c.status === 'down').length
      const avgResponseTime = recentChecks.reduce((a, c) => a + c.responseTime, 0) / recentChecks.length

      return {
        uptimePercent: Math.round((upCount / recentChecks.length) * 10000) / 100,
        totalChecks: recentChecks.length,
        downChecks: downCount,
        degradedChecks: degradedCount,
        avgResponseTime: Math.round(avgResponseTime),
        source: 'realtime'
      }
    }
  }

  // Query DB for historical data
  try {
    const checks = await prisma.healthCheck.findMany({
      where: { checkedAt: { gte: startDate } },
      select: { status: true, responseMs: true },
    })

    if (checks.length > 0) {
      const healthy = checks.filter(c => c.status === 'healthy').length
      const degraded = checks.filter(c => c.status === 'degraded').length
      const down = checks.filter(c => c.status === 'down').length
      const avgMs = Math.round(checks.reduce((a, c) => a + c.responseMs, 0) / checks.length)

      return {
        uptimePercent: Math.round((healthy / checks.length) * 10000) / 100,
        totalChecks: checks.length,
        downChecks: down,
        degradedChecks: degraded,
        avgResponseTime: avgMs,
        source: 'database'
      }
    }

    // No DB data yet — estimate from page views
    const pageViews = await prisma.pageView.count({ where: { timestamp: { gte: startDate } } })
    return {
      uptimePercent: pageViews > 0 ? 99.9 : 0,
      totalChecks: 0,
      downChecks: 0,
      degradedChecks: 0,
      avgResponseTime: null,
      source: 'estimated'
    }
  } catch (error) {
    console.error('[Uptime] Error:', error)
    return { uptimePercent: 0, totalChecks: 0, downChecks: 1, degradedChecks: 0, avgResponseTime: null, source: 'estimated' }
  }
}

/**
 * Initialize periodic health checks
 */
export function initUptimeTracking(intervalMs: number = 30000): NodeJS.Timeout {
  performHealthCheck().catch(console.error)
  return setInterval(() => { performHealthCheck().catch(console.error) }, intervalMs)
}

/**
 * Clean up old health checks (keep 30 days)
 */
export async function cleanupOldHealthChecks(): Promise<number> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const { count } = await prisma.healthCheck.deleteMany({ where: { checkedAt: { lt: thirtyDaysAgo } } })
  return count
}
