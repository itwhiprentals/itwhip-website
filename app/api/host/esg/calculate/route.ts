// app/api/host/esg/calculate/route.ts
/**
 * Manual ESG Recalculation API
 * Allows hosts/admins to force refresh of ESG scores
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { updateHostESGProfile } from '@/app/lib/esg/calculate-host-esg'
import { updateVehicleESGScores } from '@/app/lib/esg/calculate-vehicle-esg'

// ============================================================================
// POST: Force Recalculation of Host ESG Profile
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Get host ID from headers
    const hostId = request.headers.get('x-host-id')
    
    if (!hostId) {
      return NextResponse.json(
        { error: 'Host ID required' },
        { status: 400 }
      )
    }

    // Verify host exists
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        name: true,
        cars: {
          select: { id: true },
        },
      },
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    console.log('🔄 Manual ESG recalculation triggered for host:', hostId)

    // Step 1: Recalculate all vehicle ESG scores
    const vehicleUpdates = await Promise.all(
      host.cars.map((car) => updateVehicleESGScores(car.id))
    )

    console.log(`✅ Updated ${vehicleUpdates.length} vehicle ESG scores`)

    // Step 2: Recalculate host aggregate ESG profile
    await updateHostESGProfile(hostId)

    console.log('✅ Host ESG profile updated')

    // Step 3: Fetch updated profile to return
    const updatedProfile = await prisma.hostESGProfile.findUnique({
      where: { hostId },
      select: {
        compositeScore: true,
        drivingImpactScore: true,
        emissionsScore: true,
        maintenanceScore: true,
        safetyScore: true,
        complianceScore: true,
        totalTrips: true,
        currentIncidentStreak: true,
        evVehicleCount: true,
        totalVehicles: true,
        lastCalculatedAt: true,
        dataConfidence: true,
      },
    })

    // Step 4: Create snapshot for historical tracking
    if (updatedProfile) {
      await prisma.eSGSnapshot.create({
        data: {
          id: crypto.randomUUID(),
          profileId: hostId,
          compositeScore: updatedProfile.compositeScore,
          drivingImpactScore: updatedProfile.drivingImpactScore,
          emissionsScore: updatedProfile.emissionsScore,
          maintenanceScore: updatedProfile.maintenanceScore,
          safetyScore: updatedProfile.safetyScore,
          complianceScore: updatedProfile.complianceScore,
          snapshotReason: 'MANUAL_REFRESH',
          snapshotDate: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'ESG scores recalculated successfully',
      profile: updatedProfile,
      vehiclesUpdated: vehicleUpdates.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ Error recalculating ESG:', error)
    return NextResponse.json(
      {
        error: 'Failed to recalculate ESG scores',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET: Check Last Calculation Status
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Get host ID from headers
    const hostId = request.headers.get('x-host-id')
    
    if (!hostId) {
      return NextResponse.json(
        { error: 'Host ID required' },
        { status: 400 }
      )
    }

    // Get profile info
    const profile = await prisma.hostESGProfile.findUnique({
      where: { hostId },
      select: {
        lastCalculatedAt: true,
        compositeScore: true,
        calculationVersion: true,
        dataConfidence: true,
      },
    })

    if (!profile) {
      return NextResponse.json(
        {
          needsCalculation: true,
          message: 'No ESG profile exists yet',
        },
        { status: 200 }
      )
    }

    // Check if recalculation is needed (older than 24 hours)
    const hoursSinceCalculation = profile.lastCalculatedAt
      ? (Date.now() - profile.lastCalculatedAt.getTime()) / (1000 * 60 * 60)
      : null

    const needsCalculation = !profile.lastCalculatedAt || hoursSinceCalculation! > 24

    return NextResponse.json({
      lastCalculated: profile.lastCalculatedAt,
      hoursSinceCalculation: hoursSinceCalculation?.toFixed(1),
      needsCalculation,
      currentScore: profile.compositeScore,
      calculationVersion: profile.calculationVersion,
      dataConfidence: profile.dataConfidence,
    })
  } catch (error) {
    console.error('❌ Error checking calculation status:', error)
    return NextResponse.json(
      { error: 'Failed to check calculation status' },
      { status: 500 }
    )
  }
}