// app/lib/email/templates/host-booking-cancelled.ts

import { HostBookingCancelledData, EmailTemplate } from '../types'
import { escapeHtml } from '../sanitize'
import { emailFooterHtml, emailFooterText } from './email-footer'

/**
 * Email template for notifying hosts when a booking is cancelled
 * Sent when guest, fleet, or system cancels a booking for the host's vehicle
 */
export function getHostBookingCancelledTemplate(data: HostBookingCancelledData): EmailTemplate {
  const cancelledByLabel = data.cancelledBy === 'guest' ? 'the guest'
    : data.cancelledBy === 'fleet' ? 'Fleet Management'
    : 'the system'

  const subject = `Booking Cancelled - ${data.carMake} ${data.carModel} (${data.bookingCode})`

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
          .info-box {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 20px 0;
            font-size: 14px;
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
          .availability-box {
            background: #f0fdf4;
            border: 1px solid #86efac;
            padding: 16px;
            margin: 20px 0;
            text-align: center;
          }
          .button {
            display: block;
            width: 100%;
            padding: 14px;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            text-align: center;
            font-weight: 500;
            margin: 24px 0;
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
            <div class="status-badge">Booking Cancelled</div>
            <h1>A Booking Was Cancelled</h1>
            <p>Your vehicle is now available for these dates</p>
          </div>

          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Hi ${escapeHtml(data.hostName)},</p>

            <div class="info-box">
              A booking for your <strong>${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)}</strong>
              has been cancelled by ${cancelledByLabel}.
              ${data.cancellationReason ? `<br><br><strong>Reason:</strong> ${escapeHtml(data.cancellationReason)}` : ''}
            </div>

            <div class="details-box">
              <h3 style="margin: 0 0 16px 0; font-size: 18px;">Cancelled Booking Details</h3>
              <div class="detail-row">
                <span>Booking Code</span>
                <strong>${escapeHtml(data.bookingCode)}</strong>
              </div>
              <div class="detail-row">
                <span>Guest</span>
                <strong>${escapeHtml(data.guestName)}</strong>
              </div>
              <div class="detail-row">
                <span>Vehicle</span>
                <strong>${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)}</strong>
              </div>
              <div class="detail-row">
                <span>Trip Dates</span>
                <strong>${escapeHtml(data.startDate)} - ${escapeHtml(data.endDate)}</strong>
              </div>
              <div class="detail-row">
                <span>Booking Amount</span>
                <strong>$${escapeHtml(data.totalAmount)}</strong>
              </div>
            </div>

            <div class="availability-box">
              <p style="font-size: 14px; color: #166534;">
                <strong>Your vehicle is now available</strong> for ${escapeHtml(data.startDate)} - ${escapeHtml(data.endDate)}.
                New guests can book these dates.
              </p>
            </div>

            <a href="https://itwhip.com/partner/bookings" class="button">View Your Bookings</a>

            <p style="text-align: center; margin-top: 24px; font-size: 14px; color: #6b7280;">
              Questions? Contact info@itwhip.com
            </p>
          </div>

          ${emailFooterHtml({ recipientEmail: data.hostEmail })}
        </div>
      </body>
    </html>
  `

  const text = `
Booking Cancelled - ${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)} (${escapeHtml(data.bookingCode)})

Hi ${escapeHtml(data.hostName)},

A booking for your ${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)} has been cancelled by ${cancelledByLabel}.
${data.cancellationReason ? `Reason: ${escapeHtml(data.cancellationReason)}` : ''}

CANCELLED BOOKING DETAILS:
- Booking Code: ${escapeHtml(data.bookingCode)}
- Guest: ${escapeHtml(data.guestName)}
- Vehicle: ${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)}
- Trip Dates: ${escapeHtml(data.startDate)} - ${escapeHtml(data.endDate)}
- Booking Amount: $${escapeHtml(data.totalAmount)}

Your vehicle is now available for ${escapeHtml(data.startDate)} - ${escapeHtml(data.endDate)}.

View your bookings: https://itwhip.com/partner/bookings

Questions? Contact info@itwhip.com

${emailFooterText({ recipientEmail: data.hostEmail })}
  `

  return { subject, html, text }
}
