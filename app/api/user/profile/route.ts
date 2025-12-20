// app/api/user/profile/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'

export async function GET(request: NextRequest) {
  try {
    // ✅ NEW: Direct JWT verification (2ms instead of 150ms)
    const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    // Get full user profile with ReviewerProfile INCLUDING SUSPENSION FIELDS + NEW RESTRICTION FIELDS
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        reviewerProfile: {
          select: {
            id: true,
            name: true,
            profilePhotoUrl: true,
            city: true,
            state: true,
            isVerified: true,
            memberSince: true,
            tripCount: true,
            reviewCount: true,
            // ✅ SUSPENSION FIELDS
            suspensionLevel: true,
            suspendedAt: true,
            suspendedReason: true,
            suspendedBy: true,
            suspensionExpiresAt: true,
            autoReactivate: true,
            bannedAt: true,
            banReason: true,
            bannedBy: true,
            warningCount: true,
            lastWarningAt: true,
            // 🆕 NEW RESTRICTION & WARNING FIELDS
            activeWarningCount: true,
            canBookLuxury: true,
            canBookPremium: true,
            requiresManualApproval: true
          }
        }
      }
    })

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 🆕 Fetch moderation history if ReviewerProfile exists (last 10 actions)
    let moderationHistory = []
    if (userProfile.reviewerProfile?.id) {
      moderationHistory = await prisma.guestModeration.findMany({
        where: {
          guestId: userProfile.reviewerProfile.id
        },
        orderBy: {
          takenAt: 'desc'
        },
        take: 10,
        select: {
          id: true,
          actionType: true,
          suspensionLevel: true,
          warningCategory: true,
          publicReason: true,
          internalNotes: true,
          takenBy: true,
          takenAt: true,
          expiresAt: true,
          restrictionsApplied: true
        }
      })
    }

    // Merge the photo URL to avatar field for consistency
    const profile = {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
      phone: userProfile.phone,
      role: userProfile.role,
      avatar: userProfile.avatar || userProfile.reviewerProfile?.profilePhotoUrl || '/default-avatar.svg',
      emailVerified: userProfile.emailVerified,
      phoneVerified: userProfile.phoneVerified,
      isActive: userProfile.isActive,
      createdAt: userProfile.createdAt,
      lastActive: userProfile.lastActive,
      reviewerProfile: userProfile.reviewerProfile ? {
        ...userProfile.reviewerProfile,
        moderationHistory // 🆕 Add moderation history to reviewerProfile
      } : null
    }

    return NextResponse.json(profile)
    
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' }, 
      { status: 500 }
    )
  }
}