// app/api/admin/trips/charges/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: Request) {
  try {
    // TODO: Add admin authentication check here
    
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    
    // Build where clause based on filter
    const whereClause: any = {}
    
    // Add filter conditions for TripCharge status
    if (filter === 'pending') {
      whereClause.chargeStatus = 'PENDING'
    } else if (filter === 'charged') {
      whereClause.chargeStatus = 'CHARGED'
    } else if (filter === 'failed') {
      whereClause.chargeStatus = 'FAILED'
    } else if (filter === 'refunded') {
      whereClause.chargeStatus = 'REFUNDED'
    }

    // Get trip charges from the TripCharge table
    const tripCharges = await prisma.tripCharge.findMany({
      where: whereClause,
      include: {
        booking: {
          include: {
            car: {
              select: {
                make: true,
                model: true,
                year: true
              }
            },
            host: {
              select: {
                name: true,
                email: true
              }
            },
            disputes: {
              where: {
                status: { in: ['OPEN', 'INVESTIGATING'] }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format charges data for the frontend
    const chargesData = tripCharges.map(charge => {
      const booking = charge.booking
      
      // Calculate overage miles from charge details
      const chargeDetails = charge.chargeDetails ? JSON.parse(charge.chargeDetails as string) : {}
      const overageMiles = chargeDetails.overageMiles || 0
      const lateHours = chargeDetails.lateHours || 0
      
      return {
        id: charge.id,
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        guestName: booking.guestName || 'Guest',
        guestEmail: booking.guestEmail || '',
        tripEndedAt: booking.tripEndedAt?.toISOString() || '',
        
        // Original amounts
        subtotal: booking.subtotal,
        totalAmount: booking.totalAmount,
        depositAmount: booking.depositAmount,
        
        // Trip data
        startMileage: booking.startMileage || 0,
        endMileage: booking.endMileage || 0,
        actualMiles: (booking.endMileage || 0) - (booking.startMileage || 0),
        includedMiles: (booking.numberOfDays || 1) * 200,
        overageMiles,
        
        fuelLevelStart: booking.fuelLevelStart || 'Unknown',
        fuelLevelEnd: booking.fuelLevelEnd || 'Unknown',
        
        // Charges from TripCharge record - Convert Decimal to number
        mileageCharge: Number(charge.mileageCharge || 0),
        fuelCharge: Number(charge.fuelCharge || 0),
        lateReturnCharge: Number(charge.lateCharge || 0),
        damageCharge: Number(charge.damageCharge || 0),
        cleaningCharge: Number(charge.cleaningCharge || 0),
        totalCharges: Number(charge.totalCharges || 0),
        lateHours,
        
        // Payment status from TripCharge
        chargeStatus: charge.chargeStatus.toLowerCase() as any,
        chargeProcessedAt: charge.chargedAt?.toISOString(),
        stripeChargeId: charge.stripeChargeId,
        
        // Waive/Refund info
        waivedAt: charge.waivedAt?.toISOString(),
        waivedBy: charge.waivedBy,
        waiveReason: charge.waiveReason,
        refundAmount: charge.refundAmount ? Number(charge.refundAmount) : undefined,
        refundReason: charge.refundReason,
        
        // Dispute info
        hasDispute: booking.disputes.length > 0 || !!charge.disputes,
        disputeStatus: booking.disputes[0]?.status,
        disputes: charge.disputes
      }
    })

    // Calculate statistics
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const stats = {
      totalPendingCharges: tripCharges
        .filter(c => c.chargeStatus === 'PENDING')
        .reduce((sum, c) => sum + Number(c.totalCharges || 0), 0),
      totalProcessedToday: tripCharges
        .filter(c => {
          if (!c.chargedAt) return false
          const chargedDate = new Date(c.chargedAt)
          return chargedDate >= today
        })
        .reduce((sum, c) => sum + Number(c.totalCharges || 0), 0),
      totalRefundedThisWeek: tripCharges
        .filter(c => {
          if (!c.refundedAt) return false
          const refundedDate = new Date(c.refundedAt)
          return refundedDate >= weekAgo
        })
        .reduce((sum, c) => sum + Number(c.refundAmount || 0), 0),
      averageChargeAmount: chargesData.length > 0 
        ? chargesData.reduce((sum, c) => sum + c.totalCharges, 0) / chargesData.length
        : 0,
      successRate: chargesData.length > 0
        ? (chargesData.filter(c => c.chargeStatus === 'charged').length / chargesData.length) * 100
        : 0
    }

    return NextResponse.json({
      charges: chargesData,
      stats
    })

  } catch (error) {
    console.error('Failed to load charges:', error)
    return NextResponse.json(
      { error: 'Failed to load charges data' },
      { status: 500 }
    )
  }
}

// Process a single charge
export async function POST(request: Request) {
  try {
    // TODO: Add admin authentication check here
    
    const body = await request.json()
    const { chargeIds } = body

    if (!chargeIds || !Array.isArray(chargeIds)) {
      return NextResponse.json(
        { error: 'Invalid charge IDs' },
        { status: 400 }
      )
    }

    // Process each charge
    const results = await Promise.all(
      chargeIds.map(async (chargeId) => {
        try {
          // Get the TripCharge record
          const tripCharge = await prisma.tripCharge.findUnique({
            where: { id: chargeId },
            include: {
              booking: true
            }
          })

          if (!tripCharge) {
            return { id: chargeId, success: false, error: 'Charge not found' }
          }

          // Check if charge is already processed
          if (tripCharge.chargeStatus !== 'PENDING' && tripCharge.chargeStatus !== 'FAILED') {
            return { id: chargeId, success: false, error: 'Charge already processed' }
          }

          // TODO: In production, process the actual Stripe charge here
          // const stripeCharge = await stripe.charges.create({
          //   amount: Math.round(Number(tripCharge.totalCharges) * 100),
          //   currency: 'usd',
          //   customer: tripCharge.booking.stripeCustomerId,
          //   payment_method: tripCharge.booking.stripePaymentMethodId,
          //   description: `Additional charges for booking ${tripCharge.booking.bookingCode}`
          // })

          // Update TripCharge record as processing (in production, update after Stripe success)
          const updated = await prisma.tripCharge.update({
            where: { id: chargeId },
            data: {
              chargeStatus: 'PROCESSING', // In production: 'CHARGED' after Stripe success
              chargeAttempts: { increment: 1 },
              // In production: stripeChargeId: stripeCharge.id,
              // In production: chargedAt: new Date()
            }
          })

          // Update booking status if this was the last pending charge
          const pendingCharges = await prisma.tripCharge.count({
            where: {
              bookingId: tripCharge.bookingId,
              chargeStatus: { in: ['PENDING', 'PROCESSING'] }
            }
          })

          if (pendingCharges === 0) {
            await prisma.rentalBooking.update({
              where: { id: tripCharge.bookingId },
              data: {
                status: 'COMPLETED',
                verificationStatus: 'COMPLETED',
                paymentStatus: 'CHARGES_PAID',
                pendingChargesAmount: null,
                chargesProcessedAt: new Date()
              }
            })
          }

          return { id: chargeId, success: true }
        } catch (error) {
          console.error(`Failed to process charge ${chargeId}:`, error)
          return { id: chargeId, success: false, error: error }
        }
      })
    )

    return NextResponse.json({
      results,
      processed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    })

  } catch (error) {
    console.error('Failed to process charges:', error)
    return NextResponse.json(
      { error: 'Failed to process charges' },
      { status: 500 }
    )
  }
}

// Waive a charge
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { chargeId, action, reason } = body

    if (!chargeId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (action === 'waive') {
      // Update TripCharge to waived
      const updated = await prisma.tripCharge.update({
        where: { id: chargeId },
        data: {
          chargeStatus: 'WAIVED',
          waivedAt: new Date(),
          waivedBy: 'admin', // TODO: Get actual admin user
          waiveReason: reason
        }
      })

      // Update booking status
      await prisma.rentalBooking.update({
        where: { id: updated.bookingId },
        data: {
          status: 'COMPLETED',
          verificationStatus: 'COMPLETED',
          paymentStatus: 'CHARGES_WAIVED',
          pendingChargesAmount: null,
          chargesProcessedAt: new Date()
        }
      })

      return NextResponse.json({ success: true, charge: updated })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Failed to update charge:', error)
    return NextResponse.json(
      { error: 'Failed to update charge' },
      { status: 500 }
    )
  }
}