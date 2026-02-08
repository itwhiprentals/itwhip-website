// app/api/host/claims/[id]/update-location/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: claimId } = await params
    const hostId = request.headers.get('x-host-id')

    if (!hostId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      incidentAddress,
      incidentCity,
      incidentState,
      incidentZip,
      incidentDescription,
    } = body

    // Validation
    if (!incidentAddress || !incidentAddress.trim()) {
      return NextResponse.json(
        { error: 'Incident address is required' },
        { status: 400 }
      )
    }

    if (!incidentCity || !incidentCity.trim()) {
      return NextResponse.json(
        { error: 'City is required' },
        { status: 400 }
      )
    }

    if (!incidentState) {
      return NextResponse.json(
        { error: 'State is required' },
        { status: 400 }
      )
    }

    if (!incidentZip || !incidentZip.trim()) {
      return NextResponse.json(
        { error: 'ZIP code is required' },
        { status: 400 }
      )
    }

    if (!/^\d{5}(-\d{4})?$/.test(incidentZip)) {
      return NextResponse.json(
        { error: 'Invalid ZIP code format' },
        { status: 400 }
      )
    }

    // Verify claim exists and belongs to host
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      select: {
        id: true,
        hostId: true,
        status: true,
      },
    })

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      )
    }

    if (claim.hostId !== hostId) {
      return NextResponse.json(
        { error: 'You do not own this claim' },
        { status: 403 }
      )
    }

    // Only allow editing if claim is PENDING
    if (claim.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only edit location for pending claims' },
        { status: 400 }
      )
    }

    // Update the location
    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: {
        incidentAddress: incidentAddress.trim(),
        incidentCity: incidentCity.trim(),
        incidentState: incidentState,
        incidentZip: incidentZip.trim(),
        incidentDescription: incidentDescription?.trim() || null,
        updatedAt: new Date(),
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: hostId,
        action: 'claim_location_updated',
        entityType: 'claim',
        entityId: claimId,
        metadata: {
          claimId,
          updatedFields: ['incidentAddress', 'incidentCity', 'incidentState', 'incidentZip'],
          newLocation: {
            address: incidentAddress.trim(),
            city: incidentCity.trim(),
            state: incidentState,
            zip: incidentZip.trim(),
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Incident location updated successfully',
      claim: {
        id: updatedClaim.id,
        incidentAddress: updatedClaim.incidentAddress,
        incidentCity: updatedClaim.incidentCity,
        incidentState: updatedClaim.incidentState,
        incidentZip: updatedClaim.incidentZip,
        incidentDescription: updatedClaim.incidentDescription,
      },
    })
  } catch (error: any) {
    console.error('Error updating incident location:', error)
    return NextResponse.json(
      {
        error: 'Failed to update incident location',
        ...(process.env.NODE_ENV === 'development' && {
          details: error.message,
        }),
      },
      { status: 500 }
    )
  }
}