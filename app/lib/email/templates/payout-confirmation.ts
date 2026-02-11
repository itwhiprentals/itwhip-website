// app/lib/email/templates/payout-confirmation.ts

import { PayoutConfirmationData, EmailTemplate } from '../types'
import { escapeHtml } from '../sanitize'
import { emailFooterHtml, emailFooterText } from './email-footer'

/**
 * Email template for payout confirmation
 * Sent to host when their payout has been processed
 */
export function getPayoutConfirmationTemplate(data: PayoutConfirmationData): EmailTemplate {
  const subject = `Payout Processed - $${escapeHtml(data.payoutAmount)}`

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
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
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
            font-weight: 400;
            margin: 0 0 8px 0;
          }
          .header p {
            font-size: 14px;
            margin: 0;
            opacity: 0.9;
          }
          .amount-display {
            font-size: 36px;
            font-weight: 700;
            margin: 12px 0 0;
          }
          .content {
            padding: 30px 20px;
          }
          .details-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 20px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-row.total {
            font-weight: 600;
            font-size: 16px;
            border-top: 2px solid #d1d5db;
            padding-top: 12px;
            margin-top: 4px;
          }
          .arrival-box {
            background: #f0fdf4;
            border: 1px solid #86efac;
            padding: 16px;
            margin: 20px 0;
            text-align: center;
          }
          .arrival-box p {
            font-size: 14px;
            color: #166534;
          }
          .button {
            display: block;
            width: 100%;
            padding: 14px;
            background: #059669;
            color: white;
            text-decoration: none;
            text-align: center;
            font-weight: 500;
            margin: 24px 0;
          }
          @media only screen and (max-width: 600px) {
            .header { padding: 30px 16px; }
            .header h1 { font-size: 24px; }
            .amount-display { font-size: 28px; }
            .content { padding: 20px 16px; }
            .detail-row { font-size: 13px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="status-badge">Payout Processed</div>
            <h1>Your Payout Is On Its Way</h1>
            <div class="amount-display">$${escapeHtml(data.payoutAmount)}</div>
          </div>

          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Hi ${escapeHtml(data.hostName)},</p>

            <p style="font-size: 14px; color: #4b5563; margin-bottom: 20px;">
              Your payout has been processed and is on its way to your ${escapeHtml(data.payoutMethod)} account.
            </p>

            <div class="details-box">
              <h3 style="margin: 0 0 16px 0; font-size: 18px;">Payout Breakdown</h3>
              <div class="detail-row">
                <span>Gross Earnings (${data.bookingCount} booking${data.bookingCount !== 1 ? 's' : ''})</span>
                <strong>$${escapeHtml(data.grossEarnings)}</strong>
              </div>
              <div class="detail-row">
                <span>Platform Fee</span>
                <span style="color: #dc2626;">-$${escapeHtml(data.platformFee)}</span>
              </div>
              <div class="detail-row">
                <span>Processing Fee</span>
                <span style="color: #dc2626;">-$${escapeHtml(data.processingFee)}</span>
              </div>
              <div class="detail-row total">
                <span>Net Payout</span>
                <strong style="color: #059669;">$${escapeHtml(data.payoutAmount)}</strong>
              </div>
            </div>

            <div class="arrival-box">
              <p><strong>Estimated Arrival:</strong> ${escapeHtml(data.estimatedArrival)}</p>
              <p style="font-size: 12px; color: #4b5563; margin-top: 8px;">
                Payout ID: ${escapeHtml(data.payoutId)}
              </p>
            </div>

            <a href="https://itwhip.com/partner/earnings" class="button">View Earnings Dashboard</a>

            <p style="text-align: center; margin-top: 24px; font-size: 14px; color: #6b7280;">
              Questions about this payout?<br>
              Contact info@itwhip.com
            </p>
          </div>

          ${emailFooterHtml({ recipientEmail: data.hostEmail })}
        </div>
      </body>
    </html>
  `

  const text = `
Payout Processed - $${escapeHtml(data.payoutAmount)}

Hi ${escapeHtml(data.hostName)},

Your payout has been processed and is on its way to your ${escapeHtml(data.payoutMethod)} account.

PAYOUT BREAKDOWN:
- Gross Earnings (${data.bookingCount} booking${data.bookingCount !== 1 ? 's' : ''}): $${escapeHtml(data.grossEarnings)}
- Platform Fee: -$${escapeHtml(data.platformFee)}
- Processing Fee: -$${escapeHtml(data.processingFee)}
- Net Payout: $${escapeHtml(data.payoutAmount)}

Estimated Arrival: ${escapeHtml(data.estimatedArrival)}
Payout ID: ${escapeHtml(data.payoutId)}

View your earnings: https://itwhip.com/partner/earnings

Questions? Contact info@itwhip.com

${emailFooterText({ recipientEmail: data.hostEmail })}
  `

  return { subject, html, text }
}
