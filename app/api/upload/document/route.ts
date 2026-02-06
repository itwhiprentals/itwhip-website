// app/api/upload/document/route.ts
// Phase 14: Document upload endpoint for DL and selfie verification

import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'license' | 'selfie'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be under 10MB' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Determine folder based on type
    const folder = type === 'selfie'
      ? 'booking-verification/selfies'
      : 'booking-verification/licenses'

    // Upload to Cloudinary with appropriate settings
    const url = await new Promise<string>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder,
          transformation: [
            // Preserve quality for document verification
            { width: 1600, height: 1200, crop: 'limit' },
            { quality: 'auto:best' }
          ],
          // Add privacy-related tags
          tags: ['verification', 'sensitive', type || 'document']
        },
        (error, result) => {
          if (error) {
            console.error('[document-upload] Cloudinary error:', error)
            reject(error)
          } else if (result) {
            resolve(result.secure_url)
          } else {
            reject(new Error('Upload failed - no result'))
          }
        }
      ).end(buffer)
    })

    console.log(`[document-upload] Uploaded ${type} document: ${url}`)

    return NextResponse.json({
      success: true,
      url,
      type: type || 'document'
    })

  } catch (error: any) {
    console.error('[document-upload] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload document' },
      { status: 500 }
    )
  }
}
