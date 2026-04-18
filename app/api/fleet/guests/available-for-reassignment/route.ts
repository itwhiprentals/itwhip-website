// app/api/fleet/guests/available-for-reassignment/route.ts
// Search guest users by name or email for fleet admin prospect creation
// Returns user info + most recent active booking (if any)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get('search')?.trim()

    if (!search || search.length < 2) {
      return NextResponse.json({ success: true, guests: [] })
    }

    // Search User table by name or email
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        reviewerProfile: {
          select: {
            id: true,
            documentsVerified: true,
            manuallyVerifiedByHost: true,
          }
        },
        rentalBookings: {
          where: { status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            bookingCode: true,
            status: true,
            paymentStatus: true,
            startDate: true,
            endDate: true,
            startTime: true,
            endTime: true,
            dailyRate: true,
            totalAmount: true,
            numberOfDays: true,
            pickupLocation: true,
            createdAt: true,
            replacedByBookingId: true,
            carId: true,
            hostId: true,
            car: {
              select: { make: true, model: true, year: true, carType: true, city: true, state: true }
            },
            host: {
              select: { id: true, name: true, partnerCompanyName: true }
            },
          }
        },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    })

    const now = Date.now()

    // Build response with trip counts
    const guests = await Promise.all(
      users.map(async (user) => {
        const tripCount = await prisma.rentalBooking.count({
          where: { renterId: user.id, status: 'COMPLETED' },
        })

        const verified = !!(
          user.reviewerProfile?.documentsVerified ||
          user.reviewerProfile?.manuallyVerifiedByHost
        )

        const booking = user.rentalBookings[0] || null
        let activeBooking = null

        if (booking) {
          activeBooking = {
            bookingId: booking.id,
            bookingCode: booking.bookingCode,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            car: booking.car
              ? `${booking.car.year} ${booking.car.make} ${booking.car.model}`
              : 'Unknown',
            carMake: booking.car?.make || '',
            carModel: booking.car?.model || '',
            carYear: booking.car?.year || 0,
            carType: booking.car?.carType || '',
            carCity: booking.car?.city || '',
            carState: booking.car?.state || 'AZ',
            carId: booking.carId,
            host: booking.host?.partnerCompanyName || booking.host?.name || 'Unknown',
            hostId: booking.hostId,
            startDate: booking.startDate,
            endDate: booking.endDate,
            startTime: booking.startTime || '10:00',
            endTime: booking.endTime || '10:00',
            dailyRate: booking.dailyRate || 0,
            totalAmount: booking.totalAmount || 0,
            numberOfDays: booking.numberOfDays || 1,
            pickupLocation: booking.pickupLocation || '',
            daysSinceCreated: Math.floor((now - new Date(booking.createdAt).getTime()) / 86400000),
            alreadyReplaced: !!booking.replacedByBookingId,
          }
        }

        return {
          guestId: user.id,
          guestName: user.name || 'Unknown',
          guestEmail: user.email || '',
          guestPhone: user.phone || null,
          verified,
          tripCount,
          memberSince: user.createdAt,
          activeBooking,
        }
      })
    )

    return NextResponse.json({
      success: true,
      guests,
      total: guests.length,
    })

  } catch (error) {
    console.error('[Guest Search] Error:', error)
    return NextResponse.json(
      { error: 'Failed to search guests' },
      { status: 500 }
    )
  }
}
