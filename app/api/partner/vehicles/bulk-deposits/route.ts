// app/api/partner/vehicles/bulk-deposits/route.ts
// Bulk update vehicle deposit settings
//
// PUT: Update multiple vehicles' deposit mode and individual settings at once
// - vehicleDepositMode: "global" or "individual"
// - When "individual": also updates noDeposit and customDepositAmount

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

async function getHostFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value ||
                cookieStore.get('accessToken')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string
    if (!hostId) return null
    return hostId
  } catch {
    return null
  }
}

interface VehicleDepositUpdate {
  id: string
  vehicleDepositMode: 'global' | 'individual'
  // Only used when vehicleDepositMode === 'individual'
  requireDeposit?: boolean
  depositAmount?: number | null
}

export async function PUT(request: NextRequest) {
  try {
    const hostId = await getHostFromToken()

    if (!hostId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { vehicles } = body as { vehicles: VehicleDepositUpdate[] }

    if (!Array.isArray(vehicles)) {
      return NextResponse.json({ error: 'vehicles must be an array' }, { status: 400 })
    }

    // Verify all vehicles belong to this host
    const vehicleIds = vehicles.map(v => v.id)
    const existingVehicles = await prisma.rentalCar.findMany({
      where: {
        id: { in: vehicleIds },
        hostId: hostId
      },
      select: { id: true }
    })

    const existingIds = new Set(existingVehicles.map(v => v.id))
    const invalidIds = vehicleIds.filter(id => !existingIds.has(id))

    if (invalidIds.length > 0) {
      return NextResponse.json({
        error: `Some vehicles not found or not owned by you: ${invalidIds.join(', ')}`
      }, { status: 400 })
    }

    // Update all vehicles in a transaction
    await prisma.$transaction(
      vehicles.map(vehicle => {
        const data: Record<string, any> = {
          vehicleDepositMode: vehicle.vehicleDepositMode
        }

        // When switching to individual mode, also update individual settings
        if (vehicle.vehicleDepositMode === 'individual') {
          const requireDeposit = vehicle.requireDeposit ?? true
          const hasValidAmount = vehicle.depositAmount !== null &&
                                 vehicle.depositAmount !== undefined &&
                                 vehicle.depositAmount >= 25

          // If deposit is required but no valid amount, disable deposit
          const finalRequireDeposit = requireDeposit && hasValidAmount

          data.noDeposit = !finalRequireDeposit
          data.customDepositAmount = finalRequireDeposit
            ? Math.round(vehicle.depositAmount! / 25) * 25 // Round to nearest $25
            : null
        }

        // When switching to global mode, clear individual settings
        if (vehicle.vehicleDepositMode === 'global') {
          data.noDeposit = false
          data.customDepositAmount = null
        }

        return prisma.rentalCar.update({
          where: { id: vehicle.id },
          data
        })
      })
    )

    const globalCount = vehicles.filter(v => v.vehicleDepositMode === 'global').length
    const individualCount = vehicles.filter(v => v.vehicleDepositMode === 'individual').length

    console.log('[Bulk Deposits] Updated:', {
      hostId,
      total: vehicles.length,
      global: globalCount,
      individual: individualCount
    })

    return NextResponse.json({
      success: true,
      updated: vehicles.length,
      global: globalCount,
      individual: individualCount
    })

  } catch (error: any) {
    console.error('[Bulk Deposits] PUT Error:', error)
    return NextResponse.json({ error: 'Failed to update vehicle deposits' }, { status: 500 })
  }
}
