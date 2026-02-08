// app/api/admin/rentals/verifications/[id]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { 
  sendVerificationApprovedEmail, 
  sendVerificationRejectedEmail,
  sendHostNotification,
  sendChargesProcessedEmail,
  sendChargesWaivedEmail
} from '@/app/lib/email/index'
import { PaymentProcessor } from '@/app/lib/stripe/payment-processor'

interface ChargeAdjustment {
  type: 'mileage' | 'fuel' | 'late' | 'damage' | 'cleaning' | 'other'
  originalAmount: number
  adjustedAmount: number
  included: boolean
  reason?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add proper admin authentication
    const adminId = request.headers.get('x-admin-id') || 'admin'
    const adminEmail = request.headers.get('x-admin-email') || 'admin@itwhip.com'

    const body = await request.json()
    const { 
      action, 
      notes,
      isPostTrip,
      charges,
      waivePercentage,
      waiveReason,
      chargeAdjustments,
      selectedCharges
    } = body
    
    const { id } = await params

    // Validate action based on context
    const validPreTripActions = ['approve', 'reject']
    const validPostTripActions = ['process_charges', 'waive', 'adjust', 'partial_waive', 'review_dispute']
    
    const isValidAction = isPostTrip 
      ? validPostTripActions.includes(action)
      : validPreTripActions.includes(action)
    
    if (!isValidAction) {
      return NextResponse.json(
        { error: `Invalid action '${action}' for ${isPostTrip ? 'post-trip' : 'pre-trip'} verification` },
        { status: 400 }
      )
    }

