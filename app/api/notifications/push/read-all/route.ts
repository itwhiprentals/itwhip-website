// app/api/notifications/push/read-all/route.ts
// Mark all push notifications as read

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

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserFromBearer(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await prisma.pushNotification.updateMany({ where: { userId, read: false }, data: { read: true } })
    return NextResponse.json({ success: true, unreadCount: 0 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
