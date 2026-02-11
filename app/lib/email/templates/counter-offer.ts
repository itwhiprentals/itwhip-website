// app/lib/email/templates/counter-offer.ts

import { CounterOfferData, EmailTemplate } from '../types'
import { escapeHtml } from '../sanitize'

/**
 * Email template for counter-offer notifications
 * Sent when either party proposes different commission terms
 */
export function getCounterOfferTemplate(data: CounterOfferData): EmailTemplate {
  const isOwnerInvitingManager = data.invitationType === 'OWNER_INVITES_MANAGER'

  const subject = `Counter-offer from ${data.counterPartyName} - Round ${data.negotiationRound}/${data.maxRounds}`

  const vehiclesList = data.vehicles?.map(v => `${v.year} ${v.make} ${v.model}`).join(', ') || 'Not specified'

  // Determine who benefits from the change
  const ownerChange = data.newOwnerPercent - data.originalOwnerPercent
  const changeDirection = ownerChange > 0 ? 'owner' : ownerChange < 0 ? 'manager' : 'none'

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
          .round-indicator {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            margin: 20px 0;
          }
          .round-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #e5e7eb;
          }
          .round-dot.active {
            background: #f59e0b;
          }
          .round-dot.completed {
            background: #10b981;
          }
          .comparison-box {
            display: flex;
            gap: 16px;
            margin: 24px 0;
          }
          .comparison-column {
            flex: 1;
            padding: 16px;
            border-radius: 8px;
          }
          .comparison-column.old {
            background: #fef2f2;
            border: 1px solid #fecaca;
          }
          .comparison-column.new {
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
          }
          .comparison-column h4 {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0 0 12px 0;
            color: #6b7280;
          }
          .comparison-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 14px;
          }
          .change-indicator {
            text-align: center;
            padding: 12px;
            margin: 16px 0;
            border-radius: 8px;
            font-size: 14px;
          }
          .change-indicator.owner-gains {
            background: #dbeafe;
            color: #1e40af;
          }
          .change-indicator.manager-gains {
            background: #fef3c7;
            color: #92400e;
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
          .warning-box {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            font-size: 14px;
            color: #92400e;
            text-align: center;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: #f59e0b;
            color: white;
            text-decoration: none;
            font-weight: 500;
            border-radius: 6px;
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
            .comparison-box { flex-direction: column; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="status-badge">Counter-Offer</div>
            <h1>New Terms Proposed</h1>
            <p>${data.counterPartyName} has proposed different terms</p>
          </div>

          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Hi ${escapeHtml(data.recipientName)},</p>

            <p style="font-size: 14px; color: #4b5563; margin-bottom: 20px;">
              ${data.counterPartyName} has submitted a counter-offer for the fleet management agreement.
              This is round ${data.negotiationRound} of ${data.maxRounds} maximum negotiation rounds.
            </p>

            <div class="round-indicator">
              ${Array.from({ length: data.maxRounds }, (_, i) => {
                const roundNum = i + 1
                const className = roundNum < data.negotiationRound
                  ? 'completed'
                  : roundNum === data.negotiationRound
                    ? 'active'
                    : ''
                return `<div class="round-dot ${className}"></div>`
              }).join('')}
            </div>

            <div class="comparison-box">
              <div class="comparison-column old">
                <h4>Previous Terms</h4>
                <div class="comparison-row">
                  <span>Owner</span>
                  <strong>${data.originalOwnerPercent}%</strong>
                </div>
                <div class="comparison-row">
                  <span>Manager</span>
                  <strong>${data.originalManagerPercent}%</strong>
                </div>
              </div>
              <div class="comparison-column new">
                <h4>Proposed Terms</h4>
                <div class="comparison-row">
                  <span>Owner</span>
                  <strong>${data.newOwnerPercent}%</strong>
                </div>
                <div class="comparison-row">
                  <span>Manager</span>
                  <strong>${data.newManagerPercent}%</strong>
                </div>
              </div>
            </div>

            <div class="change-indicator ${changeDirection === 'owner' ? 'owner-gains' : 'manager-gains'}">
              ${changeDirection === 'owner'
                ? `Owner share increases by ${Math.abs(ownerChange)}%`
                : changeDirection === 'manager'
                  ? `Manager share increases by ${Math.abs(ownerChange)}%`
                  : 'No change in split'
              }
            </div>

            <p style="text-align: center; font-size: 14px; color: #6b7280; margin: 16px 0;">
              Effective rates (after 10% platform fee):<br>
              <strong>Owner: ${data.effectiveOwnerPercent}%</strong> | <strong>Manager: ${data.effectiveManagerPercent}%</strong>
            </p>

            ${data.counterOfferMessage ? `
              <div class="message-box">
                <strong>Message from ${data.counterPartyName}:</strong>
                ${data.counterOfferMessage}
              </div>
            ` : ''}

            ${data.negotiationRound >= data.maxRounds - 1 ? `
              <div class="warning-box">
                <strong>Final Round Warning</strong><br>
                ${data.negotiationRound === data.maxRounds
                  ? 'This is the final round. You must accept or decline - no more counter-offers allowed.'
                  : 'Only one more counter-offer remaining after this round.'
                }
              </div>
            ` : ''}

            <div class="button-container">
              <a href="${data.respondUrl}" class="button">Review & Respond</a>
            </div>

            <p class="expires-note">
              This counter-offer expires on ${data.expiresAt}<br>
              (Extended by 3 days from original expiration)
            </p>

            <p style="text-align: center; margin-top: 24px; font-size: 14px; color: #6b7280;">
              Questions? Contact info@itwhip.com
            </p>
          </div>

          <div class="footer">
            <strong>ITWHIP</strong><br>
            Premium Vehicle Rentals<br>
            <span style="font-size: 11px;">Fleet Management Negotiation</span>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Counter-Offer Received - Round ${data.negotiationRound}/${data.maxRounds}

Hi ${escapeHtml(data.recipientName)},

${data.counterPartyName} has submitted a counter-offer for the fleet management agreement.

PREVIOUS TERMS:
- Owner: ${data.originalOwnerPercent}%
- Manager: ${data.originalManagerPercent}%

PROPOSED NEW TERMS:
- Owner: ${data.newOwnerPercent}%
- Manager: ${data.newManagerPercent}%

Change: ${changeDirection === 'owner'
  ? `Owner share increases by ${Math.abs(ownerChange)}%`
  : changeDirection === 'manager'
    ? `Manager share increases by ${Math.abs(ownerChange)}%`
    : 'No change'
}

Effective rates (after 10% platform fee):
- Owner: ${data.effectiveOwnerPercent}%
- Manager: ${data.effectiveManagerPercent}%

${data.counterOfferMessage ? `MESSAGE:\n${data.counterOfferMessage}\n` : ''}
${data.negotiationRound >= data.maxRounds - 1
  ? `WARNING: ${data.negotiationRound === data.maxRounds
      ? 'This is the final round. You must accept or decline.'
      : 'Only one more counter-offer remaining.'
    }\n`
  : ''
}
Review and respond: ${data.respondUrl}

This counter-offer expires on ${data.expiresAt}

Questions? Contact info@itwhip.com

ITWHIP - Premium Vehicle Rentals
  `

  return { subject, html, text }
}
