// app/api/fleet/refund-requests/[id]/route.ts
// GET - Get refund request details
// PATCH - Approve/Reject refund request
// POST - Process approved refund (executes Stripe refund)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { PaymentProcessor } from '@/app/lib/stripe/payment-processor'
import { sendRefundConfirmationEmail } from '@/app/lib/email/refund-confirmation-email'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

const FLEET_KEY = 'phoenix-fleet-2847'

function verifyFleetAccess(request: NextRequest): boolean {
  const urlKey = request.nextUrl.searchParams.get('key')
  const headerKey = request.headers.get('x-fleet-key')
  const fleetSession = request.cookies.get('fleet_session')?.value

  return urlKey === FLEET_KEY || headerKey === FLEET_KEY || !!fleetSession
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify fleet access
    if (!verifyFleetAccess(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const refundRequest = await prisma.refundRequest.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
            guestName: true,
            guestEmail: true,
            totalAmount: true,
            startDate: true,
            endDate: true,
            status: true,
            paymentIntentId: true,
            stripeCustomerId: true,
            host: {
              select: {
                id: true,
                name: true,
                email: true,
                partnerCompanyName: true,
                hostType: true,
                stripeConnectAccountId: true
              }
            },
            car: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
                licensePlate: true
              }
            }
          }
        }
      }
    })

    if (!refundRequest) {
      return NextResponse.json(
        { error: 'Refund request not found' },
        { status: 404 }
      )
    }

    // Get all refund requests for this booking for context
    const allRequests = await prisma.refundRequest.findMany({
      where: { bookingId: refundRequest.bookingId },
      orderBy: { createdAt: 'desc' }
    })

    const processedTotal = allRequests
      .filter(r => r.status === 'PROCESSED')
      .reduce((sum, r) => sum + r.amount, 0)

    const totalPaid = Number(refundRequest.booking.totalAmount || 0)
    const remainingRefundable = totalPaid - processedTotal

    return NextResponse.json({
      success: true,
      data: {
        id: refundRequest.id,
        amount: refundRequest.amount,
        reason: refundRequest.reason,
        status: refundRequest.status,
        requestedBy: refundRequest.requestedBy,
        requestedByType: refundRequest.requestedByType,
        reviewedBy: refundRequest.reviewedBy,
        reviewedAt: refundRequest.reviewedAt,
        reviewNotes: refundRequest.reviewNotes,
        processedAt: refundRequest.processedAt,
        stripeRefundId: refundRequest.stripeRefundId,
        stripeTransferId: refundRequest.stripeTransferId,
        notes: refundRequest.notes,
        createdAt: refundRequest.createdAt,
        updatedAt: refundRequest.updatedAt,
        booking: {
          id: refundRequest.booking.id,
          bookingCode: refundRequest.booking.bookingCode,
          guestName: refundRequest.booking.guestName,
          guestEmail: refundRequest.booking.guestEmail,
          totalPaid,
          tripDates: {
            start: refundRequest.booking.startDate,
            end: refundRequest.booking.endDate
          },
          status: refundRequest.booking.status,
          hasPaymentIntent: !!refundRequest.booking.paymentIntentId,
          paymentIntentId: refundRequest.booking.paymentIntentId,
          host: {
            id: refundRequest.booking.host?.id,
            name: refundRequest.booking.host?.partnerCompanyName || refundRequest.booking.host?.name,
            email: refundRequest.booking.host?.email,
            type: refundRequest.booking.host?.hostType,
            hasConnectAccount: !!refundRequest.booking.host?.stripeConnectAccountId
          },
          vehicle: refundRequest.booking.car ? {
            id: refundRequest.booking.car.id,
            display: `${refundRequest.booking.car.year} ${refundRequest.booking.car.make} ${refundRequest.booking.car.model}`,
            licensePlate: refundRequest.booking.car.licensePlate
          } : null
        },
        financials: {
          totalPaid,
          processedRefunds: processedTotal,
          remainingRefundable,
          requestHistory: allRequests.map(r => ({
            id: r.id,
            amount: r.amount,
            status: r.status,
            createdAt: r.createdAt
          }))
        }
      }
    })

  } catch (error: any) {
    console.error('Error fetching refund request:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch refund request' },
      { status: 500 }
    )
  }
}

