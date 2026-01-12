// app/api/fleet/vehicles/[id]/route.ts
// Fleet Vehicle Detail API - View, approve, reject, suspend individual vehicles

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

const FLEET_KEY = 'phoenix-fleet-2847'

function validateFleetKey(request: NextRequest): boolean {
  const key = request.headers.get('x-fleet-key') ||
              request.nextUrl.searchParams.get('key')
  return key === FLEET_KEY
}

// GET - Get vehicle details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateFleetKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    const vehicle = await prisma.rentalCar.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            partnerCompanyName: true,
            partnerSlug: true,
            currentCommissionRate: true,
            active: true,
            email: true
          }
        },
        photos: {
          orderBy: { order: 'asc' },
          select: {
            url: true,
            isHero: true
          }
        },
        bookings: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            bookingCode: true,
            status: true,
            startDate: true,
            endDate: true,
            totalAmount: true,
            guestName: true,
            renter: {
              select: { name: true }
            }
          }
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            rating: true,
            review: true,
            createdAt: true
          }
        },
        serviceRecords: {
          take: 5,
          orderBy: { serviceDate: 'desc' },
          select: {
            id: true,
            serviceType: true,
            serviceDate: true,
            costTotal: true
          }
        }
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Get revenue stats
    const revenueStats = await prisma.rentalBooking.aggregate({
      where: {
        carId: id,
        status: 'COMPLETED'
      },
      _sum: { totalAmount: true },
      _count: true
    })

    // Get booking stats by status
    const bookingStats = await prisma.rentalBooking.groupBy({
      by: ['status'],
      where: { carId: id },
      _count: true
    })

    // Calculate average rating
    const avgRating = await prisma.rentalReview.aggregate({
      where: {
        booking: { carId: id }
      },
      _avg: { rating: true },
      _count: true
    })

    return NextResponse.json({
      success: true,
      vehicle: {
        id: vehicle.id,
        name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        vin: vehicle.vin,
        licensePlate: vehicle.licensePlate,
        status: vehicle.status,
        vehicleType: vehicle.vehicleType || 'RENTAL',
        fleetApprovalStatus: vehicle.fleetApprovalStatus || 'PENDING',
        fleetApprovalDate: vehicle.fleetApprovalDate?.toISOString() || null,
        fleetApprovalNotes: vehicle.fleetApprovalNotes || null,
        fleetApprovedBy: vehicle.fleetApprovedBy || null,
        // Pricing
        dailyRate: vehicle.dailyRate,
        weeklyRate: vehicle.weeklyRate,
        monthlyRate: vehicle.monthlyRate,
        // Details
        color: vehicle.color,
        seats: vehicle.seats,
        doors: vehicle.doors,
        transmission: vehicle.transmission,
        fuelType: vehicle.fuelType,
        currentMileage: vehicle.currentMileage,
        // Photos
        primaryPhoto: vehicle.photos.find(p => p.isHero)?.url || vehicle.photos[0]?.url || null,
        photos: vehicle.photos.map(p => p.url),
        // Features
        features: vehicle.features || [],
        description: vehicle.description,
        // Location
        city: vehicle.city,
        state: vehicle.state,
        zipCode: vehicle.zipCode,
        // Timestamps
        createdAt: vehicle.createdAt.toISOString(),
        updatedAt: vehicle.updatedAt.toISOString(),
        // Partner
        partner: vehicle.host ? {
          id: vehicle.host.id,
          name: vehicle.host.partnerCompanyName,
          slug: vehicle.host.partnerSlug,
          email: vehicle.host.email,
          commissionRate: vehicle.host.currentCommissionRate,
          active: vehicle.host.active
        } : null,
        // Recent activity
        recentBookings: vehicle.bookings.map(b => ({
          id: b.id,
          bookingCode: b.bookingCode,
          status: b.status,
          startDate: b.startDate.toISOString(),
          endDate: b.endDate.toISOString(),
          totalAmount: b.totalAmount,
          guestName: b.renter?.name || b.guestName || 'Guest'
        })),
        recentReviews: vehicle.reviews.map(r => ({
          id: r.id,
          rating: r.rating,
          review: r.review,
          createdAt: r.createdAt.toISOString()
        })),
        recentMaintenance: vehicle.serviceRecords.map(s => ({
          id: s.id,
          type: s.serviceType,
          date: s.serviceDate.toISOString(),
          cost: s.costTotal
        })),
        // Stats
        stats: {
          totalRevenue: revenueStats._sum.totalAmount || 0,
          completedBookings: revenueStats._count,
          totalBookings: bookingStats.reduce((sum, s) => sum + s._count, 0),
          pendingBookings: bookingStats.find(s => s.status === 'PENDING')?._count || 0,
          confirmedBookings: bookingStats.find(s => s.status === 'CONFIRMED')?._count || 0,
          cancelledBookings: bookingStats.find(s => s.status === 'CANCELLED')?._count || 0,
          avgRating: avgRating._avg.rating || 0,
          reviewCount: avgRating._count
        }
      }
    })

  } catch (error) {
    console.error('[Fleet Vehicle Detail] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch vehicle' }, { status: 500 })
  }
}

