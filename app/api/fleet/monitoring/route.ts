// app/api/fleet/monitoring/route.ts
// Comprehensive monitoring API for fleet dashboard
// Returns security events, alerts, and system health metrics

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { getUptimeForRange, performHealthCheck } from '@/app/lib/monitoring/uptime-tracker'

// Valid time ranges for uptime calculation
type TimeRange = '1h' | '24h' | '7d' | '30d'

function isValidTimeRange(range: string): range is TimeRange {
  return ['1h', '24h', '7d', '30d'].includes(range)
}

// Calculate P95 from an array of numbers
function calculateP95(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil(sorted.length * 0.95) - 1
  return sorted[Math.max(0, index)]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '24h'
    const dbCheckStart = Date.now()

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (range) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    // Run all queries in parallel
    const [
      securityEvents,
      securityEventCounts,
      activeAlerts,
      recentAlerts,
      pageViewStats,
      errorLogs,
      loadTimeData,
      totalRequests,
      failedRequests
    ] = await Promise.all([
      // Recent security events
      prisma.securityEvent.findMany({
        where: { timestamp: { gte: startDate } },
        orderBy: { timestamp: 'desc' },
        take: 50,
        select: {
          id: true,
          type: true,
          severity: true,
          sourceIp: true,
          country: true,
          city: true,
          message: true,
          action: true,
          blocked: true,
          timestamp: true
        }
      }),

      // Security event counts by type
      prisma.securityEvent.groupBy({
        by: ['type'],
        where: { timestamp: { gte: startDate } },
        _count: { type: true }
      }),

      // Active alerts (not resolved)
      prisma.monitoringAlert.findMany({
        where: { status: { in: ['active', 'acknowledged'] } },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),

      // Recent resolved alerts
      prisma.monitoringAlert.findMany({
        where: {
          status: { in: ['resolved', 'false_positive'] },
          resolvedAt: { gte: startDate }
        },
        orderBy: { resolvedAt: 'desc' },
        take: 10
      }),

      // Page view stats for performance insight
      prisma.pageView.aggregate({
        where: { timestamp: { gte: startDate } },
        _count: true,
        _avg: { loadTime: true }
      }),

      // Check for any error patterns in security events
      prisma.securityEvent.count({
        where: {
          timestamp: { gte: startDate },
          severity: { in: ['HIGH', 'CRITICAL'] }
        }
      }),

      // Get load time data for P95 calculation
      prisma.pageView.findMany({
        where: {
          timestamp: { gte: startDate },
          loadTime: { not: null }
        },
        select: { loadTime: true },
        take: 1000 // Sample size for P95
      }),

      // Total requests (security events + page views) for error rate
      prisma.pageView.count({
        where: { timestamp: { gte: startDate } }
      }),

      // Failed/blocked requests
      prisma.securityEvent.count({
        where: {
          timestamp: { gte: startDate },
          blocked: true
        }
      })
    ])

    // Calculate summary statistics
    const securitySummary = {
      totalEvents: securityEvents.length,
      byType: securityEventCounts.reduce((acc, item) => {
        acc[item.type] = item._count.type
        return acc
      }, {} as Record<string, number>),
      criticalCount: securityEvents.filter(e => e.severity === 'CRITICAL').length,
      highCount: securityEvents.filter(e => e.severity === 'HIGH').length,
      blockedCount: securityEvents.filter(e => e.blocked).length
    }

    // Format security events for display
    const formattedEvents = securityEvents.map(event => ({
      id: event.id,
      type: event.type,
      severity: event.severity,
      ip: event.sourceIp,
      location: event.city && event.country
        ? `${event.city}, ${event.country}`
        : event.country || 'Unknown',
      message: event.message,
      action: event.action,
      blocked: event.blocked,
      timestamp: event.timestamp
    }))

    // Calculate DB latency from the time it took to run queries
    const dbLatency = Date.now() - dbCheckStart

    // Calculate P95 response time
    const loadTimes = loadTimeData
      .map(d => d.loadTime)
      .filter((t): t is number => t !== null)
    const p95ResponseTime = calculateP95(loadTimes)

    // Calculate error rate
    const errorRate = totalRequests > 0
      ? Math.round((failedRequests / totalRequests) * 10000) / 100 // 2 decimal places
      : 0

    // Determine DB status based on latency
    let dbStatus: 'healthy' | 'degraded' | 'down' = 'healthy'
    if (dbLatency > 5000) dbStatus = 'down'
    else if (dbLatency > 2000) dbStatus = 'degraded'

    // Calculate uptime using real health check data
    // Also perform a health check to record current status
    const validRange = isValidTimeRange(range) ? range : '24h'
    const [uptimeData, healthCheck] = await Promise.all([
      getUptimeForRange(validRange),
      performHealthCheck()
    ])

    // System health metrics (expanded)
    const systemHealth = {
      avgLoadTime: pageViewStats._avg.loadTime
        ? Math.round(pageViewStats._avg.loadTime)
        : null,
      totalPageViews: pageViewStats._count,
      criticalErrors: errorLogs,
      alertsActive: activeAlerts.length,
      // Real metrics
      p95ResponseTime: p95ResponseTime ? Math.round(p95ResponseTime) : null,
      errorRate,
      dbStatus: healthCheck.services.database ? dbStatus : 'down',
      dbLatency,
      uptimePercent: uptimeData.uptimePercent,
      uptimeSource: uptimeData.source, // 'realtime' or 'estimated'
      currentStatus: healthCheck.status,
      lastChecked: new Date().toISOString()
    }

    const response = NextResponse.json({
      success: true,
      data: {
        security: {
          summary: securitySummary,
          events: formattedEvents
        },
        alerts: {
          active: activeAlerts,
          recent: recentAlerts,
          totalActive: activeAlerts.length
        },
        health: systemHealth,
        range,
        generatedAt: new Date().toISOString()
      }
    })

    // Short cache for real-time monitoring data
    response.headers.set('Cache-Control', 'private, max-age=15, stale-while-revalidate=10')
    return response

  } catch (error) {
    console.error('[Monitoring API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch monitoring data' },
      { status: 500 }
    )
  }
}
