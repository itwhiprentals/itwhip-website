// app/lib/email/templates/host-approval.ts

import { EmailTemplate } from '../types'

export interface HostApprovalData {
  hostName: string
  dashboardUrl: string
  commissionRate: number // e.g., 20 for 20%
  permissions: {
    canListCars: boolean
    canSetPricing: boolean
    canMessageGuests: boolean
    canWithdrawFunds: boolean
    instantBookEnabled: boolean
  }
  nextSteps: string[]
  hostId?: string
  supportEmail?: string
  trainingUrl?: string
}

export function getHostApprovalTemplate(data: HostApprovalData): EmailTemplate {
  const subject = '🎉 Welcome to ItWhip - You\'re Approved to Start Hosting!'
  
  const permissionsHtml = `
    <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 20px; margin: 24px 0; border-radius: 6px;">
      <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #14532d;">Your Host Privileges:</h3>
      <div style="display: grid; gap: 8px;">
        ${data.permissions.canListCars ? 
          '<div style="color: #166534; font-size: 14px;">✅ List and manage vehicles</div>' : 
          '<div style="color: #991b1b; font-size: 14px;">⏳ Vehicle listing (coming soon)</div>'}
        ${data.permissions.canSetPricing ? 
          '<div style="color: #166534; font-size: 14px;">✅ Set custom pricing</div>' : 
          '<div style="color: #991b1b; font-size: 14px;">⏳ Custom pricing (after first booking)</div>'}
        ${data.permissions.canMessageGuests ? 
          '<div style="color: #166534; font-size: 14px;">✅ Message guests directly</div>' : 
          '<div style="color: #991b1b; font-size: 14px;">⏳ Guest messaging (after verification)</div>'}
        ${data.permissions.canWithdrawFunds ? 
          '<div style="color: #166534; font-size: 14px;">✅ Withdraw earnings</div>' : 
          '<div style="color: #991b1b; font-size: 14px;">⏳ Withdrawals (after first completed trip)</div>'}
        ${data.permissions.instantBookEnabled ? 
          '<div style="color: #166534; font-size: 14px;">✅ Instant booking enabled</div>' : 
          '<div style="color: #991b1b; font-size: 14px;">⏳ Instant booking (after 5 successful trips)</div>'}
      </div>
    </div>
  `
  
  const nextStepsHtml = data.nextSteps.map((step, index) => `
    <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
      <div style="background: #8b5cf6; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; margin-right: 12px; flex-shrink: 0;">
        ${index + 1}
      </div>
      <div style="flex: 1;">
        <p style="margin: 0; font-size: 14px; color: #111827; line-height: 1.5;">${step}</p>
      </div>
    </div>
  `).join('')
  
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
          .celebration-badge {
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
            font-size: 32px;
            font-weight: 400;
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
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 2px solid #f59e0b;
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
            font-size: 24px;
            font-weight: 700;
            color: #78350f;
            margin-bottom: 8px;
          }
          .welcome-message {
            font-size: 14px;
            color: #92400e;
          }
          .commission-box {
            background: #eff6ff;
            border: 1px solid #93c5fd;
            padding: 20px;
            margin: 24px 0;
            border-radius: 6px;
            text-align: center;
          }
          .commission-rate {
            font-size: 32px;
            font-weight: bold;
            color: #1e3a8a;
            margin: 8px 0;
          }
          .commission-text {
            font-size: 14px;
            color: #1e40af;
          }
          .button {
            display: inline-block;
            padding: 16px 48px;
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
            text-decoration: none;
            font-weight: 600;
            border-radius: 8px;
            margin: 24px 0;
            text-align: center;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);
          }
          .button:hover {
            background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          }
          .steps-container {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 24px;
            margin: 32px 0;
            border-radius: 6px;
          }
          .steps-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 20px 0;
            color: #111827;
          }
          .resources-box {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            padding: 20px;
            margin: 32px 0;
            border-radius: 6px;
          }
          .resources-box h3 {
            font-size: 16px;
            margin: 0 0 12px 0;
            color: #78350f;
          }
          .resources-box ul {
            margin: 0 0 0 20px;
            padding: 0;
            font-size: 14px;
            color: #92400e;
          }
          .resources-box li {
            margin: 8px 0;
          }
          .resources-box a {
            color: #d97706;
            font-weight: 600;
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
            color: #8b5cf6;
            text-decoration: none;
          }
          @media only screen and (max-width: 600px) {
            .header { padding: 30px 16px; }
            .header h1 { font-size: 28px; }
            .content { padding: 20px 16px; }
            .welcome-title { font-size: 20px; }
            .commission-rate { font-size: 28px; }
            .button { 
              display: block; 
              padding: 14px 32px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="celebration-badge">🎊 Approved Host</div>
            <h1>Welcome to ItWhip!</h1>
            <p>You're officially approved to start hosting</p>
          </div>
          
          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Congratulations ${data.hostName}!</p>
            
            <p style="color: #4b5563; margin-bottom: 24px;">
              Great news! Your application has been approved, and you're now part of the ItWhip host community. 
              We're excited to have you on board and can't wait to see you succeed on our platform.
            </p>
            
            <div class="welcome-box">
              <div class="welcome-icon">🚗</div>
              <div class="welcome-title">You're Ready to Start Earning!</div>
              <div class="welcome-message">
                ${data.hostId ? `Your Host ID: #${data.hostId}` : 'Your host account is now active'}
              </div>
            </div>
            
            <div class="commission-box">
              <div style="font-size: 14px; color: #1e40af;">Your Commission Rate</div>
              <div class="commission-rate">${100 - data.commissionRate}% Earnings</div>
              <div class="commission-text">
                You keep ${100 - data.commissionRate}% of every booking<br>
                ItWhip platform fee: ${data.commissionRate}%
              </div>
            </div>
            
            ${permissionsHtml}
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${data.dashboardUrl}" class="button">
                🚀 Go to Your Host Dashboard
              </a>
              <p style="font-size: 12px; color: #6b7280; margin-top: 12px;">
                Start adding your vehicles and setting up your profile
              </p>
            </div>
            
            <div class="steps-container">
              <h2 class="steps-title">🎯 Your First Steps as a Host:</h2>
              ${nextStepsHtml}
            </div>
            
            <div class="resources-box">
              <h3>📚 Helpful Resources:</h3>
              <ul>
                <li><a href="https://itwhip.com/host/guide">Host Success Guide</a> - Best practices for maximizing earnings</li>
                <li><a href="https://itwhip.com/host/pricing">Pricing Calculator</a> - Set competitive rates</li>
                <li><a href="https://itwhip.com/host/safety">Safety Guidelines</a> - Keep yourself and guests protected</li>
                ${data.trainingUrl ? `<li><a href="${data.trainingUrl}">Host Training Videos</a> - Learn from successful hosts</li>` : ''}
                <li><a href="https://itwhip.com/host/community">Host Community Forum</a> - Connect with other hosts</li>
              </ul>
            </div>
            
            <div style="background: #f0f9ff; border: 1px solid #60a5fa; padding: 16px; margin: 32px 0; border-radius: 6px; text-align: center;">
              <p style="font-size: 14px; color: #1e3a8a; margin: 0;">
                <strong>💡 Pro Tip:</strong> Hosts who list their first vehicle within 48 hours 
                typically get their first booking 3x faster!
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 32px;">
              Need help getting started? Our host success team is here for you:<br>
              <a href="mailto:${data.supportEmail || 'info@itwhip.com'}" style="color: #8b5cf6;">
                ${data.supportEmail || 'info@itwhip.com'}
              </a><br>
              <span style="font-size: 13px;">Response time: Usually within 2 hours during business hours</span>
            </p>
          </div>
          
          <div class="footer">
            <strong>ITWHIP HOST PORTAL</strong><br>
            Welcome to Our Host Community!<br>
            <a href="https://itwhip.com/host/dashboard">Dashboard</a> | 
            <a href="https://itwhip.com/host/help">Help Center</a> |
            <a href="https://itwhip.com/host/terms">Host Terms</a><br>
            <span style="font-size: 11px; margin-top: 8px; display: block;">
              © 2025 ItWhip Technologies. All rights reserved.<br>
              Thank you for choosing to host with ItWhip!
            </span>
          </div>
        </div>
      </body>
    </html>
  `
  
  const text = `
🎉 Welcome to ItWhip - You're Approved to Start Hosting!

Congratulations ${data.hostName}!

Great news! Your application has been approved, and you're now part of the ItWhip host community.

YOU'RE READY TO START EARNING!
${data.hostId ? `Your Host ID: #${data.hostId}` : 'Your host account is now active'}

YOUR COMMISSION STRUCTURE:
You keep: ${100 - data.commissionRate}% of every booking
ItWhip platform fee: ${data.commissionRate}%

YOUR HOST PRIVILEGES:
${data.permissions.canListCars ? '✅ List and manage vehicles' : '⏳ Vehicle listing (coming soon)'}
${data.permissions.canSetPricing ? '✅ Set custom pricing' : '⏳ Custom pricing (after first booking)'}
${data.permissions.canMessageGuests ? '✅ Message guests directly' : '⏳ Guest messaging (after verification)'}
${data.permissions.canWithdrawFunds ? '✅ Withdraw earnings' : '⏳ Withdrawals (after first completed trip)'}
${data.permissions.instantBookEnabled ? '✅ Instant booking enabled' : '⏳ Instant booking (after 5 successful trips)'}

ACCESS YOUR DASHBOARD:
${data.dashboardUrl}

YOUR FIRST STEPS AS A HOST:
${data.nextSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

HELPFUL RESOURCES:
- Host Success Guide: https://itwhip.com/host/guide
- Pricing Calculator: https://itwhip.com/host/pricing
- Safety Guidelines: https://itwhip.com/host/safety
${data.trainingUrl ? `- Host Training Videos: ${data.trainingUrl}` : ''}
- Host Community Forum: https://itwhip.com/host/community

💡 PRO TIP: Hosts who list their first vehicle within 48 hours typically get their first booking 3x faster!

Need help getting started? Contact our host success team at ${data.supportEmail || 'info@itwhip.com'}
Response time: Usually within 2 hours during business hours

Welcome to our host community!

ITWHIP HOST PORTAL
© 2025 ItWhip Technologies. All rights reserved.
  `
  
  return { subject, html, text }
}