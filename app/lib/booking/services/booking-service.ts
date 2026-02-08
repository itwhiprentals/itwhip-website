// app/lib/booking/services/booking-service.ts
// Core booking service - orchestrates booking creation for visitors and guests
// Handles auto-account creation, payment authorization, and Fleet queue status

import { prisma } from '@/app/lib/database/prisma'
import { Prisma } from '@prisma/client'
import { nanoid } from 'nanoid'
import { authorizePayment } from './payment-service'
import { convertVisitorToAccount, type VisitorBookingData } from './visitor-account'
import { generateAutoLoginToken } from './auto-login'

// Types
export interface BookingRequest {
  // Car and dates
  carId: string
  pickupDate: string    // ISO date string
  returnDate: string    // ISO date string
  pickupTime?: string   // e.g., "10:00"
  returnTime?: string   // e.g., "18:00"
  pickupLocation?: string
  returnLocation?: string

  // Pricing (calculated by client, verified by server)
  dailyRate: number
  totalDays: number
  tripAmount: number       // Daily rate × days
  serviceFee: number       // Platform fee
  taxAmount: number        // Arizona tax
  securityDeposit: number
  totalAmount: number      // Trip + service fee + tax (deposit held separately)

  // Guest info (for visitors without account)
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dateOfBirth?: string

  // DL verification (for visitors)
  dlFrontUrl?: string
  dlBackUrl?: string
  selfieUrl?: string
  aiVerificationResult?: {
    confidence: number
    data?: {
      fullName: string
      licenseNumber: string
      expirationDate: string
      stateOrCountry: string
    }
    validation?: {
      isValid: boolean
      redFlags: string[]
    }
  }

  // Payment
  paymentMethodId?: string
  stripeCustomerId?: string

  // Existing user (if logged in)
  reviewerProfileId?: string
  userId?: string
}

export interface BookingResult {
  success: boolean
  bookingId?: string
  referenceId?: string
  reviewerProfileId?: string
  autoLoginToken?: string
  autoLoginUrl?: string
  paymentIntentId?: string
  clientSecret?: string
  error?: string
}

/**
 * Create a new booking
 * Handles both visitors (auto-creates account) and existing guests
 */
