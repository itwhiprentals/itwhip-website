// app/api/host/claims/trip-charges/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { Decimal } from '@prisma/client/runtime/library'

// POST /api/host/claims/trip-charges/create - Create additional trip charges
export async function POST(request: NextRequest) {
  try {
    // Get host info from middleware headers
    const hostId = request.headers.get('x-host-id')
    const isApproved = request.headers.get('x-host-approved') === 'true'

    if (!hostId) {
      return NextResponse.json(
        { error: 'Unauthorized - Host ID not found' },
        { status: 401 }
      )
    }

    // Check if host is approved
    if (!isApproved) {
      return NextResponse.json(
        { 
          error: 'Only approved hosts can file trip charges',
          action: 'create_trip_charges',
          requiresApproval: true
        },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      bookingId,
      additionalCharges,
      notes,
      evidencePhotos
    } = body

    // Validation - Required fields
    if (!bookingId || !additionalCharges || !Array.isArray(additionalCharges) || additionalCharges.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId and additionalCharges array' },
        { status: 400 }
      )
    }

    if (!notes || notes.trim().length < 20) {
      return NextResponse.json(
        { error: 'Notes must be at least 20 characters explaining the charges' },
        { status: 400 }
      )
    }

    // Validate each charge
    for (const charge of additionalCharges) {
      if (!charge.type || !['mileage', 'fuel', 'late', 'damage', 'cleaning', 'other'].includes(charge.type)) {
        return NextResponse.json(
          { error: 'Invalid charge type. Must be: mileage, fuel, late, damage, cleaning, or other' },
          { status: 400 }
        )
      }

      if (!charge.amount || charge.amount <= 0 || charge.amount > 10000) {
        return NextResponse.json(
          { error: 'Each charge amount must be between $0 and $10,000' },
          { status: 400 }
        )
      }

      if (!charge.description || charge.description.trim().length === 0) {
        return NextResponse.json(
          { error: 'Each charge must have a description' },
          { status: 400 }
        )
      }
    }

    // Verify booking exists and belongs to this host
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true
          }
        },
        renter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify host owns this booking
    if (booking.hostId !== hostId) {
      return NextResponse.json(
        { error: 'You do not own this booking. Cannot file charges for another host\'s booking.' },
        { status: 403 }
      )
    }

    // Verify booking is completed
    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { 
          error: 'Booking must be completed to file after-trip charges',
          bookingStatus: booking.status
        },
        { status: 400 }
      )
    }

    // Verify trip has ended
    if (!booking.tripEndedAt) {
      return NextResponse.json(
        { error: 'Trip must have ended to file charges. Please ensure the trip is completed.' },
        { status: 400 }
      )
    }

    // Check if there are existing charges
    const existingCharge = await prisma.tripCharge.findFirst({
      where: { bookingId }
    })

    // Calculate charge amounts by type
    const chargesByType = {
      mileageCharge: new Decimal(0),
      fuelCharge: new Decimal(0),
      lateCharge: new Decimal(0),
      damageCharge: new Decimal(0),
      cleaningCharge: new Decimal(0),
      otherCharges: new Decimal(0)
    }

    additionalCharges.forEach((charge: any) => {
      const amount = new Decimal(charge.amount)
      switch (charge.type) {
        case 'mileage':
          chargesByType.mileageCharge = chargesByType.mileageCharge.plus(amount)
          break
        case 'fuel':
          chargesByType.fuelCharge = chargesByType.fuelCharge.plus(amount)
          break
        case 'late':
          chargesByType.lateCharge = chargesByType.lateCharge.plus(amount)
          break
        case 'damage':
          chargesByType.damageCharge = chargesByType.damageCharge.plus(amount)
          break
        case 'cleaning':
          chargesByType.cleaningCharge = chargesByType.cleaningCharge.plus(amount)
          break
        case 'other':
          chargesByType.otherCharges = chargesByType.otherCharges.plus(amount)
          break
      }
    })

    const totalCharges = Object.values(chargesByType).reduce(
      (sum, val) => sum.plus(val), 
      new Decimal(0)
    )

    // Build detailed charge breakdown
    const chargeDetails = {
      additionalCharges: additionalCharges.map((charge: any) => ({
        type: charge.type,
        amount: charge.amount,
        description: charge.description
      })),
      notes: notes.trim(),
      evidencePhotos: evidencePhotos || [],
      filedBy: 'HOST',
      filedByHostId: hostId,
      filedAt: new Date().toISOString(),
      existingChargeId: existingCharge?.id || null
    }

    let tripCharge

    if (existingCharge) {
      // Update existing charge by adding additional amounts
      tripCharge = await prisma.tripCharge.update({
        where: { id: existingCharge.id },
        data: {
          mileageCharge: existingCharge.mileageCharge.plus(chargesByType.mileageCharge),
          fuelCharge: existingCharge.fuelCharge.plus(chargesByType.fuelCharge),
          lateCharge: existingCharge.lateCharge.plus(chargesByType.lateCharge),
          damageCharge: existingCharge.damageCharge.plus(chargesByType.damageCharge),
          cleaningCharge: existingCharge.cleaningCharge.plus(chargesByType.cleaningCharge),
          otherCharges: existingCharge.otherCharges.plus(chargesByType.otherCharges),
          totalCharges: existingCharge.totalCharges.plus(totalCharges),
          chargeDetails: JSON.stringify(chargeDetails),
          chargeStatus: 'UNDER_REVIEW', // Needs admin approval
          requiresApproval: true,
          adminNotes: `Additional charges filed by host on ${new Date().toISOString()}`,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new trip charge
      tripCharge = await prisma.tripCharge.create({
        data: {
          bookingId,
          mileageCharge: chargesByType.mileageCharge,
          fuelCharge: chargesByType.fuelCharge,
          lateCharge: chargesByType.lateCharge,
          damageCharge: chargesByType.damageCharge,
          cleaningCharge: chargesByType.cleaningCharge,
          otherCharges: chargesByType.otherCharges,
          totalCharges: totalCharges,
          chargeDetails: JSON.stringify(chargeDetails),
          chargeStatus: 'UNDER_REVIEW', // Needs admin approval
          requiresApproval: true,
          adminNotes: `Charges filed by host on ${new Date().toISOString()}`,
          // Set 48-hour hold for guest dispute window
          holdUntil: new Date(Date.now() + 48 * 60 * 60 * 1000),
          guestNotifiedAt: new Date()
        }
      })
    }

    // Update booking to flag that charges were added
    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'PENDING_CHARGES',
        updatedAt: new Date()
      }
    })

    // Create admin notification for review
    await prisma.adminNotification.create({
      data: {
        type: 'PENDING_CHARGES',
        title: 'New Trip Charges Require Review',
        message: `Host has filed additional charges for booking ${booking.bookingCode}. Total: $${totalCharges.toFixed(2)}`,
        priority: 'HIGH',
        status: 'UNREAD',
        actionRequired: true,
        actionUrl: `/fleet/bookings/${bookingId}/charges`,
        relatedId: tripCharge.id,
        relatedType: 'trip_charge',
        metadata: {
          bookingId,
          bookingCode: booking.bookingCode,
          hostId,
          totalCharges: totalCharges.toNumber(),
          chargeCount: additionalCharges.length
        }
      }
    })

    // Format response
    const formattedCharge = {
      id: tripCharge.id,
      bookingId: tripCharge.bookingId,
      totalCharges: tripCharge.totalCharges,
      chargeStatus: tripCharge.chargeStatus,
      holdUntil: tripCharge.holdUntil?.toISOString() || null,
      guestNotifiedAt: tripCharge.guestNotifiedAt?.toISOString() || null,
      createdAt: tripCharge.createdAt.toISOString(),
      
      booking: {
        bookingCode: booking.bookingCode,
        car: booking.car ? {
          displayName: `${booking.car.year} ${booking.car.make} ${booking.car.model}`
        } : null,
        guest: booking.renter ? {
          name: booking.renter.name,
          email: booking.renter.email
        } : booking.guestName ? {
          name: booking.guestName,
          email: booking.guestEmail || 'N/A'
        } : null
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Additional charges filed successfully. Guest has 48 hours to dispute. Admin will review charges within 24-72 hours.',
      chargeId: tripCharge.id,
      charge: formattedCharge
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating trip charges:', error)
    return NextResponse.json(
      { error: 'Failed to create trip charges. Please try again.' },
      { status: 500 }
    )
  }
}