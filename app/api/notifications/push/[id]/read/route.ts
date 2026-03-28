// app/api/notifications/push/[id]/read/route.ts
// Mark a single push notification as read

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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserFromBearer(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await prisma.pushNotification.update({ where: { id, userId }, data: { read: true } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
