// app/(guest)/rentals/lib/p2p-inventory.ts

import prisma from '@/app/lib/database/prisma'

// Types
export interface P2PCar {
  id: string
  make: string
  model: string
  year: number
  type: 'SEDAN' | 'SUV' | 'TRUCK' | 'VAN' | 'LUXURY' | 'SPORTS' | 'CONVERTIBLE'
  transmission: 'AUTOMATIC' | 'MANUAL'
  seats: number
  mpg: number
  features: string[]
  description: string
  dailyRate: number
  weeklyRate?: number
  monthlyRate?: number
  instantBook: boolean
  address: string
  city: string
  state: string
  zip: string
  latitude: number
  longitude: number
  airportPickup: boolean
  deliveryAvailable: boolean
  deliveryFee?: number
  minRentalDays: number
  maxRentalDays?: number
  advanceNotice: number // hours
  cancellationPolicy: 'FLEXIBLE' | 'MODERATE' | 'STRICT'
  requirements: {
    minAge: number
    license: string
    deposit: number
  }
  host: {
    id: string
    name: string
    avatar?: string
    verified: boolean
    responseRate: number
    responseTime: string
    memberSince: Date
    totalTrips: number
    rating: number
  }
  photos: Array<{
    id: string
    url: string
    alt?: string
    order: number
  }>
  rating: number
  reviews: number
  trips: number
  isActive: boolean
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

export interface P2PAvailability {
  carId: string
  date: Date
  available: boolean
  price?: number // Override price for specific dates
  minimumDays?: number
}

export interface P2PBooking {
  id: string
  carId: string
  renterId: string
  startDate: Date
  endDate: Date
  startTime: string
  endTime: string
  pickupLocation: string
  dropoffLocation: string
  totalPrice: number
  serviceFee: number
  hostEarnings: number
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED'
  cancellationReason?: string
  specialRequests?: string
  insuranceType: 'BASIC' | 'PREMIUM' | 'NONE'
  extras: string[]
  createdAt: Date
  updatedAt: Date
}

// Get all P2P cars with filtering
export async function getP2PCars(filters?: {
  location?: string
  startDate?: Date
  endDate?: Date
  type?: string
  transmission?: string
  seats?: number
  instantBook?: boolean
  priceMin?: number
  priceMax?: number
  features?: string[]
  limit?: number
  offset?: number
  sortBy?: 'price' | 'rating' | 'distance' | 'trips'
  sortOrder?: 'asc' | 'desc'
}) {
  const where: any = {
    isActive: true
  }

  // Apply filters
  if (filters?.location) {
    where.OR = [
      { city: { contains: filters.location, mode: 'insensitive' } },
      { address: { contains: filters.location, mode: 'insensitive' } },
      { zip: filters.location }
    ]
  }

  if (filters?.type) {
    where.type = filters.type
  }

  if (filters?.transmission) {
    where.transmission = filters.transmission
  }

  if (filters?.seats) {
    where.seats = { gte: filters.seats }
  }

  if (filters?.instantBook !== undefined) {
    where.instantBook = filters.instantBook
  }

  if (filters?.priceMin || filters?.priceMax) {
    where.dailyRate = {}
    if (filters.priceMin) where.dailyRate.gte = filters.priceMin
    if (filters.priceMax) where.dailyRate.lte = filters.priceMax
  }

  if (filters?.features && filters.features.length > 0) {
    where.features = {
      hasEvery: filters.features
    }
  }

  // Check availability for date range
  if (filters?.startDate && filters?.endDate) {
    where.bookings = {
      none: {
        OR: [
          {
            startDate: { lte: filters.endDate },
            endDate: { gte: filters.startDate }
          }
        ],
        status: {
          notIn: ['CANCELLED']
        }
      }
    }
  }

  // Determine sort order
  let orderBy: any = {}
  const order = filters?.sortOrder || 'asc'
  
  switch (filters?.sortBy) {
    case 'price':
      orderBy = { dailyRate: order }
      break
    case 'rating':
      orderBy = { rating: order === 'asc' ? 'asc' : 'desc' }
      break
    case 'trips':
      orderBy = { totalTrips: order === 'asc' ? 'asc' : 'desc' }
      break
    default:
      orderBy = { featured: 'desc' }
  }

  const cars = await prisma.rentalCar.findMany({
    where,
    include: {
      host: true,
      photos: {
        orderBy: { order: 'asc' }
      },
      reviews: {
        select: { rating: true }
      },
      _count: {
        select: {
          bookings: true,
          reviews: true
        }
      }
    },
    orderBy,
    take: filters?.limit || 20,
    skip: filters?.offset || 0
  })

  return cars.map(car => transformCarData(car))
}

// Get a single car by ID with full details
export async function getCarById(carId: string): Promise<P2PCar | null> {
  const car = await prisma.rentalCar.findUnique({
    where: { id: carId },
    include: {
      host: true,
      photos: {
        orderBy: { order: 'asc' }
      },
      reviews: {
        include: {
          booking: {
            select: {
              renter: {
                select: {
                  name: true,
                  avatar: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      bookings: {
        where: {
          status: { notIn: ['CANCELLED'] },
          endDate: { gte: new Date() }
        },
        select: {
          startDate: true,
          endDate: true
        }
      },
      _count: {
        select: {
          bookings: true,
          reviews: true
        }
      }
    }
  })

  if (!car) return null

  return transformCarData(car)
}

// Check availability for a specific car
export async function checkCarAvailability(
  carId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  available: boolean
  conflicts?: Array<{ startDate: Date; endDate: Date }>
  alternativeDates?: Array<{ startDate: Date; endDate: Date }>
}> {
  const bookings = await prisma.rentalBooking.findMany({
    where: {
      carId,
      OR: [
        {
          startDate: { lte: endDate },
          endDate: { gte: startDate }
        }
      ],
      status: {
        notIn: ['CANCELLED']
      }
    },
    select: {
      startDate: true,
      endDate: true
    },
    orderBy: {
      startDate: 'asc'
    }
  })

  const available = bookings.length === 0

  if (!available) {
    // Find alternative dates
    const alternativeDates = await findAlternativeDates(carId, startDate, endDate)
    
    return {
      available,
      conflicts: bookings,
      alternativeDates
    }
  }

  return { available }
}

// Create a P2P car booking
export async function createP2PBooking(data: {
  carId: string
  renterId: string
  startDate: Date
  endDate: Date
  startTime: string
  endTime: string
  pickupLocation?: string
  dropoffLocation?: string
  specialRequests?: string
  insuranceType?: 'BASIC' | 'PREMIUM' | 'NONE'
  extras?: string[]
}) {
  // Get car details
  const car = await prisma.rentalCar.findUnique({
    where: { id: data.carId },
    include: { host: true }
  })

  if (!car) {
    throw new Error('Car not found')
  }

  // Check availability
  const availability = await checkCarAvailability(
    data.carId,
    data.startDate,
    data.endDate
  )

  if (!availability.available) {
    throw new Error('Car is not available for selected dates')
  }

  // Calculate pricing
  const days = Math.ceil(
    (data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  let rate = car.dailyRate
  if (days >= 30 && car.monthlyRate) {
    rate = car.monthlyRate / 30
  } else if (days >= 7 && car.weeklyRate) {
    rate = car.weeklyRate / 7
  }

  const subtotal = rate * days
  const serviceFee = subtotal * 0.15 // 15% platform fee
  const totalPrice = subtotal + serviceFee
  const hostEarnings = subtotal * 0.85 // Host gets 85%

  // Create the booking
  const booking = await prisma.rentalBooking.create({
    data: {
      car: { connect: { id: data.carId } },
      renter: { connect: { id: data.renterId } },
      startDate: data.startDate,
      endDate: data.endDate,
      startTime: data.startTime,
      endTime: data.endTime,
      pickupLocation: data.pickupLocation || car.address,
      totalPrice,
      serviceFee,
      hostEarnings,
      status: car.instantBook ? 'CONFIRMED' : 'PENDING',
      paymentStatus: 'PENDING',
      specialRequests: data.specialRequests,
      insuranceType: data.insuranceType || 'BASIC',
      extras: data.extras?.join(',') || null
    } as any,
    include: {
      car: {
        include: {
          host: true,
          photos: { take: 1 }
        }
      },
      renter: true
    }
  })

  // Send notifications
  await sendBookingNotifications(booking)

  return booking
}

// Update car availability
export async function updateCarAvailability(
  carId: string,
  dates: Array<{ date: Date; available: boolean; price?: number }>
) {
  const updates = dates.map(({ date, available, price }) =>
    prisma.rentalAvailability.upsert({
      where: {
        carId_date: {
          carId,
          date
        }
      },
      update: {
        isAvailable: available,
        customPrice: price
      },
      create: {
        id: crypto.randomUUID(),
        carId,
        date,
        isAvailable: available,
        customPrice: price
      }
    })
  )

  return Promise.all(updates)
}

// Get host's cars
export async function getHostCars(hostId: string) {
  const cars = await prisma.rentalCar.findMany({
    where: { hostId },
    include: {
      photos: {
        orderBy: { order: 'asc' },
        take: 1
      },
      _count: {
        select: {
          bookings: true,
          reviews: true
        }
      },
      bookings: {
        where: {
          status: 'ACTIVE',
          startDate: { lte: new Date() },
          endDate: { gte: new Date() }
        },
        select: {
          id: true,
          renter: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return cars
}

// Get host earnings
export async function getHostEarnings(hostId: string, period?: {
  startDate: Date
  endDate: Date
}) {
  const where: any = {
    car: { hostId },
    status: 'COMPLETED',
    paymentStatus: 'PAID'
  }

  if (period) {
    where.completedAt = {
      gte: period.startDate,
      lte: period.endDate
    }
  }

  const bookings = await prisma.rentalBooking.aggregate({
    where,
    _sum: {
      totalAmount: true
    },
    _count: true
  })

  const pendingPayouts = await prisma.rentalBooking.aggregate({
    where: {
      car: { hostId },
      status: 'COMPLETED',
      paymentStatus: 'PAID'
    },
    _sum: {
      totalAmount: true
    }
  })

  return {
    totalEarnings: bookings._sum?.totalAmount ?? 0,
    totalBookings: bookings._count,
    pendingPayout: pendingPayouts._sum?.totalAmount ?? 0
  }
}

// Helper function to transform database car to P2PCar type
function transformCarData(car: any): P2PCar {
  const avgRating = car.reviews?.length > 0
    ? car.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / car.reviews.length
    : 5.0

  return {
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    type: car.type,
    transmission: car.transmission,
    seats: car.seats,
    mpg: car.mpg,
    features: car.features || [],
    description: car.description,
    dailyRate: car.dailyRate,
    weeklyRate: car.weeklyRate,
    monthlyRate: car.monthlyRate,
    instantBook: car.instantBook,
    address: car.address,
    city: car.city,
    state: car.state,
    zip: car.zip,
    latitude: car.latitude,
    longitude: car.longitude,
    airportPickup: car.airportPickup,
    deliveryAvailable: car.deliveryAvailable,
    deliveryFee: car.deliveryFee,
    minRentalDays: car.minRentalDays,
    maxRentalDays: car.maxRentalDays,
    advanceNotice: car.advanceNotice,
    cancellationPolicy: car.cancellationPolicy,
    requirements: car.requirements || {
      minAge: 21,
      license: '2+ years',
      deposit: 500
    },
    host: {
      id: car.host.id,
      name: car.host.name,
      avatar: car.host.avatar,
      verified: car.host.verified,
      responseRate: car.host.responseRate || 95,
      responseTime: car.host.responseTime || '1 hour',
      memberSince: car.host.createdAt,
      totalTrips: car._count?.bookings || 0,
      rating: car.host.rating || 0
    },
    photos: car.photos || [],
    rating: avgRating,
    reviews: car._count?.reviews || 0,
    trips: car._count?.bookings || 0,
    isActive: car.isActive,
    featured: car.featured,
    createdAt: car.createdAt,
    updatedAt: car.updatedAt
  }
}

// Helper function to find alternative dates
async function findAlternativeDates(
  carId: string,
  requestedStart: Date,
  requestedEnd: Date
): Promise<Array<{ startDate: Date; endDate: Date }>> {
  const duration = Math.ceil(
    (requestedEnd.getTime() - requestedStart.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Look for availability 30 days before and after
  const searchStart = new Date(requestedStart)
  searchStart.setDate(searchStart.getDate() - 30)
  
  const searchEnd = new Date(requestedEnd)
  searchEnd.setDate(searchEnd.getDate() + 30)

  const bookings = await prisma.rentalBooking.findMany({
    where: {
      carId,
      startDate: { gte: searchStart },
      endDate: { lte: searchEnd },
      status: { notIn: ['CANCELLED'] }
    },
    orderBy: { startDate: 'asc' }
  })

  const alternatives: Array<{ startDate: Date; endDate: Date }> = []
  
  // Find gaps between bookings
  for (let i = 0; i < bookings.length - 1; i++) {
    const gap = Math.ceil(
      (bookings[i + 1].startDate.getTime() - bookings[i].endDate.getTime()) / 
      (1000 * 60 * 60 * 24)
    )
    
    if (gap >= duration) {
      alternatives.push({
        startDate: new Date(bookings[i].endDate.getTime() + 86400000),
        endDate: new Date(
          bookings[i].endDate.getTime() + (duration * 86400000)
        )
      })
    }
  }

  return alternatives.slice(0, 3) // Return top 3 alternatives
}

// Helper function to send booking notifications
async function sendBookingNotifications(booking: any) {
  // This would integrate with your notification service
  // For now, just log
  console.log('Sending booking notifications for:', booking.id)
  
  // Email to host
  // Email to renter
  // SMS if enabled
  // Push notifications
}