// app/lib/email/templates/claim-notification-guest.ts

import { ClaimNotificationGuestData, EmailTemplate } from '../types'

/**
 * Email template for guest when claim is filed against them
 * Sent when fleet approves the claim - guest has 48 hours to respond
 */
export function getClaimNotificationGuestTemplate(data: ClaimNotificationGuestData): EmailTemplate {
  const subject = `⚠️ Insurance Claim Filed - Action Required - ${data.bookingCode}`
  
  const urgencyColor = data.hoursRemaining <= 24 ? '#ef4444' : '#f59e0b'
  const urgencyText = data.hoursRemaining <= 24 ? 'URGENT' : 'ACTION REQUIRED'
  
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
            background: linear-gradient(135deg, ${urgencyColor} 0%, ${urgencyColor === '#ef4444' ? '#dc2626' : '#d97706'} 100%); 
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
          }
          .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
          }
          .content {
            padding: 40px 30px;
          }
          .alert-box {
            background: #fef2f2;
            border: 2px solid #ef4444;
            padding: 20px;
            margin: 24px 0;
            border-radius: 6px;
          }
          .alert-title {
            color: #991b1b;
            font-weight: 700;
            font-size: 16px;
            margin-bottom: 8px;
          }
          .alert-text {
            color: #7f1d1d;
            font-size: 14px;
          }
          .countdown {
            text-align: center;
            background: #fef3c7;
            padding: 20px;
            border-radius: 6px;
            margin: 24px 0;
          }
          .countdown-number {
            font-size: 48px;
            font-weight: 700;
            color: #92400e;
            display: block;
          }
          .countdown-label {
            color: #78350f;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
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
          .financial-box {
            background: #fff7ed;
            border: 1px solid #fb923c;
            padding: 20px;
            border-radius: 6px;
            margin: 24px 0;
          }
          .financial-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
          }
          .financial-total {
            font-size: 18px;
            font-weight: 700;
            color: #c2410c;
            padding-top: 12px;
            margin-top: 12px;
            border-top: 2px solid #fb923c;
          }
          .btn {
            display: inline-block;
            background: #ef4444;
            color: white;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 700;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
          }
          .btn:hover {
            background: #dc2626;
          }
          .consequences-box {
            background: #fee2e2;
            border-left: 4px solid #ef4444;
            padding: 16px;
            margin: 24px 0;
            border-radius: 4px;
          }
          .consequences-title {
            color: #991b1b;
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 8px;
          }
          .consequences-list {
            color: #7f1d1d;
            font-size: 13px;
            margin-left: 20px;
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
            <div class="status-badge">${urgencyText}</div>
            <h1>Insurance Claim Filed</h1>
          </div>

          <div class="content">
            <p style="font-size: 16px; color: #111827; margin-bottom: 20px;">
              Hi ${data.guestName},
            </p>

            <div class="alert-box">
              <div class="alert-title">⚠️ Immediate Response Required</div>
              <div class="alert-text">
                An insurance claim has been filed for a recent rental. Your account is currently on hold and you must respond within 48 hours to avoid suspension.
              </div>
            </div>

            <div class="countdown">
              <span class="countdown-number">${data.hoursRemaining}</span>
              <span class="countdown-label">Hours Remaining to Respond</span>
            </div>

            <p style="color: #374151; margin-bottom: 24px;">
              The host has reported an incident involving your rental and our fleet team has approved the claim for review. We need your response to proceed.
            </p>

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
              <div class="info-row">
                <span class="info-label">Incident Date</span>
                <span class="info-value">${new Date(data.incidentDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Claim Type</span>
                <span class="info-value">${data.claimType}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Estimated Damage</span>
                <span class="info-value">$${data.estimatedCost.toLocaleString()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Response Deadline</span>
                <span class="info-value">${new Date(data.responseDeadline).toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>

            <div class="financial-box">
              <h3 style="color: #c2410c; margin-bottom: 12px; font-size: 16px;">Financial Impact</h3>
              <div class="financial-row">
                <span style="color: #78350f;">Deductible Amount:</span>
                <span style="color: #78350f; font-weight: 600;">$${data.deductibleAmount.toLocaleString()}</span>
              </div>
              <div class="financial-row">
                <span style="color: #78350f;">Deposit Currently Held:</span>
                <span style="color: #78350f; font-weight: 600;">-$${data.depositHeld.toLocaleString()}</span>
              </div>
              <div class="financial-row financial-total">
                <span>Potential Additional Charge:</span>
                <span>$${data.potentialCharge.toLocaleString()}</span>
              </div>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${data.responseUrl}" class="btn">RESPOND TO CLAIM NOW</a>
            </div>

            <div class="consequences-box">
              <div class="consequences-title">⚠️ If You Don't Respond Within 48 Hours:</div>
              <ul class="consequences-list">
                <li>Your account will be automatically suspended</li>
                <li>You won't be able to make new bookings</li>
                <li>Any active reservations will be cancelled</li>
                <li>The claim may be decided without your input</li>
                <li>Additional fees may apply for non-response</li>
              </ul>
            </div>

            <p style="color: #374151; font-size: 14px; margin-top: 24px;">
              <strong>What to include in your response:</strong><br>
              • Your account of what happened<br>
              • Any photos or documentation you have<br>
              • Insurance information (if applicable)<br>
              • Contact information for follow-up
            </p>

            <p style="color: #6b7280; font-size: 13px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <strong>Questions?</strong> Contact us immediately at <a href="mailto:claims@itwhip.com" style="color: #3b82f6;">claims@itwhip.com</a> or call (602) 555-0100
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
⚠️ ${urgencyText} - INSURANCE CLAIM FILED

Hi ${data.guestName},

IMMEDIATE RESPONSE REQUIRED

An insurance claim has been filed for a recent rental. Your account is currently on hold and you must respond within 48 hours to avoid suspension.

⏰ TIME REMAINING: ${data.hoursRemaining} HOURS

Claim Details:
- Claim ID: #${data.claimId.slice(0, 8).toUpperCase()}
- Booking Code: ${data.bookingCode}
- Vehicle: ${data.carDetails}
- Incident Date: ${new Date(data.incidentDate).toLocaleDateString()}
- Claim Type: ${data.claimType}
- Estimated Damage: $${data.estimatedCost.toLocaleString()}
- Response Deadline: ${new Date(data.responseDeadline).toLocaleString()}

FINANCIAL IMPACT:
Deductible Amount: $${data.deductibleAmount.toLocaleString()}
Deposit Currently Held: -$${data.depositHeld.toLocaleString()}
──────────────────────────
Potential Additional Charge: $${data.potentialCharge.toLocaleString()}

⚠️ IF YOU DON'T RESPOND WITHIN 48 HOURS:
- Your account will be automatically suspended
- You won't be able to make new bookings
- Any active reservations will be cancelled
- The claim may be decided without your input
- Additional fees may apply for non-response

RESPOND NOW: ${data.responseUrl}

WHAT TO INCLUDE IN YOUR RESPONSE:
- Your account of what happened
- Any photos or documentation you have
- Insurance information (if applicable)
- Contact information for follow-up

Questions? Contact us immediately:
Email: claims@itwhip.com
Phone: (602) 555-0100

© 2024 ItWhip. All rights reserved.
Phoenix, Arizona
itwhip.com
  `

  return { subject, html, text }
}