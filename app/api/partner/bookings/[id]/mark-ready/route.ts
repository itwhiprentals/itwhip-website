// app/api/partner/bookings/[id]/mark-ready/route.ts
// Host marks car ready after return — reduces effective trip buffer to platform min (2hr)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyHostRequest } from '@/app/lib/auth/verify-request'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const hostId = await verifyHostRequest(request)
    if (!hostId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: bookingId } = await params

    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: { id: true, hostId: true, tripStatus: true, status: true, markedReadyAt: true }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.hostId !== hostId) {
      return NextResponse.json({ error: 'Not your booking' }, { status: 403 })
    }

    // Can only mark ready after trip ends
    if (booking.tripStatus !== 'COMPLETED' && booking.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Trip must be completed before marking car ready' }, { status: 400 })
    }

    if (booking.markedReadyAt) {
      return NextResponse.json({ error: 'Car already marked ready' }, { status: 400 })
    }

    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        markedReadyAt: new Date(),
        markedReadyBy: hostId
      }
    })

    return NextResponse.json({ success: true, markedReadyAt: new Date().toISOString() })
  } catch (error) {
    console.error('[Mark Ready] Error:', error)
    return NextResponse.json({ error: 'Failed to mark car ready' }, { status: 500 })
  }
}
