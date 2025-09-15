// app/lib/booking-import.ts
import prisma from '@/app/lib/database/prisma'

export async function linkGuestBookingsToUser(userId: string, email: string) {
  try {
    // Find all guest bookings for this email
    const guestBookings = await prisma.rentalBooking.findMany({
      where: {
        guestEmail: email.toLowerCase(),
        renterId: null // Only unlinked guest bookings
      },
      select: {
        id: true,
        bookingCode: true
      }
    })

    if (guestBookings.length === 0) {
      return { success: true, count: 0, bookings: [] }
    }

    // Link all bookings to the user
    await prisma.rentalBooking.updateMany({
      where: {
        guestEmail: email.toLowerCase(),
        renterId: null
      },
      data: {
        renterId: userId
      }
    })

    // Mark guest access tokens as converted
    await prisma.guestAccessToken.updateMany({
      where: { 
        email: email.toLowerCase()
      },
      data: { 
        usedAt: new Date() // Mark as used/converted
      }
    })

    return {
      success: true,
      count: guestBookings.length,
      bookings: guestBookings
    }
  } catch (error) {
    console.error('Error linking guest bookings:', error)
    return {
      success: false,
      count: 0,
      bookings: [],
      error: error instanceof Error ? error.message : 'Failed to link bookings'
    }
  }
}

export async function getGuestBookingCount(email: string): Promise<number> {
  try {
    const count = await prisma.rentalBooking.count({
      where: {
        guestEmail: email.toLowerCase(),
        renterId: null
      }
    })
    return count
  } catch (error) {
    console.error('Error counting guest bookings:', error)
    return 0
  }
}

export async function getGuestBookingsSummary(email: string) {
  try {
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        guestEmail: email.toLowerCase(),
        renterId: null
      },
      select: {
        id: true,
        bookingCode: true,
        status: true,
        startDate: true,
        endDate: true,
        totalAmount: true,
        car: {
          select: {
            make: true,
            model: true,
            year: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    return bookings
  } catch (error) {
    console.error('Error fetching guest bookings summary:', error)
    return []
  }
}

export async function checkAccountExists(email: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
    return user !== null
  } catch (error) {
    console.error('Error checking account existence:', error)
    return false
  }
}