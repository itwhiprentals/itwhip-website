// app/api/partner/bookings/[id]/route.ts
// Get, update, or delete a specific booking

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/send-email'
import { getBookingCancelledTemplate } from '@/app/lib/email/templates/booking-cancelled'
import { logEmail, generateEmailReference } from '@/app/lib/email/config'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

// Helper to determine charge type from individual charge fields
function getChargeType(charge: {
  mileageCharge: unknown;
  fuelCharge: unknown;
  lateCharge: unknown;
  damageCharge: unknown;
  cleaningCharge: unknown;
  otherCharges: unknown;
}): string {
  if (Number(charge.damageCharge) > 0) return 'DAMAGE'
  if (Number(charge.cleaningCharge) > 0) return 'CLEANING'
  if (Number(charge.lateCharge) > 0) return 'LATE_FEE'
  if (Number(charge.mileageCharge) > 0) return 'MILEAGE'
  if (Number(charge.fuelCharge) > 0) return 'FUEL'
  if (Number(charge.otherCharges) > 0) return 'OTHER'
  return 'OTHER'
}

async function getPartnerFromToken(request?: NextRequest) {
  // Check Authorization header first (mobile app)
  const authHeader = request?.headers.get('authorization')
  let token: string | undefined
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }
  // Fall back to cookies (web)
  if (!token) {
    const cookieStore = await cookies()
    token = cookieStore.get('partner_token')?.value ||
                  cookieStore.get('hostAccessToken')?.value
  }

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    // Allow all host types since we've unified the portals
    if (!partner) {
      return null
    }

    return partner
  } catch {
    return null
  }
}

