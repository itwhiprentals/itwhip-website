// app/api/partner/fleet/[id]/insurance/route.ts
// Vehicle Insurance API - Per-vehicle insurance management

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    if (!partner || (partner.hostType !== 'FLEET_PARTNER' && partner.hostType !== 'PARTNER')) {
      return null
    }

    return partner
  } catch {
    return null
  }
}

// PUT - Update vehicle insurance settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: vehicleId } = await params

    // Verify vehicle belongs to this partner
    const vehicle = await prisma.rentalCar.findFirst({
      where: {
        id: vehicleId,
        hostId: partner.id
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      hasOwnInsurance,
      insuranceProvider,
      policyNumber,
      policyExpires,
      useForRentals
    } = body

    // Build insurance notes JSON
    const insuranceNotes = JSON.stringify({
      hasOwnInsurance: hasOwnInsurance || false,
      provider: hasOwnInsurance ? insuranceProvider : null,
      policyNumber: hasOwnInsurance ? policyNumber : null,
      policyExpires: hasOwnInsurance && policyExpires ? policyExpires : null,
      useForRentals: hasOwnInsurance ? (useForRentals || false) : false
    })

    // Update vehicle
    await prisma.rentalCar.update({
      where: { id: vehicleId },
      data: {
        insuranceNotes,
        insuranceEligible: hasOwnInsurance && useForRentals
      }
    })

    console.log(`[Vehicle Insurance] Updated insurance for vehicle ${vehicleId}:`, {
      hasOwnInsurance,
      useForRentals,
      insuranceEligible: hasOwnInsurance && useForRentals
    })

    return NextResponse.json({
      success: true,
      message: 'Vehicle insurance updated successfully'
    })

  } catch (error) {
    console.error('[Vehicle Insurance] Update error:', error)
    return NextResponse.json({ error: 'Failed to update vehicle insurance' }, { status: 500 })
  }
}

// GET - Get vehicle insurance settings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: vehicleId } = await params

    // Verify vehicle belongs to this partner
    const vehicle = await prisma.rentalCar.findFirst({
      where: {
        id: vehicleId,
        hostId: partner.id
      },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        insuranceNotes: true,
        insuranceEligible: true
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Parse insurance notes
    let insuranceInfo = {
      hasOwnInsurance: false,
      provider: null as string | null,
      policyNumber: null as string | null,
      policyExpires: null as string | null,
      useForRentals: false
    }

    if (vehicle.insuranceNotes) {
      try {
        const parsed = JSON.parse(vehicle.insuranceNotes)
        insuranceInfo = {
          hasOwnInsurance: parsed.hasOwnInsurance || false,
          provider: parsed.provider || null,
          policyNumber: parsed.policyNumber || null,
          policyExpires: parsed.policyExpires || null,
          useForRentals: parsed.useForRentals || false
        }
      } catch {
        // Invalid JSON, use defaults
      }
    }

    return NextResponse.json({
      success: true,
      vehicle: {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year
      },
      insurance: insuranceInfo
    })

  } catch (error) {
    console.error('[Vehicle Insurance] Get error:', error)
    return NextResponse.json({ error: 'Failed to fetch vehicle insurance' }, { status: 500 })
  }
}
