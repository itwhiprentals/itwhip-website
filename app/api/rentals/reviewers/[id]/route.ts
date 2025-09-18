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
            title: true,  // Added title field
            createdAt: true,
            tripStartDate: true,  // Added trip dates
            tripEndDate: true,
            helpfulCount: true,  // Added helpful count
            isVerified: true,    // Added verification status
            isPinned: true,      // Added pinned status
            
            // ADDED: Include host response data
            hostResponse: true,
            hostRespondedAt: true,
            supportResponse: true,
            supportRespondedAt: true,
            supportRespondedBy: true,
            
            // Include host details
            host: {
              select: {
                id: true,
                name: true,
                profilePhoto: true
              }
            },
            
            // Include car details
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

    // Format response with complete review data including host responses
    const formattedProfile = {
      id: profile.id,
      name: profile.name,
      profilePhotoUrl: profile.profilePhotoUrl,
      location: `${profile.city}, ${profile.state}`,
      city: profile.city,
      state: profile.state,
      memberSince: profile.memberSince,
      tripCount: stats.totalReviews,      // Use actual count
      reviewCount: stats.totalReviews,    // Use actual count
      isVerified: profile.isVerified,
      stats,
      recentReviews: profile.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment ? 
          (review.comment.length > 150 
            ? review.comment.substring(0, 150) + '...' 
            : review.comment)
          : null,
        fullComment: review.comment,  // Include full comment for modal
        createdAt: review.createdAt,
        tripStartDate: review.tripStartDate,
        tripEndDate: review.tripEndDate,
        helpfulCount: review.helpfulCount,
        isVerified: review.isVerified,
        isPinned: review.isPinned,
        
        // ADDED: Include host response data for each review
        hostResponse: review.hostResponse,
        hostRespondedAt: review.hostRespondedAt,
        supportResponse: review.supportResponse,
        supportRespondedAt: review.supportRespondedAt,
        supportRespondedBy: review.supportRespondedBy,
        
        // Include host information
        host: review.host ? {
          id: review.host.id,
          name: review.host.name,
          profilePhoto: review.host.profilePhoto
        } : null,
        
        // Include car information
        car: {
          id: review.car.id,
          displayName: `${review.car.year} ${review.car.make} ${review.car.model}`,
          make: review.car.make,
          model: review.car.model,
          year: review.car.year,
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