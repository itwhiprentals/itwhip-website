// app/api/host/bookings/active/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { checkActiveBookings } from '@/app/lib/insurance/validation'

/**
 * GET /api/host/bookings/active
 * Check if host has active or future bookings that would block insurance changes
 */
export async function GET(request: NextRequest) {
  try {
    // Get host session
    const hostToken = request.cookies.get('hostToken')?.value
    
    if (!hostToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Verify host session
    const session = await prisma.session.findFirst({
      where: {
        token: hostToken,
        expiresAt: { gt: new Date() }
      },
      include: {
        user: {
          include: {
            host: {
              select: { id: true }
            }
          }
        }
      }
    })
    
    if (!session?.user?.host?.id) {
      return NextResponse.json(
        { error: 'Host account not found' },
        { status: 404 }
      )
    }
    
    const hostId = session.user.host.id
    
    // Check for active bookings using the validation utility
    const bookingCheck = await checkActiveBookings(hostId)
    
    // Get additional details if there are blocking bookings
    if (bookingCheck.hasActiveBookings) {
      // Calculate total amount affected
      const bookingDetails = await prisma.rentalBooking.findMany({
        where: {
          id: { in: bookingCheck.blockingBookings.map(b => b.id) }
        },
        select: {
          totalAmount: true,
          guest: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          car: {
            select: {
              make: true,
              model: true,
              year: true
            }
          }
        }
      })
      
      const totalAmountAffected = bookingDetails.reduce(
        (sum, booking) => sum + booking.totalAmount, 
        0
      )
      
      return NextResponse.json({
        canModifyInsurance: false,
        hasActiveBookings: true,
        activeCount: bookingCheck.activeCount,
        futureCount: bookingCheck.futureCount,
        totalBlocking: bookingCheck.blockingBookings.length,
        nextAvailableDate: bookingCheck.nextAvailableDate,
        totalAmountAffected,
        bookings: bookingCheck.blockingBookings.map((booking, index) => ({
          ...booking,
          guestName: bookingDetails[index]?.guest 
            ? `${bookingDetails[index].guest.firstName} ${bookingDetails[index].guest.lastName}`
            : 'Guest',
          vehicle: bookingDetails[index]?.car
            ? `${bookingDetails[index].car.year} ${bookingDetails[index].car.make} ${bookingDetails[index].car.model}`
            : 'Vehicle',
          amount: bookingDetails[index]?.totalAmount || 0
        }))
      })
    }
    
    // No blocking bookings - can modify insurance
    return NextResponse.json({
      canModifyInsurance: true,
      hasActiveBookings: false,
      activeCount: 0,
      futureCount: 0,
      totalBlocking: 0,
      nextAvailableDate: null,
      totalAmountAffected: 0,
      bookings: []
    })
    
  } catch (error) {
    console.error('Error checking active bookings:', error)
    return NextResponse.json(
      { error: 'Failed to check active bookings' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/host/bookings/active/check
 * Check active bookings for a specific host (admin use)
 */
export async function POST(request: NextRequest) {
  try {
    const { hostId, includeDetails } = await request.json()
    
    if (!hostId) {
      return NextResponse.json(
        { error: 'Host ID required' },
        { status: 400 }
      )
    }
    
    // Verify admin access (using fleet key for now)
    const fleetKey = request.headers.get('x-fleet-key')
    if (fleetKey !== 'phoenix-fleet-2847') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    // Check for active bookings
    const bookingCheck = await checkActiveBookings(hostId)
    
    if (!includeDetails) {
      return NextResponse.json({
        canModifyInsurance: !bookingCheck.hasActiveBookings,
        ...bookingCheck
      })
    }
    
    // Get detailed booking information
    const detailedBookings = await prisma.rentalBooking.findMany({
      where: {
        id: { in: bookingCheck.blockingBookings.map(b => b.id) }
      },
      include: {
        guest: true,
        car: {
          include: {
            photos: {
              where: { isHero: true },
              take: 1
            }
          }
        },
        host: {
          select: {
            name: true,
            email: true,
            earningsTier: true
          }
        }
      }
    })
    
    return NextResponse.json({
      canModifyInsurance: !bookingCheck.hasActiveBookings,
      hasActiveBookings: bookingCheck.hasActiveBookings,
      activeCount: bookingCheck.activeCount,
      futureCount: bookingCheck.futureCount,
      nextAvailableDate: bookingCheck.nextAvailableDate,
      bookings: detailedBookings.map(booking => ({
        id: booking.id,
        bookingCode: booking.bookingCode,
        status: booking.status,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalAmount: booking.totalAmount,
        guest: {
          name: `${booking.guest.firstName} ${booking.guest.lastName}`,
          email: booking.guest.email,
          phone: booking.guest.phone
        },
        vehicle: {
          id: booking.car.id,
          name: `${booking.car.year} ${booking.car.make} ${booking.car.model}`,
          photo: booking.car.photos[0]?.url || null,
          dailyRate: booking.car.dailyRate
        },
        host: {
          name: booking.host.name,
          email: booking.host.email,
          currentTier: booking.host.earningsTier
        }
      }))
    })
    
  } catch (error) {
    console.error('Error checking active bookings (admin):', error)
    return NextResponse.json(
      { error: 'Failed to check active bookings' },
      { status: 500 }
    )
  }
}