// PATCH - Approve or Reject refund request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify fleet access
    if (!verifyFleetAccess(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { action, reviewNotes, reviewedBy = 'FLEET_ADMIN' } = body

    // Validate action
    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Fetch refund request
    const refundRequest = await prisma.refundRequest.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
            guestName: true,
            hostId: true,
            host: {
              select: {
                name: true,
                partnerCompanyName: true
              }
            }
          }
        }
      }
    })

    if (!refundRequest) {
      return NextResponse.json(
        { error: 'Refund request not found' },
        { status: 404 }
      )
    }

    // Check current status
    if (refundRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Cannot ${action} a refund request with status: ${refundRequest.status}` },
        { status: 400 }
      )
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'

    // Update refund request
    const updatedRequest = await prisma.refundRequest.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedBy,
        reviewedAt: new Date(),
        reviewNotes
      }
    })

    // Create activity log
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        entityType: 'REFUND_REQUEST',
        entityId: id,
        hostId: refundRequest.booking.hostId,
        action: action === 'approve' ? 'REFUND_APPROVED' : 'REFUND_REJECTED',
        metadata: {
          refundRequestId: id,
          bookingId: refundRequest.bookingId,
          bookingCode: refundRequest.booking.bookingCode,
          amount: refundRequest.amount,
          reason: refundRequest.reason,
          reviewedBy,
          reviewNotes,
          guestName: refundRequest.booking.guestName,
          hostName: refundRequest.booking.host?.partnerCompanyName || refundRequest.booking.host?.name
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Refund request ${action === 'approve' ? 'approved' : 'rejected'}`,
      data: {
        id: updatedRequest.id,
        status: updatedRequest.status,
        reviewedBy: updatedRequest.reviewedBy,
        reviewedAt: updatedRequest.reviewedAt,
        reviewNotes: updatedRequest.reviewNotes,
        amount: updatedRequest.amount,
        nextStep: action === 'approve' ? 'Use POST to process the refund via Stripe' : null
      }
    })

  } catch (error: any) {
    console.error('Error updating refund request:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update refund request' },
      { status: 500 }
    )
  }
}

