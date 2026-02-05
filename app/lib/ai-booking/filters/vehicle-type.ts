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

  // Body types (uses carType field in DB)
  suv: {
    OR: [
      { carType: { contains: 'suv', mode: 'insensitive' } },
      { carType: { contains: 'crossover', mode: 'insensitive' } },
    ],
  },
  sedan: {
    carType: { contains: 'sedan', mode: 'insensitive' },
  },
  truck: {
    OR: [
      { carType: { contains: 'truck', mode: 'insensitive' } },
      { carType: { contains: 'pickup', mode: 'insensitive' } },
    ],
  },
  convertible: {
    carType: { contains: 'convertible', mode: 'insensitive' },
  },
  coupe: {
    carType: { contains: 'coupe', mode: 'insensitive' },
  },
  van: {
    OR: [
      { carType: { contains: 'van', mode: 'insensitive' } },
      { carType: { contains: 'minivan', mode: 'insensitive' } },
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
      { carType: { contains: 'sports', mode: 'insensitive' } },
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
    // If no mapping found, try as a carType contains search
    return {
      ...where,
      carType: { contains: carType, mode: 'insensitive' },
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
