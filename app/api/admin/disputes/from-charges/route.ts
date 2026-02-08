// app/api/admin/disputes/from-charges/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/sender'

interface CreateDisputeFromChargesParams {
  bookingId: string
  chargeId?: string
  disputeReasons: string[]
  totalChargeAmount: number
  chargeBreakdown: {
    mileage?: number
    fuel?: number
    late?: number
    damage?: number
    cleaning?: number
  }
  guestNotes?: string
}

// Priority levels based on dispute criteria
const calculateDisputePriority = (
  amount: number,
  reasons: string[],
  hasMultipleDisputes: boolean
): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' => {
  // Urgent: High amount or safety/damage disputes
  if (amount > 500 || reasons.some(r => 
    r.toLowerCase().includes('damage') || 
    r.toLowerCase().includes('safety') ||
    r.toLowerCase().includes('fraud')
  )) {
    return 'URGENT'
  }
  
  // High: Multiple disputes or payment-related
  if (hasMultipleDisputes || reasons.some(r => 
    r.toLowerCase().includes('unauthorized') ||
    r.toLowerCase().includes('payment')
  )) {
    return 'HIGH'
  }
  
  // Medium: Moderate amounts or service issues
  if (amount > 100 || reasons.some(r => 
    r.toLowerCase().includes('service') ||
    r.toLowerCase().includes('incorrect')
  )) {
    return 'MEDIUM'
  }
  
  // Low: Small amounts or minor issues
  return 'LOW'
}

