// app/api/notifications/dismiss/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/app/lib/database/prisma'

export async function POST(request: NextRequest) {
  try {
    // 🔧 FIX: Await cookies() before accessing
    const cookieStore = await cookies()
    const token = cookieStore.get('accessToken')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify JWT and extract user ID
    const decoded = verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    // Get notification type from request body
    const body = await request.json()
    const { notificationType } = body

    if (!notificationType) {
      return NextResponse.json(
        { error: 'Notification type is required' },
        { status: 400 }
      )
    }

    // Validate notification type
    const validTypes = [
      'PAYMENT_REQUIRED',
      'LICENSE_REQUIRED', 
      'INSURANCE_REQUIRED',
      'EMERGENCY_CONTACT',
      'PROFILE_INCOMPLETE',
      'TWO_FACTOR_DISABLED'
    ]

    if (!validTypes.includes(notificationType)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      )
    }

    // Create or update dismissal record
    const dismissal = await prisma.notificationDismissal.upsert({
      where: {
        userId_notificationType: {
          userId,
          notificationType
        }
      },
      update: {
        dismissedAt: new Date(),
        dismissCount: { increment: 1 }
      },
      create: {
        userId,
        notificationType,
        dismissedAt: new Date(),
        dismissCount: 1
      }
    })

    // Check if the action has been completed
    // If yes, mark it as completed so it won't reappear
    const actionCompleted = await checkIfActionCompleted(userId, notificationType)
    
    if (actionCompleted) {
      await prisma.notificationDismissal.update({
        where: {
          id: dismissal.id
        },
        data: {
          completedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Notification dismissed successfully',
      dismissal: {
        id: dismissal.id,
        type: dismissal.notificationType,
        dismissedAt: dismissal.dismissedAt,
        dismissCount: dismissal.dismissCount,
        completed: actionCompleted
      }
    })
  } catch (error) {
    console.error('Dismiss notification error:', error)
    return NextResponse.json(
      { error: 'Failed to dismiss notification' },
      { status: 500 }
    )
  }
}

// Helper function to check if the required action has been completed
async function checkIfActionCompleted(
  userId: string, 
  notificationType: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        reviewerProfile: true,
        paymentMethods: true
      }
    })

    if (!user) return false

    switch (notificationType) {
      case 'PAYMENT_REQUIRED':
        return user.paymentMethods && user.paymentMethods.length > 0

      case 'LICENSE_REQUIRED':
        return Boolean(
          user.reviewerProfile?.driversLicenseUrl && 
          user.reviewerProfile?.documentsVerified
        )

      case 'INSURANCE_REQUIRED':
        return Boolean(
          user.reviewerProfile?.insuranceProvider && 
          user.reviewerProfile?.insuranceVerified
        )

      case 'EMERGENCY_CONTACT':
        return Boolean(
          user.reviewerProfile?.emergencyContactName && 
          user.reviewerProfile?.emergencyContactPhone
        )

      case 'PROFILE_INCOMPLETE':
        const profileCompletion = calculateProfileCompletion(user)
        return profileCompletion >= 80

      case 'TWO_FACTOR_DISABLED':
        return Boolean(user.twoFactorEnabled)

      default:
        return false
    }
  } catch (error) {
    console.error('Error checking action completion:', error)
    return false
  }
}

// Calculate profile completion percentage
function calculateProfileCompletion(user: any): number {
  let completed = 0
  let total = 10

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