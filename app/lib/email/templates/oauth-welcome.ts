// app/lib/email/templates/oauth-welcome.ts

import { EmailTemplate, OAuthWelcomeData } from '../types'

export function getOAuthWelcomeTemplate(data: OAuthWelcomeData): EmailTemplate {
  const subject = 'Welcome to ItWhip - Complete Your Profile'

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
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .welcome-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 1px;
            margin-bottom: 16px;
            text-transform: uppercase;
          }
          .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin: 0 0 8px 0;
          }
          .header p {
            font-size: 14px;
            margin: 0;
            opacity: 0.95;
          }
          .content {
            padding: 30px 20px;
          }
          .progress-section {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
          }
          .progress-title {
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 20px 0;
            color: #111827;
          }
          .step-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 16px;
          }
          .step-item:last-child {
            margin-bottom: 0;
          }
          .step-icon {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;
            font-size: 14px;
          }
          .step-complete {
            background: #10b981;
            color: white;
          }
          .step-pending {
            background: #f3f4f6;
            border: 2px solid #d1d5db;
            color: #6b7280;
          }
          .step-text {
            flex: 1;
          }
          .step-title {
            font-size: 14px;
            font-weight: 600;
            color: #111827;
            margin: 0 0 2px 0;
          }
          .step-subtitle {
            font-size: 13px;
            color: #6b7280;
            margin: 0;
          }
          .step-link {
            font-size: 13px;
            color: #10b981;
            text-decoration: none;
            font-weight: 500;
          }
          .step-link:hover {
            text-decoration: underline;
          }
          .cta-section {
            text-align: center;
            margin: 32px 0;
          }
          .button {
            display: inline-block;
            padding: 16px 48px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            text-decoration: none;
            font-weight: 600;
            border-radius: 8px;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
          }
          .button:hover {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
          }
          .info-box {
            background: #eff6ff;
            border: 1px solid #93c5fd;
            padding: 16px;
            margin: 24px 0;
            border-radius: 6px;
          }
          .info-box p {
            font-size: 14px;
            color: #1e40af;
            margin: 0;
          }
          .footer {
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
          }
          .footer a {
            color: #10b981;
            text-decoration: none;
          }
          @media only screen and (max-width: 600px) {
            .header { padding: 30px 16px; }
            .header h1 { font-size: 24px; }
            .content { padding: 20px 16px; }
            .button {
              display: block;
              padding: 14px 32px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="welcome-badge">Welcome</div>
            <h1>Welcome to ItWhip, ${data.userName}!</h1>
            <p>Your account is almost ready</p>
          </div>

          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Hi ${data.userName},</p>

            <p style="color: #4b5563; margin-bottom: 24px;">
              Thanks for joining ItWhip! Your account has been created successfully.
              Complete a few more steps to start renting cars.
            </p>

            <div class="progress-section">
              <h2 class="progress-title">Your Progress</h2>

              <!-- Completed Steps -->
              <div class="step-item">
                <div class="step-icon step-complete">&#10003;</div>
                <div class="step-text">
                  <p class="step-title">Email Verified</p>
                  <p class="step-subtitle">${data.userEmail}</p>
                </div>
              </div>

              <div class="step-item">
                <div class="step-icon step-complete">&#10003;</div>
                <div class="step-text">
                  <p class="step-title">Phone Number Added</p>
                  <p class="step-subtitle">Account secured</p>
                </div>
              </div>

              <!-- Pending Steps -->
              <div class="step-item">
                <div class="step-icon step-pending">1</div>
                <div class="step-text">
                  <p class="step-title">Upload Driver's License</p>
                  <p class="step-subtitle">Required for all rentals</p>
                  <a href="${data.documentsUrl}" class="step-link">Upload now &rarr;</a>
                </div>
              </div>

              <div class="step-item">
                <div class="step-icon step-pending">2</div>
                <div class="step-text">
                  <p class="step-title">Upload Selfie</p>
                  <p class="step-subtitle">Quick identity verification</p>
                  <a href="${data.documentsUrl}" class="step-link">Upload now &rarr;</a>
                </div>
              </div>

              <div class="step-item">
                <div class="step-icon step-pending">3</div>
                <div class="step-text">
                  <p class="step-title">Add Insurance (Optional)</p>
                  <p class="step-subtitle">Lower deposits & fees</p>
                  <a href="${data.insuranceUrl}" class="step-link">Add insurance &rarr;</a>
                </div>
              </div>
            </div>

            <div class="cta-section">
              <a href="${data.documentsUrl}" class="button">
                Complete Your Profile
              </a>
              <p style="font-size: 12px; color: #6b7280; margin-top: 12px;">
                Takes less than 5 minutes
              </p>
            </div>

            <div class="info-box">
              <p>
                <strong>Why verify?</strong> Verified renters get instant booking approval,
                lower deposits, and access to premium vehicles.
              </p>
            </div>

            <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 32px;">
              Questions? We're here to help:<br>
              <a href="mailto:info@itwhip.com" style="color: #10b981;">
                info@itwhip.com
              </a>
            </p>
          </div>

          <div class="footer">
            <strong>ITWHIP</strong><br>
            Premium Car Rentals<br>
            <a href="${data.dashboardUrl}">Dashboard</a> |
            <a href="https://itwhip.com/help">Help Center</a><br>
            <span style="font-size: 11px; margin-top: 8px; display: block;">
              &copy; 2025 ItWhip Technologies. All rights reserved.
            </span>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Welcome to ItWhip, ${data.userName}!

Hi ${data.userName},

Thanks for joining ItWhip! Your account has been created successfully. Complete a few more steps to start renting cars.

YOUR PROGRESS
=============

COMPLETED:
[x] Email Verified - ${data.userEmail}
[x] Phone Number Added - Account secured

REMAINING STEPS:
[ ] Upload Driver's License - Required for all rentals
    Upload: ${data.documentsUrl}

[ ] Upload Selfie - Quick identity verification
    Upload: ${data.documentsUrl}

[ ] Add Insurance (Optional) - Lower deposits & fees
    Add: ${data.insuranceUrl}

COMPLETE YOUR PROFILE:
${data.documentsUrl}

Takes less than 5 minutes!

WHY VERIFY?
Verified renters get instant booking approval, lower deposits, and access to premium vehicles.

Questions? Contact us at info@itwhip.com

---
ITWHIP - Premium Car Rentals
Dashboard: ${data.dashboardUrl}
Help: https://itwhip.com/help

(c) 2025 ItWhip Technologies. All rights reserved.
  `

  return { subject, html, text }
}
