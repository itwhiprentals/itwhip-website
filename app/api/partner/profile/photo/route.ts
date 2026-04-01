// app/api/partner/profile/photo/route.ts
// Upload/update partner profile photo

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { uploadPublicImage, generateKey } from '@/app/lib/storage/s3'

const JWT_SECRET = process.env.JWT_SECRET!

async function getCurrentHostId(request: NextRequest) {
  // Try Bearer token first (mobile app)
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const decoded = verify(authHeader.slice(7), JWT_SECRET) as any
      console.log('[Photo Upload] Bearer decoded:', { hostId: decoded.hostId, userId: decoded.userId, userType: decoded.userType })
      if (decoded.hostId) return decoded.hostId
    } catch (err: any) {
      console.error('[Photo Upload] Bearer verify failed:', err.message)
    }
  }
  // Fall back to cookies (web)
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value
    || cookieStore.get('hostAccessToken')?.value

  if (!token) return null

  try {
    const decoded = verify(token, JWT_SECRET) as { hostId?: string }
    return decoded.hostId || null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const hostId = await getCurrentHostId(request)
    if (!hostId) {
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

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be less than 5MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to S3 (public via CloudFront)
    const key = generateKey('host-profile', hostId)
    const photoUrl = await uploadPublicImage(key, buffer, file.type)

    // Update host profile photo
    await prisma.rentalHost.update({
      where: { id: hostId },
      data: { profilePhoto: photoUrl }
    })

    return NextResponse.json({
      success: true,
      url: photoUrl,
    })
  } catch (error) {
    console.error('[Partner Photo Upload] Error:', error)
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
  }
}
