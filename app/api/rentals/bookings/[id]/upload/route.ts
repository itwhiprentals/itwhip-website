// app/api/rentals/bookings/[id]/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { v2 as cloudinary } from 'cloudinary'
import { quickVerifyDriverLicense, compareNames, validateAge } from '@/app/lib/booking/ai/license-analyzer'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// POST /api/rentals/bookings/[id]/upload - Upload file for booking
export async function POST(
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

    const isAdmin = user.role === 'ADMIN'

    // Get booking to verify ownership
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        bookingCode: true,
        renterId: true,
        guestEmail: true,
        guestName: true,
        verificationStatus: true,
        car: {
          select: {
            make: true,
            model: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify ownership via JWT identity (no spoofable headers)
    const isOwner = (user.id && booking.renterId === user.id) ||
                    (user.email && booking.guestEmail === user.email)

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string | null // 'license-front' | 'license-back' | 'insurance'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'application/pdf'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images (JPEG, PNG, WebP) and PDFs are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Convert file to base64 for Cloudinary upload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    // Determine folder based on file purpose
    const isVerificationDoc = file.name.toLowerCase().includes('license') || 
                             file.name.toLowerCase().includes('id') ||
                             file.name.toLowerCase().includes('verification')
    
    const folder = isVerificationDoc 
      ? `rentals/${bookingId}/verification`
      : `rentals/${bookingId}/documents`

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(dataUri, {
      folder: folder,
      resource_type: 'auto',
      public_id: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, '')}`, // Remove extension
      transformation: file.type === 'application/pdf' 
        ? undefined // No transformation for PDFs
        : [
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
            { width: 2000, crop: 'limit' } // Max width 2000px for images
          ]
    })

    // Save URL to the appropriate booking field based on documentType
    if (documentType === 'license-front' || documentType === 'license-back' || documentType === 'insurance') {
      const fieldMap: Record<string, string> = {
        'license-front': 'licensePhotoUrl',
        'license-back': 'licenseBackPhotoUrl',
        'insurance': 'insurancePhotoUrl'
      }
      await prisma.rentalBooking.update({
        where: { id: bookingId },
        data: { [fieldMap[documentType]]: uploadResponse.secure_url }
      })
    }

    // Auto-trigger Claude AI verification when both license front and back are uploaded
    if (documentType === 'license-front' || documentType === 'license-back') {
      // Re-fetch to get current license URLs
      const updatedBooking = await prisma.rentalBooking.findUnique({
        where: { id: bookingId },
        select: {
          licensePhotoUrl: true,
          licenseBackPhotoUrl: true,
          guestName: true,
          licenseState: true,
          dateOfBirth: true,
        }
      })

      if (updatedBooking?.licensePhotoUrl && updatedBooking?.licenseBackPhotoUrl) {
        // Both sides uploaded — trigger AI verification asynchronously (non-blocking)
        triggerAIVerification(
          bookingId,
          updatedBooking.licensePhotoUrl,
          updatedBooking.licenseBackPhotoUrl,
          updatedBooking.guestName || undefined,
          updatedBooking.licenseState || undefined,
          updatedBooking.dateOfBirth ? updatedBooking.dateOfBirth.toISOString().split('T')[0] : undefined
        ).catch(err => {
          console.error('[Upload] AI verification background error:', err)
        })
      }
    }

    // If this is a verification document and booking needs verification, update status
    if (isVerificationDoc && booking.verificationStatus === 'PENDING') {
      await prisma.rentalBooking.update({
        where: { id: bookingId },
        data: {
          documentsSubmittedAt: new Date(),
          verificationStatus: 'SUBMITTED'
        }
      })

      // Create a system message about document upload
      await prisma.rentalMessage.create({
        data: {
          id: crypto.randomUUID(),
          bookingId,
          senderId: user.id || booking.guestEmail || 'guest',
          senderType: 'guest',
          message: `Uploaded verification document: ${file.name}`,
          isRead: false,
          updatedAt: new Date()
        }
      })

      // Send email notification to admin
      const { sendEmail } = await import('@/app/lib/email/sender')
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@itwhip.com'
      
      const emailSubject = `Verification Documents Uploaded - ${booking.bookingCode}`
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verification Documents Uploaded</h2>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Booking:</strong> ${booking.car.make} ${booking.car.model}</p>
            <p><strong>Booking Code:</strong> ${booking.bookingCode}</p>
            <p><strong>Guest:</strong> ${booking.guestName} (${booking.guestEmail})</p>
            <p><strong>Document:</strong> ${file.name}</p>
          </div>
          <div style="margin-top: 20px;">
            <a href="${uploadResponse.secure_url}" 
               style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">
              View Document
            </a>
            <a href="${process.env.NEXT_PUBLIC_URL}/admin/rentals/bookings/${bookingId}" 
               style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Review Booking
            </a>
          </div>
        </div>
      `
      const emailText = `Verification documents uploaded for booking ${booking.bookingCode}. View at: ${uploadResponse.secure_url}`

      sendEmail(adminEmail, emailSubject, emailHtml, emailText).catch(error => {
        console.error('Failed to send admin notification:', error)
      })
    }

    return NextResponse.json({
      success: true,
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      format: uploadResponse.format,
      size: uploadResponse.bytes,
      filename: file.name,
      isVerificationDoc
    })

  } catch (error) {
    console.error('Upload error:', error)
    
    // Check for specific Cloudinary errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid image file')) {
        return NextResponse.json(
          { error: 'Invalid or corrupted file' },
          { status: 400 }
        )
      }
      if (error.message.includes('File size too large')) {
        return NextResponse.json(
          { error: 'File size exceeds Cloudinary limits' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

/**
 * Background AI verification — runs after both license sides are uploaded.
 * Non-blocking: errors are logged but don't affect the upload response.
 */
async function triggerAIVerification(
  bookingId: string,
  frontUrl: string,
  backUrl: string,
  guestName?: string,
  licenseState?: string,
  dateOfBirth?: string
) {
  console.log(`[AI Verify] Starting for booking ${bookingId}`)
  const startTime = Date.now()

  try {
    const result = await quickVerifyDriverLicense(frontUrl, backUrl, {
      stateHint: licenseState,
      expectedName: guestName,
    })

    if (!result.success) {
      console.log(`[AI Verify] Failed for ${bookingId}: ${result.error}`)
      await prisma.rentalBooking.update({
        where: { id: bookingId },
        data: {
          aiVerificationResult: { success: false, error: result.error },
          aiVerificationScore: 0,
          aiVerificationAt: new Date(),
          aiVerificationModel: result.model || 'unknown',
        }
      })
      return
    }

    // Run name comparison if we have both names
    let nameMatch = true
    let nameComparison = null
    if (guestName && result.data?.fullName) {
      const comparison = compareNames(result.data.fullName, guestName)
      nameMatch = comparison.match
      nameComparison = comparison
    }

    // Age validation
    let ageValid = true
    if (result.data?.dateOfBirth) {
      ageValid = validateAge(result.data.dateOfBirth, 18)
    }

    // Build critical flags (only these block verification)
    const criticalFlags = [...(result.validation.criticalFlags || [])]
    if (!nameMatch) {
      criticalFlags.push(
        `Name mismatch: DL shows "${result.data?.fullName}", booking name is "${guestName}"`
      )
    }
    if (!ageValid) {
      criticalFlags.push('Driver must be at least 18 years old')
    }

    const quickVerifyPassed =
      result.confidence >= 70 &&
      !result.validation.isExpired &&
      criticalFlags.length === 0 &&
      (guestName ? nameMatch : true) &&
      ageValid

    // Store full analysis to DB (JSON.parse(JSON.stringify()) strips typed interfaces for Prisma InputJsonValue)
    const aiResult = JSON.parse(JSON.stringify({
      quickVerifyPassed,
      confidence: result.confidence,
      data: result.data,
      extractedFields: result.extractedFields,
      securityFeatures: result.securityFeatures,
      photoQuality: result.photoQuality,
      stateSpecificChecks: result.stateSpecificChecks,
      validation: {
        isExpired: result.validation.isExpired,
        isValid: result.validation.isValid,
        nameMatch,
        nameComparison,
        ageValid,
        criticalFlags,
        informationalFlags: result.validation.informationalFlags || [],
      },
    }))

    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        aiVerificationResult: aiResult,
        aiVerificationScore: result.confidence,
        aiVerificationAt: new Date(),
        aiVerificationModel: result.model || 'claude-sonnet-4-5',
      }
    })

    const elapsed = Date.now() - startTime
    console.log(`[AI Verify] Done for ${bookingId} in ${elapsed}ms — score: ${result.confidence}, passed: ${quickVerifyPassed}`)
  } catch (error) {
    console.error(`[AI Verify] Error for ${bookingId}:`, error)
    // Store error so admin can see it failed
    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        aiVerificationResult: {
          success: false,
          error: error instanceof Error ? error.message : 'AI verification failed',
        },
        aiVerificationScore: 0,
        aiVerificationAt: new Date(),
        aiVerificationModel: 'error',
      }
    }).catch(() => {}) // Don't throw if DB update also fails
  }
}