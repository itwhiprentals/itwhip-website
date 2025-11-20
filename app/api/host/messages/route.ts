// app/api/host/messages/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// Helper to get host from headers
async function getHostFromHeaders(request: NextRequest) {
  const hostId = request.headers.get('x-host-id')
  
  if (!hostId) {
    return null
  }

  const host = await prisma.rentalHost.findUnique({
    where: { id: hostId },
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      approvalStatus: true,
      active: true
    }
  })

  return host
}

// GET - Fetch all messages for host's bookings
export async function GET(request: NextRequest) {
  try {
    const host = await getHostFromHeaders(request)

    if (!host) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if host is approved
    if (host.approvalStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Host account not approved' },
        { status: 403 }
      )
    }

    // Get filter from query params
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all' // all, unread, urgent

    // Fetch all bookings for this host
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        hostId: host.id
      },
      select: {
        id: true,
        bookingCode: true,
        status: true,
        startDate: true,
        endDate: true,
        guestName: true,
        guestEmail: true,
        car: {
          select: {
            make: true,
            model: true,
            year: true,
            photos: {
              take: 1,
              select: { url: true }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            senderId: true,
            senderType: true,
            senderName: true,
            senderEmail: true,
            message: true,
            isRead: true,
            isUrgent: true,
            category: true,
            hasAttachment: true,
            attachmentUrl: true,
            attachmentName: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform into message threads grouped by booking
    const messageThreads = bookings
      .filter(booking => booking.messages.length > 0)
      .map(booking => {
        const lastMessage = booking.messages[0]
        const unreadCount = booking.messages.filter(m => 
          !m.isRead && m.senderType !== 'host'
        ).length

        return {
          id: booking.id,
          bookingId: booking.id,
          bookingCode: booking.bookingCode,
          type: 'booking' as const,
          subject: `Booking #${booking.bookingCode}`,
          preview: lastMessage.message.substring(0, 100),
          sender: booking.guestName,
          senderEmail: booking.guestEmail,
          category: lastMessage.category,
          isRead: unreadCount === 0,
          isUrgent: booking.messages.some(m => m.isUrgent),
          timestamp: lastMessage.createdAt.toISOString(),
          unreadCount,
          messageCount: booking.messages.length,
          carInfo: `${booking.car.make} ${booking.car.model} ${booking.car.year}`,
          carImage: booking.car.photos[0]?.url || null,
          bookingStatus: booking.status,
          tripDates: {
            start: booking.startDate.toISOString(),
            end: booking.endDate.toISOString()
          },
          messages: booking.messages.map(msg => ({
            id: msg.id,
            senderId: msg.senderId,
            senderType: msg.senderType,
            senderName: msg.senderName,
            message: msg.message,
            isRead: msg.isRead,
            isUrgent: msg.isUrgent,
            hasAttachment: msg.hasAttachment,
            attachmentUrl: msg.attachmentUrl,
            attachmentName: msg.attachmentName,
            createdAt: msg.createdAt.toISOString()
          }))
        }
      })

    // Apply filters
    let filteredThreads = messageThreads

    if (filter === 'unread') {
      filteredThreads = messageThreads.filter(t => !t.isRead)
    } else if (filter === 'urgent') {
      filteredThreads = messageThreads.filter(t => t.isUrgent)
    }

    // Calculate counts
    const counts = {
      all: messageThreads.length,
      unread: messageThreads.filter(t => !t.isRead).length,
      urgent: messageThreads.filter(t => t.isUrgent).length
    }

    return NextResponse.json({
      success: true,
      threads: filteredThreads,
      counts
    })

  } catch (error) {
    console.error('Failed to fetch host messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST - Send a reply to a booking message
export async function POST(request: NextRequest) {
  try {
    const host = await getHostFromHeaders(request)

    if (!host) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (host.approvalStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Host account not approved' },
        { status: 403 }
      )
    }

    const { bookingId, message, isUrgent, attachments } = await request.json()

    if (!bookingId || !message?.trim()) {
      return NextResponse.json(
        { error: 'Booking ID and message are required' },
        { status: 400 }
      )
    }

    // Verify the booking belongs to this host
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        hostId: host.id
      },
      select: {
        id: true,
        bookingCode: true,
        guestName: true,
        guestEmail: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or access denied' },
        { status: 404 }
      )
    }

    // Create the message
    const newMessage = await prisma.rentalMessage.create({
      data: {
        bookingId: booking.id,
        senderId: host.id,
        senderType: 'host',
        senderName: host.name,
        senderEmail: host.email,
        message: message.trim(),
        isUrgent: isUrgent || false,
        hasAttachment: !!attachments?.length,
        attachmentUrl: attachments?.[0]?.url || null,
        attachmentName: attachments?.[0]?.originalName || null,
        category: 'general',
        isRead: false
      }
    })

    // TODO: Send email notification to guest
    // await sendEmail({
    //   to: booking.guestEmail,
    //   subject: `New message from ${host.name} - Booking #${booking.bookingCode}`,
    //   template: 'host-message',
    //   data: { hostName: host.name, message: message.trim(), bookingCode: booking.bookingCode }
    // })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: host.userId,
        action: 'HOST_MESSAGE_SENT',
        entityType: 'RentalMessage',
        entityId: newMessage.id,
        metadata: {
          bookingId: booking.id,
          bookingCode: booking.bookingCode,
          guestEmail: booking.guestEmail
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: newMessage
    })

  } catch (error) {
    console.error('Failed to send message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

// PATCH - Mark messages as read
export async function PATCH(request: NextRequest) {
  try {
    const host = await getHostFromHeaders(request)

    if (!host) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { bookingId, messageIds } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Verify booking belongs to host
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        hostId: host.id
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or access denied' },
        { status: 404 }
      )
    }

    // Mark messages as read (only guest messages)
    await prisma.rentalMessage.updateMany({
      where: {
        bookingId: bookingId,
        senderType: { not: 'host' }, // Only mark guest messages as read
        ...(messageIds?.length ? { id: { in: messageIds } } : {})
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Messages marked as read'
    })

  } catch (error) {
    console.error('Failed to mark messages as read:', error)
    return NextResponse.json(
      { error: 'Failed to update messages' },
      { status: 500 }
    )
  }
}