// app/sys-2847/fleet/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { uploadPublicImage, generateKey } from '@/app/lib/storage/s3'

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

    const uploadPromises = files.map(async (file, index) => {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const key = generateKey('car', `fleet-${Date.now()}`, `${index}`)
      return await uploadPublicImage(key, buffer, file.type)
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