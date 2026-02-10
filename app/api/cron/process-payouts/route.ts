// app/api/cron/process-payouts/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { processEligiblePayouts } from '@/app/lib/payouts/process-eligible'
import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe'

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

    // ========================================================================
    // STEP 0: Activate pending bank accounts that have passed the 24-hour delay
    // ========================================================================
    try {
      const hostsWithPendingBanks = await prisma.rentalHost.findMany({
        where: {
          pendingBankAccountId: { not: null },
          pendingBankActivatesAt: { lte: new Date() },
        },
        select: {
          id: true,
          email: true,
          stripeAccountId: true,
          pendingBankAccountId: true,
          pendingBankLast4: true,
          pendingBankName: true,
          pendingBankType: true,
        }
      })

      for (const host of hostsWithPendingBanks) {
        try {
          // Set the pending bank as default on Stripe Connect
          if (host.stripeAccountId && host.pendingBankAccountId) {
            await stripe.accounts.updateExternalAccount(
              host.stripeAccountId,
              host.pendingBankAccountId,
              { default_for_currency: true } as any
            )
          }

          // Move pending fields to active fields
          await prisma.rentalHost.update({
            where: { id: host.id },
            data: {
              defaultPayoutMethod: host.pendingBankAccountId,
              bankAccountLast4: host.pendingBankLast4,
              bankName: host.pendingBankName,
              bankAccountType: host.pendingBankType,
              bankVerified: false,
              // Clear pending fields
              pendingBankAccountId: null,
              pendingBankLast4: null,
              pendingBankName: null,
              pendingBankType: null,
              pendingBankActivatesAt: null,
            }
          })

          console.log(`[Cron] Activated pending bank for host ${host.id}: ***${host.pendingBankLast4}`)

          // Notify host
          try {
            const { sendEmail } = await import('@/app/lib/email/sender')
            await sendEmail(
              host.email,
              'Your New Payout Account is Now Active',
              `<p>Your new bank account ending in ${host.pendingBankLast4} is now your active payout method on ItWhip.</p>`,
              `Your new bank account ending in ${host.pendingBankLast4} is now your active payout method on ItWhip.`
            )
          } catch (emailErr) {
            console.error(`[Cron] Failed to send bank activation email to ${host.email}:`, emailErr)
          }
        } catch (activationErr) {
          console.error(`[Cron] Failed to activate pending bank for host ${host.id}:`, activationErr)
        }
      }

      if (hostsWithPendingBanks.length > 0) {
        console.log(`[Cron] Activated ${hostsWithPendingBanks.length} pending bank account(s)`)
      }
    } catch (bankErr) {
      console.error('[Cron] Error processing pending bank activations:', bankErr)
      // Don't fail the whole cron — continue to payout processing
    }

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
      } as any
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
        } as any
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
        } as any
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
        } as any
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
        } as any
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