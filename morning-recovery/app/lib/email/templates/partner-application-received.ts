// app/lib/email/templates/partner-application-received.ts

import { EmailTemplate } from '../types'
import { emailFooterHtml, emailFooterText } from './email-footer'

export interface PartnerApplicationReceivedData {
  companyName: string
  contactName: string
  contactEmail: string
  fleetSize: string
  applicationId: string
  operatingStates: string[]
  submittedAt: Date
  estimatedReviewTime?: string
  supportEmail?: string
}

export function getPartnerApplicationReceivedTemplate(data: PartnerApplicationReceivedData): EmailTemplate {
  const subject = `Application Received - ${data.companyName} | ItWhip Fleet Partner Program`

  const statesHtml = data.operatingStates.length > 0
    ? data.operatingStates.join(', ')
    : 'Not specified'

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
          .status-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 2px solid #f59e0b;
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
            text-align: center;
          }
          .status-icon {
            font-size: 48px;
            margin-bottom: 12px;
          }
          .status-title {
            font-size: 20px;
            font-weight: 700;
            color: #78350f;
            margin-bottom: 8px;
          }
          .status-message {
            font-size: 14px;
            color: #92400e;
          }
          .details-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 20px;
            margin: 24px 0;
            border-radius: 6px;
          }
          .details-box h3 {
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 16px 0;
            color: #111827;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            color: #6b7280;
            font-size: 14px;
          }
          .detail-value {
            color: #111827;
            font-size: 14px;
            font-weight: 500;
          }
          .timeline {
            margin: 32px 0;
          }
          .timeline-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 20px 0;
            color: #111827;
          }
          .timeline-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 16px;
          }
          .timeline-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 16px;
            margin-top: 4px;
            flex-shrink: 0;
          }
          .timeline-dot.completed {
            background: #10b981;
          }
          .timeline-dot.current {
            background: #f97316;
            box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.2);
          }
          .timeline-dot.pending {
            background: #d1d5db;
          }
          .timeline-content h4 {
            font-size: 14px;
            font-weight: 600;
            color: #111827;
            margin: 0 0 4px 0;
          }
          .timeline-content p {
            font-size: 13px;
            color: #6b7280;
            margin: 0;
          }
          .info-box {
            background: #eff6ff;
            border: 1px solid #93c5fd;
            padding: 16px;
            margin: 24px 0;
            border-radius: 6px;
          }
          .info-box p {
            font-size: 14px;
            color: #1e40af;
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
            .detail-row {
              flex-direction: column;
              gap: 4px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">Fleet Partner Program</div>
            <h1>Application Received</h1>
            <p>We're reviewing your Fleet Partner application</p>
          </div>

          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Hello ${data.contactName},</p>

            <p style="color: #4b5563; margin-bottom: 24px;">
              Thank you for applying to become an ItWhip Fleet Partner! We've received your application
              for <strong>${data.companyName}</strong> and our team is now reviewing your submission.
            </p>

            <div class="status-box">
              <div class="status-icon">📋</div>
              <div class="status-title">Application Under Review</div>
              <div class="status-message">
                Estimated review time: ${data.estimatedReviewTime || '24-48 hours'}
              </div>
            </div>

            <div class="details-box">
              <h3>Application Summary</h3>
              <div class="detail-row">
                <span class="detail-label">Application ID</span>
                <span class="detail-value">#${data.applicationId.slice(-8).toUpperCase()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Company Name</span>
                <span class="detail-value">${data.companyName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Fleet Size</span>
                <span class="detail-value">${data.fleetSize} vehicles</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Operating States</span>
                <span class="detail-value">${statesHtml}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Submitted</span>
                <span class="detail-value">${data.submittedAt.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>

            <div class="timeline">
              <h3 class="timeline-title">What Happens Next</h3>

              <div class="timeline-item">
                <div class="timeline-dot completed"></div>
                <div class="timeline-content">
                  <h4>Application Submitted</h4>
                  <p>Your application has been received</p>
                </div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot current"></div>
                <div class="timeline-content">
                  <h4>Document Review</h4>
                  <p>Our team is verifying your business documents</p>
                </div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot pending"></div>
                <div class="timeline-content">
                  <h4>Insurance Verification</h4>
                  <p>We'll confirm your commercial insurance coverage</p>
                </div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot pending"></div>
                <div class="timeline-content">
                  <h4>Account Activation</h4>
                  <p>Once approved, you'll receive login credentials</p>
                </div>
              </div>
            </div>

            <div class="info-box">
              <p>
                <strong>💡 Tip:</strong> While waiting, prepare your vehicle information (VINs, registration, photos)
                so you can quickly add them once approved.
              </p>
            </div>

            <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 24px 0 0 0;">
              Questions about your application?<br>
              <a href="mailto:${data.supportEmail || 'partners@itwhip.com'}" style="color: #f97316;">
                ${data.supportEmail || 'partners@itwhip.com'}
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
FLEET PARTNER PROGRAM - Application Received

Hello ${data.contactName},

Thank you for applying to become an ItWhip Fleet Partner! We've received your application for ${data.companyName} and our team is now reviewing your submission.

APPLICATION STATUS: Under Review
Estimated review time: ${data.estimatedReviewTime || '24-48 hours'}

APPLICATION SUMMARY:
- Application ID: #${data.applicationId.slice(-8).toUpperCase()}
- Company Name: ${data.companyName}
- Fleet Size: ${data.fleetSize} vehicles
- Operating States: ${statesHtml}
- Submitted: ${data.submittedAt.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })}

WHAT HAPPENS NEXT:
1. ✅ Application Submitted - Your application has been received
2. 🔄 Document Review - Our team is verifying your business documents
3. ⏳ Insurance Verification - We'll confirm your commercial insurance coverage
4. ⏳ Account Activation - Once approved, you'll receive login credentials

TIP: While waiting, prepare your vehicle information (VINs, registration, photos) so you can quickly add them once approved.

Questions about your application?
Contact: ${data.supportEmail || 'partners@itwhip.com'}

Application Reference: #${data.applicationId.slice(-8).toUpperCase()}

${emailFooterText({
  recipientEmail: data.contactEmail,
  includeAppButtons: true,
  includeSocialLinks: true,
  footerType: 'full'
})}
  `

  return { subject, html, text }
}

// Fleet Team Notification Template
export interface FleetTeamNotificationData {
  companyName: string
  contactName: string
  contactEmail: string
  contactPhone: string
  fleetSize: string
  operatingStates: string[]
  applicationId: string
  reviewUrl: string
}

export function getFleetTeamNotificationTemplate(data: FleetTeamNotificationData): EmailTemplate {
  const subject = `🚨 New Fleet Partner Application: ${data.companyName}`

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
            background: #f3f4f6;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .header {
            background: #1f2937;
            color: white;
            padding: 20px;
          }
          .header h1 {
            font-size: 18px;
            font-weight: 600;
            margin: 0;
          }
          .content {
            padding: 24px;
          }
          .alert-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin-bottom: 24px;
          }
          .alert-box h2 {
            font-size: 16px;
            font-weight: 600;
            color: #92400e;
            margin: 0 0 8px 0;
          }
          .alert-box p {
            font-size: 14px;
            color: #78350f;
            margin: 0;
          }
          .details {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 16px;
            border-radius: 6px;
            margin-bottom: 24px;
          }
          .details h3 {
            font-size: 14px;
            font-weight: 600;
            margin: 0 0 12px 0;
            color: #374151;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
          }
          .detail-label {
            color: #6b7280;
          }
          .detail-value {
            color: #111827;
            font-weight: 500;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background: #f97316;
            color: white;
            text-decoration: none;
            font-weight: 600;
            border-radius: 6px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 New Fleet Partner Application</h1>
          </div>

          <div class="content">
            <div class="alert-box">
              <h2>${data.companyName}</h2>
              <p>Fleet size: ${data.fleetSize} vehicles | States: ${data.operatingStates.join(', ')}</p>
            </div>

            <div class="details">
              <h3>Contact Information</h3>
              <div class="detail-row">
                <span class="detail-label">Name</span>
                <span class="detail-value">${data.contactName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email</span>
                <span class="detail-value">${data.contactEmail}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone</span>
                <span class="detail-value">${data.contactPhone}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Application ID</span>
                <span class="detail-value">#${data.applicationId.slice(-8).toUpperCase()}</span>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${data.reviewUrl}" class="button">Review Application</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
NEW FLEET PARTNER APPLICATION

Company: ${data.companyName}
Fleet Size: ${data.fleetSize} vehicles
Operating States: ${data.operatingStates.join(', ')}

Contact:
- Name: ${data.contactName}
- Email: ${data.contactEmail}
- Phone: ${data.contactPhone}
- Application ID: #${data.applicationId.slice(-8).toUpperCase()}

Review Application: ${data.reviewUrl}
  `

  return { subject, html, text }
}
