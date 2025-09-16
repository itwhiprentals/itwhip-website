// app/sys-2847/fleet/api/upload/route.ts

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
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      )
    }

    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      return new Promise<string>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            folder: 'rental-cars',
            transformation: [
              { width: 1200, height: 800, crop: 'limit' },
              { quality: 'auto:good' }
            ]
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result!.secure_url)
          }
        ).end(buffer)
      })
    })

    const urls = await Promise.all(uploadPromises)

    return NextResponse.json({
      success: true,
      data: urls,
      message: `Uploaded ${urls.length} photos successfully`
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload photos' },
      { status: 500 }
    )
  }
}