import { escapeHtml } from '../sanitize'
// app/lib/email/templates/declaration-updated.ts

interface DeclarationUpdatedData {
    hostName: string
    vehicleName: string
    oldDeclaration: string
    newDeclaration: string
    oldMaxGap: number
    newMaxGap: number
    earningsTier: number
    insuranceNote: string
    taxImplication?: string
    claimImpact?: string
  }
  
  export function declarationUpdatedTemplate(data: DeclarationUpdatedData): string {
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Declaration Updated</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); padding: 32px 40px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                  Declaration Updated
                </h1>
                <p style="margin: 8px 0 0 0; color: #e9d5ff; font-size: 16px;">
                  ${data.vehicleName}
                </p>
              </td>
            </tr>
  
            <!-- Content -->
            <tr>
              <td style="padding: 40px;">
                
                <!-- Greeting -->
                <p style="margin: 0 0 24px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hi ${escapeHtml(data.hostName)},
                </p>
  
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  Your usage declaration for <strong>${data.vehicleName}</strong> has been successfully updated.
                </p>
  
                <!-- Change Summary -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <table width="100%" cellpadding="8" cellspacing="0">
                        <tr>
                          <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Previous:</td>
                          <td style="color: #111827; font-size: 14px; font-weight: 600; padding: 8px 0; text-align: right;">
                            ${data.oldDeclaration} (${data.oldMaxGap} mi max)
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="border-bottom: 1px solid #e5e7eb; padding: 4px 0;"></td>
                        </tr>
                        <tr>
                          <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">New:</td>
                          <td style="color: #9333ea; font-size: 14px; font-weight: 700; padding: 8px 0; text-align: right;">
                            ${data.newDeclaration} (${data.newMaxGap} mi max)
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
  
                <!-- Important Notice -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 8px; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 16px 20px;">
                      <p style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px; font-weight: 600;">
                        ✓ Your Earnings Tier Remains ${data.earningsTier}%
                      </p>
                      <p style="margin: 0; color: #1e3a8a; font-size: 13px; line-height: 1.5;">
                        Your earnings percentage is based on your insurance level and has NOT changed. 
                        This declaration update only affects how claims are processed.
                      </p>
                    </td>
                  </tr>
                </table>
  
                <!-- What This Means -->
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 600;">
                  What This Means
                </h2>
  
                <!-- Insurance Coverage -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                  <tr>
                    <td style="padding: 12px 16px; background-color: #f9fafb; border-radius: 6px; border-left: 3px solid #9333ea;">
                      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Insurance Coverage
                      </p>
                      <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">
                        ${data.insuranceNote}
                      </p>
                    </td>
                  </tr>
                </table>
  
                ${data.taxImplication ? `
                <!-- Tax Deduction -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                  <tr>
                    <td style="padding: 12px 16px; background-color: #f9fafb; border-radius: 6px; border-left: 3px solid #10b981;">
                      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Tax Deduction
                      </p>
                      <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">
                        ${data.taxImplication}
                      </p>
                    </td>
                  </tr>
                </table>
                ` : ''}
  
                ${data.claimImpact ? `
                <!-- Claim Processing -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 12px 16px; background-color: #fef3c7; border-radius: 6px; border-left: 3px solid #f59e0b;">
                      <p style="margin: 0 0 8px 0; color: #92400e; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Claim Processing
                      </p>
                      <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">
                        ${data.claimImpact}
                      </p>
                    </td>
                  </tr>
                </table>
                ` : ''}
  
                <!-- Next Steps -->
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 600;">
                  Next Steps
                </h2>
  
                <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">Keep your mileage gaps within the ${data.newMaxGap}-mile limit</li>
                  <li style="margin-bottom: 8px;">Document any business-related driving for tax purposes</li>
                  <li style="margin-bottom: 8px;">Monitor your compliance in the vehicle intelligence dashboard</li>
                  <li>Contact support if you have questions about your declaration</li>
                </ul>
  
                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                  <tr>
                    <td align="center">
                      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/host/cars" 
                         style="display: inline-block; padding: 14px 32px; background-color: #9333ea; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                        View My Vehicles
                      </a>
                    </td>
                  </tr>
                </table>
  
                <!-- Support -->
                <p style="margin: 24px 0 0 0; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; line-height: 1.6;">
                  Questions? Contact us at 
                  <a href="mailto:info@itwhip.com" style="color: #9333ea; text-decoration: none;">info@itwhip.com</a>
                </p>
  
              </td>
            </tr>
  
            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;">
                  © ${new Date().getFullYear()} ItWhip. All rights reserved.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                  This is an automated notification. Please do not reply to this email.
                </p>
              </td>
            </tr>
  
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
    `.trim()
  }