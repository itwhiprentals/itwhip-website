// app/api/admin/hosts/[id]/background-check/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyAdminToken } from '@/app/lib/admin/auth'
import { sendHostBackgroundCheckStatus } from '@/app/lib/email'

// POST - Initiate or update background check
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
    const { action, checkType, status, notes, manualOverride } = body
    
    // Validate action
    const validActions = ['initiate', 'update', 'complete', 'override']
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Valid action is required (initiate, update, complete, override)' },
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
        backgroundChecks: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })
    
    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }
    
    // Prevent actions on platform fleet
    if (host.hostType === 'MANAGED') {
      return NextResponse.json(
        { error: 'Platform fleet hosts do not require background checks' },
        { status: 403 }
      )
    }
    
    const existingCheck = host.backgroundChecks[0]
    
    // Process based on action
    let result
    
    switch (action) {
      case 'initiate':
        // Check if a background check is already in progress
        if (existingCheck && existingCheck.overallStatus === 'IN_PROGRESS') {
          return NextResponse.json(
            { error: 'Background check already in progress' },
            { status: 400 }
          )
        }
        
        // Create new background check record
        result = await prisma.$transaction(async (tx) => {
          const bgCheck = await tx.backgroundCheck.create({
            data: {
              hostId: hostId,
              identityVerification: 'PENDING',
              dmvCheck: 'PENDING',
              criminalBackground: 'PENDING',
              creditCheck: host.hostType === 'PREMIUM' ? 'PENDING' : 'NOT_REQUIRED',
              insuranceVerification: 'PENDING',
              overallStatus: 'IN_PROGRESS',
              initiatedBy: adminPayload.userId,
              provider: 'INTERNAL', // or your provider name
              providerRefId: `BGC-${hostId}-${Date.now()}`,
              estimatedCompletionAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
              metadata: {
                initiatedAt: new Date().toISOString(),
                adminId: adminPayload.userId
              }
            }
          })
          
          // Update host status
          await tx.rentalHost.update({
            where: { id: hostId },
            data: {
              backgroundCheckStatus: 'IN_PROGRESS',
              lastNotificationSent: new Date()
            }
          })
          
          // Create notification
          await tx.hostNotification.create({
            data: {
              hostId: hostId,
              type: 'BACKGROUND_CHECK_STARTED',
              title: 'Background Check Started',
              message: 'Your background check has been initiated and should be completed within 72 hours.',
              status: 'SENT',
              priority: 'MEDIUM',
              metadata: {
                checkId: bgCheck.id,
                estimatedCompletion: bgCheck.estimatedCompletionAt
              }
            }
          })
          
          // Create activity log
          await tx.activityLog.create({
            data: {
              entityType: 'HOST',
              entityId: hostId,
              action: 'BACKGROUND_CHECK_INITIATED',
              userId: adminPayload.userId,
              details: {
                hostId: hostId,
                hostName: host.name,
                checkId: bgCheck.id,
                provider: 'INTERNAL'
              },
              ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
              userAgent: request.headers.get('user-agent') || 'unknown'
            }
          })
          
          return bgCheck
        })
        
        // Send email notification
        try {
          if (host.email) {
            await sendHostBackgroundCheckStatus(host.email, {
              hostName: host.name || 'Host',
              checkStatus: 'started',
              checks: [
                { checkType: 'Identity Verification', status: 'pending' },
                { checkType: 'DMV Records', status: 'pending' },
                { checkType: 'Criminal Background', status: 'pending' },
                { checkType: 'Insurance Verification', status: 'pending' }
              ],
              estimatedCompletion: '72 hours',
              supportEmail: process.env.SUPPORT_EMAIL || 'info@itwhip.com'
            })
          }
        } catch (emailError) {
          console.error('Failed to send email:', emailError)
        }
        
        break
        
      case 'update':
        if (!existingCheck) {
          return NextResponse.json(
            { error: 'No background check found to update' },
            { status: 404 }
          )
        }
        
        if (!checkType || !status) {
          return NextResponse.json(
            { error: 'Check type and status are required for update' },
            { status: 400 }
          )
        }
        
        // Build update data for specific check type
        const updateData: any = {
          updatedAt: new Date()
        }
        
        switch (checkType) {
          case 'identity':
            updateData.identityVerification = status
            break
          case 'dmv':
            updateData.dmvCheck = status
            break
          case 'criminal':
            updateData.criminalBackground = status
            break
          case 'credit':
            updateData.creditCheck = status
            break
          case 'insurance':
            updateData.insuranceVerification = status
            break
          default:
            return NextResponse.json(
              { error: 'Invalid check type' },
              { status: 400 }
            )
        }
        
        if (notes) {
          updateData.notes = notes
        }
        
        // Update the background check
        result = await prisma.backgroundCheck.update({
          where: { id: existingCheck.id },
          data: updateData
        })
        
        break
        
      case 'complete':
        if (!existingCheck) {
          return NextResponse.json(
            { error: 'No background check found to complete' },
            { status: 404 }
          )
        }
        
        // Determine overall status based on individual checks
        const checks = {
          identity: body.identityVerification || existingCheck.identityVerification,
          dmv: body.dmvCheck || existingCheck.dmvCheck,
          criminal: body.criminalBackground || existingCheck.criminalBackground,
          insurance: body.insuranceVerification || existingCheck.insuranceVerification
        }
        
        const failedChecks = Object.values(checks).filter(c => c === 'FAILED')
        const pendingChecks = Object.values(checks).filter(c => c === 'PENDING')
        
        let overallStatus: 'PASSED' | 'FAILED' | 'IN_PROGRESS'
        if (failedChecks.length > 0) {
          overallStatus = 'FAILED'
        } else if (pendingChecks.length > 0) {
          overallStatus = 'IN_PROGRESS'
        } else {
          overallStatus = 'PASSED'
        }
        
        // Complete the background check
        result = await prisma.$transaction(async (tx) => {
          const completedCheck = await tx.backgroundCheck.update({
            where: { id: existingCheck.id },
            data: {
              identityVerification: checks.identity,
              dmvCheck: checks.dmv,
              criminalBackground: checks.criminal,
              insuranceVerification: checks.insurance,
              overallStatus: overallStatus,
              completedAt: new Date(),
              notes: notes || null,
              results: body.results || null
            }
          })
          
          // Update host based on result
          const hostUpdateData: any = {
            backgroundCheckStatus: overallStatus
          }
          
          if (overallStatus === 'PASSED') {
            // If all checks pass and documents are verified, approve the host
            if (host.documentsVerified && host.approvalStatus === 'PENDING') {
              hostUpdateData.approvalStatus = 'APPROVED'
              hostUpdateData.approvedAt = new Date()
              hostUpdateData.approvedBy = adminPayload.userId
              hostUpdateData.dashboardAccess = true
              hostUpdateData.canViewBookings = true
              hostUpdateData.canMessageGuests = true
            }
          } else if (overallStatus === 'FAILED') {
            hostUpdateData.approvalStatus = 'REJECTED'
            hostUpdateData.rejectedReason = 'Failed background check'
            hostUpdateData.dashboardAccess = false
          }
          
          await tx.rentalHost.update({
            where: { id: hostId },
            data: hostUpdateData
          })
          
          // Create notification
          await tx.hostNotification.create({
            data: {
              hostId: hostId,
              type: `BACKGROUND_CHECK_${overallStatus}`,
              title: `Background Check ${overallStatus === 'PASSED' ? 'Passed' : overallStatus === 'FAILED' ? 'Failed' : 'Update'}`,
              message: overallStatus === 'PASSED' 
                ? 'Good news! Your background check has been completed successfully.'
                : overallStatus === 'FAILED'
                ? 'Unfortunately, your background check did not pass. Please contact support for more information.'
                : 'Your background check is still in progress.',
              status: 'SENT',
              priority: overallStatus === 'FAILED' ? 'HIGH' : 'MEDIUM',
              requiresAction: overallStatus === 'FAILED',
              actionUrl: overallStatus === 'FAILED' ? '/host/profile' : null,
              actionLabel: overallStatus === 'FAILED' ? 'Contact Support' : null,
              metadata: {
                checkId: completedCheck.id,
                overallStatus,
                failedChecks: failedChecks.length > 0 ? Object.entries(checks).filter(([_, v]) => v === 'FAILED').map(([k]) => k) : []
              }
            }
          })
          
          // Log activity
          await tx.activityLog.create({
            data: {
              entityType: 'HOST',
              entityId: hostId,
              action: `BACKGROUND_CHECK_${overallStatus}`,
              userId: adminPayload.userId,
              details: {
                hostId: hostId,
                hostName: host.name,
                checkId: completedCheck.id,
                overallStatus,
                checks
              },
              ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
              userAgent: request.headers.get('user-agent') || 'unknown'
            }
          })
          
          return completedCheck
        })
        
        // Send email notification
        try {
          if (host.email) {
            const emailChecks = Object.entries(checks).map(([type, status]) => ({
              checkType: type.charAt(0).toUpperCase() + type.slice(1),
              status: status.toLowerCase() as any,
              message: status === 'FAILED' ? `${type} check did not pass` : undefined
            }))
            
            await sendHostBackgroundCheckStatus(host.email, {
              hostName: host.name || 'Host',
              checkStatus: overallStatus === 'PASSED' ? 'completed' : 'failed',
              checks: emailChecks,
              nextSteps: overallStatus === 'FAILED' 
                ? 'Please contact support to discuss your application'
                : overallStatus === 'PASSED'
                ? 'You can now list your vehicles!'
                : undefined,
              supportEmail: process.env.SUPPORT_EMAIL || 'info@itwhip.com'
            })
          }
        } catch (emailError) {
          console.error('Failed to send email:', emailError)
        }
        
        break
        
      case 'override':
        if (!manualOverride || !manualOverride.reason) {
          return NextResponse.json(
            { error: 'Override reason is required' },
            { status: 400 }
          )
        }
        
        // Create or update background check with manual override
        result = await prisma.$transaction(async (tx) => {
          const overrideData = {
            overallStatus: manualOverride.status || 'PASSED',
            manualOverride: true,
            manualOverrideBy: adminPayload.userId,
            manualOverrideAt: new Date(),
            manualOverrideReason: manualOverride.reason,
            completedAt: new Date(),
            notes: `Manual override: ${manualOverride.reason}`
          }
          
          const bgCheck = existingCheck
            ? await tx.backgroundCheck.update({
                where: { id: existingCheck.id },
                data: overrideData as any
              })
            : await tx.backgroundCheck.create({
                data: {
                  hostId: hostId,
                  identityVerification: 'PASSED',
                  dmvCheck: 'PASSED',
                  criminalBackground: 'PASSED',
                  insuranceVerification: 'PASSED',
                  ...overrideData,
                  provider: 'MANUAL',
                  providerRefId: `OVERRIDE-${hostId}-${Date.now()}`
                } as any
              })
          
          // Update host status
          await tx.rentalHost.update({
            where: { id: hostId },
            data: {
              backgroundCheckStatus: overrideData.overallStatus as any,
              approvalStatus: overrideData.overallStatus === 'PASSED' ? 'APPROVED' : host.approvalStatus,
              approvedAt: overrideData.overallStatus === 'PASSED' ? new Date() : undefined,
              approvedBy: overrideData.overallStatus === 'PASSED' ? adminPayload.userId : undefined
            }
          })
          
          // Log activity
          await tx.activityLog.create({
            data: {
              entityType: 'HOST',
              entityId: hostId,
              action: 'BACKGROUND_CHECK_OVERRIDE',
              userId: adminPayload.userId,
              details: {
                hostId: hostId,
                hostName: host.name,
                checkId: bgCheck.id,
                overrideStatus: overrideData.overallStatus,
                reason: manualOverride.reason
              },
              ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
              userAgent: request.headers.get('user-agent') || 'unknown'
            }
          })
          
          return bgCheck
        })
        
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
    
    return NextResponse.json({
      success: true,
      message: `Background check ${action} successful`,
      data: {
        checkId: result.id,
        hostId: hostId,
        status: result.overallStatus,
        action
      }
    })
    
  } catch (error) {
    console.error('Background check error:', error)
    return NextResponse.json(
      { error: 'Failed to process background check' },
      { status: 500 }
    )
  }
}

