// app/api/partner/deposit-settings/route.ts
// Deposit Management API - Hybrid Global + Individual deposit modes
//
// Each vehicle can be assigned to "global" or "individual" mode:
// - Global vehicles: use host-level requireDeposit, depositAmount, makeDeposits
// - Individual vehicles: use vehicle-level noDeposit, customDepositAmount
//
// GET: Returns global settings and all vehicles with their deposit mode
// PUT: Updates global settings (vehicle modes updated via bulk-deposits API)

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

export async function GET() {
  try {
    const hostId = await getHostFromToken()

    if (!hostId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get host with deposit settings
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        depositMode: true,
        requireDeposit: true,
        depositAmount: true,
        makeDeposits: true,
      }
    })

    if (!host) {
      return NextResponse.json({ error: 'Host not found' }, { status: 404 })
    }

    // Get all vehicles for this host
    const vehicles = await prisma.rentalCar.findMany({
      where: { hostId },
      select: {
        id: true,
        year: true,
        make: true,
        model: true,
        dailyRate: true,
        customDepositAmount: true,
        noDeposit: true,
        vehicleDepositMode: true,
        isActive: true,
        photos: {
          take: 1,
          orderBy: [{ isHero: 'desc' }, { order: 'asc' }],
          select: { url: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get unique makes from fleet for the "Adjust by Make" feature
    const makes = [...new Set(vehicles.map(v => v.make))].sort()

    // Parse makeDeposits JSON
    const makeDeposits = (host.makeDeposits as Record<string, number>) || {}

    // Count vehicles by mode
    const globalCount = vehicles.filter(v => v.vehicleDepositMode === 'global').length
    const individualCount = vehicles.filter(v => v.vehicleDepositMode === 'individual').length

    return NextResponse.json({
      success: true,
      global: {
        requireDeposit: host.requireDeposit,
        defaultAmount: host.depositAmount,
        makeDeposits: makeDeposits
      },
      makes, // Available makes in the fleet
      counts: {
        global: globalCount,
        individual: individualCount,
        total: vehicles.length
      },
      vehicles: vehicles.map(v => ({
        id: v.id,
        year: v.year,
        make: v.make,
        model: v.model,
        dailyRate: v.dailyRate,
        photo: v.photos[0]?.url || null,
        isActive: v.isActive,
        // Per-vehicle mode: "global" or "individual"
        vehicleDepositMode: v.vehicleDepositMode || 'global',
        // Individual mode settings (only used when vehicleDepositMode === 'individual')
        requireDeposit: !v.noDeposit,
        depositAmount: v.customDepositAmount
      }))
    })

  } catch (error: any) {
    console.error('[Deposit Settings] GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch deposit settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const hostId = await getHostFromToken()

    if (!hostId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { global: globalSettings } = body

    // Build update data for host-level global settings
    const updateData: Record<string, any> = {}

    if (globalSettings) {
      if (globalSettings.requireDeposit !== undefined) {
        updateData.requireDeposit = globalSettings.requireDeposit
      }
      if (globalSettings.defaultAmount !== undefined) {
        // Normalize to nearest $25, min $25
        updateData.depositAmount = Math.max(25, Math.round(globalSettings.defaultAmount / 25) * 25)
      }
      if (globalSettings.makeDeposits !== undefined) {
        // Validate makeDeposits is an object with number values, normalize to $25 increments
        if (typeof globalSettings.makeDeposits === 'object') {
          const validMakeDeposits: Record<string, number> = {}
          for (const [make, amount] of Object.entries(globalSettings.makeDeposits)) {
            if (typeof amount === 'number' && amount >= 25) {
              validMakeDeposits[make] = Math.round(amount / 25) * 25
            }
          }
          updateData.makeDeposits = validMakeDeposits
        }
      }
    }

    // Update host global settings
    if (Object.keys(updateData).length > 0) {
      await prisma.rentalHost.update({
        where: { id: hostId },
        data: updateData
      })
    }

    console.log('[Deposit Settings] Updated global settings:', {
      hostId,
      ...updateData
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('[Deposit Settings] PUT Error:', error)
    return NextResponse.json({ error: 'Failed to update deposit settings' }, { status: 500 })
  }
}
