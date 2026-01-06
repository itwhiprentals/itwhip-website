// app/lib/insurance/eligibility-engine.ts

import { RentalCar, InsuranceProvider, VehicleClassification } from '@prisma/client'
import prisma from '@/app/lib/database/prisma'
import { classifyVehicle } from './classification-service'

interface EligibilityResult {
  eligible: boolean
  reason?: string
  tier?: string
  dailyRate?: number
  deductible?: number
  requiresManualReview: boolean
  adjustedRate?: number
  riskFactors: string[]
  overrideApplied?: boolean
  recommendations?: string[]
}

interface VehicleRules {
  categories?: {
    [key: string]: {
      eligible: boolean
      multiplier: number
      maxValue?: number
      minValue?: number
    }
  }
  riskLevels?: {
    [key: string]: {
      eligible: boolean
      multiplier: number
      requiresReview?: boolean
    }
  }
  excludedMakes?: string[]
  excludedModels?: string[]
  vehicleAgeLimit?: number
  valueRange?: {
    min: number
    max: number
  }
}

/**
 * Check if a vehicle is eligible for insurance with a specific provider
 */
export async function checkVehicleEligibility(
  car: RentalCar & { classification?: VehicleClassification | null },
  providerId?: string
): Promise<EligibilityResult> {
  const riskFactors: string[] = []
  
  // Get the active provider or specific provider
  const provider = providerId 
    ? await prisma.insuranceProvider.findUnique({ where: { id: providerId } })
    : await prisma.insuranceProvider.findFirst({ where: { isActive: true, isPrimary: true } })
  
  if (!provider) {
    return {
      eligible: false,
      reason: 'No active insurance provider available',
      requiresManualReview: false,
      riskFactors
    }
  }
  
  // Get or create vehicle classification
  let classification = car.classification
  if (!classification && car.classificationId) {
    classification = await prisma.vehicleClassification.findUnique({
      where: { id: car.classificationId }
    })
  }
  
  if (!classification) {
    const classificationResult = await classifyVehicle({
      make: car.make,
      model: car.model,
      year: car.year,
      trim: car.trim || undefined
    })
    
    classification = await prisma.vehicleClassification.findUnique({
      where: { id: classificationResult.classificationId! }
    })
  }
  
  if (!classification) {
    return {
      eligible: false,
      reason: 'Unable to classify vehicle',
      requiresManualReview: true,
      riskFactors: ['unclassified_vehicle']
    }
  }
  
  // Check for manual override
  const override = await prisma.vehicleCoverageOverride.findFirst({
    where: {
      carId: car.id,
      providerId: provider.id,
      isActive: true
    }
  })
  
  if (override) {
    const overrideRules = override.customRules as any
    if (overrideRules.forceEligible === false) {
      return {
        eligible: false,
        reason: override.reason,
        requiresManualReview: false,
        overrideApplied: true,
        riskFactors
      }
    }
    if (overrideRules.forceEligible === true) {
      return {
        eligible: true,
        tier: overrideRules.tier || 'STANDARD',
        dailyRate: overrideRules.dailyRate || 25,
        deductible: overrideRules.deductible || 1000,
        requiresManualReview: false,
        overrideApplied: true,
        riskFactors
      }
    }
  }
  
  // Parse provider vehicle rules
  const vehicleRules = (provider.vehicleRules || {}) as VehicleRules
  
  // Check basic eligibility
  const basicCheck = checkBasicEligibility(car, classification, provider, vehicleRules)
  if (!basicCheck.eligible) {
    return {
      ...basicCheck,
      riskFactors
    }
  }
  
  // Check category eligibility
  const categoryCheck = checkCategoryEligibility(classification, vehicleRules)
  if (!categoryCheck.eligible) {
    return {
      ...categoryCheck,
      riskFactors
    }
  }
  
  // Check risk level eligibility
  const riskCheck = checkRiskEligibility(classification, vehicleRules, riskFactors)
  if (!riskCheck.eligible) {
    return {
      ...riskCheck,
      riskFactors
    }
  }
  
  // Calculate insurance pricing
  const pricing = calculateInsurancePricing(
    classification,
    provider,
    vehicleRules,
    categoryCheck.multiplier || 1,
    riskCheck.multiplier || 1
  )
  
  // Generate recommendations
  const recommendations = generateRecommendations(classification, riskFactors)
  
  return {
    eligible: true,
    tier: determineTier(classification, Number(car.dailyRate)),
    dailyRate: pricing.dailyRate,
    deductible: pricing.deductible,
    requiresManualReview: classification.requiresManualReview || riskCheck.requiresReview || false,
    adjustedRate: pricing.adjustedRate,
    riskFactors,
    recommendations
  }
}

