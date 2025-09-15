// app/lib/email/templates/booking-cancelled.ts

import { BookingCancelledData, EmailTemplate } from '../types'

/**
* Email template for cancelled bookings
* Sent when guest or admin cancels a booking
*/

export function getBookingCancelledTemplate(data: BookingCancelledData): EmailTemplate {
 const subject = `Booking Cancelled - ${data.carMake} ${data.carModel}`
 
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
         .cancellation-box {
           background: #f3f4f6;
           border-left: 4px solid #6b7280;
           padding: 16px;
           margin: 20px 0;
           font-size: 14px;
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
         .refund-box {
           background: #f0fdf4;
           border: 1px solid #86efac;
           padding: 20px;
           margin: 24px 0;
         }
         .refund-box h3 {
           font-size: 16px;
           margin: 0 0 12px 0;
           color: #14532d;
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
           <div class="status-badge">Cancelled</div>
           <h1>Booking Cancelled</h1>
           <p>Your reservation has been cancelled</p>
         </div>
         
         <div class="content">
           <p style="font-size: 16px; margin-bottom: 16px;">Dear ${data.guestName},</p>
           
           <div class="cancellation-box">
             Your booking for the <strong>${data.carMake} ${data.carModel}</strong> has been successfully cancelled.
             ${data.cancellationReason ? `<br><br><strong>Reason:</strong> ${data.cancellationReason}` : ''}
           </div>
           
           <div class="details-box">
             <h3 style="margin: 0 0 16px 0; font-size: 18px;">Cancelled Booking Details</h3>
             <div class="detail-row">
               <span>Booking Code</span>
               <strong>${data.bookingCode}</strong>
             </div>
             <div class="detail-row">
               <span>Vehicle</span>
               <strong>${data.carMake} ${data.carModel}</strong>
             </div>
             <div class="detail-row">
               <span>Original Pick-up Date</span>
               <strong>${data.startDate}</strong>
             </div>
           </div>
           
           ${data.refundAmount ? `
           <div class="refund-box">
             <h3>Refund Information</h3>
             <p style="font-size: 14px; color: #166534;">
               Refund Amount: <strong>$${data.refundAmount}</strong><br>
               ${data.refundTimeframe ? `Processing Time: ${data.refundTimeframe}` : 'Processing Time: 3-5 business days'}
             </p>
             <p style="font-size: 13px; color: #4b5563; margin-top: 12px;">
               Your refund will be credited to your original payment method.
             </p>
           </div>
           ` : `
           <div class="cancellation-box">
             <strong>No Charges Applied</strong><br>
             Since your booking was pending verification, no charges were processed.
           </div>
           `}
           
           <a href="https://itwhip.com/rentals/search" class="button">Book Another Vehicle</a>
           
           <p style="text-align: center; margin-top: 24px; font-size: 14px; color: #6b7280;">
             Questions about this cancellation?<br>
             Contact support@itwhip.com with booking code #${data.bookingCode}
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
Booking Cancelled

Dear ${data.guestName},

Your booking for the ${data.carMake} ${data.carModel} has been successfully cancelled.
${data.cancellationReason ? `Reason: ${data.cancellationReason}` : ''}

CANCELLED BOOKING DETAILS:
- Booking Code: ${data.bookingCode}
- Vehicle: ${data.carMake} ${data.carModel}
- Original Pick-up Date: ${data.startDate}

${data.refundAmount ? `REFUND INFORMATION:
- Refund Amount: $${data.refundAmount}
- Processing Time: ${data.refundTimeframe || '3-5 business days'}
- Your refund will be credited to your original payment method.
` : `NO CHARGES APPLIED
Since your booking was pending verification, no charges were processed.`}

Book another vehicle: https://itwhip.com/rentals/search

Questions about this cancellation?
Contact support@itwhip.com with booking code #${data.bookingCode}

ITWHIP - Premium Vehicle Rentals
© 2024 ItWhip Technologies. All rights reserved.
 `
 
 return { subject, html, text }
}