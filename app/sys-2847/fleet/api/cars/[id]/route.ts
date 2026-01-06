// app/sys-2847/fleet/api/cars/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// GET - Fetch single car
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const car = await prisma.rentalCar.findUnique({
      where: { id },
      include: {
        host: true,
        photos: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!car) {
      return NextResponse.json(
        { success: false, error: 'Car not found' },
        { status: 404 }
      )
    }

    // Log for debugging
    console.log(`Fetched car ${id} with ${car.photos?.length || 0} photos`)

    return NextResponse.json({
      success: true,
      data: car
    })
  } catch (error) {
    console.error('Error fetching car:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch car' },
      { status: 500 }
    )
  }
}

// PUT - Update car
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    console.log(`Updating car ${id}`)
    console.log('Photos received:', body.photos?.length || 0)
    console.log('Location data received:', {
      address: body.address,
      latitude: body.latitude || body.locationLat,
      longitude: body.longitude || body.locationLng
    })
    
    // First check if the host exists (only if hostId is being changed)
    if (body.hostId) {
      const hostExists = await prisma.rentalHost.findUnique({
        where: { id: body.hostId }
      })
      
      if (!hostExists) {
        return NextResponse.json(
          { success: false, error: 'Invalid host ID. Host does not exist.' },
          { status: 400 }
        )
      }
    }
    
    // Process features to ensure it's a string
    let processedFeatures = body.features
    if (body.features !== undefined && body.features !== null) {
      if (Array.isArray(body.features)) {
        // Convert array to JSON string
        processedFeatures = JSON.stringify(body.features)
        console.log('Converted features array to JSON string')
      } else if (typeof body.features === 'object') {
        // If it's an object, stringify it
        processedFeatures = JSON.stringify(body.features)
      } else if (typeof body.features !== 'string') {
        // If it's not a string, convert it
        processedFeatures = String(body.features)
      }
    }
    
    // Process rules to ensure it's a string
    let processedRules = body.rules
    if (body.rules !== undefined && body.rules !== null) {
      if (Array.isArray(body.rules)) {
        // Convert array to JSON string
        processedRules = JSON.stringify(body.rules)
        console.log('Converted rules array to JSON string')
      } else if (typeof body.rules === 'object') {
        // If it's an object, stringify it
        processedRules = JSON.stringify(body.rules)
      } else if (typeof body.rules !== 'string') {
        // If it's not a string, convert it
        processedRules = String(body.rules)
      }
    }
    
    // Log processed values for debugging
    console.log('Features type:', typeof processedFeatures)
    console.log('Rules type:', typeof processedRules)
    
    // Update car data - NOW INCLUDING COORDINATES
    const updatedCar = await prisma.rentalCar.update({
      where: { id },
      data: {
        hostId: body.hostId,
        make: body.make,
        model: body.model,
        year: body.year,
        color: body.color,
        dailyRate: body.dailyRate,
        weeklyRate: body.weeklyRate,
        monthlyRate: body.monthlyRate,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        latitude: body.latitude || body.locationLat || null,  // ADDED - HANDLES BOTH NAMING CONVENTIONS
        longitude: body.longitude || body.locationLng || null, // ADDED - HANDLES BOTH NAMING CONVENTIONS
        features: processedFeatures,  // Use processed string
        rules: processedRules,        // Use processed string
        isActive: body.isActive,
        instantBook: body.instantBook,
        transmission: body.transmission,
        fuelType: body.fuelType,
        seats: body.seats,
        doors: body.doors,
        carType: body.carType,
        deliveryFee: body.deliveryFee,
        insuranceDaily: body.insuranceDaily,
        minTripDuration: body.minTripDuration,
        maxTripDuration: body.maxTripDuration,
        advanceNotice: body.advanceNotice,
        airportPickup: body.airportPickup,
        hotelDelivery: body.hotelDelivery,
        homeDelivery: body.homeDelivery,
      }
    })

    // Handle photo updates if provided
    if (body.photos && Array.isArray(body.photos)) {
      console.log(`Updating photos for car ${id}: deleting old, adding ${body.photos.length} new`)
      
      // Delete existing photos
      const deleteResult = await prisma.rentalCarPhoto.deleteMany({
        where: { carId: id }
      })
      console.log(`Deleted ${deleteResult.count} old photos`)
      
      // Add new photos
      if (body.photos.length > 0) {
        const photoData = body.photos.map((url: string, index: number) => ({
          carId: id,
          url,
          order: index,
          isHero: index === 0
        }))
        
        const createResult = await prisma.rentalCarPhoto.createMany({
          data: photoData
        })
        console.log(`Created ${createResult.count} new photos`)
      }
    }

    // Fetch the updated car with photos to return
    const carWithPhotos = await prisma.rentalCar.findUnique({
      where: { id },
      include: {
        host: true,
        photos: {
          orderBy: { order: 'asc' }
        }
      }
    })

    console.log('Car updated successfully with coordinates:', {
      id: carWithPhotos?.id,
      latitude: carWithPhotos?.latitude,
      longitude: carWithPhotos?.longitude
    })

    return NextResponse.json({
      success: true,
      data: carWithPhotos,
      message: 'Car updated successfully'
    })
  } catch (error) {
    console.error('Error updating car:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update car',
        details: error
      },
      { status: 500 }
    )
  }
}

// DELETE - Hard delete (removes car and related records)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Delete related records first (foreign key constraints)
    await prisma.rentalCarPhoto.deleteMany({
      where: { carId: id }
    })

    // Delete the car
    await prisma.rentalCar.delete({
      where: { id }
    })

    console.log(`Car ${id} permanently deleted`)

    return NextResponse.json({
      success: true,
      message: 'Car permanently deleted'
    })
  } catch (error) {
    console.error('Error deleting car:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete car' },
      { status: 500 }
    )
  }
}