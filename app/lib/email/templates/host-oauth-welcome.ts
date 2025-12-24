// app/lib/email/templates/host-oauth-welcome.ts

import { EmailTemplate, HostOAuthWelcomeData } from '../types'

export function getHostOAuthWelcomeTemplate(data: HostOAuthWelcomeData): EmailTemplate {
  const subject = 'Welcome to ItWhip - Complete Your Host Setup'

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
            margin: 0 0 4px 0;
          }
          .step-time {
            font-size: 12px;
            color: #9ca3af;
            font-style: italic;
          }
          .step-link {
            font-size: 13px;
            color: #3b82f6;
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
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            text-decoration: none;
            font-weight: 600;
            border-radius: 8px;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
          }
          .button:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          }
          .warning-box {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            padding: 20px;
            margin: 24px 0;
            border-radius: 8px;
          }
          .warning-box p {
            font-size: 14px;
            color: #92400e;
            margin: 0 0 12px 0;
            line-height: 1.5;
          }
          .warning-box p:last-child {
            margin-bottom: 0;
          }
          .warning-box strong {
            color: #78350f;
            font-size: 15px;
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
            color: #3b82f6;
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
            <div class="welcome-badge">Welcome Host</div>
            <h1>Welcome to ItWhip, ${data.userName}!</h1>
            <p>Your host account is almost ready</p>
          </div>

          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Hi ${data.userName},</p>

            <p style="color: #4b5563; margin-bottom: 24px;">
              Thanks for joining ItWhip as a host! Your account has been created and your first vehicle
              information has been recorded. Complete the remaining steps below to activate your host dashboard
              and start earning.
            </p>

            <div class="progress-section">
              <h2 class="progress-title">What You've Completed</h2>

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

              <div class="step-item">
                <div class="step-icon step-complete">&#10003;</div>
                <div class="step-text">
                  <p class="step-title">Vehicle Information Added</p>
                  <p class="step-subtitle">Initial car details recorded</p>
                </div>
              </div>
            </div>

            <div class="progress-section">
              <h2 class="progress-title">What's Next (5 Steps)</h2>

              <!-- Pending Steps -->
              <div class="step-item">
                <div class="step-icon step-pending">1</div>
                <div class="step-text">
                  <p class="step-title">Complete Your Profile</p>
                  <p class="step-subtitle">Add bio and profile photo</p>
                  <p class="step-time">~5 minutes</p>
                  <a href="${data.profileUrl}" class="step-link">Complete profile &rarr;</a>
                </div>
              </div>

              <div class="step-item">
                <div class="step-icon step-pending">2</div>
                <div class="step-text">
                  <p class="step-title">Upload Required Documents</p>
                  <p class="step-subtitle">• Driver's License (required)<br>• Insurance Certificate (required)</p>
                  <p class="step-time">~5 minutes</p>
                  <a href="${data.documentsUrl}" class="step-link">Upload documents &rarr;</a>
                </div>
              </div>

              <div class="step-item">
                <div class="step-icon step-pending">3</div>
                <div class="step-text">
                  <p class="step-title">Complete Vehicle Listing</p>
                  <p class="step-subtitle">• Upload 6+ photos<br>• Add VIN (17 characters)<br>• Add license plate<br>• Set daily pricing</p>
                  <p class="step-time">~10 minutes</p>
                  <a href="${data.carsUrl}" class="step-link">Complete listing &rarr;</a>
                </div>
              </div>

              <div class="step-item">
                <div class="step-icon step-pending">4</div>
                <div class="step-text">
                  <p class="step-title">Connect Bank Account</p>
                  <p class="step-subtitle">Link Stripe for payouts</p>
                  <p class="step-time">~3 minutes</p>
                  <a href="${data.earningsUrl}" class="step-link">Connect bank &rarr;</a>
                </div>
              </div>

              <div class="step-item">
                <div class="step-icon step-pending">5</div>
                <div class="step-text">
                  <p class="step-title">Select Insurance Tier</p>
                  <p class="step-subtitle">BASIC (40%) | STANDARD (75%) | PREMIUM (90%)</p>
                  <p class="step-time">~2 minutes</p>
                  <a href="${data.insuranceUrl}" class="step-link">Choose tier &rarr;</a>
                </div>
              </div>
            </div>

            <div class="warning-box">
              <p><strong>⚠️ YOUR APPLICATION WILL REMAIN UNDER REVIEW FOR 30 DAYS</strong></p>
              <p>
                Complete <strong>ALL</strong> verification steps above within 30 days to maintain your
                application status.
              </p>
              <p>
                After all information is completed, review time: 1-2 business days (sometimes longer if
                information is incomplete).
              </p>
              <p>
                Incomplete applications after 30 days will be archived and require resubmission.
              </p>
            </div>

            <div class="cta-section">
              <a href="${data.dashboardUrl}" class="button">
                Complete My Host Setup
              </a>
              <p style="font-size: 12px; color: #6b7280; margin-top: 12px;">
                Start earning in under 30 minutes
              </p>
            </div>

            <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 32px;">
              Questions about becoming a host? We're here to help:<br>
              <a href="mailto:info@itwhip.com" style="color: #3b82f6;">
                info@itwhip.com
              </a>
            </p>
          </div>

          <div class="footer">
            <strong>ITWHIP HOST PLATFORM</strong><br>
            Premium Car Rental Hosting<br>
            <a href="${data.dashboardUrl}">Host Dashboard</a> |
            <a href="https://itwhip.com/host-help">Host Help Center</a><br>
            <span style="font-size: 11px; margin-top: 8px; display: block;">
              &copy; 2025 ItWhip Technologies. All rights reserved.
            </span>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Welcome to ItWhip Host Platform, ${data.userName}!

Hi ${data.userName},

Thanks for joining ItWhip as a host! Your account has been created and your first vehicle information has been recorded. Complete the remaining steps below to activate your host dashboard and start earning.

WHAT YOU'VE COMPLETED
======================

[x] Email Verified - ${data.userEmail}
[x] Phone Number Added - Account secured
[x] Vehicle Information Added - Initial car details recorded

WHAT'S NEXT (5 STEPS)
=====================

[ ] 1. COMPLETE YOUR PROFILE (~5 minutes)
    Add bio and profile photo
    ${data.profileUrl}

[ ] 2. UPLOAD REQUIRED DOCUMENTS (~5 minutes)
    • Driver's License (required)
    • Insurance Certificate (required)
    ${data.documentsUrl}

[ ] 3. COMPLETE VEHICLE LISTING (~10 minutes)
    • Upload 6+ photos
    • Add VIN (17 characters)
    • Add license plate
    • Set daily pricing
    ${data.carsUrl}

[ ] 4. CONNECT BANK ACCOUNT (~3 minutes)
    Link Stripe for payouts
    ${data.earningsUrl}

[ ] 5. SELECT INSURANCE TIER (~2 minutes)
    BASIC (40%) | STANDARD (75%) | PREMIUM (90%)
    ${data.insuranceUrl}

⚠️ IMPORTANT - APPLICATION REVIEW TIMELINE
==========================================

YOUR APPLICATION WILL REMAIN UNDER REVIEW FOR 30 DAYS

Complete ALL verification steps above within 30 days to maintain your application status.

After all information is completed, review time: 1-2 business days (sometimes longer if information is incomplete).

Incomplete applications after 30 days will be archived and require resubmission.

COMPLETE MY HOST SETUP:
${data.dashboardUrl}

Start earning in under 30 minutes!

Questions about becoming a host? Contact us at info@itwhip.com

---
ITWHIP HOST PLATFORM - Premium Car Rental Hosting
Host Dashboard: ${data.dashboardUrl}
Host Help: https://itwhip.com/host-help

(c) 2025 ItWhip Technologies. All rights reserved.
  `

  return { subject, html, text }
}
