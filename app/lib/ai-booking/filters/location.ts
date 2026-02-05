// app/lib/ai-booking/filters/location.ts
// Arizona location normalization and validation

/**
 * Arizona city aliases and common variations
 */
const ARIZONA_ALIASES: Record<string, string> = {
  // Phoenix aliases
  phx: 'Phoenix, AZ',
  phoenix: 'Phoenix, AZ',
  pheonix: 'Phoenix, AZ', // Common misspelling
  'downtown phoenix': 'Phoenix, AZ',

  // Scottsdale aliases
  scotty: 'Scottsdale, AZ',
  scottsdale: 'Scottsdale, AZ',
  'old town scottsdale': 'Scottsdale, AZ',

  // Tempe aliases
  tempe: 'Tempe, AZ',
  asu: 'Tempe, AZ',
  'arizona state': 'Tempe, AZ',

  // Mesa aliases
  mesa: 'Mesa, AZ',

  // Chandler aliases
  chandler: 'Chandler, AZ',

  // Gilbert aliases
  gilbert: 'Gilbert, AZ',

  // Glendale aliases
  glendale: 'Glendale, AZ',

  // Peoria aliases
  peoria: 'Peoria, AZ',

  // Surprise aliases
  surprise: 'Surprise, AZ',

  // Goodyear aliases
  goodyear: 'Goodyear, AZ',

  // Tucson aliases
  tucson: 'Tucson, AZ',
  tuc: 'Tucson, AZ',
  tuscon: 'Tucson, AZ', // Common misspelling

  // Sedona aliases
  sedona: 'Sedona, AZ',

  // Flagstaff aliases
  flagstaff: 'Flagstaff, AZ',
  flag: 'Flagstaff, AZ',
  'northern arizona': 'Flagstaff, AZ',

  // Prescott aliases
  prescott: 'Prescott, AZ',

  // Yuma aliases
  yuma: 'Yuma, AZ',

  // Airport aliases
  'sky harbor': 'Phoenix, AZ',
  'phx airport': 'Phoenix, AZ',
  'phoenix airport': 'Phoenix, AZ',
  'sky harbor airport': 'Phoenix, AZ',
  'phoenix sky harbor': 'Phoenix, AZ',
  'tucson airport': 'Tucson, AZ',
  'tus airport': 'Tucson, AZ',
  'flagstaff airport': 'Flagstaff, AZ',
  flg: 'Flagstaff, AZ',

  // Generic
  arizona: 'Phoenix, AZ',
  az: 'Phoenix, AZ',
  anywhere: 'Phoenix, AZ',
  'anywhere in arizona': 'Phoenix, AZ',
};

/**
 * Valid Arizona cities for search
 */
export const VALID_ARIZONA_CITIES = [
  'Phoenix',
  'Scottsdale',
  'Tempe',
  'Mesa',
  'Chandler',
  'Gilbert',
  'Glendale',
  'Peoria',
  'Surprise',
  'Goodyear',
  'Avondale',
  'Buckeye',
  'Cave Creek',
  'Fountain Hills',
  'Paradise Valley',
  'Tucson',
  'Sedona',
  'Flagstaff',
  'Prescott',
  'Yuma',
  'Lake Havasu City',
  'Sierra Vista',
];

/**
 * Normalize location input to standard format
 */
export function normalizeLocation(input: string): string {
  if (!input) return 'Phoenix, AZ';

  const normalized = input.toLowerCase().trim();

  // Check aliases first
  if (ARIZONA_ALIASES[normalized]) {
    return ARIZONA_ALIASES[normalized];
  }

  // Check if it's already in "City, AZ" format
  if (input.includes(', AZ') || input.includes(',AZ')) {
    return input;
  }

  // Check if it matches a valid city name
  for (const city of VALID_ARIZONA_CITIES) {
    if (normalized.includes(city.toLowerCase())) {
      return `${city}, AZ`;
    }
  }

  // Default: append ", AZ" if it looks like a city name
  const titleCase = input
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return `${titleCase}, AZ`;
}

/**
 * Check if location is a valid Arizona city
 */
export function isValidArizonaCity(city: string): boolean {
  const normalized = city.toLowerCase().replace(', az', '').trim();

  return VALID_ARIZONA_CITIES.some(
    (validCity) => validCity.toLowerCase() === normalized
  );
}

/**
 * Get city name without state suffix
 */
export function extractCityName(location: string): string {
  return location.replace(/, AZ$/i, '').trim();
}

// =============================================================================
// METRO AREA GROUPINGS
// =============================================================================

/**
 * Phoenix metro area cities — these share overlapping inventory
 */
