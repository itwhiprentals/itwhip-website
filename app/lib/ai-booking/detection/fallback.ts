// app/lib/ai-booking/detection/fallback.ts
// Progressive filter loosening when search returns 0 results

import type { SearchQuery } from '../types';

/**
 * Create fallback queries by progressively loosening filters
 * Called when initial search returns 0 results
 *
 * Strategy:
 * 1. Remove price constraints first (most restrictive)
 * 2. Remove vehicle type but keep make
 * 3. Remove make but keep location/dates
 * 4. Just location and dates (absolute fallback)
 */
export function createFallbackQueries(original: SearchQuery): SearchQuery[] {
  const fallbacks: SearchQuery[] = [];

  // Level 1: Remove price constraints
  if (original.priceMin || original.priceMax) {
    fallbacks.push({
      ...original,
      priceMin: undefined,
      priceMax: undefined,
    });
  }

  // Level 2: Remove vehicle type but keep make
  if (original.carType) {
    fallbacks.push({
      ...original,
      carType: undefined,
      priceMin: undefined,
      priceMax: undefined,
    });
  }

  // Level 3: Remove make but keep location/dates
  if (original.make) {
    fallbacks.push({
      location: original.location,
      pickupDate: original.pickupDate,
      returnDate: original.returnDate,
      pickupTime: original.pickupTime,
      returnTime: original.returnTime,
      noDeposit: original.noDeposit, // Keep user's deposit preference
    });
  }

  // Level 4: Just location and dates (absolute fallback)
  fallbacks.push({
    location: original.location,
    pickupDate: original.pickupDate,
    returnDate: original.returnDate,
    pickupTime: original.pickupTime,
    returnTime: original.returnTime,
  });

  return fallbacks;
}

/**
 * Check if we should attempt fallback search
 */
export function shouldTryFallback(results: unknown[], query: SearchQuery): boolean {
  // Only fallback if we got no results
  if (results.length > 0) return false;

  // Only fallback if we had restrictive filters
  return !!(
    query.priceMin ||
    query.priceMax ||
    query.carType ||
    query.make ||
    query.seats ||
    query.transmission
  );
}

/**
 * Get a message explaining what filters were loosened
 */
export function getFallbackMessage(original: SearchQuery, fallback: SearchQuery): string {
  const loosened: string[] = [];

  if (original.priceMin && !fallback.priceMin) {
    loosened.push('minimum price');
  }
  if (original.priceMax && !fallback.priceMax) {
    loosened.push('maximum price');
  }
  if (original.carType && !fallback.carType) {
    loosened.push(`${original.carType} type`);
  }
  if (original.make && !fallback.make) {
    loosened.push(`${original.make} make`);
  }
  if (original.seats && !fallback.seats) {
    loosened.push('seat requirement');
  }
  if (original.transmission && !fallback.transmission) {
    loosened.push('transmission type');
  }

  if (loosened.length === 0) {
    return 'Showing all available cars in your area.';
  }

  return `I couldn't find exact matches, so I expanded the search by removing the ${loosened.join(', ')} filter${loosened.length > 1 ? 's' : ''}.`;
}

/**
 * Determine which fallback level was used
 */
export function getFallbackLevel(original: SearchQuery, fallback: SearchQuery): number {
  let level = 0;

  // Check what was removed
  if (original.priceMin && !fallback.priceMin) level = Math.max(level, 1);
  if (original.priceMax && !fallback.priceMax) level = Math.max(level, 1);
  if (original.carType && !fallback.carType) level = Math.max(level, 2);
  if (original.make && !fallback.make) level = Math.max(level, 3);

  // Level 4 = everything removed
  if (!fallback.carType && !fallback.make && !fallback.priceMin && !fallback.priceMax) {
    level = 4;
  }

  return level;
}

/**
 * Create a modified query with specific filters removed
 */
export function removeFilter(
  query: SearchQuery,
  filter: keyof SearchQuery
): SearchQuery {
  const { [filter]: _, ...rest } = query;
  return rest as SearchQuery;
}

/**
 * Create a query with only essential fields (location + dates)
 */
export function createMinimalQuery(query: SearchQuery): SearchQuery {
  return {
    location: query.location,
    pickupDate: query.pickupDate,
    returnDate: query.returnDate,
    pickupTime: query.pickupTime,
    returnTime: query.returnTime,
  };
}