export async function createBooking(request: BookingRequest): Promise<BookingResult> {
  try {
    // Validate required fields
    const validation = validateBookingRequest(request)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Verify car exists and is available
    const car = await prisma.rentalCar.findUnique({
      where: { id: request.carId },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            requireDeposit: true,
            approvalStatus: true,
          }
        }
      }
    })

    if (!car) {
      return { success: false, error: 'Vehicle not found' }
    }

    if (!car.isActive || car.host?.approvalStatus !== 'APPROVED') {
      return { success: false, error: 'Vehicle is not available for booking' }
    }

    // Determine if this is a visitor (no account) or existing guest
    const isVisitor = !request.reviewerProfileId && !request.userId

    let reviewerProfileId = request.reviewerProfileId
    let autoLoginToken: string | undefined
    let autoLoginUrl: string | undefined

    // For visitors: Create account and link booking
    if (isVisitor) {
      if (!request.firstName || !request.lastName || !request.email || !request.phone) {
        return { success: false, error: 'Guest information required for new bookings' }
      }

      // Prepare visitor data for account creation
      const visitorData: VisitorBookingData = {
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        phone: request.phone,
        dateOfBirth: request.dateOfBirth,
        dlFrontUrl: request.dlFrontUrl,
        dlBackUrl: request.dlBackUrl,
        selfieUrl: request.selfieUrl,
        aiVerificationResult: request.aiVerificationResult,
      }

      // Create the booking first (we need the booking ID for account linking)
      const booking = await createBookingRecord({
        request,
        car,
        guestEmail: request.email,
        guestPhone: request.phone,
        guestName: `${request.firstName} ${request.lastName}`,
      })

      // Convert visitor to account and link booking
      const accountResult = await convertVisitorToAccount({
        bookingId: booking.id,
        visitorData,
      })

      if (!accountResult.success) {
        // Booking created but account failed - still return booking ID
        console.error('[booking-service] Account creation failed:', accountResult.error)
        return {
          success: true,
          bookingId: booking.id,
          referenceId: booking.bookingCode,
          error: 'Booking created but account setup failed. Please contact support.',
        }
      }

      reviewerProfileId = accountResult.reviewerProfileId
      autoLoginToken = accountResult.autoLoginToken
      autoLoginUrl = accountResult.autoLoginUrl

      // Update booking with profile link
      await prisma.rentalBooking.update({
        where: { id: booking.id },
        data: { reviewerProfileId },
      })

      // Authorize payment
      const paymentResult = await authorizePaymentForBooking(booking.id, request, car)
      if (!paymentResult.success) {
        // Payment failed - update booking status
        await prisma.rentalBooking.update({
          where: { id: booking.id },
          data: {
            status: 'CANCELLED',
            paymentStatus: 'FAILED',
            paymentFailureReason: paymentResult.error,
          }
        })
        return {
          success: false,
          bookingId: booking.id,
          referenceId: booking.bookingCode,
          error: paymentResult.error || 'Payment authorization failed',
        }
      }

      return {
        success: true,
        bookingId: booking.id,
        referenceId: booking.bookingCode,
        reviewerProfileId,
        autoLoginToken,
        autoLoginUrl,
        paymentIntentId: paymentResult.paymentIntentId,
        clientSecret: paymentResult.clientSecret,
      }
    }

    // For existing guests: Create booking directly
    const guestProfile = await prisma.reviewerProfile.findUnique({
      where: { id: reviewerProfileId },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        name: true,
      }
    })

    if (!guestProfile) {
      return { success: false, error: 'Guest profile not found' }
    }

    const booking = await createBookingRecord({
      request,
      car,
      reviewerProfileId: guestProfile.id,
      guestEmail: guestProfile.email || undefined,
      guestPhone: guestProfile.phoneNumber || undefined,
      guestName: guestProfile.name || 'Guest',
    })

    // Authorize payment
    const paymentResult = await authorizePaymentForBooking(booking.id, request, car)
    if (!paymentResult.success) {
      await prisma.rentalBooking.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'FAILED',
          paymentFailureReason: paymentResult.error,
        }
      })
      return {
        success: false,
        bookingId: booking.id,
        referenceId: booking.bookingCode,
        error: paymentResult.error || 'Payment authorization failed',
      }
    }

    return {
      success: true,
      bookingId: booking.id,
      referenceId: booking.bookingCode,
      reviewerProfileId: guestProfile.id,
      paymentIntentId: paymentResult.paymentIntentId,
      clientSecret: paymentResult.clientSecret,
    }

  } catch (error) {
    console.error('[booking-service] Create booking error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create booking',
    }
  }
}

/**
 * Create the booking record in database
 */
