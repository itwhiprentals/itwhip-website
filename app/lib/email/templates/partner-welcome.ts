// app/lib/email/templates/partner-welcome.ts
// Welcome email for approved Fleet Partners with password reset link

import { EmailTemplate } from '../types'
import { emailFooterHtml, emailFooterText } from './email-footer'

export interface PartnerWelcomeData {
  companyName: string
  contactName: string
  contactEmail: string
  resetPasswordUrl: string
  resetTokenExpiresIn: string // e.g., "24 hours"
  commissionRate: number // e.g., 15 for 15%
  tier: 'Standard' | 'Gold' | 'Platinum' | 'Diamond'
  dashboardUrl: string
  fleetSize?: string
  supportEmail?: string
}

export function getPartnerWelcomeTemplate(data: PartnerWelcomeData): EmailTemplate {
  const subject = `🎉 Welcome to ItWhip Fleet Partners - ${data.companyName} Approved!`

  const tierColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    Standard: { bg: '#f0f9ff', border: '#60a5fa', text: '#1e40af', icon: '🔵' },
    Gold: { bg: '#fef3c7', border: '#fbbf24', text: '#92400e', icon: '🥇' },
    Platinum: { bg: '#f0f9ff', border: '#a5b4fc', text: '#3730a3', icon: '💎' },
    Diamond: { bg: '#faf5ff', border: '#c084fc', text: '#6b21a8', icon: '👑' }
  }

  const tierColor = tierColors[data.tier] || tierColors.Standard

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
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
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
          .welcome-box {
            background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            border: 2px solid #22c55e;
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
            text-align: center;
          }
          .welcome-icon {
            font-size: 48px;
            margin-bottom: 12px;
          }
          .welcome-title {
            font-size: 22px;
            font-weight: 700;
            color: #14532d;
            margin-bottom: 8px;
          }
          .welcome-message {
            font-size: 14px;
            color: #166534;
          }
          .action-box {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
            text-align: center;
          }
          .action-title {
            font-size: 18px;
            font-weight: 700;
            color: #78350f;
            margin-bottom: 12px;
          }
          .action-desc {
            font-size: 14px;
            color: #92400e;
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
          .button-secondary {
            display: inline-block;
            padding: 12px 32px;
            background: #1f2937;
            color: white;
            text-decoration: none;
            font-weight: 600;
            border-radius: 8px;
            font-size: 14px;
          }
          .expiry-notice {
            font-size: 12px;
            color: #dc2626;
            margin-top: 16px;
            font-weight: 500;
          }
          .tier-box {
            background: ${tierColor.bg};
            border: 2px solid ${tierColor.border};
            padding: 20px;
            margin: 24px 0;
            border-radius: 8px;
            text-align: center;
          }
          .tier-icon {
            font-size: 32px;
            margin-bottom: 8px;
          }
          .tier-name {
            font-size: 14px;
            color: ${tierColor.text};
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .tier-rate {
            font-size: 36px;
            font-weight: 700;
            color: ${tierColor.text};
            margin: 8px 0;
          }
          .tier-desc {
            font-size: 14px;
            color: ${tierColor.text};
          }
          .benefits-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
          }
          .benefits-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 16px 0;
            color: #111827;
          }
          .benefit-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 12px;
          }
          .benefit-icon {
            color: #22c55e;
            margin-right: 12px;
            font-size: 18px;
          }
          .benefit-text {
            font-size: 14px;
            color: #374151;
          }
          .steps-box {
            background: #fff;
            border: 1px solid #e5e7eb;
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
          }
          .steps-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 20px 0;
            color: #111827;
          }
          .step-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 16px;
          }
          .step-number {
            background: #f97316;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            margin-right: 12px;
            flex-shrink: 0;
          }
          .step-content h4 {
            font-size: 14px;
            font-weight: 600;
            color: #111827;
            margin: 0 0 4px 0;
          }
          .step-content p {
            font-size: 13px;
            color: #6b7280;
            margin: 0;
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
            .button { padding: 14px 32px; display: block; }
            .tier-rate { font-size: 28px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">✓ Application Approved</div>
            <h1>Welcome to Fleet Partners!</h1>
            <p>${data.companyName} is now part of the ItWhip network</p>
          </div>

          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Hello ${data.contactName},</p>

            <p style="color: #4b5563; margin-bottom: 24px;">
              Congratulations! Your Fleet Partner application has been approved. We're thrilled to have
              <strong>${data.companyName}</strong> join the ItWhip partner network.
            </p>

            <div class="welcome-box">
              <div class="welcome-icon">🎉</div>
              <div class="welcome-title">You're Approved!</div>
              <div class="welcome-message">
                Your fleet is ready to start earning on ItWhip
              </div>
            </div>

            <div class="action-box">
              <div class="action-title">⚡ Set Up Your Password</div>
              <div class="action-desc">
                Click the button below to create your secure password and access your Partner Dashboard.
              </div>
              <a href="${data.resetPasswordUrl}" class="button">
                Create Password
              </a>
              <div class="expiry-notice">
                ⏰ This link expires in ${data.resetTokenExpiresIn}
              </div>
            </div>

            <div class="tier-box">
              <div class="tier-icon">${tierColor.icon}</div>
              <div class="tier-name">${data.tier} Tier Partner</div>
              <div class="tier-rate">${100 - data.commissionRate}%</div>
              <div class="tier-desc">
                You keep ${100 - data.commissionRate}% of every booking<br>
                Platform fee: ${data.commissionRate}%
              </div>
            </div>

            <div class="benefits-box">
              <h3 class="benefits-title">Partner Benefits</h3>
              <div class="benefit-item">
                <span class="benefit-icon">✅</span>
                <span class="benefit-text">Priority listing placement for your vehicles</span>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon">✅</span>
                <span class="benefit-text">Dedicated Partner Dashboard with analytics</span>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon">✅</span>
                <span class="benefit-text">Custom discount codes for marketing</span>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon">✅</span>
                <span class="benefit-text">Weekly payout schedule</span>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon">✅</span>
                <span class="benefit-text">Auto-approve bookings (no manual review needed)</span>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon">✅</span>
                <span class="benefit-text">Custom partner landing page at itwhip.com/rideshare/your-slug</span>
              </div>
            </div>

            <div class="steps-box">
              <h3 class="steps-title">Getting Started</h3>

              <div class="step-item">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h4>Set Your Password</h4>
                  <p>Click the button above to create your account password</p>
                </div>
              </div>

              <div class="step-item">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h4>Complete Your Profile</h4>
                  <p>Add your company logo, bio, and support contact info</p>
                </div>
              </div>

              <div class="step-item">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h4>Add Your Vehicles</h4>
                  <p>List your fleet with photos, pricing, and availability</p>
                </div>
              </div>

              <div class="step-item">
                <div class="step-number">4</div>
                <div class="step-content">
                  <h4>Start Earning</h4>
                  <p>Vehicles go live immediately - start accepting bookings!</p>
                </div>
              </div>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${data.dashboardUrl}" class="button-secondary">
                View Partner Dashboard
              </a>
              <p style="font-size: 12px; color: #6b7280; margin-top: 12px;">
                (You'll need to set your password first)
              </p>
            </div>

            <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 24px 0 0 0;">
              Need help getting started? Our partner success team is here for you:<br>
              <a href="mailto:${data.supportEmail || 'info@itwhip.com'}" style="color: #f97316; font-weight: 600;">
                ${data.supportEmail || 'info@itwhip.com'}
              </a><br>
              <span style="font-size: 13px;">Response time: Usually within 2 hours during business hours</span>
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
🎉 Welcome to ItWhip Fleet Partners - ${data.companyName} Approved!

Hello ${data.contactName},

Congratulations! Your Fleet Partner application has been approved. We're thrilled to have ${data.companyName} join the ItWhip partner network.

YOU'RE APPROVED!
Your fleet is ready to start earning on ItWhip

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ SET UP YOUR PASSWORD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Click the link below to create your secure password:
${data.resetPasswordUrl}

⏰ This link expires in ${data.resetTokenExpiresIn}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR PARTNERSHIP TIER: ${data.tier}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commission Rate: You keep ${100 - data.commissionRate}% of every booking
Platform Fee: ${data.commissionRate}%

PARTNER BENEFITS:
✅ Priority listing placement for your vehicles
✅ Dedicated Partner Dashboard with analytics
✅ Custom discount codes for marketing
✅ Weekly payout schedule
✅ Auto-approve bookings (no manual review needed)
✅ Custom partner landing page

GETTING STARTED:
1. Set Your Password - Click the link above to create your account password
2. Complete Your Profile - Add your company logo, bio, and support contact info
3. Add Your Vehicles - List your fleet with photos, pricing, and availability
4. Start Earning - Vehicles go live immediately - start accepting bookings!

Partner Dashboard: ${data.dashboardUrl}
(You'll need to set your password first)

Need help getting started?
Contact our partner success team: ${data.supportEmail || 'info@itwhip.com'}
Response time: Usually within 2 hours during business hours

${emailFooterText({
  recipientEmail: data.contactEmail,
  includeAppButtons: true,
  includeSocialLinks: true,
  footerType: 'full'
})}
  `

  return { subject, html, text }
}
