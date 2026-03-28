// app/api/notifications/push/route.ts
// GET push notifications for mobile app (paginated)

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

async function getUserFromBearer(request: NextRequest): Promise<string | null> {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7)

  for (const secret of [process.env.GUEST_JWT_SECRET!, process.env.JWT_SECRET!, process.env.HOST_JWT_SECRET!].filter(Boolean)) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
      return (payload.userId || payload.id || payload.sub) as string
    } catch { continue }
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromBearer(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.pushNotification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.pushNotification.count({ where: { userId } }),
      prisma.pushNotification.count({ where: { userId, read: false } }),
    ])

    return NextResponse.json({
      notifications,
      unreadCount,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[Push] List error:', error)
    return NextResponse.json({ error: 'Failed to get notifications' }, { status: 500 })
  }
}
