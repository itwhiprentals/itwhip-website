// app/lib/email/templates/claim-guest-response-received.ts

import { ClaimGuestResponseReceivedData, EmailTemplate } from '../types'

/**
 * Email template for Fleet/Admin when guest submits their response to a claim
 * Notifies the claims team that review is needed
 */
export function getClaimGuestResponseReceivedTemplate(data: ClaimGuestResponseReceivedData): EmailTemplate {
  const subject = `Guest Response Received - Claim #${data.claimId.slice(0, 8).toUpperCase()} - ${data.bookingCode}`

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
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
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
            font-size: 24px;
            font-weight: 700;
            margin: 0;
          }
          .content {
            padding: 40px 30px;
          }
          .action-box {
            background: #dbeafe;
            border: 2px solid #3b82f6;
            padding: 20px;
            margin: 24px 0;
            border-radius: 6px;
          }
          .action-title {
            color: #1e40af;
            font-weight: 700;
            font-size: 16px;
            margin-bottom: 8px;
          }
          .action-text {
            color: #1e3a8a;
            font-size: 14px;
          }
          .info-box {
            background: #f9fafb;
            border-left: 4px solid #6b7280;
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
          .response-box {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 16px;
            border-radius: 6px;
            margin: 24px 0;
          }
          .response-label {
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .response-text {
            color: #374151;
            font-size: 14px;
            line-height: 1.6;
            white-space: pre-wrap;
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
            <div class="status-badge">REVIEW REQUIRED</div>
            <h1>Guest Response Received</h1>
          </div>

          <div class="content">
            <div class="action-box">
              <div class="action-title">Claim Ready for Review</div>
              <div class="action-text">
                The guest has submitted their response to the claim. Both parties have now provided their accounts. Please review and make a decision.
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
                <span class="info-label">Guest</span>
                <span class="info-value">${data.guestName} (${data.guestEmail})</span>
              </div>
              <div class="info-row">
                <span class="info-label">Host</span>
                <span class="info-value">${data.hostName}</span>
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
                <span class="info-label">Estimated Cost</span>
                <span class="info-value">$${data.estimatedCost.toLocaleString()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Response Submitted</span>
                <span class="info-value">${new Date(data.respondedAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Evidence Photos</span>
                <span class="info-value">${data.evidencePhotosCount} uploaded</span>
              </div>
            </div>

            <div class="response-box">
              <div class="response-label">Guest's Response (Preview)</div>
              <div class="response-text">${data.responseText}</div>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${data.reviewUrl}" class="btn">REVIEW CLAIM NOW</a>
            </div>

            <p style="color: #6b7280; font-size: 13px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              This is an automated notification from the ItWhip Claims System.
            </p>
          </div>

          <div class="footer">
            <p class="footer-text">
              © 2024 ItWhip Admin<br>
              Claims Management System
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
GUEST RESPONSE RECEIVED - REVIEW REQUIRED

Claim Ready for Review

The guest has submitted their response to the claim. Both parties have now provided their accounts. Please review and make a decision.

CLAIM DETAILS:
- Claim ID: #${data.claimId.slice(0, 8).toUpperCase()}
- Booking Code: ${data.bookingCode}
- Guest: ${data.guestName} (${data.guestEmail})
- Host: ${data.hostName}
- Vehicle: ${data.carDetails}
- Claim Type: ${data.claimType}
- Estimated Cost: $${data.estimatedCost.toLocaleString()}
- Response Submitted: ${new Date(data.respondedAt).toLocaleString()}
- Evidence Photos: ${data.evidencePhotosCount} uploaded

GUEST'S RESPONSE (PREVIEW):
${data.responseText}

REVIEW CLAIM: ${data.reviewUrl}

This is an automated notification from the ItWhip Claims System.

© 2024 ItWhip Admin
Claims Management System
  `

  return { subject, html, text }
}
