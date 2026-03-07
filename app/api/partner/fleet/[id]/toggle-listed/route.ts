// app/api/partner/fleet/[id]/toggle-listed/route.ts
// POST /api/partner/fleet/[id]/toggle-listed - Toggle vehicle listed status

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    if (!partner || !['FLEET_PARTNER', 'PARTNER', 'EXTERNAL'].includes(partner.hostType)) {
      return null
    }

    return partner
  } catch {
    return null
  }
}

export async function POST(
  _request: NextRequest,
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
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Toggle listed status
    const updatedVehicle = await prisma.rentalCar.update({
      where: { id },
      data: {
        isListed: !vehicle.isListed
      }
    })

    console.log(`[Partner Fleet] Vehicle ${updatedVehicle.isListed ? 'listed' : 'unlisted'}:`, {
      partnerId: partner.id,
      vehicleId: id
    })

    return NextResponse.json({
      success: true,
      message: updatedVehicle.isListed
        ? 'Vehicle is now listed and visible to guests'
        : 'Vehicle has been unlisted from search',
      isListed: updatedVehicle.isListed
    })

  } catch (error: any) {
    console.error('[Partner Fleet] Error toggling listed status:', error)
    return NextResponse.json(
      { error: 'Failed to toggle listed status' },
      { status: 500 }
    )
  }
}
