// app/api/notifications/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('accessToken')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        reviewerProfile: true,
        paymentMethods: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get dismissed notifications from last 3 days
    const dismissed = await prisma.notificationDismissal.findMany({
      where: { 
        userId,
        dismissedAt: {
          gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        }
      }
    })

    const dismissedTypes = new Set(dismissed.map(d => d.notificationType))
    const notifications = []

    // 1. Check Payment Method
    if (!dismissedTypes.has('PAYMENT_REQUIRED')) {
      const hasPaymentMethod = user.paymentMethods && user.paymentMethods.length > 0
      if (!hasPaymentMethod) {
        notifications.push({
          id: 'payment-required',
          type: 'PAYMENT_REQUIRED',
          title: 'Add Payment Method',
          description: 'Required to book vehicles',
          actionUrl: '/profile?tab=payment',
          actionLabel: 'Add Payment',
          priority: 1,
          icon: 'CREDIT_CARD',
          iconColor: 'text-red-600',
          isDismissible: true,
          createdAt: new Date().toISOString()
        })
      }
    }

    // 2. Check Driver's License
    if (!dismissedTypes.has('LICENSE_REQUIRED')) {
      const hasLicense = user.reviewerProfile?.driversLicenseUrl && 
                         user.reviewerProfile?.documentsVerified
      if (!hasLicense) {
        notifications.push({
          id: 'license-required',
          type: 'LICENSE_REQUIRED',
          title: "Upload Driver's License",
          description: 'Required for all rentals',
          actionUrl: '/profile?tab=documents',
          actionLabel: 'Upload Now',
          priority: 2,
          icon: 'CARD',
          iconColor: 'text-orange-600',
          isDismissible: true,
          createdAt: new Date().toISOString()
        })
      }
    }

    // 3. Check Insurance
    if (!dismissedTypes.has('INSURANCE_REQUIRED')) {
      const hasInsurance = user.reviewerProfile?.insuranceProvider && 
                           user.reviewerProfile?.insuranceVerified
      if (!hasInsurance) {
        notifications.push({
          id: 'insurance-required',
          type: 'INSURANCE_REQUIRED',
          title: 'Add Insurance',
          description: 'Lower deposits & fees',
          actionUrl: '/profile?tab=insurance',
          actionLabel: 'Add Insurance',
          priority: 3,
          icon: 'SHIELD',
          iconColor: 'text-yellow-600',
          isDismissible: true,
          createdAt: new Date().toISOString()
        })
      }
    }

    // 4. Check Emergency Contact
    if (!dismissedTypes.has('EMERGENCY_CONTACT')) {
      const hasEmergencyContact = user.reviewerProfile?.emergencyContactName && 
                                   user.reviewerProfile?.emergencyContactPhone
      if (!hasEmergencyContact) {
        notifications.push({
          id: 'emergency-contact',
          type: 'EMERGENCY_CONTACT',
          title: 'Emergency Contact',
          description: 'Required for safety',
          actionUrl: '/profile?tab=profile',
          actionLabel: 'Add Contact',
          priority: 4,
          icon: 'PHONE',
          iconColor: 'text-blue-600',
          isDismissible: true,
          createdAt: new Date().toISOString()
        })
      }
    }

    // 5. Check Profile Completion
    if (!dismissedTypes.has('PROFILE_INCOMPLETE')) {
      const profileCompletion = calculateProfileCompletion(user)
      if (profileCompletion < 80) {
        notifications.push({
          id: 'profile-incomplete',
          type: 'PROFILE_INCOMPLETE',
          title: 'Complete Profile',
          description: 'Earn 50 bonus points',
          actionUrl: '/profile',
          actionLabel: 'Complete Now',
          priority: 5,
          icon: 'PERSON',
          iconColor: 'text-purple-600',
          isDismissible: true,
          createdAt: new Date().toISOString()
        })
      }
    }

    // 6. Check Two-Factor Authentication
    if (!dismissedTypes.has('TWO_FACTOR_DISABLED')) {
      if (!user.twoFactorEnabled) {
        notifications.push({
          id: 'two-factor-disabled',
          type: 'TWO_FACTOR_DISABLED',
          title: 'Enable 2FA',
          description: 'Protect your account',
          actionUrl: '/profile?tab=settings',
          actionLabel: 'Enable 2FA',
          priority: 6,
          icon: 'LOCK',
          iconColor: 'text-gray-600',
          isDismissible: true,
          createdAt: new Date().toISOString()
        })
      }
    }

    // Sort by priority (highest priority first)
    notifications.sort((a, b) => a.priority - b.priority)

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: notifications.length
    })
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

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
