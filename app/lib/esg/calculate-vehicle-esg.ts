// app/lib/esg/calculate-vehicle-esg.ts
/**
 * Vehicle-Level ESG Score Calculation
 * Calculates ESG scores for individual vehicles
 */

import prisma from '@/app/lib/database/prisma'
import {
  clampScore,
  weightedAverage,
  safePercentage,
  getEnvironmentalBaselineScore,
  isElectricVehicle,
  isHybridVehicle,
  getVehicleCategory,
  daysBetween,
  isOverdue,
} from './esg-helpers'

// ============================================================================
// TYPES
// ============================================================================

export interface VehicleESGScores {
  esgScore: number
  esgEnvironmentalScore: number
  esgSafetyScore: number
  esgMaintenanceScore: number
  breakdown: {
    safety: {
      score: number
      totalTrips: number
      claimFreeTrips: number
      claimCount: number
      currentStreak: number
      lastClaimDate: Date | null
    }
    environmental: {
      score: number
      fuelType: string
      category: 'EV' | 'HYBRID' | 'GAS'
      baselineScore: number
      estimatedCO2Impact: number
      totalCO2Impact: number
      avgCO2PerMile: number
      status: string
    }
    maintenance: {
      score: number
      status: string
      lastServiceDate: Date | null
      daysSinceService: number
      isOverdue: boolean
      overdueBy: number
      daysUntilService: number
    }
    usage: {
      avgMilesPerTrip: number
      totalMiles: number
      utilizationRate: number
    }
  }
}

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

/**
 * Calculate comprehensive ESG score for a single vehicle
 */
