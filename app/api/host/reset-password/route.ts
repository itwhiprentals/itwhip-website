// app/api/host/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    // Validation
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find host with this reset token
    const host = await prisma.rentalHost.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenUsed: false,
        resetTokenExpiry: {
          gt: new Date() // Token not expired
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        resetTokenExpiry: true
      }
    })

    // Token validation
    if (!host) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Hash the new password with bcrypt
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Update host password and invalidate token
    await prisma.rentalHost.update({
      where: { id: host.id },
      data: {
        // Note: RentalHost doesn't have passwordHash field yet
        // You'll need to add this to your schema if hosts log in with passwords
        // For now, we'll update the User model if userId exists
        resetToken: null,
        resetTokenExpiry: null,
        resetTokenUsed: true,
        lastPasswordReset: new Date(),
        updatedAt: new Date()
      }
    })

    // If host has a linked User account, update that password too
    const linkedUser = await prisma.user.findFirst({
      where: { 
        rentalHost: {
          id: host.id
        }
      }
    })

    if (linkedUser) {
      await prisma.user.update({
        where: { id: linkedUser.id },
        data: {
          passwordHash: hashedPassword,
          lastPasswordReset: new Date(),
          updatedAt: new Date()
        }
      })
    }

    console.log(`[Host Password Reset] Successfully reset password for: ${host.email}`)

    // Send confirmation email
    try {
      const { sendEmail } = await import('@/app/lib/email/sendEmail')
      
      await sendEmail({
        to: host.email,
        subject: 'Your ItWhip Host Password Was Changed',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #059669 100%); border-radius: 8px 8px 0 0;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ItWhip Host Portal</h1>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Host Password Changed</h2>
                          
                          <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                            Hi ${host.name},
                          </p>
                          
                          <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                            This is a confirmation that your ItWhip host account password was successfully changed.
                          </p>
                          
                          <div style="padding: 20px; background-color: #dcfce7; border-left: 4px solid #16a34a; border-radius: 4px; margin: 20px 0;">
                            <p style="margin: 0; color: #166534; font-size: 14px; line-height: 20px;">
                              <strong>✓ Password Updated</strong><br>
                              Changed on: ${new Date().toLocaleString('en-US', { 
                                dateStyle: 'long', 
                                timeStyle: 'short' 
                              })}
                            </p>
                          </div>
                          
                          <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                            You can now sign in to the Host Portal with your new password.
                          </p>
                          
                          <!-- Security Warning -->
                          <div style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-top: 30px;">
                            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                              <strong>⚠️ Didn't change your password?</strong><br>
                              If you didn't make this change, please contact our host support team immediately at 
                              <a href="mailto:hosts@itwhip.com" style="color: #92400e; text-decoration: underline;">hosts@itwhip.com</a>
                            </p>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                          <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                            ItWhip Technologies, Inc. - Host Portal
                          </p>
                          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                            © 2025 ItWhip. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `
      })
      
      console.log(`[Host Password Reset] Confirmation email sent to: ${host.email}`)
    } catch (emailError) {
      console.error('[Host Password Reset] Confirmation email failed:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successful'
    })

  } catch (error) {
    console.error('[Host Password Reset API] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred while resetting your password' },
      { status: 500 }
    )
  }
}