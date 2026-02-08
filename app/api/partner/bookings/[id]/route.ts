// app/api/partner/bookings/[id]/route.ts
// Get, update, or delete a specific booking

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/send-email'
import { getBookingCancelledTemplate } from '@/app/lib/email/templates/booking-cancelled'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
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

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  // Accept both partner_token AND hostAccessToken for unified portal
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value

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
    const partner = await getPartnerFromToken()

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
                profilePhotoUrl: true
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
            isActive: true
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
            zipCode: true
          }
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
        signerName: booking.signerName || null
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
        isActive: booking.car.isActive
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
        zipCode: booking.host.zipCode
      } : null,

      // Insurance status
      insurance: {
        hasVehicleInsurance,
        hasPartnerInsurance,
        vehicleProvider: vehicleInsurance?.provider || null,
        partnerProvider: partner.insurancePolicyNumber ? 'Partner Policy' : null,
        requiresGuestInsurance: !hasVehicleInsurance && !hasPartnerInsurance
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
    const partner = await getPartnerFromToken()

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
    const partner = await getPartnerFromToken()

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

    // Send cancellation email ONLY if booking was CONFIRMED (not PENDING/Reserved)
    // PENDING bookings will naturally expire - no notification needed
    let emailSent = false
    if (wasConfirmed && booking.guestEmail) {
      try {
        const formatDate = (date: Date) => {
          return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })
        }

        const emailData = {
          to: booking.guestEmail,
          guestName: booking.guestName || 'Valued Customer',
          bookingCode: booking.bookingCode,
          carMake: booking.car?.make || 'Vehicle',
          carModel: booking.car?.model || '',
          startDate: formatDate(booking.startDate),
          cancellationReason: 'Cancelled by rental provider',
          // If payment was processed, show refund info
          refundAmount: booking.paymentStatus === 'PAID' ? booking.totalAmount.toFixed(2) : undefined,
          refundTimeframe: booking.paymentStatus === 'PAID' ? '5-7 business days' : undefined
        }

        const template = getBookingCancelledTemplate(emailData)
        await sendEmail({
          to: booking.guestEmail,
          subject: template.subject,
          html: template.html,
          text: template.text
        })
        emailSent = true
        console.log(`[Cancel Booking] Cancellation email sent to ${booking.guestEmail}`)
      } catch (emailError) {
        console.error('[Cancel Booking] Failed to send cancellation email:', emailError)
        // Don't fail the request if email fails
      }
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
