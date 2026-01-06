// app/api/admin/system/alerts/patterns/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { createAlert } from '@/app/lib/monitoring/alerts'

// Suspicious patterns to detect
const SECURITY_PATTERNS = {
  BRUTE_FORCE: {
    query: { eventType: 'failed_login' },
    threshold: 5,
    timeWindow: 300000, // 5 minutes
    severity: 'HIGH' as const
  },
  RAPID_BOOKING_ATTEMPTS: {
    query: { eventType: 'booking_attempt' },
    threshold: 10,
    timeWindow: 60000, // 1 minute
    severity: 'MEDIUM' as const
  },
  UNUSUAL_ACCESS_PATTERN: {
    query: { eventType: 'admin_access' },
    threshold: 50,
    timeWindow: 600000, // 10 minutes
    severity: 'CRITICAL' as const
  },
  DATA_EXFILTRATION: {
    query: { action: 'export' },
    threshold: 3,
    timeWindow: 300000, // 5 minutes
    severity: 'CRITICAL' as const
  },
  PAYMENT_FRAUD_PATTERN: {
    query: { eventType: 'payment_failed' },
    threshold: 3,
    timeWindow: 600000, // 10 minutes
    severity: 'HIGH' as const
  },
  MULTIPLE_CHARGE_FAILURES: {
    query: { eventType: 'charge_failed' },
    threshold: 5,
    timeWindow: 1800000, // 30 minutes
    severity: 'HIGH' as const
  },
  SUSPICIOUS_VERIFICATION_ATTEMPTS: {
    query: { eventType: 'verification_failed' },
    threshold: 3,
    timeWindow: 600000, // 10 minutes
    severity: 'MEDIUM' as const
  }
}

export async function GET(request: NextRequest) {
  try {
    // Allow access with CRON_SECRET
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'itwhip-cron-secret-2024'
    if (authHeader === `Bearer ${cronSecret}`) {
      // Authorized via CRON_SECRET, continue
    } else {
      // Will be blocked by middleware if not admin authenticated
      const adminToken = request.cookies.get('adminAccessToken')?.value
      if (!adminToken) {
        return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
      }
    }

    const detectedPatterns = []
    const now = new Date()
    
    // Check each pattern
    for (const [patternName, config] of Object.entries(SECURITY_PATTERNS)) {
      const recentLogs = await prisma.auditLog.count({
        where: {
          ...config.query,
          timestamp: {
            gte: new Date(now.getTime() - config.timeWindow)
          }
        }
      })
      
      if (recentLogs >= config.threshold) {
        // Get details of the suspicious activity
        const logs = await prisma.auditLog.findMany({
          where: {
            ...config.query,
            timestamp: {
              gte: new Date(now.getTime() - config.timeWindow)
            }
          },
          take: 5,
          orderBy: { timestamp: 'desc' }
        })
        
        // Create alert using your existing alert system
        await createAlert({
          type: 'security',
          severity: config.severity,
          title: `Security Pattern Detected: ${patternName.replace(/_/g, ' ')}`,
          message: `${recentLogs} suspicious events detected in ${config.timeWindow/60000} minutes`,
          details: {
            pattern: patternName,
            count: recentLogs,
            threshold: config.threshold,
            timeWindow: config.timeWindow,
            recentLogs: logs.map(log => ({
              id: log.id,
              user: log.userId,
              ip: log.ipAddress,
              action: log.action,
              timestamp: log.timestamp
            }))
          }
        })
        
        // Also create admin notification
        const notification = await prisma.adminNotification.create({
          data: {
            type: 'SECURITY_ALERT',
            title: `Security: ${patternName.replace(/_/g, ' ')}`,
            message: `${recentLogs} events in ${config.timeWindow/60000} minutes (threshold: ${config.threshold})`,
            priority: config.severity === 'CRITICAL' ? 'URGENT' : config.severity,
            status: 'UNREAD',
            actionRequired: true,
            metadata: {
              pattern: patternName,
              count: recentLogs,
              threshold: config.threshold
            }
          }
        })
        
        detectedPatterns.push({
          pattern: patternName,
          severity: config.severity,
          count: recentLogs,
          threshold: config.threshold,
          notification: notification.id,
          samples: logs.slice(0, 3)
        })
      }
    }
    
    // Log the pattern check
    await prisma.auditLog.create({
      data: {
        category: 'SECURITY',
        eventType: 'pattern_check',
        severity: detectedPatterns.length > 0 ? 'WARNING' : 'INFO',
        action: 'monitor',
        resource: 'security_patterns',
        details: {
          patternsChecked: Object.keys(SECURITY_PATTERNS).length,
          patternsDetected: detectedPatterns.length,
          patterns: detectedPatterns.map(p => p.pattern)
        },
        ipAddress: '127.0.0.1',
        userAgent: 'SIEM Pattern Detector',
        hash: '',
        previousHash: null
      }
    })
    
    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      patterns: detectedPatterns,
      checked: Object.keys(SECURITY_PATTERNS).length
    })
  } catch (error) {
    console.error('Pattern detection failed:', error)
    return NextResponse.json({ 
      error: 'Pattern detection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}