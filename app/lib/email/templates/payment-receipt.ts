// app/lib/email/templates/payment-receipt.ts

import { PaymentReceiptData, EmailTemplate } from '../types'

/**
* Email template for payment receipts
* Sent after successful payment processing
*/

export function getPaymentReceiptTemplate(data: PaymentReceiptData): EmailTemplate {
 const subject = `Payment Receipt - ${data.carMake} ${data.carModel}`
 
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
           background: #1f2937;
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
         .receipt-header {
           background: #f9fafb;
           border: 1px solid #e5e7eb;
           padding: 20px;
           margin: 20px 0;
           text-align: center;
         }
         .receipt-header h2 {
           font-size: 24px;
           color: #10b981;
           margin: 0 0 8px 0;
         }
         .transaction-info {
           font-size: 13px;
           color: #6b7280;
         }
         .payment-details {
           background: white;
           border: 1px solid #e5e7eb;
           padding: 20px;
           margin: 20px 0;
         }
         .payment-row {
           display: flex;
           justify-content: space-between;
           padding: 10px 0;
           border-bottom: 1px solid #f3f4f6;
           font-size: 14px;
         }
         .payment-row:last-child {
           border-bottom: none;
         }
         .breakdown-box {
           background: #f9fafb;
           padding: 20px;
           margin: 20px 0;
         }
         .breakdown-row {
           display: flex;
           justify-content: space-between;
           padding: 8px 0;
           font-size: 14px;
         }
         .total-row {
           border-top: 2px solid #e5e7eb;
           padding-top: 12px;
           margin-top: 12px;
           font-weight: 600;
           font-size: 16px;
         }
         .button {
           display: block;
           width: 100%;
           padding: 14px;
           background: #1f2937;
           color: white;
           text-decoration: none;
           text-align: center;
           font-weight: 500;
           margin: 24px 0;
         }
         .tax-notice {
           background: #f3f4f6;
           padding: 16px;
           margin: 24px 0;
           font-size: 13px;
           color: #4b5563;
           text-align: center;
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
           .payment-row { font-size: 13px; }
         }
       </style>
     </head>
     <body>
       <div class="container">
         <div class="header">
           <h1>Payment Receipt</h1>
           <p>Thank you for your payment</p>
         </div>
         
         <div class="content">
           <p style="font-size: 16px; margin-bottom: 16px;">Dear ${data.guestName},</p>
           
           <div class="receipt-header">
             <h2>$${data.totalAmount}</h2>
             <div class="transaction-info">
               Transaction ID: ${data.transactionId}<br>
               Date: ${data.paymentDate}
             </div>
           </div>
           
           <div class="payment-details">
             <h3 style="margin: 0 0 16px 0; font-size: 18px;">Payment Details</h3>
             <div class="payment-row">
               <span>Booking Code</span>
               <strong>${data.bookingCode}</strong>
             </div>
             <div class="payment-row">
               <span>Vehicle</span>
               <strong>${data.carMake} ${data.carModel}</strong>
             </div>
             <div class="payment-row">
               <span>Payment Method</span>
               <strong>${data.paymentMethod}</strong>
             </div>
             <div class="payment-row">
               <span>Payment Date</span>
               <strong>${data.paymentDate}</strong>
             </div>
           </div>
           
           <div class="breakdown-box">
             <h3 style="margin: 0 0 16px 0; font-size: 16px;">Price Breakdown</h3>
             <div class="breakdown-row">
               <span>Rental Subtotal</span>
               <span>$${data.subtotal}</span>
             </div>
             <div class="breakdown-row">
               <span>Service Fees</span>
               <span>$${data.fees}</span>
             </div>
             <div class="breakdown-row">
               <span>Taxes</span>
               <span>$${data.taxes}</span>
             </div>
             <div class="breakdown-row total-row">
               <span>Total Paid</span>
               <span>$${data.totalAmount}</span>
             </div>
           </div>
           
           <a href="javascript:window.print()" class="button">Print Receipt</a>
           
           <div class="tax-notice">
             <strong>Tax Information</strong><br>
             This receipt serves as proof of payment for tax purposes.<br>
             Transaction ID: ${data.transactionId}
           </div>
           
           <p style="text-align: center; margin-top: 24px; font-size: 14px; color: #6b7280;">
             For billing questions, contact support@itwhip.com
           </p>
         </div>
         
         <div class="footer">
           <strong>ITWHIP</strong><br>
           Premium Vehicle Rentals<br>
           Phoenix, AZ 85255<br>
           <span style="font-size: 11px;">© 2024 ItWhip Technologies. All rights reserved.</span>
         </div>
       </div>
     </body>
   </html>
 `
 
 const text = `
Payment Receipt

Dear ${data.guestName},

Thank you for your payment.

PAYMENT CONFIRMATION:
Amount Paid: $${data.totalAmount}
Transaction ID: ${data.transactionId}
Date: ${data.paymentDate}

PAYMENT DETAILS:
- Booking Code: ${data.bookingCode}
- Vehicle: ${data.carMake} ${data.carModel}
- Payment Method: ${data.paymentMethod}
- Payment Date: ${data.paymentDate}

PRICE BREAKDOWN:
- Rental Subtotal: $${data.subtotal}
- Service Fees: $${data.fees}
- Taxes: $${data.taxes}
- Total Paid: $${data.totalAmount}

TAX INFORMATION:
This receipt serves as proof of payment for tax purposes.
Transaction ID: ${data.transactionId}

For billing questions, contact support@itwhip.com

ITWHIP - Premium Vehicle Rentals
Phoenix, AZ 85255
© 2024 ItWhip Technologies. All rights reserved.
 `
 
 return { subject, html, text }
}