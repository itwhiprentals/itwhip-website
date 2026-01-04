// app/lib/email/templates/invitation-accepted.ts

import { InvitationAcceptedData, EmailTemplate } from '../types'

/**
 * Email template for accepted fleet management invitations
 * Sent to both owner and manager when agreement is finalized
 */
export function getInvitationAcceptedTemplate(data: InvitationAcceptedData): EmailTemplate {
  const isOwner = data.role === 'owner'

  const subject = `Fleet Agreement Confirmed - ${data.vehicles.map(v => `${v.year} ${v.make} ${v.model}`).join(', ')}`

  const vehiclesList = data.vehicles.map(v => `${v.year} ${v.make} ${v.model}`).join(', ')

  const permissionsList = [
    data.permissions.canEditListing && 'Edit vehicle listings',
    data.permissions.canAdjustPricing && 'Adjust pricing',
    data.permissions.canCommunicateGuests && 'Communicate with guests',
    data.permissions.canApproveBookings && 'Approve/decline bookings',
    data.permissions.canHandleIssues && 'Handle issues and claims'
  ].filter(Boolean)

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
            font-size: 26px;
            font-weight: 500;
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
          .success-box {
            background: #d1fae5;
            border: 1px solid #6ee7b7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
          }
          .success-box .checkmark {
            width: 48px;
            height: 48px;
            background: #10b981;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 12px;
          }
          .success-box .checkmark svg {
            width: 24px;
            height: 24px;
            stroke: white;
          }
          .success-box h3 {
            font-size: 18px;
            color: #065f46;
            margin: 0 0 8px 0;
          }
          .success-box p {
            font-size: 14px;
            color: #047857;
            margin: 0;
          }
          .partner-box {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin: 20px 0;
          }
          .partner-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #6366f1;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 600;
          }
          .partner-info {
            margin-left: 16px;
            text-align: left;
          }
          .partner-info h4 {
            font-size: 16px;
            margin: 0 0 4px 0;
          }
          .partner-info p {
            font-size: 14px;
            color: #6b7280;
            margin: 0;
          }
          .agreement-box {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
          }
          .agreement-box h3 {
            font-size: 16px;
            margin: 0 0 16px 0;
            color: #92400e;
          }
          .agreement-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
            border-bottom: 1px solid rgba(251, 191, 36, 0.3);
          }
          .agreement-row:last-child {
            border-bottom: none;
          }
          .your-earnings {
            background: rgba(16, 185, 129, 0.1);
            border: 2px solid #10b981;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            text-align: center;
          }
          .your-earnings h4 {
            font-size: 14px;
            color: #065f46;
            margin: 0 0 8px 0;
          }
          .your-earnings .amount {
            font-size: 32px;
            font-weight: 700;
            color: #059669;
          }
          .your-earnings p {
            font-size: 12px;
            color: #047857;
            margin: 8px 0 0 0;
          }
          .details-box {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .details-box h3 {
            font-size: 16px;
            margin: 0 0 16px 0;
          }
          .permissions-list {
            margin: 0;
            padding: 0 0 0 20px;
          }
          .permissions-list li {
            margin: 8px 0;
            font-size: 14px;
            color: #374151;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: #10b981;
            color: white;
            text-decoration: none;
            font-weight: 500;
            border-radius: 6px;
          }
          .next-steps {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
          }
          .next-steps h3 {
            font-size: 16px;
            margin: 0 0 12px 0;
            color: #166534;
          }
          .next-steps ol {
            margin: 0 0 0 20px;
            padding: 0;
            font-size: 14px;
            color: #15803d;
          }
          .next-steps li {
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
          @media only screen and (max-width: 600px) {
            .header { padding: 30px 16px; }
            .header h1 { font-size: 22px; }
            .content { padding: 20px 16px; }
            .partner-box { flex-direction: column; text-align: center; }
            .partner-info { margin: 12px 0 0 0; text-align: center; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="status-badge">Agreement Confirmed</div>
            <h1>Fleet Partnership Active</h1>
            <p>Your vehicle management agreement is now in effect</p>
          </div>

          <div class="content">
            <div class="success-box">
              <div class="checkmark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h3>Agreement Finalized!</h3>
              <p>The fleet management agreement has been accepted and is now active.</p>
            </div>

            <p style="font-size: 16px; margin-bottom: 16px;">Hi ${data.recipientName},</p>

            <p style="font-size: 14px; color: #4b5563; margin-bottom: 20px;">
              Great news! ${isOwner
                ? `${data.otherPartyName} will now manage your vehicle${data.vehicles.length > 1 ? 's' : ''} on ITWhip.`
                : `You are now managing ${data.otherPartyName}'s vehicle${data.vehicles.length > 1 ? 's' : ''} on ITWhip.`
              }
            </p>

            <div class="partner-box">
              <div class="partner-avatar">
                ${data.otherPartyName.charAt(0).toUpperCase()}
              </div>
              <div class="partner-info">
                <h4>${data.otherPartyName}</h4>
                <p>${data.otherPartyEmail}</p>
                <p style="color: #6366f1; font-weight: 500; margin-top: 4px;">
                  ${isOwner ? 'Your Fleet Manager' : 'Vehicle Owner'}
                </p>
              </div>
            </div>

            <div class="details-box">
              <h3>Vehicle${data.vehicles.length > 1 ? 's' : ''} Under Management</h3>
              ${data.vehicles.map(v => `
                <div style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                  ${v.photo ? `<img src="${v.photo}" alt="${v.make} ${v.model}" style="width: 60px; height: 45px; object-fit: cover; border-radius: 4px; margin-right: 12px;" />` : ''}
                  <span style="font-size: 14px;">${v.year} ${v.make} ${v.model}</span>
                </div>
              `).join('')}
            </div>

            <div class="agreement-box">
              <h3>Agreed Commission Split</h3>
              <div class="agreement-row">
                <span>Platform Fee</span>
                <strong>10%</strong>
              </div>
              <div class="agreement-row">
                <span>Owner's Share (of remaining 90%)</span>
                <strong>${data.finalOwnerPercent}%</strong>
              </div>
              <div class="agreement-row">
                <span>Manager's Share (of remaining 90%)</span>
                <strong>${data.finalManagerPercent}%</strong>
              </div>
              <div class="agreement-row" style="margin-top: 8px; padding-top: 12px; border-top: 1px solid rgba(251, 191, 36, 0.5);">
                <span>Agreement Date</span>
                <strong>${data.agreementDate}</strong>
              </div>
            </div>

            <div class="your-earnings">
              <h4>Your Share of Each Booking</h4>
              <div class="amount">${isOwner ? data.effectiveOwnerPercent : data.effectiveManagerPercent}%</div>
              <p>of total revenue (after platform fee)</p>
            </div>

            <div class="details-box">
              <h3>Manager Permissions</h3>
              <ul class="permissions-list">
                ${permissionsList.map(p => `<li>${p}</li>`).join('')}
              </ul>
            </div>

            <div class="next-steps">
              <h3>What Happens Next?</h3>
              <ol>
                ${isOwner ? `
                  <li>Your manager will handle bookings and guest communications</li>
                  <li>You'll receive your earnings share after each completed trip</li>
                  <li>View your earnings and vehicle status anytime in your dashboard</li>
                  <li>You can pause or terminate management at any time</li>
                ` : `
                  <li>The vehicle${data.vehicles.length > 1 ? 's are' : ' is'} now visible in your fleet dashboard</li>
                  <li>You can edit listings, adjust pricing, and manage bookings</li>
                  <li>Communicate with guests and handle any issues</li>
                  <li>Your earnings are automatically calculated for each booking</li>
                `}
              </ol>
            </div>

            <div class="button-container">
              <a href="${data.dashboardUrl}" class="button">Go to Dashboard</a>
            </div>

            <p style="text-align: center; margin-top: 24px; font-size: 14px; color: #6b7280;">
              Questions? Contact info@itwhip.com
            </p>
          </div>

          <div class="footer">
            <strong>ITWHIP</strong><br>
            Premium Vehicle Rentals<br>
            <span style="font-size: 11px;">Fleet Management Agreement</span>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Fleet Agreement Confirmed

Hi ${data.recipientName},

Great news! ${isOwner
  ? `${data.otherPartyName} will now manage your vehicle${data.vehicles.length > 1 ? 's' : ''} on ITWhip.`
  : `You are now managing ${data.otherPartyName}'s vehicle${data.vehicles.length > 1 ? 's' : ''} on ITWhip.`
}

PARTNER: ${data.otherPartyName} (${data.otherPartyEmail})
ROLE: ${isOwner ? 'Your Fleet Manager' : 'Vehicle Owner'}

VEHICLES:
${vehiclesList}

AGREED COMMISSION SPLIT:
- Platform Fee: 10%
- Owner's Share: ${data.finalOwnerPercent}% (${data.effectiveOwnerPercent}% of total)
- Manager's Share: ${data.finalManagerPercent}% (${data.effectiveManagerPercent}% of total)

YOUR SHARE: ${isOwner ? data.effectiveOwnerPercent : data.effectiveManagerPercent}% of total revenue

MANAGER PERMISSIONS:
${permissionsList.map(p => `- ${p}`).join('\n')}

Agreement Date: ${data.agreementDate}

Go to dashboard: ${data.dashboardUrl}

Questions? Contact info@itwhip.com

ITWHIP - Premium Vehicle Rentals
  `

  return { subject, html, text }
}
