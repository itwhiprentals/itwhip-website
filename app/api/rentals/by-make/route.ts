// app/api/rentals/by-make/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6') // cars per make

    // Get all active cars grouped by make
    const cars = await prisma.rentalCar.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        carType: true,
        dailyRate: true,
        city: true,
        rating: true,
        totalTrips: true,
        instantBook: true,
        fuelType: true,
        esgScore: true,
        photos: {
          select: { url: true },
          orderBy: { order: 'asc' },
          take: 1
        },
        host: {
          select: {
            name: true,
            profilePhoto: true
          }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { totalTrips: 'desc' }
      ]
    })

    // Group cars by make
    const carsByMake: Record<string, typeof cars> = {}

    for (const car of cars) {
      const make = car.make
      if (!carsByMake[make]) {
        carsByMake[make] = []
      }
      // Only add up to limit cars per make
      if (carsByMake[make].length < limit) {
        carsByMake[make].push(car)
      }
    }

    // Transform to array format with make info
    const makeSlugMap: Record<string, string> = {
      'BMW': 'bmw',
      'Mercedes-Benz': 'mercedes',
      'Porsche': 'porsche',
      'Bentley': 'bentley',
      'Tesla': 'tesla',
      'Lamborghini': 'lamborghini',
      'Ferrari': 'ferrari',
      'Land Rover': 'land-rover',
      'Cadillac': 'cadillac',
      'Dodge': 'dodge',
      'Lexus': 'lexus',
      'Audi': 'audi',
      'Toyota': 'toyota',
      'Chevrolet': 'chevrolet',
      'Jeep': 'jeep',
      'McLaren': 'mclaren',
      'Mclaren': 'mclaren',
      'Rivian': 'rivian',
      'Infiniti': 'infiniti',
      'MINI': 'mini',
      'Corvette': 'corvette'
    }

    // Sort makes by car count (descending)
    const sortedMakes = Object.entries(carsByMake)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([make, makeCars]) => ({
        make,
        slug: makeSlugMap[make] || make.toLowerCase().replace(/\s+/g, '-'),
        totalCars: cars.filter(c => c.make === make).length, // actual total
        cars: makeCars.map(car => ({
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          dailyRate: Number(car.dailyRate),
          carType: car.carType,
          city: car.city,
          rating: car.rating ? Number(car.rating) : null,
          totalTrips: car.totalTrips,
          instantBook: car.instantBook,
          photos: car.photos || [],
          host: car.host ? {
            name: car.host.name,
            profilePhoto: car.host.profilePhoto
          } : null
        }))
      }))

    return NextResponse.json({
      success: true,
      makes: sortedMakes,
      totalMakes: sortedMakes.length,
      totalCars: cars.length
    })

  } catch (error) {
    console.error('By-make API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cars by make',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
