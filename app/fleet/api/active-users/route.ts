// app/fleet/api/active-users/route.ts
// GET — real-time counts of online visitors, logged-in guests, logged-in hosts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  const sessionCookie = request.cookies.get('fleet_session')?.value
  if (key !== 'phoenix-fleet-2847' && !sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000)
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000)

    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)

    const [onlineNow, activeGuests, activeHosts, totalRegisteredGuests, totalRegisteredHosts, smsSentToday, smsReceivedToday, emailsSentToday, callsToday] = await Promise.all([
      // Visitors with page view in last 5 minutes (unique by visitorId or IP)
      prisma.pageView.findMany({
        where: { timestamp: { gte: fiveMinAgo } },
        select: { visitorId: true, ip: true },
        distinct: ['visitorId'],
      }).then(views => views.length),

      // Guests with active session (logged in within last 30 min)
      prisma.securityEvent.findMany({
        where: {
          type: 'LOGIN_SUCCESS',
          timestamp: { gte: thirtyMinAgo },
          message: { contains: 'via guest' },
        },
        select: { targetId: true },
        distinct: ['targetId'],
      }).then(events => events.length),

      // Hosts with active session (logged in within last 30 min)
      prisma.securityEvent.findMany({
        where: {
          type: 'LOGIN_SUCCESS',
          timestamp: { gte: thirtyMinAgo },
          OR: [
            { message: { contains: 'via host' } },
            { message: { contains: 'via partner' } },
            { message: { contains: 'via mobile_host' } },
          ],
        },
        select: { targetId: true },
        distinct: ['targetId'],
      }).then(events => events.length),

      // Total registered guests
      prisma.reviewerProfile.count(),

      // Total registered hosts
      prisma.rentalHost.count({ where: { approvalStatus: 'APPROVED' } }),

      // SMS sent today (everything except INBOUND is outbound)
      prisma.smsLog.count({ where: { createdAt: { gte: startOfToday }, type: { not: 'INBOUND' } } }),

      // SMS received today
      prisma.smsLog.count({ where: { createdAt: { gte: startOfToday }, type: 'INBOUND' } }),

      // Emails sent today
      prisma.emailLog.count({ where: { createdAt: { gte: startOfToday } } }),

      // Calls today (Twilio call logs)
      prisma.callLog.count({ where: { createdAt: { gte: startOfToday } } }).catch(() => 0),
    ])

    return NextResponse.json({
      success: true,
      onlineNow,
      activeGuests,
      activeHosts,
      totalRegisteredGuests,
      totalRegisteredHosts,
      smsSentToday,
      smsReceivedToday,
      emailsSentToday,
      callsToday,
    })
  } catch (error) {
    console.error('[Active Users] Error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
