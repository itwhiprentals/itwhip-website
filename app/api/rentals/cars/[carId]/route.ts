// app/api/rentals/cars/[carId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ carId: string }> }
) {
  try {
    const { carId } = await params // Await params for Next.js 15

    // Check if it's a mock Amadeus car
    if (carId.startsWith('amadeus-')) {
      // Return mock Amadeus data
      return NextResponse.json({
        id: carId,
        provider: 'Enterprise',
        make: 'Toyota',
        model: 'Camry',
        year: 2024,
        type: 'SEDAN',
        transmission: 'AUTOMATIC',
        seats: 5,
        dailyRate: 65,
        features: ['Bluetooth', 'Backup Camera'],
        photos: [{
          url: 'https://via.placeholder.com/600x400?text=Toyota+Camry',
          caption: 'Toyota Camry'
        }],
        location: {
          address: 'Phoenix Sky Harbor Airport',
          city: 'Phoenix',
          state: 'AZ'
        },
        city: 'Phoenix',
        state: 'AZ',
        provider_type: 'traditional'
      })
    }

    // Fetch from database
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
                    name: true
                  }
                }
              }
            }
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

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(car)
  } catch (error) {
    console.error('Error fetching car:', error)
    return NextResponse.json(
      { error: 'Failed to fetch car details' },
      { status: 500 }
    )
  }
}