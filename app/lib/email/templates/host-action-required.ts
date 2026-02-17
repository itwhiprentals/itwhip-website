// app/lib/email/templates/host-action-required.ts

import { EmailTemplate } from '../types'
import { escapeHtml } from '../sanitize'

export interface HostActionRequiredData {
  hostName: string
  actionType: string // e.g., "Complete Profile", "Update Insurance", "Renew Documents"
  actionDescription: string
  actionReason: string
  actionUrl: string
  deadline?: string // e.g., "48 hours", "7 days"
  consequences?: string // What happens if they don't take action
  supportEmail?: string
}

export function getHostActionRequiredTemplate(data: HostActionRequiredData): EmailTemplate {
  const subject = `Action Required: ${data.actionType} - ItWhip Host Account`
  
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
          .urgency-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.9);
            color: #dc2626;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
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
            opacity: 0.95;
          }
          .content { 
            padding: 30px 20px;
          }
          .action-box {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 2px solid #ef4444;
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
            text-align: center;
          }
          .action-icon {
            font-size: 36px;
            margin-bottom: 12px;
          }
          .action-title {
            font-size: 20px;
            font-weight: 700;
            color: #991b1b;
            margin-bottom: 8px;
          }
          .action-description {
            font-size: 14px;
            color: #7f1d1d;
            line-height: 1.5;
          }
          .deadline-banner {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 24px 0;
            border-radius: 0 4px 4px 0;
          }
          .deadline-banner strong {
            color: #92400e;
            display: block;
            margin-bottom: 4px;
          }
          .deadline-timer {
            font-size: 20px;
            font-weight: 700;
            color: #d97706;
          }
          .button {
            display: inline-block;
            padding: 14px 40px;
            background: #dc2626;
            color: white;
            text-decoration: none;
            font-weight: 600;
            border-radius: 6px;
            margin: 24px 0;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 6px rgba(220, 38, 38, 0.25);
          }
          .button:hover {
            background: #b91c1c;
          }
          .reason-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 20px;
            margin: 24px 0;
            border-radius: 6px;
          }
          .reason-box h3 {
            font-size: 16px;
            margin: 0 0 12px 0;
            color: #111827;
            display: flex;
            align-items: center;
          }
          .reason-box h3 span {
            margin-right: 8px;
          }
          .reason-box p {
            font-size: 14px;
            color: #4b5563;
            margin: 0;
            line-height: 1.6;
          }
          .consequences-box {
            background: #fef2f2;
            border: 1px solid #fca5a5;
            padding: 20px;
            margin: 24px 0;
            border-radius: 6px;
          }
          .consequences-box h3 {
            font-size: 16px;
            margin: 0 0 12px 0;
            color: #991b1b;
            display: flex;
            align-items: center;
          }
          .consequences-box h3 span {
            margin-right: 8px;
          }
          .consequences-box p {
            font-size: 14px;
            color: #7f1d1d;
            margin: 0;
            line-height: 1.6;
          }
          .help-section {
            background: #eff6ff;
            border: 1px solid #93c5fd;
            padding: 16px;
            margin: 32px 0;
            border-radius: 6px;
            text-align: center;
            font-size: 14px;
            color: #1e3a8a;
          }
          .help-section a {
            color: #2563eb;
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
            color: #dc2626;
            text-decoration: none;
          }
          @media only screen and (max-width: 600px) {
            .header { padding: 30px 16px; }
            .header h1 { font-size: 24px; }
            .content { padding: 20px 16px; }
            .action-title { font-size: 18px; }
            .deadline-timer { font-size: 18px; }
            .button { 
              display: block; 
              padding: 14px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="urgency-badge">🔔 Immediate Action Required</div>
            <h1>Action Needed</h1>
            <p>Your host account requires immediate attention</p>
          </div>
          
          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Hi ${escapeHtml(data.hostName)},</p>
            
            <p style="color: #4b5563; margin-bottom: 24px;">
              Your ItWhip host account requires immediate action to maintain your hosting privileges 
              and continue operating on our platform.
            </p>
            
            <div class="action-box">
              <div class="action-icon">⚡</div>
              <div class="action-title">${data.actionType}</div>
              <div class="action-description">
                ${data.actionDescription}
              </div>
            </div>
            
            ${data.deadline ? `
              <div class="deadline-banner">
                <strong>⏰ TIME SENSITIVE</strong>
                <span class="deadline-timer">Complete within: ${data.deadline}</span>
                <p style="font-size: 12px; color: #92400e; margin-top: 4px;">
                  Failure to act may result in account restrictions
                </p>
              </div>
            ` : ''}
            
            <div class="reason-box">
              <h3><span>❓</span> Why is this required?</h3>
              <p>${data.actionReason}</p>
            </div>
            
            ${data.consequences ? `
              <div class="consequences-box">
                <h3><span>⚠️</span> What happens if I don't take action?</h3>
                <p>${data.consequences}</p>
              </div>
            ` : ''}
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${data.actionUrl}" class="button">
                Take Action Now
              </a>
              <p style="font-size: 12px; color: #6b7280; margin-top: 12px;">
                You'll be directed to your host dashboard to complete this action
              </p>
            </div>
            
            <div class="help-section">
              <strong>Need assistance?</strong><br>
              Our host support team is standing by to help you resolve this quickly.<br>
              Email us at <a href="mailto:${data.supportEmail || 'info@itwhip.com'}">${data.supportEmail || 'info@itwhip.com'}</a><br>
              or visit our <a href="https://itwhip.com/host/help">Host Help Center</a>
            </div>
            
            <p style="font-size: 13px; color: #6b7280; font-style: italic; text-align: center; margin-top: 32px;">
              This is an important notice regarding your host account status. 
              Please do not ignore this message as it may affect your ability to host vehicles on ItWhip.
            </p>
          </div>
          
          <div class="footer">
            <strong>ITWHIP HOST PORTAL</strong><br>
            Maintaining Platform Excellence<br>
            <a href="https://itwhip.com/host/help">Host Help Center</a> | 
            <a href="https://itwhip.com/host/terms">Host Terms</a> |
            <a href="https://itwhip.com/privacy">Privacy Policy</a><br>
            <span style="font-size: 11px; margin-top: 8px; display: block;">
              © 2026 ItWhip Technologies. All rights reserved.<br>
              This is an automated compliance notification.
            </span>
          </div>
        </div>
      </body>
    </html>
  `
  
  const text = `
Action Required: ${data.actionType} - ItWhip Host Account

Hi ${escapeHtml(data.hostName)},

Your ItWhip host account requires immediate action to maintain your hosting privileges.

⚡ ACTION REQUIRED: ${data.actionType}
${data.actionDescription}

${data.deadline ? `⏰ TIME SENSITIVE: Complete within ${data.deadline}` : ''}

Why is this required?
${data.actionReason}

${data.consequences ? `What happens if I don't take action?
${data.consequences}` : ''}

TAKE ACTION NOW:
${data.actionUrl}

Need assistance?
Our host support team is standing by to help you resolve this quickly.
Email: ${data.supportEmail || 'info@itwhip.com'}
Help Center: https://itwhip.com/host/help

This is an important notice regarding your host account status. 
Please do not ignore this message as it may affect your ability to host vehicles on ItWhip.

ITWHIP HOST PORTAL
Maintaining Platform Excellence
© 2026 ItWhip Technologies. All rights reserved.
  `
  
  return { subject, html, text }
}