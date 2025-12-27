// scripts/test-email-send.ts
// Test email delivery using the platform's email system

// Load environment variables FIRST before any other imports
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Now import the email sender (env vars are now set)
async function testEmail() {
  // Dynamic import to ensure env is loaded first
  const { sendEmail } = await import('../app/lib/email/send-email')

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧪 Testing Email Delivery')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('📧 FROM: info@itwhip.com (platform system)')
  console.log('📬 TO: nickpattt86@gmail.com (your inbox)')
  console.log('')
  console.log('Environment Check:')
  console.log('  SMTP_HOST:', process.env.SMTP_HOST || '(not set)')
  console.log('  SMTP_PORT:', process.env.SMTP_PORT || '(not set)')
  console.log('  SMTP_USER:', process.env.SMTP_USER ? '✅ Set' : '❌ Missing')
  console.log('  SMTP_PASS:', process.env.SMTP_PASS ? '✅ Set' : '❌ Missing')
  console.log('  EMAIL_FROM:', process.env.EMAIL_FROM || '(not set)')
  console.log('  EMAIL_REQUIRE_TLS:', process.env.EMAIL_REQUIRE_TLS || '(not set)')
  console.log('  EMAIL_REJECT_UNAUTHORIZED:', process.env.EMAIL_REJECT_UNAUTHORIZED || '(not set)')
  console.log('')

  const timestamp = new Date().toISOString()

  try {
    console.log('Sending test email...')

    const result = await sendEmail({
      to: 'nickpattt86@gmail.com',
      subject: `✅ ItWhip Email Test - ${timestamp}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #f5f5f5;">
            <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">✅ Email System Working!</h1>
              </div>
              <div style="padding: 30px;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  If you're reading this, the ItWhip email system is configured correctly and sending emails successfully.
                </p>
                <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 16px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #166534; font-size: 14px;">
                    <strong>Test passed!</strong><br>
                    Timestamp: ${timestamp}
                  </p>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                  This email was sent from <strong>info@itwhip.com</strong>
                </p>
              </div>
              <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
                ItWhip Technologies - Email Test<br>
                © 2025 ItWhip. All rights reserved.
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
ItWhip Email System - Test Successful!

If you're reading this, the email system is configured correctly.

Test passed!
Timestamp: ${timestamp}

This email was sent from info@itwhip.com

---
ItWhip Technologies - Email Test
      `
    })

    if (result.success) {
      console.log('')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('✅ EMAIL SENT SUCCESSFULLY!')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('')
      console.log('📬 Check your inbox: nickpattt86@gmail.com')
      console.log('📂 Also check spam/junk folder')
      console.log('')
      console.log('Message ID:', result.messageId)
    } else {
      console.log('')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('❌ EMAIL SEND FAILED')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('')
      console.log('Error:', result.error)
    }

  } catch (error) {
    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('❌ EMAIL EXCEPTION')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.error('Exception:', error)
  }
}

testEmail()
