// app/api/admin/system/alerts/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { getMetricsSummary, getActiveRequests } from '@/app/middleware/monitoring'

export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Get alert statistics
    const [
      totalAlerts,
      unreadAlerts,
      criticalAlerts,
      recentSecurityEvents,
      systemHealthCheck
    ] = await Promise.all([
      prisma.adminNotification.count(),
      prisma.adminNotification.count({ where: { status: 'UNREAD' } }),
      prisma.adminNotification.count({ where: { priority: 'URGENT' } }),
      prisma.auditLog.count({
        where: {
          category: 'SECURITY',
          timestamp: { gte: oneDayAgo }
        }
      }),
      // Check various system components
      Promise.all([
        prisma.$queryRaw`SELECT 1`.then(() => 'healthy').catch(() => 'unhealthy'),
        prisma.rentalBooking.count({ where: { status: 'ACTIVE' } }),
        prisma.rentalBooking.count({ where: { tripStatus: 'ACTIVE' } })
      ]).then(([db, activeBookings, activeTrips]) => ({
        database: db,
        activeBookings,
        activeTrips
      }))
    ])
    
    // Get recent critical alerts
    const recentAlerts = await prisma.adminNotification.findMany({
      where: {
        priority: { in: ['HIGH', 'URGENT'] },
        createdAt: { gte: oneDayAgo }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    // Get threat indicators from last week
    const threatIndicators = await prisma.fraudIndicator.groupBy({
      by: ['severity'],
      _count: true,
      where: {
        createdAt: { gte: oneWeekAgo }
      }
    })
    
    // Get security event trends (hourly for last 24 hours)
    const hourlyEvents = await prisma.auditLog.groupBy({
      by: ['severity'],
      _count: true,
      where: {
        category: 'SECURITY',
        timestamp: { gte: oneDayAgo }
      }
    })
    
    // Get failed authentication attempts
    const failedLogins = await prisma.auditLog.count({
      where: {
        eventType: 'failed_login',
        timestamp: { gte: oneDayAgo }
      }
    })
    
    // Get suspicious booking patterns
    const suspiciousBookings = await prisma.rentalBooking.count({
      where: {
        OR: [
          { fraudulent: true },
          { flaggedForReview: true },
          { riskScore: { gte: 70 } }
        ],
        createdAt: { gte: oneWeekAgo }
      }
    })
    
    // Get payment issues
    const paymentIssues = await prisma.rentalBooking.count({
      where: {
        paymentStatus: 'FAILED',
        createdAt: { gte: oneDayAgo }
      }
    })
    
    // Get trip charges pending
    const pendingCharges = await prisma.tripCharge.aggregate({
      where: {
        chargeStatus: 'PENDING'
      },
      _sum: {
        totalCharges: true
      },
      _count: true
    })
    
    // Get monitoring metrics from middleware
    const metrics = getMetricsSummary()
    const activeRequests = getActiveRequests()
    
    // Calculate security score (0-100)
    let securityScore = 100
    if (failedLogins > 10) securityScore -= 10
    if (failedLogins > 50) securityScore -= 20
    if (suspiciousBookings > 5) securityScore -= 15
    if (paymentIssues > 10) securityScore -= 10
    if (criticalAlerts > 0) securityScore -= 20
    if (threatIndicators.length > 0) {
      const criticalThreats = threatIndicators.find(t => t.severity === 'CRITICAL')
      if (criticalThreats && criticalThreats._count > 0) securityScore -= 25
    }
    securityScore = Math.max(0, securityScore)
    
    // Determine overall health status
    const healthStatus = 
      securityScore >= 80 ? 'healthy' :
      securityScore >= 60 ? 'degraded' :
      'critical'
    
    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      dashboard: {
        overview: {
          healthStatus,
          securityScore,
          activeRequests: activeRequests.length,
          systemUptime: process.uptime()
        },
        alerts: {
          total: totalAlerts,
          unread: unreadAlerts,
          critical: criticalAlerts,
          recentAlerts
        },
        security: {
          events24h: recentSecurityEvents,
          failedLogins,
          suspiciousBookings,
          threats: threatIndicators.map(t => ({
            severity: t.severity,
            count: t._count
          })),
          hourlyTrend: hourlyEvents
        },
        operations: {
          activeBookings: systemHealthCheck.activeBookings,
          activeTrips: systemHealthCheck.activeTrips,
          paymentIssues,
          pendingCharges: {
            count: pendingCharges._count,
            totalAmount: pendingCharges._sum.totalCharges || 0
          }
        },
        performance: {
          requestMetrics: {
            total: Object.values(metrics.requests).reduce((a, b) => a + b, 0),
            errors: Object.values(metrics.errors).reduce((a, b) => a + b, 0),
            statusCodes: metrics.statusCodes
          },
          topEndpoints: Object.entries(metrics.averageResponseTime)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([endpoint, time]) => ({ endpoint, avgTime: time })),
          activeRequests: activeRequests.slice(0, 5).map(r => ({
            endpoint: r.endpoint,
            duration: r.duration,
            method: r.method
          }))
        },
        system: {
          database: systemHealthCheck.database,
          memory: {
            used: process.memoryUsage().heapUsed / 1024 / 1024,
            total: process.memoryUsage().heapTotal / 1024 / 1024
          },
          cpu: process.cpuUsage()
        }
      }
    })
  } catch (error) {
    console.error('Dashboard failed:', error)
    return NextResponse.json({ 
      error: 'Dashboard failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
