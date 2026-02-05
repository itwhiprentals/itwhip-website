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
