import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { geocodeAddress } from '@/app/lib/geocoding/mapbox'
import { calculateDistance } from '@/lib/utils/distance'
import { TRIP_CONSTANTS, HANDOFF_STATUS } from '@/app/lib/trip/constants'
import { TESTING_MODE } from '@/app/lib/trip/validation'
import { generateArrivalSummary } from '@/app/lib/trip/handoff-ai'
import { sendEmail } from '@/app/lib/email/send-email'

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
        startDate: true,
        startTime: true,
        endDate: true,
        status: true,
        onboardingCompletedAt: true,
        tripStartedAt: true,
        handoffStatus: true,
        guestLocationTrust: true,
        car: {
          select: {
            id: true,
            year: true,
            make: true,
            model: true,
            latitude: true,
            longitude: true,
            address: true,
            city: true,
            state: true,
            instantBook: true,
            keyInstructions: true,
            host: {
              select: {
                id: true,
                email: true,
                name: true,
                businessName: true,
              }
            }
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
    const { latitude, longitude, message } = body

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json({ error: 'Valid latitude and longitude required' }, { status: 400 })
    }

    // Reject null-island (0, 0) — means GPS failed or was denied
    if (latitude === 0 && longitude === 0) {
      return NextResponse.json({ error: 'GPS location unavailable. Please enable location services and try again.' }, { status: 400 })
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

    // Get guest's DL verification info for arrival summary
    const dlVerification = await prisma.dLVerificationLog.findFirst({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
      select: { model: true, score: true, recommendation: true },
    })

    // Count guest's previous bookings (for trust context)
    const totalBookings = booking.renterId
      ? await prisma.rentalBooking.count({
          where: { renterId: booking.renterId, status: { in: ['CONFIRMED', 'COMPLETED'] } },
        })
      : 0

    // Calculate booking duration
    const bookingDays = booking.startDate && booking.endDate
      ? Math.max(1, Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)))
      : 1

    // Generate Haiku arrival summary (non-blocking — fallback if fails)
    let arrivalSummary: string | undefined
    try {
      arrivalSummary = await generateArrivalSummary({
        guestName: booking.guestName || 'Guest',
        distanceMeters,
        verificationMethod: dlVerification?.model || null,
        verificationScore: dlVerification?.score || null,
        totalBookings: Math.max(0, totalBookings - 1), // exclude current
        bookingDays,
        locationTrust: booking.guestLocationTrust || 85,
        scheduledPickupDate: booking.startDate?.toISOString() || null,
        scheduledPickupTime: booking.startTime || null,
        currentTime: new Date(),
      })
    } catch (err) {
      console.error('[Handoff] Arrival summary generation failed:', err)
    }

    // Update booking with GPS verification + arrival summary
    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        handoffStatus: HANDOFF_STATUS.GUEST_VERIFIED,
        guestGpsVerifiedAt: new Date(),
        guestGpsLatitude: latitude,
        guestGpsLongitude: longitude,
        guestGpsDistance: distanceMeters,
        handoffAutoFallbackAt: autoFallbackAt,
        ...(arrivalSummary ? { guestArrivalSummary: arrivalSummary } : {}),
      }
    })

    // Create arrival notification message (idempotent — skip if already sent)
    const existingArrival = await prisma.rentalMessage.findFirst({
      where: { bookingId, category: 'arrival_notification' },
      select: { id: true },
    })

    if (!existingArrival) {
      const arrivalMessage = typeof message === 'string' && message.trim()
        ? message.trim()
        : "I've arrived at the vehicle"

      await prisma.rentalMessage.create({
        data: {
          id: crypto.randomUUID(),
          updatedAt: new Date(),
          bookingId,
          senderId: user.id || bookingId,
          senderType: 'guest',
          senderName: booking.guestName || 'Guest',
          senderEmail: booking.guestEmail || undefined,
          message: arrivalMessage,
          category: 'arrival_notification',
        }
      })

      // Email host about guest arrival
      const hostEmail = booking.car.host?.email
      if (hostEmail) {
        const carLabel = `${booking.car.year || ''} ${booking.car.make || ''} ${booking.car.model || ''}`.trim()
        const distanceLabel = distanceMeters < 1000
          ? `${distanceMeters}m`
          : `${(distanceMeters / 1609.34).toFixed(1)} mi`

        await sendEmail({
          to: hostEmail,
          subject: `Guest arrived — ${booking.bookingCode || bookingId}`,
          html: `
            <p><strong>${booking.guestName || 'Your guest'}</strong> has arrived near the <strong>${carLabel}</strong> (${distanceLabel} away).</p>
            ${arrivalMessage !== "I've arrived at the vehicle" ? `<blockquote style="border-left: 3px solid #22c55e; padding-left: 10px; margin: 10px 0; color: #374151;">${arrivalMessage}</blockquote>` : ''}
            ${arrivalSummary ? `<p style="color: #6b7280; font-size: 14px;">${arrivalSummary}</p>` : ''}
            <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/partner/bookings/${bookingId}" style="color: #22c55e;">View booking &amp; confirm handoff</a></p>
          `,
          text: `${booking.guestName || 'Your guest'} has arrived near the ${carLabel} (${distanceLabel} away). ${arrivalMessage}`,
        }).catch(err => console.error('[Handoff] Host email failed:', err))
      }
    }

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
