/**
 * Email Service for ItWhip Platform
 * Uses Nodemailer with Microsoft 365 SMTP
 * Handles all email notifications and templates
 */

import nodemailer from 'nodemailer'
import { ReactElement } from 'react'

// Create Nodemailer transporter with Microsoft 365 SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.office365.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false // Set to true in production with proper certs
  }
})

// Email configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'ItWhip <info@itwhip.com>'
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || 'info@itwhip.com'

// Email templates
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
  // New rental-specific templates
  GUEST_BOOKING_CONFIRMATION = 'guest_booking_confirmation',
  VERIFICATION_REQUIRED = 'verification_required',
  VERIFICATION_APPROVED = 'verification_approved',
  VERIFICATION_REJECTED = 'verification_rejected',
  GUEST_ACCESS_TOKEN = 'guest_access_token',
  VERIFICATION_REMINDER = 'verification_reminder'
}

// Email data interfaces
interface BaseEmailData {
  to: string | string[]
  subject: string
  replyTo?: string
}

interface TextEmailData extends BaseEmailData {
  text: string
  html?: never
  react?: never
}

interface HtmlEmailData extends BaseEmailData {
  html: string
  text?: string
  react?: never
}

interface ReactEmailData extends BaseEmailData {
  react: ReactElement
  text?: string
  html?: never
}

type EmailData = TextEmailData | HtmlEmailData | ReactEmailData

// Template data types
interface WelcomeEmailData {
  name: string
  verificationUrl?: string
}

interface VerificationEmailData {
  name: string
  verificationUrl: string
  code?: string
}

interface PasswordResetEmailData {
  name: string
  resetUrl: string
  expiresIn: string
}

interface BookingConfirmationData {
  guestName: string
  carMake: string
  carModel: string
  startDate: string
  endDate: string
  pickupLocation: string
  totalCost: string
  bookingId: string
  hostName?: string
  hostPhone?: string
}

interface GuestBookingData {
  guestName: string
  guestEmail: string
  carMake: string
  carModel: string
  startDate: string
  endDate: string
  pickupLocation: string
  totalCost: string
  bookingCode: string
  accessToken: string
  dashboardUrl: string
  isP2P: boolean
  verificationRequired: boolean
  verificationDeadline?: string
}

interface VerificationRequiredData {
  guestName: string
  carMake: string
  carModel: string
  bookingCode: string
  uploadUrl: string
  deadline: string
  documentsRequired: string[]
}

interface VerificationApprovedData {
  guestName: string
  carMake: string
  carModel: string
  bookingCode: string
  startDate: string
  pickupLocation: string
  hostName?: string
  hostPhone?: string
}

interface VerificationRejectedData {
  guestName: string
  carMake: string
  carModel: string
  bookingCode: string
  reason: string
  canRebook: boolean
  supportEmail: string
}

interface HostNotificationData {
  hostName: string
  guestName: string
  carMake: string
  carModel: string
  startDate: string
  endDate: string
  totalEarnings: string
  bookingId: string
}

interface PaymentConfirmationData {
  name: string
  amount: string
  paymentMethod: string
  transactionId: string
  date: string
}

interface ReviewRequestData {
  name: string
  carMake: string
  carModel: string
  reviewUrl: string
}

interface SecurityAlertData {
  name: string
  alertType: string
  description: string
  ipAddress?: string
  location?: string
  timestamp: string
  actionUrl?: string
}

interface TwoFactorCodeData {
  name: string
  code: string
  expiresIn: string
}

/**
 * Send an email using Nodemailer
 */
