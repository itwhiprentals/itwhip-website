import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const nodemailer = require('nodemailer')
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.office365.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    })
    
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
            color: #1a1a1a; 
            background: #ffffff;
          }
          
          .wrapper {
            width: 100%;
            background: #ffffff;
            padding: 40px 20px;
          }
          
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
          }
          
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 48px 32px;
            text-align: center; 
          }
          
          .header h1 {
            font-size: 32px;
            font-weight: 300;
            letter-spacing: -0.5px;
            margin: 0 0 12px 0;
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.9;
            margin: 0;
            font-weight: 300;
          }
          
          .content { 
            padding: 40px 32px;
          }
          
          .greeting {
            font-size: 18px;
            font-weight: 400;
            margin-bottom: 24px;
            color: #111827;
          }
          
          .alert-box { 
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #f59e0b;
            padding: 24px;
            margin: 32px 0;
            border-radius: 8px;
            position: relative;
          }
          
          .alert-box::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: #f59e0b;
            border-radius: 8px 0 0 8px;
          }
          
          .alert-box strong {
            display: block;
            margin-bottom: 12px;
            font-size: 16px;
            color: #92400e;
            font-weight: 600;
          }
          
          .alert-box ul {
            margin: 16px 0 20px 24px;
            color: #78350f;
          }
          
          .alert-box li {
            margin: 6px 0;
            font-size: 15px;
          }
          
          .primary-button { 
            display: inline-block; 
            padding: 14px 36px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important; 
            text-decoration: none; 
            border-radius: 8px;
            font-weight: 500;
            font-size: 15px;
            letter-spacing: 0.3px;
            box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);
            transition: all 0.3s ease;
          }
          
          .deadline-text {
            text-align: center;
            color: #92400e;
            font-size: 14px;
            margin-top: 16px;
            font-weight: 500;
          }
          
          .booking-card { 
            background: #fafbfc;
            border: 1px solid #e5e7eb;
            padding: 28px;
            border-radius: 8px; 
            margin: 32px 0;
          }
          
          .booking-header {
            margin: 0 0 20px 0;
            padding-bottom: 16px;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .booking-number {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          
          .vehicle-name {
            font-size: 20px;
            color: #111827;
            font-weight: 600;
          }
          
          .detail-row { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .detail-row:last-of-type {
            border-bottom: none;
          }
          
          .detail-label {
            font-size: 14px;
            font-weight: 500;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .detail-value {
            font-size: 15px;
            color: #111827;
            font-weight: 500;
            text-align: right;
          }
          
          .total-row {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 2px solid #e5e7eb;
          }
          
          .total-amount {
            font-size: 24px;
            font-weight: 600;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .button-center {
            text-align: center;
            margin: 40px 0;
          }
          
          .secondary-button {
            display: inline-block;
            padding: 12px 28px;
            background: white;
            color: #667eea !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            font-size: 15px;
            border: 2px solid #667eea;
            transition: all 0.3s ease;
          }
          
          .help-text {
            margin-top: 40px;
            padding-top: 32px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
          
          .help-text a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
          }
          
          .footer { 
            background: #f9fafb;
            padding: 32px;
            text-align: center; 
            color: #6b7280; 
            font-size: 13px;
            border-top: 1px solid #e5e7eb;
          }
          
          .footer-logo {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 8px;
          }
          
          .footer p {
            margin: 4px 0;
          }
          
          .footer-legal {
            font-size: 11px;
            margin-top: 16px;
            color: #9ca3af;
          }
          
          @media only screen and (max-width: 600px) {
            .wrapper { 
              padding: 0;
              background: #f9fafb;
            }
            .container { 
              border-radius: 0;
              border-left: none;
              border-right: none;
            }
            .header { 
              padding: 40px 24px;
            }
            .header h1 { 
              font-size: 28px; 
            }
            .content { 
              padding: 32px 24px;
            }
            .booking-card {
              margin: 24px -8px;
              border-radius: 8px;
            }
            .alert-box {
              margin: 24px -8px;
            }
            .primary-button {
              display: block;
              width: 100%;
              text-align: center;
            }
            .secondary-button {
              display: block;
              width: 100%;
              text-align: center;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>Verification Required</h1>
              <p>Your luxury vehicle awaits confirmation</p>
            </div>
            
            <div class="content">
              <div class="greeting">Dear Chris,</div>
              
              <p style="color: #4b5563; font-size: 15px; line-height: 1.7;">
                Thank you for choosing ItWhip for your premium driving experience. 
                To ensure the security of our exclusive vehicle collection, we require quick verification.
              </p>
              
              <div class="alert-box">
                <strong>Action Required: Complete Verification</strong>
                For this peer-to-peer luxury vehicle, please provide:
                <ul>
                  <li>Valid driver's license (front & back)</li>
                  <li>Identity verification selfie</li>
                </ul>
                <div style="text-align: center;">
                  <a href="http://localhost:3000/rentals/manage/test" class="primary-button">Complete Verification</a>
                </div>
                <div class="deadline-text">
                  Deadline: Friday, August 30 at 11:30 PM PST
                </div>
              </div>
              
              <div class="booking-card">
                <div class="booking-header">
                  <div class="booking-number">RESERVATION #TEST-123</div>
                  <div class="vehicle-name">Lamborghini Huracan Spyder</div>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Pick-up</span>
                  <span class="detail-value">Sat, Sep 6, 2025</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Return</span>
                  <span class="detail-value">Mon, Sep 8, 2025</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Location</span>
                  <span class="detail-value">North Scottsdale</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Duration</span>
                  <span class="detail-value">3 Days</span>
                </div>
                
                <div class="detail-row total-row">
                  <span class="detail-label">Total Amount</span>
                  <span class="total-amount">$2,297.70</span>
                </div>
              </div>
              
              <div class="button-center">
                <a href="http://localhost:3000/rentals/manage/test" class="secondary-button">View Full Details</a>
              </div>
              
              <div class="help-text">
                Need assistance? Our concierge team is available at<br>
                <a href="mailto:support@itwhip.com">support@itwhip.com</a> or (480) 555-0100
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-logo">ITWHIP</div>
              <p>Premium Vehicle Rentals</p>
              <p>Phoenix, Arizona</p>
              <p class="footer-legal">
                This email was sent to hxris08@gmail.com regarding reservation #TEST-123<br>
                © 2024 ItWhip Technologies. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
    `
    
    const result = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'hxris08@gmail.com',
      subject: 'Action Required: Complete Your ItWhip Reservation',
      html: html
    })
    
    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: 'Professional email sent to hxris08@gmail.com'
    })
    
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}
