// app/api/fleet/bookings/[id]/refund-request/route.ts
// POST - Partner/Host submits refund request
//        Auto-approves and processes if under partner direct refund limit
// GET - Get refund request status for a booking

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { PaymentProcessor } from '@/app/lib/stripe/payment-processor'
import { stripe } from '@/app/lib/stripe/client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify fleet/partner access
    const key = request.nextUrl.searchParams.get('key')
    const partnerId = request.headers.get('x-partner-id')
    const hostId = request.headers.get('x-host-id')

    if (key !== 'phoenix-fleet-2847' && !partnerId && !hostId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: bookingId } = await params
    const body = await request.json()

    const { amount, reason, notes, requestedByType = 'PARTNER' } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid refund amount is required' },
        { status: 400 }
      )
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Refund reason is required' },
        { status: 400 }
      )
    }

    // Validate requestedByType
    const validTypes = ['PARTNER', 'HOST', 'FLEET']
    if (!validTypes.includes(requestedByType)) {
      return NextResponse.json(
        { error: `Invalid requestedByType. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Fetch booking with payment details
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            partnerCompanyName: true,
            hostType: true,
            stripeConnectAccountId: true,
            currentBalance: true
          }
        },
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true
          }
        },
        refundRequests: {
          where: {
            status: { in: ['PENDING', 'APPROVED'] }
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check for existing pending/approved refund request
    if (booking.refundRequests.length > 0) {
      const existingRequest = booking.refundRequests[0]
      return NextResponse.json(
        {
          error: 'A refund request already exists for this booking',
          existingRequest: {
            id: existingRequest.id,
            status: existingRequest.status,
            amount: existingRequest.amount,
            createdAt: existingRequest.createdAt
          }
        },
        { status: 409 }
      )
    }

    // Calculate maximum refundable amount
    const totalPaid = Number(booking.totalPrice || 0)
    const previousRefunds = await prisma.refundRequest.aggregate({
      where: {
        bookingId,
        status: 'PROCESSED'
      },
      _sum: {
        amount: true
      }
    })
    const alreadyRefunded = previousRefunds._sum.amount || 0
    const maxRefundable = totalPaid - alreadyRefunded

    if (amount > maxRefundable) {
      return NextResponse.json(
        {
          error: `Cannot request $${amount.toFixed(2)}. Maximum refundable amount is $${maxRefundable.toFixed(2)}`,
          maxRefundable,
          totalPaid,
          alreadyRefunded
        },
        { status: 400 }
      )
    }

    // Determine who is requesting
    const requesterId = key === 'phoenix-fleet-2847'
      ? 'FLEET_ADMIN'
      : (partnerId || hostId || booking.hostId)

    // Get platform settings for auto-approve threshold
    const platformSettings = await prisma.platformSettings.findUnique({
      where: { id: 'global' }
    })
    const partnerDirectRefundLimit = platformSettings?.partnerDirectRefundLimit ?? 250

    // Check if eligible for auto-approve (Partner requesting && under limit)
    const isPartnerRequest = requestedByType === 'PARTNER'
    const underAutoApproveLimit = amount <= partnerDirectRefundLimit
    const hasPaymentIntent = !!booking.stripePaymentIntentId
    const shouldAutoApprove = isPartnerRequest && underAutoApproveLimit && hasPaymentIntent

    // Create refund request with appropriate status
    const refundRequest = await prisma.refundRequest.create({
      data: {
        bookingId,
        requestedBy: requesterId,
        requestedByType,
        amount,
        reason,
        notes,
        status: shouldAutoApprove ? 'APPROVED' : 'PENDING',
        autoApproved: shouldAutoApprove,
        reviewedBy: shouldAutoApprove ? 'AUTO_APPROVED' : null,
        reviewedAt: shouldAutoApprove ? new Date() : null
      }
    })

    // Create activity log for request creation
    await prisma.activityLog.create({
      data: {
        entityType: 'BOOKING',
        entityId: bookingId,
        hostId: booking.hostId,
        action: shouldAutoApprove ? 'REFUND_AUTO_APPROVED' : 'REFUND_REQUESTED',
        metadata: {
          refundRequestId: refundRequest.id,
          amount,
          reason,
          requestedBy: requesterId,
          requestedByType,
          autoApproved: shouldAutoApprove,
          autoApproveLimit: partnerDirectRefundLimit,
          bookingCode: booking.bookingCode,
          guestName: booking.guestName,
          hostName: booking.host?.partnerCompanyName || booking.host?.name,
          vehicle: `${booking.car?.year} ${booking.car?.make} ${booking.car?.model}`
        }
      }
    })

    // If auto-approved, process the refund immediately
    let stripeRefundId = null
    let transferReversalId = null
    let processingError = null

    if (shouldAutoApprove) {
      try {
        // Process refund via Stripe
        const stripeRefund = await PaymentProcessor.refundPayment(
          booking.stripePaymentIntentId!,
          amount,
          'requested_by_customer'
        )
        stripeRefundId = stripeRefund.id

        // Try to reverse transfer if partner has Connect account
        if (booking.host?.stripeConnectAccountId) {
          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(
              booking.stripePaymentIntentId!,
              { expand: ['latest_charge.transfer'] }
            )

            const charge = paymentIntent.latest_charge as any
            if (charge && charge.transfer) {
              const transferId = typeof charge.transfer === 'string' ? charge.transfer : charge.transfer.id
              const reversal = await stripe.transfers.createReversal(transferId, {
                amount: Math.round(amount * 100),
                description: `Auto-approved refund for booking ${booking.bookingCode}`
              })
              transferReversalId = reversal.id
            }
          } catch (transferError: any) {
            console.error('Transfer reversal failed (non-blocking):', transferError)
          }
        }

        // Update refund request as processed
        await prisma.$transaction(async (tx) => {
          await tx.refundRequest.update({
            where: { id: refundRequest.id },
            data: {
              status: 'PROCESSED',
              processedAt: new Date(),
              stripeRefundId,
              stripeTransferId: transferReversalId,
              notes: notes
                ? `${notes}\n\nAuto-processed at ${new Date().toISOString()}`
                : `Auto-processed at ${new Date().toISOString()}`
            }
          })

          // Update partner balance if transfer was reversed
          if (transferReversalId && booking.host?.id) {
            await tx.rentalHost.update({
              where: { id: booking.host.id },
              data: { currentBalance: { decrement: amount } }
            })
          }

          // Update booking payment status
          const allProcessed = await tx.refundRequest.findMany({
            where: { bookingId, status: 'PROCESSED' }
          })
          const totalRefunded = allProcessed.reduce((sum, r) => sum + r.amount, 0)

          if (totalRefunded >= totalPaid) {
            await tx.rentalBooking.update({
              where: { id: bookingId },
              data: { paymentStatus: 'FULLY_REFUNDED', status: 'REFUNDED' }
            })
          } else if (totalRefunded > 0) {
            await tx.rentalBooking.update({
              where: { id: bookingId },
              data: { paymentStatus: 'PARTIALLY_REFUNDED' }
            })
          }
        })

        // Log successful processing
        await prisma.activityLog.create({
          data: {
            entityType: 'REFUND_REQUEST',
            entityId: refundRequest.id,
            hostId: booking.hostId,
            action: 'REFUND_AUTO_PROCESSED',
            metadata: {
              refundRequestId: refundRequest.id,
              bookingId,
              amount,
              stripeRefundId,
              transferReversalId,
              autoApproved: true
            }
          }
        })

      } catch (stripeError: any) {
        console.error('Auto-process refund failed:', stripeError)
        processingError = stripeError.message

        // Revert to APPROVED status so Fleet can manually process
        await prisma.refundRequest.update({
          where: { id: refundRequest.id },
          data: {
            status: 'APPROVED',
            notes: notes
              ? `${notes}\n\nAuto-processing failed: ${stripeError.message}. Manual processing required.`
              : `Auto-processing failed: ${stripeError.message}. Manual processing required.`
          }
        })
      }
    }

    // Return appropriate response
    const wasProcessed = shouldAutoApprove && stripeRefundId && !processingError

    return NextResponse.json({
      success: true,
      message: wasProcessed
        ? `Refund of $${amount.toFixed(2)} auto-approved and processed`
        : shouldAutoApprove && processingError
        ? 'Refund auto-approved but processing failed. Manual processing required.'
        : 'Refund request submitted for Fleet approval',
      data: {
        id: refundRequest.id,
        bookingId,
        bookingCode: booking.bookingCode,
        amount,
        status: wasProcessed ? 'PROCESSED' : (shouldAutoApprove ? 'APPROVED' : 'PENDING'),
        autoApproved: shouldAutoApprove,
        stripeRefundId,
        transferReversed: !!transferReversalId,
        processingError,
        reason,
        requestedBy: requesterId,
        requestedByType,
        createdAt: refundRequest.createdAt,
        maxRefundable,
        autoApproveLimit: partnerDirectRefundLimit,
        booking: {
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          totalPaid,
          vehicle: `${booking.car?.year} ${booking.car?.make} ${booking.car?.model}`
        }
      }
    })

  } catch (error: any) {
    console.error('Error creating refund request:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create refund request' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847' && !request.headers.get('authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: bookingId } = await params

    // Fetch all refund requests for this booking
    const refundRequests = await prisma.refundRequest.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' }
    })

    // Get booking details for context
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        bookingCode: true,
        guestName: true,
        guestEmail: true,
        totalPrice: true,
        stripePaymentIntentId: true,
        host: {
          select: {
            id: true,
            name: true,
            partnerCompanyName: true
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

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Calculate refund totals
    const processedTotal = refundRequests
      .filter(r => r.status === 'PROCESSED')
      .reduce((sum, r) => sum + r.amount, 0)
    const pendingTotal = refundRequests
      .filter(r => r.status === 'PENDING')
      .reduce((sum, r) => sum + r.amount, 0)
    const totalPaid = Number(booking.totalPrice || 0)
    const remainingRefundable = totalPaid - processedTotal

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        totalPaid,
        hostName: booking.host?.partnerCompanyName || booking.host?.name,
        vehicle: `${booking.car?.year} ${booking.car?.make} ${booking.car?.model}`,
        hasPaymentIntent: !!booking.stripePaymentIntentId
      },
      summary: {
        totalPaid,
        processedRefunds: processedTotal,
        pendingRefunds: pendingTotal,
        remainingRefundable,
        requestCount: refundRequests.length
      },
      refundRequests: refundRequests.map(r => ({
        id: r.id,
        amount: r.amount,
        reason: r.reason,
        status: r.status,
        requestedBy: r.requestedBy,
        requestedByType: r.requestedByType,
        reviewedBy: r.reviewedBy,
        reviewedAt: r.reviewedAt,
        reviewNotes: r.reviewNotes,
        processedAt: r.processedAt,
        stripeRefundId: r.stripeRefundId,
        notes: r.notes,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      }))
    })

  } catch (error: any) {
    console.error('Error fetching refund requests:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch refund requests' },
      { status: 500 }
    )
  }
}