export async function calculateVehicleESG(carId: string): Promise<VehicleESGScores> {
  // Fetch vehicle data with related bookings and reviews
  const car = await prisma.rentalCar.findUnique({
    where: { id: carId },
    include: {
      bookings: {
        where: {
          status: 'COMPLETED',
        },
        select: {
          id: true,
          startMileage: true,
          endMileage: true,
          tripStartedAt: true,
          tripEndedAt: true,
          review: {
            select: {
              rating: true
            }
          }
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  })

  if (!car) {
    throw new Error(`Vehicle not found: ${carId}`)
  }

  // Get claims for this vehicle
  const claims = await prisma.claim.findMany({
    where: {
      booking: {
        carId: carId,
      },
    },
    select: {
      id: true,
      createdAt: true,
      status: true,
      type: true,
      estimatedCost: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Calculate individual component scores
  const safetyScore = calculateSafetyScore(car, claims)
  const environmentalScore = calculateEnvironmentalScore(car)
  const maintenanceScore = calculateMaintenanceScore(car)
  const usageMetrics = calculateUsageMetrics(car)

  // Calculate overall vehicle ESG score (weighted average)
  const esgScore = clampScore(
    weightedAverage([
      { value: safetyScore.score, weight: 0.4 },
      { value: environmentalScore.score, weight: 0.3 },
      { value: maintenanceScore.score, weight: 0.3 },
    ])
  )

  return {
    esgScore,
    esgEnvironmentalScore: environmentalScore.score,
    esgSafetyScore: safetyScore.score,
    esgMaintenanceScore: maintenanceScore.score,
    breakdown: {
      safety: safetyScore,
      environmental: environmentalScore,
      maintenance: maintenanceScore,
      usage: usageMetrics,
    },
  }
}

// ============================================================================
// SAFETY SCORE CALCULATION
// ============================================================================

function calculateSafetyScore(
  car: any,
  claims: any[]
): {
  score: number
  totalTrips: number
  claimFreeTrips: number
  claimCount: number
  currentStreak: number
  lastClaimDate: Date | null
} {
  const totalTrips = car.totalTrips || 0
  const claimCount = claims.length
  const claimFreeTrips = Math.max(0, totalTrips - claimCount)

  let score = 100

  if (totalTrips === 0) {
    return {
      score: 50,
      totalTrips: 0,
      claimFreeTrips: 0,
      claimCount: 0,
      currentStreak: 0,
      lastClaimDate: null,
    }
  }

  const claimRate = claimCount / totalTrips
  if (claimRate > 0) {
    score -= claimRate * 100 * 1.5
  }

  const currentStreak = car.claimFreeMonths || 0
  if (currentStreak >= 24) {
    score += 10
  } else if (currentStreak >= 12) {
    score += 5
  } else if (currentStreak >= 6) {
    score += 2
  }

  const recentClaims = claims.filter((claim) => {
    const monthsAgo = daysBetween(new Date(claim.createdAt), new Date()) / 30
    return monthsAgo <= 6
  })

  if (recentClaims.length > 0) {
    score -= recentClaims.length * 5
  }

  const majorClaims = claims.filter(
    (claim) => claim.estimatedCost && claim.estimatedCost > 2000
  )
  score -= majorClaims.length * 10

  return {
    score: clampScore(score),
    totalTrips,
    claimFreeTrips,
    claimCount,
    currentStreak,
    lastClaimDate: claims[0]?.createdAt || null,
  }
}

// ============================================================================
// ENVIRONMENTAL SCORE CALCULATION (✅ FIXED)
// ============================================================================

function calculateEnvironmentalScore(car: any): {
  score: number
  fuelType: string
  category: 'EV' | 'HYBRID' | 'GAS'
  baselineScore: number
  estimatedCO2Impact: number
  totalCO2Impact: number
  avgCO2PerMile: number
  status: string
} {
  const fuelType = car.fuelType || 'GASOLINE'
  const category = getVehicleCategory(fuelType)
  const baselineScore = getEnvironmentalBaselineScore(fuelType)

  let score = baselineScore

  const currentYear = new Date().getFullYear()
  const vehicleAge = currentYear - car.year

  if (category === 'GAS') {
    if (vehicleAge > 10) {
      score -= 10
    } else if (vehicleAge > 5) {
      score -= 5
    }

    const mpgAvg = ((car.mpgCity || 0) + (car.mpgHighway || 0)) / 2
    if (mpgAvg >= 35) {
      score += 10
    } else if (mpgAvg >= 30) {
      score += 5
    } else if (mpgAvg <= 20) {
      score -= 5
    }
  } else if (category === 'HYBRID') {
    if (vehicleAge <= 3) {
      score += 5
    }
  } else if (category === 'EV') {
    score += 10
    if (vehicleAge <= 2) {
      score += 5
    }
  }

  // ============================================================================
  // ✅ FIXED: Calculate mileage from bookings (same as forensics system)
  // ============================================================================

  const completedBookings = car.bookings?.filter((b: any) => 
    b.startMileage !== null && 
    b.endMileage !== null
  ) || []

  const totalMiles = completedBookings.reduce((sum: number, booking: any) => {
    return sum + (booking.endMileage - booking.startMileage)
  }, 0)

  // Industry-standard emission factors (kg CO2e per mile)
  const EMISSIONS_FACTORS: { [key: string]: number } = {
    GASOLINE: 0.404,
    DIESEL: 0.452,
    HYBRID: 0.250,
    ELECTRIC: 0.150,
  }

  let emissionFactor: number
  if (category === 'EV') {
    emissionFactor = EMISSIONS_FACTORS.ELECTRIC
  } else if (category === 'HYBRID') {
    emissionFactor = EMISSIONS_FACTORS.HYBRID
  } else if (fuelType.toUpperCase().includes('DIESEL')) {
    emissionFactor = EMISSIONS_FACTORS.DIESEL
  } else {
    emissionFactor = EMISSIONS_FACTORS.GASOLINE
  }

  const estimatedCO2Impact = totalMiles * emissionFactor
  const totalCO2Impact = estimatedCO2Impact
  const avgCO2PerMile = emissionFactor

  // Determine status based on score
  let status = 'STANDARD'
  if (score >= 85) {
    status = 'EXCELLENT'
  } else if (score >= 70) {
    status = 'GOOD'
  } else if (score >= 50) {
    status = 'FAIR'
  } else {
    status = 'NEEDS_IMPROVEMENT'
  }

  return {
    score: clampScore(score),
    fuelType,
    category,
    baselineScore,
    estimatedCO2Impact: Math.round(estimatedCO2Impact * 100) / 100,
    totalCO2Impact: Math.round(totalCO2Impact * 100) / 100,
    avgCO2PerMile: Math.round(avgCO2PerMile * 1000) / 1000,
    status,
  }
}

// ============================================================================
// MAINTENANCE SCORE CALCULATION
// ============================================================================

function calculateMaintenanceScore(car: any): {
  score: number
  status: string
  lastServiceDate: Date | null
  daysSinceService: number
  isOverdue: boolean
  overdueBy: number
  daysUntilService: number
} {
  let score = 100
  const maintenanceCadence = car.maintenanceCadence || 90
  const lastServiceDate = car.lastOdometerCheck || car.createdAt
  const daysSinceService = daysBetween(new Date(lastServiceDate), new Date())
  const isOverdueFlag = daysSinceService > maintenanceCadence
  const overdueBy = Math.max(0, daysSinceService - maintenanceCadence)
  const daysUntilService = maintenanceCadence - daysSinceService

  if (isOverdueFlag) {
    const overdueWeeks = overdueBy / 7
    score -= Math.min(50, overdueWeeks * 5)
  } else {
    const daysRemaining = maintenanceCadence - daysSinceService
    if (daysRemaining > 30) {
      score += 10
    } else if (daysRemaining > 14) {
      score += 5
    }
  }

  if (car.safetyHold) {
    score -= 30
  }
  if (car.requiresInspection) {
    score -= 20
  }

  if (car.repairVerified) {
    score += 10
  }

  let status = 'CURRENT'
  if (isOverdueFlag) {
    status = 'OVERDUE'
  } else if (daysUntilService < 14) {
    status = 'DUE_SOON'
  } else {
    status = 'EXCELLENT'
  }

  return {
    score: clampScore(score),
    status,
    lastServiceDate,
    daysSinceService,
    isOverdue: isOverdueFlag,
    overdueBy,
    daysUntilService,
  }
}

// ============================================================================
// USAGE METRICS CALCULATION
// ============================================================================

function calculateUsageMetrics(car: any): {
  avgMilesPerTrip: number
  totalMiles: number
  utilizationRate: number
} {
  // ✅ FIXED: Calculate from bookings
  const completedBookings = car.bookings?.filter((b: any) => 
    b.startMileage !== null && 
    b.endMileage !== null
  ) || []

  const totalMiles = completedBookings.reduce((sum: number, booking: any) => {
    return sum + (booking.endMileage - booking.startMileage)
  }, 0)

  const totalTrips = car.totalTrips || 0
  const avgMilesPerTrip = completedBookings.length > 0 ? totalMiles / completedBookings.length : 0

  const daysSinceCreated = daysBetween(new Date(car.createdAt), new Date())
  const possibleTrips = Math.floor(daysSinceCreated / 3)
  const utilizationRate = totalTrips > 0 ? safePercentage(totalTrips, possibleTrips) : 0

  return {
    avgMilesPerTrip: Math.round(avgMilesPerTrip),
    totalMiles: Math.round(totalMiles),
    utilizationRate: Math.round(utilizationRate),
  }
}

// ============================================================================
// BATCH CALCULATION
// ============================================================================

export async function calculateFleetESG(hostId: string): Promise<VehicleESGScores[]> {
  const cars = await prisma.rentalCar.findMany({
    where: { hostId },
    select: { id: true },
  })

  const scores = await Promise.all(
    cars.map((car) => calculateVehicleESG(car.id))
  )

  return scores
}

// ============================================================================
// SAVE SCORES TO DATABASE
// ============================================================================

export async function updateVehicleESGScores(carId: string): Promise<void> {
  const scores = await calculateVehicleESG(carId)

  await prisma.rentalCar.update({
    where: { id: carId },
    data: {
      esgScore: scores.esgScore,
      esgEnvironmentalScore: scores.esgEnvironmentalScore,
      esgSafetyScore: scores.esgSafetyScore,
      esgMaintenanceScore: scores.esgMaintenanceScore,
      esgLastCalculated: new Date(),
      avgMilesPerTrip: scores.breakdown.usage.avgMilesPerTrip,
      guestRatingAvg: scores.breakdown.safety.totalTrips > 0 ? 5.0 : 0,
    },
  })
}