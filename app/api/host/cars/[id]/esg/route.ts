// app/api/host/cars/[id]/esg/route.ts
/**
 * Vehicle-Specific ESG Score API
 * Returns ESG breakdown for individual vehicle
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { calculateVehicleESG } from '@/app/lib/esg/calculate-vehicle-esg'
import { analyzeTripMileage } from '@/app/lib/esg/trip-mileage-analyzer'
import { analyzeVehicleMaintenance } from '@/app/lib/esg/maintenance-tracker'

// ============================================================================
// GET: Fetch Vehicle ESG Score
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carId } = await params

    // Verify vehicle exists
    const car = await prisma.rentalCar.findUnique({
      where: { id: carId },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        fuelType: true,
        esgScore: true,
        esgSafetyScore: true,
        esgEnvironmentalScore: true,
        esgMaintenanceScore: true,
        esgLastCalculated: true,
        totalTrips: true,
        totalClaimsCount: true,
        hasActiveClaim: true,
        avgMilesPerTrip: true,
        guestRatingAvg: true,
        isActive: true,
        createdAt: true,
      },
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Check if scores need recalculation (older than 24 hours)
    const shouldRecalculate = !car.esgLastCalculated ||
      Date.now() - car.esgLastCalculated.getTime() > 24 * 60 * 60 * 1000

    let esgData

    if (shouldRecalculate) {
      // Recalculate fresh scores
      console.log('🔄 Recalculating ESG scores for vehicle:', carId)
      esgData = await calculateVehicleESG(carId)

      // Save to database
      await prisma.rentalCar.update({
        where: { id: carId },
        data: {
          esgScore: esgData.esgScore,
          esgSafetyScore: esgData.esgSafetyScore,
          esgEnvironmentalScore: esgData.esgEnvironmentalScore,
          esgMaintenanceScore: esgData.esgMaintenanceScore,
          esgLastCalculated: new Date(),
        },
      })
    } else {
      // Use cached scores
      console.log('✅ Using cached ESG scores for vehicle:', carId)
      esgData = await calculateVehicleESG(carId)
    }

    // Get additional analysis
    const mileageAnalysis = await analyzeTripMileage(carId)
    const maintenanceAnalysis = await analyzeVehicleMaintenance(carId)

    // ✅ ADDED: Calculate CO2 per mile
    const totalMiles = esgData.breakdown.usage.totalMiles || 0
    const estimatedCO2 = esgData.breakdown.environmental.estimatedCO2Impact || 0
    const avgCO2PerMile = totalMiles > 0 ? estimatedCO2 / totalMiles : 0

    // Build response
    const response = {
      vehicle: {
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        fuelType: car.fuelType,
        isActive: car.isActive,
      },
      esg: {
        compositeScore: esgData.esgScore,
        safetyScore: esgData.esgSafetyScore,
        environmentalScore: esgData.esgEnvironmentalScore,
        maintenanceScore: esgData.esgMaintenanceScore,
        lastCalculated: car.esgLastCalculated,
      },
      breakdown: {
        safety: {
          score: esgData.breakdown.safety.score,
          totalTrips: esgData.breakdown.safety.totalTrips,
          claimFreeTrips: esgData.breakdown.safety.claimFreeTrips,
          claimCount: esgData.breakdown.safety.claimCount,
          currentStreak: esgData.breakdown.safety.currentStreak,
          lastClaimDate: esgData.breakdown.safety.lastClaimDate,
          status: getSafetyStatus(esgData.breakdown.safety.score),
        },
        environmental: {
          score: esgData.breakdown.environmental.score,
          category: esgData.breakdown.environmental.category,
          fuelType: esgData.breakdown.environmental.fuelType,
          baselineScore: esgData.breakdown.environmental.baselineScore,
          estimatedCO2Impact: esgData.breakdown.environmental.estimatedCO2Impact,
          totalCO2Impact: esgData.breakdown.environmental.estimatedCO2Impact, // ✅ ADDED (same as estimatedCO2Impact for vehicle level)
          avgCO2PerMile: Math.round(avgCO2PerMile * 1000) / 1000, // ✅ ADDED (3 decimals)
          status: getEnvironmentalStatus(esgData.breakdown.environmental.category),
        },
        maintenance: {
          score: esgData.breakdown.maintenance.score,
          status: maintenanceAnalysis.status,
          lastServiceDate: esgData.breakdown.maintenance.lastServiceDate,
          daysSinceService: esgData.breakdown.maintenance.daysSinceService,
          isOverdue: esgData.breakdown.maintenance.isOverdue,
          overdueBy: esgData.breakdown.maintenance.overdueBy,
          nextServiceDue: maintenanceAnalysis.nextServiceDue,
          daysUntilService: maintenanceAnalysis.daysUntilService,
        },
        usage: {
          avgMilesPerTrip: esgData.breakdown.usage.avgMilesPerTrip,
          totalMiles: esgData.breakdown.usage.totalMiles,
          utilizationRate: esgData.breakdown.usage.utilizationRate,
        },
      },
      mileageAnalysis: {
        fraudRiskLevel: mileageAnalysis.fraudRiskLevel,
        mileageVariance: mileageAnalysis.mileageVariance,
        suspiciousPatterns: mileageAnalysis.suspiciousPatterns.length,
      },
      recommendations: [
        ...getVehicleRecommendations(esgData, maintenanceAnalysis, mileageAnalysis),
      ],
      metadata: {
        calculationVersion: '2.0',
        calculatedAt: new Date().toISOString(),
        dataPoints: {
          trips: car.totalTrips,
          claims: car.totalClaimsCount,
          hasActiveClaim: car.hasActiveClaim,
        },
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ Error fetching vehicle ESG:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle ESG data' },
      { status: 500 }
    )
  }
}

// ============================================================================
// HELPER: GET SAFETY STATUS
// ============================================================================

function getSafetyStatus(score: number): string {
  if (score >= 90) return 'EXCELLENT'
  if (score >= 75) return 'GOOD'
  if (score >= 60) return 'FAIR'
  if (score >= 40) return 'NEEDS_IMPROVEMENT'
  return 'CRITICAL'
}

// ============================================================================
// HELPER: GET ENVIRONMENTAL STATUS
// ============================================================================

function getEnvironmentalStatus(category: 'EV' | 'HYBRID' | 'GAS'): string {
  if (category === 'EV') return 'ZERO_EMISSION'
  if (category === 'HYBRID') return 'LOW_EMISSION'
  return 'STANDARD'
}

// ============================================================================
// HELPER: GET VEHICLE RECOMMENDATIONS
// ============================================================================

function getVehicleRecommendations(
  esgData: any,
  maintenanceAnalysis: any,
  mileageAnalysis: any
): string[] {
  const recommendations: string[] = []

  // Safety recommendations
  if (esgData.breakdown.safety.score < 70) {
    recommendations.push('⚠️ Safety score needs attention - review claim history')
  } else if (esgData.breakdown.safety.currentStreak >= 50) {
    recommendations.push('🏆 Excellent safety record - keep up the incident-free streak!')
  }

  // Environmental recommendations
  if (esgData.breakdown.environmental.category === 'GAS') {
    if (esgData.breakdown.environmental.score < 60) {
      recommendations.push('🌱 Consider replacing with a hybrid or electric vehicle')
    }
  } else if (esgData.breakdown.environmental.category === 'EV') {
    recommendations.push('✅ Zero-emission vehicle - excellent environmental impact')
  }

  // Maintenance recommendations
  if (maintenanceAnalysis.status === 'CRITICAL') {
    recommendations.push('🚨 URGENT: Vehicle requires immediate maintenance')
  } else if (maintenanceAnalysis.status === 'OVERDUE') {
    recommendations.push(`⏰ Maintenance is ${maintenanceAnalysis.overdueBy} days overdue`)
  } else if (maintenanceAnalysis.status === 'EXCELLENT') {
    recommendations.push('✅ Maintenance is up to date')
  }

  // Mileage/fraud recommendations
  if (mileageAnalysis.fraudRiskLevel === 'HIGH' || mileageAnalysis.fraudRiskLevel === 'CRITICAL') {
    recommendations.push('🔍 Mileage patterns flagged for review - verify odometer readings')
  }

  // High variance recommendations
  if (mileageAnalysis.mileageVariance > 75) {
    recommendations.push('📊 High mileage variance detected - standardize trip reporting')
  }

  // If no issues
  if (recommendations.length === 0) {
    recommendations.push('✨ Vehicle is performing well across all ESG metrics')
  }

  return recommendations
}

// ============================================================================
// POST: Trigger Manual Recalculation
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const carId = params.id

    // Verify vehicle exists
    const car = await prisma.rentalCar.findUnique({
      where: { id: carId },
      select: { id: true },
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    console.log('🔄 Manual ESG recalculation triggered for vehicle:', carId)

    // Force recalculation
    const esgData = await calculateVehicleESG(carId)

    // Save to database
    await prisma.rentalCar.update({
      where: { id: carId },
      data: {
        esgScore: esgData.esgScore,
        esgSafetyScore: esgData.esgSafetyScore,
        esgEnvironmentalScore: esgData.esgEnvironmentalScore,
        esgMaintenanceScore: esgData.esgMaintenanceScore,
        esgLastCalculated: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'ESG scores recalculated successfully',
      scores: {
        composite: esgData.esgScore,
        safety: esgData.esgSafetyScore,
        environmental: esgData.esgEnvironmentalScore,
        maintenance: esgData.esgMaintenanceScore,
      },
    })
  } catch (error) {
    console.error('❌ Error recalculating vehicle ESG:', error)
    return NextResponse.json(
      { error: 'Failed to recalculate ESG scores' },
      { status: 500 }
    )
  }
}