    // Get the booking with all necessary relations
    const booking = await (prisma.rentalBooking.findUnique as any)({
      where: { id },
      include: {
        car: {
          include: {
            host: true,
            photos: true
          }
        },
        tripCharges: {
          where: {
            chargeStatus: {
              in: ['PENDING', 'DISPUTED', 'FAILED']
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        disputes: {
          where: {
            status: 'OPEN'
          }
        }
      }
    }) as any

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Branch based on whether this is post-trip charge processing
    if (isPostTrip || booking.verificationStatus === 'PENDING_CHARGES') {
      return handlePostTripCharges(
        booking,
        action,
        {
          adminId,
          adminEmail,
          notes,
          charges,
          waivePercentage,
          waiveReason,
          chargeAdjustments,
          selectedCharges
        }
      )
    } else {
      return handlePreTripVerification(
        booking,
        action,
        {
          adminId,
          adminEmail,
          notes
        }
      )
    }

  } catch (error) {
    console.error('[Verification] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process verification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Handle post-trip charge processing
async function handlePostTripCharges(
  booking: any,
  action: string,
  params: {
    adminId: string
    adminEmail: string
    notes?: string
    charges?: any
    waivePercentage?: number
    waiveReason?: string
    chargeAdjustments?: ChargeAdjustment[]
    selectedCharges?: string[]
  }
) {
  const tripCharge = booking.tripCharges?.[0]
  
  // Calculate charges if not provided
  let chargeData = params.charges || (tripCharge ? {
    mileage: Number(tripCharge.mileageCharge || 0),
    fuel: Number(tripCharge.fuelCharge || 0),
    late: Number(tripCharge.lateCharge || 0),
    damage: Number(tripCharge.damageCharge || 0),
    cleaning: Number(tripCharge.cleaningCharge || 0),
    total: Number(tripCharge.totalCharges || 0)
  } : null)

  if (!chargeData || chargeData.total === 0) {
    return NextResponse.json(
      { error: 'No charges to process' },
      { status: 400 }
    )
  }

  let result: any = {
    success: false,
    message: '',
    chargeResult: null,
    booking: null
  }

  switch (action) {
    case 'process_charges':
      result = await processCharges(booking, chargeData, params.adminId, params.notes)
      break

    case 'waive':
      result = await waiveAllCharges(booking, chargeData, params.waiveReason || params.notes || 'Admin discretion', params.adminId)
      break

    case 'partial_waive':
      if (!params.waivePercentage || params.waivePercentage <= 0 || params.waivePercentage > 100) {
        return NextResponse.json(
          { error: 'Invalid waive percentage' },
          { status: 400 }
        )
      }
      result = await partialWaiveCharges(
        booking, 
        chargeData, 
        params.waivePercentage, 
        params.waiveReason || params.notes || 'Partial waiver', 
        params.adminId
      )
      break

    case 'adjust':
      if (!params.chargeAdjustments || params.chargeAdjustments.length === 0) {
        return NextResponse.json(
          { error: 'No adjustments provided' },
          { status: 400 }
        )
      }
      result = await adjustAndProcessCharges(
        booking,
        params.chargeAdjustments,
        params.adminId,
        params.notes
      )
      break

    case 'review_dispute':
      result = await markDisputeUnderReview(booking, params.adminId, params.notes)
      break

    default:
      return NextResponse.json(
        { error: `Unknown action: ${action}` },
        { status: 400 }
      )
  }

  // Send appropriate email notifications
  if (result.success && booking.guestEmail) {
    try {
      if (action === 'process_charges' && result.chargeResult?.status === 'succeeded') {
        await sendChargesProcessedEmail(booking.guestEmail, {
          guestName: booking.guestName || 'Guest',
          bookingCode: booking.bookingCode,
          chargeAmount: chargeData.total,
          chargeBreakdown: result.chargeBreakdown,
          chargeId: result.chargeResult.chargeId
        })
      } else if (action === 'waive' || action === 'partial_waive') {
        await sendChargesWaivedEmail(booking.guestEmail, {
          guestName: booking.guestName || 'Guest',
          bookingCode: booking.bookingCode,
          originalAmount: chargeData.total,
          waivedAmount: result.waivedAmount,
          remainingAmount: result.remainingAmount,
          reason: params.waiveReason
        })
      }
    } catch (emailError) {
      console.error('[Verification] Email error (non-blocking):', emailError)
    }
  }

  return NextResponse.json(result)
}

// Process charges using saved payment method
async function processCharges(
  booking: any,
  charges: any,
  adminId: string,
  notes?: string
): Promise<any> {
  try {
    if (!booking.stripeCustomerId || !booking.stripePaymentMethodId) {
      throw new Error('No payment method on file')
    }

    // Attempt to charge
    const chargeResult = await PaymentProcessor.chargeAdditionalFees(
      booking.stripeCustomerId,
      booking.stripePaymentMethodId,
      Math.round(charges.total * 100),
      `Admin-processed trip charges for booking ${booking.bookingCode}`,
      {
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        adminId,
        chargeType: 'admin_processed',
        mileageCharge: charges.mileage || 0,
        fuelCharge: charges.fuel || 0,
        lateCharge: charges.late || 0,
        damageCharge: charges.damage || 0,
        cleaningCharge: charges.cleaning || 0,
        notes
      }
    )

    // Update booking and trip charge based on result
    const updateData: any = {
      verificationNotes: notes,
      reviewedBy: adminId,
      reviewedAt: new Date()
    }

    if (chargeResult.status === 'succeeded') {
      updateData.status = 'COMPLETED'
      updateData.verificationStatus = 'COMPLETED'
      updateData.paymentStatus = 'CHARGES_PAID'
      updateData.stripeChargeId = chargeResult.chargeId
      updateData.chargesProcessedAt = new Date()
      updateData.pendingChargesAmount = null
    } else {
      updateData.paymentStatus = 'PAYMENT_FAILED'
      updateData.paymentFailureReason = chargeResult.error
    }

    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: booking.id },
      data: updateData
    })

    // Update TripCharge record if exists
    if (booking.tripCharges?.[0]) {
      await prisma.tripCharge.update({
        where: { id: booking.tripCharges[0].id },
        data: {
          chargeStatus: chargeResult.status === 'succeeded' ? 'CHARGED' : 'FAILED',
          stripeChargeId: chargeResult.chargeId,
          chargedAt: chargeResult.status === 'succeeded' ? new Date() : null,
          failureReason: chargeResult.error,
          processedByAdminId: adminId
        }
      })
    }

    // Add admin message
    await (prisma.rentalMessage.create as any)({
      data: {
        bookingId: booking.id,
        senderId: 'system',
        senderType: 'admin',
        senderName: 'Admin',
        message: chargeResult.status === 'succeeded' 
          ? `✅ Additional charges of $${charges.total.toFixed(2)} have been processed successfully.`
          : `⚠️ Attempted to charge $${charges.total.toFixed(2)} but payment failed: ${chargeResult.error}`,
        category: 'charges',
        metadata: { charges, chargeResult },
        isRead: false
      }
    })

    return {
      success: chargeResult.status === 'succeeded',
      message: chargeResult.status === 'succeeded' 
        ? `Charges processed successfully`
        : `Payment failed: ${chargeResult.error}`,
      chargeResult,
      booking: updatedBooking
    }

  } catch (error: any) {
    console.error('[Verification] Charge processing error:', error)
    throw error
  }
}

// Waive all charges
async function waiveAllCharges(
  booking: any,
  charges: any,
  reason: string,
  adminId: string
): Promise<any> {
  try {
    // Record the waive in payment processor for audit
    const waiveResult = await PaymentProcessor.waiveCharges(
      booking.id,
      charges.total,
      100, // 100% waive
      reason,
      adminId
    )

    // Update booking to completed with charges waived
    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: booking.id },
      data: {
        status: 'COMPLETED',
        verificationStatus: 'COMPLETED',
        paymentStatus: 'CHARGES_WAIVED',
        chargesWaivedAmount: charges.total,
        chargesWaivedReason: reason,
        chargesProcessedAt: new Date(),
        pendingChargesAmount: null,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        verificationNotes: `Charges waived: ${reason}`
      }
    })

