/**
 * Email Service for ItWhip Platform
 * Handles all email notifications and templates
 */

import { Resend } from 'resend'
import { ReactElement } from 'react'

// Initialize Resend client
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Email configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'ItWhip <noreply@itwhip.com>'
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || 'support@itwhip.com'

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
  TWO_FACTOR_CODE = 'two_factor_code'
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
 * Send an email using Resend
 */
async function sendEmail(data: EmailData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.error('Email service not configured. Set RESEND_API_KEY environment variable.')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const emailData = {
      from: EMAIL_FROM,
      to: Array.isArray(data.to) ? data.to : [data.to],
      subject: data.subject,
      replyTo: data.replyTo || EMAIL_REPLY_TO,
      ...(data.text && { text: data.text }),
      ...(data.html && { html: data.html }),
      ...(data.react && { react: data.react })
    }

    const result = await resend.emails.send(emailData)
    
    if (result.error) {
      console.error('Failed to send email:', result.error)
      return { success: false, error: result.error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

/**
 * Send welcome email
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
 * Send booking confirmation email to guest
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

/**
 * Send notification to host about new booking
 */
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

/**
 * Send verification email
 */
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

/**
 * Send password reset email
 */
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

/**
 * Send security alert email
 */
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

/**
 * Send two-factor authentication code
 */
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

// Export default email sender
export default sendEmail