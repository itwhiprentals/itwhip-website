// app/lib/email/index.ts

import { sendEmail } from './sender'
import {
  getBookingConfirmedTemplate,
  getBookingRejectedTemplate,
  getBookingCancelledTemplate,
  getPickupReminderTemplate,
  getPaymentReceiptTemplate,
  getTripCompleteTemplate,
  getVerificationPendingTemplate
} from './templates'
import type { EmailResponse } from './types'

/**
 * Send verification approved email (uses booking confirmed template)
 */
export async function sendVerificationApprovedEmail(
  to: string,
  data: {
    guestName: string
    bookingCode: string
    carMake: string
    carModel: string
    startDate: string | Date
    pickupLocation: string
  }
): Promise<EmailResponse> {
  try {
    const template = getBookingConfirmedTemplate({
      guestName: data.guestName,
      bookingCode: data.bookingCode,
      carDetails: `${data.carMake} ${data.carModel}`,
      startDate: new Date(data.startDate).toISOString(),
      endDate: '', // Add if needed
      pickupLocation: data.pickupLocation,
      pickupTime: '', // Add if needed
      totalAmount: 0, // Add if needed
      bookingUrl: `https://itwhip.com/rentals/dashboard/bookings/${data.bookingCode}`
    })
    
    return await sendEmail(to, template.subject, template.html, template.text)
  } catch (error) {
    console.error('Error sending verification approved email:', error)
    return { success: false, error: 'Failed to send verification approved email' }
  }
}

/**
 * Send verification rejected email (uses booking rejected template)
 */
export async function sendVerificationRejectedEmail(
  to: string,
  data: {
    guestName: string
    bookingCode: string
    reason: string
  }
): Promise<EmailResponse> {
  try {
    const template = getBookingRejectedTemplate({
      guestName: data.guestName,
      bookingCode: data.bookingCode,
      reason: data.reason,
      contactEmail: 'info@itwhip.com',
      contactPhone: '(602) 555-0100'
    })
    
    return await sendEmail(to, template.subject, template.html, template.text)
  } catch (error) {
    console.error('Error sending verification rejected email:', error)
    return { success: false, error: 'Failed to send verification rejected email' }
  }
}

/**
 * Send host notification email
 */
