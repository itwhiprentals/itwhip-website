// app/api/fleet/guests/[id]/bookings/route.ts
// Get bookings for a specific guest — used by bonus page to link credits to bookings

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Look up the guest's userId for renterId matching
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id },
      select: { userId: true }
    })

    const bookings = await prisma.rentalBooking.findMany({
      where: {
        OR: [
          { reviewerProfileId: id },
          ...(guest?.userId ? [{ renterId: guest.userId }] : []),
        ]
      },
      select: {
        id: true,
        bookingCode: true,
        status: true,
        startDate: true,
        endDate: true,
        car: {
          select: { year: true, make: true, model: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({
      success: true,
      bookings: bookings.map(b => ({
        id: b.id,
        bookingCode: b.bookingCode,
        status: b.status,
        startDate: b.startDate,
        car: b.car,
      }))
    })
  } catch (error) {
    console.error('[Fleet Guest Bookings] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
