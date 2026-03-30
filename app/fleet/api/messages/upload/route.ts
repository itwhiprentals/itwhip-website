// app/fleet/api/messages/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { uploadPublicImage, generateKey } from '@/app/lib/storage/s3'

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

    // Upload to S3 (public — message attachments need to be viewable)
    const ext = file.name.split('.').pop() || ''
    const key = generateKey('message', `fleet-${Date.now()}`, ext ? `.${ext}` : undefined)
    const url = await uploadPublicImage(key, buffer, file.type)

    console.log('[MESSAGE UPLOAD] File uploaded successfully:', url)

    return NextResponse.json({
      success: true,
      data: {
        url,
        name: file.name,
        type: file.type,
        size: file.size,
        key
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