// app/api/partner/messages/route.ts
// Unified Portal Messages API - View and manage guest conversations
// Supports all host types in the unified portal

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

// UNIFIED PORTAL: Accept all token types for the unified portal
async function getPartnerFromToken() {
  const cookieStore = await cookies()

  // Accept partner_token, hostAccessToken, or accessToken
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value ||
                cookieStore.get('accessToken')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    if (!hostId) return null

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        name: true,
        email: true,
        hostType: true,
        partnerCompanyName: true,
        isHostManager: true,
        managesOwnCars: true,
        approvalStatus: true,
        active: true
      }
    })

    // UNIFIED PORTAL: Accept all host types, not just partners
    if (!partner) return null

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

    // UNIFIED PORTAL: Get both owned AND managed vehicle IDs
    // 1. Get owned vehicles
    const ownedVehicles = await prisma.rentalCar.findMany({
      where: { hostId: partner.id },
      select: { id: true }
    })
    const ownedVehicleIds = ownedVehicles.map(v => v.id)

    // 2. Get managed vehicles (for Fleet Managers)
    let managedVehicleIds: string[] = []
    if (partner.isHostManager) {
      const managedRelations = await prisma.vehicleManagement.findMany({
        where: { managerId: partner.id, status: 'ACTIVE' },
        select: { vehicleId: true }
      })
      managedVehicleIds = managedRelations.map(v => v.vehicleId)
    }

    // Combine all vehicle IDs
    const allVehicleIds = [...new Set([...ownedVehicleIds, ...managedVehicleIds])]

    if (allVehicleIds.length === 0) {
      // No vehicles means no messages
      return NextResponse.json({
        success: true,
        conversations: [],
        stats: { total: 0, unread: 0, urgent: 0, totalMessages: 0 }
      })
    }

    // Get bookings for all accessible vehicles (owned + managed)
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        carId: { in: allVehicleIds }
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
                photos: {
                  select: {
                    url: true
                  },
                  orderBy: [{ isHero: 'desc' }, { order: 'asc' }],
                  take: 1
                }
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
          vehiclePhoto: booking.car?.photos?.[0]?.url || null,
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

    // UNIFIED PORTAL: Verify booking belongs to owned OR managed vehicle
    // 1. Get owned vehicles
    const ownedVehicles = await prisma.rentalCar.findMany({
      where: { hostId: partner.id },
      select: { id: true }
    })
    const ownedVehicleIds = ownedVehicles.map(v => v.id)

    // 2. Get managed vehicles (for Fleet Managers)
    let managedVehicleIds: string[] = []
    if (partner.isHostManager) {
      const managedRelations = await prisma.vehicleManagement.findMany({
        where: { managerId: partner.id, status: 'ACTIVE' },
        select: { vehicleId: true }
      })
      managedVehicleIds = managedRelations.map(v => v.vehicleId)
    }

    // Combine all vehicle IDs
    const allVehicleIds = [...new Set([...ownedVehicleIds, ...managedVehicleIds])]

    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        carId: { in: allVehicleIds }
      },
      include: {
        renter: true
      } as any
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
      } as any
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
