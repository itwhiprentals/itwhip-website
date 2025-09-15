// app/api/admin/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// GET /api/admin/messages - Fetch all messages
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'all'
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '100')

    // Build where clause for rental messages
    const rentalWhere: any = {}
    
    // Filter by read status for rental messages
    if (status === 'unread') {
      rentalWhere.isRead = false
    } else if (status === 'urgent') {
      rentalWhere.isUrgent = true
    }

    // Search filter for rental messages
    if (search) {
      rentalWhere.OR = [
        { senderName: { contains: search, mode: 'insensitive' } },
        { senderEmail: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { booking: { bookingCode: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Build where clause for contact messages
    const contactWhere: any = {}
    
    // Filter by status for contact messages
    if (status === 'unread') {
      contactWhere.status = 'UNREAD'
    } else if (status === 'urgent') {
      // For contact messages, check if subject contains urgent keywords
      contactWhere.OR = [
        { subject: { contains: 'urgent', mode: 'insensitive' } },
        { subject: { contains: 'booking', mode: 'insensitive' } },
        { subject: { contains: 'immediate', mode: 'insensitive' } }
      ]
    }

    // Search filter for contact messages
    if (search) {
      contactWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Fetch rental messages (excluding the fake CONTACT-MESSAGES booking)
    const rentalMessages = await prisma.rentalMessage.findMany({
      where: {
        ...rentalWhere,
        booking: {
          bookingCode: { not: 'CONTACT-MESSAGES' }
        }
      },
      include: {
        booking: {
          include: {
            car: {
              select: {
                make: true,
                model: true,
                year: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: type === 'booking' || type === 'all' ? limit : 0
    })

    // Fetch contact messages
    const contactMessages = await prisma.contactMessage.findMany({
      where: contactWhere,
      orderBy: { createdAt: 'desc' },
      take: type === 'contact' || type === 'all' ? limit : 0
    })

    // Fetch host inquiries
    const hostInquiries = await prisma.hostInquiry.findMany({
      where: {
        status: status === 'unread' ? 'NEW' : undefined
      },
      orderBy: { createdAt: 'desc' },
      take: type === 'inquiry' || type === 'all' ? limit : 0
    })

    // Transform rental messages to unified format
    const transformedRentalMessages = rentalMessages.map(msg => ({
      id: msg.id,
      type: 'booking' as const,
      bookingId: msg.bookingId,
      bookingCode: msg.booking.bookingCode,
      carInfo: msg.booking.car ? `${msg.booking.car.year} ${msg.booking.car.make} ${msg.booking.car.model}` : undefined,
      senderName: msg.senderName || msg.booking.guestName || 'Guest',
      senderEmail: msg.senderEmail || msg.booking.guestEmail || '',
      senderType: msg.senderType,
      subject: `Booking ${msg.booking.bookingCode} - ${msg.category || 'Message'}`,
      message: msg.message,
      isRead: msg.isRead || false,
      isUrgent: msg.isUrgent || false,
      hasAttachment: msg.hasAttachment || false,
      attachmentUrl: msg.attachmentUrl,
      category: msg.category,
      createdAt: msg.createdAt.toISOString(),
      phone: msg.booking.guestPhone,
      metadata: msg.metadata
    }))

    // Transform contact messages to unified format
    const transformedContactMessages = contactMessages.map(msg => ({
      id: msg.id,
      type: 'contact' as const,
      bookingId: null,
      bookingCode: null,
      carInfo: null,
      senderName: msg.name,
      senderEmail: msg.email,
      senderType: 'guest',
      subject: msg.subject,
      message: msg.message,
      isRead: msg.status !== 'UNREAD',
      isUrgent: msg.subject.toLowerCase().includes('urgent') || msg.subject.toLowerCase().includes('booking'),
      hasAttachment: false,
      attachmentUrl: null,
      category: 'contact',
      createdAt: msg.createdAt.toISOString(),
      phone: msg.phone,
      metadata: null
    }))

    // Transform host inquiries to unified format
    const transformedHostInquiries = hostInquiries.map(inq => ({
      id: inq.id,
      type: 'inquiry' as const,
      bookingId: null,
      bookingCode: null,
      carInfo: `${inq.vehicleYear} ${inq.vehicleMake} ${inq.vehicleModel}`,
      senderName: inq.name,
      senderEmail: inq.email,
      senderType: 'host_inquiry',
      subject: `Host Inquiry - ${inq.vehicleMake} ${inq.vehicleModel}`,
      message: inq.message || `Interested in listing: ${inq.vehicleYear} ${inq.vehicleMake} ${inq.vehicleModel} in ${inq.location}`,
      isRead: inq.status !== 'NEW',
      isUrgent: false,
      hasAttachment: false,
      attachmentUrl: null,
      category: 'inquiry',
      createdAt: inq.createdAt.toISOString(),
      phone: inq.phone,
      metadata: {
        vehicleInfo: {
          make: inq.vehicleMake,
          model: inq.vehicleModel,
          year: inq.vehicleYear,
          mileage: inq.mileage,
          condition: inq.condition,
          location: inq.location
        }
      }
    }))

    // Combine all messages
    const allMessages = [
      ...transformedRentalMessages,
      ...transformedContactMessages,
      ...transformedHostInquiries
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Calculate counts
    const counts = {
      total: allMessages.length,
      unreadRental: transformedRentalMessages.filter(m => !m.isRead).length,
      unreadContact: transformedContactMessages.filter(m => !m.isRead).length,
      newInquiries: transformedHostInquiries.filter(m => !m.isRead).length,
      urgent: allMessages.filter(m => m.isUrgent).length
    }

    // Apply type filter on combined results
    let filteredMessages = allMessages
    if (type !== 'all') {
      filteredMessages = allMessages.filter(m => m.type === type)
    }

    // Apply limit to final results
    filteredMessages = filteredMessages.slice(0, limit)

    return NextResponse.json({
      success: true,
      messages: filteredMessages,
      counts
    })

  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/messages - Mark message as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId, type, action } = body

    if (action === 'mark_read') {
      if (type === 'booking') {
        await prisma.rentalMessage.update({
          where: { id: messageId },
          data: { 
            isRead: true,
            readByAdmin: true,
            readAt: new Date()
          }
        })
        return NextResponse.json({ success: true })
      } 
      else if (type === 'contact') {
        await prisma.contactMessage.update({
          where: { id: messageId },
          data: { 
            status: 'READ',
            updatedAt: new Date()
          }
        })
        return NextResponse.json({ success: true })
      }
      else if (type === 'inquiry') {
        await prisma.hostInquiry.update({
          where: { id: messageId },
          data: { 
            status: 'CONTACTED',
            contactedAt: new Date(),
            contactedBy: 'admin'
          }
        })
        return NextResponse.json({ success: true })
      }
    }

    return NextResponse.json(
      { error: 'Invalid action or type' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    )
  }
}