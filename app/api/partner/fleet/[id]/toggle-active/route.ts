// app/api/partner/fleet/[id]/toggle-active/route.ts
// POST /api/partner/fleet/[id]/toggle-active - Toggle vehicle active status

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  // SECURITY FIX: Check both cookie names for consistent auth
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verify vehicle belongs to partner
    const vehicle = await prisma.rentalCar.findFirst({
      where: {
        id,
        hostId: partner.id
      },
      include: {
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'ACTIVE'] }
          }
        }
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // If deactivating and has active bookings, prevent
    if (vehicle.isActive && vehicle.bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot deactivate vehicle with active bookings' },
        { status: 400 }
      )
    }

    // Toggle active status
    const updatedVehicle = await prisma.rentalCar.update({
      where: { id },
      data: {
        isActive: !vehicle.isActive
      }
    })

    console.log(`[Partner Fleet] Vehicle ${updatedVehicle.isActive ? 'activated' : 'deactivated'}:`, {
      partnerId: partner.id,
      vehicleId: id
    })

    return NextResponse.json({
      success: true,
      message: updatedVehicle.isActive
        ? 'Vehicle is now active and available for booking'
        : 'Vehicle has been deactivated',
      isActive: updatedVehicle.isActive
    })

  } catch (error: any) {
    console.error('[Partner Fleet] Error toggling vehicle status:', error)
    return NextResponse.json(
      { error: 'Failed to toggle vehicle status' },
      { status: 500 }
    )
  }
}
