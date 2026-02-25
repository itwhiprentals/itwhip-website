// app/lib/payouts/process-eligible.ts

import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe/client'

/**
 * Process all eligible payouts
 * 
 * Finds RentalPayout records that are:
 * - status = 'PENDING'
 * - eligibleAt <= NOW()
 * - Associated booking has tripEndedAt (trip completed)
 * - No active disputes
 * - Host has payoutsEnabled = true
 * 
 * For each eligible payout, transfers funds via Stripe and updates status
 */
export async function processEligiblePayouts(): Promise<{
  processed: number
  totalAmount: number
  failures: Array<{ bookingId: string; hostId: string; reason: string }>
}> {
  const startTime = Date.now()
  console.log('[Payout Processor] Starting eligible payout processing...')

  let processed = 0
  let totalAmount = 0
  const failures: Array<{ bookingId: string; hostId: string; reason: string }> = []

  try {
    // Find all eligible payouts
    const eligiblePayouts = await prisma.rentalPayout.findMany({
      where: {
        status: 'PENDING',
        eligibleAt: {
          lte: new Date() // Eligible date has passed
        }
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            stripeConnectAccountId: true,
            payoutsEnabled: true,
            stripePayoutsEnabled: true,
            pendingBalance: true
          }
        },
        booking: {
          select: {
            id: true,
            bookingCode: true,
            tripEndedAt: true,
            status: true
          }
        }
      },
      orderBy: {
        eligibleAt: 'asc' // Process oldest first
      }
    })

    console.log(`[Payout Processor] Found ${eligiblePayouts.length} eligible payout(s)`)

    if (eligiblePayouts.length === 0) {
      return { processed: 0, totalAmount: 0, failures: [] }
    }

    // Process each payout
    for (const payout of eligiblePayouts) {
      try {
        // Validate payout eligibility
        const eligibilityCheck = await isPayoutEligible(payout)
        
        if (!eligibilityCheck.eligible) {
          console.log(`[Payout Processor] Skipping payout ${payout.id}: ${eligibilityCheck.reason}`)
          failures.push({
            bookingId: payout.bookingId || 'unknown',
            hostId: payout.hostId,
            reason: eligibilityCheck.reason
          })
          
          // If permanently ineligible, mark as FAILED
          if (eligibilityCheck.permanent) {
            await prisma.rentalPayout.update({
              where: { id: payout.id },
              data: {
                status: 'FAILED',
                processedAt: new Date()
              }
            })
          }
          
          continue
        }

        // Process the payout
        const success = await processSinglePayout(payout)
        
        if (success) {
          processed++
          totalAmount += payout.amount
          console.log(`[Payout Processor] ✅ Processed payout ${payout.id} - $${payout.amount.toFixed(2)} to ${payout.host.name}`)
        } else {
          failures.push({
            bookingId: payout.bookingId || 'unknown',
            hostId: payout.hostId,
            reason: 'Transfer failed - see logs'
          })
        }

      } catch (error: any) {
        console.error(`[Payout Processor] Error processing payout ${payout.id}:`, error)
        failures.push({
          bookingId: payout.bookingId || 'unknown',
          hostId: payout.hostId,
          reason: error.message || 'Unknown error'
        })
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`[Payout Processor] Completed in ${duration}s - Processed: ${processed}, Failed: ${failures.length}`)

    return {
      processed,
      totalAmount,
      failures
    }

  } catch (error) {
    console.error('[Payout Processor] Fatal error:', error)
    throw error
  }
}

/**
 * Check if a payout is eligible for processing
 */
