// app/api/admin/hosts/[id]/communications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
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

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // email, notification, document_request
    const limit = parseInt(searchParams.get('limit') || '50')

    // Get host details
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    // Fetch all communications
    const communications: any[] = []

    // 1. Host Notifications (system messages)
    if (!type || type === 'notification') {
      const notifications = await prisma.hostNotification.findMany({
        where: { hostId },
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      notifications.forEach(notif => {
        communications.push({
          id: notif.id,
          type: 'NOTIFICATION',
          direction: 'OUTBOUND',
          subject: notif.subject,
          message: notif.message,
          status: notif.status,
          priority: notif.priority,
          sentAt: notif.createdAt,
          readAt: notif.readAt,
          requiresAction: notif.responseRequired,
          actionUrl: notif.actionUrl,
          actionLabel: notif.actionLabel,
          metadata: notif.metadata
        })
      })
    }

    // 2. Document Requests (communications about missing/rejected documents)
    if (!type || type === 'document_request') {
      const documentRequests = await prisma.activityLog.findMany({
        where: {
          entityType: 'HOST',
          entityId: hostId,
          action: {
            in: ['DOCUMENT_REQUESTED', 'DOCUMENT_REJECTED', 'DOCUMENTS_REQUESTED']
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      documentRequests.forEach(req => {
        const details = req.metadata as any
        communications.push({
          id: req.id,
          type: 'DOCUMENT_REQUEST',
          direction: 'OUTBOUND',
          subject: `Document Request: ${details?.documentType || 'Multiple Documents'}`,
          message: details?.message || 'Please upload the requested documents',
          status: 'SENT',
          priority: 'HIGH',
          sentAt: req.createdAt,
          requestedBy: req.userId,
          metadata: details
        })
      })
    }

    // 3. Email Communications (if tracked)
    // This would come from your email service logs
    if (!type || type === 'email') {
      const emailLogs = await prisma.activityLog.findMany({
        where: {
          entityType: 'HOST',
          entityId: hostId,
          action: {
            in: [
              'EMAIL_SENT',
              'APPROVAL_EMAIL_SENT',
              'REJECTION_EMAIL_SENT',
              'SUSPENSION_EMAIL_SENT',
              'WELCOME_EMAIL_SENT'
            ]
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      emailLogs.forEach(log => {
        const details = log.metadata as any
        communications.push({
          id: log.id,
          type: 'EMAIL',
          direction: 'OUTBOUND',
          subject: details?.subject || 'Email Communication',
          message: details?.preview || 'Email sent to host',
          status: details?.deliveryStatus || 'SENT',
          priority: 'MEDIUM',
          sentAt: log.createdAt,
          sentBy: log.userId,
          metadata: details
        })
      })
    }

    // 4. Admin Notes/Messages (internal communications)
    const adminNotes = await prisma.activityLog.findMany({
      where: {
        entityType: 'HOST',
        entityId: hostId,
        action: {
          in: ['NOTE_ADDED', 'INTERNAL_MESSAGE', 'ADMIN_COMMENT']
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    adminNotes.forEach(note => {
      const details = note.metadata as any
      communications.push({
        id: note.id,
        type: 'INTERNAL_NOTE',
        direction: 'INTERNAL',
        subject: 'Admin Note',
        message: details?.note || details?.message || 'Internal note added',
        status: 'INTERNAL',
        priority: 'LOW',
        sentAt: note.createdAt,
        sentBy: note.userId,
        metadata: details
      })
    })

    // Sort all communications by date (newest first)
    communications.sort((a, b) => 
      new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    )

    // Calculate statistics
    const stats = {
      total: communications.length,
      byType: {
        notification: communications.filter(c => c.type === 'NOTIFICATION').length,
        documentRequest: communications.filter(c => c.type === 'DOCUMENT_REQUEST').length,
        email: communications.filter(c => c.type === 'EMAIL').length,
        internalNote: communications.filter(c => c.type === 'INTERNAL_NOTE').length
      },
      byStatus: {
        sent: communications.filter(c => c.status === 'SENT').length,
        read: communications.filter(c => c.readAt).length,
        pending: communications.filter(c => c.status === 'PENDING').length
      },
      requiresAction: communications.filter(c => c.requiresAction).length,
      lastCommunication: communications.length > 0 ? communications[0].sentAt : null
    }

    return NextResponse.json({
      success: true,
      data: {
        hostId,
        hostName: host.name,
        hostEmail: host.email,
        communications,
        stats
      }
    })

  } catch (error) {
    console.error('Error fetching host communications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch host communications' },
      { status: 500 }
    )
  }
}

// POST - Send a new communication to host
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hostId } = await params
    const body = await request.json()

    const {
      type = 'NOTIFICATION', // NOTIFICATION, EMAIL, DOCUMENT_REQUEST
      subject,
      message,
      priority = 'MEDIUM',
      requiresAction = false,
      actionUrl,
      actionLabel,
      documents = [] // for document requests
    } = body

    // Verify admin authentication
    const adminId = request.headers.get('x-admin-id')
    const adminEmail = request.headers.get('x-admin-email')
    
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    // Validation
    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      )
    }

    // Get host details
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    let result

    switch (type) {
      case 'NOTIFICATION':
        // Create host notification
        result = await prisma.hostNotification.create({
          data: {
            id: crypto.randomUUID(),
            hostId,
            type: 'ADMIN_MESSAGE',
            category: 'admin',
            subject,
            message,
            status: 'SENT',
            priority,
            responseRequired: requiresAction,
            actionUrl: actionUrl || null,
            actionLabel: actionLabel || null,
            metadata: {
              sentBy: adminId,
              sentByEmail: adminEmail,
              sentAt: new Date().toISOString()
            } as any,
            updatedAt: new Date()
          }
        })

        // Log activity
        await prisma.activityLog.create({
          data: {
            id: crypto.randomUUID(),
            entityType: 'HOST',
            entityId: hostId,
            action: 'NOTIFICATION_SENT',
            userId: adminId,
            metadata: {
              hostId,
              notificationId: result.id,
              subject,
              priority
            } as any,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
          }
        })
        break

      case 'DOCUMENT_REQUEST':
        // Create document request notification
        result = await prisma.hostNotification.create({
          data: {
            id: crypto.randomUUID(),
            hostId,
            type: 'DOCUMENTS_REQUESTED',
            category: 'documents',
            subject,
            message,
            status: 'SENT',
            priority: 'HIGH',
            responseRequired: true,
            actionUrl: '/host/profile',
            actionLabel: 'Upload Documents',
            metadata: {
              sentBy: adminId,
              requestedDocuments: documents,
              sentAt: new Date().toISOString()
            } as any,
            updatedAt: new Date()
          }
        })

        // Update host with pending actions
        await prisma.rentalHost.update({
          where: { id: hostId },
          data: {
            pendingActions: documents,
            documentsRequestedAt: new Date(),
            lastNotificationSent: new Date()
          }
        })

        // Log activity
        await prisma.activityLog.create({
          data: {
            id: crypto.randomUUID(),
            entityType: 'HOST',
            entityId: hostId,
            action: 'DOCUMENTS_REQUESTED',
            userId: adminId,
            metadata: {
              hostId,
              documents,
              message
            } as any,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
          }
        })

        // TODO: Send actual email to host
        console.log(`Document request email should be sent to: ${host.email}`)
        break

      case 'EMAIL':
        // Log email sending
        await prisma.activityLog.create({
          data: {
            id: crypto.randomUUID(),
            entityType: 'HOST',
            entityId: hostId,
            action: 'EMAIL_SENT',
            userId: adminId,
            metadata: {
              hostId,
              subject,
              preview: message.substring(0, 200),
              sentTo: host.email
            } as any,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
          }
        })

        // TODO: Send actual email via email service
        console.log(`Email should be sent to: ${host.email}`)
        console.log(`Subject: ${subject}`)

        result = {
          id: `email-${Date.now()}`,
          type: 'EMAIL',
          status: 'SENT',
          sentAt: new Date()
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid communication type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: 'Communication sent successfully',
      data: {
        communicationId: result.id,
        hostId,
        hostEmail: host.email,
        type,
        sentAt: new Date(),
        status: 'SENT'
      }
    })

  } catch (error) {
    console.error('Error sending host communication:', error)
    return NextResponse.json(
      { error: 'Failed to send communication' },
      { status: 500 }
    )
  }
}