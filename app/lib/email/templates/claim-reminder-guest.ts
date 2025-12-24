// app/lib/email/templates/claim-reminder-guest.ts

import { ClaimReminderGuestData, EmailTemplate } from '../types'

/**
 * Email template for guest 24hr reminder
 * Sent 24 hours before the 48hr response deadline expires
 */
export function getClaimReminderGuestTemplate(data: ClaimReminderGuestData): EmailTemplate {
  const subject = `🚨 URGENT: ${data.hoursRemaining} Hours to Respond - ${data.bookingCode}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
            line-height: 1.6; 
            color: #111827; 
            background: #ffffff;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border: 1px solid #e5e7eb;
          }
          .header { 
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); 
            color: white; 
            padding: 40px 20px;
            text-align: center; 
          }
          .status-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 1px;
            margin-bottom: 16px;
            text-transform: uppercase;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
          }
          .urgent-icon {
            font-size: 64px;
            margin-bottom: 16px;
            animation: shake 0.5s infinite;
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          .content {
            padding: 40px 30px;
          }
          .countdown-box {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 3px solid #ef4444;
            padding: 30px;
            margin: 24px 0;
            border-radius: 8px;
            text-align: center;
          }
          .countdown-number {
            font-size: 72px;
            font-weight: 900;
            color: #991b1b;
            display: block;
            line-height: 1;
            margin-bottom: 8px;
          }
          .countdown-label {
            color: #7f1d1d;
            font-size: 18px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .countdown-sublabel {
            color: #991b1b;
            font-size: 14px;
            margin-top: 12px;
            font-weight: 600;
          }
          .critical-box {
            background: #7f1d1d;
            color: white;
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
          }
          .critical-title {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 16px;
            text-align: center;
          }
          .critical-list {
            margin-left: 20px;
            font-size: 15px;
            line-height: 1.8;
          }
          .critical-list li {
            margin: 8px 0;
          }
          .info-box {
            background: #f9fafb;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 24px 0;
            border-radius: 4px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            color: #6b7280;
            font-size: 14px;
          }
          .info-value {
            color: #111827;
            font-weight: 600;
            font-size: 14px;
          }
          .btn-urgent {
            display: inline-block;
            background: #dc2626;
            color: white;
            padding: 20px 50px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 900;
            font-size: 18px;
            margin: 20px 0;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);
          }
          .btn-urgent:hover {
            background: #991b1b;
            box-shadow: 0 6px 8px rgba(220, 38, 38, 0.4);
          }
          .warning-banner {
            background: #fef3c7;
            border-top: 3px solid #f59e0b;
            border-bottom: 3px solid #f59e0b;
            padding: 16px;
            margin: 24px 0;
            text-align: center;
          }
          .warning-text {
            color: #92400e;
            font-weight: 700;
            font-size: 15px;
          }
          .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer-text {
            color: #6b7280;
            font-size: 12px;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="urgent-icon">🚨</div>
            <div class="status-badge">FINAL REMINDER</div>
            <h1>Response Deadline Approaching</h1>
          </div>

          <div class="content">
            <p style="font-size: 16px; color: #111827; margin-bottom: 20px;">
              Hi ${data.guestName},
            </p>

            <p style="color: #374151; margin-bottom: 24px; font-weight: 600; font-size: 15px;">
              This is your final reminder. You have less than 24 hours remaining to respond to an insurance claim filed against your account.
            </p>

            <div class="countdown-box">
              <span class="countdown-number">${data.hoursRemaining}</span>
              <span class="countdown-label">Hours Remaining</span>
              <div class="countdown-sublabel">Until Automatic Account Suspension</div>
            </div>

            <div class="critical-box">
              <div class="critical-title">⚠️ Critical: Action Required Now</div>
              <ul class="critical-list">
                <li><strong>Your account is currently on hold</strong></li>
                <li>You cannot make new bookings</li>
                <li>Failure to respond will result in automatic suspension</li>
                <li>The claim will be decided without your input</li>
                <li>Additional fees may apply</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${data.responseUrl}" class="btn-urgent">Respond to Claim Now</a>
            </div>

            <div class="warning-banner">
              <div class="warning-text">
                ⏰ After ${data.hoursRemaining} hours, this window closes permanently
              </div>
            </div>

            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Claim ID</span>
                <span class="info-value">#${data.claimId.slice(0, 8).toUpperCase()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Booking Code</span>
                <span class="info-value">${data.bookingCode}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Vehicle</span>
                <span class="info-value">${data.carDetails}</span>
              </div>
            </div>

            <div style="background: #fee2e2; border: 2px solid #ef4444; padding: 20px; border-radius: 6px; margin: 24px 0;">
              <h3 style="color: #991b1b; margin-bottom: 12px; font-size: 16px;">📋 What Happens If You Don't Respond:</h3>
              <p style="color: #7f1d1d; font-size: 14px; margin-bottom: 8px; font-weight: 600;">
                ${data.consequences}
              </p>
            </div>

            <p style="color: #374151; font-size: 15px; margin-top: 24px; font-weight: 600;">
              <strong>To respond, you need to provide:</strong><br>
              • Your detailed account of the incident<br>
              • Any photos or documentation you have<br>
              • Your insurance information (if applicable)<br>
              • Contact information for follow-up
            </p>

            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="color: #1e40af; font-size: 14px;">
                <strong>Need Help?</strong> Our claims team is available 24/7 to assist you. Don't let the deadline pass - contact us immediately if you have questions.
              </p>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${data.responseUrl}" class="btn-urgent">Respond Before It's Too Late</a>
            </div>

            <p style="color: #6b7280; font-size: 13px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
              <strong>URGENT SUPPORT</strong><br>
              Email: <a href="mailto:info@itwhip.com" style="color: #dc2626; font-weight: 700;">info@itwhip.com</a><br>
              Phone: <a href="tel:+16025550100" style="color: #dc2626; font-weight: 700;">(602) 555-0100</a> (Available 24/7)
            </p>
          </div>

          <div class="footer">
            <p class="footer-text">
              © 2024 ItWhip. All rights reserved.<br>
              Phoenix, Arizona<br>
              <a href="https://itwhip.com" style="color: #3b82f6; text-decoration: none;">itwhip.com</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
🚨 FINAL REMINDER - ${data.hoursRemaining} HOURS REMAINING

Hi ${data.guestName},

URGENT: This is your final reminder. You have less than 24 hours remaining to respond to an insurance claim filed against your account.

⏰ TIME REMAINING: ${data.hoursRemaining} HOURS
Until Automatic Account Suspension

⚠️ CRITICAL: ACTION REQUIRED NOW
- Your account is currently on hold
- You cannot make new bookings
- Failure to respond will result in automatic suspension
- The claim will be decided without your input
- Additional fees may apply

RESPOND NOW: ${data.responseUrl}

CLAIM DETAILS:
Claim ID: #${data.claimId.slice(0, 8).toUpperCase()}
Booking Code: ${data.bookingCode}
Vehicle: ${data.carDetails}

📋 WHAT HAPPENS IF YOU DON'T RESPOND:
${data.consequences}

TO RESPOND, YOU NEED TO PROVIDE:
- Your detailed account of the incident
- Any photos or documentation you have
- Your insurance information (if applicable)
- Contact information for follow-up

⏰ After ${data.hoursRemaining} hours, this window closes permanently

URGENT SUPPORT (Available 24/7):
Email: info@itwhip.com
Phone: (602) 555-0100

Don't let the deadline pass - respond now or contact us immediately if you have questions.

© 2024 ItWhip. All rights reserved.
Phoenix, Arizona
itwhip.com
  `

  return { subject, html, text }
}