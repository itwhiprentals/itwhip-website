// app/lib/notifications/deposit-notifications.ts
// Deposit released SMS + bell notification for guests

import { sendSms, canSendToGuest, getGuestLocale } from '@/app/lib/twilio/sms'
import { createBookingNotification } from '@/app/lib/notifications/booking-bell'

// ─── Types ─────────────────────────────────────────────────────────

interface DepositReleasedData {
  bookingId: string
  bookingCode: string
  guestPhone: string
  guestId: string
  userId: string
  hostId: string
  car: { year: number; make: string; model: string }
  depositAmount: number
}

// ─── SMS Templates ─────────────────────────────────────────────────

function buildDepositReleasedSms(
  locale: 'en' | 'es' | 'fr',
  amount: string,
  car: string,
  code: string
): string {
  switch (locale) {
    case 'es':
      return `ItWhip: Tu dep\u00f3sito de seguridad de $${amount} para el ${car} (${code}) ha sido devuelto a tu m\u00e9todo de pago. Permite 5-10 d\u00edas h\u00e1biles. \u00bfPreguntas? Llama al (855) 703-0806`
    case 'fr':
      return `ItWhip: Votre d\u00e9p\u00f4t de garantie de $${amount} pour le ${car} (${code}) a \u00e9t\u00e9 rembours\u00e9 sur votre moyen de paiement. Pr\u00e9voyez 5 \u00e0 10 jours ouvrables. Questions ? Appelez le (855) 703-0806`
    default:
      return `ItWhip: Your $${amount} security deposit for the ${car} (${code}) has been released back to your payment method. Allow 5-10 business days. Questions? Call (855) 703-0806`
  }
}

// ─── Main Export ───────────────────────────────────────────────────

export async function sendDepositReleasedNotifications(data: DepositReleasedData): Promise<void> {
  const { bookingId, bookingCode, guestPhone, guestId, userId, car, depositAmount } = data
  const carLabel = `${car.year} ${car.make} ${car.model}`
  const amount = depositAmount.toFixed(2)

  // Fire SMS and bell in parallel, settle all
  await Promise.allSettled([
    // SMS to guest
    (async () => {
      try {
        const allowed = await canSendToGuest(guestId)
        if (!allowed) {
          console.log(`[Deposit Notify] Guest ${guestId} has SMS disabled, skipping`)
          return
        }

        const locale = await getGuestLocale(guestId)
        const body = buildDepositReleasedSms(locale, amount, carLabel, bookingCode)

        await sendSms(guestPhone, body, {
          type: 'DEPOSIT_RELEASED',
          bookingId,
          guestId,
          locale,
        })
      } catch (error) {
        console.error('[Deposit Notify] SMS failed:', error)
      }
    })(),

    // Bell notification for guest
    (async () => {
      try {
        await createBookingNotification({
          bookingId,
          recipientType: 'GUEST',
          recipientId: guestId,
          userId,
          type: 'DEPOSIT_RELEASED',
          title: 'Deposit Released',
          message: `Security deposit of $${amount} released`,
          priority: 'LOW',
        })
      } catch (error) {
        console.error('[Deposit Notify] Bell notification failed:', error)
      }
    })(),
  ])
}
