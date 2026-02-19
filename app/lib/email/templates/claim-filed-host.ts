// app/lib/email/templates/claim-filed-host.ts

import { ClaimFiledHostData, EmailTemplate } from '../types'
import { escapeHtml } from '../sanitize'

/**
 * Email template for host when claim is filed
 * Sent immediately after host files a claim
 */
export function getClaimFiledHostTemplate(data: ClaimFiledHostData): EmailTemplate {
  const subject = `Claim Filed - ${data.carDetails} - ${data.bookingCode}`
  
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
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
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
            font-weight: 700;
            margin: 0;
          }
          .content {
            padding: 40px 30px;
          }
          .info-box {
            background: #f9fafb;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 24px 0;
            border-radius: 4px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            color: #6b7280;
            font-size: 14px;
          }
          .info-value {
            color: #111827;
            font-weight: 600;
            font-size: 14px;
          }
          .fnol-confirmation {
            background: #ecfdf5;
            border-left: 4px solid #10b981;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .fnol-title {
            color: #065f46;
            font-weight: 700;
            margin-bottom: 8px;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .fnol-text {
            color: #047857;
            font-size: 13px;
            line-height: 1.5;
          }
          .warning-box {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            padding: 16px;
            border-radius: 4px;
            margin: 20px 0;
          }
          .warning-title {
            color: #92400e;
            font-weight: 700;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .warning-text {
            color: #78350f;
            font-size: 13px;
          }
          .btn {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
          }
          .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer-text {
            color: #6b7280;
            font-size: 12px;
            line-height: 1.5;
          }
          .next-steps {
            background: #eff6ff;
            padding: 20px;
            border-radius: 6px;
            margin: 24px 0;
          }
          .next-steps h3 {
            color: #1e40af;
            font-size: 16px;
            margin-bottom: 12px;
          }
          .next-steps ol {
            margin-left: 20px;
            color: #374151;
          }
          .next-steps li {
            margin: 8px 0;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="status-badge">CLAIM FILED</div>
            <h1>Your Claim Has Been Submitted</h1>
          </div>

          <div class="content">
            <p style="font-size: 16px; color: #111827; margin-bottom: 20px;">
              Hi ${escapeHtml(data.hostName)},
            </p>

            <p style="color: #374151; margin-bottom: 24px;">
              Your insurance claim has been successfully submitted and is now under review by our fleet team.
            </p>

            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Claim ID</span>
                <span class="info-value">#${data.claimId.slice(0, 8).toUpperCase()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Booking Code</span>
                <span class="info-value">${data.bookingCode}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Vehicle</span>
                <span class="info-value">${escapeHtml(data.carDetails)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Incident Date</span>
                <span class="info-value">${new Date(data.incidentDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Claim Type</span>
                <span class="info-value">${escapeHtml(data.claimType)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Estimated Cost</span>
                <span class="info-value">$${data.estimatedCost.toLocaleString()}</span>
              </div>
            </div>

            ${(data as any).fnolSummary?.hasComprehensiveReport ? `
              <div class="fnol-confirmation">
                <div class="fnol-title">
                  <span>✅</span>
                  <span>Comprehensive Incident Report Filed</span>
                </div>
                <div class="fnol-text">
                  Your detailed incident documentation has been securely submitted including vehicle condition, environmental factors, and all relevant details. This comprehensive report is available in your secure claims portal.
                </div>
              </div>
            ` : ''}

            ${data.vehicleDeactivated ? `
              <div class="warning-box">
                <div class="warning-title">⚠️ Vehicle Temporarily Deactivated</div>
                <div class="warning-text">
                  As per your request, this vehicle has been temporarily deactivated and cannot receive new bookings until the claim is resolved.
                </div>
              </div>
            ` : ''}

            <div class="next-steps">
              <h3>What Happens Next?</h3>
              <ol>
                <li>Our fleet team will review your claim within 24-48 hours</li>
                <li>The guest will be notified and given 48 hours to respond</li>
                <li>We'll verify all documentation and assess the claim</li>
                <li>You'll receive a decision notification via email</li>
                <li>If approved, payment will be processed according to your earnings tier</li>
              </ol>
            </div>

            <p style="color: #374151; margin-bottom: 16px;">
              You can track your claim status and view complete incident details at any time.
            </p>

            <div style="text-align: center;">
              <a href="${data.claimUrl}" class="btn">View Claim Details</a>
            </div>

            <p style="color: #6b7280; font-size: 13px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <strong>Need help?</strong> Contact us at <a href="mailto:info@itwhip.com" style="color: #3b82f6;">info@itwhip.com</a> or call (855) 703-0806
            </p>
          </div>

          <div class="footer">
            <p class="footer-text">
              © 2024 ItWhip. All rights reserved.<br>
              Phoenix, Arizona<br>
              <a href="https://itwhip.com" style="color: #3b82f6; text-decoration: none;">itwhip.com</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
CLAIM FILED - YOUR CLAIM HAS BEEN SUBMITTED

Hi ${escapeHtml(data.hostName)},

Your insurance claim has been successfully submitted and is now under review by our fleet team.

Claim Details:
- Claim ID: #${data.claimId.slice(0, 8).toUpperCase()}
- Booking Code: ${data.bookingCode}
- Vehicle: ${escapeHtml(data.carDetails)}
- Incident Date: ${new Date(data.incidentDate).toLocaleDateString()}
- Claim Type: ${escapeHtml(data.claimType)}
- Estimated Cost: $${data.estimatedCost.toLocaleString()}

${(data as any).fnolSummary?.hasComprehensiveReport ? `
✅ COMPREHENSIVE INCIDENT REPORT FILED
Your detailed incident documentation has been securely submitted including vehicle condition, environmental factors, and all relevant details. This comprehensive report is available in your secure claims portal.
` : ''}

${data.vehicleDeactivated ? `
⚠️ VEHICLE TEMPORARILY DEACTIVATED
As per your request, this vehicle has been temporarily deactivated and cannot receive new bookings until the claim is resolved.
` : ''}

WHAT HAPPENS NEXT?
1. Our fleet team will review your claim within 24-48 hours
2. The guest will be notified and given 48 hours to respond
3. We'll verify all documentation and assess the claim
4. You'll receive a decision notification via email
5. If approved, payment will be processed according to your earnings tier

Track your claim: ${data.claimUrl}

Need help? Contact us at info@itwhip.com or call (855) 703-0806

© 2024 ItWhip. All rights reserved.
Phoenix, Arizona
itwhip.com
  `

  return { subject, html, text }
}