// PUT - Update vehicle (approval status, notes, suspend)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateFleetKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { action, notes, adminId } = body

    const vehicle = await prisma.rentalCar.findUnique({
      where: { id },
      include: {
        host: {
          select: { partnerCompanyName: true, email: true }
        }
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    let updateData: any = {}
    let logMessage = ''

    switch (action) {
      case 'approve':
        updateData = {
          fleetApprovalStatus: 'APPROVED',
          fleetApprovalDate: new Date(),
          fleetApprovalNotes: notes || 'Approved by fleet admin',
          fleetApprovedBy: adminId || 'fleet_admin',
          status: vehicle.status === 'PENDING_APPROVAL' ? 'ACTIVE' : vehicle.status
        }
        logMessage = `Vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model} approved`
        break

      case 'reject':
        if (!notes) {
          return NextResponse.json(
            { error: 'Rejection reason is required' },
            { status: 400 }
          )
        }
        updateData = {
          fleetApprovalStatus: 'REJECTED',
          fleetApprovalDate: new Date(),
          fleetApprovalNotes: notes,
          fleetApprovedBy: adminId || 'fleet_admin',
          status: 'INACTIVE'
        }
        logMessage = `Vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model} rejected: ${notes}`
        break

      case 'suspend':
        updateData = {
          status: 'SUSPENDED',
          fleetApprovalNotes: notes || 'Suspended by fleet admin'
        }
        logMessage = `Vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model} suspended`
        break

      case 'reactivate':
        if (vehicle.fleetApprovalStatus !== 'APPROVED') {
          return NextResponse.json(
            { error: 'Vehicle must be approved before reactivating' },
            { status: 400 }
          )
        }
        updateData = {
          status: 'ACTIVE'
        }
        logMessage = `Vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model} reactivated`
        break

      case 'request_changes':
        updateData = {
          fleetApprovalStatus: 'CHANGES_REQUESTED',
          fleetApprovalNotes: notes || 'Changes requested by fleet admin'
        }
        logMessage = `Changes requested for vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model}`
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update vehicle
    const updated = await prisma.rentalCar.update({
      where: { id },
      data: updateData
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'VEHICLE_STATUS_CHANGE',
        hostId: vehicle.hostId,
        message: logMessage,
        metadata: {
          vehicleId: id,
          action,
          notes,
          previousStatus: vehicle.status,
          previousApprovalStatus: vehicle.fleetApprovalStatus,
          newStatus: updateData.status || vehicle.status,
          newApprovalStatus: updateData.fleetApprovalStatus || vehicle.fleetApprovalStatus,
          adminId: adminId || 'fleet_admin'
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: logMessage,
      vehicle: {
        id: updated.id,
        status: updated.status,
        fleetApprovalStatus: updated.fleetApprovalStatus,
        fleetApprovalNotes: updated.fleetApprovalNotes
      }
    })

  } catch (error) {
    console.error('[Fleet Vehicle Update] Error:', error)
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 })
  }
}

// PATCH - Quick vehicle actions (approve, reject, suspend, activate)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateFleetKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { action, reason } = body

    const vehicle = await prisma.rentalCar.findUnique({
      where: { id },
      include: {
        host: {
          select: { partnerCompanyName: true, email: true }
        }
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    let updateData: any = {}
    let logMessage = ''

    switch (action) {
      case 'approve':
        updateData = {
          fleetApprovalStatus: 'APPROVED',
          fleetApprovalDate: new Date(),
          fleetApprovalNotes: reason || 'Approved by fleet admin',
          fleetApprovedBy: 'fleet_admin',
          isActive: true
        }
        logMessage = `Vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model} approved`
        break

      case 'reject':
        updateData = {
          fleetApprovalStatus: 'REJECTED',
          fleetApprovalDate: new Date(),
          fleetApprovalNotes: reason || 'Rejected by fleet admin',
          fleetApprovedBy: 'fleet_admin',
          isActive: false
        }
        logMessage = `Vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model} rejected`
        break

      case 'suspend':
        updateData = {
          isActive: false,
          fleetApprovalNotes: reason || 'Suspended by fleet admin'
        }
        logMessage = `Vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model} suspended`
        break

      case 'activate':
        updateData = {
          isActive: true
        }
        logMessage = `Vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model} activated`
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update vehicle
    const updated = await prisma.rentalCar.update({
      where: { id },
      data: updateData
    })

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          type: 'VEHICLE_STATUS_CHANGE',
          hostId: vehicle.hostId,
          message: logMessage,
          metadata: {
            vehicleId: id,
            action,
            reason,
            previousIsActive: vehicle.isActive,
            newIsActive: updated.isActive,
            adminId: 'fleet_admin'
          }
        }
      })
    } catch (logError) {
      console.error('[Fleet Vehicle PATCH] Activity log error:', logError)
    }

    return NextResponse.json({
      success: true,
      message: logMessage,
      vehicle: {
        id: updated.id,
        isActive: updated.isActive,
        fleetApprovalStatus: updated.fleetApprovalStatus,
        fleetApprovalNotes: updated.fleetApprovalNotes
      }
    })

  } catch (error) {
    console.error('[Fleet Vehicle PATCH] Error:', error)
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 })
  }
}
