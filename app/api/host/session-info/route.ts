// app/api/host/session-info/route.ts
// Host session, security, API, and audit info — mobile-compatible (x-host-id header)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { headers } from 'next/headers'

async function getHostFromHeaders() {
  const headersList = await headers()
  const hostId = headersList.get('x-host-id')
  const userId = headersList.get('x-user-id')
  if (!userId && !hostId) return null
  return prisma.rentalHost.findFirst({
    where: hostId ? { id: hostId } : { userId: userId! },
    select: {
      id: true,
      name: true,
      email: true,
      partnerCompanyName: true,
      hostType: true,
      profilePhoto: true,
      partnerLogo: true,
      createdAt: true,
      emailVerified: true,
      phoneVerified: true,
      identityVerified: true,
      stripeAccountId: true,
      stripeConnectAccountId: true,
      active: true,
      lastLoginAt: true,
      previousLoginAt: true,
    }
  })
}

export async function GET(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    if (!host) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Recent login activity
    const recentLogins = await prisma.activityLog.findMany({
      where: {
        OR: [{ entityId: host.id }, { adminId: host.id }],
        action: { in: ['LOGIN', 'LOGOUT', 'SESSION_START', 'PASSWORD_CHANGE'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, action: true, createdAt: true, ipAddress: true, userAgent: true }
    })

    // Audit log
    const auditLog = await prisma.activityLog.findMany({
      where: {
        OR: [{ entityId: host.id }, { adminId: host.id }]
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true, action: true, entityType: true, category: true,
        createdAt: true, ipAddress: true, oldValue: true, newValue: true
      }
    })

    // Security score
    const hasStripeConnected = !!(host.stripeConnectAccountId || host.stripeAccountId)
    let securityScore = 0
    if (host.emailVerified) securityScore += 25
    if (host.phoneVerified) securityScore += 25
    if (host.identityVerified) securityScore += 25
    if (hasStripeConnected) securityScore += 25

    // Device info from request
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0]?.trim() || 'Unknown'
    const isMobile = /mobile/i.test(userAgent)
    const browser = userAgent.match(/(chrome|firefox|safari|edge|opera)/i)?.[0] || 'Unknown'
    const os = userAgent.match(/(windows|mac|linux|android|ios)/i)?.[0] || 'Unknown'

    return NextResponse.json({
      success: true,
      user: {
        id: host.id,
        name: host.name || host.partnerCompanyName || 'Host',
        email: host.email,
        companyName: host.partnerCompanyName,
        hostType: host.hostType,
        profilePhoto: host.partnerLogo || host.profilePhoto,
        memberSince: host.createdAt,
        lastLogin: host.lastLoginAt || new Date(),
        previousLogin: host.previousLoginAt,
        isActive: host.active,
      },
      currentSession: {
        ip,
        browser: browser.charAt(0).toUpperCase() + browser.slice(1).toLowerCase(),
        os: os.charAt(0).toUpperCase() + os.slice(1).toLowerCase(),
        deviceType: isMobile ? 'Mobile' : 'Desktop',
        startedAt: new Date().toISOString(),
        device: isMobile ? 'Mobile' : 'Desktop',
      },
      security: {
        score: securityScore,
        emailVerified: host.emailVerified || false,
        phoneVerified: host.phoneVerified || false,
        identityVerified: host.identityVerified || false,
        stripeConnected: hasStripeConnected,
        activeSessions: 1,
        recentLogins: recentLogins.map(log => ({
          id: log.id,
          action: log.action,
          timestamp: log.createdAt,
          ip: log.ipAddress || 'Unknown',
          device: log.userAgent ? (/mobile/i.test(log.userAgent) ? 'Mobile' : 'Desktop') : 'Unknown'
        }))
      },
      api: {
        hasApiAccess: false,
        activeKeys: 0,
        keys: []
      },
      recentActivityCount: auditLog.length,
      lastActivity: auditLog[0]?.createdAt || null,
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
    console.error('[Host Session Info] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch session info' }, { status: 500 })
  }
}
