// app/api/rentals/bookings/[id]/dispute/resolve/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { PaymentProcessor } from '@/app/lib/stripe/payment-processor'
import { verifyAdminRequest } from '@/app/lib/admin/middleware'

export async function POST(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
   const { id: bookingId } = await params
   const body = await request.json()
   const {
     disputeId,
     resolution,
     refundAmount = 0,
     adminNotes,
     actionTaken
   } = body

   // Verify admin authentication
   const adminAuth = await verifyAdminRequest(request)
   if (!adminAuth.isValid) {
     return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
   }
   const adminId = (adminAuth.payload?.userId as string) || 'admin'

   // Fetch dispute with booking details
   const dispute = await prisma.rentalDispute.findFirst({
     where: {
       id: disputeId,
       bookingId
     },
     include: {
       booking: {
         include: {
           host: true
         }
       }
     }
   })

   if (!dispute) {
     return NextResponse.json(
       { error: 'Dispute not found' },
       { status: 404 }
     )
   }

   // Check if dispute is already resolved
   if (dispute.status === 'RESOLVED' || dispute.status === 'CLOSED') {
     return NextResponse.json(
       { error: 'Dispute is already resolved' },
       { status: 400 }
     )
   }

   // Process refund if applicable
   let refundResult = null
   if (refundAmount > 0 && dispute.booking.stripeChargeId) {
     try {
       refundResult = await PaymentProcessor.refundPayment(
         dispute.booking.stripeChargeId,
         Math.round(refundAmount * 100), // Convert to cents
         `Dispute resolution for booking ${dispute.booking.bookingCode}`
       )
     } catch (refundError) {
       console.error('Error processing refund:', refundError)
       return NextResponse.json(
         { error: 'Failed to process refund' },
         { status: 500 }
       )
     }
   }

   // Update dispute status
   const updatedDispute = await prisma.rentalDispute.update({
     where: { id: disputeId },
     data: {
       status: 'RESOLVED',
       resolution,
       resolvedAt: new Date()
     }
   })

   // Create resolution message
   await prisma.rentalMessage.create({
     data: {
       id: crypto.randomUUID(),
       bookingId,
       senderId: adminId,
       senderType: 'admin',
       senderName: 'Support Team',
       message: `Dispute Resolution: ${resolution}${refundAmount > 0 ? ` A refund of $${refundAmount.toFixed(2)} has been processed.` : ''}`,
       category: 'general',
       isUrgent: false,
       adminNotes,
       metadata: {
         disputeId,
         resolution,
         refundAmount,
         actionTaken,
         refundResult
       },
       isRead: false,
       readByAdmin: true,
       updatedAt: new Date()
     } as any
   })

   // Update admin notification
   await prisma.adminNotification.updateMany({
     where: {
       relatedId: disputeId,
       relatedType: 'RentalDispute'
     },
     data: {
       status: 'RESOLVED',
       resolvedBy: adminId,
       resolvedAt: new Date(),
       resolution: JSON.stringify({
         resolution,
         refundAmount,
         actionTaken
       })
     }
   })

   // Create activity log
   await prisma.activityLog.create({
     data: {
       id: crypto.randomUUID(),
       userId: adminId,
       action: 'DISPUTE_RESOLVED',
       entityType: 'RentalDispute',
       entityId: dispute.id,
       metadata: {
         bookingId,
         resolution,
         refundAmount,
         actionTaken,
         timestamp: new Date()
       },
       ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
     }
   })

   // Send notification emails
   if (dispute.booking.guestEmail) {
     console.log(`Notifying guest ${dispute.booking.guestEmail} about dispute resolution`)
     // Implement email notification
   }

   if (dispute.booking.host.email) {
     console.log(`Notifying host ${dispute.booking.host.email} about dispute resolution`)
     // Implement email notification
   }

   return NextResponse.json({
     success: true,
     dispute: updatedDispute,
     refundResult,
     message: 'Dispute resolved successfully'
   })

 } catch (error) {
   console.error('Error resolving dispute:', error)
   return NextResponse.json(
     { error: 'Failed to resolve dispute', details: error instanceof Error ? error.message : 'Unknown error' },
     { status: 500 }
   )
 }
}

// GET - Get dispute details for resolution (admin)
export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
   const { id: bookingId } = await params
   const disputeId = request.nextUrl.searchParams.get('disputeId')

   // Verify admin authentication
   const adminAuth = await verifyAdminRequest(request)
   if (!adminAuth.isValid) {
     return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
   }

   if (!disputeId) {
     // Get all disputes for the booking
     const disputes = await prisma.rentalDispute.findMany({
       where: { bookingId },
       include: {
         booking: {
           select: {
             bookingCode: true,
             guestName: true,
             guestEmail: true,
             totalAmount: true,
             startDate: true,
             endDate: true,
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
             }
           }
         }
       },
       orderBy: { createdAt: 'desc' }
     })

     return NextResponse.json({
       success: true,
       disputes
     })
   }

   // Get specific dispute with full details
   const dispute = await prisma.rentalDispute.findFirst({
     where: {
       id: disputeId,
       bookingId
     },
     include: {
       booking: {
         include: {
           car: true,
           host: true,
           messages: {
             where: {
               category: 'issue'
             },
             orderBy: {
               createdAt: 'desc'
             }
           }
         }
       }
     }
   })

   if (!dispute) {
     return NextResponse.json(
       { error: 'Dispute not found' },
       { status: 404 }
     )
   }

   // Get related activity logs
   const activities = await prisma.activityLog.findMany({
     where: {
       entityType: 'RentalDispute',
       entityId: dispute.id
     },
     orderBy: { createdAt: 'desc' }
   })

   // Calculate potential refund amounts
   const charges = await prisma.rentalMessage.findFirst({
     where: {
       bookingId,
       category: 'payment'
     },
     orderBy: {
       createdAt: 'desc'
     }
   })

   let suggestedRefunds = []
   if (charges && charges.metadata) {
     const chargeData = charges.metadata as any
     if (chargeData.breakdown) {
       suggestedRefunds = chargeData.breakdown.map((item: any) => ({
         label: item.label,
         amount: item.amount,
         recommended: false
       }))
     }
   }

   return NextResponse.json({
     success: true,
     dispute,
     activities,
     suggestedRefunds
   })

 } catch (error) {
   console.error('Error fetching dispute details:', error)
   return NextResponse.json(
     { error: 'Failed to fetch dispute details' },
     { status: 500 }
   )
 }
}