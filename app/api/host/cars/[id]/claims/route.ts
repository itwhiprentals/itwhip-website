// app/api/host/cars/[id]/claims/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carId } = await params
    const { searchParams } = new URL(request.url)
    
    const filter = searchParams.get('filter') || 'all' // 'all', 'active', 'resolved'

    console.log('🚨 ===== FETCHING CLAIMS FOR CAR:', carId, '=====')
    console.log('Filter:', filter)

    // Verify vehicle exists
    const vehicle = await prisma.rentalCar.findUnique({
      where: { id: carId },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        hostId: true,
        totalClaimsCount: true,
        lastClaimDate: true,
        hasActiveClaim: true,
        activeClaimId: true
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Build where clause based on filter
    const whereClause: any = {
      booking: {
        carId: carId
      }
    }

    if (filter === 'active') {
      whereClause.status = {
        in: ['PENDING', 'UNDER_REVIEW', 'GUEST_RESPONSE_PENDING', 'GUEST_RESPONDED']
      }
    } else if (filter === 'resolved') {
      whereClause.status = {
        in: ['APPROVED', 'DENIED', 'PAID', 'RESOLVED', 'CLOSED']
      }
    }

    // Fetch claims with complete FNOL data
    const claims = await prisma.claim.findMany({
      where: whereClause,
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
            startDate: true,
            endDate: true,
            renterId: true,
            guestName: true,
            guestEmail: true,
            guestPhone: true
          }
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        damagePhotos: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        incidentDate: 'desc'
      }
    })

    console.log(`📊 Found ${claims.length} claims`)

    // Format claims for response
    const formattedClaims = claims.map(claim => ({
      id: claim.id,
      type: claim.type,
      status: claim.status,
      incidentDate: claim.incidentDate.toISOString(),
      description: claim.description,
      estimatedCost: claim.estimatedCost,
      approvedAmount: claim.approvedAmount,
      deductible: claim.deductible,
      
      // FNOL - Incident Location
      incidentAddress: claim.incidentAddress,
      incidentCity: claim.incidentCity,
      incidentState: claim.incidentState,
      incidentZip: claim.incidentZip,
      incidentLatitude: claim.incidentLatitude,
      incidentLongitude: claim.incidentLongitude,
      incidentDescription: claim.incidentDescription,
      
      // FNOL - Conditions
      weatherConditions: claim.weatherConditions,
      weatherDescription: claim.weatherDescription,
      roadConditions: claim.roadConditions,
      roadDescription: claim.roadDescription,
      estimatedSpeed: claim.estimatedSpeed,
      trafficConditions: claim.trafficConditions,
      
      // FNOL - Police Report
      wasPoliceContacted: claim.wasPoliceContacted,
      policeReportNumber: claim.policeReportNumber,
      policeDepartment: claim.policeDepartment,
      officerName: claim.officerName,
      officerBadge: claim.officerBadge,
      policeReportFiled: claim.policeReportFiled,
      policeReportDate: claim.policeReportDate?.toISOString(),
      
      // FNOL - Vehicle Condition
      odometerAtIncident: claim.odometerAtIncident,
      vehicleDrivable: claim.vehicleDrivable,
      vehicleLocation: claim.vehicleLocation,
      
      // FNOL - Other Party
      otherPartyInvolved: claim.otherPartyInvolved,
      otherParty: claim.otherParty,
      
      // FNOL - Injuries
      wereInjuries: claim.wereInjuries,
      injuries: claim.injuries,
      
      // FNOL - Witnesses
      witnesses: claim.witnesses,
      
      // Review & Status
      reviewedBy: claim.reviewedBy,
      reviewedAt: claim.reviewedAt?.toISOString(),
      reviewNotes: claim.reviewNotes,
      
      // Guest Response
      guestResponseText: claim.guestResponseText,
      guestResponseDate: claim.guestResponseDate?.toISOString(),
      guestResponseDeadline: claim.guestResponseDeadline?.toISOString(),
      guestResponsePhotos: claim.guestResponsePhotos,
      guestRespondedAt: claim.guestRespondedAt?.toISOString(),
      accountHoldApplied: claim.accountHoldApplied,
      
      // Vehicle Status
      vehicleDeactivated: claim.vehicleDeactivated,
      vehicleReactivatedAt: claim.vehicleReactivatedAt?.toISOString(),
      vehicleReactivatedBy: claim.vehicleReactivatedBy,
      
      // Insurance Routing
      primaryParty: claim.primaryParty,
      severity: claim.severity,
      lockedCarState: claim.lockedCarState,
      submittedToInsurerAt: claim.submittedToInsurerAt?.toISOString(),
      insurerClaimId: claim.insurerClaimId,
      insurerStatus: claim.insurerStatus,
      
      // Photos
      damagePhotos: claim.damagePhotos.map(photo => ({
        id: photo.id,
        url: photo.url,
        caption: photo.caption,
        uploadedBy: photo.uploadedBy,
        uploadedAt: photo.uploadedAt.toISOString()
      })),
      
      // Booking Info
      booking: {
        id: claim.booking.id,
        bookingCode: claim.booking.bookingCode,
        startDate: claim.booking.startDate.toISOString(),
        endDate: claim.booking.endDate.toISOString(),
        guestName: claim.booking.guestName,
        guestEmail: claim.booking.guestEmail,
        guestPhone: claim.booking.guestPhone
      },
      
      // Host Info
      host: {
        id: claim.host.id,
        name: claim.host.name,
        email: claim.host.email
      },
      
      // Timestamps
      createdAt: claim.createdAt.toISOString(),
      updatedAt: claim.updatedAt.toISOString(),
      resolvedAt: claim.resolvedAt?.toISOString()
    }))

    // Calculate statistics
    const totalApproved = claims
      .filter(c => c.approvedAmount)
      .reduce((sum, c) => sum + (c.approvedAmount || 0), 0)

    const activeCount = claims.filter(c => 
      ['PENDING', 'UNDER_REVIEW', 'GUEST_RESPONSE_PENDING', 'GUEST_RESPONDED'].includes(c.status)
    ).length

    const resolvedCount = claims.filter(c => 
      ['APPROVED', 'DENIED', 'PAID', 'RESOLVED', 'CLOSED'].includes(c.status)
    ).length

    return NextResponse.json({
      success: true,
      vehicle: {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        totalClaimsCount: vehicle.totalClaimsCount,
        lastClaimDate: vehicle.lastClaimDate?.toISOString(),
        hasActiveClaim: vehicle.hasActiveClaim,
        activeClaimId: vehicle.activeClaimId
      },
      claims: formattedClaims,
      statistics: {
        total: claims.length,
        active: activeCount,
        resolved: resolvedCount,
        totalApproved: totalApproved,
        avgClaimAmount: claims.length > 0 
          ? claims.reduce((sum, c) => sum + (c.approvedAmount || c.estimatedCost), 0) / claims.length
          : 0
      }
    })

  } catch (error) {
    console.error('❌ Error fetching claims:', error)
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    )
  }
}