// GET - Get full booking details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken(request)

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: bookingId } = await params

    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        hostId: partner.id
      },
      include: {
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            emailVerified: true,
            phoneVerified: true,
            createdAt: true,
            // Get verification data from ReviewerProfile
            reviewerProfile: {
              select: {
                id: true,
                stripeIdentityStatus: true,
                stripeIdentityVerifiedAt: true,
                stripeVerifiedFirstName: true,
                stripeVerifiedLastName: true,
                stripeVerifiedDob: true,
                stripeVerifiedAddress: true,
                memberSince: true,
                profilePhotoUrl: true,
                // Verification override fields
                isVerified: true,
                documentsVerified: true,
                documentVerifiedAt: true,
                documentVerifiedBy: true,
                fullyVerified: true,
                // Manual verification by host
                manuallyVerifiedByHost: true,
                manualVerificationHostId: true,
                manualVerificationDate: true,
                // Guest insurance fields
                insuranceProvider: true,
                policyNumber: true,
                insuranceVerified: true,
                insuranceVerifiedAt: true,
                insuranceCardFrontUrl: true,
                insuranceCardBackUrl: true,
                expiryDate: true,
                coverageType: true,
                insuranceAddedAt: true,
              }
            }
          }
        },
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            licensePlate: true,
            vin: true,
            color: true,
            photos: {
              select: {
                url: true,
                isHero: true,
                order: true
              },
              orderBy: [{ isHero: 'desc' }, { order: 'asc' }]
            },
            dailyRate: true,
            weeklyRate: true,
            monthlyRate: true,
            vehicleType: true,
            carType: true,
            seats: true,
            currentMileage: true,
            insuranceEligible: true,
            insuranceNotes: true,
            isActive: true,
            instantBook: true,
            keyInstructions: true
          }
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            partnerCompanyName: true,
            partnerSupportEmail: true,
            partnerSupportPhone: true,
            city: true,
            state: true,
            zipCode: true,
            currentCommissionRate: true,
            welcomeDiscountUsed: true,
            stripeChargesEnabled: true,
            stripePayoutsEnabled: true,
            stripeConnectAccountId: true
          }
        },
        InspectionPhoto: {
          select: {
            id: true,
            type: true,
            category: true,
            url: true,
            uploadedAt: true,
          },
          orderBy: { uploadedAt: 'asc' as const },
        },
        tripCharges: {
          select: {
            id: true,
            totalCharges: true,
            chargeDetails: true,
            chargeStatus: true,
            mileageCharge: true,
            fuelCharge: true,
            lateCharge: true,
            damageCharge: true,
            cleaningCharge: true,
            otherCharges: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        },
        convertedFromProspect: {
          select: {
            id: true,
            paymentPreference: true,
            agreementPreference: true,
            source: true
          }
        },
        reservationRequest: {
          select: {
            id: true,
          }
        },
        messages: {
          select: {
            id: true,
            senderId: true,
            senderType: true,
            senderName: true,
            message: true,
            isRead: true,
            isUrgent: true,
            hasAttachment: true,
            attachmentUrl: true,
            attachmentName: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' as const }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Parse vehicle insurance info
    let vehicleInsurance = null
    if (booking.car?.insuranceNotes) {
      try {
        vehicleInsurance = JSON.parse(booking.car.insuranceNotes)
      } catch {
        // Invalid JSON
      }
    }

    // Get partner insurance settings
    let partnerInsurance = null
    if (partner.partnerPolicies && typeof partner.partnerPolicies === 'object') {
      const policies = partner.partnerPolicies as Record<string, unknown>
      if (policies.insurance) {
        partnerInsurance = policies.insurance
      }
    }

    // Calculate insurance status for this booking
    const hasVehicleInsurance = booking.car?.insuranceEligible && vehicleInsurance?.useForRentals
    // Check partner insurance using available fields
    const partnerHasInsurance = partner.insurancePolicyNumber && partner.insuranceActive
    const hasPartnerInsurance = partnerHasInsurance &&
      (partnerInsurance as Record<string, unknown>)?.coversDuringRentals &&
      ((partnerInsurance as Record<string, unknown>)?.rentalCoveredVehicleIds as string[] || []).includes(booking.car?.id || '')

    // Format response
    const response = {
      success: true,
      booking: {
        id: booking.id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentType: booking.paymentType || null,
        bookingType: booking.bookingType || 'STANDARD',

        // Recruited booking fields
        isRecruitedBooking: !!booking.convertedFromProspect,
        recruitmentPaymentPreference: booking.convertedFromProspect?.paymentPreference || null,
        recruitmentAgreementPreference: booking.convertedFromProspect?.agreementPreference || null,
        recruitmentSource: booking.convertedFromProspect?.source || null,

        // Computed flags (no raw internal fields exposed)
        // MANUAL bookings: guest-driven only after auto-confirm (not while PENDING)
        // STANDARD bookings: guest-driven if has a renter AND a Stripe payment intent
        isGuestDriven: booking.bookingType === 'MANUAL'
          ? booking.status !== 'PENDING'
          : !!(booking.renterId && booking.paymentIntentId),
        // Manual bookings auto-confirm when guest pays — host never needs separate approve/reject.
        // Only standard (guest-initiated) bookings use the separate host approve/reject flow.
        hostApproval: booking.bookingType === 'MANUAL'
          ? 'APPROVED'
          : (booking.hostStatus || 'PENDING'),
        fleetStatus: booking.fleetStatus || 'PENDING',
        hostReviewedAt: booking.hostReviewedAt?.toISOString() || null,
        hostNotes: booking.hostNotes || null,

        // Dates
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        startTime: booking.startTime,
        endTime: booking.endTime,
        numberOfDays: booking.numberOfDays,

        // Pricing
        dailyRate: Number(booking.dailyRate),
        subtotal: Number(booking.subtotal),
        deliveryFee: Number(booking.deliveryFee),
        insuranceFee: Number(booking.insuranceFee),
        serviceFee: Number(booking.serviceFee),
        taxes: Number(booking.taxes),
        securityDeposit: Number(booking.securityDeposit),
        depositHeld: Number(booking.depositHeld),
        totalAmount: Number(booking.totalAmount),
        platformFeeRate: booking.platformFeeRate ? Number(booking.platformFeeRate) : null,
        isWelcomeDiscount: booking.isWelcomeDiscount || false,

        // Pickup
        pickupType: booking.pickupType,
        pickupLocation: booking.pickupLocation,

        // Guest info
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,

        // Notes
        notes: booking.notes,

        // Timestamps
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),

        // Trip charges
        tripCharges: booking.tripCharges.map((charge: {
          id: string;
          totalCharges: unknown;
          chargeDetails: unknown;
          chargeStatus: string | null;
          mileageCharge: unknown;
          fuelCharge: unknown;
          lateCharge: unknown;
          damageCharge: unknown;
          cleaningCharge: unknown;
          otherCharges: unknown;
          createdAt: Date
        }) => {
          // Parse charge details to get description and type
          const details = charge.chargeDetails as Record<string, unknown> | null
          return {
            id: charge.id,
            amount: Number(charge.totalCharges || 0),
            description: details?.notes || details?.description || 'Trip charge',
            chargeType: getChargeType(charge),
            status: charge.chargeStatus,
            createdAt: charge.createdAt.toISOString()
          }
        }),

        // Agreement fields
        agreementStatus: booking.agreementStatus || 'not_sent',
        agreementSentAt: booking.agreementSentAt?.toISOString() || null,
        agreementSignedAt: booking.agreementSignedAt?.toISOString() || null,
        agreementSignedPdfUrl: booking.agreementSignedPdfUrl || null,
        signerName: booking.signerName || null,

        // Handoff fields
        handoffStatus: booking.handoffStatus || null,
        guestGpsDistance: booking.guestGpsDistance || null,
        handoffAutoFallbackAt: booking.handoffAutoFallbackAt?.toISOString() || null,
        guestGpsVerifiedAt: booking.guestGpsVerifiedAt?.toISOString() || null,
        hostHandoffVerifiedAt: booking.hostHandoffVerifiedAt?.toISOString() || null,
        hostHandoffDistance: booking.hostHandoffDistance || null,
        keyInstructionsDeliveredAt: booking.keyInstructionsDeliveredAt?.toISOString() || null,

        // Live tracking fields
        guestLiveDistance: booking.guestLiveDistance || null,
        guestLiveUpdatedAt: booking.guestLiveUpdatedAt?.toISOString() || null,
        guestEtaMessage: booking.guestEtaMessage || null,
        guestArrivalSummary: booking.guestArrivalSummary || null,
        guestLocationTrust: booking.guestLocationTrust || null,

        // Reassignment / booking bridge fields
        originalBookingId: booking.originalBookingId || null,
        replacedByBookingId: booking.replacedByBookingId || null,
        vehicleAccepted: booking.vehicleAccepted || false,
        vehicleAcceptedAt: booking.vehicleAcceptedAt?.toISOString() || null,

        // Host post-trip final review
        hostFinalReviewStatus: booking.hostFinalReviewStatus || null,
        hostFinalReviewAt: booking.hostFinalReviewAt?.toISOString() || null,
        hostFinalReviewDeadline: booking.hostFinalReviewDeadline?.toISOString() || null,
        depositAmount: Number(booking.depositAmount) || 0,
        depositRefunded: booking.depositRefunded ? Number(booking.depositRefunded) : null,
        depositRefundedAt: booking.depositRefundedAt?.toISOString() || null,

        // Inspection photos (grouped by type)
        inspectionPhotosStart: (booking.InspectionPhoto || [])
          .filter((p: any) => p.type === 'start')
          .map((p: any) => ({ category: p.category, url: p.url })),
        inspectionPhotosEnd: (booking.InspectionPhoto || [])
          .filter((p: any) => p.type === 'end')
          .map((p: any) => ({ category: p.category, url: p.url })),

        // Onboarding fields
        onboardingCompletedAt: booking.onboardingCompletedAt?.toISOString() || null,
        licensePhotoUrl: booking.licensePhotoUrl || null,
        licenseBackPhotoUrl: booking.licenseBackPhotoUrl || null,
        guestStripeVerified: !!(booking.renter?.reviewerProfile?.stripeIdentityStatus === 'verified'),
        aiVerificationScore: booking.aiVerificationScore || null,

        // No-show fields
        tripStartedAt: booking.tripStartedAt?.toISOString() || null,
        noShowDeadline: booking.noShowDeadline?.toISOString() || null,
        noShowMarkedBy: booking.noShowMarkedBy || null,
        noShowMarkedAt: booking.noShowMarkedAt?.toISOString() || null,
        noShowFeeCharged: booking.noShowFeeCharged ? Number(booking.noShowFeeCharged) : null,
        noShowFeeStatus: booking.noShowFeeStatus || null,
        markedReadyAt: booking.markedReadyAt?.toISOString() || null,
        markedReadyBy: booking.markedReadyBy || null,

        // Reservation request link (for redirect when request stage is active)
        reservationRequestId: (booking as any).reservationRequest?.id || null,

        // Verification method (populated below)
        verificationMethod: null as string | null,
        verificationDate: null as string | null
      },

      // Renter details
      renter: booking.renter ? {
        id: booking.renter.id,
        name: booking.renter.name,
        email: booking.renter.email,
        phone: booking.renter.phone,
        photo: booking.renter.reviewerProfile?.profilePhotoUrl || booking.renter.image,
        memberSince: booking.renter.reviewerProfile?.memberSince?.toISOString() || booking.renter.createdAt?.toISOString(),
        reviewerProfileId: booking.renter.reviewerProfile?.id || null,

        // Verification
        verification: {
          identity: {
            status: booking.renter.reviewerProfile?.stripeIdentityStatus || 'not_started',
            verifiedAt: booking.renter.reviewerProfile?.stripeIdentityVerifiedAt?.toISOString() || null,
            verifiedName: booking.renter.reviewerProfile?.stripeVerifiedFirstName && booking.renter.reviewerProfile?.stripeVerifiedLastName
              ? `${booking.renter.reviewerProfile.stripeVerifiedFirstName} ${booking.renter.reviewerProfile.stripeVerifiedLastName}`
              : null,
            verifiedDOB: booking.renter.reviewerProfile?.stripeVerifiedDob?.toISOString() || null,
            verifiedAddress: booking.renter.reviewerProfile?.stripeVerifiedAddress || null
          },
          documents: {
            verified: booking.renter.reviewerProfile?.documentsVerified || false,
            verifiedAt: booking.renter.reviewerProfile?.documentVerifiedAt?.toISOString() || null,
            verifiedBy: booking.renter.reviewerProfile?.documentVerifiedBy || null,
          },
          manualVerification: {
            verified: booking.renter.reviewerProfile?.manuallyVerifiedByHost || false,
            verifiedAt: booking.renter.reviewerProfile?.manualVerificationDate?.toISOString() || null,
            verifiedByHostId: booking.renter.reviewerProfile?.manualVerificationHostId || null,
          },
          adminOverride: {
            isVerified: booking.renter.reviewerProfile?.isVerified || false,
            fullyVerified: booking.renter.reviewerProfile?.fullyVerified || false,
          },
          email: {
            verified: !!booking.renter.emailVerified,
            verifiedAt: null // emailVerified is boolean in User model
          },
          phone: {
            verified: booking.renter.phoneVerified || false
          }
        }
      } : null,

      // Vehicle details
      vehicle: booking.car ? {
        id: booking.car.id,
        make: booking.car.make,
        model: booking.car.model,
        year: booking.car.year,
        licensePlate: booking.car.licensePlate,
        vin: booking.car.vin,
        color: booking.car.color,
        photo: booking.car.photos?.[0]?.url || null,
        photos: booking.car.photos?.map((p: { url: string }) => p.url) || [],
        dailyRate: Number(booking.car.dailyRate),
        weeklyRate: booking.car.weeklyRate ? Number(booking.car.weeklyRate) : null,
        monthlyRate: booking.car.monthlyRate ? Number(booking.car.monthlyRate) : null,
        vehicleType: booking.car.vehicleType,
        carType: booking.car.carType,
        seats: booking.car.seats,
        currentMileage: booking.car.currentMileage,
        isActive: booking.car.isActive,
        instantBook: booking.car.instantBook,
        keyInstructions: booking.car.keyInstructions || null
      } : null,

      // Partner/Host details (using booking.host from query)
      partner: booking.host ? {
        id: booking.host.id,
        companyName: booking.host.partnerCompanyName,
        name: booking.host.name,
        email: booking.host.partnerSupportEmail || booking.host.email,
        phone: booking.host.partnerSupportPhone || booking.host.phone,
        address: null, // Not stored in schema
        city: booking.host.city,
        state: booking.host.state,
        zipCode: booking.host.zipCode,
        currentCommissionRate: booking.host.currentCommissionRate || 0.25,
        welcomeDiscountUsed: booking.host.welcomeDiscountUsed ?? false,
        stripeConnected: !!(booking.host.stripeConnectAccountId && booking.host.stripeChargesEnabled && booking.host.stripePayoutsEnabled)
      } : null,

      // Insurance status
      insurance: {
        hasVehicleInsurance,
        hasPartnerInsurance,
        vehicleProvider: vehicleInsurance?.provider || null,
        partnerProvider: partner.insurancePolicyNumber ? 'Partner Policy' : null,
        requiresGuestInsurance: !hasVehicleInsurance && !hasPartnerInsurance
      },

      // Guest insurance (from ReviewerProfile — guest-submitted)
      guestInsurance: booking.renter?.reviewerProfile ? {
        provided: !!(booking.renter.reviewerProfile.insuranceProvider && booking.renter.reviewerProfile.policyNumber),
        provider: booking.renter.reviewerProfile.insuranceProvider || null,
        policyNumber: booking.renter.reviewerProfile.policyNumber || null,
        verified: booking.renter.reviewerProfile.insuranceVerified || false,
        verifiedAt: booking.renter.reviewerProfile.insuranceVerifiedAt?.toISOString() || null,
        cardFrontUrl: booking.renter.reviewerProfile.insuranceCardFrontUrl || null,
        cardBackUrl: booking.renter.reviewerProfile.insuranceCardBackUrl || null,
        expiryDate: booking.renter.reviewerProfile.expiryDate?.toISOString() || null,
        coverageType: booking.renter.reviewerProfile.coverageType || null,
        addedAt: booking.renter.reviewerProfile.insuranceAddedAt?.toISOString() || null,
      } : null,

      // Guest history with this host (booking history + reviews)
      guestHistory: null as unknown, // populated below

      // Messages
      messages: (booking.messages || []).map((msg: any) => ({
        id: msg.id,
        senderId: msg.senderId,
        senderType: msg.senderType,
        senderName: msg.senderName,
        message: msg.message,
        isRead: msg.isRead,
        isUrgent: msg.isUrgent,
        hasAttachment: msg.hasAttachment,
        attachmentUrl: msg.attachmentUrl,
        attachmentName: msg.attachmentName,
        createdAt: msg.createdAt.toISOString()
      }))
    }

    // Count other active vehicles in host's fleet (for Change Vehicle gating)
    const fleetOtherActiveCount = await prisma.rentalCar.count({
      where: {
        hostId: partner.id,
        isActive: true,
        id: { not: booking.carId || '' }
      }
    })
    ;(response as Record<string, unknown>).fleetOtherActiveCount = fleetOtherActiveCount

    // Determine verification method for this booking
    if (booking.onboardingCompletedAt) {
      const aiVerification = await prisma.dLVerificationLog.findFirst({
        where: {
          OR: [
            { bookingId: bookingId },
            ...(booking.guestEmail ? [{ guestEmail: booking.guestEmail.toLowerCase() }] : [])
          ],
          passed: true
        },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true, frontImageUrl: true, backImageUrl: true }
      })

      if (aiVerification) {
        response.booking.verificationMethod = 'Claude AI'
        response.booking.verificationDate = aiVerification.createdAt.toISOString()
        // Fallback: populate DL photos from verification log if not on booking
        if (!response.booking.licensePhotoUrl && aiVerification.frontImageUrl) {
          response.booking.licensePhotoUrl = aiVerification.frontImageUrl
        }
        if (!response.booking.licenseBackPhotoUrl && aiVerification.backImageUrl) {
          response.booking.licenseBackPhotoUrl = aiVerification.backImageUrl
        }
      } else if (booking.renter?.reviewerProfile?.stripeIdentityStatus === 'verified') {
        response.booking.verificationMethod = 'Stripe Identity'
        response.booking.verificationDate = booking.renter.reviewerProfile.stripeIdentityVerifiedAt?.toISOString() || null
      }
    }

    // Fetch guest history if renter exists
    if (booking.renterId) {
      const [previousBookings, guestReviews] = await Promise.all([
        // All bookings by this guest with this host (excluding current)
        prisma.rentalBooking.findMany({
          where: {
            renterId: booking.renterId,
            hostId: partner.id,
            id: { not: bookingId }
          },
          select: {
            id: true,
            bookingCode: true,
            status: true,
            startDate: true,
            endDate: true,
            numberOfDays: true,
            totalAmount: true,
            createdAt: true,
            car: {
              select: {
                make: true,
                model: true,
                year: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        }),
        // Reviews left by this guest for this host
        prisma.rentalReview.findMany({
          where: {
            renterId: booking.renterId,
            hostId: partner.id,
            isVisible: true
          },
          select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
            createdAt: true,
            car: {
              select: {
                make: true,
                model: true,
                year: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      ])

      const totalSpent = previousBookings
        .filter(b => b.status === 'COMPLETED' || b.status === 'CONFIRMED' || b.status === 'ACTIVE')
        .reduce((sum, b) => sum + Number(b.totalAmount), 0) +
        (booking.status === 'COMPLETED' || booking.status === 'CONFIRMED' || booking.status === 'ACTIVE' ? Number(booking.totalAmount) : 0)

      response.guestHistory = {
        totalBookings: previousBookings.length + 1, // include current
        totalSpent,
        bookings: previousBookings.map(b => ({
          id: b.id,
          bookingCode: b.bookingCode,
          status: b.status,
          startDate: b.startDate.toISOString(),
          endDate: b.endDate.toISOString(),
          numberOfDays: b.numberOfDays,
          totalAmount: Number(b.totalAmount),
          createdAt: b.createdAt.toISOString(),
          vehicle: b.car ? `${b.car.year} ${b.car.make} ${b.car.model}` : 'Vehicle'
        })),
        reviews: guestReviews.map(r => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          createdAt: r.createdAt.toISOString(),
          vehicle: r.car ? `${r.car.year} ${r.car.make} ${r.car.model}` : 'Vehicle'
        }))
      }
    } else {
      response.guestHistory = {
        totalBookings: 1,
        totalSpent: Number(booking.totalAmount),
        bookings: [],
        reviews: []
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('[Get Booking] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
  }
}

// PUT - Update booking
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken(request)

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: bookingId } = await params
    const body = await request.json()

    // Verify booking belongs to partner
    const existingBooking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        hostId: partner.id
      }
    })

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const {
      startDate,
      endDate,
      startTime,
      endTime,
      pickupType,
      pickupLocation,
      notes,
      status,
      paymentStatus
    } = body

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (startDate) updateData.startDate = new Date(startDate)
    if (endDate) updateData.endDate = new Date(endDate)
    if (startTime) updateData.startTime = startTime
    if (endTime) updateData.endTime = endTime
    if (pickupType) updateData.pickupType = pickupType
    if (pickupLocation !== undefined) updateData.pickupLocation = pickupLocation
    if (notes !== undefined) updateData.notes = notes
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus

    // Recalculate days if dates changed
    if (startDate || endDate) {
      const start = new Date(startDate || existingBooking.startDate)
      const end = new Date(endDate || existingBooking.endDate)
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      updateData.numberOfDays = days

      // Recalculate totals
      const dailyRate = Number(existingBooking.dailyRate)
      const subtotal = dailyRate * days
      const serviceFee = Math.round(subtotal * 0.10 * 100) / 100
      const taxes = Math.round(subtotal * 0.08 * 100) / 100

      updateData.subtotal = subtotal
      updateData.serviceFee = serviceFee
      updateData.taxes = taxes
      updateData.totalAmount = subtotal + Number(existingBooking.deliveryFee) + serviceFee + taxes
    }

    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: updateData
    })

    console.log(`[Update Booking] Booking ${bookingId} updated by partner ${partner.id}`)

    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status
      },
      message: 'Booking updated successfully'
    })

  } catch (error) {
    console.error('[Update Booking] Error:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

// DELETE - Cancel booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken(request)

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: bookingId } = await params

    // Verify booking belongs to partner and get car details for email
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        hostId: partner.id
      },
      include: {
        car: {
          select: {
            make: true,
            model: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Cannot cancel completed or already cancelled bookings
    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: `Cannot cancel booking with status ${booking.status}` },
        { status: 400 }
      )
    }

    // Store original status before updating
    const wasConfirmed = booking.status === 'CONFIRMED'

    // Update to cancelled status
    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: 'HOST',
        notes: `${booking.notes || ''}\n\n[Cancelled by partner on ${new Date().toISOString()}]`
      }
    })

    console.log(`[Cancel Booking] Booking ${bookingId} cancelled by partner ${partner.id}`)

    // Auto-create refund request if booking was paid
    if (booking.paymentStatus === 'PAID' && booking.paymentIntentId) {
      try {
        await prisma.refundRequest.create({
          data: {
            id: crypto.randomUUID(),
            bookingId: booking.id,
            amount: booking.totalAmount,
            reason: 'Booking cancelled by host',
            requestedBy: partner.id,
            requestedByType: 'HOST',
            status: 'PENDING',
            updatedAt: new Date(),
          }
        })
        console.log(`[Cancel Booking] Auto-created refund request for booking ${bookingId}`)
      } catch (refundError) {
        console.error('[Cancel Booking] Failed to create refund request:', refundError)
      }
    }

    // Void Stripe authorization for PENDING bookings (payment was only held, not captured)
    if (booking.paymentStatus === 'AUTHORIZED' && booking.paymentIntentId) {
      try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
        await stripe.paymentIntents.cancel(booking.paymentIntentId)
        await prisma.rentalBooking.update({
          where: { id: bookingId },
          data: { paymentStatus: 'REFUNDED' }
        })
        console.log(`[Cancel Booking] Stripe auth voided for ${bookingId}`)
      } catch (stripeError: any) {
        console.error('[Cancel Booking] Failed to void Stripe auth:', stripeError?.message)
      }
    }

    // Send cancellation email to guest for ALL statuses (PENDING, CONFIRMED, etc.)
    let emailSent = false
    if (booking.guestEmail) {
      try {
        const formatDate = (date: Date) => {
          return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })
        }

        const isPending = !wasConfirmed
        const cancelRefId = generateEmailReference('CA')
        const emailData = {
          to: booking.guestEmail,
          guestName: booking.guestName || 'Valued Customer',
          bookingCode: booking.bookingCode,
          carMake: booking.car?.make || 'Vehicle',
          carModel: booking.car?.model || '',
          startDate: formatDate(booking.startDate),
          cancellationReason: isPending
            ? 'The host was unable to fulfill this reservation. No charges have been applied to your card.'
            : 'Cancelled by rental provider',
          refundAmount: booking.paymentStatus === 'PAID' ? booking.totalAmount.toFixed(2) : undefined,
          refundTimeframe: booking.paymentStatus === 'PAID' ? '5-7 business days'
            : isPending ? 'The hold on your card will be released within 1-3 business days' : undefined,
          referenceId: cancelRefId,
        }

        const template = getBookingCancelledTemplate(emailData)
        await sendEmail({
          to: booking.guestEmail,
          subject: template.subject,
          html: template.html,
          text: template.text
        })
        // Log email
        await logEmail({
          recipientEmail: booking.guestEmail,
          recipientName: booking.guestName || 'Guest',
          subject: template.subject,
          emailType: 'SYSTEM',
          relatedType: 'BOOKING',
          relatedId: bookingId,
          referenceId: cancelRefId,
        }).catch(() => {})
        emailSent = true
        console.log(`[Cancel Booking] Cancellation email sent to ${booking.guestEmail} (${cancelRefId})`)
      } catch (emailError) {
        console.error('[Cancel Booking] Failed to send cancellation email:', emailError)
      }
    }

    // Bell notification for guest
    try {
      const recipientId = booking.reviewerProfileId || booking.renterId
      if (recipientId) {
        await prisma.bookingNotification.create({
          data: {
            id: crypto.randomUUID(),
            bookingId,
            recipientType: 'GUEST',
            recipientId,
            userId: booking.renterId,
            type: 'BOOKING_CANCELLED',
            title: 'Booking Cancelled by Host',
            message: `Your booking ${booking.bookingCode} for the ${booking.car?.make || ''} ${booking.car?.model || ''} has been cancelled by the host. No charges applied.`,
            actionUrl: `/rentals/dashboard/bookings/${bookingId}`,
            priority: 'HIGH',
          }
        })
        console.log(`[Cancel Booking] Bell notification created for ${recipientId}`)
      }
    } catch (bellErr) {
      console.error('[Cancel Booking] Bell notification failed:', bellErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      emailSent,
      wasConfirmed
    })

  } catch (error) {
    console.error('[Cancel Booking] Error:', error)
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
  }
}
