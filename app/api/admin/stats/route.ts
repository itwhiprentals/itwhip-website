// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const [
      // Rental stats
      totalRentalBookings,
      pendingVerifications,
      activeRentals,
      confirmedBookings,
      totalCars,
      totalHosts,
      completedToday,
      cancelledToday,
      
      // Ride stats
      totalRides,
      activeRides,
      totalDrivers,
      
      // Hotel stats
      totalHotelBookings,
      activeStays,
      
      // Revenue stats
      confirmedRentalRevenue,
      rideRevenue,
      
      // Additional counts
      pendingChargesCount,
      openDisputesCount
    ] = await prisma.$transaction([
      // Rentals
      prisma.rentalBooking.count(),
      
      // Count both SUBMITTED and PENDING_CHARGES for verifications
      prisma.rentalBooking.count({
        where: {
          OR: [
            { verificationStatus: 'SUBMITTED' },
            { verificationStatus: 'PENDING_CHARGES' }
          ],
          car: { source: 'p2p' }
        }
      }),
      
      // Active means currently being rented (today between start and end)
      prisma.rentalBooking.count({
        where: {
          status: 'CONFIRMED',
          startDate: { lte: today },
          endDate: { gte: today }
        }
      }),
      
      // Count confirmed bookings
      prisma.rentalBooking.count({
        where: { status: 'CONFIRMED' }
      }),
      
      prisma.rentalCar.count({ where: { isActive: true } }),
      prisma.rentalHost.count({ where: { active: true } }),
      
      // Completed today (bookings ending today)
      prisma.rentalBooking.count({
        where: {
          status: 'COMPLETED',
          endDate: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      
      // Cancelled today
      prisma.rentalBooking.count({
        where: {
          status: 'CANCELLED',
          updatedAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      
      // Rides
      prisma.ride.count(),
      prisma.ride.count({
        where: { status: 'IN_PROGRESS' }
      }),
      prisma.driver.count({ where: { active: true } }),
      
      // Hotels
      prisma.booking.count(),
      prisma.booking.count({
        where: { status: 'CHECKED_IN' }
      }),
      
      // Revenue from CONFIRMED and COMPLETED bookings
      prisma.rentalBooking.aggregate({
        where: {
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        },
        _sum: { 
          totalAmount: true,
          serviceFee: true 
        }
      }),
      
      prisma.ride.aggregate({
        where: {
          status: 'COMPLETED'
        },
        _sum: { totalPrice: true }
      }),
      
      // Count bookings with pending charges
      prisma.rentalBooking.count({
        where: {
          verificationStatus: 'PENDING_CHARGES'
        }
      }),
      
      // Count open disputes
      prisma.rentalDispute.count({
        where: {
          status: 'OPEN'
        }
      })
    ])

    // Calculate today's new bookings and revenue
    const [todayBookings, todayRentalRevenue, todayRideRevenue] = await prisma.$transaction([
      prisma.rentalBooking.count({
        where: {
          createdAt: { 
            gte: today,
            lt: tomorrow
          }
        }
      }),
      
      prisma.rentalBooking.aggregate({
        where: {
          createdAt: { 
            gte: today,
            lt: tomorrow
          },
          status: { in: ['CONFIRMED', 'ACTIVE', 'COMPLETED'] }
        },
        _sum: { totalAmount: true }
      }),
      
      prisma.ride.aggregate({
        where: {
          requestedAt: { 
            gte: today,
            lt: tomorrow
          },
          status: 'COMPLETED'
        },
        _sum: { totalPrice: true }
      })
    ])

    // Calculate upcoming check-ins (next 24 hours)
    const upcomingCheckIns = await prisma.rentalBooking.count({
      where: {
        status: 'CONFIRMED',
        startDate: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    // Calculate average rating
    const avgRatingResult = await prisma.rentalCar.aggregate({
      _avg: {
        rating: true
      },
      where: {
        rating: { gt: 0 }
      }
    })
    const avgRating = avgRatingResult._avg.rating || 4.5

    // Count total cancellations
    const totalCancellations = await prisma.rentalBooking.count({
      where: {
        status: 'CANCELLED'
      }
    })

    // Pending payouts (completed bookings not yet paid out to hosts)
    const pendingPayouts = await prisma.hostPayout.count({
      where: {
        status: 'PENDING'
      }
    })

    // Calculate active trips (currently in progress)
    const activeTrips = await prisma.rentalBooking.count({
      where: {
        tripStatus: 'ACTIVE'
      }
    })

    // Calculate overdue returns
    const overdueReturns = await prisma.rentalBooking.count({
      where: {
        tripStatus: 'ACTIVE',
        endDate: { lt: today }
      }
    })

    // Calculate trips completed today
    const tripsCompletedToday = await prisma.rentalBooking.count({
      where: {
        tripStatus: 'COMPLETED',
        tripEndedAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    // Get pending charges total amount
    const pendingChargesAmount = await prisma.rentalBooking.aggregate({
      where: {
        verificationStatus: 'PENDING_CHARGES'
      },
      _sum: {
        pendingChargesAmount: true
      }
    })

    // Calculate average charge amount
    const averageChargeAmount = pendingChargesCount > 0 
      ? (Number(pendingChargesAmount._sum.pendingChargesAmount) || 0) / pendingChargesCount
      : 0

    // Calculate total revenue
    const totalRentalRevenue = confirmedRentalRevenue._sum.totalAmount || 0
    const totalServiceFees = confirmedRentalRevenue._sum.serviceFee || 0
    const totalRideRevenue = rideRevenue._sum.totalPrice || 0
    const totalRevenue = totalRentalRevenue + totalRideRevenue
    const todayRevenue = (todayRentalRevenue._sum.totalAmount || 0) + (todayRideRevenue._sum.totalPrice || 0)
    
    // Mock growth calculation
    const monthlyGrowth = 15.5

    // Food stats - set to 0 since tables don't exist yet
    const totalFoodOrders = 0
    const activeFoodTrucks = 0

    return NextResponse.json({
      // Rental Stats
      totalRentalBookings,
      pendingVerifications,
      activeRentals,
      confirmedBookings,
      totalCars,
      totalHosts,
      upcomingCheckIns,
      completedToday,
      cancelledToday,
      avgRating,
      openDisputes: openDisputesCount,  // Using actual dispute count
      totalCancellations,
      pendingPayouts,
      
      // Trip Stats
      activeTrips,
      overdueReturns,
      pendingCharges: pendingChargesCount,
      tripsCompletedToday,
      averageChargeAmount,
      
      // Ride Stats
      totalRides,
      activeRides,
      totalDrivers,
      
      // Hotel Stats
      totalHotelBookings,
      activeStays,
      
      // Food Stats
      totalFoodOrders,
      activeFoodTrucks,
      
      // Combined Stats
      totalBookings: totalRentalBookings + totalHotelBookings,
      todayBookings,
      
      // Platform Stats
      totalRevenue,
      todayRevenue,
      totalServiceFees,
      monthlyGrowth,
      
      // Service breakdown
      services: {
        rentals: {
          bookings: totalRentalBookings,
          confirmed: confirmedBookings,
          active: activeRentals,
          pending: pendingVerifications,
          revenue: totalRentalRevenue,
          serviceFees: totalServiceFees,
          pendingCharges: pendingChargesCount,
          pendingChargesAmount: pendingChargesAmount._sum.pendingChargesAmount || 0
        },
        rides: {
          total: totalRides,
          active: activeRides,
          drivers: totalDrivers,
          revenue: totalRideRevenue
        },
        hotels: {
          bookings: totalHotelBookings,
          active: activeStays
        },
        food: {
          orders: totalFoodOrders,
          trucks: activeFoodTrucks
        }
      }
    })

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}