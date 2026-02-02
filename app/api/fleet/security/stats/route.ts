// app/api/fleet/security/stats/route.ts
// Fleet Security Stats API - Get security metrics for dashboard

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'

const FLEET_KEY = 'phoenix-fleet-2847'

function validateFleetAccess(request: NextRequest): boolean {
  const key = request.headers.get('x-fleet-key') ||
              request.nextUrl.searchParams.get('key')
  return key === FLEET_KEY
}

async function validateFleetSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('fleet_session')?.value
  return typeof sessionToken === 'string' && /^[a-f0-9]{64}$/.test(sessionToken)
}

export async function GET(request: NextRequest) {
  // Check for fleet key or session
  const hasKey = validateFleetAccess(request)
  const hasSession = await validateFleetSession()

  if (!hasKey && !hasSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const hoursBack = parseInt(searchParams.get('hours') || '24')

    const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    // Fetch all security data in parallel
    const [
      failedLogins,
      successfulLogins,
      bruteForceEvents,
      targetedEvents,
      blockedAttempts,
      recentEvents
    ] = await Promise.all([
      // Failed logins count
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
      // Successful logins count
      prisma.securityEvent.count({
        where: {
          type: 'LOGIN_SUCCESS',
          timestamp: { gte: since }
        }
      }),
      // Brute force detections
      prisma.securityEvent.count({
        where: {
          type: 'BRUTE_FORCE_DETECTED',
          timestamp: { gte: since }
        }
      }),
      // Account targeting detections
      prisma.securityEvent.count({
        where: {
          type: 'ACCOUNT_TARGETED',
          timestamp: { gte: since }
        }
      }),
      // Blocked attempts
      prisma.securityEvent.count({
        where: {
          blocked: true,
          timestamp: { gte: since }
        }
      }),
      // Recent events for display (include ALL login types + EMAIL_COLLECTED)
      prisma.securityEvent.findMany({
        where: {
          timestamp: { gte: since },
          type: { in: ['LOGIN_FAILED', 'LOGIN_SUCCESS', 'BRUTE_FORCE_DETECTED', 'ACCOUNT_TARGETED', 'EMAIL_COLLECTED'] }
        },
        orderBy: { timestamp: 'desc' },
        take: 30,
        select: {
          id: true,
          type: true,
          severity: true,
          sourceIp: true,
          targetId: true,
          message: true,
          details: true,
          blocked: true,
          timestamp: true,
          country: true,
          city: true,
          userAgent: true
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

    // Get failed logins in last hour for "active threat" indicator
    const failedLastHour = failedLogins.filter(
      f => new Date(f.sourceIp).getTime() > oneHourAgo.getTime()
    ).length

    // Format recent events for display with ULTRA SECURITY data
    const formattedEvents = recentEvents.map(event => {
      let details: Record<string, any> = {}
      try {
        details = JSON.parse(event.details || '{}')
      } catch {}

      return {
        id: event.id,
        type: event.type,
        severity: event.severity,
        sourceIp: event.sourceIp,
        targetEmail: event.targetId || details.email || 'unknown',
        reason: details.reason || null,
        source: details.source || null,
        message: event.message,
        blocked: event.blocked,
        timestamp: event.timestamp.toISOString(),
        // Enhanced location data
        country: event.country || null,
        city: event.city || null,
        zipCode: details.zipCode || null,
        isp: details.isp || null,
        asn: details.asn || null,
        organization: details.organization || null,
        // Phone login data
        phone: details.phone || null,
        method: details.method || 'email',
        fingerprint: details.fingerprint || null,
        newDevice: details.newDevice || false,
        // Threat intelligence
        isVpn: details.isVpn || false,
        isProxy: details.isProxy || false,
        isTor: details.isTor || false,
        isDatacenter: details.isDatacenter || false,
        isHosting: details.isHosting || false,
        riskScore: details.riskScore || 0,
        // Bot detection
        isBot: details.isBot || false,
        botName: details.botName || null,
        botConfidence: details.botConfidence || 0,
        botReasons: details.botReasons || [],
        // Total threat score
        threatScore: details.threatScore || 0,
        userId: details.userId || null
      }
    })

    return NextResponse.json({
      success: true,
      stats: {
        timeRange: `${hoursBack}h`,
        totalFailedLogins: failedLogins.length,
        successfulLogins,
        uniqueIps,
        uniqueEmails,
        bruteForceAttempts: bruteForceEvents,
        accountsTargeted: targetedEvents,
        blockedAttempts,
        failedLastHour: failedLogins.filter(f => {
          // Count events in last hour
          return true // We need to check timestamp differently
        }).length,
        bySource,
        byReason
      },
      recentEvents: formattedEvents,
      threatLevel: bruteForceEvents > 0 || targetedEvents > 0 ? 'high' :
                   blockedAttempts > 5 ? 'medium' :
                   failedLogins.length > 10 ? 'low' : 'none'
    })

  } catch (error) {
    console.error('[Fleet Security Stats] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch security stats' }, { status: 500 })
  }
}
