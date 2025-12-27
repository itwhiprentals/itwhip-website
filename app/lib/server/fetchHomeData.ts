// app/lib/server/fetchHomeData.ts
// Server-side data fetching for homepage SSR with SMART ROTATION

import { prisma } from '@/app/lib/database/prisma'

// Type for transformed car data matching client component expectations
export interface HomePageCar {
  id: string
  make: string
  model: string
  year: number
  dailyRate: number
  carType: string
  seats: number
  city: string
  rating: number | null
  totalTrips: number
  instantBook: boolean
  photos: { url: string }[]
  esgScore?: number | null
  fuelType?: string
  isNewListing?: boolean
  isPopular?: boolean
  host: {
    name: string
    profilePhoto: string | null
  } | null
}

// =============================================================================
// SMART ROTATION HELPERS
// =============================================================================

/**
 * Get hourly seed for deterministic rotation
 * Same seed for all users within the hour = cache-friendly
 * Changes every hour = fresh content
 */
function getHourlySeed(): number {
  return Math.floor(Date.now() / 3600000) // Milliseconds per hour
}

/**
 * Linear Congruential Generator (LCG) for deterministic pseudo-randomness
 * Returns a function that generates numbers between 0 and 1
 */
function createSeededRandom(seed: number): () => number {
  const a = 1664525
  const c = 1013904223
  const m = 2 ** 32
  let state = seed

  return () => {
    state = (a * state + c) % m
    return state / m
  }
}

/**
 * Fisher-Yates shuffle with seeded randomness
 * Deterministic: same seed = same shuffle order
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array]
  const random = createSeededRandom(seed)

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

/**
 * Apply diversity rules to car list:
 * - Max 2 cars per host
 * - Spread across different cities when possible
 */
function applyDiversityRules(cars: any[], maxPerHost: number = 2): any[] {
  const hostCounts = new Map<string, number>()
  const result: any[] = []

  for (const car of cars) {
    const hostId = car.hostId || car.host?.id || 'unknown'
    const currentCount = hostCounts.get(hostId) || 0

    if (currentCount < maxPerHost) {
      result.push(car)
      hostCounts.set(hostId, currentCount + 1)
    }
  }

  return result
}

/**
 * Fetch ESG (Eco Elite) cars for homepage with SMART ROTATION
 *
 * Strategy:
 * 1. Fetch larger pool (40 cars) of top ESG cars
 * 2. Apply diversity rules (max 2 per host)
 * 3. Shuffle with hourly time seed
 * 4. Return first 10 for display
 *
 * Result: Different 10 cars shown each hour, always premium quality
 */
export async function getESGCars(limit = 10, excludeIds: string[] = []): Promise<HomePageCar[]> {
  const poolSize = 40 // Fetch larger pool for rotation variety

  const cars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      state: 'AZ',
      ...(excludeIds.length > 0 && { id: { notIn: excludeIds } })
    },
    orderBy: {
      esgScore: 'desc'
    },
    take: poolSize,
    include: {
      host: {
        select: {
          id: true,
          name: true,
          profilePhoto: true
        }
      },
      photos: {
        select: {
          url: true
        },
        orderBy: {
          order: 'asc'
        },
        take: 5
      }
    }
  })

  // Apply diversity rules (max 2 per host)
  const diverseCars = applyDiversityRules(cars, 2)

  // Shuffle with hourly seed for rotation
  const seed = getHourlySeed()
  const shuffled = seededShuffle(diverseCars, seed)

  // Take requested limit and transform
  return shuffled.slice(0, limit).map(transformCar)
}

/**
 * Fetch P2P (City) cars for homepage with WEIGHTED ROTATION
 *
 * Strategy:
 * 1. Fetch larger pool (60 cars)
 * 2. Apply weights to boost visibility:
 *    - Recent listings (< 14 days): 3x weight
 *    - Low trips (0-2): 2x weight
 *    - Regular cars: 1x weight
 * 3. Weighted shuffle with hourly time seed
 * 4. Dedupe (exclude cars already in ESG section)
 * 5. Apply diversity rules
 * 6. Return first 10
 *
 * Result: New listings get fair exposure, variety every hour
 */