/**
 * Check basic eligibility criteria
 */
function checkBasicEligibility(
  car: RentalCar,
  classification: VehicleClassification,
  provider: InsuranceProvider,
  rules: VehicleRules
): { eligible: boolean; reason?: string } {
  
  // Check if vehicle is marked as uninsurable
  if (!classification.isInsurable) {
    return {
      eligible: false,
      reason: classification.insurabilityReason || 'Vehicle is not insurable'
    }
  }
  
  // Check vehicle value limits from provider
  const value = Number(classification.currentValue)
  
  if (provider.vehicleValueMin && value < provider.vehicleValueMin) {
    return {
      eligible: false,
      reason: `Vehicle value below minimum of $${provider.vehicleValueMin.toLocaleString()}`
    }
  }
  
  if (provider.vehicleValueMax && value > provider.vehicleValueMax) {
    return {
      eligible: false,
      reason: `Vehicle value exceeds maximum of $${provider.vehicleValueMax.toLocaleString()}`
    }
  }
  
  // Check value range from rules
  if (rules.valueRange) {
    if (value < rules.valueRange.min || value > rules.valueRange.max) {
      return {
        eligible: false,
        reason: `Vehicle value outside coverage range ($${rules.valueRange.min.toLocaleString()} - $${rules.valueRange.max.toLocaleString()})`
      }
    }
  }
  
  // Check excluded makes
  if (provider.excludedMakes?.includes(car.make)) {
    return {
      eligible: false,
      reason: `${car.make} vehicles are not covered by this provider`
    }
  }
  
  if (rules.excludedMakes?.includes(car.make)) {
    return {
      eligible: false,
      reason: `${car.make} vehicles are excluded from coverage`
    }
  }
  
  // Check excluded models
  if (provider.excludedModels?.includes(car.model)) {
    return {
      eligible: false,
      reason: `${car.model} is not covered by this provider`
    }
  }
  
  if (rules.excludedModels?.includes(car.model)) {
    return {
      eligible: false,
      reason: `${car.model} is excluded from coverage`
    }
  }
  
  // Check vehicle age
  const currentYear = new Date().getFullYear()
  const vehicleAge = currentYear - car.year
  
  if (rules.vehicleAgeLimit && vehicleAge > rules.vehicleAgeLimit) {
    return {
      eligible: false,
      reason: `Vehicle age (${vehicleAge} years) exceeds limit of ${rules.vehicleAgeLimit} years`
    }
  }
  
  return { eligible: true }
}

/**
 * Check category-specific eligibility
 */
function checkCategoryEligibility(
  classification: VehicleClassification,
  rules: VehicleRules
): { eligible: boolean; reason?: string; multiplier?: number } {
  
  if (!rules.categories) {
    return { eligible: true, multiplier: 1 }
  }
  
  const categoryRules = rules.categories[classification.category]
  
  if (!categoryRules) {
    // No specific rules for this category, assume eligible
    return { eligible: true, multiplier: 1 }
  }
  
  if (!categoryRules.eligible) {
    return {
      eligible: false,
      reason: `${classification.category} vehicles are not eligible for coverage`
    }
  }
  
  // Check category-specific value limits
  const value = Number(classification.currentValue)
  
  if (categoryRules.minValue && value < categoryRules.minValue) {
    return {
      eligible: false,
      reason: `${classification.category} vehicles must have minimum value of $${categoryRules.minValue.toLocaleString()}`
    }
  }
  
  if (categoryRules.maxValue && value > categoryRules.maxValue) {
    return {
      eligible: false,
      reason: `${classification.category} vehicles cannot exceed $${categoryRules.maxValue.toLocaleString()}`
    }
  }
  
  return {
    eligible: true,
    multiplier: categoryRules.multiplier || 1
  }
}

/**
 * Check risk level eligibility
 */
