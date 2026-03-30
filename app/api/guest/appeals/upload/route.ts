// app/api/guest/appeals/upload/route.ts
// Server-side S3 upload for appeal evidence photos
import { NextRequest, NextResponse } from 'next/server'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { uploadPrivateDocument, generateKey, getPrivateDocumentUrl } from '@/app/lib/storage/s3'

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

    // Upload to S3 (private — appeal evidence)
    const key = generateKey('claim', user.id, `appeal-${Date.now()}`)
    const s3Key = await uploadPrivateDocument(key, buffer, file.type)
    const presignedUrl = await getPrivateDocumentUrl(s3Key)

    return NextResponse.json({
      success: true,
      url: presignedUrl,
      key: s3Key
    })
  } catch (error) {
    console.error('Appeal evidence upload failed:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
