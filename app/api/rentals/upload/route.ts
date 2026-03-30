// app/api/rentals/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { uploadPrivateDocument, generateKey, getPrivateDocumentUrl } from '@/app/lib/storage/s3'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const bookingId = formData.get('bookingId') as string
    const token = formData.get('token') as string
    
    if (!file || !type) {
      return NextResponse.json(
        { error: 'Missing file or type' },
        { status: 400 }
      )
    }

    // Verify it's an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    // Convert to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to S3 (private — verification documents)
    const keyId = bookingId || `temp-${Date.now()}`
    const key = generateKey('dl', keyId, type)
    const s3Key = await uploadPrivateDocument(key, buffer, file.type)

    // If we have a bookingId, update the database
    if (bookingId) {
      // Verify token if provided (for post-booking uploads)
      if (token) {
        const tokenRecord = await prisma.guestAccessToken.findFirst({
          where: {
            token,
            bookingId,
            expiresAt: { gt: new Date() }
          }
        })

        if (!tokenRecord) {
          return NextResponse.json(
            { error: 'Invalid or expired token' },
            { status: 401 }
          )
        }
      }

      const updateData: any = {
        documentsSubmittedAt: new Date(),
        verificationStatus: 'submitted'
      }

      if (type === 'license') {
        updateData.licensePhotoUrl = s3Key
        updateData.licenseVerified = false
      } else if (type === 'insurance') {
        updateData.insurancePhotoUrl = s3Key
        updateData.selfieVerified = false
      }

      await prisma.rentalBooking.update({
        where: { id: bookingId },
        data: updateData
      })
    }

    // Return a pre-signed URL for immediate access
    const presignedUrl = await getPrivateDocumentUrl(s3Key)
    return NextResponse.json({
      success: true,
      url: presignedUrl,
      key: s3Key,
      message: 'Document uploaded successfully'
    })
    
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    )
  }
}