function checkRiskEligibility(
  classification: VehicleClassification,
  rules: VehicleRules,
  riskFactors: string[]
): { eligible: boolean; reason?: string; multiplier?: number; requiresReview?: boolean } {
  
  if (!rules.riskLevels) {
    return { eligible: true, multiplier: 1 }
  }
  
  const riskRules = rules.riskLevels[classification.riskLevel]
  
  if (!riskRules) {
    return { eligible: true, multiplier: 1 }
  }
  
  if (!riskRules.eligible) {
    riskFactors.push(`high_risk_${classification.riskLevel.toLowerCase()}`)
    return {
      eligible: false,
      reason: `${classification.riskLevel} risk vehicles are not eligible for coverage`
    }
  }
  
  // Add risk factors
  if (classification.riskLevel === 'HIGH' || classification.riskLevel === 'EXTREME') {
    riskFactors.push('elevated_risk_profile')
  }
  
  return {
    eligible: true,
    multiplier: riskRules.multiplier || 1,
    requiresReview: riskRules.requiresReview || false
  }
}

/**
 * Calculate insurance pricing with multipliers
 */
function calculateInsurancePricing(
  classification: VehicleClassification,
  provider: InsuranceProvider,
  rules: VehicleRules,
  categoryMultiplier: number,
  riskMultiplier: number
): { dailyRate: number; deductible: number; adjustedRate: number } {
  
  // Get base rates from provider pricing rules
  const pricingRules = (provider.pricingRules || {}) as any
  const tierRates = pricingRules[classification.category] || pricingRules['STANDARD'] || {
    dailyRate: 25,
    deductible: 1000
  }
  
  // Apply all multipliers
  const baseRate = tierRates.dailyRate || 25
  const totalMultiplier = 
    Number(classification.baseRateMultiplier) * 
    Number(classification.riskMultiplier) * 
    categoryMultiplier * 
    riskMultiplier
  
  const adjustedRate = Math.round(baseRate * totalMultiplier * 100) / 100
  
  // Adjust deductible based on risk
  let deductible = tierRates.deductible || 1000
  if (classification.riskLevel === 'HIGH') deductible *= 1.5
  if (classification.riskLevel === 'EXTREME') deductible *= 2
  
  return {
    dailyRate: baseRate,
    deductible: Math.round(deductible),
    adjustedRate
  }
}

/**
 * Determine insurance tier based on vehicle classification and daily rate
 */
function determineTier(classification: VehicleClassification, dailyRate: number): string {
  // High-value or high-risk vehicles get premium tier
  if (classification.category === 'LUXURY' || 
      classification.category === 'EXOTIC' || 
      classification.category === 'SUPERCAR' ||
      classification.riskLevel === 'EXTREME') {
    return 'PREMIUM'
  }
  
  // Mid-range vehicles or moderate risk
  if (classification.category === 'PREMIUM' ||
      classification.riskLevel === 'HIGH' ||
      dailyRate > 100) {
    return 'STANDARD'
  }
  
  // Economy and standard vehicles
  return 'BASIC'
}

/**
 * Generate recommendations based on risk factors
 */
function generateRecommendations(
  classification: VehicleClassification,
  riskFactors: string[]
): string[] {
  const recommendations: string[] = []
  
  if (classification.riskLevel === 'HIGH' || classification.riskLevel === 'EXTREME') {
    recommendations.push('Consider requiring additional security deposit')
    recommendations.push('Recommend comprehensive pre-trip inspection')
  }
  
  if (classification.category === 'LUXURY' || classification.category === 'EXOTIC') {
    recommendations.push('Verify renter has experience with high-value vehicles')
    recommendations.push('Consider manual approval for all bookings')
  }
  
  if (riskFactors.includes('elevated_risk_profile')) {
    recommendations.push('Review renter driving history carefully')
  }
  
  const value = Number(classification.currentValue)
  if (value > 100000) {
    recommendations.push('Ensure renter has adequate personal insurance')
  }
  
  return recommendations
}

/**
 * Get available insurance tiers for a vehicle
 */
export async function getAvailableTiers(
  carId: string,
  providerId?: string
): Promise<string[]> {
  const car = await prisma.rentalCar.findUnique({
    where: { id: carId },
    include: { classification: true }
  })
  
  if (!car) return []
  
  const eligibility = await checkVehicleEligibility(car, providerId)
  
  if (!eligibility.eligible) return []
  
  // Based on vehicle category, return available tiers
  const classification = car.classification
  if (!classification) return ['BASIC']
  
  if (classification.category === 'ECONOMY') {
    return ['BASIC']
  }
  
  if (classification.category === 'STANDARD' || classification.category === 'PREMIUM') {
    return ['BASIC', 'STANDARD']
  }
  
  return ['BASIC', 'STANDARD', 'PREMIUM']
}