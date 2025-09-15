// app/api/rentals/book/guest/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { createGuestToken } from '@/app/lib/auth/guest-tokens'
import { sendEmail } from '@/app/lib/email'
import { addHours } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      carId,
      guestEmail,
      guestPhone,
      guestName,
      startDate,
      endDate,
      startTime,
      endTime,
      pickupLocation,
      pickupType,
      deliveryAddress
    } = body

    // Validate required fields
    if (!carId || !guestEmail || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get car details to determine if P2P or Amadeus
    const car = await prisma.rentalCar.findUnique({
      where: { id: carId },
      include: { host: true }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    // Calculate pricing
    const startDateTime = new Date(startDate)
    const endDateTime = new Date(endDate)
    const numberOfDays = Math.ceil((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24))
    
    const subtotal = car.dailyRate * numberOfDays
    const deliveryFee = pickupType === 'delivery' ? car.deliveryFee : 0
    const insuranceFee = car.insuranceDaily * numberOfDays
    const serviceFee = subtotal * 0.15 // 15% service fee
    const taxes = (subtotal + deliveryFee + serviceFee) * 0.08 // 8% tax
    const totalAmount = subtotal + deliveryFee + insuranceFee + serviceFee + taxes

    // Generate booking code
    const bookingCode = `RENT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Determine if P2P (needs verification) or Amadeus (instant)
    const isP2P = car.source === 'p2p'
    const verificationRequired = isP2P
    const initialStatus = isP2P ? 'PENDING' : 'CONFIRMED'
    
    // Create booking
    const booking = await prisma.rentalBooking.create({
      data: {
        bookingCode,
        carId,
        hostId: car.hostId,
        guestEmail,
        guestPhone,
        guestName,
        startDate: startDateTime,
        endDate: endDateTime,
        startTime: startTime || '10:00 AM',
        endTime: endTime || '10:00 AM',
        pickupLocation: pickupLocation || car.address,
        pickupType: pickupType || 'host',
        deliveryAddress,
        dailyRate: car.dailyRate,
        numberOfDays,
        subtotal,
        deliveryFee,
        insuranceFee,
        serviceFee,
        taxes,
        totalAmount,
        status: initialStatus,
        paymentStatus: 'pending',
        verificationStatus: verificationRequired ? 'pending' : 'approved',
        verificationDeadline: verificationRequired ? addHours(new Date(), 24) : null
      },
      include: {
        car: {
          include: {
            photos: true,
            host: true
          }
        }
      }
    })

    // Create guest access token
    const token = await createGuestToken(booking.id, guestEmail)
    
    // Prepare email data
    const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/rentals/dashboard/guest/${token}`
    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/rentals/verify/${token}`
    
    // Send appropriate email based on car type
    if (isP2P) {
      // P2P requires verification
      await sendEmail({
        to: guestEmail,
        subject: 'Action Required: Complete Verification for Your Rental',
        template: 'rental-verification-required',
        data: {
          guestName: guestName || 'Guest',
          carName: `${car.year} ${car.make} ${car.model}`,
          bookingCode,
          verifyUrl,
          dashboardUrl,
          deadline: '24 hours',
          hostName: car.host.name,
          pickupDate: startDateTime.toLocaleDateString(),
          totalAmount: totalAmount.toFixed(2)
        }
      })
    } else {
      // Amadeus - instant confirmation
      await sendEmail({
        to: guestEmail,
        subject: 'Booking Confirmed - Your Rental is Ready!',
        template: 'rental-confirmation',
        data: {
          guestName: guestName || 'Guest',
          carName: `${car.year} ${car.make} ${car.model}`,
          bookingCode,
          dashboardUrl,
          pickupDate: startDateTime.toLocaleDateString(),
          pickupLocation,
          totalAmount: totalAmount.toFixed(2)
        }
      })
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        status: booking.status,
        verificationRequired,
        dashboardUrl,
        verifyUrl: verificationRequired ? verifyUrl : null,
        totalAmount
      },
      message: verificationRequired 
        ? 'Booking pending - verification required within 24 hours' 
        : 'Booking confirmed!'
    })
    
  } catch (error) {
    console.error('Guest booking error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}