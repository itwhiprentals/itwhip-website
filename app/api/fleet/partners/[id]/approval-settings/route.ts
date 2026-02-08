// app/api/fleet/partners/[id]/approval-settings/route.ts
// GET/PUT - Partner vehicle approval settings

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

const FLEET_KEY = 'phoenix-fleet-2847'

function validateFleetKey(request: NextRequest): boolean {
  const key = request.headers.get('x-fleet-key') ||
              request.nextUrl.searchParams.get('key')
  return key === FLEET_KEY
}

// GET - Get current approval settings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateFleetKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    const partner = await prisma.rentalHost.findUnique({
      where: { id },
      select: {
        id: true,
        partnerCompanyName: true,
        vehicleApprovalMode: true,
        vehicleApprovalThreshold: true,
        autoApproveListings: true
      }
    })

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      settings: {
        partnerId: partner.id,
        partnerName: partner.partnerCompanyName,
        approvalMode: partner.vehicleApprovalMode || 'DYNAMIC',
        approvalThreshold: partner.vehicleApprovalThreshold ?? 25,
        legacyAutoApprove: partner.autoApproveListings
      }
    })

  } catch (error) {
    console.error('[Fleet Approval Settings GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT - Update approval settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateFleetKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { approvalMode, approvalThreshold } = body

    // Validate approval mode
    const validModes = ['AUTO', 'MANUAL', 'DYNAMIC']
    if (!validModes.includes(approvalMode)) {
      return NextResponse.json(
        { error: 'Invalid approval mode. Must be AUTO, MANUAL, or DYNAMIC' },
        { status: 400 }
      )
    }

    // Validate threshold for DYNAMIC mode
    if (approvalMode === 'DYNAMIC') {
      if (typeof approvalThreshold !== 'number' || approvalThreshold < 0 || approvalThreshold > 100) {
        return NextResponse.json(
          { error: 'Approval threshold must be between 0 and 100' },
          { status: 400 }
        )
      }
    }

    const partner = await prisma.rentalHost.findUnique({
      where: { id },
      select: { partnerCompanyName: true, vehicleApprovalMode: true, vehicleApprovalThreshold: true }
    })

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    // Update settings
    const updated = await prisma.rentalHost.update({
      where: { id },
      data: {
        vehicleApprovalMode: approvalMode,
        vehicleApprovalThreshold: approvalMode === 'DYNAMIC' ? approvalThreshold : partner.vehicleApprovalThreshold,
        // Also update legacy field for compatibility
        autoApproveListings: approvalMode === 'AUTO'
      }
    })

    // Log the change
    try {
      await prisma.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          action: 'UPDATE_APPROVAL_SETTINGS',
          entityType: 'PARTNER',
          entityId: id,
          category: 'APPROVAL_SETTINGS',
          oldValue: partner.vehicleApprovalMode || 'DYNAMIC',
          newValue: approvalMode,
          adminId: 'fleet_admin'
        }
      })
    } catch (logError) {
      console.error('[Fleet Approval Settings] Activity log error:', logError)
    }

    return NextResponse.json({
      success: true,
      message: `Approval settings updated to ${approvalMode}${approvalMode === 'DYNAMIC' ? ` with ${approvalThreshold}% threshold` : ''}`,
      settings: {
        partnerId: id,
        partnerName: partner.partnerCompanyName,
        approvalMode: updated.vehicleApprovalMode,
        approvalThreshold: updated.vehicleApprovalThreshold
      }
    })

  } catch (error) {
    console.error('[Fleet Approval Settings PUT] Error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
