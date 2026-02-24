// app/lib/booking/services/fleet-approval.ts
// Fleet-first approval system for booking review
// All bookings must be approved by Fleet before host is notified

import { prisma } from '@/app/lib/database/prisma'
import { capturePayment, cancelAuthorization } from './payment-service'

// Types
export type FleetStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_INFO'

export interface FleetReviewResult {
  success: boolean
  bookingId?: string
  newStatus?: FleetStatus
  error?: string
}

export interface BookingForReview {
  id: string
  bookingCode: string
  guestName: string | null
  guestEmail: string | null
  guestPhone: string | null
  carInfo: {
    make: string
    model: string
    year: number
  }
  hostName: string
  startDate: Date
  endDate: Date
  totalAmount: number
  fleetStatus: string
  aiLicenseVerified: boolean
  aiLicenseConfidence: number | null
  aiFraudScore: number | null
  aiFraudFlags: unknown
  riskScore: number | null
  createdAt: Date
  documents: Array<{
    type: string
    url: string
    aiAnalysis: unknown
  }>
}

/**
 * Get all bookings pending Fleet review
 */
export async function getPendingReviewBookings(): Promise<BookingForReview[]> {
  const bookings = await prisma.rentalBooking.findMany({
    where: {
      fleetStatus: 'PENDING',
      paymentStatus: 'AUTHORIZED', // Only show bookings with valid payment auth
    },
    include: {
      car: {
        select: { make: true, model: true, year: true },
      },
      host: {
        select: { businessName: true, name: true },
      },
      bookingDocuments: {
        select: { type: true, url: true, aiAnalysis: true },
      },
    },
    orderBy: { createdAt: 'asc' }, // FIFO
  })

  return bookings.map((b) => ({
    id: b.id,
    bookingCode: b.bookingCode,
    guestName: b.guestName,
    guestEmail: b.guestEmail,
    guestPhone: b.guestPhone,
    carInfo: {
      make: b.car.make,
      model: b.car.model,
      year: b.car.year,
    },
    hostName: b.host.businessName || b.host.name || 'Unknown Host',
    startDate: b.startDate,
    endDate: b.endDate,
    totalAmount: b.totalAmount,
    fleetStatus: b.fleetStatus,
    aiLicenseVerified: b.aiLicenseVerified,
    aiLicenseConfidence: b.aiLicenseConfidence,
    aiFraudScore: b.aiFraudScore,
    aiFraudFlags: b.aiFraudFlags,
    riskScore: b.riskScore,
    createdAt: b.createdAt,
    documents: b.bookingDocuments,
  }))
}

/**
 * Approve a booking - notifies host and captures payment
 */
