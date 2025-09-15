// app/api/rentals/bookings/[id]/trip/end/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { validateOdometer, validateFuelLevel, validateInspectionPhotos } from '@/app/lib/trip/validation'
import { calculateTripCharges } from '@/app/lib/trip/calculations'
import { PaymentProcessor } from '@/app/lib/stripe/payment-processor'
import { 
  RentalBookingStatus, 
  VerificationStatus, 
  PaymentStatus, 
  TripStatus,
  ChargeStatus,
  DisputeType,
  DisputeStatus 
} from '@prisma/client'

// Status transition constants using proper enum values
const STATUS_TRANSITIONS = {
  NO_CHARGES: {
    status: RentalBookingStatus.COMPLETED,
    verificationStatus: VerificationStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID,
    tripStatus: TripStatus.COMPLETED
  },
  CHARGES_PAID: {
    status: RentalBookingStatus.COMPLETED,
    verificationStatus: VerificationStatus.COMPLETED,
    paymentStatus: PaymentStatus.CHARGES_PAID,
    tripStatus: TripStatus.COMPLETED
  },
  CHARGES_PENDING: {
    status: RentalBookingStatus.COMPLETED,
    verificationStatus: VerificationStatus.PENDING_CHARGES,
    paymentStatus: PaymentStatus.PENDING_CHARGES,
    tripStatus: TripStatus.ENDED_PENDING_REVIEW
  },
  PAYMENT_FAILED: {
    status: RentalBookingStatus.COMPLETED,
    verificationStatus: VerificationStatus.PENDING_CHARGES,
    paymentStatus: PaymentStatus.FAILED,
    tripStatus: TripStatus.ENDED_PENDING_REVIEW
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let booking = null
  
  try {
    const { id: bookingId } = await params
    const body = await request.json()
    const {
      endMileage,
      fuelLevelEnd,
      inspectionPhotos,
      damageReported,
      damageDescription,
      damagePhotos,
      notes,
      disputes,
      paymentChoice // 'pay_now' or 'request_review'
    } = body

    // Get guest email from header
    const guestEmail = request.headers.get('x-guest-email')

    // Fetch booking with all necessary relations
    booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: {
        car: true,
        host: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify guest access
    if (booking.guestEmail !== guestEmail && booking.renterId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Verify trip is active
    if (!booking.tripStartedAt) {
      return NextResponse.json(
        { error: 'Trip has not been started' },
        { status: 400 }
      )
    }

    if (booking.tripEndedAt) {
      return NextResponse.json(
        { error: 'Trip has already ended' },
        { status: 400 }
      )
    }

    // Validate inputs
    const validations = [
      validateOdometer(endMileage, booking.startMileage),
      validateFuelLevel(fuelLevelEnd),
      validateInspectionPhotos(inspectionPhotos, 'end')
    ]

    for (const validation of validations) {
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        )
      }
    }

    // Calculate charges
    const charges = calculateTripCharges(
      booking.startMileage || 0,
      endMileage,
      booking.fuelLevelStart || 'Full',
      fuelLevelEnd,
      new Date(booking.startDate),
      new Date(booking.endDate),
      new Date(),
      booking.numberOfDays,
      damageReported ? [{ type: damageDescription, cost: 0 }] : []
    )

    const hasCharges = charges.total > 0
    let chargeStatus: ChargeStatus = ChargeStatus.PENDING
    let paymentResult = null
    let statusTransition = STATUS_TRANSITIONS.NO_CHARGES
    let stripeChargeId = null
    let chargeFailureReason = null
    let chargeAttempts = 0
    
    // Handle charges based on conditions
    if (hasCharges) {
      // Priority 1: Disputes always go to P2P review
      if (disputes && disputes.length > 0) {
        console.log(`[Trip End] Booking ${booking.bookingCode}: Disputes present, routing to P2P review`)
        chargeStatus = ChargeStatus.DISPUTED
        statusTransition = STATUS_TRANSITIONS.CHARGES_PENDING
      }
      // Priority 2: No payment method requires P2P review
      else if (!booking.stripePaymentMethodId || !booking.stripeCustomerId) {
        console.log(`[Trip End] Booking ${booking.bookingCode}: No payment method, routing to P2P review`)
        chargeStatus = ChargeStatus.UNDER_REVIEW
        statusTransition = STATUS_TRANSITIONS.CHARGES_PENDING
      }
      // Priority 3: Guest requests review
      else if (paymentChoice === 'request_review') {
        console.log(`[Trip End] Booking ${booking.bookingCode}: Guest requested review, routing to P2P`)
        chargeStatus = ChargeStatus.UNDER_REVIEW
        statusTransition = STATUS_TRANSITIONS.CHARGES_PENDING
      }
      // Priority 4: Attempt immediate payment
      else if (paymentChoice === 'pay_now') {
        console.log(`[Trip End] Booking ${booking.bookingCode}: Attempting immediate charge of $${charges.total.toFixed(2)}`)
        
        const maxRetries = 2
        
        while (chargeAttempts <= maxRetries && chargeStatus !== ChargeStatus.CHARGED) {
          try {
            paymentResult = await PaymentProcessor.chargeAdditionalFees(
              booking.stripeCustomerId!,
              booking.stripePaymentMethodId!,
              Math.round(charges.total * 100), // Convert to cents
              `Trip charges for booking ${booking.bookingCode} - Mileage/Fuel/Late fees`,
              {
                bookingId: booking.id,
                bookingCode: booking.bookingCode,
                chargeType: 'trip_end_charges',
                mileageCharge: charges.mileage?.charge || 0,
                fuelCharge: charges.fuel?.charge || 0,
                lateCharge: charges.late?.charge || 0,
                damageCharge: charges.damage?.charge || 0,
                attemptNumber: chargeAttempts + 1
              }
            )
            
            if (paymentResult.status === 'succeeded') {
              console.log(`[Trip End] Payment successful - Charge ID: ${paymentResult.chargeId}`)
              chargeStatus = ChargeStatus.CHARGED
              statusTransition = STATUS_TRANSITIONS.CHARGES_PAID
              stripeChargeId = paymentResult.chargeId
              break
            } else if (paymentResult.status === 'requires_action') {
              // Payment needs 3D Secure or additional authentication
              console.log(`[Trip End] Payment requires authentication, routing to P2P`)
              chargeStatus = ChargeStatus.UNDER_REVIEW
              statusTransition = STATUS_TRANSITIONS.CHARGES_PENDING
              chargeFailureReason = 'Payment requires additional authentication'
              break
            } else {
              // Payment failed, maybe retry
              chargeAttempts++
              
              if (chargeAttempts > maxRetries) {
                console.log(`[Trip End] Payment failed after ${maxRetries} attempts: ${paymentResult.error}`)
                chargeStatus = ChargeStatus.FAILED
                statusTransition = STATUS_TRANSITIONS.PAYMENT_FAILED
                chargeFailureReason = paymentResult.error || 'Payment processing failed'
              } else {
                console.log(`[Trip End] Payment attempt ${chargeAttempts} failed, retrying...`)
                await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second before retry
              }
            }
          } catch (paymentError: any) {
            console.error(`[Trip End] Payment error on attempt ${chargeAttempts + 1}:`, paymentError)
            chargeAttempts++
            
            if (chargeAttempts > maxRetries) {
              chargeStatus = ChargeStatus.FAILED
              statusTransition = STATUS_TRANSITIONS.PAYMENT_FAILED
              chargeFailureReason = paymentError.message || 'Payment processing error'
            }
          }
        }
      }
      // Default: Send to P2P review
      else {
        console.log(`[Trip End] Booking ${booking.bookingCode}: Default routing to P2P review`)
        chargeStatus = ChargeStatus.PENDING
        statusTransition = STATUS_TRANSITIONS.CHARGES_PENDING
      }
    } else {
      // No charges - complete immediately
      console.log(`[Trip End] Booking ${booking.bookingCode}: No charges, completing trip`)
      statusTransition = STATUS_TRANSITIONS.NO_CHARGES
    }

    // Start transaction to update booking and create records
    const result = await prisma.$transaction(async (tx) => {
      // Update booking with trip end data and calculated status
      const updatedBooking = await tx.rentalBooking.update({
        where: { id: bookingId },
        data: {
          // Trip data
          tripStatus: statusTransition.tripStatus,
          tripEndedAt: new Date(),
          endMileage,
          fuelLevelEnd,
          inspectionPhotosEnd: JSON.stringify(inspectionPhotos),
          actualEndTime: new Date(),
          damageReported,
          damageDescription: damageDescription || null,
          damagePhotos: damagePhotos ? JSON.stringify(damagePhotos) : null,
          
          // Apply status transitions
          status: statusTransition.status,
          verificationStatus: statusTransition.verificationStatus,
          paymentStatus: statusTransition.paymentStatus,
          
          // Charge tracking
          pendingChargesAmount: hasCharges && chargeStatus !== ChargeStatus.CHARGED ? charges.total : null,
          chargesProcessedAt: chargeStatus === ChargeStatus.CHARGED ? new Date() : null,
          
          // Store charge details for P2P review if needed
          chargesNotes: hasCharges && chargeStatus !== ChargeStatus.CHARGED ? JSON.stringify({
            breakdown: charges.breakdown,
            mileage: charges.mileage,
            fuel: charges.fuel,
            late: charges.late,
            damage: charges.damage,
            disputes: disputes || [],
            paymentChoice: paymentChoice,
            failureReason: chargeFailureReason,
            retryCount: chargeAttempts
          }) : null,
          
          // Payment tracking if charged
          ...(stripeChargeId && {
            stripeChargeId,
            paymentProcessedAt: new Date()
          }),
          
          // Append end notes
          notes: booking.notes 
            ? `${booking.notes}\n\nEnd notes: ${notes || ''}`
            : `End notes: ${notes || ''}`
        }
      })

      // Create TripCharge record if there are charges
      if (hasCharges) {
        const holdUntil = new Date()
        holdUntil.setHours(holdUntil.getHours() + 24) // 24-hour hold

        await tx.tripCharge.create({
          data: {
            bookingId,
            mileageCharge: charges.mileage?.charge || 0,
            fuelCharge: charges.fuel?.charge || 0,
            lateCharge: charges.late?.charge || 0,
            damageCharge: charges.damage?.charge || 0,
            cleaningCharge: 0,
            otherCharges: 0,
            totalCharges: charges.total,
            chargeDetails: JSON.stringify(charges),
            chargeStatus: chargeStatus,
            chargeAttempts: chargeAttempts,
            disputes: disputes && disputes.length > 0 ? JSON.stringify(disputes) : null,
            disputeNotes: disputes && disputes.length > 0 
              ? `Guest disputed the following: ${disputes.join(', ')}`
              : null,
            disputedAt: disputes && disputes.length > 0 ? new Date() : null,
            stripeChargeId: stripeChargeId,
            chargedAt: chargeStatus === ChargeStatus.CHARGED ? new Date() : null,
            failureReason: chargeFailureReason,
            lastAttemptAt: chargeAttempts > 0 ? new Date() : null,
            holdUntil: chargeStatus === ChargeStatus.PENDING ? holdUntil : null,
            guestNotifiedAt: new Date(),
            requiresApproval: charges.total > 500 // Auto-approval threshold
          }
        })

        // Only create admin notification if charges need review
        if (chargeStatus !== ChargeStatus.CHARGED) {
          const priority = chargeStatus === ChargeStatus.FAILED || chargeStatus === ChargeStatus.DISPUTED ? 'HIGH' : 
                          !booking.stripePaymentMethodId ? 'URGENT' : 'MEDIUM'
          
          await tx.adminNotification.create({
            data: {
              type: 'PENDING_CHARGES',
              title: `Trip Charges Need Review - ${booking.bookingCode}`,
              message: `Trip ended with $${charges.total.toFixed(2)} in charges. ${
                chargeStatus === ChargeStatus.DISPUTED ? `Guest disputes: ${disputes.join(', ')}` :
                chargeStatus === ChargeStatus.FAILED ? `Payment failed after ${chargeAttempts} attempts: ${chargeFailureReason}` :
                !booking.stripePaymentMethodId ? 'No payment method on file - manual collection required' :
                chargeStatus === ChargeStatus.UNDER_REVIEW ? 'Guest requested admin review' :
                'Review required'
              }`,
              priority: priority,
              status: 'UNREAD',
              relatedId: bookingId,
              relatedType: 'RentalBooking',
              actionRequired: true,
              actionUrl: `/admin/rentals/verifications/${bookingId}`,
              metadata: {
                charges,
                disputes,
                hasPaymentMethod: !!booking.stripePaymentMethodId,
                chargeStatus: ChargeStatus[chargeStatus],
                failureReason: chargeFailureReason,
                retryCount: chargeAttempts
              }
            }
          })
        }
      }

      // Create inspection photo records
      const photoRecords = Object.entries(inspectionPhotos).map(([category, url]) => ({
        bookingId,
        type: 'end' as const,
        category,
        url: url as string,
        metadata: {
          endMileage,
          fuelLevelEnd,
          timestamp: new Date()
        }
      }))

      await tx.inspectionPhoto.createMany({
        data: photoRecords
      })

      // Create disputes if any
      if (disputes && disputes.length > 0) {
        for (const disputeReason of disputes) {
          // Map dispute reason to DisputeType
          let disputeType: DisputeType = DisputeType.OTHER
          if (disputeReason.toLowerCase().includes('mileage')) {
            disputeType = DisputeType.MILEAGE
          } else if (disputeReason.toLowerCase().includes('fuel')) {
            disputeType = DisputeType.FUEL
          } else if (disputeReason.toLowerCase().includes('late')) {
            disputeType = DisputeType.LATE_RETURN
          } else if (disputeReason.toLowerCase().includes('damage')) {
            disputeType = DisputeType.DAMAGE
          } else if (disputeReason.toLowerCase().includes('cleaning')) {
            disputeType = DisputeType.CLEANING
          }

          await tx.rentalDispute.create({
            data: {
              bookingId,
              type: disputeType,
              description: disputeReason,
              status: DisputeStatus.OPEN
            }
          })
        }
      }

      // Create appropriate message based on outcome
      const messageCategory = hasCharges ? 'charges' : 'general'
      const isUrgent = chargeStatus === ChargeStatus.FAILED || !booking.stripePaymentMethodId
      
      let messageContent = ''
      
      if (!hasCharges) {
        messageContent = '✅ Trip completed successfully with no additional charges. Thank you for choosing ItWhip!'
      } else if (chargeStatus === ChargeStatus.CHARGED) {
        messageContent = `✅ Trip completed and additional charges processed successfully!\n\n${
          charges.breakdown.map((b: any) => `• ${b.label}: $${b.amount.toFixed(2)}`).join('\n')
        }\n\nTotal charged: $${charges.total.toFixed(2)}\n\nThank you for choosing ItWhip!`
      } else if (chargeStatus === ChargeStatus.FAILED) {
        messageContent = `⚠️ Trip completed but payment for additional charges failed.\n\n${
          charges.breakdown.map((b: any) => `• ${b.label}: $${b.amount.toFixed(2)}`).join('\n')
        }\n\nTotal: $${charges.total.toFixed(2)}\n\nOur team will contact you within 2-4 hours to resolve this.`
      } else if (!booking.stripePaymentMethodId) {
        messageContent = `⚠️ Trip completed with additional charges but no payment method on file.\n\n${
          charges.breakdown.map((b: any) => `• ${b.label}: $${b.amount.toFixed(2)}`).join('\n')
        }\n\nTotal: $${charges.total.toFixed(2)}\n\nPlease add a payment method or our team will contact you.`
      } else if (chargeStatus === ChargeStatus.DISPUTED) {
        messageContent = `Trip completed. Additional charges are under review per your dispute.\n\n${
          charges.breakdown.map((b: any) => `• ${b.label}: $${b.amount.toFixed(2)}`).join('\n')
        }\n\nTotal disputed: $${charges.total.toFixed(2)}\n\nWe'll review your disputes and respond within 24 hours.`
      } else {
        messageContent = `Trip completed. Additional charges pending review.\n\n${
          charges.breakdown.map((b: any) => `• ${b.label}: $${b.amount.toFixed(2)}`).join('\n')
        }\n\nTotal: $${charges.total.toFixed(2)}\n\nOur team will process these charges within 2-4 hours.`
      }
      
      await tx.rentalMessage.create({
        data: {
          bookingId,
          senderId: 'system',
          senderType: 'admin',
          senderName: 'System',
          message: messageContent,
          category: messageCategory,
          metadata: charges,
          isRead: false,
          readByAdmin: false,
          isUrgent: isUrgent
        }
      })

      // Create activity log
      await tx.activityLog.create({
        data: {
          action: 'TRIP_ENDED',
          entityType: 'RentalBooking',
          entityId: bookingId,
          metadata: {
            endMileage,
            fuelLevelEnd,
            charges,
            chargeStatus: ChargeStatus[chargeStatus],
            paymentChoice,
            statusTransition: RentalBookingStatus[statusTransition.status],
            disputes,
            hasCharges,
            paymentResult: paymentResult ? {
              status: paymentResult.status,
              chargeId: paymentResult.chargeId,
              error: paymentResult.error
            } : null,
            retryCount: chargeAttempts,
            timestamp: new Date()
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        }
      })

      return updatedBooking
    }, {
      maxWait: 10000, // 10 seconds max wait
      timeout: 30000, // 30 seconds timeout
    })

    // Send notifications (outside transaction for better performance)
    try {
      if (booking.host.email) {
        console.log(`[Trip End] Notifying host ${booking.host.email} about trip end`)
        // TODO: Send email to host with trip summary
      }

      if (booking.guestEmail) {
        console.log(`[Trip End] Sending trip summary to guest ${booking.guestEmail}`)
        // TODO: Send email to guest with appropriate message based on charge status
      }
    } catch (notificationError) {
      console.error('[Trip End] Notification error (non-blocking):', notificationError)
      // Don't fail the request if notifications fail
    }

    // Construct response
    const responseData = {
      success: true,
      booking: result,
      charges,
      hasCharges,
      chargeStatus: ChargeStatus[chargeStatus], // Convert enum to string
      paymentResult: paymentResult ? {
        status: paymentResult.status,
        chargeId: paymentResult.chargeId,
        error: paymentResult.error
      } : null,
      statusTransition: RentalBookingStatus[statusTransition.status], // Convert enum to string
      message: getResponseMessage(hasCharges, chargeStatus, charges),
      nextSteps: getNextSteps(hasCharges, chargeStatus),
      canLeaveReview: statusTransition.status === RentalBookingStatus.COMPLETED
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('[Trip End] Fatal error:', error)
    
    // Log critical error to audit log instead of errorLog
    if (booking?.id) {
      try {
        await prisma.auditLog.create({
          data: {
            category: 'FINANCIAL',
            eventType: 'trip_end_error',
            severity: 'CRITICAL',
            adminId: 'system',
            adminEmail: 'system@itwhip.com',
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
            action: 'error',
            resource: 'booking',
            resourceId: booking.id,
            details: {
              error: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined,
              endpoint: 'trip/end',
              timestamp: new Date()
            },
            hash: '',
            previousHash: null
          }
        }).catch(console.error)
      } catch (logError) {
        console.error('[Trip End] Failed to log error:', logError)
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to end trip', 
        details: error instanceof Error ? error.message : 'Unknown error',
        code: 'TRIP_END_FAILED'
      },
      { status: 500 }
    )
  }
}

// Helper functions
function getResponseMessage(hasCharges: boolean, chargeStatus: ChargeStatus, charges: any): string {
  if (!hasCharges) {
    return 'Trip ended successfully with no additional charges. Thank you for choosing ItWhip!'
  }
  
  const chargeAmount = charges.total.toFixed(2)
  
  switch (chargeStatus) {
    case ChargeStatus.CHARGED:
      return `Trip ended successfully! Additional charges of $${chargeAmount} have been processed.`
    case ChargeStatus.FAILED:
      return `Trip ended successfully. Payment for $${chargeAmount} in charges failed and will be reviewed by our team.`
    case ChargeStatus.DISPUTED:
      return `Trip ended successfully. Disputed charges of $${chargeAmount} are under review.`
    case ChargeStatus.UNDER_REVIEW:
      return `Trip ended successfully. Additional charges of $${chargeAmount} have been submitted for review.`
    default:
      return `Trip ended successfully. Additional charges of $${chargeAmount} are pending review.`
  }
}

function getNextSteps(hasCharges: boolean, chargeStatus: ChargeStatus): string {
  if (!hasCharges) {
    return 'You can now leave a review for your rental experience.'
  }
  
  switch (chargeStatus) {
    case ChargeStatus.CHARGED:
      return 'You can now leave a review for your rental experience.'
    case ChargeStatus.FAILED:
      return 'Our team will contact you within 2-4 hours regarding payment.'
    case ChargeStatus.DISPUTED:
      return 'Your disputes will be reviewed and you\'ll receive a response within 24 hours.'
    case ChargeStatus.UNDER_REVIEW:
      return 'Charges will be reviewed and processed within 2-4 hours.'
    default:
      return 'Charges will be reviewed and processed within 24 hours.'
  }
}

// GET - Check if trip can be ended
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    const guestEmail = request.headers.get('x-guest-email')

    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        tripStatus: true,
        tripStartedAt: true,
        tripEndedAt: true,
        startMileage: true,
        fuelLevelStart: true,
        endDate: true,
        endTime: true,
        status: true,
        guestEmail: true,
        renterId: true,
        stripePaymentMethodId: true,
        stripeCustomerId: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify guest access
    if (booking.guestEmail !== guestEmail && booking.renterId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const canEnd = booking.tripStartedAt && !booking.tripEndedAt
    const isLate = new Date() > new Date(booking.endDate)
    const hasPaymentMethod = !!(booking.stripePaymentMethodId && booking.stripeCustomerId)

    return NextResponse.json({
      canEnd,
      isLate,
      tripStatus: booking.tripStatus,
      tripStartedAt: booking.tripStartedAt,
      tripEndedAt: booking.tripEndedAt,
      startMileage: booking.startMileage,
      fuelLevelStart: booking.fuelLevelStart,
      hasPaymentMethod,
      paymentMethodLast4: booking.stripePaymentMethodId ? booking.stripePaymentMethodId.slice(-4) : null
    })

  } catch (error) {
    console.error('[Trip End Check] Error:', error)
    return NextResponse.json(
      { error: 'Failed to check trip status' },
      { status: 500 }
    )
  }
}