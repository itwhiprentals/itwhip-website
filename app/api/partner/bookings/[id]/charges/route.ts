// app/api/partner/bookings/[id]/charges/route.ts
// Add trip charges to a booking

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { z } from 'zod'

const tripChargeSchema = z.object({
  chargeType: z.enum(['damage', 'cleaning', 'late_fee', 'mileage_overage', 'fuel', 'toll', 'traffic_violation', 'other']),
  amount: z.number().positive().max(50000),
  description: z.string().max(1000).optional(),
})

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
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

// POST - Add a charge to a booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: bookingId } = await params
    const body = await request.json()
    const parsed = tripChargeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    const { chargeType, amount, description } = parsed.data

    // Verify booking belongs to partner
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        hostId: partner.id
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Map charge type to the individual charge field
    const chargeData: Record<string, unknown> = {
      bookingId: bookingId,
      totalCharges: amount,
      chargeStatus: 'PENDING',
      chargeDetails: {
        type: chargeType,
        description: description || chargeType,
        notes: description || '',
        addedBy: partner.id,
        addedAt: new Date().toISOString()
      },
      mileageCharge: 0,
      fuelCharge: 0,
      lateCharge: 0,
      damageCharge: 0,
      cleaningCharge: 0,
      otherCharges: 0
    }

    // Set the specific charge field based on type
    switch (chargeType) {
      case 'MILEAGE':
        chargeData.mileageCharge = amount
        break
      case 'FUEL':
        chargeData.fuelCharge = amount
        break
      case 'LATE_FEE':
        chargeData.lateCharge = amount
        break
      case 'DAMAGE':
        chargeData.damageCharge = amount
        break
      case 'CLEANING':
        chargeData.cleaningCharge = amount
        break
      default:
        chargeData.otherCharges = amount
    }

    // Create the trip charge
    const tripCharge = await prisma.tripCharge.create({
      data: chargeData as any
    })

    console.log(`[Add Charge] Charge ${tripCharge.id} added to booking ${bookingId} by partner ${partner.id}`)

    return NextResponse.json({
      success: true,
      charge: {
        id: tripCharge.id,
        amount: Number(tripCharge.totalCharges),
        chargeType,
        description: description || chargeType,
        status: tripCharge.chargeStatus
      },
      message: 'Charge added successfully'
    })

  } catch (error) {
    console.error('[Add Charge] Error:', error)
    return NextResponse.json({ error: 'Failed to add charge' }, { status: 500 })
  }
}

// GET - Get charges for a booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: bookingId } = await params

    // Verify booking belongs to partner
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        hostId: partner.id
      },
      include: {
        tripCharges: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const charges = booking.tripCharges.map(charge => {
      const details = charge.chargeDetails as Record<string, unknown> | null
      return {
        id: charge.id,
        amount: Number(charge.totalCharges),
        chargeType: details?.type || 'OTHER',
        description: details?.description || details?.notes || 'Trip charge',
        status: charge.chargeStatus,
        createdAt: charge.createdAt.toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      charges,
      total: charges.reduce((sum, c) => sum + c.amount, 0)
    })

  } catch (error) {
    console.error('[Get Charges] Error:', error)
    return NextResponse.json({ error: 'Failed to get charges' }, { status: 500 })
  }
}
