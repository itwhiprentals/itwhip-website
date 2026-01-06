// app/api/rentals/bookings/[id]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyJWT } from '@/lib/auth/jwt'
import { sendEmail } from '@/app/lib/email/sender'

// GET /api/rentals/bookings/[id]/messages - Get messages for a booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Fix for Next.js 15 - await params
    const { id: bookingId } = await params

    // Get auth token if available
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')
    
    let userEmail = null
    let userId = null
    let isAdmin = false

    // Try to verify authenticated user
    if (token) {
      try {
        const payload = await verifyJWT(token)
        if (payload?.userId) {
          const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, email: true, role: true }
          })
          if (user) {
            userId = user.id
            userEmail = user.email
            isAdmin = user.role === 'ADMIN'
          }
        }
      } catch (error) {
        console.log('Auth verification failed, checking as guest')
      }
    }

    // SECURE QUERY - Get booking with SELECT
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        renterId: true,
        guestEmail: true,
        guestName: true,
        hostId: true,
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            host: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
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

    // Check authorization - user must own the booking, be the host, or be admin
    const isOwner = (userId && booking.renterId === userId) || 
                    (userEmail && booking.guestEmail === userEmail) ||
                    (!token && booking.guestEmail) // Allow guest access without token
    
    const isHost = booking.car.host && userEmail === booking.car.host.email

    if (!isOwner && !isHost && !isAdmin) {
      // For guest bookings, check if they provided the booking email
      const guestEmail = request.headers.get('x-guest-email')
      if (!guestEmail || guestEmail !== booking.guestEmail) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
    }

    // Get all messages for this booking with SELECT
    const messages = await prisma.rentalMessage.findMany({
      where: { bookingId },
      select: {
        id: true,
        bookingId: true,
        senderId: true,
        senderType: true,
        senderName: true,
        senderEmail: true,
        message: true,
        category: true,
        isRead: true,
        isUrgent: true,
        hasAttachment: true,
        attachmentUrl: true,
        attachmentName: true,
        readAt: true,
        readByAdmin: true,
        createdAt: true,
        updatedAt: true,
        replyToId: true
      },
      orderBy: { createdAt: 'asc' }
    })

    // Mark messages as read based on user type
    if (messages.length > 0) {
      const unreadMessageIds = messages
        .filter(msg => !msg.isRead && 
                (isOwner && msg.senderType !== 'guest' && msg.senderType !== 'renter') ||
                (isHost && msg.senderType !== 'host'))
        .map(msg => msg.id)

      if (unreadMessageIds.length > 0) {
        await prisma.rentalMessage.updateMany({
          where: { id: { in: unreadMessageIds } },
          data: { 
            isRead: true,
            readAt: new Date(),
            readByAdmin: isAdmin
          }
        })
      }
    }

    // Format response
    return NextResponse.json({
      success: true,
      bookingId,
      car: `${booking.car.year} ${booking.car.make} ${booking.car.model}`,
      messages: messages.map(msg => ({
        ...msg,
        isOwn: (isOwner && (msg.senderType === 'guest' || msg.senderType === 'renter')) ||
               (isHost && msg.senderType === 'host') ||
               (isAdmin && (msg.senderType === 'admin' || msg.senderType === 'support'))
      })),
      totalCount: messages.length,
      unreadCount: messages.filter(m => !m.isRead).length
    })

  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST /api/rentals/bookings/[id]/messages - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    const body = await request.json()
    const { message, category = 'general', isUrgent = false, attachmentUrl, attachmentName } = body

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message content required' },
        { status: 400 }
      )
    }

    // Get auth token if available
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')
    
    let userEmail = null
    let userId = null
    let userName = null
    let isAdmin = false

    if (token) {
      try {
        const payload = await verifyJWT(token)
        if (payload?.userId) {
          const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, email: true, name: true, role: true }
          })
          if (user) {
            userId = user.id
            userEmail = user.email
            userName = user.name
            isAdmin = user.role === 'ADMIN'
          }
        }
      } catch (error) {
        console.log('Auth verification failed')
      }
    }

    // SECURE QUERY - Get booking with SELECT
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        renterId: true,
        guestEmail: true,
        guestName: true,
        hostId: true,
        bookingCode: true,
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            host: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
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

    // Determine sender type and authorization
    let senderType: string
    let senderName: string
    let senderEmail: string

    const isOwner = (userId && booking.renterId === userId) || 
                    (userEmail && booking.guestEmail === userEmail)
    const isHost = booking.car.host && userEmail === booking.car.host.email

    if (isAdmin) {
      senderType = category === 'support' ? 'support' : 'admin'
      senderName = userName || 'ItWhip Admin'
      senderEmail = userEmail || 'admin@itwhip.com'
    } else if (isHost) {
      senderType = 'host'
      senderName = booking.car.host.name
      senderEmail = booking.car.host.email
    } else if (isOwner) {
      senderType = booking.renterId ? 'renter' : 'guest'
      senderName = userName || booking.guestName || 'Guest'
      senderEmail = userEmail || booking.guestEmail || ''
    } else {
      // For guest messages without auth
      const guestEmail = request.headers.get('x-guest-email')
      if (!guestEmail || guestEmail !== booking.guestEmail) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
      senderType = 'guest'
      senderName = booking.guestName || 'Guest'
      senderEmail = booking.guestEmail || ''
    }

    // Create the message
    const newMessage = await prisma.rentalMessage.create({
      data: {
        bookingId,
        senderId: userId || bookingId, // Use bookingId as fallback for guests
        senderType,
        senderName,
        senderEmail,
        message: message.trim(),
        category,
        isUrgent,
        hasAttachment: !!attachmentUrl,
        attachmentUrl,
        attachmentName,
        isRead: false
      },
      select: {
        id: true,
        bookingId: true,
        senderId: true,
        senderType: true,
        senderName: true,
        message: true,
        category: true,
        isUrgent: true,
        hasAttachment: true,
        attachmentUrl: true,
        attachmentName: true,
        createdAt: true
      }
    })

    // Send email notifications
    try {
      // Notify host if message is from guest/renter
      if ((senderType === 'guest' || senderType === 'renter') && booking.car.host.email) {
        await sendEmail({
          to: booking.car.host.email,
          subject: `New message for booking ${booking.bookingCode}`,
          html: `
            <p>You have a new message from ${senderName} regarding the ${booking.car.year} ${booking.car.make} ${booking.car.model}:</p>
            <blockquote style="border-left: 3px solid #ccc; padding-left: 10px; margin: 10px 0;">
              ${message}
            </blockquote>
            <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/host/bookings/${bookingId}">View booking</a></p>
          `
        })
      }
      
      // Notify guest if message is from host/admin
      if ((senderType === 'host' || senderType === 'admin' || senderType === 'support') && booking.guestEmail) {
        await sendEmail({
          to: booking.guestEmail,
          subject: `New message for your ItWhip booking`,
          html: `
            <p>You have a new message from ${senderName} regarding your booking:</p>
            <blockquote style="border-left: 3px solid #ccc; padding-left: 10px; margin: 10px 0;">
              ${message}
            </blockquote>
            <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/rentals/dashboard/bookings/${bookingId}">View booking</a></p>
          `
        })
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: newMessage
    })

  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

// PATCH /api/rentals/bookings/[id]/messages - Mark messages as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    const { messageIds } = await request.json()

    if (!messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json(
        { error: 'Message IDs required' },
        { status: 400 }
      )
    }

    // Update messages as read
    const result = await prisma.rentalMessage.updateMany({
      where: {
        id: { in: messageIds },
        bookingId // Ensure messages belong to this booking
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      updatedCount: result.count
    })

  } catch (error) {
    console.error('Error updating messages:', error)
    return NextResponse.json(
      { error: 'Failed to update messages' },
      { status: 500 }
    )
  }
}