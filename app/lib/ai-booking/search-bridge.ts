// app/lib/ai-booking/search-bridge.ts
// Bridge to the existing rental search API
// Calls the search endpoint internally via HTTP

import { SearchQuery, VehicleSummary } from './types';

// =============================================================================
// TYPES
// =============================================================================

export interface VehiclePreferences {
  preferRideshare: boolean;
  preferNoDeposit: boolean;
  showVehicleTypeBadges: boolean;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Extract just the city name from location strings like "Phoenix, AZ" or "Phoenix"
 */
function extractCityName(location: string): string {
  return location.split(',')[0].trim();
}

/**
 * Sort vehicles based on preferences
 * Prioritizes: no-deposit first (if enabled), then rideshare (if enabled), then by price
 */
function sortByPreferences(vehicles: VehicleSummary[], prefs: VehiclePreferences): VehicleSummary[] {
  return [...vehicles].sort((a, b) => {
    // Priority 1: No deposit vehicles (if preferred)
    if (prefs.preferNoDeposit) {
      const aNoDeposit = (a.depositAmount ?? 0) === 0;
      const bNoDeposit = (b.depositAmount ?? 0) === 0;
      if (aNoDeposit !== bNoDeposit) {
        return aNoDeposit ? -1 : 1;
      }
    }

    // Priority 2: Rideshare vehicles (if preferred)
    if (prefs.preferRideshare) {
      const aRideshare = a.vehicleType === 'RIDESHARE';
      const bRideshare = b.vehicleType === 'RIDESHARE';
      if (aRideshare !== bRideshare) {
        return aRideshare ? -1 : 1;
      }
    }

    // Priority 3: Sort by daily rate (lowest first)
    return (a.dailyRate || 0) - (b.dailyRate || 0);
  });
}

// =============================================================================
// SEARCH FOR VEHICLES
// =============================================================================

/** Search available vehicles using the existing rental search API */
export async function searchVehicles(
  query: SearchQuery,
  preferences?: VehiclePreferences
): Promise<VehicleSummary[]> {
  try {
    const params = buildSearchParams(query);
    // In production: use site URL. In dev: use DEV_SERVER_URL or localhost with PORT
    const isDev = process.env.NODE_ENV === 'development';
    const baseUrl = isDev
      ? (process.env.DEV_SERVER_URL || `http://localhost:${process.env.PORT || '3000'}`)
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://itwhip.com');
    const url = `${baseUrl}/api/rentals/search?${params.toString()}`;
    console.log('[SEARCH-BRIDGE DEBUG] Query:', JSON.stringify(query));
    console.log('[SEARCH-BRIDGE DEBUG] URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[ai-booking] Search failed:', response.status);
      return [];
    }

    const data = await response.json();
    const results = normalizeSearchResults(data);

    // Apply vehicle preferences sorting if provided
    if (preferences) {
      return sortByPreferences(results, preferences);
    }

    return results;
  } catch (error) {
    console.error('[ai-booking] Search error:', error);
    return [];
  }
}

// =============================================================================
// QUERY BUILDER
// =============================================================================

function buildSearchParams(query: SearchQuery): URLSearchParams {
  const params = new URLSearchParams();

  // Handle statewide searches: "Arizona", "AZ", "anywhere", "everywhere", etc.
  // These should NOT use exact city match - instead use central Phoenix coordinates for radius search
  const location = query.location || 'Phoenix, AZ';
  const locationLower = location.toLowerCase().trim();

  // Extract city part (before comma) for statewide detection
  const cityPart = locationLower.split(',')[0].trim();
  const isStatewideSearch = /^(arizona|az|anywhere|everywhere|all\s*(of\s*)?arizona|statewide)$/i.test(cityPart);

  if (isStatewideSearch) {
    // Statewide search: use location param with Phoenix center and large radius
    params.set('location', 'Phoenix, AZ');
    params.set('radius', '150'); // 150 miles covers most of Arizona metro areas
    console.log('[SEARCH-BRIDGE DEBUG] Statewide search detected, using 150mi radius');
  } else {
    // Specific city: use exact city match so "Phoenix" only returns Phoenix cars
    const cityName = extractCityName(location);
    params.set('city', cityName);
    console.log(`[SEARCH-BRIDGE DEBUG] City search: exact match for "${cityName}"`);
  }

  if (query.carType) params.set('carType', query.carType);

  // Default dates to tomorrow + 3 days if not provided (required by search API)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const threeDaysLater = new Date(tomorrow);
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  const defaultPickup = tomorrow.toISOString().split('T')[0];
  const defaultReturn = threeDaysLater.toISOString().split('T')[0];

  params.set('pickupDate', query.pickupDate || defaultPickup);
  params.set('returnDate', query.returnDate || defaultReturn);
  params.set('pickupTime', query.pickupTime || '10:00');
  params.set('returnTime', query.returnTime || '10:00');

  if (query.make) params.set('make', query.make);
  if (query.priceMin) params.set('priceMin', String(query.priceMin));
  if (query.priceMax) params.set('priceMax', String(query.priceMax));
  if (query.seats) params.set('seats', String(query.seats));
  if (query.transmission) params.set('transmission', query.transmission);
  if (query.noDeposit) params.set('noDeposit', 'true');
  if (query.instantBook) params.set('instantBook', 'true');
  if (query.vehicleType) params.set('vehicleType', query.vehicleType);

  return params;
}

