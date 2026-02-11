import { escapeHtml } from '../sanitize'
// Notification email when an OAuth provider is linked to an account

export function getAccountLinkedTemplate(name: string | null, providerName: string) {
  return {
    subject: `${providerName} Sign-In Added to Your ItWhip Account`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(providerName)} Sign-In Added</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #5D3FD3; font-size: 32px; font-weight: bold; margin: 0;">ItWhip</h1>
          </div>

          <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background: #ecfdf5; border-radius: 50%; padding: 16px;">
                <span style="font-size: 32px;">🔗</span>
              </div>
            </div>

            <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">
              ${escapeHtml(providerName)} Sign-In Added
            </h2>

            <p style="color: #6b7280; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
              ${name ? `Hi ${escapeHtml(name)},` : 'Hi,'}<br><br>
              ${escapeHtml(providerName)} Sign-In has been successfully linked to your ItWhip account. You can now sign in using ${escapeHtml(providerName)} in addition to your existing sign-in methods.
            </p>

            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin: 0 0 24px 0;">
              <p style="color: #991b1b; font-size: 14px; line-height: 20px; margin: 0;">
                <strong>Didn't do this?</strong> Someone may have linked their ${escapeHtml(providerName)} account to yours. Please change your password immediately and contact support.
              </p>
            </div>

            <div style="text-align: center;">
              <a href="https://itwhip.com/profile?tab=security" style="display: inline-block; background: #5D3FD3; color: white; font-size: 16px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px;">
                Review Account Security
              </a>
            </div>
          </div>

          <div style="text-align: center; margin-top: 32px;">
            <p style="color: #9ca3af; font-size: 12px; line-height: 18px; margin: 0;">
              This is a security notification from ItWhip.
              <a href="https://itwhip.com" style="color: #5D3FD3; text-decoration: none;">ItWhip.com</a> |
              <a href="https://itwhip.com/support" style="color: #5D3FD3; text-decoration: none;">Support</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
${escapeHtml(providerName)} Sign-In Added to Your ItWhip Account

${name ? `Hi ${escapeHtml(name)},` : 'Hi,'}

${escapeHtml(providerName)} Sign-In has been successfully linked to your ItWhip account. You can now sign in using ${escapeHtml(providerName)} in addition to your existing sign-in methods.

Didn't do this? Someone may have linked their ${escapeHtml(providerName)} account to yours. Please change your password immediately and contact support.

Review Account Security: https://itwhip.com/profile?tab=security

This is a security notification from ItWhip.
ItWhip.com | Support: https://itwhip.com/support
    `
  }
}
