// app/api/favorites/full/route.ts
// GET full car data for the favorites page (avoids N+1 fetches)

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

// GET /api/favorites/full — returns full car data for all favorites
export async function GET(request: NextRequest) {
  try {
    const accessToken =
      request.cookies.get('accessToken')?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(accessToken)
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // JWT stores User.id — resolve to ReviewerProfile.id (FK target)
    const profile = await prisma.reviewerProfile.findUnique({
      where: { userId: payload.userId as string },
      select: { id: true },
    })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 401 })
    }

    const favorites = await prisma.userFavorite.findMany({
      where: { userId: profile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            trim: true,
            color: true,
            carType: true,
            transmission: true,
            fuelType: true,
            seats: true,
            doors: true,
            dailyRate: true,
            weeklyRate: true,
            monthlyRate: true,
            address: true,
            city: true,
            state: true,
            features: true,
            instantBook: true,
            totalTrips: true,
            rating: true,
            vehicleType: true,
            isActive: true,
            host: {
              select: {
                id: true,
                name: true,
                profilePhoto: true,
                rating: true,
                totalTrips: true,
                city: true,
                state: true,
                isVerified: true,
                hostType: true,
                partnerCompanyName: true,
                partnerSlug: true,
                partnerLogo: true,
                isBusinessHost: true,
              },
            },
            photos: {
              select: {
                id: true,
                url: true,
                caption: true,
                order: true,
                isHero: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })

    // Filter out deleted/inactive cars and return
    const cars = favorites
      .map(f => f.car)
      .filter(car => car !== null)

    return NextResponse.json({ cars })
  } catch (error) {
    console.error('[Favorites Full GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
