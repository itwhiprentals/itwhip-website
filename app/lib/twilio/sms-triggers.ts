// app/lib/twilio/sms-triggers.ts
// High-level SMS trigger functions called from booking/trip/handoff flows
// Each function is self-contained: resolves phone, checks preferences, picks locale, sends

import { sendSms, canSendToGuest, getGuestLocale } from './sms'
import * as templates from './sms-templates'

// ─── Shared Helpers ────────────────────────────────────────────────

function formatDateRange(start: Date | string, end: Date | string): string {
  const fmt = (d: Date | string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(start)}-${fmt(end)}`
}

function carLabel(car: { year?: number; make?: string; model?: string }): string {
  return `${car.year || ''} ${car.make || ''} ${car.model || ''}`.trim()
}

// ─── Trigger: Booking Confirmed ────────────────────────────────────

interface BookingConfirmedData {
  bookingCode: string
  guestPhone: string | null
  guestName: string | null
  guestId: string | null
  hostPhone: string
  hostName: string
  car: { year?: number; make?: string; model?: string }
  startDate: Date | string
  endDate: Date | string
  bookingId: string
  hostId: string
}

export async function sendBookingConfirmedSms(data: BookingConfirmedData): Promise<void> {
  const car = carLabel(data.car)
  const dates = formatDateRange(data.startDate, data.endDate)

  // SMS to guest
  if (data.guestPhone && await canSendToGuest(data.guestId)) {
    const locale = await getGuestLocale(data.guestId)
    const body = templates.bookingConfirmedGuest({
      carName: car,
      dates,
      hostName: data.hostName,
      bookingCode: data.bookingCode,
    }, locale)

    await sendSms(data.guestPhone, body, {
      type: 'BOOKING_CONFIRMED',
      bookingId: data.bookingId,
      guestId: data.guestId || undefined,
      locale,
    })
  }

  // SMS to host
  if (data.hostPhone) {
    const body = templates.bookingConfirmedHost({
      guestName: data.guestName || 'Guest',
      carName: car,
      dates,
      bookingCode: data.bookingCode,
    })

    await sendSms(data.hostPhone, body, {
      type: 'BOOKING_CONFIRMED',
      bookingId: data.bookingId,
      hostId: data.hostId,
    })
  }
}

// ─── Trigger: Trip Started ─────────────────────────────────────────

interface TripStartedData {
  bookingCode: string
  guestPhone: string | null
  guestId: string | null
  hostPhone: string
  guestName: string | null
  car: { year?: number; make?: string; model?: string }
  bookingId: string
  hostId: string
}

export async function sendTripStartedSms(data: TripStartedData): Promise<void> {
  const car = carLabel(data.car)

  // SMS to guest
  if (data.guestPhone && await canSendToGuest(data.guestId)) {
    const locale = await getGuestLocale(data.guestId)
    const body = templates.tripStartedGuest({
      carName: car,
      bookingCode: data.bookingCode,
    }, locale)

    await sendSms(data.guestPhone, body, {
      type: 'TRIP_STARTED',
      bookingId: data.bookingId,
      guestId: data.guestId || undefined,
      locale,
    })
  }

  // SMS to host
  if (data.hostPhone) {
    const body = templates.tripStartedHost({
      guestName: data.guestName || 'Guest',
      carName: car,
      bookingCode: data.bookingCode,
    })

    await sendSms(data.hostPhone, body, {
      type: 'TRIP_STARTED',
      bookingId: data.bookingId,
      hostId: data.hostId,
    })
  }
}

// ─── Trigger: Trip Ended ───────────────────────────────────────────

interface TripEndedData {
  bookingCode: string
  guestPhone: string | null
  guestName: string | null
  guestId: string | null
  hostPhone: string
  car: { year?: number; make?: string; model?: string }
  totalAmount: number
  bookingId: string
  hostId: string
}

export async function sendTripEndedSms(data: TripEndedData): Promise<void> {
  const car = carLabel(data.car)

  // SMS to guest
  if (data.guestPhone && await canSendToGuest(data.guestId)) {
    const locale = await getGuestLocale(data.guestId)
    const body = templates.tripEndedGuest({
      carName: car,
      totalAmount: data.totalAmount.toFixed(2),
      bookingCode: data.bookingCode,
    }, locale)

    await sendSms(data.guestPhone, body, {
      type: 'TRIP_ENDED',
      bookingId: data.bookingId,
      guestId: data.guestId || undefined,
      locale,
    })
  }

  // SMS to host
  if (data.hostPhone) {
    const body = templates.tripEndedHost({
      guestName: data.guestName || 'Guest',
      carName: car,
      bookingCode: data.bookingCode,
    })

    await sendSms(data.hostPhone, body, {
      type: 'TRIP_ENDED',
      bookingId: data.bookingId,
      hostId: data.hostId,
    })
  }
}

// ─── Trigger: Guest Approaching ────────────────────────────────────

interface GuestApproachingData {
  guestName: string
  etaMinutes: number
  hostPhone: string
  car: { year?: number; make?: string; model?: string }
  bookingId: string
  hostId: string
}

export async function sendGuestApproachingSms(data: GuestApproachingData): Promise<void> {
  const body = templates.guestApproachingHost({
    guestName: data.guestName,
    etaMinutes: data.etaMinutes,
    carName: carLabel(data.car),
  })

  await sendSms(data.hostPhone, body, {
    type: 'GUEST_APPROACHING',
    bookingId: data.bookingId,
    hostId: data.hostId,
  })
}

// ─── Trigger: Booking Cancelled ────────────────────────────────────

interface BookingCancelledData {
  bookingCode: string
  guestPhone: string | null
  guestName: string | null
  guestId: string | null
  hostPhone: string | null
  car: { year?: number; make?: string; model?: string }
  bookingId: string
  hostId: string
}

export async function sendBookingCancelledSms(data: BookingCancelledData): Promise<void> {
  const car = carLabel(data.car)

  // SMS to guest
  if (data.guestPhone && await canSendToGuest(data.guestId)) {
    const locale = await getGuestLocale(data.guestId)
    const body = templates.bookingCancelledGuest({
      carName: car,
      bookingCode: data.bookingCode,
    }, locale)

    await sendSms(data.guestPhone, body, {
      type: 'BOOKING_CANCELLED',
      bookingId: data.bookingId,
      guestId: data.guestId || undefined,
      locale,
    })
  }

  // SMS to host
  if (data.hostPhone) {
    const body = templates.bookingCancelledHost({
      guestName: data.guestName || 'Guest',
      carName: car,
      bookingCode: data.bookingCode,
    })

    await sendSms(data.hostPhone, body, {
      type: 'BOOKING_CANCELLED',
      bookingId: data.bookingId,
      hostId: data.hostId,
    })
  }
}

// ─── Trigger: Claim Filed ──────────────────────────────────────────

interface ClaimFiledData {
  bookingCode: string
  guestPhone: string | null
  guestId: string | null
  claimType: string
  bookingId: string
}

export async function sendClaimFiledSms(data: ClaimFiledData): Promise<void> {
  if (!data.guestPhone) return
  if (!(await canSendToGuest(data.guestId))) return

  const locale = await getGuestLocale(data.guestId)
  const body = templates.claimFiledGuest({
    bookingCode: data.bookingCode,
    claimType: data.claimType,
  }, locale)

  await sendSms(data.guestPhone, body, {
    type: 'CLAIM_FILED',
    bookingId: data.bookingId,
    guestId: data.guestId || undefined,
    locale,
  })
}

// ─── Trigger: Missed Message ───────────────────────────────────────

interface MissedMessageData {
  recipientPhone: string
  recipientId?: string
  recipientType: 'guest' | 'host'
  senderName: string
  bookingCode: string
  bookingId: string
}

export async function sendMissedMessageSms(data: MissedMessageData): Promise<void> {
  // Only check preferences for guests
  if (data.recipientType === 'guest' && !(await canSendToGuest(data.recipientId))) return

  const locale = data.recipientType === 'guest' ? await getGuestLocale(data.recipientId) : 'en'
  const body = templates.missedMessage({
    senderName: data.senderName,
    bookingCode: data.bookingCode,
  }, locale)

  await sendSms(data.recipientPhone, body, {
    type: 'MISSED_MESSAGE',
    bookingId: data.bookingId,
    ...(data.recipientType === 'guest' ? { guestId: data.recipientId } : { hostId: data.recipientId }),
    locale,
  })
}

// ─── Trigger: Emergency Roadside (from IVR) ────────────────────────

interface EmergencyData {
  phone: string
  bookingCode: string
  bookingId: string
  locale?: 'en' | 'es' | 'fr'
}

export async function sendEmergencyInfoSms(data: EmergencyData): Promise<void> {
  const locale = data.locale || 'en'
  const body = templates.emergencyRoadsideInfo({
    bookingCode: data.bookingCode,
  }, locale)

  await sendSms(data.phone, body, {
    type: 'EMERGENCY',
    bookingId: data.bookingId,
    locale,
  })
}

// ─── IVR SMS Triggers ─────────────────────────────────────────────
// Sent when the IVR tells the caller "we've texted you the link"

type Locale = 'en' | 'es' | 'fr'

export async function sendIvrAboutSms(phone: string, locale: Locale = 'en'): Promise<void> {
  const body = templates.ivrAboutItWhip(locale)
  await sendSms(phone, body, { type: 'IVR_SMS', locale })
}

export async function sendIvrInsuranceSms(phone: string, locale: Locale = 'en'): Promise<void> {
  const body = templates.ivrInsuranceInfo(locale)
  await sendSms(phone, body, { type: 'IVR_SMS', locale })
}

export async function sendIvrReportDamageSms(phone: string, locale: Locale = 'en'): Promise<void> {
  const body = templates.ivrReportDamage(locale)
  await sendSms(phone, body, { type: 'IVR_SMS', locale })
}

export async function sendIvrPickupDetailsSms(
  phone: string,
  data: { address: string; date: string; time: string; bookingCode: string },
  locale: Locale = 'en'
): Promise<void> {
  const body = templates.ivrPickupDetails(data, locale)
  await sendSms(phone, body, { type: 'IVR_SMS', locale })
}

export async function sendIvrRoadsideSms(phone: string, locale: Locale = 'en'): Promise<void> {
  const body = templates.ivrRoadsideGeneral(locale)
  await sendSms(phone, body, { type: 'IVR_SMS', locale })
}
