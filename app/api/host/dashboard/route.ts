// app/api/host/dashboard/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get hostId from query params
    const { searchParams } = new URL(request.url)
    const hostId = searchParams.get('hostId')
    
    if (!hostId) {
      return NextResponse.json(
        { error: 'Host ID is required' },
        { status: 400 }
      )
    }

    // Fetch complete host data
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            lastActive: true
          }
        },
        cars: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            color: true,
            trim: true,
            isActive: true,
            dailyRate: true,
            vin: true,
            licensePlate: true,
            // Use 'rules' or 'features' as a proxy for description completeness
            rules: true,
            features: true,
            city: true,
            state: true,
            photos: {
              select: {
                id: true,
                url: true
              }
            },
            _count: {
              select: {
                bookings: true,
                photos: true
              }
            }
          }
        },
        bookings: {
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            totalAmount: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 3
        }
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    // Get claims count
    let claimsCount = 0
    try {
      claimsCount = await prisma.claim.count({
        where: {
          hostId: hostId,
          status: 'PENDING'
        }
      })
    } catch (err) {
      console.error('Error fetching claims:', err)
    }

    // Get unread messages count
    let unreadMessagesCount = 0
    try {
      unreadMessagesCount = await prisma.rentalMessage.count({
        where: {
          booking: {
            hostId: hostId
          },
          senderId: {
            not: hostId
          },
          isRead: false
        }
      })
    } catch (err) {
      console.error('Error fetching unread messages:', err)
    }

    // Calculate additional stats
    const stats = {
      totalCars: host.cars.length,
      activeCars: host.cars.filter(car => car.isActive).length,
      totalTrips: host.totalTrips || 0,
      rating: host.rating || 0,
      responseRate: host.responseRate || 0,
      acceptanceRate: host.acceptanceRate || 0,
      totalBookings: host.bookings.length,
      totalEarnings: host.totalEarnings || 0,
      monthlyEarnings: 0,
      pendingClaims: claimsCount,
      unreadMessages: unreadMessagesCount
    }

    // Format cars with completion status data
    const formattedCars = host.cars.map(car => {
      // Calculate if car has enough content (rules/features as proxy for completeness)
      const hasRules = Array.isArray(car.rules) && car.rules.length > 0
      const hasFeatures = Array.isArray(car.features) && car.features.length > 0
      
      return {
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        color: car.color,
        trim: car.trim,
        isActive: car.isActive,
        dailyRate: car.dailyRate,
        vin: car.vin,
        licensePlate: car.licensePlate,
        // Use rules/features as proxy for "description complete"
        hasRules: hasRules,
        hasFeatures: hasFeatures,
        rules: car.rules,
        features: car.features,
        location: `${car.city}, ${car.state}`,
        photos: car.photos,
        photoCount: car._count.photos,
        bookingCount: car._count.bookings
      }
    })

    // Format response
    const responseData = {
      host: {
        id: host.id,
        name: host.name,
        email: host.email,
        phone: host.phone,
        profilePhoto: host.profilePhoto,
        bio: host.bio,
        city: host.city,
        state: host.state,
        
        // Status info
        approvalStatus: host.approvalStatus,
        isVerified: host.isVerified,
        active: host.active,
        dashboardAccess: host.dashboardAccess,
        
        // Permissions
        permissions: {
          canViewBookings: host.canViewBookings,
          canEditCalendar: host.canEditCalendar,
          canSetPricing: host.canSetPricing,
          canMessageGuests: host.canMessageGuests,
          canWithdrawFunds: host.canWithdrawFunds
        },
        
        // Documents - for verification progress
        documentStatuses: {
          governmentId: host.governmentIdUrl ? 'UPLOADED' : 'NOT_STARTED',
          driversLicense: host.driversLicenseUrl ? 'UPLOADED' : 'NOT_STARTED',
          insurance: host.insuranceDocUrl ? 'UPLOADED' : 'NOT_STARTED'
        },
        documents: {
          governmentIdUrl: host.governmentIdUrl,
          driversLicenseUrl: host.driversLicenseUrl,
          insuranceDocUrl: host.insuranceDocUrl,
          documentsVerified: host.documentsVerified
        },
        
        // Financial
        commissionRate: host.commissionRate,
        bankVerified: host.bankVerified,
        requireDeposit: host.requireDeposit,
        depositAmount: host.depositAmount,
        
        // Stats
        stats: stats,
        
        // Cars with full data for completion checking
        cars: formattedCars,
        
        recentBookings: host.bookings,
        recentReviews: host.reviews,
        
        // Dates
        joinedAt: host.joinedAt,
        createdAt: host.createdAt,
        updatedAt: host.updatedAt
      }
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}