// app/sys-2847/fleet/api/reviewer-profiles/route.ts
// Admin endpoint for managing reviewer profiles

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// GET - Fetch all reviewer profiles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const state = searchParams.get('state')

    // Build where clause
    const where: any = {}
    if (city) where.city = city
    if (state) where.state = state

    const profiles = await prisma.reviewerProfile.findMany({
      where,
      include: {
        _count: {
          select: { RentalReview: true }
        }
      },
      orderBy: [
        { reviewCount: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Get statistics
    const stats = {
      total: profiles.length,
      verified: profiles.filter(p => p.isVerified).length,
      locations: {
        phoenix: profiles.filter(p => p.city === 'Phoenix').length,
        scottsdale: profiles.filter(p => p.city === 'Scottsdale').length,
        tempe: profiles.filter(p => p.city === 'Tempe').length,
        other: profiles.filter(p => !['Phoenix', 'Scottsdale', 'Tempe'].includes(p.city)).length
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        profiles,
        stats
      }
    })
  } catch (error) {
    console.error('Error fetching reviewer profiles:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviewer profiles' },
      { status: 500 }
    )
  }
}

// POST - Create a new reviewer profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Check if profile with same name already exists
    if (body.name) {
      const existing = await prisma.reviewerProfile.findFirst({
        where: { name: body.name }
      })

      if (existing) {
        return NextResponse.json(
          { success: false, error: 'A reviewer profile with this name already exists' },
          { status: 400 }
        )
      }
    }

    // Create the profile
    const profile = await prisma.reviewerProfile.create({
      data: {
        name: body.name || 'Anonymous Reviewer',
        profilePhotoUrl: body.profilePhotoUrl,
        city: body.city || 'Phoenix',
        state: body.state || 'AZ',
        memberSince: body.memberSince ? new Date(body.memberSince) : new Date(),
        tripCount: body.tripCount || 1,
        reviewCount: body.reviewCount || 0,
        isVerified: body.isVerified || false
      } as any
    })

    return NextResponse.json({
      success: true,
      data: profile,
      message: 'Reviewer profile created successfully'
    })
  } catch (error) {
    console.error('Error creating reviewer profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create reviewer profile' },
      { status: 500 }
    )
  }
}

// DELETE ALL - Bulk delete profiles with no reviews
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cleanupType = searchParams.get('cleanup')

    if (cleanupType !== 'orphaned') {
      return NextResponse.json(
        { success: false, error: 'Invalid cleanup type' },
        { status: 400 }
      )
    }

    // Find all profiles with no reviews
    const orphanedProfiles = await prisma.reviewerProfile.findMany({
      where: {
        RentalReview: {
          none: {}
        }
      },
      select: { id: true }
    })

    if (orphanedProfiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No orphaned profiles to delete',
        deleted: 0
      })
    }

    // Delete orphaned profiles
    const result = await prisma.reviewerProfile.deleteMany({
      where: {
        id: {
          in: orphanedProfiles.map(p => p.id)
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} orphaned reviewer profiles`,
      deleted: result.count
    })
  } catch (error) {
    console.error('Error cleaning up reviewer profiles:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup reviewer profiles' },
      { status: 500 }
    )
  }
}