// app/lib/esg/calculate-host-esg.ts
/**
 * Host-Level ESG Score Calculation
 * Aggregates vehicle-level scores into host-level composite score
 */

import prisma from '@/app/lib/database/prisma'
import { calculateVehicleESG } from './calculate-vehicle-esg'
import { analyzeFleetComposition, FleetComposition } from './fleet-composition'
import { analyzeServiceTriggers } from '@/app/lib/service/calculate-service-triggers'
import {
  clampScore,
  weightedAverage,
  safePercentage,
  generateImprovementTips,
  calculateDataConfidence,
} from './esg-helpers'

// ============================================================================
// TYPES
// ============================================================================

export interface HostESGProfile {
  // Composite scores
  compositeScore: number
  drivingImpactScore: number
  emissionsScore: number
  maintenanceScore: number
  safetyScore: number
  complianceScore: number

  // Safety metrics
  totalTrips: number
  incidentFreeTrips: number
  totalClaimsFiled: number
  currentIncidentStreak: number
  longestIncidentStreak: number
  lastIncidentDate: Date | null

  // Environmental metrics
  totalEVTrips: number
  evTripPercentage: number
  estimatedCO2Saved: number
  totalCO2Impact: number           // ✅ NEW: Total CO2 emitted
  avgCO2PerMile: number            // ✅ NEW: Average CO2 per mile across fleet
  fuelEfficiencyRating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'UNKNOWN'

  // Compliance metrics
  maintenanceOnTime: boolean
  lastMaintenanceDate: Date | null
  overdueMaintenanceCount: number
  fnolCompletionRate: number
  avgResponseTimeHours: number

  // Fraud detection metrics
  unauthorizedMileage: number
  suspiciousActivityCount: number
  verificationFailures: number
  fraudRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

  // Usage pattern metrics
  totalMilesDriven: number
  avgMilesPerTrip: number
  tripCompletionRate: number
  idleTimeEfficiency: number

  // Trip quality metrics
  tripCancellationRate: number
  lateReturnCount: number
  earlyReturnCount: number
  guestRatingAverage: number

  // Vehicle fleet metrics
  totalVehicles: number
  activeVehicles: number
  evVehicleCount: number
  avgVehicleAge: number

  // Insurance & risk metrics
  hasCommercialInsurance: boolean
  hasP2PInsurance: boolean
  insuranceTier: 'PLATFORM' | 'P2P' | 'COMMERCIAL'
  claimApprovalRate: number
  avgClaimProcessingDays: number

  // Gamification
  achievedBadges: string[]
  milestoneReached: string[]
  nextMilestone: string | null

  // Fleet composition (from fleet-composition.ts)
  fleetComposition: FleetComposition

  // Metadata
  lastCalculatedAt: Date
  calculationVersion: string
  dataConfidence: 'HIGH' | 'MEDIUM' | 'LOW'

  // Contextual insights
  improvementTips: string[]
}

// ============================================================================
// MAIN HOST ESG CALCULATION
// ============================================================================

/**
 * Calculate comprehensive ESG profile for a host
 * Aggregates vehicle-level scores with trip-weighting
 */
