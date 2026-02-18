// app/api/rentals/bookings/[id]/trip/end/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { validateOdometer, validateFuelLevel, validateInspectionPhotos } from '@/app/lib/trip/validation'
import { calculateTripCharges } from '@/app/lib/trip/calculations'
import { PaymentProcessor } from '@/app/lib/stripe/payment-processor'
import { calculateHostEarnings } from '@/app/fleet/financial-constants'
import { 
  RentalBookingStatus, 
  VerificationStatus, 
  PaymentStatus, 
  TripStatus,
  ChargeStatus,
  DisputeType,
  DisputeStatus 
} from '@prisma/client'

// ========== 🆕 ACTIVITY TRACKING IMPORT ==========
import { trackActivity } from '@/lib/helpers/guestProfileStatus'

// ========== ✅ NEW: ESG EVENT HOOK IMPORT ==========
import { handleTripCompleted } from '@/app/lib/esg/event-hooks'

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
  let booking: any = null
  
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

    // Verify JWT auth
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

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

    // Verify ownership via JWT identity
    const isOwner = (user.id && booking.renterId === user.id) ||
                    (user.email && booking.guestEmail === user.email)
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
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
      validateOdometer(endMileage, booking.startMileage ?? undefined),
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
    let paymentResult: any = null
    let statusTransition: {
      status: RentalBookingStatus
      verificationStatus: VerificationStatus
      paymentStatus: PaymentStatus
      tripStatus: TripStatus
    } = STATUS_TRANSITIONS.NO_CHARGES
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
              console.log(`[Trip End] Payment requires authentication, routing to P2P`)
              chargeStatus = ChargeStatus.UNDER_REVIEW
              statusTransition = STATUS_TRANSITIONS.CHARGES_PENDING
              chargeFailureReason = 'Payment requires additional authentication'
              break
            } else {
              chargeAttempts++
              
              if (chargeAttempts > maxRetries) {
                console.log(`[Trip End] Payment failed after ${maxRetries} attempts: ${paymentResult.error}`)
                chargeStatus = ChargeStatus.FAILED
                statusTransition = STATUS_TRANSITIONS.PAYMENT_FAILED
                chargeFailureReason = paymentResult.error || 'Payment processing failed'
              } else {
                console.log(`[Trip End] Payment attempt ${chargeAttempts} failed, retrying...`)
                await new Promise(resolve => setTimeout(resolve, 1000))
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

          // Host post-trip review (24h window before deposit release)
          hostFinalReviewStatus: 'PENDING_REVIEW',
          hostFinalReviewDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),

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
        holdUntil.setHours(holdUntil.getHours() + 24)

        await tx.tripCharge.create({
          data: {
            id: crypto.randomUUID(),
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
            requiresApproval: charges.total > 500,
            updatedAt: new Date()
          }
        })

        // ========================================================================
        // TRIP ISSUE CREATION - AUTO-CREATE WHEN DAMAGE REPORTED
        // ========================================================================
        if (damageReported) {
          const escalationDeadline = new Date()
          escalationDeadline.setHours(escalationDeadline.getHours() + 48) // 48 hours from now

          // Get inspection photo references
          const startPhotos = await tx.inspectionPhoto.findMany({
            where: { bookingId, type: 'start' },
            select: { id: true, url: true, category: true }
          })

          // Determine severity based on damage description and charges
          let severity = 'MINOR'
          const damageCharge = charges.damage?.charge || 0
          if (damageCharge > 500 || (damageDescription && damageDescription.toLowerCase().includes('major'))) {
            severity = 'MAJOR'
          } else if (damageCharge > 100 || (damageDescription && damageDescription.toLowerCase().includes('moderate'))) {
            severity = 'MODERATE'
          }

          // Determine issue type from damage description or default to DAMAGE
          let issueType = 'DAMAGE'
          if (damageDescription) {
            const lowerDesc = damageDescription.toLowerCase()
            if (lowerDesc.includes('mileage')) issueType = 'MILEAGE'
            else if (lowerDesc.includes('fuel')) issueType = 'FUEL'
            else if (lowerDesc.includes('clean')) issueType = 'CLEANING'
            else if (lowerDesc.includes('mechanical') || lowerDesc.includes('engine')) issueType = 'MECHANICAL'
          }

          await tx.tripIssue.create({
            data: {
              id: crypto.randomUUID(),
              bookingId,

              // Guest report (they reported the damage at trip end)
              guestReportedAt: new Date(),
              guestDescription: damageDescription || 'Damage reported at trip end',
              guestPhotos: damagePhotos || null,

              // Combined analysis
              issueType,
              severity,

              // Trip capture evidence
              tripStartMileage: booking.startMileage,
              tripEndMileage: endMileage,
              tripStartFuel: booking.fuelLevelStart,
              tripEndFuel: fuelLevelEnd,
              startPhotosRef: startPhotos.length > 0 ? (startPhotos as any) : null,
              endPhotosRef: inspectionPhotos,

              // Resolution workflow
              status: 'OPEN',

              // Auto-escalation tracking
              escalationDeadline,

              // Notifications
              guestNotifiedAt: new Date(),
              updatedAt: new Date()
            }
          })

          console.log(`[Trip End] TripIssue created for booking ${booking.bookingCode}: ${issueType} - ${severity}`)

          // Create admin notification for trip issue
          await tx.adminNotification.create({
            data: {
              id: crypto.randomUUID(),
              type: 'TRIP_ISSUE_CREATED',
              title: `Trip Issue Reported - ${booking.bookingCode}`,
              message: `Guest reported ${severity.toLowerCase()} ${issueType.toLowerCase()} issue at trip end. ${damageDescription ? `Description: ${damageDescription}` : ''}`,
              priority: severity === 'MAJOR' ? 'HIGH' : severity === 'MODERATE' ? 'MEDIUM' : 'LOW',
              status: 'UNREAD',
              relatedId: bookingId,
              relatedType: 'TripIssue',
              actionRequired: true,
              actionUrl: `/admin/rentals/verifications/${bookingId}`,
              metadata: {
                issueType,
                severity,
                damageDescription,
                escalationDeadline: escalationDeadline.toISOString(),
                hasPhotos: !!damagePhotos
              },
              updatedAt: new Date()
            }
          })
        }
        // ========================================================================
        // END TRIP ISSUE CREATION
        // ========================================================================

        // Only create admin notification if charges need review
        if (chargeStatus !== ChargeStatus.CHARGED) {
          const priority = chargeStatus === ChargeStatus.FAILED || chargeStatus === ChargeStatus.DISPUTED ? 'HIGH' : 
                          !booking.stripePaymentMethodId ? 'URGENT' : 'MEDIUM'
          
          await tx.adminNotification.create({
            data: {
              id: crypto.randomUUID(),
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
                charges: JSON.parse(JSON.stringify(charges)),
                disputes,
                hasPaymentMethod: !!booking.stripePaymentMethodId,
                chargeStatus: ChargeStatus[chargeStatus],
                failureReason: chargeFailureReason,
                retryCount: chargeAttempts
              },
              updatedAt: new Date()
            }
          })
        }
      }

      // ========================================================================
      // PAYOUT CREATION - AUTOMATED PAYOUT SYSTEM
      // ========================================================================
      
      // Only create payout if trip completed successfully (no major issues)
      if (statusTransition.status === RentalBookingStatus.COMPLETED) {
        
        // Check if this is a new host (first 3 trips have 7-day hold instead of 3)
        const completedTripsCount = await tx.rentalBooking.count({
          where: {
            hostId: booking.hostId,
            status: RentalBookingStatus.COMPLETED
          }
        })
        const isNewHost = completedTripsCount < 3
        
        // Calculate host earnings
        const hostEarnings = calculateHostEarnings(
          booking.totalAmount,
          booking.host.protectionPlan || 'BASIC',
          isNewHost
        )
        
        // Determine when payout is eligible
        const holdDays = isNewHost ? 7 : 3
        const eligibleAt = new Date(Date.now() + (holdDays * 24 * 60 * 60 * 1000))
        
        // Create RentalPayout record (PENDING status)
        await tx.rentalPayout.create({
          data: {
            id: crypto.randomUUID(),
            hostId: booking.hostId,
            bookingId: booking.id,
            amount: hostEarnings.hostEarnings,
            status: 'PENDING',
            eligibleAt: eligibleAt,
            
            // Period tracking (for compatibility with existing schema)
            startDate: booking.startDate,
            endDate: booking.endDate,
            bookingCount: 1,
            grossEarnings: booking.totalAmount,
            platformFee: hostEarnings.platformRevenue,
            processingFee: hostEarnings.processingFee,
            netPayout: hostEarnings.hostEarnings,
            currency: 'USD',
            updatedAt: new Date()
          }
        })

        // Update host pending balance
        await tx.rentalHost.update({
          where: { id: booking.hostId },
          data: {
            pendingBalance: { increment: hostEarnings.hostEarnings }
          }
        })
        
        // Log payout creation
        await tx.activityLog.create({
          data: {
            id: crypto.randomUUID(),
            action: 'PAYOUT_CREATED',
            entityType: 'RentalPayout',
            entityId: booking.id,
            metadata: {
              amount: hostEarnings.hostEarnings,
              eligibleAt: eligibleAt,
              holdDays: holdDays,
              isNewHost: isNewHost,
              commission: hostEarnings.platformRevenue,
              fee: hostEarnings.processingFee,
              bookingCode: booking.bookingCode,
              bookingTotal: booking.totalAmount,
              timestamp: new Date()
            },
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
          }
        })
        
        console.log(`[Trip End] Created payout for ${booking.bookingCode}: $${hostEarnings.hostEarnings.toFixed(2)}, eligible on ${eligibleAt.toISOString().split('T')[0]}`)
      }
      
      // ========================================================================
      // END PAYOUT CREATION
      // ========================================================================

      // Create inspection photo records
      const photoRecords = Object.entries(inspectionPhotos).map(([category, url]) => ({
        id: crypto.randomUUID(),
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
              id: crypto.randomUUID(),
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
          id: crypto.randomUUID(),
          bookingId,
          senderId: 'system',
          senderType: 'admin',
          senderName: 'System',
          message: messageContent,
          category: messageCategory,
          metadata: JSON.parse(JSON.stringify(charges)),
          isRead: false,
          readByAdmin: false,
          isUrgent: isUrgent,
          updatedAt: new Date()
        }
      })

      // Create activity log for trip end
      await tx.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          action: 'TRIP_ENDED',
          entityType: 'RentalBooking',
          entityId: bookingId,
          metadata: {
            endMileage,
            fuelLevelEnd,
            charges: JSON.parse(JSON.stringify(charges)),
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
      maxWait: 10000,
      timeout: 30000,
    })

    // Restore car availability now that trip is complete
    try {
      await prisma.rentalAvailability.deleteMany({
        where: {
          carId: booking.carId,
          date: {
            gte: new Date(booking.startDate),
            lte: new Date(booking.endDate)
          },
          note: { contains: booking.bookingCode }
        }
      })
      console.log(`[Trip End] Car availability restored for ${booking.car.make} ${booking.car.model} (${booking.bookingCode})`)
    } catch (availError) {
      console.error('[Trip End] Failed to restore car availability (non-blocking):', availError)
    }

    // ========== 🆕 TRACK TRIP END ACTIVITY ==========
    // This populates the guest's activity timeline for the Status Tab
    // Wrapped in try-catch - won't break trip end if tracking fails
    try {
      // Find guest's ReviewerProfile ID
      let guestProfileId = booking.reviewerProfileId
      
      if (!guestProfileId && booking.guestEmail) {
        const reviewerProfile = await prisma.reviewerProfile.findFirst({
          where: { email: booking.guestEmail },
          select: { id: true }
        })
        guestProfileId = reviewerProfile?.id
      }

      if (guestProfileId) {
        // Calculate trip duration
        const tripStart = new Date(booking.tripStartedAt!)
        const tripEnd = new Date()
        const tripDurationHours = Math.round((tripEnd.getTime() - tripStart.getTime()) / (1000 * 60 * 60))
        const milesDriven = endMileage - (booking.startMileage || 0)

        // Build comprehensive description based on outcome
        let description = `Trip ended for ${booking.car.year} ${booking.car.make} ${booking.car.model}`
        
        if (!hasCharges) {
          description += ' - No additional charges'
        } else if (chargeStatus === ChargeStatus.CHARGED) {
          description += ` - Additional charges of $${charges.total.toFixed(2)} paid`
        } else if (chargeStatus === ChargeStatus.DISPUTED) {
          description += ` - $${charges.total.toFixed(2)} disputed and under review`
        } else {
          description += ` - $${charges.total.toFixed(2)} pending review`
        }

        await trackActivity(guestProfileId, {
          action: 'TRIP_ENDED',
          description,
          metadata: {
            bookingId: booking.id,
            bookingCode: booking.bookingCode,
            carName: `${booking.car.year} ${booking.car.make} ${booking.car.model}`,
            endMileage,
            startMileage: booking.startMileage || 0,
            milesDriven,
            fuelLevelEnd,
            fuelLevelStart: booking.fuelLevelStart || 'Unknown',
            tripDurationHours,
            tripEndedAt: new Date().toISOString(),
            
            // Charge information
            hasCharges,
            totalCharges: hasCharges ? charges.total : 0,
            chargeStatus: ChargeStatus[chargeStatus],
            chargeBreakdown: hasCharges ? {
              mileage: charges.mileage?.charge || 0,
              fuel: charges.fuel?.charge || 0,
              late: charges.late?.charge || 0,
              damage: charges.damage?.charge || 0
            } : null,
            
            // Dispute information
            hasDisputes: disputes && disputes.length > 0,
            disputeReasons: disputes || [],
            
            // Damage information
            damageReported,
            damageDescription: damageDescription || null,
            
            // Payment information
            paymentChoice,
            paymentStatus: paymentResult?.status || (hasCharges ? 'pending_review' : 'none'),
            stripeChargeId: stripeChargeId || null,
            
            // Photos
            photoCount: Object.keys(inspectionPhotos).length
          }
        })

        console.log('✅ Trip end tracked in guest timeline:', {
          guestId: guestProfileId,
          bookingId: booking.id,
          hasCharges,
          chargeStatus: ChargeStatus[chargeStatus]
        })
      } else {
        console.warn('⚠️ Could not find guest profile for trip end tracking')
      }
    } catch (trackingError) {
      console.error('❌ Failed to track trip end activity:', trackingError)
      // Continue without breaking - tracking is non-critical
    }
    // ========== END ACTIVITY TRACKING ==========

    // ========================================================================
    // ✅ NEW: TRIGGER ESG EVENT - TRIP COMPLETED
    // ========================================================================
    
    try {
      // Determine if trip was incident-free (no claims filed)
      const hasActiveClaim = await prisma.claim.findFirst({
        where: {
          bookingId: booking.id,
          status: { in: ['PENDING', 'UNDER_REVIEW', 'APPROVED'] }
        },
        select: { id: true }
      })

      const wasIncidentFree = !hasActiveClaim

      // Get guest rating if available
      const review = await prisma.rentalReview.findFirst({
        where: { bookingId: booking.id },
        select: { rating: true }
      })

      await handleTripCompleted(booking.hostId, {
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        carId: booking.carId,
        startDate: new Date(booking.startDate),
        endDate: new Date(),
        totalMiles: endMileage - (booking.startMileage || 0),
        fuelType: booking.car.fuelType || 'GASOLINE',
        wasIncidentFree,
        guestRating: review?.rating
      })

      console.log('✅ ESG trip completion event triggered:', {
        hostId: booking.hostId,
        bookingCode: booking.bookingCode,
        wasIncidentFree,
        miles: endMileage - (booking.startMileage || 0)
      })
    } catch (esgError) {
      // Don't fail trip completion if ESG update fails
      console.error('❌ ESG event failed (non-critical):', esgError)
    }

    // ========================================================================
    // DEPOSIT: No longer auto-released at trip end.
    // Host has 24h to review via hostFinalReviewStatus=PENDING_REVIEW.
    // Deposit is released when host approves or cron auto-approves after deadline.
    // ========================================================================

    // Send notifications (outside transaction)
    try {
      if (booking.host.email) {
        console.log(`[Trip End] Notifying host ${booking.host.email} about trip end — 24h review window`)
        import('@/app/lib/email/booking-emails').then(({ sendHostTripEndReviewEmail }) => {
          sendHostTripEndReviewEmail({
            hostEmail: booking.host.email!,
            hostName: booking.host.name || 'Host',
            guestName: booking.guestName,
            bookingCode: booking.bookingCode,
            carMake: booking.car.make,
            carModel: booking.car.model,
            carYear: booking.car.year,
            reviewDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
            reviewUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/partner/bookings/${booking.id}`,
          }).catch((e: any) => console.error('[Trip End] Host review email failed:', e))
        }).catch(() => {})
      }

      if (booking.guestEmail) {
        console.log(`[Trip End] Sending trip summary to guest ${booking.guestEmail}`)
        // TODO: Send email to guest
      }

      // SMS notifications (fire-and-forget)
      import('@/app/lib/twilio/sms-triggers').then(({ sendTripEndedSms }) => {
        sendTripEndedSms({
          bookingCode: booking.bookingCode,
          guestPhone: booking.guestPhone,
          guestName: booking.guestName,
          guestId: booking.reviewerProfileId,
          hostPhone: booking.host.phone,
          car: booking.car,
          totalAmount: Number(charges.total || 0),
          bookingId: booking.id,
          hostId: booking.hostId,
        }).catch(e => console.error('[Trip End] SMS failed:', e))
      }).catch(() => {})
    } catch (notificationError) {
      console.error('[Trip End] Notification error (non-blocking):', notificationError)
    }

    const responseData = {
      success: true,
      booking: result,
      charges,
      hasCharges,
      chargeStatus: ChargeStatus[chargeStatus],
      paymentResult: paymentResult ? {
        status: paymentResult.status,
        chargeId: paymentResult.chargeId,
        error: paymentResult.error
      } : null,
      statusTransition: RentalBookingStatus[statusTransition.status],
      message: getResponseMessage(hasCharges, chargeStatus, charges),
      nextSteps: getNextSteps(hasCharges, chargeStatus),
      canLeaveReview: statusTransition.status === RentalBookingStatus.COMPLETED
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('[Trip End] Fatal error:', error)
    
    if (booking?.id) {
      try {
        await prisma.auditLog.create({
          data: {
            id: crypto.randomUUID(),
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params

    // Verify JWT auth
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

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

    // Verify ownership via JWT identity
    const isOwner = (user.id && booking.renterId === user.id) ||
                    (user.email && booking.guestEmail === user.email)
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
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