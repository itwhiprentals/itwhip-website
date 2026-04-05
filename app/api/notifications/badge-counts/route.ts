// app/api/notifications/badge-counts/route.ts
// Single endpoint returns all badge data for the logged-in user (host or guest)

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

interface AuthResult { userId: string; role: 'guest' | 'host'; hostId?: string }

async function getAuth(request: NextRequest): Promise<AuthResult | null> {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7)

  for (const secret of [process.env.HOST_JWT_SECRET!, process.env.GUEST_JWT_SECRET!, process.env.JWT_SECRET!].filter(Boolean)) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
      const userId = (payload.userId || payload.id || payload.sub) as string
      if (!userId) continue

      // Look up host by userId
      const host = await prisma.rentalHost.findFirst({ where: { userId }, select: { id: true } })
      if (host) return { userId, role: 'host', hostId: host.id }
      return { userId, role: 'guest' }
    } catch { continue }
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (auth.role === 'host' && auth.hostId) {
      return NextResponse.json(await getHostBadges(auth.hostId, auth.userId))
    }
    return NextResponse.json(await getGuestBadges(auth.userId))
  } catch (error) {
    console.error('[Badge Counts] Error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

async function getHostBadges(hostId: string, userId: string) {
  const now = new Date()
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const [requests, reservationRequests, verifyGuest, reviews, claims, unreadMessages, revenue, host, pushUnread] = await Promise.all([
    // Pending booking requests (fleet approved, waiting for host)
    prisma.rentalBooking.count({ where: { hostId, fleetStatus: 'APPROVED', hostStatus: 'PENDING' } }),
    // Open reservation requests (matches /api/partner/requests screen)
    prisma.reservationRequest.count({ where: { status: 'OPEN', OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] } }),
    // Upcoming confirmed bookings with unverified guests
    prisma.rentalBooking.count({
      where: {
        hostId,
        status: 'CONFIRMED',
        startDate: { gte: now, lte: twentyFourHoursFromNow },
        renter: { reviewerProfile: { documentsVerified: false } },
      }
    }),
    // Unresponded reviews
    prisma.rentalReview.count({ where: { hostId, hostResponse: null } }),
    // Open claims
    prisma.claim.count({ where: { hostId, status: { in: ['PENDING', 'UNDER_REVIEW'] } } }),
    // Unread messages from guests
    prisma.rentalMessage.count({
      where: {
        booking: { hostId },
        senderType: { in: ['guest', 'renter', 'admin'] },
        readAt: null,
      }
    }),
    // Pending payouts
    prisma.hostPayout.count({ where: { hostId, status: 'PENDING' } }),
    // Host profile for account dots + insurance
    prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        profilePhoto: true, phone: true, stripePayoutsEnabled: true, stripeAccountId: true,
        partnerCompanyName: true, revenuePath: true, earningsTier: true,
        hostInsuranceProvider: true, hostInsuranceStatus: true,
        p2pInsuranceStatus: true, commercialInsuranceStatus: true,
        user: { select: { emailVerified: true, phoneVerified: true } },
      },
    }),
    // Push notification unread
    prisma.pushNotification.count({ where: { userId, read: false } }),
  ])

  const personalInfo = !host?.profilePhoto || !host?.phone || !host?.user?.emailVerified || !host?.user?.phoneVerified
  const bankingPayouts = !host?.stripePayoutsEnabled || !host?.stripeAccountId
  const hasRevenue = revenue > 0 || bankingPayouts

  // Insurance badge logic
  let insuranceCount = 0
  if (host?.revenuePath === 'tiers') {
    // Commission path: host must have fleet insurance
    if (!host.hostInsuranceProvider || host.hostInsuranceStatus !== 'ACTIVE') {
      // Count active cars that need coverage
      insuranceCount = await prisma.rentalCar.count({ where: { hostId, isActive: true } })
    }
  } else if (host?.revenuePath === 'insurance') {
    // Insurance tiers path
    if (host.earningsTier === 'BASIC') {
      insuranceCount = 0 // ITWhip covers at 40%
    } else if (host.earningsTier === 'STANDARD') {
      // 75% tier: needs P2P insurance
      if (host.p2pInsuranceStatus !== 'ACTIVE') insuranceCount = 1
    } else if (host.earningsTier === 'PREMIUM') {
      // 90% tier: needs commercial insurance
      if (host.commercialInsuranceStatus !== 'ACTIVE') insuranceCount = 1
    }
  }
  const insuranceDot = insuranceCount > 0

  // Cars needing attention (no rate, no description, or changes requested)
  const [carsNeedingAttention, carsChangesRequested] = await Promise.all([
    prisma.rentalCar.count({
      where: {
        hostId,
        isActive: true,
        OR: [
          { dailyRate: 0 },
          { description: null },
          { description: '' },
        ],
      },
    }),
    prisma.rentalCar.count({
      where: {
        hostId,
        fleetApprovalStatus: 'CHANGES_REQUESTED',
      },
    }),
  ])
  const fleetNeedsAttention = insuranceDot || carsNeedingAttention > 0 || carsChangesRequested > 0

  return {
    role: 'host',
    totalUnread: pushUnread,
    tabs: {
      fleet: fleetNeedsAttention,
      bookings: requests > 0 || verifyGuest > 0,
      dashboard: false,
      inbox: unreadMessages > 0,
      account: personalInfo || bankingPayouts || hasRevenue || insuranceDot,
    },
    explore: {
      requests: reservationRequests,
      verifyGuest,
      reviews,
      claims,
      revenue,
      insurance: insuranceCount,
      tracking: 0,
      calendar: 0,
      maintenance: 0,
    },
    account: {
      personalInfo,
      companyInfo: false,
      bankingPayouts,
      insurance: insuranceDot,
      calendar: false,
      revenue: hasRevenue,
    },
    validation: {
      emailVerified: !!host?.user?.emailVerified,
      phoneVerified: !!host?.user?.phoneVerified,
      profilePhoto: !!host?.profilePhoto,
      phone: !!host?.phone,
      stripeConnected: !!host?.stripeAccountId,
      stripePayoutsEnabled: !!host?.stripePayoutsEnabled,
      insurance: !insuranceDot,
      hasVehicles: (await prisma.rentalCar.count({ where: { hostId } })) > 0,
    },
  }
}

async function getGuestBadges(userId: string) {
  const [unreadMessages, pushUnread] = await Promise.all([
    prisma.rentalMessage.count({
      where: {
        booking: { renterId: userId },
        senderType: { in: ['host', 'admin', 'support'] },
        readAt: null,
      }
    }),
    prisma.pushNotification.count({ where: { userId, read: false } }),
  ])

  return {
    role: 'guest',
    totalUnread: pushUnread,
    tabs: {
      home: false,
      search: false,
      explore: false,
      messages: unreadMessages > 0,
      account: false,
    },
    explore: {},
    account: {},
  }
}
