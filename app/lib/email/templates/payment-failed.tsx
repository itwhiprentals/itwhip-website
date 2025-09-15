// app/lib/email/templates/payment-failed.tsx

import React from 'react'

interface PaymentFailedEmailProps {
  guestName: string
  bookingCode: string
  chargeAmount: number
  failureReason?: string
  chargeBreakdown?: Array<{
    label: string
    amount: number
  }>
  retryAttempts?: number
  lastFourDigits?: string
  tripEndDate?: string
  vehicleDetails?: {
    year: number
    make: string
    model: string
  }
  dashboardUrl?: string
}

export const PaymentFailedEmail: React.FC<PaymentFailedEmailProps> = ({
  guestName,
  bookingCode,
  chargeAmount,
  failureReason,
  chargeBreakdown,
  retryAttempts,
  lastFourDigits,
  tripEndDate,
  vehicleDetails,
  dashboardUrl
}) => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#dc2626', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>ItWhip</h1>
        <p style={{ color: '#fecaca', margin: '5px 0 0 0', fontSize: '14px' }}>
          Payment Failed - Action Required
        </p>
      </div>

      {/* Content */}
      <div style={{ backgroundColor: '#f9fafb', padding: '30px' }}>
        <h2 style={{ color: '#111827', fontSize: '20px', marginTop: 0 }}>
          Hello {guestName},
        </h2>
        
        <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.5' }}>
          We were unable to process the additional charges for your recent trip. Please update your payment method to complete the transaction.
        </p>

        {/* Alert Box */}
        <div style={{ 
          backgroundColor: '#fef2f2', 
          border: '2px solid #f87171', 
          borderRadius: '8px', 
          padding: '15px',
          marginTop: '20px'
        }}>
          <p style={{ margin: 0, color: '#991b1b', fontSize: '14px', fontWeight: 'bold' }}>
            ⚠️ Payment Required: ${chargeAmount.toFixed(2)}
          </p>
          {failureReason && (
            <p style={{ margin: '8px 0 0 0', color: '#991b1b', fontSize: '12px' }}>
              Reason: {failureReason}
            </p>
          )}
          {retryAttempts && retryAttempts > 0 && (
            <p style={{ margin: '5px 0 0 0', color: '#991b1b', fontSize: '12px' }}>
              Attempts made: {retryAttempts}
            </p>
          )}
        </div>

        {/* Booking Details Box */}
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '20px',
          marginTop: '20px'
        }}>
          <h3 style={{ color: '#111827', fontSize: '16px', marginTop: 0, marginBottom: '15px' }}>
            Trip Details
          </h3>
          
          <table style={{ width: '100%', fontSize: '14px' }}>
            <tbody>
              <tr>
                <td style={{ color: '#6b7280', padding: '5px 0' }}>Booking Code:</td>
                <td style={{ color: '#111827', fontWeight: 'bold', textAlign: 'right' }}>
                  {bookingCode}
                </td>
              </tr>
              {vehicleDetails && (
                <tr>
                  <td style={{ color: '#6b7280', padding: '5px 0' }}>Vehicle:</td>
                  <td style={{ color: '#111827', textAlign: 'right' }}>
                    {vehicleDetails.year} {vehicleDetails.make} {vehicleDetails.model}
                  </td>
                </tr>
              )}
              {tripEndDate && (
                <tr>
                  <td style={{ color: '#6b7280', padding: '5px 0' }}>Trip Ended:</td>
                  <td style={{ color: '#111827', textAlign: 'right' }}>
                    {tripEndDate}
                  </td>
                </tr>
              )}
              {lastFourDigits && (
                <tr>
                  <td style={{ color: '#6b7280', padding: '5px 0' }}>Card Attempted:</td>
                  <td style={{ color: '#111827', textAlign: 'right' }}>
                    •••• •••• •••• {lastFourDigits}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Charges Breakdown */}
        {chargeBreakdown && chargeBreakdown.length > 0 && (
          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '20px',
            marginTop: '20px'
          }}>
            <h3 style={{ color: '#111827', fontSize: '16px', marginTop: 0, marginBottom: '15px' }}>
              Outstanding Charges
            </h3>
            
            <table style={{ width: '100%', fontSize: '14px' }}>
              <tbody>
                {chargeBreakdown.map((item, index) => (
                  <tr key={index}>
                    <td style={{ 
                      color: '#4b5563', 
                      padding: '8px 0',
                      borderBottom: index < chargeBreakdown.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}>
                      {item.label}
                    </td>
                    <td style={{ 
                      color: '#111827', 
                      textAlign: 'right',
                      padding: '8px 0',
                      borderBottom: index < chargeBreakdown.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}>
                      ${item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Total */}
            <div style={{ 
              marginTop: '15px', 
              paddingTop: '15px', 
              borderTop: '2px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>
                Total Due
              </span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>
                ${chargeAmount.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Action Required */}
        <div style={{ 
          backgroundColor: '#fff7ed', 
          border: '1px solid #fed7aa', 
          borderRadius: '8px', 
          padding: '20px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#9a3412', fontSize: '16px', marginTop: 0, marginBottom: '10px' }}>
            What to do next:
          </h3>
          <ol style={{ textAlign: 'left', color: '#c2410c', fontSize: '14px', paddingLeft: '20px', margin: '10px 0' }}>
            <li style={{ marginBottom: '8px' }}>Log into your ItWhip account</li>
            <li style={{ marginBottom: '8px' }}>Update your payment method</li>
            <li style={{ marginBottom: '8px' }}>Retry the payment</li>
          </ol>
          
          <a 
            href={dashboardUrl || 'https://itwhip.com/dashboard'}
            style={{
              display: 'inline-block',
              padding: '12px 30px',
              backgroundColor: '#1e40af',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              marginTop: '15px'
            }}
          >
            Update Payment Method
          </a>
        </div>

        {/* Contact Support */}
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '15px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            Having trouble? Our support team is here to help.
          </p>
          <p style={{ margin: '10px 0 0 0' }}>
            <a href="mailto:info@itwhip.com" style={{ color: '#1e40af', textDecoration: 'none', fontWeight: 'bold', fontSize: '16px' }}>
              Contact Support
            </a>
          </p>
          <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '12px' }}>
            Or reply to this email for assistance
          </p>
        </div>

        {/* Important Notice */}
        <div style={{ 
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#fef3c7',
          borderLeft: '4px solid #f59e0b',
          borderRadius: '4px'
        }}>
          <p style={{ margin: 0, color: '#92400e', fontSize: '13px', fontWeight: 'bold' }}>
            Important Notice:
          </p>
          <p style={{ margin: '5px 0 0 0', color: '#92400e', fontSize: '13px' }}>
            Please resolve this payment within 48 hours to avoid any service interruptions or additional fees. 
            Your account may be temporarily restricted until payment is received.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        backgroundColor: '#1f2937', 
        padding: '20px', 
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: '12px'
      }}>
        <p style={{ margin: '0 0 10px 0' }}>
          Need immediate assistance?
        </p>
        <p style={{ margin: '0 0 5px 0' }}>
          <a href="mailto:info@itwhip.com" style={{ color: '#60a5fa', textDecoration: 'none' }}>
            info@itwhip.com
          </a>
        </p>
        <p style={{ margin: '0 0 10px 0', color: '#9ca3af' }}>
          Support available Mon-Fri, 9AM-6PM PST
        </p>
        <p style={{ margin: '0', color: '#6b7280' }}>
          © 2024 ItWhip. All rights reserved.
        </p>
      </div>
    </div>
  )
}

// HTML string version for email sending
export const paymentFailedEmailHtml = (props: PaymentFailedEmailProps): string => {
  const {
    guestName,
    bookingCode,
    chargeAmount,
    failureReason,
    chargeBreakdown,
    retryAttempts,
    lastFourDigits,
    tripEndDate,
    vehicleDetails,
    dashboardUrl
  } = props

  const breakdownRows = chargeBreakdown ? chargeBreakdown.map((item, index) => `
    <tr>
      <td style="color: #4b5563; padding: 8px 0; border-bottom: ${index < chargeBreakdown.length - 1 ? '1px solid #f3f4f6' : 'none'};">
        ${item.label}
      </td>
      <td style="color: #111827; text-align: right; padding: 8px 0; border-bottom: ${index < chargeBreakdown.length - 1 ? '1px solid #f3f4f6' : 'none'};">
        $${item.amount.toFixed(2)}
      </td>
    </tr>
  `).join('') : ''

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Failed - Action Required - ItWhip</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
          <!-- Header -->
          <div style="background-color: #dc2626; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">ItWhip</h1>
            <p style="color: #fecaca; margin: 5px 0 0 0; font-size: 14px;">Payment Failed - Action Required</p>
          </div>

          <!-- Content -->
          <div style="background-color: #f9fafb; padding: 30px;">
            <h2 style="color: #111827; font-size: 20px; margin-top: 0;">Hello ${guestName},</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              We were unable to process the additional charges for your recent trip. Please update your payment method to complete the transaction.
            </p>

            <!-- Alert Box -->
            <div style="background-color: #fef2f2; border: 2px solid #f87171; border-radius: 8px; padding: 15px; margin-top: 20px;">
              <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: bold;">
                ⚠️ Payment Required: $${chargeAmount.toFixed(2)}
              </p>
              ${failureReason ? `
              <p style="margin: 8px 0 0 0; color: #991b1b; font-size: 12px;">
                Reason: ${failureReason}
              </p>
              ` : ''}
              ${retryAttempts && retryAttempts > 0 ? `
              <p style="margin: 5px 0 0 0; color: #991b1b; font-size: 12px;">
                Attempts made: ${retryAttempts}
              </p>
              ` : ''}
            </div>

            <!-- Trip Details -->
            <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-top: 20px;">
              <h3 style="color: #111827; font-size: 16px; margin-top: 0; margin-bottom: 15px;">Trip Details</h3>
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="color: #6b7280; padding: 5px 0;">Booking Code:</td>
                  <td style="color: #111827; font-weight: bold; text-align: right;">${bookingCode}</td>
                </tr>
                ${vehicleDetails ? `
                <tr>
                  <td style="color: #6b7280; padding: 5px 0;">Vehicle:</td>
                  <td style="color: #111827; text-align: right;">${vehicleDetails.year} ${vehicleDetails.make} ${vehicleDetails.model}</td>
                </tr>
                ` : ''}
                ${tripEndDate ? `
                <tr>
                  <td style="color: #6b7280; padding: 5px 0;">Trip Ended:</td>
                  <td style="color: #111827; text-align: right;">${tripEndDate}</td>
                </tr>
                ` : ''}
                ${lastFourDigits ? `
                <tr>
                  <td style="color: #6b7280; padding: 5px 0;">Card Attempted:</td>
                  <td style="color: #111827; text-align: right;">•••• •••• •••• ${lastFourDigits}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            ${chargeBreakdown && chargeBreakdown.length > 0 ? `
            <!-- Charges Breakdown -->
            <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-top: 20px;">
              <h3 style="color: #111827; font-size: 16px; margin-top: 0; margin-bottom: 15px;">Outstanding Charges</h3>
              <table style="width: 100%; font-size: 14px;">
                ${breakdownRows}
              </table>
              
              <!-- Total -->
              <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #e5e7eb;">
                <table style="width: 100%;">
                  <tr>
                    <td style="font-size: 16px; font-weight: bold; color: #111827;">Total Due</td>
                    <td style="font-size: 20px; font-weight: bold; color: #dc2626; text-align: right;">$${chargeAmount.toFixed(2)}</td>
                  </tr>
                </table>
              </div>
            </div>
            ` : ''}

            <!-- Action Required -->
            <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 20px; margin-top: 20px; text-align: center;">
              <h3 style="color: #9a3412; font-size: 16px; margin-top: 0; margin-bottom: 10px;">What to do next:</h3>
              <ol style="text-align: left; color: #c2410c; font-size: 14px; padding-left: 20px; margin: 10px 0;">
                <li style="margin-bottom: 8px;">Log into your ItWhip account</li>
                <li style="margin-bottom: 8px;">Update your payment method</li>
                <li style="margin-bottom: 8px;">Retry the payment</li>
              </ol>
              
              <a href="${dashboardUrl || 'https://itwhip.com/dashboard'}" style="display: inline-block; padding: 12px 30px; background-color: #1e40af; color: white; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; margin-top: 15px;">
                Update Payment Method
              </a>
            </div>

            <!-- Contact Support -->
            <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-top: 20px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Having trouble? Our support team is here to help.</p>
              <p style="margin: 10px 0 0 0;">
                <a href="mailto:info@itwhip.com" style="color: #1e40af; text-decoration: none; font-weight: bold; font-size: 16px;">Contact Support</a>
              </p>
              <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">Or reply to this email for assistance</p>
            </div>

            <!-- Important Notice -->
            <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: bold;">Important Notice:</p>
              <p style="margin: 5px 0 0 0; color: #92400e; font-size: 13px;">
                Please resolve this payment within 48 hours to avoid any service interruptions or additional fees. 
                Your account may be temporarily restricted until payment is received.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #1f2937; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0 0 10px 0;">Need immediate assistance?</p>
            <p style="margin: 0 0 5px 0;">
              <a href="mailto:info@itwhip.com" style="color: #60a5fa; text-decoration: none;">info@itwhip.com</a>
            </p>
            <p style="margin: 0 0 10px 0; color: #9ca3af;">Support available Mon-Fri, 9AM-6PM PST</p>
            <p style="margin: 0; color: #6b7280;">© 2024 ItWhip. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}