async function createBookingRecord(params: {
  request: BookingRequest
  car: any
  reviewerProfileId?: string
  guestEmail?: string
  guestPhone?: string
  guestName?: string
}): Promise<{ id: string; bookingCode: string }> {
  const { request, car, reviewerProfileId, guestEmail, guestPhone, guestName } = params

  // Generate unique booking code (e.g., BK-ABC123)
  const bookingCode = `BK-${nanoid(6).toUpperCase()}`

  const booking = await prisma.rentalBooking.create({
    data: {
      id: crypto.randomUUID(),
      // Reference
      bookingCode,

      // Car and host
      carId: request.carId,
      hostId: car.hostId,

      // Guest
      reviewerProfileId,
      guestEmail,
      guestPhone,
      guestName,

      // Dates and times
      startDate: new Date(request.pickupDate),
      endDate: new Date(request.returnDate),
      startTime: request.pickupTime || '10:00',
      endTime: request.returnTime || '10:00',
      pickupLocation: request.pickupLocation || car.city || '',
      pickupType: 'pickup',
      returnLocation: request.returnLocation || car.city,

      // Pricing
      dailyRate: request.dailyRate,
      numberOfDays: request.totalDays,
      subtotal: request.tripAmount,
      serviceFee: request.serviceFee,
      taxes: request.taxAmount,
      securityDeposit: request.securityDeposit,
      depositHeld: request.securityDeposit,
      totalAmount: request.totalAmount,

      // Status - Fleet-first approval
      status: 'PENDING',
      fleetStatus: 'PENDING',
      paymentStatus: 'PENDING',

      // AI verification (from visitor flow)
      aiLicenseVerified: request.aiVerificationResult?.validation?.isValid || false,
      aiLicenseConfidence: request.aiVerificationResult?.confidence,
      aiLicenseData: request.aiVerificationResult?.data
        ? (request.aiVerificationResult.data as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      verificationSource: reviewerProfileId ? 'EXISTING_GUEST' : 'BOOKING_FLOW',

      // Timestamps
      updatedAt: new Date(),
    },
    select: {
      id: true,
      bookingCode: true,
    }
  })

  return booking
}

/**
 * Authorize payment for a booking
 * Uses extended authorization (30 days hold) for car rentals
 */
async function authorizePaymentForBooking(
  bookingId: string,
  request: BookingRequest,
  car: any
): Promise<{
  success: boolean
  paymentIntentId?: string
  clientSecret?: string
  error?: string
}> {
  // Calculate total to authorize (trip + deposit)
  const amountToAuthorize = Math.round((request.totalAmount + request.securityDeposit) * 100) // Convert to cents

  const carDescription = `${car.year} ${car.make} ${car.model}`

  const result = await authorizePayment({
    bookingId,
    amount: Math.round(request.totalAmount * 100), // Trip amount in cents
    securityDeposit: Math.round(request.securityDeposit * 100), // Deposit in cents
    customerId: request.stripeCustomerId,
    paymentMethodId: request.paymentMethodId,
    customerEmail: request.email || '',
    customerName: request.firstName && request.lastName
      ? `${request.firstName} ${request.lastName}`
      : 'Guest',
    carDescription,
  })

  return result
}

/**
 * Validate booking request
 */
function validateBookingRequest(request: BookingRequest): { valid: boolean; error?: string } {
  if (!request.carId) {
    return { valid: false, error: 'Vehicle ID is required' }
  }

  if (!request.pickupDate || !request.returnDate) {
    return { valid: false, error: 'Pickup and return dates are required' }
  }

  const pickupDate = new Date(request.pickupDate)
  const returnDate = new Date(request.returnDate)
  const now = new Date()

  if (pickupDate < now) {
    return { valid: false, error: 'Pickup date must be in the future' }
  }

  if (returnDate <= pickupDate) {
    return { valid: false, error: 'Return date must be after pickup date' }
  }

  if (request.totalAmount <= 0) {
    return { valid: false, error: 'Invalid booking amount' }
  }

  return { valid: true }
}

/**
 * Get booking by ID
 */
export async function getBooking(bookingId: string) {
  return prisma.rentalBooking.findUnique({
    where: { id: bookingId },
    include: {
      car: {
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          photos: true,
          city: true,
        }
      },
      host: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        }
      },
      reviewerProfile: {
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
        }
      },
      documents: true,
    } as any
  })
}

/**
 * Get bookings for a guest
 */
export async function getGuestBookings(reviewerProfileId: string) {
  return prisma.rentalBooking.findMany({
    where: { reviewerProfileId },
    include: {
      car: {
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          photos: true,
          city: true,
        }
      },
      host: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
        }
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Cancel a booking
 */
export async function cancelBooking(params: {
  bookingId: string
  reason: string
  cancelledBy: 'guest' | 'host' | 'fleet'
}): Promise<{ success: boolean; error?: string }> {
  // Map lowercase cancelledBy to Prisma CancelledBy enum
  const cancelledByMap: Record<string, 'GUEST' | 'HOST' | 'ADMIN' | 'SYSTEM'> = {
    guest: 'GUEST',
    host: 'HOST',
    fleet: 'SYSTEM',
  }

  try {
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: params.bookingId },
      select: {
        id: true,
        status: true,
        paymentIntentId: true,
        paymentStatus: true,
      }
    })

    if (!booking) {
      return { success: false, error: 'Booking not found' }
    }

    // Can't cancel completed bookings
    if (booking.status === 'COMPLETED') {
      return { success: false, error: 'Cannot cancel completed booking' }
    }

    // Cancel payment authorization if exists
    if (booking.paymentIntentId && booking.paymentStatus === 'AUTHORIZED') {
      const { cancelAuthorization } = await import('./payment-service')
      await cancelAuthorization({
        bookingId: params.bookingId,
        reason: params.reason,
      })
    }

    // Update booking status
    await prisma.rentalBooking.update({
      where: { id: params.bookingId },
      data: {
        status: 'CANCELLED',
        fleetStatus: 'CANCELLED',
        cancellationReason: params.reason,
        cancelledBy: cancelledByMap[params.cancelledBy] || 'SYSTEM',
        cancelledAt: new Date(),
      }
    })

    return { success: true }
  } catch (error) {
    console.error('[booking-service] Cancel booking error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel booking',
    }
  }
}
