// app/api/host/cars/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { headers } from 'next/headers'

// Helper to get host from headers
async function getHostFromHeaders() {
  const headersList = await headers()
  const hostId = headersList.get('x-host-id')
  const userId = headersList.get('x-user-id')
  
  if (!userId) {
    return null
  }
  
  const host = await prisma.rentalHost.findFirst({
    where: hostId ? { id: hostId } : { userId: userId }
  })
  
  return host
}

// GET - Fetch all cars for host
export async function GET(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if host has permission to view cars
    if (host.approvalStatus !== 'APPROVED' && host.approvalStatus !== 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Host not approved' },
        { status: 403 }
      )
    }
    
    // Fetch all cars for this host
    const cars = await prisma.rentalCar.findMany({
      where: {
        hostId: host.id
      },
      include: {
        photos: {
          orderBy: { order: 'asc' }
        },
        bookings: {
          where: {
            OR: [
              { status: 'CONFIRMED' },
              { status: 'ACTIVE' }
            ],
            startDate: { gte: new Date() }
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        },
        _count: {
          select: {
            bookings: {
              where: {
                status: 'COMPLETED'
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Format car data with calculated fields
    const formattedCars = cars.map(car => {
      // Find hero photo
      const heroPhoto = car.photos.find(p => p.isHero)?.url || car.photos[0]?.url || null
      
      // Calculate average rating
      const avgRating = car.reviews.length > 0
        ? car.reviews.reduce((sum, r) => sum + r.rating, 0) / car.reviews.length
        : car.rating
      
      // Count active and upcoming bookings
      const activeBookings = car.bookings.filter(b => b.status === 'ACTIVE').length
      const upcomingBookings = car.bookings.filter(b => b.status === 'CONFIRMED').length
      
      return {
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        trim: car.trim,
        color: car.color,
        licensePlate: car.licensePlate,
        
        // Specs
        carType: car.carType,
        seats: car.seats,
        transmission: car.transmission,
        fuelType: car.fuelType,
        
        // Pricing
        dailyRate: car.dailyRate,
        weeklyRate: car.weeklyRate,
        monthlyRate: car.monthlyRate,
        
        // Delivery
        airportPickup: car.airportPickup,
        hotelDelivery: car.hotelDelivery,
        homeDelivery: car.homeDelivery,
        
        // Location
        address: car.address,
        city: car.city,
        state: car.state,
        
        // Availability
        isActive: car.isActive,
        instantBook: car.instantBook,
        minTripDuration: car.minTripDuration,
        
        // Stats
        totalTrips: car._count.bookings,
        rating: avgRating,
        
        // Photos
        photos: car.photos.map(p => ({
          id: p.id,
          url: p.url,
          isHero: p.isHero
        })),
        heroPhoto: heroPhoto,
        
        // Booking status
        activeBookings: activeBookings,
        upcomingBookings: upcomingBookings
      }
    })
    
    return NextResponse.json({
      cars: formattedCars,
      total: formattedCars.length,
      active: formattedCars.filter(c => c.isActive).length,
      inactive: formattedCars.filter(c => !c.isActive).length
    })
    
  } catch (error) {
    console.error('Cars fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cars' },
      { status: 500 }
    )
  }
}

// POST - Add new car
export async function POST(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if host is approved
    if (host.approvalStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only approved hosts can add cars' },
        { status: 403 }
      )
    }
    
    // Check if host has permission to add cars
    if (!host.canEditCalendar) {
      return NextResponse.json(
        { error: 'You do not have permission to add cars' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'make', 'model', 'year', 'color', 'carType', 'seats', 
      'doors', 'transmission', 'fuelType', 'dailyRate',
      'address', 'city', 'state', 'zipCode'
    ]
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }
    
    // Apply host constraints
    if (host.minDailyRate && body.dailyRate < host.minDailyRate) {
      return NextResponse.json(
        { error: `Daily rate must be at least $${host.minDailyRate}` },
        { status: 400 }
      )
    }
    
    if (host.maxDailyRate && body.dailyRate > host.maxDailyRate) {
      return NextResponse.json(
        { error: `Daily rate cannot exceed $${host.maxDailyRate}` },
        { status: 400 }
      )
    }
    
    // Create the car
    const newCar = await prisma.rentalCar.create({
      data: {
        hostId: host.id,
        make: body.make,
        model: body.model,
        year: body.year,
        trim: body.trim,
        color: body.color,
        licensePlate: body.licensePlate,
        vin: body.vin,
        
        // Specifications
        carType: body.carType,
        seats: body.seats,
        doors: body.doors,
        transmission: body.transmission,
        fuelType: body.fuelType,
        mpgCity: body.mpgCity,
        mpgHighway: body.mpgHighway,
        currentMileage: body.currentMileage,
        
        // Pricing
        dailyRate: body.dailyRate,
        weeklyRate: body.weeklyRate || body.dailyRate * 6.5,
        monthlyRate: body.monthlyRate || body.dailyRate * 25,
        weeklyDiscount: body.weeklyDiscount || 0.15,
        monthlyDiscount: body.monthlyDiscount || 0.30,
        
        // Features (JSON)
        features: JSON.stringify(body.features || []),
        
        // Location
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        latitude: body.latitude,
        longitude: body.longitude,
        
        // Delivery options
        airportPickup: body.airportPickup || false,
        hotelDelivery: body.hotelDelivery || true,
        homeDelivery: body.homeDelivery || false,
        airportFee: body.airportFee || 0,
        hotelFee: body.hotelFee || 35,
        homeFee: body.homeFee || 50,
        deliveryRadius: body.deliveryRadius || 10,
        
        // Availability settings
        isActive: body.isActive !== false,
        instantBook: body.instantBook !== false,
        advanceNotice: body.advanceNotice || 2,
        minTripDuration: body.minTripDuration || 1,
        maxTripDuration: body.maxTripDuration || 30,
        bufferTime: body.bufferTime || 2,
        
        // Mileage settings
        mileageDaily: body.mileageDaily || 200,
        mileageWeekly: body.mileageWeekly || 1000,
        mileageMonthly: body.mileageMonthly || 3000,
        mileageOverageFee: body.mileageOverageFee || 3.0,
        
        // Rules (JSON)
        rules: body.rules ? JSON.stringify(body.rules) : null,
        
        // Insurance
        insuranceIncluded: body.insuranceIncluded || false,
        insuranceDaily: body.insuranceDaily || 25
      }
    })
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: host.userId,
        action: 'car_added',
        entityType: 'car',
        entityId: newCar.id,
        metadata: {
          carDetails: `${newCar.year} ${newCar.make} ${newCar.model}`
        }
      }
    })
    
    // Create admin notification
    await prisma.adminNotification.create({
      data: {
        type: 'NEW_CAR',
        title: 'New Car Added',
        message: `${host.name} added a ${newCar.year} ${newCar.make} ${newCar.model}`,
        priority: 'LOW',
        status: 'UNREAD',
        relatedId: newCar.id,
        relatedType: 'car',
        actionRequired: false,
        metadata: {
          hostName: host.name,
          carDetails: {
            make: newCar.make,
            model: newCar.model,
            year: newCar.year,
            dailyRate: newCar.dailyRate
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      car: newCar
    })
    
  } catch (error) {
    console.error('Car creation error:', error)
    return NextResponse.json(
      { error: 'Failed to add car' },
      { status: 500 }
    )
  }
}