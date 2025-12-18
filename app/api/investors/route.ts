// app/api/investors/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/app/lib/email/sender'
import { validateEmail } from '@/app/utils/email-validator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, firm, investmentSize, message } = body

    // Validate required fields
    if (!name || !email || !firm || !investmentSize) {
      return NextResponse.json(
        { error: 'Name, email, firm, and investment range are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    const clientIp = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown'

    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Phoenix' })
    const adminEmail = process.env.ADMIN_EMAIL || 'info@itwhip.com'

    // Send notification to admin
    const adminSubject = `🎯 New Investor Inquiry - ${investmentSize} - ${firm}`
    const adminHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #111827; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .highlight-box { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .info-grid { margin: 20px 0; }
            .info-row { display: flex; border-bottom: 1px solid #f3f4f6; padding: 12px 0; }
            .info-label { font-weight: 600; min-width: 140px; color: #6b7280; }
            .info-value { flex: 1; color: #111827; }
            .message-box { background: #f9fafb; padding: 20px; border-left: 4px solid #1e40af; margin: 20px 0; white-space: pre-wrap; }
            .button { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 10px 5px 10px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">New Investor Inquiry</h2>
              <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Series A Fundraising</p>
            </div>
            <div class="content">
              <div class="highlight-box">
                <strong>💰 Investment Range: ${investmentSize}</strong>
              </div>

              <div class="info-grid">
                <div class="info-row">
                  <div class="info-label">Name:</div>
                  <div class="info-value">${name}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Email:</div>
                  <div class="info-value"><a href="mailto:${email}">${email}</a></div>
                </div>
                <div class="info-row">
                  <div class="info-label">Firm/Organization:</div>
                  <div class="info-value"><strong>${firm}</strong></div>
                </div>
                <div class="info-row">
                  <div class="info-label">Investment Range:</div>
                  <div class="info-value">${investmentSize}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Submitted:</div>
                  <div class="info-value">${timestamp} MST</div>
                </div>
                <div class="info-row">
                  <div class="info-label">IP Address:</div>
                  <div class="info-value">${clientIp}</div>
                </div>
              </div>

              ${message ? `
                <h3 style="margin-top: 30px; color: #111827;">Message:</h3>
                <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
              ` : ''}

              <div style="margin-top: 30px;">
                <a href="mailto:${email}?subject=Re: ItWhip Series A - ${firm}" class="button">
                  Reply to Investor
                </a>
              </div>

              <div class="footer">
                <p>This investor has confirmed they are an accredited investor.</p>
                <p>Submitted via itwhip.com/investors</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const adminText = `
New Investor Inquiry - Series A

Investment Range: ${investmentSize}

Name: ${name}
Email: ${email}
Firm/Organization: ${firm}

${message ? `Message:\n${message}\n` : ''}
---
Submitted: ${timestamp} MST
IP: ${clientIp}
    `

    // Send to admin
    const adminResult = await sendEmail(adminEmail, adminSubject, adminHtml, adminText)

    // Send confirmation to investor
    const investorSubject = `Thank You for Your Interest - ItWhip Series A`
    const investorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #111827; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .confirmation-box { background: #f0fdf4; border: 1px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .summary { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">Thank You for Your Interest</h2>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">ItWhip Technologies, Inc. - Series A</p>
            </div>
            <div class="content">
              <p>Dear ${name},</p>

              <div class="confirmation-box">
                <p style="margin: 0;"><strong>✓ We've received your inquiry.</strong></p>
                <p style="margin: 10px 0 0 0;">A member of our team will review your request and reach out within 48 business hours to discuss next steps.</p>
              </div>

              <div class="summary">
                <p style="margin: 0 0 10px 0; font-weight: 600;">Your Submission:</p>
                <p style="margin: 0; color: #6b7280;">
                  Firm: ${firm}<br>
                  Investment Range: ${investmentSize}<br>
                  Submitted: ${timestamp} MST
                </p>
              </div>

              <p>In the meantime, feel free to explore our platform at <a href="https://itwhip.com">itwhip.com</a> to see our product in action.</p>

              <p>Best regards,</p>
              <p><strong>ItWhip Investor Relations</strong></p>

              <div class="footer">
                <p><strong>Important Notice:</strong> This communication is intended solely for accredited investors. Information shared is confidential and proprietary to ItWhip Technologies, Inc. This is not an offer to sell securities.</p>
                <p style="margin-top: 15px;">ItWhip Technologies, Inc. | Phoenix, Arizona</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const investorText = `
Dear ${name},

Thank you for your interest in ItWhip Technologies, Inc. Series A.

We've received your inquiry. A member of our team will review your request and reach out within 48 business hours to discuss next steps.

Your Submission:
- Firm: ${firm}
- Investment Range: ${investmentSize}
- Submitted: ${timestamp} MST

In the meantime, feel free to explore our platform at https://itwhip.com

Best regards,
ItWhip Investor Relations

---
Important Notice: This communication is intended solely for accredited investors. Information shared is confidential and proprietary to ItWhip Technologies, Inc. This is not an offer to sell securities.

ItWhip Technologies, Inc. | Phoenix, Arizona
    `

    // Send confirmation to investor
    const investorResult = await sendEmail(email, investorSubject, investorHtml, investorText)

    return NextResponse.json({
      success: true,
      message: 'Thank you for your interest. We\'ll be in touch within 48 hours.',
      adminEmailSent: adminResult.success,
      confirmationEmailSent: investorResult.success
    })

  } catch (error) {
    console.error('Failed to process investor inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to submit inquiry. Please try again or contact us directly.' },
      { status: 500 }
    )
  }
}
