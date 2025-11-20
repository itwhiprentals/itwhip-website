// app/lib/esg/trip-mileage-analyzer.ts
/**
 * Trip Mileage Analysis & Fraud Detection
 * Tracks mileage patterns and detects anomalies
 */

import prisma from '@/app/lib/database/prisma'
import { safePercentage, daysBetween } from './esg-helpers'

// ============================================================================
// TYPES
// ============================================================================

export interface MileageAnalysis {
  carId: string
  totalTrips: number
  avgMilesPerTrip: number
  mileageVariance: number
  suspiciousPatterns: SuspiciousPattern[]
  fraudRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  recommendations: string[]
}

export interface SuspiciousPattern {
  type: 'HIGH_VARIANCE' | 'ODOMETER_ROLLBACK' | 'UNAUTHORIZED_USE' | 'GPS_MISMATCH'
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  description: string
  tripId?: string
  detectedAt: Date
}

export interface TripMileageData {
  tripId: string
  startMileage: number | null
  endMileage: number | null
  reportedMiles: number
  estimatedMiles: number // From GPS/route
  variance: number
  variancePercentage: number
}

// ============================================================================
// MAIN MILEAGE ANALYSIS FUNCTION
// ============================================================================

/**
 * Analyze mileage patterns for a vehicle
 */
export async function analyzeTripMileage(carId: string): Promise<MileageAnalysis> {
  // Fetch all completed trips for this vehicle
  const trips = await prisma.rentalBooking.findMany({
    where: {
      carId,
      status: 'COMPLETED',
      startMileage: { not: null },
      endMileage: { not: null },
    },
    select: {
      id: true,
      startMileage: true,
      endMileage: true,
      pickupLatitude: true,
      pickupLongitude: true,
      returnLatitude: true,
      returnLongitude: true,
      tripStartedAt: true,
      tripEndedAt: true,
    },
    orderBy: {
      tripStartedAt: 'asc',
    },
  })

  if (trips.length === 0) {
    return {
      carId,
      totalTrips: 0,
      avgMilesPerTrip: 0,
      mileageVariance: 0,
      suspiciousPatterns: [],
      fraudRiskLevel: 'LOW',
      recommendations: ['No trip data available yet'],
    }
  }

  // Calculate mileage for each trip
  const tripMileageData: TripMileageData[] = trips.map((trip) => {
    const startMileage = trip.startMileage || 0
    const endMileage = trip.endMileage || 0
    const reportedMiles = endMileage - startMileage

    // Estimate mileage from GPS (if available)
    const estimatedMiles = estimateMilesFromGPS(
      trip.pickupLatitude,
      trip.pickupLongitude,
      trip.returnLatitude,
      trip.returnLongitude
    )

    const variance = reportedMiles - estimatedMiles
    const variancePercentage = safePercentage(
      Math.abs(variance),
      estimatedMiles > 0 ? estimatedMiles : reportedMiles
    )

    return {
      tripId: trip.id,
      startMileage,
      endMileage,
      reportedMiles,
      estimatedMiles,
      variance,
      variancePercentage,
    }
  })

  // Calculate average miles per trip
  const totalMiles = tripMileageData.reduce((sum, t) => sum + t.reportedMiles, 0)
  const avgMilesPerTrip = totalMiles / trips.length

  // Calculate mileage variance (standard deviation)
  const mileageVariance = calculateMileageVariance(
    tripMileageData.map((t) => t.reportedMiles)
  )

  // Detect suspicious patterns
  const suspiciousPatterns: SuspiciousPattern[] = []

  // Check for high variance
  suspiciousPatterns.push(...detectHighVariance(tripMileageData, avgMilesPerTrip))

  // Check for odometer rollbacks
  suspiciousPatterns.push(...detectOdometerRollbacks(trips))

  // Check for GPS mismatches
  suspiciousPatterns.push(...detectGPSMismatches(tripMileageData))

  // Check for unauthorized use (trips too close together)
  suspiciousPatterns.push(...detectUnauthorizedUse(trips))

  // Determine fraud risk level
  const fraudRiskLevel = determineFraudRiskLevel(suspiciousPatterns, mileageVariance)

  // Generate recommendations - ✅ FIXED FUNCTION NAME
  const recommendations = generateRecommendations(
    suspiciousPatterns,
    fraudRiskLevel,
    mileageVariance
  )

  return {
    carId,
    totalTrips: trips.length,
    avgMilesPerTrip: Math.round(avgMilesPerTrip),
    mileageVariance: Math.round(mileageVariance),
    suspiciousPatterns,
    fraudRiskLevel,
    recommendations,
  }
}

// ============================================================================
// VARIANCE CALCULATION
// ============================================================================

