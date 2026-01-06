// app/lib/email/templates/claim-approved-host.ts

import { ClaimApprovedHostData, EmailTemplate } from '../types'

/**
 * Email template for host when claim is approved
 * Sent after fleet admin approves the claim
 */
export function getClaimApprovedHostTemplate(data: ClaimApprovedHostData): EmailTemplate {
  const subject = `✅ Claim Approved - ${data.carDetails} - ${data.bookingCode}`
  
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
            font-size: 64px;
            margin-bottom: 16px;
          }
          .content {
            padding: 40px 30px;
          }
          .highlight-box {
            background: #d1fae5;
            border: 2px solid #10b981;
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
            text-align: center;
          }
          .highlight-label {
            color: #065f46;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .highlight-amount {
            color: #047857;
            font-size: 36px;
            font-weight: 700;
          }
          .payout-details {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 20px;
            margin: 24px 0;
            border-radius: 6px;
          }
          .payout-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .payout-row:last-child {
            border-bottom: none;
            padding-top: 16px;
            margin-top: 8px;
            border-top: 2px solid #10b981;
          }
          .payout-label {
            color: #6b7280;
            font-size: 14px;
          }
          .payout-value {
            color: #111827;
            font-weight: 600;
            font-size: 14px;
          }
          .payout-total .payout-label,
          .payout-total .payout-value {
            font-size: 18px;
            font-weight: 700;
            color: #047857;
          }
          .info-box {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 16px;
            margin: 24px 0;
            border-radius: 4px;
          }
          .info-title {
            color: #1e40af;
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 8px;
          }
          .info-text {
            color: #1e3a8a;
            font-size: 13px;
          }
          .review-notes {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 24px 0;
            border-radius: 4px;
          }
          .review-notes-title {
            color: #92400e;
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 8px;
          }
          .review-notes-text {
            color: #78350f;
            font-size: 13px;
            font-style: italic;
          }
          .btn {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
          }
          .next-steps {
            background: #f9fafb;
            padding: 20px;
            border-radius: 6px;
            margin: 24px 0;
          }
          .next-steps h3 {
            color: #111827;
            font-size: 16px;
            margin-bottom: 12px;
          }
          .next-steps ol {
            margin-left: 20px;
            color: #374151;
          }
          .next-steps li {
            margin: 8px 0;
            font-size: 14px;
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
            <div class="success-icon">✅</div>
            <div class="status-badge">CLAIM APPROVED</div>
            <h1>Your Claim Has Been Approved</h1>
          </div>

          <div class="content">
            <p style="font-size: 16px; color: #111827; margin-bottom: 20px;">
              Hi ${data.hostName},
            </p>

            <p style="color: #374151; margin-bottom: 24px;">
              Great news! Your insurance claim has been reviewed and approved by our fleet team. Payment will be processed according to your earnings tier.
            </p>

            <div class="highlight-box">
              <div class="highlight-label">Your Payout</div>
              <div class="highlight-amount">$${data.hostPayout.toLocaleString()}</div>
            </div>

            <div class="payout-details">
              <h3 style="color: #111827; margin-bottom: 16px; font-size: 16px;">Payout Breakdown</h3>
              <div class="payout-row">
                <span class="payout-label">Approved Claim Amount</span>
                <span class="payout-value">$${data.approvedAmount.toLocaleString()}</span>
              </div>
              <div class="payout-row">
                <span class="payout-label">Your Earnings Tier</span>
                <span class="payout-value">${data.earningsPercent}%</span>
              </div>
              <div class="payout-row">
                <span class="payout-label">Platform Processing Fee</span>
                <span class="payout-value">-$${(data.approvedAmount - data.hostPayout).toLocaleString()}</span>
              </div>
              <div class="payout-row payout-total">
                <span class="payout-label">Net Payout to You</span>
                <span class="payout-value">$${data.hostPayout.toLocaleString()}</span>
              </div>
            </div>

            <div class="info-box">
              <div class="info-title">📅 Payment Timeline</div>
              <div class="info-text">
                Your payout will be processed and sent to your account by <strong>${new Date(data.expectedPayoutDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</strong>. You'll receive a confirmation email once the transfer is complete.
              </div>
            </div>

            ${data.reviewNotes ? `
              <div class="review-notes">
                <div class="review-notes-title">💬 Fleet Team Notes</div>
                <div class="review-notes-text">"${data.reviewNotes}"</div>
              </div>
            ` : ''}

            <div class="next-steps">
              <h3>What Happens Next?</h3>
              <ol>
                <li>Our insurance team will file the claim with the carrier</li>
                <li>Payment will be processed to your registered bank account</li>
                <li>You'll receive a payout confirmation email</li>
                <li>Your vehicle can be reactivated once repairs are verified</li>
                <li>Track your claim status in your host dashboard</li>
              </ol>
            </div>

            <p style="color: #374151; margin-bottom: 16px;">
              <strong>Claim Details:</strong><br>
              Claim ID: #${data.claimId.slice(0, 8).toUpperCase()}<br>
              Booking Code: ${data.bookingCode}<br>
              Vehicle: ${data.carDetails}
            </p>

            <div style="text-align: center;">
              <a href="${data.claimUrl}" class="btn">View Full Claim Details</a>
            </div>

            <p style="color: #6b7280; font-size: 13px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <strong>Need help?</strong> Contact us at <a href="mailto:info@itwhip.com" style="color: #3b82f6;">info@itwhip.com</a> or call (602) 555-0100
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
✅ CLAIM APPROVED - YOUR CLAIM HAS BEEN APPROVED

Hi ${data.hostName},

Great news! Your insurance claim has been reviewed and approved by our fleet team.

YOUR PAYOUT: $${data.hostPayout.toLocaleString()}

PAYOUT BREAKDOWN:
Approved Claim Amount: $${data.approvedAmount.toLocaleString()}
Your Earnings Tier: ${data.earningsPercent}%
Platform Processing Fee: -$${(data.approvedAmount - data.hostPayout).toLocaleString()}
──────────────────────────
Net Payout to You: $${data.hostPayout.toLocaleString()}

📅 PAYMENT TIMELINE
Your payout will be processed and sent to your account by ${new Date(data.expectedPayoutDate).toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}. You'll receive a confirmation email once the transfer is complete.

${data.reviewNotes ? `
💬 FLEET TEAM NOTES
"${data.reviewNotes}"
` : ''}

WHAT HAPPENS NEXT?
1. Our insurance team will file the claim with the carrier
2. Payment will be processed to your registered bank account
3. You'll receive a payout confirmation email
4. Your vehicle can be reactivated once repairs are verified
5. Track your claim status in your host dashboard

CLAIM DETAILS:
Claim ID: #${data.claimId.slice(0, 8).toUpperCase()}
Booking Code: ${data.bookingCode}
Vehicle: ${data.carDetails}

View full claim details: ${data.claimUrl}

Need help? Contact us at info@itwhip.com or call (602) 555-0100

© 2024 ItWhip. All rights reserved.
Phoenix, Arizona
itwhip.com
  `

  return { subject, html, text }
}