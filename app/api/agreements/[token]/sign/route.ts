// app/api/agreements/[token]/sign/route.ts
// Submit signature and finalize the rental agreement

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/app/lib/database/prisma'
import { v2 as cloudinary } from 'cloudinary'
import { sendEmail } from '@/app/lib/email/send-email'
import {
  isTokenExpired,
  isValidTokenFormat,
  extractClientInfo
} from '@/app/lib/agreements/tokens'
import { generateAgreementPDF } from '@/app/lib/agreements/generator'

// Generate a cuid-like ID
function generateId(): string {
  return 'c' + crypto.randomBytes(12).toString('hex').slice(0, 24)
}

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

    // ═══════════════════════════════════════════════════════════════
    // CHECK FOR TEST AGREEMENT TOKEN FIRST
    // ═══════════════════════════════════════════════════════════════
    const testProspect = await prisma.hostProspect.findFirst({
      where: {
        testAgreementToken: token,
        testAgreementExpiresAt: { gte: new Date() }
      },
      include: {
        convertedHost: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        request: {
          select: {
            vehicleInfo: true
          }
        }
      }
    })

    if (testProspect) {
      // This is a TEST agreement signing
      const signedAt = new Date()
      const { ipAddress } = extractClientInfo(request)

      // Update the prospect to mark test as signed
      await prisma.hostProspect.update({
        where: { id: testProspect.id },
        data: {
          testAgreementSignedAt: signedAt,
          lastActivityAt: signedAt
        }
      })

      // Log activity
      try {
        await prisma.activityLog.create({
          data: {
            id: generateId(),
            action: 'TEST_AGREEMENT_SIGNED',
            entityType: 'HOST_PROSPECT',
            entityId: testProspect.id,
            category: 'AGREEMENT',
            adminId: testProspect.convertedHost?.id || 'system',
            newValue: JSON.stringify({
              signerName: signerName.trim(),
              signedAt: signedAt.toISOString(),
              ipAddress,
              isTest: true
            })
          }
        })
      } catch {
        // Activity log is optional
      }

      console.log(`[Test Agreement Sign] Test signed by ${testProspect.convertedHost?.name || 'host'}`)

      return NextResponse.json({
        success: true,
        isTest: true,
        message: 'Test agreement signed successfully! This is what your guests will experience.',
        signedAt: signedAt.toISOString(),
        hostName: testProspect.convertedHost?.name,
        vehicleInfo: testProspect.request?.vehicleInfo
      })
    }

    // ═══════════════════════════════════════════════════════════════
    // REGULAR BOOKING AGREEMENT FLOW
    // ═══════════════════════════════════════════════════════════════

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
      // PDFs can be uploaded as 'image' type in Cloudinary for full support
      // Use folder + public_id structure, and format: 'pdf' to ensure correct handling
      const folder = `agreements/${booking.host?.id || 'general'}`
      const publicId = `agreement-${booking.bookingCode}-signed`

      // Fix jsPDF data URL format - remove the filename parameter that Cloudinary doesn't understand
      // jsPDF outputs: data:application/pdf;filename=generated.pdf;base64,...
      // Cloudinary expects: data:application/pdf;base64,...
      let cleanDataUrl = pdfDataUrl
      if (pdfDataUrl.includes(';filename=')) {
        cleanDataUrl = pdfDataUrl.replace(/;filename=[^;]+/, '')
      }

      console.log('[Agreement Sign] Uploading PDF to Cloudinary...')
      console.log('[Agreement Sign] Folder:', folder, 'Public ID:', publicId)
      console.log('[Agreement Sign] Data URL length:', cleanDataUrl.length)
      console.log('[Agreement Sign] Data URL prefix:', cleanDataUrl.substring(0, 50))

      const uploadResult = await cloudinary.uploader.upload(cleanDataUrl, {
        resource_type: 'image',
        folder: folder,
        public_id: publicId,
        format: 'pdf',
        overwrite: true,
        access_mode: 'public'
      })

      signedPdfUrl = uploadResult.secure_url
      console.log('[Agreement Sign] PDF uploaded successfully:', signedPdfUrl)
      console.log('[Agreement Sign] Upload result:', JSON.stringify(uploadResult, null, 2))
    } catch (uploadError: unknown) {
      const error = uploadError as Error & { http_code?: number; message?: string }
      console.error('[Agreement Sign] PDF upload error:', error.message || uploadError)
      console.error('[Agreement Sign] Error details:', JSON.stringify(uploadError, null, 2))
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

    // Build viewer URL for the signed agreement (on ItWhip domain)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'
    const viewerUrl = `${baseUrl}/agreements/view/${booking.id}`

    const vehicleName = booking.car
      ? `${booking.car.year} ${booking.car.make} ${booking.car.model}`
      : 'Vehicle'

    const formatSignedDate = signedAt.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    })

    // Send confirmation email to partner
    try {
      const partnerEmail = booking.host?.partnerSupportEmail || booking.host?.email
      if (partnerEmail) {
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
                    <strong>Signed:</strong> ${formatSignedDate}
                  </p>
                  <p style="color: #6b7280; font-size: 12px; margin: 0;">
                    IP: ${ipAddress}
                  </p>
                </div>

                <div style="text-align: center; margin: 20px 0;">
                  <a href="${viewerUrl}"
                     style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    View Signed Agreement
                  </a>
                </div>

                <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  This is an automated notification from ItWhip.
                </p>
              </div>
            </div>
          `,
          text: `Agreement Signed!\n\n${signerName.trim()} has signed the rental agreement.\n\nBooking: #${booking.bookingCode}\nVehicle: ${vehicleName}\nSigned: ${signedAt.toISOString()}\nIP: ${ipAddress}\n\nView Agreement: ${viewerUrl}`
        })
      }
    } catch (emailError) {
      console.error('[Agreement Sign] Partner notification error:', emailError)
    }

    // Send copy of signed agreement to guest
    try {
      const guestEmail = booking.renter?.email || booking.guestEmail || booking.signerEmail
      if (guestEmail) {
        const hostName = booking.host?.partnerCompanyName || booking.host?.name || 'your rental provider'

        await sendEmail({
          to: guestEmail,
          subject: `Your Signed Rental Agreement - ${vehicleName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Agreement Confirmed</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Your signed rental agreement</p>
              </div>

              <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                  Hi ${signerName.trim()},
                </p>

                <p style="color: #374151; font-size: 14px; margin-bottom: 20px;">
                  Thank you for signing the rental agreement. Please keep this email for your records.
                  A copy of your signed agreement is available below.
                </p>

                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <span style="background: #22c55e; width: 24px; height: 24px; border-radius: 50%; display: inline-block; text-align: center; line-height: 24px; color: white; font-size: 14px; margin-right: 10px;">✓</span>
                    <strong style="color: #166534;">Agreement Successfully Signed</strong>
                  </div>
                  <p style="color: #166534; font-size: 13px; margin: 0;">
                    Signed on ${formatSignedDate}
                  </p>
                </div>

                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="color: #111827; font-size: 14px; margin: 0 0 10px 0;">
                    <strong>Booking Code:</strong> #${booking.bookingCode}
                  </p>
                  <p style="color: #111827; font-size: 14px; margin: 0 0 10px 0;">
                    <strong>Vehicle:</strong> ${vehicleName}
                  </p>
                  <p style="color: #111827; font-size: 14px; margin: 0 0 10px 0;">
                    <strong>Rental Provider:</strong> ${hostName}
                  </p>
                  <p style="color: #111827; font-size: 14px; margin: 0;">
                    <strong>Pickup:</strong> ${booking.pickupLocation}
                  </p>
                </div>

                <div style="text-align: center; margin: 25px 0;">
                  <a href="${viewerUrl}"
                     style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">
                    View Your Signed Agreement
                  </a>
                </div>

                ${signedPdfUrl ? `
                <p style="text-align: center; margin-top: 15px;">
                  <a href="${signedPdfUrl}" style="color: #f97316; text-decoration: underline; font-size: 13px;">
                    Or download the PDF directly
                  </a>
                </p>
                ` : ''}

                <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; margin-top: 25px;">
                  <p style="color: #92400e; font-size: 13px; margin: 0;">
                    <strong>Important:</strong> Please review the terms and conditions in your agreement.
                    Contact ${hostName} if you have any questions before your rental begins.
                  </p>
                </div>

                <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                  This is your official copy of the signed rental agreement.<br>
                  Powered by ItWhip - The trusted car rental marketplace
                </p>
              </div>
            </div>
          `,
          text: `Agreement Confirmed\n\nHi ${signerName.trim()},\n\nThank you for signing the rental agreement. Please keep this email for your records.\n\nBooking Code: #${booking.bookingCode}\nVehicle: ${vehicleName}\nRental Provider: ${hostName}\nSigned: ${formatSignedDate}\n\nView your signed agreement: ${viewerUrl}\n\n${signedPdfUrl ? `Download PDF: ${signedPdfUrl}` : ''}\n\nPlease review the terms and conditions in your agreement. Contact ${hostName} if you have any questions.\n\nPowered by ItWhip - The trusted car rental marketplace`
        })
        console.log(`[Agreement Sign] Guest confirmation email sent to ${guestEmail}`)
      }
    } catch (guestEmailError) {
      console.error('[Agreement Sign] Guest notification error:', guestEmailError)
    }

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          id: generateId(),
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
      pdfUrl: signedPdfUrl,
      viewerUrl,
      bookingId: booking.id
    })

  } catch (error) {
    console.error('[Agreement Sign] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process signature' },
      { status: 500 }
    )
  }
}
