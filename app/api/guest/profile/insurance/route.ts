// app/api/guest/profile/insurance/route.ts
// ✅ COMPLETE FIXED VERSION - Insurance on ReviewerProfile + History relation fix

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// GET - Fetch current insurance and history
export async function GET(req: NextRequest) {
  try {
    const user = await verifyRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.reviewerProfile.findUnique({
      where: { userId: user.userId },
      select: {
        id: true,
        userId: true,
        insuranceProvider: true,
        policyNumber: true,
        expiryDate: true,
        hasRideshare: true,
        coverageType: true,
        customCoverage: true,
        insuranceCardFrontUrl: true,
        insuranceCardBackUrl: true,
        insuranceNotes: true,
        insuranceVerified: true,
        insuranceVerifiedAt: true,
        insuranceVerifiedBy: true,
        insuranceAddedAt: true,
        insuranceUpdatedAt: true
      }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    let status = 'NOT_ACTIVE'
    let daysUntilExpiry = null

    if (profile.insuranceProvider && profile.policyNumber) {
      if (profile.expiryDate) {
        const expiryDate = new Date(profile.expiryDate)
        const today = new Date()
        const diffTime = expiryDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 0) {
          status = 'EXPIRED'
        } else {
          daysUntilExpiry = diffDays
          status = profile.insuranceVerified ? 'ACTIVE' : 'PENDING'
        }
      } else {
        status = profile.insuranceVerified ? 'ACTIVE' : 'PENDING'
      }
    }

    const currentInsurance = {
      provider: profile.insuranceProvider,
      policyNumber: profile.policyNumber,
      expiryDate: profile.expiryDate?.toISOString() || null,
      hasRideshare: profile.hasRideshare || false,
      coverageType: profile.coverageType,
      customCoverage: profile.customCoverage,
      cardFrontUrl: profile.insuranceCardFrontUrl,
      cardBackUrl: profile.insuranceCardBackUrl,
      notes: profile.insuranceNotes,
      verified: profile.insuranceVerified || false,
      verifiedAt: profile.insuranceVerifiedAt?.toISOString() || null,
      verifiedBy: profile.insuranceVerifiedBy,
      addedAt: profile.insuranceAddedAt?.toISOString() || null,
      updatedAt: profile.insuranceUpdatedAt?.toISOString() || null,
      status,
      daysUntilExpiry
    }

    const history = await prisma.insuranceHistory.findMany({
      where: { reviewerProfileId: profile.id },
      orderBy: { changedAt: 'desc' }
    })

    return NextResponse.json({
      current: currentInsurance,
      history: history.map(h => ({
        id: h.id,
        action: h.action,
        status: h.status,
        provider: h.provider,
        policyNumber: h.policyNumber,
        expiryDate: h.expiryDate?.toISOString() || null,
        hasRideshare: h.hasRideshare,
        coverageType: h.coverageType,
        customCoverage: h.customCoverage,
        cardFrontUrl: h.cardFrontUrl,
        cardBackUrl: h.cardBackUrl,
        notes: h.notes,
        verificationStatus: h.verificationStatus,
        verifiedBy: h.verifiedBy,
        verifiedAt: h.verifiedAt?.toISOString() || null,
        changedBy: h.changedBy,
        changedAt: h.changedAt.toISOString(),
        changeReason: h.changeReason
      }))
    })

  } catch (error) {
    console.error('Error fetching insurance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insurance data' },
      { status: 500 }
    )
  }
}

