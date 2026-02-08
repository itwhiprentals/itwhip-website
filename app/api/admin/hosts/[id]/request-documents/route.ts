// app/api/admin/hosts/[id]/request-documents/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyAdminToken } from '@/app/lib/admin/auth'
import { sendHostDocumentRequest } from '@/app/lib/email'

// POST - Request specific documents from a host
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hostId } = await params
    
    // Verify admin authentication
    const adminToken = request.cookies.get('adminAccessToken')
    
    if (!adminToken) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      )
    }
    
    const adminPayload = await verifyAdminToken(adminToken.value)
    
    if (!adminPayload) {
      return NextResponse.json(
        { error: 'Invalid admin token' },
        { status: 401 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    const { documents, message, deadline, priority } = body
    
    // Validate required fields
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { error: 'At least one document must be specified' },
        { status: 400 }
      )
    }
    
    // Validate document types
    const validDocumentTypes = [
      'governmentId',
      'driversLicense',
      'insurance',
      'proofOfAddress',
      'bankStatement',
      'taxDocuments',
      'vehicleRegistration'
    ]
    
    const invalidDocs = documents.filter((doc: any) => !validDocumentTypes.includes(doc.type))
    if (invalidDocs.length > 0) {
      return NextResponse.json(
        { error: `Invalid document types: ${invalidDocs.map((d: any) => d.type).join(', ')}` },
        { status: 400 }
      )
    }
    
    // Get host details
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: {
        user: {
          select: {
            email: true
          }
        },
        HostDocumentStatus: true
      }
    }) as any
    
    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }
    
    // Prevent actions on platform fleet
    if (host.hostType === 'MANAGED') {
      return NextResponse.json(
        { error: 'Cannot request documents from platform fleet hosts' },
        { status: 403 }
      )
    }
    
    // Calculate deadline
    const deadlineDate = deadline 
      ? new Date(deadline)
      : new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)) // Default 3 days
    
    // Process in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update host status if needed
      const currentPendingActions = (host.pendingActions as string[]) || []
      const newPendingActions = new Set(currentPendingActions)
      
      // Add document requests to pending actions
      documents.forEach((doc: any) => {
        newPendingActions.add(`upload_${doc.type}`)
      })
      
      // Update host record
      const updatedHost = await tx.rentalHost.update({
        where: { id: hostId },
        data: {
          approvalStatus: host.approvalStatus === 'APPROVED' ? 'APPROVED' : 'NEEDS_ATTENTION',
          pendingActions: Array.from(newPendingActions),
          documentsRequestedAt: new Date(),
          lastNotificationSent: new Date()
        }
      })
      
      // Create or update document status records
      for (const doc of documents) {
        await (tx.hostDocumentStatus.upsert as any)({
          where: {
            hostId_documentType: {
              hostId: hostId,
              documentType: doc.type
            }
          },
          update: {
            reviewStatus: 'NEEDS_RESUBMISSION',
            reviewNotes: doc.issue || 'Document needs to be resubmitted',
            reviewedAt: new Date(),
            reviewedBy: adminPayload.userId,
            requestedAt: new Date(),
            requestDeadline: deadlineDate
          },
          create: {
            hostId: hostId,
            documentType: doc.type,
            status: 'NOT_UPLOADED',
            reviewStatus: 'NEEDS_RESUBMISSION',
            reviewNotes: doc.issue || 'Document required',
            reviewedBy: adminPayload.userId,
            requestedAt: new Date(),
            requestDeadline: deadlineDate
          }
        })
      }
      
      // Create host notification
      const notification = await (tx.hostNotification.create as any)({
        data: {
          hostId: hostId,
          type: 'DOCUMENT_REQUEST',
          title: 'Documents Required',
          message: message || `Please upload the following documents: ${documents.map((d: any) => d.type).join(', ')}`,
          status: 'SENT',
          priority: priority?.toUpperCase() || 'HIGH',
          requiresAction: true,
          actionUrl: '/host/profile',
          actionLabel: 'Upload Documents',
          expiresAt: deadlineDate,
          metadata: {
            documents: documents,
            deadline: deadlineDate.toISOString(),
            requestedBy: adminPayload.userId,
            requestedAt: new Date().toISOString()
          }
        }
      })
      
      // Create admin notification for tracking
      await (tx.adminNotification.create as any)({
        data: {
          type: 'DOCUMENT_REQUEST_SENT',
          title: 'Document Request Sent',
          message: `Requested ${documents.length} document(s) from ${host.name}`,
          priority: 'low',
          status: 'unread',
          metadata: {
            hostId: hostId,
            hostName: host.name,
            documents: documents.map((d: any) => d.type),
            deadline: deadlineDate.toISOString(),
            adminId: adminPayload.userId
          },
          updatedAt: new Date()
        }
      })
      
      // Create activity log
      await (tx.activityLog.create as any)({
        data: {
          entityType: 'HOST',
          entityId: hostId,
          action: 'DOCUMENTS_REQUESTED',
          userId: adminPayload.userId,
          details: {
            hostId: hostId,
            hostName: host.name,
            documentsRequested: documents,
            deadline: deadlineDate.toISOString(),
            message: message || null,
            priority: priority || 'HIGH'
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })
      
      return { updatedHost, notification }
    })
    
    // Send email notification
    try {
      if (host.email) {
        // Format document issues for email
        const documentIssues = documents.map((doc: any) => ({
          documentType: doc.type.replace(/([A-Z])/g, ' $1').trim(),
          issue: doc.issue || 'This document needs to be uploaded or updated',
          instructions: doc.instructions || 'Please provide a clear, readable photo of this document'
        }))
        
        await sendHostDocumentRequest(host.email, {
          hostName: host.name || 'Host',
          documentIssues,
          uploadUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/host/profile`,
          deadline: `${Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`,
          supportEmail: process.env.SUPPORT_EMAIL || 'info@itwhip.com'
        } as any)
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
      // Don't fail the request if email fails
    }
    
    return NextResponse.json({
      success: true,
      message: `Document request sent to ${host.name}`,
      data: {
        hostId: hostId,
        documentsRequested: documents.length,
        deadline: deadlineDate.toISOString(),
        notificationId: result.notification.id,
        currentStatus: result.updatedHost.approvalStatus
      }
    })
    
  } catch (error) {
    console.error('Request documents error:', error)
    return NextResponse.json(
      { error: 'Failed to request documents' },
      { status: 500 }
    )
  }
}

// GET - Get document request history for a host
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hostId } = await params
    
    // Verify admin authentication
    const adminToken = request.cookies.get('adminAccessToken')
    
    if (!adminToken) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      )
    }
    
    const adminPayload = await verifyAdminToken(adminToken.value)
    
    if (!adminPayload) {
      return NextResponse.json(
        { error: 'Invalid admin token' },
        { status: 401 }
      )
    }
    
    // Get document status records and related notifications
    const [documentRecords, notifications, host] = await Promise.all([
      prisma.hostDocumentStatus.findMany({
        where: { hostId },
        orderBy: { updatedAt: 'desc' },
        include: {
          host: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }) as any,
      
      prisma.hostNotification.findMany({
        where: {
          hostId,
          type: { in: ['DOCUMENT_REQUEST', 'DOCUMENT_UPLOADED', 'DOCUMENT_APPROVED', 'DOCUMENT_REJECTED'] }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      
      prisma.rentalHost.findUnique({
        where: { id: hostId },
        select: {
          id: true,
          name: true,
          email: true,
          approvalStatus: true,
          documentsVerified: true,
          governmentIdUrl: true,
          driversLicenseUrl: true,
          insuranceDocUrl: true,
          pendingActions: true,
          documentsRequestedAt: true,
          documentsResubmittedAt: true
        }
      })
    ])
    
    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }
    
    // Build document status summary
    const documentSummary = {
      governmentId: {
        uploaded: !!host.governmentIdUrl,
        url: host.governmentIdUrl,
        status: documentRecords.find((d: any) => d.documentType === 'governmentId') || null
      },
      driversLicense: {
        uploaded: !!host.driversLicenseUrl,
        url: host.driversLicenseUrl,
        status: documentRecords.find((d: any) => d.documentType === 'driversLicense') || null
      },
      insurance: {
        uploaded: !!host.insuranceDocUrl,
        url: host.insuranceDocUrl,
        status: documentRecords.find((d: any) => d.documentType === 'insurance') || null
      }
    }
    
    // Calculate pending document requests
    const pendingRequests = documentRecords.filter(
      (record: any) => record.reviewStatus === 'NEEDS_RESUBMISSION' &&
                (!record.uploadedAt || record.uploadedAt < record.requestedAt!)
    )

    // Check for overdue requests
    const overdueRequests = pendingRequests.filter(
      (record: any) => record.requestDeadline && new Date(record.requestDeadline) < new Date()
    )
    
    return NextResponse.json({
      success: true,
      data: {
        host: {
          id: host.id,
          name: host.name,
          email: host.email,
          approvalStatus: host.approvalStatus,
          documentsVerified: host.documentsVerified,
          pendingActions: host.pendingActions || []
        },
        documentSummary,
        documentRecords,
        recentNotifications: notifications,
        statistics: {
          totalDocumentsRequested: documentRecords.length,
          pendingRequests: pendingRequests.length,
          overdueRequests: overdueRequests.length,
          lastRequestedAt: host.documentsRequestedAt,
          lastResubmittedAt: host.documentsResubmittedAt
        }
      }
    })
    
  } catch (error) {
    console.error('Get document request history error:', error)
    return NextResponse.json(
      { error: 'Failed to get document request history' },
      { status: 500 }
    )
  }
}