async function isPayoutEligible(
  payout: any
): Promise<{ eligible: boolean; reason: string; permanent?: boolean }> {
  
  // Check if already processing or processed
  if (payout.status !== 'PENDING') {
    return { eligible: false, reason: `Status is ${payout.status}`, permanent: true }
  }

  // Check if trip has ended
  if (!payout.booking?.tripEndedAt) {
    return { eligible: false, reason: 'Trip has not ended yet', permanent: false }
  }

  // Check for active disputes
  const disputes = await prisma.rentalDispute.count({
    where: {
      bookingId: payout.bookingId || undefined,
      status: {
        in: ['OPEN', 'UNDER_REVIEW', 'INVESTIGATING'] as any
      }
    }
  })

  if (disputes > 0) {
    // Extend eligibility by 7 days and skip for now
    await prisma.rentalPayout.update({
      where: { id: payout.id },
      data: {
        eligibleAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })
    return { eligible: false, reason: `${disputes} active dispute(s) - extended hold by 7 days`, permanent: false }
  }

  // Check if host has payouts enabled
  if (!payout.host.payoutsEnabled) {
    return { eligible: false, reason: 'Host payouts disabled', permanent: true }
  }

  // Check if host has Stripe Connect account
  if (!payout.host.stripeConnectAccountId) {
    return { eligible: false, reason: 'No Stripe Connect account', permanent: true }
  }

  // Check if Stripe account has payouts enabled
  if (!payout.host.stripePayoutsEnabled) {
    return { eligible: false, reason: 'Stripe payouts not enabled', permanent: true }
  }

  // Verify amount matches host's pending balance
  if (payout.host.pendingBalance < payout.amount) {
    return { 
      eligible: false, 
      reason: `Insufficient pending balance: $${payout.host.pendingBalance.toFixed(2)} < $${payout.amount.toFixed(2)}`,
      permanent: true 
    }
  }

  // All checks passed
  return { eligible: true, reason: 'Eligible for payout' }
}

/**
 * Process a single payout via Stripe Transfer
 */
async function processSinglePayout(payout: any): Promise<boolean> {
  const maxRetries = 3
  let attempt = 0

  while (attempt < maxRetries) {
    try {
      attempt++
      console.log(`[Payout Processor] Processing payout ${payout.id}, attempt ${attempt}/${maxRetries}`)

      // Update status to PROCESSING
      await prisma.rentalPayout.update({
        where: { id: payout.id },
        data: { status: 'PROCESSING' }
      })

      // Check for pending platform fees owed (e.g. cash booking commissions)
      const pendingFees = await prisma.platformFeeOwed.findMany({
        where: {
          hostId: payout.hostId,
          status: 'PENDING'
        }
      })

      const totalFeesOwed = pendingFees.reduce((sum, fee) => sum + Number(fee.amount), 0)
      const deductionAmount = Math.min(totalFeesOwed, payout.amount)
      const netPayoutAmount = Math.max(0, payout.amount - deductionAmount)

      if (deductionAmount > 0) {
        console.log(`[Payout Processor] Deducting $${deductionAmount.toFixed(2)} in platform fees from payout ${payout.id}`)
      }

      // Create Stripe Transfer (with fee deduction applied)
      const transfer = await stripe.transfers.create({
        amount: Math.round(netPayoutAmount * 100), // Convert to cents
        currency: 'usd',
        destination: payout.host.stripeConnectAccountId,
        description: `Payout for booking ${payout.booking?.bookingCode || 'N/A'}${deductionAmount > 0 ? ` (less $${deductionAmount.toFixed(2)} platform fees)` : ''}`,
        metadata: {
          payoutId: payout.id,
          bookingId: payout.bookingId || '',
          hostId: payout.hostId,
          bookingCode: payout.booking?.bookingCode || '',
          platform: 'itwhip',
          ...(deductionAmount > 0 ? {
            originalAmount: payout.amount.toFixed(2),
            feeDeduction: deductionAmount.toFixed(2),
            netAmount: netPayoutAmount.toFixed(2)
          } : {})
        }
      })

      console.log(`[Payout Processor] Stripe transfer created: ${transfer.id}`)

      // Update payout and host in transaction
      await prisma.$transaction(async (tx) => {
        // Update payout to PAID
        await tx.rentalPayout.update({
          where: { id: payout.id },
          data: {
            status: 'PAID',
            stripeTransferId: transfer.id,
            processedAt: new Date()
          }
        })

        // Update host balances
        await tx.rentalHost.update({
          where: { id: payout.hostId },
          data: {
            pendingBalance: { decrement: payout.amount },
            currentBalance: { increment: payout.amount },
            totalEarnings: { increment: payout.amount },
            lastPayoutDate: new Date(),
            lastPayoutAmount: payout.amount,
            totalPayoutsCount: { increment: 1 },
            totalPayoutsAmount: { increment: payout.amount }
          }
        })

        // Mark platform fees as deducted
        if (deductionAmount > 0) {
          let remainingDeduction = deductionAmount
          for (const fee of pendingFees) {
            if (remainingDeduction <= 0) break
            const feeAmount = Number(fee.amount)
            if (feeAmount <= remainingDeduction) {
              await tx.platformFeeOwed.update({
                where: { id: fee.id },
                data: {
                  status: 'DEDUCTED',
                  deductedFromPayoutId: payout.id,
                  deductedAt: new Date()
                }
              })
              remainingDeduction -= feeAmount
            } else {
              // Partial deduction — split the fee record
              await tx.platformFeeOwed.update({
                where: { id: fee.id },
                data: {
                  amount: feeAmount - remainingDeduction,
                }
              })
              await tx.platformFeeOwed.create({
                data: {
                  hostId: fee.hostId,
                  bookingId: fee.bookingId,
                  amount: remainingDeduction,
                  reason: fee.reason,
                  status: 'DEDUCTED',
                  deductedFromPayoutId: payout.id,
                  deductedAt: new Date()
                }
              })
              remainingDeduction = 0
            }
          }
        }

        // Create audit log
        await tx.activityLog.create({
          data: {
            id: crypto.randomUUID(),
            action: 'PAYOUT_PROCESSED',
            entityType: 'RentalPayout',
            entityId: payout.id,
            metadata: {
              amount: payout.amount,
              stripeTransferId: transfer.id,
              hostId: payout.hostId,
              hostName: payout.host.name,
              bookingCode: payout.booking?.bookingCode,
              attempt: attempt,
              timestamp: new Date()
            },
            ipAddress: 'cron-job'
          }
        })
      })

      return true

    } catch (error: any) {
      console.error(`[Payout Processor] Attempt ${attempt} failed for payout ${payout.id}:`, error)

      // If this was the last attempt, mark as FAILED
      if (attempt >= maxRetries) {
        await prisma.rentalPayout.update({
          where: { id: payout.id },
          data: {
            status: 'FAILED',
            processedAt: new Date()
          }
        })

        // Log critical error
        await prisma.activityLog.create({
          data: {
            id: crypto.randomUUID(),
            action: 'PAYOUT_FAILED',
            entityType: 'RentalPayout',
            entityId: payout.id,
            metadata: {
              error: error.message,
              attempts: maxRetries,
              hostId: payout.hostId,
              amount: payout.amount,
              timestamp: new Date()
            },
            ipAddress: 'cron-job'
          }
        })

        // Create admin notification for failed payout
        await prisma.adminNotification.create({
          data: {
            type: 'SYSTEM_ALERT',
            title: `Payout Failed - ${payout.host.name}`,
            message: `Failed to process payout of $${payout.amount.toFixed(2)} after ${maxRetries} attempts. Error: ${error.message}`,
            priority: 'HIGH',
            status: 'UNREAD',
            relatedId: payout.id,
            relatedType: 'RentalPayout',
            actionRequired: true,
            actionUrl: `/admin/payouts/${payout.id}`,
            metadata: {
              error: error.message,
              hostId: payout.hostId,
              amount: payout.amount,
              attempts: maxRetries
            }
          } as any
        })

        return false
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }

  return false
}