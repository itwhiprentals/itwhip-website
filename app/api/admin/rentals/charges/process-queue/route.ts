// app/api/admin/rentals/charges/process-queue/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { PaymentProcessor } from '@/app/lib/stripe/payment-processor'
import { sendChargesProcessedEmail, sendPaymentFailedEmail } from '@/app/lib/email'

interface QueueFilters {
  status?: 'pending' | 'failed' | 'expired' | 'all'
  olderThan?: number // hours
  bookingId?: string
  limit?: number
}

interface ProcessResult {
  bookingId: string
  bookingCode: string
  status: 'success' | 'failed' | 'skipped'
  amount?: number
  error?: string
  chargeId?: string
}

// GET - Retrieve charges pending processing
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || 'pending'
    const olderThan = parseInt(searchParams.get('olderThan') || '24')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Calculate cutoff time for 24-hour holds
    const holdCutoffTime = new Date()
    holdCutoffTime.setHours(holdCutoffTime.getHours() - olderThan)
    
    // Build where clause based on filters
    const where: any = {}
    
    if (status === 'pending') {
      where.OR = [
        {
          // Charges marked for 24-hour hold that have expired
          verificationStatus: 'PENDING_CHARGES',
          paymentStatus: 'PENDING_CHARGES',
          tripEndedAt: { lte: holdCutoffTime }
        },
        {
          // Failed charges ready for retry
          paymentStatus: 'PAYMENT_FAILED',
          chargesProcessedAt: null
        }
      ]
    } else if (status === 'failed') {
      where.paymentStatus = 'PAYMENT_FAILED'
    } else if (status === 'expired') {
      where.AND = [
        { verificationStatus: 'PENDING_CHARGES' },
        { tripEndedAt: { lte: holdCutoffTime } }
      ]
    }
    
    // Fetch bookings with pending charges
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        ...where,
        pendingChargesAmount: { gt: 0 },
        stripePaymentMethodId: { not: null },
        stripeCustomerId: { not: null }
      },
      include: {
        car: {
          include: {
            host: true
          }
        },
        tripCharges: {
          where: {
            chargeStatus: {
              in: ['PENDING', 'FAILED', 'REVIEW_REQUESTED']
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: [
        { tripEndedAt: 'asc' }, // Process oldest first
        { pendingChargesAmount: 'desc' } // Then by amount
      ],
      take: limit
    })
    
    // Calculate statistics
    const stats = {
      totalPending: bookings.length,
      totalAmount: bookings.reduce((sum, b) => sum + (b.pendingChargesAmount || 0), 0),
      oldestPending: bookings[0]?.tripEndedAt || null,
      readyToProcess: bookings.filter(b => {
        const tripEndTime = b.tripEndedAt ? new Date(b.tripEndedAt) : null
        return tripEndTime && tripEndTime <= holdCutoffTime
      }).length,
      failedCharges: bookings.filter(b => b.paymentStatus === 'PAYMENT_FAILED').length
    }
    
    // Format response
    const formattedBookings = bookings.map(booking => {
      const tripCharge = booking.tripCharges[0]
      const hoursWaiting = booking.tripEndedAt 
        ? Math.floor((Date.now() - new Date(booking.tripEndedAt).getTime()) / (1000 * 60 * 60))
        : 0
      
      return {
        id: booking.id,
        bookingCode: booking.bookingCode,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        pendingAmount: booking.pendingChargesAmount,
        tripEndedAt: booking.tripEndedAt,
        hoursWaiting,
        isExpired: hoursWaiting >= olderThan,
        paymentStatus: booking.paymentStatus,
        hasPaymentMethod: !!(booking.stripePaymentMethodId && booking.stripeCustomerId),
        tripCharge: tripCharge ? {
          id: tripCharge.id,
          status: tripCharge.chargeStatus,
          retryCount: tripCharge.retryCount || 0,
          lastFailureReason: tripCharge.failureReason
        } : null,
        car: {
          description: `${booking.car.year} ${booking.car.make} ${booking.car.model}`,
          hostName: booking.car.host.name
        }
      }
    })
    
    return NextResponse.json({
      bookings: formattedBookings,
      stats,
      filters: {
        status,
        olderThan,
        limit,
        holdCutoffTime: holdCutoffTime.toISOString()
      }
    })
    
  } catch (error) {
    console.error('[Charge Queue] Error fetching queue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch charge queue' },
      { status: 500 }
    )
  }
}