// POST - Create formal dispute from charge dispute
export async function POST(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-admin-id') || 'system'
    const body: CreateDisputeFromChargesParams = await request.json()
    
    const {
      bookingId,
      chargeId,
      disputeReasons,
      totalChargeAmount,
      chargeBreakdown,
      guestNotes
    } = body

    if (!bookingId || !disputeReasons || disputeReasons.length === 0) {
      return NextResponse.json(
        { error: 'Booking ID and dispute reasons are required' },
        { status: 400 }
      )
    }

    // Get booking details with existing disputes
    const booking = await (prisma.rentalBooking.findUnique as any)({
      where: { id: bookingId },
      include: {
        car: {
          include: {
            host: true
          }
        },
        renter: true,
        tripCharges: {
          where: {
            id: chargeId || undefined
          }
        },
        disputes: {
          where: {
            status: {
              in: ['OPEN', 'UNDER_REVIEW']
            }
          }
        }
      }
    }) as any

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if formal dispute already exists for these reasons
    const existingDisputes = booking.disputes.filter((d: any) =>
      disputeReasons.some(reason => d.description.includes(reason))
    )

    if (existingDisputes.length > 0) {
      return NextResponse.json({
        message: 'Disputes already exist for some of these reasons',
        existingDisputes,
        bookingId
      })
    }

    // Calculate priority
    const hasMultipleDisputes = booking.disputes.length > 0
    const priority = calculateDisputePriority(
      totalChargeAmount,
      disputeReasons,
      hasMultipleDisputes
    )

    // Begin transaction to create formal dispute records
    const result = await prisma.$transaction(async (tx) => {
      // Create main dispute record
      const mainDispute = await (tx.rentalDispute.create as any)({
        data: {
          bookingId,
          type: 'CHARGE_DISPUTE',
          status: 'OPEN',
          priority,
          description: disputeReasons.join('; '),
          amount: totalChargeAmount,
          openedBy: booking.guestEmail || (booking as any).renter?.email || 'Guest',
          metadata: JSON.stringify({
            chargeId,
            chargeBreakdown,
            originalReasons: disputeReasons,
            guestNotes,
            createdFromCharges: true,
            conversionDate: new Date()
          })
        }
      })

      // Create individual dispute items for each reason
      const disputeItems = await Promise.all(
        disputeReasons.map(async (reason) => {
          // Categorize the dispute type
          let category = 'OTHER'
          let disputedAmount = totalChargeAmount / disputeReasons.length // Default split
          
          if (reason.toLowerCase().includes('mileage')) {
            category = 'MILEAGE'
            disputedAmount = chargeBreakdown.mileage || disputedAmount
          } else if (reason.toLowerCase().includes('fuel')) {
            category = 'FUEL'
            disputedAmount = chargeBreakdown.fuel || disputedAmount
          } else if (reason.toLowerCase().includes('late')) {
            category = 'LATE_RETURN'
            disputedAmount = chargeBreakdown.late || disputedAmount
          } else if (reason.toLowerCase().includes('damage')) {
            category = 'DAMAGE'
            disputedAmount = chargeBreakdown.damage || disputedAmount
          } else if (reason.toLowerCase().includes('cleaning')) {
            category = 'CLEANING'
            disputedAmount = chargeBreakdown.cleaning || disputedAmount
          }

          return await (tx as any).disputeItem.create({
            data: {
              disputeId: mainDispute.id,
              category,
              description: reason,
              disputedAmount,
              status: 'PENDING_REVIEW'
            }
          })
        })
      )

      // Update booking status to reflect dispute
      await (tx.rentalBooking.update as any)({
        where: { id: bookingId },
        data: {
          verificationStatus: 'DISPUTE_REVIEW',
          hasActiveDispute: true,
          lastDisputeAt: new Date()
        }
      })

      // Update TripCharge if exists
      if (chargeId && (booking as any).tripCharges[0]) {
        await (tx.tripCharge.update as any)({
          where: { id: chargeId },
          data: {
            chargeStatus: 'DISPUTED',
            disputeId: mainDispute.id,
            disputedAt: new Date()
          }
        })
      }

      // Create admin notification
      await (tx.adminNotification.create as any)({
        data: {
          type: 'NEW_DISPUTE',
          title: `New Dispute - ${booking.bookingCode}`,
          message: `Guest has disputed $${totalChargeAmount.toFixed(2)} in charges. Priority: ${priority}. Reasons: ${disputeReasons.join(', ')}`,
          priority,
          status: 'UNREAD',
          relatedId: mainDispute.id,
          relatedType: 'RentalDispute',
          actionRequired: true,
          actionUrl: `/admin/disputes/${mainDispute.id}`,
          updatedAt: new Date(),
          metadata: {
            bookingId,
            chargeId,
            disputeId: mainDispute.id,
            amount: totalChargeAmount,
            reasons: disputeReasons
          }
        }
      })

      // Add message to booking conversation
      await (tx.rentalMessage.create as any)({
        data: {
          bookingId,
          senderId: 'system',
          senderType: 'admin',
          senderName: 'Dispute System',
          message: `Your dispute has been formally submitted and will be reviewed within 24 hours.\n\nDisputed amount: $${totalChargeAmount.toFixed(2)}\nReasons: ${disputeReasons.join(', ')}\nCase #: ${mainDispute.id}\n\nOur team will investigate and respond shortly.`,
          category: 'dispute',
          isUrgent: priority === 'URGENT' || priority === 'HIGH',
          updatedAt: new Date(),
          metadata: {
            disputeId: mainDispute.id,
            priority
          }
        }
      })

      // Create audit log
      await (tx.auditLog.create as any)({
        data: {
          action: 'DISPUTE_CREATED_FROM_CHARGES',
          entityType: 'RentalDispute',
          entityId: mainDispute.id,
          performedBy: adminId,
          metadata: {
            bookingId,
            chargeId,
            amount: totalChargeAmount,
            reasons: disputeReasons,
            priority,
            timestamp: new Date()
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        }
      })

      return {
        dispute: mainDispute,
        disputeItems
      }
    })

    // Send email notifications (outside transaction)
    try {
      // Notify guest
      if (booking.guestEmail) {
        await (sendEmail as any)({
          to: booking.guestEmail,
          subject: `Dispute Received - Case #${result.dispute.id}`,
          template: 'dispute-confirmation',
          data: {
            guestName: booking.guestName || 'Guest',
            bookingCode: booking.bookingCode,
            disputeId: result.dispute.id,
            amount: totalChargeAmount,
            reasons: disputeReasons,
            priority,
            expectedResponseTime: priority === 'URGENT' ? '4 hours' : '24 hours'
          }
        })
      }

      // Notify admin team for urgent/high priority
      if (priority === 'URGENT' || priority === 'HIGH') {
        await (sendEmail as any)({
          to: process.env.ADMIN_NOTIFICATION_EMAIL || 'disputes@itwhip.com',
          subject: `[${priority}] New Dispute - $${totalChargeAmount} - ${booking.bookingCode}`,
          template: 'admin-dispute-alert',
          data: {
            bookingCode: booking.bookingCode,
            disputeId: result.dispute.id,
            guestName: booking.guestName,
            amount: totalChargeAmount,
            reasons: disputeReasons,
            priority,
            reviewUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/disputes/${result.dispute.id}`
          }
        })
      }
    } catch (emailError) {
      console.error('[Dispute Creation] Email notification failed:', emailError)
      // Continue - don't fail the request due to email issues
    }

    return NextResponse.json({
      success: true,
      dispute: result.dispute,
      disputeItems: result.disputeItems,
      priority,
      message: `Dispute created successfully. Case #${result.dispute.id}`,
      expectedResponseTime: priority === 'URGENT' ? '4 hours' : '24 hours',
      bookingId,
      chargeId
    })

  } catch (error) {
    console.error('[Dispute Creation] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create dispute',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET - Retrieve disputes for a booking or charge
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get('bookingId')
    const chargeId = searchParams.get('chargeId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    if (!bookingId && !chargeId) {
      return NextResponse.json(
        { error: 'Either bookingId or chargeId is required' },
        { status: 400 }
      )
    }

    const where: any = {}
    
    if (bookingId) where.bookingId = bookingId
    if (status) where.status = status
    if (priority) where.priority = priority

    // If searching by chargeId, need to parse metadata
    const disputes = await (prisma.rentalDispute.findMany as any)({
      where,
      include: {
        booking: {
          include: {
            car: true,
            renter: true
          }
        },
        disputeItems: true,
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    }) as any[]

    // Filter by chargeId if provided (check in metadata)
    const filteredDisputes = chargeId 
      ? disputes.filter(d => {
          try {
            const metadata = JSON.parse(d.metadata as string || '{}')
            return metadata.chargeId === chargeId
          } catch {
            return false
          }
        })
      : disputes

    // Calculate statistics
    const stats = {
      total: filteredDisputes.length,
      open: filteredDisputes.filter(d => d.status === 'OPEN').length,
      underReview: filteredDisputes.filter(d => d.status === 'UNDER_REVIEW').length,
      resolved: filteredDisputes.filter(d => d.status === 'RESOLVED').length,
      totalAmount: filteredDisputes.reduce((sum, d) => sum + (d.amount || 0), 0),
      avgResolutionTime: calculateAvgResolutionTime(filteredDisputes.filter(d => d.status === 'RESOLVED'))
    }

    return NextResponse.json({
      disputes: filteredDisputes,
      stats,
      bookingId,
      chargeId
    })

  } catch (error) {
    console.error('[Dispute Retrieval] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve disputes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PATCH - Update dispute priority or status
export async function PATCH(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-admin-id') || 'admin'
    const body = await request.json()
    const { disputeId, priority, status, resolution, adminNotes } = body

    if (!disputeId) {
      return NextResponse.json(
        { error: 'Dispute ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (priority) updateData.priority = priority
    if (status) updateData.status = status
    if (resolution) updateData.resolution = resolution
    if (adminNotes) updateData.adminNotes = adminNotes

    if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date()
      updateData.resolvedBy = adminId
    } else if (status === 'UNDER_REVIEW') {
      updateData.reviewStartedAt = new Date()
      updateData.reviewedBy = adminId
    }

    const updatedDispute = await (prisma.rentalDispute.update as any)({
      where: { id: disputeId },
      data: updateData,
      include: {
        booking: true,
        disputeItems: true
      }
    })

    // Create audit log
    await (prisma.auditLog.create as any)({
      data: {
        action: 'DISPUTE_UPDATED',
        entityType: 'RentalDispute',
        entityId: disputeId,
        performedBy: adminId,
        metadata: {
          changes: updateData,
          previousStatus: body.previousStatus,
          timestamp: new Date()
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      dispute: updatedDispute,
      message: `Dispute ${status === 'RESOLVED' ? 'resolved' : 'updated'} successfully`
    })

  } catch (error) {
    console.error('[Dispute Update] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update dispute',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to calculate average resolution time
function calculateAvgResolutionTime(resolvedDisputes: any[]): number {
  if (resolvedDisputes.length === 0) return 0
  
  const totalHours = resolvedDisputes.reduce((sum, dispute) => {
    if (dispute.createdAt && dispute.resolvedAt) {
      const created = new Date(dispute.createdAt).getTime()
      const resolved = new Date(dispute.resolvedAt).getTime()
      return sum + (resolved - created) / (1000 * 60 * 60) // Convert to hours
    }
    return sum
  }, 0)
  
  return Math.round(totalHours / resolvedDisputes.length)
}