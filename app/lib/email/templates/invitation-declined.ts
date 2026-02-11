// app/lib/email/templates/invitation-declined.ts

import { InvitationDeclinedData, EmailTemplate } from '../types'
import { escapeHtml } from '../sanitize'

/**
 * Email template for declined fleet management invitations
 * Sent to the sender when their invitation is declined
 */
export function getInvitationDeclinedTemplate(data: InvitationDeclinedData): EmailTemplate {
  const isOwnerInvitingManager = data.invitationType === 'OWNER_INVITES_MANAGER'

  const subject = data.wasCounterOffer
    ? `Counter-offer declined by ${escapeHtml(data.declinerName)}`
    : `Fleet invitation declined by ${escapeHtml(data.declinerName)}`

  const vehiclesList = data.vehicles?.map(v => `${v.year} ${v.make} ${v.model}`).join(', ') || 'Not specified'

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
          .declined-box {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
          }
          .declined-box .icon {
            width: 48px;
            height: 48px;
            background: #ef4444;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 12px;
          }
          .declined-box .icon svg {
            width: 24px;
            height: 24px;
            stroke: white;
          }
          .declined-box h3 {
            font-size: 18px;
            color: #991b1b;
            margin: 0 0 8px 0;
          }
          .declined-box p {
            font-size: 14px;
            color: #b91c1c;
            margin: 0;
          }
          .decliner-box {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin: 20px 0;
          }
          .decliner-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #9ca3af;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 600;
          }
          .decliner-info {
            margin-left: 16px;
            text-align: left;
          }
          .decliner-info h4 {
            font-size: 16px;
            margin: 0 0 4px 0;
          }
          .decliner-info p {
            font-size: 14px;
            color: #6b7280;
            margin: 0;
          }
          .reason-box {
            background: #f9fafb;
            border-left: 4px solid #6b7280;
            padding: 16px;
            margin: 20px 0;
            font-size: 14px;
            color: #374151;
          }
          .reason-box strong {
            display: block;
            margin-bottom: 8px;
            color: #111827;
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
            color: #6b7280;
          }
          .detail-row {
            padding: 8px 0;
            font-size: 14px;
            color: #6b7280;
          }
          .suggestions-box {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
          }
          .suggestions-box h3 {
            font-size: 16px;
            margin: 0 0 12px 0;
            color: #1e40af;
          }
          .suggestions-box ul {
            margin: 0 0 0 20px;
            padding: 0;
            font-size: 14px;
            color: #1e3a8a;
          }
          .suggestions-box li {
            margin: 8px 0;
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
            .decliner-box { flex-direction: column; text-align: center; }
            .decliner-info { margin: 12px 0 0 0; text-align: center; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="status-badge">Declined</div>
            <h1>${data.wasCounterOffer ? 'Counter-Offer Declined' : 'Invitation Declined'}</h1>
            <p>The fleet management ${data.wasCounterOffer ? 'negotiation' : 'invitation'} was not accepted</p>
          </div>

          <div class="content">
            <div class="declined-box">
              <div class="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
              <h3>${data.wasCounterOffer ? 'Negotiation Ended' : 'Invitation Declined'}</h3>
              <p>${escapeHtml(data.declinerName)} has declined ${data.wasCounterOffer ? 'your counter-offer' : 'the invitation'}</p>
            </div>

            <p style="font-size: 16px; margin-bottom: 16px;">Hi ${escapeHtml(data.recipientName)},</p>

            <p style="font-size: 14px; color: #4b5563; margin-bottom: 20px;">
              Unfortunately, ${escapeHtml(data.declinerName)} has decided not to proceed with the fleet management
              ${data.wasCounterOffer ? 'agreement after reviewing your counter-offer' : 'invitation'}.
            </p>

            <div class="decliner-box">
              <div class="decliner-avatar">
                ${data.declinerName.charAt(0).toUpperCase()}
              </div>
              <div class="decliner-info">
                <h4>${escapeHtml(data.declinerName)}</h4>
                <p>${data.declinerEmail}</p>
              </div>
            </div>

            ${data.declineReason ? `
              <div class="reason-box">
                <strong>Reason provided:</strong>
                ${data.declineReason}
              </div>
            ` : ''}

            ${data.vehicles && data.vehicles.length > 0 ? `
              <div class="details-box">
                <h3>Vehicles in Request</h3>
                ${data.vehicles.map(v => `
                  <div class="detail-row">${v.year} ${v.make} ${v.model}</div>
                `).join('')}
              </div>
            ` : ''}

            <div class="suggestions-box">
              <h3>What You Can Do</h3>
              <ul>
                ${isOwnerInvitingManager ? `
                  <li>Look for other fleet managers on ItWhip</li>
                  <li>Consider adjusting your commission terms for future invitations</li>
                  <li>Manage your vehicles yourself using the host dashboard</li>
                ` : `
                  <li>Reach out to other vehicle owners on ItWhip</li>
                  <li>Consider adjusting your proposed terms</li>
                  <li>Build your fleet profile to attract more owners</li>
                `}
                <li>Contact support if you have questions</li>
              </ul>
            </div>

            <div class="button-container">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'}/host/dashboard" class="button">Go to Dashboard</a>
            </div>

            <p style="text-align: center; margin-top: 24px; font-size: 14px; color: #6b7280;">
              Questions? Contact info@itwhip.com
            </p>
          </div>

          <div class="footer">
            <strong>ITWHIP</strong><br>
            Premium Vehicle Rentals<br>
            <span style="font-size: 11px;">Fleet Management</span>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
${data.wasCounterOffer ? 'Counter-Offer' : 'Invitation'} Declined

Hi ${escapeHtml(data.recipientName)},

Unfortunately, ${escapeHtml(data.declinerName)} has decided not to proceed with the fleet management
${data.wasCounterOffer ? 'agreement after reviewing your counter-offer' : 'invitation'}.

DECLINED BY: ${escapeHtml(data.declinerName)} (${data.declinerEmail})

${data.declineReason ? `REASON PROVIDED:\n${data.declineReason}\n` : ''}
${data.vehicles && data.vehicles.length > 0 ? `VEHICLES:\n${vehiclesList}\n` : ''}
WHAT YOU CAN DO:
${isOwnerInvitingManager
  ? `- Look for other fleet managers on ItWhip
- Consider adjusting your commission terms for future invitations
- Manage your vehicles yourself using the host dashboard`
  : `- Reach out to other vehicle owners on ItWhip
- Consider adjusting your proposed terms
- Build your fleet profile to attract more owners`
}
- Contact support if you have questions

Questions? Contact info@itwhip.com

ITWHIP - Premium Vehicle Rentals
  `

  return { subject, html, text }
}
