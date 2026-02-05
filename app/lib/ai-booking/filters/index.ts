// app/lib/ai-booking/filters/index.ts
// Main export - combines all filter functions into buildWhereClause

import { Prisma } from '@prisma/client';
import type { SearchQuery } from '../types';

import { applyNoDepositFilter } from './no-deposit';
import { applyPriceFilter } from './price-range';
import { applyVehicleTypeFilter, applyRideshareFilter } from './vehicle-type';
import { applyMakeFilter, applyModelFilter, normalizeMake } from './make-model';
import { applyFeaturesFilter, applyInstantBookFilter, applySeatsFilter, applyTransmissionFilter, applyDeliveryFilter } from './features';
import { normalizeLocation, isValidArizonaCity, extractCityName, VALID_ARIZONA_CITIES } from './location';

// Re-export individual filters for direct imports
export { applyNoDepositFilter } from './no-deposit';
export { applyPriceFilter } from './price-range';
export { applyVehicleTypeFilter, applyRideshareFilter } from './vehicle-type';
export { applyMakeFilter, applyModelFilter, normalizeMake } from './make-model';
export { applyFeaturesFilter, applyInstantBookFilter, applySeatsFilter, applyTransmissionFilter, applyDeliveryFilter } from './features';
export { normalizeLocation, isValidArizonaCity, extractCityName, VALID_ARIZONA_CITIES } from './location';

/**
 * Build complete Prisma where clause from search query
 * Applies all filters in sequence
 */
export function buildWhereClause(query: SearchQuery): Prisma.RentalCarWhereInput {
  // Start with base conditions (active cars from approved hosts)
  let where: Prisma.RentalCarWhereInput = {
    isActive: true,
    host: {
      approvalStatus: 'APPROVED',
    },
  };

  // Apply filters in order
  where = applyNoDepositFilter(where, query.noDeposit);
  where = applyPriceFilter(where, query.priceMin, query.priceMax);
  where = applyVehicleTypeFilter(where, query.carType);
  where = applyMakeFilter(where, query.make);
  where = applyFeaturesFilter(where, {
    instantBook: query.instantBook,
    seats: query.seats,
    transmission: query.transmission,
  });

  return where;
}

/**
 * Interface for extended search options beyond SearchQuery
 */
export interface ExtendedSearchOptions extends SearchQuery {
  model?: string;
  delivery?: string;
  vehicleType?: 'RENTAL' | 'RIDESHARE';
}

/**
 * Build where clause with extended options
 */
export function buildExtendedWhereClause(options: ExtendedSearchOptions): Prisma.RentalCarWhereInput {
  let where = buildWhereClause(options);

  if (options.model) {
    where = applyModelFilter(where, options.model);
  }

  if (options.delivery) {
    where = applyDeliveryFilter(where, options.delivery);
  }

  if (options.vehicleType) {
    where = applyRideshareFilter(where, options.vehicleType);
  }

  return where;
}
