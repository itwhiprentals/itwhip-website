// app/api/host/claims/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

// GET /api/host/claims/[id] - Fetch single claim details (with ownership check)
export async function GET(
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

    // ✅ UPDATED: Added ALL FNOL vehicle fields to car selection
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        booking: {
          include: {
            car: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
                vin: true,
                licensePlate: true,
                color: true,
                isActive: true,
                
                // ✅ NEW: FNOL Vehicle Registration & Insurance Fields
                registeredOwner: true,
                garageAddress: true,
                garageCity: true,
                garageState: true,
                garageZip: true,
                estimatedValue: true,
                hasLien: true,
                lienholderName: true,
                lienholderAddress: true,
                hasAlarm: true,
                hasTracking: true,
                hasImmobilizer: true,
                isModified: true,
                modifications: true,
                annualMileage: true,
                primaryUse: true,
                currentMileage: true,
                
                photos: {
                  take: 1,
                  orderBy: { isHero: 'desc' }
                }
              }
            },
            renter: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true
              }
            },
            inspectionPhotos: {
              orderBy: { uploadedAt: 'asc' }
            },
            review: {
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                cleanliness: true,
                accuracy: true,
                communication: true,
                convenience: true,
                value: true
              }
            }
          }
        },
        policy: {
          select: {
            id: true,
            policyNumber: true,
            tier: true,
            deductible: true,
            liabilityCoverage: true,
            collisionCoverage: true,
            provider: true
          }
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        // ✅ Include damage photos relation (only non-deleted)
        damagePhotos: {
          where: {
            deletedAt: null
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (claim.hostId !== hostId) {
      return NextResponse.json(
        { error: 'Access denied. You do not own this claim.' },
        { status: 403 }
      )
    }

    // Parse inspection photos
    let preTripPhotos: string[] = []
    let postTripPhotos: string[] = []
    
    try {
      if (claim.booking.inspectionPhotosStart) {
        preTripPhotos = JSON.parse(claim.booking.inspectionPhotosStart)
      }
    } catch (e) {
      console.error('Error parsing inspectionPhotosStart:', e)
    }
    
    try {
      if (claim.booking.inspectionPhotosEnd) {
        postTripPhotos = JSON.parse(claim.booking.inspectionPhotosEnd)
      }
    } catch (e) {
      console.error('Error parsing inspectionPhotosEnd:', e)
    }

    // ✅ Parse guest damage photos from booking.damagePhotos (LEGACY JSON)
    let legacyGuestDamagePhotos: string[] = []
    try {
      if (claim.booking.damagePhotos) {
        legacyGuestDamagePhotos = typeof claim.booking.damagePhotos === 'string'
          ? JSON.parse(claim.booking.damagePhotos)
          : claim.booking.damagePhotos
      }
    } catch (e) {
      console.error('Error parsing legacy guest damage photos:', e)
    }

    // Build trip documentation object
    const tripDocumentation = {
      completion: {
        completedBy: claim.booking.tripCompletedBy || null,
        startedAt: claim.booking.tripStartedAt?.toISOString() || null,
        endedAt: claim.booking.tripEndedAt?.toISOString() || null,
        duration: calculateDuration(claim.booking.tripStartedAt, claim.booking.tripEndedAt),
        adminOverride: claim.booking.adminCompletedById ? {
          adminId: claim.booking.adminCompletedById,
          notes: claim.booking.adminCompletionNotes,
          reason: 'Trip completed by admin on behalf of guest'
        } : null
      },
      
      mileage: {
        start: claim.booking.startMileage || null,
        end: claim.booking.endMileage || null,
        driven: (claim.booking.startMileage && claim.booking.endMileage) 
          ? claim.booking.endMileage - claim.booking.startMileage 
          : null,
        allowance: calculateMileageAllowance(claim.booking.startDate, claim.booking.endDate),
        withinLimit: (claim.booking.startMileage && claim.booking.endMileage)
          ? (claim.booking.endMileage - claim.booking.startMileage) <= calculateMileageAllowance(claim.booking.startDate, claim.booking.endDate)
          : null
      },
      
      fuel: {
        start: claim.booking.fuelLevelStart || null,
        end: claim.booking.fuelLevelEnd || null,
        percentUsed: calculateFuelUsage(claim.booking.fuelLevelStart, claim.booking.fuelLevelEnd)
      },
      
      location: {
        pickup: {
          lat: claim.booking.pickupLatitude || null,
          lng: claim.booking.pickupLongitude || null,
          address: formatAddress(claim.booking.pickupLatitude, claim.booking.pickupLongitude)
        },
        return: {
          lat: claim.booking.returnLatitude || null,
          lng: claim.booking.returnLongitude || null,
          address: formatAddress(claim.booking.returnLatitude, claim.booking.returnLongitude)
        }
      },
      
      photos: {
        preTrip: preTripPhotos,
        postTrip: postTripPhotos,
        preTripCount: preTripPhotos.length,
        postTripCount: postTripPhotos.length,
        detailed: claim.booking.inspectionPhotos.map((photo: any) => ({
          id: photo.id,
          type: photo.type,
          category: photo.category,
          url: photo.url,
          uploadedAt: photo.uploadedAt.toISOString()
        }))
      },
      
      review: claim.booking.review ? {
        id: claim.booking.review.id,
        rating: claim.booking.review.rating,
        comment: claim.booking.review.comment,
        submittedAt: claim.booking.review.createdAt.toISOString(),
        breakdown: {
          cleanliness: claim.booking.review.cleanliness,
          accuracy: claim.booking.review.accuracy,
          communication: claim.booking.review.communication,
          convenience: claim.booking.review.convenience,
          value: claim.booking.review.value
        }
      } : null,
      
      // Return legacy guest damage photos for display in tripDocumentation
      damage: {
        reported: claim.booking.damageReported,
        description: claim.booking.damageDescription || null,
        photos: legacyGuestDamagePhotos
      }
    }

    // ✅ Separate HOST damage photos from ClaimDamagePhoto table
    const hostDamagePhotos = claim.damagePhotos
      .filter(photo => photo.uploadedBy === 'HOST')
      .map(photo => ({
        id: photo.id,
        url: photo.url,
        caption: photo.caption,
        order: photo.order,
        uploadedBy: photo.uploadedBy,
        uploadedAt: photo.uploadedAt.toISOString()
      }))

    // ✅ Merge BOTH sources of guest damage photos
    const guestDamagePhotos = [
      // Legacy guest photos from trip completion
      ...legacyGuestDamagePhotos.map((url, index) => ({
        id: `legacy-${index}`,
        url,
        caption: 'Reported during trip completion',
        order: index,
        uploadedBy: 'GUEST',
        uploadedAt: claim.booking.tripEndedAt?.toISOString() || claim.createdAt.toISOString()
      })),
      // New guest photos from ClaimDamagePhoto table (claim response)
      ...claim.damagePhotos
        .filter(photo => photo.uploadedBy === 'GUEST')
        .map(photo => ({
          id: photo.id,
          url: photo.url,
          caption: photo.caption,
          order: photo.order + legacyGuestDamagePhotos.length,
          uploadedBy: photo.uploadedBy,
          uploadedAt: photo.uploadedAt.toISOString()
        }))
    ]

    // Format response
    const formattedClaim = {
      id: claim.id,
      type: claim.type,
      status: claim.status,
      reportedBy: claim.reportedBy,
      description: claim.description,
      
      estimatedCost: claim.estimatedCost,
      approvedAmount: claim.approvedAmount,
      deductible: claim.deductible,
      netPayout: claim.approvedAmount 
        ? claim.approvedAmount - (claim.deductible || 0)
        : null,
      
      guestAtFault: claim.guestAtFault,
      faultPercentage: claim.faultPercentage,
      
      incidentDate: claim.incidentDate?.toISOString() || null,
      createdAt: claim.createdAt.toISOString(),
      updatedAt: claim.updatedAt.toISOString(),
      reviewedAt: claim.reviewedAt?.toISOString() || null,
      paidToHost: claim.paidToHost?.toISOString() || null,
      paidAmount: claim.paidAmount,
      resolvedAt: claim.resolvedAt?.toISOString() || null,
      
      reviewedBy: claim.reviewedBy,
      reviewNotes: claim.reviewNotes,
      
      // ✅ Incident location fields
      incidentAddress: claim.incidentAddress,
      incidentCity: claim.incidentCity,
      incidentState: claim.incidentState,
      incidentZip: claim.incidentZip,
      incidentDescription: claim.incidentDescription,
      
      // ✅ FNOL: Vehicle Condition
      odometerAtIncident: claim.odometerAtIncident,
      vehicleDrivable: claim.vehicleDrivable,
      vehicleLocation: claim.vehicleLocation,
      
      // ✅ FNOL: Incident Conditions
      weatherConditions: claim.weatherConditions,
      weatherDescription: claim.weatherDescription,
      roadConditions: claim.roadConditions,
      roadDescription: claim.roadDescription,
      estimatedSpeed: claim.estimatedSpeed,
      trafficConditions: claim.trafficConditions,
      
      // ✅ FNOL: Police Report
      wasPoliceContacted: claim.wasPoliceContacted,
      policeDepartment: claim.policeDepartment,
      officerName: claim.officerName,
      officerBadge: claim.officerBadge,
      policeReportNumber: claim.policeReportNumber,
      policeReportFiled: claim.policeReportFiled,
      policeReportDate: claim.policeReportDate?.toISOString() || null,
      
      // ✅ FNOL: Witnesses (JSON array)
      witnesses: claim.witnesses || [],
      
      // ✅ FNOL: Other Party (JSON object)
      otherPartyInvolved: claim.otherPartyInvolved,
      otherParty: claim.otherParty || null,
      
      // ✅ FNOL: Injuries (JSON array)
      wereInjuries: claim.wereInjuries,
      injuries: claim.injuries || [],
      
      // ✅ Return merged guest damage photos (legacy + new)
      hostDamagePhotos,
      guestDamagePhotos,
      
      overrideHistory: claim.overrideHistory || [],
      
      isPending: claim.status === 'PENDING',
      isUnderReview: claim.status === 'UNDER_REVIEW',
      isApproved: claim.status === 'APPROVED',
      isDenied: claim.status === 'DENIED',
      isPaid: claim.status === 'PAID',
      isDisputed: claim.status === 'DISPUTED',
      isResolved: claim.status === 'RESOLVED',
      canDispute: ['DENIED'].includes(claim.status),
      
      booking: {
        id: claim.booking.id,
        bookingCode: claim.booking.bookingCode,
        startDate: claim.booking.startDate.toISOString(),
        endDate: claim.booking.endDate.toISOString(),
        startTime: claim.booking.startTime,
        endTime: claim.booking.endTime,
        totalAmount: claim.booking.totalAmount,
        dailyRate: claim.booking.dailyRate,
        status: claim.booking.status,
        damageReported: claim.booking.damageReported,
        
        car: claim.booking.car ? {
          id: claim.booking.car.id,
          make: claim.booking.car.make,
          model: claim.booking.car.model,
          year: claim.booking.car.year,
          vin: claim.booking.car.vin,
          licensePlate: claim.booking.car.licensePlate,
          color: claim.booking.car.color,
          heroPhoto: claim.booking.car.photos?.[0]?.url || null,
          displayName: `${claim.booking.car.year} ${claim.booking.car.make} ${claim.booking.car.model}`,
          fullDisplayName: `${claim.booking.car.color} ${claim.booking.car.year} ${claim.booking.car.make} ${claim.booking.car.model}`,
          isActive: claim.booking.car.isActive,
          
          // ✅ NEW: FNOL Vehicle Registration & Insurance Information
          fnolDetails: {
            registration: {
              registeredOwner: claim.booking.car.registeredOwner || null,
              estimatedValue: claim.booking.car.estimatedValue || null,
              currentMileage: claim.booking.car.currentMileage || null,
              annualMileage: claim.booking.car.annualMileage || null,
              primaryUse: claim.booking.car.primaryUse || null
            },
            garage: {
              address: claim.booking.car.garageAddress || null,
              city: claim.booking.car.garageCity || null,
              state: claim.booking.car.garageState || null,
              zipCode: claim.booking.car.garageZip || null,
              fullAddress: claim.booking.car.garageAddress && claim.booking.car.garageCity && claim.booking.car.garageState && claim.booking.car.garageZip
                ? `${claim.booking.car.garageAddress}, ${claim.booking.car.garageCity}, ${claim.booking.car.garageState} ${claim.booking.car.garageZip}`
                : null
            },
            lien: {
              hasLien: claim.booking.car.hasLien || false,
              lienholderName: claim.booking.car.lienholderName || null,
              lienholderAddress: claim.booking.car.lienholderAddress || null
            },
            safety: {
              hasAlarm: claim.booking.car.hasAlarm || false,
              hasTracking: claim.booking.car.hasTracking || false,
              hasImmobilizer: claim.booking.car.hasImmobilizer || false
            },
            modifications: {
              isModified: claim.booking.car.isModified || false,
              description: claim.booking.car.modifications || null
            }
          }
        } : null,
        
        guest: claim.booking.renter ? {
          id: claim.booking.renter.id,
          name: claim.booking.renter.name,
          email: claim.booking.renter.email,
          phone: claim.booking.renter.phone,
          profilePhoto: claim.booking.renter.avatar
        } : claim.booking.guestName ? {
          id: 'guest',
          name: claim.booking.guestName,
          email: claim.booking.guestEmail || 'N/A',
          phone: claim.booking.guestPhone || 'N/A',
          profilePhoto: null
        } : null
      },
      
      policy: claim.policy ? {
        id: claim.policy.id,
        policyNumber: claim.policy.policyNumber,
        tier: claim.policy.tier,
        deductible: claim.policy.deductible,
        liabilityCoverage: claim.policy.liabilityCoverage,
        collisionCoverage: claim.policy.collisionCoverage,
        provider: claim.policy.provider
      } : null,
      
      host: {
        id: claim.host.id,
        name: claim.host.name,
        email: claim.host.email,
        phone: claim.host.phone
      },
      
      tripDocumentation,
      
      timeline: buildTimeline(claim)
    }

    return NextResponse.json({
      success: true,
      claim: formattedClaim
    })

  } catch (error) {
    console.error('Error fetching claim details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch claim details' },
      { status: 500 }
    )
  }
}

