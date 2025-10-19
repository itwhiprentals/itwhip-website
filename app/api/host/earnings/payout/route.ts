// app/api/host/earnings/payout/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { headers } from 'next/headers'
import { 
  PAYOUT_CONFIG,
  calculateHostEarnings,
  PLATFORM_COMMISSION,
  HOST_PROTECTION_PLANS
} from '@/app/fleet/financial-constants'

// Helper to get host from headers
async function getHostFromHeaders() {
  const headersList = await headers()
  const hostId = headersList.get('x-host-id')
  const userId = headersList.get('x-user-id')
  
  if (!hostId && !userId) return null
  
  const host = await prisma.rentalHost.findFirst({
    where: hostId ? { id: hostId } : { userId: userId }
  })
  
  return host
}

export async function POST(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if host is approved
    if (host.approvalStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only approved hosts can request payouts' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      amount,
      payoutMethod = 'bank',
      isInstant = false 
    } = body

    // Validate payout amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payout amount' },
        { status: 400 }
      )
    }

    // Get host's protection plan commission rate
    const protectionPlan = (host as any).protectionPlan || 'BASIC'
    const commissionRate = HOST_PROTECTION_PLANS[protectionPlan]?.commission || PLATFORM_COMMISSION

    // Calculate available balance (completed trips older than 3 days)
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - PAYOUT_CONFIG.PAYOUT_DELAY_DAYS)

    // Get unpaid completed bookings
    const eligibleBookings = await prisma.rentalBooking.findMany({
      where: {
        hostId: host.id,
        status: 'COMPLETED',
        tripStatus: 'COMPLETED',
        paymentStatus: 'PAID',
        tripEndedAt: {
          lte: threeDaysAgo
        },
        OR: [
          { payoutId: null },
          { payoutProcessed: false }
        ]
      },
      include: {
        tripCharges: {
          where: {
            chargeStatus: 'PAID'
          }
        }
      }
    })

    // Calculate total available for payout
    let grossEarnings = 0
    const bookingIds: string[] = []

    for (const booking of eligibleBookings) {
      const bookingTotal = Number(booking.totalAmount || 0)
      
      // Add approved additional charges
      const additionalCharges = booking.tripCharges.reduce((sum, charge) => {
        return sum + Number(charge.finalAmount || 0)
      }, 0)
      
      grossEarnings += bookingTotal + additionalCharges
      bookingIds.push(booking.id)
    }

    // Calculate host earnings after commission
    const platformFee = grossEarnings * commissionRate
    const netEarnings = grossEarnings - platformFee

    // Apply processing fees
    const processingFee = (netEarnings * PAYOUT_CONFIG.PROCESSING_FEE_PERCENT) + 
                         PAYOUT_CONFIG.PROCESSING_FEE_FIXED
    
    // Apply instant payout fee if requested
    const instantFee = isInstant ? PAYOUT_CONFIG.INSTANT_PAYOUT_FEE : 0
    
    // Calculate final payout amount
    const finalPayoutAmount = netEarnings - processingFee - instantFee

    // Check minimum payout threshold
    const minPayout = (host as any).customMinimumPayout || PAYOUT_CONFIG.MINIMUM_PAYOUT
    if (finalPayoutAmount < minPayout) {
      return NextResponse.json(
        { 
          error: `Minimum payout amount is $${minPayout}. Your available balance is $${finalPayoutAmount.toFixed(2)}`,
          availableBalance: finalPayoutAmount
        },
        { status: 400 }
      )
    }

    // Check if requested amount exceeds available balance
    if (amount > finalPayoutAmount) {
      return NextResponse.json(
        { 
          error: `Requested amount exceeds available balance`,
          availableBalance: finalPayoutAmount,
          requested: amount
        },
        { status: 400 }
      )
    }

    // Create payout record
    const payout = await prisma.rentalPayout.create({
      data: {
        hostId: host.id,
        amount: amount,
        currency: 'USD',
        status: isInstant ? 'processing' : 'pending',
        
        // Period (for this payout batch)
        startDate: eligibleBookings[eligibleBookings.length - 1]?.createdAt || new Date(),
        endDate: new Date(),
        
        // Breakdown
        bookingCount: bookingIds.length,
        grossEarnings: grossEarnings,
        platformFee: platformFee,
        processingFee: processingFee + instantFee,
        netPayout: amount,
        
        // Payment details
        paymentMethod: payoutMethod,
        paymentDetails: JSON.stringify({
          method: payoutMethod,
          instant: isInstant,
          instantFee: instantFee,
          processingFee: processingFee
        })
      }
    })

    // Mark bookings as included in payout
    if (bookingIds.length > 0) {
      await prisma.rentalBooking.updateMany({
        where: {
          id: { in: bookingIds }
        },
        data: {
          payoutId: payout.id,
          payoutProcessed: true
        }
      })
    }

    // Create host payout records for individual bookings
    const hostPayoutRecords = bookingIds.map(bookingId => ({
      hostId: host.id,
      bookingId: bookingId,
      amount: amount / bookingIds.length, // Distribute evenly for record keeping
      status: 'PENDING' as const
    }))

    if (hostPayoutRecords.length > 0) {
      await prisma.hostPayout.createMany({
        data: hostPayoutRecords
      })
    }

    // Log the payout request
    await prisma.activityLog.create({
      data: {
        action: 'PAYOUT_REQUESTED',
        entityType: 'payout',
        entityId: payout.id,
        metadata: {
          hostId: host.id,
          amount: amount,
          method: payoutMethod,
          instant: isInstant,
          bookingCount: bookingIds.length
        }
      }
    })

    // Send notification to admin for processing
    await prisma.adminNotification.create({
      data: {
        type: 'PAYOUT_REQUEST',
        title: 'New Payout Request',
        message: `${host.name} requested a payout of $${amount.toFixed(2)}`,
        priority: isInstant ? 'high' : 'normal',
        metadata: JSON.stringify({
          hostId: host.id,
          payoutId: payout.id,
          amount: amount,
          instant: isInstant
        })
      }
    })

    // In production, initiate Stripe transfer here
    // if (process.env.NODE_ENV === 'production') {
    //   const transfer = await stripe.transfers.create({
    //     amount: Math.round(amount * 100), // Convert to cents
    //     currency: 'usd',
    //     destination: host.stripeAccountId,
    //     transfer_group: `payout_${payout.id}`,
    //     metadata: {
    //       host_id: host.id,
    //       payout_id: payout.id
    //     }
    //   })
    //   
    //   await prisma.rentalPayout.update({
    //     where: { id: payout.id },
    //     data: { 
    //       stripeTransferId: transfer.id,
    //       status: 'processing'
    //     }
    //   })
    // }

    return NextResponse.json({
      success: true,
      data: {
        payoutId: payout.id,
        amount: amount,
        processingFee: processingFee,
        instantFee: instantFee,
        netAmount: amount,
        status: payout.status,
        estimatedArrival: isInstant ? 'Within 30 minutes' : '2-3 business days',
        bookingsIncluded: bookingIds.length
      }
    })

  } catch (error) {
    console.error('Payout request error:', error)
    return NextResponse.json(
      { error: 'Failed to process payout request' },
      { status: 500 }
    )
  }
}

// GET endpoint to check payout status
export async function GET(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get recent payouts for this host
    const payouts = await prisma.rentalPayout.findMany({
      where: {
        hostId: host.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Format payouts for response
    const formattedPayouts = payouts.map(p => ({
      id: p.id,
      amount: Number(p.amount),
      status: p.status,
      method: p.paymentMethod,
      requestedAt: p.createdAt,
      processedAt: p.processedAt,
      bookingCount: p.bookingCount,
      netPayout: Number(p.netPayout)
    }))

    return NextResponse.json({
      success: true,
      data: formattedPayouts
    })

  } catch (error) {
    console.error('Get payouts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    )
  }
}