// app/api/partner/bookings/create-manual/route.ts
// Single-submit manual booking creation — creates PENDING booking, sends agreement, notifies guest

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { generateAgreementToken, getTokenExpiryDate, generateSigningUrl } from '@/app/lib/agreements/tokens'
import { GuestTokenHandler } from '@/app/lib/auth/guest-tokens'
import { sendEmail } from '@/app/lib/email/send-email'
import { PaymentProcessor } from '@/app/lib/stripe/payment-processor'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'

// Tax rates (Arizona) — must match client-side pricing.ts
const TAX_RATES = {
  stateSalesTax: 0.056,
  countyTax: 0.007,
  cityTax: 0.023,
  rentalTax: 0.05,
  serviceFeePercent: 0.10,
}

const DELIVERY_FEES: Record<string, number> = {
  PARTNER_LOCATION: 0,
  partner: 0,
  DELIVERY: 35,
  delivery: 35,
  AIRPORT: 25,
  airport: 25,
}

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value
    || cookieStore.get('hostAccessToken')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    if (!partner || !['FLEET_PARTNER', 'PARTNER', 'EXTERNAL'].includes(partner.hostType || '')) {
      return null
    }

    return partner
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      customerId,
      guestInfo, // { name, email, phone } — guest-only, no User account
      carId,
      startDate,
      endDate,
      startTime = '10:00',
      endTime = '10:00',
      pickupType = 'PARTNER_LOCATION',
      pickupLocation,
      notes,
      insuranceOption = 'guest',
      guestInsurance,
      agreementType = 'ITWHIP',
      paymentMethod = 'cash',
    } = body

    // ─── Validate ─────────────────────────────────────────

    const hasCustomer = customerId || (guestInfo?.name && guestInfo?.email)
    if (!hasCustomer || !carId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Customer, vehicle, start date, and end date are required' },
        { status: 400 }
      )
    }

    if (!['ITWHIP', 'OWN', 'BOTH'].includes(agreementType)) {
      return NextResponse.json(
        { error: 'Invalid agreement type' },
        { status: 400 }
      )
    }

    // Verify car belongs to partner and is active/approved
    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId: partner.id,
      },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        dailyRate: true,
        weeklyRate: true,
        monthlyRate: true,
        minTripDuration: true,
        photos: true,
      }
    })

    if (!car) {
      return NextResponse.json({ error: 'Vehicle not found or does not belong to you' }, { status: 404 })
    }

    // ─── Resolve Customer ────────────────────────────────
    // Two paths: (1) customerId → existing User, or (2) guestInfo → guest-only booking

    let customer: { id: string | null; email: string; name: string; phone: string | null }
    let reviewerProfileId: string | null = null
    const isGuestOnly = !customerId && !!guestInfo

    if (customerId) {
      // Path 1: Existing user account
      const user = await prisma.user.findUnique({
        where: { id: customerId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          reviewerProfile: {
            select: { id: true }
          }
        }
      })

      if (!user) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }

      customer = { id: user.id, email: user.email || '', name: user.name || 'Guest', phone: user.phone || null }

      // Ensure ReviewerProfile exists (link or create)
      reviewerProfileId = user.reviewerProfile?.id || null
      if (!reviewerProfileId && user.email) {
        const existingProfile = await prisma.reviewerProfile.findFirst({
          where: { email: user.email }
        })
        if (existingProfile) {
          if (!existingProfile.userId) {
            await prisma.reviewerProfile.update({
              where: { id: existingProfile.id },
              data: { userId: user.id }
            })
          }
          reviewerProfileId = existingProfile.id
        } else {
          const newProfile = await prisma.reviewerProfile.create({
            data: {
              id: crypto.randomUUID().replace(/-/g, ''),
              email: user.email,
              name: user.name || 'Guest',
              phoneNumber: user.phone || null,
              userId: user.id,
              updatedAt: new Date(),
            }
          })
          reviewerProfileId = newProfile.id
        }
      }
    } else {
      // Path 2: Guest-only — no User account
      customer = {
        id: null,
        email: guestInfo.email.trim().toLowerCase(),
        name: guestInfo.name.trim(),
        phone: guestInfo.phone || null,
      }
    }

    // ─── Calculate Pricing ────────────────────────────────

    const bookingStart = new Date(startDate)
    const bookingEnd = new Date(endDate)
    const tripDays = Math.ceil((bookingEnd.getTime() - bookingStart.getTime()) / (1000 * 60 * 60 * 24))

    if (tripDays < 1) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
    }

    const dailyRate = Number(car.dailyRate) || 0
    const weeklyRate = Number(car.weeklyRate) || dailyRate * 6.5
    const monthlyRate = Number(car.monthlyRate) || dailyRate * 25

    let rentalSubtotal = 0
    if (tripDays >= 28) {
      rentalSubtotal = monthlyRate * Math.floor(tripDays / 28) + dailyRate * (tripDays % 28)
    } else if (tripDays >= 7) {
      rentalSubtotal = weeklyRate * Math.floor(tripDays / 7) + dailyRate * (tripDays % 7)
    } else {
      rentalSubtotal = dailyRate * tripDays
    }

    const deliveryFee = DELIVERY_FEES[pickupType] || 0
    const serviceFee = rentalSubtotal * TAX_RATES.serviceFeePercent
    const taxableAmount = rentalSubtotal + serviceFee
    const stateTax = taxableAmount * TAX_RATES.stateSalesTax
    const countyTax = taxableAmount * TAX_RATES.countyTax
    const cityTax = taxableAmount * TAX_RATES.cityTax
    const rentalTax = taxableAmount * TAX_RATES.rentalTax
    const totalTaxes = stateTax + countyTax + cityTax + rentalTax
    const totalAmount = rentalSubtotal + deliveryFee + serviceFee + totalTaxes

    // Platform fee: host's current commission rate
    const platformFeeRate = Number(partner.currentCommissionRate) || 0.25

    // ─── Check Conflicts ──────────────────────────────────

    const conflicts = await prisma.rentalBooking.findFirst({
      where: {
        carId,
        status: { in: ['CONFIRMED', 'ACTIVE', 'PENDING'] },
        startDate: { lte: bookingEnd },
        endDate: { gte: bookingStart },
      }
    })

    if (conflicts) {
      return NextResponse.json(
        { error: 'Vehicle is not available for the selected dates' },
        { status: 409 }
      )
    }

    // ─── Stripe Payment (platform payments only) ─────────

    let stripeCustomerId: string | null = null
    let stripePaymentIntentId: string | null = null
    let clientSecret: string | null = null

    if (paymentMethod === 'platform') {
      // Create or find Stripe Customer for the guest
      const stripeCustomer = await PaymentProcessor.createCustomer({
        email: customer.email,
        name: customer.name,
        phone: customer.phone || undefined,
        metadata: { source: 'manual_booking', hostId: partner.id }
      })
      stripeCustomerId = stripeCustomer.id

      // Create PaymentIntent (authorize only, capture later)
      const totalInCents = Math.round(totalAmount * 100)
      const bookingIdForPI = crypto.randomUUID()
      const paymentIntent = await PaymentProcessor.createPaymentIntent({
        customerId: stripeCustomerId,
        amount: totalInCents / 100, // PaymentProcessor expects dollars
        bookingId: bookingIdForPI,
        description: `${car.year} ${car.make} ${car.model} — Manual Booking by ${partner.name || 'Host'}`
      })
      stripePaymentIntentId = paymentIntent.id
      clientSecret = paymentIntent.client_secret
    }

    // ─── Create Booking ───────────────────────────────────

    const bookingId = crypto.randomUUID()
    const bookingCode = `BK-${Date.now().toString(36).toUpperCase()}`

    // Get host's own agreement URL if applicable
    let hostAgreementUrl: string | null = null
    if (agreementType === 'OWN' || agreementType === 'BOTH') {
      const prospect = await prisma.hostProspect.findFirst({
        where: { convertedHostId: partner.id },
        select: { hostAgreementUrl: true }
      })
      hostAgreementUrl = prospect?.hostAgreementUrl || null
    }

    // Generate agreement token
    const agreementToken = generateAgreementToken()
    const agreementExpiresAt = getTokenExpiryDate(7)

    const booking = await prisma.rentalBooking.create({
      data: {
        id: bookingId,
        bookingCode,
        updatedAt: new Date(),
        car: { connect: { id: carId } },
        host: { connect: { id: partner.id } },
        ...(customer.id ? { renter: { connect: { id: customer.id } } } : {}),
        ...(reviewerProfileId ? { reviewerProfile: { connect: { id: reviewerProfileId } } } : {}),
        guestEmail: customer.email || '',
        guestName: customer.name || 'Guest',
        guestPhone: customer.phone || null,
        startDate: bookingStart,
        endDate: bookingEnd,
        startTime,
        endTime,
        dailyRate,
        numberOfDays: tripDays,
        subtotal: rentalSubtotal,
        deliveryFee,
        insuranceFee: 0,
        serviceFee,
        taxes: totalTaxes,
        securityDeposit: 0,
        depositHeld: 0,
        totalAmount,
        status: 'PENDING',
        bookingType: 'MANUAL',
        paymentStatus: 'PENDING',
        paymentType: paymentMethod === 'cash' ? 'CASH' : 'CARD',
        ...(stripeCustomerId ? { stripeCustomerId } : {}),
        ...(stripePaymentIntentId ? { stripePaymentIntentId } : {}),
        pickupType: pickupType || 'PARTNER_LOCATION',
        pickupLocation: pickupLocation || 'Partner Location',
        platformFeeRate,
        paymentDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
        // Agreement
        agreementType,
        agreementToken,
        agreementStatus: 'sent',
        agreementSentAt: new Date(),
        agreementExpiresAt,
        signerEmail: customer.email || '',
        hostAgreementUrl,
        // Insurance
        insuranceSelection: insuranceOption === 'vehicle' ? 'VEHICLE' :
                            insuranceOption === 'partner' ? 'PARTNER' :
                            insuranceOption === 'guest' ? 'GUEST' : 'NONE',
        ...(insuranceOption === 'guest' && guestInsurance ? {
          guestInsuranceProvider: guestInsurance.provider || null,
          guestInsurancePolicyNumber: guestInsurance.policyNumber || null,
        } : {}),
        notes: notes ? `${notes}\n\n[Manual Booking]` : '[Manual Booking]',
      }
    })

    console.log(`[Create Manual Booking] Created ${bookingId} (${bookingCode}) for host ${partner.id}`)

    // ─── Send Agreement Email ─────────────────────────────

    const signingUrl = generateSigningUrl(agreementToken)
    const partnerName = partner.partnerCompanyName || partner.name || 'Your Host'
    const customerName = customer.name || 'Guest'
    const vehicleName = `${car.year} ${car.make} ${car.model}`
    const customerEmail = customer.email

    if (customerEmail) {
      try {
        await sendEmail({
          to: customerEmail,
          subject: `Please Sign Your Rental Agreement - ${partnerName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Rental Agreement Ready</h1>
              </div>
              <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">Hi ${customerName},</p>
                <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                  <strong>${partnerName}</strong> has created a booking for you and prepared your rental agreement:
                </p>
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="color: #111827; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">${vehicleName}</p>
                  <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    ${new Date(startDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    to ${new Date(endDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p style="color: #374151; font-size: 16px; margin: 10px 0 0 0;">
                    Total: <strong>$${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </p>
                </div>
                <p style="color: #374151; font-size: 16px; margin-bottom: 30px;">
                  Please review and sign the agreement to complete your booking.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${signingUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Review & Sign Agreement
                  </a>
                </div>
                <p style="color: #dc2626; font-size: 12px; margin-top: 20px;"><strong>This link expires in 7 days.</strong></p>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  If you have questions, contact ${partnerName} at ${partner.partnerSupportEmail || partner.email}.
                </p>
              </div>
              <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">Powered by <a href="https://itwhip.com" style="color: #f97316;">ItWhip</a></p>
              </div>
            </div>
          `,
          text: `Hi ${customerName},\n\n${partnerName} has created a booking for you.\n\n${vehicleName}\n${new Date(startDate + 'T12:00:00').toLocaleDateString()} - ${new Date(endDate + 'T12:00:00').toLocaleDateString()}\nTotal: $${totalAmount.toFixed(2)}\n\nReview and sign: ${signingUrl}\n\nThis link expires in 7 days.`
        })

        console.log(`[Create Manual Booking] Agreement email sent to ${customerEmail}`)
      } catch (emailErr) {
        console.error('[Create Manual Booking] Agreement email failed:', emailErr)
        // Non-blocking: booking is still created
      }

      // ─── Create Guest Auto-Login Token ──────────────────

      try {
        const guestAccessToken = await GuestTokenHandler.createGuestToken(bookingId, customerEmail)
        const autoLoginUrl = `${BASE_URL}/api/auth/guest-auto-login?token=${guestAccessToken}`

        // Send booking notification email with auto-login
        await sendEmail({
          to: customerEmail,
          subject: `Your ${vehicleName} Booking - ${partnerName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Booking Created!</h1>
              </div>
              <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">Hi ${customerName},</p>
                <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                  <strong>${partnerName}</strong> has created a booking for you. Here are the details:
                </p>
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="color: #6b7280; padding: 6px 0; font-size: 14px;">Vehicle</td><td style="color: #111827; font-weight: bold; text-align: right; padding: 6px 0; font-size: 14px;">${vehicleName}</td></tr>
                    <tr><td style="color: #6b7280; padding: 6px 0; font-size: 14px;">Pickup</td><td style="color: #111827; text-align: right; padding: 6px 0; font-size: 14px;">${new Date(startDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td></tr>
                    <tr><td style="color: #6b7280; padding: 6px 0; font-size: 14px;">Return</td><td style="color: #111827; text-align: right; padding: 6px 0; font-size: 14px;">${new Date(endDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td></tr>
                    <tr><td style="color: #6b7280; padding: 6px 0; font-size: 14px;">Duration</td><td style="color: #111827; text-align: right; padding: 6px 0; font-size: 14px;">${tripDays} days</td></tr>
                    <tr style="border-top: 1px solid #e5e7eb;"><td style="color: #111827; font-weight: bold; padding: 10px 0 6px; font-size: 16px;">Total</td><td style="color: #f97316; font-weight: bold; text-align: right; padding: 10px 0 6px; font-size: 16px;">$${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
                  </table>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${autoLoginUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
                    View My Booking
                  </a>
                </div>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  Booking Code: <strong>${bookingCode}</strong><br/>
                  If you have questions, contact ${partnerName} at ${partner.partnerSupportEmail || partner.email}.
                </p>
              </div>
              <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">Powered by <a href="https://itwhip.com" style="color: #f97316;">ItWhip</a></p>
              </div>
            </div>
          `,
          text: `Hi ${customerName},\n\n${partnerName} has created a booking for you.\n\nVehicle: ${vehicleName}\nPickup: ${new Date(startDate + 'T12:00:00').toLocaleDateString()}\nReturn: ${new Date(endDate + 'T12:00:00').toLocaleDateString()}\nDuration: ${tripDays} days\nTotal: $${totalAmount.toFixed(2)}\n\nView your booking: ${autoLoginUrl}\n\nBooking Code: ${bookingCode}`
        })

        console.log(`[Create Manual Booking] Guest notification email sent to ${customerEmail}`)
      } catch (guestErr) {
        console.error('[Create Manual Booking] Guest notification failed:', guestErr)
      }

      // ─── Send SMS ─────────────────────────────────────────

      if (customer.phone) {
        try {
          const { sendSms } = await import('@/app/lib/twilio/sms')
          const guestFirstName = customerName.split(' ')[0]
          await sendSms(
            customer.phone,
            `Hi ${guestFirstName}! ${partnerName} created a booking for you: ${vehicleName}, ${new Date(startDate + 'T12:00:00').toLocaleDateString()} - ${new Date(endDate + 'T12:00:00').toLocaleDateString()}. Check your email to sign the agreement and complete your booking.`,
            {
              type: 'SYSTEM',
              bookingId,
              hostId: partner.id,
              guestId: reviewerProfileId || undefined,
            }
          )
          console.log(`[Create Manual Booking] SMS sent to ${customer.phone}`)
        } catch (smsErr) {
          console.error('[Create Manual Booking] SMS failed:', smsErr)
        }
      }
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        status: booking.status,
      },
      ...(clientSecret ? { clientSecret } : {}),
    })

  } catch (error) {
    console.error('[Create Manual Booking] Error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