    // Update TripCharge if exists
    if (booking.tripCharges?.[0]) {
      await prisma.tripCharge.update({
        where: { id: booking.tripCharges[0].id },
        data: {
          chargeStatus: 'FULLY_WAIVED',
          adjustedAmount: charges.total,
          waiveReason: reason,
          waivedBy: adminId,
          waivedAt: new Date()
        }
      })
    }

    // Add message
    await (prisma.rentalMessage.create as any)({
      data: {
        bookingId: booking.id,
        senderId: 'system',
        senderType: 'admin',
        senderName: 'Admin',
        message: `✅ All additional charges ($${charges.total.toFixed(2)}) have been waived. Reason: ${reason}`,
        category: 'charges',
        metadata: { waiveResult },
        isRead: false
      }
    })

    return {
      success: true,
      message: 'All charges waived successfully',
      waivedAmount: charges.total,
      remainingAmount: 0,
      booking: updatedBooking
    }

  } catch (error: any) {
    console.error('[Verification] Waive error:', error)
    throw error
  }
}

// Partial waive with percentage
async function partialWaiveCharges(
  booking: any,
  charges: any,
  waivePercentage: number,
  reason: string,
  adminId: string
): Promise<any> {
  try {
    // Calculate waive amounts
    const waiveResult = await PaymentProcessor.waiveCharges(
      booking.id,
      charges.total,
      waivePercentage,
      reason,
      adminId
    )

    // If there's remaining amount, charge it
    let chargeResult = null
    if (waiveResult.remainingAmount > 0 && booking.stripeCustomerId && booking.stripePaymentMethodId) {
      chargeResult = await PaymentProcessor.chargeAdditionalFees(
        booking.stripeCustomerId,
        booking.stripePaymentMethodId,
        Math.round(waiveResult.remainingAmount * 100),
        `Partial charges after ${waivePercentage}% waiver - Booking ${booking.bookingCode}`,
        {
          bookingId: booking.id,
          originalAmount: charges.total,
          waivedAmount: waiveResult.waivedAmount,
          remainingAmount: waiveResult.remainingAmount,
          adminId
        }
      )
    }

    // Update booking based on charge result
    const updateData: any = {
      chargesWaivedAmount: waiveResult.waivedAmount,
      chargesWaivedReason: reason,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      verificationNotes: `${waivePercentage}% charges waived: ${reason}`
    }

    if (!chargeResult || chargeResult.status === 'succeeded') {
      updateData.status = 'COMPLETED'
      updateData.verificationStatus = 'COMPLETED'
      updateData.paymentStatus = waiveResult.remainingAmount > 0 ? 'PARTIAL_PAID' : 'CHARGES_WAIVED'
      updateData.stripeChargeId = chargeResult?.chargeId
      updateData.chargesProcessedAt = new Date()
      updateData.pendingChargesAmount = null
    } else {
      updateData.paymentStatus = 'PAYMENT_FAILED'
      updateData.paymentFailureReason = chargeResult.error
      updateData.pendingChargesAmount = waiveResult.remainingAmount
    }

    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: booking.id },
      data: updateData
    })

    // Update TripCharge
    if (booking.tripCharges?.[0]) {
      await prisma.tripCharge.update({
        where: { id: booking.tripCharges[0].id },
        data: {
          chargeStatus: chargeResult?.status === 'succeeded' ? 'PARTIAL_CHARGED' : 'PARTIALLY_WAIVED',
          adjustedAmount: waiveResult.waivedAmount,
          chargedAmount: waiveResult.remainingAmount,
          waiveReason: reason,
          waivedBy: adminId,
          waivedAt: new Date(),
          stripeChargeId: chargeResult?.chargeId,
          chargedAt: chargeResult?.status === 'succeeded' ? new Date() : null
        }
      })
    }

    // Add message
    await (prisma.rentalMessage.create as any)({
      data: {
        bookingId: booking.id,
        senderId: 'system',
        senderType: 'admin',
        senderName: 'Admin',
        message: `✅ ${waivePercentage}% of charges waived ($${waiveResult.waivedAmount.toFixed(2)}). ${
          chargeResult?.status === 'succeeded' 
            ? `Remaining $${waiveResult.remainingAmount.toFixed(2)} charged successfully.`
            : waiveResult.remainingAmount > 0
            ? `Failed to charge remaining $${waiveResult.remainingAmount.toFixed(2)}.`
            : 'No remaining charges.'
        }`,
        category: 'charges',
        metadata: { waiveResult, chargeResult },
        isRead: false
      }
    })

    return {
      success: true,
      message: `${waivePercentage}% charges waived`,
      waivedAmount: waiveResult.waivedAmount,
      remainingAmount: waiveResult.remainingAmount,
      chargeResult,
      booking: updatedBooking
    }

  } catch (error: any) {
    console.error('[Verification] Partial waive error:', error)
    throw error
  }
}

