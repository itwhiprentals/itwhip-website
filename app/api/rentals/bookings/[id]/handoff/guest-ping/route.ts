import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { calculateDistance } from '@/lib/utils/distance'
import { TRIP_CONSTANTS } from '@/app/lib/trip/constants'
import {
  calculateLocationTrust,
  generateEtaMessage,
  type GpsPing,
} from '@/app/lib/trip/handoff-ai'

export async function POST(
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
      select: {
        id: true,
        renterId: true,
        guestEmail: true,
        guestName: true,
        bookingCode: true,
        hostId: true,
        status: true,
        tripStartedAt: true,
        handoffStatus: true,
        guestLiveLatitude: true,
        guestLiveLongitude: true,
        guestLiveDistance: true,
        guestLiveUpdatedAt: true,
        host: {
          select: {
            phone: true,
          }
        },
        car: {
          select: {
            year: true,
            make: true,
            model: true,
            latitude: true,
            longitude: true,
            address: true,
            city: true,
            state: true,
          }
        }
      }
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

    // Only allow pings for confirmed bookings before trip starts
    if (booking.status !== 'CONFIRMED' || booking.tripStartedAt) {
      return NextResponse.json({ error: 'Booking not in valid state' }, { status: 400 })
    }

    const body = await request.json()
    const { latitude, longitude } = body

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json({ error: 'Valid coordinates required' }, { status: 400 })
    }

    // Reject null-island
    if (latitude === 0 && longitude === 0) {
      return NextResponse.json({ error: 'GPS unavailable' }, { status: 400 })
    }

    // Calculate distance to car
    let distanceMeters = 0
    const carLat = booking.car.latitude
    const carLng = booking.car.longitude

    if (carLat && carLng) {
      const distanceMiles = calculateDistance(
        { latitude, longitude },
        { latitude: carLat, longitude: carLng }
      )
      distanceMeters = Math.round(distanceMiles * 1609.34)
    }

    const withinRange = distanceMeters <= TRIP_CONSTANTS.HANDOFF_RADIUS_METERS

    // Build current ping
    const currentPing: GpsPing = {
      latitude,
      longitude,
      timestamp: new Date(),
      distanceMeters,
    }

    // Build previous ping from stored data
    const previousPing: GpsPing | null =
      booking.guestLiveLatitude && booking.guestLiveLongitude && booking.guestLiveUpdatedAt
        ? {
            latitude: booking.guestLiveLatitude,
            longitude: booking.guestLiveLongitude,
            timestamp: booking.guestLiveUpdatedAt,
            distanceMeters: booking.guestLiveDistance || 0,
          }
        : null

    // Anti-spoofing trust score
    const locationTrust = calculateLocationTrust(currentPing, previousPing)

    // Determine if we should call Haiku for ETA (every 4th ping, ~60s)
    let etaMessage: string | undefined
    const pingCount = previousPing
      ? Math.round((currentPing.timestamp.getTime() - (booking.guestLiveUpdatedAt?.getTime() || 0)) / (TRIP_CONSTANTS.GUEST_PING_INTERVAL))
      : 1

    // Call Haiku for ETA on first ping or every ~60s (4th ping)
    const shouldGenerateEta = !previousPing || pingCount >= TRIP_CONSTANTS.GUEST_ETA_INTERVAL
    if (shouldGenerateEta && distanceMeters > 0) {
      const carAddress = booking.car.address
        ? `${booking.car.address}, ${booking.car.city || ''}, ${booking.car.state || ''}`
        : null
      etaMessage = await generateEtaMessage(currentPing, previousPing, carAddress)
    }

    // Update booking with live location
    const updateData: Record<string, unknown> = {
      guestLiveLatitude: latitude,
      guestLiveLongitude: longitude,
      guestLiveDistance: distanceMeters,
      guestLiveUpdatedAt: new Date(),
      guestLocationTrust: locationTrust,
    }
    if (etaMessage) {
      updateData.guestEtaMessage = etaMessage
    }

    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: updateData,
    })

    // Notify host when guest enters approach zone (dedup prevents spam)
    if (withinRange && booking.host?.phone) {
      const etaMinutes = Math.max(1, Math.ceil(distanceMeters / 500))
      import('@/app/lib/twilio/sms-triggers').then(({ sendGuestApproachingSms }) => {
        sendGuestApproachingSms({
          guestName: booking.guestName || 'Guest',
          etaMinutes,
          hostPhone: booking.host!.phone,
          car: booking.car,
          bookingId: booking.id,
          hostId: booking.hostId,
        }).catch(e => console.error('[Guest Ping] SMS failed:', e))
      }).catch(e => console.error('[SMS] sms-triggers import failed:', e))
    }

    return NextResponse.json({
      distance: distanceMeters,
      withinRange,
      locationTrust,
      etaMessage: etaMessage || undefined,
    })
  } catch (error) {
    console.error('[Guest Ping] Error:', error)
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
  }
}
