// app/lib/email/templates/claim-notification-fleet.ts

import { ClaimNotificationFleetData, EmailTemplate } from '../types'

/**
 * Email template for fleet admin when new claim is filed
 * Sent immediately when host files a claim
 */
export function getClaimNotificationFleetTemplate(data: ClaimNotificationFleetData): EmailTemplate {
  const subject = `New Claim to Review - ${data.priority.toUpperCase()} Priority - ${data.bookingCode}`
  
  const priorityColors = {
    high: { bg: '#ef4444', text: '#991b1b' },
    medium: { bg: '#f59e0b', text: '#92400e' },
    low: { bg: '#3b82f6', text: '#1e40af' }
  }
  
  const priorityColor = priorityColors[data.priority]
  
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
            background: linear-gradient(135deg, ${priorityColor.bg} 0%, ${data.priority === 'high' ? '#dc2626' : data.priority === 'medium' ? '#d97706' : '#2563eb'} 100%); 
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
          .priority-badge {
            display: inline-block;
            background: ${priorityColor.bg};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 20px;
          }
          .fnol-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-left: 8px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 24px 0;
          }
          .info-card {
            background: #f9fafb;
            padding: 16px;
            border-radius: 6px;
            border-left: 3px solid #3b82f6;
          }
          .info-card-label {
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .info-card-value {
            color: #111827;
            font-weight: 700;
            font-size: 16px;
          }
          .claim-details {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 20px;
            margin: 24px 0;
            border-radius: 6px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
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
          .action-required {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 24px 0;
            border-radius: 4px;
          }
          .action-title {
            color: #92400e;
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 8px;
          }
          .action-list {
            color: #78350f;
            font-size: 13px;
            margin-left: 20px;
          }
          .btn {
            display: inline-block;
            background: ${priorityColor.bg};
            color: white;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 700;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
          }
          .quick-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin: 24px 0;
          }
          .quick-action-btn {
            display: block;
            padding: 12px 20px;
            text-align: center;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
          }
          .btn-approve {
            background: #10b981;
            color: white;
          }
          .btn-deny {
            background: #ef4444;
            color: white;
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="status-badge">NEW CLAIM</div>
            <h1>Claim Review Required</h1>
          </div>

          <div class="content">
            <div style="text-align: center;">
              <span class="priority-badge">${data.priority.toUpperCase()} PRIORITY</span>
              ${data.fnolSummary?.hasComprehensiveReport ? `
                <span class="fnol-badge">📋 COMPLETE FNOL REPORT</span>
              ` : ''}
            </div>

            <p style="font-size: 16px; color: #111827; margin-bottom: 20px; text-align: center;">
              A new insurance claim has been filed and requires fleet admin review.
            </p>

            ${data.fnolSummary?.hasComprehensiveReport ? `
              <div class="fnol-confirmation">
                <div class="fnol-title">
                  <span>✅</span>
                  <span>Comprehensive FNOL Report Available</span>
                </div>
                <div class="fnol-text">
                  Complete incident documentation has been collected including vehicle condition assessment, environmental conditions, witness information, and all relevant details. Full report accessible in the secure claims portal.
                </div>
              </div>
            ` : ''}

            <div class="info-grid">
              <div class="info-card">
                <div class="info-card-label">Claim ID</div>
                <div class="info-card-value">#${data.claimId.slice(0, 8).toUpperCase()}</div>
              </div>
              <div class="info-card">
                <div class="info-card-label">Booking Code</div>
                <div class="info-card-value">${data.bookingCode}</div>
              </div>
              <div class="info-card">
                <div class="info-card-label">Estimated Cost</div>
                <div class="info-card-value">$${data.estimatedCost.toLocaleString()}</div>
              </div>
              <div class="info-card">
                <div class="info-card-label">Claim Type</div>
                <div class="info-card-value">${data.claimType}</div>
              </div>
            </div>

            <div class="claim-details">
              <h3 style="color: #111827; margin-bottom: 16px; font-size: 16px;">Claim Details</h3>
              <div class="detail-row">
                <span class="detail-label">Vehicle</span>
                <span class="detail-value">${data.carDetails}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Host</span>
                <span class="detail-value">${data.hostName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Guest</span>
                <span class="detail-value">${data.guestName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Incident Date</span>
                <span class="detail-value">${new Date(data.incidentDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Host Tier</span>
                <span class="detail-value">${data.earningsTier}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Insurance Provider</span>
                <span class="detail-value">${data.insuranceProvider}</span>
              </div>
            </div>

            <div class="action-required">
              <div class="action-title">📋 Action Required</div>
              <ul class="action-list">
                <li>Review claim documentation and photos</li>
                ${data.fnolSummary?.hasComprehensiveReport ? '<li>Review comprehensive FNOL incident report</li>' : ''}
                <li>Verify insurance coverage hierarchy</li>
                <li>Assess damage estimate accuracy</li>
                <li>Review host and guest history</li>
                <li>Approve or deny claim within 24-48 hours</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${data.reviewUrl}" class="btn">REVIEW CLAIM NOW</a>
            </div>

            <div class="quick-actions">
              <a href="${data.reviewUrl}?action=approve" class="quick-action-btn btn-approve">Quick Approve</a>
              <a href="${data.reviewUrl}?action=deny" class="quick-action-btn btn-deny">Quick Deny</a>
            </div>

            <p style="color: #6b7280; font-size: 13px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
              <strong>Fleet Admin Portal</strong><br>
              Need help? Contact tech support at <a href="mailto:info@itwhip.com" style="color: #3b82f6;">info@itwhip.com</a>
            </p>
          </div>

          <div class="footer">
            <p class="footer-text">
              ItWhip Fleet Management System<br>
              © 2024 ItWhip. All rights reserved.<br>
              <a href="https://itwhip.com/fleet" style="color: #3b82f6; text-decoration: none;">Fleet Dashboard</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
NEW CLAIM TO REVIEW - ${data.priority.toUpperCase()} PRIORITY

A new insurance claim has been filed and requires fleet admin review.

${data.fnolSummary?.hasComprehensiveReport ? `
✅ COMPREHENSIVE FNOL REPORT AVAILABLE
Complete incident documentation has been collected including vehicle condition assessment, environmental conditions, witness information, and all relevant details. Full report accessible in the secure claims portal.
` : ''}

CLAIM SUMMARY:
- Claim ID: #${data.claimId.slice(0, 8).toUpperCase()}
- Booking Code: ${data.bookingCode}
- Estimated Cost: $${data.estimatedCost.toLocaleString()}
- Claim Type: ${data.claimType}
- Priority: ${data.priority.toUpperCase()}

CLAIM DETAILS:
- Vehicle: ${data.carDetails}
- Host: ${data.hostName}
- Guest: ${data.guestName}
- Incident Date: ${new Date(data.incidentDate).toLocaleDateString()}
- Host Tier: ${data.earningsTier}
- Insurance Provider: ${data.insuranceProvider}

ACTION REQUIRED:
□ Review claim documentation and photos
${data.fnolSummary?.hasComprehensiveReport ? '□ Review comprehensive FNOL incident report\n' : ''}□ Verify insurance coverage hierarchy
□ Assess damage estimate accuracy
□ Review host and guest history
□ Approve or deny claim within 24-48 hours

REVIEW CLAIM: ${data.reviewUrl}

Quick Actions:
- Approve: ${data.reviewUrl}?action=approve
- Deny: ${data.reviewUrl}?action=deny

Fleet Admin Portal
Need help? Contact tech support at info@itwhip.com

ItWhip Fleet Management System
© 2024 ItWhip. All rights reserved.
  `

  return { subject, html, text }
}