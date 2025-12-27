// app/lib/email/templates/partner-reactivated.ts
// Email notification when a Fleet Partner account is reactivated

import { EmailTemplate } from '../types'
import { emailFooterHtml, emailFooterText } from './email-footer'

export interface PartnerReactivatedData {
  companyName: string
  contactName: string
  contactEmail: string
  dashboardUrl: string
  supportEmail?: string
}

export function getPartnerReactivatedTemplate(data: PartnerReactivatedData): EmailTemplate {
  const subject = `Great News: Your ItWhip Partner Account Has Been Reactivated!`

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
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 1px;
            margin-bottom: 16px;
            text-transform: uppercase;
          }
          .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin: 0 0 8px 0;
          }
          .header p {
            font-size: 14px;
            margin: 0;
            opacity: 0.95;
          }
          .content {
            padding: 30px 20px;
          }
          .success-box {
            background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            border: 2px solid #22c55e;
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
            text-align: center;
          }
          .success-icon {
            font-size: 48px;
            margin-bottom: 12px;
          }
          .success-title {
            font-size: 22px;
            font-weight: 700;
            color: #14532d;
            margin-bottom: 8px;
          }
          .success-message {
            font-size: 14px;
            color: #166534;
          }
          .action-box {
            background: #f0f9ff;
            border: 2px solid #3b82f6;
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
            text-align: center;
          }
          .action-title {
            font-size: 18px;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 12px;
          }
          .action-desc {
            font-size: 14px;
            color: #1e3a8a;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            padding: 16px 48px;
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            color: white;
            text-decoration: none;
            font-weight: 600;
            border-radius: 8px;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35);
          }
          .status-box {
            background: #fff;
            border: 1px solid #e5e7eb;
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
          }
          .status-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 16px 0;
            color: #111827;
          }
          .status-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 12px;
          }
          .status-icon {
            color: #22c55e;
            margin-right: 12px;
            font-size: 18px;
          }
          .status-text {
            font-size: 14px;
            color: #374151;
          }
          .note-box {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            padding: 20px;
            margin: 24px 0;
            border-radius: 8px;
          }
          .note-title {
            font-size: 14px;
            font-weight: 700;
            color: #92400e;
            margin-bottom: 8px;
          }
          .note-text {
            font-size: 13px;
            color: #78350f;
          }
          .footer {
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
          }
          .footer a {
            color: #f97316;
            text-decoration: none;
          }
          @media only screen and (max-width: 600px) {
            .header { padding: 30px 16px; }
            .header h1 { font-size: 24px; }
            .content { padding: 20px 16px; }
            .button { padding: 14px 32px; display: block; text-align: center; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">✓ Account Reactivated</div>
            <h1>Welcome Back!</h1>
            <p>${data.companyName} is back on ItWhip</p>
          </div>

          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Hello ${data.contactName},</p>

            <p style="color: #4b5563; margin-bottom: 24px;">
              Great news! Your Fleet Partner account for <strong>${data.companyName}</strong>
              has been reactivated. Your partner page is now visible on ItWhip again.
            </p>

            <div class="success-box">
              <div class="success-icon">🎉</div>
              <div class="success-title">Account Reactivated!</div>
              <div class="success-message">
                Your partner account is now active and ready to accept bookings
              </div>
            </div>

            <div class="status-box">
              <h3 class="status-title">Your Account Status</h3>
              <div class="status-item">
                <span class="status-icon">✅</span>
                <span class="status-text">Partner account is active</span>
              </div>
              <div class="status-item">
                <span class="status-icon">✅</span>
                <span class="status-text">Partner page is visible to customers</span>
              </div>
              <div class="status-item">
                <span class="status-icon">✅</span>
                <span class="status-text">You can receive new bookings</span>
              </div>
              <div class="status-item">
                <span class="status-icon">✅</span>
                <span class="status-text">Dashboard access restored</span>
              </div>
            </div>

            <div class="note-box">
              <div class="note-title">Important Note About Vehicles</div>
              <div class="note-text">
                Your individual vehicle listings may need to be reactivated manually from your
                dashboard. Please review your fleet and ensure all vehicles you want to list
                are set to active.
              </div>
            </div>

            <div class="action-box">
              <div class="action-title">Ready to Get Started?</div>
              <div class="action-desc">
                Visit your Partner Dashboard to review your fleet and start accepting bookings.
              </div>
              <a href="${data.dashboardUrl}" class="button">
                Go to Dashboard
              </a>
            </div>

            <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 24px 0 0 0;">
              Need assistance? Contact our partner support team:<br>
              <a href="mailto:${data.supportEmail || 'info@itwhip.com'}" style="color: #f97316; font-weight: 600;">
                ${data.supportEmail || 'info@itwhip.com'}
              </a>
            </p>
          </div>

          <!-- Email Footer -->
            ${emailFooterHtml({
              recipientEmail: data.contactEmail,
              includeAppButtons: true,
              includeSocialLinks: true,
              footerType: 'full'
            })}
        </div>
      </body>
    </html>
  `

  const text = `
Great News: Your ItWhip Partner Account Has Been Reactivated!

Hello ${data.contactName},

Great news! Your Fleet Partner account for ${data.companyName} has been reactivated. Your partner page is now visible on ItWhip again.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 ACCOUNT REACTIVATED!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your partner account is now active and ready to accept bookings.

YOUR ACCOUNT STATUS:
✅ Partner account is active
✅ Partner page is visible to customers
✅ You can receive new bookings
✅ Dashboard access restored

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT NOTE ABOUT VEHICLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your individual vehicle listings may need to be reactivated manually from your dashboard. Please review your fleet and ensure all vehicles you want to list are set to active.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
READY TO GET STARTED?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Visit your Partner Dashboard: ${data.dashboardUrl}

Need assistance? Contact our partner support team:
${data.supportEmail || 'info@itwhip.com'}

${emailFooterText({
  recipientEmail: data.contactEmail,
  includeAppButtons: true,
  includeSocialLinks: true,
  footerType: 'full'
})}
  `

  return { subject, html, text }
}
