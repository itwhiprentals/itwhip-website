// lib/insurance-utils.ts

import { InsuranceProvider, RentalCar } from '@prisma/client'

/**
 * Insurance Utility Functions
 * Helper functions for vehicle coverage eligibility, pricing, and validation
 */

export interface CoverageCheckResult {
  eligible: boolean
  provider: InsuranceProvider | null
  reason?: string
  alternativeProviders?: InsuranceProvider[]
}

export interface VehicleEligibility {
  carId: string
  make: string
  model: string
  value: number
  eligibleProviders: InsuranceProvider[]
  hasValidCoverage: boolean
  warnings: string[]
}

/**
 * Check if a vehicle is eligible for a specific insurance provider
 */
export function isVehicleEligibleForProvider(
  vehicle: { make: string; model: string; value?: number },
  provider: InsuranceProvider
): CoverageCheckResult {
  const vehicleValue = vehicle.value || 0

  // Check if provider is active
  if (!provider.isActive) {
    return {
      eligible: false,
      provider: null,
      reason: `Provider ${provider.name} is currently inactive`
    }
  }

  // Check vehicle value range
  if (provider.vehicleValueMin && vehicleValue < provider.vehicleValueMin) {
    return {
      eligible: false,
      provider: null,
      reason: `Vehicle value $${vehicleValue.toLocaleString()} is below minimum $${provider.vehicleValueMin.toLocaleString()} for ${provider.name}`
    }
  }

  if (provider.vehicleValueMax && vehicleValue > provider.vehicleValueMax) {
    return {
      eligible: false,
      provider: null,
      reason: `Vehicle value $${vehicleValue.toLocaleString()} exceeds maximum $${provider.vehicleValueMax.toLocaleString()} for ${provider.name}`
    }
  }

  // Check excluded makes
  if (provider.excludedMakes && provider.excludedMakes.length > 0) {
    const isExcludedMake = provider.excludedMakes.some(
      make => make.toLowerCase() === vehicle.make.toLowerCase()
    )
    if (isExcludedMake) {
      return {
        eligible: false,
        provider: null,
        reason: `${vehicle.make} is excluded by ${provider.name}`
      }
    }
  }

  // Check excluded models
  if (provider.excludedModels && provider.excludedModels.length > 0) {
    const isExcludedModel = provider.excludedModels.some(
      model => model.toLowerCase() === vehicle.model.toLowerCase()
    )
    if (isExcludedModel) {
      return {
        eligible: false,
        provider: null,
        reason: `${vehicle.make} ${vehicle.model} is excluded by ${provider.name}`
      }
    }
  }

  // All checks passed
  return {
    eligible: true,
    provider,
    reason: `Eligible for ${provider.name}`
  }
}

/**
 * Find all eligible providers for a vehicle
 */
export function findEligibleProviders(
  vehicle: { make: string; model: string; value?: number },
  providers: InsuranceProvider[]
): InsuranceProvider[] {
  return providers.filter(provider => {
    const result = isVehicleEligibleForProvider(vehicle, provider)
    return result.eligible
  })
}

/**
 * Get the primary (preferred) provider for a vehicle
 */
export function getPrimaryProvider(
  vehicle: { make: string; model: string; value?: number },
  providers: InsuranceProvider[]
): InsuranceProvider | null {
  // First, try to find the primary provider
  const primaryProvider = providers.find(p => p.isPrimary && p.isActive)
  
  if (primaryProvider) {
    const eligibility = isVehicleEligibleForProvider(vehicle, primaryProvider)
    if (eligibility.eligible) {
      return primaryProvider
    }
  }

  // If primary provider doesn't cover this vehicle, find first eligible provider
  const eligibleProviders = findEligibleProviders(vehicle, providers)
  return eligibleProviders[0] || null
}

/**
 * Calculate insurance premium based on tier and vehicle value
 */
export function calculateInsurancePremium(
  tier: 'MINIMUM' | 'BASIC' | 'PREMIUM' | 'LUXURY',
  vehicleValue: number,
  days: number,
  provider: InsuranceProvider
): {
  dailyPremium: number
  totalPremium: number
  platformRevenue: number
} {
  // Get pricing rules from provider
  const pricingRules = provider.pricingRules as any

  // Determine vehicle class based on value
  let vehicleClass = 'under25k'
  if (vehicleValue >= 100000) {
    vehicleClass = 'over100k'
  } else if (vehicleValue >= 75000) {
    vehicleClass = '75kto100k'
  } else if (vehicleValue >= 50000) {
    vehicleClass = '50kto75k'
  } else if (vehicleValue >= 25000) {
    vehicleClass = '25kto50k'
  }

  // Get daily premium for this tier and class
  const dailyPremium = pricingRules[vehicleClass]?.[tier] || 0
  const totalPremium = dailyPremium * days
  const platformRevenue = totalPremium * provider.revenueShare

  return {
    dailyPremium,
    totalPremium,
    platformRevenue
  }
}

