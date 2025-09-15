// app/api/user/dashboard-stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyJWT } from '@/lib/auth/jwt'

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookies or header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')
    
    let userId = null
    let userEmail = 'test@me.com' // Default for testing
    
    if (token) {
      try {
        const payload = await verifyJWT(token)
        if (payload?.userId) {
          // Get user details
          const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, email: true }
          })
          if (user) {
            userId = user.id
            userEmail = user.email
          }
        }
      } catch (error) {
        console.log('Auth verification failed, using guest mode')
      }
    }

    // Build query conditions
    const bookingConditions = {
      OR: [
        ...(userId ? [{ renterId: userId }] : []),
        { guestEmail: userEmail }
      ]
    }

    // Fetch all rental bookings for calculations
    const [
      rentalBookings,
      activeRentals,
      completedRentals,
      unreadMessages,
      totalSpentOnRentals
    ] = await Promise.all([
      // All rental bookings
      prisma.rentalBooking.findMany({
        where: bookingConditions,
        select: {
          totalAmount: true,
          status: true,
          car: {
            select: {
              dailyRate: true,
              source: true,
              fuelType: true
            }
          }
        }
      }),
      
      // Active rentals count
      prisma.rentalBooking.count({
        where: {
          ...bookingConditions,
          status: {
            in: ['PENDING', 'CONFIRMED', 'ACTIVE']
          }
        }
      }),
      
      // Completed rentals for carbon calculation
      prisma.rentalBooking.count({
        where: {
          ...bookingConditions,
          status: 'COMPLETED'
        }
      }),
      
      // Unread messages count
      prisma.rentalMessage.count({
        where: {
          booking: bookingConditions,
          isRead: false,
          senderType: {
            not: 'guest' // Don't count guest's own messages as unread
          }
        }
      }),
      
      // Total spent on rentals
      prisma.rentalBooking.aggregate({
        where: {
          ...bookingConditions,
          status: {
            in: ['CONFIRMED', 'ACTIVE', 'COMPLETED']
          }
        },
        _sum: {
          totalAmount: true
        }
      })
    ])

    // Calculate total saved
    // Compare P2P rates vs traditional (Amadeus/Enterprise typically 30% higher)
    let totalSaved = 0
    rentalBookings.forEach(booking => {
      if (booking.car.source === 'p2p' && booking.status !== 'CANCELLED') {
        // P2P cars save approximately 30% vs traditional
        const traditionalEstimate = booking.totalAmount * 1.3
        totalSaved += (traditionalEstimate - booking.totalAmount)
      }
    })

    // Calculate carbon offset
    // Electric/Hybrid vehicles save ~4.6 metric tons CO2/year
    // Average rental is 3 days, so ~37.8kg CO2 saved per electric rental
    let carbonOffset = 0
    rentalBookings.forEach(booking => {
      if (booking.status === 'COMPLETED') {
        if (booking.car.fuelType === 'ELECTRIC') {
          carbonOffset += 37.8 // kg per rental
        } else if (booking.car.fuelType === 'HYBRID') {
          carbonOffset += 18.9 // kg per rental (half of electric)
        }
      }
    })

    // For now, mock ride and hotel data (until those APIs are ready)
    // TODO: Replace with real queries when ride and hotel tables are set up
    const ridesBooked = 0 // Will query rides table
    const hotelNights = 0 // Will query hotel bookings
    const mealsOrdered = 0 // Will query food orders

    // Count total notifications (unread messages + pending verifications)
    const pendingVerifications = await prisma.rentalBooking.count({
      where: {
        ...bookingConditions,
        verificationStatus: 'PENDING'  // FIXED: Changed from 'pending' to 'PENDING' to match Prisma enum
      }
    })
    
    const notificationCount = unreadMessages + pendingVerifications

    // Prepare response
    const stats = {
      // Money stats
      totalSaved: Math.round(totalSaved * 100) / 100,
      totalSpent: totalSpentOnRentals._sum.totalAmount || 0,
      
      // Booking counts
      ridesBooked,
      hotelNights,
      mealsOrdered,
      rentalsActive: activeRentals,
      rentalsCompleted: completedRentals,
      rentalsTotal: rentalBookings.length,
      
      // Environmental
      carbonOffset: Math.round(carbonOffset * 10) / 10,
      
      // Notifications
      notificationCount,
      unreadMessages,
      pendingVerifications
    }

    return NextResponse.json({
      success: true,
      stats,
      user: {
        id: userId,
        email: userEmail
      }
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}