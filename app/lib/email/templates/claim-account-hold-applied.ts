// app/lib/email/templates/claim-account-hold-applied.ts

import { ClaimAccountHoldAppliedData, EmailTemplate } from '../types'
import { escapeHtml } from '../sanitize'

/**
 * Email template for guest when their account is placed on hold due to a claim
 * Sent when claim is filed and guest has 48 hours to respond
 */
export function getClaimAccountHoldAppliedTemplate(data: ClaimAccountHoldAppliedData): EmailTemplate {
  const subject = `Account Hold Applied - Immediate Action Required - ${data.bookingCode}`

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
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
          .warning-icon {
            font-size: 48px;
            margin-bottom: 12px;
          }
          .content {
            padding: 40px 30px;
          }
          .hold-box {
            background: #fef2f2;
            border: 3px solid #ef4444;
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
          }
          .hold-title {
            color: #991b1b;
            font-weight: 700;
            font-size: 18px;
            margin-bottom: 12px;
          }
          .hold-reason {
            color: #7f1d1d;
            font-size: 14px;
            margin-bottom: 16px;
          }
          .hold-restrictions {
            background: #fee2e2;
            padding: 16px;
            border-radius: 6px;
          }
          .hold-restrictions-title {
            color: #991b1b;
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 8px;
          }
          .hold-restrictions-list {
            color: #7f1d1d;
            font-size: 13px;
            margin-left: 20px;
          }
          .hold-restrictions-list li {
            margin: 4px 0;
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
          .resolve-box {
            background: #ecfdf5;
            border: 2px solid #10b981;
            padding: 20px;
            border-radius: 6px;
            margin: 24px 0;
          }
          .resolve-title {
            color: #065f46;
            font-weight: 700;
            font-size: 16px;
            margin-bottom: 12px;
          }
          .resolve-text {
            color: #047857;
            font-size: 14px;
          }
          .btn {
            display: inline-block;
            background: #ef4444;
            color: white;
            padding: 18px 50px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 900;
            font-size: 18px;
            margin: 20px 0;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .btn:hover {
            background: #dc2626;
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
            <div class="warning-icon">⚠️</div>
            <div class="status-badge">ACCOUNT HOLD</div>
            <h1>Account Temporarily Restricted</h1>
          </div>

          <div class="content">
            <p style="font-size: 16px; color: #111827; margin-bottom: 20px;">
              Hi ${escapeHtml(data.guestName)},
            </p>

            <div class="hold-box">
              <div class="hold-title">Your account has been placed on temporary hold</div>
              <div class="hold-reason">${data.holdReason}</div>
              <div class="hold-restrictions">
                <div class="hold-restrictions-title">While on hold, you cannot:</div>
                <ul class="hold-restrictions-list">
                  <li>Make new bookings</li>
                  <li>Modify existing reservations</li>
                  <li>Access certain account features</li>
                </ul>
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
                <span class="info-label">Claim Type</span>
                <span class="info-value">${escapeHtml(data.claimType)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Host</span>
                <span class="info-value">${escapeHtml(data.hostName)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Estimated Amount</span>
                <span class="info-value">$${data.estimatedCost.toLocaleString()}</span>
              </div>
            </div>

            <div class="resolve-box">
              <div class="resolve-title">How to remove this hold</div>
              <div class="resolve-text">
                Simply respond to the claim within 48 hours. Once you submit your response, the hold will be automatically removed and your account will be restored to full functionality.
              </div>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${data.responseUrl}" class="btn">Respond to Claim Now</a>
            </div>

            <p style="color: #374151; font-size: 14px; margin-top: 24px;">
              <strong>What to include in your response:</strong><br>
              • Your detailed account of what happened<br>
              • Any photos or documentation you have<br>
              • Your insurance information (if applicable)<br>
              • Contact information for follow-up
            </p>

            <p style="color: #6b7280; font-size: 13px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <strong>Need help?</strong> Contact us immediately at <a href="mailto:${data.supportEmail}" style="color: #3b82f6;">${data.supportEmail}</a>
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
ACCOUNT HOLD APPLIED - IMMEDIATE ACTION REQUIRED

Hi ${escapeHtml(data.guestName)},

Your account has been placed on temporary hold.

${data.holdReason}

WHILE ON HOLD, YOU CANNOT:
- Make new bookings
- Modify existing reservations
- Access certain account features

CLAIM DETAILS:
- Claim ID: #${data.claimId.slice(0, 8).toUpperCase()}
- Booking Code: ${data.bookingCode}
- Vehicle: ${escapeHtml(data.carDetails)}
- Claim Type: ${escapeHtml(data.claimType)}
- Host: ${escapeHtml(data.hostName)}
- Estimated Amount: $${data.estimatedCost.toLocaleString()}

HOW TO REMOVE THIS HOLD:
Simply respond to the claim within 48 hours. Once you submit your response, the hold will be automatically removed and your account will be restored to full functionality.

RESPOND NOW: ${data.responseUrl}

WHAT TO INCLUDE IN YOUR RESPONSE:
- Your detailed account of what happened
- Any photos or documentation you have
- Your insurance information (if applicable)
- Contact information for follow-up

Need help? Contact us immediately at ${data.supportEmail}

© 2024 ItWhip. All rights reserved.
Phoenix, Arizona
itwhip.com
  `

  return { subject, html, text }
}
