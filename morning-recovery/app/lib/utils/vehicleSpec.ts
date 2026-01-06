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
  // Try year-specific data first (preferred source)
  const yearSpec = vehicleSpecsByYear[make]?.[model]?.[year]
  if (yearSpec) {
    return {
      seats: yearSpec.seats,
      doors: yearSpec.doors,
      carType: yearSpec.carType,
      fuelType: yearSpec.fuelType
    }
  }

  // Fallback to legacy database (for current models without year data)
  const legacySpec = vehicleSpecs[make]?.[model]
  if (legacySpec) {
    return {
      seats: legacySpec.seats,
      doors: legacySpec.doors,
      carType: legacySpec.carType,
      fuelType: legacySpec.fuelType
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
