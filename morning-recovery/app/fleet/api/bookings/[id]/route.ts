// app/fleet/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key')

    // Verify fleet authentication
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // AWAIT params (Next.js 15 requirement)
    const { id: bookingId } = await params

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    console.log('[FLEET BOOKING API] Fetching booking:', bookingId)

    // Fetch booking with all related data
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: {
        car: {
          include: {
            host: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            photos: {
              orderBy: {
                order: 'asc'
              },
              take: 5
            }
          }
        },
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true  // FIXED: Changed from phoneNumber to phone
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Calculate number of days
    const startDate = new Date(booking.startDate)
    const endDate = new Date(booking.endDate)
    const numberOfDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    // Format car photos
    const carPhotos = booking.car.photos?.map(photo => ({
      url: photo.url,
      caption: photo.caption
    })) || []

    // Format booking details for frontend
    const bookingDetails = {
      id: booking.id,
      bookingCode: booking.bookingCode,
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      numberOfDays,
      status: booking.status,
      tripStatus: booking.tripStatus,
      pickupLocation: booking.pickupLocation,
      pickupType: booking.pickupType,
      deliveryAddress: booking.deliveryAddress,
      totalPrice: booking.totalAmount?.toString() || '0',
      car: {
        id: booking.car.id,
        make: booking.car.make,
        model: booking.car.model,
        year: booking.car.year,
        color: booking.car.color,
        carType: booking.car.carType,
        transmission: booking.car.transmission,
        seats: booking.car.seats,
        photos: carPhotos
      },
      renter: booking.renter ? {
        name: booking.renter.name,
        email: booking.renter.email,
        phone: booking.renter.phone
      } : null,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      host: booking.car.host ? {
        name: booking.car.host.name,
        email: booking.car.host.email
      } : null
    }

    console.log('[FLEET BOOKING API] ✅ Booking fetched successfully:', {
      bookingCode: booking.bookingCode,
      car: `${booking.car.year} ${booking.car.make} ${booking.car.model}`,
      photoCount: carPhotos.length
    })

    return NextResponse.json({
      success: true,
      booking: bookingDetails
    })

  } catch (error) {
    console.error('[FLEET BOOKING API] ❌ Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch booking details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}