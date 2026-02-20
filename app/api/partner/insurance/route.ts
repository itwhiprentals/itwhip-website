// app/api/partner/insurance/route.ts
// Partner Insurance Settings API - Standalone partner insurance management

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

async function getPartnerFromToken(request?: NextRequest) {
  // Check Authorization header first (mobile app), then fall back to cookies
  let token: string | undefined
  const authHeader = request?.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }
  if (!token) {
    const cookieStore = await cookies()
    // Accept both partner_token AND hostAccessToken for unified portal
    token = cookieStore.get('partner_token')?.value ||
                  cookieStore.get('hostAccessToken')?.value
  }

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    // Allow all host types since we've unified the portals
    if (!partner) {
      return null
    }

    return partner
  } catch {
    return null
  }
}

// GET - Get partner's insurance settings
export async function GET(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken(request)

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse partner policies for insurance settings (stored in partnerPolicies JSON field)
    let insuranceNotes: {
      coversVehicles?: boolean
      coversDuringRentals?: boolean
      acknowledgedNoInsurance?: boolean
      coveredVehicleIds?: string[]
      rentalCoveredVehicleIds?: string[]
    } = {}

    if (partner.partnerPolicies && typeof partner.partnerPolicies === 'object') {
      const policies = partner.partnerPolicies as Record<string, any>
      if (policies.insurance) {
        insuranceNotes = policies.insurance
      }
    }

    // Get partner insurance settings - simplified model
    const insuranceSettings = {
      hasPartnerInsurance: !!partner.hostInsuranceProvider,
      insuranceProvider: partner.hostInsuranceProvider || null,
      policyNumber: partner.hostPolicyNumber || null,
      policyExpires: partner.hostInsuranceExpires?.toISOString() || null,
      coversVehicles: insuranceNotes.coversVehicles || false,
      coversDuringRentals: insuranceNotes.coversDuringRentals || false,
      acknowledgedNoInsurance: insuranceNotes.acknowledgedNoInsurance || false,
      requireGuestInsurance: !insuranceNotes.coversDuringRentals,
      // Vehicle coverage lists
      coveredVehicleIds: insuranceNotes.coveredVehicleIds || [],
      rentalCoveredVehicleIds: insuranceNotes.rentalCoveredVehicleIds || []
    }

    // Get vehicle count with and without their own insurance
    const vehiclesWithInsurance = await prisma.rentalCar.count({
      where: {
        hostId: partner.id,
        insuranceEligible: true
      }
    })

    const totalVehicles = await prisma.rentalCar.count({
      where: { hostId: partner.id }
    })

    return NextResponse.json({
      success: true,
      insurance: insuranceSettings,
      stats: {
        totalVehicles,
        vehiclesWithInsurance,
        vehiclesWithoutInsurance: totalVehicles - vehiclesWithInsurance
      },
      revenuePath: partner.revenuePath || null,
      revenueTier: partner.revenueTier || null,
    })

  } catch (error) {
    console.error('[Partner Insurance] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch insurance settings' }, { status: 500 })
  }
}

// PUT - Update partner insurance settings
export async function PUT(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken(request)

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      hasPartnerInsurance,
      insuranceProvider,
      policyNumber,
      policyExpires,
      coversVehicles,
      coversDuringRentals,
      acknowledgedNoInsurance,
      coveredVehicleIds,
      rentalCoveredVehicleIds
    } = body

    // Build update data
    const updateData: Record<string, any> = {}

    // Update insurance provider fields
    if (hasPartnerInsurance) {
      updateData.hostInsuranceProvider = insuranceProvider || null
      updateData.hostPolicyNumber = policyNumber || null
      updateData.hostInsuranceExpires = policyExpires ? new Date(policyExpires) : null
    } else {
      // Clear insurance fields if partner doesn't have insurance
      updateData.hostInsuranceProvider = null
      updateData.hostPolicyNumber = null
      updateData.hostInsuranceExpires = null
    }

    // Get existing partnerPolicies to preserve other settings
    const existingPolicies = (partner.partnerPolicies && typeof partner.partnerPolicies === 'object')
      ? partner.partnerPolicies as Record<string, any>
      : {}

    // Store insurance settings in partnerPolicies JSON field
    updateData.partnerPolicies = {
      ...existingPolicies,
      insurance: {
        coversVehicles: hasPartnerInsurance ? (coversVehicles || false) : false,
        coversDuringRentals: hasPartnerInsurance ? (coversDuringRentals || false) : false,
        acknowledgedNoInsurance: !hasPartnerInsurance ? (acknowledgedNoInsurance || false) : false,
        // Store which vehicles are covered by partner insurance
        coveredVehicleIds: hasPartnerInsurance && coversVehicles ? (coveredVehicleIds || []) : [],
        rentalCoveredVehicleIds: hasPartnerInsurance && coversDuringRentals ? (rentalCoveredVehicleIds || []) : []
      }
    }

    // Update partner
    await prisma.rentalHost.update({
      where: { id: partner.id },
      data: updateData
    })

    console.log(`[Partner Insurance] Updated insurance for partner ${partner.id}:`, {
      hasInsurance: hasPartnerInsurance,
      coversVehicles,
      coversDuringRentals,
      acknowledgedNoInsurance: !hasPartnerInsurance && acknowledgedNoInsurance
    })

    return NextResponse.json({
      success: true,
      message: 'Insurance settings updated successfully'
    })

  } catch (error) {
    console.error('[Partner Insurance] Update error:', error)
    return NextResponse.json({ error: 'Failed to update insurance settings' }, { status: 500 })
  }
}
