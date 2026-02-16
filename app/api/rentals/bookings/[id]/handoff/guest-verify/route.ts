import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { geocodeAddress } from '@/app/lib/geocoding/mapbox'
import { calculateDistance } from '@/lib/utils/distance'
import { TRIP_CONSTANTS, HANDOFF_STATUS } from '@/app/lib/trip/constants'
import { TESTING_MODE } from '@/app/lib/trip/validation'

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
        status: true,
        onboardingCompletedAt: true,
        tripStartedAt: true,
        handoffStatus: true,
        car: {
          select: {
            id: true,
            latitude: true,
            longitude: true,
            address: true,
            city: true,
            state: true,
            instantBook: true,
            keyInstructions: true,
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

    // Check booking is in valid state
    if (booking.status !== 'CONFIRMED') {
      return NextResponse.json({ error: 'Booking must be confirmed' }, { status: 400 })
    }
    if (booking.tripStartedAt) {
      return NextResponse.json({ error: 'Trip already started' }, { status: 400 })
    }
    if (booking.handoffStatus === HANDOFF_STATUS.HANDOFF_COMPLETE ||
        booking.handoffStatus === HANDOFF_STATUS.BYPASSED) {
      return NextResponse.json({ error: 'Handoff already completed' }, { status: 400 })
    }

    const body = await request.json()
    const { latitude, longitude } = body

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json({ error: 'Valid latitude and longitude required' }, { status: 400 })
    }

    // Get car coordinates (geocode if missing)
    let carLat = booking.car.latitude
    let carLng = booking.car.longitude

    if (!carLat || !carLng) {
      const geocoded = await geocodeAddress(
        booking.car.address,
        booking.car.city,
        booking.car.state
      )
      if (geocoded) {
        carLat = geocoded.latitude
        carLng = geocoded.longitude
        // Cache the geocoded coordinates on the car
        await prisma.rentalCar.update({
          where: { id: booking.car.id },
          data: { latitude: carLat, longitude: carLng }
        })
      }
    }

    // Calculate distance
    let distanceMeters = 0
    let verified = false

    if (carLat && carLng) {
      const distanceMiles = calculateDistance(
        { latitude, longitude },
        { latitude: carLat, longitude: carLng }
      )
      distanceMeters = Math.round(distanceMiles * 1609.34)

      verified = TESTING_MODE || distanceMeters <= TRIP_CONSTANTS.HANDOFF_RADIUS_METERS
    } else {
      // No car coordinates available — allow in testing mode
      if (TESTING_MODE) {
        verified = true
        distanceMeters = 0
      } else {
        return NextResponse.json({
          error: 'Unable to determine car location',
          verified: false,
        }, { status: 400 })
      }
    }

    if (!verified) {
      return NextResponse.json({
        verified: false,
        distance: distanceMeters,
        handoffStatus: booking.handoffStatus || HANDOFF_STATUS.PENDING,
        message: `You are ${distanceMeters}m away. Please get within ${TRIP_CONSTANTS.HANDOFF_RADIUS_METERS}m of the vehicle.`
      })
    }

    // Set auto-fallback time for instant-book cars
    const autoFallbackAt = booking.car.instantBook
      ? new Date(Date.now() + TRIP_CONSTANTS.HANDOFF_AUTO_FALLBACK_MINUTES * 60 * 1000)
      : null

    // Update booking with GPS verification
    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        handoffStatus: HANDOFF_STATUS.GUEST_VERIFIED,
        guestGpsVerifiedAt: new Date(),
        guestGpsLatitude: latitude,
        guestGpsLongitude: longitude,
        guestGpsDistance: distanceMeters,
        handoffAutoFallbackAt: autoFallbackAt,
      }
    })

    return NextResponse.json({
      verified: true,
      distance: distanceMeters,
      handoffStatus: HANDOFF_STATUS.GUEST_VERIFIED,
      autoFallbackAt: autoFallbackAt?.toISOString() || null,
      isInstantBook: booking.car.instantBook,
    })
  } catch (error) {
    console.error('[Handoff Guest Verify] Error:', error)
    return NextResponse.json({ error: 'Failed to verify location' }, { status: 500 })
  }
}
