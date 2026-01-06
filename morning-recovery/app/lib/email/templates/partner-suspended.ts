// app/lib/email/templates/partner-suspended.ts
// Email notification when a Fleet Partner account is suspended

import { EmailTemplate } from '../types'
import { emailFooterHtml, emailFooterText } from './email-footer'

export interface PartnerSuspendedData {
  companyName: string
  contactName: string
  contactEmail: string
  suspensionReason?: string
  supportEmail?: string
}

export function getPartnerSuspendedTemplate(data: PartnerSuspendedData): EmailTemplate {
  const subject = `Important: Your ItWhip Partner Account Has Been Suspended`

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
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
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
          .alert-box {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 2px solid #dc2626;
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
            text-align: center;
          }
          .alert-icon {
            font-size: 48px;
            margin-bottom: 12px;
          }
          .alert-title {
            font-size: 22px;
            font-weight: 700;
            color: #7f1d1d;
            margin-bottom: 8px;
          }
          .alert-message {
            font-size: 14px;
            color: #991b1b;
          }
          .reason-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
          }
          .reason-title {
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 12px;
          }
          .reason-text {
            font-size: 14px;
            color: #6b7280;
            padding: 12px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
          }
          .info-box {
            background: #eff6ff;
            border: 2px solid #3b82f6;
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
          }
          .info-title {
            font-size: 18px;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 12px;
          }
          .info-text {
            font-size: 14px;
            color: #1e3a8a;
            margin-bottom: 16px;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            text-decoration: none;
            font-weight: 600;
            border-radius: 8px;
            font-size: 14px;
          }
          .next-steps {
            background: #fff;
            border: 1px solid #e5e7eb;
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
          }
          .next-steps-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 16px 0;
            color: #111827;
          }
          .step-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 12px;
          }
          .step-icon {
            color: #f97316;
            margin-right: 12px;
            font-size: 18px;
          }
          .step-text {
            font-size: 14px;
            color: #374151;
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
            .button { padding: 14px 24px; display: block; text-align: center; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">Account Suspended</div>
            <h1>Partner Account Suspended</h1>
            <p>${data.companyName}</p>
          </div>

          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Hello ${data.contactName},</p>

            <p style="color: #4b5563; margin-bottom: 24px;">
              We regret to inform you that your Fleet Partner account for <strong>${data.companyName}</strong>
              has been suspended. Your vehicles and partner page are temporarily hidden from the platform.
            </p>

            <div class="alert-box">
              <div class="alert-icon">⚠️</div>
              <div class="alert-title">Account Suspended</div>
              <div class="alert-message">
                Your partner account and all vehicle listings are currently inactive
              </div>
            </div>

            ${data.suspensionReason ? `
              <div class="reason-box">
                <div class="reason-title">Reason for Suspension:</div>
                <div class="reason-text">${data.suspensionReason}</div>
              </div>
            ` : ''}

            <div class="next-steps">
              <h3 class="next-steps-title">What This Means</h3>
              <div class="step-item">
                <span class="step-icon">❌</span>
                <span class="step-text">Your vehicles are no longer visible on ItWhip</span>
              </div>
              <div class="step-item">
                <span class="step-icon">❌</span>
                <span class="step-text">Your partner page is temporarily hidden</span>
              </div>
              <div class="step-item">
                <span class="step-icon">❌</span>
                <span class="step-text">New bookings cannot be made for your vehicles</span>
              </div>
              <div class="step-item">
                <span class="step-icon">✅</span>
                <span class="step-text">Existing active bookings will be honored</span>
              </div>
              <div class="step-item">
                <span class="step-icon">✅</span>
                <span class="step-text">Pending payouts will still be processed</span>
              </div>
            </div>

            <div class="info-box">
              <div class="info-title">Need to Resolve This?</div>
              <div class="info-text">
                If you believe this was a mistake or would like to discuss reactivation,
                please contact our partner support team. We're here to help resolve any issues.
              </div>
              <a href="mailto:${data.supportEmail || 'info@itwhip.com'}" class="button">
                Contact Support
              </a>
            </div>

            <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 24px 0 0 0;">
              Partner Support Team<br>
              <a href="mailto:${data.supportEmail || 'info@itwhip.com'}" style="color: #f97316; font-weight: 600;">
                ${data.supportEmail || 'info@itwhip.com'}
              </a>
            </p>
          </div>

          <!-- Email Footer -->
            ${emailFooterHtml({
              recipientEmail: data.contactEmail,
              includeAppButtons: false,
              includeSocialLinks: true,
              footerType: 'minimal'
            })}
        </div>
      </body>
    </html>
  `

  const text = `
Important: Your ItWhip Partner Account Has Been Suspended

Hello ${data.contactName},

We regret to inform you that your Fleet Partner account for ${data.companyName} has been suspended. Your vehicles and partner page are temporarily hidden from the platform.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ ACCOUNT SUSPENDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your partner account and all vehicle listings are currently inactive.

${data.suspensionReason ? `REASON FOR SUSPENSION:\n${data.suspensionReason}\n` : ''}

WHAT THIS MEANS:
❌ Your vehicles are no longer visible on ItWhip
❌ Your partner page is temporarily hidden
❌ New bookings cannot be made for your vehicles
✅ Existing active bookings will be honored
✅ Pending payouts will still be processed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEED TO RESOLVE THIS?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If you believe this was a mistake or would like to discuss reactivation, please contact our partner support team.

Contact Support: ${data.supportEmail || 'info@itwhip.com'}

${emailFooterText({
  recipientEmail: data.contactEmail,
  includeAppButtons: false,
  includeSocialLinks: false,
  footerType: 'minimal'
})}
  `

  return { subject, html, text }
}
