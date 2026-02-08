// app/fleet/api/hosts/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847' && !request.headers.get('authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query params
    const filter = request.nextUrl.searchParams.get('filter') || 'all'
    const search = request.nextUrl.searchParams.get('search') || ''

    // Build where conditions - exclude partners from hosts list
    let whereConditions: any = {
      hostType: { notIn: ['FLEET_PARTNER', 'PARTNER'] }
    }

    // Apply filter
    switch(filter) {
      case 'approved':
        whereConditions.approvalStatus = 'APPROVED'
        break
      case 'pending':
        whereConditions.approvalStatus = 'PENDING'
        break
      case 'suspended':
        whereConditions.approvalStatus = 'SUSPENDED'
        break
      case 'real':
        whereConditions.hostType = 'REAL'
        break
      case 'managed':
        whereConditions.hostType = 'MANAGED'
        break
    }

    // Apply search
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Fetch hosts
    const hosts = await prisma.rentalHost.findMany({
      where: whereConditions,
      include: {
        cars: {
          select: {
            id: true,
            isActive: true
          }
        },
        _count: {
          select: {
            cars: true,
            bookings: true,
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get stats (excluding partners)
    const excludePartners = { hostType: { notIn: ['FLEET_PARTNER', 'PARTNER'] } }
    const [
      totalHosts,
      pendingHosts,
      approvedHosts,
      suspendedHosts,
      realHosts,
      managedHosts
    ] = await Promise.all([
      prisma.rentalHost.count({ where: excludePartners }),
      prisma.rentalHost.count({ where: { approvalStatus: 'PENDING', ...excludePartners } }),
      prisma.rentalHost.count({ where: { approvalStatus: 'APPROVED', ...excludePartners } }),
      prisma.rentalHost.count({ where: { approvalStatus: 'SUSPENDED', ...excludePartners } }),
      prisma.rentalHost.count({ where: { hostType: 'REAL' } }),
      prisma.rentalHost.count({ where: { hostType: 'MANAGED' } })
    ])

    // Transform hosts data
    const transformedHosts = hosts.map(host => ({
      id: host.id,
      name: host.name,
      email: host.email,
      phone: host.phone,
      city: host.city,
      state: host.state,
      profilePhoto: host.profilePhoto,

      hostType: host.hostType,
      approvalStatus: host.approvalStatus,
      active: host.active,
      documentsVerified: host.documentsVerified,

      totalTrips: host.totalTrips,
      rating: host.rating,
      commissionRate: host.commissionRate,

      carCount: host._count.cars,
      activeCarCount: host.cars.filter(car => car.isActive).length,

      joinedAt: host.joinedAt.toISOString(),
      approvedAt: host.approvedAt?.toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: transformedHosts,
      stats: {
        total: totalHosts,
        pending: pendingHosts,
        approved: approvedHosts,
        suspended: suspendedHosts,
        real: realHosts,
        managed: managedHosts
      }
    })

  } catch (error) {
    console.error('Failed to fetch hosts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hosts' },
      { status: 500 }
    )
  }
}

// Create new puppet/managed host
export async function POST(request: NextRequest) {
  try {
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847' && !request.headers.get('authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      city = 'Phoenix',
      state = 'AZ',
      bio,
      profilePhoto
    } = body

    // Validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      )
    }

    // Check if email exists
    const existingHost = await prisma.rentalHost.findUnique({
      where: { email }
    })

    if (existingHost) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      )
    }

    // Create managed/puppet host
    const newHost = await prisma.rentalHost.create({
      data: {
        name,
        email,
        phone,
        bio,
        profilePhoto,
        city,
        state,

        // Set as managed host with full approval
        hostType: 'MANAGED',
        approvalStatus: 'APPROVED',
        dashboardAccess: false, // Puppet hosts don't need dashboard
        active: true,
        isVerified: true,
        verifiedAt: new Date(),
        documentsVerified: true,

        // Default permissions (all false for puppet hosts)
        canViewBookings: false,
        canEditCalendar: false,
        canSetPricing: false,
        canMessageGuests: false,
        canWithdrawFunds: false,

        // Default commission for puppet hosts
        commissionRate: 0, // No commission for managed hosts

        // Approval tracking
        approvedBy: 'fleet-admin',
        approvedAt: new Date()
      } as any
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        category: 'HOST_MANAGEMENT',
        eventType: 'puppet_host_created',
        severity: 'INFO',
        adminEmail: request.headers.get('user-email') || 'fleet-admin',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        action: 'create',
        resource: 'puppet_host',
        resourceId: newHost.id,
        details: {
          hostName: name,
          hostEmail: email,
          hostType: 'MANAGED'
        },
        hash: '',
        verified: false
      } as any
    })

    return NextResponse.json({
      success: true,
      message: 'Puppet host created successfully',
      data: newHost
    })

  } catch (error) {
    console.error('Failed to create puppet host:', error)
    return NextResponse.json(
      { error: 'Failed to create puppet host' },
      { status: 500 }
    )
  }
}