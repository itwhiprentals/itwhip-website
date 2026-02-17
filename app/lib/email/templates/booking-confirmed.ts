// app/lib/email/templates/booking-confirmed.ts

import { BookingConfirmedData, EmailTemplate } from '../types'
import { escapeHtml } from '../sanitize'

/**
* Email template for confirmed bookings
* Sent after admin approval with host contact details
*/

export function getBookingConfirmedTemplate(data: BookingConfirmedData): EmailTemplate {
 const subject = `Booking Confirmed - ${data.carMake} ${data.carModel}`
 
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
           background: #d1fae5;
           border-left: 4px solid #10b981;
           padding: 16px;
           margin: 20px 0;
           font-size: 14px;
           color: #065f46;
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
         .host-box {
           background: #fef3c7;
           border: 1px solid #fbbf24;
           padding: 20px;
           margin: 24px 0;
         }
         .host-box h3 {
           font-size: 16px;
           margin: 0 0 12px 0;
           color: #92400e;
         }
         .host-detail {
           padding: 8px 0;
           font-size: 14px;
         }
         .button {
           display: block;
           width: 100%;
           padding: 14px;
           background: #10b981;
           color: white;
           text-decoration: none;
           text-align: center;
           font-weight: 500;
           margin: 24px 0;
         }
         .next-steps {
           background: #f9fafb;
           border: 1px solid #e5e7eb;
           padding: 20px;
           margin: 24px 0;
         }
         .next-steps h3 {
           font-size: 16px;
           margin: 0 0 12px 0;
         }
         .next-steps ol {
           margin: 0 0 0 20px;
           padding: 0;
           font-size: 14px;
           color: #4b5563;
         }
         .next-steps li {
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
         @media only screen and (max-width: 600px) {
           .header { padding: 30px 16px; }
           .header h1 { font-size: 24px; }
           .content { padding: 20px 16px; }
           .detail-row { font-size: 13px; }
           .host-box { padding: 16px; }
         }
       </style>
     </head>
     <body>
       <div class="container">
         <div class="header">
           <div class="status-badge">Approved</div>
           <h1>Booking Confirmed</h1>
           <p>Your verification has been approved</p>
         </div>
         
         <div class="content">
           <p style="font-size: 16px; margin-bottom: 16px;">Dear ${escapeHtml(data.guestName)},</p>
           
           <div class="success-message">
             <strong>Success!</strong> Your documents have been verified and your booking is confirmed. 
             Payment of $${data.totalAmount} has been processed.
           </div>
           
           <img src="${data.carImage}" alt="${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)}" class="car-image" />
           
           <div class="details-box">
             <h3 style="margin: 0 0 16px 0; font-size: 18px;">${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)}</h3>
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
               <strong>${escapeHtml(data.pickupLocation)}</strong>
             </div>
             <div class="detail-row">
               <span>Total Amount</span>
               <strong style="color: #10b981;">$${data.totalAmount}</strong>
             </div>
           </div>
           
           <div class="host-box">
             <h3>Host Contact Information</h3>
             <div class="host-detail">
               <strong>Name:</strong> ${escapeHtml(data.hostName)}
             </div>
             <div class="host-detail">
               <strong>Phone:</strong> ${data.hostPhone}
             </div>
             <p style="font-size: 13px; color: #92400e; margin-top: 12px;">
               Your host will contact you 24 hours before pickup to coordinate details.
             </p>
           </div>
           
           <a href="${data.dashboardUrl}" class="button">View Booking Details</a>
           
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
           
           <p style="text-align: center; margin-top: 24px; font-size: 14px; color: #6b7280;">
             Questions? Contact info@itwhip.com
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
Booking Confirmed

Dear ${escapeHtml(data.guestName)},

Success! Your documents have been verified and your booking is confirmed.
Payment of $${data.totalAmount} has been processed.

BOOKING DETAILS:
- Booking Code: ${data.bookingCode}
- Vehicle: ${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)}
- Pick-up Date: ${data.startDate}
- Return Date: ${data.endDate}
- Pick-up Time: ${data.pickupTime}
- Location: ${escapeHtml(data.pickupLocation)}
- Total: $${data.totalAmount}

HOST CONTACT:
- Name: ${escapeHtml(data.hostName)}
- Phone: ${data.hostPhone}

Your host will contact you 24 hours before pickup to coordinate details.

WHAT HAPPENS NEXT:
1. Host will contact you 24 hours before pickup
2. Coordinate pickup location and time
3. Bring your verified driver's license and insurance
4. Take photos of the vehicle before driving
5. Enjoy your trip!

View booking details: ${data.dashboardUrl}

Questions? Contact info@itwhip.com

ITWHIP - Premium Vehicle Rentals
© 2026 ItWhip Technologies. All rights reserved.
 `
 
 return { subject, html, text }
}