// =============================================================================
// RESULT NORMALIZATION
// =============================================================================

interface RawSearchResult {
  carsInCity?: RawCarResult[];
  nearbyCars?: RawCarResult[];
  results?: RawCarResult[];
}

interface RawCarResult {
  id: string;
  make: string;
  model: string;
  year: number;
  dailyRate?: number;
  pricing?: { dailyRate?: number };
  photos?: Array<string | { url: string; alt?: string }>;
  mainPhoto?: string;
  rating?: number | { average?: number; count?: number };
  averageRating?: number;
  reviewCount?: number;
  totalReviews?: number;
  distance?: string | number;
  city?: string;
  location?: string | { city?: string; distanceText?: string };
  instantBook?: boolean;
  vehicleType?: 'RENTAL' | 'RIDESHARE' | null;
  seats?: number;
  transmission?: string;
  // Deposit from search API (calculated using getActualDeposit)
  depositAmount?: number;
  requirements?: { deposit?: number };
  // Trips count
  trips?: number;
  totalTrips?: number;
}

/**
 * Fallback deposit calculation - matches booking-pricing.ts getCarClassAndDefaultDeposit
 * Used when search API doesn't return depositAmount
 */
function getDefaultDeposit(dailyRate: number): number {
  if (dailyRate < 150) return 250    // Economy
  if (dailyRate < 500) return 700    // Luxury
  return 1000                         // Exotic
}

/** Normalize search API response into VehicleSummary array */
function normalizeSearchResults(data: RawSearchResult): VehicleSummary[] {
  // Combine carsInCity and nearbyCars for comprehensive results
  // This ensures statewide searches include all matching cars
  const allCars = [
    ...(data.carsInCity || []),
    ...(data.nearbyCars || []),
  ];

  // Fall back to flat results if grouped data isn't available
  const carsToProcess = allCars.length > 0 ? allCars : (data.results || []);

  // Deduplicate by ID
  const seen = new Set<string>();
  const unique = carsToProcess.filter((car) => {
    if (seen.has(car.id)) return false;
    seen.add(car.id);
    return true;
  });

  // Normalize, sort by rating (highest first), then cap at 20
  const normalized = unique.map(normalizeCarResult);
  normalized.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  return normalized.slice(0, 20);
}

function normalizeCarResult(car: RawCarResult): VehicleSummary {
  const dailyRate = car.dailyRate || car.pricing?.dailyRate || 0;

  // Extract all photos as string URLs (for carousel)
  const photos: string[] = (car.photos || [])
    .map((p) => (typeof p === 'string' ? p : p?.url))
    .filter((url): url is string => Boolean(url));

  // Add mainPhoto if not already included
  if (car.mainPhoto && !photos.includes(car.mainPhoto)) {
    photos.unshift(car.mainPhoto);
  }

  // First photo for backwards compatibility
  const photo = photos[0] || null;

  // Rating can be number or object with average
  const rawRating = car.rating;
  const rating = typeof rawRating === 'number'
    ? rawRating
    : typeof rawRating === 'object' && rawRating?.average
      ? rawRating.average
      : car.averageRating || null;

  const reviewCount = typeof car.rating === 'object' && car.rating?.count
    ? car.rating.count
    : car.reviewCount || car.totalReviews || 0;

  // Location can be string or object with city/distanceText
  const rawLocation = car.location;
  const locationStr = typeof rawLocation === 'string'
    ? rawLocation
    : typeof rawLocation === 'object' && rawLocation?.city
      ? rawLocation.city
      : car.city || '';

  const distance = typeof rawLocation === 'object' && rawLocation?.distanceText
    ? rawLocation.distanceText
    : typeof car.distance === 'number'
      ? `${Math.round(car.distance)} mi`
      : car.distance || null;

  // Use actual deposit from search API, fallback to rate-based calculation
  const depositAmount = car.depositAmount ?? car.requirements?.deposit ?? getDefaultDeposit(dailyRate);

  // Trips count from search API
  const trips = car.trips || car.totalTrips || 0;

  return {
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    dailyRate,
    photo,
    photos,
    rating,
    reviewCount,
    trips,
    distance,
    location: locationStr,
    instantBook: car.instantBook || false,
    vehicleType: car.vehicleType || null,
    seats: car.seats || null,
    transmission: car.transmission || null,
    depositAmount,
  };
}