export async function calculateHostESG(hostId: string): Promise<HostESGProfile> {
  // Fetch host with all related data
  const host = await prisma.rentalHost.findUnique({
    where: { id: hostId },
    include: {
      cars: {
        select: {
          id: true,
          fuelType: true,
          totalTrips: true,
          esgScore: true,
          esgSafetyScore: true,
          esgEnvironmentalScore: true,
          esgMaintenanceScore: true,
          avgMilesPerTrip: true,
          year: true,
          isActive: true,
          hasActiveClaim: true,
          totalClaimsCount: true,
          lastOdometerCheck: true,
          suspiciousMileageFlag: true,
          maintenanceCadence: true,
          createdAt: true,
          currentMileage: true,
          serviceRecords: {
            orderBy: {
              serviceDate: 'desc'
            }
          }
        },
      },
      bookings: {
        where: {
          status: { in: ['COMPLETED', 'ACTIVE'] },
        },
        select: {
          id: true,
          status: true,
          startDate: true,
          endDate: true,
          tripStartedAt: true,
          tripEndedAt: true,
          carId: true,
        },
      },
      claims: {
        select: {
          id: true,
          status: true,
          createdAt: true,
          reviewedAt: true,
          guestRespondedAt: true,
        },
      },
    },
  })

  if (!host) {
    throw new Error(`Host not found: ${hostId}`)
  }

  // Get fleet composition analysis
  const fleetComposition = await analyzeFleetComposition(hostId)

  // Calculate all vehicle ESG scores
  const vehicleScores = await Promise.all(
    host.cars.map((car) => calculateVehicleESG(car.id))
  )

  // Calculate trip-weighted aggregate scores
  const aggregateScores = calculateTripWeightedScores(host.cars, vehicleScores)

  // Calculate safety metrics
  const safetyMetrics = calculateSafetyMetrics(host.cars, host.bookings, host.claims)

  // ✅ UPDATED: Calculate environmental metrics with CO2 aggregation
  const environmentalMetrics = calculateEnvironmentalMetrics(
    host.cars,
    fleetComposition,
    vehicleScores
  )

  // Calculate compliance metrics with REAL service data
  const complianceMetrics = await calculateComplianceMetricsWithService(host.cars, host.claims)

  // Calculate fraud detection metrics
  const fraudMetrics = calculateFraudMetrics(host.cars)

  // ✅ UPDATED: Calculate usage metrics - now receives vehicleScores
  const usageMetrics = calculateUsageMetrics(host.cars, host.bookings, vehicleScores)

  // Calculate trip quality metrics
  const tripQualityMetrics = calculateTripQualityMetrics(host.bookings)

  // Calculate insurance metrics
  const insuranceMetrics = calculateInsuranceMetrics(host, host.claims)

  // Determine achieved badges (placeholder - will integrate with badges system)
  const achievedBadges = determineAchievedBadges({
    safetyScore: aggregateScores.safetyScore,
    currentStreak: safetyMetrics.currentIncidentStreak,
    totalTrips: safetyMetrics.totalTrips,
    evVehicleCount: fleetComposition.composition.electric.count,
  })

  // Calculate data confidence
  const dataConfidence = calculateDataConfidence({
    totalTrips: safetyMetrics.totalTrips,
    hasInsurance: insuranceMetrics.hasCommercialInsurance || insuranceMetrics.hasP2PInsurance,
    hasMaintenanceRecords: complianceMetrics.lastMaintenanceDate !== null,
    vehicleCount: fleetComposition.totalVehicles,
  })

  // Generate contextual improvement tips
  const improvementTips = generateImprovementTips({
    compositeScore: aggregateScores.compositeScore,
    safetyScore: aggregateScores.safetyScore,
    environmentalScore: aggregateScores.emissionsScore,
    maintenanceScore: aggregateScores.maintenanceScore,
    complianceScore: aggregateScores.complianceScore,
    currentStreak: safetyMetrics.currentIncidentStreak,
    evPercentage: environmentalMetrics.evTripPercentage / 100,
    maintenanceOnTime: complianceMetrics.maintenanceOnTime,
    fleetComposition: {
      electric: fleetComposition.composition.electric.count,
      hybrid: fleetComposition.composition.hybrid.count,
      gas: fleetComposition.composition.gas.count,
    },
  })

  return {
    // Composite scores
    compositeScore: aggregateScores.compositeScore,
    drivingImpactScore: aggregateScores.drivingImpactScore,
    emissionsScore: aggregateScores.emissionsScore,
    maintenanceScore: aggregateScores.maintenanceScore,
    safetyScore: aggregateScores.safetyScore,
    complianceScore: aggregateScores.complianceScore,

    // Safety metrics
    ...safetyMetrics,

    // Environmental metrics
    ...environmentalMetrics,

    // Compliance metrics
    ...complianceMetrics,

    // Fraud metrics
    ...fraudMetrics,

    // Usage metrics
    ...usageMetrics,

    // Trip quality metrics
    ...tripQualityMetrics,

    // Vehicle fleet metrics
    totalVehicles: fleetComposition.totalVehicles,
    activeVehicles: fleetComposition.activeVehicles,
    evVehicleCount: fleetComposition.composition.electric.count,
    avgVehicleAge: fleetComposition.fleetHealth.avgVehicleAge,

    // Insurance metrics
    ...insuranceMetrics,

    // Gamification
    achievedBadges,
    milestoneReached: [], // Placeholder
    nextMilestone: null, // Placeholder

    // Fleet composition
    fleetComposition,

    // Metadata
    lastCalculatedAt: new Date(),
    calculationVersion: '2.2', // ✅ UPDATED VERSION (was 2.1)
    dataConfidence,

    // Insights
    improvementTips,
  }
}

// ============================================================================
// TRIP-WEIGHTED AGGREGATE SCORES
// ============================================================================

