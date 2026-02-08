// app/api/admin/hosts/[id]/timeline/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hostId } = await params

    // Verify admin authentication
    const adminId = request.headers.get('x-admin-id')
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    // Get host details
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        approvalStatus: true
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    // Build timeline from multiple sources
    const timelineEvents = []

    // 1. Host Registration
    timelineEvents.push({
      id: `reg-${host.id}`,
      type: 'REGISTRATION',
      title: 'Host Application Submitted',
      description: `${host.name} submitted their host application`,
      timestamp: host.createdAt,
      actor: host.name,
      category: 'ACCOUNT',
      icon: 'person-add',
      metadata: {
        email: host.email
      }
    })

    // 2. Get all activity logs for this host
    const activityLogs = await prisma.activityLog.findMany({
      where: {
        OR: [
          { entityType: 'HOST', entityId: hostId },
          {
            metadata: {
              path: ['hostId'],
              equals: hostId
            }
          }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    activityLogs.forEach(log => {
      timelineEvents.push({
        id: log.id,
        type: log.action,
        title: formatActivityTitle(log.action),
        description: formatActivityDescription(log),
        timestamp: log.createdAt,
        actor: log.userId || 'System',
        category: 'ACTIVITY',
        icon: getActivityIcon(log.action),
        metadata: log.metadata
      })
    })

    // 3. Background checks
    const backgroundChecks = await prisma.backgroundCheck.findMany({
      where: { hostId },
      orderBy: { createdAt: 'desc' }
    })

    backgroundChecks.forEach(check => {
      timelineEvents.push({
        id: `bgcheck-${check.id}`,
        type: 'BACKGROUND_CHECK',
        title: `Background Check ${check.status}`,
        description: `Background verification ${(check.status as string).toLowerCase()}`,
        timestamp: check.createdAt,
        actor: 'System',
        category: 'VERIFICATION',
        icon: 'shield',
        metadata: {
          status: check.status,
          checkType: check.checkType,
          passed: check.passed,
          details: check.details
        }
      })

      if (check.completedAt) {
        timelineEvents.push({
          id: `bgcheck-complete-${check.id}`,
          type: 'BACKGROUND_CHECK_COMPLETED',
          title: 'Background Check Completed',
          description: `Verification ${check.status === 'PASSED' ? 'passed successfully' : 'failed'}`,
          timestamp: check.completedAt,
          actor: 'System',
          category: 'VERIFICATION',
          icon: check.status === 'PASSED' ? 'checkmark-circle' : 'close-circle',
          metadata: {
            status: check.status
          }
        })
      }
    })

    // 4. Notifications sent to host
    const notifications = await prisma.hostNotification.findMany({
      where: { hostId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    notifications.forEach(notification => {
      timelineEvents.push({
        id: `notif-${notification.id}`,
        type: 'NOTIFICATION',
        title: notification.subject,
        description: notification.message,
        timestamp: notification.createdAt,
        actor: 'System',
        category: 'COMMUNICATION',
        icon: 'mail',
        metadata: {
          type: notification.type,
          status: notification.status,
          priority: notification.priority
        }
      })
    })

    // 5. Status changes (extracted from activity logs or direct host updates)
    if (host.approvalStatus) {
      // Find when approval status changed
      const statusChanges = activityLogs.filter(log => 
        log.action.includes('APPROVED') || 
        log.action.includes('REJECTED') || 
        log.action.includes('SUSPENDED')
      )

      statusChanges.forEach(change => {
        const status = change.action.split('_')[1] || change.action
        timelineEvents.push({
          id: `status-${change.id}`,
          type: 'STATUS_CHANGE',
          title: `Host ${status}`,
          description: `Approval status changed to ${status}`,
          timestamp: change.createdAt,
          actor: change.userId || 'Admin',
          category: 'STATUS',
          icon: getStatusIcon(status),
          metadata: change.metadata
        })
      })
    }

    // 6. Vehicle additions
    const vehicles = await (prisma as any).car.findMany({
      where: { hostId },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    vehicles.forEach((vehicle: any) => {
      timelineEvents.push({
        id: `vehicle-${vehicle.id}`,
        type: 'VEHICLE_ADDED',
        title: 'Vehicle Added',
        description: `${vehicle.year} ${vehicle.make} ${vehicle.model} added to fleet`,
        timestamp: vehicle.createdAt,
        actor: host.name,
        category: 'FLEET',
        icon: 'car',
        metadata: {
          vehicleId: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year
        }
      })
    })

    // Sort all events by timestamp (newest first)
    timelineEvents.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    // Group events by date
    const groupedTimeline = groupEventsByDate(timelineEvents)

    return NextResponse.json({
      success: true,
      data: {
        hostId,
        hostName: host.name,
        totalEvents: timelineEvents.length,
        timeline: timelineEvents,
        groupedTimeline,
        summary: {
          totalActivities: activityLogs.length,
          backgroundChecks: backgroundChecks.length,
          notifications: notifications.length,
          vehicles: vehicles.length
        }
      }
    })

  } catch (error) {
    console.error('Error fetching host timeline:', error)
    return NextResponse.json(
      { error: 'Failed to fetch host timeline' },
      { status: 500 }
    )
  }
}

// Helper functions
function formatActivityTitle(action: string): string {
  return action
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase())
}

function formatActivityDescription(log: any): string {
  const details = log.details as any
  
  switch (log.action) {
    case 'HOST_APPROVED':
      return `Host application approved by admin`
    case 'HOST_REJECTED':
      return `Host application rejected: ${details?.reason || 'No reason provided'}`
    case 'HOST_SUSPENDED':
      return `Host suspended: ${details?.reason || 'No reason provided'}`
    case 'DOCUMENT_UPLOADED':
      return `Document uploaded: ${details?.documentType || 'Unknown'}`
    case 'DOCUMENT_APPROVED':
      return `Document approved: ${details?.documentType || 'Unknown'}`
    case 'DOCUMENT_REJECTED':
      return `Document rejected: ${details?.documentType || 'Unknown'}`
    default:
      return log.action.replace(/_/g, ' ').toLowerCase()
  }
}

function getActivityIcon(action: string): string {
  if (action.includes('APPROVED')) return 'checkmark-circle'
  if (action.includes('REJECTED')) return 'close-circle'
  if (action.includes('SUSPENDED')) return 'ban'
  if (action.includes('DOCUMENT')) return 'document'
  if (action.includes('VEHICLE')) return 'car'
  if (action.includes('BOOKING')) return 'calendar'
  return 'information-circle'
}

function getStatusIcon(status: string): string {
  switch (status.toUpperCase()) {
    case 'APPROVED':
      return 'checkmark-circle'
    case 'REJECTED':
      return 'close-circle'
    case 'SUSPENDED':
      return 'ban'
    case 'PENDING':
      return 'time'
    default:
      return 'information-circle'
  }
}

function groupEventsByDate(events: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {}
  
  events.forEach(event => {
    const date = new Date(event.timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    if (!grouped[date]) {
      grouped[date] = []
    }
    
    grouped[date].push(event)
  })
  
  return grouped
}