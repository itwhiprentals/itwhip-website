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

  // Try host token first
  for (const secret of [process.env.HOST_JWT_SECRET!, process.env.GUEST_JWT_SECRET!, process.env.JWT_SECRET!].filter(Boolean)) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
      const userId = (payload.userId || payload.id || payload.sub) as string
      if (secret === process.env.HOST_JWT_SECRET && payload.hostId) {
        return { userId, role: 'host', hostId: payload.hostId as string }
      }
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
  const [requests, insurance, reviews, claims, unreadMessages, host, pushUnread] = await Promise.all([
    // Pending booking requests (fleet approved, waiting for host)
    prisma.rentalBooking.count({ where: { hostId, fleetStatus: 'APPROVED', hostStatus: 'PENDING' } }),
    // Cars missing insurance
    prisma.rentalCar.count({ where: { hostId, isActive: true, insuranceTier: null } }),
    // Unresponded reviews
    prisma.rentalReview.count({ where: { hostId, hostResponse: null } }),
    // Open claims
    prisma.claim.count({ where: { hostId, status: { in: ['PENDING', 'UNDER_REVIEW'] } } }),
    // Unread message threads (messages sent to host that host hasn't read)
    prisma.rentalMessage.count({
      where: {
        booking: { hostId },
        senderType: { in: ['guest', 'renter', 'admin'] },
        readAt: null,
      }
    }),
    // Host profile for account dots
    prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: { profilePhoto: true, phone: true, stripePayoutsEnabled: true, stripeAccountId: true, partnerCompanyName: true },
    }),
    // Push notification unread
    prisma.pushNotification.count({ where: { userId, read: false } }),
  ])

  const personalInfo = !host?.profilePhoto || !host?.phone
  const bankingPayouts = !host?.stripePayoutsEnabled || !host?.stripeAccountId

  return {
    role: 'host',
    totalUnread: pushUnread,
    tabs: {
      fleet: insurance > 0,
      bookings: requests > 0,
      dashboard: false,
      inbox: unreadMessages > 0,
      account: personalInfo || bankingPayouts,
    },
    explore: {
      requests,
      insurance,
      reviews,
      claims,
      revenue: 0,
      verifyGuest: 0,
      tracking: 0,
      calendar: 0,
      maintenance: 0,
    },
    account: {
      personalInfo,
      companyInfo: false,
      bankingPayouts,
      insurance: insurance > 0,
      calendar: false,
      revenue: false,
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
