// app/lib/email/templates/password-changed-notification.tsx

export interface PasswordChangedEmailData {
    userName: string
    deviceInfo: string
    ipAddress: string
    timestamp: string
    otherDevicesLoggedOut: boolean
    resetUrl: string
  }
  
  export function generatePasswordChangedEmail(data: PasswordChangedEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ItWhip</h1>
                      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Security Alert</p>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Your Password Was Changed</h2>
                      
                      <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                        Hi ${data.userName},
                      </p>
                      
                      <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 24px;">
                        We're confirming that your ItWhip account password was successfully changed on <strong>${data.timestamp}</strong>.
                      </p>
  
                      <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
                        <p style="margin: 0 0 12px; color: #1f2937; font-size: 14px; font-weight: 600;">Change Details:</p>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Device:</td>
                            <td style="padding: 4px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.deviceInfo}</td>
                          </tr>
                          <tr>
                            <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">IP Address:</td>
                            <td style="padding: 4px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${data.ipAddress}</td>
                          </tr>
                        </table>
                      </div>
  
                      ${data.otherDevicesLoggedOut ? `
                      <div style="padding: 16px; background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px; margin-bottom: 24px;">
                        <p style="margin: 0; color: #1e40af; font-size: 14px;">
                          <strong>🔒 Security Action:</strong> All other devices have been signed out as requested.
                        </p>
                      </div>
                      ` : ''}
                      
                      <div style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 24px;">
                        <p style="margin: 0 0 8px; color: #92400e; font-size: 14px; font-weight: 600;">
                          ⚠️ Didn't change your password?
                        </p>
                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                          If you didn't make this change, someone else may have access to your account. Reset your password immediately.
                        </p>
                      </div>
  
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${data.resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: #dc2626; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.2);">Reset Password Now</a>
                          </td>
                        </tr>
                      </table>
  
                      <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                        If you made this change, you can safely ignore this email. Your account is secure.
                      </p>
  
                      <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                        Need help? Contact 
                        <a href="mailto:security@itwhip.com" style="color: #10b981; text-decoration: none;">security@itwhip.com</a>
                      </p>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                      <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                        ItWhip Technologies, Inc.
                      </p>
                      <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px;">
                        This is an automated security notification.
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        © 2025 ItWhip. All rights reserved.
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
  }
  
  export function generatePasswordChangedTextEmail(data: PasswordChangedEmailData): string {
    return `
  Your ItWhip Password Was Changed
  
  Hi ${data.userName},
  
  Your password was successfully changed on ${data.timestamp}.
  
  Change Details:
  - Device: ${data.deviceInfo}
  - IP Address: ${data.ipAddress}
  
  ${data.otherDevicesLoggedOut ? 'All other devices have been signed out for security.\n' : ''}
  Didn't change your password?
  
  If you didn't make this change, someone else may have access to your account.
  Reset your password immediately: ${data.resetUrl}
  
  If you made this change, you can safely ignore this email.
  
  Need help? Contact security@itwhip.com
  
  ItWhip Technologies, Inc.
  © 2025 ItWhip. All rights reserved.
    `.trim()
  }