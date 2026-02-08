// app/api/guest/profile/insurance/route.ts
// ✅ GUEST INSURANCE API - Add/Update/Remove Insurance + Fetch History
// Handles: Current insurance + Complete audit trail

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// ============================================================================
// GET: Fetch current insurance + complete history
// ============================================================================
export async function GET(request: NextRequest) {
  try {
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
      },
      include: {
        insuranceHistory: {
          orderBy: { changedAt: 'desc' }
        }
      }
    })

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Determine current insurance status
    let currentStatus = 'NONE'
    if (profile.insuranceProvider && profile.policyNumber) {
      if (profile.expiryDate && new Date(profile.expiryDate) < new Date()) {
        currentStatus = 'EXPIRED'
      } else if (profile.insuranceVerified) {
        currentStatus = 'ACTIVE'
      } else {
        currentStatus = 'PENDING'
      }
    }

    // Calculate days until expiry
    let daysUntilExpiry = null
    if (profile.expiryDate && currentStatus !== 'EXPIRED') {
      const today = new Date()
      const expiry = new Date(profile.expiryDate)
      daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }

    return NextResponse.json({
      success: true,
      current: {
        provider: profile.insuranceProvider,
        policyNumber: profile.policyNumber,
        expiryDate: profile.expiryDate,
        hasRideshare: profile.hasRideshare,
        coverageType: profile.coverageType,
        customCoverage: profile.customCoverage,
        cardFrontUrl: profile.insuranceCardFrontUrl,
        cardBackUrl: profile.insuranceCardBackUrl,
        notes: profile.insuranceNotes,
        verified: profile.insuranceVerified,
        verifiedAt: profile.insuranceVerifiedAt,
        verifiedBy: profile.insuranceVerifiedBy,
        addedAt: profile.insuranceAddedAt,
        updatedAt: profile.insuranceUpdatedAt,
        status: currentStatus,
        daysUntilExpiry
      },
      history: profile.insuranceHistory.map(h => ({
        id: h.id,
        action: h.action,
        status: h.status,
        provider: h.insuranceProvider,
        policyNumber: h.policyNumber,
        expiryDate: h.expiryDate,
        hasRideshare: h.hasRideshare,
        coverageType: h.coverageType,
        customCoverage: h.customCoverage,
        cardFrontUrl: h.insuranceCardFrontUrl,
        cardBackUrl: h.insuranceCardBackUrl,
        notes: h.insuranceNotes,
        verificationStatus: h.verificationStatus,
        verifiedBy: h.verifiedBy,
        verifiedAt: h.verifiedAt,
        changedBy: h.changedBy,
        changedAt: h.changedAt,
        changeReason: h.changeReason
      }))
    })

  } catch (error) {
    console.error('Error fetching insurance:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch insurance' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST: Add new insurance (first time)
// ============================================================================
export async function POST(request: NextRequest) {
  try {
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

    // Check if insurance already exists
    if (profile.insuranceProvider && profile.policyNumber) {
      return NextResponse.json(
        { success: false, error: 'Insurance already exists. Use PATCH to update.' },
        { status: 400 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const provider = formData.get('provider') as string
    const policyNumber = formData.get('policyNumber') as string
    const expiryDate = formData.get('expiryDate') as string
    const hasRideshare = formData.get('hasRideshare') === 'true'
    const coverageType = formData.get('coverageType') as string
    const customCoverage = formData.get('customCoverage') as string | null
    const notes = formData.get('notes') as string | null
    const cardFrontFile = formData.get('cardFront') as File | null
    const cardBackFile = formData.get('cardBack') as File | null

    // Validate required fields
    if (!provider || !policyNumber || !expiryDate || !coverageType) {
      return NextResponse.json(
        { success: false, error: 'Provider, policy number, expiry date, and coverage type are required' },
        { status: 400 }
      )
    }

    if (!cardFrontFile || !cardBackFile) {
      return NextResponse.json(
        { success: false, error: 'Both front and back insurance card images are required' },
        { status: 400 }
      )
    }

    // Validate expiration date is in the future
    const expDate = new Date(expiryDate)
    if (expDate < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Insurance cannot be expired' },
        { status: 400 }
      )
    }

    // Upload front card
    const cardFrontUrl = await uploadToCloudinary(cardFrontFile, profile.id, 'front')
    
    // Upload back card
    const cardBackUrl = await uploadToCloudinary(cardBackFile, profile.id, 'back')

    const now = new Date()

    // Get IP and User Agent for audit
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Update profile with new insurance
    await prisma.reviewerProfile.update({
      where: { id: profile.id },
      data: {
        insuranceProvider: provider,
        policyNumber: policyNumber,
        expiryDate: expDate,
        hasRideshare: hasRideshare,
        coverageType: coverageType,
        customCoverage: customCoverage,
        insuranceCardFrontUrl: cardFrontUrl,
        insuranceCardBackUrl: cardBackUrl,
        insuranceNotes: notes,
        insuranceVerified: false, // Needs admin verification
        insuranceVerifiedAt: null,
        insuranceVerifiedBy: null,
        insuranceAddedAt: now,
        insuranceUpdatedAt: now
      }
    })

    // Create history entry
    await (prisma.insuranceHistory.create as any)({
      data: {
        reviewerProfileId: profile.id,
        action: 'ADDED',
        status: 'PENDING',
        insuranceProvider: provider,
        policyNumber: policyNumber,
        expiryDate: expDate,
        hasRideshare: hasRideshare,
        coverageType: coverageType,
        customCoverage: customCoverage,
        insuranceCardFrontUrl: cardFrontUrl,
        insuranceCardBackUrl: cardBackUrl,
        insuranceNotes: notes,
        verificationStatus: 'PENDING',
        changedBy: userId || userEmail || 'guest',
        changedAt: now,
        changeReason: 'Initial insurance submission',
        ipAddress: ipAddress,
        userAgent: userAgent
      }
    })

    // TODO: Send email notification to guest (confirmation)
    // TODO: Send notification to admin (new insurance to verify)

    return NextResponse.json({
      success: true,
      message: 'Insurance added successfully. We will verify it within 24-48 hours.',
      insurance: {
        provider,
        policyNumber,
        expiryDate,
        hasRideshare,
        coverageType,
        customCoverage,
        cardFrontUrl,
        cardBackUrl,
        verified: false
      }
    })

  } catch (error) {
    console.error('Error adding insurance:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add insurance' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH: Update existing insurance
// ============================================================================
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userEmail = user.email
    const userId = user.id

    // Find profile with current insurance
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

    // Check if insurance exists
    if (!profile.insuranceProvider || !profile.policyNumber) {
      return NextResponse.json(
        { success: false, error: 'No existing insurance found. Use POST to add new insurance.' },
        { status: 400 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const provider = formData.get('provider') as string
    const policyNumber = formData.get('policyNumber') as string
    const expiryDate = formData.get('expiryDate') as string
    const hasRideshare = formData.get('hasRideshare') === 'true'
    const coverageType = formData.get('coverageType') as string
    const customCoverage = formData.get('customCoverage') as string | null
    const notes = formData.get('notes') as string | null
    const cardFrontFile = formData.get('cardFront') as File | null
    const cardBackFile = formData.get('cardBack') as File | null

    // Validate required fields
    if (!provider || !policyNumber || !expiryDate || !coverageType) {
      return NextResponse.json(
        { success: false, error: 'Provider, policy number, expiry date, and coverage type are required' },
        { status: 400 }
      )
    }

    // Validate expiration date is in the future
    const expDate = new Date(expiryDate)
    if (expDate < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Insurance cannot be expired' },
        { status: 400 }
      )
    }

    // Upload new images if provided, otherwise keep existing
    let cardFrontUrl = profile.insuranceCardFrontUrl
    let cardBackUrl = profile.insuranceCardBackUrl

    if (cardFrontFile) {
      cardFrontUrl = await uploadToCloudinary(cardFrontFile, profile.id, 'front')
    }

    if (cardBackFile) {
      cardBackUrl = await uploadToCloudinary(cardBackFile, profile.id, 'back')
    }

    const now = new Date()

    // Get IP and User Agent for audit
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Mark old insurance as NOT_ACTIVE in history
    await (prisma.insuranceHistory.create as any)({
      data: {
        reviewerProfileId: profile.id,
        action: 'UPDATED',
        status: 'NOT_ACTIVE',
        insuranceProvider: profile.insuranceProvider,
        policyNumber: profile.policyNumber,
        expiryDate: profile.expiryDate,
        hasRideshare: profile.hasRideshare,
        coverageType: profile.coverageType,
        customCoverage: profile.customCoverage,
        insuranceCardFrontUrl: profile.insuranceCardFrontUrl,
        insuranceCardBackUrl: profile.insuranceCardBackUrl,
        insuranceNotes: profile.insuranceNotes,
        verificationStatus: profile.insuranceVerified ? 'VERIFIED' : 'UNVERIFIED',
        verifiedBy: profile.insuranceVerifiedBy,
        verifiedAt: profile.insuranceVerifiedAt,
        changedBy: userId || userEmail || 'guest',
        changedAt: now,
        changeReason: 'Replaced by new insurance',
        ipAddress: ipAddress,
        userAgent: userAgent
      }
    })

    // Update profile with new insurance
    await prisma.reviewerProfile.update({
      where: { id: profile.id },
      data: {
        insuranceProvider: provider,
        policyNumber: policyNumber,
        expiryDate: expDate,
        hasRideshare: hasRideshare,
        coverageType: coverageType,
        customCoverage: customCoverage,
        insuranceCardFrontUrl: cardFrontUrl,
        insuranceCardBackUrl: cardBackUrl,
        insuranceNotes: notes,
        insuranceVerified: false, // Needs re-verification
        insuranceVerifiedAt: null,
        insuranceVerifiedBy: null,
        insuranceUpdatedAt: now
      }
    })

    // Create new history entry for updated insurance
    await (prisma.insuranceHistory.create as any)({
      data: {
        reviewerProfileId: profile.id,
        action: 'UPDATED',
        status: 'PENDING',
        insuranceProvider: provider,
        policyNumber: policyNumber,
        expiryDate: expDate,
        hasRideshare: hasRideshare,
        coverageType: coverageType,
        customCoverage: customCoverage,
        insuranceCardFrontUrl: cardFrontUrl,
        insuranceCardBackUrl: cardBackUrl,
        insuranceNotes: notes,
        verificationStatus: 'PENDING',
        changedBy: userId || userEmail || 'guest',
        changedAt: now,
        changeReason: 'Insurance information updated',
        ipAddress: ipAddress,
        userAgent: userAgent
      }
    })

    // TODO: Send email notification to guest (confirmation)
    // TODO: Send notification to admin (updated insurance to verify)

    return NextResponse.json({
      success: true,
      message: 'Insurance updated successfully. We will verify it within 24-48 hours.'
    })

  } catch (error) {
    console.error('Error updating insurance:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update insurance' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE: Remove insurance (marks as NOT_ACTIVE in history)
// ============================================================================
export async function DELETE(request: NextRequest) {
  try {
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

    // Check if insurance exists
    if (!profile.insuranceProvider || !profile.policyNumber) {
      return NextResponse.json(
        { success: false, error: 'No insurance to remove' },
        { status: 400 }
      )
    }

    const now = new Date()

    // Get IP and User Agent for audit
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create history entry before removing
    await (prisma.insuranceHistory.create as any)({
      data: {
        reviewerProfileId: profile.id,
        action: 'REMOVED',
        status: 'NOT_ACTIVE',
        insuranceProvider: profile.insuranceProvider,
        policyNumber: profile.policyNumber,
        expiryDate: profile.expiryDate,
        hasRideshare: profile.hasRideshare,
        coverageType: profile.coverageType,
        customCoverage: profile.customCoverage,
        insuranceCardFrontUrl: profile.insuranceCardFrontUrl,
        insuranceCardBackUrl: profile.insuranceCardBackUrl,
        insuranceNotes: profile.insuranceNotes,
        verificationStatus: profile.insuranceVerified ? 'VERIFIED' : 'UNVERIFIED',
        verifiedBy: profile.insuranceVerifiedBy,
        verifiedAt: profile.insuranceVerifiedAt,
        changedBy: userId || userEmail || 'guest',
        changedAt: now,
        changeReason: 'Insurance removed by user',
        ipAddress: ipAddress,
        userAgent: userAgent
      }
    })

    // Remove insurance from profile
    await prisma.reviewerProfile.update({
      where: { id: profile.id },
      data: {
        insuranceProvider: null,
        policyNumber: null,
        expiryDate: null,
        hasRideshare: false,
        coverageType: null,
        customCoverage: null,
        insuranceCardFrontUrl: null,
        insuranceCardBackUrl: null,
        insuranceNotes: null,
        insuranceVerified: false,
        insuranceVerifiedAt: null,
        insuranceVerifiedBy: null,
        insuranceUpdatedAt: now
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Insurance removed successfully. Your deposit amount will increase on future bookings.'
    })

  } catch (error) {
    console.error('Error removing insurance:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove insurance' },
      { status: 500 }
    )
  }
}

// ============================================================================
// HELPER: Upload to Cloudinary
// ============================================================================
async function uploadToCloudinary(file: File, profileId: string, side: 'front' | 'back'): Promise<string> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Insurance card must be an image')
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File must be less than 10MB')
  }

  // Convert file to buffer
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Upload to Cloudinary
  const uploadResponse = await new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'guest-insurance',
        public_id: `guest-${profileId}-insurance-${side}-${Date.now()}`,
        transformation: [
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

  return uploadResponse.secure_url
}