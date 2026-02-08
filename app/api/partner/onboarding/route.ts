// app/api/partner/onboarding/route.ts
// Partner API for recruited hosts to view their onboarding request

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { logProspectActivity, ACTIVITY_TYPES } from '@/app/lib/auth/host-tokens'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

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
            year: true,
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
    const payoutConnected = prospect.payoutConnected ||
      host.stripePayoutsEnabled ||
      host.stripeChargesEnabled ||
      host.payoutsEnabled ||
      false

    const onboardingProgress = {
      carPhotosUploaded: prospect.carPhotosUploaded,
      ratesConfigured: prospect.ratesConfigured,
      payoutConnected,
      agreementUploaded: prospect.agreementUploaded,
      percentComplete: calculateProgressPercent({ ...prospect, payoutConnected })
    }

    // Calculate time remaining (if request has expiry)
    let timeRemaining = null
    if (fleetRequest.expiresAt) {
      const now = new Date()
      const expiry = new Date(fleetRequest.expiresAt)
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

    // Build response
    return NextResponse.json({
      success: true,
      host: {
        id: host.id,
        name: host.name,
        email: host.email,
        hasPassword: host.hasPassword,
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
        guestRating: (fleetRequest as any).guestRating ?? null,
        guestTrips: (fleetRequest as any).guestTrips ?? null,
        startDate: fleetRequest.startDate,
        endDate: fleetRequest.endDate,
        durationDays: fleetRequest.durationDays,
        pickupCity: fleetRequest.pickupCity,
        pickupState: fleetRequest.pickupState,
        offeredRate: fleetRequest.offeredRate,
        totalAmount: (fleetRequest as any).totalAmount ?? fleetRequest.totalBudget ?? null,
        hostEarnings: (fleetRequest as any).hostEarnings ?? null,
        platformFee: (fleetRequest as any).platformFee ?? null,
        expiresAt: fleetRequest.expiresAt
      },
      onboardingProgress,
      timeRemaining,
      agreement: prospect.hostAgreementUrl ? {
        url: prospect.hostAgreementUrl,
        fileName: prospect.hostAgreementName,
        validationScore: prospect.agreementValidationScore,
        validationSummary: prospect.agreementValidationSummary
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
