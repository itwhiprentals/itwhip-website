// app/api/admin/sync-status/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

/**
 * Admin API to check sync status and statistics
 * GET /api/admin/sync-status
 * 
 * Returns current state of reviews, bookings, guests, and payouts
 */

export async function GET(request: NextRequest) {
  try {
    // Basic auth check (customize based on your auth system)
    const authHeader = request.headers.get('authorization')
    const adminKey = request.headers.get('x-admin-key')
    
    // Simple admin check - customize this based on your auth
    // You might want to use session cookies or JWT instead
    if (!authHeader && !adminKey) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }
    
    // Gather all statistics in parallel
    const [
      totalReviews,
      linkedReviews,
      orphanedReviews,
      totalReviewers,
      reviewersWithEmail,
      reviewersWithValidEmail,
      reviewersWithUser,
      totalBookings,
      p2prBookings,
      bookingsWithPayouts,
      totalPayouts,
      paidPayouts,
      totalUsers,
      guestUsers,
      bookingStats
    ] = await Promise.all([
      // Reviews
      prisma.rentalReview.count(),
      prisma.rentalReview.count({ where: { bookingId: { not: null } } }),
      prisma.rentalReview.count({ where: { bookingId: null } }),
      
      // Reviewers
      prisma.reviewerProfile.count(),
      prisma.reviewerProfile.count({ where: { email: { not: null } } }),
      prisma.reviewerProfile.count({ 
        where: { 
          email: { 
            contains: '@guest.itwhip.com' 
          } 
        } 
      }),
      prisma.reviewerProfile.count({ where: { userId: { not: null } } }),
      
      // Bookings
      prisma.rentalBooking.count(),
      prisma.rentalBooking.count({ 
        where: { 
          bookingCode: { 
            startsWith: 'P2PR' 
          } 
        } 
      }),
      prisma.rentalBooking.count({
        where: {
          RentalPayout: {
            some: {}
          }
        }
      }),
      
      // Payouts
      prisma.rentalPayout.count(),
      prisma.rentalPayout.count({ where: { status: 'PAID' } }),
      
      // Users
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ANONYMOUS' as any } }),
      
      // Booking financial stats
      prisma.rentalBooking.aggregate({
        where: {
          bookingCode: {
            startsWith: 'P2PR'
          }
        },
        _sum: {
          totalAmount: true
        },
        _avg: {
          totalAmount: true
        }
      })
    ])
    
    // Calculate payout statistics
    const payoutStats = await prisma.rentalPayout.aggregate({
      where: {
        status: 'PAID',
        booking: {
          bookingCode: {
            startsWith: 'P2PR'
          }
        }
      },
      _sum: {
        amount: true,
        platformFee: true
      }
    })
    
    // Get sample synced bookings
    const sampleBookings = await prisma.rentalBooking.findMany({
      where: {
        bookingCode: {
          startsWith: 'P2PR'
        }
      },
      take: 5,
      select: {
        id: true,
        bookingCode: true,
        guestName: true,
        guestEmail: true,
        totalAmount: true,
        status: true,
        reviewedAt: true,
        createdAt: true,
        car: {
          select: {
            make: true,
            model: true,
            year: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Calculate sync status
    const syncComplete = orphanedReviews === 0 && 
                        reviewersWithUser === totalReviewers &&
                        p2prBookings === linkedReviews
    
    const syncPercentage = totalReviews > 0 
      ? Math.round((linkedReviews / totalReviews) * 100)
      : 0
    
    // Build response
    const response = {
      syncStatus: {
        isComplete: syncComplete,
        percentage: syncPercentage,
        timestamp: new Date().toISOString()
      },
      reviews: {
        total: totalReviews,
        linked: linkedReviews,
        orphaned: orphanedReviews,
        linkageRate: totalReviews > 0 
          ? `${Math.round((linkedReviews / totalReviews) * 100)}%`
          : '0%'
      },
      reviewers: {
        total: totalReviewers,
        withEmail: reviewersWithEmail,
        withValidEmail: reviewersWithValidEmail,
        withUserAccount: reviewersWithUser,
        accountCreationRate: totalReviewers > 0
          ? `${Math.round((reviewersWithUser / totalReviewers) * 100)}%`
          : '0%'
      },
      bookings: {
        total: totalBookings,
        synced: p2prBookings,
        withPayouts: bookingsWithPayouts,
        totalValue: bookingStats._sum.totalAmount || 0,
        averageValue: bookingStats._avg.totalAmount || 0
      },
      payouts: {
        total: totalPayouts,
        paid: paidPayouts,
        totalHostEarnings: payoutStats._sum.amount || 0,
        totalPlatformRevenue: payoutStats._sum.platformFee || 0,
        totalBookingValue: (payoutStats._sum.amount || 0) + (payoutStats._sum.platformFee || 0)
      },
      users: {
        total: totalUsers,
        guests: guestUsers
      },
      sampleBookings,
      recommendations: generateRecommendations({
        orphanedReviews,
        reviewersWithUser,
        totalReviewers,
        syncComplete
      })
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Sync status API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch sync status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Generate recommendations based on current state
 */
function generateRecommendations(data: {
  orphanedReviews: number
  reviewersWithUser: number
  totalReviewers: number
  syncComplete: boolean
}): string[] {
  const recommendations: string[] = []
  
  if (data.syncComplete) {
    recommendations.push('✅ Sync is complete! All systems operational.')
    recommendations.push('💡 Guests can now log in with their @guest.itwhip.com emails')
    recommendations.push('💡 Hosts can see earnings from historical trips')
    recommendations.push('💡 Claims can be filed on synced bookings')
    return recommendations
  }
  
  if (data.orphanedReviews > 0) {
    recommendations.push(`⚠️ Found ${data.orphanedReviews} reviews not linked to bookings`)
    recommendations.push('🔧 Review sync needed — check admin dashboard for manual sync options')
  }
  
  if (data.reviewersWithUser < data.totalReviewers) {
    const missing = data.totalReviewers - data.reviewersWithUser
    recommendations.push(`⚠️ ${missing} reviewers don't have user accounts`)
    recommendations.push('🔧 User account creation may have failed during sync')
  }
  
  if (data.orphanedReviews === 0 && data.reviewersWithUser === data.totalReviewers) {
    recommendations.push('✅ Sync appears complete!')
    recommendations.push('🔍 Verify sync results in admin dashboard')
  }
  
  return recommendations
}

/**
 * POST endpoint to trigger a dry-run sync preview
 * This doesn't actually run the sync, just returns what would happen
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const authHeader = request.headers.get('authorization')
    const adminKey = request.headers.get('x-admin-key')
    
    if (!authHeader && !adminKey) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }
    
    // Get orphaned reviews that would be synced
    const orphanedReviews = await prisma.rentalReview.findMany({
      where: { bookingId: null },
      include: {
        car: {
          select: {
            make: true,
            model: true,
            dailyRate: true
          }
        },
        reviewerProfile: {
          select: {
            name: true,
            email: true
          }
        }
      },
      take: 10 // Preview first 10
    })
    
    // Calculate what would be created
    let estimatedBookings = orphanedReviews.length
    let estimatedValue = 0
    
    orphanedReviews.forEach(review => {
      if (review.tripStartDate && review.tripEndDate && review.car?.dailyRate) {
        const days = Math.ceil(
          (review.tripEndDate.getTime() - review.tripStartDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        estimatedValue += days * review.car.dailyRate
      }
    })
    
    return NextResponse.json({
      preview: {
        bookingsToCreate: estimatedBookings,
        estimatedTotalValue: estimatedValue,
        estimatedHostEarnings: estimatedValue * 0.75,
        estimatedPlatformRevenue: estimatedValue * 0.25
      },
      sampleReviews: orphanedReviews.map(r => ({
        reviewerName: r.reviewerProfile?.name,
        carMake: r.car?.make,
        carModel: r.car?.model,
        tripDates: r.tripStartDate && r.tripEndDate 
          ? `${r.tripStartDate.toISOString().split('T')[0]} to ${r.tripEndDate.toISOString().split('T')[0]}`
          : 'N/A'
      })),
      recommendation: estimatedBookings > 0
        ? 'Run sync to create these bookings'
        : 'No bookings to create - sync already complete'
    })
    
  } catch (error) {
    console.error('Sync preview error:', error)
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    )
  }
}