/**
 * Get security deposit amount based on insurance tier
 */
export function getSecurityDeposit(
  tier: 'MINIMUM' | 'BASIC' | 'PREMIUM' | 'LUXURY',
  vehicleValue: number
): number {
  switch (tier) {
    case 'LUXURY':
      return 500 // Standard deposit
    case 'PREMIUM':
      return 750 // Slightly higher
    case 'BASIC':
      return 1000 // Higher deposit
    case 'MINIMUM':
      // MINIMUM tier requires massive deposit
      if (vehicleValue >= 100000) return 1000000 // $1M for exotic cars
      if (vehicleValue >= 50000) return 50000 // $50k for luxury
      return 2500 // $2,500 minimum
    default:
      return 500
  }
}

/**
 * Validate coverage tiers configuration
 */
export function validateCoverageTiers(coverageTiers: any): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  const requiredTiers = ['MINIMUM', 'BASIC', 'PREMIUM', 'LUXURY']
  const requiredFields = ['liability', 'collision', 'deductible', 'description']

  for (const tier of requiredTiers) {
    if (!coverageTiers[tier]) {
      errors.push(`Missing coverage tier: ${tier}`)
      continue
    }

    for (const field of requiredFields) {
      if (coverageTiers[tier][field] === undefined) {
        errors.push(`Missing field '${field}' in ${tier} tier`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate pricing rules configuration
 */
export function validatePricingRules(pricingRules: any): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  const requiredClasses = ['under25k', '25kto50k', '50kto75k', '75kto100k', 'over100k']
  const requiredTiers = ['MINIMUM', 'BASIC', 'PREMIUM', 'LUXURY']

  for (const vehicleClass of requiredClasses) {
    if (!pricingRules[vehicleClass]) {
      errors.push(`Missing vehicle class: ${vehicleClass}`)
      continue
    }

    for (const tier of requiredTiers) {
      if (typeof pricingRules[vehicleClass][tier] !== 'number') {
        errors.push(`Missing or invalid price for ${vehicleClass}.${tier}`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Format provider contact information
 */
export function formatProviderContact(provider: InsuranceProvider): string {
  const parts: string[] = []
  
  if (provider.contactEmail) {
    parts.push(`Email: ${provider.contactEmail}`)
  }
  
  if (provider.contactPhone) {
    parts.push(`Phone: ${provider.contactPhone}`)
  }

  if (provider.apiEndpoint) {
    parts.push(`API: ${provider.apiEndpoint}`)
  }

  return parts.join(' | ') || 'No contact information'
}

/**
 * Check if provider contract is active
 */
export function isProviderContractActive(provider: InsuranceProvider): boolean {
  const now = new Date()
  
  if (provider.contractStart && new Date(provider.contractStart) > now) {
    return false // Contract hasn't started yet
  }

  if (provider.contractEnd && new Date(provider.contractEnd) < now) {
    return false // Contract has expired
  }

  return true
}

/**
 * Get coverage gap warnings for a vehicle
 */
export function getVehicleCoverageWarnings(
  vehicle: { make: string; model: string; value?: number },
  providers: InsuranceProvider[]
): string[] {
  const warnings: string[] = []
  const eligibleProviders = findEligibleProviders(vehicle, providers)

  if (eligibleProviders.length === 0) {
    warnings.push('⚠️ No insurance provider covers this vehicle')
  }

  if (eligibleProviders.length === 1) {
    warnings.push('⚡ Only one provider covers this vehicle (no backup)')
  }

  const activeProviders = eligibleProviders.filter(p => p.isActive)
  if (activeProviders.length === 0 && eligibleProviders.length > 0) {
    warnings.push('⛔ All eligible providers are currently inactive')
  }

  return warnings
}

/**
 * Generate insurance quote for booking widget
 */
export function generateInsuranceQuote(
  tier: 'MINIMUM' | 'BASIC' | 'PREMIUM' | 'LUXURY',
  vehicleValue: number,
  days: number,
  provider: InsuranceProvider
) {
  const pricing = calculateInsurancePremium(tier, vehicleValue, days, provider)
  const deposit = getSecurityDeposit(tier, vehicleValue)
  const coverageTiers = provider.coverageTiers as any
  const coverage = coverageTiers[tier]

  return {
    tier,
    vehicleValue,
    days,
    dailyPremium: pricing.dailyPremium,
    totalPremium: pricing.totalPremium,
    platformRevenue: pricing.platformRevenue,
    increasedDeposit: tier === 'MINIMUM' ? deposit : null,
    coverage: {
      liability: coverage.liability,
      collision: coverage.collision,
      deductible: coverage.deductible,
      description: coverage.description
    },
    provider: {
      id: provider.id,
      name: provider.name,
      type: provider.type
    }
  }
}