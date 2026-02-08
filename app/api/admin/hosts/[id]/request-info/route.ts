// app/fleet/api/hosts/[id]/request-info/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { auditService, AuditEventType, AuditEntityType } from '@/app/lib/audit/audit-service'
import { sendHostDocumentRequest } from '@/app/lib/email'
import crypto from 'crypto'

// POST - Request additional information or documents from a specific host
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847' && !request.headers.get('authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized - Fleet access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { requestType, documents, customMessage, priority, deadline } = body

    // Validate required fields
    if (!requestType) {
      return NextResponse.json(
        { error: 'Missing required field: requestType' },
        { status: 400 }
      )
    }

    // Validate request type
    const validRequestTypes = ['documents', 'clarification', 'update_info', 'verify_details']
    if (!validRequestTypes.includes(requestType)) {
      return NextResponse.json(
        { error: `Invalid requestType. Must be one of: ${validRequestTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Fetch the host
    const host = await prisma.rentalHost.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true
          }
        }
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    // Platform Fleet hosts - special handling
    if (host.hostType === 'MANAGED') {
      return NextResponse.json(
        {
          error: 'Cannot request information from Platform Fleet hosts',
          hostType: 'MANAGED',
          message: 'Platform Fleet hosts are managed directly through the fleet system'
        },
        { status: 400 }
      )
    }

    let result

    switch (requestType) {
      case 'documents':
        result = await requestDocuments(host, documents, customMessage, priority, deadline)
        break

      case 'clarification':
        result = await requestClarification(host, customMessage, priority)
        break

      case 'update_info':
        result = await requestInfoUpdate(host, customMessage, priority)
        break

      case 'verify_details':
        result = await requestVerification(host, customMessage, priority)
        break

      default:
        throw new Error('Invalid request type')
    }

    // Log audit event
    await auditService.log(
      AuditEventType.UPDATE,
      AuditEntityType.HOST,
      id,
      {
        action: 'REQUEST_INFO',
        requestType,
        documents: documents || [],
        priority: priority || 'MEDIUM'
      }
    )

    return NextResponse.json({
      success: true,
      hostId: id,
      hostName: host.user?.name,
      requestType,
      ...result
    })

  } catch (error) {
    console.error('Fleet request info error:', error)
    return NextResponse.json(
      { error: 'Failed to request information from host' },
      { status: 500 }
    )
  }
}

// GET - View pending information requests for a host
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847' && !request.headers.get('authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized - Fleet access required' },
        { status: 401 }
      )
    }

    // Fetch host with pending requests
    const host = await prisma.rentalHost.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    // Get pending document requests
    const documentRequests = await prisma.hostDocumentStatus.findMany({
      where: {
        hostId: id,
        status: 'RESUBMISSION_REQUIRED' as const
      },
      orderBy: {
        requestedAt: 'desc'
      }
    })

    // Get pending notifications that require action
    const pendingNotifications = await prisma.hostNotification.findMany({
      where: {
        hostId: id,
        actionRequired: { not: null },
        status: 'PENDING'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Check for overdue items
    const now = new Date()
    const overdueDocuments = documentRequests.filter(doc =>
      doc.expiryDate && new Date(doc.expiryDate) < now
    )

    return NextResponse.json({
      success: true,
      hostId: id,
      hostName: host.user?.name,
      summary: {
        totalPendingDocuments: documentRequests.length,
        overdueDocuments: overdueDocuments.length,
        pendingActions: host.pendingActions || [],
        unreadNotifications: pendingNotifications.length
      },
      documentRequests: documentRequests.map(doc => ({
        id: doc.id,
        documentType: doc.documentType,
        status: doc.status,
        feedback: doc.feedback,
        requestedAt: doc.requestedAt,
        expiryDate: doc.expiryDate,
        isOverdue: doc.expiryDate ? new Date(doc.expiryDate) < now : false
      })),
      pendingNotifications: pendingNotifications.map(notif => ({
        id: notif.id,
        type: notif.type,
        subject: notif.subject,
        message: notif.message,
        priority: notif.priority,
        createdAt: notif.createdAt
      })),
      hostStatus: {
        approvalStatus: host.approvalStatus,
        backgroundCheckStatus: host.backgroundCheckStatus,
        documentStatuses: host.documentStatuses
      }
    })

  } catch (error) {
    console.error('Fleet get requests error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch host requests' },
      { status: 500 }
    )
  }
}

// Helper function: Request documents
async function requestDocuments(
  host: any,
  documents: any[],
  customMessage: string | undefined,
  priority: string | undefined,
  deadline: string | undefined
) {
  if (!documents || documents.length === 0) {
    throw new Error('Documents array is required for document requests')
  }

  // Calculate deadline (default 3 days if not provided)
  const requestDeadline = deadline
    ? new Date(deadline)
    : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)

  const result = await prisma.$transaction(async (tx) => {
    // Update host status to NEEDS_ATTENTION
    await tx.rentalHost.update({
      where: { id: host.id },
      data: {
        approvalStatus: 'NEEDS_ATTENTION',
        pendingActions: documents.map((doc: any) => `UPLOAD_${doc.type.toUpperCase()}`)
      }
    })

    // Create document status records
    const documentStatuses = []
    for (const doc of documents) {
      const docStatus = await tx.hostDocumentStatus.create({
        data: {
          id: crypto.randomUUID(),
          hostId: host.id,
          documentType: doc.type,
          status: 'RESUBMISSION_REQUIRED',
          requestedAt: new Date(),
          feedback: doc.issue || customMessage || 'Document required',
          updatedAt: new Date()
        }
      })
      documentStatuses.push(docStatus)
    }

    // Create host notification
    await tx.hostNotification.create({
      data: {
        id: crypto.randomUUID(),
        hostId: host.id,
        type: 'DOCUMENT_REQUEST',
        category: 'document',
        subject: 'Documents Required',
        message: customMessage || `Please upload ${documents.length} document(s) to continue your application.`,
        priority: priority || 'HIGH',
        responseRequired: true,
        actionRequired: 'upload_documents',
        actionUrl: '/host/profile',
        metadata: {
          documents: documents.map((d: any) => d.type),
          deadline: requestDeadline
        } as any,
        updatedAt: new Date()
      }
    })

    // Create admin notification for tracking
    await tx.adminNotification.create({
      data: {
        id: crypto.randomUUID(),
        type: 'DOCUMENT_REQUEST_SENT',
        title: 'Documents Requested from Host',
        message: `Document request sent to ${host.user?.name || host.user?.email}`,
        priority: 'LOW',
        metadata: {
          hostId: host.id,
          documents: documents.map((d: any) => d.type),
          requestedBy: 'FLEET_SYSTEM'
        } as any,
        updatedAt: new Date()
      }
    })

    return { documentStatuses }
  })

  // Send email notification
  try {
    await sendHostDocumentRequest(host.user.email, {
      name: host.user.name || 'Host',
      documentIssues: documents.map((doc: any) => ({
        documentType: doc.type,
        issue: doc.issue || 'Document required',
        instructions: doc.instructions || 'Please upload a clear, readable copy'
      })),
      deadline: requestDeadline.toLocaleDateString(),
      uploadUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/host/profile`,
      supportEmail: 'info@itwhip.com'
    })
  } catch (emailError) {
    console.error('Failed to send document request email:', emailError)
  }

  return {
    message: 'Document request sent successfully',
    documentsRequested: documents.map((d: any) => d.type),
    deadline: requestDeadline,
    documentStatuses: result.documentStatuses
  }
}

