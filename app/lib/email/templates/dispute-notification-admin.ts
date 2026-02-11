// app/lib/email/templates/dispute-notification-admin.ts

import { DisputeNotificationAdminData, EmailTemplate } from '../types'
import { escapeHtml } from '../sanitize'

export function getDisputeNotificationAdminTemplate(data: DisputeNotificationAdminData): EmailTemplate {
  const subject = `Dispute Filed - ${data.disputeType} - Booking ${data.bookingCode}`

  const priorityColors: Record<string, { bg: string; label: string }> = {
    high: { bg: '#ef4444', label: 'HIGH' },
    medium: { bg: '#f59e0b', label: 'MEDIUM' },
    low: { bg: '#3b82f6', label: 'LOW' },
  }

  const p = priorityColors[data.priority] || priorityColors.medium

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.6;color:#111827;background:#f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${p.bg} 0%,#991b1b 100%);color:#fff;padding:30px 20px;text-align:center;">
              <span style="display:inline-block;background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:4px;font-size:12px;font-weight:600;letter-spacing:1px;margin-bottom:8px;">${p.label} PRIORITY</span>
              <h1 style="font-size:22px;font-weight:700;margin:8px 0 0;">Guest Dispute Filed</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:20px;">
                <tr><td style="padding:6px 12px;font-size:13px;color:#6b7280;">Booking</td><td style="padding:6px 12px;font-size:14px;font-weight:600;">${escapeHtml(data.bookingCode)}</td></tr>
                <tr><td style="padding:6px 12px;font-size:13px;color:#6b7280;">Guest</td><td style="padding:6px 12px;font-size:14px;">${escapeHtml(data.guestName)} (${escapeHtml(data.guestEmail)})</td></tr>
                <tr><td style="padding:6px 12px;font-size:13px;color:#6b7280;">Host</td><td style="padding:6px 12px;font-size:14px;">${escapeHtml(data.hostName)}</td></tr>
                <tr><td style="padding:6px 12px;font-size:13px;color:#6b7280;">Category</td><td style="padding:6px 12px;font-size:14px;font-weight:600;">${escapeHtml(data.disputeType)}</td></tr>
              </table>

              <h3 style="font-size:15px;font-weight:600;margin:0 0 8px;">Description</h3>
              <p style="font-size:14px;color:#374151;background:#f9fafb;padding:12px;border-radius:6px;border-left:3px solid ${p.bg};margin:0 0 24px;">${escapeHtml(data.description)}</p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:16px 0;">
                    <a href="${data.actionUrl}" style="display:inline-block;background:#111827;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">Review Dispute</a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:16px;">This dispute requires a response within 2 hours per SLA.</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  const text = `DISPUTE FILED - ${p.label} PRIORITY

Booking: ${data.bookingCode}
Guest: ${data.guestName} (${data.guestEmail})
Host: ${data.hostName}
Category: ${data.disputeType}

Description:
${data.description}

Review this dispute: ${data.actionUrl}

This dispute requires a response within 2 hours per SLA.`

  return { subject, html, text }
}
