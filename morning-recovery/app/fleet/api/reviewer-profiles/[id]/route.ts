// app/fleet/api/reviewer-profiles/[id]/route.ts
// Admin endpoint for individual reviewer profile operations

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// ========== 🆕 ACTIVITY TRACKING IMPORT ==========
import { trackActivity } from '@/lib/helpers/guestProfileStatus'

// GET - Fetch a single reviewer profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: profileId } = await params

    const profile = await prisma.reviewerProfile.findUnique({
      where: { id: profileId },
      include: {
        reviews: {
          include: {
            car: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Reviewer profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: profile
    })
  } catch (error) {
    console.error('Error fetching reviewer profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviewer profile' },
      { status: 500 }
    )
  }
}

// PUT - Update a reviewer profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: profileId } = await params
    const body = await request.json()

    // Check if profile exists
    const existingProfile = await prisma.reviewerProfile.findUnique({
      where: { id: profileId }
    })

    if (!existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Reviewer profile not found' },
        { status: 404 }
      )
    }

    // ========== 🆕 DETECT DOCUMENT VERIFICATION (BEFORE UPDATE) ==========
    const wasVerifiedBefore = existingProfile.documentsVerified
    const isBeingVerifiedNow = body.documentsVerified === true && !wasVerifiedBefore
    const isBeingRejectedNow = body.documentsVerified === false && wasVerifiedBefore
    
    // Store which documents are being verified
    const documentsVerified: string[] = []
    if (body.documentsVerified) {
      if (existingProfile.governmentIdUrl) documentsVerified.push('Government ID')
      if (existingProfile.driversLicenseUrl) documentsVerified.push("Driver's License")
      if (existingProfile.selfieUrl) documentsVerified.push('Verification Selfie')
    }

    // Build update data
    const updateData: any = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.profilePhotoUrl !== undefined) updateData.profilePhotoUrl = body.profilePhotoUrl
    if (body.city !== undefined) updateData.city = body.city
    if (body.state !== undefined) updateData.state = body.state
    if (body.tripCount !== undefined) updateData.tripCount = body.tripCount
    if (body.reviewCount !== undefined) updateData.reviewCount = body.reviewCount
    if (body.isVerified !== undefined) updateData.isVerified = body.isVerified
    if (body.memberSince !== undefined) {
      updateData.memberSince = new Date(body.memberSince)
    }

    // Document verification fields
    if (body.documentsVerified !== undefined) {
      updateData.documentsVerified = body.documentsVerified
      if (body.documentsVerified) {
        updateData.documentVerifiedAt = new Date()
      } else {
        updateData.documentVerifiedAt = null
      }
    }

    // Update the profile
    const updatedProfile = await prisma.reviewerProfile.update({
      where: { id: profileId },
      data: updateData,
      include: {
        _count: {
          select: { reviews: true }
        }
      }
    })

    // ========== 🆕 TRACK DOCUMENT VERIFICATION ACTIVITY ==========
    if (isBeingVerifiedNow) {
      try {
        // Build description
        const documentList = documentsVerified.join(', ')
        const description = documentsVerified.length > 0
          ? `Documents verified by admin - ${documentList}`
          : 'Documents verified by admin'

        await trackActivity(profileId, {
          action: 'DOCUMENT_VERIFIED',
          description,
          performedBy: 'FLEET_ADMIN',
          metadata: {
            verifiedBy: 'Fleet Admin',
            verifiedAt: new Date().toISOString(),
            documentsVerified,
            documentCount: documentsVerified.length,
            // Document URLs (for reference)
            documents: {
              governmentId: existingProfile.governmentIdUrl || null,
              governmentIdType: existingProfile.governmentIdType || null,
              driversLicense: existingProfile.driversLicenseUrl || null,
              selfie: existingProfile.selfieUrl || null
            },
            // Verification impact
            canInstantBook: true,
            verificationComplete: true
          }
        })

        console.log('✅ Document verification tracked in guest timeline:', {
          guestId: profileId,
          documentsVerified
        })
      } catch (trackingError) {
        console.error('❌ Failed to track document verification activity:', trackingError)
        // Continue without breaking - tracking is non-critical
      }
    }

    // ========== 🆕 TRACK DOCUMENT REJECTION ==========
    if (isBeingRejectedNow) {
      try {
        await trackActivity(profileId, {
          action: 'DOCUMENT_REJECTED',
          description: 'Documents rejected by admin - Verification status revoked',
          performedBy: 'FLEET_ADMIN',
          metadata: {
            rejectedBy: 'Fleet Admin',
            rejectedAt: new Date().toISOString(),
            reason: body.rejectionReason || 'Documents did not meet verification requirements',
            previouslyVerified: wasVerifiedBefore,
            verificationRevoked: true
          }
        })

        console.log('✅ Document rejection tracked in guest timeline:', {
          guestId: profileId
        })
      } catch (trackingError) {
        console.error('❌ Failed to track document rejection activity:', trackingError)
        // Continue without breaking - tracking is non-critical
      }
    }
    // ========== END ACTIVITY TRACKING ==========

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Reviewer profile updated successfully'
    })
  } catch (error) {
    console.error('Error updating reviewer profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update reviewer profile' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a reviewer profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: profileId } = await params

    // Check if profile has reviews
    const reviewCount = await prisma.rentalReview.count({
      where: { reviewerProfileId: profileId }
    })

    if (reviewCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete profile with ${reviewCount} existing reviews. Delete reviews first.` 
        },
        { status: 400 }
      )
    }

    // Delete the profile
    await prisma.reviewerProfile.delete({
      where: { id: profileId }
    })

    return NextResponse.json({
      success: true,
      message: 'Reviewer profile deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting reviewer profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete reviewer profile' },
      { status: 500 }
    )
  }
}