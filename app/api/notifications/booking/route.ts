// app/api/notifications/booking/route.ts
// GET booking notifications for the guest bell (replaces compliance notifications for now)

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { getGuestBellNotifications, getGuestUnreadCount } from '@/app/lib/notifications/booking-bell'

async function getUserIdFromToken(token: string): Promise<string | null> {
  const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
  const GUEST_JWT_SECRET = new TextEncoder().encode(process.env.GUEST_JWT_SECRET!)

  for (const secret of [GUEST_JWT_SECRET, JWT_SECRET]) {
    try {
      const { payload } = await jwtVerify(token, secret)
      return payload.userId as string
    } catch {
      continue
    }
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json({ success: true, notifications: [], unreadCount: 0 })
    }

    const userId = await getUserIdFromToken(token)
    if (!userId) {
      return NextResponse.json({ success: true, notifications: [], unreadCount: 0 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const [notifications, unreadCount] = await Promise.all([
      getGuestBellNotifications(userId, limit),
      getGuestUnreadCount(userId),
    ])

    // Map to bell format
    const mapped = notifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      description: n.message,
      actionUrl: n.actionUrl,
      actionLabel: 'View',
      icon: mapTypeToIcon(n.type),
      iconColor: mapTypeToColor(n.type),
      priority: mapPriority(n.priority),
      isDismissible: true,
      createdAt: n.createdAt.toISOString(),
      isRead: !!n.readAt,
    }))

    return NextResponse.json({
      success: true,
      notifications: mapped,
      unreadCount,
    })
  } catch (error) {
    console.error('[Booking Notifications] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

function mapTypeToIcon(type: string): string {
  const icons: Record<string, string> = {
    BOOKING_RECEIVED: 'CARD',
    BOOKING_CONFIRMED: 'SHIELD',
    BOOKING_ON_HOLD: 'ALERT',
    BOOKING_HOLD_RELEASED: 'SHIELD',
    TRIP_STARTED: 'CARD',
    TRIP_ENDED: 'CARD',
    BOOKING_CANCELLED: 'ALERT',
    BOOKING_NO_SHOW: 'ALERT',
    BOOKING_AUTO_COMPLETED: 'CARD',
    DEPOSIT_RELEASED: 'CREDIT_CARD',
    PICKUP_REMINDER: 'CARD',
    RETURN_REMINDER: 'ALERT',
  }
  return icons[type] || 'ALERT'
}

function mapTypeToColor(type: string): string {
  const colors: Record<string, string> = {
    BOOKING_RECEIVED: 'text-blue-500',
    BOOKING_CONFIRMED: 'text-green-500',
    BOOKING_ON_HOLD: 'text-red-500',
    BOOKING_HOLD_RELEASED: 'text-green-500',
    TRIP_STARTED: 'text-green-500',
    TRIP_ENDED: 'text-blue-500',
    BOOKING_CANCELLED: 'text-red-500',
    BOOKING_NO_SHOW: 'text-red-500',
    BOOKING_AUTO_COMPLETED: 'text-blue-500',
    DEPOSIT_RELEASED: 'text-green-500',
    PICKUP_REMINDER: 'text-orange-500',
    RETURN_REMINDER: 'text-orange-500',
  }
  return colors[type] || 'text-gray-500'
}

function mapPriority(p: string): number {
  return p === 'HIGH' ? 2 : p === 'MEDIUM' ? 3 : 4
}
