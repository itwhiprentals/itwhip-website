import { escapeHtml } from '../sanitize'
// Security alert when user logs in from new device
export function getNewDeviceAlertTemplate(
  name: string | null,
  deviceInfo: {
    browser: string
    os: string
    ip: string
    location: string
    time: string
  }
) {
  return {
    subject: 'New Device Sign-In Alert - ItWhip',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Device Sign-In Alert</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #5D3FD3; font-size: 32px; font-weight: bold; margin: 0;">ItWhip</h1>
          </div>

          <!-- Main Card -->
          <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <!-- Alert Icon -->
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background: #fef3c7; border-radius: 50%; padding: 16px;">
                <span style="font-size: 32px;">🔔</span>
              </div>
            </div>

            <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">
              New Device Sign-In Detected
            </h2>

            <p style="color: #6b7280; font-size: 16px; line-height: 24px; margin: 0 0 32px 0;">
              ${name ? `Hi ${escapeHtml(name)},` : 'Hi,'}<br><br>
              We detected a sign-in to your ItWhip account from a new device. If this was you, no action is needed. If not, please secure your account immediately.
            </p>

            <!-- Device Details -->
            <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin: 0 0 32px 0;">
              <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">
                Sign-In Details:
              </h3>

              <div style="margin-bottom: 12px;">
                <div style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                  TIME
                </div>
                <div style="color: #111827; font-size: 14px; font-weight: 500;">
                  ${deviceInfo.time}
                </div>
              </div>

              <div style="margin-bottom: 12px;">
                <div style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                  DEVICE
                </div>
                <div style="color: #111827; font-size: 14px; font-weight: 500;">
                  ${deviceInfo.browser} on ${deviceInfo.os}
                </div>
              </div>

              <div style="margin-bottom: 12px;">
                <div style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                  LOCATION
                </div>
                <div style="color: #111827; font-size: 14px; font-weight: 500;">
                  ${deviceInfo.location}
                </div>
              </div>

              <div>
                <div style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                  IP ADDRESS
                </div>
                <div style="color: #111827; font-size: 14px; font-weight: 500; font-family: 'Courier New', monospace;">
                  ${deviceInfo.ip}
                </div>
              </div>
            </div>

            <!-- Action Required -->
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin: 0 0 24px 0;">
              <p style="color: #991b1b; font-size: 14px; line-height: 20px; margin: 0;">
                <strong>If this wasn't you:</strong> Someone may have accessed your account. Please change your password immediately and contact support.
              </p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="https://itwhip.com/profile?tab=security" style="display: inline-block; background: #5D3FD3; color: white; font-size: 16px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px;">
                Review Account Security
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 20px; margin: 0; text-align: center;">
              If this was you, you can safely ignore this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 32px;">
            <p style="color: #9ca3af; font-size: 12px; line-height: 18px; margin: 0 0 8px 0;">
              This is a security alert from ItWhip. We sent this email to keep your account secure.
            </p>
            <p style="color: #9ca3af; font-size: 12px; line-height: 18px; margin: 0;">
              <a href="https://itwhip.com" style="color: #5D3FD3; text-decoration: none;">ItWhip.com</a> |
              <a href="https://itwhip.com/support" style="color: #5D3FD3; text-decoration: none;">Support</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
New Device Sign-In Detected

${name ? `Hi ${escapeHtml(name)},` : 'Hi,'}

We detected a sign-in to your ItWhip account from a new device. If this was you, no action is needed. If not, please secure your account immediately.

SIGN-IN DETAILS:
Time: ${deviceInfo.time}
Device: ${deviceInfo.browser} on ${deviceInfo.os}
Location: ${deviceInfo.location}
IP Address: ${deviceInfo.ip}

If this wasn't you: Someone may have accessed your account. Please change your password immediately and contact support.

Review Account Security: https://itwhip.com/profile?tab=security

If this was you, you can safely ignore this email.

This is a security alert from ItWhip. We sent this email to keep your account secure.
ItWhip.com | Support: https://itwhip.com/support
    `
  }
}
