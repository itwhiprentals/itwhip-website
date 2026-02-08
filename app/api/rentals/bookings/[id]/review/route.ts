// app/api/rentals/bookings/[id]/review/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// ========== 🆕 ACTIVITY TRACKING IMPORT ==========
import { trackActivity } from '@/lib/helpers/guestProfileStatus'

// GET - Check if review exists for this booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    
    // Get guest token from header
    const guestToken = request.headers.get('X-Guest-Token')
    if (!guestToken) {
      return NextResponse.json(
        { error: 'Guest token required' },
        { status: 401 }
      )
    }
    
    // Verify token and get booking
    const tokenRecord = await prisma.guestAccessToken.findFirst({
      where: {
        token: guestToken,
        bookingId: bookingId,
        expiresAt: { gte: new Date() }
      }
    })
    
    if (!tokenRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    // Check for existing review
    const existingReview = await prisma.rentalReview.findFirst({
      where: {
        bookingId: bookingId
      },
      include: {
        reviewerProfile: true,
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true
          }
        },
        host: {
          select: {
            id: true,
            name: true,
            profilePhoto: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        hasReview: !!existingReview,
        review: existingReview
      }
    })
    
  } catch (error) {
    console.error('Error checking review:', error)
    return NextResponse.json(
      { error: 'Failed to check review status' },
      { status: 500 }
    )
  }
}

