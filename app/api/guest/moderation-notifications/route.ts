// app/api/guest/moderation-notifications/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verify } from 'jsonwebtoken'

// Helper to verify guest token (using standard JWT)
async function verifyGuestToken(token: string) {
  try {
    // Try with JWT_SECRET first (standard auth)
    const decoded = verify(token, process.env.JWT_SECRET!)
    return decoded
  } catch (error) {
    // Fallback to GUEST_JWT_SECRET if needed
    try {
      const decoded = verify(token, process.env.GUEST_JWT_SECRET!)
      return decoded
    } catch (fallbackError) {
      return null
    }
  }
}

// Helper to calculate days remaining
function calculateDaysRemaining(expiresAt: Date | null): number | null {
  if (!expiresAt) return null
  const now = new Date()
  const diff = expiresAt.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// GET - Fetch moderation notifications for guest
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from token
    const accessToken = request.cookies.get('accessToken')?.value
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Verify token
    const payload = await verifyGuestToken(accessToken) as any
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const userId = payload.userId as string

    // Find the guest's ReviewerProfile
    const guest = await prisma.reviewerProfile.findUnique({
      where: { userId }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest profile not found' },
        { status: 404 }
      )
    }

    // 📊 PART 1: Fetch historical moderation actions from GuestModeration table
    const moderationActions = await prisma.guestModeration.findMany({
      where: { guestId: guest.id },
      orderBy: { takenAt: 'desc' },
      take: 10
    })

    // Transform moderation actions into notification format
    const notifications = moderationActions.map(action => {
      let type = 'info'
      let title = 'Account Notice'
      let message = ''
      let actionLink = undefined
      let actionLabel = undefined

      switch (action.actionType) {
        case 'WARNING':
          type = 'warning'
          title = 'Account Warning Issued'
          message = 'Please review our community guidelines to avoid further restrictions.'
          break

        case 'SUSPEND':
          if (action.suspensionLevel === 'SOFT') {
            type = 'soft_suspend'
            title = 'Account Temporarily Restricted'
            message = 'You can still view your bookings, but new bookings are currently disabled.'
            actionLink = '/support'
            actionLabel = 'Submit Appeal'
          } else if (action.suspensionLevel === 'HARD') {
            type = 'hard_suspend'
            title = 'Account Suspended - Action Required'
            message = 'Your account access has been restricted. Future bookings have been cancelled.'
            actionLink = '/support'
            actionLabel = 'Submit Appeal'
          }
          break

        case 'BAN':
          type = 'ban'
          title = 'Account Permanently Banned'
          message = 'Your account has been permanently restricted from using our services.'
          actionLink = 'mailto:info@itwhip.com'
          actionLabel = 'Contact Support'
          break

        case 'UNSUSPEND':
          type = 'unsuspend'
          title = 'Account Reactivated'
          message = 'Your account has been restored to full access. Welcome back!'
          break

        case 'NOTE_ADDED':
          type = 'info'
          title = 'Account Note Added'
          message = 'An administrative note has been added to your account.'
          break

        case 'RESTRICTION_ADDED':
          type = 'warning'
          title = 'Account Restriction Added'
          message = 'A new restriction has been placed on your account.'
          actionLink = '/support'
          actionLabel = 'Learn More'
          break

        case 'RESTRICTION_REMOVED':
          type = 'unsuspend'
          title = 'Account Restriction Removed'
          message = 'A restriction has been lifted from your account.'
          break

        default:
          type = 'info'
          title = 'Account Update'
          message = 'Your account has been updated.'
      }

      return {
        id: action.id,
        type,
        title,
        message,
        reason: action.publicReason,
        timestamp: action.takenAt.toISOString(),
        expiresAt: action.expiresAt?.toISOString(),
        actionLink,
        actionLabel,
        takenBy: action.takenBy,
        suspensionLevel: action.suspensionLevel
      }
    })

    // 📊 PART 2: Get current suspension status from ReviewerProfile
    const currentStatus = {
      suspensionLevel: guest.suspensionLevel,
      suspendedAt: guest.suspendedAt,
      suspendedReason: guest.suspendedReason,
      suspensionExpiresAt: guest.suspensionExpiresAt,
      bannedAt: guest.bannedAt,
      banReason: guest.banReason,
      warningCount: guest.warningCount,
      lastWarningAt: guest.lastWarningAt
    }

    // 🚨 PART 3: Parse active issues from GuestProfileStatus (if exists)
    const profileStatus = await prisma.guestProfileStatus.findUnique({
      where: { guestId: guest.id },
      select: {
        accountStatus: true,
        activeWarningCount: true,
        activeSuspensions: true,
        activeRestrictions: true,
        statusHistory: true,
        restrictionHistory: true
      }
    })

    const now = new Date()
    let activeSuspension = null
    let activeWarnings: any[] = []
    let activeRestrictions: any[] = []

    if (profileStatus) {
      const statusHistory = (profileStatus.statusHistory as any[]) || []
      const restrictionHistory = (profileStatus.restrictionHistory as any[]) || []

      // Extract active suspension
      const suspensionEvents = statusHistory.filter((event: any) => 
        event.type === 'ACCOUNT_SUSPENDED' || 
        event.type === 'ACCOUNT_HARD_SUSPENDED' ||
        event.type === 'ACCOUNT_BANNED'
      )

      if (suspensionEvents.length > 0) {
        const latestSuspension = suspensionEvents[suspensionEvents.length - 1]
        const expiresAt = latestSuspension.metadata?.expiresAt 
          ? new Date(latestSuspension.metadata.expiresAt)
          : null
        
        const isActive = !expiresAt || expiresAt > now
        
        if (isActive) {
          activeSuspension = {
            level: latestSuspension.type === 'ACCOUNT_BANNED' ? 'BANNED' :
                   latestSuspension.type === 'ACCOUNT_HARD_SUSPENDED' ? 'HARD' : 'SOFT',
            reason: latestSuspension.metadata?.reason || 'Violation of terms',
            suspendedAt: new Date(latestSuspension.timestamp),
            expiresAt: expiresAt,
            daysRemaining: calculateDaysRemaining(expiresAt),
            isPermanent: !expiresAt
          }
        }
      }

      // Extract active warnings
      const warningEvents = statusHistory.filter((event: any) => 
        event.type === 'WARNING_ISSUED'
      )

      activeWarnings = warningEvents
        .filter((event: any) => {
          const expiresAt = event.metadata?.expiresAt 
            ? new Date(event.metadata.expiresAt)
            : null
          return !expiresAt || expiresAt > now
        })
        .map((event: any) => {
          const expiresAt = event.metadata?.expiresAt 
            ? new Date(event.metadata.expiresAt)
            : null

          return {
            id: event.id || `warning-${event.timestamp}`,
            reason: event.metadata?.reason || 'Policy violation',
            severity: event.metadata?.severity || 'MEDIUM',
            issuedAt: new Date(event.timestamp),
            expiresAt: expiresAt,
            daysRemaining: calculateDaysRemaining(expiresAt),
            details: event.description || ''
          }
        })

      // Extract active restrictions
      activeRestrictions = restrictionHistory
        .filter((restriction: any) => {
          const endsAt = restriction.endsAt ? new Date(restriction.endsAt) : null
          return !endsAt || endsAt > now
        })
        .map((restriction: any) => {
          const endsAt = restriction.endsAt ? new Date(restriction.endsAt) : null

          return {
            type: restriction.type || 'BOOKING_RESTRICTED',
            reason: restriction.reason || 'Account restrictions applied',
            startedAt: new Date(restriction.startedAt),
            endsAt: endsAt,
            daysRemaining: calculateDaysRemaining(endsAt),
            isPermanent: !endsAt
          }
        })
    }

    // 🎯 PART 4: Determine if there are active issues
    const hasActiveIssues = 
      activeSuspension !== null ||
      activeWarnings.length > 0 ||
      activeRestrictions.length > 0 ||
      (guest.suspensionLevel as string | null) !== 'NONE' ||
      (guest.warningCount && guest.warningCount > 0)

    // 🎯 PART 5: Build comprehensive response
    return NextResponse.json({
      success: true,
      
      // Historical notifications (from GuestModeration table)
      notifications,
      totalActions: moderationActions.length,
      
      // Current status (from ReviewerProfile)
      currentStatus,
      
      // Active issues (parsed from GuestProfileStatus)
      activeIssues: {
        hasActiveIssues,
        accountStatus: profileStatus?.accountStatus || 'ACTIVE',
        suspension: activeSuspension,
        warnings: activeWarnings,
        restrictions: activeRestrictions,
        summary: {
          totalWarnings: profileStatus?.activeWarningCount || guest.warningCount || 0,
          totalSuspensions: profileStatus?.activeSuspensions || 0,
          totalRestrictions: activeRestrictions.length
        }
      }
    })

  } catch (error) {
    console.error('Failed to fetch moderation notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST - Mark notification as read
export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const payload = await verifyGuestToken(accessToken) as any
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { notificationId } = body

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID required' },
        { status: 400 }
      )
    }

    console.log('Notification marked as read:', {
      notificationId,
      userId: payload.userId,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read'
    })

  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}
