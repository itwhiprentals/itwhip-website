// app/api/guest/appeals/upload/route.ts
// Server-side Cloudinary upload for appeal evidence photos
import { NextRequest, NextResponse } from 'next/server'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function POST(request: NextRequest) {
  try {
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be under 10MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadResponse = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'guest-appeals',
          public_id: `appeal-${user.id}-${Date.now()}`,
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })

    return NextResponse.json({
      success: true,
      url: uploadResponse.secure_url
    })
  } catch (error) {
    console.error('Appeal evidence upload failed:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
