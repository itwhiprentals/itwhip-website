// app/api/agreements/[token]/sign/route.ts
// Submit signature and finalize the rental agreement

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { v2 as cloudinary } from 'cloudinary'
import { sendEmail } from '@/app/lib/email/send-email'
import {
  isTokenExpired,
  isValidTokenFormat,
  extractClientInfo
} from '@/app/lib/agreements/tokens'
import { generateAgreementPDF } from '@/app/lib/agreements/generator'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// POST - Submit signature
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Validate token format
    if (!isValidTokenFormat(token)) {
      return NextResponse.json(
        { error: 'Invalid agreement link' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { signatureImage, signerName, agreedToTerms } = body

    // Validate required fields
    if (!signatureImage) {
      return NextResponse.json(
        { error: 'Signature is required' },
        { status: 400 }
      )
    }

    if (!signerName || signerName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please enter your full legal name' },
        { status: 400 }
      )
    }

    if (!agreedToTerms) {
      return NextResponse.json(
        { error: 'You must agree to the terms and conditions' },
        { status: 400 }
      )
    }

    // Find booking by token
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        agreementToken: token
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
        host: {
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
            agreementTemplateCustom: true
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
      return NextResponse.json(
        { error: 'Agreement not found' },
        { status: 404 }
      )
    }

    // Check if already signed
    if (booking.agreementStatus === 'signed') {
      return NextResponse.json({
        status: 'already_signed',
        message: 'This agreement has already been signed',
        signedAt: booking.agreementSignedAt?.toISOString(),
        pdfUrl: booking.agreementSignedPdfUrl
      })
    }

    // Check if expired
    if (isTokenExpired(booking.agreementExpiresAt)) {
      return NextResponse.json({
        status: 'expired',
        message: 'This agreement link has expired. Please contact the rental provider for a new link.'
      }, { status: 410 })
    }

    // Extract client info for audit trail
    const { ipAddress, userAgent } = extractClientInfo(request)
    const signedAt = new Date()

    // Get custom clauses
    let customClauses: string[] = []
    if (booking.host?.agreementTemplateCustom) {
      const templateData = booking.host.agreementTemplateCustom as { customClauses?: string[] }
      customClauses = templateData.customClauses || []
    }

    // Generate signed PDF
    const pdfDataUrl = await generateAgreementPDF({
      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        startDate: booking.startDate,
        endDate: booking.endDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        numberOfDays: booking.numberOfDays,
        dailyRate: Number(booking.dailyRate),
        totalAmount: Number(booking.totalAmount),
        securityDeposit: Number(booking.securityDeposit),
        pickupLocation: booking.pickupLocation,
        pickupType: booking.pickupType
      },
      vehicle: booking.car ? {
        year: booking.car.year,
        make: booking.car.make,
        model: booking.car.model,
        vin: booking.car.vin || undefined,
        licensePlate: booking.car.licensePlate || undefined,
        color: booking.car.color || undefined
      } : {
        year: 0,
        make: 'Unknown',
        model: 'Vehicle'
      },
      partner: {
        companyName: booking.host?.partnerCompanyName || booking.host?.name || 'Rental Provider',
        name: booking.host?.name || 'Provider',
        email: booking.host?.partnerSupportEmail || booking.host?.email || '',
        phone: booking.host?.partnerSupportPhone || undefined,
        city: booking.host?.city || undefined,
        state: booking.host?.state || undefined,
        zipCode: booking.host?.zipCode || undefined
      },
      customer: {
        name: signerName.trim(),
        email: booking.renter?.email || booking.guestEmail || booking.signerEmail || '',
        phone: booking.renter?.phone || booking.guestPhone || undefined
      },
      customClauses,
      signature: {
        signatureImage,
        signerName: signerName.trim(),
        signedAt,
        ipAddress
      }
    })

    // Upload signed PDF to Cloudinary
    let signedPdfUrl: string | null = null
    try {
      // Extract base64 content from data URL (remove the data:application/pdf;... prefix)
      const base64Content = pdfDataUrl.split(',')[1]
      if (!base64Content) {
        throw new Error('Invalid PDF data URL')
      }

      // Convert base64 to buffer
      const pdfBuffer = Buffer.from(base64Content, 'base64')

      // Upload using upload_stream for binary data
      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `agreements/${booking.host?.id || 'general'}`,
            resource_type: 'raw',
            public_id: `agreement-${booking.bookingCode}-signed`,
            format: 'pdf'
          },
          (error, result) => {
            if (error) reject(error)
            else if (result) resolve(result)
            else reject(new Error('No result from upload'))
          }
        )
        uploadStream.end(pdfBuffer)
      })

      signedPdfUrl = uploadResult.secure_url
    } catch (uploadError) {
      console.error('[Agreement Sign] PDF upload error:', uploadError)
      // Continue without PDF - the signature is still valid
    }

    // Upload signature image separately for records
    let signatureUrl: string | null = null
    try {
      const sigUploadResult = await cloudinary.uploader.upload(signatureImage, {
        folder: `agreements/${booking.host?.id || 'general'}/signatures`,
        resource_type: 'image',
        public_id: `signature-${booking.bookingCode}`
      })
      signatureUrl = sigUploadResult.secure_url
    } catch (sigUploadError) {
      console.error('[Agreement Sign] Signature upload error:', sigUploadError)
    }

    // Update booking with signature information
    await prisma.rentalBooking.update({
      where: { id: booking.id },
      data: {
        agreementStatus: 'signed',
        agreementSignedAt: signedAt,
        agreementSignedPdfUrl: signedPdfUrl,
        signatureImageUrl: signatureUrl,
        signerName: signerName.trim(),
        signerEmail: booking.renter?.email || booking.guestEmail || booking.signerEmail,
        signerIpAddress: ipAddress,
        signerUserAgent: userAgent,
        // Invalidate the token by clearing expiry (single-use)
        agreementExpiresAt: signedAt
      }
    })

    // Send confirmation email to partner
    try {
      const partnerEmail = booking.host?.partnerSupportEmail || booking.host?.email
      if (partnerEmail) {
        const vehicleName = booking.car
          ? `${booking.car.year} ${booking.car.make} ${booking.car.model}`
          : 'Vehicle'

        await sendEmail({
          to: partnerEmail,
          subject: `Agreement Signed - ${signerName.trim()}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Agreement Signed!</h1>
              </div>

              <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                  Great news! <strong>${signerName.trim()}</strong> has signed the rental agreement.
                </p>

                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="color: #111827; font-size: 14px; margin: 0 0 10px 0;">
                    <strong>Booking:</strong> #${booking.bookingCode}
                  </p>
                  <p style="color: #111827; font-size: 14px; margin: 0 0 10px 0;">
                    <strong>Vehicle:</strong> ${vehicleName}
                  </p>
                  <p style="color: #111827; font-size: 14px; margin: 0 0 10px 0;">
                    <strong>Signed:</strong> ${signedAt.toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      timeZoneName: 'short'
                    })}
                  </p>
                  <p style="color: #6b7280; font-size: 12px; margin: 0;">
                    IP: ${ipAddress}
                  </p>
                </div>

                ${signedPdfUrl ? `
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${signedPdfUrl}"
                     style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Download Signed Agreement
                  </a>
                </div>
                ` : ''}

                <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  This is an automated notification from ItWhip.
                </p>
              </div>
            </div>
          `,
          text: `Agreement Signed!\n\n${signerName.trim()} has signed the rental agreement.\n\nBooking: #${booking.bookingCode}\nVehicle: ${vehicleName}\nSigned: ${signedAt.toISOString()}\nIP: ${ipAddress}\n\n${signedPdfUrl ? `Download: ${signedPdfUrl}` : ''}`
        })
      }
    } catch (emailError) {
      console.error('[Agreement Sign] Partner notification error:', emailError)
    }

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          action: 'AGREEMENT_SIGNED',
          entityType: 'BOOKING',
          entityId: booking.id,
          category: 'AGREEMENT',
          adminId: booking.host?.id || 'system',
          newValue: JSON.stringify({
            signerName: signerName.trim(),
            signedAt: signedAt.toISOString(),
            ipAddress,
            pdfUrl: signedPdfUrl
          })
        }
      })
    } catch {
      // Activity log is optional
    }

    return NextResponse.json({
      success: true,
      message: 'Agreement signed successfully',
      signedAt: signedAt.toISOString(),
      pdfUrl: signedPdfUrl
    })

  } catch (error) {
    console.error('[Agreement Sign] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process signature' },
      { status: 500 }
    )
  }
}
