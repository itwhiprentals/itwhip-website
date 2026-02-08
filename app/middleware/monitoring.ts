/**
 * Monitoring Middleware for ItWhip Platform
 * Tracks performance, logs requests, and collects metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { trackMetric, incrementCounter } from '@/app/lib/monitoring/metrics'
import { logger } from '@/app/lib/monitoring/logger'
import { createAlert } from '@/app/lib/monitoring/alerts'
import crypto from 'crypto'

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  responseTime: {
    excellent: 100,    // ms
    good: 500,
    acceptable: 1000,
    poor: 3000
  },
  databaseTime: {
    excellent: 50,
    good: 200,
    acceptable: 500,
    poor: 1000
  },
  errorRate: {
    excellent: 0.1,    // percentage
    good: 1,
    acceptable: 5,
    poor: 10
  }
}

// Metrics configuration
const METRICS_CONFIG = {
  // Endpoints to track in detail
  criticalEndpoints: [
    '/api/v3/auth/login',
    '/api/v3/bookings',
    '/api/v3/rides',
    '/api/v3/revenue/withdraw',
    '/api/v3/payments'
  ],
  
  // Slow query threshold
  slowQueryThreshold: 1000, // ms
  
  // Error rate window
  errorRateWindow: 60000, // 1 minute
  
  // Sampling rate for detailed logging (0-100)
  samplingRate: process.env.NODE_ENV === 'production' ? 10 : 100
}

// In-memory metrics store (use Redis/TimescaleDB in production)
const metricsStore = {
  requests: new Map<string, number>(),
  errors: new Map<string, number>(),
  responseTimes: new Map<string, number[]>(),
  statusCodes: new Map<number, number>(),
  userAgents: new Map<string, number>(),
  endpoints: new Map<string, {
    count: number
    totalTime: number
    errors: number
    minTime: number
    maxTime: number
  }>()
}

// Request tracking
const activeRequests = new Map<string, {
  startTime: number
  endpoint: string
  method: string
  userId?: string
  ip: string
}>()

/**
 * Generate request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`
}

/**
 * Get client IP from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  
  if (forwarded) return forwarded.split(',')[0].trim()
  if (real) return real.trim()
  
  return '127.0.0.1'
}

/**
 * Parse user agent for device info
 */
function parseUserAgent(userAgent: string): {
  browser: string
  os: string
  device: string
  bot: boolean
} {
  const ua = userAgent.toLowerCase()
  
  // Check for bots
  const botPatterns = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget']
  const isBot = botPatterns.some(pattern => ua.includes(pattern))
  
  // Parse browser
  let browser = 'unknown'
  if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('chrome')) browser = 'Chrome'
  else if (ua.includes('safari')) browser = 'Safari'
  else if (ua.includes('edge')) browser = 'Edge'
  else if (ua.includes('opera')) browser = 'Opera'
  
  // Parse OS
  let os = 'unknown'
  if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('mac')) os = 'macOS'
  else if (ua.includes('linux')) os = 'Linux'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('ios') || ua.includes('iphone')) os = 'iOS'
  
  // Parse device
  let device = 'desktop'
  if (ua.includes('mobile')) device = 'mobile'
  else if (ua.includes('tablet')) device = 'tablet'
  
  return { browser, os, device, bot: isBot }
}

/**
 * Calculate response time percentiles
 */
function calculatePercentiles(times: number[]): {
  p50: number
  p95: number
  p99: number
} {
  if (times.length === 0) {
    return { p50: 0, p95: 0, p99: 0 }
  }
  
  const sorted = [...times].sort((a, b) => a - b)
  const p50Index = Math.floor(sorted.length * 0.5)
  const p95Index = Math.floor(sorted.length * 0.95)
  const p99Index = Math.floor(sorted.length * 0.99)
  
  return {
    p50: sorted[p50Index] || 0,
    p95: sorted[p95Index] || sorted[sorted.length - 1],
    p99: sorted[p99Index] || sorted[sorted.length - 1]
  }
}

