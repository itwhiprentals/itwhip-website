// app/lib/ai-booking/search-bridge.ts
// Bridge to the existing rental search API
// Calls the search endpoint internally via HTTP

import { SearchQuery, VehicleSummary } from './types';

// =============================================================================
// SEARCH FOR VEHICLES
// =============================================================================

/** Search available vehicles using the existing rental search API */
export async function searchVehicles(
  query: SearchQuery
): Promise<VehicleSummary[]> {
  try {
    const params = buildSearchParams(query);
    // Always use production URL — avoids localhost self-call deadlock in dev
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://itwhip.com';
    const url = `${baseUrl}/api/rentals/search?${params.toString()}`;

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
    return normalizeSearchResults(data);
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

  // Default location to Phoenix if not specified
  params.set('location', query.location || 'Phoenix, AZ');

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
  rating?: number;
  averageRating?: number;
  reviewCount?: number;
  totalReviews?: number;
  distance?: string | number;
  city?: string;
  location?: string;
  instantBook?: boolean;
  seats?: number;
  transmission?: string;
}

/** Normalize search API response into VehicleSummary array */
function normalizeSearchResults(data: RawSearchResult): VehicleSummary[] {
  // Combine city + nearby results, city first
  const allCars = [
    ...(data.carsInCity || []),
    ...(data.nearbyCars || []),
    ...(data.results || []),
  ];

  // Deduplicate by ID
  const seen = new Set<string>();
  const unique = allCars.filter((car) => {
    if (seen.has(car.id)) return false;
    seen.add(car.id);
    return true;
  });

  // Take top 6 results for AI display
  return unique.slice(0, 6).map(normalizeCarResult);
}

function normalizeCarResult(car: RawCarResult): VehicleSummary {
  const dailyRate = car.dailyRate || car.pricing?.dailyRate || 0;

  // Photos from API are [{url, alt}] objects
  const firstPhoto = car.photos?.[0];
  const photo = typeof firstPhoto === 'string'
    ? firstPhoto
    : typeof firstPhoto === 'object' && firstPhoto?.url
      ? firstPhoto.url
      : car.mainPhoto || null;

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

  return {
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    dailyRate,
    photo,
    rating,
    reviewCount,
    distance,
    location: locationStr,
    instantBook: car.instantBook || false,
    seats: car.seats || null,
    transmission: car.transmission || null,
  };
}
