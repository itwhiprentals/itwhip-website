// app/api/guest/appeal-notifications/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'

/**
 * Appeal Notifications API
 * GET: Check for new appeal decisions (approved/denied)
 * POST: Mark notification as seen or dismissed
 */

// GET: Check for new appeal notifications
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userEmail = user.email
    const userId = user.id

    // Get guest ID from ReviewerProfile
    const profile = await prisma.reviewerProfile.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(userEmail ? [{ email: userEmail }] : [])
        ]
      },
      select: {
        id: true
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Guest profile not found' },
        { status: 404 }
      )
    }

    const guestId = profile.id

    // Get unseen notifications
    const notifications = await prisma.appealNotification.findMany({
      where: {
        guestId,
        seen: false,
        dismissedAt: null
      },
      include: {
        appeal: {
          select: {
            id: true,
            reason: true,
            status: true,
            submittedAt: true,
            reviewedBy: true,
            reviewedAt: true,
            reviewNotes: true,
            moderation: {
              select: {
                actionType: true,
                suspensionLevel: true,
                publicReason: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format notifications
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      message: notification.message,
      createdAt: notification.createdAt,
      appeal: {
        id: notification.appeal.id,
        reason: notification.appeal.reason,
        status: notification.appeal.status,
        submittedAt: notification.appeal.submittedAt,
        reviewedBy: notification.appeal.reviewedBy,
        reviewedAt: notification.appeal.reviewedAt,
        reviewNotes: notification.appeal.reviewNotes,
        originalAction: notification.appeal.moderation.actionType,
        suspensionLevel: notification.appeal.moderation.suspensionLevel,
        originalReason: notification.appeal.moderation.publicReason
      }
    }))

    // Separate by type
    const approved = formattedNotifications.filter(n => n.type === 'APPROVED')
    const denied = formattedNotifications.filter(n => n.type === 'DENIED')

    return NextResponse.json({
      success: true,
      hasNewNotifications: notifications.length > 0,
      notifications: {
        approved,
        denied,
        total: notifications.length
      }
    })
  } catch (error) {
    console.error('Error fetching appeal notifications:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST: Mark notification as seen or dismissed
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userEmail = user.email
    const userId = user.id

    // Get guest ID
    const profile = await prisma.reviewerProfile.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(userEmail ? [{ email: userEmail }] : [])
        ]
      },
      select: {
        id: true
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Guest profile not found' },
        { status: 404 }
      )
    }

    const guestId = profile.id
    const body = await request.json()
    const { notificationId, action } = body

    // Validate input
    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId is required' },
        { status: 400 }
      )
    }

    if (!action || !['seen', 'dismiss'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "seen" or "dismiss"' },
        { status: 400 }
      )
    }

    // Verify notification belongs to guest
    const notification = await prisma.appealNotification.findUnique({
      where: { id: notificationId }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    if (notification.guestId !== guestId) {
      return NextResponse.json(
        { error: 'Unauthorized - notification does not belong to you' },
        { status: 403 }
      )
    }

    // Update notification based on action
    const updateData: any = {}

    if (action === 'seen') {
      updateData.seen = true
    }

    if (action === 'dismiss') {
      updateData.seen = true
      updateData.dismissedAt = new Date()
    }

    const updated = await prisma.appealNotification.update({
      where: { id: notificationId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: action === 'dismiss' ? 'Notification dismissed' : 'Notification marked as seen',
      notification: {
        id: updated.id,
        seen: updated.seen,
        dismissedAt: updated.dismissedAt
      }
    })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PATCH: Batch mark all as seen (convenience endpoint)
export async function PATCH(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userEmail = user.email
    const userId = user.id

    // Get guest ID
    const profile = await prisma.reviewerProfile.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(userEmail ? [{ email: userEmail }] : [])
        ]
      },
      select: {
        id: true
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Guest profile not found' },
        { status: 404 }
      )
    }

    const guestId = profile.id
    const body = await request.json()
    const { action } = body

    if (!action || action !== 'mark_all_seen') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Mark all unseen notifications as seen
    const result = await prisma.appealNotification.updateMany({
      where: {
        guestId,
        seen: false
      },
      data: {
        seen: true
      }
    })

    return NextResponse.json({
      success: true,
      message: `Marked ${result.count} notification(s) as seen`,
      updatedCount: result.count
    })
  } catch (error) {
    console.error('Error batch updating notifications:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}