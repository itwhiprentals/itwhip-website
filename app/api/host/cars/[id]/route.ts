// app/api/host/cars/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { headers } from 'next/headers'

// Helper to get host from headers
async function getHostFromHeaders() {
  const headersList = await headers()
  const hostId = headersList.get('x-host-id')
  const userId = headersList.get('x-user-id')
  
  if (!hostId) {
    return null
  }

  const host = await prisma.rentalHost.findUnique({
    where: { id: hostId },
    select: {
      id: true,
      approvalStatus: true,
      canEditCalendar: true,
      minDailyRate: true,
      maxDailyRate: true
    }
  })

  return host
}

// GET - Fetch single car details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carId } = await params
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId: host.id
      },
      include: {
        photos: {
          orderBy: { order: 'asc' }
        },
        bookings: {
          where: {
            status: {
              in: ['CONFIRMED', 'ACTIVE']
            },
            startDate: {
              gte: new Date()
            }
          },
          select: {
            id: true,
            startDate: true,
            endDate: true
          }
        },
        availability: {
          where: {
            date: {
              gte: new Date()
            }
          },
          orderBy: {
            date: 'asc'
          }
        },
        reviews: {
          select: {
            rating: true
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

    // Calculate average rating
    const avgRating = car.reviews.length > 0
      ? car.reviews.reduce((acc, r) => acc + r.rating, 0) / car.reviews.length
      : 0

    // Parse JSON fields
    const features = car.features ? JSON.parse(car.features) : []
    const rules = car.rules ? JSON.parse(car.rules) : []

    // ✅ FIX: Wrap in consistent response structure
    return NextResponse.json({
      success: true,
      car: {
        ...car,
        features,
        rules,
        avgRating: parseFloat(avgRating.toFixed(1)),
        upcomingBookings: car.bookings.length
      }
    })

  } catch (error) {
    console.error('Error fetching car:', error)
    return NextResponse.json(
      { error: 'Failed to fetch car details' },
      { status: 500 }
    )
  }
}

// PUT - Update car details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carId } = await params
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!host.canEditCalendar) {
      return NextResponse.json(
        { error: 'You do not have permission to edit cars' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Verify car belongs to host
    const existingCar = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId: host.id
      }
    })

    if (!existingCar) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    // Validate daily rate if changing
    if (body.dailyRate) {
      if (host.minDailyRate && body.dailyRate < host.minDailyRate) {
        return NextResponse.json(
          { error: `Daily rate cannot be less than $${host.minDailyRate}` },
          { status: 400 }
        )
      }
      if (host.maxDailyRate && body.dailyRate > host.maxDailyRate) {
        return NextResponse.json(
          { error: `Daily rate cannot exceed $${host.maxDailyRate}` },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    
    // Car details
    if (body.make !== undefined) updateData.make = body.make
    if (body.model !== undefined) updateData.model = body.model
    if (body.year !== undefined) updateData.year = body.year
    if (body.trim !== undefined) updateData.trim = body.trim
    if (body.color !== undefined) updateData.color = body.color
    if (body.licensePlate !== undefined) updateData.licensePlate = body.licensePlate
    if (body.vin !== undefined) updateData.vin = body.vin
    
    // Specifications
    if (body.carType !== undefined) updateData.carType = body.carType
    if (body.seats !== undefined) updateData.seats = body.seats
    if (body.doors !== undefined) updateData.doors = body.doors
    if (body.transmission !== undefined) updateData.transmission = body.transmission
    if (body.fuelType !== undefined) updateData.fuelType = body.fuelType
    if (body.mpgCity !== undefined) updateData.mpgCity = body.mpgCity
    if (body.mpgHighway !== undefined) updateData.mpgHighway = body.mpgHighway
    if (body.currentMileage !== undefined) updateData.currentMileage = body.currentMileage
    
    // Pricing
    if (body.dailyRate !== undefined) updateData.dailyRate = body.dailyRate
    if (body.weeklyRate !== undefined) updateData.weeklyRate = body.weeklyRate
    if (body.monthlyRate !== undefined) updateData.monthlyRate = body.monthlyRate
    if (body.weeklyDiscount !== undefined) updateData.weeklyDiscount = body.weeklyDiscount
    if (body.monthlyDiscount !== undefined) updateData.monthlyDiscount = body.monthlyDiscount
    
    // Delivery fees
    if (body.airportFee !== undefined) updateData.airportFee = body.airportFee
    if (body.hotelFee !== undefined) updateData.hotelFee = body.hotelFee
    if (body.homeFee !== undefined) updateData.homeFee = body.homeFee
    if (body.deliveryRadius !== undefined) updateData.deliveryRadius = body.deliveryRadius
    if (body.freeDeliveryRadius !== undefined) updateData.freeDeliveryRadius = body.freeDeliveryRadius
    if (body.deliveryInstructions !== undefined) updateData.deliveryInstructions = body.deliveryInstructions
    
    // Features and rules (JSON)
    if (body.features !== undefined) {
      updateData.features = JSON.stringify(body.features)
    }
    if (body.rules !== undefined) {
      updateData.rules = JSON.stringify(body.rules)
    }
    
    // Location
    if (body.address !== undefined) updateData.address = body.address
    if (body.city !== undefined) updateData.city = body.city
    if (body.state !== undefined) updateData.state = body.state
    if (body.zipCode !== undefined) updateData.zipCode = body.zipCode
    if (body.latitude !== undefined) updateData.latitude = body.latitude
    if (body.longitude !== undefined) updateData.longitude = body.longitude
    
    // Delivery options
    if (body.airportPickup !== undefined) updateData.airportPickup = body.airportPickup
    if (body.hotelDelivery !== undefined) updateData.hotelDelivery = body.hotelDelivery
    if (body.homeDelivery !== undefined) updateData.homeDelivery = body.homeDelivery
    
    // Availability settings
    if (body.instantBook !== undefined) updateData.instantBook = body.instantBook
    if (body.advanceNotice !== undefined) updateData.advanceNotice = body.advanceNotice
    if (body.minTripDuration !== undefined) updateData.minTripDuration = body.minTripDuration
    if (body.maxTripDuration !== undefined) updateData.maxTripDuration = body.maxTripDuration
    
    // Trip settings
    if (body.bufferTime !== undefined) updateData.bufferTime = body.bufferTime
    if (body.cancellationPolicy !== undefined) updateData.cancellationPolicy = body.cancellationPolicy
    if (body.checkInTime !== undefined) updateData.checkInTime = body.checkInTime
    if (body.checkOutTime !== undefined) updateData.checkOutTime = body.checkOutTime
    
    // Mileage settings
    if (body.mileageDaily !== undefined) updateData.mileageDaily = body.mileageDaily
    if (body.mileageWeekly !== undefined) updateData.mileageWeekly = body.mileageWeekly
    if (body.mileageMonthly !== undefined) updateData.mileageMonthly = body.mileageMonthly
    if (body.mileageOverageFee !== undefined) updateData.mileageOverageFee = body.mileageOverageFee
    
    // Insurance
    if (body.insuranceIncluded !== undefined) updateData.insuranceIncluded = body.insuranceIncluded
    if (body.insuranceDaily !== undefined) updateData.insuranceDaily = body.insuranceDaily
    
    // Update car
    const updatedCar = await prisma.rentalCar.update({
      where: { id: carId },
      data: updateData,
      include: {
        photos: {
          orderBy: { order: 'asc' }
        }
      }
    })

    // Parse JSON fields for response
    const features = updatedCar.features ? JSON.parse(updatedCar.features) : []
    const rules = updatedCar.rules ? JSON.parse(updatedCar.rules) : []

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_CAR',
        entityType: 'CAR',
        entityId: carId,
        metadata: {
          hostId: host.id,
          changes: Object.keys(updateData)
        }
      }
    })

    return NextResponse.json({
      success: true,
      car: {
        ...updatedCar,
        features,
        rules
      }
    })

  } catch (error) {
    console.error('Error updating car:', error)
    return NextResponse.json(
      { error: 'Failed to update car' },
      { status: 500 }
    )
  }
}

