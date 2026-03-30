// app/api/guest/profile/photo/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { uploadPublicImage, generateKey } from '@/app/lib/storage/s3'

// POST: Upload profile photo
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userEmail = user.email
    const userId = user.id

    // Find profile
    const profile = await prisma.reviewerProfile.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(userEmail ? [{ email: userEmail }] : [])
        ]
      }
    })

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File must be less than 5MB' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to S3 (public via CloudFront)
    const key = generateKey('profile', profile.id)
    const photoUrl = await uploadPublicImage(key, buffer, file.type)

    // Update profile with new photo URL
    await prisma.reviewerProfile.update({
      where: { id: profile.id },
      data: { profilePhotoUrl: photoUrl }
    })

    // Also update User.avatar
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { avatar: photoUrl }
      })
    }

    return NextResponse.json({
      success: true,
      url: photoUrl,
      message: 'Profile photo updated successfully'
    })

  } catch (error) {
    console.error('Error uploading profile photo:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}