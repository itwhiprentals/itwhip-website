// app/api/guest/messages/read/route.ts
// Mark messages as read for the authenticated guest
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'

export async function POST(request: NextRequest) {
  try {
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId } = await request.json()
    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId required' }, { status: 400 })
    }

    // Verify booking belongs to this guest
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        OR: [
          { renterId: user.id },
          { guestEmail: user.email },
        ],
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Mark all non-guest messages as read
    const result = await prisma.rentalMessage.updateMany({
      where: {
        bookingId,
        senderType: { notIn: ['guest', 'renter'] },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, markedRead: result.count })
  } catch (error) {
    console.error('[Guest Messages] Mark read error:', error)
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })
  }
}