function calculateTripWeightedScores(
  cars: any[],
  vehicleScores: any[]
): {
  compositeScore: number
  drivingImpactScore: number
  emissionsScore: number
  maintenanceScore: number
  safetyScore: number
  complianceScore: number
} {
  // Calculate total trips across fleet
  const totalTrips = cars.reduce((sum, car) => sum + car.totalTrips, 0)

  if (totalTrips === 0) {
    // New host - return neutral scores
    return {
      compositeScore: 50,
      drivingImpactScore: 50,
      emissionsScore: 50,
      maintenanceScore: 50,
      safetyScore: 50,
      complianceScore: 50,
    }
  }

  // Build weighted values array
  const weightedValues = cars.map((car, index) => {
    const score = vehicleScores[index]
    const weight = car.totalTrips / totalTrips

    return {
      safetyScore: score.esgSafetyScore * weight,
      environmentalScore: score.esgEnvironmentalScore * weight,
      maintenanceScore: score.esgMaintenanceScore * weight,
      compositeScore: score.esgScore * weight,
    }
  })

  // Sum weighted scores
  const safetyScore = clampScore(
    weightedValues.reduce((sum, v) => sum + v.safetyScore, 0)
  )
  const emissionsScore = clampScore(
    weightedValues.reduce((sum, v) => sum + v.environmentalScore, 0)
  )
  const maintenanceScore = clampScore(
    weightedValues.reduce((sum, v) => sum + v.maintenanceScore, 0)
  )

  // Compliance score (based on response time, maintenance adherence)
  const complianceScore = clampScore((maintenanceScore + safetyScore) / 2)

  // Driving impact score (usage health)
  const drivingImpactScore = clampScore((safetyScore + maintenanceScore) / 2)

  // Overall composite score
  const compositeScore = clampScore(
    weightedAverage([
      { value: safetyScore, weight: 0.35 },
      { value: emissionsScore, weight: 0.25 },
      { value: maintenanceScore, weight: 0.25 },
      { value: complianceScore, weight: 0.15 },
    ])
  )

  return {
    compositeScore,
    drivingImpactScore,
    emissionsScore,
    maintenanceScore,
    safetyScore,
    complianceScore,
  }
}

// ============================================================================
// SAFETY METRICS CALCULATION
// ============================================================================

function calculateSafetyMetrics(cars: any[], bookings: any[], claims: any[]) {
  const totalTrips = cars.reduce((sum, car) => sum + car.totalTrips, 0)
  const totalClaims = claims.length
  const incidentFreeTrips = Math.max(0, totalTrips - totalClaims)

  // Calculate current streak (simplified - actual implementation would track per booking)
  const currentIncidentStreak = cars.reduce(
    (max, car) => Math.max(max, car.totalTrips - (car.totalClaimsCount || 0)),
    0
  )

  // Find longest streak (placeholder - would require historical data)
  const longestIncidentStreak = currentIncidentStreak

  // Find last incident date
  const lastIncidentDate =
    claims.length > 0
      ? claims.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0].createdAt
      : null

  return {
    totalTrips,
    incidentFreeTrips,
    totalClaimsFiled: totalClaims,
    currentIncidentStreak,
    longestIncidentStreak,
    lastIncidentDate,
  }
}

// ============================================================================
// ENVIRONMENTAL METRICS CALCULATION (✅ FIXED - Uses vehicleScores)
// ============================================================================

