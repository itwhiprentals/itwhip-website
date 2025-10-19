// app/lib/email/templates/host-rejection.ts

import { EmailTemplate } from '../types'

export interface RejectionReason {
  category: string
  description: string
  canResolve: boolean
}

export interface HostRejectionData {
  hostName: string
  reasons: RejectionReason[]
  canReapply: boolean
  reapplyTimeframe?: string // e.g., "30 days", "6 months"
  reapplyUrl?: string
  appealUrl?: string
  supportEmail?: string
}

export function getHostRejectionTemplate(data: HostRejectionData): EmailTemplate {
  const subject = 'Update on Your ItWhip Host Application'
  
  const reasonsHtml = data.reasons.map(reason => `
    <div style="background: #f9fafb; border-left: 4px solid #6b7280; padding: 16px; margin-bottom: 16px; border-radius: 4px;">
      <h3 style="margin: 0 0 8px 0; font-size: 15px; color: #111827;">
        ${reason.category}
      </h3>
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
        ${reason.description}
      </p>
      ${reason.canResolve ? `
        <p style="margin: 0; font-size: 13px; color: #059669;">
          ✓ This can be resolved with additional documentation or clarification
        </p>
      ` : `
        <p style="margin: 0; font-size: 13px; color: #6b7280;">
          ✗ This requirement cannot be waived at this time
        </p>
      `}
    </div>
  `).join('')
  
  const reasonsText = data.reasons.map(reason => 
    `- ${reason.category}: ${reason.description} ${reason.canResolve ? '(Can be resolved)' : '(Cannot be waived)'}`
  ).join('\n')
  
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
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); 
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
          .message-box {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 20px;
            margin: 24px 0;
            border-radius: 6px;
            text-align: center;
          }
          .message-box h2 {
            font-size: 18px;
            color: #111827;
            margin-bottom: 8px;
          }
          .message-box p {
            font-size: 14px;
            color: #4b5563;
            margin: 0;
          }
          .reasons-container {
            margin: 32px 0;
          }
          .reasons-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #111827;
          }
          .next-steps-box {
            background: #eff6ff;
            border: 1px solid #93c5fd;
            padding: 20px;
            margin: 32px 0;
            border-radius: 6px;
          }
          .next-steps-box h3 {
            font-size: 16px;
            margin: 0 0 12px 0;
            color: #1e3a8a;
          }
          .next-steps-box p {
            font-size: 14px;
            color: #1e3a8a;
            margin: 0 0 12px 0;
            line-height: 1.5;
          }
          .next-steps-box ul {
            margin: 0 0 0 20px;
            padding: 0;
            font-size: 14px;
            color: #1e40af;
          }
          .next-steps-box li {
            margin: 8px 0;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            font-weight: 500;
            border-radius: 6px;
            margin: 12px 8px;
            text-align: center;
          }
          .button:hover {
            background: #2563eb;
          }
          .button-secondary {
            background: #6b7280;
          }
          .button-secondary:hover {
            background: #4b5563;
          }
          .encouragement-box {
            background: #f0fdf4;
            border: 1px solid #86efac;
            padding: 16px;
            margin: 32px 0;
            border-radius: 6px;
            text-align: center;
            font-size: 14px;
            color: #14532d;
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
            color: #6b7280;
            text-decoration: none;
          }
          @media only screen and (max-width: 600px) {
            .header { padding: 30px 16px; }
            .header h1 { font-size: 24px; }
            .content { padding: 20px 16px; }
            .button { 
              display: block; 
              margin: 12px 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="status-badge">Application Update</div>
            <h1>Application Status</h1>
            <p>Thank you for your interest in hosting with ItWhip</p>
          </div>
          
          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Dear ${data.hostName},</p>
            
            <p style="color: #4b5563; margin-bottom: 24px;">
              Thank you for your interest in becoming a host on the ItWhip platform. We've carefully reviewed 
              your application and appreciate the time you took to submit it.
            </p>
            
            <div class="message-box">
              <h2>Application Decision</h2>
              <p>
                After careful review, we're unable to approve your host application at this time. 
                Please review the details below to understand our decision.
              </p>
            </div>
            
            <div class="reasons-container">
              <h2 class="reasons-title">Reasons for Decision:</h2>
              ${reasonsHtml}
            </div>
            
            ${data.canReapply ? `
              <div class="next-steps-box">
                <h3>🔄 You Can Reapply</h3>
                <p>
                  We encourage you to address the issues mentioned above and reapply. 
                  ${data.reapplyTimeframe ? `You may submit a new application after <strong>${data.reapplyTimeframe}</strong>.` : ''}
                </p>
                <p>To improve your chances of approval:</p>
                <ul>
                  <li>Ensure all documents are current and clearly readable</li>
                  <li>Verify your insurance meets our minimum requirements</li>
                  <li>Complete all required verification steps</li>
                  <li>Review our host requirements at itwhip.com/host/requirements</li>
                </ul>
              </div>
            ` : `
              <div class="message-box">
                <p style="color: #4b5563;">
                  Unfortunately, based on the nature of the issues identified, we are unable to 
                  accept reapplications at this time. We appreciate your understanding.
                </p>
              </div>
            `}
            
            <div style="text-align: center; margin: 32px 0;">
              ${data.appealUrl ? `
                <a href="${data.appealUrl}" class="button button-secondary">
                  Appeal Decision
                </a>
              ` : ''}
              ${data.canReapply && data.reapplyUrl ? `
                <a href="${data.reapplyUrl}" class="button">
                  Prepare to Reapply
                </a>
              ` : ''}
            </div>
            
            ${data.canReapply ? `
              <div class="encouragement-box">
                <strong>Don't Give Up!</strong><br>
                Many successful hosts didn't get approved on their first application. 
                Address the issues mentioned, and we look forward to reviewing your updated application.
              </div>
            ` : ''}
            
            <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 32px;">
              If you have questions about this decision, please contact our support team:<br>
              <a href="mailto:${data.supportEmail || 'hosts@itwhip.com'}" style="color: #3b82f6;">
                ${data.supportEmail || 'hosts@itwhip.com'}
              </a>
            </p>
            
            <p style="font-size: 13px; color: #9ca3af; text-align: center; margin-top: 24px; font-style: italic;">
              We value your interest in ItWhip and hope to work with you in the future.
            </p>
          </div>
          
          <div class="footer">
            <strong>ITWHIP HOST PORTAL</strong><br>
            Committed to Quality and Safety<br>
            <a href="https://itwhip.com/host/requirements">Host Requirements</a> | 
            <a href="https://itwhip.com/host/faq">FAQ</a> |
            <a href="https://itwhip.com/privacy">Privacy Policy</a><br>
            <span style="font-size: 11px; margin-top: 8px; display: block;">
              © 2025 ItWhip Technologies. All rights reserved.<br>
              This decision was made in accordance with our host acceptance policies.
            </span>
          </div>
        </div>
      </body>
    </html>
  `
  
  const text = `
Update on Your ItWhip Host Application

Dear ${data.hostName},

Thank you for your interest in becoming a host on the ItWhip platform. We've carefully reviewed your application.

APPLICATION DECISION
After careful review, we're unable to approve your host application at this time.

Reasons for Decision:
${reasonsText}

${data.canReapply ? `
YOU CAN REAPPLY
We encourage you to address the issues mentioned above and reapply.
${data.reapplyTimeframe ? `You may submit a new application after ${data.reapplyTimeframe}.` : ''}

To improve your chances of approval:
- Ensure all documents are current and clearly readable
- Verify your insurance meets our minimum requirements
- Complete all required verification steps
- Review our host requirements at itwhip.com/host/requirements

${data.reapplyUrl ? `Prepare to reapply: ${data.reapplyUrl}` : ''}
` : `Unfortunately, based on the nature of the issues identified, we are unable to accept reapplications at this time.`}

${data.appealUrl ? `Appeal this decision: ${data.appealUrl}` : ''}

Questions? Contact our support team at ${data.supportEmail || 'hosts@itwhip.com'}

We value your interest in ItWhip and hope to work with you in the future.

ITWHIP HOST PORTAL
Committed to Quality and Safety
© 2025 ItWhip Technologies. All rights reserved.
  `
  
  return { subject, html, text }
}