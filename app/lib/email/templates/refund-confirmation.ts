// app/lib/email/templates/refund-confirmation.ts

import { RefundConfirmationData, EmailTemplate } from '../types'
import { escapeHtml } from '../sanitize'
import { emailFooterHtml, emailFooterText } from './email-footer'

/**
 * Email template for refund confirmation notification.
 * Sent when a guest receives a full or partial refund.
 */
export function getRefundConfirmationTemplate(data: RefundConfirmationData): EmailTemplate {
  const isFullRefund = data.refundType === 'full'
  const subject = isFullRefund
    ? `Full Refund Processed - ${data.carMake} ${data.carModel}`
    : `Partial Refund Processed - ${data.carMake} ${data.carModel}`

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
            background: linear-gradient(135deg, ${isFullRefund ? '#059669 0%, #047857' : '#2563eb 0%, #1d4ed8'} 100%);
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
            background: ${isFullRefund ? '#ecfdf5' : '#eff6ff'};
            border: 2px solid ${isFullRefund ? '#10b981' : '#3b82f6'};
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
            color: ${isFullRefund ? '#065f46' : '#1e40af'};
            margin-bottom: 8px;
          }
          .status-message {
            font-size: 14px;
            color: ${isFullRefund ? '#047857' : '#2563eb'};
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
            color: ${isFullRefund ? '#059669' : '#2563eb'};
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
            <h1>Refund Processed</h1>
            <p>Your ${isFullRefund ? 'full' : 'partial'} refund has been submitted</p>
          </div>

          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Dear ${escapeHtml(data.guestName)},</p>

            <p style="color: #4b5563; margin-bottom: 24px;">
              ${isFullRefund
                ? `A full refund has been processed for your <strong>${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)}</strong> booking.`
                : `A partial refund has been processed for your <strong>${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)}</strong> booking.`
              }
            </p>

            <div class="status-box">
              <div class="status-icon">${isFullRefund ? '&#9989;' : '&#128176;'}</div>
              <div class="status-title">$${data.refundAmount} Refunded</div>
              <div class="status-message">
                ${isFullRefund ? 'Full refund submitted to your payment method' : 'Partial refund submitted to your payment method'}
              </div>
            </div>

            <div class="details-box">
              <h3>Refund Details</h3>
              <div class="detail-row">
                <span class="detail-label">Booking Code</span>
                <span class="detail-value">${data.bookingCode}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Vehicle</span>
                <span class="detail-value">${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Trip Dates</span>
                <span class="detail-value">${escapeHtml(data.tripDates)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Original Total</span>
                <span class="detail-value">$${data.originalTotal}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Refund Amount</span>
                <span class="detail-value detail-total">$${data.refundAmount}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Reason</span>
                <span class="detail-value">${escapeHtml(data.refundReason)}</span>
              </div>
            </div>

            <div class="info-box">
              <p>
                <strong>Note:</strong> Refunds typically appear on your statement within 5-10 business days,
                depending on your bank. The refund has already been submitted to your payment provider.
              </p>
            </div>

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
Refund Processed

Dear ${escapeHtml(data.guestName)},

A ${isFullRefund ? 'full' : 'partial'} refund has been processed for your ${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)} booking.

REFUND DETAILS:
- Booking Code: ${data.bookingCode}
- Vehicle: ${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)}
- Trip Dates: ${escapeHtml(data.tripDates)}
- Original Total: $${data.originalTotal}
- Refund Amount: $${data.refundAmount}
- Reason: ${escapeHtml(data.refundReason)}

Refunds typically appear on your statement within 5-10 business days.

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
