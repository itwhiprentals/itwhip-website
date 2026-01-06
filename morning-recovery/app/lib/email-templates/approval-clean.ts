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
            background: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border: 1px solid #e5e7eb;
          }
          
          .header { 
            background: #059669;
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
          
          .success-message {
            background: #dcfce7;
            border-left: 4px solid #059669;
            padding: 16px;
            margin: 20px 0;
            font-size: 14px;
            color: #14532d;
          }
          
          .car-image {
            width: 100%;
            height: auto;
            display: block;
            margin: 20px 0;
          }
          
          .details-box {
            background: #f9fafb;
            padding: 20px;
            margin: 20px 0;
            border: 1px solid #e5e7eb;
          }
          
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
          }
          
          .detail-row:last-child {
            border-bottom: none;
          }
          
          .detail-label {
            color: #6b7280;
            font-weight: 500;
          }
          
          .detail-value {
            color: #111827;
            text-align: right;
          }
          
          .host-info {
            background: #fef3c7;
            padding: 16px;
            margin: 20px 0;
            border: 1px solid #fbbf24;
          }
          
          .host-info h3 {
            font-size: 16px;
            margin: 0 0 12px 0;
            color: #92400e;
          }
          
          .button {
            display: block;
            width: 100%;
            padding: 14px;
            background: #059669;
            color: white;
            text-decoration: none;
            text-align: center;
            font-weight: 500;
            margin: 24px 0;
          }
          
          .footer {
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
          }
          
          @media only screen and (max-width: 600px) {
            .header {
              padding: 30px 16px;
            }
            .header h1 {
              font-size: 24px;
            }
            .content {
              padding: 20px 16px;
            }
            .details-box {
              padding: 16px;
            }
            .detail-row {
              font-size: 13px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="status-badge">Approved</div>
            <h1>Booking Confirmed</h1>
            <p>Your rental has been approved</p>
          </div>
          
          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Dear ${data.guestName},</p>
            
            <div class="success-message">
              <strong>Success!</strong> Your documents have been verified and your booking is confirmed. 
              Payment of $${data.totalAmount} has been processed.
            </div>
            
            <img src="${carImageUrl}" alt="${data.carMake} ${data.carModel}" class="car-image" />
            
            <div class="details-box">
              <h3 style="margin: 0 0 16px 0; font-size: 18px;">${data.carMake} ${data.carModel}</h3>
              <div class="detail-row">
                <span class="detail-label">Booking Code</span>
                <span class="detail-value">${data.bookingCode}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Pick-up Date</span>
                <span class="detail-value">${data.startDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Return Date</span>
                <span class="detail-value">${data.endDate || data.startDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Pick-up Time</span>
                <span class="detail-value">${data.pickupTime || '10:00 AM'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Location</span>
                <span class="detail-value">${data.pickupLocation}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Amount</span>
                <span class="detail-value" style="font-weight: 600; color: #059669;">$${data.totalAmount}</span>
              </div>
            </div>
            
            <div class="host-info">
              <h3>Host Contact Information</h3>
              <p style="margin: 0; font-size: 14px;">
                <strong>Name:</strong> ${data.hostName}<br>
                <strong>Phone:</strong> ${data.hostPhone}<br>
                <span style="font-size: 13px; color: #92400e;">Host will contact you 24 hours before pickup</span>
              </p>
            </div>
            
            <a href="${data.dashboardUrl}" class="button">View Booking Details</a>
            
            <div style="margin-top: 24px; padding: 16px; background: #f3f4f6;">
              <h4 style="margin: 0 0 12px 0; font-size: 14px;">Next Steps:</h4>
              <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #4b5563;">
                <li>Host will contact you 24 hours before pickup</li>
                <li>Bring your verified driver's license and insurance</li>
                <li>Take photos of the vehicle before driving</li>
                <li>Enjoy your trip</li>
              </ol>
            </div>
            
            <p style="text-align: center; margin-top: 24px; font-size: 13px; color: #6b7280;">
              Questions? Contact info@itwhip.com
            </p>
          </div>
          
          <div class="footer">
            <strong>ITWHIP</strong><br>
            Premium Vehicle Rentals<br>
            <span style="font-size: 11px; color: #9ca3af;">
              This email was sent to ${data.guestEmail}<br>
              © 2024 ItWhip Technologies. All rights reserved.
            </span>
          </div>
        </div>
      </body>
    </html>
  `
}
