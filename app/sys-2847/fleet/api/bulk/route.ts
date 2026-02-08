// app/sys-2847/fleet/api/bulk/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cars, hostId } = body
    
    if (!cars || !Array.isArray(cars)) {
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { status: 400 }
      )
    }

    const results: {
      success: any[]
      failed: any[]
    } = {
      success: [],
      failed: []
    }

    // Process each car
    for (const carData of cars) {
      try {
        const car = await prisma.rentalCar.create({
          data: {
            id: crypto.randomUUID(),
            updatedAt: new Date(),
            hostId: carData.hostId || hostId,
            source: 'p2p',
            make: carData.make,
            model: carData.model,
            year: parseInt(carData.year),
            color: carData.color,
            carType: carData.carType || 'SEDAN',
            seats: parseInt(carData.seats) || 4,
            doors: parseInt(carData.doors) || 4,
            transmission: carData.transmission || 'AUTOMATIC',
            fuelType: carData.fuelType || 'PREMIUM',
            dailyRate: parseFloat(carData.dailyRate),
            weeklyRate: parseFloat(carData.weeklyRate) || parseFloat(carData.dailyRate) * 6.3,
            monthlyRate: parseFloat(carData.monthlyRate) || parseFloat(carData.dailyRate) * 24,
            weeklyDiscount: 10,
            monthlyDiscount: 20,
            deliveryFee: 150,
            address: carData.address || 'Phoenix',
            city: carData.city || 'Phoenix',
            state: carData.state || 'AZ',
            zipCode: carData.zipCode || '85001',
            features: carData.features || '',
            rules: carData.rules || "No smoking. Must be 25+ to book. Valid driver's license and insurance required.",
            insuranceIncluded: false,
            insuranceDaily: 99,
            minTripDuration: 1,
            maxTripDuration: 30,
            advanceNotice: 24,
            airportPickup: true,
            hotelDelivery: true,
            homeDelivery: true,
            isActive: true,
            instantBook: true,
            totalTrips: 0,
            rating: 0
          } as any
        })

        results.success.push({
          make: car.make,
          model: car.model,
          id: car.id
        })
      } catch (error: any) {
        results.failed.push({
          make: carData.make,
          model: carData.model,
          error: error?.message || 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${results.success.length} cars successfully`,
      data: results
    })
  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to import cars' },
      { status: 500 }
    )
  }
}

// GET - Download CSV template
export async function GET(request: NextRequest) {
  const csvTemplate = `make,model,year,color,carType,seats,doors,transmission,fuelType,dailyRate,city,state,zipCode,address,features
Lamborghini,Aventador,2023,Orange,CONVERTIBLE,2,2,AUTOMATIC,PREMIUM,1299,Scottsdale,AZ,85255,"North Scottsdale","Carbon Fiber, Sport Mode"
Ferrari,F8 Tributo,2023,Red,SPORTS,2,2,SEMI_AUTOMATIC,PREMIUM,1199,Phoenix,AZ,85001,"Downtown Phoenix","Racing Mode, Premium Sound"`

  return new NextResponse(csvTemplate, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="car-import-template.csv"'
    }
  })
}