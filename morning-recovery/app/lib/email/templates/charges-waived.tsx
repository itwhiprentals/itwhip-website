// app/lib/email/templates/charges-waived.tsx

import React from 'react'

interface ChargesWaivedEmailProps {
  guestName: string
  bookingCode: string
  originalAmount: number
  waivedAmount: number
  remainingAmount: number
  reason?: string
  tripEndDate?: string
  vehicleDetails?: {
    year: number
    make: string
    model: string
  }
  chargeBreakdown?: Array<{
    label: string
    amount: number
  }>
}

export const ChargesWaivedEmail: React.FC<ChargesWaivedEmailProps> = ({
  guestName,
  bookingCode,
  originalAmount,
  waivedAmount,
  remainingAmount,
  reason,
  tripEndDate,
  vehicleDetails,
  chargeBreakdown
}) => {
  const waivePercentage = Math.round((waivedAmount / originalAmount) * 100)
  const isFullWaive = remainingAmount === 0

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#059669', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>ItWhip</h1>
        <p style={{ color: '#d1fae5', margin: '5px 0 0 0', fontSize: '14px' }}>
          {isFullWaive ? 'Charges Waived' : 'Charges Partially Waived'}
        </p>
      </div>

      {/* Content */}
      <div style={{ backgroundColor: '#f9fafb', padding: '30px' }}>
        <h2 style={{ color: '#111827', fontSize: '20px', marginTop: 0 }}>
          Hello {guestName},
        </h2>
        
        <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.5' }}>
          {isFullWaive 
            ? 'Great news! We have waived all additional charges for your recent trip.'
            : `Good news! We have waived ${waivePercentage}% of the additional charges for your recent trip.`}
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

        {/* Original Charges (if breakdown provided) */}
        {chargeBreakdown && chargeBreakdown.length > 0 && (
          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '20px',
            marginTop: '20px'
          }}>
            <h3 style={{ color: '#111827', fontSize: '16px', marginTop: 0, marginBottom: '15px' }}>
              Original Charges
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
                      borderBottom: index < chargeBreakdown.length - 1 ? '1px solid #f3f4f6' : 'none',
                      textDecoration: 'line-through',
                      opacity: 0.6
                    }}>
                      ${item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Waive Summary */}
        <div style={{ 
          backgroundColor: '#f0fdf4', 
          border: '1px solid #86efac', 
          borderRadius: '8px', 
          padding: '20px',
          marginTop: '20px'
        }}>
          <h3 style={{ color: '#166534', fontSize: '16px', marginTop: 0, marginBottom: '15px' }}>
            Waiver Applied
          </h3>
          
          <table style={{ width: '100%', fontSize: '14px' }}>
            <tbody>
              <tr>
                <td style={{ color: '#166534', padding: '8px 0' }}>Original Amount:</td>
                <td style={{ 
                  color: '#166534', 
                  textAlign: 'right',
                  padding: '8px 0',
                  textDecoration: 'line-through'
                }}>
                  ${originalAmount.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td style={{ color: '#166534', padding: '8px 0', fontWeight: 'bold' }}>
                  Amount Waived ({waivePercentage}%):
                </td>
                <td style={{ 
                  color: '#059669', 
                  textAlign: 'right',
                  padding: '8px 0',
                  fontWeight: 'bold'
                }}>
                  -${waivedAmount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
          
          {/* Final Amount */}
          <div style={{ 
            marginTop: '15px', 
            paddingTop: '15px', 
            borderTop: '2px solid #86efac',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#166534' }}>
              {isFullWaive ? 'Your New Total' : 'Amount Charged'}
            </span>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
              ${remainingAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Reason (if provided) */}
        {reason && (
          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '15px',
            marginTop: '20px'
          }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              <strong style={{ color: '#111827' }}>Reason for waiver:</strong> {reason}
            </p>
          </div>
        )}

        {/* Payment Status */}
        {!isFullWaive && remainingAmount > 0 && (
          <div style={{ 
            backgroundColor: '#fef3c7', 
            border: '1px solid #fcd34d', 
            borderRadius: '8px', 
            padding: '15px',
            marginTop: '20px'
          }}>
            <p style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>
              ✓ The remaining balance of ${remainingAmount.toFixed(2)} has been charged to your card on file.
            </p>
          </div>
        )}

        {/* Thank You Message */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#111827', fontSize: '16px', margin: '0 0 10px 0' }}>
            {isFullWaive 
              ? 'We appreciate your business and hope you had a great experience!'
              : 'Thank you for your understanding and for choosing ItWhip!'}
          </p>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            We look forward to serving you again soon.
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
          Questions about this waiver?
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
export const chargesWaivedEmailHtml = (props: ChargesWaivedEmailProps): string => {
  const {
    guestName,
    bookingCode,
    originalAmount,
    waivedAmount,
    remainingAmount,
    reason,
    tripEndDate,
    vehicleDetails,
    chargeBreakdown
  } = props

  const waivePercentage = Math.round((waivedAmount / originalAmount) * 100)
  const isFullWaive = remainingAmount === 0

  const breakdownRows = chargeBreakdown ? chargeBreakdown.map((item, index) => `
    <tr>
      <td style="color: #4b5563; padding: 8px 0; border-bottom: ${index < chargeBreakdown.length - 1 ? '1px solid #f3f4f6' : 'none'};">
        ${item.label}
      </td>
      <td style="color: #111827; text-align: right; padding: 8px 0; border-bottom: ${index < chargeBreakdown.length - 1 ? '1px solid #f3f4f6' : 'none'}; text-decoration: line-through; opacity: 0.6;">
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
        <title>${isFullWaive ? 'Charges Waived' : 'Charges Partially Waived'} - ItWhip</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
          <!-- Header -->
          <div style="background-color: #059669; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">ItWhip</h1>
            <p style="color: #d1fae5; margin: 5px 0 0 0; font-size: 14px;">
              ${isFullWaive ? 'Charges Waived' : 'Charges Partially Waived'}
            </p>
          </div>

          <!-- Content -->
          <div style="background-color: #f9fafb; padding: 30px;">
            <h2 style="color: #111827; font-size: 20px; margin-top: 0;">Hello ${guestName},</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              ${isFullWaive 
                ? 'Great news! We have waived all additional charges for your recent trip.'
                : `Good news! We have waived ${waivePercentage}% of the additional charges for your recent trip.`}
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

            ${chargeBreakdown && chargeBreakdown.length > 0 ? `
            <!-- Original Charges -->
            <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-top: 20px;">
              <h3 style="color: #111827; font-size: 16px; margin-top: 0; margin-bottom: 15px;">Original Charges</h3>
              <table style="width: 100%; font-size: 14px;">
                ${breakdownRows}
              </table>
            </div>
            ` : ''}

            <!-- Waiver Summary -->
            <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin-top: 20px;">
              <h3 style="color: #166534; font-size: 16px; margin-top: 0; margin-bottom: 15px;">Waiver Applied</h3>
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="color: #166534; padding: 8px 0;">Original Amount:</td>
                  <td style="color: #166534; text-align: right; padding: 8px 0; text-decoration: line-through;">
                    $${originalAmount.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td style="color: #166534; padding: 8px 0; font-weight: bold;">
                    Amount Waived (${waivePercentage}%):
                  </td>
                  <td style="color: #059669; text-align: right; padding: 8px 0; font-weight: bold;">
                    -$${waivedAmount.toFixed(2)}
                  </td>
                </tr>
              </table>
              
              <!-- Final Amount -->
              <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #86efac;">
                <table style="width: 100%;">
                  <tr>
                    <td style="font-size: 16px; font-weight: bold; color: #166534;">
                      ${isFullWaive ? 'Your New Total' : 'Amount Charged'}
                    </td>
                    <td style="font-size: 24px; font-weight: bold; color: #059669; text-align: right;">
                      $${remainingAmount.toFixed(2)}
                    </td>
                  </tr>
                </table>
              </div>
            </div>

            ${reason ? `
            <!-- Reason -->
            <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-top: 20px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                <strong style="color: #111827;">Reason for waiver:</strong> ${reason}
              </p>
            </div>
            ` : ''}

            ${!isFullWaive && remainingAmount > 0 ? `
            <!-- Payment Status -->
            <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 15px; margin-top: 20px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                ✓ The remaining balance of $${remainingAmount.toFixed(2)} has been charged to your card on file.
              </p>
            </div>
            ` : ''}

            <!-- Thank You -->
            <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: white; border-radius: 8px;">
              <p style="color: #111827; font-size: 16px; margin: 0 0 10px 0;">
                ${isFullWaive 
                  ? 'We appreciate your business and hope you had a great experience!'
                  : 'Thank you for your understanding and for choosing ItWhip!'}
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                We look forward to serving you again soon.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #1f2937; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0 0 10px 0;">Questions about this waiver?</p>
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