// app/api/rentals/bookings/[id]/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyJWT } from '@/lib/auth/jwt'
import { v2 as cloudinary } from 'cloudinary'

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

    // Get auth token if available
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')
    
    let userEmail = null
    let userId = null
    let isAdmin = false

    // Try to verify authenticated user
    if (token) {
      try {
        const payload = await verifyJWT(token)
        if (payload?.userId) {
          const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, email: true, role: true }
          })
          if (user) {
            userId = user.id
            userEmail = user.email
            isAdmin = user.role === 'ADMIN'
          }
        }
      } catch (error) {
        console.log('Auth verification failed, checking as guest')
      }
    }

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

    // Check authorization
    const isOwner = (userId && booking.renterId === userId) || 
                    (userEmail && booking.guestEmail === userEmail) ||
                    (!token && booking.guestEmail) // Allow guest access

    if (!isOwner && !isAdmin) {
      // For guest bookings, check header
      const guestEmail = request.headers.get('x-guest-email')
      if (!guestEmail || guestEmail !== booking.guestEmail) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
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
          senderId: userId || booking.guestEmail || 'guest',
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