function calculateMileageVariance(mileageValues: number[]): number {
  if (mileageValues.length < 2) return 0

  const mean = mileageValues.reduce((sum, val) => sum + val, 0) / mileageValues.length

  const squaredDiffs = mileageValues.map((val) => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / mileageValues.length

  return Math.sqrt(variance) // Standard deviation
}

// ============================================================================
// GPS ESTIMATION
// ============================================================================

function estimateMilesFromGPS(
  lat1: number | null,
  lon1: number | null,
  lat2: number | null,
  lon2: number | null
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0

  // Haversine formula for distance calculation
  const R = 3959 // Earth radius in miles
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  // Add 15% to account for actual road distance vs straight line
  return distance * 1.15
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// ============================================================================
// PATTERN DETECTION: HIGH VARIANCE
// ============================================================================

function detectHighVariance(
  tripData: TripMileageData[],
  avgMiles: number
): SuspiciousPattern[] {
  const patterns: SuspiciousPattern[] = []

  tripData.forEach((trip) => {
    // Flag trips with >30% variance from GPS estimate
    if (trip.estimatedMiles > 0 && trip.variancePercentage > 30) {
      patterns.push({
        type: 'HIGH_VARIANCE',
        severity: trip.variancePercentage > 50 ? 'HIGH' : 'MEDIUM',
        description: `Trip reported ${trip.reportedMiles} miles, but GPS estimates ${Math.round(
          trip.estimatedMiles
        )} miles (${Math.round(trip.variancePercentage)}% variance)`,
        tripId: trip.tripId,
        detectedAt: new Date(),
      })
    }

    // Flag trips with extreme deviation from average
    const deviationPercentage = safePercentage(
      Math.abs(trip.reportedMiles - avgMiles),
      avgMiles
    )
    if (deviationPercentage > 200 && avgMiles > 0) {
      patterns.push({
        type: 'HIGH_VARIANCE',
        severity: 'MEDIUM',
        description: `Trip miles (${trip.reportedMiles}) significantly deviate from average (${Math.round(
          avgMiles
        )})`,
        tripId: trip.tripId,
        detectedAt: new Date(),
      })
    }
  })

  return patterns
}

// ============================================================================
// PATTERN DETECTION: ODOMETER ROLLBACK
// ============================================================================

function detectOdometerRollbacks(trips: any[]): SuspiciousPattern[] {
  const patterns: SuspiciousPattern[] = []

  for (let i = 1; i < trips.length; i++) {
    const prevTrip = trips[i - 1]
    const currentTrip = trips[i]

    const prevEndMileage = prevTrip.endMileage || 0
    const currentStartMileage = currentTrip.startMileage || 0

    // Check if current start is less than previous end (rollback)
    if (currentStartMileage < prevEndMileage) {
      const rollbackAmount = prevEndMileage - currentStartMileage

      patterns.push({
        type: 'ODOMETER_ROLLBACK',
        severity: 'HIGH',
        description: `Possible odometer rollback detected: Previous trip ended at ${prevEndMileage} miles, but next trip started at ${currentStartMileage} miles (${rollbackAmount} miles backward)`,
        tripId: currentTrip.id,
        detectedAt: new Date(),
      })
    }

    // Check for suspiciously low mileage between trips
    const daysBetweenTrips = daysBetween(
      new Date(prevTrip.tripEndedAt),
      new Date(currentTrip.tripStartedAt)
    )

    const milesBetweenTrips = currentStartMileage - prevEndMileage

    // If more than 7 days between trips but mileage only increased by <20 miles
    if (daysBetweenTrips > 7 && milesBetweenTrips < 20 && milesBetweenTrips > 0) {
      patterns.push({
        type: 'UNAUTHORIZED_USE',
        severity: 'LOW',
        description: `Unusually low mileage between trips: ${milesBetweenTrips} miles over ${daysBetweenTrips} days`,
        tripId: currentTrip.id,
        detectedAt: new Date(),
      })
    }
  }

  return patterns
}

// ============================================================================
// PATTERN DETECTION: GPS MISMATCH
// ============================================================================

function detectGPSMismatches(tripData: TripMileageData[]): SuspiciousPattern[] {
  const patterns: SuspiciousPattern[] = []

  tripData.forEach((trip) => {
    // If reported mileage is >2x GPS estimate
    if (
      trip.estimatedMiles > 0 &&
      trip.reportedMiles > trip.estimatedMiles * 2 &&
      trip.estimatedMiles > 20 // Only flag if GPS shows significant distance
    ) {
      patterns.push({
        type: 'GPS_MISMATCH',
        severity: 'HIGH',
        description: `Reported mileage (${trip.reportedMiles} mi) is more than double GPS estimate (${Math.round(
          trip.estimatedMiles
        )} mi)`,
        tripId: trip.tripId,
        detectedAt: new Date(),
      })
    }

    // If reported mileage is suspiciously low vs GPS
    if (
      trip.estimatedMiles > 50 &&
      trip.reportedMiles < trip.estimatedMiles * 0.5
    ) {
      patterns.push({
        type: 'GPS_MISMATCH',
        severity: 'MEDIUM',
        description: `Reported mileage (${trip.reportedMiles} mi) is significantly lower than GPS estimate (${Math.round(
          trip.estimatedMiles
        )} mi)`,
        tripId: trip.tripId,
        detectedAt: new Date(),
      })
    }
  })

  return patterns
}

// ============================================================================
// PATTERN DETECTION: UNAUTHORIZED USE
// ============================================================================

function detectUnauthorizedUse(trips: any[]): SuspiciousPattern[] {
  const patterns: SuspiciousPattern[] = []

  for (let i = 1; i < trips.length; i++) {
    const prevTrip = trips[i - 1]
    const currentTrip = trips[i]

    const prevEndMileage = prevTrip.endMileage || 0
    const currentStartMileage = currentTrip.startMileage || 0

    const daysBetweenTrips = daysBetween(
      new Date(prevTrip.tripEndedAt),
      new Date(currentTrip.tripStartedAt)
    )

    const milesBetweenTrips = currentStartMileage - prevEndMileage

    // If significant mileage added between trips (>100 miles in <3 days)
    if (daysBetweenTrips < 3 && milesBetweenTrips > 100) {
      patterns.push({
        type: 'UNAUTHORIZED_USE',
        severity: 'MEDIUM',
        description: `${milesBetweenTrips} miles added between trips in only ${daysBetweenTrips} day(s) - possible unauthorized use`,
        tripId: currentTrip.id,
        detectedAt: new Date(),
      })
    }

    // If massive mileage added between trips (>500 miles)
    if (milesBetweenTrips > 500) {
      patterns.push({
        type: 'UNAUTHORIZED_USE',
        severity: 'HIGH',
        description: `${milesBetweenTrips} miles added between trips - investigate unauthorized use`,
        tripId: currentTrip.id,
        detectedAt: new Date(),
      })
    }
  }

  return patterns
}

// ============================================================================
// FRAUD RISK DETERMINATION
// ============================================================================

function determineFraudRiskLevel(
  patterns: SuspiciousPattern[],
  variance: number
): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const highSeverityCount = patterns.filter((p) => p.severity === 'HIGH').length
  const mediumSeverityCount = patterns.filter((p) => p.severity === 'MEDIUM').length

  // Critical: Multiple high-severity issues
  if (highSeverityCount >= 3) return 'CRITICAL'

  // High: Any high-severity + medium, or very high variance
  if (highSeverityCount >= 1 && mediumSeverityCount >= 2) return 'HIGH'
  if (variance > 100) return 'HIGH'

  // Medium: Some issues detected
  if (highSeverityCount >= 1 || mediumSeverityCount >= 3) return 'MEDIUM'
  if (variance > 50) return 'MEDIUM'

  // Low: No significant issues
  return 'LOW'
}

// ============================================================================
// RECOMMENDATIONS - ✅ RENAMED FUNCTION
// ============================================================================

function generateRecommendations(
  patterns: SuspiciousPattern[],
  riskLevel: string,
  variance: number
): string[] {
  const recommendations: string[] = []

  if (riskLevel === 'CRITICAL') {
    recommendations.push('🚨 URGENT: Multiple fraud indicators detected - investigate immediately')
    recommendations.push('Consider temporarily deactivating vehicle pending investigation')
  } else if (riskLevel === 'HIGH') {
    recommendations.push('⚠️ High fraud risk - manual review recommended')
    recommendations.push('Verify odometer readings on next trip')
  } else if (riskLevel === 'MEDIUM') {
    recommendations.push('Monitor mileage patterns closely')
  } else {
    recommendations.push('✅ Mileage patterns appear normal')
  }

  // Specific recommendations based on pattern types
  const hasRollback = patterns.some((p) => p.type === 'ODOMETER_ROLLBACK')
  const hasGPSMismatch = patterns.some((p) => p.type === 'GPS_MISMATCH')
  const hasUnauthorized = patterns.some((p) => p.type === 'UNAUTHORIZED_USE')

  if (hasRollback) {
    recommendations.push('Odometer rollback detected - verify odometer is functioning correctly')
  }

  if (hasGPSMismatch) {
    recommendations.push('GPS vs reported mileage discrepancy - review trip routes')
  }

  if (hasUnauthorized) {
    recommendations.push('Possible unauthorized use - check for off-trip mileage')
  }

  if (variance > 75) {
    recommendations.push('High mileage variance - standardize trip recording procedures')
  }

  return recommendations
}

// ============================================================================
// UPDATE VEHICLE FRAUD FLAGS
// ============================================================================

/**
 * Analyze mileage and update vehicle fraud flags in database
 */
export async function updateVehicleMileageAnalysis(carId: string): Promise<void> {
  const analysis = await analyzeTripMileage(carId)

  await prisma.rentalCar.update({
    where: { id: carId },
    data: {
      avgMilesPerTrip: analysis.avgMilesPerTrip,
      mileageVariance: analysis.mileageVariance,
      suspiciousMileageFlag: analysis.fraudRiskLevel === 'HIGH' || analysis.fraudRiskLevel === 'CRITICAL',
      lastOdometerCheck: new Date(),
    },
  })
}