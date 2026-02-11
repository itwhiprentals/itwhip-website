// app/lib/email/templates/host-verification.ts

import { EmailTemplate } from '../types'
import { escapeHtml } from '../sanitize'

export interface HostVerificationData {
  hostName: string
  verificationType: 'email' | 'phone'
  verificationCode: string
  verificationUrl: string
  expiresIn: string // e.g., "15 minutes"
}

export function getHostVerificationTemplate(data: HostVerificationData): EmailTemplate {
  const subject = 'Verify Your ItWhip Host Account'
  
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
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); 
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
            font-weight: 400;
            margin: 0 0 8px 0;
          }
          .header p {
            font-size: 14px;
            margin: 0;
            opacity: 0.9;
          }
          .content { 
            padding: 30px 20px;
          }
          .code-box {
            background: #f3f4f6;
            border: 2px dashed #9ca3af;
            padding: 24px;
            margin: 24px 0;
            text-align: center;
            border-radius: 8px;
          }
          .code-label {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
          }
          .code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #111827;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: #8b5cf6;
            color: white;
            text-decoration: none;
            font-weight: 500;
            border-radius: 6px;
            margin: 24px 0;
          }
          .divider {
            margin: 24px 0;
            padding: 16px 0;
            border-top: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
          .warning-box {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            padding: 16px;
            margin: 24px 0;
            border-radius: 6px;
            font-size: 14px;
            color: #92400e;
          }
          .warning-box strong {
            display: block;
            margin-bottom: 4px;
          }
          .steps {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 20px;
            margin: 24px 0;
            border-radius: 6px;
          }
          .steps h3 {
            font-size: 16px;
            margin: 0 0 12px 0;
            color: #111827;
          }
          .steps ol {
            margin: 0 0 0 20px;
            padding: 0;
            font-size: 14px;
            color: #4b5563;
          }
          .steps li {
            margin: 8px 0;
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
            color: #8b5cf6;
            text-decoration: none;
          }
          @media only screen and (max-width: 600px) {
            .header { padding: 30px 16px; }
            .header h1 { font-size: 24px; }
            .content { padding: 20px 16px; }
            .code { font-size: 28px; letter-spacing: 6px; }
            .button { display: block; text-align: center; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="status-badge">Host Verification</div>
            <h1>Verify Your Account</h1>
            <p>Complete your host account verification</p>
          </div>
          
          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Hi ${escapeHtml(data.hostName)},</p>
            
            <p style="color: #4b5563; margin-bottom: 24px;">
              Thank you for joining ItWhip as a host! To complete your registration and start listing your vehicles, 
              please verify your ${data.verificationType} address.
            </p>
            
            <div class="code-box">
              <div class="code-label">Your Verification Code</div>
              <div class="code">${data.verificationCode}</div>
              <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">
                Valid for ${data.expiresIn}
              </p>
            </div>
            
            <div class="divider">
              OR
            </div>
            
            <div style="text-align: center;">
              <a href="${data.verificationUrl}" class="button">
                Verify My Account
              </a>
              <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">
                Click the button to verify instantly
              </p>
            </div>
            
            <div class="warning-box">
              <strong>⏰ Time Sensitive</strong>
              This verification code expires in ${data.expiresIn}. If you didn't request this verification, 
              please ignore this email or contact support if you have concerns.
            </div>
            
            <div class="steps">
              <h3>What happens after verification?</h3>
              <ol>
                <li>Your host account will be activated</li>
                <li>You can start adding your vehicles</li>
                <li>Set your availability and pricing</li>
                <li>Start accepting bookings from guests</li>
              </ol>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 32px;">
              Need help? Contact our host support team at<br>
              <a href="mailto:info@itwhip.com" style="color: #8b5cf6;">info@itwhip.com</a>
            </p>
          </div>
          
          <div class="footer">
            <strong>ITWHIP HOST PORTAL</strong><br>
            Empowering Vehicle Owners in Phoenix<br>
            <a href="https://itwhip.com/host/help">Host Help Center</a> | 
            <a href="https://itwhip.com/host/terms">Host Terms</a><br>
            <span style="font-size: 11px; margin-top: 8px; display: block;">
              © 2025 ItWhip Technologies. All rights reserved.
            </span>
          </div>
        </div>
      </body>
    </html>
  `
  
  const text = `
Verify Your ItWhip Host Account

Hi ${escapeHtml(data.hostName)},

Thank you for joining ItWhip as a host! To complete your registration, please verify your ${data.verificationType} address.

YOUR VERIFICATION CODE: ${data.verificationCode}
Valid for: ${data.expiresIn}

Or verify instantly by visiting:
${data.verificationUrl}

What happens after verification?
1. Your host account will be activated
2. You can start adding your vehicles  
3. Set your availability and pricing
4. Start accepting bookings from guests

If you didn't request this verification, please ignore this email.

Need help? Contact our host support team at info@itwhip.com

ITWHIP HOST PORTAL
Empowering Vehicle Owners in Phoenix
© 2025 ItWhip Technologies. All rights reserved.
  `
  
  return { subject, html, text }
}