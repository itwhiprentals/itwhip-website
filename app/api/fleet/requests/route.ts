// app/api/fleet/requests/route.ts
// Admin API for managing reservation requests

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { nanoid } from 'nanoid'

// GET /api/fleet/requests - List all reservation requests
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Filters
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const requestType = searchParams.get('type')
    const city = searchParams.get('city')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status) where.status = status
    if (priority) where.priority = priority
    if (requestType) where.requestType = requestType
    if (city) where.pickupCity = { contains: city, mode: 'insensitive' }

    // Get requests with claims and prospects
    const [requests, total] = await Promise.all([
      prisma.reservationRequest.findMany({
        where,
        include: {
          claims: {
            include: {
              host: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profilePhoto: true
                }
              },
              car: {
                select: {
                  id: true,
                  make: true,
                  model: true,
                  year: true
                }
              }
            },
            orderBy: { claimedAt: 'desc' }
          },
          invitedProspects: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
              inviteSentAt: true
            }
          },
          fulfilledBooking: {
            select: {
              id: true,
              bookingCode: true,
              status: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.reservationRequest.count({ where })
    ])

    // Calculate stats
    const stats = await prisma.reservationRequest.groupBy({
      by: ['status'],
      _count: { id: true }
    })

    const statusCounts = stats.reduce((acc, s) => {
      acc[s.status] = s._count.id
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      requests,
      stats: statusCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })

  } catch (error: any) {
    console.error('[Fleet Requests API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}

// POST /api/fleet/requests - Create a new reservation request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      // Guest info
      guestName,
      guestEmail,
      guestPhone,
      companyName,
      // Vehicle requirements
      vehicleType,
      vehicleClass,
      vehicleMake,
      vehicleModel,
      quantity,
      // Dates & location
      startDate,
      startTime,
      endDate,
      endTime,
      durationDays,
      pickupCity,
      pickupState,
      pickupAddress,
      dropoffCity,
      dropoffState,
      dropoffAddress,
      // Pricing
      offeredRate,
      totalBudget,
      isNegotiable,
      // Other
      requestType,
      priority,
      guestNotes,
      adminNotes,
      source,
      sourceDetails,
      expiresAt,
      createdBy,
      // Existing guest linking
      guestSelectionType,
      existingGuestId,
      existingBookingId,
    } = body

    // Validate required fields
    if (!guestName) {
      return NextResponse.json(
        { error: 'Guest name is required' },
        { status: 400 }
      )
    }

    // Check uniqueness of existingBookingId
    if (existingBookingId) {
      const existingClaim = await prisma.reservationRequest.findFirst({
        where: { existingBookingId, status: { not: 'CANCELLED' } }
      })
      if (existingClaim) {
        return NextResponse.json(
          { error: 'This booking is already linked to another request' },
          { status: 409 }
        )
      }
    }

    // Generate request code
    const requestCode = `REQ-${nanoid(8).toUpperCase()}`

    // Calculate duration if dates provided
    let calculatedDuration = durationDays
    if (startDate && endDate && !durationDays) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      calculatedDuration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    }

    // Create the request
    const reservationRequest = await prisma.reservationRequest.create({
      data: {
        requestCode,
        requestType: requestType || 'STANDARD',
        guestName,
        guestEmail,
        guestPhone,
        companyName,
        vehicleType,
        vehicleClass,
        vehicleMake,
        vehicleModel,
        quantity: quantity || 1,
        startDate: startDate ? new Date(startDate) : null,
        startTime: startTime || '10:00',
        endDate: endDate ? new Date(endDate) : null,
        endTime: endTime || '10:00',
        durationDays: calculatedDuration,
        pickupCity,
        pickupState,
        pickupAddress,
        dropoffCity,
        dropoffState,
        dropoffAddress,
        offeredRate,
        totalBudget,
        isNegotiable: isNegotiable ?? true,
        status: 'OPEN',
        priority: priority || 'NORMAL',
        guestNotes,
        adminNotes,
        source,
        sourceDetails,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy,
        guestSelectionType: guestSelectionType || 'NEW',
        existingGuestId: existingGuestId || null,
        existingBookingId: existingBookingId || null,
      }
    })

    // If this request replaces an existing booking, update the original
    let modifiedBooking = null
    if (existingBookingId) {
      const originalBooking = await prisma.rentalBooking.findUnique({
        where: { id: existingBookingId },
        select: {
          id: true, status: true, bookingCode: true, renterId: true,
          hostId: true, carId: true, startDate: true, endDate: true,
          startTime: true, endTime: true, dailyRate: true, numberOfDays: true,
          subtotal: true, serviceFee: true, taxes: true, insuranceFee: true,
          depositAmount: true, totalAmount: true, securityDeposit: true,
          insuranceSelection: true, insuranceTier: true, insuranceProvider: true,
          pickupLocation: true, paymentIntentId: true,
          car: { select: { make: true, model: true, year: true } },
          host: { select: { name: true, id: true, userId: true } },
        }
      })

      if (originalBooking && originalBooking.status !== 'CANCELLED' && originalBooking.status !== 'MODIFIED') {
        // Mark original as MODIFIED (not cancelled — host/guest see "updated")
        modifiedBooking = await prisma.rentalBooking.update({
          where: { id: existingBookingId },
          data: {
            status: 'MODIFIED',
            replacedByBookingId: reservationRequest.id, // link to the request for now
            cancellationReason: 'MODIFIED — converted to manual booking via fleet request ' + reservationRequest.requestCode,
            cancelledBy: 'SYSTEM',
            cancelledAt: new Date(),
          }
        })

        console.log(`[Fleet Request] Booking ${originalBooking.bookingCode} marked as MODIFIED → request ${reservationRequest.requestCode}`)

        // NOTE: Stripe PI is NOT auto-cancelled — admin manually refunds
        if (originalBooking.paymentIntentId) {
          console.log(`[Fleet Request] PI ${originalBooking.paymentIntentId} left as-is for manual refund`)
        }

        // === AUTO-CREATE MANUAL BOOKING (Scenario 1: same host/car) ===
        const newBookingCode = `RENT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

        const newBooking = await prisma.rentalBooking.create({
          data: {
            id: nanoid(),
            bookingCode: newBookingCode,
            carId: originalBooking.carId,
            hostId: originalBooking.hostId,
            renterId: originalBooking.renterId,
            guestEmail: guestEmail || null,
            guestName: guestName || null,
            guestPhone: guestPhone || null,
            startDate: startDate ? new Date(startDate) : originalBooking.startDate,
            endDate: endDate ? new Date(endDate) : originalBooking.endDate,
            startTime: startTime || originalBooking.startTime || '10:00',
            endTime: endTime || originalBooking.endTime || '10:00',
            dailyRate: offeredRate ? Number(offeredRate) : (originalBooking.dailyRate || 0),
            numberOfDays: calculatedDuration || originalBooking.numberOfDays || 1,
            subtotal: Number(originalBooking.subtotal) || ((offeredRate ? Number(offeredRate) : (originalBooking.dailyRate || 0)) * (calculatedDuration || originalBooking.numberOfDays || 1)),
            serviceFee: Number(originalBooking.serviceFee) || 0,
            taxes: Number(originalBooking.taxes) || 0,
            depositAmount: Number(originalBooking.depositAmount) || 0,
            totalAmount: Number(originalBooking.totalAmount) || ((offeredRate ? Number(offeredRate) : (originalBooking.dailyRate || 0)) * (calculatedDuration || originalBooking.numberOfDays || 1)),
            status: 'PENDING',
            paymentStatus: 'PENDING',
            bookingType: 'MANUAL',
            originalBookingId: existingBookingId,
            originalCarId: originalBooking.carId,
            verificationStatus: 'APPROVED',
            fleetStatus: 'APPROVED',
            hostStatus: 'APPROVED',
            pickupLocation: pickupAddress || originalBooking.pickupLocation || 'TBD',
            pickupType: 'OWNER_PICKUP',
            agreementStatus: 'not_sent',
            updatedAt: new Date(),
            insuranceFee: Number(originalBooking.insuranceFee) || 0,
            insuranceSelection: originalBooking.insuranceSelection || null,
            insuranceTier: originalBooking.insuranceTier || null,
            insuranceProvider: originalBooking.insuranceProvider || null,
            deliveryFee: 0,
            depositHeld: 0,
            securityDeposit: Number(originalBooking.securityDeposit) || 0,
          }
        })

        // Link old booking to new one
        await prisma.rentalBooking.update({
          where: { id: existingBookingId },
          data: { replacedByBookingId: newBooking.id }
        })

        // Update request with the fulfilled booking
        await prisma.reservationRequest.update({
          where: { id: reservationRequest.id },
          data: { status: 'FULFILLED', fulfilledBookingId: newBooking.id }
        })

        console.log(`[Fleet Request] Manual booking ${newBookingCode} created from ${originalBooking.bookingCode}`)

        // Send push notifications
        const carName = originalBooking.car ? `${originalBooking.car.year} ${originalBooking.car.make} ${originalBooking.car.model}` : 'vehicle'

        // Notify guest
        if (originalBooking.renterId) {
          try {
            await prisma.pushNotification.create({
              data: {
                userId: originalBooking.renterId,
                title: 'Booking Updated',
                body: `Your booking for ${carName} has been updated. View your new reservation for details.`,
                type: 'booking_modified',
                data: { bookingId: newBooking.id, oldBookingId: existingBookingId, requestCode: reservationRequest.requestCode },
              }
            }).catch(() => {})
          } catch {}
        }

        // Notify host — send agreement to guest
        if (originalBooking.host?.userId) {
          try {
            await prisma.pushNotification.create({
              data: {
                userId: originalBooking.host.userId,
                title: 'New Manual Booking',
                body: `A booking for ${carName} has been assigned to you. Send the rental agreement to the guest to proceed.`,
                type: 'manual_booking_created',
                data: { bookingId: newBooking.id, bookingCode: newBookingCode },
              }
            }).catch(() => {})
          } catch {}
        }
      }
    }

    return NextResponse.json({
      success: true,
      request: reservationRequest,
      modifiedBooking: modifiedBooking ? {
        id: modifiedBooking.id,
        bookingCode: modifiedBooking.bookingCode,
        status: modifiedBooking.status,
      } : null,
    })

  } catch (error: any) {
    console.error('[Fleet Requests API] Create error:', error)
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    )
  }
}