function calculateEnvironmentalMetrics(
  cars: any[], 
  fleetComposition: FleetComposition,
  vehicleScores: any[] // ✅ Use pre-calculated vehicle scores
) {
  const totalEVTrips = fleetComposition.composition.electric.vehicles.reduce(
    (sum, v) => sum + v.totalTrips,
    0
  )
  const totalTrips = cars.reduce((sum, car) => sum + car.totalTrips, 0)
  const evTripPercentage = safePercentage(totalEVTrips, totalTrips)

  const estimatedCO2Saved = fleetComposition.environmentalImpact.totalCO2Saved

  // ✅ FIXED: Aggregate CO2 data from pre-calculated vehicle scores
  const totalCO2Impact = vehicleScores.reduce((sum, score) => {
    return sum + (score.breakdown?.environmental?.estimatedCO2Impact || 0)
  }, 0)

  // ✅ FIXED: Get total miles from pre-calculated vehicle scores instead of car.avgMilesPerTrip
  const totalMilesDriven = vehicleScores.reduce((sum, score) => {
    return sum + (score.breakdown?.usage?.totalMiles || 0)
  }, 0)

  const avgCO2PerMile = totalMilesDriven > 0 
    ? totalCO2Impact / totalMilesDriven 
    : 0

  let fuelEfficiencyRating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'UNKNOWN'
  if (fleetComposition.environmentalImpact.avgEmissionsRating === 'EXCELLENT') {
    fuelEfficiencyRating = 'EXCELLENT'
  } else if (fleetComposition.environmentalImpact.avgEmissionsRating === 'GOOD') {
    fuelEfficiencyRating = 'GOOD'
  } else if (fleetComposition.environmentalImpact.avgEmissionsRating === 'FAIR') {
    fuelEfficiencyRating = 'FAIR'
  } else if (fleetComposition.environmentalImpact.avgEmissionsRating === 'POOR') {
    fuelEfficiencyRating = 'POOR'
  } else {
    fuelEfficiencyRating = 'UNKNOWN'
  }

  return {
    totalEVTrips,
    evTripPercentage: Math.round(evTripPercentage),
    estimatedCO2Saved: Math.round(estimatedCO2Saved * 100) / 100,
    totalCO2Impact: Math.round(totalCO2Impact * 100) / 100,        // ✅ NEW
    avgCO2PerMile: Math.round(avgCO2PerMile * 1000) / 1000,        // ✅ NEW (3 decimals)
    fuelEfficiencyRating,
  }
}

// ============================================================================
// COMPLIANCE METRICS CALCULATION (WITH REAL SERVICE DATA)
// ============================================================================

/**
 * Calculate compliance metrics using REAL service records
 * This replaces the old fake maintenance score logic
 */
async function calculateComplianceMetricsWithService(cars: any[], claims: any[]) {
  const now = new Date()
  let totalOverdueCount = 0
  let allVehiclesUpToDate = true
  let mostRecentServiceDate: Date | null = null

  // Analyze each vehicle's service status
  for (const car of cars) {
    // Skip if car has no trips (not in use yet)
    if (car.totalTrips === 0) continue

    // Analyze service triggers for this vehicle
    const serviceAnalysis = analyzeServiceTriggers(
      car.serviceRecords || [],
      car.totalTrips,
      car.currentMileage || 0,
      now
    )

    // Check if this vehicle has overdue services
    if (serviceAnalysis.overallStatus === 'overdue' || serviceAnalysis.overallStatus === 'critical') {
      allVehiclesUpToDate = false
      totalOverdueCount += serviceAnalysis.criticalIssues.length + serviceAnalysis.warnings.length
    }

    // Track most recent service date across all vehicles
    if (car.serviceRecords && car.serviceRecords.length > 0) {
      const latestService = car.serviceRecords[0] // Already ordered DESC
      const serviceDate = new Date(latestService.serviceDate)
      
      if (!mostRecentServiceDate || serviceDate > mostRecentServiceDate) {
        mostRecentServiceDate = serviceDate
      }
    }
  }

  const maintenanceOnTime = allVehiclesUpToDate
  const overdueMaintenanceCount = totalOverdueCount
  const lastMaintenanceDate = mostRecentServiceDate

  // Calculate FNOL completion rate (claims with guest response)
  const claimsWithResponse = claims.filter((claim) => claim.guestRespondedAt !== null)
  const fnolCompletionRate = safePercentage(claimsWithResponse.length, claims.length)

  // Calculate average response time (simplified)
  const responseTimes = claims
    .filter((claim) => claim.reviewedAt && claim.createdAt)
    .map((claim) => {
      const created = new Date(claim.createdAt).getTime()
      const reviewed = new Date(claim.reviewedAt!).getTime()
      return (reviewed - created) / (1000 * 60 * 60) // Hours
    })

  const avgResponseTimeHours =
    responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0

  return {
    maintenanceOnTime,
    lastMaintenanceDate,
    overdueMaintenanceCount,
    fnolCompletionRate: Math.round(fnolCompletionRate),
    avgResponseTimeHours: Math.round(avgResponseTimeHours * 10) / 10,
  }
}

// ============================================================================
// FRAUD METRICS CALCULATION
// ============================================================================

