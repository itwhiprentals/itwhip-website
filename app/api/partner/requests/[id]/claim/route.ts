// app/api/partner/requests/[id]/claim/route.ts
// Partner API for hosts to claim a reservation request

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const CLAIM_TIMEOUT_MINUTES = 30 // 30 minutes to add a car

// Helper to get current host from auth
async function getCurrentHost() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value

  if (!token) return null

  try {
    const decoded = verify(token, JWT_SECRET) as { hostId: string }
    return await prisma.rentalHost.findUnique({
      where: { id: decoded.hostId },
      select: {
        id: true,
        name: true,
        email: true,
        approvalStatus: true,
        cars: {
          where: { isActive: true },
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            dailyRate: true,
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

// POST /api/partner/requests/[id]/claim - Claim a request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check host approval status
    if (host.approvalStatus !== 'APPROVED' && host.approvalStatus !== 'PENDING') {
      return NextResponse.json(
        { error: 'Your account is not approved to claim requests' },
        { status: 403 }
      )
    }

    // Get the request
    const reservationRequest = await prisma.reservationRequest.findUnique({
      where: { id: requestId },
      include: {
        claims: {
          where: {
            status: { in: ['PENDING_CAR', 'CAR_SELECTED'] }
          }
        }
      }
    })

    if (!reservationRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Check if request is still open
    if (reservationRequest.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'This request is no longer available' },
        { status: 400 }
      )
    }

    // Check if request has expired
    if (reservationRequest.expiresAt && new Date() > reservationRequest.expiresAt) {
      return NextResponse.json(
        { error: 'This request has expired' },
        { status: 400 }
      )
    }

    // Check if host already has an active claim on this request
    const existingClaim = await prisma.requestClaim.findUnique({
      where: {
        requestId_hostId: {
          requestId,
          hostId: host.id
        }
      }
    })

    if (existingClaim) {
      if (existingClaim.status === 'PENDING_CAR' || existingClaim.status === 'CAR_SELECTED') {
        return NextResponse.json(
          { error: 'You already have an active claim on this request', claim: existingClaim },
          { status: 400 }
        )
      }
      // If previous claim expired/withdrawn, they can try again
    }

    // Check if another host has already claimed (first come first serve)
    if (reservationRequest.claims.length > 0) {
      return NextResponse.json(
        { error: 'This request has already been claimed by another host' },
        { status: 409 }
      )
    }

    // Get optional car selection from body
    const body = await request.json().catch(() => ({}))
    const { carId, offeredRate, hostNotes } = body

    // Calculate claim expiration (30 minutes from now)
    const claimExpiresAt = new Date(Date.now() + CLAIM_TIMEOUT_MINUTES * 60 * 1000)

    // Create the claim
    const claim = await prisma.requestClaim.create({
      data: {
        requestId,
        hostId: host.id,
        carId: carId || null,
        status: carId ? 'CAR_SELECTED' : 'PENDING_CAR',
        claimExpiresAt,
        offeredRate,
        hostNotes,
        carAssignedAt: carId ? new Date() : null
      },
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            dailyRate: true
          }
        }
      }
    })

    // Update request status to CLAIMED
    await prisma.reservationRequest.update({
      where: { id: requestId },
      data: {
        status: 'CLAIMED',
        claimAttempts: { increment: 1 }
      }
    })

    return NextResponse.json({
      success: true,
      claim,
      expiresAt: claimExpiresAt,
      timeoutMinutes: CLAIM_TIMEOUT_MINUTES,
      availableCars: host.cars,
      message: carId
        ? 'Request claimed with car selected. Waiting for booking creation.'
        : `Request claimed! You have ${CLAIM_TIMEOUT_MINUTES} minutes to select a car.`
    })

  } catch (error: any) {
    console.error('[Partner Claim API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to claim request' },
      { status: 500 }
    )
  }
}

// DELETE /api/partner/requests/[id]/claim - Withdraw claim
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find the claim
    const claim = await prisma.requestClaim.findUnique({
      where: {
        requestId_hostId: {
          requestId,
          hostId: host.id
        }
      }
    })

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      )
    }

    // Can only withdraw if still pending
    if (claim.status !== 'PENDING_CAR' && claim.status !== 'CAR_SELECTED') {
      return NextResponse.json(
        { error: 'Cannot withdraw a completed or expired claim' },
        { status: 400 }
      )
    }

    // Update claim status
    await prisma.requestClaim.update({
      where: { id: claim.id },
      data: {
        status: 'WITHDRAWN',
        withdrawnAt: new Date()
      }
    })

    // Set request back to OPEN
    await prisma.reservationRequest.update({
      where: { id: requestId },
      data: { status: 'OPEN' }
    })

    return NextResponse.json({
      success: true,
      message: 'Claim withdrawn successfully'
    })

  } catch (error: any) {
    console.error('[Partner Claim API] Withdraw error:', error)
    return NextResponse.json(
      { error: 'Failed to withdraw claim' },
      { status: 500 }
    )
  }
}
