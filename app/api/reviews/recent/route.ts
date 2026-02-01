// app/api/reviews/recent/route.ts
// Public endpoint - fetch recent visible reviews across the platform

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const reviews = await prisma.rentalReview.findMany({
      where: {
        isVisible: true,
        rating: { gte: 4 },
        comment: { not: '' },
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        reviewerProfile: {
          select: {
            name: true,
            profilePhotoUrl: true,
          }
        },
        car: {
          select: {
            make: true,
            model: true,
            year: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const formatted = reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      reviewerName: r.reviewerProfile?.name || 'Guest',
      reviewerPhoto: r.reviewerProfile?.profilePhotoUrl || null,
      carInfo: r.car ? `${r.car.year} ${r.car.make} ${r.car.model}` : null,
      createdAt: r.createdAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      reviews: formatted,
      total: formatted.length,
    })
  } catch (error) {
    console.error('Error fetching recent reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
