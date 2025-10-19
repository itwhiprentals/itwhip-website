// app/api/cron/process-payouts/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { processEligiblePayouts } from '@/app/lib/payouts/process-eligible'
import { prisma } from '@/app/lib/database/prisma'

/**
 * Vercel Cron Job Endpoint - Process Eligible Payouts
 * 
 * Runs daily at 2:00 AM UTC (configured in vercel.json)
 * Can also be triggered manually for testing
 * 
 * Security: Protected by CRON_SECRET environment variable
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
    
    if (authHeader !== expectedAuth) {
      console.error('[Cron] Unauthorized attempt to trigger payout processing')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[Cron] Starting automated payout processing...')

    // Process eligible payouts
    const result = await processEligiblePayouts()

    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2)

    // Log results to audit trail
    await prisma.activityLog.create({
      data: {
        action: 'CRON_PAYOUT_RUN',
        entityType: 'System',
        entityId: 'payout-processor',
        metadata: {
          processed: result.processed,
          totalAmount: result.totalAmount,
          failures: result.failures,
          executionTime: `${executionTime}s`,
          timestamp: new Date()
        },
        ipAddress: 'vercel-cron'
      }
    })

    // Send admin notification if there were failures
    if (result.failures.length > 0) {
      await prisma.adminNotification.create({
        data: {
          type: 'SYSTEM_ALERT',
          title: 'Payout Processing - Failures Detected',
          message: `${result.failures.length} payout(s) failed to process during automated run. Total successful: ${result.processed} ($${result.totalAmount.toFixed(2)})`,
          priority: 'HIGH',
          status: 'UNREAD',
          actionRequired: true,
          actionUrl: '/admin/payouts?filter=failed',
          metadata: {
            failures: result.failures,
            processed: result.processed,
            totalAmount: result.totalAmount,
            executionTime: `${executionTime}s`
          }
        }
      })
    }

    // Send success notification for visibility (optional, only if payouts processed)
    if (result.processed > 0) {
      await prisma.adminNotification.create({
        data: {
          type: 'SYSTEM_ALERT',
          title: 'Payout Processing - Success',
          message: `Successfully processed ${result.processed} payout(s) totaling $${result.totalAmount.toFixed(2)}`,
          priority: 'LOW',
          status: 'UNREAD',
          actionRequired: false,
          metadata: {
            processed: result.processed,
            totalAmount: result.totalAmount,
            failures: result.failures.length,
            executionTime: `${executionTime}s`
          }
        }
      })
    }

    console.log(`[Cron] Payout processing completed in ${executionTime}s`)

    return NextResponse.json({
      success: true,
      processed: result.processed,
      totalAmount: result.totalAmount,
      failures: result.failures,
      executionTime: `${executionTime}s`,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2)
    
    console.error('[Cron] Fatal error during payout processing:', error)

    // Log critical error
    try {
      await prisma.activityLog.create({
        data: {
          action: 'CRON_PAYOUT_ERROR',
          entityType: 'System',
          entityId: 'payout-processor',
          metadata: {
            error: error.message,
            stack: error.stack,
            executionTime: `${executionTime}s`,
            timestamp: new Date()
          },
          ipAddress: 'vercel-cron'
        }
      })

      // Create urgent admin notification
      await prisma.adminNotification.create({
        data: {
          type: 'SYSTEM_ALERT',
          title: 'CRITICAL: Payout Processing Failed',
          message: `Automated payout processing encountered a fatal error: ${error.message}`,
          priority: 'URGENT',
          status: 'UNREAD',
          actionRequired: true,
          actionUrl: '/admin/system/logs',
          metadata: {
            error: error.message,
            stack: error.stack,
            executionTime: `${executionTime}s`
          }
        }
      })
    } catch (logError) {
      console.error('[Cron] Failed to log error:', logError)
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        executionTime: `${executionTime}s`,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for manual testing
 * Returns status without processing
 */
export async function GET(request: NextRequest) {
  // Check for admin authorization (optional - implement your auth)
  const authHeader = request.headers.get('authorization')
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
  
  if (authHeader !== expectedAuth) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Get count of pending payouts
  const pendingCount = await prisma.rentalPayout.count({
    where: {
      status: 'PENDING',
      eligibleAt: { lte: new Date() }
    }
  })

  const upcomingCount = await prisma.rentalPayout.count({
    where: {
      status: 'PENDING',
      eligibleAt: { gt: new Date() }
    }
  })

  return NextResponse.json({
    status: 'Payout cron endpoint is active',
    pendingEligible: pendingCount,
    pendingUpcoming: upcomingCount,
    cronSchedule: 'Daily at 2:00 AM UTC',
    manualTrigger: 'POST to this endpoint with valid CRON_SECRET',
    timestamp: new Date().toISOString()
  })
}