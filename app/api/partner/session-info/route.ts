// app/api/partner/session-info/route.ts
// Partner session and security information API

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth/next-auth-config'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions)

    // Try to get host from token
    const cookieStore = await cookies()
    const hostToken = cookieStore.get('host_access_token')?.value

    let hostId: string | null = null
    let host: any = null

    if (hostToken) {
      // Verify host token
      const hostSession = await prisma.hostSession.findFirst({
        where: {
          token: hostToken,
          expiresAt: { gt: new Date() }
        },
        include: {
          host: {
            select: {
              id: true,
              name: true,
              email: true,
              partnerCompanyName: true,
              hostType: true,
              profilePhoto: true,
              createdAt: true,
              lastLoginAt: true,
              emailVerified: true,
              phoneVerified: true,
              identityVerified: true,
              stripeAccountId: true,
              stripeCustomerId: true,
              active: true
            }
          }
        }
      })

      if (hostSession?.host) {
        hostId = hostSession.host.id
        host = hostSession.host
      }
    }

    if (!host && !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get recent login activity
    const recentLogins = hostId ? await prisma.activityLog.findMany({
      where: {
        OR: [
          { entityId: hostId },
          { adminId: hostId }
        ],
        action: { in: ['LOGIN', 'LOGOUT', 'SESSION_START', 'PASSWORD_CHANGE'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        action: true,
        createdAt: true,
        ipAddress: true,
        userAgent: true
      }
    }) : []

    // Get comprehensive audit log for all activities
    const auditLog = hostId ? await prisma.activityLog.findMany({
      where: {
        OR: [
          { entityId: hostId },
          { adminId: hostId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        action: true,
        entityType: true,
        category: true,
        createdAt: true,
        ipAddress: true,
        oldValue: true,
        newValue: true
      }
    }) : []

    // Get active sessions count
    const activeSessions = hostId ? await prisma.hostSession.count({
      where: {
        hostId,
        expiresAt: { gt: new Date() }
      }
    }) : 1

    // Get API keys if any (for partners with API access)
    // Note: ApiKey model uses userId, not hostId - we'll show empty for now
    // In the future, partners can have their own API key system
    const apiKeys: any[] = []

    // Calculate security score
    let securityScore = 0
    if (host?.emailVerified) securityScore += 25
    if (host?.phoneVerified) securityScore += 25
    if (host?.identityVerified) securityScore += 25
    if (host?.stripeAccountId) securityScore += 25

    // Format response
    const userInfo = host ? {
      id: host.id,
      name: host.name || host.partnerCompanyName || 'Partner',
      email: host.email,
      companyName: host.partnerCompanyName,
      hostType: host.hostType,
      profilePhoto: host.profilePhoto,
      memberSince: host.createdAt,
      lastLogin: host.lastLoginAt,
      isActive: host.active
    } : {
      id: session?.user?.id,
      name: session?.user?.name || 'User',
      email: session?.user?.email,
      companyName: null,
      hostType: null,
      profilePhoto: session?.user?.image,
      memberSince: null,
      lastLogin: null,
      isActive: true
    }

    // Get current session info from request
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0]?.trim() || 'Unknown'

    // Parse user agent for device info
    const isMobile = /mobile/i.test(userAgent)
    const isTablet = /tablet|ipad/i.test(userAgent)
    const browser = userAgent.match(/(chrome|firefox|safari|edge|opera)/i)?.[0] || 'Unknown'
    const os = userAgent.match(/(windows|mac|linux|android|ios)/i)?.[0] || 'Unknown'

    return NextResponse.json({
      success: true,
      user: userInfo,
      currentSession: {
        ip,
        userAgent,
        browser: browser.charAt(0).toUpperCase() + browser.slice(1).toLowerCase(),
        os: os.charAt(0).toUpperCase() + os.slice(1).toLowerCase(),
        deviceType: isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop',
        startedAt: new Date().toISOString()
      },
      security: {
        score: securityScore,
        emailVerified: host?.emailVerified || false,
        phoneVerified: host?.phoneVerified || false,
        identityVerified: host?.identityVerified || false,
        stripeConnected: !!host?.stripeAccountId,
        activeSessions,
        recentLogins: recentLogins.map(log => ({
          id: log.id,
          action: log.action,
          timestamp: log.createdAt,
          ip: log.ipAddress || 'Unknown',
          device: log.userAgent ? (
            /mobile/i.test(log.userAgent) ? 'Mobile' : 'Desktop'
          ) : 'Unknown'
        }))
      },
      api: {
        hasApiAccess: apiKeys.length > 0,
        activeKeys: apiKeys.length,
        keys: apiKeys.map(key => ({
          id: key.id,
          name: key.name,
          lastUsed: key.lastUsedAt,
          createdAt: key.createdAt,
          expiresAt: key.expiresAt
        }))
      },
      auditLog: auditLog.map(log => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        category: log.category,
        timestamp: log.createdAt,
        ip: log.ipAddress || 'Unknown',
        oldValue: log.oldValue,
        newValue: log.newValue
      }))
    })

  } catch (error) {
    console.error('[Partner Session Info] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session info' },
      { status: 500 }
    )
  }
}
