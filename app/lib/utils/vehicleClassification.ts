// app/lib/utils/vehicleClassification.ts
// Vehicle classification logic for determining vehicle class and fuel type badges

import { type CarType, type FuelType } from '@/app/lib/data/vehicles'

export type VehicleClass = 'Economy' | 'Standard' | 'Premium' | 'Luxury' | 'Sport' | 'Exotic'
export type FuelTypeBadge = 'Gas' | 'Hybrid' | 'Electric' | 'Diesel'

/**
 * Determine vehicle class based on make, model, and carType
 * @param make - Vehicle make (e.g., "Toyota", "BMW")
 * @param model - Vehicle model (e.g., "Camry", "3 Series")
 * @param carType - Vehicle type from database (sedan, suv, sports, etc.)
 * @returns Vehicle class badge label or null if cannot be determined
 */
export function getVehicleClass(
  make: string,
  model: string | undefined,
  carType: CarType | null
): VehicleClass | null {
  if (!make) return null

  const makeUpper = make.toUpperCase()
  const modelUpper = model?.toUpperCase() || ''

  // EXOTIC - Ultra-luxury and supercar brands
  const exoticMakes = [
    'FERRARI', 'LAMBORGHINI', 'MCLAREN', 'BUGATTI',
    'ROLLS-ROYCE', 'BENTLEY', 'ASTON MARTIN'
  ]
  if (exoticMakes.includes(makeUpper)) {
    return 'Exotic'
  }

  // SPORT - Sports cars and performance variants
  if (carType === 'sports') {
    return 'Sport'
  }

  // Porsche 911
  if (makeUpper === 'PORSCHE' && modelUpper.includes('911')) {
    return 'Sport'
  }

  // BMW M-Series (M2, M3, M4, M5, M8, etc.)
  if (makeUpper === 'BMW' && (modelUpper.startsWith('M') || modelUpper.includes(' M'))) {
    return 'Sport'
  }

  // Mercedes AMG models, Honda Type R, Nissan NISMO
  if (modelUpper.includes('AMG') || modelUpper.includes('TYPE R') ||
      modelUpper.includes('TYPE S') || modelUpper.includes('NISMO')) {
    return 'Sport'
  }

  // LUXURY - High-end luxury models
  const luxuryMakes = ['MAYBACH']
  if (luxuryMakes.includes(makeUpper)) {
    return 'Luxury'
  }

  // Mercedes S-Class, GLS, GLE, Maybach variants
  if (makeUpper === 'MERCEDES-BENZ' &&
      (modelUpper.includes('S-CLASS') || modelUpper === 'GLS' ||
       modelUpper === 'GLE' || modelUpper.includes('MAYBACH'))) {
    return 'Luxury'
  }

  // BMW 7-Series, X7, i7
  if (makeUpper === 'BMW' &&
      (modelUpper.includes('7 SERIES') || modelUpper === 'X7' || modelUpper === 'I7')) {
    return 'Luxury'
  }

  // Audi A8, Q8, Q7
  if (makeUpper === 'AUDI' &&
      (modelUpper.includes('A8') || modelUpper === 'Q8' || modelUpper === 'Q7')) {
    return 'Luxury'
  }

  // Lexus LS, LX 600, LX 700H
  if (makeUpper === 'LEXUS' &&
      (modelUpper === 'LS' || modelUpper === 'LX 600' || modelUpper === 'LX 700H' || modelUpper.startsWith('LX'))) {
    return 'Luxury'
  }

  // Cadillac Escalade, Celestiq
  if (makeUpper === 'CADILLAC' &&
      (modelUpper.includes('ESCALADE') || modelUpper.includes('CELESTIQ'))) {
    return 'Luxury'
  }

  // PREMIUM - Premium brands and models
  const premiumMakes = [
    'BMW', 'MERCEDES-BENZ', 'AUDI', 'LEXUS', 'ACURA',
    'INFINITI', 'GENESIS', 'PORSCHE', 'CADILLAC',
    'LINCOLN', 'VOLVO', 'JAGUAR', 'LAND ROVER', 'ALFA ROMEO',
    'MASERATI'
  ]
  if (premiumMakes.includes(makeUpper)) {
    return 'Premium'
  }

  // Tesla is Premium
  if (makeUpper === 'TESLA') {
    return 'Premium'
  }

  // ECONOMY - Budget-friendly models
  const economyModels = [
    'COROLLA', 'YARIS', 'CIVIC', 'FIT', 'VERSA', 'SENTRA',
    'RIO', 'FORTE', 'ELANTRA', 'VENUE', 'ACCENT',
    'MIRAGE', 'IMPREZA', 'CROSSTREK'
  ]
  if (economyModels.some(model => modelUpper.includes(model))) {
    return 'Economy'
  }

  // Economy makes for base models
  const economyMakes = ['KIA', 'HYUNDAI', 'MITSUBISHI']
  if (economyMakes.includes(makeUpper)) {
    return 'Economy'
  }

  // STANDARD - Everything else (mainstream brands)
  return 'Standard'
}

/**
 * Format fuel type for badge display
 * Handles composite types like 'gas/hybrid' → 'Hybrid'
 * @param fuelType - Fuel type from database
 * @returns Formatted fuel type for badge display or null
 */
export function formatFuelTypeBadge(fuelType: FuelType | string | null): FuelTypeBadge | null {
  if (!fuelType) return null

  const fuelLower = fuelType.toLowerCase()

  // Handle composite types - prioritize alternative fuel
  if (fuelLower.includes('hybrid') || fuelLower.includes('plug-in')) {
    return 'Hybrid'
  }
  if (fuelLower.includes('electric')) {
    return 'Electric'
  }
  if (fuelLower.includes('diesel')) {
    return 'Diesel'
  }
  if (fuelLower.includes('gas')) {
    return 'Gas'
  }

  // Hydrogen -> Gas (rare edge case, e.g., Toyota Mirai)
  if (fuelLower.includes('hydrogen')) {
    return 'Gas'
  }

  return null
}
