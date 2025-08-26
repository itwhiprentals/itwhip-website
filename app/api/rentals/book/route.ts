// app/api/rentals/book/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { RentalBookingStatus } from '@prisma/client'
import { sendBookingConfirmation, sendHostNotification } from '@/app/lib/email'
import { calculatePricing } from '@/app/(guest)/rentals/lib/pricing'
import { checkAvailability } from '@/app/(guest)/rentals/lib/rental-utils'

// Validation schema for booking request
const bookingSchema = z.object({
  carId: z.string(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  startTime: z.string(),
  endTime: z.string(),
  pickupType: z.enum(['host', 'airport', 'hotel', 'delivery']),
  pickupLocation: z.string(),
  deliveryAddress: z.string().optional(),
  returnLocation: z.string().optional(),
  extras: z.array(z.string()).optional(),
  insurance: z.enum(['basic', 'standard', 'premium']),
  driverInfo: z.object({
    licenseNumber: z.string(),
    licenseState: z.string(),
    licenseExpiry: z.string(),
    dateOfBirth: z.string(),
    licensePhotoUrl: z.string().optional(),
    selfiePhotoUrl: z.string().optional()
  }),
  paymentIntentId: z.string(),
  notes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = bookingSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const bookingData = validationResult.data

    // Get car details with host information
    const car = await prisma.rentalCar.findUnique({
      where: { id: bookingData.carId },
      include: {
        host: true,
        bookings: {
          where: {
            OR: [
              { status: RentalBookingStatus.CONFIRMED },
              { status: RentalBookingStatus.ACTIVE }
            ],
            AND: [
              { endDate: { gte: bookingData.startDate } },
              { startDate: { lte: bookingData.endDate } }
            ]
          }
        }
      }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    if (!car.isActive) {
      return NextResponse.json(
        { error: 'Car is not available' },
        { status: 400 }
      )
    }

    // Check availability
    const isAvailable = await checkAvailability(
      bookingData.carId,
      bookingData.startDate,
      bookingData.endDate
    )

    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Car is not available for selected dates' },
        { status: 400 }
      )
    }

    // Calculate pricing
    const pricing = calculatePricing({
      dailyRate: car.dailyRate,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      extras: bookingData.extras || [],
      insurance: bookingData.insurance,
      deliveryType: bookingData.pickupType,
      driverAge: calculateAge(bookingData.driverInfo.dateOfBirth)
    })

    // Generate booking code
    const bookingCode = generateBookingCode()

    // Create the booking in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create the booking
      const newBooking = await tx.rentalBooking.create({
        data: {
          bookingCode,
          carId: bookingData.carId,
          hostId: car.hostId,
          renterId: user.id,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          pickupLocation: bookingData.pickupLocation,
          pickupType: bookingData.pickupType,
          deliveryAddress: bookingData.deliveryAddress,
          returnLocation: bookingData.returnLocation || bookingData.pickupLocation,
          dailyRate: car.dailyRate,
          numberOfDays: pricing.days,
          subtotal: pricing.subtotal,
          deliveryFee: pricing.deliveryFee,
          insuranceFee: pricing.insuranceFee,
          serviceFee: pricing.serviceFee,
          taxes: pricing.taxes,
          totalAmount: pricing.total,
          depositAmount: pricing.deposit,
          status: RentalBookingStatus.CONFIRMED,
          paymentStatus: 'paid',
          paymentIntentId: bookingData.paymentIntentId,
          licenseVerified: true,
          licenseNumber: bookingData.driverInfo.licenseNumber,
          licenseState: bookingData.driverInfo.licenseState,
          licenseExpiry: new Date(bookingData.driverInfo.licenseExpiry),
          licensePhotoUrl: bookingData.driverInfo.licensePhotoUrl,
          selfieVerified: !!bookingData.driverInfo.selfiePhotoUrl,
          selfiePhotoUrl: bookingData.driverInfo.selfiePhotoUrl,
          extras: bookingData.extras ? JSON.stringify(bookingData.extras) : null,
          notes: bookingData.notes
        },
        include: {
          car: {
            include: {
              photos: true,
              host: true
            }
          },
          host: true,
          renter: true
        }
      })

      // Update car statistics
      await tx.rentalCar.update({
        where: { id: bookingData.carId },
        data: {
          totalTrips: { increment: 1 }
        }
      })

      // Create availability blocks for booked dates
      const dates = []
      const currentDate = new Date(bookingData.startDate)
      const endDate = new Date(bookingData.endDate)

      while (currentDate <= endDate) {
        dates.push(new Date(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
      }

      await tx.rentalAvailability.createMany({
        data: dates.map(date => ({
          carId: bookingData.carId,
          date,
          isAvailable: false,
          note: `Booked - ${bookingCode}`
        })),
        skipDuplicates: true
      })

      return newBooking
    })

    // Send confirmation emails (async, don't wait)
    Promise.all([
      sendBookingConfirmation(booking),
      sendHostNotification(booking)
    ]).catch(error => {
      console.error('Error sending booking emails:', error)
    })

    // Return booking details
    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        car: {
          make: booking.car.make,
          model: booking.car.model,
          year: booking.car.year,
          photos: booking.car.photos
        },
        host: {
          name: booking.host.name,
          email: booking.host.email,
          phone: booking.host.phone
        },
        dates: {
          start: booking.startDate,
          end: booking.endDate,
          startTime: booking.startTime,
          endTime: booking.endTime
        },
        pickup: {
          type: booking.pickupType,
          location: booking.pickupLocation,
          deliveryAddress: booking.deliveryAddress
        },
        pricing: {
          subtotal: booking.subtotal,
          deliveryFee: booking.deliveryFee,
          insuranceFee: booking.insuranceFee,
          serviceFee: booking.serviceFee,
          taxes: booking.taxes,
          total: booking.totalAmount,
          deposit: booking.depositAmount
        },
        status: booking.status,
        paymentStatus: booking.paymentStatus
      }
    })

  } catch (error) {
    console.error('Booking creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

// GET - Retrieve booking details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('id')
    const bookingCode = searchParams.get('code')

    if (!bookingId && !bookingCode) {
      return NextResponse.json(
        { error: 'Booking ID or code required' },
        { status: 400 }
      )
    }

    const booking = await prisma.rentalBooking.findFirst({
      where: {
        OR: [
          bookingId ? { id: bookingId } : {},
          bookingCode ? { bookingCode } : {}
        ].filter(condition => Object.keys(condition).length > 0)
      },
      include: {
        car: {
          include: {
            photos: true,
            host: true,
            reviews: {
              take: 5,
              orderBy: { createdAt: 'desc' }
            }
          }
        },
        host: true,
        renter: true,
        messages: {
          orderBy: { createdAt: 'desc' }
        },
        review: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify user has access to this booking
    const session = await getServerSession()
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })

      // Check if user is renter or host
      const hasAccess = user && (
        booking.renterId === user.id ||
        booking.hostId === booking.host.userId
      )

      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({ booking })

  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

// PATCH - Update booking status
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { bookingId, action, data } = await request.json()

    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: { host: true, renter: true }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Handle different actions
    let updatedBooking
    switch (action) {
      case 'cancel':
        // Check cancellation policy
        const now = new Date()
        const startDate = new Date(booking.startDate)
        const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60)

        if (hoursUntilStart < 24) {
          return NextResponse.json(
            { error: 'Cannot cancel within 24 hours of start time' },
            { status: 400 }
          )
        }

        updatedBooking = await prisma.rentalBooking.update({
          where: { id: bookingId },
          data: {
            status: RentalBookingStatus.CANCELLED,
            paymentStatus: 'refunded'
          }
        })

        // TODO: Process refund through Stripe
        break

      case 'start':
        updatedBooking = await prisma.rentalBooking.update({
          where: { id: bookingId },
          data: {
            status: RentalBookingStatus.ACTIVE,
            actualStartTime: new Date(),
            startMileage: data?.mileage,
            fuelLevelStart: data?.fuelLevel
          }
        })
        break

      case 'complete':
        updatedBooking = await prisma.rentalBooking.update({
          where: { id: bookingId },
          data: {
            status: RentalBookingStatus.COMPLETED,
            actualEndTime: new Date(),
            endMileage: data?.mileage,
            fuelLevelEnd: data?.fuelLevel
          }
        })

        // Release availability blocks
        await prisma.rentalAvailability.deleteMany({
          where: {
            carId: booking.carId,
            date: {
              gte: booking.startDate,
              lte: booking.endDate
            }
          }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({ booking: updatedBooking })

  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

// Helper functions
function generateBookingCode(): string {
  const prefix = 'RENT'
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${year}-${random}`
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}