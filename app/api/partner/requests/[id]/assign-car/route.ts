// app/api/partner/requests/[id]/assign-car/route.ts
// Partner API for hosts to assign a car to their claim

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { nanoid } from 'nanoid'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Helper to get current host from auth
async function getCurrentHost() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value

  if (!token) return null

  try {
    const decoded = verify(token, JWT_SECRET) as { hostId: string }
    return await prisma.rentalHost.findUnique({
      where: { id: decoded.hostId }
    })
  } catch {
    return null
  }
}

// POST /api/partner/requests/[id]/assign-car - Assign car to claim
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

    const body = await request.json()
    const { carId, offeredRate } = body

    if (!carId) {
      return NextResponse.json(
        { error: 'Car ID is required' },
        { status: 400 }
      )
    }

    // Find the claim
    const claim = await prisma.requestClaim.findUnique({
      where: {
        requestId_hostId: {
          requestId,
          hostId: host.id
        }
      },
      include: {
        request: true
      }
    })

    if (!claim) {
      return NextResponse.json(
        { error: 'You don\'t have a claim on this request' },
        { status: 404 }
      )
    }

    // Check if claim has expired
    if (new Date() > claim.claimExpiresAt) {
      // Mark claim as expired
      await prisma.requestClaim.update({
        where: { id: claim.id },
        data: {
          status: 'EXPIRED',
          expiredAt: new Date()
        }
      })

      // Set request back to OPEN
      await prisma.reservationRequest.update({
        where: { id: requestId },
        data: { status: 'OPEN' }
      })

      return NextResponse.json(
        { error: 'Your claim has expired. The request is now available for others.' },
        { status: 400 }
      )
    }

    // Check claim status
    if (claim.status !== 'PENDING_CAR') {
      return NextResponse.json(
        { error: `Cannot assign car to a claim with status: ${claim.status}` },
        { status: 400 }
      )
    }

    // Verify the car belongs to this host and is active
    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId: host.id,
        isActive: true
      },
      include: {
        photos: {
          select: { url: true },
          take: 1
        }
      }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found or not active' },
        { status: 404 }
      )
    }

    // Check if car is available for the requested dates
    if (claim.request.startDate && claim.request.endDate) {
      const conflictingBooking = await prisma.rentalBooking.findFirst({
        where: {
          carId,
          status: { in: ['CONFIRMED', 'ACTIVE'] },
          OR: [
            {
              startDate: { lte: claim.request.endDate },
              endDate: { gte: claim.request.startDate }
            }
          ]
        }
      })

      if (conflictingBooking) {
        return NextResponse.json(
          { error: 'This car is not available for the requested dates' },
          { status: 409 }
        )
      }
    }

    // Update the claim with car assignment
    const updatedClaim = await prisma.requestClaim.update({
      where: { id: claim.id },
      data: {
        carId,
        status: 'CAR_SELECTED',
        carAssignedAt: new Date(),
        offeredRate: offeredRate || car.dailyRate
      },
      include: {
        car: {
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
        },
        request: true
      }
    })

    // Update request status
    await prisma.reservationRequest.update({
      where: { id: requestId },
      data: { status: 'CAR_ASSIGNED' }
    })

    // TODO: At this point, you could auto-create a booking or notify admin
    // For now, we'll let admin finalize the booking manually

    return NextResponse.json({
      success: true,
      claim: updatedClaim,
      message: 'Car assigned successfully! The booking will be created shortly.',
      nextStep: 'Admin will finalize the booking and notify the guest.'
    })

  } catch (error: any) {
    console.error('[Partner Assign Car API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to assign car' },
      { status: 500 }
    )
  }
}
