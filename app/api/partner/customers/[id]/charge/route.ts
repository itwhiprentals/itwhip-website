// app/api/partner/customers/[id]/charge/route.ts
// Partner API to charge customer for damage, cleaning, late fees, etc.

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    if (!partner || (partner.hostType !== 'FLEET_PARTNER' && partner.hostType !== 'PARTNER')) {
      return null
    }

    return partner
  } catch {
    return null
  }
}

type ChargeReason = 'damage' | 'cleaning' | 'late_fee' | 'mileage' | 'fuel' | 'other'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: customerId } = await params
    const body = await request.json()

    const { bookingId, reason, amount, description } = body as {
      bookingId: string
      reason: ChargeReason
      amount: number
      description?: string
    }

    if (!bookingId || !reason || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Booking ID, reason, and positive amount are required' },
        { status: 400 }
      )
    }

    // Verify the booking belongs to this partner and customer
    const vehicles = await prisma.rentalCar.findMany({
      where: { hostId: partner.id },
      select: { id: true }
    })
    const vehicleIds = vehicles.map(v => v.id)

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: customerId,
        rentalCarId: { in: vehicleIds }
      },
      include: {
        rentalCar: {
          select: {
            make: true,
            model: true,
            year: true
          }
        },
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or does not belong to this partner' },
        { status: 404 }
      )
    }

    // Check for existing RentalBooking to link TripCharge
    let rentalBooking = await prisma.rentalBooking.findFirst({
      where: {
        legacyBookingId: bookingId
      }
    })

    // If no RentalBooking exists, we'll create a standalone charge record
    // For now, we'll store it in a simpler way using BookingCharge or similar

    // Create charge details JSON
    const chargeDetails = {
      reason,
      description: description || getDefaultDescription(reason),
      createdBy: partner.id,
      createdAt: new Date().toISOString(),
      vehicleName: booking.rentalCar
        ? `${booking.rentalCar.year} ${booking.rentalCar.make} ${booking.rentalCar.model}`
        : 'Unknown Vehicle'
    }

    // Map reason to TripCharge field
    const chargeData = {
      mileageCharge: reason === 'mileage' ? amount : 0,
      fuelCharge: reason === 'fuel' ? amount : 0,
      lateCharge: reason === 'late_fee' ? amount : 0,
      damageCharge: reason === 'damage' ? amount : 0,
      cleaningCharge: reason === 'cleaning' ? amount : 0,
      otherCharges: reason === 'other' ? amount : 0,
      totalCharges: amount,
      chargeDetails: JSON.stringify(chargeDetails),
      chargeStatus: 'PENDING'
    }

    if (rentalBooking) {
      // Create TripCharge linked to RentalBooking
      const tripCharge = await prisma.tripCharge.create({
        data: {
          bookingId: rentalBooking.id,
          ...chargeData
        }
      })

      return NextResponse.json({
        success: true,
        charge: {
          id: tripCharge.id,
          amount,
          reason,
          description: description || getDefaultDescription(reason),
          status: 'pending',
          createdAt: tripCharge.createdAt.toISOString()
        },
        message: `Charge of $${amount.toFixed(2)} for ${reason.replace('_', ' ')} has been created.`
      })
    } else {
      // No RentalBooking - create in legacy system or just log
      // For now, we'll update the booking metadata
      const existingMetadata = (booking.metadata as Record<string, any>) || {}
      const existingCharges = existingMetadata.partnerCharges || []

      const newCharge = {
        id: `charge_${Date.now()}`,
        reason,
        amount,
        description: description || getDefaultDescription(reason),
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdBy: partner.id
      }

      existingCharges.push(newCharge)

      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          metadata: {
            ...existingMetadata,
            partnerCharges: existingCharges
          }
        }
      })

      return NextResponse.json({
        success: true,
        charge: newCharge,
        message: `Charge of $${amount.toFixed(2)} for ${reason.replace('_', ' ')} has been created.`
      })
    }

  } catch (error) {
    console.error('[Partner Charge Customer] Error:', error)
    return NextResponse.json({ error: 'Failed to create charge' }, { status: 500 })
  }
}

// GET - Get charges for a customer's booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: customerId } = await params
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')

    // Get partner's vehicles
    const vehicles = await prisma.rentalCar.findMany({
      where: { hostId: partner.id },
      select: { id: true }
    })
    const vehicleIds = vehicles.map(v => v.id)

    // Build query
    const where: any = {
      userId: customerId,
      rentalCarId: { in: vehicleIds }
    }
    if (bookingId) {
      where.id = bookingId
    }

    const bookings = await prisma.booking.findMany({
      where,
      select: {
        id: true,
        metadata: true
      }
    })

    // Collect all charges from booking metadata
    const allCharges: any[] = []

    for (const booking of bookings) {
      const metadata = (booking.metadata as Record<string, any>) || {}
      const partnerCharges = metadata.partnerCharges || []

      for (const charge of partnerCharges) {
        allCharges.push({
          ...charge,
          bookingId: booking.id
        })
      }
    }

    // Also get TripCharges from RentalBookings
    const rentalBookings = await prisma.rentalBooking.findMany({
      where: {
        legacyBookingId: { in: bookings.map(b => b.id) }
      },
      include: {
        tripCharges: true
      }
    })

    for (const rb of rentalBookings) {
      for (const tc of rb.tripCharges) {
        const details = tc.chargeDetails ? JSON.parse(tc.chargeDetails) : {}
        allCharges.push({
          id: tc.id,
          bookingId: rb.legacyBookingId,
          reason: details.reason || 'other',
          amount: Number(tc.totalCharges),
          description: details.description || '',
          status: tc.chargeStatus.toLowerCase(),
          createdAt: tc.createdAt.toISOString()
        })
      }
    }

    // Sort by date desc
    allCharges.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({
      success: true,
      charges: allCharges
    })

  } catch (error) {
    console.error('[Partner Get Charges] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch charges' }, { status: 500 })
  }
}

function getDefaultDescription(reason: ChargeReason): string {
  switch (reason) {
    case 'damage':
      return 'Vehicle damage charge'
    case 'cleaning':
      return 'Excessive cleaning required'
    case 'late_fee':
      return 'Late return fee'
    case 'mileage':
      return 'Mileage overage charge'
    case 'fuel':
      return 'Fuel replenishment charge'
    case 'other':
      return 'Additional charge'
    default:
      return 'Charge'
  }
}