async function sendEmail(data: EmailData): Promise<{ success: boolean; error?: string; messageId?: string }> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('Email service not configured. Set SMTP_USER and SMTP_PASS environment variables.')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    // Convert React element to HTML if needed
    let html = data.html
    if (data.react) {
      // In production, you'd use ReactDOMServer.renderToStaticMarkup
      // For now, we'll just note this needs implementation
      console.warn('React email templates need ReactDOMServer implementation')
      html = '<p>React template rendering not implemented</p>'
    }

    const mailOptions = {
      from: EMAIL_FROM,
      to: Array.isArray(data.to) ? data.to.join(', ') : data.to,
      subject: data.subject,
      replyTo: data.replyTo || EMAIL_REPLY_TO,
      text: data.text,
      html: html,
      // Add headers to improve deliverability
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal'
      }
    }

    const result = await transporter.sendMail(mailOptions)
    
    console.log('Email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email'
    }
  }
}

/**
 * Send guest booking confirmation email
 */
export async function sendGuestBookingConfirmation(
  booking: GuestBookingData
): Promise<{ success: boolean; error?: string }> {
  const subject = `Booking ${booking.verificationRequired ? 'Pending Verification' : 'Confirmed'} - ${booking.carMake} ${booking.carModel}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
          .booking-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${booking.verificationRequired ? 'Verification Required' : 'Booking Confirmed!'}</h1>
            <p>${booking.verificationRequired ? 'Complete verification to confirm' : 'Your adventure awaits'}</p>
          </div>
          <div class="content">
            <h2>Hi ${booking.guestName},</h2>
            
            ${booking.verificationRequired ? `
              <div class="warning">
                <strong>⚠️ Action Required:</strong> This P2P vehicle requires verification within 24 hours.
                <br><br>
                Please upload:
                <ul>
                  <li>Driver's license (front & back)</li>
                  <li>Selfie for identity verification</li>
                </ul>
                <a href="${booking.dashboardUrl}" class="button">Complete Verification</a>
                <br>
                <small>Deadline: ${booking.verificationDeadline}</small>
              </div>
            ` : ''}
            
            <p>Your booking ${booking.verificationRequired ? 'is pending' : 'has been confirmed'}! Here are your details:</p>
            
            <div class="booking-details">
              <h3>Booking #${booking.bookingCode}</h3>
              <div class="detail-row">
                <strong>Vehicle:</strong>
                <span>${booking.carMake} ${booking.carModel}</span>
              </div>
              <div class="detail-row">
                <strong>Pick-up Date:</strong>
                <span>${booking.startDate}</span>
              </div>
              <div class="detail-row">
                <strong>Return Date:</strong>
                <span>${booking.endDate}</span>
              </div>
              <div class="detail-row">
                <strong>Location:</strong>
                <span>${booking.pickupLocation}</span>
              </div>
              <div class="detail-row" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                <strong>Total Cost:</strong>
                <span style="font-size: 1.2em; color: #667eea;">${booking.totalCost}</span>
              </div>
            </div>
            
            <h3>Access Your Booking</h3>
            <p>You can access and manage your booking anytime using this link:</p>
            <a href="${booking.dashboardUrl}" class="button">View Booking</a>
            <p><small>No password required - this link is unique to you</small></p>
            
            ${!booking.verificationRequired ? `
              <h3>What's Next?</h3>
              <ol>
                <li>You'll receive pickup instructions 24 hours before your trip</li>
                <li>Bring your driver's license and insurance information</li>
                <li>Take photos of the vehicle before and after your trip</li>
                <li>Enjoy your ride!</li>
              </ol>
            ` : ''}
            
            <h3>Want to Save Time?</h3>
            <p>Create an account to:</p>
            <ul>
              <li>Save your verification documents for future bookings</li>
              <li>Book instantly without re-entering information</li>
              <li>Earn loyalty points</li>
              <li>Access exclusive deals</li>
            </ul>
            
            <p>If you have any questions, contact us at support@itwhip.com</p>
            
            <div class="footer">
              <p>© 2024 ItWhip. All rights reserved.</p>
              <p>Phoenix, Arizona</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
    ${booking.verificationRequired ? 'Verification Required' : 'Booking Confirmed!'}
    
    Hi ${booking.guestName},
    
    ${booking.verificationRequired ? 
      `⚠️ ACTION REQUIRED: This P2P vehicle requires verification within 24 hours.
      
      Please upload:
      - Driver's license (front & back)
      - Selfie for identity verification
      
      Complete verification: ${booking.dashboardUrl}
      Deadline: ${booking.verificationDeadline}
      ` : ''}
    
    Your booking ${booking.verificationRequired ? 'is pending' : 'has been confirmed'}!
    
    Booking #${booking.bookingCode}
    Vehicle: ${booking.carMake} ${booking.carModel}
    Pick-up Date: ${booking.startDate}
    Return Date: ${booking.endDate}
    Location: ${booking.pickupLocation}
    Total Cost: ${booking.totalCost}
    
    Access your booking: ${booking.dashboardUrl}
    (No password required - this link is unique to you)
    
    ${!booking.verificationRequired ? `What's Next?
    1. You'll receive pickup instructions 24 hours before your trip
    2. Bring your driver's license and insurance information
    3. Take photos of the vehicle before and after your trip
    4. Enjoy your ride!` : ''}
    
    Want to save time? Create an account to:
    - Save your verification documents for future bookings
    - Book instantly without re-entering information
    - Earn loyalty points
    - Access exclusive deals
    
    Questions? Contact us at support@itwhip.com
    
    © 2024 ItWhip. All rights reserved.
  `

  return sendEmail({ to: booking.guestEmail, subject, html, text })
}

