// app/lib/email/templates/booking-rejected.ts

import { BookingRejectedData, EmailTemplate } from '../types'
import { escapeHtml } from '../sanitize'

/**
* Email template for rejected bookings
* Sent after admin rejects verification
*/

export function getBookingRejectedTemplate(data: BookingRejectedData): EmailTemplate {
 const subject = `Booking Could Not Be Verified - ${data.carMake} ${data.carModel}`
 
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
           background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
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
         .alert-message {
           background: #fee2e2;
           border-left: 4px solid #ef4444;
           padding: 16px;
           margin: 20px 0;
           font-size: 14px;
           color: #7f1d1d;
         }
         .reason-box {
           background: #f9fafb;
           border: 1px solid #e5e7eb;
           padding: 20px;
           margin: 24px 0;
         }
         .reason-box h3 {
           font-size: 16px;
           margin: 0 0 12px 0;
           color: #111827;
         }
         .common-issues {
           background: white;
           border: 1px solid #e5e7eb;
           padding: 20px;
           margin: 24px 0;
         }
         .common-issues h3 {
           font-size: 16px;
           margin: 0 0 12px 0;
         }
         .common-issues ul {
           margin: 0 0 0 20px;
           padding: 0;
           font-size: 14px;
           color: #4b5563;
         }
         .common-issues li {
           margin: 8px 0;
         }
         .button {
           display: block;
           width: 100%;
           padding: 14px;
           background: #3b82f6;
           color: white;
           text-decoration: none;
           text-align: center;
           font-weight: 500;
           margin: 24px 0;
         }
         .support-box {
           background: #eff6ff;
           border: 1px solid #dbeafe;
           padding: 16px;
           margin: 24px 0;
           text-align: center;
           font-size: 14px;
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
         }
       </style>
     </head>
     <body>
       <div class="container">
         <div class="header">
           <div class="status-badge">Verification Issue</div>
           <h1>Booking Could Not Be Verified</h1>
           <p>We were unable to verify your documents</p>
         </div>
         
         <div class="content">
           <p style="font-size: 16px; margin-bottom: 16px;">Dear ${escapeHtml(data.guestName)},</p>
           
           <div class="alert-message">
             Unfortunately, we were unable to verify your booking for the <strong>${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)}</strong>. 
             Your booking #${data.bookingCode} has been cancelled and no charges have been processed.
           </div>
           
           <div class="reason-box">
             <h3>Reason for Rejection:</h3>
             <p style="font-size: 14px; color: #4b5563;">
               ${escapeHtml(data.reason)}
             </p>
           </div>
           
           ${data.canRebook ? `
           <div class="common-issues">
             <h3>What You Can Do:</h3>
             <ul>
               <li>Ensure all photos are clear and well-lit</li>
               <li>Make sure your license is not expired</li>
               <li>Verify your name matches your documents</li>
               <li>Check that you meet age requirements (25+ for luxury vehicles)</li>
             </ul>
           </div>
           
           <a href="https://itwhip.com/rentals/search" class="button">Browse Other Vehicles</a>
           ` : ''}
           
           <div class="support-box">
             <strong>Need Help?</strong><br>
             Our support team can assist you with verification issues.<br>
             Contact us at <a href="mailto:${data.supportEmail}" style="color: #3b82f6; text-decoration: none;">${data.supportEmail}</a>
           </div>
           
           <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
             We apologize for any inconvenience. If you believe this was an error, please contact our support team 
             with your booking code #${data.bookingCode}.
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
Booking Could Not Be Verified

Dear ${escapeHtml(data.guestName)},

Unfortunately, we were unable to verify your booking for the ${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)}.
Your booking #${data.bookingCode} has been cancelled and no charges have been processed.

REASON FOR REJECTION:
${escapeHtml(data.reason)}

${data.canRebook ? `WHAT YOU CAN DO:
- Ensure all photos are clear and well-lit
- Make sure your license is not expired
- Verify your name matches your documents
- Check that you meet age requirements (25+ for luxury vehicles)

Browse other vehicles: https://itwhip.com/rentals/search
` : ''}

NEED HELP?
Our support team can assist you with verification issues.
Contact us at ${data.supportEmail}

We apologize for any inconvenience. If you believe this was an error, 
please contact our support team with your booking code #${data.bookingCode}.

ITWHIP - Premium Vehicle Rentals
© 2025 ItWhip Technologies. All rights reserved.
 `
 
 return { subject, html, text }
}