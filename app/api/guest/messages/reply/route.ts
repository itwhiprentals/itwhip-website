// app/api/guest/messages/reply/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { sendEmail } from '@/app/lib/email/sender'

export async function POST(request: NextRequest) {
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
    const userName = user.name

    console.log('[GUEST REPLY API] Authenticated user:', userEmail)

    // Get request body
    const body = await request.json()
    const { messageId, bookingId, reply } = body

    // Validate inputs
    if (!reply || !reply.trim()) {
      return NextResponse.json(
        { success: false, error: 'Reply message is required' },
        { status: 400 }
      )
    }

    if (!messageId && !bookingId) {
      return NextResponse.json(
        { success: false, error: 'Either messageId or bookingId is required' },
        { status: 400 }
      )
    }

    // Determine booking ID
    let targetBookingId = bookingId

    if (messageId && !targetBookingId) {
      // If only messageId provided, find the booking from the original message
      const originalMessage = await prisma.rentalMessage.findUnique({
        where: { id: messageId },
        select: { bookingId: true }
      })

      if (!originalMessage) {
        return NextResponse.json(
          { success: false, error: 'Original message not found' },
          { status: 404 }
        )
      }

      targetBookingId = originalMessage.bookingId
    }

    // Verify user owns this booking
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: targetBookingId,
        OR: [
          { renterId: userId },
          { guestEmail: userEmail }
        ]
      },
      include: {
        car: {
          select: {
            make: true,
            model: true,
            year: true,
            host: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        renter: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found or unauthorized' },
        { status: 403 }
      )
    }

    console.log('[GUEST REPLY API] Reply for booking:', booking.bookingCode)

    // Create the reply message
    const replyMessage = await prisma.rentalMessage.create({
      data: {
        id: crypto.randomUUID(),
        updatedAt: new Date(),
        bookingId: targetBookingId,
        senderId: userId,
        senderType: 'guest',
        senderName: userName || 'Guest',
        senderEmail: userEmail || booking.guestEmail || '',
        message: reply.trim(),
        category: 'general',
        isRead: false,
        readByAdmin: false,
        replyToId: messageId || null
      } as any
    })

    // Mark original message as read (if replying to a specific message)
    if (messageId) {
      await prisma.rentalMessage.update({
        where: { id: messageId },
        data: { isRead: true }
      }).catch(err => console.error('Failed to mark message as read:', err))
    }

    console.log('[GUEST REPLY API] ✅ Reply saved:', replyMessage.id)

    // Send email notification to admin
    try {
      const emailSubject = `New Guest Reply - Booking ${booking.bookingCode}`
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Guest Message</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0;"><strong>Booking:</strong> ${booking.bookingCode}</p>
              <p style="margin: 0 0 10px 0;"><strong>Vehicle:</strong> ${booking.car.year} ${booking.car.make} ${booking.car.model}</p>
              <p style="margin: 0;"><strong>Guest:</strong> ${userName || 'Guest'} (${userEmail || booking.guestEmail})</p>
            </div>

            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; white-space: pre-wrap; color: #1e40af; font-size: 15px; line-height: 1.6;">${reply.trim()}</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'}/fleet/messages?key=phoenix-fleet-2847" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                View in Fleet Hub
              </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Reply to this message from the Fleet Hub to respond to the guest directly.
              </p>
            </div>
          </div>

          <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} ItWhip • Car Rental Platform
            </p>
          </div>
        </div>
      `

      const emailText = `New message from ${userName || 'Guest'} for booking ${booking.bookingCode}:\n\n${reply.trim()}\n\nView in Fleet Hub: ${process.env.NEXT_PUBLIC_BASE_URL}/fleet/messages?key=phoenix-fleet-2847`

      await sendEmail(
        'info@itwhip.com',
        emailSubject,
        emailHtml,
        emailText
      )

      console.log('[GUEST REPLY API] ✅ Email notification sent to admin')
    } catch (emailError) {
      console.error('[GUEST REPLY API] ❌ Email notification failed:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
      data: {
        id: replyMessage.id,
        bookingId: targetBookingId,
        bookingCode: booking.bookingCode,
        createdAt: replyMessage.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error('[GUEST REPLY API] ❌ Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send reply',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}