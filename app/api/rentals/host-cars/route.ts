// app/api/rentals/host-cars/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const hostId = searchParams.get('hostId')
    const excludeCarId = searchParams.get('exclude')
    
    if (!hostId) {
      return NextResponse.json(
        { error: 'Host ID is required' },
        { status: 400 }
      )
    }
    
    console.log('Fetching cars for host:', hostId, 'excluding:', excludeCarId)
    
    // Fetch all active cars from this host, excluding the current car
    const hostCars = await prisma.rentalCar.findMany({
      where: {
        hostId: hostId,
        isActive: true,
        id: {
          not: excludeCarId || undefined
        }
      },
      include: {
        photos: {
          orderBy: {
            order: 'asc'
          },
          take: 5 // Limit photos per car for performance
        },
        host: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            rating: true,
            responseTime: true,
            isVerified: true,
            totalTrips: true,
            city: true,
            state: true
          }
        }
      },
      orderBy: {
        dailyRate: 'asc' // Sort by price, cheapest first
      },
      take: 12 // Limit to 12 cars max for performance
    })
    
    console.log(`Found ${hostCars.length} cars for host ${hostId}`)
    
    // Format the response to match SimilarCar interface
    const formattedCars = hostCars.map(car => ({
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      carType: car.carType,
      dailyRate: typeof car.dailyRate === 'string' 
        ? parseFloat(car.dailyRate) 
        : car.dailyRate.toNumber ? car.dailyRate.toNumber() 
        : Number(car.dailyRate),
      city: car.city,
      state: car.state,
      zipCode: car.zipCode,
      rating: typeof car.rating === 'string' 
        ? parseFloat(car.rating) 
        : car.rating?.toNumber ? car.rating.toNumber() 
        : Number(car.rating || 5),
      totalTrips: car.totalTrips || 0,
      instantBook: car.instantBook || false,
      photos: car.photos.map(photo => ({
        url: photo.url,
        isHero: photo.isHero || false,
        caption: photo.caption || ''
      })),
      host: car.host ? {
        id: car.host.id,
        name: car.host.name,
        profilePhoto: car.host.profilePhoto,
        rating: typeof car.host.rating === 'string' 
          ? parseFloat(car.host.rating) 
          : car.host.rating?.toNumber ? car.host.rating.toNumber() 
          : Number(car.host.rating || 5),
        responseTime: car.host.responseTime,
        isVerified: car.host.isVerified || false,
        totalTrips: car.host.totalTrips || 0,
        city: car.host.city,
        state: car.host.state
      } : null,
      seats: car.seats || 5,
      transmission: car.transmission || 'automatic',
      fuelType: car.fuelType || 'gas',
      features: car.features ? (
        typeof car.features === 'string' 
          ? (() => {
              try {
                const parsed = JSON.parse(car.features)
                return Array.isArray(parsed) ? parsed : []
              } catch {
                return car.features.split(',').map((f: string) => f.trim()).filter((f: string) => f.length > 0)
              }
            })()
          : Array.isArray(car.features) ? car.features : []
      ) : [],
      location: {
        lat: car.latitude,
        lng: car.longitude,
        address: car.address || `${car.city}, ${car.state}`
      },
      distance: null, // No distance for host's other cars
      // Additional fields that might be useful
      deliveryFee: typeof car.deliveryFee === 'string' 
        ? parseFloat(car.deliveryFee) 
        : car.deliveryFee?.toNumber ? car.deliveryFee.toNumber() 
        : Number(car.deliveryFee || 0),
      airportPickup: car.airportPickup || false,
      hotelDelivery: car.hotelDelivery || false,
      homeDelivery: car.homeDelivery || false,
      minTripDuration: car.minTripDuration || 1,
      maxTripDuration: car.maxTripDuration || 30
    }))
    
    // Return the formatted response
    return NextResponse.json({
      cars: formattedCars,
      count: formattedCars.length,
      hostInfo: hostCars.length > 0 && hostCars[0].host ? {
        id: hostCars[0].host.id,
        name: hostCars[0].host.name,
        totalCars: formattedCars.length + 1 // Plus the current car they're viewing
      } : null
    })
    
  } catch (error) {
    console.error('Error fetching host cars:', error)
    
    // More detailed error response for debugging
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch host cars',
          message: error.message,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch host cars' },
      { status: 500 }
    )
  }
}

// Optional: Add a POST endpoint to get multiple hosts' cars at once
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hostIds, excludeCarId, limit = 12 } = body
    
    if (!hostIds || !Array.isArray(hostIds) || hostIds.length === 0) {
      return NextResponse.json(
        { error: 'Host IDs array is required' },
        { status: 400 }
      )
    }
    
    // Fetch cars from multiple hosts
    const hostCars = await prisma.rentalCar.findMany({
      where: {
        hostId: {
          in: hostIds
        },
        isActive: true,
        id: {
          not: excludeCarId || undefined
        }
      },
      include: {
        photos: {
          orderBy: {
            order: 'asc'
          },
          take: 3
        },
        host: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            rating: true,
            isVerified: true
          }
        }
      },
      orderBy: {
        dailyRate: 'asc'
      },
      take: limit
    })
    
    // Group cars by host
    const carsByHost = hostCars.reduce((acc, car) => {
      const hostId = car.hostId
      if (!acc[hostId]) {
        acc[hostId] = []
      }
      acc[hostId].push(car)
      return acc
    }, {} as Record<string, typeof hostCars>)
    
    return NextResponse.json({
      carsByHost,
      totalCars: hostCars.length
    })
    
  } catch (error) {
    console.error('Error fetching multiple hosts cars:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cars from multiple hosts' },
      { status: 500 }
    )
  }
}