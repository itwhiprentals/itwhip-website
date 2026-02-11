// app/lib/email/templates/deposit-released.ts

import { DepositReleasedData, EmailTemplate } from '../types'
import { escapeHtml } from '../sanitize'
import { emailFooterHtml, emailFooterText } from './email-footer'

/**
 * Email template for security deposit release notification
 * Sent when a guest's deposit is automatically or manually released after trip completion.
 */
export function getDepositReleasedTemplate(data: DepositReleasedData): EmailTemplate {
  const subject = `Security Deposit Released - ${data.carMake} ${data.carModel}`

  const cardAmount = parseFloat(data.cardRefundAmount)
  const walletAmount = parseFloat(data.walletReturnAmount)

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
          .content {
            padding: 30px 20px;
          }
          .status-box {
            background: #ecfdf5;
            border: 2px solid #10b981;
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
            text-align: center;
          }
          .status-icon {
            font-size: 48px;
            margin-bottom: 12px;
          }
          .status-title {
            font-size: 20px;
            font-weight: 700;
            color: #065f46;
            margin-bottom: 8px;
          }
          .status-message {
            font-size: 14px;
            color: #047857;
          }
          .details-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 20px;
            margin: 20px 0;
            border-radius: 6px;
          }
          .details-box h3 {
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 16px 0;
            color: #111827;
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
          .detail-label {
            color: #6b7280;
          }
          .detail-value {
            color: #111827;
            font-weight: 500;
          }
          .detail-total {
            color: #059669;
            font-weight: 700;
            font-size: 16px;
          }
          .info-box {
            background: #eff6ff;
            border: 1px solid #93c5fd;
            padding: 16px;
            margin: 24px 0;
            border-radius: 6px;
          }
          .info-box p {
            font-size: 14px;
            color: #1e40af;
            margin: 0;
          }
          @media only screen and (max-width: 600px) {
            .header { padding: 30px 16px; }
            .header h1 { font-size: 24px; }
            .content { padding: 20px 16px; }
            .detail-row { font-size: 13px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Deposit Released</h1>
            <p>Your security deposit has been returned</p>
          </div>

          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Dear ${escapeHtml(data.guestName)},</p>

            <p style="color: #4b5563; margin-bottom: 24px;">
              Great news! Your security deposit for the <strong>${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)}</strong>
              rental has been released. Here are the details:
            </p>

            <div class="status-box">
              <div class="status-icon">&#9989;</div>
              <div class="status-title">$${data.depositAmount} Released</div>
              <div class="status-message">
                Your deposit has been fully returned
              </div>
            </div>

            <div class="details-box">
              <h3>Release Details</h3>
              <div class="detail-row">
                <span class="detail-label">Booking Code</span>
                <span class="detail-value">${data.bookingCode}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Vehicle</span>
                <span class="detail-value">${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Trip Completed</span>
                <span class="detail-value">${data.tripEndDate}</span>
              </div>
              ${cardAmount > 0 ? `
              <div class="detail-row">
                <span class="detail-label">Refund to Card</span>
                <span class="detail-value detail-total">$${data.cardRefundAmount}</span>
              </div>
              ` : ''}
              ${walletAmount > 0 ? `
              <div class="detail-row">
                <span class="detail-label">Returned to Deposit Wallet</span>
                <span class="detail-value detail-total">$${data.walletReturnAmount}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">Total Released</span>
                <span class="detail-value detail-total">$${data.depositAmount}</span>
              </div>
            </div>

            ${cardAmount > 0 ? `
            <div class="info-box">
              <p>
                <strong>Note:</strong> Card refunds typically appear on your statement within 5-10 business days,
                depending on your bank. The refund has already been submitted to Stripe.
              </p>
            </div>
            ` : ''}

            <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 24px 0 0 0;">
              Questions? Contact
              <a href="mailto:info@itwhip.com" style="color: #059669;">info@itwhip.com</a>
            </p>
          </div>

          ${emailFooterHtml({
            recipientEmail: data.to,
            includeAppButtons: true,
            includeSocialLinks: true,
            footerType: 'full'
          })}
        </div>
      </body>
    </html>
  `

  const text = `
Security Deposit Released

Dear ${escapeHtml(data.guestName)},

Great news! Your security deposit for the ${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)} rental has been released.

RELEASE DETAILS:
- Booking Code: ${data.bookingCode}
- Vehicle: ${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)}
- Trip Completed: ${data.tripEndDate}
${cardAmount > 0 ? `- Refund to Card: $${data.cardRefundAmount}` : ''}
${walletAmount > 0 ? `- Returned to Deposit Wallet: $${data.walletReturnAmount}` : ''}
- Total Released: $${data.depositAmount}

${cardAmount > 0 ? 'Card refunds typically appear on your statement within 5-10 business days.\n' : ''}
Questions? Contact info@itwhip.com

${emailFooterText({
  recipientEmail: data.to,
  includeAppButtons: true,
  includeSocialLinks: true,
  footerType: 'full'
})}
  `

  return { subject, html, text }
}
