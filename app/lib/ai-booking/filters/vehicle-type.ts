// app/lib/ai-booking/filters/vehicle-type.ts
// Vehicle type/category filter for Prisma queries

import { Prisma } from '@prisma/client';

/**
 * Map of car type keywords to Prisma filter conditions
 */
const CAR_TYPE_MAPPINGS: Record<string, Prisma.RentalCarWhereInput> = {
  // Electric vehicles
  electric: {
    OR: [
      { fuelType: { contains: 'electric', mode: 'insensitive' } },
      { fuelType: { contains: 'ev', mode: 'insensitive' } },
      { make: { in: ['Tesla', 'Rivian', 'Lucid', 'Polestar'] } },
    ],
  },
  ev: {
    OR: [
      { fuelType: { contains: 'electric', mode: 'insensitive' } },
      { make: { in: ['Tesla', 'Rivian', 'Lucid', 'Polestar'] } },
    ],
  },
  tesla: {
    make: 'Tesla',
  },

  // Body types
  suv: {
    OR: [
      { bodyType: { contains: 'suv', mode: 'insensitive' } },
      { bodyType: { contains: 'crossover', mode: 'insensitive' } },
    ],
  },
  sedan: {
    bodyType: { contains: 'sedan', mode: 'insensitive' },
  },
  truck: {
    OR: [
      { bodyType: { contains: 'truck', mode: 'insensitive' } },
      { bodyType: { contains: 'pickup', mode: 'insensitive' } },
    ],
  },
  convertible: {
    bodyType: { contains: 'convertible', mode: 'insensitive' },
  },
  coupe: {
    bodyType: { contains: 'coupe', mode: 'insensitive' },
  },
  van: {
    OR: [
      { bodyType: { contains: 'van', mode: 'insensitive' } },
      { bodyType: { contains: 'minivan', mode: 'insensitive' } },
    ],
  },

  // Luxury/premium
  luxury: {
    OR: [
      { make: { in: ['BMW', 'Mercedes-Benz', 'Mercedes', 'Audi', 'Lexus', 'Porsche', 'Maserati', 'Bentley', 'Rolls-Royce'] } },
      { dailyRate: { gte: 150 } },
    ],
  },
  premium: {
    OR: [
      { make: { in: ['BMW', 'Mercedes-Benz', 'Mercedes', 'Audi', 'Lexus', 'Porsche'] } },
      { dailyRate: { gte: 100 } },
    ],
  },

  // Sports/exotic
  sports: {
    OR: [
      { bodyType: { contains: 'sports', mode: 'insensitive' } },
      { make: { in: ['Porsche', 'Ferrari', 'Lamborghini', 'McLaren', 'Corvette'] } },
    ],
  },
  exotic: {
    OR: [
      { make: { in: ['Ferrari', 'Lamborghini', 'McLaren', 'Bugatti', 'Pagani', 'Koenigsegg'] } },
      { dailyRate: { gte: 500 } },
    ],
  },

  // Economy/budget
  economy: {
    dailyRate: { lte: 50 },
  },
  budget: {
    dailyRate: { lte: 60 },
  },
  cheap: {
    dailyRate: { lte: 50 },
  },
};

/**
 * Apply vehicle type filter to Prisma where clause
 */
export function applyVehicleTypeFilter(
  where: Prisma.RentalCarWhereInput,
  carType?: string
): Prisma.RentalCarWhereInput {
  if (!carType) return where;

  const normalizedType = carType.toLowerCase().trim();
  const mapping = CAR_TYPE_MAPPINGS[normalizedType];

  if (!mapping) {
    // If no mapping found, try as a body type contains search
    return {
      ...where,
      bodyType: { contains: carType, mode: 'insensitive' },
    };
  }

  return {
    ...where,
    ...mapping,
  };
}

/**
 * Apply rideshare vehicle type filter
 */
export function applyRideshareFilter(
  where: Prisma.RentalCarWhereInput,
  vehicleType?: 'RENTAL' | 'RIDESHARE'
): Prisma.RentalCarWhereInput {
  if (!vehicleType) return where;

  return {
    ...where,
    vehicleType: vehicleType,
  };
}
