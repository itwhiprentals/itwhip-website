// app/lib/email/templates/claim-filed-by-guest.ts

import { ClaimFiledByGuestData, EmailTemplate } from '../types'
import { escapeHtml } from '../sanitize'

/**
 * Email template for host when guest files a claim against them
 * Host has 48 hours to respond
 */
export function getClaimFiledByGuestTemplate(data: ClaimFiledByGuestData): EmailTemplate {
  const subject = `Claim Filed by Guest - ${data.bookingCode}`

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
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
          .notice-box {
            background: #fffbeb;
            border: 2px solid #f59e0b;
            padding: 20px;
            margin: 24px 0;
            border-radius: 6px;
          }
          .notice-title {
            color: #92400e;
            font-weight: 700;
            font-size: 16px;
            margin-bottom: 8px;
          }
          .notice-text {
            color: #78350f;
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
          .description-box {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 16px;
            border-radius: 6px;
            margin: 24px 0;
          }
          .description-label {
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .description-text {
            color: #374151;
            font-size: 14px;
            line-height: 1.6;
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
          .btn:hover {
            background: #2563eb;
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
            <div class="status-badge">CLAIM FILED</div>
            <h1>Guest Has Filed a Claim</h1>
          </div>

          <div class="content">
            <p style="font-size: 16px; color: #111827; margin-bottom: 20px;">
              Hi ${escapeHtml(data.hostName)},
            </p>

            <div class="notice-box">
              <div class="notice-title">A guest has filed a claim regarding a recent rental</div>
              <div class="notice-text">
                ${escapeHtml(data.guestName)} has reported an issue with their rental experience and submitted a claim for review. Please review the details below and respond within 48 hours.
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
                <span class="info-value">${escapeHtml(data.carDetails)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Filed By</span>
                <span class="info-value">${escapeHtml(data.guestName)}</span>
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
                <span class="info-value">${escapeHtml(data.claimType)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Estimated Amount</span>
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

            <div class="description-box">
              <div class="description-label">Guest's Description</div>
              <div class="description-text">${data.claimDescription}</div>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${data.claimUrl}" class="btn">VIEW CLAIM DETAILS</a>
            </div>

            <p style="color: #374151; font-size: 14px; margin-top: 24px;">
              <strong>What you should do:</strong><br>
              • Review the claim details and guest's description<br>
              • Gather any photos or documentation you have<br>
              • Respond with your perspective on the incident<br>
              • Our team will review both sides and make a fair decision
            </p>

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
CLAIM FILED BY GUEST

Hi ${escapeHtml(data.hostName)},

A guest has filed a claim regarding a recent rental.

${escapeHtml(data.guestName)} has reported an issue with their rental experience and submitted a claim for review. Please review the details below and respond within 48 hours.

CLAIM DETAILS:
- Claim ID: #${data.claimId.slice(0, 8).toUpperCase()}
- Booking Code: ${data.bookingCode}
- Vehicle: ${escapeHtml(data.carDetails)}
- Filed By: ${escapeHtml(data.guestName)}
- Incident Date: ${new Date(data.incidentDate).toLocaleDateString()}
- Claim Type: ${escapeHtml(data.claimType)}
- Estimated Amount: $${data.estimatedCost.toLocaleString()}
- Response Deadline: ${new Date(data.responseDeadline).toLocaleString()}

GUEST'S DESCRIPTION:
${data.claimDescription}

VIEW CLAIM: ${data.claimUrl}

WHAT YOU SHOULD DO:
- Review the claim details and guest's description
- Gather any photos or documentation you have
- Respond with your perspective on the incident
- Our team will review both sides and make a fair decision

Questions? Contact us at info@itwhip.com

© 2024 ItWhip. All rights reserved.
Phoenix, Arizona
itwhip.com
  `

  return { subject, html, text }
}
