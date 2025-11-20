// app/lib/esg/fleet-composition.ts
/**
 * Fleet Composition Analysis
 * Analyzes host's vehicle mix and provides insights
 */

import prisma from '@/app/lib/database/prisma'
import { calculateVehicleESG, VehicleESGScores } from './calculate-vehicle-esg'
import {
  getVehicleCategory,
  safePercentage,
  formatPercentage,
  formatCO2Savings,
} from './esg-helpers'

// ============================================================================
// TYPES
// ============================================================================

export interface FleetComposition {
  totalVehicles: number
  activeVehicles: number
  inactiveVehicles: number
  composition: {
    electric: {
      count: number
      percentage: number
      tripPercentage: number
      vehicles: VehicleInfo[]
    }
    hybrid: {
      count: number
      percentage: number
      tripPercentage: number
      vehicles: VehicleInfo[]
    }
    gas: {
      count: number
      percentage: number
      tripPercentage: number
      vehicles: VehicleInfo[]
    }
  }
  environmentalImpact: {
    totalCO2Saved: number
    avgEmissionsRating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
    evAdoptionLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'FULL'
  }
  fleetHealth: {
    avgVehicleAge: number
    avgESGScore: number
    totalTrips: number
    totalClaims: number
    claimRate: number
    avgMilesPerVehicle: number
  }
  insights: string[]
}

interface VehicleInfo {
  id: string
  make: string
  model: string
  year: number
  fuelType: string
  totalTrips: number
  esgScore: number | null
  photoUrl: string | null
}

// ============================================================================
// MAIN FLEET COMPOSITION FUNCTION
// ============================================================================

/**
 * Analyze complete fleet composition for a host
 */
export async function analyzeFleetComposition(hostId: string): Promise<FleetComposition> {
  const vehicles = await prisma.rentalCar.findMany({
    where: { hostId },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      fuelType: true,
      isActive: true,
      totalTrips: true,
      esgScore: true,
      hasActiveClaim: true,
      totalClaimsCount: true,
      avgMilesPerTrip: true,
      createdAt: true,
      photos: {
        where: { isHero: true },
        take: 1,
        select: {
          url: true
        }
      }
    },
  })

  if (vehicles.length === 0) {
    return getEmptyFleetComposition()
  }

  // Calculate vehicle ESG scores to get accurate mileage data
  const vehicleScores = await Promise.all(
    vehicles.map((car) => calculateVehicleESG(car.id))
  )

  // Categorize vehicles by fuel type
  const electricVehicles: VehicleInfo[] = []
  const hybridVehicles: VehicleInfo[] = []
  const gasVehicles: VehicleInfo[] = []

  vehicles.forEach((vehicle) => {
    const vehicleInfo: VehicleInfo = {
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      fuelType: vehicle.fuelType,
      totalTrips: vehicle.totalTrips,
      esgScore: vehicle.esgScore,
      photoUrl: vehicle.photos[0]?.url || null,
    }

    const category = getVehicleCategory(vehicle.fuelType)
    if (category === 'EV') {
      electricVehicles.push(vehicleInfo)
    } else if (category === 'HYBRID') {
      hybridVehicles.push(vehicleInfo)
    } else {
      gasVehicles.push(vehicleInfo)
    }
  })

  // Calculate counts and percentages
  const totalVehicles = vehicles.length
  const activeVehicles = vehicles.filter((v) => v.isActive).length
  const inactiveVehicles = totalVehicles - activeVehicles

  const evCount = electricVehicles.length
  const hybridCount = hybridVehicles.length
  const gasCount = gasVehicles.length

  const evPercentage = safePercentage(evCount, totalVehicles)
  const hybridPercentage = safePercentage(hybridCount, totalVehicles)
  const gasPercentage = safePercentage(gasCount, totalVehicles)

  // Calculate trip-weighted percentages
  const totalTrips = vehicles.reduce((sum, v) => sum + v.totalTrips, 0)
  const evTrips = electricVehicles.reduce((sum, v) => sum + v.totalTrips, 0)
  const hybridTrips = hybridVehicles.reduce((sum, v) => sum + v.totalTrips, 0)
  const gasTrips = gasVehicles.reduce((sum, v) => sum + v.totalTrips, 0)

  const evTripPercentage = safePercentage(evTrips, totalTrips)
  const hybridTripPercentage = safePercentage(hybridTrips, totalTrips)
  const gasTripPercentage = safePercentage(gasTrips, totalTrips)

  // Calculate environmental impact
  const environmentalImpact = calculateEnvironmentalImpact({
    evCount,
    hybridCount,
    gasCount,
    evTripPercentage,
    totalTrips,
  })

  // Calculate fleet health metrics using vehicle ESG scores
  const fleetHealth = calculateFleetHealth(vehicles, vehicleScores)

  // Generate insights
  const insights = generateFleetInsights({
    totalVehicles,
    evCount,
    hybridCount,
    gasCount,
    evTripPercentage,
    fleetHealth,
    environmentalImpact,
  })

  return {
    totalVehicles,
    activeVehicles,
    inactiveVehicles,
    composition: {
      electric: {
        count: evCount,
        percentage: Math.round(evPercentage),
        tripPercentage: Math.round(evTripPercentage),
        vehicles: electricVehicles,
      },
      hybrid: {
        count: hybridCount,
        percentage: Math.round(hybridPercentage),
        tripPercentage: Math.round(hybridTripPercentage),
        vehicles: hybridVehicles,
      },
      gas: {
        count: gasCount,
        percentage: Math.round(gasPercentage),
        tripPercentage: Math.round(gasTripPercentage),
        vehicles: gasVehicles,
      },
    },
    environmentalImpact,
    fleetHealth,
    insights,
  }
}

