// app/api/host/banking/add-bank/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe'
import * as argon2 from 'argon2'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Zod schema for input validation
const addBankSchema = z.object({
  accountNumber: z.string().min(4).max(17),
  routingNumber: z.string().length(9),
  accountHolderName: z.string().min(2).max(100),
  accountType: z.enum(['checking', 'savings']).default('checking'),
  currentPassword: z.string().min(1, 'Password is required for bank account changes'),
})

// Verify password with Argon2/bcrypt hybrid (same pattern as login)
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (hash.startsWith('$argon2')) {
    return argon2.verify(hash, password)
  }
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
    return bcrypt.compare(password, hash)
  }
  return false
}

// POST - Add bank account to host's Stripe Connect account
export async function POST(request: NextRequest) {
  try {
    const hostId = request.headers.get('x-host-id')
    const hostEmail = request.headers.get('x-host-email')

    if (!hostId || !hostEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - No host session found' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input with Zod
    const parsed = addBankSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { accountNumber, routingNumber, accountHolderName, accountType, currentPassword } = parsed.data

    // ========================================================================
    // RE-AUTHENTICATION — require password before any bank changes
    // ========================================================================
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        email: true,
        stripeAccountId: true,
        defaultPayoutMethod: true,
        userId: true,
      }
    })

    if (!host || !host.stripeAccountId) {
      return NextResponse.json(
        { error: 'No Stripe account connected. Please connect Stripe first.' },
        { status: 400 }
      )
    }

    // Look up linked User account for password verification
    let passwordVerified = false
    if (host.userId) {
      const user = await prisma.user.findUnique({
        where: { id: host.userId },
        select: { passwordHash: true }
      })
      if (user?.passwordHash) {
        passwordVerified = await verifyPassword(currentPassword, user.passwordHash)
      }
    }

    if (!passwordVerified) {
      console.log(`[Banking] Re-auth failed for host ${hostId} (${hostEmail})`)
      return NextResponse.json(
        { error: 'Password verification failed. Please enter your current password.' },
        { status: 403 }
      )
    }

    // ========================================================================
    // STRIPE — create bank account token + add to Connect account
    // ========================================================================
    const token = await stripe.tokens.create({
      bank_account: {
        country: 'US',
        currency: 'usd',
        account_holder_name: accountHolderName,
        account_holder_type: 'individual',
        routing_number: routingNumber,
        account_number: accountNumber
      }
    })

    const bankAccount = await stripe.accounts.createExternalAccount(
      host.stripeAccountId,
      { external_account: token.id }
    )

    const last4 = (bankAccount as any).last4
    const bankName = (bankAccount as any).bank_name || 'Bank Account'

    // ========================================================================
    // ACTIVATION LOGIC — first bank: immediate, subsequent: 24-hour delay
    // ========================================================================
    const isFirstMethod = !host.defaultPayoutMethod

    if (isFirstMethod) {
      // First bank account — activate immediately (new hosts shouldn't wait)
      await prisma.rentalHost.update({
        where: { id: host.id },
        data: {
          defaultPayoutMethod: bankAccount.id,
          bankAccountLast4: last4,
          bankName: bankName,
          bankAccountType: accountType,
          bankVerified: false
        }
      })
    } else {
      // Subsequent bank changes — 24-hour activation delay
      const activatesAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      await prisma.rentalHost.update({
        where: { id: host.id },
        data: {
          pendingBankAccountId: bankAccount.id,
          pendingBankLast4: last4,
          pendingBankName: bankName,
          pendingBankType: accountType,
          pendingBankActivatesAt: activatesAt,
        }
      })
      console.log(`[Banking] Pending bank change for host ${hostId}: ***${last4} activates at ${activatesAt.toISOString()}`)
    }

    // ========================================================================
    // EMAIL NOTIFICATION — always send when bank info changes
    // ========================================================================
    try {
      const { sendEmail } = await import('@/app/lib/email/sender')
      const changeDate = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })

      const subject = isFirstMethod
        ? 'Payout Account Added to Your ItWhip Account'
        : 'Payout Account Change Requested on Your ItWhip Account'

      const statusMessage = isFirstMethod
        ? 'This account is now active for receiving payouts.'
        : 'This account will become active in 24 hours. If you did not make this change, contact support immediately to cancel.'

      await sendEmail(
        host.email,
        subject,
        `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 8px 8px 0 0;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ItWhip</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 40px;">
                          <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Payout Account ${isFirstMethod ? 'Added' : 'Change Requested'}</h2>
                          <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                            A new bank account was ${isFirstMethod ? 'added to' : 'requested for'} your ItWhip host account.
                          </p>
                          <div style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 20px 0;">
                            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                              <strong>Bank Account: ${bankName} ending in ${last4}</strong><br>
                              Account Type: ${accountType}<br>
                              Date: ${changeDate}<br><br>
                              ${statusMessage}
                            </p>
                          </div>
                          <div style="padding: 20px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px; margin-top: 30px;">
                            <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 20px;">
                              <strong>Didn't make this change?</strong><br>
                              Contact our support team immediately at info@itwhip.com or reply to this email. ${!isFirstMethod ? 'You have 24 hours to cancel this change before it takes effect.' : ''}
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                          <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">ItWhip Technologies, Inc.</p>
                          <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; 2026 ItWhip. All rights reserved.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
        `Payout Account ${isFirstMethod ? 'Added' : 'Change Requested'}\n\nA new bank account was ${isFirstMethod ? 'added to' : 'requested for'} your ItWhip host account.\n\nBank: ${bankName} ending in ${last4}\nType: ${accountType}\nDate: ${changeDate}\n\n${statusMessage}\n\nDidn't make this change? Contact info@itwhip.com immediately.`
      )
      console.log(`[Banking] Notification email sent to ${host.email}`)
    } catch (emailErr) {
      console.error('[Banking] Failed to send notification email:', emailErr)
    }

    return NextResponse.json({
      success: true,
      method: {
        id: bankAccount.id,
        type: 'bank_account',
        bankName,
        last4,
        accountType,
        status: (bankAccount as any).status,
        isDefault: isFirstMethod,
        pendingActivation: !isFirstMethod,
        activatesAt: !isFirstMethod ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
      },
      message: isFirstMethod
        ? 'Bank account added successfully. Micro-deposits will be sent for verification.'
        : 'Bank account added. It will become your active payout method in 24 hours. Check your email for details.'
    })

  } catch (error: any) {
    console.error('Error adding bank account:', error)

    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid bank account information', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to add bank account', details: error.message },
      { status: 500 }
    )
  }
}
