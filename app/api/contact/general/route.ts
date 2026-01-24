// app/api/contact/general/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/app/lib/email/sender'
import { prisma } from '@/app/lib/database/prisma'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message, userType, phone } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const isUrgent = subject === 'urgent' || subject === 'booking'
    
    // Store message in ContactMessage table
    const contactMessage = await prisma.contactMessage.create({
      data: {
        id: nanoid(),
        name,
        email,
        phone: phone || null,
        subject: `${userType ? `[${userType}] ` : ''}${subject}`,
        message,
        status: 'UNREAD',
        updatedAt: new Date()
      }
    })
    
    // Send email to admin with clear instructions
    const adminEmail = process.env.ADMIN_EMAIL || 'info@itwhip.com'
    
    const adminSubject = isUrgent 
      ? `🚨 URGENT Contact Form: ${subject} - from ${name}`
      : `Contact Form: ${subject} - from ${name}`

    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0;">New Contact Form Submission</h2>
        </div>
        
        <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #667eea;">
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          <p><strong>User Type:</strong> ${userType || 'General'}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          ${isUrgent ? '<p style="color: red;"><strong>⚠️ URGENT - Respond within 1-2 hours</strong></p>' : ''}
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #ddd; margin: 20px 0;">
          <h3 style="color: #333;">Message:</h3>
          <p style="line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        
        <div style="background: #fffbeb; padding: 15px; border-radius: 5px;">
          <p style="margin: 0; font-weight: bold;">ACTION REQUIRED:</p>
          <p style="margin: 10px 0;">
            <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/admin/messages" 
               style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View in Admin Dashboard
            </a>
          </p>
          <p style="margin: 10px 0;">Or reply directly to: <a href="mailto:${email}">${email}</a></p>
        </div>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #888; font-size: 12px;">
          Message ID: ${contactMessage.id}<br>
          Submitted on ${new Date().toLocaleString()}
        </p>
      </div>
    `

    await sendEmail(adminEmail, adminSubject, adminEmailHtml, message)

    // Send professional auto-reply to user
    const userSubject = 'We received your message - ItWhip'
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Thank You for Contacting ItWhip</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px;">Hi ${name},</p>
          
          <p style="color: #555; line-height: 1.6;">
            We've received your inquiry and appreciate you reaching out. Our team will review your message and get back to you soon.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #333;">Expected Response Time:</p>
            <p style="margin: 10px 0; color: #666;">
              ${isUrgent ? '🚨 1-2 hours (urgent)' : 
                subject === 'partnership' ? '🤝 24-48 hours' :
                subject === 'driver' ? '🚗 48 hours' :
                '📧 Within 24 hours'}
            </p>
          </div>
          
          <div style="border-left: 3px solid #ddd; padding-left: 15px; margin: 20px 0;">
            <p style="color: #888; font-style: italic; margin: 0;">Your message:</p>
            <p style="color: #666; margin: 10px 0;">"${message.substring(0, 200)}${message.length > 200 ? '...' : ''}"</p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            While you wait, check out our <a href="https://itwhip.com/how-it-works" style="color: #667eea;">How It Works</a> page 
            or browse <a href="https://itwhip.com/rentals" style="color: #667eea;">available vehicles</a>.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            This is an automated confirmation. Our team will reply from info@itwhip.com<br>
            © ${new Date().getFullYear()} ItWhip Technologies, Inc.
          </p>
        </div>
      </div>
    `

    await sendEmail(email, userSubject, userEmailHtml, `We received your message and will respond within ${isUrgent ? '1-2 hours' : '24 hours'}.`)

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully',
      id: contactMessage.id
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}