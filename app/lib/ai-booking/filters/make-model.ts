// app/lib/ai-booking/filters/make-model.ts
// Make and model filters for Prisma queries

import { Prisma } from '@prisma/client';

/**
 * Common make name normalizations (handles typos and variations)
 */
const MAKE_NORMALIZATIONS: Record<string, string> = {
  // Mercedes variations
  mercedes: 'Mercedes-Benz',
  'mercedes benz': 'Mercedes-Benz',
  merc: 'Mercedes-Benz',
  benz: 'Mercedes-Benz',

  // BMW variations
  beamer: 'BMW',
  beemer: 'BMW',

  // Chevrolet variations
  chevy: 'Chevrolet',
  chev: 'Chevrolet',

  // Volkswagen variations
  vw: 'Volkswagen',

  // Land Rover variations
  'land rover': 'Land Rover',
  landrover: 'Land Rover',
  rover: 'Land Rover',
  'range rover': 'Land Rover',

  // Common typos
  toyata: 'Toyota',
  toyta: 'Toyota',
  hoda: 'Honda',
  hunday: 'Hyundai',
  hyundia: 'Hyundai',
  nissian: 'Nissan',
  porshe: 'Porsche',
  porscha: 'Porsche',
  lamborghni: 'Lamborghini',
  lambo: 'Lamborghini',
  ferarri: 'Ferrari',
  ferari: 'Ferrari',
};

/**
 * Normalize make name to standard format
 */
export function normalizeMake(make: string): string {
  const normalized = make.toLowerCase().trim();
  return MAKE_NORMALIZATIONS[normalized] || make;
}

/**
 * Apply make filter to Prisma where clause
 */
export function applyMakeFilter(
  where: Prisma.RentalCarWhereInput,
  make?: string
): Prisma.RentalCarWhereInput {
  if (!make) return where;

  const normalizedMake = normalizeMake(make);

  return {
    ...where,
    make: { contains: normalizedMake, mode: 'insensitive' },
  };
}

/**
 * Apply model filter to Prisma where clause
 */
export function applyModelFilter(
  where: Prisma.RentalCarWhereInput,
  model?: string
): Prisma.RentalCarWhereInput {
  if (!model) return where;

  return {
    ...where,
    model: { contains: model, mode: 'insensitive' },
  };
}
