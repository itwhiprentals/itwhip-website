// app/lib/ai-booking/validators/location-validator.ts
// Location validation utilities

import { isValidArizonaCity, normalizeLocation, VALID_ARIZONA_CITIES } from '../filters/location';

/**
 * Validation result type
 */
export interface LocationValidationResult {
  valid: boolean;
  normalizedLocation?: string;
  error?: string;
}

/**
 * Validate and normalize location input
 */
export function validateLocation(location: string): LocationValidationResult {
  if (!location || location.trim() === '') {
    return { valid: false, error: 'Location is required' };
  }

  const normalized = normalizeLocation(location);

  // Check if it resolves to a valid Arizona city
  if (!isValidArizonaCity(normalized)) {
    return {
      valid: false,
      error: `"${location}" is not a recognized Arizona city. We serve: ${VALID_ARIZONA_CITIES.slice(0, 5).join(', ')}, and more.`,
    };
  }

  return {
    valid: true,
    normalizedLocation: normalized,
  };
}

/**
 * Check if location looks like it might be outside Arizona
 */
export function isOutOfServiceArea(location: string): boolean {
  const outOfAreaIndicators = [
    'california',
    'ca',
    'nevada',
    'nv',
    'las vegas',
    'los angeles',
    'san diego',
    'new mexico',
    'nm',
    'texas',
    'tx',
    'colorado',
    'co',
    'utah',
    'ut',
  ];

  const normalized = location.toLowerCase().trim();

  return outOfAreaIndicators.some(
    (indicator) =>
      normalized === indicator ||
      normalized.includes(`, ${indicator}`) ||
      normalized.endsWith(` ${indicator}`)
  );
}

/**
 * Get service area message for out-of-area requests
 */
export function getOutOfAreaMessage(location: string): string {
  return `We currently only serve Arizona! Popular areas include Phoenix, Scottsdale, Tempe, Mesa, Tucson, Sedona, and Flagstaff. Would you like to search in one of these cities?`;
}

/**
 * Get suggested nearby city for partially matching input
 */
export function getSuggestedCity(input: string): string | null {
  const normalized = input.toLowerCase().trim();

  // Check for partial matches
  for (const city of VALID_ARIZONA_CITIES) {
    if (city.toLowerCase().startsWith(normalized)) {
      return city;
    }
  }

  return null;
}