/**
 * Send verification required email
 */
export async function sendVerificationRequiredEmail(
  to: string,
  data: VerificationRequiredData
): Promise<{ success: boolean; error?: string }> {
  const subject = `Action Required: Verify Your Booking - ${data.carMake} ${data.carModel}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
          .deadline { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #ffc107; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Verification Required</h1>
            <p>Complete within 24 hours to confirm your booking</p>
          </div>
          <div class="content">
            <h2>Hi ${data.guestName},</h2>
            
            <div class="deadline">
              <strong>Deadline: ${data.deadline}</strong><br>
              Your booking for the ${data.carMake} ${data.carModel} requires verification.
            </div>
            
            <h3>Documents Required:</h3>
            <ul>
              ${data.documentsRequired.map(doc => `<li>${doc}</li>`).join('')}
            </ul>
            
            <p>This is a one-time verification for P2P vehicles to ensure safety and security for both renters and hosts.</p>
            
            <a href="${data.uploadUrl}" class="button" style="background: #28a745;">Upload Documents Now</a>
            
            <h3>Why Verification?</h3>
            <ul>
              <li>Protects vehicle owners</li>
              <li>Ensures you're covered by insurance</li>
              <li>Prevents fraud</li>
              <li>Creates a trusted community</li>
            </ul>
            
            <p><strong>Note:</strong> Your booking will be automatically cancelled if verification is not completed by ${data.deadline}.</p>
            
            <p>Need help? Reply to this email or contact support@itwhip.com</p>
            
            <div class="footer">
              <p>© 2024 ItWhip. All rights reserved.</p>
              <p>Phoenix, Arizona</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
    ⏰ Verification Required
    
    Hi ${data.guestName},
    
    DEADLINE: ${data.deadline}
    
    Your booking for the ${data.carMake} ${data.carModel} requires verification.
    
    Documents Required:
    ${data.documentsRequired.map(doc => `- ${doc}`).join('\n')}
    
    Upload documents now: ${data.uploadUrl}
    
    This is a one-time verification for P2P vehicles to ensure safety and security.
    
    Why Verification?
    - Protects vehicle owners
    - Ensures you're covered by insurance
    - Prevents fraud
    - Creates a trusted community
    
    Note: Your booking will be automatically cancelled if verification is not completed by ${data.deadline}.
    
    Need help? Reply to this email or contact support@itwhip.com
    
    © 2024 ItWhip. All rights reserved.
  `

  return sendEmail({ to, subject, html, text })
}

/**
 * Send verification approved email
 */
