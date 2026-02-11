// app/lib/email/templates/trip-complete.ts

import { TripCompleteData, EmailTemplate } from '../types'
import { escapeHtml } from '../sanitize'

/**
* Email template for trip completion
* Sent after rental period ends with review request
*/

export function getTripCompleteTemplate(data: TripCompleteData): EmailTemplate {
 const subject = `Trip Complete - How was your ${data.carMake} ${data.carModel}?`
 
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
         .summary-box {
           background: #f9fafb;
           border: 1px solid #e5e7eb;
           padding: 20px;
           margin: 20px 0;
         }
         .summary-row {
           display: flex;
           justify-content: space-between;
           padding: 10px 0;
           border-bottom: 1px solid #e5e7eb;
           font-size: 14px;
         }
         .summary-row:last-child {
           border-bottom: none;
         }
         .review-box {
           background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
           border: 1px solid #fbbf24;
           padding: 24px;
           margin: 24px 0;
           text-align: center;
         }
         .review-box h2 {
           font-size: 20px;
           color: #78350f;
           margin: 0 0 12px 0;
         }
         .star-rating {
           font-size: 32px;
           margin: 16px 0;
           letter-spacing: 8px;
         }
         .button {
           display: inline-block;
           padding: 14px 36px;
           background: #8b5cf6;
           color: white;
           text-decoration: none;
           text-align: center;
           font-weight: 500;
           margin: 16px 0;
           border-radius: 4px;
         }
         .next-trip {
           background: #eff6ff;
           border: 1px solid #dbeafe;
           padding: 20px;
           margin: 24px 0;
           text-align: center;
         }
         .next-trip h3 {
           font-size: 16px;
           color: #1e40af;
           margin: 0 0 12px 0;
         }
         .discount-code {
           display: inline-block;
           background: white;
           border: 2px dashed #3b82f6;
           padding: 8px 16px;
           margin: 12px 0;
           font-size: 18px;
           font-weight: 600;
           color: #3b82f6;
           letter-spacing: 1px;
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
           .summary-row { font-size: 13px; }
           .button { 
             display: block; 
             width: 100%;
           }
         }
       </style>
     </head>
     <body>
       <div class="container">
         <div class="header">
           <h1>Trip Complete</h1>
           <p>Thank you for choosing ItWhip</p>
         </div>
         
         <div class="content">
           <p style="font-size: 16px; margin-bottom: 16px;">Dear ${escapeHtml(data.guestName)},</p>
           
           <p>We hope you enjoyed your experience with the ${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)}!</p>
           
           <div class="summary-box">
             <h3 style="margin: 0 0 16px 0; font-size: 18px;">Trip Summary</h3>
             <div class="summary-row">
               <span>Booking Code</span>
               <strong>${data.bookingCode}</strong>
             </div>
             <div class="summary-row">
               <span>Vehicle</span>
               <strong>${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)}</strong>
             </div>
             <div class="summary-row">
               <span>Host</span>
               <strong>${escapeHtml(data.hostName)}</strong>
             </div>
             <div class="summary-row">
               <span>Trip Duration</span>
               <strong>${data.tripDuration}</strong>
             </div>
             <div class="summary-row">
               <span>Total Cost</span>
               <strong>$${data.totalCost}</strong>
             </div>
           </div>
           
           <div class="review-box">
             <h2>How was your experience?</h2>
             <p style="font-size: 14px; color: #92400e; margin-bottom: 16px;">
               Your feedback helps ${escapeHtml(data.hostName)} and future renters
             </p>
             <div class="star-rating">☆☆☆☆☆</div>
             <a href="${data.reviewUrl}" class="button">Leave a Review</a>
             <p style="font-size: 12px; color: #92400e; margin-top: 12px;">
               Takes less than 60 seconds
             </p>
           </div>
           
           <div class="next-trip">
             <h3>Ready for your next adventure?</h3>
             <p style="font-size: 14px; color: #3b82f6; margin-bottom: 12px;">
               Enjoy 10% off your next booking
             </p>
             <div class="discount-code">RETURN10</div>
             <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">
               Valid for 30 days
             </p>
           </div>
           
           <p style="text-align: center; margin-top: 24px; font-size: 14px; color: #6b7280;">
             Thank you for choosing ItWhip. We look forward to your next trip!<br>
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
Trip Complete

Dear ${escapeHtml(data.guestName)},

We hope you enjoyed your experience with the ${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)}!

TRIP SUMMARY:
- Booking Code: ${data.bookingCode}
- Vehicle: ${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)}
- Host: ${escapeHtml(data.hostName)}
- Trip Duration: ${data.tripDuration}
- Total Cost: $${data.totalCost}

HOW WAS YOUR EXPERIENCE?
Your feedback helps ${escapeHtml(data.hostName)} and future renters.
Leave a review (takes less than 60 seconds): ${data.reviewUrl}

READY FOR YOUR NEXT ADVENTURE?
Enjoy 10% off your next booking with code: RETURN10
Valid for 30 days

Thank you for choosing ItWhip. We look forward to your next trip!

Questions? Contact info@itwhip.com

ITWHIP - Premium Vehicle Rentals
© 2024 ItWhip Technologies. All rights reserved.
 `
 
 return { subject, html, text }
}