// ============================================================================
// ENVIRONMENTAL IMPACT CALCULATION
// ============================================================================

function calculateEnvironmentalImpact(params: {
  evCount: number
  hybridCount: number
  gasCount: number
  evTripPercentage: number
  totalTrips: number
}): FleetComposition['environmentalImpact'] {
  const { evCount, hybridCount, gasCount, evTripPercentage, totalTrips } = params
  const totalVehicles = evCount + hybridCount + gasCount

  // Calculate CO2 saved (simplified estimate)
  // EV saves ~4.6 metric tons CO2 per year vs gas car
  // Hybrid saves ~2.3 metric tons CO2 per year vs gas car
  const avgTripsPerYear = Math.min(totalTrips, 365) // Cap at 1 per day
  const evCO2Saved = evCount * 4600 * (avgTripsPerYear / 365) // kg per year
  const hybridCO2Saved = hybridCount * 2300 * (avgTripsPerYear / 365)
  const totalCO2Saved = Math.round(evCO2Saved + hybridCO2Saved)

  // Calculate average emissions rating
  let avgEmissionsRating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
  if (evTripPercentage >= 75) {
    avgEmissionsRating = 'EXCELLENT'
  } else if (evTripPercentage >= 50 || (evCount + hybridCount) / totalVehicles >= 0.5) {
    avgEmissionsRating = 'GOOD'
  } else if (hybridCount > 0 || evCount > 0) {
    avgEmissionsRating = 'FAIR'
  } else {
    avgEmissionsRating = 'POOR'
  }

  // Calculate EV adoption level
  let evAdoptionLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'FULL'
  const evPercentage = (evCount / totalVehicles) * 100
  if (evCount === totalVehicles) {
    evAdoptionLevel = 'FULL'
  } else if (evPercentage >= 50) {
    evAdoptionLevel = 'HIGH'
  } else if (evPercentage >= 25) {
    evAdoptionLevel = 'MEDIUM'
  } else if (evCount > 0) {
    evAdoptionLevel = 'LOW'
  } else {
    evAdoptionLevel = 'NONE'
  }

  return {
    totalCO2Saved,
    avgEmissionsRating,
    evAdoptionLevel,
  }
}

// ============================================================================
// FLEET HEALTH CALCULATION (✅ FIXED)
// ============================================================================

function calculateFleetHealth(
  vehicles: any[],
  vehicleScores: VehicleESGScores[]  // ✅ Use proper type
): FleetComposition['fleetHealth'] {
  const currentYear = new Date().getFullYear()

  const totalTrips = vehicles.reduce((sum, v) => sum + v.totalTrips, 0)
  const totalClaims = vehicles.reduce((sum, v) => sum + (v.totalClaimsCount || 0), 0)
  const claimRate = safePercentage(totalClaims, totalTrips)

  const avgVehicleAge =
    vehicles.reduce((sum, v) => sum + (currentYear - v.year), 0) / vehicles.length

  const vehiclesWithScores = vehicles.filter((v) => v.esgScore !== null)
  const avgESGScore =
    vehiclesWithScores.length > 0
      ? vehiclesWithScores.reduce((sum, v) => sum + (v.esgScore || 0), 0) /
        vehiclesWithScores.length
      : 0

  // ✅ FIXED: Correctly access the nested breakdown.usage.totalMiles
  const totalMiles = vehicleScores.reduce(
    (sum, score) => sum + (score.breakdown.usage.totalMiles || 0),
    0
  )
  const avgMilesPerVehicle = vehicles.length > 0 ? totalMiles / vehicles.length : 0

  return {
    avgVehicleAge: Math.round(avgVehicleAge * 10) / 10,
    avgESGScore: Math.round(avgESGScore),
    totalTrips,
    totalClaims,
    claimRate: Math.round(claimRate * 10) / 10,
    avgMilesPerVehicle: Math.round(avgMilesPerVehicle),
  }
}

