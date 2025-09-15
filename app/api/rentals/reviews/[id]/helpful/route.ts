// app/api/rentals/reviews/[id]/helpful/route.ts
// Public endpoint for marking reviews as helpful

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// POST - Increment helpful count for a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params
    
    // Get client IP for basic rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    
    // Check if review exists and is visible
    const review = await prisma.rentalReview.findUnique({
      where: { id: reviewId },
      select: { 
        id: true, 
        isVisible: true,
        helpfulCount: true 
      }
    })

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    if (!review.isVisible) {
      return NextResponse.json(
        { success: false, error: 'Review not available' },
        { status: 404 }
      )
    }

    // Simple session-based duplicate prevention
    // In production, you might want to use Redis or a database table
    // to track helpful votes per IP/session
    const body = await request.json().catch(() => ({}))
    const sessionId = body.sessionId || clientIp
    
    // Create a simple key for this vote
    const voteKey = `${reviewId}-${sessionId}`
    
    // For MVP, we'll just increment without strict duplicate checking
    // In production, implement proper vote tracking
    
    // Increment helpful count
    const updatedReview = await prisma.rentalReview.update({
      where: { id: reviewId },
      data: {
        helpfulCount: { increment: 1 },
        viewCount: { increment: 1 } // Also track views
      },
      select: {
        id: true,
        helpfulCount: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        reviewId: updatedReview.id,
        helpfulCount: updatedReview.helpfulCount,
        message: 'Thank you for your feedback!'
      }
    })
  } catch (error) {
    console.error('Error updating helpful count:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update helpful count' },
      { status: 500 }
    )
  }
}

// GET - Check if user has already marked as helpful (optional)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    // For MVP, just return the current count
    // In production, you'd check if this session already voted
    const review = await prisma.rentalReview.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        helpfulCount: true,
        isVisible: true
      }
    })

    if (!review || !review.isVisible) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        reviewId: review.id,
        helpfulCount: review.helpfulCount,
        hasVoted: false // For MVP, always false. Implement tracking later
      }
    })
  } catch (error) {
    console.error('Error checking helpful status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check helpful status' },
      { status: 500 }
    )
  }
}