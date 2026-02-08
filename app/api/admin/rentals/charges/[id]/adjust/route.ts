// app/api/admin/rentals/charges/[id]/adjust/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { PaymentProcessor } from '@/app/lib/stripe/payment-processor'

interface ChargeAdjustment {
  type: 'mileage' | 'fuel' | 'late' | 'damage' | 'cleaning' | 'other'
  originalAmount: number
  adjustedAmount: number
  included: boolean
  reason?: string
}

interface AdjustmentRequest {
  adjustments: ChargeAdjustment[]
  waivePercentage?: number
  waiveReason?: string
  processImmediately?: boolean
  adminNotes?: string
}

/**
 * POST - Apply granular adjustments to trip charges
 * Supports individual charge modifications, percentage waiving, and immediate processing
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get admin info from headers
    const adminId = request.headers.get('x-admin-id') || 'admin'
    const adminEmail = request.headers.get('x-admin-email') || 'admin@itwhip.com'
    
    const { id: chargeId } = await params
    const body: AdjustmentRequest = await request.json()
    
    const { 
      adjustments, 
      waivePercentage = 0, 
      waiveReason,
      processImmediately = false,
      adminNotes
    } = body

    // Validate adjustments
    if (!adjustments || !Array.isArray(adjustments) || adjustments.length === 0) {
      return NextResponse.json(
        { error: 'Invalid adjustments data' },
        { status: 400 }
      )
    }

    // Fetch the trip charge with booking details
    const tripCharge = await prisma.tripCharge.findUnique({
      where: { id: chargeId },
      include: {
        booking: {
          include: {
            car: true,
            host: true
          }
        },
        ChargeAdjustment: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!tripCharge) {
      return NextResponse.json(
        { error: 'Trip charge not found' },
        { status: 404 }
      )
    }

    // Check if charge is already finalized
    if (tripCharge.chargeStatus === 'CHARGED' || tripCharge.chargeStatus === 'REFUNDED') {
      return NextResponse.json(
        { error: `Cannot adjust charges that are already ${tripCharge.chargeStatus.toLowerCase()}` },
        { status: 400 }
      )
    }

    // Calculate adjusted totals
    const originalTotal = Number(tripCharge.totalCharges)
    let adjustedSubtotal = 0
    let totalReductions = 0
    
    // Apply individual adjustments
    const processedAdjustments = adjustments.map(adj => {
      const reduction = adj.originalAmount - adj.adjustedAmount
      totalReductions += reduction
      if (adj.included) {
        adjustedSubtotal += adj.adjustedAmount
      }
      return {
        ...adj,
        reduction
      }
    })

    // Apply waive percentage on top of adjustments
    const waiveAmount = adjustedSubtotal * (waivePercentage / 100)
    const finalTotal = Math.max(0, adjustedSubtotal - waiveAmount)
    
    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create adjustment record for audit trail
      const adjustmentRecord = await tx.chargeAdjustment.create({
        data: {
          id: crypto.randomUUID(),
          chargeId,
          bookingId: tripCharge.bookingId,
          adminId,
          adminEmail,
          adjustmentType: 'GRANULAR',
          reason: waiveReason || 'Admin adjustment',
          originalAmount: originalTotal,
          adjustedAmount: adjustedSubtotal,
          reductionAmount: originalTotal - finalTotal,
          reductionPercent: originalTotal > 0 ? Math.round(((originalTotal - finalTotal) / originalTotal) * 100) : 0,
          adjustmentDetails: JSON.stringify({ adjustments: processedAdjustments, waivePercentage, waiveAmount: adjustedSubtotal * (waivePercentage / 100), finalAmount: finalTotal, processImmediately }),
          adminNotes,
          processingStatus: processImmediately ? 'processing' : 'pending',
          updatedAt: new Date()
        }
      })

      let paymentResult = null
      let newChargeStatus = tripCharge.chargeStatus
      let stripeChargeId = null

      // Process payment if requested and there's an amount to charge
      if (processImmediately && finalTotal > 0 && tripCharge.booking.stripeCustomerId && tripCharge.booking.stripePaymentMethodId) {
        try {
          paymentResult = await PaymentProcessor.chargeAdditionalFees(
            tripCharge.booking.stripeCustomerId,
            tripCharge.booking.stripePaymentMethodId,
            Math.round(finalTotal * 100),
            `Adjusted trip charges for booking ${tripCharge.booking.bookingCode}`,
            {
              bookingId: tripCharge.bookingId,
              chargeId: tripCharge.id,
              adjustmentId: adjustmentRecord.id,
              adminId,
              originalAmount: originalTotal,
              adjustedAmount: adjustedSubtotal,
              finalAmount: finalTotal
            }
          )

          if (paymentResult.status === 'succeeded') {
            newChargeStatus = 'ADJUSTED_CHARGED'
            stripeChargeId = paymentResult.chargeId
          } else {
            newChargeStatus = 'ADJUSTMENT_FAILED'
          }
        } catch (error) {
          console.error('[Charge Adjustment] Payment error:', error)
          newChargeStatus = 'ADJUSTMENT_FAILED'
          paymentResult = { status: 'failed', error: error instanceof Error ? error.message : 'Payment failed' }
        }
      } else if (finalTotal === 0) {
        // Fully waived
        newChargeStatus = 'FULLY_WAIVED'
      } else if (!processImmediately) {
        // Adjusted but not processed
        newChargeStatus = 'ADJUSTED_PENDING'
      }

      // Update the trip charge
      const updatedCharge = await tx.tripCharge.update({
        where: { id: chargeId },
        data: {
          chargeStatus: newChargeStatus,
          adjustedAmount: finalTotal,
          adjustmentNotes: `Last adjustment: ${adjustmentRecord.id}`,
          ...(stripeChargeId && {
            stripeChargeId,
            chargedAt: new Date(),
            processedByAdminId: adminId
          }),
          ...(finalTotal === 0 && {
            waivedAmount: originalTotal,
            waivedReason: waiveReason || 'Fully waived through adjustments',
            waivedByAdminId: adminId,
            waivedAt: new Date()
          }),
          updatedAt: new Date()
        }
      })

      // Update booking status if charges are finalized
      if (newChargeStatus === 'ADJUSTED_CHARGED' || newChargeStatus === 'FULLY_WAIVED') {
        await tx.rentalBooking.update({
          where: { id: tripCharge.bookingId },
          data: {
            status: 'COMPLETED',
            verificationStatus: 'COMPLETED',
            paymentStatus: newChargeStatus === 'ADJUSTED_CHARGED' ? 'CHARGES_PAID' : 'CHARGES_WAIVED',
            chargesProcessedAt: new Date(),
            pendingChargesAmount: null
          }
        })
      }

      // Create admin notification for audit
      await tx.adminNotification.create({
        data: {
          id: crypto.randomUUID(),
          type: 'CHARGE_ADJUSTED',
          title: `Charges Adjusted - ${tripCharge.booking.bookingCode}`,
          message: `Original: $${originalTotal.toFixed(2)} → Adjusted: $${adjustedSubtotal.toFixed(2)} → Final: $${finalTotal.toFixed(2)}. ${
            newChargeStatus === 'ADJUSTED_CHARGED' ? 'Payment processed successfully.' :
            newChargeStatus === 'FULLY_WAIVED' ? 'Charges fully waived.' :
            newChargeStatus === 'ADJUSTMENT_FAILED' ? 'Payment failed - manual processing required.' :
            'Awaiting payment processing.'
          }`,
          priority: newChargeStatus === 'ADJUSTMENT_FAILED' ? 'HIGH' : 'MEDIUM',
          status: 'UNREAD',
          relatedId: chargeId,
          relatedType: 'TripCharge',
          metadata: {
            adjustmentId: adjustmentRecord.id,
            paymentStatus: paymentResult?.status || null
          },
          updatedAt: new Date()
        }
      })

      // Create guest message
      await tx.rentalMessage.create({
        data: {
          id: crypto.randomUUID(),
          bookingId: tripCharge.bookingId,
          senderId: 'system',
          senderType: 'admin',
          senderName: 'Admin',
          message: generateGuestMessage(originalTotal, finalTotal, newChargeStatus, processedAdjustments),
          category: 'charges',
          updatedAt: new Date(),
          metadata: {
            adjustmentId: adjustmentRecord.id,
            originalAmount: originalTotal,
            finalAmount: finalTotal
          }
        }
      })

      // Create activity log
      await tx.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          action: 'CHARGE_ADJUSTED',
          entityType: 'TripCharge',
          entityId: chargeId,
          userId: adminId,
          metadata: JSON.parse(JSON.stringify({
            originalAmount: originalTotal,
            adjustedAmount: adjustedSubtotal,
            finalAmount: finalTotal,
            waivePercentage,
            adjustments: processedAdjustments,
            paymentStatus: paymentResult?.status || null,
            chargeStatus: newChargeStatus
          })),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        }
      })

      return {
        adjustmentRecord,
        updatedCharge,
        paymentResult
      }
    })

    // Send email notifications if needed
    if (tripCharge.booking.guestEmail) {
      try {
        // Send appropriate email based on outcome
        // This would call your email service
        console.log(`[Charge Adjustment] Email notification queued for ${tripCharge.booking.guestEmail}`)
      } catch (emailError) {
        console.error('[Charge Adjustment] Email error (non-blocking):', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: getSuccessMessage(result.updatedCharge.chargeStatus, finalTotal),
      adjustment: {
        id: result.adjustmentRecord.id,
        originalAmount: originalTotal,
        adjustedAmount: adjustedSubtotal,
        finalAmount: finalTotal,
        waivePercentage,
        waiveAmount,
        reductionAmount: originalTotal - finalTotal,
        reductionPercentage: ((originalTotal - finalTotal) / originalTotal * 100).toFixed(2)
      },
      chargeStatus: result.updatedCharge.chargeStatus,
      paymentResult: result.paymentResult
    })

  } catch (error) {
    console.error('[Charge Adjustment] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to adjust charges', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

/**
 * GET - Retrieve adjustment history for a trip charge
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chargeId } = await params
    
    // Fetch trip charge with all adjustments
    const tripCharge = await prisma.tripCharge.findUnique({
      where: { id: chargeId },
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
            guestName: true,
            guestEmail: true,
            car: {
              select: {
                make: true,
                model: true,
                year: true
              }
            }
          }
        },
        ChargeAdjustment: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!tripCharge) {
      return NextResponse.json(
        { error: 'Trip charge not found' },
        { status: 404 }
      )
    }

    // Calculate cumulative impact
    const originalAmount = Number(tripCharge.totalCharges)
    const currentAmount = Number(tripCharge.adjustedAmount || tripCharge.totalCharges)
    const totalReduction = originalAmount - currentAmount
    const reductionPercentage = originalAmount > 0 ? (totalReduction / originalAmount * 100) : 0

    // Format adjustment history
    const formattedHistory = (tripCharge as any).ChargeAdjustment.map((adj: any) => ({
      id: adj.id,
      date: adj.createdAt,
      adminName: adj.admin?.name || 'System',
      adminEmail: adj.admin?.email,
      originalAmount: Number(adj.originalAmount),
      adjustedAmount: Number(adj.adjustedAmount),
      finalAmount: Number(adj.finalAmount),
      waivePercentage: adj.waivePercentage,
      waiveAmount: Number(adj.waiveAmount),
      waiveReason: adj.waiveReason,
      notes: adj.notes,
      processedImmediately: adj.processedImmediately,
      adjustmentDetails: adj.adjustmentDetails ? JSON.parse(adj.adjustmentDetails as string) : null
    }))

    return NextResponse.json({
      tripCharge: {
        id: tripCharge.id,
        bookingCode: tripCharge.booking.bookingCode,
        guestName: tripCharge.booking.guestName,
        vehicle: `${tripCharge.booking.car.year} ${tripCharge.booking.car.make} ${tripCharge.booking.car.model}`,
        originalCharges: {
          mileage: Number(tripCharge.mileageCharge),
          fuel: Number(tripCharge.fuelCharge),
          late: Number(tripCharge.lateCharge),
          damage: Number(tripCharge.damageCharge),
          cleaning: Number(tripCharge.cleaningCharge),
          other: Number(tripCharge.otherCharges),
          total: originalAmount
        },
        currentAmount,
        chargeStatus: tripCharge.chargeStatus,
        stripeChargeId: tripCharge.stripeChargeId
      },
      summary: {
        originalAmount,
        currentAmount,
        totalReduction,
        reductionPercentage: reductionPercentage.toFixed(2),
        totalAdjustments: (tripCharge as any).ChargeAdjustment.length,
        lastAdjustedAt: (tripCharge as any).ChargeAdjustment[0]?.createdAt || null
      },
      adjustmentHistory: formattedHistory
    })

  } catch (error) {
    console.error('[Charge Adjustment] GET Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve adjustment history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to generate guest message
function generateGuestMessage(
  originalAmount: number,
  finalAmount: number,
  status: string,
  adjustments: any[]
): string {
  const reduction = originalAmount - finalAmount
  const reductionPercent = ((reduction / originalAmount) * 100).toFixed(0)
  
  let message = `Your trip charges have been reviewed and adjusted.\n\n`
  message += `Original charges: $${originalAmount.toFixed(2)}\n`
  
  // List specific adjustments
  const significantAdjustments = adjustments.filter(adj => adj.reduction > 0)
  if (significantAdjustments.length > 0) {
    message += `Adjustments made:\n`
    significantAdjustments.forEach(adj => {
      message += `• ${adj.type}: -$${adj.reduction.toFixed(2)}`
      if (adj.reason) message += ` (${adj.reason})`
      message += '\n'
    })
  }
  
  if (finalAmount === 0) {
    message += `\n✅ All charges have been waived. No payment required.`
  } else if (status === 'ADJUSTED_CHARGED') {
    message += `\nFinal amount charged: $${finalAmount.toFixed(2)} (${reductionPercent}% reduction)`
  } else if (status === 'ADJUSTED_PENDING') {
    message += `\nAdjusted amount: $${finalAmount.toFixed(2)} (${reductionPercent}% reduction)\n`
    message += `This amount will be processed within 24 hours.`
  } else if (status === 'ADJUSTMENT_FAILED') {
    message += `\nAdjusted amount: $${finalAmount.toFixed(2)}\n`
    message += `⚠️ Payment processing failed. Our team will contact you shortly.`
  }
  
  return message
}

// Helper function for success messages
function getSuccessMessage(status: string, finalAmount: number): string {
  switch (status) {
    case 'ADJUSTED_CHARGED':
      return `Charges adjusted and successfully processed for $${finalAmount.toFixed(2)}`
    case 'FULLY_WAIVED':
      return 'All charges have been waived'
    case 'ADJUSTED_PENDING':
      return `Charges adjusted to $${finalAmount.toFixed(2)} and pending processing`
    case 'ADJUSTMENT_FAILED':
      return 'Charges adjusted but payment processing failed'
    default:
      return 'Charges adjusted successfully'
  }
}