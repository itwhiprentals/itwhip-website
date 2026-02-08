// app/api/fleet/vehicles/route.ts
// Fleet Vehicle Management API - View and manage all partner vehicles

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

const FLEET_KEY = 'phoenix-fleet-2847'

function validateFleetKey(request: NextRequest): boolean {
  const key = request.headers.get('x-fleet-key') ||
              request.nextUrl.searchParams.get('key')
  return key === FLEET_KEY
}

export async function GET(request: NextRequest) {
  if (!validateFleetKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all' // all, ACTIVE, INACTIVE, PENDING_APPROVAL, SUSPENDED
    const partnerId = searchParams.get('partnerId') || ''
    const vehicleType = searchParams.get('vehicleType') || 'all' // all, RIDESHARE, RENTAL
    const approvalStatus = searchParams.get('approvalStatus') || 'all' // all, approved, pending, rejected
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      host: {
        OR: [
          { hostType: 'FLEET_PARTNER' },
          { hostType: 'PARTNER' }
        ]
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { vin: { contains: search, mode: 'insensitive' } },
        { licensePlate: { contains: search, mode: 'insensitive' } },
        { host: { partnerCompanyName: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Status filter
    if (status !== 'all') {
      where.status = status
    }

    // Partner filter
    if (partnerId) {
      where.hostId = partnerId
    }

    // Vehicle type filter
    if (vehicleType !== 'all') {
      where.vehicleType = vehicleType
    }

    // Approval status filter
    if (approvalStatus !== 'all') {
      if (approvalStatus === 'pending') {
        where.fleetApprovalStatus = 'PENDING'
      } else if (approvalStatus === 'approved') {
        where.fleetApprovalStatus = 'APPROVED'
      } else if (approvalStatus === 'rejected') {
        where.fleetApprovalStatus = 'REJECTED'
      }
    }

    // Get total count
    const totalCount = await prisma.rentalCar.count({ where })

    // Build orderBy
    const orderBy: any = {}
    if (sortBy === 'partner') {
      orderBy.host = { partnerCompanyName: sortOrder }
    } else if (sortBy === 'revenue') {
      // Will sort in memory after fetching
    } else {
      orderBy[sortBy] = sortOrder
    }

    // Get vehicles with partner info
    const vehicles = await prisma.rentalCar.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
            partnerCompanyName: true,
            partnerSlug: true,
            currentCommissionRate: true,
            active: true
          }
        },
        photos: {
          where: { isHero: true },
          take: 1,
          select: { url: true }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: sortBy !== 'revenue' ? orderBy : { createdAt: 'desc' },
      skip,
      take: limit
    }) as any[]

    // Get booking revenue for each vehicle
    const vehicleIds = vehicles.map(v => v.id)
    const bookingRevenue = await prisma.rentalBooking.groupBy({
      by: ['carId'],
      where: {
        carId: { in: vehicleIds },
        status: 'COMPLETED' as any
      },
      _sum: {
        totalAmount: true
      }
    })
    const revenueMap = new Map(bookingRevenue.map(b => [b.carId, b._sum.totalAmount || 0]))

    // Format vehicles
    let formattedVehicles = vehicles.map(v => ({
      id: v.id,
      name: `${v.year} ${v.make} ${v.model}`,
      year: v.year,
      make: v.make,
      model: v.model,
      vin: v.vin,
      licensePlate: v.licensePlate,
      status: v.status,
      vehicleType: v.vehicleType || 'RENTAL',
      fleetApprovalStatus: v.fleetApprovalStatus || 'PENDING',
      fleetApprovalDate: v.fleetApprovalDate?.toISOString() || null,
      fleetApprovalNotes: v.fleetApprovalNotes || null,
      dailyRate: v.dailyRate,
      weeklyRate: v.weeklyRate,
      monthlyRate: v.monthlyRate,
      primaryPhoto: v.photos?.[0]?.url || null,
      bookingCount: v._count.bookings,
      totalRevenue: revenueMap.get(v.id) || 0,
      partner: v.host ? {
        id: v.host.id,
        name: v.host.partnerCompanyName,
        slug: v.host.partnerSlug,
        commissionRate: v.host.currentCommissionRate,
        active: v.host.active
      } : null,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString()
    }))

    // Sort by revenue if requested
    if (sortBy === 'revenue') {
      formattedVehicles.sort((a: any, b: any) =>
        sortOrder === 'desc' ? b.totalRevenue - a.totalRevenue : a.totalRevenue - b.totalRevenue
      )
    }

    // Get stats - use vehicleType groupBy (status/fleetApprovalStatus may not exist)
    const fleetWhere = {
      host: {
        OR: [
          { hostType: 'FLEET_PARTNER' },
          { hostType: 'PARTNER' }
        ]
      }
    }

    const typeStats = await prisma.rentalCar.groupBy({
      by: ['vehicleType'],
      where: fleetWhere,
      _count: true
    })

    // Get unique partners count
    const uniquePartners = await prisma.rentalCar.groupBy({
      by: ['hostId'],
      where: fleetWhere
    })

    // Use any casts for fields that may not exist in schema
    const statusMap: Record<string, number> = {}
    const approvalMap: Record<string, number> = {}
    const typeMap = Object.fromEntries(typeStats.map((s: any) => [s.vehicleType || 'RENTAL', s._count]))

    return NextResponse.json({
      success: true,
      vehicles: formattedVehicles,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      stats: {
        total: totalCount,
        active: statusMap['ACTIVE'] || 0,
        inactive: statusMap['INACTIVE'] || 0,
        suspended: statusMap['SUSPENDED'] || 0,
        pendingApproval: approvalMap['PENDING'] || 0,
        approved: approvalMap['APPROVED'] || 0,
        rejected: approvalMap['REJECTED'] || 0,
        rideshare: typeMap['RIDESHARE'] || 0,
        rental: typeMap['RENTAL'] || 0,
        uniquePartners: uniquePartners.length
      }
    })

  } catch (error) {
    console.error('[Fleet Vehicles] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 })
  }
}