function calculateFraudMetrics(cars: any[]) {
  const suspiciousVehicles = cars.filter((car) => car.suspiciousMileageFlag)
  const suspiciousActivityCount = suspiciousVehicles.length

  // Calculate unauthorized mileage (placeholder - would need trip-level data)
  const unauthorizedMileage = 0

  // Verification failures (placeholder)
  const verificationFailures = 0

  // Determine fraud risk level
  let fraudRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  if (suspiciousActivityCount === 0) {
    fraudRiskLevel = 'LOW'
  } else if (suspiciousActivityCount <= 2) {
    fraudRiskLevel = 'MEDIUM'
  } else if (suspiciousActivityCount <= 4) {
    fraudRiskLevel = 'HIGH'
  } else {
    fraudRiskLevel = 'CRITICAL'
  }

  return {
    unauthorizedMileage,
    suspiciousActivityCount,
    verificationFailures,
    fraudRiskLevel,
  }
}

// ============================================================================
// USAGE METRICS CALCULATION (✅ FIXED - Uses vehicleScores)
// ============================================================================

function calculateUsageMetrics(cars: any[], bookings: any[], vehicleScores: any[]) {
  // ✅ FIXED: Aggregate mileage from pre-calculated vehicle scores
  const totalMilesDriven = vehicleScores.reduce((sum, score) => {
    return sum + (score.breakdown?.usage?.totalMiles || 0)
  }, 0)

  const totalTrips = cars.reduce((sum, car) => sum + car.totalTrips, 0)
  const avgMilesPerTrip = totalTrips > 0 ? totalMilesDriven / totalTrips : 0

  // Trip completion rate
  const completedTrips = bookings.filter((b) => b.status === 'COMPLETED').length
  const tripCompletionRate = safePercentage(completedTrips, bookings.length)

  // Idle time efficiency (placeholder - would need more data)
  const idleTimeEfficiency = 100

  return {
    totalMilesDriven: Math.round(totalMilesDriven),
    avgMilesPerTrip: Math.round(avgMilesPerTrip),
    tripCompletionRate: Math.round(tripCompletionRate),
    idleTimeEfficiency,
  }
}

// ============================================================================
// TRIP QUALITY METRICS CALCULATION
// ============================================================================

function calculateTripQualityMetrics(bookings: any[]) {
  const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED')
  const tripCancellationRate = safePercentage(cancelledBookings.length, bookings.length)

  // Late/early returns (placeholder - would need actual return time data)
  const lateReturnCount = 0
  const earlyReturnCount = 0

  // Guest rating average (placeholder - would need review data)
  const guestRatingAverage = 5.0

  return {
    tripCancellationRate: Math.round(tripCancellationRate * 10) / 10,
    lateReturnCount,
    earlyReturnCount,
    guestRatingAverage,
  }
}

// ============================================================================
// INSURANCE METRICS CALCULATION
// ============================================================================

function calculateInsuranceMetrics(host: any, claims: any[]) {
  const hasCommercialInsurance = host.commercialInsuranceActive || false
  const hasP2PInsurance = host.p2pInsuranceActive || false

  let insuranceTier: 'PLATFORM' | 'P2P' | 'COMMERCIAL'
  if (hasCommercialInsurance) {
    insuranceTier = 'COMMERCIAL'
  } else if (hasP2PInsurance) {
    insuranceTier = 'P2P'
  } else {
    insuranceTier = 'PLATFORM'
  }

  // Claim approval rate
  const approvedClaims = claims.filter((c) => c.status === 'APPROVED')
  const claimApprovalRate = safePercentage(approvedClaims.length, claims.length)

  // Average claim processing days
  const processingTimes = claims
    .filter((c) => c.reviewedAt && c.createdAt)
    .map((c) => {
      const created = new Date(c.createdAt).getTime()
      const reviewed = new Date(c.reviewedAt!).getTime()
      return (reviewed - created) / (1000 * 60 * 60 * 24) // Days
    })

  const avgClaimProcessingDays =
    processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0

  return {
    hasCommercialInsurance,
    hasP2PInsurance,
    insuranceTier,
    claimApprovalRate: Math.round(claimApprovalRate),
    avgClaimProcessingDays: Math.round(avgClaimProcessingDays * 10) / 10,
  }
}

// ============================================================================
// BADGE DETERMINATION (PLACEHOLDER)
// ============================================================================

function determineAchievedBadges(metrics: {
  safetyScore: number
  currentStreak: number
  totalTrips: number
  evVehicleCount: number
}): string[] {
  const badges: string[] = []

  if (metrics.safetyScore >= 90) badges.push('SAFETY_CHAMPION')
  if (metrics.currentStreak >= 50) badges.push('INCIDENT_FREE_50')
  if (metrics.totalTrips >= 100) badges.push('100_TRIPS_MILESTONE')
  if (metrics.evVehicleCount >= 1) badges.push('ECO_WARRIOR')

  return badges
}

