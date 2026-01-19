// app/lib/email/templates/fleet-alert-digest.ts
// Email template for fleet alert notifications

interface AlertItem {
  id: string
  type: string
  category: 'partner' | 'vehicle' | 'booking' | 'document' | 'financial' | 'claim' | 'review' | 'security'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  link?: string
}

interface FleetAlertDigestData {
  recipientName?: string
  alerts: AlertItem[]
  summary: {
    total: number
    high: number
    medium: number
    low: number
  }
  digestType: 'instant' | 'hourly' | 'daily' | 'weekly'
  dashboardUrl: string
}

const priorityColors = {
  high: '#dc2626',    // red-600
  medium: '#f59e0b',  // amber-500
  low: '#3b82f6'      // blue-500
}

const priorityBadges = {
  high: `<span style="background-color: #fef2f2; color: #dc2626; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">HIGH</span>`,
  medium: `<span style="background-color: #fffbeb; color: #f59e0b; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">MEDIUM</span>`,
  low: `<span style="background-color: #eff6ff; color: #3b82f6; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">LOW</span>`
}

const categoryIcons: Record<string, string> = {
  partner: '🏢',
  vehicle: '🚗',
  booking: '📅',
  document: '📄',
  financial: '💰',
  claim: '⚠️',
  review: '⭐',
  security: '🔒'
}

export function generateFleetAlertDigestEmail(data: FleetAlertDigestData): { html: string; text: string; subject: string } {
  const { recipientName, alerts, summary, digestType, dashboardUrl } = data

  const digestTypeLabels = {
    instant: 'Alert',
    hourly: 'Hourly Digest',
    daily: 'Daily Digest',
    weekly: 'Weekly Digest'
  }

  const subject = summary.high > 0
    ? `🚨 Fleet Alert: ${summary.high} High Priority Issue${summary.high > 1 ? 's' : ''} Require Attention`
    : `📊 Fleet ${digestTypeLabels[digestType]}: ${summary.total} Notification${summary.total > 1 ? 's' : ''}`

  // Group alerts by category
  const alertsByCategory: Record<string, AlertItem[]> = {}
  alerts.forEach(alert => {
    if (!alertsByCategory[alert.category]) {
      alertsByCategory[alert.category] = []
    }
    alertsByCategory[alert.category].push(alert)
  })

  // Generate alert rows HTML
  const alertRowsHtml = alerts.slice(0, 20).map(alert => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <div style="flex-shrink: 0; font-size: 20px;">
            ${categoryIcons[alert.category as keyof typeof categoryIcons] || '📌'}
          </div>
          <div style="flex-grow: 1;">
            <div style="margin-bottom: 4px;">
              ${priorityBadges[alert.priority]}
              <span style="color: #6b7280; font-size: 12px; margin-left: 8px; text-transform: capitalize;">${alert.category}</span>
            </div>
            <div style="font-weight: 600; color: #111827; margin-bottom: 2px;">${alert.title}</div>
            <div style="color: #6b7280; font-size: 13px;">${alert.description}</div>
            ${alert.link ? `<a href="${dashboardUrl}${alert.link}" style="color: #2563eb; font-size: 13px; text-decoration: none; margin-top: 4px; display: inline-block;">View Details →</a>` : ''}
          </div>
        </div>
      </td>
    </tr>
  `).join('')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fleet Alert Digest</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-width: 100%;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 32px; border-radius: 12px 12px 0 0;">
              <table width="100%">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">
                      Fleet ${digestTypeLabels[digestType]}
                    </h1>
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                      ${recipientName ? `Hi ${recipientName}, here's` : 'Here\'s'} your fleet status update
                    </p>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <img src="https://itwhip.com/logo-white.png" alt="ItWhip" width="80" style="max-width: 80px;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Summary Cards -->
          <tr>
            <td style="background-color: white; padding: 24px;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="25%" align="center" style="padding: 12px;">
                    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px;">
                      <div style="font-size: 28px; font-weight: 700; color: #111827;">${summary.total}</div>
                      <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Total Alerts</div>
                    </div>
                  </td>
                  <td width="25%" align="center" style="padding: 12px;">
                    <div style="background-color: #fef2f2; border-radius: 8px; padding: 16px;">
                      <div style="font-size: 28px; font-weight: 700; color: #dc2626;">${summary.high}</div>
                      <div style="font-size: 12px; color: #dc2626; margin-top: 4px;">High Priority</div>
                    </div>
                  </td>
                  <td width="25%" align="center" style="padding: 12px;">
                    <div style="background-color: #fffbeb; border-radius: 8px; padding: 16px;">
                      <div style="font-size: 28px; font-weight: 700; color: #f59e0b;">${summary.medium}</div>
                      <div style="font-size: 12px; color: #f59e0b; margin-top: 4px;">Medium</div>
                    </div>
                  </td>
                  <td width="25%" align="center" style="padding: 12px;">
                    <div style="background-color: #eff6ff; border-radius: 8px; padding: 16px;">
                      <div style="font-size: 28px; font-weight: 700; color: #3b82f6;">${summary.low}</div>
                      <div style="font-size: 12px; color: #3b82f6; margin-top: 4px;">Low</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Alerts List -->
          <tr>
            <td style="background-color: white; padding: 0 24px 24px;">
              <h2 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111827;">
                Active Alerts ${alerts.length > 20 ? `(Showing 20 of ${alerts.length})` : ''}
              </h2>
              <table width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                ${alertRowsHtml}
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="background-color: white; padding: 0 24px 32px; border-radius: 0 0 12px 12px;">
              <table width="100%">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}/fleet" style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                      View Fleet Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px; text-align: center;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">
                You're receiving this because you're subscribed to fleet alerts.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                <a href="${dashboardUrl}/fleet/settings" style="color: #6b7280; text-decoration: underline;">Manage notification settings</a>
                &nbsp;|&nbsp;
                <a href="${dashboardUrl}/fleet/settings" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
              </p>
              <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} ItWhip Rentals. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  // Plain text version
  const textAlerts = alerts.slice(0, 20).map(alert =>
    `[${alert.priority.toUpperCase()}] ${alert.title}\n${alert.description}${alert.link ? `\nView: ${dashboardUrl}${alert.link}` : ''}`
  ).join('\n\n')

  const text = `
Fleet ${digestTypeLabels[digestType]}
${recipientName ? `Hi ${recipientName},` : ''}

Summary:
- Total Alerts: ${summary.total}
- High Priority: ${summary.high}
- Medium: ${summary.medium}
- Low: ${summary.low}

Active Alerts:
${textAlerts}

View your fleet dashboard: ${dashboardUrl}/fleet

---
You're receiving this because you're subscribed to fleet alerts.
Manage settings: ${dashboardUrl}/fleet/settings
`

  return { html, text, subject }
}

export default generateFleetAlertDigestEmail