export async function approveBooking(params: {
  bookingId: string
  reviewedBy: string
  notes?: string
}): Promise<FleetReviewResult> {
  try {
    // Get booking with guest/host data for notifications
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: params.bookingId },
      select: {
        id: true,
        bookingCode: true,
        fleetStatus: true,
        paymentIntentId: true,
        hostId: true,
        guestPhone: true,
        guestName: true,
        reviewerProfileId: true,
        renterId: true,
        startDate: true,
        endDate: true,
        car: { select: { year: true, make: true, model: true } },
        host: { select: { name: true, phone: true } },
      },
    })

    if (!booking) {
      return { success: false, error: 'Booking not found' }
    }

    if (booking.fleetStatus !== 'PENDING') {
      return { success: false, error: `Booking already ${booking.fleetStatus.toLowerCase()}` }
    }

    // Update booking status
    await prisma.rentalBooking.update({
      where: { id: params.bookingId },
      data: {
        fleetStatus: 'APPROVED',
        fleetReviewedBy: params.reviewedBy,
        fleetReviewedAt: new Date(),
        fleetNotes: params.notes,
        hostNotifiedAt: new Date(), // Mark host notification time
        status: 'CONFIRMED', // Move booking to confirmed
      },
    })

    // Send SMS notifications (fire-and-forget)
    import('@/app/lib/twilio/sms-triggers').then(({ sendBookingConfirmedSms }) => {
      sendBookingConfirmedSms({
        bookingCode: booking.bookingCode,
        guestPhone: booking.guestPhone,
        guestName: booking.guestName,
        guestId: booking.reviewerProfileId,
        hostPhone: booking.host.phone,
        hostName: booking.host.name,
        car: booking.car,
        startDate: booking.startDate,
        endDate: booking.endDate,
        bookingId: booking.id,
        hostId: booking.hostId,
      }).catch(e => console.error('[fleet-approval] SMS failed:', e))
    }).catch(e => console.error('[SMS] sms-triggers import failed:', e))

    // Bell notifications for guest + host (fire-and-forget)
    import('@/app/lib/notifications/booking-bell').then(({ createBookingNotificationPair }) => {
      const carName = `${booking.car.year} ${booking.car.make} ${booking.car.model}`
      createBookingNotificationPair({
        bookingId: booking.id,
        guestId: booking.reviewerProfileId,
        userId: booking.renterId,
        hostId: booking.hostId,
        type: 'BOOKING_CONFIRMED',
        guestTitle: 'Booking confirmed!',
        guestMessage: `Your booking #${booking.bookingCode} for the ${carName} has been confirmed.`,
        hostTitle: `Booking ${booking.bookingCode} confirmed`,
        hostMessage: `Booking #${booking.bookingCode} for your ${carName} has been confirmed by fleet.`,
        guestActionUrl: `/rentals/dashboard/bookings/${booking.id}`,
        hostActionUrl: `/partner/bookings/${booking.id}`,
        priority: 'HIGH',
      }).catch(e => console.error('[fleet-approval] Bell notification failed:', e))
    }).catch(e => console.error('[fleet-approval] booking-bell import failed:', e))

    return {
      success: true,
      bookingId: params.bookingId,
      newStatus: 'APPROVED',
    }
  } catch (error) {
    console.error('[fleet-approval] Approve error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Approval failed',
    }
  }
}

/**
 * Reject a booking - cancels authorization and notifies guest
 */
export async function rejectBooking(params: {
  bookingId: string
  reviewedBy: string
  reason: string
  notes?: string
}): Promise<FleetReviewResult> {
  try {
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: params.bookingId },
      select: {
        id: true,
        fleetStatus: true,
        paymentIntentId: true,
      },
    })

    if (!booking) {
      return { success: false, error: 'Booking not found' }
    }

    if (booking.fleetStatus !== 'PENDING' && booking.fleetStatus !== 'NEEDS_INFO') {
      return { success: false, error: `Cannot reject booking with status ${booking.fleetStatus}` }
    }

    // Cancel the payment authorization
    if (booking.paymentIntentId) {
      const cancelResult = await cancelAuthorization({
        bookingId: params.bookingId,
        paymentIntentId: booking.paymentIntentId,
        reason: params.reason,
      })

      if (!cancelResult.success) {
        console.error('[fleet-approval] Failed to cancel authorization:', cancelResult.error)
        // Continue with rejection even if cancel fails
      }
    }

    // Update booking status
    await prisma.rentalBooking.update({
      where: { id: params.bookingId },
      data: {
        fleetStatus: 'REJECTED',
        fleetReviewedBy: params.reviewedBy,
        fleetReviewedAt: new Date(),
        fleetNotes: params.notes ? `${params.reason}\n\n${params.notes}` : params.reason,
        status: 'CANCELLED',
        cancellationReason: params.reason,
        cancelledBy: 'SYSTEM',
        cancelledAt: new Date(),
      },
    })

    // TODO: Send rejection notification to guest
    // await sendGuestRejectionNotification(params.bookingId, params.reason)

    return {
      success: true,
      bookingId: params.bookingId,
      newStatus: 'REJECTED',
    }
  } catch (error) {
    console.error('[fleet-approval] Reject error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Rejection failed',
    }
  }
}

/**
 * Request additional documents from guest
 */
