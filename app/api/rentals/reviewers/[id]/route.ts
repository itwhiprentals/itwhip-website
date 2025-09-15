// app/api/rentals/reviewers/[id]/route.ts
// Public endpoint for fetching reviewer profile (for modal display)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// GET - Fetch a reviewer profile for public display
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: profileId } = await params

    // Fetch profile with visible reviews only (for active cars)
    const profile = await prisma.reviewerProfile.findUnique({
      where: { id: profileId },
      include: {
        reviews: {
          where: {
            isVisible: true,
            car: {
              isActive: true  // Only show reviews for active cars
            }
          },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            car: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
                photos: {
                  where: { isHero: true },
                  take: 1,
                  select: { url: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5 // Only show last 5 reviews in modal
        }
      }
    })

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Reviewer profile not found' },
        { status: 404 }
      )
    }

    // Calculate reviewer statistics (only for active cars)
    const allReviews = await prisma.rentalReview.findMany({
      where: {
        reviewerProfileId: profileId,
        isVisible: true,
        car: {
          isActive: true  // Only count reviews for active cars
        }
      },
      select: { rating: true }
    })

    const stats = {
      totalReviews: allReviews.length,
      averageRating: allReviews.length > 0
        ? parseFloat((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1))
        : 0,
      membershipDuration: profile.memberSince 
        ? Math.floor((Date.now() - new Date(profile.memberSince).getTime()) / (1000 * 60 * 60 * 24 * 30)) // months
        : 0
    }

    // Format response
    const formattedProfile = {
      id: profile.id,
      name: profile.name,
      profilePhotoUrl: profile.profilePhotoUrl,
      location: `${profile.city}, ${profile.state}`,
      memberSince: profile.memberSince,
      tripCount: profile.tripCount,
      reviewCount: profile.reviewCount,
      isVerified: profile.isVerified,
      stats,
      recentReviews: profile.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment ? 
          (review.comment.length > 150 
            ? review.comment.substring(0, 150) + '...' 
            : review.comment)
          : null,
        createdAt: review.createdAt,
        car: {
          id: review.car.id,
          displayName: `${review.car.year} ${review.car.make} ${review.car.model}`,
          photoUrl: review.car.photos[0]?.url || null
        }
      }))
    }

    return NextResponse.json({
      success: true,
      data: formattedProfile
    })
  } catch (error) {
    console.error('Error fetching reviewer profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviewer profile' },
      { status: 500 }
    )
  }
}