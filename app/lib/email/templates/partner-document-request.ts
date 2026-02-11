// app/lib/email/templates/partner-document-request.ts

import { EmailTemplate } from '../types'
import { escapeHtml } from '../sanitize'

export interface PartnerDocumentIssue {
  documentType: string
  displayName: string
  issue?: string
  instructions?: string
}

export interface PartnerDocumentRequestData {
  partnerName: string
  companyName?: string
  documentIssues: PartnerDocumentIssue[]
  uploadUrl: string
  deadline?: string // e.g., "7 days"
  requestedBy?: string
  supportEmail?: string
}

export function getPartnerDocumentRequestTemplate(data: PartnerDocumentRequestData): EmailTemplate {
  const subject = `Action Required: Document Upload Needed for Your ItWhip Partner Account`

  const documentIssuesHtml = data.documentIssues.map(doc => `
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 16px; border-radius: 4px;">
      <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #92400e;">
        📄 ${doc.displayName}
      </h3>
      ${doc.issue ? `
      <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px;">
        <strong>Issue:</strong> ${doc.issue}
      </p>
      ` : ''}
      <p style="margin: 0; color: #78350f; font-size: 14px;">
        <strong>What to do:</strong> ${doc.instructions || 'Please upload a clear, readable copy of this document'}
      </p>
    </div>
  `).join('')

  const documentIssuesText = data.documentIssues.map(doc => `
- ${doc.displayName}
  ${doc.issue ? `Issue: ${doc.issue}` : ''}
  What to do: ${doc.instructions || 'Please upload a clear, readable copy of this document'}
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
            background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
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
            background: #7c3aed;
            color: white;
            text-decoration: none;
            font-weight: 500;
            border-radius: 6px;
            margin: 24px 0;
            text-align: center;
          }
          .button:hover {
            background: #5b21b6;
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
          .document-types {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 20px;
            margin: 24px 0;
            border-radius: 6px;
          }
          .document-types h3 {
            font-size: 16px;
            margin: 0 0 12px 0;
            color: #111827;
          }
          .document-types ul {
            margin: 0 0 0 20px;
            padding: 0;
            font-size: 14px;
            color: #4b5563;
          }
          .document-types li {
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
            color: #7c3aed;
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
            <h1>Documents Needed</h1>
            <p>Your partner account requires document verification</p>
          </div>

          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Hi ${data.partnerName},</p>

            <p style="color: #4b5563; margin-bottom: 24px;">
              ${data.companyName ? `Your company <strong>${escapeHtml(data.companyName)}</strong> is ` : 'Your account is '}
              missing some required documents for our partner verification process.
              Please upload the following documents to complete your account setup and continue operations.
            </p>

            ${data.deadline ? `
            <div class="deadline-box">
              <div class="deadline-label">⏰ PLEASE RESPOND WITHIN</div>
              <div class="deadline">${data.deadline}</div>
              <p style="font-size: 12px; color: #991b1b; margin-top: 4px;">
                Some features may be limited until documents are verified
              </p>
            </div>
            ` : ''}

            <h2 style="font-size: 20px; margin: 32px 0 16px 0; color: #111827;">
              Required Documents:
            </h2>

            ${documentIssuesHtml}

            <div style="text-align: center; margin: 32px 0;">
              <a href="${data.uploadUrl}" class="button">
                Upload Documents Now
              </a>
              <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">
                Click to go directly to your partner dashboard
              </p>
            </div>

            <div class="info-box">
              <strong>💡 Why do we need these documents?</strong>
              These documents help us verify your business legitimacy, ensure proper insurance coverage,
              and comply with regulations. This protects both your business and the guests who book your vehicles.
            </div>

            <div class="document-types">
              <h3>📸 Tips for Document Uploads:</h3>
              <ul>
                <li>Ensure all text is clearly readable</li>
                <li>Include all pages if multiple pages</li>
                <li>Documents must not be expired</li>
                <li>PDF or clear image files accepted</li>
                <li>Maximum file size: 10MB per document</li>
              </ul>
            </div>

            <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 32px;">
              Need help? Contact our partner support team:<br>
              <a href="mailto:${data.supportEmail || 'partners@itwhip.com'}" style="color: #7c3aed;">
                ${data.supportEmail || 'partners@itwhip.com'}
              </a>
            </p>
          </div>

          <div class="footer">
            <strong>ITWHIP PARTNER PORTAL</strong><br>
            Your Partner in Vehicle Sharing<br>
            <a href="https://itwhip.com/partner/help">Partner Help Center</a> |
            <a href="https://itwhip.com/partner/terms">Partner Terms</a> |
            <a href="https://itwhip.com/privacy">Privacy Policy</a><br>
            <span style="font-size: 11px; margin-top: 8px; display: block;">
              © ${new Date().getFullYear()} ItWhip Technologies. All rights reserved.<br>
              This is an automated message regarding your partner account.
            </span>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Action Required: Document Upload Needed for Your ItWhip Partner Account

Hi ${data.partnerName},

${data.companyName ? `Your company ${escapeHtml(data.companyName)} is ` : 'Your account is '}missing some required documents for our partner verification process.

${data.deadline ? `PLEASE RESPOND WITHIN: ${data.deadline}` : ''}

Required Documents:
${documentIssuesText}

Upload Documents Now:
${data.uploadUrl}

Why do we need these documents?
These documents help us verify your business legitimacy, ensure proper insurance coverage, and comply with regulations.

Tips for Document Uploads:
- Ensure all text is clearly readable
- Include all pages if multiple pages
- Documents must not be expired
- PDF or clear image files accepted
- Maximum file size: 10MB per document

Need help? Contact our partner support team at ${data.supportEmail || 'partners@itwhip.com'}

ITWHIP PARTNER PORTAL
Your Partner in Vehicle Sharing
© ${new Date().getFullYear()} ItWhip Technologies. All rights reserved.
  `

  return { subject, html, text }
}
