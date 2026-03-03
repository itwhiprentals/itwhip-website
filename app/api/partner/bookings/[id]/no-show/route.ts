// app/api/partner/bookings/[id]/no-show/route.ts
// Host manually marks a booking as no-show

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/app/lib/database/prisma'
import { processNoShow } from '@/app/lib/bookings/no-show'

const JWT_SECRET = process.env.JWT_SECRET!

async function getCurrentHostId() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value
    || cookieStore.get('hostAccessToken')?.value

  if (!token) return null

  try {
    const decoded = verify(token, JWT_SECRET) as { hostId?: string }
    return decoded.hostId || null
  } catch {
    return null
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const hostId = await getCurrentHostId()
    if (!hostId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: bookingId } = await params

    // Verify booking belongs to this host
    const booking = await prisma.rentalBooking.findFirst({
      where: { id: bookingId, hostId },
      select: { id: true, status: true }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const result = await processNoShow(bookingId, 'HOST')

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      feeCharged: result.feeCharged,
      feeStatus: result.feeStatus,
    })
  } catch (error) {
    console.error('[Partner No-Show] Error:', error)
    return NextResponse.json({ error: 'Failed to process no-show' }, { status: 500 })
  }
}
