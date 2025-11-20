// app/api/host/claims/[id]/edit-fnol/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get host ID from middleware
    const hostId = request.headers.get('x-host-id')

    if (!hostId) {
      return NextResponse.json(
        { error: 'Unauthorized - Host ID not found' },
        { status: 401 }
      )
    }

    const { id: claimId } = await params
    const body = await request.json()
    const { section, data } = body

    // Verify claim exists and belongs to host
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      select: { hostId: true, status: true }
    })

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      )
    }

    if (claim.hostId !== hostId) {
      return NextResponse.json(
        { error: 'Access denied. You do not own this claim.' },
        { status: 403 }
      )
    }

    // Only allow edits on PENDING claims
    if (claim.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending claims can be edited' },
        { status: 400 }
      )
    }

    // Build update data based on section
    let updateData: any = {}
    let fieldChanged = ''
    let oldValue = ''
    let newValue = ''

    switch (section) {
      case 'vehicle-condition':
        // Get old values for audit
        const oldClaim = await prisma.claim.findUnique({
          where: { id: claimId },
          select: {
            odometerAtIncident: true,
            vehicleDrivable: true,
            vehicleLocation: true
          }
        })

        updateData = {
          odometerAtIncident: data.odometerAtIncident,
          vehicleDrivable: data.vehicleDrivable,
          vehicleLocation: data.vehicleLocation
        }

        fieldChanged = 'Vehicle Condition'
        oldValue = JSON.stringify({
          odometer: oldClaim?.odometerAtIncident,
          drivable: oldClaim?.vehicleDrivable,
          location: oldClaim?.vehicleLocation
        })
        newValue = JSON.stringify({
          odometer: data.odometerAtIncident,
          drivable: data.vehicleDrivable,
          location: data.vehicleLocation
        })
        break

      case 'incident-conditions':
        updateData = {
          weatherConditions: data.weatherConditions,
          weatherDescription: data.weatherDescription,
          roadConditions: data.roadConditions,
          roadDescription: data.roadDescription,
          estimatedSpeed: data.estimatedSpeed,
          trafficConditions: data.trafficConditions
        }
        fieldChanged = 'Incident Conditions'
        break

      case 'police-report':
        updateData = {
          wasPoliceContacted: data.wasPoliceContacted,
          policeDepartment: data.policeDepartment,
          officerName: data.officerName,
          officerBadge: data.officerBadge,
          policeReportNumber: data.policeReportNumber,
          policeReportFiled: data.policeReportFiled,
          policeReportDate: data.policeReportDate ? new Date(data.policeReportDate) : null
        }
        fieldChanged = 'Police Report'
        break

      case 'witnesses':
        updateData = {
          witnesses: data.witnesses
        }
        fieldChanged = 'Witnesses'
        break

      case 'other-party':
        updateData = {
          otherPartyInvolved: data.otherPartyInvolved,
          otherParty: data.otherParty
        }
        fieldChanged = 'Other Party Information'
        break

      case 'injuries':
        updateData = {
          wereInjuries: data.wereInjuries,
          injuries: data.injuries
        }
        fieldChanged = 'Injuries'
        break

      default:
        return NextResponse.json(
          { error: 'Invalid section' },
          { status: 400 }
        )
    }

    // Update the claim
    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    // Create audit trail entry
    await prisma.claimEdit.create({
      data: {
        claimId,
        fieldChanged,
        oldValue: oldValue || 'Previous value',
        newValue: newValue || 'Updated value',
        editedBy: hostId,
        editedByType: 'HOST',
        reason: `Updated ${fieldChanged} section`
      }
    })

    return NextResponse.json({
      success: true,
      message: `${fieldChanged} updated successfully`,
      claim: updatedClaim
    })

  } catch (error) {
    console.error('Error updating FNOL data:', error)
    return NextResponse.json(
      { error: 'Failed to update incident details' },
      { status: 500 }
    )
  }
}