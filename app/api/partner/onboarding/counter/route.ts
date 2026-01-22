// app/api/partner/onboarding/counter/route.ts
// Partner API for recruited hosts to submit a counter-offer

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { logProspectActivity, ACTIVITY_TYPES } from '@/app/lib/auth/host-tokens'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Helper to get current host from auth
async function getCurrentHost() {
  const cookieStore = await cookies()
  // Check multiple token sources
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
        }
      }
    })
  } catch {
    return null
  }
}

// POST /api/partner/onboarding/counter - Submit a counter-offer
export async function POST(request: NextRequest) {
  try {
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if this is a recruited host
    if (!host.recruitedVia) {
      return NextResponse.json(
        { error: 'Not a recruited host' },
        { status: 400 }
      )
    }

    // Check if already declined
    if (host.declinedRequestAt) {
      return NextResponse.json(
        { error: 'Cannot counter-offer - request was declined' },
        { status: 400 }
      )
    }

    // Check if already completed
    if (host.onboardingCompletedAt) {
      return NextResponse.json(
        { error: 'Cannot counter-offer - onboarding already completed' },
        { status: 400 }
      )
    }

    const prospect = host.convertedFromProspect
    if (!prospect) {
      return NextResponse.json(
        { error: 'No linked prospect found' },
        { status: 404 }
      )
    }

    // Check if already has pending counter-offer
    if (prospect.counterOfferStatus === 'PENDING') {
      return NextResponse.json(
        { error: 'You already have a pending counter-offer' },
        { status: 400 }
      )
    }

    // Get counter-offer details from body
    const body = await request.json()
    const { amount, note } = body

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid counter-offer amount' },
        { status: 400 }
      )
    }

    const fleetRequest = prospect.request

    // Validate amount is reasonable (between 50% and 200% of offered rate)
    if (fleetRequest?.offeredRate) {
      const minRate = fleetRequest.offeredRate * 0.5
      const maxRate = fleetRequest.offeredRate * 2
      if (amount < minRate || amount > maxRate) {
        return NextResponse.json(
          {
            error: `Counter-offer must be between $${minRate.toFixed(0)} and $${maxRate.toFixed(0)} per day`,
            minRate,
            maxRate
          },
          { status: 400 }
        )
      }
    }

    // Update prospect with counter-offer
    const now = new Date()

    await prisma.hostProspect.update({
      where: { id: prospect.id },
      data: {
        counterOfferAmount: amount,
        counterOfferNote: note || null,
        counterOfferAt: now,
        counterOfferStatus: 'PENDING',
        status: 'COUNTER_OFFER',
        lastActivityAt: now
      }
    })

    // Log activity
    await logProspectActivity(prospect.id, ACTIVITY_TYPES.COUNTER_OFFER_SUBMITTED, {
      hostId: host.id,
      requestId: prospect.requestId,
      offeredRate: fleetRequest?.offeredRate,
      counterOfferAmount: amount,
      note: note || null
    })

    // Calculate new earnings estimate (assuming 10% platform fee)
    const durationDays = fleetRequest?.durationDays || 14
    const newTotal = amount * durationDays
    const newEarnings = newTotal * 0.9 // After 10% fee

    return NextResponse.json({
      success: true,
      message: 'Counter-offer submitted. Our team will review within 2 hours.',
      counterOffer: {
        amount,
        note: note || null,
        submittedAt: now,
        status: 'PENDING'
      },
      estimates: {
        dailyRate: amount,
        durationDays,
        totalAmount: newTotal,
        hostEarnings: newEarnings,
        platformFee: newTotal - newEarnings
      }
    })

  } catch (error: any) {
    console.error('[Partner Onboarding Counter API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to submit counter-offer' },
      { status: 500 }
    )
  }
}

// GET /api/partner/onboarding/counter - Get counter-offer status
export async function GET(request: NextRequest) {
  try {
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!host.recruitedVia) {
      return NextResponse.json(
        { error: 'Not a recruited host' },
        { status: 400 }
      )
    }

    const prospect = host.convertedFromProspect
    if (!prospect) {
      return NextResponse.json(
        { error: 'No linked prospect found' },
        { status: 404 }
      )
    }

    if (!prospect.counterOfferAmount) {
      return NextResponse.json({
        success: true,
        hasCounterOffer: false
      })
    }

    return NextResponse.json({
      success: true,
      hasCounterOffer: true,
      counterOffer: {
        amount: prospect.counterOfferAmount,
        note: prospect.counterOfferNote,
        submittedAt: prospect.counterOfferAt,
        status: prospect.counterOfferStatus,
        reviewedBy: prospect.counterOfferReviewedBy,
        reviewedAt: prospect.counterOfferReviewedAt
      }
    })

  } catch (error: any) {
    console.error('[Partner Onboarding Counter GET API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get counter-offer status' },
      { status: 500 }
    )
  }
}
