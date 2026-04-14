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

    // "Today" in Arizona time (MST = UTC-7, no daylight saving)
    const arizonaNow = new Date(now.getTime() - 7 * 60 * 60 * 1000)
    const startOfToday = new Date(Date.UTC(
      arizonaNow.getUTCFullYear(),
      arizonaNow.getUTCMonth(),
      arizonaNow.getUTCDate(),
      7, 0, 0, 0 // midnight MST = 7:00 UTC
    ))

    const sixtySecondsAgo = new Date(now.getTime() - 60 * 1000)

    const [onlineNow, activeGuests, activeHosts, totalRegisteredGuests, totalRegisteredHosts, pendingHosts, smsSentToday, smsReceivedToday, emailsSentToday, callsToday, funnelStages, pendingBookings, approvedBookings, rejectedBookings, completedBookings, newGuestsToday, visitorsToday, visitorsYesterday, guestLoginsToday, guestLoginsYesterday, hostLoginsToday, hostLoginsYesterday, newHostsToday] = await Promise.all([
      // Online now — heartbeat received in last 60 seconds
      prisma.presence.count({ where: { lastSeen: { gte: sixtySecondsAgo } } }),

      // Active guests — heartbeat in last 60s with role = guest
      prisma.presence.count({ where: { lastSeen: { gte: sixtySecondsAgo }, role: 'guest' } }),

      // Active hosts — heartbeat in last 60s with role = host or admin
      prisma.presence.count({ where: { lastSeen: { gte: sixtySecondsAgo }, role: { in: ['host', 'admin'] } } }),

      // Total registered guests
      prisma.reviewerProfile.count(),

      // Total registered hosts
      prisma.rentalHost.count({ where: { approvalStatus: 'APPROVED' } }),

      // Pending hosts
      prisma.rentalHost.count({ where: { approvalStatus: 'PENDING' } }),

      // SMS sent today (everything except INBOUND is outbound)
      prisma.smsLog.count({ where: { createdAt: { gte: startOfToday }, type: { not: 'INBOUND' } } }),

      // SMS received today
      prisma.smsLog.count({ where: { createdAt: { gte: startOfToday }, type: 'INBOUND' } }),

      // Emails sent today
      prisma.emailLog.count({ where: { createdAt: { gte: startOfToday } } }),

      // Calls today (Twilio call logs)
      prisma.callLog.count({ where: { createdAt: { gte: startOfToday } } }).catch(() => 0),

      // Funnel stage breakdown — where are active visitors right now?
      prisma.presence.groupBy({
        by: ['funnelStage'],
        where: { lastSeen: { gte: sixtySecondsAgo } },
        _count: { funnelStage: true },
      }),

      // Booking status counts
      prisma.rentalBooking.count({ where: { status: 'PENDING' } }),
      prisma.rentalBooking.count({ where: { status: 'CONFIRMED' } }),
      prisma.rentalBooking.count({ where: { status: 'CANCELLED' } }),
      prisma.rentalBooking.count({ where: { status: 'COMPLETED' } }),

      // New guests today
      prisma.reviewerProfile.count({ where: { createdAt: { gte: startOfToday } } }),

      // Daily visitor counts (from PageView — unique visitorIds)
      prisma.pageView.groupBy({ by: ['visitorId'], where: { timestamp: { gte: startOfToday } } }).then(r => r.length),

      // Yesterday visitor count
      prisma.pageView.groupBy({ by: ['visitorId'], where: { timestamp: { gte: new Date(startOfToday.getTime() - 86400000), lt: startOfToday } } }).then(r => r.length),

      // Guest logins today (source contains 'guest')
      prisma.securityEvent.count({ where: { type: 'LOGIN_SUCCESS', timestamp: { gte: startOfToday }, details: { contains: '"source":"guest' } } }),

      // Guest logins yesterday
      prisma.securityEvent.count({ where: { type: 'LOGIN_SUCCESS', timestamp: { gte: new Date(startOfToday.getTime() - 86400000), lt: startOfToday }, details: { contains: '"source":"guest' } } }),

      // Host logins today (host, mobile_host, partner)
      prisma.securityEvent.count({ where: { type: 'LOGIN_SUCCESS', timestamp: { gte: startOfToday }, OR: [{ details: { contains: '"source":"host' } }, { details: { contains: '"source":"mobile_host' } }, { details: { contains: '"source":"partner' } }] } }),

      // Host logins yesterday
      prisma.securityEvent.count({ where: { type: 'LOGIN_SUCCESS', timestamp: { gte: new Date(startOfToday.getTime() - 86400000), lt: startOfToday }, OR: [{ details: { contains: '"source":"host' } }, { details: { contains: '"source":"mobile_host' } }, { details: { contains: '"source":"partner' } }] } }),

      // New hosts today
      prisma.rentalHost.count({ where: { createdAt: { gte: startOfToday } } }),
    ])

    // Build funnel breakdown object
    const funnelBreakdown: Record<string, number> = {
      browsing: 0, car_detail: 0, selecting_dates: 0,
      checkout: 0, id_verify: 0, payment: 0, confirmed: 0, other: 0,
    }
    for (const stage of funnelStages) {
      const key = stage.funnelStage || 'other'
      funnelBreakdown[key] = (funnelBreakdown[key] || 0) + stage._count.funnelStage
    }

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
      funnelBreakdown,
      pendingHosts,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      completedBookings,
      newGuestsToday,
      visitorsToday,
      visitorsYesterday,
      guestLoginsToday,
      guestLoginsYesterday,
      hostLoginsToday,
      hostLoginsYesterday,
      newHostsToday,
    })
  } catch (error) {
    console.error('[Active Users] Error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
