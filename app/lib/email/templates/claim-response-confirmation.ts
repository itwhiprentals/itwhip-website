// app/lib/email/templates/claim-response-confirmation.ts

import { ClaimResponseConfirmationData, EmailTemplate } from '../types'

/**
 * Email template for guest after they submit their response to a claim
 * Confirms their response was received and is now under review
 */
export function getClaimResponseConfirmationTemplate(data: ClaimResponseConfirmationData): EmailTemplate {
  const subject = `Response Received - Claim #${data.claimId.slice(0, 8).toUpperCase()}`

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
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
          .success-icon {
            font-size: 48px;
            margin-bottom: 12px;
          }
          .content {
            padding: 40px 30px;
          }
          .success-box {
            background: #ecfdf5;
            border: 2px solid #10b981;
            padding: 20px;
            margin: 24px 0;
            border-radius: 6px;
            text-align: center;
          }
          .success-title {
            color: #065f46;
            font-weight: 700;
            font-size: 18px;
            margin-bottom: 8px;
          }
          .success-text {
            color: #047857;
            font-size: 14px;
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
          .next-steps-box {
            background: #eff6ff;
            border: 1px solid #3b82f6;
            padding: 20px;
            border-radius: 6px;
            margin: 24px 0;
          }
          .next-steps-title {
            color: #1e40af;
            font-weight: 700;
            font-size: 16px;
            margin-bottom: 12px;
          }
          .next-steps-list {
            color: #1e3a8a;
            font-size: 14px;
            margin-left: 20px;
          }
          .next-steps-list li {
            margin: 8px 0;
          }
          .btn {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 700;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
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
            <div class="success-icon">✓</div>
            <div class="status-badge">RECEIVED</div>
            <h1>Response Submitted</h1>
          </div>

          <div class="content">
            <p style="font-size: 16px; color: #111827; margin-bottom: 20px;">
              Hi ${data.guestName},
            </p>

            <div class="success-box">
              <div class="success-title">Your response has been received!</div>
              <div class="success-text">
                Thank you for responding to the claim. Our team will now review all information from both parties and make a fair decision.
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
              <div class="info-row">
                <span class="info-label">Claim Type</span>
                <span class="info-value">${data.claimType}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Host</span>
                <span class="info-value">${data.hostName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Response Submitted</span>
                <span class="info-value">${new Date(data.responseSubmittedAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              ${data.evidencePhotosCount > 0 ? `
              <div class="info-row">
                <span class="info-label">Evidence Photos</span>
                <span class="info-value">${data.evidencePhotosCount} uploaded</span>
              </div>
              ` : ''}
            </div>

            <div class="next-steps-box">
              <div class="next-steps-title">What happens next?</div>
              <ul class="next-steps-list">
                <li>Our claims team will review all submitted information</li>
                <li>We may contact you if we need any additional details</li>
                <li>You'll receive an email once a decision has been made</li>
                <li>Any account hold has been removed upon submission</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${data.claimUrl}" class="btn">VIEW CLAIM STATUS</a>
            </div>

            <p style="color: #6b7280; font-size: 13px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <strong>Questions?</strong> Contact us at <a href="mailto:info@itwhip.com" style="color: #3b82f6;">info@itwhip.com</a>
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
RESPONSE SUBMITTED SUCCESSFULLY

Hi ${data.guestName},

Your response has been received!

Thank you for responding to the claim. Our team will now review all information from both parties and make a fair decision.

CLAIM DETAILS:
- Claim ID: #${data.claimId.slice(0, 8).toUpperCase()}
- Booking Code: ${data.bookingCode}
- Vehicle: ${data.carDetails}
- Claim Type: ${data.claimType}
- Host: ${data.hostName}
- Response Submitted: ${new Date(data.responseSubmittedAt).toLocaleString()}
${data.evidencePhotosCount > 0 ? `- Evidence Photos: ${data.evidencePhotosCount} uploaded` : ''}

WHAT HAPPENS NEXT:
- Our claims team will review all submitted information
- We may contact you if we need any additional details
- You'll receive an email once a decision has been made
- Any account hold has been removed upon submission

VIEW CLAIM STATUS: ${data.claimUrl}

Questions? Contact us at info@itwhip.com

© 2024 ItWhip. All rights reserved.
Phoenix, Arizona
itwhip.com
  `

  return { subject, html, text }
}
