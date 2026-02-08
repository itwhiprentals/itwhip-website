// lib/insurance/coverageChecker.ts
import { prisma } from '@/app/lib/database/prisma'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  dailyRate: number
  estimatedValue?: number
  isActive: boolean
  host?: {
    id: string
    name: string
    insuranceProviderId?: string | null
    insuranceProvider?: {
      id: string
      name: string
      type: string
      isActive: boolean
      vehicleValueMin?: number | null
      vehicleValueMax?: number | null
      excludedMakes: string[]
      excludedModels: string[]
    } | null
  }
}

interface CoverageResult {
  hasCoverage: boolean
  coverageSource: 'HOST_ASSIGNMENT' | 'VEHICLE_RULES' | 'NONE'
  provider?: {
    id: string
    name: string
    type: string
  }
  eligibleProviders?: Array<{
    id: string
    name: string
    type: string
  }>
  warnings: string[]
}

/**
 * Check if a vehicle has insurance coverage
 * Priority: Host assignment > Vehicle-based rules
 */
export async function checkVehicleCoverage(
  vehicle: Vehicle
): Promise<CoverageResult> {
  const warnings: string[] = []

  // PRIORITY 1: Check if host has assigned insurance
  if (vehicle.host?.insuranceProviderId && vehicle.host.insuranceProvider) {
    const provider = vehicle.host.insuranceProvider

    // Verify provider is active
    if (!provider.isActive) {
      warnings.push('Host has assigned provider but provider is inactive')
      return {
        hasCoverage: false,
        coverageSource: 'NONE',
        warnings
      }
    }

    return {
      hasCoverage: true,
      coverageSource: 'HOST_ASSIGNMENT',
      provider: {
        id: provider.id,
        name: provider.name,
        type: provider.type
      },
      warnings
    }
  }

  // PRIORITY 2: Check vehicle-based rules (fallback)
  const activeProviders = await prisma.insuranceProvider.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      type: true,
      vehicleValueMin: true,
      vehicleValueMax: true,
      excludedMakes: true,
      excludedModels: true
    }
  })

  if (activeProviders.length === 0) {
    warnings.push('No active insurance providers in system')
    return {
      hasCoverage: false,
      coverageSource: 'NONE',
      warnings
    }
  }

  const eligibleProviders = activeProviders.filter(provider => {
    return isVehicleEligible(vehicle, provider)
  })

  if (eligibleProviders.length > 0) {
    return {
      hasCoverage: true,
      coverageSource: 'VEHICLE_RULES',
      eligibleProviders: eligibleProviders.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type
      })),
      warnings
    }
  }

  // No coverage found
  warnings.push('Vehicle does not match any provider rules')
  if (vehicle.host) {
    warnings.push('Host has no assigned insurance provider')
  }

  return {
    hasCoverage: false,
    coverageSource: 'NONE',
    warnings
  }
}

/**
 * Check if vehicle matches provider's rules
 */
function isVehicleEligible(
  vehicle: Vehicle,
  provider: {
    vehicleValueMin?: number | null
    vehicleValueMax?: number | null
    excludedMakes: string[]
    excludedModels: string[]
  }
): boolean {
  const vehicleValue = vehicle.estimatedValue || vehicle.dailyRate * 365 * 0.15

  // Check value range
  if (provider.vehicleValueMin && vehicleValue < provider.vehicleValueMin) {
    return false
  }

  if (provider.vehicleValueMax && vehicleValue > provider.vehicleValueMax) {
    return false
  }

  // Check excluded makes
  if (provider.excludedMakes.includes(vehicle.make)) {
    return false
  }

  // Check excluded models
  const fullModel = `${vehicle.make} ${vehicle.model}`
  if (provider.excludedModels.includes(fullModel)) {
    return false
  }

  return true
}

/**
 * Batch check coverage for multiple vehicles
 */
export async function checkMultipleVehiclesCoverage(
  vehicleIds: string[]
): Promise<Map<string, CoverageResult>> {
  const vehicles = await prisma.rentalCar.findMany({
    where: { id: { in: vehicleIds } },
    include: {
      host: {
        include: {
          insuranceProvider: true
        }
      }
    }
  })

  const results = new Map<string, CoverageResult>()

  for (const vehicle of vehicles) {
    const coverage = await checkVehicleCoverage(vehicle as any)
    results.set(vehicle.id, coverage)
  }

  return results
}

/**
 * Get coverage summary for a host
 */
export async function getHostCoverageSummary(hostId: string) {
  const host = await prisma.rentalHost.findUnique({
    where: { id: hostId },
    include: {
      insuranceProvider: true,
      cars: {
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          dailyRate: true,
          estimatedValue: true,
          isActive: true
        }
      }
    }
  })

  if (!host) {
    throw new Error('Host not found')
  }

  const coverageResults = await Promise.all(
    host.cars.map(async (car) => {
      const coverage = await checkVehicleCoverage({
        ...car,
        host: {
          id: host.id,
          name: host.name,
          insuranceProviderId: host.insuranceProviderId,
          insuranceProvider: host.insuranceProvider
        }
      } as any)
      return { car, coverage }
    })
  )

  const totalVehicles = host.cars.length
  const coveredVehicles = coverageResults.filter(r => r.coverage.hasCoverage).length
  const gapVehicles = totalVehicles - coveredVehicles

  return {
    host: {
      id: host.id,
      name: host.name,
      insuranceProvider: host.insuranceProvider
    },
    summary: {
      totalVehicles,
      coveredVehicles,
      gapVehicles,
      coveragePercentage: totalVehicles > 0 ? Math.round((coveredVehicles / totalVehicles) * 100) : 0
    },
    vehicles: coverageResults
  }
}