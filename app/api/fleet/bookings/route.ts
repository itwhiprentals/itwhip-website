// app/api/fleet/bookings/route.ts
// Fleet Booking Management API - View all partner bookings

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
    const status = searchParams.get('status') || 'all'
    const partnerId = searchParams.get('partnerId') || ''
    const vehicleId = searchParams.get('vehicleId') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause - only partner bookings
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
        { bookingCode: { contains: search, mode: 'insensitive' } },
        { guestName: { contains: search, mode: 'insensitive' } },
        { guestEmail: { contains: search, mode: 'insensitive' } },
        { renter: { name: { contains: search, mode: 'insensitive' } } },
        { renter: { email: { contains: search, mode: 'insensitive' } } },
        { car: { make: { contains: search, mode: 'insensitive' } } },
        { car: { model: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Status filter
    if (status !== 'all') {
      where.status = status
    }

    // Partner filter - use direct hostId on booking
    if (partnerId) {
      where.hostId = partnerId
    }

    // Vehicle filter
    if (vehicleId) {
      where.carId = vehicleId
    }

    // Date range filter
    if (dateFrom) {
      where.startDate = { ...(where.startDate || {}), gte: new Date(dateFrom) }
    }
    if (dateTo) {
      where.endDate = { ...(where.endDate || {}), lte: new Date(dateTo) }
    }

    // Get total count
    const totalCount = await prisma.rentalBooking.count({ where })

    // Build orderBy
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // Get bookings
    const bookings = await prisma.rentalBooking.findMany({
      where,
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            photos: {
              where: { isHero: true },
              take: 1,
              select: { url: true }
            }
          }
        },
        host: {
          select: {
            id: true,
            partnerCompanyName: true,
            partnerSlug: true,
            currentCommissionRate: true
          }
        },
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    })

    // Format bookings
    const formattedBookings = bookings.map(b => ({
      id: b.id,
      bookingCode: b.bookingCode || b.id.slice(0, 8),
      status: b.status,
      // Guest
      guestName: b.renter?.name || b.guestName || 'Guest',
      guestEmail: b.renter?.email || b.guestEmail || '',
      guestPhone: b.renter?.phone || b.guestPhone || '',
      guestId: b.renter?.id || null,
      // Vehicle
      vehicle: b.car ? {
        id: b.car.id,
        name: `${b.car.year} ${b.car.make} ${b.car.model}`,
        photo: b.car.photos?.[0]?.url || null
      } : null,
      // Partner
      partner: b.host ? {
        id: b.host.id,
        name: b.host.partnerCompanyName,
        slug: b.host.partnerSlug,
        commissionRate: b.host.currentCommissionRate
      } : null,
      // Dates
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
      // Financial
      totalAmount: b.totalAmount || 0,
      commission: b.host
        ? (b.totalAmount || 0) * (b.host.currentCommissionRate || 0.25)
        : 0,
      netAmount: b.host
        ? (b.totalAmount || 0) * (1 - (b.host.currentCommissionRate || 0.25))
        : 0,
      // Timestamps
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString()
    }))

    // Get stats - use hostId filter if provided
    const statsWhere: any = {
      host: {
        OR: [
          { hostType: 'FLEET_PARTNER' },
          { hostType: 'PARTNER' }
        ]
      }
    }
    if (partnerId) {
      statsWhere.hostId = partnerId
    }

    const stats = await prisma.rentalBooking.groupBy({
      by: ['status'],
      where: statsWhere,
      _count: true,
      _sum: {
        totalAmount: true
      }
    })

    const statusMap = Object.fromEntries(stats.map(s => [s.status, {
      count: s._count,
      revenue: s._sum.totalAmount || 0
    }]))

    // Get unique partners count
    const uniquePartners = await prisma.rentalBooking.findMany({
      where: {
        host: {
          OR: [
            { hostType: 'FLEET_PARTNER' },
            { hostType: 'PARTNER' }
          ]
        }
      },
      select: {
        hostId: true
      },
      distinct: ['hostId']
    })

    const partnerIds = new Set(uniquePartners.map(b => b.hostId).filter(Boolean))

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      stats: {
        total: totalCount,
        pending: statusMap['PENDING']?.count || 0,
        confirmed: statusMap['CONFIRMED']?.count || 0,
        inProgress: statusMap['IN_PROGRESS']?.count || 0,
        completed: statusMap['COMPLETED']?.count || 0,
        cancelled: statusMap['CANCELLED']?.count || 0,
        totalRevenue: Object.values(statusMap).reduce((sum: number, s: any) => sum + (s.revenue || 0), 0),
        completedRevenue: statusMap['COMPLETED']?.revenue || 0,
        uniquePartners: partnerIds.size
      }
    })

  } catch (error) {
    console.error('[Fleet Bookings] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
