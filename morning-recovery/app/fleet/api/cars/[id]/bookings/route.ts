// app/sys-2847/fleet/api/cars/[id]/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Fetch RENTAL bookings for this car (not hotel bookings)
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        carId: id,
        status: {
          in: ['CONFIRMED', 'ACTIVE', 'PENDING']
        }
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        guestName: true,
        guestEmail: true,
        totalAmount: true,
        pickupLocation: true,
        verificationStatus: true
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    // Fetch availability blocks if you have them
    const blockedDates = await prisma.rentalAvailability.findMany({
      where: {
        carId: id,
        isAvailable: false
      },
      select: {
        id: true,
        date: true,
        note: true
      }
    })
    
    // Transform blocked dates to match component format
    const formattedBlockedDates = blockedDates.map(block => ({
      id: block.id,
      startDate: block.date,
      endDate: block.date,
      reason: block.note || 'Blocked',
      type: 'OTHER' as const
    }))
    
    return NextResponse.json({
      success: true,
      bookings: bookings,
      blockedDates: formattedBlockedDates
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({
      success: true,
      bookings: [],
      blockedDates: []
    })
  }
}