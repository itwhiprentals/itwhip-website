// lib/email/templates/password-reset.tsx

interface PasswordResetEmailProps {
    userName?: string
    resetUrl: string
    expiryHours?: number
  }
  
  export function PasswordResetEmail({ 
    userName, 
    resetUrl,
    expiryHours = 1 
  }: PasswordResetEmailProps) {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Reset Your ItWhip Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
                  
                  <!-- Header with Gradient -->
                  <tr>
                    <td style="padding: 48px 40px 32px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #059669 100%);">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td align="center">
                            <!-- Logo/Icon -->
                            <div style="width: 64px; height: 64px; background-color: rgba(255,255,255,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                              </svg>
                            </div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                              ItWhip
                            </h1>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Content Area -->
                  <tr>
                    <td style="padding: 48px 40px;">
                      <!-- Greeting -->
                      <h2 style="margin: 0 0 24px; color: #1f2937; font-size: 26px; font-weight: 600; line-height: 1.3;">
                        Reset Your Password
                      </h2>
                      
                      <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        ${userName ? `Hi ${userName},` : 'Hello,'}
                      </p>
                      
                      <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        We received a request to reset the password for your ItWhip account. Click the button below to create a new password:
                      </p>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: 32px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.2); transition: all 0.2s;">
                              Reset My Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Alternative Link -->
                      <div style="margin: 32px 0; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px; line-height: 1.5;">
                          Or copy and paste this link into your browser:
                        </p>
                        <p style="margin: 0; color: #16a34a; font-size: 14px; word-break: break-all; line-height: 1.5;">
                          ${resetUrl}
                        </p>
                      </div>
                      
                      <!-- Security Warning Box -->
                      <div style="margin: 32px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td style="padding-right: 12px; vertical-align: top;">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                              </svg>
                            </td>
                            <td>
                              <p style="margin: 0 0 8px; color: #92400e; font-size: 14px; font-weight: 600; line-height: 1.4;">
                                Security Notice
                              </p>
                              <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                                This link expires in <strong>${expiryHours} hour${expiryHours > 1 ? 's' : ''}</strong> and can only be used once.<br>
                                If you didn't request this, you can safely ignore this email.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </div>
                      
                      <!-- Additional Help -->
                      <p style="margin: 32px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        Need help? Contact our support team at 
                        <a href="mailto:info@itwhip.com" style="color: #16a34a; text-decoration: none;">info@itwhip.com</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 32px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td align="center">
                            <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px; line-height: 1.5;">
                              <strong>ItWhip Technologies, Inc.</strong>
                            </p>
                            <p style="margin: 0 0 12px; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                              Phoenix, Arizona
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                              © ${new Date().getFullYear()} ItWhip. All rights reserved.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                </table>
                
                <!-- Footer Note -->
                <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: 24px;">
                  <tr>
                    <td align="center" style="padding: 0 40px;">
                      <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                        You received this email because a password reset was requested for your account.
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
  
  // Password Changed Confirmation Email
  interface PasswordChangedEmailProps {
    userName?: string
    changeDate?: Date
  }
  
  export function PasswordChangedEmail({ 
    userName,
    changeDate = new Date()
  }: PasswordChangedEmailProps) {
    const formattedDate = changeDate.toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    })
  
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Changed - ItWhip</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 48px 40px 32px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #059669 100%); border-radius: 12px 12px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">ItWhip</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 48px 40px;">
                      <h2 style="margin: 0 0 24px; color: #1f2937; font-size: 26px; font-weight: 600;">
                        Password Successfully Changed
                      </h2>
                      
                      <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        ${userName ? `Hi ${userName},` : 'Hello,'}
                      </p>
                      
                      <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        This is a confirmation that your ItWhip password was successfully changed.
                      </p>
                      
                      <!-- Success Box -->
                      <div style="margin: 32px 0; padding: 20px; background-color: #dcfce7; border-left: 4px solid #16a34a; border-radius: 6px;">
                        <p style="margin: 0 0 8px; color: #166534; font-size: 14px; font-weight: 600;">
                          ✓ Password Updated
                        </p>
                        <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.5;">
                          Changed on: ${formattedDate}
                        </p>
                      </div>
                      
                      <p style="margin: 0 0 32px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        You can now sign in to your account using your new password.
                      </p>
                      
                      <!-- Warning Box -->
                      <div style="margin: 32px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
                        <p style="margin: 0 0 8px; color: #92400e; font-size: 14px; font-weight: 600;">
                          ⚠️ Didn't change your password?
                        </p>
                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                          If you didn't make this change, please contact our support team immediately at 
                          <a href="mailto:info@itwhip.com" style="color: #92400e; text-decoration: underline;">info@itwhip.com</a>
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 32px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
                      <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px;">
                        <strong>ItWhip Technologies, Inc.</strong>
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        © ${new Date().getFullYear()} ItWhip. All rights reserved.
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