/**
 * Should sample this request for detailed logging
 */
function shouldSample(): boolean {
  return Math.random() * 100 < METRICS_CONFIG.samplingRate
}

/**
 * Track endpoint metrics
 */
function trackEndpointMetrics(
  endpoint: string,
  method: string,
  responseTime: number,
  statusCode: number
) {
  const key = `${method}:${endpoint}`
  const current = metricsStore.endpoints.get(key) || {
    count: 0,
    totalTime: 0,
    errors: 0,
    minTime: Infinity,
    maxTime: 0
  }
  
  current.count++
  current.totalTime += responseTime
  current.minTime = Math.min(current.minTime, responseTime)
  current.maxTime = Math.max(current.maxTime, responseTime)
  
  if (statusCode >= 400) {
    current.errors++
  }
  
  metricsStore.endpoints.set(key, current)
  
  // Track response times for percentile calculation
  const times = metricsStore.responseTimes.get(key) || []
  times.push(responseTime)
  
  // Keep only last 1000 samples
  if (times.length > 1000) {
    times.shift()
  }
  
  metricsStore.responseTimes.set(key, times)
}

/**
 * Check for performance issues
 */
async function checkPerformanceThresholds(
  endpoint: string,
  responseTime: number,
  statusCode: number
) {
  // Check response time
  if (responseTime > PERFORMANCE_THRESHOLDS.responseTime.poor) {
    await createAlert({
      type: 'performance' as any,
      severity: 'HIGH' as any,
      title: 'Slow Response Time',
      message: `Endpoint ${endpoint} took ${responseTime}ms to respond`,
      details: {
        endpoint,
        responseTime,
        threshold: PERFORMANCE_THRESHOLDS.responseTime.poor
      }
    })
  }
  
  // Check error rate
  const endpointMetrics = metricsStore.endpoints.get(endpoint)
  if (endpointMetrics) {
    const errorRate = (endpointMetrics.errors / endpointMetrics.count) * 100
    
    if (errorRate > PERFORMANCE_THRESHOLDS.errorRate.poor) {
      await createAlert({
        type: 'error_rate' as any,
        severity: 'CRITICAL' as any,
        title: 'High Error Rate',
        message: `Endpoint ${endpoint} has ${errorRate.toFixed(2)}% error rate`,
        details: {
          endpoint,
          errorRate,
          errors: endpointMetrics.errors,
          total: endpointMetrics.count
        }
      })
    }
  }
}

/**
 * Main monitoring middleware
 */
