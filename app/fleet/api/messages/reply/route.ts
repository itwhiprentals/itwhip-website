// app/fleet/api/messages/reply/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/sender'

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key')

    // Verify fleet authentication
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { messageId, reply, attachments = [], senderType = 'support' } = body

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'Message ID is required' },
        { status: 400 }
      )
    }

    // Allow empty reply if there are attachments
    if (!reply && (!attachments || attachments.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Reply text or attachments are required' },
        { status: 400 }
      )
    }

    console.log('[FLEET REPLY] Processing reply:', { 
      messageId, 
      replyLength: reply?.length || 0,
      attachmentCount: attachments.length,
      senderType
    })

    // Determine sender info based on senderType
    let senderName = 'ItWhip Support'
    let senderEmail = 'info@itwhip.com'
    let senderTypeForDb = 'support'

    // Try RentalMessage first (booking messages)
    const rentalMessage = await prisma.rentalMessage.findUnique({
      where: { id: messageId },
      include: {
        booking: {
          include: {
            renter: true,
            car: {
              include: {
                host: true
              }
            }
          }
        }
      }
    })

    if (rentalMessage) {
      // NOW set sender info based on type AFTER we have the booking data
      if (senderType === 'admin') {
        senderName = 'ItWhip Admin'
        senderEmail = 'admin@itwhip.com'
        senderTypeForDb = 'admin'
      } else if (senderType === 'host') {
        // Use actual host details from the booking
        if (rentalMessage.booking?.car?.host) {
          senderName = rentalMessage.booking.car.host.name || 'Car Host'
          senderEmail = rentalMessage.booking.car.host.email || 'host@itwhip.com'
          senderTypeForDb = 'admin_as_host'
          console.log('[FLEET REPLY] 🎭 Impersonating host:', senderName)
        } else {
          console.warn('[FLEET REPLY] ⚠️ No host found, using default')
          senderName = 'Car Host'
          senderEmail = 'host@itwhip.com'
          senderTypeForDb = 'admin_as_host'
        }
      } else {
        // Default: support
        senderName = 'ItWhip Support'
        senderEmail = 'info@itwhip.com'
        senderTypeForDb = 'support'
      }

      console.log('[FLEET REPLY] Final sender identity:', {
        senderType: senderTypeForDb,
        senderName,
        senderEmail
      })

      // Create reply in RentalMessage thread
      const replyMessage = await prisma.rentalMessage.create({
        data: {
          bookingId: rentalMessage.bookingId,
          senderId: 'fleet-admin',
          senderType: senderTypeForDb,
          senderName,
          senderEmail,
          message: reply || '',
          category: rentalMessage.category,
          isRead: true,
          readByAdmin: true,
          replyToId: messageId,
          metadata: attachments.length > 0 ? { attachments } : undefined
        }
      })

      // Mark original as read
      await prisma.rentalMessage.update({
        where: { id: messageId },
        data: {
          isRead: true,
          readByAdmin: true,
          readAt: new Date()
        }
      })

      console.log('[FLEET REPLY] ✅ Reply saved to RentalMessage:', replyMessage.id, 'as', senderTypeForDb)

      // Send email notification
      if (rentalMessage.booking?.renter?.email) {
        try {
          const emailSubject = `New Message About Your Booking - ${rentalMessage.booking.bookingCode}`
          
          // Build attachments HTML if any
          let attachmentsHtml = ''
          if (attachments.length > 0) {
            attachmentsHtml = `
              <div style="margin: 20px 0;">
                <p style="font-weight: 600; margin-bottom: 10px;">Attachments:</p>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${attachments.map((att: any) => `
                    <a href="${att.url}" 
                       style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f3f4f6; border-radius: 6px; text-decoration: none; color: #1f2937;"
                       target="_blank">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2Z"/>
                      </svg>
                      <span>${att.name}</span>
                    </a>
                  `).join('')}
                </div>
              </div>
            `
          }

          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">New Message About Your Booking</h2>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Booking:</strong> ${rentalMessage.booking.bookingCode}</p>
                ${rentalMessage.booking.car ? `<p style="margin: 5px 0 0 0;"><strong>Vehicle:</strong> ${rentalMessage.booking.car.make} ${rentalMessage.booking.car.model}</p>` : ''}
                <p style="margin: 5px 0 0 0;"><strong>From:</strong> ${senderName}</p>
              </div>
              <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; white-space: pre-wrap;">${reply || '[File attachment only]'}</p>
              </div>
              ${attachmentsHtml}
              <p style="margin-top: 20px;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'}/dashboard" 
                   style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View in Dashboard
                </a>
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Best regards,<br>
                ${senderName}
              </p>
            </div>
          `
          const emailText = `New message from ${senderName} about your booking ${rentalMessage.booking.bookingCode}:\n\n${reply || '[File attachment only]'}\n\n${attachments.length > 0 ? `Attachments:\n${attachments.map((att: any) => `- ${att.name}: ${att.url}`).join('\n')}\n\n` : ''}Login to your dashboard to view and reply: ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`

          await sendEmail(
            rentalMessage.booking.renter.email,
            emailSubject,
            emailHtml,
            emailText
          )
          console.log('[FLEET REPLY] ✅ Email sent to:', rentalMessage.booking.renter.email)
        } catch (emailError) {
          console.error('[FLEET REPLY] ❌ Email failed:', emailError)
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Reply sent successfully',
        data: {
          id: replyMessage.id,
          type: 'booking',
          senderType: senderTypeForDb,
          senderName,
          senderEmail,
          emailSent: !!rentalMessage.booking?.renter?.email,
          attachmentCount: attachments.length
        }
      })
    }

    // Handle sender info for Contact/Inquiry messages (no host impersonation)
    if (senderType === 'admin') {
      senderName = 'ItWhip Admin'
      senderEmail = 'admin@itwhip.com'
      senderTypeForDb = 'admin'
    } else {
      senderName = 'ItWhip Support'
      senderEmail = 'info@itwhip.com'
      senderTypeForDb = 'support'
    }

    // Create standardized reply object for Contact/Inquiry
    const replyObj = {
      id: `reply_${Date.now()}`,
      senderType: senderTypeForDb,
      senderName,
      senderEmail,
      message: reply || '',
      timestamp: new Date().toISOString(),
      attachments: attachments.map((att: any) => ({
        url: att.url,
        name: att.name,
        type: att.type,
        size: att.size
      }))
    }

    // Try ContactMessage
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id: messageId }
    })

    if (contactMessage) {
      // Get existing replies or initialize
      const existingReplies = Array.isArray(contactMessage.replies) ? contactMessage.replies : []
      const updatedReplies = [...existingReplies, replyObj]

      await prisma.contactMessage.update({
        where: { id: messageId },
        data: {
          status: 'REPLIED',
          repliedAt: new Date(),
          repliedBy: 'fleet-admin',
          replies: updatedReplies,
          replyCount: updatedReplies.length
        }
      })

      console.log('[FLEET REPLY] ✅ Reply stored in ContactMessage (reply #' + updatedReplies.length + ')')

      // Send email
      try {
        const emailSubject = `Re: ${contactMessage.subject}`
        
        // Build attachments HTML
        let attachmentsHtml = ''
        if (attachments.length > 0) {
          attachmentsHtml = `
            <div style="margin: 20px 0;">
              <p style="font-weight: 600; margin-bottom: 10px;">Attachments:</p>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${attachments.map((att: any) => `
                  <a href="${att.url}" 
                     style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f3f4f6; border-radius: 6px; text-decoration: none; color: #1f2937;"
                     target="_blank">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2Z"/>
                    </svg>
                    <span>${att.name}</span>
                  </a>
                `).join('')}
              </div>
            </div>
          `
        }

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Response to Your Inquiry</h2>
            <p>Hi ${contactMessage.name},</p>
            <p>Thank you for contacting ItWhip. Here's our response to your inquiry about <strong>"${contactMessage.subject}"</strong>:</p>
            <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; white-space: pre-wrap;">${reply || '[File attachment only]'}</p>
            </div>
            ${attachmentsHtml}
            <p>If you have more questions, feel free to reply to this email or contact us at info@itwhip.com</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              ItWhip Support Team
            </p>
          </div>
        `
        const emailText = `Hi ${contactMessage.name},\n\nThank you for contacting ItWhip. Here's our response to your inquiry about "${contactMessage.subject}":\n\n${reply || '[File attachment only]'}\n\n${attachments.length > 0 ? `Attachments:\n${attachments.map((att: any) => `- ${att.name}: ${att.url}`).join('\n')}\n\n` : ''}If you have more questions, feel free to reply to this email.\n\nBest regards,\nItWhip Support Team`

        await sendEmail(contactMessage.email, emailSubject, emailHtml, emailText)
        console.log('[FLEET REPLY] ✅ Email sent to:', contactMessage.email)
      } catch (emailError) {
        console.error('[FLEET REPLY] ❌ Email failed:', emailError)
      }

      return NextResponse.json({
        success: true,
        message: 'Reply sent successfully',
        data: {
          id: messageId,
          type: 'contact',
          replyId: replyObj.id,
          emailSent: true,
          attachmentCount: attachments.length
        }
      })
    }

    // Try HostInquiry
    const hostInquiry = await prisma.hostInquiry.findUnique({
      where: { id: messageId }
    })

    if (hostInquiry) {
      // Get existing replies or initialize
      const existingReplies = Array.isArray(hostInquiry.replies) ? hostInquiry.replies : []
      const updatedReplies = [...existingReplies, replyObj]

      await prisma.hostInquiry.update({
        where: { id: messageId },
        data: {
          status: 'CONTACTED',
          contactedAt: new Date(),
          contactedBy: 'fleet-admin',
          replies: updatedReplies,
          replyCount: updatedReplies.length
        }
      })

      console.log('[FLEET REPLY] ✅ Reply stored in HostInquiry (reply #' + updatedReplies.length + ')')

      // Send email
      try {
        const emailSubject = `Re: Your ${hostInquiry.vehicleYear} ${hostInquiry.vehicleMake} ${hostInquiry.vehicleModel} Listing Inquiry`
        
        // Build attachments HTML
        let attachmentsHtml = ''
        if (attachments.length > 0) {
          attachmentsHtml = `
            <div style="margin: 20px 0;">
              <p style="font-weight: 600; margin-bottom: 10px;">Attachments:</p>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${attachments.map((att: any) => `
                  <a href="${att.url}" 
                     style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f3f4f6; border-radius: 6px; text-decoration: none; color: #1f2937;"
                     target="_blank">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2Z"/>
                    </svg>
                    <span>${att.name}</span>
                  </a>
                `).join('')}
              </div>
            </div>
          `
        }

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Response to Your Listing Inquiry</h2>
            <p>Hi ${hostInquiry.name},</p>
            <p>Thank you for your interest in listing your <strong>${hostInquiry.vehicleYear} ${hostInquiry.vehicleMake} ${hostInquiry.vehicleModel}</strong> on ItWhip.</p>
            <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; white-space: pre-wrap;">${reply || '[File attachment only]'}</p>
            </div>
            ${attachmentsHtml}
            <p style="margin-top: 20px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'}/host/signup" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Complete Your Host Application
              </a>
            </p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              ItWhip Host Team
            </p>
          </div>
        `
        const emailText = `Hi ${hostInquiry.name},\n\nThank you for your interest in listing your ${hostInquiry.vehicleYear} ${hostInquiry.vehicleMake} ${hostInquiry.vehicleModel} on ItWhip.\n\n${reply || '[File attachment only]'}\n\n${attachments.length > 0 ? `Attachments:\n${attachments.map((att: any) => `- ${att.name}: ${att.url}`).join('\n')}\n\n` : ''}Ready to get started? Visit: ${process.env.NEXT_PUBLIC_BASE_URL}/host/signup\n\nBest regards,\nItWhip Host Team`

        await sendEmail(hostInquiry.email, emailSubject, emailHtml, emailText)
        console.log('[FLEET REPLY] ✅ Email sent to:', hostInquiry.email)
      } catch (emailError) {
        console.error('[FLEET REPLY] ❌ Email failed:', emailError)
      }

      return NextResponse.json({
        success: true,
        message: 'Reply sent successfully',
        data: {
          id: messageId,
          type: 'inquiry',
          replyId: replyObj.id,
          emailSent: true,
          attachmentCount: attachments.length
        }
      })
    }

    return NextResponse.json(
      { success: false, error: 'Message not found' },
      { status: 404 }
    )

  } catch (error) {
    console.error('[FLEET REPLY] ❌ Error:', error)
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