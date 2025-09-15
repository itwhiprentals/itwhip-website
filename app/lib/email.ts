// app/lib/email.ts - Main orchestrator (replacing the 1600+ line file)

import { sendEmail } from './email/sender'
import {
 getBookingReceivedTemplate,
 getVerificationPendingTemplate,
 getBookingConfirmedTemplate,
 getBookingRejectedTemplate,
 getBookingCancelledTemplate,
 getPickupReminderTemplate,
 getPaymentReceiptTemplate,
 getTripCompleteTemplate,
 BookingReceivedData,
 VerificationPendingData,
 BookingConfirmedData,
 BookingRejectedData,
 BookingCancelledData,
 PickupReminderData,
 PaymentReceiptData,
 TripCompleteData,
 EmailResponse
} from './email/templates'

/**
* Email.ts - Main orchestrator
* All templates moved to separate files
* This file now just coordinates sending
*/

// Enums from original file
export enum EmailTemplate {
 WELCOME = 'welcome',
 EMAIL_VERIFICATION = 'email_verification',
 PASSWORD_RESET = 'password_reset',
 BOOKING_CONFIRMATION = 'booking_confirmation',
 BOOKING_CANCELLED = 'booking_cancelled',
 HOST_NOTIFICATION = 'host_notification',
 PAYMENT_CONFIRMATION = 'payment_confirmation',
 REVIEW_REQUEST = 'review_request',
 SECURITY_ALERT = 'security_alert',
 TWO_FACTOR_CODE = 'two_factor_code',
 GUEST_BOOKING_CONFIRMATION = 'guest_booking_confirmation',
 VERIFICATION_REQUIRED = 'verification_required',
 VERIFICATION_APPROVED = 'verification_approved',
 VERIFICATION_REJECTED = 'verification_rejected',
 GUEST_ACCESS_TOKEN = 'guest_access_token',
 VERIFICATION_REMINDER = 'verification_reminder',
 PENDING_REVIEW = 'pending_review'
}

// Configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'ItWhip <info@itwhip.com>'
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || 'info@itwhip.com'

// Main functions that APIs are currently calling

export async function sendBookingReceivedEmail(
 to: string,
 data: BookingReceivedData
): Promise<EmailResponse> {
 const template = getBookingReceivedTemplate(data)
 return sendEmail(to, template.subject, template.html, template.text)
}

export async function sendPendingReviewEmail(
 data: VerificationPendingData & { guestEmail: string }
): Promise<EmailResponse> {
 const template = getVerificationPendingTemplate(data)
 return sendEmail(data.guestEmail, template.subject, template.html, template.text)
}

export async function sendVerificationApprovedEmail(
 to: string,
 data: BookingConfirmedData
): Promise<EmailResponse> {
 const template = getBookingConfirmedTemplate(data)
 return sendEmail(to, template.subject, template.html, template.text)
}

export async function sendVerificationRejectedEmail(
 to: string,
 data: BookingRejectedData
): Promise<EmailResponse> {
 const template = getBookingRejectedTemplate(data)
 return sendEmail(to, template.subject, template.html, template.text)
}

export async function sendBookingConfirmation(
 booking: BookingReceivedData & { guestEmail: string }
): Promise<EmailResponse> {
 const template = getBookingReceivedTemplate(booking)
 return sendEmail(booking.guestEmail, template.subject, template.html, template.text)
}

export async function sendGuestBookingConfirmation(
 booking: VerificationPendingData & { guestEmail: string }
): Promise<EmailResponse> {
 const template = getVerificationPendingTemplate(booking)
 return sendEmail(booking.guestEmail, template.subject, template.html, template.text)
}

export async function sendHostNotification(
 booking: any
): Promise<EmailResponse> {
 // For now, using confirmation template until we create host-specific template
 const template = getBookingConfirmedTemplate(booking)
 return sendEmail(booking.hostEmail, template.subject, template.html, template.text)
}

export async function sendVerificationRequiredEmail(
 to: string,
 data: VerificationPendingData
): Promise<EmailResponse> {
 const template = getVerificationPendingTemplate(data)
 return sendEmail(to, template.subject, template.html, template.text)
}

