// app/lib/email/templates/booking-received.ts

import { BookingReceivedData, EmailTemplate } from '../types'

/**
 * Email template for initial booking confirmation
 * Sent immediately after booking (before verification for P2P)
 */

export function getBookingReceivedTemplate(data: BookingReceivedData): EmailTemplate {
  const subject = `Booking Received - ${data.carMake} ${data.carModel}`
  
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
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); 
            color: white; 
            padding: 40px 20px;
            text-align: center; 
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
          .status-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 20px;
            margin: 24px 0;
            border-radius: 4px;
          }
          .car-image {
            width: 100%;
            height: auto;
            display: block;
            margin: 20px 0;
          }
          .details-box {
            background: white;
            border: 1px solid #e5e7eb;
            padding: 20px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
            font-size: 14px;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .next-steps {
            background: #eff6ff;
            border: 1px solid #dbeafe;
            padding: 20px;
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
            .header { padding: 30px 16px; }
            .header h1 { font-size: 24px; }
            .content { padding: 20px 16px; }
            .detail-row { font-size: 13px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Received</h1>
            <p>We've received your rental request</p>
          </div>
          
          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Dear ${data.guestName},</p>
            
            <p>Thank you for choosing ItWhip! We've received your booking request and are processing it now.</p>
            
            ${data.isP2P ? `
            <div class="status-box">
              <h3 style="margin: 0 0 12px 0; font-size: 16px;">What Happens Next?</h3>
              <p style="font-size: 14px; color: #4b5563; margin-bottom: 8px;">
                This is a peer-to-peer rental. You'll receive another email shortly with instructions to verify your identity.
              </p>
              <p style="font-size: 14px; color: #4b5563;">
                <strong>Important:</strong> Your booking will be confirmed after verification (usually within 2-4 hours during business hours).
              </p>
            </div>
            ` : `
            <div class="status-box">
              <h3 style="margin: 0 0 12px 0; font-size: 16px;">Booking Status</h3>
              <p style="font-size: 14px; color: #059669;">
                Your booking is confirmed! You'll receive pickup instructions 24 hours before your rental.
              </p>
            </div>
            `}
            
            <img src="${data.carImage}" alt="${data.carMake} ${data.carModel}" class="car-image" />
            
            <div class="details-box">
              <h3 style="margin: 0 0 16px 0; font-size: 18px;">${data.carMake} ${data.carModel}</h3>
              <div class="detail-row">
                <span>Booking Code</span>
                <strong>${data.bookingCode}</strong>
              </div>
              <div class="detail-row">
                <span>Pick-up Date</span>
                <strong>${data.startDate}</strong>
              </div>
              <div class="detail-row">
                <span>Return Date</span>
                <strong>${data.endDate}</strong>
              </div>
              <div class="detail-row">
                <span>Pick-up Time</span>
                <strong>${data.pickupTime}</strong>
              </div>
              <div class="detail-row">
                <span>Location</span>
                <strong>${data.pickupLocation}</strong>
              </div>
              <div class="detail-row">
                <span>Total Amount</span>
                <strong style="color: #111827;">$${data.totalAmount}</strong>
              </div>
            </div>
            
            <div class="next-steps">
              <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #1e40af;">Next Steps:</h3>
              <ol style="margin: 0 0 0 20px; padding: 0; font-size: 14px; color: #1e40af;">
                ${data.isP2P ? `
                <li>Check your email for verification instructions</li>
                <li>Upload required documents within 24 hours</li>
                <li>Receive confirmation once approved</li>
                <li>Get host contact details and pickup instructions</li>
                ` : `
                <li>Save this confirmation for your records</li>
                <li>You'll receive pickup details 24 hours before</li>
                <li>Bring your driver's license and insurance</li>
                <li>Enjoy your rental!</li>
                `}
              </ol>
            </div>
            
            <p style="text-align: center; margin-top: 24px; font-size: 14px; color: #6b7280;">
              Questions? Contact support@itwhip.com
            </p>
          </div>
          
          <div class="footer">
            <strong>ITWHIP</strong><br>
            Premium Vehicle Rentals<br>
            <span style="font-size: 11px;">© 2024 ItWhip Technologies. All rights reserved.</span>
          </div>
        </div>
      </body>
    </html>
  `
  
  const text = `
Booking Received

Dear ${data.guestName},

Thank you for choosing ItWhip! We've received your booking request and are processing it now.

${data.isP2P ? 
`What Happens Next?
This is a peer-to-peer rental. You'll receive another email shortly with instructions to verify your identity.
Important: Your booking will be confirmed after verification (usually within 2-4 hours during business hours).` :
`Booking Status: Your booking is confirmed! You'll receive pickup instructions 24 hours before your rental.`}

BOOKING DETAILS:
- Booking Code: ${data.bookingCode}
- Vehicle: ${data.carMake} ${data.carModel}
- Pick-up: ${data.startDate} at ${data.pickupTime}
- Return: ${data.endDate}
- Location: ${data.pickupLocation}
- Total: $${data.totalAmount}

Next Steps:
${data.isP2P ? 
`1. Check your email for verification instructions
2. Upload required documents within 24 hours
3. Receive confirmation once approved
4. Get host contact details and pickup instructions` :
`1. Save this confirmation for your records
2. You'll receive pickup details 24 hours before
3. Bring your driver's license and insurance
4. Enjoy your rental!`}

Questions? Contact support@itwhip.com

ITWHIP - Premium Vehicle Rentals
© 2024 ItWhip Technologies. All rights reserved.
  `
  
  return { subject, html, text }
}