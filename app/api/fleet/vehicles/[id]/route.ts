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

    const vehicle: any = await prisma.rentalCar.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            partnerCompanyName: true,
            partnerSlug: true,
            currentCommissionRate: true,
            active: true,
            email: true,
            phone: true,
            approvalStatus: true,
            documentsVerified: true,
            isVerified: true,
            hostType: true,
            stripeConnectAccountId: true,
            stripeAccountStatus: true,
            stripePayoutsEnabled: true,
            stripeChargesEnabled: true,
            bankVerified: true,
            photoIdVerified: true,
            rating: true,
            totalTrips: true,
            profilePhoto: true,
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
            comment: true,
            createdAt: true
          }
        },
        VehicleServiceRecord: {
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
    const bookingStats: any[] = await (prisma.rentalBooking.groupBy as any)({
      by: ['status'],
      where: { carId: id },
      _count: true
    })

    // Calculate average rating
    const avgRating = await prisma.rentalReview.aggregate({
      where: {
        carId: id
      },
      _avg: { rating: true },
      _count: true
    })

    // Build listing blockers
    const blockers: { key: string; label: string; severity: 'error' | 'warning' }[] = []
    if (!vehicle.isActive) blockers.push({ key: 'inactive', label: 'Car is deactivated', severity: 'error' })
    if (!vehicle.host) blockers.push({ key: 'no_host', label: 'No host assigned', severity: 'error' })
    if (vehicle.host?.approvalStatus !== 'APPROVED') blockers.push({ key: 'host_not_approved', label: `Host status: ${vehicle.host?.approvalStatus || 'N/A'}`, severity: 'error' })
    if (vehicle.dailyRate <= 0) blockers.push({ key: 'no_rate', label: 'Daily rate is $0', severity: 'error' })
    if (vehicle.photos.length === 0) blockers.push({ key: 'no_photos', label: 'No photos uploaded', severity: 'error' })
    if (vehicle.hasActiveClaim) blockers.push({ key: 'active_claim', label: 'Active claim on vehicle', severity: 'error' })
    if (vehicle.safetyHold) blockers.push({ key: 'safety_hold', label: `Safety hold: ${vehicle.safetyHoldReason || 'No reason'}`, severity: 'error' })
    if (vehicle.requiresInspection) blockers.push({ key: 'inspection', label: 'Requires inspection', severity: 'warning' })
    if (!vehicle.host?.stripePayoutsEnabled) blockers.push({ key: 'stripe_payouts', label: 'Host Stripe payouts not enabled', severity: 'warning' })
    if (!vehicle.host?.documentsVerified) blockers.push({ key: 'docs_not_verified', label: 'Host documents not verified', severity: 'warning' })
    if (vehicle.year < 2015 && vehicle.vehicleType === 'RENTAL') blockers.push({ key: 'old_vehicle', label: `${vehicle.year} vehicle — consider changing to Rideshare`, severity: 'warning' })
    if (!vehicle.address || !vehicle.city) blockers.push({ key: 'no_location', label: 'Missing pickup location', severity: 'warning' })
    if (!vehicle.transmission) blockers.push({ key: 'no_transmission', label: 'Transmission not set', severity: 'warning' })

    // Determine if car would appear in search
    const isSearchable = vehicle.isActive &&
      vehicle.host?.approvalStatus === 'APPROVED' &&
      vehicle.dailyRate > 0 &&
      vehicle.photos.length > 0

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
        isActive: vehicle.isActive,
        vehicleType: vehicle.vehicleType || 'RENTAL',
        carType: vehicle.carType,
        // Claim fields
        hasActiveClaim: vehicle.hasActiveClaim,
        activeClaimId: vehicle.activeClaimId,
        claimDeactivatedAt: vehicle.claimDeactivatedAt?.toISOString() || null,
        safetyHold: vehicle.safetyHold,
        safetyHoldReason: vehicle.safetyHoldReason,
        requiresInspection: vehicle.requiresInspection,
        // Pricing
        dailyRate: vehicle.dailyRate,
        weeklyRate: vehicle.weeklyRate,
        monthlyRate: vehicle.monthlyRate,
        deliveryFee: vehicle.deliveryFee,
        insuranceDaily: vehicle.insuranceDaily,
        insuranceIncluded: vehicle.insuranceIncluded,
        noDeposit: vehicle.noDeposit,
        // Details
        color: vehicle.color,
        seats: vehicle.seats,
        doors: vehicle.doors,
        transmission: vehicle.transmission,
        fuelType: vehicle.fuelType,
        currentMileage: vehicle.currentMileage,
        instantBook: vehicle.instantBook,
        // Photos
        primaryPhoto: vehicle.photos.find((p: any) => p.isHero)?.url || vehicle.photos[0]?.url || null,
        photos: vehicle.photos.map((p: any) => p.url),
        photoCount: vehicle.photos.length,
        // Features
        features: vehicle.features || '',
        description: vehicle.description,
        // Location
        address: vehicle.address,
        city: vehicle.city,
        state: vehicle.state,
        zipCode: vehicle.zipCode,
        airportPickup: vehicle.airportPickup,
        hotelDelivery: vehicle.hotelDelivery,
        homeDelivery: vehicle.homeDelivery,
        // Trip settings
        minTripDuration: vehicle.minTripDuration,
        maxTripDuration: vehicle.maxTripDuration,
        // Timestamps
        createdAt: vehicle.createdAt.toISOString(),
        updatedAt: vehicle.updatedAt.toISOString(),
        // Listing readiness
        isSearchable,
        blockers,
        // Host (full detail for summary page)
        host: vehicle.host ? {
          id: vehicle.host.id,
          name: vehicle.host.partnerCompanyName || vehicle.host.name,
          email: vehicle.host.email,
          phone: vehicle.host.phone,
          hostType: vehicle.host.hostType,
          approvalStatus: vehicle.host.approvalStatus,
          active: vehicle.host.active,
          documentsVerified: vehicle.host.documentsVerified,
          isVerified: vehicle.host.isVerified,
          photoIdVerified: vehicle.host.photoIdVerified,
          stripeConnected: !!vehicle.host.stripeConnectAccountId,
          stripePayoutsEnabled: vehicle.host.stripePayoutsEnabled,
          stripeChargesEnabled: vehicle.host.stripeChargesEnabled,
          bankVerified: vehicle.host.bankVerified,
          commissionRate: vehicle.host.currentCommissionRate,
          rating: vehicle.host.rating,
          totalTrips: vehicle.host.totalTrips,
          profilePhoto: vehicle.host.profilePhoto,
        } : null,
        // Recent activity
        recentBookings: vehicle.bookings.map((b: any) => ({
          id: b.id,
          bookingCode: b.bookingCode,
          status: b.status,
          startDate: b.startDate.toISOString(),
          endDate: b.endDate.toISOString(),
          totalAmount: b.totalAmount,
          guestName: b.renter?.name || b.guestName || 'Guest'
        })),
        recentReviews: vehicle.reviews.map((r: any) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt.toISOString()
        })),
        recentMaintenance: vehicle.VehicleServiceRecord.map((s: any) => ({
          id: s.id,
          type: s.serviceType,
          date: s.serviceDate.toISOString(),
          cost: s.costTotal
        })),
        // Stats
        stats: {
          totalRevenue: revenueStats._sum.totalAmount || 0,
          completedBookings: revenueStats._count,
          totalBookings: bookingStats.reduce((sum: number, s: any) => sum + s._count, 0),
          pendingBookings: bookingStats.find((s: any) => s.status === 'PENDING')?._count || 0,
          confirmedBookings: bookingStats.find((s: any) => s.status === 'CONFIRMED')?._count || 0,
          cancelledBookings: bookingStats.find((s: any) => s.status === 'CANCELLED')?._count || 0,
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

    const vehicle: any = await prisma.rentalCar.findUnique({
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
          isActive: true
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
          isActive: false
        }
        logMessage = `Vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model} rejected: ${notes}`
        break

      case 'suspend':
        updateData = {
          isActive: false
        }
        logMessage = `Vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model} suspended`
        break

      case 'reactivate':
        updateData = {
          isActive: true
        }
        logMessage = `Vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model} reactivated`
        break

      case 'request_changes':
        updateData = {}
        logMessage = `Changes requested for vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model}`
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update vehicle
    const updated: any = await prisma.rentalCar.update({
      where: { id },
      data: updateData
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        action: 'VEHICLE_STATUS_CHANGE',
        entityType: 'RentalCar',
        entityId: id,
        hostId: vehicle.hostId,
        metadata: {
          vehicleId: id,
          action,
          notes,
          logMessage,
          previousIsActive: vehicle.isActive,
          newIsActive: updated.isActive,
          adminId: adminId || 'fleet_admin'
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: logMessage,
      vehicle: {
        id: updated.id,
        isActive: updated.isActive
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

    const vehicle: any = await prisma.rentalCar.findUnique({
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
          isActive: true
        }
        logMessage = `Vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model} approved`
        break

      case 'reject':
        updateData = {
          isActive: false
        }
        logMessage = `Vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model} rejected`
        break

      case 'suspend':
        updateData = {
          isActive: false
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
    const updated: any = await prisma.rentalCar.update({
      where: { id },
      data: updateData
    })

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          action: 'VEHICLE_STATUS_CHANGE',
          entityType: 'RentalCar',
          entityId: id,
          hostId: vehicle.hostId,
          metadata: {
            vehicleId: id,
            action,
            reason,
            logMessage,
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
        isActive: updated.isActive
      }
    })

  } catch (error) {
    console.error('[Fleet Vehicle PATCH] Error:', error)
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 })
  }
}
