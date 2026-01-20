// app/api/fleet/requests/[id]/route.ts
// Admin API for individual reservation request operations

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// GET /api/fleet/requests/[id] - Get a specific request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const reservationRequest = await prisma.reservationRequest.findUnique({
      where: { id },
      include: {
        claims: {
          include: {
            host: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                profilePhoto: true,
                city: true,
                state: true,
                rating: true,
                totalTrips: true
              }
            },
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
            booking: {
              select: {
                id: true,
                bookingCode: true,
                status: true
              }
            }
          },
          orderBy: { claimedAt: 'desc' }
        },
        invitedProspects: {
          orderBy: { createdAt: 'desc' }
        },
        fulfilledBooking: {
          select: {
            id: true,
            bookingCode: true,
            status: true,
            startDate: true,
            endDate: true,
            totalAmount: true,
            guestName: true
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

    return NextResponse.json({
      success: true,
      request: reservationRequest
    })

  } catch (error: any) {
    console.error('[Fleet Request API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch request' },
      { status: 500 }
    )
  }
}

// PATCH /api/fleet/requests/[id] - Update a request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if request exists
    const existing = await prisma.reservationRequest.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Fields that can be updated
    const {
      guestName,
      guestEmail,
      guestPhone,
      companyName,
      vehicleType,
      vehicleClass,
      vehicleMake,
      vehicleModel,
      quantity,
      startDate,
      endDate,
      durationDays,
      pickupCity,
      pickupState,
      pickupAddress,
      dropoffCity,
      dropoffState,
      dropoffAddress,
      offeredRate,
      totalBudget,
      isNegotiable,
      status,
      priority,
      guestNotes,
      adminNotes,
      expiresAt
    } = body

    // Calculate duration if dates changed
    let calculatedDuration = durationDays
    const newStartDate = startDate ? new Date(startDate) : existing.startDate
    const newEndDate = endDate ? new Date(endDate) : existing.endDate
    if (newStartDate && newEndDate && !durationDays) {
      calculatedDuration = Math.ceil((newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60 * 24))
    }

    const reservationRequest = await prisma.reservationRequest.update({
      where: { id },
      data: {
        guestName,
        guestEmail,
        guestPhone,
        companyName,
        vehicleType,
        vehicleClass,
        vehicleMake,
        vehicleModel,
        quantity,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        durationDays: calculatedDuration,
        pickupCity,
        pickupState,
        pickupAddress,
        dropoffCity,
        dropoffState,
        dropoffAddress,
        offeredRate,
        totalBudget,
        isNegotiable,
        status,
        priority,
        guestNotes,
        adminNotes,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      }
    })

    return NextResponse.json({
      success: true,
      request: reservationRequest
    })

  } catch (error: any) {
    console.error('[Fleet Request API] Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    )
  }
}

// DELETE /api/fleet/requests/[id] - Delete a request (or cancel it)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const hardDelete = searchParams.get('hard') === 'true'

    const existing = await prisma.reservationRequest.findUnique({
      where: { id },
      include: {
        claims: true,
        fulfilledBooking: true
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Don't allow deletion if request is fulfilled
    if (existing.fulfilledBooking) {
      return NextResponse.json(
        { error: 'Cannot delete a fulfilled request' },
        { status: 400 }
      )
    }

    if (hardDelete) {
      // Hard delete - remove from database
      // First delete related claims
      await prisma.requestClaim.deleteMany({
        where: { requestId: id }
      })

      await prisma.reservationRequest.delete({
        where: { id }
      })

      return NextResponse.json({
        success: true,
        message: 'Request deleted'
      })
    } else {
      // Soft delete - just mark as cancelled
      const reservationRequest = await prisma.reservationRequest.update({
        where: { id },
        data: { status: 'CANCELLED' }
      })

      // Expire any active claims
      await prisma.requestClaim.updateMany({
        where: {
          requestId: id,
          status: { in: ['PENDING_CAR', 'CAR_SELECTED'] }
        },
        data: {
          status: 'EXPIRED',
          expiredAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        request: reservationRequest
      })
    }

  } catch (error: any) {
    console.error('[Fleet Request API] Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete request' },
      { status: 500 }
    )
  }
}
