// app/lib/email/templates/pickup-reminder.ts

import { PickupReminderData, EmailTemplate } from '../types'

/**
* Email template for pickup reminders
* Sent 24 hours before scheduled pickup
*/

export function getPickupReminderTemplate(data: PickupReminderData): EmailTemplate {
 const subject = `Pickup Tomorrow - ${data.carMake} ${data.carModel}`
 
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
           background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
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
         .reminder-box {
           background: #fef3c7;
           border-left: 4px solid #f59e0b;
           padding: 16px;
           margin: 20px 0;
           font-size: 14px;
           color: #78350f;
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
           background: #dbeafe;
           border: 1px solid #60a5fa;
           padding: 20px;
           margin: 24px 0;
         }
         .host-box h3 {
           font-size: 16px;
           margin: 0 0 12px 0;
           color: #1e3a8a;
         }
         .checklist {
           background: #f9fafb;
           border: 1px solid #e5e7eb;
           padding: 20px;
           margin: 24px 0;
         }
         .checklist h3 {
           font-size: 16px;
           margin: 0 0 12px 0;
         }
         .checklist ul {
           margin: 0 0 0 20px;
           padding: 0;
           font-size: 14px;
           color: #4b5563;
         }
         .checklist li {
           margin: 8px 0;
         }
         .button {
           display: block;
           width: 100%;
           padding: 14px;
           background: #f59e0b;
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
           <div class="status-badge">24 Hour Reminder</div>
           <h1>Your Trip is Tomorrow</h1>
           <p>Get ready for your rental pickup</p>
         </div>
         
         <div class="content">
           <p style="font-size: 16px; margin-bottom: 16px;">Dear ${data.guestName},</p>
           
           <div class="reminder-box">
             <strong>Reminder:</strong> Your rental pickup is scheduled for tomorrow, 
             ${data.pickupDate} at ${data.pickupTime}.
           </div>
           
           <img src="${data.carImage}" alt="${data.carMake} ${data.carModel}" class="car-image" />
           
           <div class="details-box">
             <h3 style="margin: 0 0 16px 0; font-size: 18px;">Pickup Details</h3>
             <div class="detail-row">
               <span>Vehicle</span>
               <strong>${data.carMake} ${data.carModel}</strong>
             </div>
             <div class="detail-row">
               <span>Date</span>
               <strong>${data.pickupDate}</strong>
             </div>
             <div class="detail-row">
               <span>Time</span>
               <strong>${data.pickupTime}</strong>
             </div>
             <div class="detail-row">
               <span>Location</span>
               <strong>${data.pickupLocation}</strong>
             </div>
           </div>
           
           <div class="host-box">
             <h3>Host Contact Information</h3>
             <p style="font-size: 14px; margin-bottom: 8px;">
               <strong>Name:</strong> ${data.hostName}<br>
               <strong>Phone:</strong> ${data.hostPhone}
             </p>
             <p style="font-size: 13px; color: #1e3a8a;">
               Your host will contact you today to confirm pickup details.
               Please have your phone available.
             </p>
           </div>
           
           <div class="checklist">
             <h3>Before Pickup Checklist:</h3>
             <ul>
               <li>Have your driver's license ready</li>
               <li>Bring proof of insurance</li>
               <li>Fully charge your phone for photos</li>
               <li>Arrive 10 minutes early</li>
               <li>Plan to take photos of the vehicle condition</li>
               <li>Review the rental agreement</li>
             </ul>
           </div>
           
           <a href="${data.dashboardUrl}" class="button">View Booking Details</a>
           
           <div style="background: #eff6ff; border: 1px solid #dbeafe; padding: 16px; margin: 24px 0; font-size: 14px;">
             <strong>Important Reminders:</strong>
             <ul style="margin: 8px 0 0 20px; padding: 0; color: #1e40af;">
               <li>Take photos of all sides of the vehicle before driving</li>
               <li>Note the fuel level and mileage</li>
               <li>Report any existing damage immediately</li>
               <li>Return with same fuel level to avoid fees</li>
             </ul>
           </div>
           
           <p style="text-align: center; margin-top: 24px; font-size: 14px; color: #6b7280;">
             Questions? Contact info@itwhip.com or call your host directly
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
Your Trip is Tomorrow

Dear ${data.guestName},

Reminder: Your rental pickup is scheduled for tomorrow, ${data.pickupDate} at ${data.pickupTime}.

PICKUP DETAILS:
- Vehicle: ${data.carMake} ${data.carModel}
- Date: ${data.pickupDate}
- Time: ${data.pickupTime}
- Location: ${data.pickupLocation}

HOST CONTACT:
- Name: ${data.hostName}
- Phone: ${data.hostPhone}

Your host will contact you today to confirm pickup details. Please have your phone available.

BEFORE PICKUP CHECKLIST:
- Have your driver's license ready
- Bring proof of insurance
- Fully charge your phone for photos
- Arrive 10 minutes early
- Plan to take photos of the vehicle condition
- Review the rental agreement

IMPORTANT REMINDERS:
- Take photos of all sides of the vehicle before driving
- Note the fuel level and mileage
- Report any existing damage immediately
- Return with same fuel level to avoid fees

View booking details: ${data.dashboardUrl}

Questions? Contact info@itwhip.com or call your host directly

ITWHIP - Premium Vehicle Rentals
© 2024 ItWhip Technologies. All rights reserved.
 `
 
 return { subject, html, text }
}