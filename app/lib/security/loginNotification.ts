// app/lib/security/loginNotification.ts
// Sends email notification when a user logs in from a new IP address

import { prisma } from '@/app/lib/database/prisma'

// Parse user-agent into a human-readable device description
function parseDevice(ua: string): string {
  if (!ua || ua === 'unknown') return 'Unknown device'

  let device = 'Desktop'
  if (/mobile|android|iphone|ipad/i.test(ua)) device = 'Mobile'
  if (/tablet|ipad/i.test(ua)) device = 'Tablet'

  let browser = 'Unknown browser'
  if (/firefox/i.test(ua)) browser = 'Firefox'
  else if (/edg/i.test(ua)) browser = 'Edge'
  else if (/chrome/i.test(ua)) browser = 'Chrome'
  else if (/safari/i.test(ua)) browser = 'Safari'
  else if (/opera|opr/i.test(ua)) browser = 'Opera'

  let os = ''
  if (/windows/i.test(ua)) os = 'Windows'
  else if (/mac os/i.test(ua)) os = 'macOS'
  else if (/linux/i.test(ua)) os = 'Linux'
  else if (/android/i.test(ua)) os = 'Android'
  else if (/iphone|ipad/i.test(ua)) os = 'iOS'

  return `${device} - ${browser}${os ? ` on ${os}` : ''}`
}

// Get city/country from IP using geoip-lite (already in serverExternalPackages)
function getLocationFromIp(ip: string): { city: string; country: string } {
  try {
    // geoip-lite is a server-side only package
    const geoip = require('geoip-lite')
    const geo = geoip.lookup(ip)
    if (geo) {
      return {
        city: geo.city || 'Unknown city',
        country: geo.country || 'Unknown'
      }
    }
  } catch {
    // geoip-lite may not be available in all environments
  }
  return { city: 'Unknown location', country: '' }
}

/**
 * Check if this IP is new for the user and send a notification email if so.
 * Non-blocking — errors are caught and logged, never thrown.
 */
export async function checkNewDeviceAndNotify(opts: {
  userId: string
  email: string
  name?: string | null
  ip: string
  userAgent: string
}): Promise<void> {
  const { userId, email, name, ip, userAgent } = opts

  try {
    // Query distinct IPs from this user's recent sessions
    const recentSessions = await prisma.session.findMany({
      where: { userId },
      select: { ipAddress: true },
      distinct: ['ipAddress'],
      take: 100,
    })

    const knownIPs = new Set(recentSessions.map(s => s.ipAddress))

    // If IP is already known, no notification needed
    if (knownIPs.has(ip)) return

    // Skip notification for the very first login (no previous sessions = new account)
    if (knownIPs.size === 0) return

    // New IP detected — send notification
    const location = getLocationFromIp(ip)
    const device = parseDevice(userAgent)
    const loginTime = new Date().toLocaleString('en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
    })
    const locationStr = location.country
      ? `${location.city}, ${location.country}`
      : location.city

    console.log(`[Security] New device login for ${email} from ${locationStr} (${ip})`)

    const { sendEmail } = await import('@/app/lib/email/sender')

    await sendEmail(
      email,
      'New Login to Your ItWhip Account',
      `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr><td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr><td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ItWhip</h1>
                  </td></tr>
                  <tr><td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">New Login Detected</h2>
                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Hi${name ? ` ${name}` : ''},
                    </p>
                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      We noticed a new login to your ItWhip account from a device or location we haven't seen before.
                    </p>
                    <div style="padding: 20px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 20px 0;">
                      <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 22px;">
                        <strong>Location:</strong> ${locationStr}<br>
                        <strong>Device:</strong> ${device}<br>
                        <strong>Time:</strong> ${loginTime}
                      </p>
                    </div>
                    <p style="margin: 0 0 10px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      If this was you, no action is needed.
                    </p>
                    <div style="padding: 20px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px; margin-top: 30px;">
                      <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 20px;">
                        <strong>Wasn't you?</strong><br>
                        Change your password immediately and contact us at info@itwhip.com
                      </p>
                    </div>
                  </td></tr>
                  <tr><td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">ItWhip Technologies, Inc.</p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; 2026 ItWhip. All rights reserved.</p>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>
      `,
      `New Login Detected\n\nHi${name ? ` ${name}` : ''},\n\nWe noticed a new login to your ItWhip account:\n\nLocation: ${locationStr}\nDevice: ${device}\nTime: ${loginTime}\n\nIf this was you, no action is needed.\n\nWasn't you? Change your password immediately and contact us at info@itwhip.com\n\nItWhip Technologies, Inc.`
    )
  } catch (err) {
    // Never block login flow — just log the error
    console.error(`[Security] Failed to check/send new device notification for ${email}:`, err)
  }
}