export async function sendVerificationApprovedEmail(
  to: string,
  data: VerificationApprovedData
): Promise<{ success: boolean; error?: string }> {
  const subject = `✅ Booking Confirmed - ${data.carMake} ${data.carModel}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
          .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Verification Approved!</h1>
            <p>Your booking is confirmed</p>
          </div>
          <div class="content">
            <h2>Great news, ${data.guestName}!</h2>
            
            <div class="success">
              <strong>Your verification has been approved!</strong><br>
              Your booking for the ${data.carMake} ${data.carModel} is now confirmed.
            </div>
            
            <h3>Booking Details:</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
              <div class="detail-row">
                <strong>Booking:</strong>
                <span>#${data.bookingCode}</span>
              </div>
              <div class="detail-row">
                <strong>Vehicle:</strong>
                <span>${data.carMake} ${data.carModel}</span>
              </div>
              <div class="detail-row">
                <strong>Pick-up Date:</strong>
                <span>${data.startDate}</span>
              </div>
              <div class="detail-row">
                <strong>Location:</strong>
                <span>${data.pickupLocation}</span>
              </div>
              ${data.hostName ? `
              <div class="detail-row">
                <strong>Host:</strong>
                <span>${data.hostName}</span>
              </div>
              <div class="detail-row">
                <strong>Host Contact:</strong>
                <span>${data.hostPhone}</span>
              </div>
              ` : ''}
            </div>
            
            <h3>What's Next?</h3>
            <ol>
              <li>You'll receive detailed pickup instructions 24 hours before your trip</li>
              <li>The host will contact you to coordinate pickup</li>
              <li>Bring your verified driver's license</li>
              <li>Take photos before and after your trip</li>
            </ol>
            
            <p>Thank you for completing verification. Have a great trip!</p>
            
            <div class="footer">
              <p>© 2024 ItWhip. All rights reserved.</p>
              <p>Phoenix, Arizona</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
    ✅ Verification Approved!
    
    Great news, ${data.guestName}!
    
    Your verification has been approved!
    Your booking for the ${data.carMake} ${data.carModel} is now confirmed.
    
    Booking Details:
    Booking: #${data.bookingCode}
    Vehicle: ${data.carMake} ${data.carModel}
    Pick-up Date: ${data.startDate}
    Location: ${data.pickupLocation}
    ${data.hostName ? `Host: ${data.hostName}` : ''}
    ${data.hostPhone ? `Host Contact: ${data.hostPhone}` : ''}
    
    What's Next?
    1. You'll receive detailed pickup instructions 24 hours before your trip
    2. The host will contact you to coordinate pickup
    3. Bring your verified driver's license
    4. Take photos before and after your trip
    
    Thank you for completing verification. Have a great trip!
    
    © 2024 ItWhip. All rights reserved.
  `

  return sendEmail({ to, subject, html, text })
}

/**
 * Send verification rejected email
 */
