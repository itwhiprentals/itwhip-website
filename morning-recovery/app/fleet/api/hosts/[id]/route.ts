// app/fleet/api/hosts/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { auditService, AuditEventType, AuditEntityType } from '@/app/lib/audit/audit-service'

// GET - Fetch host details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847' && !request.headers.get('authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch host with all related data
    const host = await prisma.rentalHost.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            emailVerified: true,
            createdAt: true
          }
        },
        insuranceProvider: {
          select: {
            id: true,
            name: true,
            type: true,
            isActive: true,
            coverageNotes: true,
            contractStart: true,
            contractEnd: true,
            revenueShare: true
          }
        },
        cars: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            color: true,
            dailyRate: true,
            city: true,
            state: true,
            isActive: true,
            instantBook: true,
            totalTrips: true,
            rating: true,
            photos: {
              where: { isHero: true },
              select: {
                url: true
              },
              take: 1
            },
            _count: {
              select: {
                bookings: true
              }
            }
          }
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
            cars: true
          }
        }
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    // Transform for frontend
    const transformedHost = {
      ...host,
      cars: host.cars.map(car => ({
        ...car,
        heroPhoto: car.photos[0]?.url || null,
        photosCount: car.photos.length,
        bookingsCount: car._count.bookings
      })),
      counts: {
        bookings: host._count.bookings,
        reviews: host._count.reviews,
        cars: host._count.cars
      }
    }

    return NextResponse.json({
      success: true,
      data: transformedHost
    })

  } catch (error) {
    console.error('Failed to fetch host details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch host details' },
      { status: 500 }
    )
  }
}

// PUT - Update host details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847' && !request.headers.get('authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Fetch current state for audit
    const currentHost = await prisma.rentalHost.findUnique({
      where: { id }
    })

    if (!currentHost) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    // Track permission changes specifically
    const permissionFields = [
      'canViewBookings', 'canEditCalendar', 'canSetPricing', 
      'canMessageGuests', 'canWithdrawFunds', 'dashboardAccess'
    ]
    
    const permissionChanges = permissionFields.some(field => 
      body[field] !== undefined && body[field] !== currentHost[field as keyof typeof currentHost]
    )

    // Update host
    const updatedHost = await prisma.rentalHost.update({
      where: { id },
      data: {
        // Basic info
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.bio !== undefined && { bio: body.bio }),
        ...(body.profilePhoto !== undefined && { profilePhoto: body.profilePhoto }),
        
        // Location
        ...(body.city !== undefined && { city: body.city }),
        ...(body.state !== undefined && { state: body.state }),
        ...(body.zipCode !== undefined && { zipCode: body.zipCode }),
        
        // Status changes
        ...(body.approvalStatus !== undefined && { approvalStatus: body.approvalStatus }),
        ...(body.active !== undefined && { active: body.active }),
        ...(body.hostType !== undefined && { hostType: body.hostType }),

        // Document verification
        ...(body.documentsVerified !== undefined && { documentsVerified: body.documentsVerified }),
        ...(body.photoIdVerified !== undefined && { photoIdVerified: body.photoIdVerified }),
        
        // Permissions
        ...(body.dashboardAccess !== undefined && { dashboardAccess: body.dashboardAccess }),
        ...(body.canViewBookings !== undefined && { canViewBookings: body.canViewBookings }),
        ...(body.canEditCalendar !== undefined && { canEditCalendar: body.canEditCalendar }),
        ...(body.canSetPricing !== undefined && { canSetPricing: body.canSetPricing }),
        ...(body.canMessageGuests !== undefined && { canMessageGuests: body.canMessageGuests }),
        ...(body.canWithdrawFunds !== undefined && { canWithdrawFunds: body.canWithdrawFunds }),
        
        // Financial boundaries
        ...(body.minDailyRate !== undefined && { minDailyRate: body.minDailyRate }),
        ...(body.maxDailyRate !== undefined && { maxDailyRate: body.maxDailyRate }),
        ...(body.commissionRate !== undefined && { commissionRate: body.commissionRate }),
        
        // Performance metrics
        ...(body.responseTime !== undefined && { responseTime: body.responseTime }),
        ...(body.responseRate !== undefined && { responseRate: body.responseRate }),
        ...(body.acceptanceRate !== undefined && { acceptanceRate: body.acceptanceRate }),
        ...(body.rating !== undefined && { rating: body.rating }),
        
        updatedAt: new Date()
      }
    })

    // Log the update with audit service
    await auditService.log(
      AuditEventType.UPDATE,
      AuditEntityType.HOST,
      id,
      {
        before: currentHost,
        after: updatedHost,
        changes: body
      },
      {
        severity: 'INFO',
        category: 'HOST_MANAGEMENT',
        metadata: {
          updatedFields: Object.keys(body),
          adminAction: true
        }
      }
    )

    // If permissions changed, log that specifically
    if (permissionChanges) {
      const oldPermissions = permissionFields.reduce((acc, field) => ({
        ...acc,
        [field]: currentHost[field as keyof typeof currentHost]
      }), {})
      
      const newPermissions = permissionFields.reduce((acc, field) => ({
        ...acc,
        [field]: updatedHost[field as keyof typeof updatedHost]
      }), {})
      
      await auditService.logPermissionChange(
        id,
        request.headers.get('user-email') || 'fleet-admin',
        oldPermissions,
        newPermissions,
        body.reason
      )
    }

    // If status changed to SUSPENDED, deactivate cars
    if (body.approvalStatus === 'SUSPENDED' && currentHost.approvalStatus !== 'SUSPENDED') {
      await prisma.rentalCar.updateMany({
        where: { hostId: id },
        data: { isActive: false }
      })
      
      await auditService.log(
        AuditEventType.UPDATE,
        AuditEntityType.HOST,
        id,
        {
          action: 'cars_deactivated',
          reason: 'host_suspended',
          affectedCars: await prisma.rentalCar.count({ where: { hostId: id } })
        },
        {
          severity: 'WARNING',
          category: 'HOST_MANAGEMENT'
        }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedHost
    })

  } catch (error) {
    console.error('Failed to update host:', error)
    return NextResponse.json(
      { error: 'Failed to update host' },
      { status: 500 }
    )
  }
}

