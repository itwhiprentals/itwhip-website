// app/api/background-check/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { auditService, AuditEventType, AuditEntityType } from '@/app/lib/audit/audit-service'
import { sendHostBackgroundCheckStatus } from '@/app/lib/email'
import crypto from 'crypto'

// POST - Receive background check results from third-party providers
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature for security
    const signature = request.headers.get('x-webhook-signature')
    const webhookSecret = process.env.BACKGROUND_CHECK_WEBHOOK_SECRET || 'your-webhook-secret'
    
    const body = await request.text()
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const data = JSON.parse(body)
    const { 
      checkId, 
      hostId, 
      provider, 
      checkType, 
      status, 
      result, 
      completedAt,
      metadata 
    } = data

    // Validate required fields
    if (!checkId || !checkType || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: checkId, checkType, status' },
        { status: 400 }
      )
    }

    // Validate check type
    const validCheckTypes = ['IDENTITY', 'DMV', 'CRIMINAL', 'INSURANCE', 'CREDIT']
    if (!validCheckTypes.includes(checkType)) {
      return NextResponse.json(
        { error: `Invalid checkType. Must be one of: ${validCheckTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'ERROR']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Fetch the background check record
    const backgroundCheck = await prisma.backgroundCheck.findUnique({
      where: { id: checkId },
      include: {
        host: {
          include: {
            user: {
              select: {
                email: true,
                name: true
              }
            }
          }
        }
      }
    }) as any

    if (!backgroundCheck) {
      return NextResponse.json(
        { error: 'Background check not found' },
        { status: 404 }
      )
    }

    // Update individual check status
    const individual_checks = (backgroundCheck.individual_checks as any) || {}
    const checkTypeKey = checkType.toLowerCase()

    // Initialize check object if it doesn't exist
    if (!individual_checks[checkTypeKey]) {
      individual_checks[checkTypeKey] = {}
    }

    // Update the specific check
    individual_checks[checkTypeKey] = {
      ...individual_checks[checkTypeKey],
      status,
      provider,
      result,
      completedAt: status === 'PASSED' || status === 'FAILED' || status === 'ERROR' 
        ? new Date(completedAt || Date.now()) 
        : null,
      startedAt: individual_checks[checkTypeKey].startedAt || new Date(),
      metadata
    }

    // Update the background check record
    const updatedCheck = await (prisma.backgroundCheck.update as any)({
      where: { id: checkId },
      data: {
        individual_checks,
        results: {
          ...((backgroundCheck.results as any) || {}),
          [checkTypeKey]: result
        }
      }
    })

    // Check if all checks are complete
    const allChecksComplete = Object.values(individual_checks)
      .filter((check: any) => check !== null)
      .every((check: any) => 
        check.status === 'PASSED' || 
        check.status === 'FAILED' || 
        check.status === 'ERROR'
      )

    // If all checks are complete, determine overall status
    if (allChecksComplete) {
      await completeBackgroundCheck(checkId, backgroundCheck)
    } else {
      // Create notification for partial completion
      await (prisma.hostNotification.create as any)({
        data: {
          hostId: backgroundCheck.hostId,
          type: 'BACKGROUND_CHECK',
          category: 'BACKGROUND_CHECK',
          subject: `${checkType} Check ${status === 'PASSED' ? 'Completed' : 'Update'}`,
          message: status === 'PASSED'
            ? `Your ${checkType.toLowerCase()} verification has been completed successfully.`
            : `Your ${checkType.toLowerCase()} verification status: ${status.toLowerCase()}`,
          priority: 'LOW',
          actionRequired: 'false'
        }
      })
    }

    // Log webhook receipt
    await (auditService.log as any)({
      eventType: AuditEventType.UPDATE,
      entityType: AuditEntityType.HOST,
      entityId: backgroundCheck.hostId,
      userId: 'SYSTEM',
      details: {
        action: 'BACKGROUND_CHECK_WEBHOOK',
        checkId,
        checkType,
        status,
        provider,
        allChecksComplete
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'webhook'
    })

    return NextResponse.json({
      success: true,
      checkId,
      checkType,
      status,
      allChecksComplete,
      message: 'Webhook processed successfully'
    })

  } catch (error) {
    console.error('Background check webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

// GET - Verify webhook endpoint is working (for provider testing)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    endpoint: 'background-check-webhook',
    status: 'active',
    timestamp: new Date().toISOString()
  })
}

// Helper function to complete background check when all checks are done
async function completeBackgroundCheck(checkId: string, backgroundCheck: any) {
  const individual_checks = backgroundCheck.individual_checks as any

  // Determine if all checks passed
  const allChecksPassed = Object.values(individual_checks)
    .filter((check: any) => check !== null)
    .every((check: any) => check.status === 'PASSED')

  // Check for any errors
  const hasErrors = Object.values(individual_checks)
    .filter((check: any) => check !== null)
    .some((check: any) => check.status === 'ERROR')

  // Determine final status
  let finalStatus = 'PASSED'
  if (hasErrors) {
    finalStatus = 'ERROR'
  } else if (!allChecksPassed) {
    finalStatus = 'FAILED'
  }

  // Count passed and failed checks
  const passedChecks = Object.values(individual_checks)
    .filter((check: any) => check !== null && check.status === 'PASSED')
    .length

  const failedChecks = Object.values(individual_checks)
    .filter((check: any) => check !== null && check.status === 'FAILED')
    .length

  // Update background check and host in transaction
  await prisma.$transaction(async (tx) => {
    // Update background check record
    await (tx.backgroundCheck.update as any)({
      where: { id: checkId },
      data: {
        status: finalStatus,
        completedAt: new Date(),
        passedAt: finalStatus === 'PASSED' ? new Date() : null,
        failedAt: finalStatus === 'FAILED' ? new Date() : null
      }
    })

    // Update host background check status
    await (tx.rentalHost.update as any)({
      where: { id: backgroundCheck.hostId },
      data: {
        backgroundCheckStatus: finalStatus,
        backgroundCheckCompletedAt: new Date()
      }
    })

    // Create host notification
    await (tx.hostNotification.create as any)({
      data: {
        hostId: backgroundCheck.hostId,
        type: 'BACKGROUND_CHECK',
        category: 'BACKGROUND_CHECK',
        subject: finalStatus === 'PASSED'
          ? 'Background Check Passed'
          : finalStatus === 'FAILED'
          ? 'Background Check Requires Review'
          : 'Background Check Error',
        message: finalStatus === 'PASSED'
          ? 'All background verification checks have been completed successfully. Your application is now under final review.'
          : finalStatus === 'FAILED'
          ? `Your background check requires additional review. ${failedChecks} check(s) need attention.`
          : 'There was an error processing your background check. Our team will contact you.',
        priority: finalStatus === 'PASSED' ? 'HIGH' : 'CRITICAL',
        actionRequired: finalStatus !== 'PASSED' ? 'true' : null,
        actionUrl: '/host/dashboard'
      }
    })

    // Create admin notification
    await (tx.adminNotification.create as any)({
      data: {
        type: 'BACKGROUND_CHECK_COMPLETED',
        title: `Background Check ${finalStatus}`,
        message: `Background check ${finalStatus.toLowerCase()} for host: ${backgroundCheck.host.user.name || backgroundCheck.host.user.email}. Passed: ${passedChecks}, Failed: ${failedChecks}`,
        priority: finalStatus === 'PASSED' ? 'LOW' : 'HIGH',
        metadata: {
          hostId: backgroundCheck.hostId,
          checkId: checkId,
          finalStatus,
          passedChecks,
          failedChecks,
          individual_checks
        }
      }
    })

    // If all checks passed and documents are approved, consider auto-approval
    if (finalStatus === 'PASSED') {
      const host = await tx.rentalHost.findUnique({
        where: { id: backgroundCheck.hostId }
      })

      const documentStatuses = (host?.documentStatuses as any) || {}
      const allDocsApproved = 
        documentStatuses.governmentId === 'APPROVED' &&
        documentStatuses.driversLicense === 'APPROVED' &&
        documentStatuses.insurance === 'APPROVED'

      // Auto-approve if everything is good
      if (allDocsApproved && host?.approvalStatus === 'PENDING') {
        await (tx.rentalHost.update as any)({
          where: { id: backgroundCheck.hostId },
          data: {
            approvalStatus: 'APPROVED',
            approvedAt: new Date(),
            approvedBy: 'SYSTEM_AUTO',
            // Set initial graduated permissions
            dashboardAccess: true,
            canViewBookings: true,
            canEditCalendar: true,
            canSetPricing: true,
            canWithdrawFunds: false, // Restricted initially
            restrictions: [],
            restrictionReasons: []
          }
        })

        // Clear pending actions
        await tx.rentalHost.update({
          where: { id: backgroundCheck.hostId },
          data: {
            pendingActions: []
          }
        })

        // Create approval notification
        await (tx.hostNotification.create as any)({
          data: {
            hostId: backgroundCheck.hostId,
            type: 'APPROVAL',
            category: 'APPROVAL',
            subject: 'Application Approved!',
            message: 'Congratulations! Your host application has been automatically approved. You can now start listing vehicles.',
            priority: 'CRITICAL',
            actionRequired: 'true',
            actionUrl: '/host/dashboard'
          }
        })

        // Activate all pending cars
        await tx.rentalCar.updateMany({
          where: {
            hostId: backgroundCheck.hostId,
            isActive: false
          },
          data: {
            isActive: true
          }
        })
      }
    }
  })

  // Send email notification to host
  try {
    const checksPerformed = Object.entries(individual_checks)
      .filter(([_, check]) => check !== null)
      .map(([type, check]: [string, any]) => ({
        type: type.replace('_', ' '),
        status: check.status.toLowerCase(),
        result: check.result
      }))

    await (sendHostBackgroundCheckStatus as any)(backgroundCheck.host.user.email, {
      hostName: backgroundCheck.host.user.name || 'Host',
      checkStatus: finalStatus === 'PASSED'
        ? 'completed'
        : finalStatus === 'FAILED'
        ? 'failed'
        : 'action_required',
      checks: checksPerformed,
      nextSteps: finalStatus === 'PASSED'
        ? 'Your application has been automatically approved! You can now start listing vehicles.'
        : finalStatus === 'FAILED'
        ? `Our team is reviewing your background check results. ${failedChecks} check(s) require additional review.`
        : 'There was a technical error processing your checks. Our team has been notified.',
      actionUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/host/dashboard`,
      supportEmail: 'info@itwhip.com'
    })
  } catch (emailError) {
    console.error('Failed to send completion email:', emailError)
  }
}

// PUT - Manual update endpoint for admin override (requires admin auth)
export async function PUT(request: NextRequest) {
  try {
    // This endpoint would need admin authentication
    // For now, returning not implemented
    return NextResponse.json(
      { error: 'Manual updates should use /api/admin/hosts/[id]/background-check endpoint' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Manual update error:', error)
    return NextResponse.json(
      { error: 'Failed to update background check' },
      { status: 500 }
    )
  }
}