// POST - Add new insurance
export async function POST(req: NextRequest) {
  try {
    const user = await verifyRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRecord = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { id: true, name: true, email: true }
    })

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const profile = await prisma.reviewerProfile.findUnique({
      where: { userId: user.userId },
      select: { id: true }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const formData = await req.formData()
    const provider = formData.get('provider') as string
    const policyNumber = formData.get('policyNumber') as string
    const expiryDate = formData.get('expiryDate') as string
    const hasRideshare = formData.get('hasRideshare') === 'true'
    const coverageType = formData.get('coverageType') as string
    const customCoverage = formData.get('customCoverage') as string | null
    const notes = formData.get('notes') as string | null
    const cardFrontFile = formData.get('cardFront') as File | null
    const cardBackFile = formData.get('cardBack') as File | null

    if (!provider || !policyNumber || !expiryDate || !coverageType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!cardFrontFile || !cardBackFile) {
      return NextResponse.json(
        { error: 'Both front and back card images are required' },
        { status: 400 }
      )
    }

    // Upload front card
    const cardFrontBuffer = Buffer.from(await cardFrontFile.arrayBuffer())
    const cardFrontBase64 = cardFrontBuffer.toString('base64')
    const cardFrontDataUri = `data:${cardFrontFile.type};base64,${cardFrontBase64}`

    const frontUploadResult = await cloudinary.uploader.upload(cardFrontDataUri, {
      folder: 'insurance-cards',
      public_id: `${user.userId}-front-${Date.now()}`,
      resource_type: 'image'
    })

    // Upload back card
    const cardBackBuffer = Buffer.from(await cardBackFile.arrayBuffer())
    const cardBackBase64 = cardBackBuffer.toString('base64')
    const cardBackDataUri = `data:${cardBackFile.type};base64,${cardBackBase64}`

    const backUploadResult = await cloudinary.uploader.upload(cardBackDataUri, {
      folder: 'insurance-cards',
      public_id: `${user.userId}-back-${Date.now()}`,
      resource_type: 'image'
    })

    // Update ReviewerProfile
    await prisma.reviewerProfile.update({
      where: { id: profile.id },
      data: {
        insuranceProvider: provider,
        policyNumber: policyNumber,
        expiryDate: new Date(expiryDate),
        hasRideshare: hasRideshare,
        coverageType: coverageType,
        customCoverage: coverageType === 'custom' ? customCoverage : null,
        insuranceCardFrontUrl: frontUploadResult.secure_url,
        insuranceCardBackUrl: backUploadResult.secure_url,
        insuranceNotes: notes,
        insuranceVerified: false,
        insuranceAddedAt: new Date(),
        insuranceUpdatedAt: new Date()
      }
    })

    // Create history entry - CONNECT TO REVIEWERPROFILE
    await prisma.insuranceHistory.create({
      data: {
        reviewerProfile: {
          connect: { id: profile.id }
        },
        action: 'ADDED',
        status: 'PENDING',
        insuranceProvider: provider,
        policyNumber,
        expiryDate: new Date(expiryDate),
        hasRideshare,
        coverageType,
        customCoverage: coverageType === 'custom' ? customCoverage : null,
        insuranceCardFrontUrl: frontUploadResult.secure_url,
        insuranceCardBackUrl: backUploadResult.secure_url,
        insuranceNotes: notes,
        verificationStatus: 'UNVERIFIED',
        changedBy: userRecord.name || userRecord.email,
        changeReason: 'Initial insurance submission'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Insurance added successfully'
    })

  } catch (error) {
    console.error('Error adding insurance:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add insurance' },
      { status: 500 }
    )
  }
}

