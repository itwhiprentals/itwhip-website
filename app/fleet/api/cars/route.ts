// app/sys-2847/fleet/api/cars/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// GET - Fetch all cars
export async function GET(request: NextRequest) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const cars = await prisma.rentalCar.findMany({
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            responseTime: true,
            responseRate: true
          }
        },
        photos: {
          orderBy: { order: 'asc' }
        },
        bookings: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED', 'ACTIVE']
            },
            startDate: {
              lte: today
            },
            endDate: {
              gte: today
            }
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform data to match our types with computed status
    const transformedCars = cars.map(car => {
      // Check if car has active booking today
      const hasActiveBookingToday = car.bookings && car.bookings.length > 0
      
      // Determine status based on bookings and active state
      let status = 'AVAILABLE'
      if (!car.isActive) {
        status = 'UNLISTED'
      } else if (hasActiveBookingToday) {
        status = 'BOOKED'
      }
      // You could add MAINTENANCE status based on a maintenance field or blocked dates
      
      return {
        ...car,
        status,
        category: car.carType || 'LUXURY',
        badges: [],
        hasActiveBookingToday,
        activeBookingsCount: car.bookings?.length || 0
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedCars
    })
  } catch (error) {
    console.error('Error fetching cars:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cars' },
      { status: 500 }
    )
  }
}

// POST - Create new car
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Create the car
    const car = await prisma.rentalCar.create({
      data: {
        hostId: body.hostId,
        source: 'p2p',
        make: body.make,
        model: body.model,
        year: body.year,
        color: body.color,
        vin: body.vin,
        licensePlate: body.licensePlate,
        carType: body.carType || body.category,
        seats: body.seats || 4,
        doors: body.doors || 4,
        transmission: body.transmission,
        fuelType: body.fuelType,
        mpgCity: body.mpgCity,
        mpgHighway: body.mpgHighway,
        currentMileage: body.currentMileage,
        dailyRate: body.dailyRate,
        weeklyRate: body.weeklyRate || body.dailyRate * 6.3,
        monthlyRate: body.monthlyRate || body.dailyRate * 24,
        weeklyDiscount: body.weeklyDiscount || 10,
        monthlyDiscount: body.monthlyDiscount || 20,
        deliveryFee: body.deliveryFee || 150,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        latitude: body.latitude,
        longitude: body.longitude,
        features: body.features,
        rules: body.rules,
        insuranceIncluded: body.insuranceIncluded || false,
        insuranceDaily: body.insuranceDaily || 99,
        minTripDuration: body.minTripDuration || 1,
        maxTripDuration: body.maxTripDuration || 30,
        advanceNotice: body.advanceNotice || 24,
        airportPickup: body.airportPickup || true,
        hotelDelivery: body.hotelDelivery || true,
        homeDelivery: body.homeDelivery || true,
        isActive: body.isActive !== false,
        instantBook: body.instantBook !== false,
        totalTrips: 0,
        rating: 0
      }
    })

    // Add photos if provided
    if (body.photos && body.photos.length > 0) {
      await prisma.rentalCarPhoto.createMany({
        data: body.photos.map((url: string, index: number) => ({
          carId: car.id,
          url,
          order: index,
          isHero: index === (body.heroPhotoIndex || 0)
        }))
      })
    }

    return NextResponse.json({
      success: true,
      data: car,
      message: 'Car created successfully'
    })
  } catch (error) {
    console.error('Error creating car:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create car' },
      { status: 500 }
    )
  }
}