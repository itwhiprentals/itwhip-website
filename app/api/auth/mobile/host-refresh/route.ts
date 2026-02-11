// app/api/auth/mobile/host-refresh/route.ts
// Mobile host token refresh — accepts refresh token in JSON body,
// returns new access + refresh tokens with hostId in payload

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'
import { nanoid } from 'nanoid'
import db from '@/app/lib/db'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET!
)
const GUEST_JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_REFRESH_SECRET!
)

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token required' }, { status: 400 })
    }

    // Try to verify with both secrets (handles Google OAuth tokens signed with guest secret)
    let payload: any = null

    for (const secret of [JWT_REFRESH_SECRET, GUEST_JWT_REFRESH_SECRET]) {
      try {
        const result = await jwtVerify(refreshToken, secret)
        payload = result.payload
        break
      } catch {
        continue
      }
    }

    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    })

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Account not found or deactivated' }, { status: 401 })
    }

    // Get host record
    const host = await prisma.rentalHost.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { email: user.email || undefined },
        ],
      },
      include: {
        cars: { select: { id: true } },
      },
    })

    if (!host) {
      return NextResponse.json({ error: 'Host account not found' }, { status: 404 })
    }

    const isFleetPartner = host.hostType === 'FLEET_PARTNER'

    // Generate new tokens with hostId
    const newAccessToken = await new SignJWT({
      userId: user.id,
      hostId: host.id,
      email: host.email,
      name: host.name,
      role: 'BUSINESS',
      isRentalHost: true,
      approvalStatus: host.approvalStatus,
      hostType: host.hostType,
      isFleetPartner,
      type: 'access',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(JWT_SECRET)

    const newFamily = nanoid()
    const newRefreshToken = await new SignJWT({
      userId: user.id,
      hostId: host.id,
      type: 'refresh',
      family: newFamily,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_REFRESH_SECRET)

    // Save new refresh token
    await db.saveRefreshToken({
      userId: user.id,
      token: newRefreshToken,
      family: newFamily,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    return NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 15 * 60,
      host: {
        id: host.id,
        userId: user.id,
        name: host.name,
        email: host.email,
        phone: host.phone,
        profilePhoto: host.profilePhoto,
        hostType: host.hostType,
        approvalStatus: host.approvalStatus,
        active: host.active,
        isHostManager: host.isHostManager,
        isVehicleOwner: host.isVehicleOwner,
        managesOwnCars: host.managesOwnCars,
        managesOthersCars: host.managesOthersCars,
        partnerCompanyName: host.partnerCompanyName,
        partnerSlug: host.partnerSlug,
        fleetSize: (host as any).cars?.length || 0,
        role: isFleetPartner ? 'fleet_partner' : host.isHostManager ? 'fleet_manager' : 'individual',
      },
    })
  } catch (error) {
    console.error('❌ Mobile host token refresh error:', error)
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 500 })
  }
}