// DELETE - Suspend or delete host
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847' && !request.headers.get('authorization')) {
      await auditService.logFailedLogin(
        request.headers.get('x-forwarded-for') || 'unknown',
        'Unauthorized host deletion attempt',
        { hostId: id }
      )
      
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { action = 'suspend', reason } = await request.json()

    // Fetch complete host record with all relationships for audit
    const fullHostRecord = await prisma.rentalHost.findUnique({
      where: { id },
      include: {
        user: true,
        cars: {
          include: {
            photos: true,
            _count: {
              select: {
                bookings: true,
                reviews: true
              }
            }
          }
        },
        bookings: {
          select: {
            id: true,
            bookingCode: true,
            status: true,
            totalAmount: true,
            startDate: true,
            endDate: true
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
        payouts: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true
          }
        },
        hostPayouts: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true
          }
        }
      }
    })

    if (!fullHostRecord) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    // Check if host has active bookings
    const activeBookings = await prisma.rentalBooking.count({
      where: {
        hostId: id,
        status: {
          in: ['PENDING', 'CONFIRMED', 'ACTIVE']
        }
      }
    })

    // Check if host has future bookings
    const futureBookings = await prisma.rentalBooking.count({
      where: {
        hostId: id,
        startDate: {
          gt: new Date()
        }
      }
    })

    // Determine if we can hard delete
    const canHardDelete = activeBookings === 0 && futureBookings === 0 && action === 'delete'
    const willHardDelete = canHardDelete && fullHostRecord.bookings.length === 0

    if (action === 'suspend' || !willHardDelete) {
      // SOFT DELETE / SUSPEND
      
      // Log the suspension/soft delete BEFORE doing it
      await auditService.logDeletion(
        AuditEntityType.HOST,
        id,
        fullHostRecord,
        reason || `${action} by admin`,
        false // soft delete
      )

      // Update host status
      const suspendedHost = await prisma.rentalHost.update({
        where: { id },
        data: {
          approvalStatus: 'SUSPENDED',
          active: false,
          dashboardAccess: false,
          suspendedAt: new Date(),
          suspendedReason: reason || 'Suspended by admin'
        }
      })

      // Deactivate all their cars (soft delete)
      const deactivatedCars = await prisma.rentalCar.updateMany({
        where: { hostId: id },
        data: { isActive: false }
      })

      // Cancel any pending bookings
      const cancelledBookings = await prisma.rentalBooking.updateMany({
        where: {
          hostId: id,
          status: 'PENDING',
          startDate: { gt: new Date() }
        },
        data: {
          status: 'CANCELLED',
          cancellationReason: 'Host suspended',
          cancelledBy: 'ADMIN',
          cancelledAt: new Date()
        }
      })

      // Create admin notification if there were active bookings
      if (activeBookings > 0 || futureBookings > 0) {
        await prisma.adminNotification.create({
          data: {
            type: 'HOST_SUSPENDED_WITH_BOOKINGS',
            title: `Host Suspended with Active Bookings`,
            message: `${fullHostRecord.name} was suspended with ${activeBookings} active and ${futureBookings} future bookings`,
            priority: 'HIGH',
            status: 'UNREAD',
            relatedId: id,
            relatedType: 'HOST',
            actionRequired: true,
            metadata: {
              hostName: fullHostRecord.name,
              activeBookings,
              futureBookings,
              deactivatedCars: deactivatedCars.count,
              cancelledBookings: cancelledBookings.count
            }
          }
        })
      }

      return NextResponse.json({
        success: true,
        message: `Host suspended successfully`,
        details: {
          hostId: id,
          carsDeactivated: deactivatedCars.count,
          bookingsCancelled: cancelledBookings.count,
          hasBookingHistory: fullHostRecord.bookings.length > 0
        }
      })

    } else {
      // HARD DELETE - Only if no booking history
      
      // Log the complete deletion BEFORE doing it
      await auditService.logDeletion(
        AuditEntityType.HOST,
        id,
        fullHostRecord,
        reason || 'Hard delete by admin',
        true // hard delete
      )

      // Delete in correct order due to foreign key constraints
      
      // 1. Delete car photos first
      for (const car of fullHostRecord.cars) {
        await prisma.rentalCarPhoto.deleteMany({
          where: { carId: car.id }
        })
      }

      // 2. Delete reviews
      await prisma.rentalReview.deleteMany({ 
        where: { hostId: id } 
      })

      // 3. Delete cars
      await prisma.rentalCar.deleteMany({ 
        where: { hostId: id } 
      })

      // 4. Delete payouts
      await prisma.rentalPayout.deleteMany({ 
        where: { hostId: id } 
      })
      
      await prisma.hostPayout.deleteMany({ 
        where: { hostId: id } 
      })

      // 5. Finally delete the host
      await prisma.rentalHost.delete({ 
        where: { id } 
      })

      // 6. If host had a user account, handle it
      if (fullHostRecord.userId) {
        await prisma.user.update({
          where: { id: fullHostRecord.userId },
          data: { 
            isActive: false,
            role: 'ANONYMOUS'
          }
        })
      }

      // Log successful hard deletion
      await auditService.log(
        AuditEventType.DELETE,
        AuditEntityType.HOST,
        id,
        {
          permanentlyDeleted: true,
          deletedRecords: {
            cars: fullHostRecord.cars.length,
            reviews: fullHostRecord.reviews.length,
            payouts: fullHostRecord.payouts.length + fullHostRecord.hostPayouts.length
          }
        },
        {
          severity: 'CRITICAL',
          category: 'HOST_MANAGEMENT',
          metadata: {
            reason,
            adminAction: true,
            hardDelete: true
          }
        }
      )

      return NextResponse.json({
        success: true,
        message: 'Host permanently deleted',
        details: {
          hostId: id,
          recordsDeleted: {
            cars: fullHostRecord.cars.length,
            reviews: fullHostRecord.reviews.length,
            payouts: fullHostRecord.payouts.length + fullHostRecord.hostPayouts.length
          }
        }
      })
    }

  } catch (error) {
    console.error(`Failed to ${request.method} host:`, error)
    
    // Log the failure
    await auditService.log(
      AuditEventType.DELETE,
      AuditEntityType.HOST,
      (await params).id,
      {
        error: (error as Error).message,
        stack: (error as Error).stack
      },
      {
        severity: 'ERROR',
        category: 'HOST_MANAGEMENT',
        metadata: {
          failedOperation: true
        }
      }
    )
    
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}