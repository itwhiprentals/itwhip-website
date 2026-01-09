// app/lib/utils/vehicleSpec.ts
// Utility functions for fetching vehicle specification data

import { vehicleSpecsByYear, vehicleSpecs, type CarType, type FuelType } from '@/app/lib/data/vehicles'

export interface VehicleSpecData {
  seats: number | null
  doors: number | null
  carType: CarType | null
  fuelType: FuelType | string | null  // Allow composite types like 'gas/hybrid'
}

/**
 * Get vehicle specification data for a specific make/model/year
 * @param make - Vehicle make (e.g., "Toyota")
 * @param model - Vehicle model (e.g., "Camry")
 * @param year - Vehicle year (e.g., "2024")
 * @returns Object containing seats, doors, carType, and fuelType, or null if not available
 */
export function getVehicleSpecData(
  make: string,
  model: string,
  year: string
): VehicleSpecData {
  // Normalize make for case-insensitive lookup
  const normalizedMake = make?.charAt(0).toUpperCase() + make?.slice(1).toLowerCase()

  // Try year-specific data first (preferred source)
  const yearSpec = vehicleSpecsByYear[normalizedMake]?.[model]?.[year]
  if (yearSpec) {
    return {
      seats: yearSpec.seats,
      doors: yearSpec.doors,
      carType: yearSpec.carType,
      fuelType: yearSpec.fuelType
    }
  }

  // Fallback to legacy database (for current models without year data)
  const legacySpec = vehicleSpecs[normalizedMake]?.[model]
  if (legacySpec) {
    return {
      seats: legacySpec.seats,
      doors: legacySpec.doors,
      carType: legacySpec.carType,
      fuelType: legacySpec.fuelType
    }
  }

  // Try fuzzy matching for model variations (e.g., "Prius Prime (PHEV)" -> "Prius")
  // Check if model starts with or contains a known model name
  const makeModels = vehicleSpecs[normalizedMake]
  if (makeModels) {
    for (const knownModel of Object.keys(makeModels)) {
      // Check if the model starts with the known model name
      if (model.toLowerCase().startsWith(knownModel.toLowerCase())) {
        const spec = makeModels[knownModel]
        return {
          seats: spec.seats,
          doors: spec.doors,
          carType: spec.carType,
          fuelType: spec.fuelType
        }
      }
    }
  }

  // No data available
  return {
    seats: null,
    doors: null,
    carType: null,
    fuelType: null
  }
}
