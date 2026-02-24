// app/api/notifications/booking/read/route.ts
// POST — mark booking notifications as read or dismissed

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { markBellNotificationRead, dismissBellNotification, markAllRead } from '@/app/lib/notifications/booking-bell'

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

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = await getUserIdFromToken(token)
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, action } = body

    // Mark all read
    if (action === 'read-all') {
      const count = await markAllRead(userId, 'GUEST')
      return NextResponse.json({ success: true, message: `${count} marked as read` })
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'notificationId required' }, { status: 400 })
    }

    // Verify ownership
    const notification = await prisma.bookingNotification.findFirst({
      where: { id: notificationId, userId },
    })

    if (!notification) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (action === 'dismiss') {
      await dismissBellNotification(notificationId)
    } else {
      await markBellNotificationRead(notificationId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Booking Notifications] Read error:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}
