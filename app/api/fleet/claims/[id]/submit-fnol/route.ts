// app/api/fleet/claims/[id]/submit-fnol/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

/**
 * FNOL (First Notice of Loss) Submission Endpoint
 * Automatically submits approved claims to insurance provider APIs
 * 
 * POST /api/fleet/claims/[id]/submit-fnol?key=phoenix-fleet-2847
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: claimId } = await context.params
    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key')

    // Verify authentication key
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized: Invalid authentication key' 
        },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { 
      submittedBy = 'fleet-admin@itwhip.com',
      forceResubmit = false 
    } = body

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🚀 FNOL SUBMISSION REQUEST')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Claim ID:', claimId)
    console.log('Submitted By:', submittedBy)
    console.log('Force Resubmit:', forceResubmit)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Fetch claim with all related data
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        booking: {
          include: {
            renter: true,
            car: {
              include: {
                host: true
              }
            }
          }
        },
        InsurancePolicy: {
          include: {
            InsuranceProvider: true
          }
        }
      }
    }) as any

    if (!claim) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Claim not found' 
        },
        { status: 404 }
      )
    }

    // Check if claim is approved
    if (claim.status !== 'APPROVED') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Only approved claims can be submitted to insurer',
          details: {
            claimId: claim.id,
            currentStatus: claim.status
          }
        },
        { status: 400 }
      )
    }

    // Check if already submitted (unless force resubmit)
    if (claim.submittedToInsurerAt && !forceResubmit) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Claim already submitted to insurer',
          details: {
            claimId: claim.id,
            submittedAt: claim.submittedToInsurerAt,
            insurerClaimId: claim.insurerClaimId,
            insurerStatus: claim.insurerStatus
          }
        },
        { status: 400 }
      )
    }

    // Get insurance provider
    const provider = claim.InsurancePolicy?.InsuranceProvider
    if (!provider) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No insurance provider found for this claim' 
        },
        { status: 400 }
      )
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 CLAIM DETAILS')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Claim Type:', claim.type)
    console.log('Approved Amount:', claim.approvedAmount)
    console.log('Provider:', provider.name, `(${provider.type})`)
    console.log('Provider Active:', provider.isActive)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Check if provider is active
    if (!provider.isActive) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Provider ${provider.name} is currently inactive`,
          details: {
            providerId: provider.id,
            providerName: provider.name,
            providerStatus: 'inactive'
          }
        },
        { status: 400 }
      )
    }

    // Check API configuration
    const hasApiConfig = provider.apiEndpoint && provider.apiKey
    
    if (!hasApiConfig) {
      console.log('⚠️  Provider has no API configuration - Manual submission required')
      
      // Update claim with manual submission flag
      await prisma.claim.update({
        where: { id: claimId },
        data: {
          submittedToInsurerAt: new Date(),
          insurerStatus: 'MANUAL_SUBMISSION_REQUIRED',
          updatedAt: new Date()
        }
      })

      return NextResponse.json(
        { 
          success: false, 
          message: `${provider.name} requires manual claim submission`,
          details: {
            providerId: provider.id,
            providerName: provider.name,
            providerType: provider.type,
            reason: 'No API configuration',
            action: 'Please submit claim manually to provider',
            claimMarkedAs: 'MANUAL_SUBMISSION_REQUIRED'
          }
        },
        { status: 200 }
      )
    }

    // Build FNOL payload
    const fnolPayload = {
      claimReference: claim.id,
      bookingCode: claim.booking.bookingCode,
      incidentDate: claim.incidentDate,
      claimType: claim.type,
      description: claim.description,
      estimatedCost: claim.estimatedCost,
      approvedAmount: claim.approvedAmount,
      deductible: claim.deductible,
      
      // Vehicle information
      vehicle: {
        make: claim.booking.car.make,
        model: claim.booking.car.model,
        year: claim.booking.car.year,
        licensePlate: claim.booking.car.licensePlate || '',
        vin: claim.booking.car.vin || ''
      },
      
      // Guest information
      guest: {
        name: claim.booking.renter?.name || claim.booking.guestName || '',
        email: claim.booking.renter?.email || claim.booking.guestEmail || '',
        phone: claim.booking.guestPhone || ''
      },
      
      // Host information
      host: {
        name: claim.booking.car.host.name,
        email: claim.booking.car.host.email,
        phone: claim.booking.car.host.phone
      },
      
      // Policy information
      policy: {
        policyNumber: claim.InsurancePolicy?.policyNumber,
        tier: claim.InsurancePolicy?.tier,
        effectiveDate: claim.InsurancePolicy?.effectiveDate,
        expirationDate: claim.InsurancePolicy?.expiryDate
      },
      
      // Evidence
      damagePhotos: claim.damagePhotosLegacy || [],
      
      // Metadata
      platformClaimId: claim.id,
      submittedBy,
      submittedAt: new Date().toISOString()
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📤 FNOL PAYLOAD PREPARED')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(JSON.stringify(fnolPayload, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // TODO: Phase 2C - Implement actual API call to provider
    // For now, we'll simulate the submission
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔄 SIMULATING API CALL TO PROVIDER')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Endpoint:', provider.apiEndpoint)
    console.log('Method: POST')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock successful response
    const mockInsurerClaimId = `${provider.name.toUpperCase().replace(/\s/g, '_')}_${Date.now()}`
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ MOCK RESPONSE RECEIVED')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Insurer Claim ID:', mockInsurerClaimId)
    console.log('Status: SUBMITTED')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Update claim with submission details
    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: {
        submittedToInsurerAt: new Date(),
        insurerClaimId: mockInsurerClaimId,
        insurerStatus: 'SUBMITTED',
        updatedAt: new Date()
      }
    })

    // TODO: Phase 2B - Create FNOL activity log entry
    // await prisma.fnolSubmission.create({
    //   data: {
    //     claimId: claim.id,
    //     providerId: provider.id,
    //     status: 'SUCCESS',
    //     requestPayload: fnolPayload,
    //     responsePayload: mockResponse,
    //     insurerClaimId: mockInsurerClaimId,
    //     submittedBy,
    //     submittedAt: new Date()
    //   }
    // })

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ FNOL SUBMISSION COMPLETE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return NextResponse.json(
      {
        success: true,
        message: `Claim successfully submitted to ${provider.name}`,
        details: {
          claimId: claim.id,
          providerId: provider.id,
          providerName: provider.name,
          insurerClaimId: mockInsurerClaimId,
          insurerStatus: 'SUBMITTED',
          submittedAt: updatedClaim.submittedToInsurerAt,
          submittedBy
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('❌ FNOL SUBMISSION ERROR')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('Error:', error)
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error during FNOL submission',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check FNOL submission status
 * GET /api/fleet/claims/[id]/submit-fnol?key=phoenix-fleet-2847
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: claimId } = await context.params
    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key')

    // Verify authentication key
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized: Invalid authentication key' 
        },
        { status: 401 }
      )
    }

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
        InsurancePolicy: {
          select: {
            InsuranceProvider: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }
      }
    }) as any

    if (!claim) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Claim not found' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        claimId: claim.id,
        claimStatus: claim.status,
        submissionStatus: {
          submitted: !!claim.submittedToInsurerAt,
          submittedAt: claim.submittedToInsurerAt,
          insurerClaimId: claim.insurerClaimId,
          insurerStatus: claim.insurerStatus,
          insurerPaidAt: claim.insurerPaidAt,
          insurerPaidAmount: claim.insurerPaidAmount,
          insurerDenialReason: claim.insurerDenialReason
        },
        provider: claim.InsurancePolicy?.InsuranceProvider || null
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error checking FNOL status:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}