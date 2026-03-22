// app/api/rentals/bookings/[id]/trip/progress/route.ts
// PATCH — saves partial trip wizard progress per step
// Does NOT start or end the trip. Writes individual fields so the wizard
// can resume from the last completed step on any platform.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: { id: true, renterId: true, guestEmail: true, status: true }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Verify ownership
    const isOwner = (user.id && booking.renterId === user.id) ||
                    (user.email && booking.guestEmail === user.email)
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const updateData: Record<string, any> = {}

    // Start trip fields
    if (body.inspectionPhotosStart !== undefined) {
      updateData.inspectionPhotosStart = typeof body.inspectionPhotosStart === 'string'
        ? body.inspectionPhotosStart
        : JSON.stringify(body.inspectionPhotosStart)
    }
    if (body.startMileage !== undefined && typeof body.startMileage === 'number') {
      updateData.startMileage = body.startMileage
    }
    if (body.fuelLevelStart !== undefined && typeof body.fuelLevelStart === 'string') {
      updateData.fuelLevelStart = body.fuelLevelStart
    }

    // End trip fields
    if (body.inspectionPhotosEnd !== undefined) {
      updateData.inspectionPhotosEnd = typeof body.inspectionPhotosEnd === 'string'
        ? body.inspectionPhotosEnd
        : JSON.stringify(body.inspectionPhotosEnd)
    }
    if (body.endMileage !== undefined && typeof body.endMileage === 'number') {
      updateData.endMileage = body.endMileage
    }
    if (body.fuelLevelEnd !== undefined && typeof body.fuelLevelEnd === 'string') {
      updateData.fuelLevelEnd = body.fuelLevelEnd
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: updateData,
    })

    console.log(`[TripProgress] ${bookingId} saved:`, Object.keys(updateData).join(', '))

    return NextResponse.json({ success: true, saved: Object.keys(updateData) })
  } catch (error) {
    console.error('[TripProgress] Error:', error)
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
  }
}
