// app/lib/dual-role/notifications.ts
// Email notification system for dual-role account changes
// Sends security alerts and confirmations following Turo/Airbnb/Uber best practices

import { sendEmail } from '@/app/lib/email/sender'

/**
 * Sends email change notifications to both old and new email addresses
 * - Old email: Security alert (someone may have unauthorized access)
 * - New email: Confirmation (welcome to your new email)
 */
export async function sendEmailChangeNotification(
  userName: string,
  oldEmail: string,
  newEmail: string,
  userAgent: string,
  ipAddress: string
) {
  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short'
  })

  // Email to OLD address (security alert)
  const oldEmailHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">⚠️ Security Alert</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Email Address Changed on Your ItWhip Account</h2>
                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Hi ${userName},
                    </p>
                    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Your ItWhip account email was changed to <strong>${newEmail}</strong> on ${timestamp}.
                    </p>
                    <div style="background: #fef3c7; padding: 16px; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 24px;">
                      <strong style="color: #92400e;">⚠️ Didn't make this change?</strong><br>
                      <span style="color: #92400e; font-size: 14px;">Someone may have access to your account. Reset your password immediately and contact support.</span>
                    </div>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                      <strong>Device:</strong> ${userAgent}<br>
                      <strong>IP Address:</strong> ${ipAddress}<br>
                      <strong>Time:</strong> ${timestamp}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      © 2025 ItWhip. This is an automated security notification.
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

  // Email to NEW address (confirmation)
  const newEmailHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">✅ Email Updated</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Welcome to Your New Email on ItWhip</h2>
                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Hi ${userName},
                    </p>
                    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Your ItWhip account email was successfully updated on ${timestamp}.
                    </p>
                    <div style="background: #dbeafe; padding: 16px; border-left: 4px solid #3b82f6; border-radius: 4px; margin-bottom: 24px;">
                      <strong style="color: #1e40af;">📧 Important:</strong><br>
                      <span style="color: #1e3a8a; font-size: 14px;">This change applies to both your host and guest profiles. Use this email for all future logins.</span>
                    </div>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                      <strong>Device:</strong> ${userAgent}<br>
                      <strong>IP Address:</strong> ${ipAddress}<br>
                      <strong>Time:</strong> ${timestamp}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      © 2025 ItWhip. This is an automated confirmation email.
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

  try {
    await Promise.all([
      sendEmail(oldEmail, 'ItWhip Account Email Changed - Security Alert', oldEmailHTML, ''),
      sendEmail(newEmail, 'ItWhip Email Change Confirmed', newEmailHTML, '')
    ])
    console.log('[Email Change Notification] ✅ Sent to both addresses')
  } catch (error) {
    console.error('[Email Change Notification] ❌ Failed to send:', error)
    // Don't throw - email failure shouldn't block the profile update
  }
}

/**
 * Sends phone number change notification
 * Sent to user's current email address
 */
export async function sendPhoneChangeNotification(
  userName: string,
  email: string,
  oldPhone: string,
  newPhone: string
) {
  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short'
  })

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">📱 Phone Updated</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Phone Number Changed on Your ItWhip Account</h2>
                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Hi ${userName},
                    </p>
                    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Your ItWhip account phone number was changed on ${timestamp}.
                    </p>
                    <div style="background: #f3f4f6; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin: 0; color: #374151; font-size: 14px;">
                        <strong>Old Number:</strong> ${oldPhone || 'None'}<br>
                        <strong>New Number:</strong> ${newPhone}
                      </p>
                    </div>
                    <div style="background: #dbeafe; padding: 16px; border-left: 4px solid #3b82f6; border-radius: 4px; margin-bottom: 24px;">
                      <strong style="color: #1e40af;">📧 Important:</strong><br>
                      <span style="color: #1e3a8a; font-size: 14px;">This change applies to both your host and guest profiles.</span>
                    </div>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                      If you didn't make this change, contact support immediately at <a href="mailto:info@itwhip.com" style="color: #10b981;">info@itwhip.com</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      © 2025 ItWhip. This is an automated security notification.
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

  try {
    await sendEmail(email, 'ItWhip Phone Number Changed', html, '')
    console.log('[Phone Change Notification] ✅ Sent successfully')
  } catch (error) {
    console.error('[Phone Change Notification] ❌ Failed to send:', error)
    // Don't throw - email failure shouldn't block the profile update
  }
}
