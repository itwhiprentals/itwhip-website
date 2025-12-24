export function getApprovalEmailTemplate(data: any): string {
  const carImageUrl = data.carImageUrl || 'https://res.cloudinary.com/du1hjyrgm/image/upload/f_auto,q_auto,w_800/v1756178756/IMG_0324_kgt9ne.jpg'
  
  return `
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
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
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
          
          .success-box {
            background: #d1fae5;
            border: 1px solid #10b981;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
          }
          
          .success-box h3 {
            font-size: 16px;
            font-weight: 600;
            color: #065f46;
            margin-bottom: 8px;
          }
          
          .success-box p {
            font-size: 14px;
            color: #047857;
            line-height: 1.6;
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
          
          .host-section {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
          }
          
          .host-section h3 {
            font-size: 16px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 12px;
          }
          
          .host-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          
          .host-item {
            font-size: 14px;
          }
          
          .host-label {
            color: #6b7280;
            margin-bottom: 2px;
          }
          
          .host-value {
            color: #111827;
            font-weight: 500;
          }
          
          .next-steps {
            background: #eff6ff;
            border: 1px solid #dbeafe;
            border-radius: 8px;
            padding: 20px;
            margin: 32px 0;
          }
          
          .next-steps h3 {
            font-size: 15px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 12px;
          }
          
          .next-steps ol {
            margin: 0 0 0 20px;
            padding: 0;
          }
          
          .next-steps li {
            font-size: 14px;
            color: #1e40af;
            margin: 8px 0;
          }
          
          .primary-button { 
            display: inline-block; 
            padding: 14px 36px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white !important; 
            text-decoration: none; 
            border-radius: 8px;
            font-weight: 500;
            font-size: 15px;
            letter-spacing: 0.3px;
            box-shadow: 0 4px 6px rgba(16, 185, 129, 0.15);
          }
          
          .button-center {
            text-align: center;
            margin: 32px 0;
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
            .detail-grid, .host-details {
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
              <div class="status-badge">APPROVED</div>
              <h1>Booking Confirmed</h1>
              <p>Your verification has been approved</p>
            </div>
            
            <div class="content">
              <div class="greeting">Dear ${data.guestName},</div>
              
              <p style="color: #4b5563; font-size: 15px; line-height: 1.7;">
                Great news! Your documents have been verified and your booking is now confirmed.
              </p>
              
              <div class="success-box">
                <h3>Payment Processed Successfully</h3>
                <p>
                  Your payment of <strong>$${data.totalAmount}</strong> has been processed. 
                  The host has been notified and will contact you before pickup.
                </p>
              </div>
              
              <div class="booking-card">
                <img src="${carImageUrl}" alt="Vehicle" class="vehicle-image" />
                <div class="vehicle-info">
                  <div class="vehicle-header">
                    <h3>${data.carMake} ${data.carModel}</h3>
                    <p>Confirmation #${data.bookingCode}</p>
                  </div>
                  
                  <div class="detail-grid">
                    <div class="detail-item">
                      <div class="detail-label">Pick-up</div>
                      <div class="detail-value">${data.startDate}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Return</div>
                      <div class="detail-value">${data.endDate || data.startDate}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Pick-up Time</div>
                      <div class="detail-value">${data.pickupTime || '10:00 AM'}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Location</div>
                      <div class="detail-value">${data.pickupLocation}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="host-section">
                <h3>Host Contact Information</h3>
                <div class="host-details">
                  <div class="host-item">
                    <div class="host-label">Host Name</div>
                    <div class="host-value">${data.hostName}</div>
                  </div>
                  <div class="host-item">
                    <div class="host-label">Phone</div>
                    <div class="host-value">${data.hostPhone}</div>
                  </div>
                </div>
                <p style="font-size: 13px; color: #6b7280; margin-top: 12px;">
                  Your host will contact you 24 hours before pickup to coordinate details.
                </p>
              </div>
              
              <div class="button-center">
                <a href="${data.dashboardUrl}" class="primary-button">View Booking Details</a>
              </div>
              
              <div class="next-steps">
                <h3>What Happens Next?</h3>
                <ol>
                  <li>Host will contact you 24 hours before pickup</li>
                  <li>Coordinate pickup location and time</li>
                  <li>Bring your verified driver's license and insurance</li>
                  <li>Take photos of the vehicle before driving</li>
                  <li>Enjoy your trip!</li>
                </ol>
              </div>
              
              <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 32px;">
                Questions? Contact us at <a href="mailto:info@itwhip.com" style="color: #10b981; text-decoration: none;">info@itwhip.com</a>
              </p>
            </div>
            
            <div class="footer">
              <div class="footer-logo">ITWHIP</div>
              <p>Premium Vehicle Rentals</p>
              <p style="font-size: 11px; margin-top: 12px; color: #9ca3af;">
                This email was sent to ${data.guestEmail} regarding reservation #${data.bookingCode}<br>
                © 2024 ItWhip Technologies. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}
