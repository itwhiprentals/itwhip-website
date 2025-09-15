// app/api/rentals/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

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
    
    // Always upload to Cloudinary, whether during booking or verification
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const publicId = bookingId 
        ? `${bookingId}_${type}_${Date.now()}`
        : `temp_${type}_${Date.now()}`
      
      cloudinary.uploader.upload_stream(
        {
          folder: 'itwhip/verifications',
          public_id: publicId,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

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
        updateData.licensePhotoUrl = uploadResult.secure_url
        updateData.licenseVerified = false
      } else if (type === 'insurance') {
        updateData.insurancePhotoUrl = uploadResult.secure_url
        updateData.selfieVerified = false
      }

      await prisma.rentalBooking.update({
        where: { id: bookingId },
        data: updateData
      })
    }

    // Always return the real Cloudinary URL
    return NextResponse.json({ 
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
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