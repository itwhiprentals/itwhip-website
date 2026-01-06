// app/lib/insurance/classification-service.ts

import { VehicleCategory, RiskCategory } from '@prisma/client'
import prisma from '@/app/lib/database/prisma'

interface VehicleData {
  make: string
  model: string
  year: number
  trim?: string
}

interface ClassificationResult {
  category: VehicleCategory
  riskLevel: RiskCategory
  estimatedValue: number
  baseRateMultiplier: number
  riskMultiplier: number
  features: string[]
  isInsurable: boolean
  insurabilityReason?: string
  requiresManualReview: boolean
  classificationId?: string
}

// Vehicle value ranges for category determination
const VALUE_RANGES = {
  ECONOMY: { min: 0, max: 25000 },
  STANDARD: { min: 25000, max: 50000 },
  PREMIUM: { min: 50000, max: 100000 },
  LUXURY: { min: 100000, max: 250000 },
  EXOTIC: { min: 250000, max: 500000 },
  SUPERCAR: { min: 500000, max: Infinity }
}

// High-risk makes and models
const HIGH_RISK_MAKES = ['Ferrari', 'Lamborghini', 'McLaren', 'Bugatti', 'Koenigsegg']
const PERFORMANCE_MODELS = ['M3', 'M5', 'AMG', 'RS', 'Type R', 'STI', 'GT3', 'Turbo']
const LUXURY_MAKES = ['Mercedes-Benz', 'BMW', 'Audi', 'Lexus', 'Porsche', 'Bentley', 'Rolls-Royce']
const STANDARD_MAKES = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Mazda']

/**
 * Classify a vehicle based on make, model, year
 */
export async function classifyVehicle(vehicleData: VehicleData): Promise<ClassificationResult> {
  const { make, model, year, trim } = vehicleData
  
  // Check if classification already exists in database
  const existingClassification = await prisma.vehicleClassification.findFirst({
    where: {
      make,
      model,
      year,
      providerId: null // Global classification
    }
  })
  
  if (existingClassification) {
    return {
      category: existingClassification.category as VehicleCategory,
      riskLevel: existingClassification.riskLevel as RiskCategory,
      estimatedValue: Number(existingClassification.currentValue),
      baseRateMultiplier: Number(existingClassification.baseRateMultiplier),
      riskMultiplier: Number(existingClassification.riskMultiplier),
      features: (existingClassification.features as any)?.features || [],
      isInsurable: existingClassification.isInsurable,
      insurabilityReason: existingClassification.insurabilityReason || undefined,
      requiresManualReview: existingClassification.requiresManualReview,
      classificationId: existingClassification.id
    }
  }
  
  // Calculate estimated value
  const estimatedValue = await estimateVehicleValue(make, model, year)
  
  // Determine category based on value
  const category = determineCategory(estimatedValue, make, model)
  
  // Determine risk level
  const riskLevel = determineRiskLevel(make, model, category)
  
  // Calculate multipliers
  const { baseRateMultiplier, riskMultiplier } = calculateMultipliers(category, riskLevel)
  
  // Determine insurability
  const { isInsurable, reason, requiresManualReview } = determineInsurability(
    category,
    riskLevel,
    estimatedValue,
    year
  )
  
  // Extract features
  const features = extractFeatures(make, model, trim)
  
  // Create new classification in database
  const newClassification = await prisma.vehicleClassification.create({
    data: {
      make,
      model,
      year,
      category,
      riskLevel,
      baseValue: estimatedValue,
      currentValue: estimatedValue,
      valueSource: 'ESTIMATED',
      features: { features },
      isInsurable,
      insurabilityReason: reason,
      requiresManualReview,
      baseRateMultiplier,
      riskMultiplier
    }
  })
  
  return {
    category,
    riskLevel,
    estimatedValue,
    baseRateMultiplier,
    riskMultiplier,
    features,
    isInsurable,
    insurabilityReason: reason,
    requiresManualReview,
    classificationId: newClassification.id
  }
}

/**
 * Estimate vehicle value based on make, model, year
 * In production, this would call KBB or NADA API
 */
async function estimateVehicleValue(make: string, model: string, year: number): Promise<number> {
  const currentYear = new Date().getFullYear()
  const age = currentYear - year
  
  // Base values by make (simplified - in production use real API)
  const baseValues: Record<string, number> = {
    'Ferrari': 350000,
    'Lamborghini': 400000,
    'McLaren': 380000,
    'Porsche': 120000,
    'Mercedes-Benz': 65000,
    'BMW': 60000,
    'Audi': 55000,
    'Lexus': 50000,
    'Tesla': 45000,
    'Toyota': 28000,
    'Honda': 26000,
    'Ford': 30000,
    'Chevrolet': 32000,
    'Nissan': 25000,
    'Hyundai': 24000,
    'Mazda': 27000
  }
  
  let baseValue = baseValues[make] || 25000
  
  // Adjust for specific models
  if (model.includes('Model S') || model.includes('Model X')) baseValue *= 1.5
  if (model.includes('Model 3') || model.includes('Model Y')) baseValue *= 0.8
  if (PERFORMANCE_MODELS.some(pm => model.includes(pm))) baseValue *= 1.3
  
  // Depreciation calculation (simplified)
  const depreciationRate = HIGH_RISK_MAKES.includes(make) ? 0.12 : 0.15
  const value = baseValue * Math.pow(1 - depreciationRate, Math.min(age, 10))
  
  // Minimum value
  return Math.max(value, 5000)
}

/**
 * Determine vehicle category based on value and characteristics
 */