export async function requestDocuments(params: {
  bookingId: string
  reviewedBy: string
  documentsNeeded: string[] // e.g., ['LICENSE_BACK', 'SELFIE', 'INSURANCE']
  message?: string
}): Promise<FleetReviewResult> {
  try {
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: params.bookingId },
      select: { id: true, fleetStatus: true },
    })

    if (!booking) {
      return { success: false, error: 'Booking not found' }
    }

    if (booking.fleetStatus !== 'PENDING') {
      return { success: false, error: `Cannot request docs for booking with status ${booking.fleetStatus}` }
    }

    // Update booking status
    await prisma.rentalBooking.update({
      where: { id: params.bookingId },
      data: {
        fleetStatus: 'NEEDS_INFO',
        fleetReviewedBy: params.reviewedBy,
        fleetReviewedAt: new Date(),
        fleetNotes: `Documents requested: ${params.documentsNeeded.join(', ')}${params.message ? `\n\nMessage: ${params.message}` : ''}`,
        verificationStatus: 'PENDING',
      },
    })

    // TODO: Send email to guest requesting documents
    // await sendDocumentRequestEmail(params.bookingId, params.documentsNeeded, params.message)

    return {
      success: true,
      bookingId: params.bookingId,
      newStatus: 'NEEDS_INFO',
    }
  } catch (error) {
    console.error('[fleet-approval] Request docs error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Document request failed',
    }
  }
}

/**
 * Get booking details for Fleet review
 */
export async function getBookingForReview(bookingId: string): Promise<BookingForReview | null> {
  const booking = await prisma.rentalBooking.findUnique({
    where: { id: bookingId },
    include: {
      car: {
        select: { make: true, model: true, year: true },
      },
      host: {
        select: { businessName: true, name: true },
      },
      bookingDocuments: {
        select: { type: true, url: true, aiAnalysis: true },
      },
    },
  })

  if (!booking) return null

  return {
    id: booking.id,
    bookingCode: booking.bookingCode,
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    guestPhone: booking.guestPhone,
    carInfo: {
      make: booking.car.make,
      model: booking.car.model,
      year: booking.car.year,
    },
    hostName: booking.host.businessName || booking.host.name || 'Unknown Host',
    startDate: booking.startDate,
    endDate: booking.endDate,
    totalAmount: booking.totalAmount,
    fleetStatus: booking.fleetStatus,
    aiLicenseVerified: booking.aiLicenseVerified,
    aiLicenseConfidence: booking.aiLicenseConfidence,
    aiFraudScore: booking.aiFraudScore,
    aiFraudFlags: booking.aiFraudFlags,
    riskScore: booking.riskScore,
    createdAt: booking.createdAt,
    documents: booking.bookingDocuments,
  }
}

/**
 * Get Fleet review statistics
 */
export async function getFleetReviewStats(): Promise<{
  pendingCount: number
  approvedToday: number
  rejectedToday: number
  needsInfoCount: number
  avgReviewTimeMs: number
}> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [pending, approvedToday, rejectedToday, needsInfo] = await Promise.all([
    prisma.rentalBooking.count({ where: { fleetStatus: 'PENDING' } }),
    prisma.rentalBooking.count({
      where: {
        fleetStatus: 'APPROVED',
        fleetReviewedAt: { gte: today },
      },
    }),
    prisma.rentalBooking.count({
      where: {
        fleetStatus: 'REJECTED',
        fleetReviewedAt: { gte: today },
      },
    }),
    prisma.rentalBooking.count({ where: { fleetStatus: 'NEEDS_INFO' } }),
  ])

  // Calculate average review time for today's reviewed bookings
  const reviewedToday = await prisma.rentalBooking.findMany({
    where: {
      fleetReviewedAt: { gte: today },
    },
    select: {
      createdAt: true,
      fleetReviewedAt: true,
    },
  })

  const totalReviewTime = reviewedToday.reduce((sum, b) => {
    if (b.fleetReviewedAt) {
      return sum + (b.fleetReviewedAt.getTime() - b.createdAt.getTime())
    }
    return sum
  }, 0)

  const avgReviewTimeMs = reviewedToday.length > 0 ? totalReviewTime / reviewedToday.length : 0

  return {
    pendingCount: pending,
    approvedToday,
    rejectedToday,
    needsInfoCount: needsInfo,
    avgReviewTimeMs,
  }
}
