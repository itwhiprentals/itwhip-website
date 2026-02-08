// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/sender'
import { validateEmail } from '@/app/utils/email-validator'

// POST - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message, source } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format and check for risk
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Check for high-risk emails (but still allow submission with flag)
    const isHighRisk = emailValidation.riskLevel === 'high' || emailValidation.riskLevel === 'critical'

    // Basic spam detection
    const spamKeywords = ['viagra', 'cialis', 'casino', 'lottery', 'prince', 'inheritance']
    const lowerMessage = message.toLowerCase()
    const containsSpam = spamKeywords.some(keyword => lowerMessage.includes(keyword))

    // Rate limiting check (simple IP-based)
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

    // Check recent submissions from this IP (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentSubmissions = await prisma.contactMessage.count({
      where: {
        email: email,
        createdAt: { gte: oneHourAgo }
      }
    })

    if (recentSubmissions >= 3) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      )
    }

    // Create the contact message in database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        subject: subject.trim(),
        message: message.trim(),
        status: 'UNREAD'
      } as any
    })

    // Prepare email to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@itwhip.com'
    let emailSent = false
    let emailError = null

    // Don't send email if it's spam
    if (!containsSpam) {
      try {
        const riskWarning = isHighRisk ? '⚠️ HIGH RISK EMAIL - ' : ''
        const emailSubject = `${riskWarning}New Contact Form: ${subject}`
        
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #111827; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4b5563; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: white; padding: 30px 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
                .info-grid { display: grid; gap: 15px; margin: 20px 0; }
                .info-row { display: flex; border-bottom: 1px solid #f3f4f6; padding-bottom: 10px; }
                .info-label { font-weight: 600; min-width: 100px; color: #6b7280; }
                .info-value { flex: 1; color: #111827; }
                .message-box { background: #f9fafb; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; white-space: pre-wrap; }
                .risk-warning { background: #fef3c7; border: 1px solid #fcd34d; padding: 10px; border-radius: 6px; margin: 15px 0; }
                .button-group { margin-top: 30px; text-align: center; }
                .button { display: inline-block; padding: 12px 24px; margin: 0 10px; text-decoration: none; border-radius: 6px; font-weight: 500; }
                .button-primary { background: #10b981; color: white; }
                .button-secondary { background: #6b7280; color: white; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 style="margin: 0;">New Contact Form Submission</h2>
                  <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">
                    ${new Date().toLocaleString('en-US', { timeZone: 'America/Phoenix' })} MST
                  </p>
                </div>
                <div class="content">
                  ${isHighRisk ? `
                    <div class="risk-warning">
                      <strong>⚠️ Risk Alert:</strong> This email has been flagged as potentially suspicious.<br>
                      Risk Level: ${emailValidation.riskLevel.toUpperCase()}<br>
                      Risk Score: ${emailValidation.riskScore}/100<br>
                      Flags: ${emailValidation.flags.join(', ')}
                    </div>
                  ` : ''}
                  
                  <div class="info-grid">
                    <div class="info-row">
                      <div class="info-label">Name:</div>
                      <div class="info-value">${name}</div>
                    </div>
                    <div class="info-row">
                      <div class="info-label">Email:</div>
                      <div class="info-value">
                        <a href="mailto:${email}">${email}</a>
                        ${emailValidation.suggestions?.length ? `<br><small style="color: #ef4444;">Did they mean: ${emailValidation.suggestions[0]}?</small>` : ''}
                      </div>
                    </div>
                    ${phone ? `
                      <div class="info-row">
                        <div class="info-label">Phone:</div>
                        <div class="info-value"><a href="tel:${phone}">${phone}</a></div>
                      </div>
                    ` : ''}
                    <div class="info-row">
                      <div class="info-label">Subject:</div>
                      <div class="info-value"><strong>${subject}</strong></div>
                    </div>
                    <div class="info-row">
                      <div class="info-label">Source:</div>
                      <div class="info-value">${source || 'Contact Page'}</div>
                    </div>
                    <div class="info-row">
                      <div class="info-label">IP Address:</div>
                      <div class="info-value">${clientIp}</div>
                    </div>
                  </div>

                  <h3 style="margin-top: 30px; color: #111827;">Message:</h3>
                  <div class="message-box">${message.replace(/\n/g, '<br>')}</div>

                  <div class="button-group">
                    <a href="${process.env.NEXT_PUBLIC_URL}/admin/messages" class="button button-primary">
                      View in Admin
                    </a>
                    <a href="mailto:${email}?subject=Re: ${subject}" class="button button-secondary">
                      Reply via Email
                    </a>
                  </div>

                  <div class="footer">
                    <p>Contact Form ID: ${contactMessage.id}</p>
                    <p>This is an automated message from the ItWhip contact form.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `

        const emailText = `
New Contact Form Submission
${isHighRisk ? '⚠️ HIGH RISK EMAIL DETECTED\n' : ''}
Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}\n` : ''}
Subject: ${subject}

Message:
${message}

---
Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/Phoenix' })}
ID: ${contactMessage.id}
        `

        const emailResult = await sendEmail(adminEmail, emailSubject, emailHtml, emailText)
        emailSent = emailResult.success
        if (!emailResult.success) {
          emailError = emailResult.error
        }

        // Also send auto-reply to user (if not high risk)
        if (!isHighRisk) {
          try {
            const autoReplySubject = `We received your message - ItWhip`
            const autoReplyHtml = `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #111827; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: white; padding: 30px 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
                    .message-box { background: #f0fdf4; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h2 style="margin: 0;">Thank You for Contacting ItWhip</h2>
                    </div>
                    <div class="content">
                      <p>Hi ${name},</p>
                      
                      <div class="message-box">
                        <p style="margin: 0;">We've received your message and will get back to you within 24 hours.</p>
                      </div>

                      <p><strong>Your message:</strong></p>
                      <p style="color: #6b7280; background: #f9fafb; padding: 15px; border-radius: 6px;">
                        ${message.substring(0, 200)}${message.length > 200 ? '...' : ''}
                      </p>

                      <p>In the meantime, you might find these helpful:</p>
                      <ul>
                        <li><a href="${process.env.NEXT_PUBLIC_URL}/rentals">Browse Available Cars</a></li>
                        <li><a href="${process.env.NEXT_PUBLIC_URL}/how-it-works">How ItWhip Works</a></li>
                        <li><a href="${process.env.NEXT_PUBLIC_URL}/faq">Frequently Asked Questions</a></li>
                      </ul>

                      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                        This is an automated response to confirm we received your message.<br>
                        A team member will follow up with you soon.
                      </p>
                    </div>
                  </div>
                </body>
              </html>
            `
            
            const autoReplyText = `Hi ${name},\n\nThank you for contacting ItWhip. We've received your message and will get back to you within 24 hours.\n\nBest regards,\nThe ItWhip Team`
            
            await sendEmail(email, autoReplySubject, autoReplyHtml, autoReplyText)
          } catch (autoReplyError) {
            console.error('Failed to send auto-reply:', autoReplyError)
            // Don't fail the whole request if auto-reply fails
          }
        }
      } catch (error) {
        console.error('Failed to send admin notification:', error)
        emailError = (error as any).message
      }
    }

    // Log if it was spam
    if (containsSpam) {
      console.warn(`Spam contact form blocked from ${email}: ${subject}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting us. We\'ll get back to you soon!',
      id: contactMessage.id,
      emailSent,
      debug: {
        isHighRisk,
        riskScore: emailValidation.riskScore,
        containsSpam
      }
    })

  } catch (error) {
    console.error('Failed to process contact form:', error)
    return NextResponse.json(
      { error: 'Failed to submit contact form. Please try again.' },
      { status: 500 }
    )
  }
}