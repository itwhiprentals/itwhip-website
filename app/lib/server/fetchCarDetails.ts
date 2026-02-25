// app/lib/server/fetchCarDetails.ts
// Direct Prisma query for car details — used by the SSR page component
// to avoid self-fetching (localhost → localhost deadlock in dev)

import prisma from '@/app/lib/database/prisma'
import { HOST_CARD_SELECT } from '@/app/lib/database/host-select'

/**
 * Fetch car details directly from the database for SSR use.
 * Returns the same shape as GET /api/rentals/cars/[carId] but without
 * the HTTP round-trip (which deadlocks in dev mode).
 */
export async function getCarForSSR(carId: string) {
  // Handle Amadeus mock data
  if (carId.startsWith('amadeus-')) {
    return {
      id: carId,
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
      carType: 'sedan',
      transmission: 'automatic',
      fuelType: 'gasoline',
      seats: 5,
      dailyRate: 65,
      deliveryFee: 0,
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85034',
      rating: 0,
      totalTrips: 0,
      instantBook: true,
      photos: [{ url: 'https://via.placeholder.com/600x400?text=Toyota+Camry', caption: 'Toyota Camry' }],
      host: { id: '', name: 'Enterprise', profilePhoto: null },
      reviews: [],
      location: null,
      hostId: '',
      isBookable: true,
    }
  }

  const car = await prisma.rentalCar.findUnique({
    where: { id: carId },
    select: {
      id: true,
      isActive: true,
      make: true,
      model: true,
      year: true,
      carType: true,
      transmission: true,
      fuelType: true,
      seats: true,
      dailyRate: true,
      deliveryFee: true,
      city: true,
      state: true,
      zipCode: true,
      rating: true,
      totalTrips: true,
      instantBook: true,
      latitude: true,
      longitude: true,
      hostId: true,
      host: {
        select: {
          ...HOST_CARD_SELECT,
          id: true,
          approvalStatus: true,
          active: true,
        }
      },
      photos: {
        select: { url: true, caption: true },
        orderBy: { order: 'asc' as const },
        take: 5,
      },
      reviews: {
        where: { isVisible: true },
        select: {
          rating: true,
          comment: true,
          createdAt: true,
          reviewerProfile: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' as const },
        take: 5,
      },
    }
  })

  if (!car) return null

  // Calculate average rating from reviews only — ignore DB default (5.0)
  let averageRating = 0
  if (car.reviews.length > 0) {
    const total = car.reviews.reduce((sum, r) => sum + r.rating, 0)
    averageRating = total / car.reviews.length
  }

  // Determine if bookable
  const hostStatus = car.host?.approvalStatus || 'APPROVED'
  const isBookable = hostStatus === 'APPROVED' && car.host?.active !== false && car.isActive !== false

  return {
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    carType: car.carType,
    transmission: car.transmission,
    fuelType: car.fuelType,
    seats: car.seats,
    dailyRate: car.dailyRate,
    deliveryFee: car.deliveryFee,
    city: car.city,
    state: car.state,
    zipCode: car.zipCode,
    rating: parseFloat(averageRating.toFixed(1)),
    totalTrips: car.totalTrips || 0,
    instantBook: car.instantBook,
    photos: car.photos,
    host: car.host ? {
      id: car.host.id,
      name: car.host.name,
      profilePhoto: car.host.profilePhoto,
      isBusinessHost: car.host.isBusinessHost,
      partnerCompanyName: car.host.partnerCompanyName,
      partnerLogo: car.host.partnerLogo,
      partnerSlug: car.host.partnerSlug,
      hostType: car.host.hostType,
    } : null,
    hostId: car.hostId,
    reviews: car.reviews,
    location: car.latitude && car.longitude ? { lat: car.latitude, lng: car.longitude } : null,
    isBookable,
  }
}