// GET - Get background check status and history
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
    
    // Get all background checks for this host
    const backgroundChecks = await prisma.backgroundCheck.findMany({
      where: { hostId },
      orderBy: { createdAt: 'desc' }
    })
    
    // Get host details
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        name: true,
        email: true,
        approvalStatus: true,
        backgroundCheckStatus: true,
        hostType: true
      }
    })
    
    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }
    
    // Get latest check details
    const latestCheck = backgroundChecks[0]
    
    return NextResponse.json({
      success: true,
      data: {
        host: {
          id: host.id,
          name: host.name,
          email: host.email,
          approvalStatus: host.approvalStatus,
          backgroundCheckStatus: host.backgroundCheckStatus,
          isPlatformFleet: host.hostType === 'MANAGED'
        },
        currentCheck: latestCheck || null,
        history: backgroundChecks,
        summary: {
          totalChecks: backgroundChecks.length,
          hasPassedCheck: backgroundChecks.some(c => c.overallStatus === 'PASSED'),
          hasFailedCheck: backgroundChecks.some(c => c.overallStatus === 'FAILED'),
          lastCheckDate: latestCheck?.createdAt || null,
          requiresCheck: !latestCheck && host.hostType !== 'MANAGED'
        }
      }
    })
    
  } catch (error) {
    console.error('Get background check status error:', error)
    return NextResponse.json(
      { error: 'Failed to get background check status' },
      { status: 500 }
    )
  }
}