// Adjust individual charges and process
async function adjustAndProcessCharges(
  booking: any,
  adjustments: ChargeAdjustment[],
  adminId: string,
  notes?: string
): Promise<any> {
  try {
    if (!booking.stripeCustomerId || !booking.stripePaymentMethodId) {
      throw new Error('No payment method on file for adjusted charges')
    }

    // Process adjustments
    const adjustedCharges = adjustments.map(adj => ({
      type: adj.type,
      originalAmount: adj.originalAmount,
      adjustedAmount: adj.included ? adj.adjustedAmount : 0,
      reason: adj.reason
    }))

    // Use payment processor to handle adjusted charges
    const result = await PaymentProcessor.adjustAndCharge(
      booking.stripeCustomerId,
      booking.stripePaymentMethodId,
      adjustedCharges,
      booking.id,
      adminId
    )

    // Update booking based on result
    const updateData: any = {
      reviewedBy: adminId,
      reviewedAt: new Date(),
      verificationNotes: notes || 'Charges adjusted by admin'
    }

    if (result.status === 'succeeded') {
      updateData.status = 'COMPLETED'
      updateData.verificationStatus = 'COMPLETED'
      updateData.paymentStatus = 'ADJUSTED_PAID'
      updateData.stripeChargeId = result.chargeId
      updateData.chargesProcessedAt = new Date()
      updateData.pendingChargesAmount = null
      updateData.chargesAdjustedAmount = result.adjustmentRecord?.totalAdjustment
    } else {
      updateData.paymentStatus = 'PAYMENT_FAILED'
      updateData.paymentFailureReason = result.error
    }

    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: booking.id },
      data: updateData
    })

    // Save adjustment record
    if (booking.tripCharges?.[0]) {
      await prisma.tripCharge.update({
        where: { id: booking.tripCharges[0].id },
        data: {
          chargeStatus: result.status === 'succeeded' ? 'ADJUSTED_CHARGED' : 'FAILED',
          adjustmentRecord: JSON.stringify(result.adjustmentRecord),
          chargedAmount: result.adjustmentRecord?.adjustedTotal || 0,
          stripeChargeId: result.chargeId,
          chargedAt: result.status === 'succeeded' ? new Date() : null,
          processedByAdminId: adminId
        }
      })
    }

    // Add message
    await (prisma.rentalMessage.create as any)({
      data: {
        bookingId: booking.id,
        senderId: 'system',
        senderType: 'admin',
        senderName: 'Admin',
        message: result.status === 'succeeded'
          ? `✅ Adjusted charges processed successfully. Original: $${result.adjustmentRecord?.originalTotal.toFixed(2)}, Charged: $${result.adjustmentRecord?.adjustedTotal.toFixed(2)}`
          : `⚠️ Failed to process adjusted charges: ${result.error}`,
        category: 'charges',
        metadata: { adjustments: result.adjustmentRecord },
        isRead: false
      }
    })

    return {
      success: result.status === 'succeeded',
      message: result.status === 'succeeded' ? 'Adjusted charges processed' : `Failed: ${result.error}`,
      chargeResult: result,
      adjustmentRecord: result.adjustmentRecord,
      booking: updatedBooking
    }

  } catch (error: any) {
    console.error('[Verification] Adjustment error:', error)
    throw error
  }
}

