// app/api/fleet/claims/[id]/submit/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { submitFNOL } from '@/app/lib/integrations/insurerApi'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    // Authentication check
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Await params (Next.js 15 requirement)
    const { id: claimId } = await params

    // Fetch complete claim data
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        booking: {
          include: {
            car: {
              include: {
                host: {
                  select: {
                    name: true,
                    email: true,
                    phone: true,
                    earningsTier: true,
                  }
                }
              }
            },
            reviewerProfile: {
              select: {
                name: true,
                email: true,
                city: true,
                state: true,
                insuranceProvider: true,
                policyNumber: true,
                insuranceVerified: true,
              }
            }
          }
        },
        InsurancePolicy: {
          select: {
            policyNumber: true,
            externalPolicyId: true,
            tier: true,
            liabilityCoverage: true,
            collisionCoverage: true,
            deductible: true,
          }
        },
        host: {
          select: {
            name: true,
            email: true,
            phone: true,
            earningsTier: true,
          }
        }
      }
    })

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    // Check if already submitted
    if (claim.submittedToInsurerAt) {
      return NextResponse.json({
        error: 'Claim already submitted to insurer',
        insurerClaimId: claim.insurerClaimId,
        submittedAt: claim.submittedToInsurerAt,
      }, { status: 400 })
    }

    // Check if claim is approved
    if (claim.status !== 'APPROVED') {
      return NextResponse.json({
        error: 'Only approved claims can be submitted to insurer',
        currentStatus: claim.status,
      }, { status: 400 })
    }

    // Prepare FNOL data
    const fnolData = {
      // Claim information
      claimId: claim.id,
      claimType: claim.type,
      incidentDate: claim.incidentDate.toISOString(),
      description: claim.description,
      estimatedCost: claim.estimatedCost,
      
      // Policy information
      policyNumber: claim.InsurancePolicy.policyNumber,
      externalPolicyId: claim.InsurancePolicy.externalPolicyId,
      policyTier: claim.InsurancePolicy.tier,
      liabilityCoverage: claim.InsurancePolicy.liabilityCoverage,
      collisionCoverage: claim.InsurancePolicy.collisionCoverage,
      deductible: claim.InsurancePolicy.deductible,
      
      // Host information
      hostName: claim.host.name,
      hostEmail: claim.host.email,
      hostPhone: claim.host.phone,
      hostEarningsTier: claim.host.earningsTier,
      
      // Guest information
      guestName: claim.booking.reviewerProfile?.name || claim.booking.guestName || 'Unknown',
      guestEmail: claim.booking.reviewerProfile?.email || claim.booking.guestEmail || 'unknown@itwhip.com',
      guestLocation: claim.booking.reviewerProfile 
        ? `${claim.booking.reviewerProfile.city}, ${claim.booking.reviewerProfile.state}`
        : undefined,
      guestInsurance: claim.booking.reviewerProfile?.insuranceVerified && claim.booking.reviewerProfile.insuranceProvider
        ? {
            provider: claim.booking.reviewerProfile.insuranceProvider,
            policyNumber: claim.booking.reviewerProfile.policyNumber || 'Unknown',
          }
        : undefined,
      
      // Vehicle information
      vehicleMake: claim.booking.car.make,
      vehicleModel: claim.booking.car.model,
      vehicleYear: claim.booking.car.year,
      vehicleLicensePlate: claim.booking.car.licensePlate,
      vehicleVIN: claim.booking.car.vin || undefined,
      
      // Booking information
      bookingCode: claim.booking.bookingCode,
      bookingStartDate: claim.booking.startDate.toISOString(),
      bookingEndDate: claim.booking.endDate.toISOString(),
      
      // Evidence
      damagePhotos: claim.damagePhotosLegacy ? claim.damagePhotosLegacy as string[] : undefined,
    }

    // Submit FNOL to insurer
    console.log('📤 Submitting FNOL to insurer:', {
      claimId: claim.id,
      bookingCode: claim.booking.bookingCode,
      estimatedCost: claim.estimatedCost,
    })

    const fnolResult = await submitFNOL(fnolData as any)

    if (!fnolResult.success) {
      // Log the failure but don't fail the request
      console.error('❌ FNOL submission failed:', fnolResult.error)
      
      return NextResponse.json({
        success: false,
        error: 'Failed to submit to insurer',
        details: fnolResult.error,
      }, { status: 500 })
    }

    // Update claim with insurer information
    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: {
        submittedToInsurerAt: new Date(),
        insurerClaimId: fnolResult.insurerClaimId,
        insurerStatus: fnolResult.insurerStatus || 'SUBMITTED',
        
        // Add to activity log
        activityLog: {
          push: {
            timestamp: new Date().toISOString(),
            action: 'SUBMITTED_TO_INSURER',
            actor: 'SYSTEM',
            details: {
              insurerClaimId: fnolResult.insurerClaimId,
              insurerStatus: fnolResult.insurerStatus,
              submittedAt: fnolResult.submittedAt,
            },
          },
        },
        
        // Update status history
        statusHistory: {
          push: {
            status: 'SUBMITTED_TO_INSURER',
            timestamp: new Date().toISOString(),
            changedBy: 'SYSTEM',
          },
        },
      },
    })

    console.log('✅ FNOL submitted successfully:', {
      claimId: claim.id,
      insurerClaimId: fnolResult.insurerClaimId,
      insurerStatus: fnolResult.insurerStatus,
    })

    return NextResponse.json({
      success: true,
      message: 'Claim successfully submitted to insurer',
      data: {
        claimId: updatedClaim.id,
        insurerClaimId: updatedClaim.insurerClaimId,
        insurerStatus: updatedClaim.insurerStatus,
        submittedAt: updatedClaim.submittedToInsurerAt,
      },
    })

  } catch (error) {
    console.error('Error submitting claim to insurer:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to submit claim to insurer',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET: Check submission status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    // Authentication check
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Await params (Next.js 15 requirement)
    const { id: claimId } = await params

    // Fetch claim submission status
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      select: {
        id: true,
        status: true,
        submittedToInsurerAt: true,
        insurerClaimId: true,
        insurerStatus: true,
        insurerPaidAt: true,
        insurerPaidAmount: true,
        insurerDenialReason: true,
      },
    })

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    return NextResponse.json({
      claimId: claim.id,
      status: claim.status,
      submitted: !!claim.submittedToInsurerAt,
      submittedAt: claim.submittedToInsurerAt,
      insurerClaimId: claim.insurerClaimId,
      insurerStatus: claim.insurerStatus,
      insurerPaid: !!claim.insurerPaidAt,
      insurerPaidAt: claim.insurerPaidAt,
      insurerPaidAmount: claim.insurerPaidAmount,
      insurerDenialReason: claim.insurerDenialReason,
    })

  } catch (error) {
    console.error('Error fetching submission status:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch submission status' },
      { status: 500 }
    )
  }
}