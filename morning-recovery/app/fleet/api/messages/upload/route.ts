// app/fleet/api/messages/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Allowed file types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key')

    // Verify fleet authentication
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File type not allowed. Please upload images, PDFs, or documents.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    console.log('[MESSAGE UPLOAD] Uploading file:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)}KB`
    })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Determine resource type
    const isImage = file.type.startsWith('image/')
    const resourceType = isImage ? 'image' : 'raw'

    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadOptions: any = {
        resource_type: resourceType,
        folder: 'message-attachments',
        use_filename: true,
        unique_filename: true
      }

      // Add image transformations only for images
      if (isImage) {
        uploadOptions.transformation = [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      }

      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('[MESSAGE UPLOAD] Cloudinary error:', error)
            reject(error)
          } else {
            resolve(result)
          }
        }
      ).end(buffer)
    })

    console.log('[MESSAGE UPLOAD] ✅ File uploaded successfully:', uploadResult.secure_url)

    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        name: file.name,
        type: file.type,
        size: file.size,
        publicId: uploadResult.public_id
      }
    })
  } catch (error) {
    console.error('[MESSAGE UPLOAD] ❌ Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}