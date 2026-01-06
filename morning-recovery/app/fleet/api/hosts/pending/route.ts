// app/fleet/api/hosts/pending/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verify fleet access (check for secret key)
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847' && !request.headers.get('authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get filter from query params
    const filter = request.nextUrl.searchParams.get('filter')
    
    // Build query conditions
    let whereConditions: any = {
      approvalStatus: 'PENDING',
      hostType: 'REAL' // Only show real host applications, not puppet hosts
    }

    // Apply filters
    if (filter === 'complete') {
      whereConditions.AND = [
        { governmentIdUrl: { not: null } },
        { driversLicenseUrl: { not: null } }
      ]
    } else if (filter === 'incomplete') {
      whereConditions.OR = [
        { governmentIdUrl: null },
        { driversLicenseUrl: null }
      ]
    }

    // Fetch pending hosts with related data
    const hosts = await prisma.rentalHost.findMany({
      where: whereConditions,
      include: {
        cars: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true
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
        createdAt: 'desc' // Newest applications first
      }
    })

    // Transform data for frontend
    const transformedHosts = hosts.map(host => ({
      id: host.id,
      name: host.name,
      email: host.email,
      phone: host.phone,
      city: host.city,
      state: host.state,
      zipCode: host.zipCode,
      bio: host.bio,
      profilePhoto: host.profilePhoto,
      
      // Documents
      governmentIdUrl: host.governmentIdUrl,
      driversLicenseUrl: host.driversLicenseUrl,
      insuranceDocUrl: host.insuranceDocUrl,
      documentsVerified: host.documentsVerified,
      
      // Status
      hostType: host.hostType,
      approvalStatus: host.approvalStatus,
      
      // Timestamps
      createdAt: host.createdAt.toISOString(),
      joinedAt: host.joinedAt.toISOString(),
      
      // Stats
      totalTrips: host.totalTrips,
      rating: host.rating,
      
      // Vehicle info
      hasVehicles: host._count.cars > 0,
      vehicleCount: host._count.cars,
      vehicles: host.cars
    }))

    // Get counts for dashboard
    const totalPending = await prisma.rentalHost.count({
      where: {
        approvalStatus: 'PENDING',
        hostType: 'REAL'
      }
    })

    const withCompleteDocuments = await prisma.rentalHost.count({
      where: {
        approvalStatus: 'PENDING',
        hostType: 'REAL',
        governmentIdUrl: { not: null },
        driversLicenseUrl: { not: null }
      }
    })

    const missingDocuments = totalPending - withCompleteDocuments

    return NextResponse.json({
      success: true,
      data: transformedHosts,
      stats: {
        total: totalPending,
        complete: withCompleteDocuments,
        incomplete: missingDocuments
      }
    })

  } catch (error) {
    console.error('Failed to fetch pending hosts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending hosts' },
      { status: 500 }
    )
  }
}

// Mark notification as read when viewing pending hosts
export async function POST(request: NextRequest) {
  try {
    // Mark all HOST_APPLICATION notifications as read
    await prisma.adminNotification.updateMany({
      where: {
        type: 'HOST_APPLICATION',
        status: 'UNREAD'
      },
      data: {
        status: 'READ',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read'
    })

  } catch (error) {
    console.error('Failed to update notifications:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}