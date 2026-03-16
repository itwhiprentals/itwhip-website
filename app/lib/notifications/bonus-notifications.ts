// app/lib/notifications/bonus-notifications.ts
// Notify guest when credits, bonus, or deposit are added to their account
// Sends: email + SMS + bell notification

import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/sender'
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
  amount: number
  bonusType: BonusType
  description?: string
  dashboardUrl: string
}): { subject: string; html: string; text: string } {
  const label = TYPE_LABELS[data.bonusType]
  const subject = `You've received ${fmt(data.amount)} in ${label}!`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <tr><td style="text-align:center;padding-bottom:24px;">
      <span style="font-size:24px;font-weight:700;color:#111827;">ItWhip</span>
    </td></tr>
    <tr><td style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:#d1fae5;border-radius:50%;padding:12px;">
          <span style="font-size:28px;">🎉</span>
        </div>
      </div>
      <h1 style="font-size:20px;font-weight:700;color:#111827;text-align:center;margin:0 0 8px;">
        ${fmt(data.amount)} Added to Your ${label}
      </h1>
      <p style="font-size:14px;color:#6b7280;text-align:center;margin:0 0 24px;">
        Hi ${data.firstName}, great news!
      </p>
      ${data.description ? `
      <div style="background:#f0fdf4;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
        <p style="font-size:13px;color:#166534;margin:0;">${data.description}</p>
      </div>
      ` : ''}
      <table width="100%" style="background:#f9fafb;border-radius:8px;padding:16px;">
        <tr>
          <td style="padding:8px 16px;">
            <p style="font-size:12px;color:#9ca3af;margin:0;text-transform:uppercase;letter-spacing:1px;">Amount</p>
            <p style="font-size:24px;font-weight:700;color:#059669;margin:4px 0 0;">${fmt(data.amount)}</p>
          </td>
          <td style="padding:8px 16px;text-align:right;">
            <p style="font-size:12px;color:#9ca3af;margin:0;text-transform:uppercase;letter-spacing:1px;">Applied To</p>
            <p style="font-size:14px;font-weight:600;color:#111827;margin:4px 0 0;">${label}</p>
          </td>
        </tr>
      </table>
      <div style="text-align:center;margin-top:24px;">
        <a href="${data.dashboardUrl}" style="display:inline-block;background:#111827;color:#fff;font-size:14px;font-weight:600;padding:12px 32px;border-radius:8px;text-decoration:none;">
          View My Balance
        </a>
      </div>
      <p style="font-size:12px;color:#9ca3af;text-align:center;margin:20px 0 0;">
        ${data.bonusType === 'bonus' ? 'Bonus credits expire in 90 days. ' : ''}Use them on your next booking at checkout.
      </p>
    </td></tr>
    <tr><td style="text-align:center;padding:24px 0 0;">
      <p style="font-size:11px;color:#9ca3af;margin:0;">
        © ${new Date().getFullYear()} ItWhip Technologies, Inc. • Phoenix, Arizona
      </p>
    </td></tr>
  </table>
</body>
</html>`

  const text = `Hi ${data.firstName}! You've received ${fmt(data.amount)} in ${label}. ${data.description || ''} View your balance: ${data.dashboardUrl}`

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

    // 1) Email
    try {
      const email = getBonusEmailHtml({
        firstName,
        amount: data.amount,
        bonusType: data.bonusType,
        description: data.description,
        dashboardUrl,
      })
      await sendEmail(guest.email, email.subject, email.html, email.text)
      console.log(`[Bonus Notify] Email sent to ${guest.email}: ${fmt(data.amount)} ${data.bonusType}`)
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
            actionUrl: `/rentals/dashboard/bookings/${data.bookingId}`,
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
