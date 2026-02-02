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
            description: true,
            rules: true,
            features: true,
            city: true,
            state: true,
            rating: true,
            photos: {
              select: {
                id: true,
                url: true,
                isHero: true
              },
              orderBy: {
                order: 'asc'
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
            totalAmount: true,
            guestName: true,
            reviewerProfile: {
              select: {
                id: true,
                name: true,
                profilePhotoUrl: true,
              }
            },
            renter: {
              select: {
                id: true,
                name: true,
                image: true,
                avatar: true,
              }
            },
            car: {
              select: {
                make: true,
                model: true,
                year: true,
                photos: {
                  select: { url: true, isHero: true },
                  orderBy: { order: 'asc' },
                  take: 3
                }
              }
            }
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
            createdAt: true,
            reviewerProfile: {
              select: {
                name: true,
                profilePhotoUrl: true,
              }
            },
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        },
        _count: {
          select: {
            reviews: true,
            bookings: true
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

    // Cast to any for included relations
    const h: any = host

    // Get claims counts
    let claimsCount = 0
    let claimsApproved = 0
    let claimsPending = 0
    let claimsAmount = 0
    try {
      const allClaims = await prisma.claim.findMany({
        where: { hostId: hostId },
        select: { status: true, estimatedCost: true }
      })
      claimsCount = allClaims.length
      claimsPending = allClaims.filter(c => c.status === 'PENDING' || c.status === 'UNDER_REVIEW').length
      claimsApproved = allClaims.filter(c => c.status === 'APPROVED' || c.status === 'PAID').length
      claimsAmount = allClaims.reduce((sum, c) => sum + Number(c.estimatedCost || 0), 0)
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

    // Get managed vehicles count (for fleet managers)
    let managedVehiclesCount = 0
    try {
      managedVehiclesCount = await prisma.vehicleManagement.count({
        where: {
          managerId: hostId,
          status: 'ACTIVE'
        }
      })
    } catch (err) {
      // VehicleManagement table might not exist yet
      console.error('Error fetching managed vehicles:', err)
    }

    // Query booking stats by status
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - 7)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    // Get all booking status counts + revenue in one query
    let allBookingStats: any[] = []
    try {
      allBookingStats = await prisma.rentalBooking.findMany({
        where: { hostId },
        select: {
          status: true,
          totalAmount: true,
          startDate: true,
          endDate: true,
          createdAt: true,
        }
      })
    } catch (err) {
      console.error('Error fetching booking stats:', err)
    }

    const activeStatuses = ['CONFIRMED', 'ACTIVE', 'IN_PROGRESS']
    const completedStatuses = ['COMPLETED', 'RETURNED']
    const pendingStatuses = ['PENDING', 'AWAITING_CONFIRMATION']

    const activeBookings = allBookingStats.filter(b => activeStatuses.includes(b.status)).length
    const pendingBookingsCount = allBookingStats.filter(b => pendingStatuses.includes(b.status)).length
    const completedBookingsCount = allBookingStats.filter(b => completedStatuses.includes(b.status)).length

    // Revenue from completed/active bookings
    const revenueBookings = allBookingStats.filter(b =>
      [...completedStatuses, ...activeStatuses, 'CONFIRMED'].includes(b.status)
    )
    const grossRevenue = revenueBookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0)
    const commissionRate = host.commissionRate || 0.25
    const netRevenue = grossRevenue * (1 - commissionRate)

    // Time-based revenue (by booking creation date)
    const todayRevenue = revenueBookings
      .filter(b => new Date(b.createdAt) >= todayStart)
      .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0) * (1 - commissionRate)
    const weekRevenue = revenueBookings
      .filter(b => new Date(b.createdAt) >= weekStart)
      .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0) * (1 - commissionRate)
    const monthRevenue = revenueBookings
      .filter(b => new Date(b.createdAt) >= monthStart)
      .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0) * (1 - commissionRate)

    // Completed this month vs last month
    const completedThisMonth = allBookingStats.filter(b =>
      completedStatuses.includes(b.status) && new Date(b.endDate || b.createdAt) >= monthStart
    ).length
    const completedLastMonth = allBookingStats.filter(b =>
      completedStatuses.includes(b.status) &&
      new Date(b.endDate || b.createdAt) >= lastMonthStart &&
      new Date(b.endDate || b.createdAt) <= lastMonthEnd
    ).length

    // Utilization rate: % of active cars that are currently booked
    const activeCars = h.cars.filter((car: any) => car.isActive).length
    const currentlyBooked = allBookingStats.filter(b =>
      activeStatuses.includes(b.status) &&
      new Date(b.startDate) <= now &&
      new Date(b.endDate) >= now
    ).length
    const utilizationRate = activeCars > 0 ? Math.round((currentlyBooked / activeCars) * 100) : 0

    // Average trip duration (from completed bookings)
    const completedWithDates = allBookingStats.filter(b =>
      completedStatuses.includes(b.status) && b.startDate && b.endDate
    )
    const avgTripDays = completedWithDates.length > 0
      ? Math.round(completedWithDates.reduce((sum, b) => {
          const days = Math.ceil((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 60 * 60 * 24))
          return sum + Math.max(days, 1)
        }, 0) / completedWithDates.length)
      : 0

    // Calculate additional stats
    const stats = {
      totalCars: h.cars.length,
      activeCars,
      totalTrips: host.totalTrips || completedBookingsCount,
      rating: host.rating || 0,
      responseRate: host.responseRate || 0,
      acceptanceRate: host.acceptanceRate || 0,
      totalBookings: h._count?.bookings || allBookingStats.length,
      activeBookings,
      pendingBookings: pendingBookingsCount,
      completedBookings: completedBookingsCount,
      totalEarnings: host.totalEarnings || netRevenue,
      grossEarnings: grossRevenue,
      netRevenue: Math.round(netRevenue * 100) / 100,
      todayRevenue: Math.round(todayRevenue * 100) / 100,
      weekRevenue: Math.round(weekRevenue * 100) / 100,
      monthRevenue: Math.round(monthRevenue * 100) / 100,
      monthlyEarnings: Math.round(monthRevenue * 100) / 100,
      utilizationRate,
      avgTripDays,
      completedThisMonth,
      completedLastMonth,
      claims: claimsCount,
      claimsPending: claimsPending,
      claimsApproved: claimsApproved,
      claimsAmount: claimsAmount,
      pendingClaims: claimsPending,
      reviewCount: h._count?.reviews || 0,
      unreadMessages: unreadMessagesCount,
      managedVehicles: managedVehiclesCount
    }

    // Format cars with completion status data and enhanced metrics
    const formattedCars = h.cars.map((car: any) => {
      // Calculate if car has enough content
      const hasRules = Array.isArray(car.rules) && car.rules.length > 0
      const hasFeatures = Array.isArray(car.features) && car.features.length > 0
      
      // Get hero photo - prioritize isHero flag, then first photo
      const heroPhoto = car.photos?.find((p: any) => p.isHero)?.url 
        || car.photos?.[0]?.url 
        || null
      
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
        description: car.description,
        hasRules: hasRules,
        hasFeatures: hasFeatures,
        rules: car.rules,
        features: car.features,
        city: car.city,
        state: car.state,
        location: `${car.city}, ${car.state}`,
        // Photo fields
        photo: heroPhoto,
        heroPhoto: heroPhoto,
        photos: car.photos,
        photoCount: car._count.photos,
        // Metrics
        totalTrips: car._count.bookings,
        rating: car.rating || 0,
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
        
        // Host Role Fields (from signup selection)
        isHostManager: host.isHostManager || false,
        managesOwnCars: host.managesOwnCars || false,
        managesOthersCars: host.managesOthersCars || false,
        hostType: host.hostType || 'REAL',

        // Financial
        commissionRate: host.commissionRate,
        bankVerified: host.bankVerified,
        requireDeposit: host.requireDeposit,
        depositAmount: host.depositAmount,
        
        // Stats
        stats: stats,
        
        // Cars with full data for completion checking
        cars: formattedCars,
        
        recentBookings: h.bookings.map((b: any) => ({
          ...b,
          guestAvatar: b.reviewerProfile?.profilePhotoUrl
            || b.renter?.image
            || b.renter?.avatar
            || null,
        })),
        recentReviews: h.reviews.map((r: any) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          reviewerName: r.reviewerProfile?.name || r.renter?.name || 'Guest',
          reviewerPhoto: r.reviewerProfile?.profilePhotoUrl || r.renter?.image || r.renter?.avatar || null,
        })),
        
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