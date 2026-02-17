// app/api/auth/mobile/refresh/route.ts
// Mobile token refresh — accepts refresh token in Authorization header,
// returns new access + refresh tokens in response body

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
const GUEST_JWT_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET!
)
const GUEST_JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_REFRESH_SECRET!
)

function getSecrets(role: string) {
  const guestRoles = ['ANONYMOUS', 'CLAIMED', 'STARTER', 'BUSINESS', 'ENTERPRISE']
  if (guestRoles.includes(role.toUpperCase())) {
    return { accessSecret: GUEST_JWT_SECRET, refreshSecret: GUEST_JWT_REFRESH_SECRET }
  }
  return { accessSecret: JWT_SECRET, refreshSecret: JWT_REFRESH_SECRET }
}

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token required' },
        { status: 400 }
      )
    }

    // Try to verify with both secrets (guest and platform)
    let payload: any = null
    let usedRefreshSecret = JWT_REFRESH_SECRET

    for (const secret of [GUEST_JWT_REFRESH_SECRET, JWT_REFRESH_SECRET]) {
      try {
        const result = await jwtVerify(refreshToken, secret)
        payload = result.payload
        usedRefreshSecret = secret
        break
      } catch {
        continue
      }
    }

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Account not found or deactivated' },
        { status: 401 }
      )
    }

    // Generate new tokens
    const { accessSecret, refreshSecret } = getSecrets(user.role)

    const newAccessToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      type: 'access',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(accessSecret)

    const newFamily = nanoid()
    const newRefreshToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'refresh',
      family: newFamily,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(refreshSecret)

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
      expiresIn: 7 * 24 * 60 * 60,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('❌ Mobile token refresh error:', error)
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    )
  }
}
