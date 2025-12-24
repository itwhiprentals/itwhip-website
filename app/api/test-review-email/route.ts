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
    
    // In real usage, this would come from the booking data
    const mockToken = 'test-token-' + Math.random().toString(36).substring(7)
    const trackingUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/rentals/track/${mockToken}`
    const carImageUrl = 'https://res.cloudinary.com/du1hjyrgm/image/upload/f_auto,q_auto,w_800/v1756178756/IMG_0324_kgt9ne.jpg' // Your Lamborghini image
    
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
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
            color: white; 
            padding: 48px 32px;
            text-align: center; 
          }
          
          .status-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.5px;
            margin-bottom: 16px;
          }
          
          .header h1 {
            font-size: 32px;
            font-weight: 300;
            letter-spacing: -0.5px;
            margin: 0 0 8px 0;
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.95;
            margin: 0;
            font-weight: 300;
          }
          
          .content { 
            padding: 40px 32px;
          }
          
          .greeting {
            font-size: 18px;
            font-weight: 400;
            margin-bottom: 20px;
            color: #111827;
          }
          
          .timeline {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 24px;
            margin: 32px 0;
          }
          
          .timeline-header {
            font-size: 14px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 20px;
          }
          
          .timeline-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
            position: relative;
          }
          
          .timeline-item:last-child {
            margin-bottom: 0;
          }
          
          .timeline-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #e5e7eb;
            margin-right: 16px;
            margin-top: 4px;
            flex-shrink: 0;
          }
          
          .timeline-dot.active {
            background: #3b82f6;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          }
          
          .timeline-dot.complete {
            background: #10b981;
          }
          
          .timeline-content h3 {
            font-size: 15px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 4px;
          }
          
          .timeline-content p {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.5;
          }
          
          .booking-card { 
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px; 
            margin: 32px 0;
            overflow: hidden;
          }
          
          .vehicle-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            display: block;
          }
          
          .vehicle-info {
            padding: 24px;
          }
          
          .vehicle-header {
            padding-bottom: 16px;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 20px;
          }
          
          .vehicle-header h3 {
            font-size: 20px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 4px;
          }
          
          .vehicle-header p {
            font-size: 14px;
            color: #6b7280;
          }
          
          .detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          
          .detail-item {
            font-size: 14px;
          }
          
          .detail-label {
            color: #6b7280;
            margin-bottom: 2px;
          }
          
          .detail-value {
            color: #111827;
            font-weight: 500;
          }
          
          .primary-button { 
            display: inline-block; 
            padding: 14px 36px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white !important; 
            text-decoration: none; 
            border-radius: 8px;
            font-weight: 500;
            font-size: 15px;
            letter-spacing: 0.3px;
            box-shadow: 0 4px 6px rgba(37, 99, 235, 0.15);
          }
          
          .button-center {
            text-align: center;
            margin: 32px 0;
          }
          
          .info-box {
            background: #eff6ff;
            border: 1px solid #dbeafe;
            border-radius: 8px;
            padding: 20px;
            margin: 32px 0;
          }
          
          .info-box h3 {
            font-size: 15px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 8px;
          }
          
          .info-box p {
            font-size: 14px;
            color: #1e40af;
            line-height: 1.6;
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
            .content { 
              padding: 32px 24px;
            }
            .detail-grid {
              grid-template-columns: 1fr;
            }
            .primary-button {
              display: block;
              width: 100%;
              text-align: center;
            }
            .vehicle-image {
              height: 160px;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="status-badge">UNDER REVIEW</div>
              <h1>Your Booking is Being Processed</h1>
              <p>We're reviewing your documents</p>
            </div>
            
            <div class="content">
              <div class="greeting">Dear Chris,</div>
              
              <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin-bottom: 8px;">
                Thank you for choosing ItWhip. Your documents have been received and our team is reviewing them now.
              </p>
              
              <p style="color: #4b5563; font-size: 15px; line-height: 1.7;">
                You'll receive confirmation within <strong>2-4 hours</strong> during business hours.
              </p>
              
              <div class="timeline">
                <div class="timeline-header">Booking Progress</div>
                
                <div class="timeline-item">
                  <div class="timeline-dot complete"></div>
                  <div class="timeline-content">
                    <h3>Documents Submitted</h3>
                    <p>License, insurance, and selfie uploaded successfully</p>
                  </div>
                </div>
                
                <div class="timeline-item">
                  <div class="timeline-dot active"></div>
                  <div class="timeline-content">
                    <h3>Under Review</h3>
                    <p>Our team is verifying your documents and identity</p>
                  </div>
                </div>
                
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <h3>Payment Processing</h3>
                    <p>Payment will be processed after approval</p>
                  </div>
                </div>
                
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <h3>Booking Confirmed</h3>
                    <p>You'll receive final confirmation with host details</p>
                  </div>
                </div>
              </div>
              
              <div class="booking-card">
                <img src="${carImageUrl}" alt="Vehicle" class="vehicle-image" />
                <div class="vehicle-info">
                  <div class="vehicle-header">
                    <h3>Lamborghini Huracan Spyder</h3>
                    <p>Reservation #TEST-123</p>
                  </div>
                  
                  <div class="detail-grid">
                    <div class="detail-item">
                      <div class="detail-label">Pick-up</div>
                      <div class="detail-value">Sep 6, 2025</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Return</div>
                      <div class="detail-value">Sep 8, 2025</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Location</div>
                      <div class="detail-value">North Scottsdale</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Total</div>
                      <div class="detail-value">$2,297.70</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="button-center">
                <a href="${trackingUrl}" class="primary-button">Track Your Booking</a>
              </div>
              
              <div class="info-box">
                <h3>Why Manual Review?</h3>
                <p>
                  Unlike automated systems, our human verification ensures both vehicle owners and renters 
                  are protected. We verify that your selfie matches your license photo, ensuring the person 
                  booking is the person driving. This one-time review helps maintain the highest safety 
                  standards for our exclusive vehicle collection.
                </p>
              </div>
              
              <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 32px;">
                Questions? Contact us at <a href="mailto:info@itwhip.com" style="color: #3b82f6; text-decoration: none;">info@itwhip.com</a>
              </p>
            </div>
            
            <div class="footer">
              <div class="footer-logo">ITWHIP</div>
              <p>Premium Vehicle Rentals</p>
              <p style="font-size: 11px; margin-top: 12px; color: #9ca3af;">
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
      subject: 'Your ItWhip Booking is Under Review - #TEST-123',
      html: html
    })
    
    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      trackingUrl: trackingUrl,
      message: 'Review email with car image sent to hxris08@gmail.com'
    })
    
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}