// PATCH - Toggle car active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carId } = await params
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { isActive } = await request.json()

    // Verify car belongs to host
    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId: host.id
      },
      include: {
        bookings: {
          where: {
            status: 'CONFIRMED',
            startDate: {
              gte: new Date()
            }
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

    // Check for active bookings before deactivating
    if (!isActive && car.bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot deactivate car with active bookings' },
        { status: 400 }
      )
    }

    // Update status
    const updatedCar = await prisma.rentalCar.update({
      where: { id: carId },
      data: { isActive }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: isActive ? 'ACTIVATE_CAR' : 'DEACTIVATE_CAR',
        entityType: 'CAR',
        entityId: carId,
        metadata: {
          hostId: host.id
        }
      }
    })

    // Create admin notification for deactivation
    if (!isActive) {
      await prisma.adminNotification.create({
        data: {
          type: 'CAR_DEACTIVATED',
          title: 'Car Deactivated',
          message: `Host ${host.id} deactivated car: ${car.year} ${car.make} ${car.model}`,
          priority: 'LOW',
          status: 'UNREAD',
          relatedId: carId,
          relatedType: 'CAR'
        }
      })
    }

    return NextResponse.json({
      success: true,
      car: updatedCar
    })

  } catch (error) {
    console.error('Error toggling car status:', error)
    return NextResponse.json(
      { error: 'Failed to update car status' },
      { status: 500 }
    )
  }
}

// DELETE - Delete car
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carId } = await params
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify car belongs to host and check for bookings
    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId: host.id
      },
      include: {
        bookings: {
          where: {
            status: {
              in: ['CONFIRMED', 'ACTIVE']
            }
          }
        },
        photos: true
      }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    // Check for active bookings
    if (car.bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete car with active bookings' },
        { status: 400 }
      )
    }

    // Check for past bookings (soft delete instead)
    const pastBookings = await prisma.rentalBooking.count({
      where: {
        carId,
        status: 'COMPLETED'
      }
    })

    if (pastBookings > 0) {
      // Soft delete - just deactivate
      await prisma.rentalCar.update({
        where: { id: carId },
        data: { 
          isActive: false,
          updatedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Car deactivated (has booking history)'
      })
    }

    // Hard delete - no booking history
    // Delete related records first
    await prisma.rentalCarPhoto.deleteMany({
      where: { carId }
    })

    await prisma.rentalAvailability.deleteMany({
      where: { carId }
    })

    await prisma.rentalReview.deleteMany({
      where: { carId }
    })

    // Delete the car
    await prisma.rentalCar.delete({
      where: { id: carId }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'DELETE_CAR',
        entityType: 'CAR',
        entityId: carId,
        metadata: {
          hostId: host.id,
          car: `${car.year} ${car.make} ${car.model}`
        }
      }
    })

    // Notify admin
    await prisma.adminNotification.create({
      data: {
        type: 'CAR_DELETED',
        title: 'Car Deleted',
        message: `Host ${host.id} deleted car: ${car.year} ${car.make} ${car.model}`,
        priority: 'MEDIUM',
        status: 'UNREAD',
        relatedId: carId,
        relatedType: 'CAR',
        metadata: {
          hostId: host.id,
          carDetails: {
            make: car.make,
            model: car.model,
            year: car.year
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Car deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting car:', error)
    return NextResponse.json(
      { error: 'Failed to delete car' },
      { status: 500 }
    )
  }
}