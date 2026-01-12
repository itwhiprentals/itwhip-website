// app/api/fleet/vehicles/bulk/route.ts
// Fleet Vehicle Bulk Actions API - Approve, reject, suspend multiple vehicles

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

const FLEET_KEY = 'phoenix-fleet-2847'

function validateFleetKey(request: NextRequest): boolean {
  const key = request.headers.get('x-fleet-key') ||
              request.nextUrl.searchParams.get('key')
  return key === FLEET_KEY
}

export async function POST(request: NextRequest) {
  if (!validateFleetKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { vehicleIds, action, notes, adminId } = body

    if (!vehicleIds || !Array.isArray(vehicleIds) || vehicleIds.length === 0) {
      return NextResponse.json(
        { error: 'Vehicle IDs array is required' },
        { status: 400 }
      )
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    // Validate action
    const validActions = ['approve', 'reject', 'suspend', 'reactivate']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      )
    }

    // Rejection requires notes
    if (action === 'reject' && !notes) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Get vehicles
    const vehicles = await prisma.rentalCar.findMany({
      where: { id: { in: vehicleIds } },
      include: {
        host: {
          select: { id: true, partnerCompanyName: true }
        }
      }
    })

    if (vehicles.length === 0) {
      return NextResponse.json(
        { error: 'No vehicles found' },
        { status: 404 }
      )
    }

    // Build update data based on action
    let updateData: any = {}

    switch (action) {
      case 'approve':
        updateData = {
          fleetApprovalStatus: 'APPROVED',
          fleetApprovalDate: new Date(),
          fleetApprovalNotes: notes || 'Bulk approved by fleet admin',
          fleetApprovedBy: adminId || 'fleet_admin'
        }
        break

      case 'reject':
        updateData = {
          fleetApprovalStatus: 'REJECTED',
          fleetApprovalDate: new Date(),
          fleetApprovalNotes: notes,
          fleetApprovedBy: adminId || 'fleet_admin',
          status: 'INACTIVE'
        }
        break

      case 'suspend':
        updateData = {
          status: 'SUSPENDED'
        }
        break

      case 'reactivate':
        updateData = {
          status: 'ACTIVE'
        }
        break
    }

    // Update all vehicles
    const result = await prisma.rentalCar.updateMany({
      where: {
        id: { in: vehicleIds },
        // For reactivate, only allow approved vehicles
        ...(action === 'reactivate' && { fleetApprovalStatus: 'APPROVED' })
      },
      data: updateData
    })

    // Log activities for each partner
    const partnerMap = new Map<string, string[]>()
    vehicles.forEach(v => {
      if (v.host) {
        const existing = partnerMap.get(v.host.id) || []
        existing.push(`${v.year} ${v.make} ${v.model}`)
        partnerMap.set(v.host.id, existing)
      }
    })

    // Create activity logs
    const activityPromises = Array.from(partnerMap.entries()).map(([hostId, vehicleNames]) =>
      prisma.activityLog.create({
        data: {
          type: 'VEHICLE_BULK_ACTION',
          hostId,
          message: `Bulk ${action}: ${vehicleNames.length} vehicle(s) - ${vehicleNames.join(', ')}`,
          metadata: {
            action,
            vehicleCount: vehicleNames.length,
            vehicleNames,
            notes,
            adminId: adminId || 'fleet_admin'
          }
        }
      })
    )

    await Promise.all(activityPromises)

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}d ${result.count} vehicle(s)`,
      processed: result.count,
      requested: vehicleIds.length
    })

  } catch (error) {
    console.error('[Fleet Vehicles Bulk] Error:', error)
    return NextResponse.json({ error: 'Failed to process bulk action' }, { status: 500 })
  }
}
