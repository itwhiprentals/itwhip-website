// app/api/partner/session-info/route.ts
// Partner session and security information API

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth/next-auth-config'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-here'
)

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions)

    // Try to get host from token - check all possible cookie names
    const cookieStore = await cookies()
    const hostToken = cookieStore.get('partner_token')?.value ||
                      cookieStore.get('hostAccessToken')?.value ||
                      cookieStore.get('accessToken')?.value

    let hostId: string | null = null
    let host: any = null

    if (hostToken) {
      // Verify JWT token
      try {
        const verified = await jwtVerify(hostToken, JWT_SECRET)
        const payload = verified.payload
        hostId = payload.hostId as string

        if (hostId) {
          // Fetch host data directly
          host = await prisma.rentalHost.findUnique({
            where: { id: hostId },
            select: {
              id: true,
              name: true,
              email: true,
              partnerCompanyName: true,
              partnerLogo: true,
              hostManagerLogo: true,
              hostType: true,
              profilePhoto: true,
              createdAt: true,
              emailVerified: true,
              phoneVerified: true,
              identityVerified: true,
              stripeAccountId: true,
              stripeConnectAccountId: true,
              stripeCustomerId: true,
              active: true,
              lastLoginAt: true,
              previousLoginAt: true,
              recruitedVia: true,
              _count: {
                select: {
                  cars: true
                }
              }
            }
          })
        }
      } catch (jwtError) {
        console.error('[Session Info] JWT verification failed:', jwtError)
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

    // Get active sessions count - count from Session model or default to 1 (current session)
    // Note: Session model uses userId which may be different from hostId
    // For now, we'll count active sessions where the user is logged in
    let activeSessions = 1 // Default to 1 for current active session

    // Get API keys if any (for partners with API access)
    // Note: ApiKey model uses userId, not hostId - we'll show empty for now
    // In the future, partners can have their own API key system
    const apiKeys: any[] = []

    // Calculate security score
    // Use stripeConnectAccountId as the primary Stripe indicator (for receiving payouts)
    const hasStripeConnected = !!(host?.stripeConnectAccountId || host?.stripeAccountId)

    let securityScore = 0
    if (host?.emailVerified) securityScore += 25
    if (host?.phoneVerified) securityScore += 25
    if (host?.identityVerified) securityScore += 25
    if (hasStripeConnected) securityScore += 25

    // Get last login from recent activity (fallback)
    const lastLoginActivity = recentLogins.find(log => log.action === 'LOGIN' || log.action === 'SESSION_START')

    // Format response
    const userInfo = host ? {
      id: host.id,
      name: host.name || host.partnerCompanyName || 'Partner',
      email: host.email,
      companyName: host.partnerCompanyName,
      hostType: host.hostType,
      // Use the best available photo: partnerLogo > hostManagerLogo > profilePhoto
      profilePhoto: host.partnerLogo || host.hostManagerLogo || host.profilePhoto,
      memberSince: host.createdAt,
      // Prefer database lastLoginAt, fallback to activity log or current time
      lastLogin: host.lastLoginAt || lastLoginActivity?.createdAt || new Date(),
      previousLogin: host.previousLoginAt || null,
      isActive: host.active,
      isExternalRecruit: !!host.recruitedVia,  // Derived from recruitedVia (source of truth)
      recruitedVia: host.recruitedVia || null,
      hasCars: (host._count?.cars || 0) > 0
    } : {
      id: (session?.user as any)?.id,
      name: session?.user?.name || 'User',
      email: session?.user?.email,
      companyName: null,
      hostType: null,
      profilePhoto: session?.user?.image,
      memberSince: null,
      lastLogin: new Date(),
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
        stripeConnected: hasStripeConnected,
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
