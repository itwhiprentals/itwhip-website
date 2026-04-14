// app/api/auth/mobile/complete-profile/route.ts
// Saves phone number after OAuth signup (Apple/Google Sign In on mobile)
// Called when a new user signs up via OAuth and needs to add their phone number

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const GUEST_JWT_SECRET = new TextEncoder().encode(process.env.GUEST_JWT_SECRET!)
const HOST_JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

async function verifyToken(token: string): Promise<{ userId: string; email?: string } | null> {
  // Try guest secret first, then host secret
  for (const secret of [GUEST_JWT_SECRET, HOST_JWT_SECRET]) {
    try {
      const { payload } = await jwtVerify(token, secret)
      const userId = (payload.userId || payload.id || payload.sub) as string
      if (userId) return { userId, email: payload.email as string | undefined }
    } catch {}
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    // Verify Bearer token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const body = await request.json()
    const { phone, roleHint } = body

    // Validate phone
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const digitsOnly = phone.replace(/\D/g, '')
    if (digitsOnly.length < 10 || digitsOnly.length > 11) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
    }

    const formattedPhone = digitsOnly.length === 11 ? `+${digitsOnly}` : `+1${digitsOnly}`

    // Update the user's phone number
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update User phone
    await prisma.user.update({
      where: { id: user.id },
      data: { phone: formattedPhone }
    })

    // Update ReviewerProfile phone if exists
    await prisma.reviewerProfile.updateMany({
      where: { userId: user.id },
      data: { phoneNumber: formattedPhone }
    })

    // If host, update RentalHost phone
    if (roleHint === 'host') {
      await prisma.rentalHost.updateMany({
        where: { userId: user.id },
        data: { phone: formattedPhone }
      })
    }

    console.log(`[Complete Profile] Phone saved for ${user.email}: ${formattedPhone}`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Complete Profile] Error:', error.message)
    return NextResponse.json(
      { error: 'Failed to save phone number' },
      { status: 500 }
    )
  }
}
