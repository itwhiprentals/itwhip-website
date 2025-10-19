// app/api/background-check/initiate/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyAdminToken } from '@/app/lib/admin/auth'
import { auditService, AuditEventType, AuditEntityType } from '@/app/lib/audit/audit-service'
import { sendHostBackgroundCheckStatus } from '@/app/lib/email'

// POST - Initiate background check for a host
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
    const { hostId, checkTypes } = body

    // Validate required fields
    if (!hostId) {
      return NextResponse.json(
        { error: 'Missing required field: hostId' },
        { status: 400 }
      )
    }

    // Fetch the host
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
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

    // Platform Fleet hosts bypass background checks
    if (host.hostType === 'MANAGED') {
      return NextResponse.json(
        { 
          error: 'Platform Fleet hosts do not require background checks',
          hostType: 'MANAGED'
        },
        { status: 400 }
      )
    }

    // Check if host already has documents approved
    const documentStatuses = host.documentStatuses as any || {}
    const allDocsApproved = 
      documentStatuses.governmentId === 'APPROVED' &&
      documentStatuses.driversLicense === 'APPROVED' &&
      documentStatuses.insurance === 'APPROVED'

    if (!allDocsApproved) {
      return NextResponse.json(
        { 
          error: 'All documents must be approved before initiating background check',
          documentStatuses
        },
        { status: 400 }
      )
    }

    // Check if a background check is already in progress or completed
    const existingCheck = await prisma.backgroundCheck.findFirst({
      where: {
        hostId: hostId,
        status: {
          in: ['PENDING', 'IN_PROGRESS']
        }
      }
    })

    if (existingCheck) {
      return NextResponse.json(
        { 
          error: 'Background check already in progress',
          checkId: existingCheck.id,
          status: existingCheck.status
        },
        { status: 400 }
      )
    }

    // Define check types to run (default to all if not specified)
    const defaultCheckTypes = ['IDENTITY', 'DMV', 'CRIMINAL', 'INSURANCE']
    const checksToRun = checkTypes && Array.isArray(checkTypes) && checkTypes.length > 0 
      ? checkTypes 
      : defaultCheckTypes

    // Only add CREDIT check for luxury vehicles or specific risk indicators
    const hostCars = await prisma.rentalCar.findMany({
      where: { hostId: hostId },
      select: { basePrice: true, category: true }
    })

    const hasLuxuryCar = hostCars.some(car => 
      car.category === 'luxury' || (car.basePrice && car.basePrice > 150)
    )

    if (hasLuxuryCar && !checksToRun.includes('CREDIT')) {
      checksToRun.push('CREDIT')
    }

    // Create background check record with transaction
    const backgroundCheck = await prisma.$transaction(async (tx) => {
      // Create main background check record
      const check = await tx.backgroundCheck.create({
        data: {
          hostId: hostId,
          status: 'PENDING',
          initiatedBy: adminId,
          initiatedAt: new Date(),
          checkTypes: checksToRun,
          results: {},
          estimatedCompletionAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          individual_checks: {
            identity: { status: 'PENDING', startedAt: null, completedAt: null },
            dmv: { status: 'PENDING', startedAt: null, completedAt: null },
            criminal: { status: 'PENDING', startedAt: null, completedAt: null },
            insurance: { status: 'PENDING', startedAt: null, completedAt: null },
            credit: checksToRun.includes('CREDIT') 
              ? { status: 'PENDING', startedAt: null, completedAt: null }
              : null
          }
        }
      })

      // Update host status to show background check is in progress
      await tx.rentalHost.update({
        where: { id: hostId },
        data: {
          backgroundCheckStatus: 'IN_PROGRESS',
          backgroundCheckInitiatedAt: new Date()
        }
      })

      // Create host notification
      await tx.hostNotification.create({
        data: {
          hostId: hostId,
          type: 'BACKGROUND_CHECK',
          title: 'Background Check Started',
          message: 'We have initiated your background verification. This typically takes 1-3 business days.',
          priority: 'MEDIUM',
          actionRequired: false
        }
      })

      // Create admin notification
      await tx.adminNotification.create({
        data: {
          type: 'BACKGROUND_CHECK_INITIATED',
          title: 'Background Check Initiated',
          message: `Background check started for host: ${host.user.name || host.user.email}`,
          priority: 'LOW',
          metadata: {
            hostId: hostId,
            checkId: check.id,
            checkTypes: checksToRun,
            initiatedBy: adminId
          }
        }
      })

      return check
    })

    // Send email notification to host
    try {
      await sendHostBackgroundCheckStatus(host.user.email, {
        hostName: host.user.name || 'Host',
        status: 'started',
        checksPerformed: checksToRun.map(type => ({
          type: type.toLowerCase().replace('_', ' '),
          status: 'pending',
          estimatedCompletion: '1-3 business days'
        })),
        estimatedCompletion: '1-3 business days',
        nextSteps: [
          'We will notify you when checks are complete',
          'No action is required from you at this time',
          'Typical completion time is 1-3 business days'
        ],
        dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/host/dashboard`,
        supportEmail: 'support@itwhip.com'
      })
    } catch (emailError) {
      console.error('Failed to send background check email:', emailError)
    }

    // Simulate async background check processing
    // In production, this would call actual third-party APIs
    simulateBackgroundCheckProcessing(backgroundCheck.id, checksToRun)

    // Log audit event
    await auditService.log({
      eventType: AuditEventType.CREATE,
      entityType: AuditEntityType.HOST,
      entityId: hostId,
      userId: adminId,
      details: {
        action: 'BACKGROUND_CHECK_INITIATED',
        checkId: backgroundCheck.id,
        checkTypes: checksToRun,
        estimatedCompletion: backgroundCheck.estimatedCompletionAt
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      backgroundCheck: {
        id: backgroundCheck.id,
        status: backgroundCheck.status,
        checkTypes: checksToRun,
        initiatedAt: backgroundCheck.initiatedAt,
        estimatedCompletionAt: backgroundCheck.estimatedCompletionAt,
        individual_checks: backgroundCheck.individual_checks
      }
    })

  } catch (error) {
    console.error('Background check initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate background check' },
      { status: 500 }
    )
  }
}

// GET - Get background check status
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminId = await verifyAdminToken(request)
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const hostId = request.nextUrl.searchParams.get('hostId')
    const checkId = request.nextUrl.searchParams.get('checkId')

    if (!hostId && !checkId) {
      return NextResponse.json(
        { error: 'Either hostId or checkId is required' },
        { status: 400 }
      )
    }

    let backgroundCheck

    if (checkId) {
      backgroundCheck = await prisma.backgroundCheck.findUnique({
        where: { id: checkId },
        include: {
          host: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      })
    } else if (hostId) {
      backgroundCheck = await prisma.backgroundCheck.findFirst({
        where: { hostId: hostId },
        orderBy: { initiatedAt: 'desc' },
        include: {
          host: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      })
    }

    if (!backgroundCheck) {
      return NextResponse.json(
        { error: 'Background check not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      backgroundCheck: {
        id: backgroundCheck.id,
        hostId: backgroundCheck.hostId,
        hostName: backgroundCheck.host.user.name,
        status: backgroundCheck.status,
        checkTypes: backgroundCheck.checkTypes,
        individual_checks: backgroundCheck.individual_checks,
        results: backgroundCheck.results,
        initiatedAt: backgroundCheck.initiatedAt,
        completedAt: backgroundCheck.completedAt,
        estimatedCompletionAt: backgroundCheck.estimatedCompletionAt,
        passedAt: backgroundCheck.passedAt,
        failedAt: backgroundCheck.failedAt,
        overrideReason: backgroundCheck.overrideReason,
        overrideBy: backgroundCheck.overrideBy
      }
    })

  } catch (error) {
    console.error('Background check status error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch background check status' },
      { status: 500 }
    )
  }
}

// Simulate background check processing (async)
// In production, this would integrate with actual third-party services
async function simulateBackgroundCheckProcessing(checkId: string, checkTypes: string[]) {
  // Don't await - let this run in background
  setTimeout(async () => {
    try {
      // Update status to IN_PROGRESS
      await prisma.backgroundCheck.update({
        where: { id: checkId },
        data: {
          status: 'IN_PROGRESS',
          individual_checks: {
            identity: { status: 'IN_PROGRESS', startedAt: new Date(), completedAt: null },
            dmv: { status: 'PENDING', startedAt: null, completedAt: null },
            criminal: { status: 'PENDING', startedAt: null, completedAt: null },
            insurance: { status: 'PENDING', startedAt: null, completedAt: null },
            credit: checkTypes.includes('CREDIT')
              ? { status: 'PENDING', startedAt: null, completedAt: null }
              : null
          }
        }
      })

      // Simulate identity check completion (1 minute)
      setTimeout(async () => {
        await updateIndividualCheck(checkId, 'identity', 'PASSED', { 
          verified: true,
          matchScore: 95,
          provider: 'SIMULATED'
        })

        // Start DMV check
        await updateIndividualCheck(checkId, 'dmv', 'IN_PROGRESS', null)
      }, 60000) // 1 minute

      // Simulate DMV check completion (2 minutes)
      setTimeout(async () => {
        await updateIndividualCheck(checkId, 'dmv', 'PASSED', {
          license_valid: true,
          violations: 0,
          points: 0,
          provider: 'SIMULATED'
        })

        // Start criminal check
        await updateIndividualCheck(checkId, 'criminal', 'IN_PROGRESS', null)
      }, 120000) // 2 minutes

      // Simulate criminal check completion (3 minutes)
      setTimeout(async () => {
        await updateIndividualCheck(checkId, 'criminal', 'PASSED', {
          criminal_record: false,
          sex_offender: false,
          provider: 'SIMULATED'
        })

        // Start insurance check
        await updateIndividualCheck(checkId, 'insurance', 'IN_PROGRESS', null)
      }, 180000) // 3 minutes

      // Simulate insurance check completion (4 minutes)
      setTimeout(async () => {
        await updateIndividualCheck(checkId, 'insurance', 'PASSED', {
          insurance_valid: true,
          coverage_adequate: true,
          provider: 'SIMULATED'
        })

        // If credit check required, start it
        if (checkTypes.includes('CREDIT')) {
          await updateIndividualCheck(checkId, 'credit', 'IN_PROGRESS', null)
          
          // Complete credit check (5 minutes)
          setTimeout(async () => {
            await updateIndividualCheck(checkId, 'credit', 'PASSED', {
              credit_score: 720,
              credit_rating: 'GOOD',
              provider: 'SIMULATED'
            })
            
            // Mark entire check as complete
            await completeBackgroundCheck(checkId)
          }, 60000)
        } else {
          // Mark entire check as complete
          await completeBackgroundCheck(checkId)
        }
      }, 240000) // 4 minutes

    } catch (error) {
      console.error('Background check simulation error:', error)
    }
  }, 5000) // Start after 5 seconds
}

// Helper function to update individual check status
async function updateIndividualCheck(
  checkId: string, 
  checkType: string, 
  status: string, 
  result: any
) {
  const check = await prisma.backgroundCheck.findUnique({
    where: { id: checkId }
  })

  if (!check) return

  const individual_checks = check.individual_checks as any
  individual_checks[checkType] = {
    ...individual_checks[checkType],
    status,
    ...(status === 'IN_PROGRESS' ? { startedAt: new Date() } : {}),
    ...(status === 'PASSED' || status === 'FAILED' ? { completedAt: new Date() } : {}),
    ...(result ? { result } : {})
  }

  await prisma.backgroundCheck.update({
    where: { id: checkId },
    data: { individual_checks }
  })
}

// Helper function to complete background check
async function completeBackgroundCheck(checkId: string) {
  const check = await prisma.backgroundCheck.findUnique({
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
  })

  if (!check) return

  const individual_checks = check.individual_checks as any
  const allPassed = Object.values(individual_checks)
    .filter(c => c !== null)
    .every((c: any) => c.status === 'PASSED')

  await prisma.$transaction(async (tx) => {
    // Update background check
    await tx.backgroundCheck.update({
      where: { id: checkId },
      data: {
        status: allPassed ? 'PASSED' : 'FAILED',
        completedAt: new Date(),
        passedAt: allPassed ? new Date() : null,
        failedAt: allPassed ? null : new Date()
      }
    })

    // Update host status
    await tx.rentalHost.update({
      where: { id: check.hostId },
      data: {
        backgroundCheckStatus: allPassed ? 'PASSED' : 'FAILED',
        backgroundCheckCompletedAt: new Date()
      }
    })

    // Create notifications
    await tx.hostNotification.create({
      data: {
        hostId: check.hostId,
        type: 'BACKGROUND_CHECK',
        title: allPassed ? 'Background Check Passed ✓' : 'Background Check Review Required',
        message: allPassed 
          ? 'Your background verification has been completed successfully.'
          : 'Your background check requires additional review. Our team will contact you.',
        priority: allPassed ? 'MEDIUM' : 'HIGH',
        actionRequired: !allPassed
      }
    })

    // Notify admin
    await tx.adminNotification.create({
      data: {
        type: 'BACKGROUND_CHECK_COMPLETED',
        title: `Background Check ${allPassed ? 'Passed' : 'Failed'}`,
        message: `Background check ${allPassed ? 'passed' : 'failed'} for host: ${check.host.user.name || check.host.user.email}`,
        priority: allPassed ? 'LOW' : 'HIGH',
        metadata: {
          hostId: check.hostId,
          checkId: check.id,
          passed: allPassed
        }
      }
    })
  })

  // Send email to host
  try {
    await sendHostBackgroundCheckStatus(check.host.user.email, {
      hostName: check.host.user.name || 'Host',
      status: allPassed ? 'completed' : 'requires_review',
      checksPerformed: Object.entries(individual_checks)
        .filter(([_, value]) => value !== null)
        .map(([type, value]: [string, any]) => ({
          type: type.replace('_', ' '),
          status: value.status.toLowerCase(),
          result: value.result
        })),
      nextSteps: allPassed 
        ? [
            'Your application is now under final review',
            'You will receive approval notification within 24 hours',
            'Start preparing your vehicle listings'
          ]
        : [
            'Our team is reviewing your background check results',
            'We may contact you for additional information',
            'Check your email for further instructions'
          ],
      dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/host/dashboard`,
      supportEmail: 'support@itwhip.com'
    })
  } catch (emailError) {
    console.error('Failed to send completion email:', emailError)
  }
}