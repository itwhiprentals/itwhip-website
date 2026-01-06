// app/lib/email/templates/host-document-request.ts

import { EmailTemplate } from '../types'

export interface DocumentIssue {
  documentType: string
  issue: string
  instructions: string
}

export interface HostDocumentRequestData {
  hostName: string
  documentIssues: DocumentIssue[]
  uploadUrl: string
  deadline: string // e.g., "3 days"
  supportEmail?: string
}

export function getHostDocumentRequestTemplate(data: HostDocumentRequestData): EmailTemplate {
  const subject = 'Action Required: Document Updates Needed for Your ItWhip Host Account'
  
  const documentIssuesHtml = data.documentIssues.map(doc => `
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 16px; border-radius: 4px;">
      <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #92400e;">
        📄 ${doc.documentType}
      </h3>
      <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px;">
        <strong>Issue:</strong> ${doc.issue}
      </p>
      <p style="margin: 0; color: #78350f; font-size: 14px;">
        <strong>What to do:</strong> ${doc.instructions}
      </p>
    </div>
  `).join('')
  
  const documentIssuesText = data.documentIssues.map(doc => `
- ${doc.documentType}
  Issue: ${doc.issue}
  What to do: ${doc.instructions}
  `).join('\n')
  
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
          .deadline-box {
            background: #fee2e2;
            border: 2px solid #ef4444;
            padding: 20px;
            margin: 24px 0;
            text-align: center;
            border-radius: 8px;
          }
          .deadline-label {
            font-size: 14px;
            color: #991b1b;
            margin-bottom: 4px;
            font-weight: 600;
          }
          .deadline {
            font-size: 24px;
            font-weight: bold;
            color: #dc2626;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: #f59e0b;
            color: white;
            text-decoration: none;
            font-weight: 500;
            border-radius: 6px;
            margin: 24px 0;
            text-align: center;
          }
          .button:hover {
            background: #d97706;
          }
          .info-box {
            background: #f0f9ff;
            border: 1px solid #0284c7;
            padding: 16px;
            margin: 24px 0;
            border-radius: 6px;
            font-size: 14px;
            color: #075985;
          }
          .info-box strong {
            display: block;
            margin-bottom: 4px;
          }
          .tips-section {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 20px;
            margin: 24px 0;
            border-radius: 6px;
          }
          .tips-section h3 {
            font-size: 16px;
            margin: 0 0 12px 0;
            color: #111827;
          }
          .tips-section ul {
            margin: 0 0 0 20px;
            padding: 0;
            font-size: 14px;
            color: #4b5563;
          }
          .tips-section li {
            margin: 8px 0;
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
            color: #f59e0b;
            text-decoration: none;
          }
          @media only screen and (max-width: 600px) {
            .header { padding: 30px 16px; }
            .header h1 { font-size: 24px; }
            .content { padding: 20px 16px; }
            .deadline { font-size: 20px; }
            .button { display: block; text-align: center; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="status-badge">⚠️ Action Required</div>
            <h1>Document Update Needed</h1>
            <p>Your host application requires attention</p>
          </div>
          
          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Hi ${data.hostName},</p>
            
            <p style="color: #4b5563; margin-bottom: 24px;">
              We're reviewing your host application and need you to update some documents before we can proceed. 
              This is a common part of our verification process to ensure the safety and quality of our platform.
            </p>
            
            <div class="deadline-box">
              <div class="deadline-label">⏰ RESPONSE NEEDED WITHIN</div>
              <div class="deadline">${data.deadline}</div>
              <p style="font-size: 12px; color: #991b1b; margin-top: 4px;">
                After this time, your application may be closed
              </p>
            </div>
            
            <h2 style="font-size: 20px; margin: 32px 0 16px 0; color: #111827;">
              Documents Requiring Update:
            </h2>
            
            ${documentIssuesHtml}
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${data.uploadUrl}" class="button">
                Upload Updated Documents
              </a>
              <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">
                Click to go directly to your host dashboard
              </p>
            </div>
            
            <div class="info-box">
              <strong>💡 Why do we need this?</strong>
              Clear, valid documents help us verify your identity and ensure you meet all legal requirements 
              to host vehicles on our platform. This protects both you and your future guests.
            </div>
            
            <div class="tips-section">
              <h3>📸 Tips for Document Photos:</h3>
              <ul>
                <li>Ensure all text is clearly readable</li>
                <li>Include all four corners of the document</li>
                <li>Avoid glare or shadows</li>
                <li>Make sure the document isn't expired</li>
                <li>File size should be under 10MB</li>
              </ul>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 32px;">
              Need help? Our host support team is here to assist:<br>
              <a href="mailto:${data.supportEmail || 'info@itwhip.com'}" style="color: #f59e0b;">
                ${data.supportEmail || 'info@itwhip.com'}
              </a>
            </p>
          </div>
          
          <div class="footer">
            <strong>ITWHIP HOST PORTAL</strong><br>
            Your Partner in Vehicle Sharing<br>
            <a href="https://itwhip.com/host/help">Host Help Center</a> | 
            <a href="https://itwhip.com/host/terms">Host Terms</a> |
            <a href="https://itwhip.com/host/privacy">Privacy Policy</a><br>
            <span style="font-size: 11px; margin-top: 8px; display: block;">
              © 2025 ItWhip Technologies. All rights reserved.<br>
              This is an automated message regarding your host application.
            </span>
          </div>
        </div>
      </body>
    </html>
  `
  
  const text = `
Action Required: Document Updates Needed for Your ItWhip Host Account

Hi ${data.hostName},

We're reviewing your host application and need you to update some documents before we can proceed.

RESPONSE NEEDED WITHIN: ${data.deadline}
After this time, your application may be closed.

Documents Requiring Update:
${documentIssuesText}

Upload Updated Documents:
${data.uploadUrl}

Why do we need this?
Clear, valid documents help us verify your identity and ensure you meet all legal requirements to host vehicles on our platform.

Tips for Document Photos:
- Ensure all text is clearly readable
- Include all four corners of the document
- Avoid glare or shadows
- Make sure the document isn't expired
- File size should be under 10MB

Need help? Contact our host support team at ${data.supportEmail || 'info@itwhip.com'}

ITWHIP HOST PORTAL
Your Partner in Vehicle Sharing
© 2025 ItWhip Technologies. All rights reserved.
  `
  
  return { subject, html, text }
}