export async function sendHostNotification(
  to: string,
  data: {
    hostName: string
    bookingCode: string
    guestName: string
    carMake: string
    carModel: string
    startDate: string | Date
    endDate: string | Date
    totalAmount: number
  }
): Promise<EmailResponse> {
  try {
    // Create a custom host notification using payment receipt as base
    const hostEarnings = data.totalAmount * 0.8 // 80% to host after 20% platform fee
    
    const subject = `New Booking: ${data.carMake} ${data.carModel} - ${data.bookingCode}`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>New Booking Confirmed!</h2>
            <p>Hi ${data.hostName},</p>
            <p>Great news! Your ${data.carMake} ${data.carModel} has been booked.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Booking Details:</h3>
              <p><strong>Booking Code:</strong> ${data.bookingCode}</p>
              <p><strong>Guest:</strong> ${data.guestName}</p>
              <p><strong>Dates:</strong> ${new Date(data.startDate).toLocaleDateString()} - ${new Date(data.endDate).toLocaleDateString()}</p>
              <p><strong>Your Earnings:</strong> $${hostEarnings.toFixed(2)} (after platform fee)</p>
            </div>
            
            <p>Please prepare your vehicle for the scheduled pickup date.</p>
            <p>The guest will contact you 24 hours before pickup to coordinate.</p>
            
            <p>Thank you for being a valued ItWhip host!</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #666;">
              © 2024 ItWhip. All rights reserved.<br>
              Phoenix, Arizona
            </p>
          </div>
        </body>
      </html>
    `
    
    const text = `
      New Booking Confirmed!
      
      Hi ${data.hostName},
      
      Your ${data.carMake} ${data.carModel} has been booked.
      
      Booking Code: ${data.bookingCode}
      Guest: ${data.guestName}
      Dates: ${new Date(data.startDate).toLocaleDateString()} - ${new Date(data.endDate).toLocaleDateString()}
      Your Earnings: $${hostEarnings.toFixed(2)} (after platform fee)
      
      Please prepare your vehicle for pickup.
      
      Thank you for being a valued ItWhip host!
    `
    
    return await sendEmail(to, subject, html, text)
  } catch (error) {
    console.error('Error sending host notification:', error)
    return { success: false, error: 'Failed to send host notification' }
  }
}

/**
 * Send charges processed email
 */
export async function sendChargesProcessedEmail(
  to: string,
  data: {
    guestName: string
    bookingCode: string
    chargeAmount: number
    chargeBreakdown?: any
    chargeId?: string
  }
): Promise<EmailResponse> {
  try {
    // If you have a specific template for charges, import and use it
    // For now, using payment receipt template as a base
    const template = getPaymentReceiptTemplate({
      guestName: data.guestName,
      bookingCode: data.bookingCode,
      amount: data.chargeAmount,
      paymentMethod: 'Card on file',
      transactionId: data.chargeId || 'N/A',
      chargeDate: new Date().toISOString()
    })
    
    // Override the subject for charges
    const subject = `Additional Charges Processed - ${data.bookingCode} - $${data.chargeAmount.toFixed(2)}`
    
    return await sendEmail(to, subject, template.html, template.text)
  } catch (error) {
    console.error('Error sending charges processed email:', error)
    return { success: false, error: 'Failed to send charges processed email' }
  }
}

/**
 * Send payment failed email
 */
export async function sendPaymentFailedEmail(
  to: string,
  data: {
    guestName: string
    bookingCode: string
    failureReason: string
    amount: number
    retryInstructions?: string
  }
): Promise<EmailResponse> {
  try {
    const subject = `Payment Failed - Action Required for ${data.bookingCode}`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>⚠️ Payment Failed</h2>
            <p>Hi ${data.guestName},</p>
            <p>We were unable to process the payment for your recent rental charges.</p>
            
            <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Booking Code:</strong> ${data.bookingCode}</p>
              <p><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
              <p><strong>Reason:</strong> ${data.failureReason}</p>
            </div>
            
            <p><strong>What to do next:</strong></p>
            <p>${data.retryInstructions || 'Please update your payment method at https://itwhip.com/rentals/dashboard to avoid any service interruption.'}</p>
            
            <p>If you have questions, contact us at info@itwhip.com</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #666;">
              © 2024 ItWhip. All rights reserved.<br>
              Phoenix, Arizona
            </p>
          </div>
        </body>
      </html>
    `
    
    const text = `
      Payment Failed
      
      Hi ${data.guestName},
      
      We were unable to process the payment for your recent rental charges.
      
      Booking Code: ${data.bookingCode}
      Amount: $${data.amount.toFixed(2)}
      Reason: ${data.failureReason}
      
      What to do next:
      ${data.retryInstructions || 'Please update your payment method at https://itwhip.com/rentals/dashboard'}
      
      If you have questions, contact us at info@itwhip.com
    `
    
    return await sendEmail(to, subject, html, text)
  } catch (error) {
    console.error('Error sending payment failed email:', error)
    return { success: false, error: 'Failed to send payment failed email' }
  }
}

/**
 * Send charges waived email
 */
