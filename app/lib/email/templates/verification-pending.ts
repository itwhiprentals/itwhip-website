// app/lib/email/templates/verification-pending.ts

import { VerificationPendingData, EmailTemplate } from '../types'
import { escapeHtml } from '../sanitize'

/**
* Email template for P2P bookings under review
* Sent immediately after booking when documents need verification
*/

export function getVerificationPendingTemplate(data: VerificationPendingData): EmailTemplate {
 const subject = `Booking Under Review - ${data.carMake} ${data.carModel}`
 
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
           background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
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
         .timeline-box {
           background: #f9fafb;
           border: 1px solid #e5e7eb;
           padding: 20px;
           margin: 24px 0;
           border-radius: 4px;
         }
         .timeline-item {
           padding: 12px 0;
           border-bottom: 1px solid #e5e7eb;
         }
         .timeline-item:last-child {
           border-bottom: none;
         }
         .timeline-dot {
           display: inline-block;
           width: 8px;
           height: 8px;
           border-radius: 50%;
           background: #3b82f6;
           margin-right: 12px;
         }
         .timeline-dot.complete {
           background: #10b981;
         }
         .timeline-dot.pending {
           background: #e5e7eb;
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
         .info-box {
           background: #eff6ff;
           border: 1px solid #dbeafe;
           padding: 16px;
           margin: 20px 0;
           font-size: 14px;
           color: #1e40af;
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
           <div class="status-badge">Under Review</div>
           <h1>Your Booking is Being Processed</h1>
           <p>We're reviewing your documents</p>
         </div>
         
         <div class="content">
           <p style="font-size: 16px; margin-bottom: 16px;">Dear ${escapeHtml(data.guestName)},</p>
           
           <p>Thank you for choosing ItWhip. Your documents have been received and our team is reviewing them now.</p>
           
           <p style="margin: 16px 0;">You'll receive confirmation within <strong>${data.estimatedReviewTime}</strong> during business hours.</p>
           
           <div class="timeline-box">
             <h3 style="margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; color: #6b7280;">Booking Progress</h3>
             
             <div class="timeline-item">
               <span class="timeline-dot complete"></span>
               <strong>Documents Submitted</strong>
               <div style="margin-left: 20px; color: #6b7280; font-size: 13px;">
                 Received at ${data.documentsSubmittedAt}
               </div>
             </div>
             
             <div class="timeline-item">
               <span class="timeline-dot"></span>
               <strong>Under Review</strong>
               <div style="margin-left: 20px; color: #6b7280; font-size: 13px;">
                 Our team is verifying your documents
               </div>
             </div>
             
             <div class="timeline-item">
               <span class="timeline-dot pending"></span>
               <strong>Payment Processing</strong>
               <div style="margin-left: 20px; color: #6b7280; font-size: 13px;">
                 Will process after approval
               </div>
             </div>
             
             <div class="timeline-item">
               <span class="timeline-dot pending"></span>
               <strong>Booking Confirmed</strong>
               <div style="margin-left: 20px; color: #6b7280; font-size: 13px;">
                 You'll receive host contact details
               </div>
             </div>
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
               <span>Location</span>
               <strong>${escapeHtml(data.pickupLocation)}</strong>
             </div>
             <div class="detail-row">
               <span>Total Amount</span>
               <strong style="color: #3b82f6;">$${data.totalAmount}</strong>
             </div>
           </div>
           
           <a href="${data.trackingUrl}" class="button">Track Your Booking</a>
           
           <div class="info-box">
             <strong>Why Manual Review?</strong><br>
             Unlike automated systems, our human verification ensures both vehicle owners and renters 
             are protected. We verify that your selfie matches your license photo, ensuring the person 
             booking is the person driving.
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
Booking Under Review

Dear ${escapeHtml(data.guestName)},

Thank you for choosing ItWhip. Your documents have been received and our team is reviewing them now.

You'll receive confirmation within ${data.estimatedReviewTime} during business hours.

BOOKING DETAILS:
- Booking Code: ${data.bookingCode}
- Vehicle: ${escapeHtml(data.carMake)} ${escapeHtml(data.carModel)}
- Pick-up: ${data.startDate}
- Return: ${data.endDate}
- Location: ${escapeHtml(data.pickupLocation)}
- Total: $${data.totalAmount}

Track your booking: ${data.trackingUrl}

Questions? Contact info@itwhip.com

ITWHIP - Premium Vehicle Rentals
© 2026 ItWhip Technologies. All rights reserved.
 `
 
 return { subject, html, text }
}