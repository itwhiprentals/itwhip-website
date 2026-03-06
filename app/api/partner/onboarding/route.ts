// app/api/partner/onboarding/route.ts
// Partner API for recruited hosts to view their onboarding request

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { logProspectActivity, ACTIVITY_TYPES } from '@/app/lib/auth/host-tokens'

const JWT_SECRET = process.env.JWT_SECRET!

// Helper to get current host from auth
async function getCurrentHost() {
  const cookieStore = await cookies()
  // Check multiple token sources - onboard/validate sets hostAccessToken and accessToken
  const token = cookieStore.get('partner_token')?.value
    || cookieStore.get('hostAccessToken')?.value
    || cookieStore.get('accessToken')?.value

  if (!token) return null

  try {
    const decoded = verify(token, JWT_SECRET) as { hostId?: string; userId?: string }
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
          select: {
            id: true,
            make: true,
            model: true,
            trim: true,
            year: true,
            licensePlate: true,
            dailyRate: true,
            vehicleType: true,
            isActive: true,
            color: true,
            photos: {
              select: { url: true },
              take: 1
            }
          }
        }
      }
    })
  } catch {
    return null
  }
}

// GET /api/partner/onboarding - Get onboarding request details for recruited host
export async function GET(request: NextRequest) {
  try {
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if this is a recruited host (recruitedVia is source of truth)
    if (!host.recruitedVia) {
      return NextResponse.json(
        {
          error: 'Not a recruited host',
          isRecruitedHost: false
        },
        { status: 400 }
      )
    }

    // Get the linked prospect and request
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

    // Track request page view
    await logProspectActivity(prospect.id, ACTIVITY_TYPES.REQUEST_PAGE_VIEWED, {
      hostId: host.id,
      requestId: fleetRequest.id
    })

    // Update prospect activity
    await prisma.hostProspect.update({
      where: { id: prospect.id },
      data: {
        requestPageViewedAt: prospect.requestPageViewedAt || new Date(),
        lastActivityAt: new Date()
      }
    })

    // Calculate onboarding progress
    // Check host's Stripe status as fallback for payout (webhook might update host before prospect)
    // Cash preference also counts as payout connected (no Stripe needed)
    const payoutConnected = prospect.payoutConnected ||
      prospect.paymentPreference === 'CASH' ||
      host.stripePayoutsEnabled ||
      host.stripeChargesEnabled ||
      host.payoutsEnabled ||
      false

    // Agreement is done if they chose ITWHIP (no upload needed) or actually uploaded one
    const agreementDone = prospect.agreementPreference === 'ITWHIP' ||
      prospect.agreementUploaded ||
      false

    // Build first car name for completed card display
    const firstCar = host.cars?.[0]
    const firstCarName = firstCar
      ? `${firstCar.year} ${firstCar.make} ${firstCar.model}`
      : null

    const onboardingProgress = {
      carPhotosUploaded: prospect.carPhotosUploaded,
      ratesConfigured: prospect.ratesConfigured,
      payoutConnected,
      agreementUploaded: agreementDone,
      agreementPreference: prospect.agreementPreference || null,
      paymentPreference: prospect.paymentPreference || null,
      firstCarName,
      percentComplete: calculateProgressPercent({ ...prospect, payoutConnected })
    }

    // Calculate time remaining — use request expiresAt or prospect inviteTokenExp
    const expiryDate = fleetRequest.expiresAt || prospect.inviteTokenExp
    let timeRemaining = null
    if (expiryDate) {
      const now = new Date()
      const expiry = new Date(expiryDate)
      const msRemaining = expiry.getTime() - now.getTime()
      if (msRemaining > 0) {
        timeRemaining = {
          ms: msRemaining,
          hours: Math.floor(msRemaining / (1000 * 60 * 60)),
          minutes: Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60)),
          expired: false
        }
      } else {
        timeRemaining = { ms: 0, hours: 0, minutes: 0, expired: true }
      }
    }

    // Guest User + ReviewerProfile created at finalize (via resolveGuestAccount).
    // Before finalize: guestUserId is null → locked guest section on request page.
    // After finalize: booking.renterId is set → fallback below picks it up.
    let guestUserId = fleetRequest.existingGuestId || null

    // Fetch booking snapshot when a fulfilled booking exists
    let bookingSnapshot = null
    let guestInsurance = null
    const fulfilledBookingId = (fleetRequest as any).fulfilledBookingId || null
    if (fulfilledBookingId) {
      const booking = await prisma.rentalBooking.findUnique({
        where: { id: fulfilledBookingId },
        select: {
          id: true, renterId: true, status: true, paymentType: true, paymentStatus: true, bookingType: true,
          agreementStatus: true, agreementSentAt: true, agreementSignedAt: true,
          agreementSignedPdfUrl: true, signerName: true,
          handoffStatus: true, pickupLocation: true, guestName: true, guestEmail: true,
          dailyRate: true, subtotal: true, totalAmount: true, numberOfDays: true,
          startDate: true, endDate: true, startTime: true, endTime: true, createdAt: true,
          tripStartedAt: true, noShowDeadline: true,
          renter: {
            select: {
              reviewerProfile: {
                select: {
                  insuranceProvider: true, policyNumber: true, insuranceVerified: true,
                  insuranceVerifiedAt: true, insuranceCardFrontUrl: true, insuranceCardBackUrl: true,
                  expiryDate: true, coverageType: true, insuranceAddedAt: true,
                }
              }
            }
          }
        }
      })
      if (booking) {
        // Fallback guestUserId from booking's renter
        if (!guestUserId && booking.renterId) guestUserId = booking.renterId
        bookingSnapshot = {
          id: booking.id,
          status: booking.status,
          paymentType: booking.paymentType,
          paymentStatus: booking.paymentStatus,
          bookingType: booking.bookingType,
          agreementStatus: booking.agreementStatus,
          agreementSentAt: booking.agreementSentAt?.toISOString() || null,
          agreementSignedAt: booking.agreementSignedAt?.toISOString() || null,
          agreementSignedPdfUrl: booking.agreementSignedPdfUrl,
          signerName: booking.signerName,
          handoffStatus: booking.handoffStatus,
          pickupLocation: booking.pickupLocation,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          dailyRate: booking.dailyRate,
          subtotal: booking.subtotal,
          totalAmount: booking.totalAmount,
          numberOfDays: booking.numberOfDays,
          startDate: booking.startDate?.toISOString() || null,
          endDate: booking.endDate?.toISOString() || null,
          startTime: booking.startTime,
          endTime: booking.endTime,
          createdAt: booking.createdAt.toISOString(),
          tripStartedAt: booking.tripStartedAt?.toISOString() || null,
          noShowDeadline: booking.noShowDeadline?.toISOString() || null,
          recruitmentAgreementPreference: prospect.agreementPreference || null,
        }
        const rp = booking.renter?.reviewerProfile
        if (rp) {
          guestInsurance = {
            provided: !!(rp.insuranceProvider && rp.policyNumber),
            provider: rp.insuranceProvider || null,
            policyNumber: rp.policyNumber || null,
            verified: rp.insuranceVerified || false,
            verifiedAt: rp.insuranceVerifiedAt?.toISOString() || null,
            cardFrontUrl: rp.insuranceCardFrontUrl || null,
            cardBackUrl: rp.insuranceCardBackUrl || null,
            expiryDate: rp.expiryDate?.toISOString() || null,
            coverageType: rp.coverageType || null,
            addedAt: rp.insuranceAddedAt?.toISOString() || null,
          }
        }
      }
    }

    // Partner info for WhatsNeeded
    const partnerInfo = {
      stripeConnected: !!(host.stripeConnectAccountId && (host.stripeChargesEnabled || host.stripePayoutsEnabled)),
      companyName: host.companyName || null,
      name: host.name,
      email: host.email,
    }

    // Build response
    return NextResponse.json({
      success: true,
      host: {
        id: host.id,
        name: host.name,
        email: host.email,
        phone: host.phone || null,
        hasPassword: host.hasPassword,
        emailVerified: host.emailVerified || false,
        phoneVerified: host.phoneVerified || false,
        onboardingStartedAt: host.onboardingStartedAt,
        onboardingCompletedAt: host.onboardingCompletedAt,
        declinedRequestAt: host.declinedRequestAt,
        cars: host.cars
      },
      prospect: {
        id: prospect.id,
        status: prospect.status,
        counterOfferAmount: prospect.counterOfferAmount,
        counterOfferNote: prospect.counterOfferNote,
        counterOfferStatus: prospect.counterOfferStatus
      },
      request: {
        id: fleetRequest.id,
        status: fleetRequest.status,
        vehicleInfo: (fleetRequest as any).vehicleInfo ?? null,
        guestName: fleetRequest.guestName,
        guestEmail: fleetRequest.guestEmail || null,
        guestPhone: fleetRequest.guestPhone || null,
        guestUserId,
        startDate: fleetRequest.startDate,
        startTime: fleetRequest.startTime || '10:00',
        endDate: fleetRequest.endDate,
        endTime: fleetRequest.endTime || '10:00',
        durationDays: fleetRequest.durationDays,
        pickupCity: fleetRequest.pickupCity,
        pickupState: fleetRequest.pickupState,
        offeredRate: fleetRequest.offeredRate,
        totalAmount: (fleetRequest as any).totalAmount ?? fleetRequest.totalBudget ?? null,
        hostEarnings: (fleetRequest as any).hostEarnings ?? null,
        platformFee: (fleetRequest as any).platformFee ?? null,
        expiresAt: fleetRequest.expiresAt || prospect.inviteTokenExp
      },
      bookingId: fulfilledBookingId,
      bookingSnapshot,
      partnerInfo,
      guestInsurance,
      onboardingProgress,
      timeRemaining,
      agreement: prospect.hostAgreementUrl ? {
        url: prospect.hostAgreementUrl,
        fileName: prospect.hostAgreementName,
        validationScore: prospect.agreementValidationScore,
        validationSummary: prospect.agreementValidationSummary,
        sections: prospect.hostAgreementSections || null
      } : undefined
    })

  } catch (error: any) {
    console.error('[Partner Onboarding API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch onboarding details' },
      { status: 500 }
    )
  }
}

// Calculate onboarding progress percentage
function calculateProgressPercent(prospect: any): number {
  const steps = [
    prospect.carPhotosUploaded,
    prospect.ratesConfigured,
    prospect.payoutConnected
  ]
  const completed = steps.filter(Boolean).length
  return Math.round((completed / steps.length) * 100)
}