export async function sendChargesWaivedEmail(
  to: string,
  data: {
    guestName: string
    bookingCode: string
    originalAmount: number
    waivedAmount: number
    remainingAmount: number
    reason?: string
  }
): Promise<EmailResponse> {
  try {
    const subject = `Good News: Charges Adjusted for ${data.bookingCode}`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Charges Waived/Adjusted</h2>
            <p>Hi ${data.guestName},</p>
            <p>We have adjusted the charges for your recent rental.</p>
            
            <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Original Charges:</strong> $${data.originalAmount.toFixed(2)}</p>
              <p><strong>Amount Waived:</strong> -$${data.waivedAmount.toFixed(2)}</p>
              <hr style="border: 1px solid #10b981;">
              <p style="font-size: 18px; font-weight: bold;">
                ${data.remainingAmount > 0 
                  ? `Amount Charged: $${data.remainingAmount.toFixed(2)}` 
                  : 'No charges applied'}
              </p>
            </div>
            
            ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
            
            <p>This adjustment has been applied to booking ${data.bookingCode}.</p>
            
            <p>Thank you for choosing ItWhip!</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #666;">
              © 2024 ItWhip. All rights reserved.<br>
              Phoenix, Arizona
            </p>
          </div>
        </body>
      </html>
    `
    
    const text = `
      Charges Waived/Adjusted
      
      Hi ${data.guestName},
      
      We have adjusted the charges for your recent rental.
      
      Original Charges: $${data.originalAmount.toFixed(2)}
      Amount Waived: -$${data.waivedAmount.toFixed(2)}
      ${data.remainingAmount > 0 
        ? `Amount Charged: $${data.remainingAmount.toFixed(2)}` 
        : 'No charges applied'}
      
      ${data.reason ? `Reason: ${data.reason}` : ''}
      
      This adjustment has been applied to booking ${data.bookingCode}.
      
      Thank you for choosing ItWhip!
    `
    
    return await sendEmail(to, subject, html, text)
  } catch (error) {
    console.error('Error sending charges waived email:', error)
    return { success: false, error: 'Failed to send charges waived email' }
  }
}

/**
 * Send booking cancelled email (export existing function)
 */
export async function sendBookingCancelledEmail(
  to: string,
  data: {
    guestName: string
    bookingCode: string
    reason?: string
    refundAmount?: number
  }
): Promise<EmailResponse> {
  try {
    const template = getBookingCancelledTemplate({
      guestName: data.guestName,
      bookingCode: data.bookingCode,
      cancellationReason: data.reason || 'Booking cancelled',
      refundAmount: data.refundAmount || 0,
      refundStatus: data.refundAmount ? 'Processing' : 'N/A',
      contactEmail: 'info@itwhip.com'
    })
    
    return await sendEmail(to, template.subject, template.html, template.text)
  } catch (error) {
    console.error('Error sending booking cancelled email:', error)
    return { success: false, error: 'Failed to send booking cancelled email' }
  }
}

/**
 * Send trip started email
 */
export async function sendTripStartedEmail(
  to: string,
  data: {
    guestName: string
    bookingCode: string
    carMake: string
    carModel: string
    endDate: string | Date
    endTime: string
  }
): Promise<EmailResponse> {
  try {
    const subject = `Your ItWhip Trip Has Started! - ${data.bookingCode}`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>🚗 Trip Started Successfully!</h2>
            <p>Hi ${data.guestName},</p>
            <p>Your trip with the ${data.carMake} ${data.carModel} has officially started!</p>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>⏰ Return Reminder</h3>
              <p><strong>Return Date:</strong> ${new Date(data.endDate).toLocaleDateString()}</p>
              <p><strong>Return Time:</strong> ${data.endTime}</p>
              <p>Please ensure the vehicle is returned on time to avoid late fees.</p>
            </div>
            
            <p><strong>Emergency Contact:</strong> (602) 555-0100</p>
            
            <p>Enjoy your trip!</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #666;">
              © 2024 ItWhip. All rights reserved.<br>
              Phoenix, Arizona
            </p>
          </div>
        </body>
      </html>
    `
    
    const text = `
      Trip Started Successfully!
      
      Hi ${data.guestName},
      
      Your trip with the ${data.carMake} ${data.carModel} has officially started!
      
      Return Reminder:
      Return Date: ${new Date(data.endDate).toLocaleDateString()}
      Return Time: ${data.endTime}
      
      Please ensure the vehicle is returned on time to avoid late fees.
      
      Emergency Contact: (602) 555-0100
      
      Enjoy your trip!
    `
    
    return await sendEmail(to, subject, html, text)
  } catch (error) {
    console.error('Error sending trip started email:', error)
    return { success: false, error: 'Failed to send trip started email' }
  }
}

