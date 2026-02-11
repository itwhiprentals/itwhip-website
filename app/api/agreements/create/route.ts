// app/api/agreements/create/route.ts
// Create a rental agreement and send signing link to customer

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import crypto from 'crypto'
import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/send-email'
import {
  generateAgreementToken,
  getTokenExpiryDate,
  generateSigningUrl
} from '@/app/lib/agreements/tokens'

// Generate a cuid-like ID
function generateId(): string {
  return 'c' + crypto.randomBytes(12).toString('hex').slice(0, 24)
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

// Get partner from token
async function getPartner() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('host_access_token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        name: true,
        email: true,
        partnerCompanyName: true,
        partnerSupportEmail: true,
        partnerSupportPhone: true,
        city: true,
        state: true,
        zipCode: true,
        agreementTemplateCustom: true,
        hostType: true,
        active: true
      }
    })

    return host
  } catch {
    return null
  }
}

// POST - Create agreement and send signing link
export async function POST(request: NextRequest) {
  try {
    const partner = await getPartner()
    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Fetch the booking with all required details
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        hostId: partner.id
      },
      include: {
        car: {
          select: {
            year: true,
            make: true,
            model: true,
            vin: true,
            licensePlate: true,
            color: true
          }
        },
        renter: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if already signed
    if (booking.agreementStatus === 'signed') {
      return NextResponse.json({
        status: 'already_signed',
        message: 'This agreement has already been signed',
        signedAt: booking.agreementSignedAt,
        pdfUrl: booking.agreementSignedPdfUrl
      })
    }

    // Get customer email (from renter or guest fields)
    const customerEmail = booking.renter?.email || booking.guestEmail
    const customerName = booking.renter?.name || booking.guestName || 'Customer'

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'No customer email found for this booking' },
        { status: 400 }
      )
    }

    // Generate new token or reuse existing if not expired
    let agreementToken = booking.agreementToken
    let expiresAt = booking.agreementExpiresAt

    const needsNewToken = !agreementToken ||
      !expiresAt ||
      new Date() > new Date(expiresAt)

    if (needsNewToken) {
      agreementToken = generateAgreementToken()
      expiresAt = getTokenExpiryDate(7)
    }

    // Update booking with agreement info
    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        agreementToken,
        agreementStatus: 'sent',
        agreementSentAt: new Date(),
        agreementExpiresAt: expiresAt,
        signerEmail: customerEmail
      }
    })

    // Generate signing URL
    const signingUrl = generateSigningUrl(agreementToken!)

    // Send email to customer
    let emailSent = false
    try {
      const partnerName = partner.partnerCompanyName || partner.name
      const vehicleName = `${booking.car?.year} ${booking.car?.make} ${booking.car?.model}`

      await sendEmail({
        to: customerEmail,
        subject: `Please Sign Your Rental Agreement - ${partnerName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Rental Agreement Ready</h1>
            </div>

            <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                Hi ${customerName},
              </p>

              <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                <strong>${partnerName}</strong> has prepared your rental agreement for the following vehicle:
              </p>

              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #111827; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">
                  ${vehicleName}
                </p>
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  ${new Date(booking.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  to
                  ${new Date(booking.endDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p style="color: #374151; font-size: 16px; margin: 10px 0 0 0;">
                  Total: <strong>$${Number(booking.totalAmount).toFixed(2)}</strong>
                </p>
              </div>

              <p style="color: #374151; font-size: 16px; margin-bottom: 30px;">
                Please review and sign the agreement to confirm your booking.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${signingUrl}"
                   style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Review & Sign Agreement
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                <strong>What you'll need:</strong>
              </p>
              <ul style="color: #6b7280; font-size: 14px; padding-left: 20px;">
                <li>A few minutes to review the terms</li>
                <li>Your finger or mouse to sign</li>
              </ul>

              <p style="color: #dc2626; font-size: 12px; margin-top: 20px;">
                <strong>This link expires in 7 days.</strong>
              </p>

              <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                This is a legally binding document. By signing, you agree to the rental terms and conditions.
              </p>

              <p style="color: #9ca3af; font-size: 12px;">
                If you have questions, contact ${partnerName} at ${partner.partnerSupportEmail || partner.email}.
              </p>
            </div>

            <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Powered by <a href="https://itwhip.com" style="color: #f97316;">ItWhip</a> - The trusted car rental marketplace
              </p>
            </div>
          </div>
        `,
        text: `Hi ${customerName},\n\n${partnerName} has prepared your rental agreement for:\n\n${vehicleName}\n${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}\nTotal: $${Number(booking.totalAmount).toFixed(2)}\n\nPlease review and sign your agreement:\n${signingUrl}\n\nThis link expires in 7 days.\n\nIf you have questions, contact ${partnerName} at ${partner.partnerSupportEmail || partner.email}.\n\nPowered by ItWhip`
      })
      emailSent = true
      console.log(`[Agreement] Email sent to ${customerEmail}`)
    } catch (emailError) {
      console.error('[Agreement] Email send error:', emailError)
    }

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          id: generateId(),
          action: 'AGREEMENT_SENT',
          entityType: 'BOOKING',
          entityId: bookingId,
          category: 'AGREEMENT',
          adminId: partner.id,
          newValue: JSON.stringify({
            customerEmail,
            signingUrl,
            emailSent
          })
        }
      })
    } catch {
      // Activity log is optional
    }

    return NextResponse.json({
      success: true,
      token: agreementToken,
      signingUrl,
      emailSent,
      expiresAt,
      message: emailSent
        ? `Agreement sent to ${customerEmail}`
        : `Agreement link generated. Share this URL with the customer: ${signingUrl}`
    })

  } catch (error) {
    console.error('[Agreement Create] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create agreement' },
      { status: 500 }
    )
  }
}
