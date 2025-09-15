// app/sys-2847/fleet/api/reviewer-profiles/[id]/route.ts
// Admin endpoint for individual reviewer profile operations

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

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