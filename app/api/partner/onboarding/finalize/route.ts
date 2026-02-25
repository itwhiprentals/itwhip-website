// app/api/partner/onboarding/finalize/route.ts
// Finalize recruited host onboarding: mark complete, create booking, auto-create guest

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { randomBytes } from 'crypto'
import { logProspectActivity } from '@/app/lib/auth/host-tokens'

const JWT_SECRET = process.env.JWT_SECRET!

async function getCurrentHost() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value
    || cookieStore.get('hostAccessToken')?.value
    || cookieStore.get('accessToken')?.value

  if (!token) return null

  try {
    const decoded = verify(token, JWT_SECRET) as { hostId?: string }
    const hostId = decoded.hostId
    if (!hostId) return null

    return await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: {
        convertedFromProspect: {
          include: {
            request: true
          }
        },
        cars: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            city: true,
            state: true
          }
        }
      }
    })
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const prospect = host.convertedFromProspect
    if (!prospect) {
      return NextResponse.json(
        { error: 'No linked prospect found' },
        { status: 404 }
      )
    }

    const fleetRequest = prospect.request
    if (!fleetRequest) {
      return NextResponse.json(
        { error: 'No linked request found' },
        { status: 404 }
      )
    }

    // Ensure host has at least one car
    const car = host.cars[0]
    if (!car) {
      return NextResponse.json(
        { error: 'No car found. Please add a car first.' },
        { status: 400 }
      )
    }

    // Check if already finalized
    if (host.onboardingCompletedAt) {
      return NextResponse.json(
        { error: 'Onboarding already completed', alreadyComplete: true },
        { status: 400 }
      )
    }

    // Determine payment preference
    const isCash = prospect.paymentPreference === 'CASH'

    // Calculate pricing
    const dailyRate = prospect.counterOfferStatus === 'APPROVED' && prospect.counterOfferAmount
      ? prospect.counterOfferAmount
      : fleetRequest.offeredRate || 0
    const durationDays = fleetRequest.durationDays || 14
    const subtotal = dailyRate * durationDays
    const serviceFee = isCash ? 0 : subtotal * 0.10
    const totalAmount = subtotal + serviceFee
    const hostEarnings = subtotal - (isCash ? 0 : serviceFee)

    // ═══════════════════════════════════════════════════
    // STEP 1: Find or create guest account
    // ═══════════════════════════════════════════════════
    let reviewerProfileId: string | null = null
    let guestUserId: string | null = null
    const guestEmail = fleetRequest.guestEmail?.toLowerCase().trim()
    const guestName = fleetRequest.guestName || 'Guest'
    const guestPhone = fleetRequest.guestPhone || null

    if (guestEmail) {
      // Check for existing ReviewerProfile
      const existingProfile = await prisma.reviewerProfile.findUnique({
        where: { email: guestEmail },
        select: { id: true, userId: true }
      })

      if (existingProfile) {
        reviewerProfileId = existingProfile.id
        guestUserId = existingProfile.userId
      } else {
        // Create new ReviewerProfile for the guest
        const profileId = randomBytes(16).toString('hex')
        const newProfile = await prisma.reviewerProfile.create({
          data: {
            id: profileId,
            email: guestEmail,
            phoneNumber: guestPhone,
            name: guestName,
            city: fleetRequest.pickupCity || 'Unknown',
            state: fleetRequest.pickupState || 'AZ',
            emailVerified: false,
            phoneVerified: false,
            updatedAt: new Date()
          }
        })
        reviewerProfileId = newProfile.id

        // Create a User record for the guest (no password — they'll set one later)
        const userId = nanoid()
        await prisma.user.create({
          data: {
            id: userId,
            email: guestEmail,
            name: guestName,
            phone: guestPhone,
            role: 'CLAIMED',
            emailVerified: false,
            updatedAt: new Date()
          }
        })
        guestUserId = userId

        // Link ReviewerProfile to User
        await prisma.reviewerProfile.update({
          where: { id: profileId },
          data: { userId }
        })
      }
    }

    // ═══════════════════════════════════════════════════
    // STEP 2: Create the booking
    // ═══════════════════════════════════════════════════
    const bookingCode = `BK-${nanoid(6).toUpperCase()}`
    const bookingId = crypto.randomUUID()

    const booking = await prisma.rentalBooking.create({
      data: {
        id: bookingId,
        bookingCode,
        updatedAt: new Date(),

        // Car and host
        carId: car.id,
        hostId: host.id,

        // Guest
        ...(guestUserId && { renterId: guestUserId }),
        ...(reviewerProfileId && { reviewerProfileId }),
        guestEmail: guestEmail || '',
        guestName: guestName,
        guestPhone: guestPhone,

        // Dates
        startDate: fleetRequest.startDate || new Date(),
        endDate: fleetRequest.endDate || new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
        startTime: '10:00',
        endTime: '10:00',

        // Location
        pickupLocation: fleetRequest.pickupCity
          ? `${fleetRequest.pickupCity}, ${fleetRequest.pickupState || 'AZ'}`
          : car.city || '',
        pickupType: 'pickup',

        // Pricing
        dailyRate,
        numberOfDays: durationDays,
        subtotal,
        serviceFee,
        taxes: 0,
        securityDeposit: 0,
        depositHeld: 0,
        totalAmount,

        // Status — cash gets auto-confirmed, platform stays pending
        status: isCash ? 'CONFIRMED' : 'PENDING',
        paymentStatus: isCash ? 'PENDING' : 'PENDING',
        fleetStatus: 'APPROVED',

        // Mark as request-based booking
        notes: `[Request-Based Booking] Created from ReservationRequest ${fleetRequest.id}. Payment: ${isCash ? 'Cash/Offline' : 'Platform'}`,
        verificationSource: 'ONBOARDING'
      },
      select: {
        id: true,
        bookingCode: true,
        status: true
      }
    })

    // ═══════════════════════════════════════════════════
    // STEP 3: Mark onboarding complete
    // ═══════════════════════════════════════════════════
    const now = new Date()

    // Update host
    await prisma.rentalHost.update({
      where: { id: host.id },
      data: {
        onboardingCompletedAt: now,
        approvalStatus: 'APPROVED',
        active: true,
        hostType: 'EXTERNAL',
        dashboardAccess: true,
        canViewBookings: true,
        canSetPricing: true,
        canEditCalendar: true,
        canMessageGuests: true
      }
    })

    // Update prospect
    await prisma.hostProspect.update({
      where: { id: prospect.id },
      data: {
        status: 'CONVERTED',
        convertedAt: now,
        onboardingCompletedAt: now,
        convertedBookingId: bookingId,
        lastActivityAt: now
      }
    })

    // ═══════════════════════════════════════════════════
    // STEP 4: Fulfill the reservation request
    // ═══════════════════════════════════════════════════
    await prisma.reservationRequest.update({
      where: { id: fleetRequest.id },
      data: {
        status: 'FULFILLED',
        fulfilledBookingId: bookingId
      }
    })

    // ═══════════════════════════════════════════════════
    // STEP 5: Log activity
    // ═══════════════════════════════════════════════════
    await logProspectActivity(prospect.id, 'ONBOARDING_FINALIZED', {
      hostId: host.id,
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      carId: car.id,
      guestEmail,
      paymentPreference: prospect.paymentPreference,
      isCash
    })

    // TODO: Send guest email with auto-login link
    // TODO: Send host confirmation email
    console.log(`[Finalize] Booking ${booking.bookingCode} created for host ${host.id}, guest ${guestEmail}`)

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        status: booking.status
      }
    })

  } catch (error: any) {
    console.error('[Finalize API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to finalize onboarding' },
      { status: 500 }
    )
  }
}
