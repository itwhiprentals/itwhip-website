// app/api/partner/bookings/send-review/route.ts
// Send booking review to customer - creates pre-booking and sends email

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/sender'
import crypto from 'crypto'

// Generate a cuid-like ID
function generateId(): string {
  return 'c' + crypto.randomBytes(12).toString('hex').slice(0, 24)
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    if (!partner || (partner.hostType !== 'FLEET_PARTNER' && partner.hostType !== 'PARTNER')) {
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
      carId,
      startDate,
      endDate,
      pickupType,
      pickupLocation,
      selectedAirport,
      notes,
      // Price breakdown
      priceBreakdown,
      insuranceOption
    } = body

    // Validate required fields
    if (!customerId || !carId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Customer, vehicle, start date, and end date are required' },
        { status: 400 }
      )
    }

    // Verify car belongs to partner
    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId: partner.id
      },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        dailyRate: true,
        weeklyRate: true,
        monthlyRate: true,
        vehicleType: true
      }
    })

    if (!car) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Verify customer exists
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const bookingStart = new Date(startDate)
    const bookingEnd = new Date(endDate)

    // Calculate trip duration
    const tripDays = Math.ceil((bookingEnd.getTime() - bookingStart.getTime()) / (1000 * 60 * 60 * 24))

    // Check for existing conflicts
    const conflicts = await prisma.rentalBooking.findFirst({
      where: {
        carId: carId,
        status: {
          in: ['CONFIRMED', 'ACTIVE', 'PENDING']
        },
        startDate: { lte: bookingEnd },
        endDate: { gte: bookingStart }
      }
    })

    if (conflicts) {
      return NextResponse.json(
        { error: 'Vehicle is not available for the selected dates' },
        { status: 409 }
      )
    }

    // Build pickup location string
    let fullPickupLocation = pickupLocation || ''
    if (pickupType === 'airport' && selectedAirport) {
      fullPickupLocation = `Airport Pickup: ${selectedAirport}`
    }

    // Create pre-booking with PENDING status
    const bookingId = generateId()
    const bookingCode = `BK-${generateId().slice(0, 8).toUpperCase()}`

    const booking = await prisma.rentalBooking.create({
      data: {
        id: bookingId,
        bookingCode: bookingCode,
        car: { connect: { id: carId } },
        host: { connect: { id: partner.id } },
        renter: { connect: { id: customerId } },
        guestEmail: customer.email,
        guestName: customer.name || 'Guest',
        startDate: bookingStart,
        endDate: bookingEnd,
        startTime: '10:00', // Default pickup time
        endTime: '10:00', // Default return time
        dailyRate: Number(car.dailyRate) || 0,
        numberOfDays: tripDays,
        subtotal: priceBreakdown?.rentalSubtotal || 0,
        deliveryFee: priceBreakdown?.deliveryFee || 0,
        insuranceFee: 0,
        serviceFee: priceBreakdown?.serviceFee || 0,
        taxes: priceBreakdown?.totalTaxes || 0,
        securityDeposit: 0,
        depositHeld: 0,
        totalAmount: priceBreakdown?.total || 0,
        status: 'PENDING', // Pre-booking awaiting customer review
        paymentStatus: 'PENDING',
        pickupType: pickupType === 'partner' ? 'PARTNER_LOCATION' :
                   pickupType === 'airport' ? 'AIRPORT' : 'DELIVERY',
        pickupLocation: fullPickupLocation || 'Partner Location',
        notes: notes ? `${notes}\n\n[Partner Manual Booking - Sent for customer review]` : '[Partner Manual Booking - Sent for customer review]',
        updatedAt: new Date()
      }
    })

    // Format dates for email
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(amount)
    }

    // Build price breakdown HTML
    const priceRows = priceBreakdown ? `
      <tr>
        <td style="padding: 8px 0; color: #666;">Base rental (${tripDays} ${tripDays === 1 ? 'day' : 'days'})</td>
        <td style="padding: 8px 0; text-align: right;">${formatCurrency(priceBreakdown.rentalSubtotal)}</td>
      </tr>
      ${priceBreakdown.deliveryFee > 0 ? `
      <tr>
        <td style="padding: 8px 0; color: #666;">${pickupType === 'airport' ? 'Airport pickup fee' : 'Delivery fee'}</td>
        <td style="padding: 8px 0; text-align: right;">${formatCurrency(priceBreakdown.deliveryFee)}</td>
      </tr>` : ''}
      <tr>
        <td style="padding: 8px 0; color: #666;">Service fee</td>
        <td style="padding: 8px 0; text-align: right;">${formatCurrency(priceBreakdown.serviceFee)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Taxes</td>
        <td style="padding: 8px 0; text-align: right;">${formatCurrency(priceBreakdown.totalTaxes)}</td>
      </tr>
      <tr style="border-top: 2px solid #333;">
        <td style="padding: 12px 0; font-weight: bold; font-size: 18px;">Total</td>
        <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 18px;">${formatCurrency(priceBreakdown.total)}</td>
      </tr>
    ` : ''

    // Insurance info
    const insuranceText = insuranceOption === 'vehicle' ? 'Vehicle insurance included' :
                         insuranceOption === 'partner' ? 'Covered by partner insurance' :
                         insuranceOption === 'guest' ? 'Guest to provide insurance' :
                         'No insurance coverage'

    // Send email to customer
    const customerName = customer.name || 'Customer'
    const partnerName = partner.partnerCompanyName || partner.partnerFirstName || 'Your rental partner'
    const vehicleName = `${car.year} ${car.make} ${car.model}`

    let emailSent = false

    // Build the email HTML
    const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

              <!-- Header -->
              <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 24px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Booking Review</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Please review your booking details</p>
              </div>

              <!-- Content -->
              <div style="padding: 24px;">
                <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
                  Hi ${customerName},
                </p>
                <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                  <strong>${partnerName}</strong> has prepared a booking for you. Please review the details below to make sure everything looks correct.
                </p>

                <!-- Vehicle Card -->
                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                  <h3 style="color: #333; margin: 0 0 12px 0; font-size: 18px;">Vehicle</h3>
                  <p style="color: #333; font-size: 16px; font-weight: 600; margin: 0;">${vehicleName}</p>
                  <p style="color: #666; font-size: 14px; margin: 4px 0 0 0;">${car.vehicleType || 'Standard'}</p>
                </div>

                <!-- Dates -->
                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                  <h3 style="color: #333; margin: 0 0 12px 0; font-size: 18px;">Trip Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 6px 0; color: #666;">Pickup</td>
                      <td style="padding: 6px 0; text-align: right; color: #333;">${formatDate(bookingStart)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #666;">Return</td>
                      <td style="padding: 6px 0; text-align: right; color: #333;">${formatDate(bookingEnd)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #666;">Duration</td>
                      <td style="padding: 6px 0; text-align: right; color: #333;">${tripDays} ${tripDays === 1 ? 'day' : 'days'}</td>
                    </tr>
                    ${fullPickupLocation ? `
                    <tr>
                      <td style="padding: 6px 0; color: #666;">Pickup Location</td>
                      <td style="padding: 6px 0; text-align: right; color: #333;">${fullPickupLocation}</td>
                    </tr>` : ''}
                  </table>
                </div>

                <!-- Price Breakdown -->
                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                  <h3 style="color: #333; margin: 0 0 12px 0; font-size: 18px;">Price Breakdown</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    ${priceRows}
                  </table>
                </div>

                <!-- Insurance Note -->
                <div style="background-color: #fff3cd; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
                  <p style="color: #856404; font-size: 14px; margin: 0;">
                    <strong>Insurance:</strong> ${insuranceText}
                  </p>
                </div>

                <!-- Notes -->
                ${notes ? `
                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                  <h3 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">Notes from Partner</h3>
                  <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.5;">${notes}</p>
                </div>` : ''}

                <!-- CTA -->
                <div style="text-align: center; margin: 32px 0 16px 0;">
                  <p style="color: #666; font-size: 14px; margin: 0 0 16px 0;">
                    If everything looks correct, please contact ${partnerName} to confirm your booking.
                  </p>
                  <p style="color: #999; font-size: 13px; margin: 0;">
                    Booking Reference: <strong>${booking.id.slice(0, 8).toUpperCase()}</strong>
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #f8f9fa; padding: 16px 24px; text-align: center; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  This email was sent by IT Whip Rentals on behalf of ${partnerName}
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `

    // Build plain text version
    const emailText = `
      Booking Review from ${partnerName}

      Hi ${customerName},

      ${partnerName} has prepared a booking for you. Please review the details below.

      Vehicle: ${vehicleName}

      Trip Details:
      - Pickup: ${formatDate(bookingStart)}
      - Return: ${formatDate(bookingEnd)}
      - Duration: ${tripDays} ${tripDays === 1 ? 'day' : 'days'}
      ${fullPickupLocation ? `- Pickup Location: ${fullPickupLocation}` : ''}

      Price: ${priceBreakdown ? formatCurrency(priceBreakdown.total) : 'Contact partner for pricing'}

      Insurance: ${insuranceText}
      ${notes ? `\nNotes from Partner:\n${notes}` : ''}

      Booking Reference: ${booking.id.slice(0, 8).toUpperCase()}

      If everything looks correct, please contact ${partnerName} to confirm your booking.

      This email was sent by IT Whip Rentals on behalf of ${partnerName}
    `

    // Send via SMTP using the existing email infrastructure
    try {
      const emailResult = await sendEmail(
        customer.email,
        `Booking Review: ${vehicleName} - ${formatDate(bookingStart)}`,
        emailHtml,
        emailText,
        { requestId: `send-review-${booking.id}` }
      )

      if (emailResult.success) {
        emailSent = true
        console.log(`[Send Review] Email sent to ${customer.email}, messageId: ${emailResult.messageId}`)
      } else {
        console.error(`[Send Review] Email failed: ${emailResult.error}`)
      }
    } catch (emailError) {
      console.error(`[Send Review] Email error:`, emailError)
    }

    console.log(`[Send Review] Pre-booking ${booking.id} created`)

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        status: 'PENDING',
        guestName: customerName,
        guestEmail: customer.email,
        vehicleName,
        startDate: bookingStart.toISOString(),
        endDate: bookingEnd.toISOString(),
        tripDays
      },
      emailSent,
      message: emailSent ? 'Booking review sent to customer' : 'Booking created but email failed to send'
    })

  } catch (error) {
    console.error('[Send Review] Error:', error)
    return NextResponse.json({ error: 'Failed to send booking review' }, { status: 500 })
  }
}
