// app/lib/notifications/bonus-notifications.ts
// Notify guest when credits, bonus, or deposit are added to their account
// Sends: email + SMS + bell notification

import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/sender'
import { logEmail, generateEmailReference } from '@/app/lib/email/config'
// footer kept simple to match booking templates
import { sendSms, canSendToGuest } from '@/app/lib/twilio/sms'
import { CHOE_FOOTER } from '@/app/lib/twilio/sms-templates'

const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

type BonusType = 'credit' | 'bonus' | 'deposit'
type Locale = 'en' | 'es' | 'fr'

interface BonusNotificationData {
  guestId: string
  amount: number
  bonusType: BonusType
  description?: string
  bookingId?: string  // If provided, creates bell notification linked to this booking
}

const TYPE_LABELS: Record<BonusType, string> = {
  credit: 'ItWhip Credits',
  bonus: 'Bonus Balance',
  deposit: 'Deposit Wallet',
}

// ─── Email Template ──────────────────────────────────────────────────

function getBonusEmailHtml(data: {
  firstName: string
  guestEmail: string
  amount: number
  bonusType: BonusType
  description?: string
  dashboardUrl: string
  referenceId: string
}): { subject: string; html: string; text: string } {
  const label = TYPE_LABELS[data.bonusType]
  const subject = `🎉 You Received ${fmt(data.amount)} in ${label}`
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://itwhip.com'
  const balanceUrl = data.bonusType === 'deposit' ? `${baseUrl}/payments/deposit` : `${baseUrl}/payments/credits`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #111827; background: #ffffff; }
          .container { max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e5e7eb; }
          .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { font-size: 28px; font-weight: 400; margin: 0 0 8px 0; }
          .header p { font-size: 14px; margin: 0; opacity: 0.9; }
          .content { padding: 30px 20px; }
          .details-box { background: white; border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; }
          .detail-row td { padding: 10px 0; font-size: 14px; }
          .detail-row { border-bottom: 1px solid #f3f4f6; }
          .button { display: block; width: 100%; padding: 14px; background: #3b82f6; color: white; text-decoration: none; text-align: center; font-weight: 500; margin: 24px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
          @media only screen and (max-width: 600px) {
            .header { padding: 30px 16px; }
            .header h1 { font-size: 24px; }
            .content { padding: 20px 16px; }
            .detail-row { font-size: 13px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); background-color: #4b5563; color: white; padding: 40px 20px; text-align: center;">
            <h1 style="font-size: 28px; font-weight: 400; margin: 0 0 8px 0; color: white;">You Received ${fmt(data.amount)} in ${label}</h1>
            <p style="font-size: 14px; margin: 0; opacity: 0.9; color: white;">Your ${label.toLowerCase()} is ready to use immediately</p>
          </div>

          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Dear ${data.firstName},</p>

            <p>${fmt(data.amount)} has been added to your <strong>${label}</strong>.${data.description ? ` ${data.description}` : ''}</p>

            <div class="details-box">
              <h3 style="margin: 0 0 16px 0; font-size: 18px;">${label}</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr class="detail-row">
                  <td style="color: #6b7280;">Amount</td>
                  <td style="text-align: right;"><strong style="color: #059669;">+${fmt(data.amount)}</strong></td>
                </tr>
                <tr class="detail-row">
                  <td style="color: #6b7280;">Type</td>
                  <td style="text-align: right;"><strong>${label}</strong></td>
                </tr>
                ${data.bonusType === 'bonus' ? `
                <tr class="detail-row">
                  <td style="color: #6b7280;">Expires</td>
                  <td style="text-align: right;"><strong>90 days</strong></td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Available</td>
                  <td style="padding: 10px 0; text-align: right; font-size: 14px;"><strong>Immediately</strong></td>
                </tr>
              </table>
            </div>

            <a href="${balanceUrl}" class="button">View My Balance</a>

            <div style="background: #f9fafb; border-left: 4px solid #6b7280; padding: 16px; margin: 24px 0; font-size: 14px;">
              Thank you for being part of the ItWhip community, ${data.firstName}. Your ${label.toLowerCase()} will be automatically applied at checkout on your next booking.
            </div>

            <p style="text-align: center; margin-top: 24px; font-size: 14px; color: #6b7280;">
              Questions? Contact info@itwhip.com
            </p>
          </div>

          <div class="footer">
            <strong>ITWHIP</strong><br>
            Peer-to-Peer Vehicle Marketplace<br>
            <span style="font-size: 11px;">© ${new Date().getFullYear()} ItWhip Technologies, Inc. • Phoenix, Arizona</span><br>
            <a href="${baseUrl}/verify-email?ref=${data.referenceId}" style="color: #374151; text-decoration: none; font-size: 11px; margin-top: 8px; display: inline-block;">
              Ref: <strong style="color: #ea580c;">${data.referenceId}</strong>
            </a>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `${fmt(data.amount)} Added to Your ${label}

Dear ${data.firstName},

${fmt(data.amount)} has been added to your ${label}.${data.description ? ` ${data.description}` : ''}

DETAILS:
- Amount: +${fmt(data.amount)}
- Type: ${label}
${data.bonusType === 'bonus' ? '- Expires: 90 days\n' : ''}- Available: Immediately

View your balance: ${balanceUrl}

Questions? Contact info@itwhip.com

ITWHIP - Peer-to-Peer Vehicle Marketplace
© ${new Date().getFullYear()} ItWhip Technologies, Inc. • Phoenix, Arizona
Ref: ${data.referenceId}
  `

  return { subject, html, text }
}

// ─── SMS Templates ───────────────────────────────────────────────────

function bonusSmsText(data: { amount: number; bonusType: BonusType }, locale: Locale = 'en'): string {
  const label = TYPE_LABELS[data.bonusType]
  const templates: Record<Locale, string> = {
    en: `ItWhip: ${fmt(data.amount)} has been added to your ${label}! Use it on your next booking. View balance: itwhip.com/dashboard`,
    es: `ItWhip: ${fmt(data.amount)} fue agregado a tu ${label}! Usalo en tu proxima reserva. Ver saldo: itwhip.com/dashboard`,
    fr: `ItWhip: ${fmt(data.amount)} a ete ajoute a votre ${label}! Utilisez-le lors de votre prochaine reservation. Solde: itwhip.com/dashboard`,
  }
  return templates[locale] + CHOE_FOOTER[locale]
}

// ─── Main Notification Function ──────────────────────────────────────

export async function sendBonusNotifications(data: BonusNotificationData): Promise<void> {
  try {
    // Look up guest profile
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id: data.guestId },
      select: {
        id: true,
        name: true,
        email: true,
        userId: true,
        preferredLanguage: true,
        phoneNumber: true,
      }
    })

    if (!guest || !guest.email) {
      console.warn(`[Bonus Notify] No guest found for ${data.guestId}`)
      return
    }

    const firstName = (guest.name || 'there').split(' ')[0]
    const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://itwhip.com'}/rentals/dashboard`

    // 1) Email with REF-ID
    try {
      const referenceId = generateEmailReference('BO')
      const email = getBonusEmailHtml({
        firstName,
        guestEmail: guest.email,
        amount: data.amount,
        bonusType: data.bonusType,
        description: data.description,
        dashboardUrl,
        referenceId,
      })
      await sendEmail(guest.email, email.subject, email.html, email.text)
      // Log email for tracking
      await logEmail({
        recipientEmail: guest.email,
        recipientName: guest.name || firstName,
        subject: email.subject,
        emailType: 'SYSTEM',
        relatedType: 'GUEST',
        relatedId: data.guestId,
        referenceId,
      }).catch(() => {}) // don't fail if logging fails
      console.log(`[Bonus Notify] Email sent to ${guest.email}: ${fmt(data.amount)} ${data.bonusType} (${referenceId})`)
    } catch (emailErr) {
      console.error(`[Bonus Notify] Email failed for ${guest.email}:`, emailErr)
    }

    // 2) SMS
    try {
      const locale = ((guest.preferredLanguage || 'en') as Locale)
      const canSend = await canSendToGuest(data.guestId)
      const phone = guest.phoneNumber || null
      if (canSend && phone) {
        const smsText = bonusSmsText({ amount: data.amount, bonusType: data.bonusType }, locale)
        await sendSms(phone, smsText, { type: 'SYSTEM', guestId: data.guestId })
        console.log(`[Bonus Notify] SMS sent to ${phone}: ${fmt(data.amount)} ${data.bonusType}`)
      }
    } catch (smsErr) {
      console.error(`[Bonus Notify] SMS failed for ${data.guestId}:`, smsErr)
    }

    // 3) Bell notification — requires a bookingId (FK constraint)
    if (data.bookingId) {
      try {
        const label = TYPE_LABELS[data.bonusType]
        await prisma.bookingNotification.create({
          data: {
            id: crypto.randomUUID(),
            bookingId: data.bookingId,
            recipientType: 'GUEST',
            recipientId: data.guestId,
            userId: guest.userId,
            type: 'DEPOSIT_RELEASED',
            title: `${fmt(data.amount)} added to ${label}`,
            message: data.description || `You've received ${fmt(data.amount)} in ${label}. Use it on your next booking!`,
            actionUrl: data.bonusType === 'deposit' ? '/payments/deposit' : '/payments/credits',
            priority: 'MEDIUM',
          }
        })
        console.log(`[Bonus Notify] Bell notification created for ${data.guestId} (booking: ${data.bookingId})`)
      } catch (bellErr) {
        console.error(`[Bonus Notify] Bell notification failed for ${data.guestId}:`, bellErr)
      }
    } else {
      console.log(`[Bonus Notify] Bell skipped (no booking linked) for ${data.guestId}`)
    }
  } catch (err) {
    console.error(`[Bonus Notify] Unexpected error:`, err)
  }
}