// POST - Process approved refund (execute Stripe refund)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify fleet access
    if (!verifyFleetAccess(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { processedBy = 'FLEET_ADMIN', adjustedAmount, reverseTransfer = true } = body

    // Fetch refund request with full booking details
    const refundRequest = await prisma.refundRequest.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
            guestName: true,
            guestEmail: true,
            totalAmount: true,
            startDate: true,
            endDate: true,
            hostId: true,
            paymentIntentId: true,
            host: {
              select: {
                id: true,
                name: true,
                email: true,
                partnerCompanyName: true,
                stripeConnectAccountId: true,
                currentBalance: true
              }
            },
            car: {
              select: {
                make: true,
                model: true,
              }
            }
          }
        }
      }
    })

    if (!refundRequest) {
      return NextResponse.json(
        { error: 'Refund request not found' },
        { status: 404 }
      )
    }

    // Must be approved to process
    if (refundRequest.status !== 'APPROVED') {
      return NextResponse.json(
        { error: `Cannot process refund with status: ${refundRequest.status}. Must be APPROVED first.` },
        { status: 400 }
      )
    }

    // Check for payment intent
    if (!refundRequest.booking.paymentIntentId) {
      return NextResponse.json(
        { error: 'No payment intent found for this booking. Cannot process refund.' },
        { status: 400 }
      )
    }

    const refundAmount = adjustedAmount || refundRequest.amount

    // Process refund via Stripe
    let stripeRefund: Stripe.Refund
    let transferReversal: any = null

    try {
      // Create refund
      stripeRefund = await PaymentProcessor.refundPayment(
        refundRequest.booking.paymentIntentId,
        refundAmount,
        'requested_by_customer'
      )

      // If partner has Connect account and reverseTransfer is true, reverse the transfer
      if (reverseTransfer && refundRequest.booking.host?.stripeConnectAccountId) {
        try {
          // Find the transfer for this payment
          const paymentIntent = await stripe.paymentIntents.retrieve(
            refundRequest.booking.paymentIntentId,
            { expand: ['latest_charge.transfer'] }
          )

          const charge = paymentIntent.latest_charge as Stripe.Charge
          if (charge && charge.transfer) {
            const transferId = typeof charge.transfer === 'string' ? charge.transfer : charge.transfer.id

            // Reverse proportional amount from transfer
            transferReversal = await stripe.transfers.createReversal(
              transferId,
              {
                amount: Math.round(refundAmount * 100),
                description: `Refund for booking ${refundRequest.booking.bookingCode}`
              }
            )
          }
        } catch (transferError: any) {
          console.error('Transfer reversal failed (non-blocking):', transferError)
          // Log but continue - the main refund succeeded
        }
      }
    } catch (stripeError: any) {
      console.error('Stripe refund failed:', stripeError)
      return NextResponse.json(
        { error: `Stripe refund failed: ${stripeError.message}` },
        { status: 500 }
      )
    }

    // Update refund request as processed
    const updatedRequest = await prisma.$transaction(async (tx) => {
      // Update refund request
      const updated = await tx.refundRequest.update({
        where: { id },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
          stripeRefundId: stripeRefund.id,
          stripeTransferId: transferReversal?.id || null,
          notes: refundRequest.notes
            ? `${refundRequest.notes}\n\nProcessed by ${processedBy} at ${new Date().toISOString()}`
            : `Processed by ${processedBy} at ${new Date().toISOString()}`
        }
      })

      // Update partner balance if transfer was reversed
      if (transferReversal && refundRequest.booking.host?.id) {
        await tx.rentalHost.update({
          where: { id: refundRequest.booking.host.id },
          data: {
            currentBalance: {
              decrement: refundAmount
            }
          }
        })
      }

      // Update booking status if fully refunded
      const totalPaid = Number(refundRequest.booking.totalAmount || 0)
      const allProcessed = await tx.refundRequest.findMany({
        where: {
          bookingId: refundRequest.bookingId,
          status: 'PROCESSED'
        }
      })
      const totalRefunded = allProcessed.reduce((sum, r) => sum + r.amount, 0) + refundAmount

      if (totalRefunded >= totalPaid) {
        await tx.rentalBooking.update({
          where: { id: refundRequest.bookingId },
          data: {
            paymentStatus: 'REFUNDED',
            status: 'CANCELLED'
          }
        })
      } else if (totalRefunded > 0) {
        await tx.rentalBooking.update({
          where: { id: refundRequest.bookingId },
          data: {
            paymentStatus: 'PARTIAL_REFUND'
          }
        })
      }

      return updated
    })

    // Create activity log
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        entityType: 'REFUND_REQUEST',
        entityId: id,
        hostId: refundRequest.booking.hostId,
        action: 'REFUND_PROCESSED',
        metadata: {
          refundRequestId: id,
          bookingId: refundRequest.bookingId,
          bookingCode: refundRequest.booking.bookingCode,
          amount: refundAmount,
          stripeRefundId: stripeRefund.id,
          stripeTransferReversalId: transferReversal?.id,
          processedBy,
          guestName: refundRequest.booking.guestName,
          guestEmail: refundRequest.booking.guestEmail,
          hostName: refundRequest.booking.host?.partnerCompanyName || refundRequest.booking.host?.name
        }
      }
    })

    // Send refund confirmation email to guest (fire-and-forget)
    const totalPaid = Number(refundRequest.booking.totalAmount || 0)
    const formatDate = (d: Date | null) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
    const tripDates = `${formatDate(refundRequest.booking.startDate)} - ${formatDate(refundRequest.booking.endDate)}`

    sendRefundConfirmationEmail({
      guestEmail: refundRequest.booking.guestEmail,
      guestName: refundRequest.booking.guestName,
      bookingCode: refundRequest.booking.bookingCode,
      carMake: refundRequest.booking.car?.make || 'Vehicle',
      carModel: refundRequest.booking.car?.model || '',
      refundAmount,
      originalTotal: totalPaid,
      refundReason: refundRequest.reason,
      refundType: refundAmount >= totalPaid ? 'full' : 'partial',
      tripDates,
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: `Refund of $${refundAmount.toFixed(2)} processed successfully`,
      data: {
        id: updatedRequest.id,
        status: updatedRequest.status,
        processedAt: updatedRequest.processedAt,
        amount: refundAmount,
        stripeRefundId: stripeRefund.id,
        stripeRefundStatus: stripeRefund.status,
        transferReversed: !!transferReversal,
        transferReversalId: transferReversal?.id || null,
        booking: {
          id: refundRequest.booking.id,
          bookingCode: refundRequest.booking.bookingCode,
          guestName: refundRequest.booking.guestName
        }
      }
    })

  } catch (error: any) {
    console.error('Error processing refund:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process refund' },
      { status: 500 }
    )
  }
}