/**
 * Send trip completed email (using existing template)
 */
export async function sendTripCompletedEmail(
  to: string,
  data: {
    guestName: string
    bookingCode: string
    carMake: string
    carModel: string
    tripDuration?: string
    additionalCharges?: number
  }
): Promise<EmailResponse> {
  try {
    const template = getTripCompleteTemplate({
      guestName: data.guestName,
      bookingCode: data.bookingCode,
      carDetails: `${data.carMake} ${data.carModel}`,
      tripDuration: data.tripDuration || 'N/A',
      reviewUrl: `https://itwhip.com/rentals/dashboard/bookings/${data.bookingCode}/review`,
      additionalCharges: data.additionalCharges || 0
    })
    
    return await sendEmail(to, template.subject, template.html, template.text)
  } catch (error) {
    console.error('Error sending trip completed email:', error)
    return { success: false, error: 'Failed to send trip completed email' }
  }
}

/**
 * Send pickup reminder email (using existing template)
 */
export async function sendPickupReminderEmail(
  to: string,
  data: {
    guestName: string
    bookingCode: string
    carDetails: string
    pickupDate: string
    pickupTime: string
    pickupLocation: string
    hostName?: string
    hostPhone?: string
  }
): Promise<EmailResponse> {
  try {
    const template = getPickupReminderTemplate({
      guestName: data.guestName,
      bookingCode: data.bookingCode,
      carDetails: data.carDetails,
      pickupDate: data.pickupDate,
      pickupTime: data.pickupTime,
      pickupLocation: data.pickupLocation,
      hostName: data.hostName || 'Your host',
      hostPhone: data.hostPhone || 'Provided separately',
      tripStartUrl: `https://itwhip.com/rentals/dashboard/bookings/${data.bookingCode}/start`
    })
    
    return await sendEmail(to, template.subject, template.html, template.text)
  } catch (error) {
    console.error('Error sending pickup reminder email:', error)
    return { success: false, error: 'Failed to send pickup reminder email' }
  }
}

/**
 * Send verification pending email (using existing template)
 */
export async function sendVerificationPendingEmail(
  to: string,
  data: {
    guestName: string
    bookingCode: string
    documentsUrl: string
  }
): Promise<EmailResponse> {
  try {
    const template = getVerificationPendingTemplate({
      guestName: data.guestName,
      bookingCode: data.bookingCode,
      documentsUrl: data.documentsUrl,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    })
    
    return await sendEmail(to, template.subject, template.html, template.text)
  } catch (error) {
    console.error('Error sending verification pending email:', error)
    return { success: false, error: 'Failed to send verification pending email' }
  }
}

/**
 * Generic admin alert email
 */
export async function sendAdminAlert(
  subject: string,
  message: string,
  priority: 'low' | 'medium' | 'high' = 'medium'
): Promise<EmailResponse> {
  const adminEmail = process.env.ADMIN_EMAIL || 'info@itwhip.com'
  
  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444'
  }
  
  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="border-left: 4px solid ${priorityColors[priority]}; padding-left: 20px;">
            <h2>Admin Alert - ${priority.toUpperCase()} Priority</h2>
            ${message}
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #666;">
            This is an automated alert from the ItWhip system.<br>
            Timestamp: ${new Date().toISOString()}
          </p>
        </div>
      </body>
    </html>
  `
  
  const text = `Admin Alert - ${priority.toUpperCase()} Priority\n\n${message}\n\nTimestamp: ${new Date().toISOString()}`
  
  return await sendEmail(adminEmail, subject, html, text)
}