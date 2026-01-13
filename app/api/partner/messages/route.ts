// app/api/partner/messages/route.ts
// Partner Messages API - View and manage guest conversations

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    if (!partner || (partner.hostType !== 'FLEET_PARTNER' && partner.hostType !== 'PARTNER')) {
      return null
    }

    return partner
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all' // all, unread, urgent
    const bookingId = searchParams.get('bookingId')

    // Get partner's vehicle IDs
    const vehicles = await prisma.rentalCar.findMany({
      where: { hostId: partner.id },
      select: { id: true }
    })
    const vehicleIds = vehicles.map(v => v.id)

    // Get bookings for partner's vehicles
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        carId: { in: vehicleIds }
      },
      select: { id: true }
    })
    const bookingIds = bookings.map(b => b.id)

    // Build where clause
    const where: any = {
      bookingId: { in: bookingIds }
    }

    if (bookingId) {
      where.bookingId = bookingId
    }

    // Get all messages for partner's bookings
    const messages = await prisma.rentalMessage.findMany({
      where,
      include: {
        booking: {
          include: {
            car: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
                primaryPhotoUrl: true
              }
            },
            renter: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Group messages by booking (conversation threads)
    const conversationMap = new Map<string, {
      bookingId: string
      bookingCode: string
      vehicleName: string
      vehiclePhoto: string | null
      guestName: string
      guestEmail: string | null
      guestPhoto: string | null
      messages: any[]
      unreadCount: number
      hasUrgent: boolean
      lastMessageAt: string
    }>()

    messages.forEach(msg => {
      const booking = msg.booking
      if (!booking) return

      const bookingKey = booking.id

      if (!conversationMap.has(bookingKey)) {
        conversationMap.set(bookingKey, {
          bookingId: booking.id,
          bookingCode: booking.bookingCode || booking.id.slice(0, 8),
          vehicleName: booking.car
            ? `${booking.car.year} ${booking.car.make} ${booking.car.model}`
            : 'Unknown Vehicle',
          vehiclePhoto: booking.car?.primaryPhotoUrl || null,
          guestName: booking.renter?.name || booking.guestName || 'Guest',
          guestEmail: booking.renter?.email || booking.guestEmail || null,
          guestPhoto: booking.renter?.image || null,
          messages: [],
          unreadCount: 0,
          hasUrgent: false,
          lastMessageAt: msg.createdAt.toISOString()
        })
      }

      const conversation = conversationMap.get(bookingKey)!

      // Add message to thread
      conversation.messages.push({
        id: msg.id,
        senderId: msg.senderId,
        senderType: msg.senderType,
        senderName: msg.senderName || (msg.senderType === 'guest' ? conversation.guestName : partner.name),
        message: msg.message,
        category: msg.category,
        isRead: msg.isRead,
        isUrgent: msg.isUrgent,
        hasAttachment: msg.hasAttachment,
        attachmentUrl: msg.attachmentUrl,
        attachmentName: msg.attachmentName,
        createdAt: msg.createdAt.toISOString(),
        replyToId: msg.replyToId
      })

      // Track unread from guests
      if (!msg.isRead && msg.senderType === 'guest') {
        conversation.unreadCount++
      }

      if (msg.isUrgent) {
        conversation.hasUrgent = true
      }

      // Update last message time if newer
      if (new Date(msg.createdAt) > new Date(conversation.lastMessageAt)) {
        conversation.lastMessageAt = msg.createdAt.toISOString()
      }
    })

    // Convert to array and sort by last message
    let conversations = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())

    // Sort messages within each conversation chronologically
    conversations.forEach(conv => {
      conv.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    })

    // Apply filters
    if (filter === 'unread') {
      conversations = conversations.filter(c => c.unreadCount > 0)
    } else if (filter === 'urgent') {
      conversations = conversations.filter(c => c.hasUrgent)
    }

    // Calculate stats
    const allConversations = Array.from(conversationMap.values())
    const stats = {
      total: allConversations.length,
      unread: allConversations.reduce((sum, c) => sum + c.unreadCount, 0),
      urgent: allConversations.filter(c => c.hasUrgent).length,
      totalMessages: messages.length
    }

    return NextResponse.json({
      success: true,
      conversations,
      stats
    })

  } catch (error) {
    console.error('[Partner Messages] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST - Send new message
export async function POST(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, message, category = 'general', isUrgent = false, replyToId } = body

    if (!bookingId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId, message' },
        { status: 400 }
      )
    }

    // Verify booking belongs to partner's vehicle
    const vehicles = await prisma.rentalCar.findMany({
      where: { hostId: partner.id },
      select: { id: true }
    })
    const vehicleIds = vehicles.map(v => v.id)

    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        carId: { in: vehicleIds }
      },
      include: {
        user: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or does not belong to this partner' },
        { status: 404 }
      )
    }

    // Create the message
    const newMessage = await prisma.rentalMessage.create({
      data: {
        bookingId,
        senderId: partner.id,
        senderType: 'host',
        senderName: partner.name || partner.partnerCompanyName,
        senderEmail: partner.email,
        message: message.trim(),
        category,
        isUrgent,
        isRead: true, // Host's own messages are read
        readByAdmin: true,
        replyToId: replyToId || null
      }
    })

    // Mark any unread guest messages in this booking as read
    await prisma.rentalMessage.updateMany({
      where: {
        bookingId,
        senderType: 'guest',
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        senderId: newMessage.senderId,
        senderType: newMessage.senderType,
        senderName: newMessage.senderName,
        message: newMessage.message,
        createdAt: newMessage.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error('[Partner Messages] Create error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
