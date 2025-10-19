// app/api/user/dashboard-stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userEmail = user.email
    const userId = user.id

    // Build where clause for queries
    const whereClause = {
      OR: [
        ...(userId ? [{ renterId: userId }] : []),
        ...(userEmail ? [{ guestEmail: userEmail }] : [])
      ]
    }

    // Get all user's booking IDs first (for message query)
    const userBookings = await prisma.rentalBooking.findMany({
      where: whereClause,
      select: { id: true }
    })
    
    const bookingIds = userBookings.map(b => b.id)

    // Get all bookings for stats calculation
    const [
      allBookings,
      activeBookings,
      completedBookings,
      pendingVerifications,
      unreadMessages
    ] = await Promise.all([
      // All bookings for this user
      prisma.rentalBooking.findMany({
        where: whereClause,
        select: {
          id: true,
          status: true,
          totalAmount: true,
          dailyRate: true,
          numberOfDays: true,
          createdAt: true,
          verificationStatus: true
        }
      }),

      // Active rentals count
      prisma.rentalBooking.count({
        where: {
          ...whereClause,
          status: {
            in: ['PENDING', 'CONFIRMED', 'ACTIVE']
          }
        }
      }),

      // Completed trips count
      prisma.rentalBooking.count({
        where: {
          ...whereClause,
          status: 'COMPLETED'
        }
      }),

      // Pending document verifications
      prisma.rentalBooking.count({
        where: {
          ...whereClause,
          verificationStatus: {
            in: ['PENDING', 'SUBMITTED']
          }
        }
      }),

      // Unread messages count - FIXED QUERY
      prisma.rentalMessage.count({
        where: {
          bookingId: {
            in: bookingIds.length > 0 ? bookingIds : ['dummy'] // Prevent empty array error
          },
          isRead: false,
          senderType: {
            notIn: ['guest', 'renter'] // Don't count guest's own messages
          }
        }
      })
    ])

    // Calculate total saved
    // Compare our rates with market average (assuming 20% savings)
    const totalSpent = allBookings.reduce((sum, booking) => 
      sum + (booking.totalAmount || 0), 0
    )
    const totalSaved = Math.round(totalSpent * 0.20) // 20% savings vs market

    // Calculate loyalty points (10 points per completed rental)
    const earnedPoints = completedBookings * 10

    // Points to next tier
    let pointsToNextTier = 500 // Default for Bronze → Silver
    if (completedBookings >= 20) {
      pointsToNextTier = 0 // Already at max tier
    } else if (completedBookings >= 10) {
      pointsToNextTier = (20 - completedBookings) * 10 // To Platinum
    } else if (completedBookings >= 5) {
      pointsToNextTier = (10 - completedBookings) * 10 // To Gold
    } else {
      pointsToNextTier = (5 - completedBookings) * 10 // To Silver
    }

    // Calculate member tier based on completed trips
    let memberTier = 'Bronze'
    if (completedBookings >= 20) {
      memberTier = 'Platinum'
    } else if (completedBookings >= 10) {
      memberTier = 'Gold'
    } else if (completedBookings >= 5) {
      memberTier = 'Silver'
    }

    // Get notification count
    const notificationCount = unreadMessages + pendingVerifications

    // Get stats for specific statuses
    const bookingStats = allBookings.reduce((stats, booking) => {
      const status = booking.status
      stats[status] = (stats[status] || 0) + 1
      return stats
    }, {} as Record<string, number>)

    // Calculate additional metrics
    const stats = {
      // Core rental metrics
      totalSaved,
      activeRentals: activeBookings,
      completedTrips: completedBookings,
      loyaltyPoints: earnedPoints,
      unreadMessages,
      pendingDocuments: pendingVerifications, // Better naming
      
      // Additional metrics for UI
      notificationCount,
      rentalsActive: activeBookings, // Alias for backward compatibility
      rentalsCompleted: completedBookings,
      
      // Booking breakdown
      pendingBookings: bookingStats['PENDING'] || 0,
      confirmedBookings: bookingStats['CONFIRMED'] || 0,
      cancelledBookings: bookingStats['CANCELLED'] || 0,
      
      // User tier info
      memberTier,
      pointsToNextTier,
      
      // Total bookings
      totalBookings: allBookings.length,
      
      // Average booking value
      averageBookingValue: allBookings.length > 0 
        ? Math.round(totalSpent / allBookings.length)
        : 0,
      
      // Days rented
      totalDaysRented: allBookings.reduce((sum, booking) => 
        sum + (booking.numberOfDays || 0), 0
      ),

      // Average rating (placeholder - will implement when reviews are added)
      averageRating: 0
    }

    // If guest email is provided in query (for testing)
    const testEmail = request.nextUrl.searchParams.get('email')
    if (process.env.NODE_ENV === 'development' && testEmail) {
      console.log('Dashboard stats for:', testEmail || userEmail)
      console.log('Stats:', stats)
    }

    return NextResponse.json({
      success: true,
      stats,
      user: {
        email: userEmail,
        tier: memberTier
      }
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    
    // Return default stats on error to prevent UI breaking
    return NextResponse.json({
      success: false,
      stats: {
        totalSaved: 0,
        activeRentals: 0,
        completedTrips: 0,
        loyaltyPoints: 0,
        unreadMessages: 0,
        pendingDocuments: 0,
        notificationCount: 0,
        rentalsActive: 0,
        rentalsCompleted: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        memberTier: 'Bronze',
        pointsToNextTier: 500,
        totalBookings: 0,
        averageBookingValue: 0,
        totalDaysRented: 0,
        averageRating: 0
      },
      error: 'Failed to fetch stats'
    })
  }
}