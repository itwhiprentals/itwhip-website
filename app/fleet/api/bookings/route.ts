// app/fleet/api/bookings/route.ts
// Fleet-level bookings API - comprehensive booking management

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sendPendingReviewEmail, sendHostReviewEmail } from '@/app/lib/email/booking-emails'
import { sendEmail } from '@/app/lib/email/sender'

export async function GET(request: NextRequest) {
  try {
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const status = searchParams.get('status')
    const verificationStatus = searchParams.get('verificationStatus')
    const search = searchParams.get('search')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const hostId = searchParams.get('hostId')
    const tab = searchParams.get('tab') // 'all', 'pending_verification', 'active', 'needs_attention'

    // Build where clause
    const where: any = {}

    // Status filter
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    // Verification status filter
    if (verificationStatus && verificationStatus !== 'all') {
      where.verificationStatus = verificationStatus.toUpperCase()
    }

    // Tab-based filters
    if (tab === 'pending_review') {
      where.fleetStatus = 'PENDING'
      where.paymentStatus = 'AUTHORIZED'
    } else if (tab === 'pending_verification') {
      where.verificationStatus = 'PENDING'
      where.status = { in: ['PENDING', 'CONFIRMED'] }
    } else if (tab === 'active') {
      where.status = 'ACTIVE'
    } else if (tab === 'on_hold') {
      where.status = 'ON_HOLD'
    } else if (tab === 'needs_attention') {
      where.OR = [
        { flaggedForReview: true },
        { verificationStatus: 'PENDING', verificationDeadline: { lte: new Date() } },
        { status: 'DISPUTE_REVIEW' },
        { status: 'ON_HOLD' },
        { riskScore: { gte: 60 } },
        { hostFinalReviewStatus: 'CLAIM_FILED' }
      ]
    } else if (tab === 'pending_host_review') {
      where.hostFinalReviewStatus = 'PENDING_REVIEW'
      where.status = 'COMPLETED'
    } else if (tab === 'today') {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)
      where.OR = [
        { startDate: { gte: todayStart, lte: todayEnd } },
        { endDate: { gte: todayStart, lte: todayEnd } }
      ]
    }

    // Search filter
    if (search) {
      where.OR = [
        ...(where.OR || []),
        { bookingCode: { contains: search, mode: 'insensitive' } },
        { guestName: { contains: search, mode: 'insensitive' } },
        { guestEmail: { contains: search, mode: 'insensitive' } },
        { guestPhone: { contains: search } }
      ]
    }

    // Date range filter
    if (dateFrom) {
      where.startDate = { ...(where.startDate || {}), gte: new Date(dateFrom) }
    }
    if (dateTo) {
      where.endDate = { ...(where.endDate || {}), lte: new Date(dateTo) }
    }

    // Host filter
    if (hostId) {
      where.hostId = hostId
    }

    // Get total count
    const totalCount = await prisma.rentalBooking.count({ where })

    // Fetch bookings with relations
    const bookings = await prisma.rentalBooking.findMany({
      where,
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            licensePlate: true,
            source: true,
            photos: {
              take: 1,
              orderBy: { order: 'asc' },
              select: { url: true }
            }
          }
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        reviewerProfile: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            stripeIdentityStatus: true,
            documentsVerified: true
          }
        },
        disputes: {
          select: {
            id: true,
            type: true,
            status: true,
            description: true,
            createdAt: true
          }
        },
        Claim: {
          select: {
            id: true,
            type: true,
            status: true,
            estimatedCost: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    // Format bookings for response
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      bookingCode: booking.bookingCode,

      // Guest info
      guestId: booking.reviewerProfile?.id || booking.renterId,
      guestName: booking.guestName || booking.reviewerProfile?.name || 'Guest',
      guestEmail: booking.guestEmail || booking.reviewerProfile?.email || '',
      guestPhone: booking.guestPhone || booking.reviewerProfile?.phoneNumber || '',
      guestStripeVerified: booking.reviewerProfile?.stripeIdentityStatus === 'verified',

      // Car info
      car: {
        id: booking.car.id,
        make: booking.car.make,
        model: booking.car.model,
        year: booking.car.year,
        licensePlate: booking.car.licensePlate,
        source: booking.car.source,
        photoUrl: booking.car.photos[0]?.url
      },

      // Host info
      host: {
        id: booking.host.id,
        name: booking.host.name,
        email: booking.host.email,
        phone: booking.host.phone
      },

      // Dates
      startDate: booking.startDate,
      endDate: booking.endDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      numberOfDays: booking.numberOfDays,

      // Location
      pickupType: booking.pickupType,
      pickupLocation: booking.pickupLocation,
      deliveryAddress: booking.deliveryAddress,
      returnLocation: booking.returnLocation,

      // Pricing
      dailyRate: booking.dailyRate,
      subtotal: booking.subtotal,
      deliveryFee: booking.deliveryFee,
      insuranceFee: booking.insuranceFee,
      serviceFee: booking.serviceFee,
      taxes: booking.taxes,
      totalAmount: booking.totalAmount,
      depositAmount: booking.depositAmount,

      // Status
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      paymentType: booking.paymentType || null,
      fleetStatus: booking.fleetStatus,
      hostStatus: booking.hostStatus,
      verificationStatus: booking.verificationStatus,
      tripStatus: booking.tripStatus,

      // Host Final Review
      hostFinalReviewStatus: booking.hostFinalReviewStatus || null,
      hostFinalReviewDeadline: booking.hostFinalReviewDeadline,
      depositRefunded: booking.depositRefunded,
      depositRefundedAt: booking.depositRefundedAt,

      // Verification
      licenseVerified: booking.licenseVerified,
      selfieVerified: booking.selfieVerified,
      licensePhotoUrl: booking.licensePhotoUrl,
      insurancePhotoUrl: booking.insurancePhotoUrl,
      selfiePhotoUrl: booking.selfiePhotoUrl,
      licenseNumber: booking.licenseNumber,
      licenseState: booking.licenseState,
      licenseExpiry: booking.licenseExpiry,
      dateOfBirth: booking.dateOfBirth,
      documentsSubmittedAt: booking.documentsSubmittedAt,
      verificationDeadline: booking.verificationDeadline,
      verificationNotes: booking.verificationNotes,
      reviewedBy: booking.reviewedBy,
      reviewedAt: booking.reviewedAt,

      // Hold
      holdReason: booking.holdReason,
      heldAt: booking.heldAt,
      heldBy: booking.heldBy,
      holdDeadline: booking.holdDeadline,
      holdMessage: booking.holdMessage,
      previousStatus: booking.previousStatus,

      // Cancellation
      cancellationReason: booking.cancellationReason,
      cancelledBy: booking.cancelledBy,
      cancelledAt: booking.cancelledAt,

      // Trip
      tripStartedAt: booking.tripStartedAt,
      tripEndedAt: booking.tripEndedAt,
      startMileage: booking.startMileage,
      endMileage: booking.endMileage,

      // Risk
      riskScore: booking.riskScore,
      riskFlags: booking.riskFlags,
      flaggedForReview: booking.flaggedForReview,
      fraudulent: booking.fraudulent,

      // Relations
      hasDispute: booking.disputes.length > 0,
      disputes: booking.disputes,
      hasClaim: booking.Claim.length > 0,
      claims: booking.Claim,

      // Timestamps
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }))

    // Get stats for dashboard
    const [pendingVerification, activeBookings, needsAttention, todayBookings, pendingReview, pendingHostReview, onHoldBookings] = await Promise.all([
      prisma.rentalBooking.count({
        where: { verificationStatus: 'PENDING', status: { in: ['PENDING', 'CONFIRMED'] } }
      }),
      prisma.rentalBooking.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.rentalBooking.count({
        where: {
          OR: [
            { flaggedForReview: true },
            { status: 'DISPUTE_REVIEW' },
            { riskScore: { gte: 60 } }
          ]
        }
      }),
      prisma.rentalBooking.count({
        where: {
          OR: [
            { startDate: { gte: new Date(new Date().setHours(0,0,0,0)), lte: new Date(new Date().setHours(23,59,59,999)) } },
            { endDate: { gte: new Date(new Date().setHours(0,0,0,0)), lte: new Date(new Date().setHours(23,59,59,999)) } }
          ]
        }
      }),
      // Pending Fleet Review (fleetStatus = PENDING with payment authorized)
      prisma.rentalBooking.count({
        where: { fleetStatus: 'PENDING', paymentStatus: 'AUTHORIZED' }
      }),
      // Pending Host Final Review (completed trips awaiting host deposit review)
      prisma.rentalBooking.count({
        where: { hostFinalReviewStatus: 'PENDING_REVIEW', status: 'COMPLETED' }
      }),
      // On Hold bookings
      prisma.rentalBooking.count({
        where: { status: 'ON_HOLD' }
      })
    ])

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount
      },
      stats: {
        pendingVerification,
        activeBookings,
        needsAttention,
        todayBookings,
        totalBookings: totalCount,
        pendingReview,
        pendingHostReview,
        onHoldBookings
      }
    })

  } catch (error: any) {
    console.error('Error fetching fleet bookings:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// PATCH - Update booking status/verification
export async function PATCH(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      bookingId,
      action,
      status,
      verificationStatus,
      notes,
      reason,
      newCarId,
      modifications
    } = body

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 })
    }

    const updateData: any = {}

    // Handle different actions
    switch (action) {
      case 'approve': {
        // Three-tier: fleet approves → host reviews next (payment NOT captured yet)
        updateData.fleetStatus = 'APPROVED'
        updateData.hostStatus = 'PENDING'
        updateData.hostNotifiedAt = new Date()
        updateData.verificationStatus = 'APPROVED'
        updateData.reviewedAt = new Date()
        updateData.reviewedBy = 'fleet-admin'
        updateData.licenseVerified = true
        updateData.selfieVerified = true
        if (notes) updateData.verificationNotes = notes

        // Send host review email
        const approvedBooking = await prisma.rentalBooking.findUnique({
          where: { id: bookingId },
          select: {
            id: true, bookingCode: true, guestName: true,
            startDate: true, endDate: true, pickupLocation: true,
            totalAmount: true, numberOfDays: true,
            car: { select: { make: true, model: true, year: true, photos: { select: { url: true }, take: 1 } } },
            host: { select: { email: true, name: true } }
          }
        })
        if (approvedBooking?.host?.email) {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'
          sendHostReviewEmail({
            hostEmail: approvedBooking.host.email,
            hostName: approvedBooking.host.name || 'Host',
            bookingCode: approvedBooking.bookingCode,
            guestName: approvedBooking.guestName || 'Guest',
            carMake: approvedBooking.car.make,
            carModel: approvedBooking.car.model,
            carYear: approvedBooking.car.year,
            carImage: approvedBooking.car.photos?.[0]?.url || '',
            startDate: approvedBooking.startDate.toISOString(),
            endDate: approvedBooking.endDate.toISOString(),
            pickupLocation: approvedBooking.pickupLocation || 'TBD',
            totalAmount: approvedBooking.totalAmount?.toFixed(2) || '0.00',
            numberOfDays: approvedBooking.numberOfDays || 1,
            reviewUrl: `${baseUrl}/partner/bookings/${approvedBooking.id}`
          }).catch(err => console.error('[Fleet Approve] Host email error:', err))
        }
        break
      }

      case 'reject':
        updateData.fleetStatus = 'REJECTED'
        updateData.verificationStatus = 'REJECTED'
        updateData.status = 'CANCELLED'
        updateData.paymentStatus = 'CANCELLED'
        updateData.cancelledAt = new Date()
        updateData.cancelledBy = 'ADMIN'
        updateData.cancellationReason = reason || notes || 'Rejected by fleet admin'
        if (notes) updateData.verificationNotes = notes
        break

      case 'cancel':
        updateData.status = 'CANCELLED'
        updateData.cancelledAt = new Date()
        updateData.cancelledBy = 'ADMIN'
        updateData.cancellationReason = reason || 'Cancelled by fleet admin'
        break

      case 'modify':
        if (modifications) {
          if (modifications.startDate) updateData.startDate = new Date(modifications.startDate)
          if (modifications.endDate) updateData.endDate = new Date(modifications.endDate)
          if (modifications.startTime) updateData.startTime = modifications.startTime
          if (modifications.endTime) updateData.endTime = modifications.endTime
          if (modifications.pickupLocation) updateData.pickupLocation = modifications.pickupLocation
          if (modifications.deliveryAddress) updateData.deliveryAddress = modifications.deliveryAddress
        }
        break

      case 'change_car':
        if (newCarId) {
          // Get new car details
          const newCar = await prisma.rentalCar.findUnique({
            where: { id: newCarId },
            select: { dailyRate: true, hostId: true }
          })
          if (!newCar) {
            return NextResponse.json({ error: 'Car not found' }, { status: 404 })
          }
          updateData.carId = newCarId
          // Optionally update host if car belongs to different host
          if (newCar.hostId) {
            updateData.hostId = newCar.hostId
          }
        }
        break

      case 'request_documents': {
        const { documentTypes, deadline, message, placeOnHold } = body
        if (!documentTypes || !Array.isArray(documentTypes) || documentTypes.length === 0) {
          return NextResponse.json({ error: 'documentTypes must be a non-empty array' }, { status: 400 })
        }

        const holdBooking = await prisma.rentalBooking.findUnique({
          where: { id: bookingId },
          select: {
            id: true, bookingCode: true, status: true,
            guestEmail: true, guestName: true, guestPhone: true,
            reviewerProfileId: true, renterId: true, hostId: true,
            startDate: true, endDate: true,
            car: { select: { make: true, model: true, year: true } },
            host: { select: { name: true, phone: true } }
          }
        })
        if (!holdBooking) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        if (placeOnHold && holdBooking.status === 'CONFIRMED') {
          updateData.previousStatus = holdBooking.status
          updateData.status = 'ON_HOLD'
        }

        updateData.holdReason = 'stripe_identity_required'
        updateData.heldAt = new Date()
        updateData.heldBy = 'fleet-admin'
        updateData.holdDocumentTypes = documentTypes
        updateData.holdDeadline = deadline ? new Date(deadline) : null
        updateData.holdMessage = message || null
        updateData.verificationStatus = 'PENDING'

        // Send verification request email to guest
        const bookingCode = holdBooking.bookingCode
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'
        const verifyUrl = `${baseUrl}/rentals/dashboard/bookings/${holdBooking.id}`
        const guestName = holdBooking.guestName || 'Guest'
        const carInfo = `${holdBooking.car.year} ${holdBooking.car.make} ${holdBooking.car.model}`

        const emailSubject = `Action Required: Complete Identity Verification - ${bookingCode}`
        const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;">
    <tr>
      <td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px 24px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:24px;">ItWhip</h1>
        <p style="color:#dcfce7;margin:8px 0 0;font-size:14px;">Identity Verification Required</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 24px;">
        <p style="font-size:16px;color:#1f2937;margin:0 0 16px;">Hi ${guestName},</p>
        <p style="font-size:14px;color:#4b5563;line-height:1.6;margin:0 0 16px;">
          Your booking <strong>${bookingCode}</strong> for the <strong>${carInfo}</strong> has been placed on hold pending identity verification.
        </p>
        <p style="font-size:14px;color:#4b5563;line-height:1.6;margin:0 0 16px;">
          To proceed with your reservation, we need you to complete identity verification. This helps us ensure the safety and security of all our guests and hosts.
        </p>
        ${message ? `<div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;margin:0 0 16px;border-radius:0 4px 4px 0;"><p style="font-size:13px;color:#92400e;margin:0;"><strong>Note from our team:</strong> ${message}</p></div>` : ''}
        ${deadline ? `<p style="font-size:13px;color:#dc2626;margin:0 0 16px;"><strong>Deadline:</strong> Please complete verification by ${new Date(deadline).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.</p>` : ''}
        <div style="text-align:center;margin:24px 0;">
          <a href="${verifyUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:bold;">
            Verify My Identity
          </a>
        </div>
        <p style="font-size:13px;color:#6b7280;line-height:1.5;margin:16px 0 0;">
          If you have questions, please don't hesitate to contact our support team.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="font-size:12px;color:#9ca3af;margin:0;">&copy; ${new Date().getFullYear()} ItWhip. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`
        const emailText = `Hi ${guestName},\n\nYour booking ${bookingCode} for the ${carInfo} has been placed on hold pending identity verification.\n\nTo proceed with your reservation, please complete identity verification at: ${verifyUrl}\n\n${message ? `Note from our team: ${message}\n\n` : ''}${deadline ? `Deadline: ${new Date(deadline).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n` : ''}If you have questions, please contact our support team.\n\n- ItWhip Team`

        if (holdBooking.guestEmail) {
          sendEmail(holdBooking.guestEmail, emailSubject, emailHtml, emailText)
            .catch(err => console.error('[Fleet] Verification request email error:', err))
        }

        // SMS + bell notifications for ON_HOLD (fire-and-forget)
        import('@/app/lib/notifications/hold-notifications').then(({ sendBookingOnHoldNotifications }) => {
          sendBookingOnHoldNotifications({
            bookingId: holdBooking.id,
            bookingCode: holdBooking.bookingCode,
            guestPhone: holdBooking.guestPhone,
            guestEmail: holdBooking.guestEmail || '',
            guestName: holdBooking.guestName || 'Guest',
            guestId: holdBooking.reviewerProfileId,
            userId: holdBooking.renterId,
            hostId: holdBooking.hostId,
            hostName: holdBooking.host?.name || 'Host',
            hostPhone: holdBooking.host?.phone || null,
            car: { year: holdBooking.car.year, make: holdBooking.car.make, model: holdBooking.car.model },
            holdReason: message || 'Identity verification required',
            startDate: holdBooking.startDate,
            endDate: holdBooking.endDate,
          }).catch(e => console.error('[Fleet] ON_HOLD notification failed:', e))
        }).catch(e => console.error('[Fleet] hold-notifications import failed:', e))
        break
      }

      case 'release_hold': {
        const heldBooking = await prisma.rentalBooking.findUnique({
          where: { id: bookingId },
          select: { id: true, status: true, previousStatus: true }
        })
        if (!heldBooking) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }
        if (heldBooking.status !== 'ON_HOLD') {
          return NextResponse.json({ error: 'Booking is not on hold' }, { status: 400 })
        }

        updateData.status = heldBooking.previousStatus || 'CONFIRMED'
        updateData.holdReason = null
        updateData.heldAt = null
        updateData.heldBy = null
        updateData.holdDeadline = null
        updateData.holdMessage = null
        updateData.previousStatus = null
        updateData.verificationStatus = 'APPROVED'
        updateData.reviewedBy = 'fleet-admin'
        updateData.reviewedAt = new Date()
        break
      }

      case 'resend_email': {
        // Resend the appropriate email based on booking state
        const booking = await prisma.rentalBooking.findUnique({
          where: { id: bookingId },
          select: {
            id: true, bookingCode: true, status: true, fleetStatus: true, hostStatus: true,
            guestEmail: true, guestName: true, guestPhone: true,
            startDate: true, endDate: true, startTime: true, endTime: true,
            pickupLocation: true, totalAmount: true, numberOfDays: true,
            carId: true, hostId: true,
            car: { select: { make: true, model: true, year: true, photos: { select: { url: true }, take: 1 } } },
            host: { select: { id: true, name: true, email: true } },
          }
        })
        if (!booking) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        // Find guest access token
        const guestToken = await prisma.guestAccessToken.findFirst({
          where: { bookingId },
          select: { token: true },
          orderBy: { createdAt: 'desc' }
        })

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'

        if (booking.fleetStatus === 'APPROVED' && booking.hostStatus === 'PENDING') {
          // Resend host review email
          await sendHostReviewEmail({
            hostEmail: booking.host.email || '',
            hostName: booking.host.name || 'Host',
            bookingCode: booking.bookingCode,
            guestName: booking.guestName || 'Guest',
            carMake: booking.car.make,
            carModel: booking.car.model,
            carYear: booking.car.year,
            carImage: booking.car.photos?.[0]?.url || '',
            startDate: booking.startDate.toISOString(),
            endDate: booking.endDate.toISOString(),
            pickupLocation: booking.pickupLocation || 'TBD',
            totalAmount: booking.totalAmount?.toFixed(2) || '0.00',
            numberOfDays: booking.numberOfDays || 1,
            reviewUrl: `${baseUrl}/partner/bookings/${booking.id}`
          })
          return NextResponse.json({ success: true, message: 'Host review email resent' })
        } else {
          // Default: resend pending review email to guest
          await sendPendingReviewEmail({
            guestEmail: booking.guestEmail || '',
            guestName: booking.guestName || 'Guest',
            bookingCode: booking.bookingCode,
            carMake: booking.car.make,
            carModel: booking.car.model,
            carImage: booking.car.photos?.[0]?.url || '',
            startDate: booking.startDate.toISOString(),
            endDate: booking.endDate.toISOString(),
            pickupLocation: booking.pickupLocation || 'TBD',
            totalAmount: booking.totalAmount?.toFixed(2) || '0.00',
            documentsSubmittedAt: new Date().toISOString(),
            estimatedReviewTime: '1-2 hours',
            trackingUrl: `${baseUrl}/rentals/dashboard/guest/${guestToken?.token || ''}`,
            accessToken: guestToken?.token || '',
          })
          return NextResponse.json({ success: true, message: 'Guest booking email resent' })
        }
      }

      case 'flag_review':
        updateData.flaggedForReview = true
        if (notes) updateData.riskNotes = notes
        break

      case 'unflag_review':
        updateData.flaggedForReview = false
        break

      default:
        // Generic status updates
        if (status) {
          updateData.status = status.toUpperCase()
          if (status.toUpperCase() === 'CANCELLED') {
            updateData.cancelledAt = new Date()
            updateData.cancelledBy = 'ADMIN'
            if (reason) updateData.cancellationReason = reason
          }
        }
        if (verificationStatus) {
          updateData.verificationStatus = verificationStatus.toUpperCase()
          if (verificationStatus.toUpperCase() === 'APPROVED') {
            updateData.reviewedAt = new Date()
            updateData.reviewedBy = 'fleet-admin'
          }
        }
        if (notes) {
          updateData.verificationNotes = notes
        }
    }

    // Update the booking
    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        car: { select: { make: true, model: true, year: true } },
        host: { select: { name: true, email: true } }
      }
    })

    // Create activity log
    await prisma.activityLog.create({
      data: {
        id: `al_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        action: action || 'update_booking',
        entityType: 'RentalBooking',
        entityId: bookingId,
        metadata: {
          changes: updateData,
          notes,
          reason,
          performedBy: 'fleet-admin'
        }
      }
    })

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: `Booking ${action || 'updated'} successfully`
    })

  } catch (error: any) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update booking' },
      { status: 500 }
    )
  }
}
