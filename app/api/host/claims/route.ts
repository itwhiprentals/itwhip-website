// app/api/host/claims/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

// GET /api/host/claims - Fetch all claims for logged-in host
export async function GET(request: NextRequest) {
  try {
    // Get host ID from middleware (x-host-id header)
    const hostId = request.headers.get('x-host-id')

    if (!hostId) {
      return NextResponse.json(
        { error: 'Unauthorized - Host ID not found' },
        { status: 401 }
      )
    }

    // Get optional status filter from query params
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')

    // Build where clause
    const whereClause: any = {
      hostId
    }

    // Add status filter if provided
    if (statusFilter && statusFilter !== 'ALL') {
      whereClause.status = statusFilter
    }

    // Fetch claims with related data
    const claims = await prisma.claim.findMany({
      where: whereClause,
      include: {
        booking: {
          include: {
            car: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
                licensePlate: true,
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
                phone: true
              }
            }
          }
        },
        InsurancePolicy: {
          select: {
            id: true,
            policyNumber: true,
            tier: true,
            deductible: true,
            liabilityCoverage: true,
            collisionCoverage: true
          }
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data for frontend
    const formattedClaims = claims.map(claim => ({
      id: claim.id,
      type: claim.type,
      status: claim.status,
      reportedBy: claim.reportedBy,
      description: claim.description,
      estimatedCost: claim.estimatedCost,
      approvedAmount: claim.approvedAmount,
      deductible: claim.deductible,
      incidentDate: claim.incidentDate?.toISOString() || null,
      createdAt: claim.createdAt.toISOString(),
      reviewedAt: claim.reviewedAt?.toISOString() || null,
      reviewedBy: claim.reviewedBy,
      reviewNotes: claim.reviewNotes,
      paidAt: (claim as any).paidAt?.toISOString() || null,
      resolvedAt: claim.resolvedAt?.toISOString() || null,
      guestAtFault: claim.guestAtFault,
      faultPercentage: claim.faultPercentage,
      damagePhotos: claim.damagePhotosLegacy || [],
      overrideHistory: claim.overrideHistory || [],
      
      // Related data
      booking: {
        id: claim.booking.id,
        bookingCode: claim.booking.bookingCode,
        startDate: claim.booking.startDate.toISOString(),
        endDate: claim.booking.endDate.toISOString(),
        totalAmount: claim.booking.totalAmount,
        guest: claim.booking.renter ? {
          id: claim.booking.renter.id,
          name: claim.booking.renter.name,
          email: claim.booking.renter.email,
          phone: claim.booking.renter.phone
        } : claim.booking.guestName ? {
          id: 'guest',
          name: claim.booking.guestName,
          email: claim.booking.guestEmail || 'N/A',
          phone: claim.booking.guestPhone || 'N/A'
        } : null,
        car: claim.booking.car ? {
          id: claim.booking.car.id,
          make: claim.booking.car.make,
          model: claim.booking.car.model,
          year: claim.booking.car.year,
          licensePlate: claim.booking.car.licensePlate,
          heroPhoto: claim.booking.car.photos?.[0]?.url || null,
          displayName: `${claim.booking.car.year} ${claim.booking.car.make} ${claim.booking.car.model}`
        } : null
      },
      
      policy: claim.InsurancePolicy ? {
        id: claim.InsurancePolicy.id,
        policyNumber: claim.InsurancePolicy.policyNumber,
        tier: claim.InsurancePolicy.tier,
        deductible: claim.InsurancePolicy.deductible,
        coverageAmount: claim.InsurancePolicy.collisionCoverage,
        liabilityCoverage: claim.InsurancePolicy.liabilityCoverage
      } : null,

      // Calculated fields
      netPayout: claim.approvedAmount 
        ? claim.approvedAmount - (claim.deductible || 0)
        : null,
      
      isPending: claim.status === 'PENDING',
      isUnderReview: claim.status === 'UNDER_REVIEW',
      isApproved: claim.status === 'APPROVED',
      isDenied: claim.status === 'DENIED',
      isPaid: claim.status === 'PAID',
      isResolved: ['APPROVED', 'DENIED', 'PAID', 'RESOLVED'].includes(claim.status)
    }))

    // Calculate summary statistics
    const summary = {
      total: formattedClaims.length,
      pending: formattedClaims.filter(c => c.status === 'PENDING').length,
      underReview: formattedClaims.filter(c => c.status === 'UNDER_REVIEW').length,
      approved: formattedClaims.filter(c => c.status === 'APPROVED').length,
      denied: formattedClaims.filter(c => c.status === 'DENIED').length,
      paid: formattedClaims.filter(c => c.status === 'PAID').length,
      totalEstimated: formattedClaims.reduce((sum, c) => sum + (c.estimatedCost || 0), 0),
      totalApproved: formattedClaims.reduce((sum, c) => sum + (c.approvedAmount || 0), 0),
      totalPaid: formattedClaims
        .filter(c => c.isPaid)
        .reduce((sum, c) => sum + ((c.approvedAmount || 0) - (c.deductible || 0)), 0)
    }

    return NextResponse.json({
      success: true,
      claims: formattedClaims,
      summary,
      filter: statusFilter || 'ALL'
    })

  } catch (error) {
    console.error('Error fetching host claims:', error)
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    )
  }
}