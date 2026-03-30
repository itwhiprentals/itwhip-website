// app/fleet/api/notifications/send/route.ts
// Send manual push notification — supports dry run for audience preview

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sendPushNotification } from '@/app/lib/notifications/push'

const FLEET_KEY = 'phoenix-fleet-2847'
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

function verifyFleet(request: NextRequest): boolean {
  const key = request.nextUrl.searchParams.get('key') || request.headers.get('x-fleet-key')
  return key === FLEET_KEY
}

async function getAudienceUsers(audience: string, targetUserId?: string) {
  switch (audience) {
    case 'all_users':
      return prisma.user.findMany({ where: { isActive: true }, select: { id: true } })
    case 'all_guests':
      return prisma.user.findMany({
        where: { isActive: true, reviewerProfile: { isNot: null } },
        select: { id: true },
      })
    case 'all_hosts':
      return prisma.rentalHost.findMany({
        where: { active: true },
        select: { userId: true },
      }).then(hosts => hosts.filter(h => h.userId).map(h => ({ id: h.userId })))
    case 'specific_user':
      if (!targetUserId) return []
      return [{ id: targetUserId }]
    case 'hosts_no_insurance':
      return prisma.rentalHost.findMany({
        where: { active: true, revenuePath: 'tiers', hostInsuranceProvider: null },
        select: { userId: true },
      }).then(hosts => hosts.filter(h => h.userId).map(h => ({ id: h.userId })))
    case 'inactive_guests': {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return prisma.user.findMany({
        where: {
          isActive: true,
          reviewerProfile: { isNot: null },
          NOT: { rentalBookings: { some: { createdAt: { gte: thirtyDaysAgo } } } },
        },
        select: { id: true },
      })
    }
    default:
      return []
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyFleet(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, body: msgBody, audience, targetUserId, deepLink, dryRun } = body

    if (!title || !msgBody || !audience) {
      return NextResponse.json({ error: 'title, body, and audience are required' }, { status: 400 })
    }

    // Get matching users
    const users = await getAudienceUsers(audience, targetUserId)
    const userIds = users.map((u: any) => u.id).filter(Boolean)

    // Count active tokens for these users
    const tokenCount = await prisma.devicePushToken.count({
      where: { userId: { in: userIds }, active: true },
    })

    // Dry run — return counts only
    if (dryRun) {
      return NextResponse.json({
        dryRun: true,
        audienceCount: userIds.length,
        tokenCount,
      })
    }

    // Rate limit: 1 manual push per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentSend = await prisma.manualNotification.findFirst({
      where: { createdAt: { gte: oneHourAgo } },
    })
    if (recentSend) {
      return NextResponse.json({
        error: 'Rate limited — max 1 manual push per hour',
        lastSentAt: recentSend.createdAt,
      }, { status: 429 })
    }

    // Send to all matching users
    let sent = 0, delivered = 0, failed = 0

    for (const userId of userIds) {
      try {
        // Create PushNotification record (in-app bell)
        await prisma.pushNotification.create({
          data: { userId, title, body: msgBody, type: 'manual', data: deepLink ? { screen: deepLink } : {}, read: false },
        })

        // Find tokens for this user
        const tokens = await prisma.devicePushToken.findMany({
          where: { userId, active: true },
          select: { token: true },
        })

        if (tokens.length === 0) { sent++; continue }

        // Send via Expo API
        const messages = tokens.map(t => ({
          to: t.token,
          sound: 'default',
          title,
          body: msgBody,
          data: deepLink ? { type: 'manual', screen: deepLink } : { type: 'manual' },
        }))

        const res = await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messages),
        })
        const result = await res.json()

        sent++
        if (result.data) {
          for (const ticket of result.data) {
            if (ticket.status === 'ok') delivered++
            else failed++
          }
        }
      } catch {
        sent++
        failed++
      }
    }

    // Save record
    await prisma.manualNotification.create({
      data: {
        title, body: msgBody, audience,
        targetUserId: targetUserId || null,
        deepLink: deepLink || null,
        sentBy: 'fleet-admin',
        sentCount: sent, deliveredCount: delivered, failedCount: failed,
      },
    })

    console.log(`[Fleet Push] Manual notification sent: "${title}" to ${audience} — sent:${sent} delivered:${delivered} failed:${failed}`)

    return NextResponse.json({ sent, delivered, failed, audienceCount: userIds.length, tokenCount })
  } catch (error) {
    console.error('[Fleet Push] Send error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
