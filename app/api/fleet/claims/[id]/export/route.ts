// app/api/fleet/claims/[id]/export/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { ClaimPdfGenerator } from '@/app/lib/pdf/claimPdfGenerator'

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

    // Fetch complete claim data (same as detail page)
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
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
                insuranceProvider: true,
                policyNumber: true,
                insuranceVerified: true,
              }
            }
          }
        },
        InsurancePolicy: {
          include: {
            InsuranceProvider: {
              select: {
                id: true,
                name: true,
                type: true,
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
      }
    })

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    // Build insurance hierarchy
    const insuranceHierarchy = []
    
    // Guest insurance (Primary if active)
    if (claim.booking.reviewerProfile?.insuranceVerified && claim.booking.reviewerProfile.insuranceProvider) {
      insuranceHierarchy.push({
        level: 'PRIMARY',
        type: 'Guest Personal',
        provider: claim.booking.reviewerProfile.insuranceProvider,
        policyNumber: claim.booking.reviewerProfile.policyNumber,
        deductible: 0,
        coverage: "Guest's personal auto insurance",
      })
    }

    // Host insurance
    if (claim.booking.car.host.commercialInsuranceActive) {
      insuranceHierarchy.push({
        level: insuranceHierarchy.length === 0 ? 'PRIMARY' : 'SECONDARY',
        type: 'Host Commercial',
        provider: claim.booking.car.host.commercialInsuranceProvider || 'Commercial Provider',
        deductible: 500,
        coverage: "Host's commercial auto insurance (90% earnings tier)",
      })
    } else if (claim.booking.car.host.p2pInsuranceActive) {
      insuranceHierarchy.push({
        level: insuranceHierarchy.length === 0 ? 'PRIMARY' : 'SECONDARY',
        type: 'Host P2P',
        provider: claim.booking.car.host.p2pInsuranceProvider || 'P2P Provider',
        deductible: 500,
        coverage: "Host's peer-to-peer insurance (75% earnings tier)",
      })
    }

    // Platform insurance
    if (claim.InsurancePolicy) {
      insuranceHierarchy.push({
        level: insuranceHierarchy.length === 0 ? 'PRIMARY' : 'TERTIARY',
        type: 'Platform',
        provider: claim.InsurancePolicy.InsuranceProvider.name,
        deductible: claim.InsurancePolicy.deductible,
        coverage: `${claim.InsurancePolicy.tier} - Liability: $${claim.InsurancePolicy.liabilityCoverage.toLocaleString()}, Collision: $${claim.InsurancePolicy.collisionCoverage.toLocaleString()}`,
      })
    }

    // Calculate financial breakdown
    const hostEarningsPercent = 
      claim.booking.car.host.commercialInsuranceActive ? 0.90 :
      claim.booking.car.host.p2pInsuranceActive ? 0.75 : 0.40

    const financialBreakdown = {
      estimatedCost: claim.estimatedCost,
      approvedAmount: claim.approvedAmount || 0,
      deductible: claim.deductible,
      depositHeld: claim.booking.depositHeld || 0,
      hostEarningsPercent: hostEarningsPercent * 100,
      hostPayout: claim.approvedAmount ? claim.approvedAmount * hostEarningsPercent : 0,
      platformFee: claim.approvedAmount ? claim.approvedAmount * (1 - hostEarningsPercent) : 0,
      guestResponsibility: Math.max(0, claim.deductible - (claim.booking.depositHeld || 0)),
    }

    // Format data for PDF generator
    const pdfData = {
      id: claim.id,
      type: claim.type,
      status: claim.status,
      description: claim.description,
      estimatedCost: claim.estimatedCost,
      approvedAmount: claim.approvedAmount,
      deductible: claim.deductible,
      incidentDate: claim.incidentDate.toISOString(),
      createdAt: claim.createdAt.toISOString(),
      reviewedAt: claim.reviewedAt?.toISOString() || null,
      reviewedBy: claim.reviewedBy,
      reviewNotes: claim.reviewNotes,
      
      booking: {
        bookingCode: claim.booking.bookingCode,
        startDate: claim.booking.startDate.toISOString(),
        endDate: claim.booking.endDate.toISOString(),
        guestName: claim.booking.guestName,
        guestEmail: claim.booking.guestEmail,
        depositHeld: claim.booking.depositHeld || 0,
      },
      
      policy: {
        tier: claim.InsurancePolicy.tier,
        deductible: claim.InsurancePolicy.deductible,
        liabilityCoverage: claim.InsurancePolicy.liabilityCoverage,
        collisionCoverage: claim.InsurancePolicy.collisionCoverage,
        policyNumber: claim.InsurancePolicy.policyNumber,
        externalPolicyId: claim.InsurancePolicy.externalPolicyId,
        boundViaApi: claim.InsurancePolicy.boundViaApi,
        provider: {
          name: claim.InsurancePolicy.InsuranceProvider.name,
        },
      },
      
      host: {
        name: claim.host.name,
        email: claim.host.email,
        phone: claim.host.phone,
        earningsTier: claim.host.earningsTier,
      },
      
      insuranceHierarchy,
      financialBreakdown,
      
      vehicleInfo: {
        make: claim.booking.car.make,
        model: claim.booking.car.model,
        year: claim.booking.car.year,
        licensePlate: claim.booking.car.licensePlate,
      },
      
      guestInfo: claim.booking.reviewerProfile ? {
        name: claim.booking.reviewerProfile.name,
        email: claim.booking.reviewerProfile.email,
        location: `${claim.booking.reviewerProfile.city}, ${claim.booking.reviewerProfile.state}`,
        accountOnHold: claim.booking.reviewerProfile.accountOnHold,
        hasInsurance: claim.booking.reviewerProfile.insuranceProvider ? true : false,
        insuranceProvider: claim.booking.reviewerProfile.insuranceProvider,
      } : {
        name: claim.booking.guestName || 'Unknown',
        email: claim.booking.guestEmail || 'Unknown',
        accountOnHold: false,
        hasInsurance: false,
        insuranceProvider: null,
      },
      
      submittedToInsurerAt: claim.submittedToInsurerAt?.toISOString() || null,
      insurerClaimId: claim.insurerClaimId,
      insurerStatus: claim.insurerStatus,
    }

    // Generate PDF using jsPDF (synchronous)
    const generator = new ClaimPdfGenerator()
    const pdfDoc = generator.generate(pdfData as any)
    
    // Get buffer directly from jsPDF
    const pdfBuffer = generator.getBuffer()

    // Generate filename
    const filename = `claim-${claim.id.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`

    // Return PDF as download
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}