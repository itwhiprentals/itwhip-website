// app/api/fleet/claims/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/database/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ ENHANCED: Added inspectionPhotos and review to booking include
    const claim = await prisma.claim.findUnique({
      where: { id: params.id },
      include: {
        booking: {
          include: {
            car: {
              include: {
                host: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    earningsTier: true,
                    p2pInsuranceActive: true,
                    p2pInsuranceProvider: true,
                    commercialInsuranceActive: true,
                    commercialInsuranceProvider: true,
                  }
                },
                photos: {
                  where: { isHero: true },
                  take: 1
                }
              }
            },
            reviewerProfile: {
              select: {
                id: true,
                name: true,
                email: true,
                city: true,
                state: true,
                accountOnHold: true,
                accountHoldReason: true,
                accountHoldClaimId: true,
                insuranceProvider: true,
                policyNumber: true,
                insuranceVerified: true,
              }
            },
            // ✅ NEW: Include detailed inspection photos
            inspectionPhotos: {
              orderBy: { uploadedAt: 'asc' }
            },
            // ✅ NEW: Include guest review
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
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                type: true,
                contactEmail: true,
                contactPhone: true,
              }
            }
          }
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            earningsTier: true,
            p2pInsuranceActive: true,
            commercialInsuranceActive: true,
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        }
      }
    });

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    // ✅ NEW: Parse inspection photos from JSON fields
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

    // ✅ NEW: Build trip documentation object
    const tripDocumentation = {
      // Trip completion info
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
      
      // Mileage tracking
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
      
      // Fuel tracking
      fuel: {
        start: claim.booking.fuelLevelStart || null,
        end: claim.booking.fuelLevelEnd || null,
        percentUsed: calculateFuelUsage(claim.booking.fuelLevelStart, claim.booking.fuelLevelEnd)
      },
      
      // GPS location tracking
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
      
      // Photo documentation
      photos: {
        preTrip: preTripPhotos,
        postTrip: postTripPhotos,
        preTripCount: preTripPhotos.length,
        postTripCount: postTripPhotos.length,
        // Detailed inspection photo records
        detailed: claim.booking.inspectionPhotos.map((photo: any) => ({
          id: photo.id,
          type: photo.type,
          category: photo.category,
          url: photo.url,
          uploadedAt: photo.uploadedAt.toISOString()
        }))
      },
      
      // Guest review
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
      
      // Damage reporting
      damage: {
        reported: claim.booking.damageReported,
        description: claim.booking.damageDescription || null,
        photos: claim.damagePhotos || []
      }
    }

    // Build insurance hierarchy
    const insuranceHierarchy = [];
    
    // Check for guest insurance (Primary if active)
    if (claim.booking.reviewerProfile?.insuranceVerified && claim.booking.reviewerProfile.insuranceProvider) {
      insuranceHierarchy.push({
        level: 'PRIMARY',
        type: 'Guest Personal',
        provider: claim.booking.reviewerProfile.insuranceProvider,
        policyNumber: claim.booking.reviewerProfile.policyNumber,
        deductible: 0,
        coverage: 'Guest\'s personal auto insurance',
      });
    }

    // Host insurance (Primary if no guest insurance, Secondary otherwise)
    if (claim.booking.car.host.commercialInsuranceActive) {
      insuranceHierarchy.push({
        level: insuranceHierarchy.length === 0 ? 'PRIMARY' : 'SECONDARY',
        type: 'Host Commercial',
        provider: claim.booking.car.host.commercialInsuranceProvider || 'Commercial Provider',
        deductible: 500,
        coverage: 'Host\'s commercial auto insurance (90% earnings tier)',
      });
    } else if (claim.booking.car.host.p2pInsuranceActive) {
      insuranceHierarchy.push({
        level: insuranceHierarchy.length === 0 ? 'PRIMARY' : 'SECONDARY',
        type: 'Host P2P',
        provider: claim.booking.car.host.p2pInsuranceProvider || 'P2P Provider',
        deductible: 500,
        coverage: 'Host\'s peer-to-peer insurance (75% earnings tier)',
      });
    }

    // Platform insurance (always included as backup)
    if (claim.policy) {
      insuranceHierarchy.push({
        level: insuranceHierarchy.length === 0 ? 'PRIMARY' : 'TERTIARY',
        type: 'Platform',
        provider: claim.policy.provider.name,
        deductible: claim.policy.deductible,
        coverage: `${claim.policy.tier} - Liability: $${claim.policy.liabilityCoverage.toLocaleString()}, Collision: $${claim.policy.collisionCoverage.toLocaleString()}`,
      });
    }

    // Calculate financial breakdown
    const hostEarningsPercent = 
      claim.booking.car.host.commercialInsuranceActive ? 0.90 :
      claim.booking.car.host.p2pInsuranceActive ? 0.75 : 0.40;

    const financialBreakdown = {
      estimatedCost: claim.estimatedCost,
      approvedAmount: claim.approvedAmount || 0,
      deductible: claim.deductible,
      depositHeld: claim.booking.depositHeld || 0,
      hostEarningsPercent: hostEarningsPercent * 100,
      hostPayout: claim.approvedAmount ? claim.approvedAmount * hostEarningsPercent : 0,
      platformFee: claim.approvedAmount ? claim.approvedAmount * (1 - hostEarningsPercent) : 0,
      guestResponsibility: Math.max(0, claim.deductible - (claim.booking.depositHeld || 0)),
    };

    return NextResponse.json({
      ...claim,
      // ✅ NEW: Add trip documentation
      tripDocumentation,
      insuranceHierarchy,
      financialBreakdown,
      vehicleInfo: {
        id: claim.booking.car.id,
        make: claim.booking.car.make,
        model: claim.booking.car.model,
        year: claim.booking.car.year,
        licensePlate: claim.booking.car.licensePlate,
        photo: claim.booking.car.photos[0]?.url || null,
        hasActiveClaim: claim.booking.car.hasActiveClaim,
        claimLockUntil: claim.booking.car.claimLockUntil,
        safetyHold: claim.booking.car.safetyHold,
      },
      guestInfo: claim.booking.reviewerProfile ? {
        id: claim.booking.reviewerProfile.id,
        name: claim.booking.reviewerProfile.name,
        email: claim.booking.reviewerProfile.email,
        location: `${claim.booking.reviewerProfile.city}, ${claim.booking.reviewerProfile.state}`,
        accountOnHold: claim.booking.reviewerProfile.accountOnHold,
        hasInsurance: claim.booking.reviewerProfile.insuranceProvider ? true : false,
        insuranceProvider: claim.booking.reviewerProfile.insuranceProvider,
        insuranceVerified: claim.booking.reviewerProfile.insuranceVerified,
      } : {
        name: claim.booking.guestName,
        email: claim.booking.guestEmail,
        accountOnHold: false,
        hasInsurance: false,
      },
    });

  } catch (error) {
    console.error('Error fetching claim:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claim details' },
      { status: 500 }
    );
  }
}

// ✅ NEW: Helper function to calculate trip duration
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

// ✅ NEW: Helper function to calculate mileage allowance
function calculateMileageAllowance(startDate: Date, endDate: Date): number {
  const diffMs = endDate.getTime() - startDate.getTime()
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  return days * 200 // 200 miles per day allowance
}

// ✅ NEW: Helper function to calculate fuel usage percentage
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

// ✅ NEW: Helper function to format GPS address
function formatAddress(lat: number | null, lng: number | null): string | null {
  if (!lat || !lng) return null
  // For Phoenix area coordinates, return generic address
  // In production, you'd use Google Maps Geocoding API
  return 'Phoenix, AZ'
}