export async function getP2PCars(city?: string, limit = 10, excludeIds: string[] = []): Promise<HomePageCar[]> {
  const poolSize = 60 // Larger pool for weighted selection
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

  const cars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      ...(city
        ? { city: { equals: city, mode: 'insensitive' } }
        : { state: 'AZ' }
      ),
      ...(excludeIds.length > 0 && { id: { notIn: excludeIds } })
    },
    orderBy: [
      { createdAt: 'desc' }, // Prefer newer listings in initial fetch
      { rating: 'desc' },
      { totalTrips: 'desc' }
    ],
    take: poolSize,
    include: {
      host: {
        select: {
          id: true,
          name: true,
          profilePhoto: true
        }
      },
      photos: {
        select: {
          url: true
        },
        orderBy: {
          order: 'asc'
        },
        take: 5
      }
    }
  })

  // Calculate weights for each car
  const weightedCars = cars.map(car => {
    let weight = 1

    // Recent listing boost (< 14 days old)
    if (car.createdAt && car.createdAt > fourteenDaysAgo) {
      weight *= 3
    }

    // Low trips boost (new to platform, needs exposure)
    if ((car.totalTrips || 0) <= 2) {
      weight *= 2
    }

    // Popular cars slight boost
    if ((car.totalTrips || 0) >= 10) {
      weight *= 1.5
    }

    return { car, weight }
  })

  // Weighted shuffle using hourly seed
  const seed = getHourlySeed()
  const shuffled = weightedShuffle(weightedCars, seed)

  // Apply diversity rules (max 2 per host)
  const diverseCars = applyDiversityRules(shuffled, 2)

  // Take requested limit and transform
  return diverseCars.slice(0, limit).map(transformCar)
}

/**
 * Weighted shuffle - items with higher weights more likely to appear first
 * Uses reservoir sampling approach with weights
 */
function weightedShuffle(items: { car: any; weight: number }[], seed: number): any[] {
  const random = createSeededRandom(seed)

  // Assign random priority based on weight
  const withPriority = items.map(item => ({
    car: item.car,
    // Higher weight = higher average priority
    priority: Math.pow(random(), 1 / item.weight)
  }))

  // Sort by priority descending
  withPriority.sort((a, b) => b.priority - a.priority)

  return withPriority.map(item => item.car)
}

/**
 * Transform Prisma car to client-expected shape
 * Adds computed flags for UI badges
 */
function transformCar(car: any): HomePageCar {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  const trips = car.totalTrips || 0

  return {
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    dailyRate: Number(car.dailyRate),
    carType: car.carType,
    seats: car.seats,
    city: car.city || 'Phoenix',
    // Only use rating if car has real trips (avoids 5.0 default issue)
    rating: trips > 0 ? car.rating : null,
    totalTrips: trips,
    instantBook: car.instantBook,
    photos: car.photos || [],
    esgScore: car.esgScore,
    fuelType: car.fuelType,
    // New listing: created within last 14 days
    isNewListing: car.createdAt ? car.createdAt > fourteenDaysAgo : false,
    // Popular: 10+ completed trips
    isPopular: trips >= 10,
    host: car.host
      ? {
          name: car.host.name,
          profilePhoto: car.host.profilePhoto || null
        }
      : null
  }
}

/**
 * Fetch all homepage cars in parallel with deduplication
 * Returns both ESG and P2P sections with no overlap
 */
export async function getHomepageCars(city?: string): Promise<{
  esgCars: HomePageCar[]
  cityCars: HomePageCar[]
}> {
  // Fetch ESG cars first
  const esgCars = await getESGCars(10)

  // Get ESG car IDs for deduplication
  const esgCarIds = esgCars.map(car => car.id)

  // Fetch P2P cars excluding ESG cars
  const cityCars = await getP2PCars(city, 10, esgCarIds)

  return { esgCars, cityCars }
}
