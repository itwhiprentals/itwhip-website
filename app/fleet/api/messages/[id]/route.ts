// app/fleet/api/messages/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key')

    // Verify fleet authentication
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: messageId } = await params

    // Try ContactMessage first
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id: messageId }
    })

    if (contactMessage) {
      return NextResponse.json({
        success: true,
        message: {
          id: contactMessage.id,
          type: 'contact',
          subject: contactMessage.subject,
          preview: contactMessage.message,
          sender: contactMessage.name,
          senderEmail: contactMessage.email,
          timestamp: contactMessage.createdAt.toISOString(),
          replies: contactMessage.replies || [],
          replyCount: contactMessage.replyCount || 0
        }
      })
    }

    // Try HostInquiry
    const hostInquiry = await prisma.hostInquiry.findUnique({
      where: { id: messageId }
    })

    if (hostInquiry) {
      return NextResponse.json({
        success: true,
        message: {
          id: hostInquiry.id,
          type: 'inquiry',
          subject: `Host Inquiry - ${hostInquiry.vehicleYear} ${hostInquiry.vehicleMake} ${hostInquiry.vehicleModel}`,
          preview: hostInquiry.message || `Interested in listing: ${hostInquiry.vehicleYear} ${hostInquiry.vehicleMake} ${hostInquiry.vehicleModel}`,
          sender: hostInquiry.name,
          senderEmail: hostInquiry.email,
          timestamp: hostInquiry.createdAt.toISOString(),
          replies: hostInquiry.replies || [],
          replyCount: hostInquiry.replyCount || 0
        }
      })
    }

    // Try RentalMessage
    const rentalMessage = await prisma.rentalMessage.findUnique({
      where: { id: messageId },
      include: {
        booking: {
          include: {
            renter: true,
            car: true
          }
        }
      }
    })

    if (rentalMessage) {
      // Get all replies in the thread
      const allMessages = await prisma.rentalMessage.findMany({
        where: {
          OR: [
            { id: messageId },
            { replyToId: messageId }
          ]
        },
        orderBy: { createdAt: 'asc' }
      })

      // Transform to reply format (excluding original message)
      const replies = allMessages
        .filter(msg => msg.id !== messageId)
        .map(msg => ({
          id: msg.id,
          senderType: msg.senderType,
          senderName: msg.senderName || 'Unknown',
          senderEmail: msg.senderEmail || '',
          message: msg.message,
          timestamp: msg.createdAt.toISOString()
        }))

      return NextResponse.json({
        success: true,
        message: {
          id: rentalMessage.id,
          type: 'booking',
          subject: `Booking Message - ${rentalMessage.booking?.bookingCode}`,
          preview: rentalMessage.message,
          sender: rentalMessage.senderName || rentalMessage.booking?.renter?.name || 'Unknown',
          senderEmail: rentalMessage.senderEmail || rentalMessage.booking?.renter?.email || '',
          timestamp: rentalMessage.createdAt.toISOString(),
          replies,
          replyCount: replies.length
        }
      })
    }

    return NextResponse.json(
      { success: false, error: 'Message not found' },
      { status: 404 }
    )

  } catch (error) {
    console.error('[FETCH MESSAGE] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}