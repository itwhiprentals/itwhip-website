// app/api/rentals/bookings/[id]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { sendEmail } from '@/app/lib/email/sender'

// GET /api/rentals/bookings/[id]/messages - Get messages for a booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params

    // Verify JWT auth
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const isAdmin = user.role === 'ADMIN'

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

    // Verify ownership via JWT identity (no spoofable headers)
    const isOwner = (user.id && booking.renterId === user.id) ||
                    (user.email && booking.guestEmail === user.email)
    const isHost = booking.car.host && user.email === booking.car.host.email

    if (!isOwner && !isHost && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
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

    // Verify JWT auth
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const isAdmin = user.role === 'ADMIN'

    // SECURE QUERY - Get booking with SELECT
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        renterId: true,
        guestEmail: true,
        guestName: true,
        guestPhone: true,
        reviewerProfileId: true,
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
                name: true,
                phone: true
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

    // Verify ownership via JWT identity (no spoofable headers)
    const isOwner = (user.id && booking.renterId === user.id) ||
                    (user.email && booking.guestEmail === user.email)
    const isHost = booking.car.host && user.email === booking.car.host.email

    if (isAdmin) {
      senderType = category === 'support' ? 'support' : 'admin'
      senderName = user.name || 'ItWhip Admin'
      senderEmail = user.email || 'admin@itwhip.com'
    } else if (isHost) {
      senderType = 'host'
      senderName = booking.car.host.name
      senderEmail = booking.car.host.email
    } else if (isOwner) {
      senderType = booking.renterId ? 'renter' : 'guest'
      senderName = user.name || booking.guestName || 'Guest'
      senderEmail = user.email || booking.guestEmail || ''
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Create the message
    const newMessage = await prisma.rentalMessage.create({
      data: {
        id: crypto.randomUUID(),
        bookingId,
        senderId: user.id || bookingId, // Use bookingId as fallback for guests
        senderType,
        senderName,
        senderEmail,
        message: message.trim(),
        category,
        isUrgent,
        hasAttachment: !!attachmentUrl,
        attachmentUrl,
        attachmentName,
        isRead: false,
        updatedAt: new Date()
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
        await sendEmail(
          booking.car.host.email,
          `New message for booking ${booking.bookingCode}`,
          `
            <p>You have a new message from ${senderName} regarding the ${booking.car.year} ${booking.car.make} ${booking.car.model}:</p>
            <blockquote style="border-left: 3px solid #ccc; padding-left: 10px; margin: 10px 0;">
              ${message}
            </blockquote>
            <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/host/bookings/${bookingId}">View booking</a></p>
          `,
          `New message from ${senderName} for booking ${booking.bookingCode}`
        )
      }
      
      // Notify guest if message is from host/admin
      if ((senderType === 'host' || senderType === 'admin' || senderType === 'support') && booking.guestEmail) {
        await sendEmail(
          booking.guestEmail,
          `New message for your ItWhip booking`,
          `
            <p>You have a new message from ${senderName} regarding your booking:</p>
            <blockquote style="border-left: 3px solid #ccc; padding-left: 10px; margin: 10px 0;">
              ${message}
            </blockquote>
            <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/rentals/dashboard/bookings/${bookingId}">View booking</a></p>
          `,
          `New message from ${senderName} for your ItWhip booking`
        )
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
      // Don't fail the request if email fails
    }

    // SMS notification for new messages (fire-and-forget, dedup prevents spam)
    import('@/app/lib/twilio/sms-triggers').then(({ sendMissedMessageSms }) => {
      // Guest sent message → SMS host
      if ((senderType === 'guest' || senderType === 'renter') && booking.car.host?.phone) {
        sendMissedMessageSms({
          recipientPhone: booking.car.host.phone,
          recipientId: booking.car.host.id,
          recipientType: 'host',
          senderName,
          bookingCode: booking.bookingCode,
          bookingId: booking.id,
        }).catch(e => console.error('[Messages] SMS to host failed:', e))
      }
      // Host/admin sent message → SMS guest
      if ((senderType === 'host' || senderType === 'admin' || senderType === 'support') && booking.guestPhone) {
        sendMissedMessageSms({
          recipientPhone: booking.guestPhone,
          recipientId: booking.reviewerProfileId || undefined,
          recipientType: 'guest',
          senderName,
          bookingCode: booking.bookingCode,
          bookingId: booking.id,
        }).catch(e => console.error('[Messages] SMS to guest failed:', e))
      }
    }).catch(() => {})

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

    // Verify JWT auth
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const isAdmin = user.role === 'ADMIN'

    // Verify booking ownership
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        renterId: true,
        guestEmail: true,
        car: { select: { host: { select: { email: true } } } }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const isOwner = (user.id && booking.renterId === user.id) ||
                    (user.email && booking.guestEmail === user.email)
    const isHost = booking.car.host && user.email === booking.car.host.email

    if (!isOwner && !isHost && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

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