function calculateDuration(startDate: Date | null, endDate: Date | null): string | null {
  if (!startDate || !endDate) return null
  
  const diffMs = endDate.getTime() - startDate.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}${hours > 0 ? `, ${hours} hour${hours !== 1 ? 's' : ''}` : ''}`
  }
  return `${hours} hour${hours !== 1 ? 's' : ''}`
}

function calculateMileageAllowance(startDate: Date, endDate: Date): number {
  const diffMs = endDate.getTime() - startDate.getTime()
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  return days * 200
}

function calculateFuelUsage(start: string | null, end: string | null): number | null {
  if (!start || !end) return null
  
  const fuelLevels: Record<string, number> = {
    'Empty': 0,
    '1/8': 12.5,
    '1/4': 25,
    '3/8': 37.5,
    '1/2': 50,
    '5/8': 62.5,
    '3/4': 75,
    '7/8': 87.5,
    'Full': 100
  }
  
  const startPercent = fuelLevels[start] || 0
  const endPercent = fuelLevels[end] || 0
  
  return Math.max(0, startPercent - endPercent)
}

function formatAddress(lat: number | null, lng: number | null): string | null {
  if (!lat || !lng) return null
  return 'Phoenix, AZ'
}

function buildTimeline(claim: any) {
  const events = []

  events.push({
    type: 'filed',
    status: 'PENDING',
    date: claim.createdAt.toISOString(),
    title: 'Claim Filed',
    description: `${claim.type} claim submitted for review`,
    by: claim.reportedBy
  })

  if (Array.isArray(claim.overrideHistory)) {
    claim.overrideHistory.forEach((override: any) => {
      events.push({
        type: 'status_change',
        status: override.toStatus,
        date: override.timestamp,
        title: `Status Changed to ${override.toStatus}`,
        description: override.reason || 'Status updated',
        by: override.by
      })
    })
  }

  if (claim.reviewedAt) {
    events.push({
      type: 'reviewed',
      status: claim.status,
      date: claim.reviewedAt.toISOString(),
      title: 'Claim Reviewed',
      description: claim.reviewNotes || `Claim ${claim.status.toLowerCase()}`,
      by: claim.reviewedBy,
      approvedAmount: claim.approvedAmount
    })
  }

  if (claim.paidToHost) {
    const netAmount = (claim.paidAmount || 0) - (claim.deductible || 0)
    events.push({
      type: 'paid',
      status: 'PAID',
      date: claim.paidToHost.toISOString(),
      title: 'Payout Processed',
      description: `$${netAmount.toFixed(2)} paid to host (after $${claim.deductible} deductible)`,
      amount: netAmount
    })
  }

  if (claim.resolvedAt && claim.status === 'RESOLVED') {
    events.push({
      type: 'resolved',
      status: 'RESOLVED',
      date: claim.resolvedAt.toISOString(),
      title: 'Claim Resolved',
      description: 'Claim has been finalized'
    })
  }

  return events.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}