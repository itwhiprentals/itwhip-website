const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: 'info@itwhip.com',
    pass: 'Xianns8686*',
  },
})

const mockData = {
  hostName: 'Chris Harris',
  claimId: 'cm123abc456def789',
  bookingCode: 'BK-2024-12345',
  carDetails: '2020 Honda Civic',
  incidentDate: new Date().toISOString(),
  estimatedCost: 2500,
  claimType: 'ACCIDENT',
  vehicleDeactivated: true,
  guestName: 'John Smith',
  insuranceProvider: 'Liberty Mutual',
  earningsTier: '75% (P2P Insurance)',
  fnolSummary: {
    hasComprehensiveReport: true,
    odometerReading: 45000,
    vehicleDrivable: true,
    weatherConditions: 'Clear',
    roadConditions: 'Dry',
    policeReportFiled: false,
    policeDepartment: null,
    policeReportNumber: null,
    witnessCount: 0,
    otherPartyInvolved: false,
    injuriesReported: false,
    injuryCount: 0,
    incidentLocation: 'Phoenix, AZ'
  }
}

function getClaimFiledHostTemplate(data) {
  const claimUrl = `https://itwhip.com/host/claims/${data.claimId}`
  const subject = `Claim Filed - ${data.carDetails} - ${data.bookingCode}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
            line-height: 1.6; 
            color: #111827; 
            background: #ffffff;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border: 1px solid #e5e7eb;
          }
          .header { 
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
            color: white; 
            padding: 40px 20px;
            text-align: center; 
          }
          .status-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 1px;
            margin-bottom: 16px;
            text-transform: uppercase;
          }
          .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
          }
          .content {
            padding: 40px 30px;
          }
          .info-box {
            background: #f9fafb;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 24px 0;
            border-radius: 4px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            color: #6b7280;
            font-size: 14px;
          }
          .info-value {
            color: #111827;
            font-weight: 600;
            font-size: 14px;
          }
          .fnol-confirmation {
            background: #ecfdf5;
            border-left: 4px solid #10b981;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .fnol-title {
            color: #065f46;
            font-weight: 700;
            margin-bottom: 8px;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .fnol-text {
            color: #047857;
            font-size: 13px;
            line-height: 1.5;
          }
          .warning-box {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            padding: 16px;
            border-radius: 4px;
            margin: 20px 0;
          }
          .warning-title {
            color: #92400e;
            font-weight: 700;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .warning-text {
            color: #78350f;
            font-size: 13px;
          }
          .btn {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
          }
          .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer-text {
            color: #6b7280;
            font-size: 12px;
            line-height: 1.5;
          }
          .next-steps {
            background: #eff6ff;
            padding: 20px;
            border-radius: 6px;
            margin: 24px 0;
          }
          .next-steps h3 {
            color: #1e40af;
            font-size: 16px;
            margin-bottom: 12px;
          }
          .next-steps ol {
            margin-left: 20px;
            color: #374151;
          }
          .next-steps li {
            margin: 8px 0;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="status-badge">CLAIM FILED</div>
            <h1>Your Claim Has Been Submitted</h1>
          </div>

          <div class="content">
            <p style="font-size: 16px; color: #111827; margin-bottom: 20px;">
              Hi ${data.hostName},
            </p>

            <p style="color: #374151; margin-bottom: 24px;">
              Your insurance claim has been successfully submitted and is now under review by our fleet team.
            </p>

            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Claim ID</span>
                <span class="info-value">#${data.claimId.slice(0, 8).toUpperCase()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Booking Code</span>
                <span class="info-value">${data.bookingCode}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Vehicle</span>
                <span class="info-value">${data.carDetails}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Incident Date</span>
                <span class="info-value">${new Date(data.incidentDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Claim Type</span>
                <span class="info-value">${data.claimType}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Estimated Cost</span>
                <span class="info-value">$${data.estimatedCost.toLocaleString()}</span>
              </div>
            </div>

            ${data.fnolSummary?.hasComprehensiveReport ? `
              <div class="fnol-confirmation">
                <div class="fnol-title">
                  <span>✅</span>
                  <span>Comprehensive Incident Report Filed</span>
                </div>
                <div class="fnol-text">
                  Your detailed incident documentation has been securely submitted including vehicle condition, environmental factors, and all relevant details. This comprehensive report is available in your secure claims portal.
                </div>
              </div>
            ` : ''}

            ${data.vehicleDeactivated ? `
              <div class="warning-box">
                <div class="warning-title">⚠️ Vehicle Temporarily Deactivated</div>
                <div class="warning-text">
                  As per your request, this vehicle has been temporarily deactivated and cannot receive new bookings until the claim is resolved.
                </div>
              </div>
            ` : ''}

            <div class="next-steps">
              <h3>What Happens Next?</h3>
              <ol>
                <li>Our fleet team will review your claim within 24-48 hours</li>
                <li>The guest will be notified and given 48 hours to respond</li>
                <li>We'll verify all documentation and assess the claim</li>
                <li>You'll receive a decision notification via email</li>
                <li>If approved, payment will be processed according to your earnings tier</li>
              </ol>
            </div>

            <p style="color: #374151; margin-bottom: 16px;">
              You can track your claim status and view complete incident details at any time.
            </p>

            <div style="text-align: center;">
              <a href="${claimUrl}" class="btn">View Claim Details</a>
            </div>

            <p style="color: #6b7280; font-size: 13px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <strong>Need help?</strong> Contact us at <a href="mailto:claims@itwhip.com" style="color: #3b82f6;">claims@itwhip.com</a> or call (602) 555-0100
            </p>
          </div>

          <div class="footer">
            <p class="footer-text">
              © 2024 ItWhip. All rights reserved.<br>
              Phoenix, Arizona<br>
              <a href="https://itwhip.com" style="color: #3b82f6; text-decoration: none;">itwhip.com</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  return { subject, html }
}

function getClaimNotificationFleetTemplate(data) {
  const reviewUrl = `https://itwhip.com/fleet/claims/${data.claimId}`
  const subject = `New Claim to Review - HIGH Priority - ${data.bookingCode}`
  
  const priorityColor = '#ef4444'
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
            line-height: 1.6; 
            color: #111827; 
            background: #ffffff;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border: 1px solid #e5e7eb;
          }
          .header { 
            background: linear-gradient(135deg, ${priorityColor} 0%, #dc2626 100%); 
            color: white; 
            padding: 40px 20px;
            text-align: center; 
          }
          .status-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 1px;
            margin-bottom: 16px;
            text-transform: uppercase;
          }
          .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
          }
          .content {
            padding: 40px 30px;
          }
          .priority-badge {
            display: inline-block;
            background: ${priorityColor};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 20px;
          }
          .fnol-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-left: 8px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 24px 0;
          }
          .info-card {
            background: #f9fafb;
            padding: 16px;
            border-radius: 6px;
            border-left: 3px solid #3b82f6;
          }
          .info-card-label {
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .info-card-value {
            color: #111827;
            font-weight: 700;
            font-size: 16px;
          }
          .claim-details {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 20px;
            margin: 24px 0;
            border-radius: 6px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            color: #6b7280;
            font-size: 14px;
          }
          .detail-value {
            color: #111827;
            font-weight: 600;
            font-size: 14px;
          }
          .fnol-confirmation {
            background: #ecfdf5;
            border-left: 4px solid #10b981;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .fnol-title {
            color: #065f46;
            font-weight: 700;
            margin-bottom: 8px;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .fnol-text {
            color: #047857;
            font-size: 13px;
            line-height: 1.5;
          }
          .action-required {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 24px 0;
            border-radius: 4px;
          }
          .action-title {
            color: #92400e;
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 8px;
          }
          .action-list {
            color: #78350f;
            font-size: 13px;
            margin-left: 20px;
          }
          .btn {
            display: inline-block;
            background: ${priorityColor};
            color: white;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 700;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
          }
          .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer-text {
            color: #6b7280;
            font-size: 12px;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="status-badge">NEW CLAIM</div>
            <h1>Claim Review Required</h1>
          </div>

          <div class="content">
            <div style="text-align: center;">
              <span class="priority-badge">HIGH PRIORITY</span>
              ${data.fnolSummary?.hasComprehensiveReport ? `
                <span class="fnol-badge">📋 COMPLETE FNOL REPORT</span>
              ` : ''}
            </div>

            <p style="font-size: 16px; color: #111827; margin-bottom: 20px; text-align: center;">
              A new insurance claim has been filed and requires fleet admin review.
            </p>

            ${data.fnolSummary?.hasComprehensiveReport ? `
              <div class="fnol-confirmation">
                <div class="fnol-title">
                  <span>✅</span>
                  <span>Comprehensive FNOL Report Available</span>
                </div>
                <div class="fnol-text">
                  Complete incident documentation has been collected including vehicle condition assessment, environmental conditions, witness information, and all relevant details. Full report accessible in the secure claims portal.
                </div>
              </div>
            ` : ''}

            <div class="info-grid">
              <div class="info-card">
                <div class="info-card-label">Claim ID</div>
                <div class="info-card-value">#${data.claimId.slice(0, 8).toUpperCase()}</div>
              </div>
              <div class="info-card">
                <div class="info-card-label">Booking Code</div>
                <div class="info-card-value">${data.bookingCode}</div>
              </div>
              <div class="info-card">
                <div class="info-card-label">Estimated Cost</div>
                <div class="info-card-value">$${data.estimatedCost.toLocaleString()}</div>
              </div>
              <div class="info-card">
                <div class="info-card-label">Claim Type</div>
                <div class="info-card-value">${data.claimType}</div>
              </div>
            </div>

            <div class="claim-details">
              <h3 style="color: #111827; margin-bottom: 16px; font-size: 16px;">Claim Details</h3>
              <div class="detail-row">
                <span class="detail-label">Vehicle</span>
                <span class="detail-value">${data.carDetails}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Host</span>
                <span class="detail-value">${data.hostName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Guest</span>
                <span class="detail-value">${data.guestName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Incident Date</span>
                <span class="detail-value">${new Date(data.incidentDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Host Tier</span>
                <span class="detail-value">${data.earningsTier}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Insurance Provider</span>
                <span class="detail-value">${data.insuranceProvider}</span>
              </div>
            </div>

            <div class="action-required">
              <div class="action-title">📋 Action Required</div>
              <ul class="action-list">
                <li>Review claim documentation and photos</li>
                ${data.fnolSummary?.hasComprehensiveReport ? '<li>Review comprehensive FNOL incident report</li>' : ''}
                <li>Verify insurance coverage hierarchy</li>
                <li>Assess damage estimate accuracy</li>
                <li>Review host and guest history</li>
                <li>Approve or deny claim within 24-48 hours</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${reviewUrl}" class="btn">REVIEW CLAIM NOW</a>
            </div>

            <p style="color: #6b7280; font-size: 13px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
              <strong>Fleet Admin Portal</strong><br>
              Need help? Contact tech support at <a href="mailto:support@itwhip.com" style="color: #3b82f6;">support@itwhip.com</a>
            </p>
          </div>

          <div class="footer">
            <p class="footer-text">
              ItWhip Fleet Management System<br>
              © 2024 ItWhip. All rights reserved.<br>
              <a href="https://itwhip.com/fleet" style="color: #3b82f6; text-decoration: none;">Fleet Dashboard</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  return { subject, html }
}

async function sendTestEmails() {
  console.log('📧 Testing REAL email templates with FNOL data...\n')

  const hostTemplate = getClaimFiledHostTemplate(mockData)
  const fleetTemplate = getClaimNotificationFleetTemplate(mockData)

  try {
    const hostResult = await transporter.sendMail({
      from: 'ItWhip Rentals <info@itwhip.com>',
      to: 'hxris007@gmail.com',
      subject: hostTemplate.subject,
      html: hostTemplate.html,
    })
    console.log('✅ HOST EMAIL SENT')
    console.log('   To: hxris007@gmail.com')
    console.log('   Subject:', hostTemplate.subject)
    console.log('   Message ID:', hostResult.messageId)
    console.log('   ✅ Includes GREEN FNOL confirmation box\n')
  } catch (error) {
    console.error('❌ Host email failed:', error.message, '\n')
  }

  try {
    const fleetResult = await transporter.sendMail({
      from: 'ItWhip Rentals <info@itwhip.com>',
      to: 'info@itwhip.com',
      subject: fleetTemplate.subject,
      html: fleetTemplate.html,
    })
    console.log('✅ FLEET EMAIL SENT')
    console.log('   To: info@itwhip.com')
    console.log('   Subject:', fleetTemplate.subject)
    console.log('   Message ID:', fleetResult.messageId)
    console.log('   ✅ Includes GREEN FNOL badge + confirmation box\n')
  } catch (error) {
    console.error('❌ Fleet email failed:', error.message, '\n')
  }

  console.log('🎯 CHECK YOUR INBOXES NOW!')
  console.log('   hxris007@gmail.com - Look for green FNOL box')
  console.log('   info@itwhip.com - Look for green FNOL badge + box')
}

sendTestEmails()
