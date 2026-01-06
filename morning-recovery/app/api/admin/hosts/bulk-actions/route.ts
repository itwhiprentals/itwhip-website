// app/api/admin/hosts/bulk-actions/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyAdminToken } from '@/app/lib/admin/auth'
import { auditService, AuditEventType, AuditEntityType } from '@/app/lib/audit/audit-service'
import { sendHostApproval, sendHostRejection } from '@/app/lib/email'

// POST - Perform bulk actions on hosts
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminId = await verifyAdminToken(request)
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

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
            hostName: host.user.name,
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
          hostName: host.user.name,
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
    await auditService.log({
      eventType: AuditEventType.BULK_OPERATION,
      entityType: AuditEntityType.HOST,
      entityId: 'BULK',
      userId: adminId,
      details: {
        action,
        totalHosts: hostIds.length,
        succeeded: results.summary.succeeded,
        failed: results.summary.failed,
        hostIds
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

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
        restrictions: [],
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
        hostId: host.id,
        type: 'APPROVAL',
        title: 'Application Approved! 🎉',
        message: 'Congratulations! Your host application has been approved. You can now start listing vehicles.',
        priority: 'HIGH',
        actionRequired: false,
        actionUrl: '/host/dashboard'
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
    await sendHostApproval(host.user.email, {
      hostName: host.user.name || 'Host',
      approvalDate: new Date().toLocaleDateString(),
      dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/host/dashboard`,
      nextSteps: [
        'Complete your profile with a bio and photo',
        'List your first vehicle',
        'Set your availability calendar',
        'Review your pricing strategy'
      ],
      permissions: {
        canListCars: true,
        canViewBookings: true,
        canSetPricing: true,
        canWithdrawFunds: false,
        canEditCalendar: true
      },
      commissionRate: host.commissionRate || 20,
      supportEmail: 'info@itwhip.com'
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
        rejectedAt: new Date(),
        rejectedBy: adminId,
        rejectionReason: reason
      }
    })

    // Create notification
    await tx.hostNotification.create({
      data: {
        hostId: host.id,
        type: 'REJECTION',
        title: 'Application Status Update',
        message: `Your host application has been reviewed. ${reason}`,
        priority: 'HIGH',
        actionRequired: false
      }
    })

    return updatedHost
  })

  // Send rejection email
  try {
    await sendHostRejection(host.user.email, {
      hostName: host.user.name || 'Host',
      rejectionDate: new Date().toLocaleDateString(),
      reasons: [
        {
          category: 'Application Review',
          issue: reason,
          canReapply: true
        }
      ],
      canReapply: true,
      reapplyUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/host/signup`,
      nextSteps: [
        'Review the rejection reasons above',
        'Address the issues mentioned',
        'Gather required documentation',
        'Submit a new application when ready'
      ],
      supportEmail: 'info@itwhip.com'
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
        suspendedBy: adminId,
        suspendedReason: reason,
        restrictions: ['NO_NEW_BOOKINGS', 'NO_NEW_LISTINGS'],
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
        hostId: host.id,
        type: 'SUSPENSION',
        title: 'Account Suspended',
        message: `Your host account has been suspended. Reason: ${reason}`,
        priority: 'CRITICAL',
        actionRequired: true,
        actionUrl: '/host/dashboard'
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
        suspendedBy: null,
        suspendedReason: null,
        restrictions: [],
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
        hostId: host.id,
        type: 'RESTORATION',
        title: 'Account Restored',
        message: 'Your host account has been restored and is now active.',
        priority: 'HIGH',
        actionRequired: false,
        actionUrl: '/host/dashboard'
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
        pendingActions: documents.map(doc => `UPLOAD_${doc.type.toUpperCase()}`)
      }
    })

    // Create document status records
    for (const doc of documents) {
      await tx.hostDocumentStatus.create({
        data: {
          hostId: host.id,
          documentType: doc.type,
          status: 'PENDING',
          requestedBy: adminId,
          requestedAt: new Date(),
          feedback: doc.issue || 'Document required',
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
        }
      })
    }

    // Create notification
    await tx.hostNotification.create({
      data: {
        hostId: host.id,
        type: 'DOCUMENT_REQUEST',
        title: 'Documents Required',
        message: `Please upload ${documents.length} document(s) to continue your application.`,
        priority: 'HIGH',
        actionRequired: true,
        actionUrl: '/host/profile'
      }
    })

    return { documents }
  })

  return {
    action: 'documents_requested',
    documentsRequested: documents.map(d => d.type)
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
        hostId: host.id,
        type: 'SETTINGS_UPDATE',
        title: 'Commission Rate Updated',
        message: `Your commission rate has been updated to ${commissionRate}%.`,
        priority: 'MEDIUM',
        actionRequired: false
      }
    })

    return updatedHost
  })

  return {
    action: 'commission_updated',
    commissionRate
  }
}