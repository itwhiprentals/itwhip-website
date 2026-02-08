// app/sys-2847/fleet/api/cars/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { auditService, AuditEventType, AuditEntityType } from '@/app/lib/audit/audit-service'

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
        { success: false, error: 'Car not found' },
        { status: 404 }
      )
    }

    console.log(`Fetched car ${id} with ${car.photos?.length || 0} photos`)

    return NextResponse.json({
      success: true,
      data: {
        ...car,
        bookingsCount: car._count.bookings,
        reviewsCount: car._count.reviews
      }
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
    
    // Fetch current state for audit
    const currentCar = await prisma.rentalCar.findUnique({
      where: { id },
      include: {
        photos: true
      }
    })

    if (!currentCar) {
      return NextResponse.json(
        { success: false, error: 'Car not found' },
        { status: 404 }
      )
    }
    
    // Check if the host exists (only if hostId is being changed)
    if (body.hostId && body.hostId !== currentCar.hostId) {
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
        processedFeatures = JSON.stringify(body.features)
      } else if (typeof body.features === 'object') {
        processedFeatures = JSON.stringify(body.features)
      } else if (typeof body.features !== 'string') {
        processedFeatures = String(body.features)
      }
    }
    
    // Process rules to ensure it's a string
    let processedRules = body.rules
    if (body.rules !== undefined && body.rules !== null) {
      if (Array.isArray(body.rules)) {
        processedRules = JSON.stringify(body.rules)
      } else if (typeof body.rules === 'object') {
        processedRules = JSON.stringify(body.rules)
      } else if (typeof body.rules !== 'string') {
        processedRules = String(body.rules)
      }
    }
    
    // Check if car is being deactivated with active bookings
    if (body.isActive === false && currentCar.isActive === true) {
      const activeBookings = await prisma.rentalBooking.count({
        where: {
          carId: id,
          status: {
            in: ['PENDING', 'CONFIRMED', 'ACTIVE']
          }
        }
      })

      if (activeBookings > 0) {
        // Log the attempted deactivation with active bookings
        await auditService.log(
          AuditEventType.UPDATE,
          AuditEntityType.CAR,
          id,
          {
            attemptedAction: 'deactivate_with_active_bookings',
            activeBookings,
            car: currentCar
          },
          {
            severity: 'WARNING',
            category: 'CAR_MANAGEMENT',
            metadata: {
              blocked: true,
              reason: 'active_bookings_exist'
            }
          }
        )

        return NextResponse.json(
          { 
            success: false, 
            error: `Cannot deactivate car with ${activeBookings} active bookings. Please cancel or complete these bookings first.` 
          },
          { status: 400 }
        )
      }
    }
    
    // Update car data
    const updatedCar = await prisma.rentalCar.update({
      where: { id },
      data: {
        ...(body.hostId !== undefined && { hostId: body.hostId }),
        ...(body.make !== undefined && { make: body.make }),
        ...(body.model !== undefined && { model: body.model }),
        ...(body.year !== undefined && { year: body.year }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.dailyRate !== undefined && { dailyRate: body.dailyRate }),
        ...(body.weeklyRate !== undefined && { weeklyRate: body.weeklyRate }),
        ...(body.monthlyRate !== undefined && { monthlyRate: body.monthlyRate }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.state !== undefined && { state: body.state }),
        ...(body.zipCode !== undefined && { zipCode: body.zipCode }),
        ...((body.latitude || body.locationLat) !== undefined && { 
          latitude: body.latitude || body.locationLat || null 
        }),
        ...((body.longitude || body.locationLng) !== undefined && { 
          longitude: body.longitude || body.locationLng || null 
        }),
        ...(processedFeatures !== undefined && { features: processedFeatures }),
        ...(processedRules !== undefined && { rules: processedRules }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.instantBook !== undefined && { instantBook: body.instantBook }),
        ...(body.transmission !== undefined && { transmission: body.transmission }),
        ...(body.fuelType !== undefined && { fuelType: body.fuelType }),
        ...(body.seats !== undefined && { seats: body.seats }),
        ...(body.doors !== undefined && { doors: body.doors }),
        ...(body.carType !== undefined && { carType: body.carType }),
        ...(body.deliveryFee !== undefined && { deliveryFee: body.deliveryFee }),
        ...(body.insuranceDaily !== undefined && { insuranceDaily: body.insuranceDaily }),
        ...(body.minTripDuration !== undefined && { minTripDuration: body.minTripDuration }),
        ...(body.maxTripDuration !== undefined && { maxTripDuration: body.maxTripDuration }),
        ...(body.advanceNotice !== undefined && { advanceNotice: body.advanceNotice }),
        ...(body.airportPickup !== undefined && { airportPickup: body.airportPickup }),
        ...(body.hotelDelivery !== undefined && { hotelDelivery: body.hotelDelivery }),
        ...(body.homeDelivery !== undefined && { homeDelivery: body.homeDelivery }),
      }
    })

    // Handle photo updates if provided
    let photoChanges = null
    if (body.photos && Array.isArray(body.photos)) {
      console.log(`Updating photos for car ${id}: deleting old, adding ${body.photos.length} new`)
      
      // Store old photos for audit
      const oldPhotos = currentCar.photos.map(p => p.url)
      
      // Delete existing photos
      const deleteResult = await prisma.rentalCarPhoto.deleteMany({
        where: { carId: id }
      })
      
      // Add new photos
      if (body.photos.length > 0) {
        const photoData = body.photos.map((url: string, index: number) => ({
          carId: id,
          url,
          order: index,
          isHero: index === 0
        }))
        
        await prisma.rentalCarPhoto.createMany({
          data: photoData
        })
      }
      
      photoChanges = {
        before: oldPhotos,
        after: body.photos,
        removed: deleteResult.count,
        added: body.photos.length
      }
    }

    // Log the update with audit service
    await auditService.log(
      AuditEventType.UPDATE,
      AuditEntityType.CAR,
      id,
      {
        before: currentCar,
        after: updatedCar,
        changes: body,
        photoChanges
      },
      {
        severity: 'INFO',
        category: 'CAR_MANAGEMENT',
        metadata: {
          updatedFields: Object.keys(body).filter(key => body[key] !== undefined),
          adminAction: true
        }
      }
    )

    // If car was deactivated, create notification
    if (body.isActive === false && currentCar.isActive === true) {
      await prisma.adminNotification.create({
        data: {
          type: 'CAR_DEACTIVATED',
          title: `Car Deactivated: ${updatedCar.year} ${updatedCar.make} ${updatedCar.model}`,
          message: `Car ${id} has been deactivated`,
          priority: 'MEDIUM',
          status: 'UNREAD',
          relatedId: id,
          relatedType: 'CAR',
          metadata: {
            carDetails: `${updatedCar.year} ${updatedCar.make} ${updatedCar.model}`,
            reason: body.deactivationReason
          }
        } as any
      })
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

    return NextResponse.json({
      success: true,
      data: carWithPhotos,
      message: 'Car updated successfully'
    })
  } catch (error) {
    console.error('Error updating car:', error)
    
    // Log the failure
    await auditService.log(
      AuditEventType.UPDATE,
      AuditEntityType.CAR,
      (await params).id,
      {
        error: (error as Error).message,
        attemptedChanges: request.body
      },
      {
        severity: 'ERROR',
        category: 'CAR_MANAGEMENT'
      }
    )
    
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

// DELETE - Smart delete (soft delete if has bookings, hard delete if safe)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({ reason: 'No reason provided' }))
    
    // Fetch complete car record with all relationships
    const fullCarRecord = await prisma.rentalCar.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            hostType: true
          }
        },
        photos: true,
        bookings: {
          select: {
            id: true,
            bookingCode: true,
            status: true,
            totalAmount: true,
            startDate: true,
            endDate: true,
            guestName: true,
            guestEmail: true
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true
          }
        },
        availability: {
          select: {
            id: true,
            date: true,
            isAvailable: true
          }
        }
      }
    })

    if (!fullCarRecord) {
      return NextResponse.json(
        { success: false, error: 'Car not found' },
        { status: 404 }
      )
    }

    // Check for active bookings
    const activeBookings = fullCarRecord.bookings.filter(
      b => ['PENDING', 'CONFIRMED', 'ACTIVE'].includes(b.status)
    )

    // Check for future bookings
    const futureBookings = fullCarRecord.bookings.filter(
      b => new Date(b.startDate) > new Date()
    )

    // Check for any booking history
    const hasBookingHistory = fullCarRecord.bookings.length > 0

    // Determine deletion type
    const canHardDelete = activeBookings.length === 0 && 
                         futureBookings.length === 0 && 
                         !hasBookingHistory &&
                         body.forceHardDelete !== false

    if (canHardDelete) {
      // HARD DELETE - No booking history, safe to remove completely
      
      // Log the deletion BEFORE doing it
      await auditService.logDeletion(
        AuditEntityType.CAR,
        id,
        fullCarRecord,
        body.reason || 'Hard delete - no booking history',
        true // hard delete
      )

      // Delete in correct order
      // 1. Delete photos
      await prisma.rentalCarPhoto.deleteMany({
        where: { carId: id }
      })

      // 2. Delete availability records
      await prisma.rentalAvailability.deleteMany({
        where: { carId: id }
      })

      // 3. Delete reviews (shouldn't be any if no bookings, but just in case)
      await prisma.rentalReview.deleteMany({
        where: { carId: id }
      })

      // 4. Delete the car
      await prisma.rentalCar.delete({
        where: { id }
      })

      // Log successful deletion
      await auditService.log(
        AuditEventType.DELETE,
        AuditEntityType.CAR,
        id,
        {
          permanentlyDeleted: true,
          deletedRecords: {
            photos: fullCarRecord.photos.length,
            reviews: fullCarRecord.reviews.length,
            availability: fullCarRecord.availability.length
          }
        },
        {
          severity: 'WARNING',
          category: 'CAR_MANAGEMENT',
          metadata: {
            reason: body.reason,
            hardDelete: true
          }
        }
      )

      return NextResponse.json({
        success: true,
        message: 'Car permanently deleted',
        details: {
          deletionType: 'hard',
          recordsDeleted: {
            photos: fullCarRecord.photos.length,
            reviews: fullCarRecord.reviews.length
          }
        }
      })

    } else {
      // SOFT DELETE - Has booking history or active bookings, keep for records
      
      // Log the soft deletion
      await auditService.logDeletion(
        AuditEntityType.CAR,
        id,
        fullCarRecord,
        body.reason || `Soft delete - ${hasBookingHistory ? 'has booking history' : 'active bookings exist'}`,
        false // soft delete
      )

      // Soft delete - just mark as inactive
      const updatedCar = await prisma.rentalCar.update({
        where: { id },
        data: {
          isActive: false,
          // Add metadata about deletion
          updatedAt: new Date()
        }
      })

      // Cancel any pending future bookings if requested
      if (body.cancelFutureBookings && futureBookings.length > 0) {
        const cancelledBookings = await prisma.rentalBooking.updateMany({
          where: {
            carId: id,
            status: 'PENDING',
            startDate: { gt: new Date() }
          },
          data: {
            status: 'CANCELLED',
            cancellationReason: 'Car no longer available',
            cancelledBy: 'ADMIN',
            cancelledAt: new Date()
          }
        })

        await auditService.log(
          AuditEventType.UPDATE,
          AuditEntityType.CAR,
          id,
          {
            action: 'future_bookings_cancelled',
            count: cancelledBookings.count,
            affectedBookings: futureBookings.map(b => ({
              id: b.id,
              code: b.bookingCode,
              guest: b.guestEmail
            }))
          },
          {
            severity: 'WARNING',
            category: 'CAR_MANAGEMENT'
          }
        )
      }

      // Create notification if there were active bookings
      if (activeBookings.length > 0 || futureBookings.length > 0) {
        await prisma.adminNotification.create({
          data: {
            type: 'CAR_DEACTIVATED_WITH_BOOKINGS',
            title: `Car Deactivated with Active Bookings`,
            message: `${fullCarRecord.year} ${fullCarRecord.make} ${fullCarRecord.model} was deactivated with ${activeBookings.length} active and ${futureBookings.length} future bookings`,
            priority: 'HIGH',
            status: 'UNREAD',
            relatedId: id,
            relatedType: 'CAR',
            actionRequired: true,
            metadata: {
              carDetails: `${fullCarRecord.year} ${fullCarRecord.make} ${fullCarRecord.model}`,
              activeBookings: activeBookings.length,
              futureBookings: futureBookings.length,
              hasBookingHistory
            }
          } as any
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Car removed from listings (soft delete)',
        details: {
          deletionType: 'soft',
          reason: hasBookingHistory ? 'Has booking history' : 'Has active/future bookings',
          activeBookings: activeBookings.length,
          futureBookings: futureBookings.length,
          totalBookingHistory: fullCarRecord.bookings.length,
          carStatus: 'inactive_preserved'
        }
      })
    }

  } catch (error) {
    console.error('Error deleting car:', error)
    
    // Log the failure
    await auditService.log(
      AuditEventType.DELETE,
      AuditEntityType.CAR,
      (await params).id,
      {
        error: (error as Error).message,
        stack: (error as Error).stack
      },
      {
        severity: 'ERROR',
        category: 'CAR_MANAGEMENT'
      }
    )
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete car' },
      { status: 500 }
    )
  }
}