// ============================================================================
// SAVE TO DATABASE
// ============================================================================

/**
 * Calculate and save host ESG profile to database
 */
export async function updateHostESGProfile(hostId: string): Promise<void> {
  const profile = await calculateHostESG(hostId)

  // Check if profile exists
  const existingProfile = await prisma.hostESGProfile.findUnique({
    where: { hostId },
  })

  if (existingProfile) {
    // Update existing profile
    await prisma.hostESGProfile.update({
      where: { hostId },
      data: {
        compositeScore: profile.compositeScore,
        drivingImpactScore: profile.drivingImpactScore,
        emissionsScore: profile.emissionsScore,
        maintenanceScore: profile.maintenanceScore,
        safetyScore: profile.safetyScore,
        complianceScore: profile.complianceScore,
        totalTrips: profile.totalTrips,
        incidentFreeTrips: profile.incidentFreeTrips,
        totalClaimsFiled: profile.totalClaimsFiled,
        currentIncidentStreak: profile.currentIncidentStreak,
        longestIncidentStreak: profile.longestIncidentStreak,
        lastIncidentDate: profile.lastIncidentDate,
        totalEVTrips: profile.totalEVTrips,
        evTripPercentage: profile.evTripPercentage,
        estimatedCO2Saved: profile.estimatedCO2Saved,
        totalCO2Impact: profile.totalCO2Impact,              // ✅ ADDED
        avgCO2PerMile: profile.avgCO2PerMile,                // ✅ ADDED
        fuelEfficiencyRating: profile.fuelEfficiencyRating,
        maintenanceOnTime: profile.maintenanceOnTime,
        lastMaintenanceDate: profile.lastMaintenanceDate,
        overdueMaintenanceCount: profile.overdueMaintenanceCount,
        fnolCompletionRate: profile.fnolCompletionRate,
        avgResponseTimeHours: profile.avgResponseTimeHours,
        totalVehicles: profile.totalVehicles,
        activeVehicles: profile.activeVehicles,
        evVehicleCount: profile.evVehicleCount,
        avgVehicleAge: profile.avgVehicleAge,
        hasCommercialInsurance: profile.hasCommercialInsurance,
        hasP2PInsurance: profile.hasP2PInsurance,
        insuranceTier: profile.insuranceTier,
        achievedBadges: profile.achievedBadges,
        dataConfidence: profile.dataConfidence,
        calculationVersion: profile.calculationVersion,
      },
    })
  } else {
    // Create new profile
    await prisma.hostESGProfile.create({
      data: {
        hostId,
        compositeScore: profile.compositeScore,
        drivingImpactScore: profile.drivingImpactScore,
        emissionsScore: profile.emissionsScore,
        maintenanceScore: profile.maintenanceScore,
        safetyScore: profile.safetyScore,
        complianceScore: profile.complianceScore,
        totalTrips: profile.totalTrips,
        incidentFreeTrips: profile.incidentFreeTrips,
        totalClaimsFiled: profile.totalClaimsFiled,
        currentIncidentStreak: profile.currentIncidentStreak,
        longestIncidentStreak: profile.longestIncidentStreak,
        lastIncidentDate: profile.lastIncidentDate,
        totalEVTrips: profile.totalEVTrips,
        evTripPercentage: profile.evTripPercentage,
        estimatedCO2Saved: profile.estimatedCO2Saved,
        totalCO2Impact: profile.totalCO2Impact,              // ✅ ADDED
        avgCO2PerMile: profile.avgCO2PerMile,                // ✅ ADDED
        fuelEfficiencyRating: profile.fuelEfficiencyRating,
        maintenanceOnTime: profile.maintenanceOnTime,
        lastMaintenanceDate: profile.lastMaintenanceDate,
        overdueMaintenanceCount: profile.overdueMaintenanceCount,
        fnolCompletionRate: profile.fnolCompletionRate,
        avgResponseTimeHours: profile.avgResponseTimeHours,
        totalVehicles: profile.totalVehicles,
        activeVehicles: profile.activeVehicles,
        evVehicleCount: profile.evVehicleCount,
        avgVehicleAge: profile.avgVehicleAge,
        hasCommercialInsurance: profile.hasCommercialInsurance,
        hasP2PInsurance: profile.hasP2PInsurance,
        insuranceTier: profile.insuranceTier,
        achievedBadges: profile.achievedBadges,
        dataConfidence: profile.dataConfidence,
        calculationVersion: profile.calculationVersion,
      },
    })
  }
}