// PATCH - Update existing insurance
export async function PATCH(req: NextRequest) {
  try {
    const user = await verifyRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRecord = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { id: true, name: true, email: true }
    })

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const profile = await prisma.reviewerProfile.findUnique({
      where: { userId: user.userId },
      select: { id: true }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const formData = await req.formData()
    const provider = formData.get('provider') as string
    const policyNumber = formData.get('policyNumber') as string
    const expiryDate = formData.get('expiryDate') as string
    const hasRideshare = formData.get('hasRideshare') === 'true'
    const coverageType = formData.get('coverageType') as string
    const customCoverage = formData.get('customCoverage') as string | null
    const notes = formData.get('notes') as string | null
    const cardFrontFile = formData.get('cardFront') as File | null
    const cardBackFile = formData.get('cardBack') as File | null

    if (!provider || !policyNumber || !expiryDate || !coverageType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const updateData: any = {
      insuranceProvider: provider,
      policyNumber: policyNumber,
      expiryDate: new Date(expiryDate),
      hasRideshare: hasRideshare,
      coverageType: coverageType,
      customCoverage: coverageType === 'custom' ? customCoverage : null,
      insuranceNotes: notes,
      insuranceUpdatedAt: new Date(),
      insuranceVerified: false
    }

    // Upload new front card if provided
    if (cardFrontFile) {
      const cardFrontBuffer = Buffer.from(await cardFrontFile.arrayBuffer())
      const cardFrontBase64 = cardFrontBuffer.toString('base64')
      const cardFrontDataUri = `data:${cardFrontFile.type};base64,${cardFrontBase64}`

      const frontUploadResult = await cloudinary.uploader.upload(cardFrontDataUri, {
        folder: 'insurance-cards',
        public_id: `${user.userId}-front-${Date.now()}`,
        resource_type: 'image'
      })
      updateData.insuranceCardFrontUrl = frontUploadResult.secure_url
    }

    // Upload new back card if provided
    if (cardBackFile) {
      const cardBackBuffer = Buffer.from(await cardBackFile.arrayBuffer())
      const cardBackBase64 = cardBackBuffer.toString('base64')
      const cardBackDataUri = `data:${cardBackFile.type};base64,${cardBackBase64}`

      const backUploadResult = await cloudinary.uploader.upload(cardBackDataUri, {
        folder: 'insurance-cards',
        public_id: `${user.userId}-back-${Date.now()}`,
        resource_type: 'image'
      })
      updateData.insuranceCardBackUrl = backUploadResult.secure_url
    }

    await prisma.reviewerProfile.update({
      where: { id: profile.id },
      data: updateData
    })

    // Create history entry - CONNECT TO REVIEWERPROFILE
    await prisma.insuranceHistory.create({
      data: {
        reviewerProfile: {
          connect: { id: profile.id }
        },
        action: 'UPDATED',
        status: 'PENDING',
        insuranceProvider: provider,
        policyNumber,
        expiryDate: new Date(expiryDate),
        hasRideshare,
        coverageType,
        customCoverage: coverageType === 'custom' ? customCoverage : null,
        insuranceCardFrontUrl: updateData.insuranceCardFrontUrl,
        insuranceCardBackUrl: updateData.insuranceCardBackUrl,
        insuranceNotes: notes,
        verificationStatus: 'UNVERIFIED',
        changedBy: userRecord.name || userRecord.email,
        changeReason: 'Insurance information updated'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Insurance updated successfully'
    })

  } catch (error) {
    console.error('Error updating insurance:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update insurance' },
      { status: 500 }
    )
  }
}

// DELETE - Remove insurance
export async function DELETE(req: NextRequest) {
  try {
    const user = await verifyRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRecord = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { id: true, name: true, email: true }
    })

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const profile = await prisma.reviewerProfile.findUnique({
      where: { userId: user.userId },
      select: { id: true }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

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
        insuranceVerifiedBy: null
      }
    })

    // Create history entry - CONNECT TO REVIEWERPROFILE
    await prisma.insuranceHistory.create({
      data: {
        reviewerProfile: {
          connect: { id: profile.id }
        },
        action: 'REMOVED',
        status: 'NOT_ACTIVE',
        verificationStatus: 'UNVERIFIED',
        changedBy: userRecord.name || userRecord.email,
        changeReason: 'Insurance removed by user'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Insurance removed successfully'
    })

  } catch (error) {
    console.error('Error removing insurance:', error)
    return NextResponse.json(
      { error: 'Failed to remove insurance' },
      { status: 500 }
    )
  }
}