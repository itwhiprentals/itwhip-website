// app/api/auth/verify-link/info/route.ts
// Returns verification options for an account linking token

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const LINK_TOKEN_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET!
)

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (local.length <= 2) return `${local[0]}***@${domain}`
  return `${local[0]}${local[1]}***@${domain}`
}

function maskPhone(phone: string): string {
  if (phone.length < 4) return '***'
  return `***-${phone.slice(-4)}`
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Verify and decode the pending link JWT
    let payload: any
    try {
      const result = await jwtVerify(token, LINK_TOKEN_SECRET)
      payload = result.payload
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const { userId, provider } = payload
    if (!userId || !provider) {
      return NextResponse.json({ error: 'Invalid token data' }, { status: 400 })
    }

    // Fetch user info (only what's needed for verification options)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        phone: true,
        phoneVerified: true,
        passwordHash: true,
        name: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const hasPassword = !!user.passwordHash
    const hasPhone = !!user.phone && !!user.phoneVerified

    return NextResponse.json({
      maskedEmail: maskEmail(user.email || ''),
      maskedPhone: hasPhone ? maskPhone(user.phone!) : null,
      hasPassword,
      hasPhone,
      providerName: provider === 'apple' ? 'Apple' : provider === 'google' ? 'Google' : provider,
      userName: user.name,
    })
  } catch (error) {
    console.error('[Verify-Link Info] Error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
