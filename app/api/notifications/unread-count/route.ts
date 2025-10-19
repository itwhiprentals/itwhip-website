// app/api/notifications/unread-count/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/app/lib/database/prisma'
import { cache } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('accessToken')?.value
    
    if (!token) {
      return NextResponse.json({ 
        success: true,
        unreadCount: 0 
      })
    }

    // Verify JWT and extract user ID
    let userId: string
    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as any
      userId = decoded.userId
    } catch (error) {
      return NextResponse.json({ 
        success: true,
        unreadCount: 0 
      })
    }

    // ✅ CHECK CACHE FIRST (30 second TTL)
    const cacheKey = `notifications:count:${userId}`
    const cached = cache.get<number>(cacheKey, 30000)

    if (cached !== null) {
      return NextResponse.json(
        { success: true, unreadCount: cached },
        {
          headers: {
            'Cache-Control': 'public, max-age=30, s-maxage=30',
            'X-Cache': 'HIT',
          },
        }
      )
    }

    // ✅ CACHE MISS - FETCH FROM DATABASE
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        twoFactorEnabled: true,
        phone: true,
        name: true,
        email: true,
        avatar: true,
        reviewerProfile: {
          select: {
            profilePhotoUrl: true,
            driversLicenseUrl: true,
            documentsVerified: true,
            insuranceProvider: true,
            insuranceVerified: true,
            emergencyContactName: true,
            emergencyContactPhone: true,
            address: true
          }
        },
        paymentMethods: {
          select: { id: true },
          take: 1
        }
      }
    })

    if (!user) {
      return NextResponse.json({ 
        success: true,
        unreadCount: 0 
      })
    }

    // Get dismissed notifications from last 3 days
    const dismissed = await prisma.notificationDismissal.findMany({
      where: { 
        userId,
        dismissedAt: {
          gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        }
      },
      select: { 
        notificationType: true,
        completedAt: true 
      }
    })

    const dismissedTypes = new Set(
      dismissed
        .filter(d => !d.completedAt)
        .map(d => d.notificationType)
    )

    let count = 0

    // Count active notifications
    if (!dismissedTypes.has('PAYMENT_REQUIRED') && user.paymentMethods.length === 0) count++
    if (!dismissedTypes.has('LICENSE_REQUIRED') && (!user.reviewerProfile?.driversLicenseUrl || !user.reviewerProfile?.documentsVerified)) count++
    if (!dismissedTypes.has('INSURANCE_REQUIRED') && (!user.reviewerProfile?.insuranceProvider || !user.reviewerProfile?.insuranceVerified)) count++
    if (!dismissedTypes.has('EMERGENCY_CONTACT') && (!user.reviewerProfile?.emergencyContactName || !user.reviewerProfile?.emergencyContactPhone)) count++
    if (!dismissedTypes.has('PROFILE_INCOMPLETE') && calculateQuickProfileCompletion(user) < 80) count++
    if (!dismissedTypes.has('TWO_FACTOR_DISABLED') && !user.twoFactorEnabled) count++

    // ✅ STORE IN CACHE (30 seconds)
    cache.set(cacheKey, count, 30000)

    return NextResponse.json(
      { success: true, unreadCount: count },
      {
        headers: {
          'Cache-Control': 'public, max-age=30, s-maxage=30',
          'X-Cache': 'MISS',
        },
      }
    )

  } catch (error) {
    console.error('Unread count error:', error)
    return NextResponse.json({ 
      success: false,
      unreadCount: 0 
    })
  }
}

function calculateQuickProfileCompletion(user: any): number {
  let completed = 0
  const total = 10

  if (user.name) completed++
  if (user.email) completed++
  if (user.phone) completed++
  if (user.avatar || user.reviewerProfile?.profilePhotoUrl) completed++
  if (user.reviewerProfile?.driversLicenseUrl) completed++
  if (user.reviewerProfile?.insuranceProvider) completed++
  if (user.reviewerProfile?.emergencyContactName) completed++
  if (user.reviewerProfile?.emergencyContactPhone) completed++
  if (user.reviewerProfile?.address) completed++
  if (user.twoFactorEnabled) completed++

  return Math.round((completed / total) * 100)
}

// ✅ HELPER TO INVALIDATE CACHE (export for use in other routes)
export function invalidateNotificationCache(userId: string) {
  cache.delete(`notifications:count:${userId}`)
}
