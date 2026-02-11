// app/api/partner/messages/[id]/read/route.ts
// Unified Portal - Mark messages as read
// Supports all host types in the unified portal

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

// UNIFIED PORTAL: Accept all token types
async function getPartnerFromToken() {
  const cookieStore = await cookies()

  // Accept partner_token, hostAccessToken, or accessToken
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value ||
                cookieStore.get('accessToken')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    if (!hostId) return null

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        name: true,
        email: true,
        hostType: true,
        isHostManager: true
      }
    })

    // UNIFIED PORTAL: Accept all host types
    if (!partner) return null

    return partner
  } catch {
    return null
  }
}

// POST - Mark conversation/booking as read
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

    // UNIFIED PORTAL: Get both owned AND managed vehicle IDs
    // 1. Get owned vehicles
    const ownedVehicles = await prisma.rentalCar.findMany({
      where: { hostId: partner.id },
      select: { id: true }
    })
    const ownedVehicleIds = ownedVehicles.map(v => v.id)

    // 2. Get managed vehicles (for Fleet Managers)
    let managedVehicleIds: string[] = []
    if (partner.isHostManager) {
      const managedRelations = await prisma.vehicleManagement.findMany({
        where: { managerId: partner.id, status: 'ACTIVE' },
        select: { vehicleId: true }
      })
      managedVehicleIds = managedRelations.map(v => v.vehicleId)
    }

    // Combine all vehicle IDs
    const allVehicleIds = [...new Set([...ownedVehicleIds, ...managedVehicleIds])]

    // Verify booking belongs to owned or managed vehicle
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        carId: { in: allVehicleIds }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or access denied' },
        { status: 404 }
      )
    }

    // Mark all unread messages in this booking as read
    const result = await prisma.rentalMessage.updateMany({
      where: {
        bookingId,
        senderType: 'guest',
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      markedRead: result.count
    })

  } catch (error) {
    console.error('[Partner Messages] Mark read error:', error)
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 })
  }
}