export async function sendVerificationRejectedEmail(
  to: string,
  data: VerificationRejectedData
): Promise<{ success: boolean; error?: string }> {
  const subject = `Booking Could Not Be Verified - ${data.carMake} ${data.carModel}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
          .alert { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verification Issue</h1>
            <p>We couldn't verify your booking</p>
          </div>
          <div class="content">
            <h2>Hi ${data.guestName},</h2>
            
            <div class="alert">
              <strong>Unfortunately, we couldn't verify your booking for the ${data.carMake} ${data.carModel}.</strong><br><br>
              Reason: ${data.reason}
            </div>
            
            <h3>What You Can Do:</h3>
            ${data.canRebook ? `
              <ol>
                <li><strong>Upload clearer documents:</strong> Make sure photos are well-lit and all text is readable</li>
                <li><strong>Try a different vehicle:</strong> Browse other available cars</li>
                <li><strong>Contact support:</strong> We're here to help at ${data.supportEmail}</li>
              </ol>
              
              <a href="https://itwhip.com/rentals/search" class="button">Browse Other Cars</a>
            ` : `
              <p>Please contact our support team at ${data.supportEmail} for assistance.</p>
            `}
            
            <h3>Common Issues:</h3>
            <ul>
              <li>Blurry or dark photos</li>
              <li>Expired driver's license</li>
              <li>Name mismatch</li>
              <li>Age requirements not met</li>
            </ul>
            
            <p>We apologize for any inconvenience. Your booking #${data.bookingCode} has been cancelled and any pending charges will be reversed within 3-5 business days.</p>
            
            <p>Questions? Contact us at ${data.supportEmail}</p>
            
            <div class="footer">
              <p>© 2024 ItWhip. All rights reserved.</p>
              <p>Phoenix, Arizona</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
    Verification Issue
    
    Hi ${data.guestName},
    
    Unfortunately, we couldn't verify your booking for the ${data.carMake} ${data.carModel}.
    
    Reason: ${data.reason}
    
    What You Can Do:
    ${data.canRebook ? `
    1. Upload clearer documents: Make sure photos are well-lit and all text is readable
    2. Try a different vehicle: Browse other available cars at https://itwhip.com/rentals/search
    3. Contact support: We're here to help at ${data.supportEmail}
    ` : `
    Please contact our support team at ${data.supportEmail} for assistance.
    `}
    
    Common Issues:
    - Blurry or dark photos
    - Expired driver's license
    - Name mismatch
    - Age requirements not met
    
    We apologize for any inconvenience. Your booking #${data.bookingCode} has been cancelled and any pending charges will be reversed within 3-5 business days.
    
    Questions? Contact us at ${data.supportEmail}
    
    © 2024 ItWhip. All rights reserved.
  `

  return sendEmail({ to, subject, html, text })
}

/**
 * Send verification reminder email
 */
export async function sendVerificationReminderEmail(
  to: string,
  data: VerificationRequiredData
): Promise<{ success: boolean; error?: string }> {
  const subject = `⏰ Last Chance: Complete Verification for ${data.carMake} ${data.carModel}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
          .urgent { background: #ffebee; border-left: 4px solid #ff6b6b; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; padding: 14px 28px; background: #ff6b6b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Final Reminder</h1>
            <p>Your booking expires in 4 hours!</p>
          </div>
          <div class="content">
            <h2>Hi ${data.guestName},</h2>
            
            <div class="urgent">
              <strong>⚠️ URGENT: Your booking will be cancelled in 4 hours!</strong><br><br>
              Complete verification now to secure your ${data.carMake} ${data.carModel}.
            </div>
            
            <h3>Still Need:</h3>
            <ul>
              ${data.documentsRequired.map(doc => `<li>✗ ${doc}</li>`).join('')}
            </ul>
            
            <p><strong>It only takes 2 minutes!</strong></p>
            
            <a href="${data.uploadUrl}" class="button">Complete Verification Now</a>
            
            <p>Don't lose your booking! This ${data.carMake} ${data.carModel} is in high demand.</p>
            
            <p><strong>Deadline: ${data.deadline}</strong></p>
            
            <p>Need help? Reply immediately to this email or call us.</p>
            
            <div class="footer">
              <p>© 2024 ItWhip. All rights reserved.</p>
              <p>Phoenix, Arizona</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
    ⏰ FINAL REMINDER - Your booking expires in 4 hours!
    
    Hi ${data.guestName},
    
    ⚠️ URGENT: Your booking will be cancelled in 4 hours!
    
    Complete verification now to secure your ${data.carMake} ${data.carModel}.
    
    Still Need:
    ${data.documentsRequired.map(doc => `✗ ${doc}`).join('\n')}
    
    It only takes 2 minutes!
    
    Complete verification: ${data.uploadUrl}
    
    Don't lose your booking! This ${data.carMake} ${data.carModel} is in high demand.
    
    Deadline: ${data.deadline}
    
    Need help? Reply immediately to this email.
    
    © 2024 ItWhip. All rights reserved.
  `

  return sendEmail({ to, subject, html, text })
}