export async function monitoringMiddleware(
  request: NextRequest,
  options?: {
    skipLogging?: boolean
    skipMetrics?: boolean
    skipPerformanceCheck?: boolean
    customTags?: Record<string, string>
  }
): Promise<NextResponse | null> {
  const requestId = request.headers.get('x-request-id') || generateRequestId()
  const startTime = Date.now()
  const method = request.method
  const pathname = request.nextUrl.pathname
  const clientIp = getClientIp(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const userId = request.headers.get('x-user-id')
  const hotelId = request.headers.get('x-hotel-id')
  
  // Store active request
  activeRequests.set(requestId, {
    startTime,
    endpoint: pathname,
    method,
    userId: userId || undefined,
    ip: clientIp
  })
  
  // Parse user agent
  const deviceInfo = parseUserAgent(userAgent)
  
  // Determine if we should sample this request
  const sample = shouldSample()
  
  // Store original methods for potential restoration in catch
  let originalJson = NextResponse.json
  let originalNext = NextResponse.next

  try {
    // Log request start
    if (!options?.skipLogging && sample) {
      logger.info('Request started', {
        requestId,
        method,
        path: pathname,
        ip: clientIp,
        userId,
        hotelId,
        userAgent: deviceInfo,
        query: Object.fromEntries(request.nextUrl.searchParams),
        headers: {
          'content-type': request.headers.get('content-type'),
          'content-length': request.headers.get('content-length'),
          'x-api-key': request.headers.get('x-api-key') ? 'present' : 'absent',
          'authorization': request.headers.get('authorization') ? 'present' : 'absent'
        }
      })
    }
    
    // Track request count
    if (!options?.skipMetrics) {
      incrementCounter('api.requests.total', {
        method,
        endpoint: pathname,
        ...options?.customTags
      })
      
      // Track by user agent
      const uaCount = metricsStore.userAgents.get(deviceInfo.browser) || 0
      metricsStore.userAgents.set(deviceInfo.browser, uaCount + 1)
      
      // Track bot traffic
      if (deviceInfo.bot) {
        incrementCounter('api.requests.bots', {
          endpoint: pathname
        })
      }
    }
    
    // Create response handler to track metrics
    originalJson = NextResponse.json
    originalNext = NextResponse.next
    
    // Override response methods to capture metrics
    ;(NextResponse as any).json = function(
      body: any,
      init?: ResponseInit
    ): NextResponse {
      const response = originalJson.call(this, body, init)
      const endTime = Date.now()
      const responseTime = endTime - startTime
      const statusCode = init?.status || 200
      
      // Track metrics
      if (!options?.skipMetrics) {
        trackEndpointMetrics(pathname, method, responseTime, statusCode)
        
        // Track status codes
        const statusCount = metricsStore.statusCodes.get(statusCode) || 0
        metricsStore.statusCodes.set(statusCode, statusCount + 1)
        
        // Track response time metric
        trackMetric('api.response_time', responseTime, {
          method,
          endpoint: pathname,
          status: statusCode.toString(),
          ...options?.customTags
        })
        
        // Track error metrics
        if (statusCode >= 400) {
          incrementCounter('api.errors.total', {
            method,
            endpoint: pathname,
            status: statusCode.toString(),
            ...options?.customTags
          })
        }
      }
      
      // Log response
      if (!options?.skipLogging && sample) {
        const logLevelValue: string = statusCode >= 500 ? 'error' :
                        statusCode >= 400 ? 'warn' : 'info';

        (logger as any)[logLevelValue]('Request completed', {
          requestId,
          method,
          path: pathname,
          statusCode,
          responseTime,
          ip: clientIp,
          userId,
          hotelId,
          responseSize: JSON.stringify(body).length,
          error: statusCode >= 400 ? body.error : undefined
        })
      }
      
      // Check performance thresholds
      if (!options?.skipPerformanceCheck) {
        checkPerformanceThresholds(pathname, responseTime, statusCode)
      }
      
      // Add monitoring headers
      response.headers.set('X-Request-ID', requestId)
      response.headers.set('X-Response-Time', `${responseTime}ms`)
      
      // Clean up active request
      activeRequests.delete(requestId)
      
      return response
    }
    
    ;(NextResponse as any).next = function(init?: any): NextResponse {
      const response = originalNext.call(this, init)
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      // Track successful pass-through
      if (!options?.skipMetrics) {
        trackEndpointMetrics(pathname, method, responseTime, 200)
        
        trackMetric('api.response_time', responseTime, {
          method,
          endpoint: pathname,
          status: '200',
          ...options?.customTags
        })
      }
      
      // Log pass-through
      if (!options?.skipLogging && sample) {
        logger.info('Request passed through', {
          requestId,
          method,
          path: pathname,
          responseTime,
          ip: clientIp,
          userId,
          hotelId
        })
      }
      
      // Add monitoring headers
      response.headers.set('X-Request-ID', requestId)
      response.headers.set('X-Response-Time', `${responseTime}ms`)
      
      // Clean up active request
      activeRequests.delete(requestId)
      
      return response
    }
    
    // Continue with the request
    return null
    
  } catch (error) {
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    // Log error
    logger.error('Monitoring middleware error', {
      requestId,
      method,
      path: pathname,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : 'Unknown error',
      responseTime,
      ip: clientIp,
      userId,
      hotelId
    })
    
    // Track error metrics
    if (!options?.skipMetrics) {
      incrementCounter('api.errors.middleware', {
        endpoint: pathname,
        ...options?.customTags
      })
    }
    
    // Clean up active request
    activeRequests.delete(requestId)
    
    // Restore original methods
    ;(NextResponse as any).json = originalJson
    ;(NextResponse as any).next = originalNext
    
    // Don't block the request due to monitoring error
    return null
  }
}

/**
 * Get current metrics summary
 */
export function getMetricsSummary(): {
  requests: Record<string, number>
  errors: Record<string, number>
  averageResponseTime: Record<string, number>
  percentiles: Record<string, { p50: number; p95: number; p99: number }>
  statusCodes: Record<number, number>
  userAgents: Record<string, number>
  activeRequests: number
} {
  const summary: any = {
    requests: {},
    errors: {},
    averageResponseTime: {},
    percentiles: {},
    statusCodes: Object.fromEntries(metricsStore.statusCodes),
    userAgents: Object.fromEntries(metricsStore.userAgents),
    activeRequests: activeRequests.size
  }
  
  // Calculate endpoint metrics
  for (const [key, metrics] of metricsStore.endpoints.entries()) {
    summary.requests[key] = metrics.count
    summary.errors[key] = metrics.errors
    summary.averageResponseTime[key] = metrics.count > 0 
      ? Math.round(metrics.totalTime / metrics.count) 
      : 0
    
    const times = metricsStore.responseTimes.get(key)
    if (times && times.length > 0) {
      summary.percentiles[key] = calculatePercentiles(times)
    }
  }
  
  return summary
}

/**
 * Get active requests
 */
export function getActiveRequests(): Array<{
  requestId: string
  duration: number
  endpoint: string
  method: string
  userId?: string
  ip: string
}> {
  const now = Date.now()
  const requests: any[] = []
  
  for (const [requestId, info] of activeRequests.entries()) {
    requests.push({
      requestId,
      duration: now - info.startTime,
      ...info
    })
  }
  
  // Sort by duration (longest first)
  return requests.sort((a, b) => b.duration - a.duration)
}

/**
 * Reset metrics (for testing)
 */
export function resetMetrics(): void {
  metricsStore.requests.clear()
  metricsStore.errors.clear()
  metricsStore.responseTimes.clear()
  metricsStore.statusCodes.clear()
  metricsStore.userAgents.clear()
  metricsStore.endpoints.clear()
  activeRequests.clear()
}

/**
 * Health check function
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  metrics: any
  issues: string[]
}> {
  const issues: string[] = []
  const metrics = getMetricsSummary()
  
  // Check active requests
  if (metrics.activeRequests > 100) {
    issues.push(`High number of active requests: ${metrics.activeRequests}`)
  }
  
  // Check error rates
  for (const [endpoint, errors] of Object.entries(metrics.errors)) {
    const requests = (metrics.requests as any)[endpoint] || 0
    if (requests > 0) {
      const errorRate = ((errors as number) / requests) * 100
      if (errorRate > 10) {
        issues.push(`High error rate for ${endpoint}: ${errorRate.toFixed(2)}%`)
      }
    }
  }
  
  // Check response times
  for (const [endpoint, avgTime] of Object.entries(metrics.averageResponseTime)) {
    if (avgTime > 3000) {
      issues.push(`Slow response time for ${endpoint}: ${avgTime}ms`)
    }
  }
  
  // Determine overall status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
  if (issues.length > 5) {
    status = 'unhealthy'
  } else if (issues.length > 0) {
    status = 'degraded'
  }
  
  return { status, metrics, issues }
}

export default monitoringMiddleware