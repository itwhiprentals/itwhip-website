// app/api/debug/host-data/route.ts
// TEMPORARY DEBUG FILE - DELETE AFTER TESTING

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const hostId = searchParams.get('hostId') || 'cmikwxr6f000sdojhe7pgyglw'
  
  try {
    // Get host
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        state: true,
        zipCode: true,
        approvalStatus: true,
        createdAt: true
      }
    })
    
    // Get cars for this host
    const cars = await prisma.rentalCar.findMany({
      where: { hostId },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        color: true,
        trim: true,
        isActive: true,
        dailyRate: true,
        vin: true,
        licensePlate: true,
        createdAt: true,
        _count: {
          select: { photos: true }
        }
      }
    })
    
    // Get activity logs for signup
    const activityLogs = await prisma.activityLog.findMany({
      where: { 
        hostId,
        action: { in: ['SIGNUP_CAR_CREATED', 'SIGNUP_VEHICLE_INFO'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    
    // Get total car count in system
    const totalCars = await prisma.rentalCar.count()
    const totalHosts = await prisma.rentalHost.count()
    
    return NextResponse.json({
      host,
      cars,
      carCount: cars.length,
      activityLogs,
      systemStats: {
        totalCars,
        totalHosts
      }
    })
    
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// POST - Create missing car for a host (backfill)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      hostId, 
      make = 'Toyota', 
      model = 'Camry', 
      year = 2024, 
      color = 'Black',
      trim = 'SE'
    } = body

    // Verify host exists
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: { id: true, name: true, city: true, state: true, zipCode: true }
    })

    if (!host) {
      return NextResponse.json({ error: 'Host not found' }, { status: 404 })
    }

    // Check if host already has cars
    const existingCars = await prisma.rentalCar.count({
      where: { hostId }
    })

    if (existingCars > 0) {
      return NextResponse.json({ 
        error: 'Host already has cars', 
        carCount: existingCars 
      }, { status: 400 })
    }

    // Create the car (mimicking signup flow)
    const newCar = await prisma.rentalCar.create({
      data: {
        hostId: host.id,
        make,
        model,
        year,
        trim,
        color,
        
        // Mark as INACTIVE - not ready for booking
        isActive: false,
        
        // Default values
        carType: 'midsize',
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        fuelType: 'gas',
        
        // Pricing defaults to 0 - MUST be set before going live
        dailyRate: 0,
        weeklyRate: 0,
        monthlyRate: 0,
        weeklyDiscount: 15,
        monthlyDiscount: 30,
        deliveryFee: 35,
        
        // Location from host
        address: '',
        city: host.city || 'Phoenix',
        state: host.state || 'AZ',
        zipCode: host.zipCode || '85003',
        
        // Delivery options
        airportPickup: true,
        hotelDelivery: true,
        homeDelivery: false,
        
        // Availability settings
        instantBook: false,
        advanceNotice: 24,
        minTripDuration: 1,
        maxTripDuration: 30,
        
        // Insurance
        insuranceIncluded: false,
        insuranceDaily: 25,
        
        // Stats
        totalTrips: 0,
        rating: 0,
        
        // Empty arrays
        features: '[]',
        rules: '[]',
        
        // These need to be filled by host
        vin: null,
        licensePlate: null,
        currentMileage: null,
        
        // Registration
        registeredOwner: null,
        registrationState: host.state || 'AZ',
        titleStatus: 'Clean',
        garageCity: host.city || 'Phoenix',
        garageState: host.state || 'AZ',
        garageZip: host.zipCode || '85003',
        hasLien: false,
        hasAlarm: false,
        hasTracking: false,
        hasImmobilizer: false,
        isModified: false,
        annualMileage: 12000,
        primaryUse: 'Rental'
      } as any
    })

    // Log the backfill
    await prisma.activityLog.create({
      data: {
        action: 'SIGNUP_CAR_CREATED',
        entityType: 'CAR',
        entityId: newCar.id,
        hostId: host.id,
        category: 'VEHICLE',
        severity: 'INFO',
        metadata: {
          description: `Vehicle backfilled: ${year} ${make} ${model}`,
          make,
          model,
          year,
          trim,
          color,
          status: 'INCOMPLETE',
          note: 'Backfilled - car was not created during original signup',
          backfilledAt: new Date().toISOString()
        }
      } as any
    })

    return NextResponse.json({
      success: true,
      message: 'Car created successfully',
      car: {
        id: newCar.id,
        make: newCar.make,
        model: newCar.model,
        year: newCar.year,
        color: newCar.color,
        trim: newCar.trim,
        isActive: newCar.isActive,
        dailyRate: newCar.dailyRate
      },
      nextSteps: [
        'Host should see car on dashboard',
        'Host needs to add: photos, VIN, license plate, pricing',
        'Once complete, car can be activated'
      ]
    })

  } catch (error) {
    console.error('Create car error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}