// app/sys-2847/fleet/api/reviews/[id]/route.ts
// Admin endpoint for individual review operations

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// GET - Fetch a single review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params

    const review = await prisma.rentalReview.findUnique({
      where: { id: reviewId },
      include: {
        reviewerProfile: true,
        host: {
          select: {
            id: true,
            name: true,
            profilePhoto: true
          }
        },
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true
          }
        }
      }
    })

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: review
    })
  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch review' },
      { status: 500 }
    )
  }
}

// PUT - Update a review
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params
    const body = await request.json()

    // Check if review exists
    const existingReview = await prisma.rentalReview.findUnique({
      where: { id: reviewId }
    })

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    // Update review fields
    const updateData: any = {}

    // Update basic fields if provided
    if (body.rating !== undefined) updateData.rating = body.rating
    if (body.title !== undefined) updateData.title = body.title
    if (body.comment !== undefined) updateData.comment = body.comment
    if (body.cleanliness !== undefined) updateData.cleanliness = body.cleanliness
    if (body.accuracy !== undefined) updateData.accuracy = body.accuracy
    if (body.communication !== undefined) updateData.communication = body.communication
    if (body.convenience !== undefined) updateData.convenience = body.convenience
    if (body.value !== undefined) updateData.value = body.value

    // Update visibility and prominence
    if (body.isVisible !== undefined) updateData.isVisible = body.isVisible
    if (body.isPinned !== undefined) updateData.isPinned = body.isPinned
    if (body.isVerified !== undefined) updateData.isVerified = body.isVerified

    // Update trip dates if provided
    if (body.tripStartDate !== undefined) {
      updateData.tripStartDate = body.tripStartDate ? new Date(body.tripStartDate) : null
    }
    if (body.tripEndDate !== undefined) {
      updateData.tripEndDate = body.tripEndDate ? new Date(body.tripEndDate) : null
    }

    // Update host response if provided
    if (body.hostResponse !== undefined) {
      updateData.hostResponse = body.hostResponse
      if (body.hostRespondedAt !== undefined) {
        updateData.hostRespondedAt = body.hostRespondedAt ? new Date(body.hostRespondedAt) : null
      } else if (body.hostResponse) {
        updateData.hostRespondedAt = new Date()
      } else {
        updateData.hostRespondedAt = null
      }
    }

    // Update support response if provided
    if (body.supportResponse !== undefined) {
      updateData.supportResponse = body.supportResponse
      if (body.supportRespondedAt !== undefined) {
        updateData.supportRespondedAt = body.supportRespondedAt ? new Date(body.supportRespondedAt) : null
      } else if (body.supportResponse) {
        updateData.supportRespondedAt = new Date()
      } else {
        updateData.supportRespondedAt = null
      }
      updateData.supportRespondedBy = body.supportRespondedBy || 'ItWhip Support'
    }

    // Update helpful count if provided
    if (body.helpfulCount !== undefined) updateData.helpfulCount = body.helpfulCount

    // Update reviewer profile if any profile fields are provided
    if (existingReview.reviewerProfileId && (
      body.reviewerName !== undefined ||
      body.profilePhotoUrl !== undefined ||
      body.reviewerCity !== undefined ||
      body.reviewerState !== undefined ||
      body.tripCount !== undefined ||
      body.reviewCount !== undefined ||
      body.memberSince !== undefined ||
      body.isProfileVerified !== undefined
    )) {
      const profileUpdateData: any = {}
      
      // Only update fields that are provided
      if (body.reviewerName !== undefined) profileUpdateData.name = body.reviewerName
      if (body.profilePhotoUrl !== undefined) profileUpdateData.profilePhotoUrl = body.profilePhotoUrl
      if (body.reviewerCity !== undefined) profileUpdateData.city = body.reviewerCity
      if (body.reviewerState !== undefined) profileUpdateData.state = body.reviewerState
      if (body.tripCount !== undefined) profileUpdateData.tripCount = body.tripCount
      if (body.reviewCount !== undefined) profileUpdateData.reviewCount = body.reviewCount
      if (body.memberSince !== undefined) profileUpdateData.memberSince = new Date(body.memberSince)
      if (body.isProfileVerified !== undefined) profileUpdateData.isVerified = body.isProfileVerified
      
      // Update the reviewer profile
      await prisma.reviewerProfile.update({
        where: { id: existingReview.reviewerProfileId },
        data: profileUpdateData
      })
    }

    // Perform the review update
    const updatedReview = await prisma.rentalReview.update({
      where: { id: reviewId },
      data: updateData,
      include: {
        reviewerProfile: true,
        host: {
          select: {
            id: true,
            name: true,
            profilePhoto: true
          }
        }
      }
    })

    // If rating changed, update car's average rating
    if (body.rating !== undefined && body.rating !== existingReview.rating) {
      const allReviews = await prisma.rentalReview.findMany({
        where: { 
          carId: existingReview.carId,
          isVisible: true 
        },
        select: { rating: true }
      })
      
      const newAverage = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

      await prisma.rentalCar.update({
        where: { id: existingReview.carId },
        data: { rating: newAverage }
      })
    }

    return NextResponse.json({
      success: true,
      data: updatedReview,
      message: 'Review updated successfully'
    })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params

    // Get review details before deletion
    const review = await prisma.rentalReview.findUnique({
      where: { id: reviewId },
      select: { 
        carId: true,
        reviewerProfileId: true
      }
    })

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    // Delete the review
    await prisma.rentalReview.delete({
      where: { id: reviewId }
    })

    // If reviewer profile exists, check if it has other reviews
    if (review.reviewerProfileId) {
      const otherReviews = await prisma.rentalReview.count({
        where: { reviewerProfileId: review.reviewerProfileId }
      })

      // If no other reviews, consider deleting the profile
      if (otherReviews === 0) {
        // Optional: Delete orphaned profile
        await prisma.reviewerProfile.delete({
          where: { id: review.reviewerProfileId }
        }).catch(() => {
          // Silently fail if profile is referenced elsewhere
          console.log('Profile has other references, keeping it')
        })
      } else {
        // Decrement the review count
        await prisma.reviewerProfile.update({
          where: { id: review.reviewerProfileId },
          data: { reviewCount: { decrement: 1 } }
        })
      }
    }

    // Update car's average rating
    const remainingReviews = await prisma.rentalReview.findMany({
      where: { 
        carId: review.carId,
        isVisible: true 
      },
      select: { rating: true }
    })
    
    const newAverage = remainingReviews.length > 0
      ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length
      : 0

    await prisma.rentalCar.update({
      where: { id: review.carId },
      data: { 
        rating: newAverage,
        totalTrips: { decrement: 1 }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}