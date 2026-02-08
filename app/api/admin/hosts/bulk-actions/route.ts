// app/api/admin/hosts/bulk-actions/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyAdminToken } from '@/app/lib/admin/auth'
import { auditService, AuditEventType, AuditEntityType } from '@/app/lib/audit/audit-service'
import { sendHostApproval, sendHostRejection } from '@/app/lib/email'
import crypto from 'crypto'

// POST - Perform bulk actions on hosts
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const cookieHeader = request.headers.get('cookie')
    const adminToken = cookieHeader
      ?.split('; ')
      .find(c => c.startsWith('adminAccessToken='))
      ?.split('=')[1]

    if (!adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const adminPayload = await verifyAdminToken(decodeURIComponent(adminToken))
    if (!adminPayload) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const adminId = adminPayload.userId

    const body = await request.json()
    const { action, hostIds, data } = body

    // Validate required fields
    if (!action || !hostIds || !Array.isArray(hostIds) || hostIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: action and hostIds array' },
        { status: 400 }
      )
    }

    // Validate action type
    const validActions = ['approve', 'reject', 'suspend', 'restore', 'request_documents', 'update_commission']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      )
    }

    const results = {
      success: [] as any[],
      failed: [] as any[],
      summary: {
        total: hostIds.length,
        succeeded: 0,
        failed: 0
      }
    }

    // Process each host individually
    for (const hostId of hostIds) {
      try {
        // Fetch the host
        const host = await prisma.rentalHost.findUnique({
          where: { id: hostId },
          include: {
            user: {
              select: {
                email: true,
                name: true
              }
            }
          }
        })

        if (!host) {
          results.failed.push({
            hostId,
            error: 'Host not found'
          })
          results.summary.failed++
          continue
        }

        // Skip platform fleet hosts for most actions
        if (host.hostType === 'MANAGED' && action !== 'update_commission') {
          results.failed.push({
            hostId,
            hostName: host.user?.name ?? host.name,
            error: 'Cannot modify Platform Fleet hosts'
          })
          results.summary.failed++
          continue
        }

        let result

        switch (action) {
          case 'approve':
            result = await approveHost(host, adminId)
            break

          case 'reject':
            result = await rejectHost(host, data?.reason || 'Application did not meet requirements', adminId)
            break

          case 'suspend':
            result = await suspendHost(host, data?.reason || 'Policy violation', adminId)
            break

          case 'restore':
            result = await restoreHost(host, adminId)
            break

          case 'request_documents':
            result = await requestDocuments(host, data?.documents || [], adminId)
            break

          case 'update_commission':
            result = await updateCommission(host, data?.commissionRate, adminId)
            break

          default:
            throw new Error('Invalid action')
        }

        results.success.push({
          hostId,
          hostName: host.user?.name ?? host.name,
          ...result
        })
        results.summary.succeeded++

      } catch (error) {
        console.error(`Error processing host ${hostId}:`, error)
        results.failed.push({
          hostId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        results.summary.failed++
      }
    }

    // Log bulk operation
    await auditService.log(
      AuditEventType.BULK_OPERATION,
      AuditEntityType.HOST,
      'BULK',
      {
        action,
        totalHosts: hostIds.length,
        succeeded: results.summary.succeeded,
        failed: results.summary.failed,
        hostIds
      },
      {
        category: 'ADMIN_ACTION',
        metadata: {
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      }
    )

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    console.error('Bulk actions error:', error)
    return NextResponse.json(
      { error: 'Failed to process bulk actions' },
      { status: 500 }
    )
  }
}

// Helper function: Approve host
async function approveHost(host: any, adminId: string) {
  const result = await prisma.$transaction(async (tx) => {
    // Update host status
    const updatedHost = await tx.rentalHost.update({
      where: { id: host.id },
      data: {
        approvalStatus: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: adminId,
        // Set initial graduated permissions
        dashboardAccess: true,
        canViewBookings: true,
        canEditCalendar: true,
        canSetPricing: true,
        canWithdrawFunds: false, // Restricted initially for trust building
        restrictionReasons: []
      }
    })

    // Clear pending actions
    await tx.rentalHost.update({
      where: { id: host.id },
      data: {
        pendingActions: []
      }
    })

    // Create notification
    await tx.hostNotification.create({
      data: {
        id: crypto.randomUUID(),
        hostId: host.id,
        type: 'APPROVAL',
        category: 'APPLICATION',
        subject: 'Application Approved!',
        message: 'Congratulations! Your host application has been approved. You can now start listing vehicles.',
        priority: 'HIGH',
        actionRequired: 'Visit your dashboard to get started',
        actionUrl: '/host/dashboard',
        updatedAt: new Date()
      }
    })

    // Activate all pending cars
    await tx.rentalCar.updateMany({
      where: {
        hostId: host.id,
        isActive: false
      },
      data: {
        isActive: true
      }
    })

    return updatedHost
  })

  // Send approval email
  try {
    await sendHostApproval(host.user?.email || host.email, {
      name: host.user?.name || host.name || 'Host',
      message: 'You can now list your vehicles and start earning!'
    })
  } catch (emailError) {
    console.error('Failed to send approval email:', emailError)
  }

  return {
    action: 'approved',
    status: 'APPROVED',
    permissions: {
      dashboardAccess: true,
      canViewBookings: true,
      canEditCalendar: true,
      canSetPricing: true,
      canWithdrawFunds: false
    }
  }
}

// Helper function: Reject host
async function rejectHost(host: any, reason: string, adminId: string) {
  const result = await prisma.$transaction(async (tx) => {
    // Update host status
    const updatedHost = await tx.rentalHost.update({
      where: { id: host.id },
      data: {
        approvalStatus: 'REJECTED',
        rejectedReason: reason
      }
    })

    // Create notification
    await tx.hostNotification.create({
      data: {
        id: crypto.randomUUID(),
        hostId: host.id,
        type: 'REJECTION',
        category: 'APPLICATION',
        subject: 'Application Status Update',
        message: `Your host application has been reviewed. ${reason}`,
        priority: 'HIGH',
        updatedAt: new Date()
      }
    })

    return updatedHost
  })

  // Send rejection email
  try {
    await sendHostRejection(host.user?.email || host.email, {
      name: host.user?.name || host.name || 'Host',
      reason
    })
  } catch (emailError) {
    console.error('Failed to send rejection email:', emailError)
  }

  return {
    action: 'rejected',
    status: 'REJECTED',
    reason
  }
}

// Helper function: Suspend host
async function suspendHost(host: any, reason: string, adminId: string) {
  const result = await prisma.$transaction(async (tx) => {
    // Update host status
    const updatedHost = await tx.rentalHost.update({
      where: { id: host.id },
      data: {
        approvalStatus: 'SUSPENDED',
        suspendedAt: new Date(),
        suspendedReason: reason,
        restrictionReasons: [reason]
      }
    })

    // Deactivate all cars
    await tx.rentalCar.updateMany({
      where: { hostId: host.id },
      data: { isActive: false }
    })

    // Create notification
    await tx.hostNotification.create({
      data: {
        id: crypto.randomUUID(),
        hostId: host.id,
        type: 'SUSPENSION',
        category: 'ACCOUNT',
        subject: 'Account Suspended',
        message: `Your host account has been suspended. Reason: ${reason}`,
        priority: 'CRITICAL',
        actionRequired: 'Contact support for more information',
        actionUrl: '/host/dashboard',
        updatedAt: new Date()
      }
    })

    return updatedHost
  })

  return {
    action: 'suspended',
    status: 'SUSPENDED',
    reason
  }
}

// Helper function: Restore host
async function restoreHost(host: any, adminId: string) {
  const result = await prisma.$transaction(async (tx) => {
    // Update host status
    const updatedHost = await tx.rentalHost.update({
      where: { id: host.id },
      data: {
        approvalStatus: 'APPROVED',
        suspendedAt: null,
        suspendedReason: null,
        restrictionReasons: []
      }
    })

    // Reactivate cars
    await tx.rentalCar.updateMany({
      where: { hostId: host.id },
      data: { isActive: true }
    })

    // Create notification
    await tx.hostNotification.create({
      data: {
        id: crypto.randomUUID(),
        hostId: host.id,
        type: 'RESTORATION',
        category: 'ACCOUNT',
        subject: 'Account Restored',
        message: 'Your host account has been restored and is now active.',
        priority: 'HIGH',
        actionUrl: '/host/dashboard',
        updatedAt: new Date()
      }
    })

    return updatedHost
  })

  return {
    action: 'restored',
    status: 'APPROVED'
  }
}

// Helper function: Request documents
async function requestDocuments(host: any, documents: any[], adminId: string) {
  const result = await prisma.$transaction(async (tx) => {
    // Update host status
    await tx.rentalHost.update({
      where: { id: host.id },
      data: {
        approvalStatus: 'NEEDS_ATTENTION',
        pendingActions: documents.map((doc: any) => `UPLOAD_${doc.type.toUpperCase()}`)
      }
    })

    // Create document status records
    for (const doc of documents) {
      await tx.hostDocumentStatus.create({
        data: {
          id: crypto.randomUUID(),
          hostId: host.id,
          documentType: doc.type,
          status: 'NOT_UPLOADED',
          requestedAt: new Date(),
          feedback: doc.issue || 'Document required',
          updatedAt: new Date()
        }
      })
    }

    // Create notification
    await tx.hostNotification.create({
      data: {
        id: crypto.randomUUID(),
        hostId: host.id,
        type: 'DOCUMENT_REQUEST',
        category: 'DOCUMENTS',
        subject: 'Documents Required',
        message: `Please upload ${documents.length} document(s) to continue your application.`,
        priority: 'HIGH',
        actionRequired: 'Upload required documents',
        actionUrl: '/host/profile',
        updatedAt: new Date()
      }
    })

    return { documents }
  })

  return {
    action: 'documents_requested',
    documentsRequested: documents.map((d: any) => d.type)
  }
}

// Helper function: Update commission
async function updateCommission(host: any, commissionRate: number, adminId: string) {
  if (!commissionRate || commissionRate < 0 || commissionRate > 100) {
    throw new Error('Invalid commission rate. Must be between 0 and 100.')
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedHost = await tx.rentalHost.update({
      where: { id: host.id },
      data: {
        commissionRate
      }
    })

    // Create notification
    await tx.hostNotification.create({
      data: {
        id: crypto.randomUUID(),
        hostId: host.id,
        type: 'SETTINGS_UPDATE',
        category: 'SETTINGS',
        subject: 'Commission Rate Updated',
        message: `Your commission rate has been updated to ${commissionRate}%.`,
        priority: 'MEDIUM',
        updatedAt: new Date()
      }
    })

    return updatedHost
  })

  return {
    action: 'commission_updated',
    commissionRate
  }
}
