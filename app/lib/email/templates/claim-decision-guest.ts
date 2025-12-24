// app/lib/email/templates/claim-decision-guest.ts

import { ClaimDecisionGuestData, EmailTemplate } from '../types'

/**
 * Email template for guest when claim decision is made
 * Sent after fleet admin approves or denies the claim
 */
export function getClaimDecisionGuestTemplate(data: ClaimDecisionGuestData): EmailTemplate {
  const isApproved = data.decision === 'approved'
  const subject = isApproved 
    ? `Claim Decision: Approved - ${data.bookingCode}` 
    : `Claim Decision: Denied - ${data.bookingCode}`
  
  const headerColor = isApproved ? '#ef4444' : '#10b981'
  const headerGradient = isApproved ? '#dc2626' : '#059669'
  
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
            background: linear-gradient(135deg, ${headerColor} 0%, ${headerGradient} 100%); 
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
          .decision-icon {
            font-size: 64px;
            margin-bottom: 16px;
          }
          .content {
            padding: 40px 30px;
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
          .payment-box {
            background: #fee2e2;
            border: 2px solid #ef4444;
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
          }
          .payment-title {
            color: #991b1b;
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 16px;
            text-align: center;
          }
          .payment-amount {
            color: #7f1d1d;
            font-size: 36px;
            font-weight: 700;
            text-align: center;
            margin-bottom: 16px;
          }
          .payment-details {
            background: white;
            padding: 16px;
            border-radius: 6px;
          }
          .payment-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #fecaca;
          }
          .payment-row:last-child {
            border-bottom: none;
          }
          .success-box {
            background: #d1fae5;
            border: 2px solid #10b981;
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
            text-align: center;
          }
          .success-title {
            color: #065f46;
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 12px;
          }
          .success-text {
            color: #047857;
            font-size: 14px;
          }
          .denial-reason {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 24px 0;
            border-radius: 4px;
          }
          .denial-title {
            color: #92400e;
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 8px;
          }
          .denial-text {
            color: #78350f;
            font-size: 13px;
          }
          .btn {
            display: inline-block;
            background: ${headerColor};
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
          }
          .btn-secondary {
            background: #6b7280;
          }
          .action-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin: 24px 0;
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
            <div class="decision-icon">${isApproved ? '⚠️' : '✅'}</div>
            <div class="status-badge">CLAIM ${data.decision.toUpperCase()}</div>
            <h1>Claim Decision Made</h1>
          </div>

          <div class="content">
            <p style="font-size: 16px; color: #111827; margin-bottom: 20px;">
              Hi ${data.guestName},
            </p>

            ${isApproved ? `
              <p style="color: #374151; margin-bottom: 24px;">
                After reviewing all documentation and evidence, the insurance claim for your recent rental has been approved. You are responsible for the following charges.
              </p>

              <div class="payment-box">
                <div class="payment-title">💳 Payment Due</div>
                <div class="payment-amount">$${data.guestResponsibility?.toLocaleString()}</div>
                <div class="payment-details">
                  <div class="payment-row">
                    <span style="color: #6b7280; font-size: 14px;">Approved Claim Amount</span>
                    <span style="color: #111827; font-weight: 600; font-size: 14px;">$${data.approvedAmount?.toLocaleString()}</span>
                  </div>
                  <div class="payment-row">
                    <span style="color: #6b7280; font-size: 14px;">Your Responsibility</span>
                    <span style="color: #111827; font-weight: 600; font-size: 14px;">$${data.guestResponsibility?.toLocaleString()}</span>
                  </div>
                  <div class="payment-row">
                    <span style="color: #6b7280; font-size: 14px;">Payment Due Date</span>
                    <span style="color: #111827; font-weight: 600; font-size: 14px;">${data.paymentDueDate ? new Date(data.paymentDueDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Within 7 days'}</span>
                  </div>
                </div>
              </div>

              <p style="color: #374151; margin-bottom: 16px;">
                Payment will be automatically charged to your card on file. If you have questions about this charge or believe there was an error in the decision, you can file an appeal.
              </p>

              <div style="text-align: center;">
                <a href="${data.claimUrl}" class="btn">View Claim Details</a>
              </div>

              <div class="action-buttons">
                ${data.appealUrl ? `<a href="${data.appealUrl}" class="btn btn-secondary" style="color: white; text-decoration: none; padding: 12px 20px; display: block; text-align: center; border-radius: 6px;">File an Appeal</a>` : ''}
                <a href="mailto:info@itwhip.com" class="btn btn-secondary" style="color: white; text-decoration: none; padding: 12px 20px; display: block; text-align: center; border-radius: 6px;">Contact Support</a>
              </div>
            ` : `
              <div class="success-box">
                <div class="success-title">Good News!</div>
                <div class="success-text">
                  After reviewing all documentation and evidence, the insurance claim for your recent rental has been denied. No charges will be applied to your account and your account hold has been lifted.
                </div>
              </div>

              ${data.denialReason ? `
                <div class="denial-reason">
                  <div class="denial-title">📋 Reason for Denial</div>
                  <div class="denial-text">${data.denialReason}</div>
                </div>
              ` : ''}

              <p style="color: #374151; margin-bottom: 24px;">
                You can now continue to use your account normally and make new bookings. Your deposit has been or will be refunded according to our standard refund timeline.
              </p>

              <div style="text-align: center;">
                <a href="${data.claimUrl}" class="btn">View Claim Details</a>
              </div>
            `}

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
                <span class="info-label">Decision</span>
                <span class="info-value">${data.decision.toUpperCase()}</span>
              </div>
            </div>

            <p style="color: #6b7280; font-size: 13px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <strong>Questions about this decision?</strong> Contact us at <a href="mailto:info@itwhip.com" style="color: #3b82f6;">info@itwhip.com</a> or call (602) 555-0100
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
${isApproved ? '⚠️ CLAIM APPROVED' : '✅ CLAIM DENIED'} - DECISION MADE

Hi ${data.guestName},

${isApproved ? `
After reviewing all documentation and evidence, the insurance claim for your recent rental has been APPROVED.

💳 PAYMENT DUE: $${data.guestResponsibility?.toLocaleString()}

PAYMENT DETAILS:
Approved Claim Amount: $${data.approvedAmount?.toLocaleString()}
Your Responsibility: $${data.guestResponsibility?.toLocaleString()}
Payment Due Date: ${data.paymentDueDate ? new Date(data.paymentDueDate).toLocaleDateString() : 'Within 7 days'}

Payment will be automatically charged to your card on file. If you have questions about this charge or believe there was an error in the decision, you can file an appeal.

View claim details: ${data.claimUrl}
${data.appealUrl ? `File an appeal: ${data.appealUrl}` : ''}
` : `
✅ GOOD NEWS!

After reviewing all documentation and evidence, the insurance claim for your recent rental has been DENIED. No charges will be applied to your account and your account hold has been lifted.

${data.denialReason ? `
REASON FOR DENIAL:
${data.denialReason}
` : ''}

You can now continue to use your account normally and make new bookings. Your deposit has been or will be refunded according to our standard refund timeline.

View claim details: ${data.claimUrl}
`}

CLAIM DETAILS:
Claim ID: #${data.claimId.slice(0, 8).toUpperCase()}
Booking Code: ${data.bookingCode}
Vehicle: ${data.carDetails}
Decision: ${data.decision.toUpperCase()}

Questions about this decision? Contact us at info@itwhip.com or call (602) 555-0100

© 2024 ItWhip. All rights reserved.
Phoenix, Arizona
itwhip.com
  `

  return { subject, html, text }
}