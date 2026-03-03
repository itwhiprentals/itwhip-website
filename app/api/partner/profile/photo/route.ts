// app/api/partner/profile/photo/route.ts
// Upload/update partner profile photo

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'

const JWT_SECRET = process.env.JWT_SECRET!

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

async function getCurrentHostId() {
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
    const hostId = await getCurrentHostId()
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

    // Upload to Cloudinary with face-aware cropping
    const uploadResponse = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'host-profiles',
          public_id: `host-${hostId}-${Date.now()}`,
          transformation: [
            { width: 500, height: 500, crop: 'fill', gravity: 'face' },
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

    const photoUrl = uploadResponse.secure_url

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