// POST - Process charges in the queue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      mode = 'expired', // 'expired', 'all', 'specific'
      bookingIds = [],
      dryRun = false,
      maxRetries = 2,
      holdHours = 24
    } = body
    
    // Get admin info from headers
    const adminId = request.headers.get('x-admin-id') || 'system'
    
    // Determine which bookings to process
    let bookingsToProcess = []
    
    if (mode === 'specific' && bookingIds.length > 0) {
      // Process specific bookings
      bookingsToProcess = await prisma.rentalBooking.findMany({
        where: {
          id: { in: bookingIds },
          pendingChargesAmount: { gt: 0 },
          stripePaymentMethodId: { not: null }
        },
        include: {
          tripCharges: {
            where: {
              chargeStatus: { in: ['PENDING', 'FAILED', 'REVIEW_REQUESTED'] }
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })
    } else {
      // Calculate cutoff time for expired holds
      const holdCutoffTime = new Date()
      holdCutoffTime.setHours(holdCutoffTime.getHours() - holdHours)
      
      const where: any = {
        pendingChargesAmount: { gt: 0 },
        stripePaymentMethodId: { not: null },
        stripeCustomerId: { not: null }
      }
      
      if (mode === 'expired') {
        // Only process expired 24-hour holds
        where.AND = [
          { verificationStatus: 'PENDING_CHARGES' },
          { tripEndedAt: { lte: holdCutoffTime } }
        ]
      } else if (mode === 'all') {
        // Process all pending charges
        where.verificationStatus = 'PENDING_CHARGES'
      }
      
      bookingsToProcess = await prisma.rentalBooking.findMany({
        where,
        include: {
          tripCharges: {
            where: {
              chargeStatus: { in: ['PENDING', 'FAILED', 'REVIEW_REQUESTED'] }
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        take: 50 // Process max 50 at a time
      })
    }
    
    console.log(`[Charge Queue] Processing ${bookingsToProcess.length} bookings in ${mode} mode (dry run: ${dryRun})`)
    
    // Process each booking
    const results: ProcessResult[] = []
    
    for (const booking of bookingsToProcess) {
      const tripCharge = booking.tripCharges[0]
      const retryCount = tripCharge?.retryCount || 0
      
      // Skip if exceeded max retries
      if (retryCount >= maxRetries) {
        console.log(`[Charge Queue] Skipping ${booking.bookingCode} - exceeded max retries (${retryCount})`)
        results.push({
          bookingId: booking.id,
          bookingCode: booking.bookingCode,
          status: 'skipped',
          error: `Exceeded max retries (${retryCount}/${maxRetries})`
        })
        continue
      }
      
      // Skip if no charges
      if (!booking.pendingChargesAmount || booking.pendingChargesAmount <= 0) {
        results.push({
          bookingId: booking.id,
          bookingCode: booking.bookingCode,
          status: 'skipped',
          error: 'No pending charges'
        })
        continue
      }
      
      if (dryRun) {
        // Dry run - don't actually charge
        console.log(`[Charge Queue] DRY RUN: Would charge ${booking.bookingCode} $${booking.pendingChargesAmount}`)
        results.push({
          bookingId: booking.id,
          bookingCode: booking.bookingCode,
          status: 'success',
          amount: booking.pendingChargesAmount,
          error: 'Dry run - no charge processed'
        })
      } else {
        // Attempt to process the charge
        try {
          console.log(`[Charge Queue] Processing charge for ${booking.bookingCode}: $${booking.pendingChargesAmount}`)
          
          const chargeResult = await PaymentProcessor.chargeAdditionalFees(
            booking.stripeCustomerId!,
            booking.stripePaymentMethodId!,
            Math.round(booking.pendingChargesAmount * 100),
            `Auto-processed trip charges for booking ${booking.bookingCode}`,
            {
              bookingId: booking.id,
              bookingCode: booking.bookingCode,
              processedBy: adminId,
              processingMode: mode,
              retryAttempt: retryCount + 1,
              queueProcessed: true
            }
          )
          
          if (chargeResult.status === 'succeeded') {
            // Update booking as paid
            await prisma.$transaction([
              prisma.rentalBooking.update({
                where: { id: booking.id },
                data: {
                  status: 'COMPLETED',
                  verificationStatus: 'COMPLETED',
                  paymentStatus: 'CHARGES_PAID',
                  pendingChargesAmount: null,
                  chargesProcessedAt: new Date(),
                  stripeChargeId: chargeResult.chargeId
                }
              }),
              
              // Update trip charge if exists
              ...(tripCharge ? [
                prisma.tripCharge.update({
                  where: { id: tripCharge.id },
                  data: {
                    chargeStatus: 'CHARGED',
                    chargedAt: new Date(),
                    stripeChargeId: chargeResult.chargeId,
                    processedByAdminId: adminId,
                    retryCount: retryCount + 1
                  }
                })
              ] : []),
              
              // Add success message
              prisma.rentalMessage.create({
                data: {
                  bookingId: booking.id,
                  senderId: 'system',
                  senderType: 'admin',
                  senderName: 'System',
                  message: `✅ Additional charges of $${booking.pendingChargesAmount.toFixed(2)} have been automatically processed after the 24-hour review period.`,
                  category: 'charges',
                  metadata: { chargeId: chargeResult.chargeId, amount: booking.pendingChargesAmount },
                  isRead: false
                }
              })
            ])
            
            // Send confirmation email
            if (booking.guestEmail) {
              await sendChargesProcessedEmail(booking.guestEmail, {
                guestName: booking.guestName || 'Guest',
                bookingCode: booking.bookingCode,
                chargeAmount: booking.pendingChargesAmount,
                chargeId: chargeResult.chargeId
              }).catch(console.error)
            }
            
            results.push({
              bookingId: booking.id,
              bookingCode: booking.bookingCode,
              status: 'success',
              amount: booking.pendingChargesAmount,
              chargeId: chargeResult.chargeId
            })
            
            console.log(`[Charge Queue] Successfully charged ${booking.bookingCode}: $${booking.pendingChargesAmount}`)
            
          } else {
            // Charge failed
            throw new Error(chargeResult.error || 'Payment failed')
          }
          
        } catch (chargeError: any) {
          console.error(`[Charge Queue] Failed to charge ${booking.bookingCode}:`, chargeError)
          
          // Update booking with failure
          await prisma.$transaction([
            prisma.rentalBooking.update({
              where: { id: booking.id },
              data: {
                paymentStatus: 'PAYMENT_FAILED',
                paymentFailureReason: chargeError.message
              }
            }),
            
            // Update trip charge if exists
            ...(tripCharge ? [
              prisma.tripCharge.update({
                where: { id: tripCharge.id },
                data: {
                  chargeStatus: 'FAILED',
                  failureReason: chargeError.message,
                  retryCount: retryCount + 1,
                  lastRetryAt: new Date()
                }
              })
            ] : []),
            
            // Add failure message
            prisma.rentalMessage.create({
              data: {
                bookingId: booking.id,
                senderId: 'system',
                senderType: 'admin',
                senderName: 'System',
                message: `⚠️ Failed to process additional charges of $${booking.pendingChargesAmount.toFixed(2)}. ${
                  retryCount + 1 >= maxRetries 
                    ? 'Maximum retry attempts reached. Manual intervention required.'
                    : 'Will retry again later.'
                }`,
                category: 'charges',
                metadata: { error: chargeError.message, retryCount: retryCount + 1 },
                isRead: false,
                isUrgent: retryCount + 1 >= maxRetries
              }
            }),
            
            // Create admin notification if max retries reached
            ...(retryCount + 1 >= maxRetries ? [
              prisma.adminNotification.create({
                data: {
                  type: 'CHARGE_FAILED',
                  title: `Payment Failed - ${booking.bookingCode}`,
                  message: `Failed to process $${booking.pendingChargesAmount.toFixed(2)} after ${maxRetries} attempts. Manual intervention required.`,
                  priority: 'HIGH',
                  status: 'UNREAD',
                  relatedId: booking.id,
                  relatedType: 'RentalBooking',
                  actionRequired: true,
                  actionUrl: `/admin/rentals/verifications/${booking.id}`,
                  metadata: {
                    amount: booking.pendingChargesAmount,
                    error: chargeError.message,
                    retryCount: retryCount + 1
                  }
                }
              })
            ] : [])
          ])
          
          // Send failure email if max retries
          if (booking.guestEmail && retryCount + 1 >= maxRetries) {
            await sendPaymentFailedEmail(booking.guestEmail, {
              guestName: booking.guestName || 'Guest',
              bookingCode: booking.bookingCode,
              chargeAmount: booking.pendingChargesAmount,
              failureReason: chargeError.message
            }).catch(console.error)
          }
          
          results.push({
            bookingId: booking.id,
            bookingCode: booking.bookingCode,
            status: 'failed',
            amount: booking.pendingChargesAmount,
            error: chargeError.message
          })
        }
      }
    }
    
    // Calculate summary
    const summary = {
      processed: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      totalCharged: results
        .filter(r => r.status === 'success')
        .reduce((sum, r) => sum + (r.amount || 0), 0),
      dryRun
    }
    
    // Log the batch process
    await prisma.activityLog.create({
      data: {
        action: 'CHARGE_QUEUE_PROCESSED',
        entityType: 'ChargeQueue',
        entityId: 'batch',
        metadata: {
          mode,
          summary,
          results: results.map(r => ({
            bookingCode: r.bookingCode,
            status: r.status,
            amount: r.amount
          })),
          processedBy: adminId,
          timestamp: new Date()
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'system'
      }
    }).catch(console.error)
    
    console.log(`[Charge Queue] Batch complete:`, summary)
    
    return NextResponse.json({
      success: true,
      summary,
      results,
      message: dryRun 
        ? `Dry run complete: ${results.length} charges would be processed`
        : `Processed ${summary.successful} charges successfully, ${summary.failed} failed`
    })
    
  } catch (error) {
    console.error('[Charge Queue] Error processing queue:', error)
    return NextResponse.json(
      { error: 'Failed to process charge queue', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE - Clear failed charges from queue (admin action)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get('bookingId')
    const reason = searchParams.get('reason') || 'Manual clearance by admin'
    const adminId = request.headers.get('x-admin-id') || 'admin'
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID required' },
        { status: 400 }
      )
    }
    
    // Clear pending charges for the booking
    const booking = await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        pendingChargesAmount: null,
        verificationStatus: 'COMPLETED',
        paymentStatus: 'CHARGES_CLEARED',
        chargesNotes: reason
      }
    })
    
    // Update trip charge if exists
    await prisma.tripCharge.updateMany({
      where: {
        bookingId,
        chargeStatus: { in: ['PENDING', 'FAILED'] }
      },
      data: {
        chargeStatus: 'CLEARED',
        clearedReason: reason,
        clearedByAdminId: adminId,
        clearedAt: new Date()
      }
    })
    
    // Log the action
    await prisma.activityLog.create({
      data: {
        action: 'CHARGES_CLEARED',
        entityType: 'RentalBooking',
        entityId: bookingId,
        metadata: {
          reason,
          clearedBy: adminId,
          amount: booking.pendingChargesAmount
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'admin'
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Charges cleared successfully',
      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        clearedAmount: booking.pendingChargesAmount
      }
    })
    
  } catch (error) {
    console.error('[Charge Queue] Error clearing charges:', error)
    return NextResponse.json(
      { error: 'Failed to clear charges' },
      { status: 500 }
    )
  }
}