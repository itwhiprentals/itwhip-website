// app/api/host/notifications/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Helper function to verify host token
async function verifyHostToken(request: NextRequest) {
  try {
    // Check for token in cookies or headers
    const cookieToken = request.cookies.get('hostAccessToken')?.value
    const headerToken = request.headers.get('authorization')?.replace('Bearer ', '')
    
    const token = cookieToken || headerToken
    
    if (!token) {
      return null
    }
    
    const decoded = verify(token, JWT_SECRET) as any
    
    // Verify host exists
    const host = await prisma.rentalHost.findUnique({
      where: { id: decoded.hostId },
      select: {
        id: true,
        email: true,
        name: true,
        approvalStatus: true
      }
    })
    
    return host
  } catch (error) {
    console.error('Host token verification failed:', error)
    return null
  }
}

// GET - Fetch host notifications
export async function GET(request: NextRequest) {
  try {
    // Verify host authentication
    const host = await verifyHostToken(request)
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') // 'unread', 'read', 'all'
    const priority = searchParams.get('priority') // 'HIGH', 'MEDIUM', 'LOW'
    const type = searchParams.get('type') // notification type filter
    
    // Build where clause
    const where: any = {
      hostId: host.id
    }
    
    // Apply filters
    if (status && status !== 'all') {
      if (status === 'unread') {
        where.readAt = null
      } else if (status === 'read') {
        where.NOT = { readAt: null }
      }
    }
    
    if (priority) {
      where.priority = priority.toUpperCase()
    }
    
    if (type) {
      where.type = type
    }
    
    // Get total count for pagination
    const totalCount = await prisma.hostNotification.count({ where })
    
    // ✅ FIXED: Removed 'response' field that doesn't exist
    const notifications = await prisma.hostNotification.findMany({
      where,
      orderBy: [
        { priority: 'desc' }, // HIGH first
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        hostId: true,
        type: true,
        category: true,
        subject: true,              
        message: true,
        status: true,
        priority: true,
        actionUrl: true,
        actionLabel: true,
        actionRequired: true,       
        actionCompleted: true,
        expiresAt: true,
        readAt: true,
        respondedAt: true,
        responseRequired: true,
        responseReceived: true,      // This is the correct field for response
        responseDeadline: true,
        // response: true,            // ✅ REMOVED - This field doesn't exist
        sentAt: true,
        emailSent: true,
        smsSent: true,
        pushSent: true,
        inAppShown: true,
        relatedDocumentType: true,
        relatedCheckType: true,
        reminderCount: true,
        lastReminderAt: true,
        nextReminderAt: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    // Calculate unread count
    const unreadCount = await prisma.hostNotification.count({
      where: {
        hostId: host.id,
        readAt: null
      }
    })
    
    // Calculate counts by priority
    const priorityCounts = await prisma.hostNotification.groupBy({
      by: ['priority'],
      where: {
        hostId: host.id,
        readAt: null
      },
      _count: true
    })
    
    const priorityBreakdown = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    }
    
    priorityCounts.forEach(item => {
      priorityBreakdown[item.priority as keyof typeof priorityBreakdown] = item._count
    })
    
    // ✅ FIX: Updated field names
    const criticalNotifications = notifications.filter(n => 
      n.actionRequired && 
      !n.actionCompleted && 
      n.priority === 'HIGH' &&
      (!n.expiresAt || new Date(n.expiresAt) > new Date())
    )
    
    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPreviousPage: page > 1
        },
        summary: {
          unreadCount,
          priorityBreakdown,
          hasCriticalActions: criticalNotifications.length > 0,
          criticalCount: criticalNotifications.length
        }
      }
    })
    
  } catch (error) {
    console.error('Fetch notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// PUT - Mark notifications as read or update response
export async function PUT(request: NextRequest) {
  try {
    // Verify host authentication
    const host = await verifyHostToken(request)
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    const { notificationIds, action, response } = body
    
    // Validate required fields
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { error: 'Notification IDs are required' },
        { status: 400 }
      )
    }
    
    // Validate action
    const validActions = ['read', 'unread', 'respond', 'dismiss']
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Valid action is required (read, unread, respond, dismiss)' },
        { status: 400 }
      )
    }
    
    // Verify all notifications belong to this host
    const notifications = await prisma.hostNotification.findMany({
      where: {
        id: { in: notificationIds },
        hostId: host.id
      }
    })
    
    if (notifications.length !== notificationIds.length) {
      return NextResponse.json(
        { error: 'One or more notifications not found or unauthorized' },
        { status: 404 }
      )
    }
    
    // Prepare update data based on action
    let updateData: any = {}
    
    switch (action) {
      case 'read':
        updateData.readAt = new Date()
        updateData.status = 'READ'
        break
        
      case 'unread':
        updateData.readAt = null
        updateData.status = 'SENT'
        break
        
      case 'respond':
        if (!response) {
          return NextResponse.json(
            { error: 'Response is required for respond action' },
            { status: 400 }
          )
        }
        updateData.respondedAt = new Date()
        updateData.responseReceived = response  // ✅ FIXED: Store response in correct field
        updateData.readAt = new Date()
        updateData.status = 'RESPONDED'
        break
        
      case 'dismiss':
        updateData.readAt = new Date()
        updateData.status = 'DISMISSED'
        break
    }
    
    // Update notifications
    const result = await prisma.hostNotification.updateMany({
      where: {
        id: { in: notificationIds },
        hostId: host.id
      },
      data: updateData
    })
    
    // Log activity for important actions
    if (action === 'respond' || action === 'dismiss') {
      await prisma.activityLog.create({
        data: {
          entityType: 'HOST',
          entityId: host.id,
          action: `NOTIFICATION_${action.toUpperCase()}`,
          metadata: {
            notificationIds,
            action,
            response: response || null,
            hostId: host.id,
            hostName: host.name
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: `${result.count} notification(s) ${action === 'read' ? 'marked as read' : action === 'respond' ? 'responded to' : action === 'dismiss' ? 'dismissed' : 'updated'}`,
      data: {
        updatedCount: result.count,
        action
      }
    })
    
  } catch (error) {
    console.error('Update notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}

// POST - Create a test notification (for development/testing)
export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Not available in production' },
        { status: 403 }
      )
    }
    
    // Verify host authentication
    const host = await verifyHostToken(request)
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }
    
    // ✅ FIX: Changed 'title' to 'subject' and updated fields
    const notification = await prisma.hostNotification.create({
      data: {
        hostId: host.id,
        type: 'TEST_NOTIFICATION',
        category: 'GENERAL',
        subject: 'Test Notification',    
        message: 'This is a test notification for development purposes.',
        status: 'SENT',
        priority: 'LOW',
        actionRequired: false,            
        sentAt: new Date(),
        inAppShown: true
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Test notification created',
      data: notification
    })
    
  } catch (error) {
    console.error('Create test notification error:', error)
    return NextResponse.json(
      { error: 'Failed to create test notification' },
      { status: 500 }
    )
  }
}