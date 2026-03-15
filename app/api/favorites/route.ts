// app/api/favorites/route.ts
// GET/POST/DELETE user favorites — syncs across website and mobile app

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const GUEST_JWT_SECRET = new TextEncoder().encode(process.env.GUEST_JWT_SECRET!)

async function verifyToken(token: string) {
  for (const secret of [GUEST_JWT_SECRET, JWT_SECRET]) {
    try {
      const { payload } = await jwtVerify(token, secret)
      return payload
    } catch {
      continue
    }
  }
  return null
}

async function getProfileId(request: NextRequest) {
  const accessToken =
    request.cookies.get('accessToken')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!accessToken) return null

  const payload = await verifyToken(accessToken)
  if (!payload?.userId) return null

  // JWT stores User.id — resolve to ReviewerProfile.id (FK target)
  const profile = await prisma.reviewerProfile.findUnique({
    where: { userId: payload.userId as string },
    select: { id: true },
  })
  return profile?.id || null
}

// GET /api/favorites — returns array of car IDs
export async function GET(request: NextRequest) {
  try {
    const profileId = await getProfileId(request)
    if (!profileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const favorites = await prisma.userFavorite.findMany({
      where: { userId: profileId },
      select: { carId: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ favorites: favorites.map(f => f.carId) })
  } catch (error) {
    console.error('[Favorites GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/favorites — add a car to favorites
export async function POST(request: NextRequest) {
  try {
    const profileId = await getProfileId(request)
    if (!profileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { carId } = await request.json()
    if (!carId || typeof carId !== 'string') {
      return NextResponse.json({ error: 'carId is required' }, { status: 400 })
    }

    // Upsert-safe: ignore if already favorited
    await prisma.userFavorite.upsert({
      where: { userId_carId: { userId: profileId, carId } },
      create: { userId: profileId, carId },
      update: {},
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Favorites POST] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/favorites — remove a car from favorites
export async function DELETE(request: NextRequest) {
  try {
    const profileId = await getProfileId(request)
    if (!profileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { carId } = await request.json()
    if (!carId || typeof carId !== 'string') {
      return NextResponse.json({ error: 'carId is required' }, { status: 400 })
    }

    await prisma.userFavorite.deleteMany({
      where: { userId: profileId, carId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Favorites DELETE]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