export async function sendVerificationReminderEmail(
 to: string,
 data: VerificationPendingData
): Promise<EmailResponse> {
 // Add urgency to the template data
 const urgentData = {
   ...data,
   estimatedReviewTime: '4 hours - URGENT'
 }
 const template = getVerificationPendingTemplate(urgentData)
 return sendEmail(to, template.subject, template.html, template.text)
}

export async function sendBookingCancelledEmail(
 to: string,
 data: BookingCancelledData
): Promise<EmailResponse> {
 const template = getBookingCancelledTemplate(data)
 return sendEmail(to, template.subject, template.html, template.text)
}

export async function sendPickupReminderEmail(
 to: string,
 data: PickupReminderData
): Promise<EmailResponse> {
 const template = getPickupReminderTemplate(data)
 return sendEmail(to, template.subject, template.html, template.text)
}

export async function sendPaymentConfirmation(
 to: string,
 data: PaymentReceiptData
): Promise<EmailResponse> {
 const template = getPaymentReceiptTemplate(data)
 return sendEmail(to, template.subject, template.html, template.text)
}

export async function sendReviewRequest(
 to: string,
 data: TripCompleteData
): Promise<EmailResponse> {
 const template = getTripCompleteTemplate(data)
 return sendEmail(to, template.subject, template.html, template.text)
}

// Welcome and auth emails (keeping simple inline for now as they're not rental-specific)

export async function sendWelcomeEmail(
 to: string,
 data: { name: string; verificationUrl?: string }
): Promise<EmailResponse> {
 const subject = 'Welcome to ItWhip!'
 const html = `
   <h2>Welcome to ItWhip, ${data.name}!</h2>
   <p>Thank you for joining Phoenix's premier car sharing platform.</p>
   ${data.verificationUrl ? `<p><a href="${data.verificationUrl}">Verify your email</a></p>` : ''}
 `
 const text = `Welcome to ItWhip, ${data.name}! Thank you for joining.`
 
 return sendEmail(to, subject, html, text)
}

export async function sendPasswordResetEmail(
 to: string,
 data: { name: string; resetUrl: string; expiresIn: string }
): Promise<EmailResponse> {
 const subject = 'Reset your password - ItWhip'
 const html = `
   <h2>Hi ${data.name},</h2>
   <p>Click the link below to reset your password:</p>
   <p><a href="${data.resetUrl}">Reset Password</a></p>
   <p>This link expires in ${data.expiresIn}.</p>
 `
 const text = `Hi ${data.name}, reset your password at: ${data.resetUrl}`
 
 return sendEmail(to, subject, html, text)
}

export async function sendVerificationEmail(
 to: string,
 data: { name: string; verificationUrl: string; code?: string }
): Promise<EmailResponse> {
 const subject = 'Verify your email - ItWhip'
 const html = `
   <h2>Hi ${data.name},</h2>
   <p>Please verify your email by clicking:</p>
   <p><a href="${data.verificationUrl}">Verify Email</a></p>
   ${data.code ? `<p>Or enter code: ${data.code}</p>` : ''}
 `
 const text = `Hi ${data.name}, verify at: ${data.verificationUrl}`
 
 return sendEmail(to, subject, html, text)
}

export async function sendSecurityAlert(
 to: string,
 data: { name: string; alertType: string; description: string; timestamp: string }
): Promise<EmailResponse> {
 const subject = `Security Alert - ${data.alertType}`
 const html = `
   <h2>Security Alert for ${data.name}</h2>
   <p><strong>${data.alertType}</strong></p>
   <p>${data.description}</p>
   <p>Time: ${data.timestamp}</p>
 `
 const text = `Security Alert: ${data.alertType} - ${data.description}`
 
 return sendEmail(to, subject, html, text)
}

export async function sendTwoFactorCode(
 to: string,
 data: { name: string; code: string; expiresIn: string }
): Promise<EmailResponse> {
 const subject = 'Your verification code - ItWhip'
 const html = `
   <h2>Hi ${data.name},</h2>
   <p>Your verification code is: <strong>${data.code}</strong></p>
   <p>Expires in ${data.expiresIn}</p>
 `
 const text = `Your verification code is: ${data.code}`
 
 return sendEmail(to, subject, html, text)
}

// Export default for backward compatibility
export default sendEmail