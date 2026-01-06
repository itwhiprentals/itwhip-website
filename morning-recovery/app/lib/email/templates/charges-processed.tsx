// app/lib/email/templates/charges-processed.tsx

import React from 'react'

interface ChargesProcessedEmailProps {
  guestName: string
  bookingCode: string
  chargeAmount: number
  chargeBreakdown: Array<{
    label: string
    amount: number
  }>
  chargeId: string
  tripEndDate?: string
  vehicleDetails?: {
    year: number
    make: string
    model: string
  }
}

export const ChargesProcessedEmail: React.FC<ChargesProcessedEmailProps> = ({
  guestName,
  bookingCode,
  chargeAmount,
  chargeBreakdown,
  chargeId,
  tripEndDate,
  vehicleDetails
}) => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#1e40af', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>ItWhip</h1>
        <p style={{ color: '#dbeafe', margin: '5px 0 0 0', fontSize: '14px' }}>
          Trip Charges Processed
        </p>
      </div>

      {/* Content */}
      <div style={{ backgroundColor: '#f9fafb', padding: '30px' }}>
        <h2 style={{ color: '#111827', fontSize: '20px', marginTop: 0 }}>
          Hello {guestName},
        </h2>
        
        <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.5' }}>
          Your trip has been completed and additional charges have been successfully processed.
        </p>

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
            </tbody>
          </table>
        </div>

        {/* Charges Breakdown */}
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '20px',
          marginTop: '20px'
        }}>
          <h3 style={{ color: '#111827', fontSize: '16px', marginTop: 0, marginBottom: '15px' }}>
            Additional Charges Breakdown
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
              Total Charged
            </span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>
              ${chargeAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Confirmation */}
        <div style={{ 
          backgroundColor: '#f0fdf4', 
          border: '1px solid #86efac', 
          borderRadius: '8px', 
          padding: '15px',
          marginTop: '20px'
        }}>
          <p style={{ margin: 0, color: '#166534', fontSize: '14px' }}>
            ✓ Payment successfully processed on your card ending in ****
          </p>
          <p style={{ margin: '5px 0 0 0', color: '#166534', fontSize: '12px' }}>
            Transaction ID: {chargeId}
          </p>
        </div>

        {/* Receipt Notice */}
        <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '20px', lineHeight: '1.5' }}>
          A detailed receipt has been saved to your account. You can view it anytime by logging into your ItWhip dashboard.
        </p>

        {/* Thank You Message */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#111827', fontSize: '16px', margin: '0 0 10px 0' }}>
            Thank you for choosing ItWhip!
          </p>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            We hope you enjoyed your rental experience.
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
          Questions about these charges?
        </p>
        <p style={{ margin: '0 0 10px 0' }}>
          <a href="mailto:info@itwhip.com" style={{ color: '#60a5fa', textDecoration: 'none' }}>
            info@itwhip.com
          </a>
        </p>
        <p style={{ margin: '0', color: '#6b7280' }}>
          © 2024 ItWhip. All rights reserved.
        </p>
      </div>
    </div>
  )
}

// HTML string version for email sending
export const chargesProcessedEmailHtml = (props: ChargesProcessedEmailProps): string => {
  const {
    guestName,
    bookingCode,
    chargeAmount,
    chargeBreakdown,
    chargeId,
    tripEndDate,
    vehicleDetails
  } = props

  const breakdownRows = chargeBreakdown.map((item, index) => `
    <tr>
      <td style="color: #4b5563; padding: 8px 0; border-bottom: ${index < chargeBreakdown.length - 1 ? '1px solid #f3f4f6' : 'none'};">
        ${item.label}
      </td>
      <td style="color: #111827; text-align: right; padding: 8px 0; border-bottom: ${index < chargeBreakdown.length - 1 ? '1px solid #f3f4f6' : 'none'};">
        $${item.amount.toFixed(2)}
      </td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Trip Charges Processed - ItWhip</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
          <!-- Header -->
          <div style="background-color: #1e40af; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">ItWhip</h1>
            <p style="color: #dbeafe; margin: 5px 0 0 0; font-size: 14px;">Trip Charges Processed</p>
          </div>

          <!-- Content -->
          <div style="background-color: #f9fafb; padding: 30px;">
            <h2 style="color: #111827; font-size: 20px; margin-top: 0;">Hello ${guestName},</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Your trip has been completed and additional charges have been successfully processed.
            </p>

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
              </table>
            </div>

            <!-- Charges Breakdown -->
            <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-top: 20px;">
              <h3 style="color: #111827; font-size: 16px; margin-top: 0; margin-bottom: 15px;">Additional Charges Breakdown</h3>
              <table style="width: 100%; font-size: 14px;">
                ${breakdownRows}
              </table>
              
              <!-- Total -->
              <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #e5e7eb;">
                <table style="width: 100%;">
                  <tr>
                    <td style="font-size: 16px; font-weight: bold; color: #111827;">Total Charged</td>
                    <td style="font-size: 20px; font-weight: bold; color: #059669; text-align: right;">$${chargeAmount.toFixed(2)}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Payment Confirmation -->
            <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 15px; margin-top: 20px;">
              <p style="margin: 0; color: #166534; font-size: 14px;">✓ Payment successfully processed on your card ending in ****</p>
              <p style="margin: 5px 0 0 0; color: #166534; font-size: 12px;">Transaction ID: ${chargeId}</p>
            </div>

            <!-- Receipt Notice -->
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px; line-height: 1.5;">
              A detailed receipt has been saved to your account. You can view it anytime by logging into your ItWhip dashboard.
            </p>

            <!-- Thank You -->
            <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: white; border-radius: 8px;">
              <p style="color: #111827; font-size: 16px; margin: 0 0 10px 0;">Thank you for choosing ItWhip!</p>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">We hope you enjoyed your rental experience.</p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #1f2937; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0 0 10px 0;">Questions about these charges?</p>
            <p style="margin: 0 0 10px 0;">
              <a href="mailto:info@itwhip.com" style="color: #60a5fa; text-decoration: none;">info@itwhip.com</a>
            </p>
            <p style="margin: 0; color: #6b7280;">© 2024 ItWhip. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}