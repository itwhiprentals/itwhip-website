// app/api/fleet/monitoring/route.ts
// Comprehensive monitoring API for fleet dashboard
// Returns security events, alerts, and system health metrics

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '24h'

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
      errorLogs
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

    // System health metrics
    const systemHealth = {
      avgLoadTime: pageViewStats._avg.loadTime
        ? Math.round(pageViewStats._avg.loadTime)
        : null,
      totalPageViews: pageViewStats._count,
      criticalErrors: errorLogs,
      alertsActive: activeAlerts.length
    }

    return NextResponse.json({
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

  } catch (error) {
    console.error('[Monitoring API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch monitoring data' },
      { status: 500 }
    )
  }
}
