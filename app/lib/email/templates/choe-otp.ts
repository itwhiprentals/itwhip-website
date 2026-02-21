// OTP email template for Choe AI booking assistant verification
import { generateVerificationCode } from './email-verification'

// Re-export for convenience
export { generateVerificationCode }

const PURPOSE_LABELS: Record<'CHECKOUT' | 'BOOKING_STATUS' | 'SENSITIVE_INFO', string> = {
  CHECKOUT: 'complete your booking',
  BOOKING_STATUS: 'check your booking status',
  SENSITIVE_INFO: 'view your account information',
}

export function getChoeOtpTemplate(code: string, purpose: 'CHECKOUT' | 'BOOKING_STATUS' | 'SENSITIVE_INFO') {
  const purposeLabel = PURPOSE_LABELS[purpose]

  return {
    subject: 'Your ItWhip Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Identity</title>
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
              Verify Your Identity
            </h2>

            <p style="color: #6b7280; font-size: 16px; line-height: 24px; margin: 0 0 32px 0;">
              To ${purposeLabel}, please enter the verification code below in the chat.
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
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 32px;">
            <p style="color: #9ca3af; font-size: 12px; line-height: 18px; margin: 0 0 8px 0;">
              This email was sent by the ItWhip booking assistant.
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
Verify Your Identity

To ${purposeLabel}, please enter the verification code below in the chat.

VERIFICATION CODE: ${code}

This code will expire in 15 minutes. If you didn't request this code, you can safely ignore this email.

Security Tip: Never share this code with anyone. ItWhip staff will never ask for your verification code.

This email was sent by the ItWhip booking assistant.
ItWhip.com | Support: https://itwhip.com/support
    `
  }
}
