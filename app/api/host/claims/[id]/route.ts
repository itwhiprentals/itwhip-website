// app/api/host/claims/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

// GET /api/host/claims/[id] - Fetch single claim details (with ownership check)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const claimId = params.id

    // Fetch claim with all related data
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
        }
      }
    })

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      )
    }

    // Verify ownership - host must own this claim
    if (claim.hostId !== hostId) {
      return NextResponse.json(
        { error: 'Access denied. You do not own this claim.' },
        { status: 403 }
      )
    }

    // Format response with comprehensive data
    const formattedClaim = {
      // Basic claim info
      id: claim.id,
      type: claim.type,
      status: claim.status,
      reportedBy: claim.reportedBy,
      description: claim.description,
      
      // Financial info
      estimatedCost: claim.estimatedCost,
      approvedAmount: claim.approvedAmount,
      deductible: claim.deductible,
      netPayout: claim.approvedAmount 
        ? claim.approvedAmount - (claim.deductible || 0)
        : null,
      
      // Fault info
      guestAtFault: claim.guestAtFault,
      faultPercentage: claim.faultPercentage,
      
      // Dates
      incidentDate: claim.incidentDate?.toISOString() || null,
      createdAt: claim.createdAt.toISOString(),
      reviewedAt: claim.reviewedAt?.toISOString() || null,
      paidAt: claim.paidAt?.toISOString() || null,
      resolvedAt: claim.resolvedAt?.toISOString() || null,
      
      // Review info
      reviewedBy: claim.reviewedBy,
      reviewNotes: claim.reviewNotes,
      
      // Media
      damagePhotos: claim.damagePhotos || [],
      
      // History
      overrideHistory: claim.overrideHistory || [],
      
      // Status helpers
      isPending: claim.status === 'PENDING',
      isUnderReview: claim.status === 'UNDER_REVIEW',
      isApproved: claim.status === 'APPROVED',
      isDenied: claim.status === 'DENIED',
      isPaid: claim.status === 'PAID',
      isDisputed: claim.status === 'DISPUTED',
      isResolved: claim.status === 'RESOLVED',
      canDispute: ['DENIED'].includes(claim.status),
      
      // Booking details
      booking: {
        id: claim.booking.id,
        bookingCode: claim.booking.bookingCode,
        startDate: claim.booking.startDate.toISOString(),
        endDate: claim.booking.endDate.toISOString(),
        pickupTime: claim.booking.pickupTime,
        returnTime: claim.booking.returnTime,
        totalAmount: claim.booking.totalAmount,
        dailyRate: claim.booking.dailyRate,
        status: claim.booking.status,
        damageReported: claim.booking.damageReported,
        
        // Car details
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
          fullDisplayName: `${claim.booking.car.color} ${claim.booking.car.year} ${claim.booking.car.make} ${claim.booking.car.model}`
        } : null,
        
        // Guest details
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
      
      // Policy details
      policy: claim.policy ? {
        id: claim.policy.id,
        policyNumber: claim.policy.policyNumber,
        tier: claim.policy.tier,
        deductible: claim.policy.deductible,
        coverageAmount: claim.policy.coverageAmount,
        provider: claim.policy.provider
      } : null,
      
      // Host details
      host: {
        id: claim.host.id,
        name: claim.host.name,
        email: claim.host.email,
        phone: claim.host.phone
      },
      
      // Calculated timeline
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

// Helper function to build timeline from claim data
function buildTimeline(claim: any) {
  const events = []

  // Claim filed
  events.push({
    type: 'filed',
    status: 'PENDING',
    date: claim.createdAt.toISOString(),
    title: 'Claim Filed',
    description: `${claim.type} claim submitted for review`,
    by: claim.reportedBy
  })

  // Status changes from override history
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

  // Reviewed
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

  // Paid
  if (claim.paidAt) {
    const netAmount = claim.approvedAmount - (claim.deductible || 0)
    events.push({
      type: 'paid',
      status: 'PAID',
      date: claim.paidAt.toISOString(),
      title: 'Payout Processed',
      description: `$${netAmount.toFixed(2)} paid to host (after $${claim.deductible} deductible)`,
      amount: netAmount
    })
  }

  // Resolved
  if (claim.resolvedAt && claim.status === 'RESOLVED') {
    events.push({
      type: 'resolved',
      status: 'RESOLVED',
      date: claim.resolvedAt.toISOString(),
      title: 'Claim Resolved',
      description: 'Claim has been finalized'
    })
  }

  // Sort by date (oldest first for timeline display)
  return events.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}