export const PHOENIX_METRO: string[] = [
  'Phoenix',
  'Scottsdale',
  'Tempe',
  'Mesa',
  'Chandler',
  'Gilbert',
  'Glendale',
  'Peoria',
  'Surprise',
  'Goodyear',
  'Avondale',
  'Buckeye',
  'Cave Creek',
  'Fountain Hills',
  'Paradise Valley',
];

/**
 * Tucson metro area
 */
export const TUCSON_METRO: string[] = [
  'Tucson',
  'Marana',
  'Oro Valley',
  'Sierra Vista',
];

/**
 * Check if two cities share a metro area
 */
export function isSameMetro(cityA: string, cityB: string): boolean {
  const a = extractCityName(cityA);
  const b = extractCityName(cityB);

  const aInPhx = PHOENIX_METRO.some(
    (c) => c.toLowerCase() === a.toLowerCase()
  );
  const bInPhx = PHOENIX_METRO.some(
    (c) => c.toLowerCase() === b.toLowerCase()
  );
  if (aInPhx && bInPhx) return true;

  const aInTuc = TUCSON_METRO.some(
    (c) => c.toLowerCase() === a.toLowerCase()
  );
  const bInTuc = TUCSON_METRO.some(
    (c) => c.toLowerCase() === b.toLowerCase()
  );
  if (aInTuc && bInTuc) return true;

  return false;
}

/**
 * Get the metro area name for a city
 */
export function getMetroArea(city: string): string | null {
  const name = extractCityName(city).toLowerCase();

  if (PHOENIX_METRO.some((c) => c.toLowerCase() === name)) {
    return 'Phoenix Metro';
  }
  if (TUCSON_METRO.some((c) => c.toLowerCase() === name)) {
    return 'Tucson Metro';
  }
  return null;
}

// =============================================================================
// INVENTORY AWARENESS
// =============================================================================

/**
 * Cities with active inventory — update as markets grow
 * This prevents wasted searches on cities with no listings
 */
export const ACTIVE_MARKETS: string[] = [
  'Phoenix',
  'Scottsdale',
  'Tempe',
  'Mesa',
  'Chandler',
  'Gilbert',
  'Glendale',
  'Peoria',
  'Surprise',
  'Goodyear',
  'Tucson',
  'Flagstaff',
  'Sedona',
  'Prescott',
];

/**
 * Cities with NO inventory — with nearest active market + distance
 */
export const INACTIVE_MARKETS: Record<
  string,
  { nearest: string; distance: string; driveTime: string }
> = {
  Yuma: {
    nearest: 'Tucson',
    distance: '185 miles',
    driveTime: '~3 hours',
  },
  'Lake Havasu City': {
    nearest: 'Phoenix',
    distance: '200 miles',
    driveTime: '~3.5 hours',
  },
  'Sierra Vista': {
    nearest: 'Tucson',
    distance: '75 miles',
    driveTime: '~1.5 hours',
  },
  Nogales: {
    nearest: 'Tucson',
    distance: '65 miles',
    driveTime: '~1 hour',
  },
  Page: {
    nearest: 'Flagstaff',
    distance: '135 miles',
    driveTime: '~2.5 hours',
  },
  Kingman: {
    nearest: 'Phoenix',
    distance: '185 miles',
    driveTime: '~3 hours',
  },
  'Casa Grande': {
    nearest: 'Phoenix',
    distance: '50 miles',
    driveTime: '~50 min',
  },
  'Apache Junction': {
    nearest: 'Mesa',
    distance: '15 miles',
    driveTime: '~20 min',
  },
};

/**
 * Check if a city has active inventory
 */
export function hasActiveInventory(city: string): boolean {
  const name = extractCityName(city);
  return ACTIVE_MARKETS.some(
    (c) => c.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get nearest active market for a city without inventory
 */
export function getNearestMarket(
  city: string
): { nearest: string; distance: string; driveTime: string } | null {
  const name = extractCityName(city);

  // Check inactive markets map first
  for (const [inactiveCity, info] of Object.entries(INACTIVE_MARKETS)) {
    if (inactiveCity.toLowerCase() === name.toLowerCase()) {
      return info;
    }
  }

  // If city is unknown, default to Phoenix
  return {
    nearest: 'Phoenix',
    distance: 'unknown',
    driveTime: 'unknown',
  };
}

/**
 * Get contextual message for metro area searches
 */
export function getMetroContext(city: string): string | null {
  const name = extractCityName(city);
  const metro = getMetroArea(city);

  if (!metro) return null;

  if (metro === 'Phoenix Metro' && name.toLowerCase() !== 'phoenix') {
    return `${name} is in the Phoenix metro area — showing cars closest to ${name}`;
  }
  if (metro === 'Tucson Metro' && name.toLowerCase() !== 'tucson') {
    return `${name} is in the Tucson area — showing nearby cars`;
  }
  return null;
}