// ============================================================================
// INSIGHT GENERATION
// ============================================================================

function generateFleetInsights(params: {
  totalVehicles: number
  evCount: number
  hybridCount: number
  gasCount: number
  evTripPercentage: number
  fleetHealth: FleetComposition['fleetHealth']
  environmentalImpact: FleetComposition['environmentalImpact']
}): string[] {
  const insights: string[] = []
  const {
    totalVehicles,
    evCount,
    hybridCount,
    gasCount,
    evTripPercentage,
    fleetHealth,
    environmentalImpact,
  } = params

  // Fleet size insights
  if (totalVehicles === 1) {
    insights.push('Single-vehicle fleet - consider adding more vehicles to diversify')
  } else if (totalVehicles >= 5) {
    insights.push('Large fleet with good diversification potential')
  }

  // Environmental insights
  if (evCount === 0 && hybridCount === 0) {
    insights.push('All-gas fleet - adding a hybrid or EV would boost environmental score')
  } else if (evCount === 0) {
    insights.push('Consider adding an EV to achieve next-level environmental impact')
  } else if (evTripPercentage >= 75) {
    insights.push('Excellent! Your EV fleet is handling most trips')
  } else if (evCount > 0 && evTripPercentage < 30) {
    insights.push('Your EVs are underutilized - consider promoting them more')
  }

  // CO2 savings recognition
  if (environmentalImpact.totalCO2Saved > 5000) {
    insights.push(
      `Great environmental impact! You've saved ${formatCO2Savings(
        environmentalImpact.totalCO2Saved
      )} of CO2`
    )
  }

  // Fleet health insights
  if (fleetHealth.claimRate > 10) {
    insights.push('High claim rate detected - review vehicle maintenance and guest screening')
  } else if (fleetHealth.claimRate < 3) {
    insights.push('Excellent safety record - your fleet maintenance is working!')
  }

  if (fleetHealth.avgVehicleAge > 8) {
    insights.push('Older fleet average - consider refreshing with newer models')
  } else if (fleetHealth.avgVehicleAge < 3) {
    insights.push('Very modern fleet - newer vehicles attract premium bookings')
  }

  // ESG score insights
  if (fleetHealth.avgESGScore >= 85) {
    insights.push('Outstanding fleet ESG performance - top tier!')
  } else if (fleetHealth.avgESGScore >= 70) {
    insights.push('Good fleet performance - keep up the momentum')
  } else if (fleetHealth.avgESGScore > 0 && fleetHealth.avgESGScore < 60) {
    insights.push('Fleet ESG needs attention - focus on maintenance and incident prevention')
  }

  return insights
}

// ============================================================================
// EMPTY FLEET HELPER
// ============================================================================

function getEmptyFleetComposition(): FleetComposition {
  return {
    totalVehicles: 0,
    activeVehicles: 0,
    inactiveVehicles: 0,
    composition: {
      electric: { count: 0, percentage: 0, tripPercentage: 0, vehicles: [] },
      hybrid: { count: 0, percentage: 0, tripPercentage: 0, vehicles: [] },
      gas: { count: 0, percentage: 0, tripPercentage: 0, vehicles: [] },
    },
    environmentalImpact: {
      totalCO2Saved: 0,
      avgEmissionsRating: 'POOR',
      evAdoptionLevel: 'NONE',
    },
    fleetHealth: {
      avgVehicleAge: 0,
      avgESGScore: 0,
      totalTrips: 0,
      totalClaims: 0,
      claimRate: 0,
      avgMilesPerVehicle: 0,
    },
    insights: ['No vehicles in fleet yet - add your first vehicle to get started'],
  }
}