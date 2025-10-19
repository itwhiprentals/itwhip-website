// app/api/guest/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const userId = user.id
    const userEmail = user.email

    console.log('[GUEST MESSAGES API] Authenticated user:', userEmail)

    // Get all bookings for this user
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        OR: [
          { renterId: userId },
          { guestEmail: userEmail }
        ]
      },
      select: {
        id: true,
        bookingCode: true,
        startDate: true,
        endDate: true,
        status: true,
        tripStatus: true,
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            color: true,
            photos: {
              take: 1,
              orderBy: {
                order: 'asc'
              },
              select: {
                url: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (bookings.length === 0) {
      return NextResponse.json({
        success: true,
        conversations: [],
        totalUnread: 0,
        totalConversations: 0
      })
    }

    const bookingIds = bookings.map(b => b.id)

    // Fetch all messages for these bookings
    const messages = await prisma.rentalMessage.findMany({
      where: {
        bookingId: {
          in: bookingIds
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    console.log(`[GUEST MESSAGES API] Found ${messages.length} messages across ${bookings.length} bookings`)

    // Group messages by booking
    const conversations = bookings.map(booking => {
      const bookingMessages = messages.filter(m => m.bookingId === booking.id)
      
      // Count unread messages (messages from host/admin/support that guest hasn't read)
      const unreadCount = bookingMessages.filter(m => 
        !m.isRead && 
        m.senderType !== 'guest' && 
        m.senderType !== 'renter'
      ).length
      
      const lastMessage = bookingMessages[0] // Already sorted by createdAt desc

      return {
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        car: {
          make: booking.car.make,
          model: booking.car.model,
          year: booking.car.year,
          color: booking.car.color,
          photo: booking.car.photos?.[0]?.url || null
        },
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        status: booking.status,
        tripStatus: booking.tripStatus,
        messages: bookingMessages.map(msg => ({
          id: msg.id,
          bookingId: msg.bookingId,
          senderType: msg.senderType,
          senderName: msg.senderName,
          senderEmail: msg.senderEmail,
          message: msg.message,
          category: msg.category,
          isRead: msg.isRead,
          isUrgent: msg.isUrgent,
          hasAttachment: msg.hasAttachment,
          attachmentUrl: msg.attachmentUrl,
          attachmentName: msg.attachmentName,
          createdAt: msg.createdAt.toISOString(),
          metadata: msg.metadata
        })),
        unreadCount,
        lastMessage: lastMessage ? {
          text: lastMessage.message,
          senderType: lastMessage.senderType,
          senderName: lastMessage.senderName,
          createdAt: lastMessage.createdAt.toISOString()
        } : null,
        messageCount: bookingMessages.length
      }
    })

    // Filter out bookings with no messages
    const conversationsWithMessages = conversations.filter(conv => conv.messageCount > 0)

    // Sort by most recent message first
    conversationsWithMessages.sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0
      const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0
      return bTime - aTime
    })

    // Calculate total unread
    const totalUnread = conversationsWithMessages.reduce((sum, conv) => sum + conv.unreadCount, 0)

    return NextResponse.json({
      success: true,
      conversations: conversationsWithMessages,
      totalUnread,
      totalConversations: conversationsWithMessages.length
    })

  } catch (error) {
    console.error('[GUEST MESSAGES API] Error:', error)
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