// POST - Submit new review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    const body = await request.json()
    
    // Get guest token from header
    const guestToken = request.headers.get('X-Guest-Token')
    if (!guestToken) {
      return NextResponse.json(
        { error: 'Guest token required' },
        { status: 401 }
      )
    }
    
    // Verify token and get booking
    const tokenRecord = await prisma.guestAccessToken.findFirst({
      where: {
        token: guestToken,
        bookingId: bookingId,
        expiresAt: { gte: new Date() }
      }
    })
    
    if (!tokenRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    // Get booking details
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: {
        car: true,
        host: true
      }
    })
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    // Production-only validation for trip completion
    if (process.env.NODE_ENV === 'production') {
      // Check if trip has ended
      if (!booking.tripEndedAt) {
        return NextResponse.json(
          { error: 'Trip must be completed before leaving a review' },
          { status: 400 }
        )
      }
      
      // Check if booking is eligible for review
      const eligibleStatuses = ['COMPLETED', 'ENDED_PENDING_REVIEW']
      if (!eligibleStatuses.includes(booking.tripStatus || '')) {
        return NextResponse.json(
          { error: 'Booking is not eligible for review' },
          { status: 400 }
        )
      }
      
      // Check review period (30 days) - only in production
      const daysSinceEnd = Math.floor(
        (Date.now() - new Date(booking.tripEndedAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (daysSinceEnd > 30) {
        return NextResponse.json(
          { error: 'Review period has expired (30 days)' },
          { status: 400 }
        )
      }
    } else {
      // Development mode - log that we're skipping validation
      console.log('📝 Development mode: Skipping trip completion validation for booking:', bookingId)
    }
    
    // Check for fraudulent booking (always check this)
    if (booking.fraudulent) {
      return NextResponse.json(
        { error: 'Account under review. Please contact support.' },
        { status: 403 }
      )
    }
    
    // Check if review already exists (always check this)
    const existingReview = await prisma.rentalReview.findFirst({
      where: { bookingId: bookingId }
    })
    
    if (existingReview) {
      return NextResponse.json(
        { error: 'Review already submitted for this booking' },
        { status: 400 }
      )
    }
    
    // Validate review data
    const { 
      rating, 
      cleanliness, 
      accuracy, 
      communication, 
      convenience, 
      value,
      title,
      comment,
      photos 
    } = body
    
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Valid rating (1-5) is required' },
        { status: 400 }
      )
    }
    
    if (!comment || comment.trim().length < 50) {
      return NextResponse.json(
        { error: 'Review must be at least 50 characters' },
        { status: 400 }
      )
    }
    
    // Check if reviewer profile exists for this guest by email (primary) or name (fallback)
    let reviewerProfile = await prisma.reviewerProfile.findFirst({
      where: {
        OR: [
          { email: booking.guestEmail || '' },
          { name: booking.guestName || 'Guest' }
        ]
      }
    })
    
    if (!reviewerProfile) {
      // First-time reviewer - create their profile
      const guestLocation = booking.pickupLocation || `${booking.car.city}, ${booking.car.state}`
      
      // Format name with last initial for privacy (e.g., "John D.")
      let displayName = booking.guestName || 'Guest'
      if (booking.guestName && booking.guestName.includes(' ')) {
        const parts = booking.guestName.split(' ')
        const firstName = parts[0]
        const lastInitial = parts[parts.length - 1][0]
        displayName = `${firstName} ${lastInitial}.`
      }
      
      reviewerProfile = await prisma.reviewerProfile.create({
        data: {
          name: displayName,
          email: booking.guestEmail || `guest_${Date.now()}@itwhip.com`,
          city: guestLocation.split(',')[0]?.trim() || booking.car.city || 'Phoenix',
          state: booking.car.state || 'AZ',
          memberSince: booking.createdAt, // When they first booked with us
          tripCount: 1,
          reviewCount: 0, // Will be incremented to 1 below
          isVerified: true, // They completed a real trip
          profilePhotoUrl: body.profilePhotoUrl || null
        } as any
      })
    } else {
      // Returning guest - update their trip count
      await prisma.reviewerProfile.update({
        where: { id: reviewerProfile.id },
        data: {
          tripCount: { increment: 1 },
          reviewCount: { increment: 1 }
        }
      })
    }
    
    // Create the review
    const newReview = await prisma.rentalReview.create({
      data: {
        bookingId: bookingId,
        carId: booking.carId,
        hostId: booking.hostId,
        renterId: booking.renterId,
        reviewerProfileId: reviewerProfile.id,
        source: 'GUEST', // Mark as real guest review
        rating: rating,
        cleanliness: cleanliness || null,
        accuracy: accuracy || null,
        communication: communication || null,
        convenience: convenience || null,
        value: value || null,
        title: title || null,
        comment: comment.trim(),
        tripStartDate: booking.startDate, // Use actual booking dates
        tripEndDate: booking.endDate,
        isVisible: true,
        isPinned: false,
        isVerified: true, // Real completed trip
        helpfulCount: 0,
        viewCount: 0
      } as any,
      include: {
        reviewerProfile: true,
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true
          }
        },
        host: {
          select: {
            id: true,
            name: true,
            profilePhoto: true
          }
        }
      }
    })
    
    // Update car rating (recalculate average)
    const allCarReviews = await prisma.rentalReview.findMany({
      where: {
        carId: booking.carId,
        isVisible: true
      },
      select: { rating: true }
    })
    
    const avgRating = allCarReviews.reduce((sum, r) => sum + r.rating, 0) / allCarReviews.length
    
    await prisma.rentalCar.update({
      where: { id: booking.carId },
      data: {
        rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
        totalTrips: { increment: 1 }
      }
    })
    
    // Update host rating (recalculate average)
    const allHostReviews = await prisma.rentalReview.findMany({
      where: {
        hostId: booking.hostId,
        isVisible: true
      },
      select: { rating: true }
    })
    
    const avgHostRating = allHostReviews.reduce((sum, r) => sum + r.rating, 0) / allHostReviews.length
    
    await prisma.rentalHost.update({
      where: { id: booking.hostId },
      data: {
        rating: Math.round(avgHostRating * 10) / 10,
        totalTrips: { increment: 1 }
      }
    })
    
    // Update reviewer profile review count if new profile
    if (reviewerProfile.reviewCount === 0) {
      await prisma.reviewerProfile.update({
        where: { id: reviewerProfile.id },
        data: {
          reviewCount: 1
        }
      })
    }
    
    // Optional: Store photos if provided
    if (photos && Array.isArray(photos) && photos.length > 0) {
      // Store photo URLs in review metadata or separate table
      // This could be implemented later if needed
      console.log(`Review submitted with ${photos.length} photos`)
    }

    // ========== 🆕 TRACK REVIEW SUBMISSION ACTIVITY ==========
    try {
      // Build star rating display (★★★★★ or ★★★★☆)
      const fullStars = '★'.repeat(rating)
      const emptyStars = '☆'.repeat(5 - rating)
      const starDisplay = fullStars + emptyStars

      // Build category ratings summary
      const categoryRatings: string[] = []
      if (cleanliness) categoryRatings.push(`Cleanliness: ${cleanliness}`)
      if (accuracy) categoryRatings.push(`Accuracy: ${accuracy}`)
      if (communication) categoryRatings.push(`Communication: ${communication}`)
      if (convenience) categoryRatings.push(`Convenience: ${convenience}`)
      if (value) categoryRatings.push(`Value: ${value}`)

      // Build description
      const description = `Review submitted for ${booking.car.year} ${booking.car.make} ${booking.car.model} - ${starDisplay} (${rating}/5)`

      await trackActivity(reviewerProfile.id, {
        action: 'REVIEW_SUBMITTED',
        description,
        metadata: {
          reviewId: newReview.id,
          bookingId: booking.id,
          bookingCode: booking.bookingCode,
          carName: `${booking.car.year} ${booking.car.make} ${booking.car.model}`,
          carId: booking.carId,
          hostName: booking.host.name,
          hostId: booking.hostId,
          
          // Ratings
          overallRating: rating,
          categoryRatings: {
            cleanliness: cleanliness || null,
            accuracy: accuracy || null,
            communication: communication || null,
            convenience: convenience || null,
            value: value || null
          },
          
          // Review content
          title: title || null,
          commentLength: comment.trim().length,
          hasPhotos: photos && photos.length > 0,
          photoCount: photos?.length || 0,
          
          // Trip details
          tripStartDate: booking.startDate.toISOString(),
          tripEndDate: booking.endDate.toISOString(),
          
          // Profile impact
          isFirstReview: reviewerProfile.reviewCount === 0,
          totalReviewsNow: reviewerProfile.reviewCount + 1,
          
          // Timestamp
          submittedAt: new Date().toISOString()
        }
      })

      console.log('✅ Review submission tracked in guest timeline:', {
        guestId: reviewerProfile.id,
        rating,
        bookingId: booking.id
      })
    } catch (trackingError) {
      console.error('❌ Failed to track review submission activity:', trackingError)
      // Continue without breaking - tracking is non-critical
    }
    // ========== END ACTIVITY TRACKING ==========
    
    // Send notification to host about new review (optional)
    // await sendEmailToHost(booking.host.email, newReview)
    
    return NextResponse.json({
      success: true,
      data: newReview,
      message: 'Thank you for your review!'
    })
    
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}