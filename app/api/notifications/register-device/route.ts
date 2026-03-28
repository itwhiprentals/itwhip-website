// app/api/notifications/register-device/route.ts
// Register or deactivate Expo push tokens for mobile devices

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

async function getUserFromBearer(request: NextRequest): Promise<string | null> {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7)

  const secrets = [
    process.env.GUEST_JWT_SECRET!,
    process.env.JWT_SECRET!,
    process.env.HOST_JWT_SECRET!,
  ].filter(Boolean)

  for (const secret of secrets) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
      return (payload.userId || payload.id || payload.sub) as string
    } catch { continue }
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromBearer(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { token, platform, hostId } = await request.json()
    if (!token || !platform) return NextResponse.json({ error: 'Missing token or platform' }, { status: 400 })
    if (!['ios', 'android'].includes(platform)) return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })

    const deviceToken = await prisma.devicePushToken.upsert({
      where: { token },
      update: { userId, hostId: hostId || null, platform, active: true },
      create: { userId, hostId: hostId || null, token, platform, active: true },
    })

    return NextResponse.json({ success: true, id: deviceToken.id })
  } catch (error) {
    console.error('[Push] Register error:', error)
    return NextResponse.json({ error: 'Failed to register device' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserFromBearer(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { token } = await request.json()
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

    await prisma.devicePushToken.updateMany({
      where: { token, userId },
      data: { active: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Push] Deactivate error:', error)
    return NextResponse.json({ error: 'Failed to deactivate token' }, { status: 500 })
  }
}