function determineCategory(value: number, make: string, model: string): VehicleCategory {
  // Override for specific makes
  if (HIGH_RISK_MAKES.includes(make)) {
    return value > 500000 ? 'SUPERCAR' : 'EXOTIC'
  }
  
  // Performance models get bumped up a category
  const isPerformance = PERFORMANCE_MODELS.some(pm => model.includes(pm))
  
  // Determine by value
  for (const [category, range] of Object.entries(VALUE_RANGES)) {
    if (value >= range.min && value < range.max) {
      // Bump up performance models
      if (isPerformance && category === 'STANDARD') return 'PREMIUM'
      if (isPerformance && category === 'PREMIUM') return 'LUXURY'
      return category as VehicleCategory
    }
  }
  
  return 'STANDARD'
}

/**
 * Determine risk level based on vehicle characteristics
 */
function determineRiskLevel(make: string, model: string, category: VehicleCategory): RiskCategory {
  // Extreme risk for supercars and certain makes
  if (category === 'SUPERCAR' || HIGH_RISK_MAKES.includes(make)) {
    return 'EXTREME'
  }
  
  // High risk for exotics and performance models
  if (category === 'EXOTIC' || PERFORMANCE_MODELS.some(pm => model.includes(pm))) {
    return 'HIGH'
  }
  
  // Medium risk for luxury and premium
  if (category === 'LUXURY' || category === 'PREMIUM') {
    return 'MEDIUM'
  }
  
  // Low risk for standard vehicles
  return 'LOW'
}

/**
 * Calculate rate multipliers based on category and risk
 */
function calculateMultipliers(category: VehicleCategory, risk: RiskCategory) {
  const baseMultipliers: Record<VehicleCategory, number> = {
    ECONOMY: 0.8,
    STANDARD: 1.0,
    PREMIUM: 1.2,
    LUXURY: 1.5,
    EXOTIC: 2.0,
    SUPERCAR: 3.0
  }
  
  const riskMultipliers: Record<RiskCategory, number> = {
    LOW: 1.0,
    MEDIUM: 1.2,
    HIGH: 1.5,
    EXTREME: 2.0
  }
  
  return {
    baseRateMultiplier: baseMultipliers[category],
    riskMultiplier: riskMultipliers[risk]
  }
}

/**
 * Determine if vehicle is insurable
 */
function determineInsurability(
  category: VehicleCategory,
  risk: RiskCategory,
  value: number,
  year: number
) {
  const currentYear = new Date().getFullYear()
  const age = currentYear - year
  
  // Not insurable conditions
  if (value > 500000) {
    return { 
      isInsurable: false, 
      reason: 'Vehicle value exceeds maximum coverage limit',
      requiresManualReview: true
    }
  }
  
  if (age > 20 && category !== 'EXOTIC' && category !== 'SUPERCAR') {
    return { 
      isInsurable: false, 
      reason: 'Vehicle age exceeds 20 years',
      requiresManualReview: true
    }
  }
  
  if (category === 'SUPERCAR') {
    return { 
      isInsurable: true,
      reason: undefined,
      requiresManualReview: true // Always require manual review for supercars
    }
  }
  
  if (risk === 'EXTREME') {
    return {
      isInsurable: true,
      reason: undefined,
      requiresManualReview: true
    }
  }
  
  return { 
    isInsurable: true, 
    reason: undefined,
    requiresManualReview: false
  }
}

/**
 * Extract vehicle features based on make/model/trim
 */
function extractFeatures(make: string, model: string, trim?: string): string[] {
  const features: string[] = []
  
  // Luxury features
  if (LUXURY_MAKES.includes(make)) {
    features.push('leather_seats', 'premium_audio', 'navigation')
  }
  
  // Electric features
  if (make === 'Tesla' || model.includes('EV') || model.includes('Electric')) {
    features.push('electric', 'autopilot', 'fast_charging')
  }
  
  // Performance features
  if (PERFORMANCE_MODELS.some(pm => model.includes(pm))) {
    features.push('sport_mode', 'performance_brakes', 'sport_suspension')
  }
  
  // Trim-based features
  if (trim) {
    if (trim.includes('Premium') || trim.includes('Limited')) {
      features.push('sunroof', 'heated_seats')
    }
    if (trim.includes('Sport')) {
      features.push('sport_package')
    }
  }
  
  return features
}

/**
 * Update classification for existing vehicle
 */
export async function updateVehicleClassification(
  classificationId: string,
  updates: Partial<ClassificationResult>
): Promise<ClassificationResult> {
  const updated = await prisma.vehicleClassification.update({
    where: { id: classificationId },
    data: {
      category: updates.category,
      riskLevel: updates.riskLevel,
      currentValue: updates.estimatedValue,
      baseRateMultiplier: updates.baseRateMultiplier,
      riskMultiplier: updates.riskMultiplier,
      isInsurable: updates.isInsurable,
      insurabilityReason: updates.insurabilityReason,
      requiresManualReview: updates.requiresManualReview
    }
  })
  
  return {
    category: updated.category as VehicleCategory,
    riskLevel: updated.riskLevel as RiskCategory,
    estimatedValue: Number(updated.currentValue),
    baseRateMultiplier: Number(updated.baseRateMultiplier),
    riskMultiplier: Number(updated.riskMultiplier),
    features: (updated.features as any)?.features || [],
    isInsurable: updated.isInsurable,
    insurabilityReason: updated.insurabilityReason || undefined,
    requiresManualReview: updated.requiresManualReview,
    classificationId: updated.id
  }
}