// app/api/admin/messages/reply/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'  // FIXED: Correct import path
import { sendEmail } from '@/app/lib/email/sender'

// POST - Admin sends a reply
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      messageType,      // 'booking', 'contact', 'inquiry'
      bookingId,        // For booking messages
      recipientEmail,   // For contact/inquiry responses
      message,
      senderType,       // 'admin', 'support', 'admin_as_host'
      category,         // 'general', 'document', 'pickup', 'issue', 'payment'
      isUrgent,
      attachmentUrl,
      attachmentName,
      replyToId         // For threading
    } = body

    // Validate required fields
    if (!message || !senderType) {
      return NextResponse.json(
        { error: 'Message and sender type are required' },
        { status: 400 }
      )
    }

    // Determine sender name based on type
    const senderName = senderType === 'admin' ? 'ItWhip Admin' :
                      senderType === 'support' ? 'ItWhip Support' :
                      senderType === 'admin_as_host' ? 'Your Host' :
                      'ItWhip Team'

    let createdMessage = null
    let emailSent = false
    let emailError = null

    // Handle booking messages
    if (messageType === 'booking' && bookingId) {
      // Get booking details for context
      const booking = await prisma.rentalBooking.findUnique({
        where: { id: bookingId },
        include: {
          car: {
            include: {
              host: true
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

      // Create the message
      createdMessage = await prisma.rentalMessage.create({
        data: {
          id: crypto.randomUUID(),
          bookingId,
          senderId: 'admin',
          senderType,
          senderName,
          senderEmail: 'info@itwhip.com',  // FIXED: Changed from admin@itwhip.com
          message,
          category: category || 'general',
          isUrgent: isUrgent || false,
          hasAttachment: !!attachmentUrl,
          attachmentUrl,
          attachmentName,
          replyToId,
          isRead: false,
          readByAdmin: true, // Admin's own message
          updatedAt: new Date()
        } as any
      })

      // Send email to guest
      const guestEmail = booking.guestEmail || booking.renterId
      if (guestEmail) {
        try {
          const emailSubject = isUrgent 
            ? `🚨 Urgent: Message about your ${booking.car.make} ${booking.car.model} rental`
            : `Message about your ${booking.car.make} ${booking.car.model} rental`

          const emailHtml = `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #111827; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { background: white; padding: 30px 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
                  .message-box { background: #f9fafb; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
                  .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                  .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h2 style="margin: 0;">New Message from ${senderName}</h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Booking #${booking.bookingCode}</p>
                  </div>
                  <div class="content">
                    <p>Hi ${booking.guestName || 'Guest'},</p>
                    
                    <div class="message-box">
                      <p style="margin: 0;">${message.replace(/\n/g, '<br>')}</p>
                    </div>

                    ${attachmentUrl ? `
                      <p><strong>📎 Attachment:</strong> <a href="${attachmentUrl}">${attachmentName || 'View attachment'}</a></p>
                    ` : ''}

                    <p>
                      <strong>Vehicle:</strong> ${booking.car.year} ${booking.car.make} ${booking.car.model}<br>
                      <strong>Dates:</strong> ${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}
                    </p>

                    <center>
                      <a href="${process.env.NEXT_PUBLIC_URL}/rentals/dashboard/bookings/${bookingId}" class="button">
                        View Booking & Reply
                      </a>
                    </center>

                    <div class="footer">
                      <p>This message is regarding your car rental booking #${booking.bookingCode}.</p>
                      <p>© ${new Date().getFullYear()} ItWhip Technologies, Inc.</p>
                    </div>
                  </div>
                </div>
              </body>
            </html>
          `

          const emailText = `
New message from ${senderName}

${message}

Vehicle: ${booking.car.year} ${booking.car.make} ${booking.car.model}
Booking: #${booking.bookingCode}

View booking and reply: ${process.env.NEXT_PUBLIC_URL}/rentals/dashboard/bookings/${bookingId}
          `

          const emailResult = await sendEmail(guestEmail, emailSubject, emailHtml, emailText)
          emailSent = emailResult.success
          if (!emailResult.success) {
            emailError = emailResult.error
          }

          // Update message with email status
          if (emailResult.success && emailResult.messageId) {
            await prisma.rentalMessage.update({
              where: { id: createdMessage.id },
              data: {
                metadata: {
                  ...(createdMessage.metadata as any || {}),
                  emailSent: true,
                  emailMessageId: emailResult.messageId,
                  emailSentAt: new Date().toISOString()
                }
              }
            })
          }
        } catch (error) {
          console.error('Failed to send email:', error)
          emailError = (error as Error).message
        }
      }

      // Update booking's last message time
      await prisma.rentalBooking.update({
        where: { id: bookingId },
        data: { updatedAt: new Date() }
      })

    } 
    // Handle contact message replies
    else if (messageType === 'contact' && recipientEmail) {
      // Note: ContactMessage table doesn't exist yet
      // Commenting out to prevent errors
      /*
      await prisma.contactMessage.updateMany({
        where: { email: recipientEmail },
        data: { 
          status: 'REPLIED',
          repliedAt: new Date(),
          repliedBy: 'admin'
        }
      })
      */

      // Send email reply
      try {
        const emailSubject = `Re: Your inquiry to ItWhip`
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #111827; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: white; padding: 30px 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
                .message-box { background: #f9fafb; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 style="margin: 0;">Response from ItWhip Team</h2>
                </div>
                <div class="content">
                  <div class="message-box">
                    <p style="margin: 0;">${message.replace(/\n/g, '<br>')}</p>
                  </div>
                  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    Thank you for contacting ItWhip. If you have any further questions, please don't hesitate to reach out.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `

        const emailResult = await sendEmail(recipientEmail, emailSubject, emailHtml, message)
        emailSent = emailResult.success
        if (!emailResult.success) {
          emailError = emailResult.error
        }
      } catch (error) {
        console.error('Failed to send email:', error)
        emailError = (error as Error).message
      }

      // Create a record of the reply (optional - for tracking)
      createdMessage = {
        id: 'contact-reply-' + Date.now(),
        type: 'contact',
        message,
        senderType,
        recipientEmail,
        emailSent
      }

    }
    // Handle host inquiry replies
    else if (messageType === 'inquiry' && recipientEmail) {
      // Note: HostInquiry table doesn't exist yet
      // Commenting out to prevent errors
      /*
      await prisma.hostInquiry.updateMany({
        where: { email: recipientEmail },
        data: { 
          status: 'CONTACTED',
          contactedAt: new Date(),
          contactedBy: 'admin'
        }
      })
      */

      // Send email reply
      try {
        const emailSubject = `Re: Your vehicle listing inquiry - ItWhip`
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #111827; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: white; padding: 30px 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
                .message-box { background: #f9fafb; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
                .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 style="margin: 0;">Response About Your Vehicle Listing</h2>
                </div>
                <div class="content">
                  <div class="message-box">
                    <p style="margin: 0;">${message.replace(/\n/g, '<br>')}</p>
                  </div>
                  
                  <center>
                    <a href="${process.env.NEXT_PUBLIC_URL}/list-your-car" class="button">
                      Learn More About Hosting
                    </a>
                  </center>
                  
                  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    Thank you for your interest in listing your vehicle on ItWhip!
                  </p>
                </div>
              </div>
            </body>
          </html>
        `

        const emailResult = await sendEmail(recipientEmail, emailSubject, emailHtml, message)
        emailSent = emailResult.success
        if (!emailResult.success) {
          emailError = emailResult.error
        }
      } catch (error) {
        console.error('Failed to send email:', error)
        emailError = (error as Error).message
      }

      // Create a record of the reply
      createdMessage = {
        id: 'inquiry-reply-' + Date.now(),
        type: 'inquiry',
        message,
        senderType,
        recipientEmail,
        emailSent
      }
    }
    else {
      return NextResponse.json(
        { error: 'Invalid message type or missing required fields' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: createdMessage,
      email: {
        sent: emailSent,
        error: emailError
      }
    })

  } catch (error) {
    console.error('Failed to send reply:', error)
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    )
  }
}