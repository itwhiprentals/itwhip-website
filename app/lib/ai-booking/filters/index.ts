// app/lib/ai-booking/filters/index.ts
// Main export - combines all filter functions into buildWhereClause

import { Prisma } from '@prisma/client';
import type { SearchQuery } from '../types';

import { applyNoDepositFilter } from './no-deposit';
import { applyPriceFilter } from './price-range';
import { applyVehicleTypeFilter, applyRideshareFilter } from './vehicle-type';
import { applyMakeFilter, applyModelFilter, normalizeMake } from './make-model';
import { applyFeaturesFilter, applyInstantBookFilter, applySeatsFilter, applyTransmissionFilter, applyDeliveryFilter, applyMultipleDeliveryFilters } from './features';
import {
  normalizeLocation,
  isValidArizonaCity,
  extractCityName,
  VALID_ARIZONA_CITIES,
  PHOENIX_METRO,
  TUCSON_METRO,
  ACTIVE_MARKETS,
  INACTIVE_MARKETS,
  isSameMetro,
  getMetroArea,
  hasActiveInventory,
  getNearestMarket,
  getMetroContext,
} from './location';

// Re-export individual filters for direct imports
export { applyNoDepositFilter } from './no-deposit';
export { applyPriceFilter } from './price-range';
export { applyVehicleTypeFilter, applyRideshareFilter } from './vehicle-type';
export { applyMakeFilter, applyModelFilter, normalizeMake } from './make-model';
export { applyFeaturesFilter, applyInstantBookFilter, applySeatsFilter, applyTransmissionFilter, applyDeliveryFilter, applyMultipleDeliveryFilters } from './features';

// Re-export location utilities and constants
export {
  normalizeLocation,
  isValidArizonaCity,
  extractCityName,
  VALID_ARIZONA_CITIES,
  PHOENIX_METRO,
  TUCSON_METRO,
  ACTIVE_MARKETS,
  INACTIVE_MARKETS,
  isSameMetro,
  getMetroArea,
  hasActiveInventory,
  getNearestMarket,
  getMetroContext,
} from './location';

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

/**
 * Interface for search route filters (accepts delivery as array)
 */
export interface SearchRouteFilters {
  instantBook?: boolean;
  carType?: string;
  make?: string;
  priceMin?: number;
  priceMax?: number;
  transmission?: string;
  seats?: number;
  delivery?: string[];  // Array of delivery options
  noDeposit?: boolean;
}

/**
 * Build where clause specifically for the /api/rentals/search route
 * Handles delivery as string array (multiple options)
 */
export function buildSearchWhereClause(filters: SearchRouteFilters): Prisma.RentalCarWhereInput {
  // Start with base conditions
  let where: Prisma.RentalCarWhereInput = {
    isActive: true,
    host: {
      approvalStatus: 'APPROVED',
    },
  };

  // Apply filters in order
  where = applyInstantBookFilter(where, filters.instantBook);
  where = applyVehicleTypeFilter(where, filters.carType);
  where = applyMakeFilter(where, filters.make);
  where = applyPriceFilter(where, filters.priceMin, filters.priceMax);
  where = applyTransmissionFilter(where, filters.transmission);
  where = applySeatsFilter(where, filters.seats);
  where = applyMultipleDeliveryFilters(where, filters.delivery || []);
  where = applyNoDepositFilter(where, filters.noDeposit);

  return where;
}
