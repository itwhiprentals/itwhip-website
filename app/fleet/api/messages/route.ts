// app/fleet/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key')

    // Verify authentication key
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all message types
    const [rentalMessages, contactMessages, hostInquiries] = await Promise.all([
      // Rental/Booking Messages
      prisma.rentalMessage.findMany({
        include: {
          booking: {
            include: {
              car: true,
              renter: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      }),

      // Contact Form Messages
      prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100
      }),

      // Host Inquiries (List Your Car)
      prisma.hostInquiry.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100
      })
    ])

    // Transform messages into unified format
    const messages = [
      // Rental Messages
      ...rentalMessages.map(msg => ({
        id: msg.id,
        type: 'booking' as const,
        bookingId: msg.bookingId,
        bookingCode: msg.booking?.bookingCode,
        subject: `Message from ${msg.senderName || msg.booking?.renter?.name || 'Guest'}`,
        preview: msg.message.substring(0, 150),
        sender: msg.senderName || msg.booking?.renter?.name || 'Unknown',
        senderEmail: msg.senderEmail || msg.booking?.renter?.email || '',
        category: msg.category || 'general',
        isRead: msg.isRead,
        isUrgent: msg.isUrgent,
        timestamp: msg.createdAt.toISOString(),
        guestName: msg.booking?.renter?.name,
        carInfo: msg.booking?.car ? `${msg.booking.car.make} ${msg.booking.car.model}` : undefined
      })),

      // Contact Messages
      ...contactMessages.map(msg => ({
        id: msg.id,
        type: 'contact' as const,
        subject: msg.subject,
        preview: msg.message.substring(0, 150),
        sender: msg.name,
        senderEmail: msg.email,
        category: 'general',
        isRead: msg.status !== 'NEW',
        isUrgent: false,
        timestamp: msg.createdAt.toISOString()
      })),

      // Host Inquiries
      ...hostInquiries.map(inquiry => ({
        id: inquiry.id,
        type: 'inquiry' as const,
        subject: `Host Inquiry - ${inquiry.vehicleMake} ${inquiry.vehicleModel}`,
        preview: inquiry.message?.substring(0, 150) || `Interested in listing: ${inquiry.vehicleYear} ${inquiry.vehicleMake} ${inquiry.vehicleModel} in ${inquiry.location}`,
        sender: inquiry.name,
        senderEmail: inquiry.email,
        category: 'general',
        isRead: inquiry.status !== 'NEW',
        isUrgent: false,
        timestamp: inquiry.createdAt.toISOString(),
        carInfo: `${inquiry.vehicleYear} ${inquiry.vehicleMake} ${inquiry.vehicleModel}`
      }))
    ]

    // Sort by timestamp (newest first)
    messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      success: true,
      messages,
      counts: {
        total: messages.length,
        unread: messages.filter(m => !m.isRead).length,
        booking: messages.filter(m => m.type === 'booking').length,
        contact: messages.filter(m => m.type === 'contact').length,
        inquiry: messages.filter(m => m.type === 'inquiry').length,
        urgent: messages.filter(m => m.isUrgent).length
      }
    })

  } catch (error) {
    console.error('Fleet Messages API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch messages',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}