const nodemailer = require('nodemailer')

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: 'info@itwhip.com',
      pass: 'Xianns8686*',
    },
  })

  const testHost = {
    from: 'ItWhip Rentals <info@itwhip.com>',
    to: 'hxris007@gmail.com',
    subject: 'TEST: Claim Filed - 2020 Honda Civic - BK-12345',
    html: `
      <div style="max-width:600px;margin:0 auto;border:1px solid #e5e7eb;">
        <div style="background:#3b82f6;color:white;padding:40px 20px;text-align:center;">
          <div style="background:rgba(255,255,255,0.2);padding:6px 12px;display:inline-block;border-radius:4px;font-size:12px;font-weight:600;margin-bottom:16px;">CLAIM FILED</div>
          <h1 style="font-size:28px;font-weight:700;margin:0;">Your Claim Has Been Submitted</h1>
        </div>
        <div style="padding:40px 30px;">
          <p>Hi Test Host,</p>
          <p>Your insurance claim has been successfully submitted.</p>
          <div style="background:#ecfdf5;border-left:4px solid #10b981;padding:16px;margin:20px 0;border-radius:4px;">
            <div style="color:#065f46;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px;">
              <span>✅</span>
              <span>Comprehensive Incident Report Filed</span>
            </div>
            <div style="color:#047857;font-size:13px;">
              Your detailed incident documentation has been securely submitted including vehicle condition, environmental factors, and all relevant details.
            </div>
          </div>
          <p>This is a TEST email to verify SMTP configuration with FNOL badges.</p>
        </div>
      </div>
    `
  }

  const testFleet = {
    from: 'ItWhip Rentals <info@itwhip.com>',
    to: 'info@itwhip.com',
    subject: 'TEST: New Claim to Review - HIGH PRIORITY - BK-12345',
    html: `
      <div style="max-width:600px;margin:0 auto;border:1px solid #e5e7eb;">
        <div style="background:#ef4444;color:white;padding:40px 20px;text-align:center;">
          <div style="background:rgba(255,255,255,0.2);padding:6px 12px;display:inline-block;border-radius:4px;font-size:12px;font-weight:600;margin-bottom:16px;">NEW CLAIM</div>
          <h1 style="font-size:28px;font-weight:700;margin:0;">Claim Review Required</h1>
        </div>
        <div style="padding:40px 30px;">
          <div style="text-align:center;">
            <span style="background:#ef4444;color:white;padding:8px 16px;border-radius:20px;font-size:12px;font-weight:700;display:inline-block;">HIGH PRIORITY</span>
            <span style="background:#10b981;color:white;padding:6px 12px;border-radius:4px;font-size:11px;font-weight:700;display:inline-block;margin-left:8px;">📋 COMPLETE FNOL REPORT</span>
          </div>
          <div style="background:#ecfdf5;border-left:4px solid #10b981;padding:16px;margin:20px 0;border-radius:4px;">
            <div style="color:#065f46;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px;">
              <span>✅</span>
              <span>Comprehensive FNOL Report Available</span>
            </div>
            <div style="color:#047857;font-size:13px;">
              Complete incident documentation has been collected including vehicle condition assessment, environmental conditions, witness information, and all relevant details.
            </div>
          </div>
          <p>This is a TEST email to verify SMTP configuration with FNOL badges.</p>
        </div>
      </div>
    `
  }

  console.log('📧 Sending test emails via Microsoft 365...')
  
  try {
    const hostResult = await transporter.sendMail(testHost)
    console.log('✅ Host email sent to:', testHost.to)
    console.log('   Message ID:', hostResult.messageId)
  } catch (error) {
    console.error('❌ Host email failed:', error.message)
  }

  try {
    const fleetResult = await transporter.sendMail(testFleet)
    console.log('✅ Fleet email sent to:', testFleet.to)
    console.log('   Message ID:', fleetResult.messageId)
  } catch (error) {
    console.error('❌ Fleet email failed:', error.message)
  }
}

testEmail()
