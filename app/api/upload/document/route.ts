// app/api/upload/document/route.ts
// Phase 14: Document upload endpoint for DL and selfie verification

import { NextRequest, NextResponse } from 'next/server'
import { checkUploadIpRateLimit } from '@/app/lib/upload/rate-limiter'
import { uploadPrivateDocument, generateKey } from '@/app/lib/storage/s3'

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 uploads per hour per IP (public endpoint)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') || 'unknown'
    const { allowed } = await checkUploadIpRateLimit(ip)
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many uploads. Please try again later.' },
        { status: 429 }
      )
    }

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

    // Determine S3 key type based on document type
    const keyType = type === 'selfie' ? 'identity' : 'dl'
    const key = generateKey(keyType as any, `upload-${Date.now()}`, type || 'document')

    // Upload to S3 (private)
    const url = await uploadPrivateDocument(key, buffer, file.type)

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
