// app/api/host/dashboard/route.ts - FIXED VERSION

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
            isActive: true,
            dailyRate: true,
            city: true,
            state: true,
            photos: {
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

    // ✅ FIXED: Get claims count
    const claimsCount = await prisma.claim.count({
      where: {
        hostId: hostId,
        status: 'PENDING' // Only count pending claims
      }
    })

    // ✅ FIXED: Get unread messages count - using correct field structure
    // RentalMessage doesn't have receiverId, we need to find messages where:
    // - The booking belongs to this host
    // - The sender is NOT the host (messages from guests)
    // - Message is not read
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
      // Continue without failing the whole request
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
      monthlyEarnings: 0, // Calculate from recent bookings if needed
      pendingClaims: claimsCount, // ✅ NEW
      unreadMessages: unreadMessagesCount // ✅ NEW
    }

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
        
        // Documents
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
        
        // Related data
        cars: host.cars.map(car => ({
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          isActive: car.isActive,
          dailyRate: car.dailyRate,
          location: `${car.city}, ${car.state}`,
          photo: car.photos[0]?.url || null,
          bookingCount: car._count.bookings
        })),
        
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