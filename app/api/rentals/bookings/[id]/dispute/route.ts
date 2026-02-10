// app/api/rentals/bookings/[id]/dispute/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { z } from 'zod'

const disputeSchema = z.object({
  type: z.enum(['DAMAGE', 'BILLING', 'SERVICE', 'SAFETY', 'OTHER']).default('OTHER'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  evidence: z.array(z.string().url()).max(10).default([]),
  requestedResolution: z.string().max(500).optional(),
})

export async function POST(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
   const { id: bookingId } = await params
   const body = await request.json()
   const parsed = disputeSchema.safeParse(body)
   if (!parsed.success) {
     return NextResponse.json(
       { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
       { status: 400 }
     )
   }
   const { type, description, evidence, requestedResolution } = parsed.data

   // Get guest email from header
   const guestEmail = request.headers.get('x-guest-email')

   // Fetch booking
   const booking = await prisma.rentalBooking.findUnique({
     where: { id: bookingId },
     select: {
       id: true,
       guestEmail: true,
       renterId: true,
       bookingCode: true,
       status: true,
       tripEndedAt: true,
       host: {
         select: {
           id: true,
           email: true,
           name: true
         }
       }
     }
   })

   if (!booking) {
     return NextResponse.json(
       { error: 'Booking not found' },
       { status: 404 }
     )
   }

   // Verify guest access
   if (booking.guestEmail !== guestEmail && booking.renterId) {
     return NextResponse.json(
       { error: 'Unauthorized' },
       { status: 403 }
     )
   }

   // Check if dispute can be created (within 48 hours of trip end)
   if (booking.tripEndedAt) {
     const hoursSinceEnd = (Date.now() - new Date(booking.tripEndedAt).getTime()) / (1000 * 60 * 60)
     if (hoursSinceEnd > 48) {
       return NextResponse.json(
         { error: 'Dispute period has expired (48 hours after trip end)' },
         { status: 400 }
       )
     }
   }

   // Check for existing open disputes
   const existingDispute = await prisma.rentalDispute.findFirst({
     where: {
       bookingId,
       status: {
         in: ['OPEN', 'INVESTIGATING']
       }
     }
   })

   if (existingDispute) {
     return NextResponse.json(
       { error: 'An open dispute already exists for this booking' },
       { status: 400 }
     )
   }

   // Create the dispute
   const dispute = await prisma.rentalDispute.create({
     data: {
       id: require('crypto').randomUUID(),
       bookingId,
       type: type || 'OTHER',
       description,
       status: 'OPEN'
     } as any
   })

   // Create a message about the dispute
   await prisma.rentalMessage.create({
     data: {
       id: require('crypto').randomUUID(),
       bookingId,
       senderId: 'system',
       senderType: 'admin',
       senderName: 'System',
       message: `Dispute submitted: ${description}`,
       category: 'issue',
       isUrgent: true,
       metadata: {
         disputeId: dispute.id,
         type,
         evidence,
         requestedResolution
       },
       isRead: false,
       readByAdmin: false,
       updatedAt: new Date()
     } as any
   })

   // Create activity log
   await prisma.activityLog.create({
     data: {
       id: require('crypto').randomUUID(),
       action: 'DISPUTE_CREATED',
       entityType: 'RentalDispute',
       entityId: dispute.id,
       metadata: {
         bookingId,
         type,
         description,
         timestamp: new Date()
       },
       ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
     } as any
   })

   // Create admin notification
   await prisma.adminNotification.create({
     data: {
       id: require('crypto').randomUUID(),
       type: 'BOOKING_ISSUE',
       title: `New Dispute - Booking ${booking.bookingCode}`,
       message: `Guest has submitted a dispute: ${description}`,
       priority: 'HIGH',
       status: 'UNREAD',
       relatedId: dispute.id,
       relatedType: 'RentalDispute',
       actionRequired: true,
       actionUrl: `/admin/disputes/${dispute.id}`,
       metadata: {
         bookingId,
         bookingCode: booking.bookingCode,
         hostId: booking.host.id,
         hostName: booking.host.name,
         disputeType: type
       },
       updatedAt: new Date()
     } as any
   })

   // Send notification emails
   if (booking.host.email) {
     console.log(`Notifying host ${booking.host.email} about dispute`)
   }

   return NextResponse.json({
     success: true,
     dispute,
     message: 'Dispute submitted successfully. We will review and respond within 2 hours.'
   })

 } catch (error) {
   console.error('Error creating dispute:', error)
   return NextResponse.json(
     { error: 'Failed to create dispute', details: error instanceof Error ? error.message : 'Unknown error' },
     { status: 500 }
   )
 }
}

// GET - Get disputes for a booking
export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
   const { id: bookingId } = await params
   const guestEmail = request.headers.get('x-guest-email')

   // Verify booking and access
   const booking = await prisma.rentalBooking.findUnique({
     where: { id: bookingId },
     select: {
       id: true,
       guestEmail: true,
       renterId: true
     }
   })

   if (!booking) {
     return NextResponse.json(
       { error: 'Booking not found' },
       { status: 404 }
     )
   }

   // Verify guest access
   if (booking.guestEmail !== guestEmail && booking.renterId) {
     return NextResponse.json(
       { error: 'Unauthorized' },
       { status: 403 }
     )
   }

   // Get all disputes for this booking
   const disputes = await prisma.rentalDispute.findMany({
     where: { bookingId },
     orderBy: { createdAt: 'desc' }
   })

   return NextResponse.json({
     success: true,
     disputes
   })

 } catch (error) {
   console.error('Error fetching disputes:', error)
   return NextResponse.json(
     { error: 'Failed to fetch disputes' },
     { status: 500 }
   )
 }
}

