// app/lib/server/fetchSimilarCars.ts
// Server-side data fetching for SimilarCars component SSR

import { prisma } from '@/app/lib/database/prisma'

// Type matching SimilarCars component expectations
export interface SimilarCarData {
  id: string
  make: string
  model: string
  year: number
  dailyRate: number
  carType?: string
  city: string
  state: string
  rating?: number | null
  totalTrips?: number
  instantBook?: boolean
  photos?: { url: string }[]
  seats?: number
  transmission?: string
  location?: {
    lat?: number
    lng?: number
    address?: string
  }
  hostId?: string
  host?: {
    name?: string
    profilePhoto?: string
    isVerified?: boolean
  }
}

/**
 * Fetch similar cars for a car detail page
 *
 * Strategy:
 * 1. Same city, same car type, exclude current car and host
 * 2. Order by rating/trips for quality
 * 3. Limit to 12 for variety
 */
export async function getSimilarCars(
  currentCarId: string,
  carType?: string | null,
  city?: string,
  excludeHostId?: string
): Promise<SimilarCarData[]> {
  try {
    const cars = await prisma.rentalCar.findMany({
      where: {
        isActive: true,
        id: { not: currentCarId },
        ...(excludeHostId && { hostId: { not: excludeHostId } }),
        ...(city && { city: { equals: city, mode: 'insensitive' } }),
        ...(carType && { carType: { equals: carType, mode: 'insensitive' } })
      },
      orderBy: [
        { rating: 'desc' },
        { totalTrips: 'desc' }
      ],
      take: 12,
      include: {
        host: {
          select: {
            name: true,
            profilePhoto: true,
            isVerified: true
          }
        },
        photos: {
          select: { url: true },
          orderBy: { order: 'asc' },
          take: 1
        }
      }
    })

    return cars.map(transformCar)
  } catch (error) {
    console.error('Error fetching similar cars:', error)
    return []
  }
}

/**
 * Fetch other cars from the same host
 *
 * Strategy:
 * 1. Same host, exclude current car
 * 2. Order by daily rate similarity (handled client-side)
 * 3. Limit to 10 for display
 */
export async function getHostCars(
  hostId: string,
  excludeCarId: string
): Promise<SimilarCarData[]> {
  if (!hostId) return []

  try {
    const cars = await prisma.rentalCar.findMany({
      where: {
        isActive: true,
        hostId: hostId,
        id: { not: excludeCarId }
      },
      orderBy: [
        { dailyRate: 'asc' }
      ],
      take: 10,
      include: {
        host: {
          select: {
            name: true,
            profilePhoto: true,
            isVerified: true
          }
        },
        photos: {
          select: { url: true },
          orderBy: { order: 'asc' },
          take: 1
        }
      }
    })

    return cars.map(transformCar)
  } catch (error) {
    console.error('Error fetching host cars:', error)
    return []
  }
}

/**
 * Fetch both similar cars and host cars in parallel
 * For use in [carId]/page.tsx server component
 */
export async function getRelatedCars(
  currentCarId: string,
  hostId: string | undefined,
  carType: string | undefined,
  city: string
): Promise<{
  similarCars: SimilarCarData[]
  hostCars: SimilarCarData[]
}> {
  const [similarCars, hostCars] = await Promise.all([
    getSimilarCars(currentCarId, carType, city, hostId),
    hostId ? getHostCars(hostId, currentCarId) : Promise.resolve([])
  ])

  return { similarCars, hostCars }
}

/**
 * Transform Prisma car to SimilarCarData shape
 */
function transformCar(car: any): SimilarCarData {
  return {
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    dailyRate: Number(car.dailyRate),
    carType: car.carType,
    city: car.city,
    state: car.state,
    rating: car.totalTrips > 0 ? car.rating : null,
    totalTrips: car.totalTrips || 0,
    instantBook: car.instantBook,
    photos: car.photos || [],
    seats: car.seats,
    transmission: car.transmission,
    location: car.location ? {
      lat: car.location.lat,
      lng: car.location.lng,
      address: car.location.address
    } : undefined,
    hostId: car.hostId,
    host: car.host ? {
      name: car.host.name,
      profilePhoto: car.host.profilePhoto,
      isVerified: car.host.isVerified
    } : undefined
  }
}
