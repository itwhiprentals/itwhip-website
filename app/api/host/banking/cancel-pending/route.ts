// app/api/host/banking/cancel-pending/route.ts
// Cancel a pending bank account change (within 24-hour window)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe'

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

    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        email: true,
        stripeAccountId: true,
        pendingBankAccountId: true,
        pendingBankLast4: true,
        pendingBankActivatesAt: true,
      }
    })

    if (!host) {
      return NextResponse.json({ error: 'Host not found' }, { status: 404 })
    }

    if (!host.pendingBankAccountId) {
      return NextResponse.json({ error: 'No pending bank change to cancel' }, { status: 400 })
    }

    // Remove the external account from Stripe Connect
    if (host.stripeAccountId) {
      try {
        await stripe.accounts.deleteExternalAccount(
          host.stripeAccountId,
          host.pendingBankAccountId
        )
      } catch (stripeErr: any) {
        // Log but don't fail — the bank may already be removed
        console.error(`[Banking] Failed to remove pending bank from Stripe: ${stripeErr.message}`)
      }
    }

    // Clear pending fields
    await prisma.rentalHost.update({
      where: { id: host.id },
      data: {
        pendingBankAccountId: null,
        pendingBankLast4: null,
        pendingBankName: null,
        pendingBankType: null,
        pendingBankActivatesAt: null,
      }
    })

    console.log(`[Banking] Pending bank change cancelled for host ${hostId} (was ***${host.pendingBankLast4})`)

    // Send confirmation email
    try {
      const { sendEmail } = await import('@/app/lib/email/sender')
      await sendEmail(
        host.email,
        'Payout Account Change Cancelled',
        `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr><td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #059669 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ItWhip</h1>
                    </td></tr>
                    <tr><td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Bank Change Cancelled</h2>
                      <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                        Your pending bank account change (ending in ${host.pendingBankLast4}) has been cancelled. Your existing payout method remains active.
                      </p>
                      <div style="padding: 20px; background-color: #dcfce7; border-left: 4px solid #16a34a; border-radius: 4px;">
                        <p style="margin: 0; color: #166534; font-size: 14px;">Your current payout method is unchanged and remains active.</p>
                      </div>
                    </td></tr>
                    <tr><td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; 2026 ItWhip. All rights reserved.</p>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
          </html>
        `,
        `Bank Change Cancelled\n\nYour pending bank account change (ending in ${host.pendingBankLast4}) has been cancelled. Your existing payout method remains active.`
      )
    } catch (emailErr) {
      console.error('[Banking] Failed to send cancellation email:', emailErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Pending bank account change has been cancelled.'
    })

  } catch (error: any) {
    console.error('Error cancelling pending bank change:', error)
    return NextResponse.json(
      { error: 'Failed to cancel bank change', details: error.message },
      { status: 500 }
    )
  }
}