// PATCH - Update dispute (add evidence, messages)
export async function PATCH(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
   const { id: bookingId } = await params
   const body = await request.json()
   const {
     disputeId,
     additionalInfo,
     evidence
   } = body

   const guestEmail = request.headers.get('x-guest-email')

   // Verify dispute exists and user has access
   const dispute = await prisma.rentalDispute.findFirst({
     where: {
       id: disputeId,
       bookingId
     },
     include: {
       booking: {
         select: {
           guestEmail: true,
           renterId: true
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

   // Verify guest access
   if (dispute.booking.guestEmail !== guestEmail && dispute.booking.renterId) {
     return NextResponse.json(
       { error: 'Unauthorized' },
       { status: 403 }
     )
   }

   // Check if dispute is still open
   if (dispute.status === 'RESOLVED' || dispute.status === 'CLOSED') {
     return NextResponse.json(
       { error: 'Cannot update a resolved dispute' },
       { status: 400 }
     )
   }

   // Add message with additional info
   if (additionalInfo) {
     await prisma.rentalMessage.create({
       data: {
         id: require('crypto').randomUUID(),
         bookingId,
         senderId: guestEmail || 'guest',
         senderType: 'guest',
         senderName: 'Guest',
         message: `Additional dispute information: ${additionalInfo}`,
         category: 'issue',
         metadata: {
           disputeId: dispute.id,
           evidence
         },
         isRead: false,
         readByAdmin: false,
         updatedAt: new Date()
       } as any
     })
   }

   // Log the update
   await prisma.activityLog.create({
     data: {
       id: require('crypto').randomUUID(),
       action: 'DISPUTE_UPDATED',
       entityType: 'RentalDispute',
       entityId: dispute.id,
       metadata: {
         additionalInfo,
         evidence,
         timestamp: new Date()
       },
       ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
     } as any
   })

   return NextResponse.json({
     success: true,
     message: 'Dispute updated successfully'
   })

 } catch (error) {
   console.error('Error updating dispute:', error)
   return NextResponse.json(
     { error: 'Failed to update dispute' },
     { status: 500 }
   )
 }
}