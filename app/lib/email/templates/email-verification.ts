// 6-digit verification code email template
import crypto from 'crypto'

export function generateVerificationCode(): string {
  // Crypto-random 6-digit code (000000-999999)
  const code = crypto.randomInt(0, 1000000).toString().padStart(6, '0')
  return code
}

export function getEmailVerificationTemplate(name: string | null, code: string) {
  return {
    subject: 'Verify Your Email - ItWhip',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #5D3FD3; font-size: 32px; font-weight: bold; margin: 0;">ItWhip</h1>
          </div>

          <!-- Main Card -->
          <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">
              Verify Your Email Address
            </h2>

            <p style="color: #6b7280; font-size: 16px; line-height: 24px; margin: 0 0 32px 0;">
              ${name ? `Hi ${name},` : 'Hi,'}<br><br>
              Thank you for signing in with your phone number. To complete your account setup and ensure account security, please verify your email address using the code below:
            </p>

            <!-- Verification Code -->
            <div style="background: #f9fafb; border: 2px dashed #5D3FD3; border-radius: 8px; padding: 24px; text-align: center; margin: 0 0 32px 0;">
              <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                VERIFICATION CODE
              </div>
              <div style="color: #5D3FD3; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${code}
              </div>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 20px; margin: 0 0 24px 0;">
              <strong>This code will expire in 15 minutes.</strong> If you didn't request this code, you can safely ignore this email.
            </p>

            <!-- Security Notice -->
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 0 0 32px 0;">
              <p style="color: #92400e; font-size: 14px; line-height: 20px; margin: 0;">
                <strong>Security Tip:</strong> Never share this code with anyone. ItWhip staff will never ask for your verification code.
              </p>
            </div>

            <!-- Why Verify -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
              <p style="color: #6b7280; font-size: 14px; line-height: 20px; margin: 0 0 12px 0;">
                <strong>Why verify your email?</strong>
              </p>
              <ul style="color: #6b7280; font-size: 14px; line-height: 20px; margin: 0; padding-left: 20px;">
                <li>Secure account recovery if you lose access to your phone</li>
                <li>Receive booking confirmations and important updates</li>
                <li>Enhanced account security and fraud protection</li>
              </ul>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 32px;">
            <p style="color: #9ca3af; font-size: 12px; line-height: 18px; margin: 0 0 8px 0;">
              This email was sent to verify your email address for ItWhip.
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
Verify Your Email Address

${name ? `Hi ${name},` : 'Hi,'}

Thank you for signing in with your phone number. To complete your account setup and ensure account security, please verify your email address using the code below:

VERIFICATION CODE: ${code}

This code will expire in 15 minutes. If you didn't request this code, you can safely ignore this email.

Security Tip: Never share this code with anyone. ItWhip staff will never ask for your verification code.

Why verify your email?
- Secure account recovery if you lose access to your phone
- Receive booking confirmations and important updates
- Enhanced account security and fraud protection

This email was sent to verify your email address for ItWhip.
ItWhip.com | Support: https://itwhip.com/support
    `
  }
}