// Mark dispute as under review
async function markDisputeUnderReview(
  booking: any,
  adminId: string,
  notes?: string
): Promise<any> {
  try {
    // Update disputes to under review
    if (booking.disputes && booking.disputes.length > 0) {
      await prisma.rentalDispute.updateMany({
        where: {
          bookingId: booking.id,
          status: 'OPEN'
        },
        data: {
          status: 'UNDER_REVIEW',
          reviewStartedAt: new Date(),
          reviewedBy: adminId
        }
      })
    }

    // Update booking
    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: booking.id },
      data: {
        verificationStatus: 'DISPUTE_REVIEW',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        verificationNotes: notes || 'Disputes under review'
      }
    })

    // Add message
    await (prisma.rentalMessage.create as any)({
      data: {
        bookingId: booking.id,
        senderId: 'system',
        senderType: 'admin',
        senderName: 'Admin',
        message: '🔍 Your dispute is now under review. We will respond within 24 hours.',
        category: 'dispute',
        isRead: false
      }
    })

    return {
      success: true,
      message: 'Dispute marked as under review',
      booking: updatedBooking
    }

  } catch (error: any) {
    console.error('[Verification] Dispute review error:', error)
    throw error
  }
}

// Handle pre-trip verification (original functionality)
async function handlePreTripVerification(
  booking: any,
  action: string,
  params: {
    adminId: string
    adminEmail: string
    notes?: string
  }
) {
  // Handle document verification for bookings requiring verification
  
  if (action === 'approve') {
    // Set pickup window
    const pickupWindowStart = new Date()
    const pickupWindowEnd = new Date()
    pickupWindowEnd.setHours(pickupWindowEnd.getHours() + 12)

    let paymentResult = null
    let paymentStatus = 'PENDING' as any

    // Process initial payment if exists
    if (booking.paymentIntentId && booking.stripePaymentMethodId) {
      try {
        const paymentIntent = await PaymentProcessor.confirmAndCapturePayment(
          booking.paymentIntentId,
          booking.stripePaymentMethodId
        )
        
        if (paymentIntent.status === 'succeeded') {
          paymentStatus = 'PAID'
          paymentResult = {
            status: 'succeeded',
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount / 100
          }
        }
      } catch (error) {
        console.error('[Verification] Payment error:', error)
        paymentStatus = 'FAILED'
      }
    }

    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: booking.id },
      data: {
        verificationStatus: 'APPROVED',
        status: 'CONFIRMED',
        paymentStatus,
        tripStatus: 'NOT_STARTED',
        pickupWindowStart,
        pickupWindowEnd,
        reviewedBy: params.adminId,
        reviewedAt: new Date(),
        verificationNotes: params.notes || 'Documents verified successfully'
      }
    })

    // Send notifications
    if (booking.guestEmail) {
      await sendVerificationApprovedEmail(booking.guestEmail, {
        guestName: booking.guestName,
        bookingCode: booking.bookingCode,
        carMake: booking.car.make,
        carModel: booking.car.model,
        startDate: booking.startDate,
        pickupLocation: booking.pickupLocation
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Booking approved',
      booking: updatedBooking,
      paymentResult
    })

  } else if (action === 'reject') {
    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: booking.id },
      data: {
        verificationStatus: 'REJECTED',
        status: 'CANCELLED',
        reviewedBy: params.adminId,
        reviewedAt: new Date(),
        verificationNotes: params.notes || 'Verification requirements not met'
      }
    })

    // Cancel payment if exists
    if (booking.paymentIntentId) {
      try {
        await PaymentProcessor.cancelPayment(booking.paymentIntentId)
      } catch (error) {
        console.error('[Verification] Cancel payment error:', error)
      }
    }

    // Send rejection email
    if (booking.guestEmail) {
      await sendVerificationRejectedEmail(booking.guestEmail, {
        guestName: booking.guestName,
        bookingCode: booking.bookingCode,
        reason: params.notes || 'Verification requirements not met'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Booking rejected',
      booking: updatedBooking
    })
  }

  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  )
}

// GET - Fetch booking details for review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const booking = await (prisma.rentalBooking.findUnique as any)({
      where: { id },
      include: {
        car: {
          include: {
            host: true,
            photos: true
          }
        },
        tripCharges: true,
        disputes: true,
        GuestAccessToken: true
      }
    }) as any

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(booking)

  } catch (error) {
    console.error('[Verification] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking details' },
      { status: 500 }
    )
  }
}