// Helper function: Request clarification
async function requestClarification(
  host: any,
  message: string | undefined,
  priority: string | undefined
) {
  if (!message) {
    throw new Error('Custom message is required for clarification requests')
  }

  await prisma.$transaction(async (tx) => {
    // Create host notification
    await tx.hostNotification.create({
      data: {
        id: crypto.randomUUID(),
        hostId: host.id,
        type: 'CLARIFICATION_REQUEST',
        category: 'general',
        subject: 'Clarification Needed',
        message: message,
        priority: priority || 'MEDIUM',
        actionRequired: 'provide_clarification',
        actionUrl: '/host/dashboard',
        updatedAt: new Date()
      }
    })

    // Update pending actions
    const currentActions = host.pendingActions || []
    await tx.rentalHost.update({
      where: { id: host.id },
      data: {
        pendingActions: [...currentActions, 'PROVIDE_CLARIFICATION']
      }
    })
  })

  return {
    message: 'Clarification request sent successfully',
    requestedClarification: message
  }
}

// Helper function: Request info update
async function requestInfoUpdate(
  host: any,
  message: string | undefined,
  priority: string | undefined
) {
  if (!message) {
    throw new Error('Custom message is required for info update requests')
  }

  await prisma.$transaction(async (tx) => {
    // Create host notification
    await tx.hostNotification.create({
      data: {
        id: crypto.randomUUID(),
        hostId: host.id,
        type: 'INFO_UPDATE_REQUEST',
        category: 'general',
        subject: 'Please Update Your Information',
        message: message,
        priority: priority || 'MEDIUM',
        actionRequired: 'update_information',
        actionUrl: '/host/profile',
        updatedAt: new Date()
      }
    })

    // Update pending actions
    const currentActions = host.pendingActions || []
    await tx.rentalHost.update({
      where: { id: host.id },
      data: {
        pendingActions: [...currentActions, 'UPDATE_INFORMATION']
      }
    })
  })

  return {
    message: 'Info update request sent successfully',
    requestedUpdate: message
  }
}

// Helper function: Request verification
async function requestVerification(
  host: any,
  message: string | undefined,
  priority: string | undefined
) {
  if (!message) {
    throw new Error('Custom message is required for verification requests')
  }

  await prisma.$transaction(async (tx) => {
    // Create host notification
    await tx.hostNotification.create({
      data: {
        id: crypto.randomUUID(),
        hostId: host.id,
        type: 'VERIFICATION_REQUEST',
        category: 'verification',
        subject: 'Verification Required',
        message: message,
        priority: priority || 'HIGH',
        actionRequired: 'verify_details',
        actionUrl: '/host/dashboard',
        updatedAt: new Date()
      }
    })

    // Update pending actions
    const currentActions = host.pendingActions || []
    await tx.rentalHost.update({
      where: { id: host.id },
      data: {
        approvalStatus: 'NEEDS_ATTENTION',
        pendingActions: [...currentActions, 'VERIFY_DETAILS']
      }
    })
  })

  return {
    message: 'Verification request sent successfully',
    requestedVerification: message
  }
}

// DELETE - Cancel/remove a pending request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847' && !request.headers.get('authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized - Fleet access required' },
        { status: 401 }
      )
    }

    const documentStatusId = request.nextUrl.searchParams.get('documentStatusId')

    if (!documentStatusId) {
      return NextResponse.json(
        { error: 'Missing required parameter: documentStatusId' },
        { status: 400 }
      )
    }

    // Cancel the document request
    await prisma.hostDocumentStatus.update({
      where: { id: documentStatusId },
      data: {
        status: 'NOT_UPLOADED',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Document request cancelled successfully'
    })

  } catch (error) {
    console.error('Fleet cancel request error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel request' },
      { status: 500 }
    )
  }
}
