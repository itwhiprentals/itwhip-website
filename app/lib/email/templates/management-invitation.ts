// app/lib/email/templates/management-invitation.ts

import { ManagementInvitationData, EmailTemplate } from '../types'

/**
 * Email template for fleet management invitations
 * Sent when an owner invites a manager OR a manager invites an owner
 */
export function getManagementInvitationTemplate(data: ManagementInvitationData): EmailTemplate {
  const isOwnerInvitingManager = data.invitationType === 'OWNER_INVITES_MANAGER'

  const subject = isOwnerInvitingManager
    ? `${data.senderName} wants you to manage their vehicle${data.vehicles && data.vehicles.length > 1 ? 's' : ''}`
    : `${data.senderName} wants to manage your vehicles on ITWhip`

  const roleDescription = isOwnerInvitingManager
    ? 'manage their vehicle' + (data.vehicles && data.vehicles.length > 1 ? 's' : '')
    : 'become a vehicle owner in their fleet'

  const vehiclesList = data.vehicles?.map(v => `${v.year} ${v.make} ${v.model}`).join(', ') || 'Not specified'

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
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
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
          .sender-box {
            display: flex;
            align-items: center;
            padding: 20px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin: 20px 0;
          }
          .sender-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #6366f1;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 600;
            margin-right: 16px;
          }
          .sender-info h3 {
            font-size: 18px;
            margin: 0 0 4px 0;
          }
          .sender-info p {
            font-size: 14px;
            color: #6b7280;
            margin: 0;
          }
          .commission-box {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
          }
          .commission-box h3 {
            font-size: 16px;
            margin: 0 0 16px 0;
            color: #92400e;
          }
          .commission-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
          }
          .commission-row.highlight {
            background: rgba(251, 191, 36, 0.2);
            margin: 0 -12px;
            padding: 8px 12px;
            border-radius: 4px;
          }
          .commission-note {
            font-size: 12px;
            color: #92400e;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid rgba(251, 191, 36, 0.3);
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
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
            font-size: 14px;
          }
          .detail-row:last-child {
            border-bottom: none;
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
            background: #6366f1;
            color: white;
            text-decoration: none;
            font-weight: 500;
            border-radius: 6px;
          }
          .button-secondary {
            display: block;
            text-align: center;
            margin-top: 12px;
            color: #6366f1;
            text-decoration: none;
            font-size: 14px;
          }
          .message-box {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 16px;
            margin: 20px 0;
            font-size: 14px;
            color: #1e40af;
          }
          .message-box strong {
            display: block;
            margin-bottom: 8px;
          }
          .expires-note {
            text-align: center;
            font-size: 13px;
            color: #6b7280;
            margin: 20px 0;
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
            .sender-box { flex-direction: column; text-align: center; }
            .sender-avatar { margin: 0 0 12px 0; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="status-badge">Fleet Invitation</div>
            <h1>${isOwnerInvitingManager ? 'Vehicle Management Invitation' : 'Fleet Partnership Invitation'}</h1>
            <p>You've been invited to ${roleDescription}</p>
          </div>

          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Hi ${data.recipientName || 'there'},</p>

            <p style="font-size: 14px; color: #4b5563; margin-bottom: 20px;">
              ${isOwnerInvitingManager
                ? `${data.senderName} has invited you to manage their vehicle${data.vehicles && data.vehicles.length > 1 ? 's' : ''} on ITWhip. Review the proposed terms below.`
                : `${data.senderName} operates a fleet on ITWhip and would like you to add your vehicle${data.vehicles && data.vehicles.length > 1 ? 's' : ''} to their managed fleet.`
              }
            </p>

            <div class="sender-box">
              <div class="sender-avatar">
                ${data.senderPhoto
                  ? `<img src="${data.senderPhoto}" alt="${data.senderName}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;" />`
                  : data.senderName.charAt(0).toUpperCase()
                }
              </div>
              <div class="sender-info">
                <h3>${data.senderName}</h3>
                <p>${data.senderEmail}</p>
                <p style="margin-top: 4px; color: #6366f1; font-weight: 500;">
                  ${isOwnerInvitingManager ? 'Vehicle Owner' : 'Fleet Manager'}
                </p>
              </div>
            </div>

            ${data.message ? `
              <div class="message-box">
                <strong>Message from ${data.senderName}:</strong>
                ${data.message}
              </div>
            ` : ''}

            ${data.vehicles && data.vehicles.length > 0 ? `
              <div class="details-box">
                <h3>Vehicle${data.vehicles.length > 1 ? 's' : ''} Included</h3>
                ${data.vehicles.map(v => `
                  <div class="detail-row">
                    <span>${v.year} ${v.make} ${v.model}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <div class="commission-box">
              <h3>Proposed Commission Split</h3>
              <div class="commission-row">
                <span>Platform Fee (non-negotiable)</span>
                <strong>10%</strong>
              </div>
              <div class="commission-row">
                <span>Remaining Revenue</span>
                <strong>90%</strong>
              </div>
              <div style="height: 1px; background: rgba(251, 191, 36, 0.3); margin: 12px 0;"></div>
              <div class="commission-row highlight">
                <span>Owner's Share</span>
                <strong>${data.proposedOwnerPercent}% (${data.effectiveOwnerPercent}% of total)</strong>
              </div>
              <div class="commission-row highlight">
                <span>Manager's Share</span>
                <strong>${data.proposedManagerPercent}% (${data.effectiveManagerPercent}% of total)</strong>
              </div>
              <p class="commission-note">
                Example: On a $100 booking, platform takes $10, owner gets $${(data.effectiveOwnerPercent).toFixed(0)}, manager gets $${(data.effectiveManagerPercent).toFixed(0)}.
              </p>
            </div>

            <div class="details-box">
              <h3>Manager Permissions</h3>
              <ul class="permissions-list">
                ${permissionsList.map(p => `<li>${p}</li>`).join('')}
              </ul>
            </div>

            <div class="button-container">
              <a href="${data.inviteUrl}" class="button">Review & Respond</a>
              <a href="${data.inviteUrl}" class="button-secondary">View full details or counter-offer</a>
            </div>

            <p class="expires-note">
              This invitation expires on ${data.expiresAt}
            </p>

            <p style="text-align: center; margin-top: 24px; font-size: 14px; color: #6b7280;">
              Questions? Contact info@itwhip.com
            </p>
          </div>

          <div class="footer">
            <strong>ITWHIP</strong><br>
            Premium Vehicle Rentals<br>
            <span style="font-size: 11px;">You're receiving this because ${data.senderEmail} invited you to ITWhip.</span>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Fleet Management Invitation

Hi ${data.recipientName || 'there'},

${isOwnerInvitingManager
  ? `${data.senderName} has invited you to manage their vehicle${data.vehicles && data.vehicles.length > 1 ? 's' : ''} on ITWhip.`
  : `${data.senderName} operates a fleet on ITWhip and would like you to add your vehicle${data.vehicles && data.vehicles.length > 1 ? 's' : ''} to their managed fleet.`
}

FROM: ${data.senderName} (${data.senderEmail})
ROLE: ${isOwnerInvitingManager ? 'Vehicle Owner' : 'Fleet Manager'}

${data.message ? `MESSAGE:\n${data.message}\n` : ''}
${data.vehicles && data.vehicles.length > 0 ? `VEHICLES:\n${vehiclesList}\n` : ''}
PROPOSED COMMISSION SPLIT:
- Platform Fee: 10% (non-negotiable)
- Owner's Share: ${data.proposedOwnerPercent}% of remaining (${data.effectiveOwnerPercent}% of total)
- Manager's Share: ${data.proposedManagerPercent}% of remaining (${data.effectiveManagerPercent}% of total)

MANAGER PERMISSIONS:
${permissionsList.map(p => `- ${p}`).join('\n')}

Review and respond: ${data.inviteUrl}

This invitation expires on ${data.expiresAt}

Questions? Contact info@itwhip.com

ITWHIP - Premium Vehicle Rentals
  `

  return { subject, html, text }
}