/**
 * Send welcome email (keeping existing function)
 */
export async function sendWelcomeEmail(
  to: string,
  data: WelcomeEmailData
): Promise<{ success: boolean; error?: string }> {
  const subject = 'Welcome to ItWhip!'
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ItWhip!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.name},</h2>
            <p>Thank you for joining ItWhip - Phoenix's premier car sharing platform!</p>
            <p>With ItWhip, you can:</p>
            <ul>
              <li>Rent amazing cars from local hosts</li>
              <li>Enjoy flexible pickup and delivery options</li>
              <li>Experience premium vehicles at great prices</li>
              <li>Support your local car sharing community</li>
            </ul>
            ${data.verificationUrl ? `
              <p>Please verify your email address to get started:</p>
              <a href="${data.verificationUrl}" class="button">Verify Email</a>
            ` : ''}
            <p>If you have any questions, our support team is here to help!</p>
            <div class="footer">
              <p>© 2024 ItWhip. All rights reserved.</p>
              <p>Phoenix, Arizona</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
    Welcome to ItWhip!
    
    Hi ${data.name},
    
    Thank you for joining ItWhip - Phoenix's premier car sharing platform!
    
    With ItWhip, you can:
    - Rent amazing cars from local hosts
    - Enjoy flexible pickup and delivery options
    - Experience premium vehicles at great prices
    - Support your local car sharing community
    
    ${data.verificationUrl ? `Please verify your email address: ${data.verificationUrl}` : ''}
    
    If you have any questions, our support team is here to help!
    
    © 2024 ItWhip. All rights reserved.
  `

  return sendEmail({ to, subject, html, text })
}

/**
 * Send booking confirmation email to guest (keeping existing function)
 */
export async function sendBookingConfirmation(
  booking: BookingConfirmationData & { guestEmail: string }
): Promise<{ success: boolean; error?: string }> {
  const subject = `Booking Confirmed - ${booking.carMake} ${booking.carModel}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
          .booking-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmed!</h1>
            <p>Your adventure awaits</p>
          </div>
          <div class="content">
            <h2>Hi ${booking.guestName},</h2>
            <p>Your booking has been confirmed! Here are your details:</p>
            
            <div class="booking-details">
              <h3>Booking #${booking.bookingId}</h3>
              <div class="detail-row">
                <strong>Vehicle:</strong>
                <span>${booking.carMake} ${booking.carModel}</span>
              </div>
              <div class="detail-row">
                <strong>Pick-up Date:</strong>
                <span>${booking.startDate}</span>
              </div>
              <div class="detail-row">
                <strong>Return Date:</strong>
                <span>${booking.endDate}</span>
              </div>
              <div class="detail-row">
                <strong>Location:</strong>
                <span>${booking.pickupLocation}</span>
              </div>
              ${booking.hostName ? `
              <div class="detail-row">
                <strong>Host:</strong>
                <span>${booking.hostName}</span>
              </div>
              ` : ''}
              ${booking.hostPhone ? `
              <div class="detail-row">
                <strong>Host Contact:</strong>
                <span>${booking.hostPhone}</span>
              </div>
              ` : ''}
              <div class="detail-row" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                <strong>Total Cost:</strong>
                <span style="font-size: 1.2em; color: #667eea;">${booking.totalCost}</span>
              </div>
            </div>
            
            <h3>What's Next?</h3>
            <ol>
              <li>You'll receive pickup instructions 24 hours before your trip</li>
              <li>Bring your driver's license and insurance information</li>
              <li>Take photos of the vehicle before and after your trip</li>
              <li>Enjoy your ride!</li>
            </ol>
            
            <p>If you have any questions, contact us at support@itwhip.com</p>
            
            <div class="footer">
              <p>© 2024 ItWhip. All rights reserved.</p>
              <p>Phoenix, Arizona</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
    Booking Confirmed!
    
    Hi ${booking.guestName},
    
    Your booking has been confirmed! Here are your details:
    
    Booking #${booking.bookingId}
    Vehicle: ${booking.carMake} ${booking.carModel}
    Pick-up Date: ${booking.startDate}
    Return Date: ${booking.endDate}
    Location: ${booking.pickupLocation}
    ${booking.hostName ? `Host: ${booking.hostName}` : ''}
    ${booking.hostPhone ? `Host Contact: ${booking.hostPhone}` : ''}
    Total Cost: ${booking.totalCost}
    
    What's Next?
    1. You'll receive pickup instructions 24 hours before your trip
    2. Bring your driver's license and insurance information
    3. Take photos of the vehicle before and after your trip
    4. Enjoy your ride!
    
    If you have any questions, contact us at support@itwhip.com
    
    © 2024 ItWhip. All rights reserved.
  `

  return sendEmail({ to: booking.guestEmail, subject, html, text })
}

// Keep all other existing email functions...
// (sendHostNotification, sendVerificationEmail, sendPasswordResetEmail, 
// sendSecurityAlert, sendTwoFactorCode remain the same)

export async function sendHostNotification(
  booking: HostNotificationData & { hostEmail: string }
): Promise<{ success: boolean; error?: string }> {
  const subject = `New Booking - ${booking.carMake} ${booking.carModel}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
          .booking-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .earnings { background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Booking!</h1>
            <p>You have a new rental request</p>
          </div>
          <div class="content">
            <h2>Hi ${booking.hostName},</h2>
            <p>Great news! You have a new booking for your ${booking.carMake} ${booking.carModel}.</p>
            
            <div class="booking-details">
              <h3>Booking #${booking.bookingId}</h3>
              <div class="detail-row">
                <strong>Guest:</strong>
                <span>${booking.guestName}</span>
              </div>
              <div class="detail-row">
                <strong>Vehicle:</strong>
                <span>${booking.carMake} ${booking.carModel}</span>
              </div>
              <div class="detail-row">
                <strong>Pick-up Date:</strong>
                <span>${booking.startDate}</span>
              </div>
              <div class="detail-row">
                <strong>Return Date:</strong>
                <span>${booking.endDate}</span>
              </div>
            </div>
            
            <div class="earnings">
              <h3>Your Earnings</h3>
              <p style="font-size: 1.5em; margin: 10px 0;"><strong>${booking.totalEarnings}</strong></p>
              <p style="margin: 0; font-size: 0.9em;">After ItWhip service fee</p>
            </div>
            
            <h3>Next Steps:</h3>
            <ol>
              <li>Prepare your vehicle for pickup</li>
              <li>Ensure the car is clean and fueled</li>
              <li>Contact the guest 24 hours before pickup</li>
              <li>Take photos before handover</li>
            </ol>
            
            <p>Log in to your dashboard to view full details and manage this booking.</p>
            
            <div class="footer">
              <p>© 2024 ItWhip. All rights reserved.</p>
              <p>Phoenix, Arizona</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
    New Booking!
    
    Hi ${booking.hostName},
    
    Great news! You have a new booking for your ${booking.carMake} ${booking.carModel}.
    
    Booking #${booking.bookingId}
    Guest: ${booking.guestName}
    Vehicle: ${booking.carMake} ${booking.carModel}
    Pick-up Date: ${booking.startDate}
    Return Date: ${booking.endDate}
    
    Your Earnings: ${booking.totalEarnings}
    (After ItWhip service fee)
    
    Next Steps:
    1. Prepare your vehicle for pickup
    2. Ensure the car is clean and fueled
    3. Contact the guest 24 hours before pickup
    4. Take photos before handover
    
    Log in to your dashboard to view full details and manage this booking.
    
    © 2024 ItWhip. All rights reserved.
  `

  return sendEmail({ to: booking.hostEmail, subject, html, text })
}

export async function sendVerificationEmail(
  to: string,
  data: VerificationEmailData
): Promise<{ success: boolean; error?: string }> {
  const subject = 'Verify your email - ItWhip'
  
  const html = `
    <h2>Hi ${data.name},</h2>
    <p>Please verify your email address by clicking the link below:</p>
    <a href="${data.verificationUrl}">Verify Email</a>
    ${data.code ? `<p>Or enter this code: <strong>${data.code}</strong></p>` : ''}
    <p>This link will expire in 24 hours.</p>
  `

  const text = `
    Hi ${data.name},
    
    Please verify your email address by visiting:
    ${data.verificationUrl}
    
    ${data.code ? `Or enter this code: ${data.code}` : ''}
    
    This link will expire in 24 hours.
  `

  return sendEmail({ to, subject, html, text })
}

export async function sendPasswordResetEmail(
  to: string,
  data: PasswordResetEmailData
): Promise<{ success: boolean; error?: string }> {
  const subject = 'Reset your password - ItWhip'
  
  const html = `
    <h2>Hi ${data.name},</h2>
    <p>You requested to reset your password. Click the link below to proceed:</p>
    <a href="${data.resetUrl}">Reset Password</a>
    <p>This link will expire in ${data.expiresIn}.</p>
    <p>If you didn't request this, you can safely ignore this email.</p>
  `

  const text = `
    Hi ${data.name},
    
    You requested to reset your password. Visit this link to proceed:
    ${data.resetUrl}
    
    This link will expire in ${data.expiresIn}.
    
    If you didn't request this, you can safely ignore this email.
  `

  return sendEmail({ to, subject, html, text })
}

export async function sendSecurityAlert(
  to: string,
  data: SecurityAlertData
): Promise<{ success: boolean; error?: string }> {
  const subject = `Security Alert - ${data.alertType}`
  
  const html = `
    <h2>Hi ${data.name},</h2>
    <p><strong>Security Alert:</strong> ${data.alertType}</p>
    <p>${data.description}</p>
    ${data.ipAddress ? `<p>IP Address: ${data.ipAddress}</p>` : ''}
    ${data.location ? `<p>Location: ${data.location}</p>` : ''}
    <p>Time: ${data.timestamp}</p>
    ${data.actionUrl ? `<p><a href="${data.actionUrl}">Take Action</a></p>` : ''}
    <p>If this wasn't you, please secure your account immediately.</p>
  `

  const text = `
    Hi ${data.name},
    
    Security Alert: ${data.alertType}
    
    ${data.description}
    
    ${data.ipAddress ? `IP Address: ${data.ipAddress}` : ''}
    ${data.location ? `Location: ${data.location}` : ''}
    Time: ${data.timestamp}
    
    ${data.actionUrl ? `Take action: ${data.actionUrl}` : ''}
    
    If this wasn't you, please secure your account immediately.
  `

  return sendEmail({ to, subject, html, text })
}

export async function sendTwoFactorCode(
  to: string,
  data: TwoFactorCodeData
): Promise<{ success: boolean; error?: string }> {
  const subject = 'Your verification code - ItWhip'
  
  const html = `
    <h2>Hi ${data.name},</h2>
    <p>Your verification code is:</p>
    <h1 style="font-size: 32px; letter-spacing: 8px; text-align: center; color: #667eea;">${data.code}</h1>
    <p>This code will expire in ${data.expiresIn}.</p>
    <p>If you didn't request this code, someone may be trying to access your account.</p>
  `

  const text = `
    Hi ${data.name},
    
    Your verification code is: ${data.code}
    
    This code will expire in ${data.expiresIn}.
    
    If you didn't request this code, someone may be trying to access your account.
  `

  return sendEmail({ to, subject, html, text })
}

// Test email configuration on startup (only in development)
if (process.env.NODE_ENV === 'development') {
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email configuration error:', error)
    } else {
      console.log('Email server is ready to send messages')
    }
  })
}

// Export default email sender
export default sendEmail